import { Sparkles, Video, Zap, Users, ArrowRight, Play, Check } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Transform text prompts into stunning 3D animated videos with advanced AI technology.',
    },
    {
      icon: Video,
      title: 'Virtual Actors',
      description: 'Realistic avatars with emotions, gestures, and lip-sync for immersive storytelling.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate professional-quality videos in seconds, not hours.',
    },
    {
      icon: Users,
      title: 'Multiple Use Cases',
      description: 'Perfect for YouTube Shorts, Instagram Reels, marketing ads, and educational content.',
    },
  ];

  const useCases = [
    'YouTube Shorts',
    'Instagram Reels',
    'Kids Cartoons',
    'Story Videos',
    'Marketing Ads',
    'Educational Content',
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      features: ['5 videos/month', '720p quality', 'Watermark included', 'Basic avatars'],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Creator',
      price: '$9',
      features: ['50 videos/month', '1080p quality', 'No watermark', 'Premium avatars', 'Priority support'],
      cta: 'Start Creating',
      popular: true,
    },
    {
      name: 'Pro',
      price: '$29',
      features: ['Unlimited videos', '4K quality', 'No watermark', 'All avatars', 'API access', '24/7 support'],
      cta: 'Go Pro',
      popular: false,
    },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(var(--primary)/0.15),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 gap-2" variant="secondary">
              <Sparkles className="h-3 w-3" />
              AI-Powered Video Generation
            </Badge>

            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Create AI Videos Like
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {' '}
                Grok Thinks
              </span>
              <br />
              In Seconds
            </h1>

            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Transform your ideas into stunning 3D animated videos with AI-driven virtual actors.
              Perfect for creators, marketers, and storytellers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gap-2 text-lg px-8"
                onClick={() => navigate({ to: '/create' })}
              >
                Try Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8"
                onClick={() => navigate({ to: '/examples' })}
              >
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/40 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Create professional videos in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Type Your Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Describe your video concept in plain text. Our AI understands your vision.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>AI Creates Scenes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Watch as AI generates 3D environments, avatars, and animations automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Download & Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Export your video in high quality and share it across all platforms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to create professional AI videos
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-border/40 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Perfect For</h2>
            <p className="text-lg text-muted-foreground">
              Create content for any platform or purpose
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {useCases.map((useCase, index) => (
              <Badge key={index} variant="secondary" className="px-6 py-3 text-base">
                {useCase}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={plan.popular ? 'border-primary shadow-lg' : ''}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate({ to: '/pricing' })}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Ready to Create Amazing Videos?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of creators using GrokVid.ai to bring their ideas to life
            </p>
            <Button
              size="lg"
              className="gap-2 text-lg px-8"
              onClick={() => navigate({ to: '/create' })}
            >
              Start Creating Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
