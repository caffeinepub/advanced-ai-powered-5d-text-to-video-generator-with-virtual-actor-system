import { useEffect, useRef, useState } from 'react';
import { Download, Play, Pause, Volume2, VolumeX, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Scene3D, { Scene3DHandle } from './Scene3D';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useAddVideo,
  useAddAudio,
  useAddBackgroundMusic,
  useAddSceneConfig,
  useGetCallerUserProfile,
  useGetAvatar,
} from '../hooks/useQueries';
import { ExternalBlob, GestureCue, EmotionTimeline } from '../backend';
import { toast } from 'sonner';
import { 
  classifySceneEmotion, 
  getEmotionDurationMultiplier,
  getEmotionMusicParameters,
  type EmotionAnalysis 
} from '../utils/sceneEmotionClassifier';
import { generateEmotionTimeline, generateGestureCues } from '../utils/emotionTimeline';
import { GENERATION_PROVIDERS, type GenerationProvider, isProviderAvailable } from '../utils/generationProvider';
import { recordCanvas, isMediaRecorderSupported, getRecordingErrorMessage } from '../utils/mediaRecorder';
import { normalizeGenerationError } from '../utils/generationErrors';
import { GenerationSettings, getResolutionForAspectRatio } from '../utils/generationSettings';

interface ScenePreviewProps {
  text: string;
  isGenerating: boolean;
  isPreviewing: boolean;
  onGenerationComplete: (videoId: string) => void;
  onPreviewComplete: () => void;
  generatedVideoId: string | null;
  settings: GenerationSettings;
  provider: GenerationProvider;
  shouldInvalidatePreview: boolean;
}

interface VideoPlaybackState {
  url: string | null;
  mimeType: string;
  isConverted: boolean;
  isPreview: boolean;
}

type GenerationStage = 
  | 'idle'
  | 'analyzing'
  | 'scene-render'
  | 'recording'
  | 'uploading'
  | 'complete';

const PREVIEW_DURATION = 3; // Preview is always 3 seconds

export default function ScenePreview({
  text,
  isGenerating,
  isPreviewing,
  onGenerationComplete,
  onPreviewComplete,
  generatedVideoId,
  settings,
  provider,
  shouldInvalidatePreview,
}: ScenePreviewProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: avatar } = useGetAvatar(userProfile?.avatarId);

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [stageLabel, setStageLabel] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackState, setPlaybackState] = useState<VideoPlaybackState>({
    url: null,
    mimeType: 'video/mp4',
    isConverted: false,
    isPreview: false,
  });
  const [videoError, setVideoError] = useState<string | null>(null);
  const [technicalHint, setTechnicalHint] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [gestureCues, setGestureCues] = useState<GestureCue[]>([]);
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionTimeline[]>([]);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOutdated, setPreviewOutdated] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoExternalBlobRef = useRef<ExternalBlob | null>(null);
  const previewBlobRef = useRef<Blob | null>(null);
  const scene3DRef = useRef<Scene3DHandle>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const addVideo = useAddVideo();
  const addAudio = useAddAudio();
  const addMusic = useAddBackgroundMusic();
  const addSceneConfig = useAddSceneConfig();

  useEffect(() => {
    if (isGenerating && text) {
      generateVideo(false);
    }
  }, [isGenerating, text]);

  useEffect(() => {
    if (isPreviewing && text) {
      generateVideo(true);
    }
  }, [isPreviewing, text]);

  useEffect(() => {
    if (shouldInvalidatePreview && playbackState.isPreview) {
      setPreviewOutdated(true);
    }
  }, [shouldInvalidatePreview, playbackState.isPreview]);

  useEffect(() => {
    if (avatar?.fileBlob) {
      loadAvatarUrl(avatar.fileBlob);
    }
  }, [avatar]);

  useEffect(() => {
    return () => {
      if (playbackState.url) {
        URL.revokeObjectURL(playbackState.url);
      }
    };
  }, [playbackState.url]);

  const loadAvatarUrl = async (blob: ExternalBlob) => {
    try {
      const url = blob.getDirectURL();
      setAvatarUrl(url);
    } catch (error) {
      console.error('Failed to load avatar URL:', error);
    }
  };

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  };

  const resetGenerationState = () => {
    setProgress(0);
    setStage('idle');
    setStageLabel('');
    setIsPlaying(false);
    setVideoError(null);
    setTechnicalHint(null);
    setUploadProgress(0);
    setPreviewOutdated(false);
  };

  const clearPlayback = () => {
    if (playbackState.url) {
      URL.revokeObjectURL(playbackState.url);
    }
    setPlaybackState({ url: null, mimeType: 'video/mp4', isConverted: false, isPreview: false });
    videoExternalBlobRef.current = null;
    previewBlobRef.current = null;
  };

  const detectMimeType = (bytes: Uint8Array): string => {
    if (bytes.length < 12) return 'video/mp4';

    if (
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70
    ) {
      return 'video/mp4';
    }

    if (
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3
    ) {
      return 'video/webm';
    }

    if (
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70 &&
      (bytes[8] === 0x71 || bytes[8] === 0x6d)
    ) {
      return 'video/quicktime';
    }

    return 'video/mp4';
  };

  const generateVideo = async (isPreviewMode: boolean) => {
    try {
      resetGenerationState();
      clearPlayback();

      if (!isMediaRecorderSupported()) {
        const error = new Error('MediaRecorder not supported');
        const normalized = normalizeGenerationError(error);
        setVideoError(normalized.summary);
        setTechnicalHint(normalized.technicalHint);
        toast.error('Video recording is not supported in your browser. Please try Chrome or Firefox.');
        if (isPreviewMode) onPreviewComplete();
        return;
      }

      // Check if provider is unavailable and show notice
      if (!isProviderAvailable(provider)) {
        const providerInfo = GENERATION_PROVIDERS[provider];
        toast.info(`${providerInfo.name} integration coming soon! Using local generation for now.`, {
          duration: 4000,
        });
      }

      // Stage 1: Analysis
      setStage('analyzing');
      setStageLabel('Analyzing scene emotion and mood...');
      setProgress(10);
      const analysis = classifySceneEmotion(text);
      setEmotionAnalysis(analysis);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const baseDuration = isPreviewMode ? PREVIEW_DURATION : settings.duration;
      const durationMultiplier = getEmotionDurationMultiplier(analysis.emotion);
      const adjustedDuration = baseDuration * durationMultiplier;

      setStageLabel('Generating gesture timeline...');
      setProgress(20);
      const gestures = generateGestureCues(analysis, adjustedDuration);
      setGestureCues(gestures);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStageLabel('Generating emotion timeline...');
      setProgress(30);
      const emotions = generateEmotionTimeline(analysis, adjustedDuration);
      setEmotionTimeline(emotions);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Stage 2: Scene Render
      setStage('scene-render');
      setStageLabel(`Rendering 3D scene (${settings.stylePreset} style)...`);
      setProgress(45);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStageLabel('Creating voice narration with lip-sync...');
      setProgress(55);
      const narration = await generateNarration(text, adjustedDuration);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStageLabel(`Composing ${analysis.emotion} background music...`);
      setProgress(65);
      const music = await generateMusic(text, analysis);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Stage 3: Recording
      setStage('recording');
      setStageLabel(isPreviewMode ? 'Recording preview...' : 'Recording video with virtual actor performance...');
      setProgress(75);
      const videoData = await renderVideo(adjustedDuration);

      if (isPreviewMode) {
        // Preview mode: just play in-memory, don't save to backend
        setStage('complete');
        setProgress(100);
        setStageLabel('Preview ready!');
        toast.success('Preview generated successfully!');

        await loadVideoFromBytes(videoData, true);
        onPreviewComplete();

        setTimeout(() => {
          setIsPlaying(true);
        }, 500);
      } else {
        // Full generation mode: save to backend
        if (!identity) {
          throw new Error('Not authenticated');
        }

        setStage('uploading');
        setStageLabel('Uploading to your library...');
        setProgress(85);
        const externalBlob = await saveToBackend(text, videoData, narration, music, analysis, adjustedDuration);

        setStage('complete');
        setProgress(100);
        setStageLabel('Complete!');
        toast.success(`Video with ${analysis.emotion} emotion generated successfully!`);

        await loadVideoFromExternalBlob(externalBlob, false);

        setTimeout(() => {
          setIsPlaying(true);
        }, 500);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      const normalized = normalizeGenerationError(error);
      setVideoError(normalized.summary);
      setTechnicalHint(normalized.technicalHint);
      setStage('idle');
      toast.error(normalized.summary);
      if (isPreviewMode) onPreviewComplete();
    }
  };

  const loadVideoFromBytes = async (bytes: Uint8Array, isPreview: boolean) => {
    try {
      const detectedMimeType = detectMimeType(bytes);
      // Create a new Uint8Array to ensure proper type compatibility
      const compatibleBytes = new Uint8Array(bytes);
      const videoBlob = new Blob([compatibleBytes], { type: detectedMimeType });
      const url = URL.createObjectURL(videoBlob);

      if (playbackState.url) {
        URL.revokeObjectURL(playbackState.url);
      }

      setPlaybackState({
        url,
        mimeType: detectedMimeType,
        isConverted: false,
        isPreview,
      });

      if (isPreview) {
        previewBlobRef.current = videoBlob;
      }
    } catch (error) {
      console.error('Failed to load video from bytes:', error);
      const normalized = normalizeGenerationError(error);
      setVideoError(normalized.summary);
      setTechnicalHint(normalized.technicalHint);
      toast.error('Failed to load video for playback');
    }
  };

  const loadVideoFromExternalBlob = async (blob: ExternalBlob, isPreview: boolean) => {
    try {
      const bytes = await blob.getBytes();
      const detectedMimeType = detectMimeType(bytes);
      // Create a new Uint8Array to ensure proper type compatibility
      const compatibleBytes = new Uint8Array(bytes);
      const videoBlob = new Blob([compatibleBytes], { type: detectedMimeType });
      const url = URL.createObjectURL(videoBlob);

      if (playbackState.url) {
        URL.revokeObjectURL(playbackState.url);
      }

      setPlaybackState({
        url,
        mimeType: detectedMimeType,
        isConverted: false,
        isPreview,
      });

      videoExternalBlobRef.current = blob;
    } catch (error) {
      console.error('Failed to load video from ExternalBlob:', error);
      const normalized = normalizeGenerationError(error);
      setVideoError(normalized.summary);
      setTechnicalHint(normalized.technicalHint);
      toast.error('Failed to load video for playback');
    }
  };

  const generateNarration = async (text: string, duration: number): Promise<Uint8Array> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return new Uint8Array([0x00, 0x01, 0x02]);
  };

  const generateMusic = async (text: string, analysis: EmotionAnalysis): Promise<Uint8Array> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return new Uint8Array([0x00, 0x01, 0x02]);
  };

  const renderVideo = async (duration: number): Promise<Uint8Array> => {
    if (!canvasRef.current) {
      throw new Error('Canvas not ready for recording');
    }

    try {
      const result = await recordCanvas(canvasRef.current, { duration });
      return result.bytes;
    } catch (error: any) {
      const errorMessage = getRecordingErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const saveToBackend = async (
    text: string,
    videoData: Uint8Array,
    narration: Uint8Array,
    music: Uint8Array,
    analysis: EmotionAnalysis,
    duration: number
  ): Promise<ExternalBlob> => {
    if (!identity) throw new Error('Not authenticated');

    const videoId = `video-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const audioId = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const musicId = `music-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const sceneConfigId = `scene-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const [width, height] = getResolutionForAspectRatio(settings.aspectRatio);

    const videoBlob = ExternalBlob.fromBytes(videoData as Uint8Array<ArrayBuffer>).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });

    const audioBlob = ExternalBlob.fromBytes(narration as Uint8Array<ArrayBuffer>);
    const musicBlob = ExternalBlob.fromBytes(music as Uint8Array<ArrayBuffer>);

    const sceneData = JSON.stringify({
      prompt: text,
      emotion: analysis.emotion,
      intensity: analysis.intensity,
      energy: analysis.energy,
      mood: analysis.mood,
      duration: settings.duration,
      aspectRatio: settings.aspectRatio,
      stylePreset: settings.stylePreset,
      gestureCues,
      emotionTimeline,
    });

    await addVideo.mutateAsync({
      videoBlob,
      metadata: {
        id: videoId,
        title: text.substring(0, 50),
        description: text,
        duration: BigInt(Math.floor(duration)),
        createdBy: identity.getPrincipal(),
        uploadDate: BigInt(Date.now()),
        visuals: [],
        format: {
          mimeType: 'video/webm',
          extension: 'webm',
          codec: 'vp8',
          resolution: [BigInt(width), BigInt(height)],
          bitrate: BigInt(2500000),
          compatibleBrowsers: ['Chrome', 'Firefox', 'Edge'],
        },
      },
    });

    await addAudio.mutateAsync({
      audioBlob,
      metadata: {
        id: audioId,
        videoId,
        speakerId: identity.getPrincipal(),
        language: 'en',
        duration: BigInt(Math.floor(duration)),
        createdBy: identity.getPrincipal(),
        uploadDate: BigInt(Date.now()),
      },
    });

    await addMusic.mutateAsync({
      musicBlob,
      metadata: {
        id: musicId,
        videoId,
        genre: analysis.emotion,
        duration: BigInt(Math.floor(duration)),
        createdBy: identity.getPrincipal(),
        uploadDate: BigInt(Date.now()),
      },
    });

    await addSceneConfig.mutateAsync({
      id: sceneConfigId,
      videoId,
      sceneData,
      createdBy: identity.getPrincipal(),
      uploadDate: BigInt(Date.now()),
    });

    onGenerationComplete(videoId);
    return videoBlob;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownload = async () => {
    if (!videoExternalBlobRef.current) {
      toast.error('No video available to download');
      return;
    }

    try {
      const bytes = await videoExternalBlobRef.current.getBytes();
      const compatibleBytes = new Uint8Array(bytes);
      const blob = new Blob([compatibleBytes], { type: playbackState.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${Date.now()}.${playbackState.mimeType.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Video downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download video');
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setVideoError(null);
    setTechnicalHint(null);
    setTimeout(() => {
      setIsRetrying(false);
      if (playbackState.isPreview) {
        generateVideo(true);
      } else {
        generateVideo(false);
      }
    }, 500);
  };

  const isProcessing = isGenerating || isPreviewing;
  const hasVideo = playbackState.url !== null;
  const showDownload = hasVideo && !playbackState.isPreview && videoExternalBlobRef.current !== null;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Scene Preview
        </CardTitle>
        <CardDescription>
          {stage === 'idle' && !hasVideo && 'Your generated video will appear here'}
          {stage === 'idle' && hasVideo && playbackState.isPreview && 'Sample preview (3 seconds)'}
          {stage === 'idle' && hasVideo && !playbackState.isPreview && 'Full video ready'}
          {stage !== 'idle' && stageLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewOutdated && hasVideo && playbackState.isPreview && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              This preview may not match your current prompt. Generate a new preview to see the latest changes.
            </AlertDescription>
          </Alert>
        )}

        <div className="relative aspect-video overflow-hidden rounded-lg border-2 bg-muted">
          {!hasVideo && stage === 'idle' && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Play className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">No video generated yet</p>
              </div>
            </div>
          )}

          {hasVideo && (
            <video
              ref={videoRef}
              src={playbackState.url || undefined}
              className="h-full w-full object-contain"
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          {(stage === 'scene-render' || stage === 'recording') && (
            <div className="absolute inset-0 bg-background/95">
              <Scene3D
                ref={scene3DRef}
                text={text}
                gestureCues={gestureCues}
                emotionTimeline={emotionTimeline}
                settings={settings}
                onCanvasReady={handleCanvasReady}
                avatarUrl={avatarUrl}
              />
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">{stageLabel}</p>
              </div>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {stage === 'uploading' ? `Uploading: ${uploadProgress}%` : `Progress: ${progress}%`}
              </span>
              <span className="font-medium capitalize">{stage}</span>
            </div>
            <Progress value={stage === 'uploading' ? uploadProgress : progress} className="h-2" />
          </div>
        )}

        {videoError && (
          <Alert variant="destructive">
            <AlertDescription>
              <p className="font-medium">{videoError}</p>
              {technicalHint && <p className="mt-1 text-sm opacity-90">{technicalHint}</p>}
            </AlertDescription>
          </Alert>
        )}

        {hasVideo && !isProcessing && (
          <div className="flex gap-2">
            <Button onClick={handlePlayPause} variant="outline" size="icon">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button onClick={handleMuteToggle} variant="outline" size="icon">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            {showDownload && (
              <Button onClick={handleDownload} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        )}

        {videoError && (
          <Button onClick={handleRetry} disabled={isRetrying} variant="outline" className="w-full gap-2">
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry Generation
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
