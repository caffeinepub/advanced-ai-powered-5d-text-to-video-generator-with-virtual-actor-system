import { Heart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">GrokVid.ai</h3>
            <p className="text-sm text-muted-foreground">
              Transform your ideas into immersive 3D video experiences with AI-powered generation.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="font-semibold">Product</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <button
                onClick={() => navigate({ to: '/features' })}
                className="text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Features
              </button>
              <button
                onClick={() => navigate({ to: '/pricing' })}
                className="text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate({ to: '/examples' })}
                className="text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Examples
              </button>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-semibold">Company</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <button
                onClick={() => navigate({ to: '/contact' })}
                className="text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Contact
              </button>
              <button
                onClick={() => navigate({ to: '/privacy' })}
                className="text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate({ to: '/terms' })}
                className="text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Terms of Service
              </button>
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="font-semibold">Connect</h4>
            <p className="text-sm text-muted-foreground">
              Join our community and stay updated with the latest features.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8 text-center">
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            © 2026. Built with{' '}
            <Heart className="h-4 w-4 fill-destructive text-destructive" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
