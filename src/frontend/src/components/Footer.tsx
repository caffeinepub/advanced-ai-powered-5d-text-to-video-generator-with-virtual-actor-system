import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            © 2025. Built with{' '}
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
          <p className="text-xs text-muted-foreground">
            Transform your ideas into immersive 3D video experiences
          </p>
        </div>
      </div>
    </footer>
  );
}
