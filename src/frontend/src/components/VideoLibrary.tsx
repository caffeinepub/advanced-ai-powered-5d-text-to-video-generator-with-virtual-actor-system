import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Play, Download, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetVideosByCreator } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { normalizeGenerationError } from '../utils/generationErrors';

export default function VideoLibrary() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: videos, isLoading, error, refetch } = useGetVideosByCreator(identity?.getPrincipal());
  const [videoUrls, setVideoUrls] = useState<Map<string, string>>(new Map());
  const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());
  const [videoErrors, setVideoErrors] = useState<Map<string, { summary: string; hint: string }>>(new Map());

  useEffect(() => {
    return () => {
      videoUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (videos) {
      videos.forEach((video) => {
        if (!videoUrls.has(video.metadata.id) && !loadingVideos.has(video.metadata.id)) {
          loadVideo(video.metadata.id, video.videoBlob);
        }
      });
    }
  }, [videos]);

  const loadVideo = async (videoId: string, blob: ExternalBlob) => {
    setLoadingVideos((prev) => new Set(prev).add(videoId));
    try {
      const bytes = await blob.getBytes();
      const videoBlob = new Blob([bytes], { type: 'video/webm' });
      const url = URL.createObjectURL(videoBlob);
      setVideoUrls((prev) => new Map(prev).set(videoId, url));
      setVideoErrors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(videoId);
        return newMap;
      });
    } catch (error: any) {
      console.error(`Failed to load video ${videoId}:`, error);
      const normalized = normalizeGenerationError(error);
      setVideoErrors((prev) =>
        new Map(prev).set(videoId, { summary: normalized.summary, hint: normalized.technicalHint })
      );
    } finally {
      setLoadingVideos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  const handleRetryLoad = (videoId: string, blob: ExternalBlob) => {
    loadVideo(videoId, blob);
  };

  const handleDownload = async (video: any) => {
    try {
      const bytes = await video.videoBlob.getBytes();
      const blob = new Blob([bytes], { type: video.metadata.format.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${video.metadata.format.extension}`;
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

  const handleViewDetails = (videoId: string) => {
    navigate({ to: '/editor', search: { videoId } });
  };

  if (!identity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Library</CardTitle>
          <CardDescription>Please login to view your videos</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Library</CardTitle>
          <CardDescription>Loading your videos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const normalized = normalizeGenerationError(error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Library</CardTitle>
          <CardDescription>Failed to load videos</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              <p className="font-medium">{normalized.summary}</p>
              {normalized.technicalHint && <p className="mt-1 text-sm opacity-90">{normalized.technicalHint}</p>}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="outline" className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Library</CardTitle>
          <CardDescription>Your generated videos will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Play className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No videos yet. Create your first video to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Library</CardTitle>
        <CardDescription>
          {videos.length} {videos.length === 1 ? 'video' : 'videos'} in your library
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const videoUrl = videoUrls.get(video.metadata.id);
            const isLoadingVideo = loadingVideos.has(video.metadata.id);
            const videoError = videoErrors.get(video.metadata.id);

            return (
              <Card key={video.metadata.id} className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {isLoadingVideo && (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {videoError && (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                      <p className="mb-2 text-sm text-destructive">{videoError.summary}</p>
                      {videoError.hint && (
                        <p className="mb-3 text-xs text-muted-foreground">{videoError.hint}</p>
                      )}
                      <Button
                        onClick={() => handleRetryLoad(video.metadata.id, video.videoBlob)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </Button>
                    </div>
                  )}
                  {videoUrl && !isLoadingVideo && !videoError && (
                    <video
                      src={videoUrl}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold">{video.metadata.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{video.metadata.description}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleViewDetails(video.metadata.id)} variant="outline" size="sm" className="flex-1 gap-2">
                      <Play className="h-3 w-3" />
                      View
                    </Button>
                    <Button onClick={() => handleDownload(video)} variant="outline" size="sm" className="gap-2">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
