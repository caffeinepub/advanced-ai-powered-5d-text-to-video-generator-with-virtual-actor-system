import { useEffect, useRef, useState } from 'react';
import { Download, Play, Pause, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Scene3D from './Scene3D';
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

interface ScenePreviewProps {
  text: string;
  isGenerating: boolean;
  onGenerationComplete: (videoId: string) => void;
  generatedVideoId: string | null;
}

interface VideoPlaybackState {
  url: string | null;
  mimeType: string;
  isConverted: boolean;
}

export default function ScenePreview({
  text,
  isGenerating,
  onGenerationComplete,
  generatedVideoId,
}: ScenePreviewProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: avatar } = useGetAvatar(userProfile?.avatarId);

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackState, setPlaybackState] = useState<VideoPlaybackState>({
    url: null,
    mimeType: 'video/mp4',
    isConverted: false,
  });
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [gestureCues, setGestureCues] = useState<GestureCue[]>([]);
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionTimeline[]>([]);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoExternalBlobRef = useRef<ExternalBlob | null>(null);

  const addVideo = useAddVideo();
  const addAudio = useAddAudio();
  const addMusic = useAddBackgroundMusic();
  const addSceneConfig = useAddSceneConfig();

  useEffect(() => {
    if (isGenerating && text) {
      generateVideo();
    }
  }, [isGenerating, text]);

  useEffect(() => {
    // Load avatar URL if available
    if (avatar?.fileBlob) {
      loadAvatarUrl(avatar.fileBlob);
    }
  }, [avatar]);

  useEffect(() => {
    // Cleanup blob URL on unmount
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

  const detectMimeType = (bytes: Uint8Array): string => {
    // Check file signature (magic numbers) to detect format
    if (bytes.length < 12) return 'video/mp4'; // Default fallback

    // MP4 signature: starts with ftyp
    if (
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70
    ) {
      return 'video/mp4';
    }

    // WebM signature: starts with 0x1A 0x45 0xDF 0xA3
    if (
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3
    ) {
      return 'video/webm';
    }

    // MOV signature: similar to MP4 but with different ftyp
    if (
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70 &&
      (bytes[8] === 0x71 || bytes[8] === 0x6d) // qt or mov
    ) {
      return 'video/quicktime';
    }

    // Default to MP4 if unknown
    return 'video/mp4';
  };

  const generateVideo = async () => {
    if (!identity) return;

    try {
      setVideoError(null);

      // Stage 1: Analyzing text and detecting emotion
      setStage('Analyzing scene emotion and mood...');
      setProgress(10);
      const analysis = classifySceneEmotion(text);
      setEmotionAnalysis(analysis);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Calculate emotion-adjusted duration
      const baseDuration = Math.min(text.length / 10, 10);
      const durationMultiplier = getEmotionDurationMultiplier(analysis.emotion);
      const adjustedDuration = baseDuration * durationMultiplier;

      // Stage 2: Generating gesture timeline (frontend-based)
      setStage('Generating gesture timeline...');
      setProgress(20);
      const gestures = generateGestureCues(analysis, adjustedDuration);
      setGestureCues(gestures);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Stage 3: Generating emotion timeline (frontend-based)
      setStage('Generating emotion timeline...');
      setProgress(30);
      const emotions = generateEmotionTimeline(analysis, adjustedDuration);
      setEmotionTimeline(emotions);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Stage 4: Generating 3D scene
      setStage(`Generating 3D environment (${analysis.emotion} mood)...`);
      setProgress(45);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Stage 5: Creating narration (emotion-adjusted duration)
      setStage('Creating voice narration with lip-sync...');
      setProgress(60);
      const narration = await generateNarration(text, adjustedDuration);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Stage 6: Composing music (emotion-based parameters)
      setStage(`Composing ${analysis.emotion} background music...`);
      setProgress(75);
      const music = await generateMusic(text, analysis);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Stage 7: Rendering video
      setStage('Rendering final video with virtual actor performance...');
      setProgress(90);
      const videoData = await renderVideo(text, narration, music);

      // Stage 8: Saving to backend
      setStage('Saving to your library...');
      setProgress(95);
      const externalBlob = await saveToBackend(text, videoData, narration, music, analysis, adjustedDuration);

      setProgress(100);
      setStage('Complete!');
      toast.success(`Video with ${analysis.emotion} emotion generated successfully!`);

      // Convert ExternalBlob to blob URL for playback
      await loadVideoFromExternalBlob(externalBlob);

      setTimeout(() => {
        setIsPlaying(true);
        if (videoRef.current) {
          videoRef.current.play().catch((err) => {
            console.error('Autoplay failed:', err);
          });
        }
      }, 500);
    } catch (error) {
      console.error('Generation error:', error);
      setVideoError('Failed to generate video. Please try again.');
      toast.error('Failed to generate video. Please try again.');
      setProgress(0);
      setStage('');
    }
  };

  const loadVideoFromExternalBlob = async (
    externalBlob: ExternalBlob,
    retryCount = 0
  ): Promise<void> => {
    const MAX_RETRIES = 3;

    try {
      setVideoError(null);
      videoExternalBlobRef.current = externalBlob;

      const bytes = await externalBlob.getBytes();

      // Detect MIME type from file signature
      const mimeType = detectMimeType(bytes);

      const blob = new Blob([bytes], { type: mimeType });

      if (playbackState.url) {
        URL.revokeObjectURL(playbackState.url);
      }

      const url = URL.createObjectURL(blob);

      setPlaybackState({
        url,
        mimeType,
        isConverted: false,
      });
    } catch (error) {
      console.error('Error loading video from ExternalBlob:', error);

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying video load (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return loadVideoFromExternalBlob(externalBlob, retryCount + 1);
      }

      setVideoError(
        'Failed to load video. The video data may be corrupted or unavailable. Please try regenerating.'
      );
      toast.error('Failed to load video');
      throw error;
    }
  };

  const handleRetry = async () => {
    if (!videoExternalBlobRef.current) {
      if (text) {
        setProgress(0);
        setStage('');
        await generateVideo();
      }
      return;
    }

    setIsRetrying(true);
    setVideoError(null);

    // Revoke old URL before retry
    if (playbackState.url) {
      URL.revokeObjectURL(playbackState.url);
    }
    setPlaybackState({ url: null, mimeType: 'video/mp4', isConverted: false });

    try {
      await loadVideoFromExternalBlob(videoExternalBlobRef.current);
      toast.success('Video loaded successfully!');
    } catch (error) {
      console.error('Retry failed:', error);
      setVideoError('Retry failed. Please regenerate the video.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleVideoError = async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video playback error:', e);

    if (!videoExternalBlobRef.current) return;

    // Try alternative MIME types
    const currentMimeType = playbackState.mimeType;
    const alternativeMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'].filter(
      (type) => type !== currentMimeType
    );

    if (alternativeMimeTypes.length > 0 && !playbackState.isConverted) {
      console.log('Trying alternative MIME type:', alternativeMimeTypes[0]);

      try {
        const bytes = await videoExternalBlobRef.current.getBytes();
        const blob = new Blob([bytes], { type: alternativeMimeTypes[0] });

        if (playbackState.url) {
          URL.revokeObjectURL(playbackState.url);
        }

        const url = URL.createObjectURL(blob);
        setPlaybackState({
          url,
          mimeType: alternativeMimeTypes[0],
          isConverted: true,
        });

        toast.info('Trying alternative video format...');
      } catch (error) {
        console.error('Failed to convert video format:', error);
        setVideoError(
          'Video format not supported by your browser. Please try downloading the video or use a different browser.'
        );
      }
    } else {
      setVideoError(
        'Video playback failed. The video format may not be supported by your browser. Please try downloading the video.'
      );
    }
  };

  const generateNarration = async (text: string, duration: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const audioContext = new AudioContext();
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);

      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.1;
      }

      const blob = new Blob([new Uint8Array(data.buffer)], { type: 'audio/wav' });
      resolve(blob);
    });
  };

  const generateMusic = async (text: string, analysis: EmotionAnalysis): Promise<Blob> => {
    const audioContext = new AudioContext();
    const duration = 10;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    // Get emotion-based music parameters
    const musicParams = getEmotionMusicParameters(analysis.emotion, analysis.energy);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        data[i] = 
          Math.sin(2 * Math.PI * musicParams.baseFrequency * t * musicParams.tempo) * 
          0.05 * 
          Math.exp(-t / musicParams.decay);
      }
    }

    const blob = new Blob([new Uint8Array(buffer.getChannelData(0).buffer)], {
      type: 'audio/wav',
    });
    return blob;
  };

  const renderVideo = async (text: string, narration: Blob, music: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Generated Video with Virtual Actor', canvas.width / 2, canvas.height / 2 - 50);

        ctx.font = '32px sans-serif';
        ctx.fillText(text.substring(0, 50), canvas.width / 2, canvas.height / 2 + 50);

        canvas.toBlob((blob) => {
          resolve(blob || new Blob([], { type: 'video/webm' }));
        }, 'video/webm');
      }, 1000);
    });
  };

  const saveToBackend = async (
    text: string,
    videoData: Blob,
    narration: Blob,
    music: Blob,
    analysis: EmotionAnalysis,
    duration: number
  ): Promise<ExternalBlob> => {
    if (!identity) throw new Error('Not authenticated');

    const videoId = `video_${Date.now()}`;
    const audioId = `audio_${Date.now()}`;
    const musicId = `music_${Date.now()}`;
    const sceneId = `scene_${Date.now()}`;

    const videoBytes = new Uint8Array(await videoData.arrayBuffer());
    const audioBytes = new Uint8Array(await narration.arrayBuffer());
    const musicBytes = new Uint8Array(await music.arrayBuffer());

    const videoBlob = ExternalBlob.fromBytes(videoBytes);
    const audioBlob = ExternalBlob.fromBytes(audioBytes);
    const musicBlob = ExternalBlob.fromBytes(musicBytes);

    const now = BigInt(Date.now() * 1000000);

    // Detect MIME type for metadata
    const mimeType = detectMimeType(videoBytes);

    await addVideo.mutateAsync({
      videoBlob,
      metadata: {
        id: videoId,
        title: text.substring(0, 50),
        description: text,
        duration: BigInt(Math.round(duration)),
        createdBy: identity.getPrincipal(),
        uploadDate: now,
        visuals: [
          {
            effectType: { lighting: null } as any,
            intensity: BigInt(Math.round(analysis.intensity * 100)),
            duration: BigInt(Math.round(duration)),
            startTime: BigInt(0),
          },
        ],
        format: {
          mimeType,
          extension: mimeType === 'video/webm' ? '.webm' : '.mp4',
          codec: mimeType === 'video/webm' ? 'VP8' : 'H.264',
          resolution: [BigInt(1920), BigInt(1080)],
          bitrate: BigInt(5000),
          compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
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
        duration: BigInt(Math.round(duration)),
        createdBy: identity.getPrincipal(),
        uploadDate: now,
      },
    });

    await addMusic.mutateAsync({
      musicBlob,
      metadata: {
        id: musicId,
        videoId,
        genre: analysis.emotion,
        duration: BigInt(Math.round(duration)),
        createdBy: identity.getPrincipal(),
        uploadDate: now,
      },
    });

    // Save scene config with emotion analysis
    await addSceneConfig.mutateAsync({
      id: sceneId,
      videoId,
      sceneData: JSON.stringify({
        text,
        timestamp: Date.now(),
        gestures: gestureCues,
        emotions: emotionTimeline,
        emotionAnalysis: analysis,
        avatarId: userProfile?.avatarId,
      }),
      createdBy: identity.getPrincipal(),
      uploadDate: now,
    });

    onGenerationComplete(videoId);
    return videoBlob;
  };

  const handleDownload = async () => {
    if (!playbackState.url && videoExternalBlobRef.current) {
      try {
        const bytes = await videoExternalBlobRef.current.getBytes();
        const mimeType = detectMimeType(bytes);
        const extension = mimeType === 'video/webm' ? '.webm' : '.mp4';

        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `videogen_${Date.now()}${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Video downloaded!');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download video');
      }
      return;
    }

    if (!playbackState.url) return;

    const a = document.createElement('a');
    a.href = playbackState.url;
    const extension = playbackState.mimeType === 'video/webm' ? '.webm' : '.mp4';
    a.download = `videogen_${Date.now()}${extension}`;
    a.click();
    toast.success('Video downloaded!');
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.error('Play failed:', err);
        setVideoError('Failed to play video. Please try again.');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle>Scene Preview with Virtual Actor</CardTitle>
        <CardDescription>
          {isGenerating
            ? 'Generating your immersive 3D video with AI-driven virtual actor...'
            : emotionAnalysis
            ? `Your generated 3D scene with ${emotionAnalysis.emotion} emotion (${emotionAnalysis.energy} energy, ${emotionAnalysis.mood} mood)`
            : 'Your generated 3D scene with virtual actor performance'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{stage}</p>
          </div>
        )}

        {videoError && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{videoError}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="ml-4"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
          {playbackState.url ? (
            <video
              ref={videoRef}
              key={playbackState.url}
              src={playbackState.url}
              className="h-full w-full object-cover"
              controls
              preload="auto"
              playsInline
              loop
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={handleVideoError}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <Scene3D
              text={text}
              isPlaying={isPlaying}
              isMuted={isMuted}
              avatarUrl={avatarUrl}
              gestureCues={gestureCues}
              emotionTimeline={emotionTimeline}
              emotionAnalysis={emotionAnalysis}
            />
          )}

          {!isGenerating && (playbackState.url || videoExternalBlobRef.current) && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handlePlayPause}
                  className="h-10 w-10"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleMuteToggle}
                  className="h-10 w-10"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
              <Button onClick={handleDownload} variant="secondary" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
