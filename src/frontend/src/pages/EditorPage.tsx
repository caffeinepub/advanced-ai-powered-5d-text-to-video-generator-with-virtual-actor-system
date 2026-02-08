import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetVideo } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditorPage() {
  const { videoId } = useParams({ from: '/editor/$videoId' });
  const navigate = useNavigate();
  const { data: video, isLoading } = useGetVideo(videoId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="mb-8 h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">Video not found</p>
            <Button onClick={() => navigate({ to: '/library' })}>
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-8 gap-2"
          onClick={() => navigate({ to: '/library' })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">{video.metadata.title}</h1>
          <p className="text-lg text-muted-foreground">{video.metadata.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Video Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <p className="text-muted-foreground">Editor interface coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
