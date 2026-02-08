import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <Badge className="mb-6" variant="secondary">
              Legal
            </Badge>
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: February 6, 2026</p>
          </div>

          <Card>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8">
              <h2>Agreement to Terms</h2>
              <p>
                By accessing or using GrokVid.ai, you agree to be bound by these Terms of Service and all
                applicable laws and regulations. If you do not agree with any of these terms, you are
                prohibited from using this service.
              </p>

              <h2>Use License</h2>
              <p>
                Permission is granted to temporarily use GrokVid.ai for personal or commercial purposes.
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose without proper licensing</li>
                <li>Attempt to reverse engineer any software contained in GrokVid.ai</li>
                <li>Remove any copyright or proprietary notations from the materials</li>
              </ul>

              <h2>Content Ownership</h2>
              <p>
                You retain all rights to the videos you create using GrokVid.ai. We do not claim ownership
                of your content. However, by using our service, you grant us a license to process and store
                your content for the purpose of providing the service.
              </p>

              <h2>Acceptable Use</h2>
              <p>You agree not to use GrokVid.ai to:</p>
              <ul>
                <li>Create content that is illegal, harmful, or violates others' rights</li>
                <li>Generate misleading or deceptive content</li>
                <li>Harass, abuse, or harm others</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>

              <h2>Service Availability</h2>
              <p>
                We strive to provide reliable service but do not guarantee uninterrupted access. We reserve
                the right to modify or discontinue the service at any time without notice.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                GrokVid.ai shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of or inability to use the service.
              </p>

              <h2>Contact</h2>
              <p>
                For questions about these Terms of Service, contact us at{' '}
                <a href="mailto:legal@grokvid.ai">legal@grokvid.ai</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
