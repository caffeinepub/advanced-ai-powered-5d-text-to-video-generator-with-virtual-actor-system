import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetup from './components/ProfileSetup';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CreatePage from './pages/CreatePage';
import LibraryPage from './pages/LibraryPage';
import EditorPage from './pages/EditorPage';
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';
import ExamplesPage from './pages/ExamplesPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient();

// Layout component with Header and Footer
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ProfileSetup />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Define all routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreatePage,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library',
  component: LibraryPage,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor/$videoId',
  component: EditorPage,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
});

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: FeaturesPage,
});

const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/examples',
  component: ExamplesPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  createRoute_,
  libraryRoute,
  editorRoute,
  pricingRoute,
  featuresRoute,
  examplesRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  settingsRoute,
]);

// Create router
const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
