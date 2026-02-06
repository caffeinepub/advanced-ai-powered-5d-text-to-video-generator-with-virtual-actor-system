import { useState } from 'react';
import { Sparkles, Video as VideoIcon, User } from 'lucide-react';
import TextInput from '../components/TextInput';
import ScenePreview from '../components/ScenePreview';
import VideoLibrary from '../components/VideoLibrary';
import AvatarSetup from '../components/AvatarSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VideoGenerator() {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedVideoId(null);
  };

  const handleGenerationComplete = (videoId: string) => {
    setGeneratedVideoId(videoId);
    setIsGenerating(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(var(--primary)/0.1),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered 3D Video Generation with Virtual Actors
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Transform Text into
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {' '}
              Immersive 3D Videos
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Create stunning animated 3D environments with AI-driven virtual actors performing realistic gestures, emotions, and lip-sync.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="mb-8 grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="create" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="avatars" className="gap-2">
              <User className="h-4 w-4" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <VideoIcon className="h-4 w-4" />
              My Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-8">
            <TextInput
              value={inputText}
              onChange={setInputText}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />

            {(inputText || isGenerating || generatedVideoId) && (
              <ScenePreview
                text={inputText}
                isGenerating={isGenerating}
                onGenerationComplete={handleGenerationComplete}
                generatedVideoId={generatedVideoId}
              />
            )}
          </TabsContent>

          <TabsContent value="avatars">
            <AvatarSetup />
          </TabsContent>

          <TabsContent value="library">
            <VideoLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
