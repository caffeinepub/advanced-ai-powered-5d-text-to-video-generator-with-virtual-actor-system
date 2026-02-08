import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Sparkles, Video, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserVideos, useGetCallerUserProfile } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: videos, isLoading: videosLoading } = useGetUserVideos();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">Please login to access your dashboard</p>
            <Button onClick={login}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Videos',
      value: videos?.length || 0,
      icon: Video,
      description: 'Videos created',
    },
    {
      title: 'This Month',
      value: videos?.filter(v => {
        const videoDate = new Date(Number(v.metadata.uploadDate) / 1000000);
        const now = new Date();
        return videoDate.getMonth() === now.getMonth() && videoDate.getFullYear() === now.getFullYear();
      }).length || 0,
      icon: TrendingUp,
      description: 'Videos this month',
    },
    {
      title: 'Recent Activity',
      value: videos && videos.length > 0 ? 'Active' : 'None',
      icon: Clock,
      description: 'Last 7 days',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold">
            Welcome back{profileLoading ? '...' : profile?.name ? `, ${profile.name}` : ''}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your videos today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {videosLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => navigate({ to: '/create' })}>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Create New Video</CardTitle>
                <CardDescription>
                  Start generating a new AI-powered 3D video from text
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => navigate({ to: '/library' })}>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Video className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>View Library</CardTitle>
                <CardDescription>
                  Browse and manage all your created videos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => navigate({ to: '/settings' })}>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Videos */}
        {videos && videos.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Videos</h2>
              <Button variant="outline" onClick={() => navigate({ to: '/library' })}>
                View All
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.slice(0, 3).map((video) => (
                <Card key={video.metadata.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-base">{video.metadata.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {video.metadata.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />
                    <p className="mt-4 text-xs text-muted-foreground">
                      {new Date(Number(video.metadata.uploadDate) / 1000000).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
