import { useState, useEffect } from 'react';
import TextInput from '../components/TextInput';
import ScenePreview from '../components/ScenePreview';
import { DEFAULT_SETTINGS, type GenerationSettings } from '../utils/generationSettings';
import { getGenerationProvider, type GenerationProvider } from '../utils/generationProvider';

export default function CreatePage() {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);
  const [settings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [provider] = useState<GenerationProvider>(getGenerationProvider());
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

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Video</h1>
        <p className="text-muted-foreground">
          Describe your vision and watch it come to life with AI-powered 3D animation
        </p>
      </div>

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
    </div>
  );
}
