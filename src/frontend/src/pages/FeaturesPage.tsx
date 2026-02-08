import { Sparkles, Video, Zap, Users, Palette, Globe, Shield, Headphones } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FeaturesPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Advanced AI technology transforms your text prompts into stunning 3D animated videos with realistic environments and characters.',
      color: 'from-primary to-accent',
    },
    {
      icon: Video,
      title: 'Virtual Actors',
      description: 'Realistic avatars with emotions, gestures, and lip-sync capabilities for immersive storytelling and engaging content.',
      color: 'from-accent to-primary',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate professional-quality videos in seconds, not hours. Our optimized pipeline ensures rapid processing.',
      color: 'from-primary to-accent',
    },
    {
      icon: Users,
      title: 'Multiple Use Cases',
      description: 'Perfect for YouTube Shorts, Instagram Reels, marketing ads, educational content, and more.',
      color: 'from-accent to-primary',
    },
    {
      icon: Palette,
      title: 'Customizable Styles',
      description: 'Choose from various visual styles, color schemes, and animation types to match your brand and vision.',
      color: 'from-primary to-accent',
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Create videos in multiple languages with native-quality voice synthesis and accurate lip-sync.',
      color: 'from-accent to-primary',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your content is stored securely on the Internet Computer blockchain with full privacy protection.',
      color: 'from-primary to-accent',
    },
    {
      icon: Headphones,
      title: 'Priority Support',
      description: 'Get help when you need it with our dedicated support team available for all paid plans.',
      color: 'from-accent to-primary',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge className="mb-6" variant="secondary">
            Features
          </Badge>
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
            Everything You Need to Create
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {' '}
              Amazing Videos
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you create professional AI-generated videos effortlessly.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all">
              <CardHeader>
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="mb-8 text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-xl font-semibold">Describe Your Vision</h3>
              <p className="text-muted-foreground">
                Type your video idea in plain text. Our AI understands context and intent.
              </p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="text-xl font-semibold">AI Generates</h3>
              <p className="text-muted-foreground">
                Watch as AI creates 3D scenes, avatars, animations, and audio automatically.
              </p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="text-xl font-semibold">Export & Share</h3>
              <p className="text-muted-foreground">
                Download in high quality and share across all your favorite platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
