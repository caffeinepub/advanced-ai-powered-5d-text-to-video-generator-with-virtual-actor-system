import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoGenerator from './pages/VideoGenerator';
import ProfileSetup from './components/ProfileSetup';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex min-h-screen flex-col">
        <Header />
        <ProfileSetup />
        <main className="flex-1">
          <VideoGenerator />
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
