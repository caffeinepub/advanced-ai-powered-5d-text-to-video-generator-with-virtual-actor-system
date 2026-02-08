import { Check } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out GrokVid.ai',
      features: [
        '5 videos per month',
        '720p quality',
        'Watermark included',
        'Basic avatars',
        'Community support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Creator',
      price: '$9',
      period: 'per month',
      description: 'For content creators and small businesses',
      features: [
        '50 videos per month',
        '1080p quality',
        'No watermark',
        'Premium avatars',
        'Custom branding',
        'Priority support',
        'Advanced editing',
      ],
      cta: 'Start Creating',
      popular: true,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For professionals and agencies',
      features: [
        'Unlimited videos',
        '4K quality',
        'No watermark',
        'All avatars',
        'Custom branding',
        'API access',
        'Advanced editing',
        '24/7 priority support',
        'Team collaboration',
      ],
      cta: 'Go Pro',
      popular: false,
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
            Pricing
          </Badge>
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="mb-4">{plan.description}</CardDescription>
                <div className="mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.period}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate({ to: '/create' })}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include access to our core AI video generation features
          </p>
          <Button variant="link" onClick={() => navigate({ to: '/contact' })}>
            Need a custom plan? Contact us
          </Button>
        </div>
      </div>
    </div>
  );
}
