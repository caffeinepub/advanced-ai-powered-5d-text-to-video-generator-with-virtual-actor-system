import { useState, useEffect } from 'react';
import { Download, Play, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetUserVideos } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalBlob, Video } from '../backend';
import { toast } from 'sonner';

interface VideoPlaybackState {
  url: string | null;
  mimeType: string;
  isConverted: boolean;
}

export default function VideoLibrary() {
  const { identity, login } = useInternetIdentity();
  const { data: videos, isLoading } = useGetUserVideos();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [playbackState, setPlaybackState] = useState<VideoPlaybackState>({
    url: null,
    mimeType: 'video/mp4',
    isConverted: false,
  });
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  useEffect(() => {
    return () => {
      if (playbackState.url) {
        URL.revokeObjectURL(playbackState.url);
      }
    };
  }, [playbackState.url]);

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

  const loadVideoBlob = async (
    externalBlob: ExternalBlob,
    video: Video,
    retryCount = 0
  ): Promise<void> => {
    const MAX_RETRIES = 3;

    setIsLoadingVideo(true);
    setVideoError(null);

    try {
      const bytes = await externalBlob.getBytes();
      let mimeType = video.metadata.format?.mimeType || detectMimeType(bytes);
      let blob = new Blob([bytes], { type: mimeType });

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
      console.error('Error loading video blob:', error);

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying video load (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return loadVideoBlob(externalBlob, video, retryCount + 1);
      }

      setVideoError(
        'Failed to load video. The video may be unavailable or corrupted. Please try again or regenerate the video.'
      );
      toast.error('Failed to load video');
      throw error;
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handlePlayVideo = async (video: Video) => {
    setSelectedVideo(video);
    setPlaybackState({ url: null, mimeType: 'video/mp4', isConverted: false });
    setVideoError(null);
    await loadVideoBlob(video.videoBlob, video);
  };

  const handleRetryLoad = async () => {
    if (selectedVideo) {
      if (playbackState.url) {
        URL.revokeObjectURL(playbackState.url);
      }
      setPlaybackState({ url: null, mimeType: 'video/mp4', isConverted: false });
      await loadVideoBlob(selectedVideo.videoBlob, selectedVideo);
    }
  };

  const handleVideoError = async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video playback error:', e);

    if (!selectedVideo) return;

    const currentMimeType = playbackState.mimeType;
    const alternativeMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'].filter(
      (type) => type !== currentMimeType
    );

    if (alternativeMimeTypes.length > 0 && !playbackState.isConverted) {
      console.log('Trying alternative MIME type:', alternativeMimeTypes[0]);

      try {
        const bytes = await selectedVideo.videoBlob.getBytes();
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

  const handleDownload = async (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const bytes = await video.videoBlob.getBytes();
      const mimeType = video.metadata.format?.mimeType || detectMimeType(bytes);
      const extension = video.metadata.format?.extension || '.mp4';

      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.metadata.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}${extension}`;
      a.click();

      URL.revokeObjectURL(url);
      toast.success('Video downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download video');
    }
  };

  const handleDeleteClick = (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoToDelete(video);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;

    try {
      // Note: Backend doesn't have delete video functionality yet
      toast.info('Delete functionality will be available soon');
      setVideoToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete video');
    }
  };

  const handleCloseDialog = () => {
    if (playbackState.url) {
      URL.revokeObjectURL(playbackState.url);
    }
    setSelectedVideo(null);
    setPlaybackState({ url: null, mimeType: 'video/mp4', isConverted: false });
    setVideoError(null);
  };

  if (!identity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-muted-foreground">Please login to view your video library</p>
          <Button onClick={login}>Login</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No videos yet. Create your first one!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card
            key={video.metadata.id}
            className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
            onClick={() => handlePlayVideo(video)}
          >
            <CardHeader>
              <CardTitle className="line-clamp-1 text-base">{video.metadata.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {video.metadata.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-background/80 p-4 backdrop-blur-sm">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white font-medium line-clamp-2">
                    {video.metadata.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(Number(video.metadata.uploadDate) / 1000000).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => handleDownload(video, e)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => handleDeleteClick(video, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.metadata.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {videoError && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{videoError}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryLoad}
                    disabled={isLoadingVideo}
                  >
                    {isLoadingVideo ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
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
              {isLoadingVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-white">Loading video...</p>
                  </div>
                </div>
              )}

              {playbackState.url && !isLoadingVideo && (
                <video
                  key={playbackState.url}
                  src={playbackState.url}
                  controls
                  preload="auto"
                  playsInline
                  autoPlay
                  loop
                  className="h-full w-full"
                  onError={handleVideoError}
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {!playbackState.url && !isLoadingVideo && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white">Preparing video...</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>{selectedVideo?.metadata.description}</p>
                <p className="mt-1">
                  Duration: {selectedVideo ? Number(selectedVideo.metadata.duration) : 0}s
                </p>
                {selectedVideo?.metadata.format && (
                  <p className="mt-1 text-xs">
                    Format: {selectedVideo.metadata.format.codec} (
                    {selectedVideo.metadata.format.mimeType})
                  </p>
                )}
              </div>
              {selectedVideo && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(selectedVideo, e);
                  }}
                  variant="secondary"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{videoToDelete?.metadata.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
