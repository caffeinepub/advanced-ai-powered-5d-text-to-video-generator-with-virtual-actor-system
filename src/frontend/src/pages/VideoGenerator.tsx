import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextInput from '../components/TextInput';
import ScenePreview from '../components/ScenePreview';
import AvatarSetup from '../components/AvatarSetup';
import VideoLibrary from '../components/VideoLibrary';
import PromptConfigControls from '../components/PromptConfigControls';
import { DEFAULT_SETTINGS, type GenerationSettings } from '../utils/generationSettings';
import { getGenerationProvider, setGenerationProvider, type GenerationProvider } from '../utils/generationProvider';

export default function VideoGenerator() {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [provider, setProvider] = useState<GenerationProvider>(getGenerationProvider());
  const [promptVersion, setPromptVersion] = useState(0);

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Increment version to signal preview invalidation
    setPromptVersion((prev) => prev + 1);
  };

  const handleGenerateFull = () => {
    setIsGenerating(true);
  };

  const handleGeneratePreview = () => {
    setIsPreviewing(true);
  };

  const handleGenerationComplete = (videoId: string) => {
    setGeneratedVideoId(videoId);
    setIsGenerating(false);
  };

  const handlePreviewComplete = () => {
    setIsPreviewing(false);
  };

  const handleProviderChange = (newProvider: GenerationProvider) => {
    setProvider(newProvider);
    setGenerationProvider(newProvider);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Video Studio</h1>
        <p className="text-muted-foreground">
          Create stunning 3D videos with AI-powered virtual actors and emotion-driven animation
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="avatars">Avatars</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <PromptConfigControls
            settings={settings}
            onChange={setSettings}
            provider={provider}
            onProviderChange={handleProviderChange}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <TextInput
              value={text}
              onChange={handleTextChange}
              onGenerateFull={handleGenerateFull}
              onGeneratePreview={handleGeneratePreview}
              isGenerating={isGenerating}
              isPreviewing={isPreviewing}
            />

            <ScenePreview
              text={text}
              isGenerating={isGenerating}
              isPreviewing={isPreviewing}
              onGenerationComplete={handleGenerationComplete}
              onPreviewComplete={handlePreviewComplete}
              generatedVideoId={generatedVideoId}
              settings={settings}
              provider={provider}
              shouldInvalidatePreview={promptVersion > 0}
            />
          </div>
        </TabsContent>

        <TabsContent value="avatars">
          <AvatarSetup />
        </TabsContent>

        <TabsContent value="library">
          <VideoLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
