import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Film } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetVideo, useGetSceneConfig } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function EditorPage() {
  const { videoId } = useParams({ from: '/editor/$videoId' });
  const navigate = useNavigate();
  const { data: video, isLoading: videoLoading } = useGetVideo(videoId);
  const { data: sceneConfig, isLoading: configLoading } = useGetSceneConfig(videoId);

  const parsedConfig = sceneConfig?.sceneData ? JSON.parse(sceneConfig.sceneData) : null;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/library' })}
          className="mb-6 text-neutral-400 hover:text-amber-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-amber-400">Video Editor</h1>
          <p className="text-lg text-neutral-400">
            View and edit your generated video
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Film className="h-5 w-5" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {videoLoading ? (
                  <Skeleton className="aspect-video w-full rounded-lg bg-neutral-700" />
                ) : video ? (
                  <div className="aspect-video overflow-hidden rounded-lg border border-neutral-700 bg-black">
                    <video
                      src={video.videoBlob.getDirectURL()}
                      controls
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900">
                    <p className="text-neutral-500">Video not found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Editor Placeholder */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-400">Editor Controls</CardTitle>
                <CardDescription className="text-neutral-400">
                  Advanced editing features coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-neutral-600 bg-neutral-900/30 p-12 text-center">
                  <p className="text-neutral-500">
                    Timeline editor, effects, and transitions will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Video Details */}
          <div className="space-y-6">
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-400">Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoLoading ? (
                  <>
                    <Skeleton className="h-6 w-full bg-neutral-700" />
                    <Skeleton className="h-20 w-full bg-neutral-700" />
                  </>
                ) : video ? (
                  <>
                    <div>
                      <p className="text-sm text-neutral-400">Title</p>
                      <p className="font-medium text-neutral-200">{video.metadata.title}</p>
                    </div>
                    <Separator className="bg-neutral-700" />
                    <div>
                      <p className="text-sm text-neutral-400">Description</p>
                      <p className="text-sm text-neutral-300">{video.metadata.description}</p>
                    </div>
                    <Separator className="bg-neutral-700" />
                    <div>
                      <p className="text-sm text-neutral-400">Duration</p>
                      <p className="font-medium text-neutral-200">
                        {(Number(video.metadata.duration) / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <Separator className="bg-neutral-700" />
                    <div>
                      <p className="text-sm text-neutral-400">Format</p>
                      <Badge variant="outline" className="mt-1 border-amber-500/50 text-amber-400">
                        {video.metadata.format.mimeType}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">No video details available</p>
                )}
              </CardContent>
            </Card>

            {/* Generation Settings */}
            {parsedConfig && (
              <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-400">Generation Settings</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Settings used to create this video
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configLoading ? (
                    <>
                      <Skeleton className="h-6 w-full bg-neutral-700" />
                      <Skeleton className="h-6 w-full bg-neutral-700" />
                    </>
                  ) : (
                    <>
                      {parsedConfig.prompt && (
                        <>
                          <div>
                            <p className="text-sm text-neutral-400">Original Prompt</p>
                            <p className="text-sm text-neutral-300 mt-1">{parsedConfig.prompt}</p>
                          </div>
                          <Separator className="bg-neutral-700" />
                        </>
                      )}
                      {parsedConfig.settings && (
                        <>
                          <div>
                            <p className="text-sm text-neutral-400">Duration</p>
                            <p className="font-medium text-neutral-200">{parsedConfig.settings.duration}s</p>
                          </div>
                          <Separator className="bg-neutral-700" />
                          <div>
                            <p className="text-sm text-neutral-400">Aspect Ratio</p>
                            <Badge variant="outline" className="mt-1 border-amber-500/50 text-amber-400">
                              {parsedConfig.settings.aspectRatio}
                            </Badge>
                          </div>
                          <Separator className="bg-neutral-700" />
                          <div>
                            <p className="text-sm text-neutral-400">Style Preset</p>
                            <Badge variant="outline" className="mt-1 border-amber-500/50 text-amber-400">
                              {parsedConfig.settings.stylePreset}
                            </Badge>
                          </div>
                        </>
                      )}
                      {parsedConfig.emotion && (
                        <>
                          <Separator className="bg-neutral-700" />
                          <div>
                            <p className="text-sm text-neutral-400">Detected Emotion</p>
                            <Badge variant="outline" className="mt-1 border-amber-500/50 text-amber-400">
                              {parsedConfig.emotion.emotion}
                            </Badge>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
