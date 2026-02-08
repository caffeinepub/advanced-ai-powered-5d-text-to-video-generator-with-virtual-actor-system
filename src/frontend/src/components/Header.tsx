import { Moon, Sun, Sparkles, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const isPublicPage = ['/', '/pricing', '/features', '/examples', '/contact', '/privacy', '/terms'].includes(currentPath);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">GrokVid.ai</h1>
              <p className="text-xs text-muted-foreground">AI Video Generator</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          {isPublicPage && (
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/features' })}
              >
                Features
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/pricing' })}
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/examples' })}
              >
                Examples
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/contact' })}
              >
                Contact
              </Button>
            </nav>
          )}

          {/* App Navigation */}
          {!isPublicPage && identity && (
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/dashboard' })}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/create' })}
              >
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/library' })}
              >
                Library
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/settings' })}
              >
                Settings
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isPublicPage ? (
                <>
                  <DropdownMenuItem onClick={() => navigate({ to: '/features' })}>
                    Features
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/pricing' })}>
                    Pricing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/examples' })}>
                    Examples
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/contact' })}>
                    Contact
                  </DropdownMenuItem>
                </>
              ) : identity ? (
                <>
                  <DropdownMenuItem onClick={() => navigate({ to: '/dashboard' })}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/create' })}>
                    Create
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/library' })}>
                    Library
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                    Settings
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {identity ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button onClick={login} disabled={isLoggingIn}>
              {isLoggingIn ? 'Connecting...' : 'Login'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
