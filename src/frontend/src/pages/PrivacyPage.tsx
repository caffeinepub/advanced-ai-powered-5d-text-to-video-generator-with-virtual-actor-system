import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
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
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: February 6, 2026</p>
          </div>

          <Card>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8">
              <h2>Introduction</h2>
              <p>
                At GrokVid.ai, we take your privacy seriously. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our AI video generation service.
              </p>

              <h2>Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li>Account information (name, email address)</li>
                <li>Video content and prompts you create</li>
                <li>Usage data and analytics</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Develop new features and services</li>
              </ul>

              <h2>Data Storage and Security</h2>
              <p>
                Your data is stored securely on the Internet Computer blockchain, providing enhanced
                security and privacy. We implement appropriate technical and organizational measures to
                protect your personal information.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Export your data</li>
              </ul>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@grokvid.ai">privacy@grokvid.ai</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
