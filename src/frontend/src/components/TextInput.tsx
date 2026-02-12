import { useState } from 'react';
import { Sparkles, Wand2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateFull: () => void;
  onGeneratePreview: () => void;
  isGenerating: boolean;
  isPreviewing: boolean;
}

const EXAMPLE_PROMPTS = [
  'A serene forest at dawn with rays of sunlight filtering through ancient trees, birds chirping in the distance',
  'A futuristic cityscape at night with neon lights, flying vehicles, and holographic advertisements',
  'An underwater coral reef teeming with colorful fish, gentle currents, and shimmering light from above',
  'A cozy mountain cabin during a snowstorm, warm fireplace glowing inside, peaceful winter atmosphere',
];

export default function TextInput({ 
  value, 
  onChange, 
  onGenerateFull, 
  onGeneratePreview,
  isGenerating,
  isPreviewing,
}: TextInputProps) {
  const { identity, login } = useInternetIdentity();
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const isProcessing = isGenerating || isPreviewing;

  const handleGenerateFull = () => {
    if (!identity) {
      toast.error('Please login to generate videos');
      login();
      return;
    }

    if (!value.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (value.trim().length < 20) {
      toast.error('Please provide a more detailed description (at least 20 characters)');
      return;
    }

    onGenerateFull();
  };

  const handleGeneratePreview = () => {
    if (!value.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (value.trim().length < 20) {
      toast.error('Please provide a more detailed description (at least 20 characters)');
      return;
    }

    onGeneratePreview();
  };

  const handleExampleClick = (example: string, index: number) => {
    onChange(example);
    setSelectedExample(index);
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Describe Your Vision
        </CardTitle>
        <CardDescription>
          Enter a detailed description of the scene you want to create. Be specific about the environment,
          atmosphere, and visual elements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Example: A mystical forest at twilight with glowing mushrooms, floating particles of light, and a gentle mist rolling through ancient trees..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[150px] resize-none text-base"
          disabled={isProcessing}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Try an example:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt, index)}
                disabled={isProcessing}
                className={`rounded-lg border p-3 text-left text-sm transition-all hover:border-primary hover:bg-accent ${
                  selectedExample === index ? 'border-primary bg-accent' : 'border-border'
                } ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePreview}
            disabled={isProcessing || !value.trim()}
            size="lg"
            variant="outline"
            className="flex-1 gap-2"
          >
            {isPreviewing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Previewing...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview sample
              </>
            )}
          </Button>

          <Button
            onClick={handleGenerateFull}
            disabled={isProcessing || !value.trim()}
            size="lg"
            className="flex-1 gap-2"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate full clip
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
