import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Clock, Maximize2, Palette, Sparkles, Star } from 'lucide-react';
import {
  GenerationSettings,
  ASPECT_RATIOS,
  STYLE_PRESETS,
  DURATION_OPTIONS,
  type AspectRatio,
  type StylePreset,
} from '../utils/generationSettings';
import {
  GENERATION_PROVIDERS,
  type GenerationProvider,
} from '../utils/generationProvider';

interface PromptConfigControlsProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
  disabled?: boolean;
  provider: GenerationProvider;
  onProviderChange: (provider: GenerationProvider) => void;
}

export default function PromptConfigControls({
  settings,
  onChange,
  disabled = false,
  provider,
  onProviderChange,
}: PromptConfigControlsProps) {
  const handleDurationChange = (value: number[]) => {
    onChange({ ...settings, duration: value[0] });
  };

  const handleAspectRatioChange = (value: string) => {
    onChange({ ...settings, aspectRatio: value as AspectRatio });
  };

  const handleStylePresetChange = (value: string) => {
    onChange({ ...settings, stylePreset: value as StylePreset });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="space-y-6 pt-6">
        {/* Provider Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Provider
          </Label>
          <RadioGroup
            value={provider}
            onValueChange={(value) => onProviderChange(value as GenerationProvider)}
            disabled={disabled}
            className="space-y-2"
          >
            {Object.values(GENERATION_PROVIDERS).map((providerInfo) => (
              <div
                key={providerInfo.id}
                className="flex items-start space-x-3 space-y-0 rounded-lg border border-border/50 p-3 hover:bg-accent/50 transition-colors"
              >
                <RadioGroupItem
                  value={providerInfo.id}
                  id={`provider-${providerInfo.id}`}
                  disabled={disabled}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`provider-${providerInfo.id}`}
                    className={`flex items-center gap-2 text-sm ${
                      !providerInfo.available
                        ? 'text-muted-foreground'
                        : ''
                    } cursor-pointer`}
                  >
                    {providerInfo.name}
                    {providerInfo.badge && (
                      <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {providerInfo.badge}
                      </Badge>
                    )}
                    {!providerInfo.available && (
                      <Badge variant="secondary" className="text-xs">
                        Coming soon
                      </Badge>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {providerInfo.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Duration Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Duration
            </Label>
            <span className="text-sm font-semibold text-foreground">{settings.duration}s</span>
          </div>
          <Slider
            value={[settings.duration]}
            onValueChange={handleDurationChange}
            min={3}
            max={15}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3s</span>
            <span>15s</span>
          </div>
        </div>

        {/* Aspect Ratio Control */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
            Aspect Ratio
          </Label>
          <Select
            value={settings.aspectRatio}
            onValueChange={handleAspectRatioChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style Preset Control */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4 text-muted-foreground" />
            Style Preset
          </Label>
          <Select
            value={settings.stylePreset}
            onValueChange={handleStylePresetChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STYLE_PRESETS).map(([key, { label, description }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
