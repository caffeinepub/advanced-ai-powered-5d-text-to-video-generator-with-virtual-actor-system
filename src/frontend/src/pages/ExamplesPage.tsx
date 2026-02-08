import { Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExamplesPage() {
  const examples = [
    {
      title: 'Product Launch Video',
      description: 'A tech startup showcasing their new app with animated 3D characters',
      category: 'Marketing',
      duration: '30s',
    },
    {
      title: 'Educational Tutorial',
      description: 'Science concept explained with engaging virtual teacher and animations',
      category: 'Education',
      duration: '2m',
    },
    {
      title: 'Instagram Reel',
      description: 'Trendy short-form content with music and dynamic transitions',
      category: 'Social Media',
      duration: '15s',
    },
    {
      title: 'Story Time for Kids',
      description: 'Animated fairy tale with colorful characters and magical environments',
      category: 'Entertainment',
      duration: '3m',
    },
    {
      title: 'Brand Advertisement',
      description: 'Professional commercial with custom branding and call-to-action',
      category: 'Marketing',
      duration: '45s',
    },
    {
      title: 'YouTube Short',
      description: 'Quick tips video with engaging visuals and clear messaging',
      category: 'Social Media',
      duration: '60s',
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
            Examples
          </Badge>
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
            See What's Possible with
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {' '}
              GrokVid.ai
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore videos created by our community using AI-powered generation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="rounded-full bg-background/80 p-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{example.duration}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{example.category}</Badge>
                </div>
                <CardTitle className="text-lg">{example.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{example.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to create your own amazing videos?
          </p>
          <Badge className="text-base px-6 py-3">
            Start Creating Free
          </Badge>
        </div>
      </div>
    </div>
  );
}
