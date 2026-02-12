// Generation settings model for text-to-video configuration

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type StylePreset = 'cinematic' | 'vibrant' | 'minimal' | 'dramatic' | 'natural';

export interface GenerationSettings {
  duration: number; // in seconds
  aspectRatio: AspectRatio;
  stylePreset: StylePreset;
}

export const DEFAULT_SETTINGS: GenerationSettings = {
  duration: 5,
  aspectRatio: '16:9',
  stylePreset: 'natural',
};

export const ASPECT_RATIOS: Record<AspectRatio, { label: string; resolution: [number, number] }> = {
  '16:9': { label: '16:9 (Landscape)', resolution: [1920, 1080] },
  '9:16': { label: '9:16 (Portrait)', resolution: [1080, 1920] },
  '1:1': { label: '1:1 (Square)', resolution: [1080, 1080] },
  '4:3': { label: '4:3 (Classic)', resolution: [1440, 1080] },
};

export const STYLE_PRESETS: Record<StylePreset, { label: string; description: string }> = {
  cinematic: { label: 'Cinematic', description: 'Film-like depth and color grading' },
  vibrant: { label: 'Vibrant', description: 'Bold colors and high contrast' },
  minimal: { label: 'Minimal', description: 'Clean and simple aesthetic' },
  dramatic: { label: 'Dramatic', description: 'High contrast with strong shadows' },
  natural: { label: 'Natural', description: 'Realistic and balanced look' },
};

export const DURATION_OPTIONS = [3, 5, 8, 10, 15];

export function validateSettings(settings: Partial<GenerationSettings>): GenerationSettings {
  return {
    duration: Math.max(3, Math.min(settings.duration || DEFAULT_SETTINGS.duration, 30)),
    aspectRatio: settings.aspectRatio || DEFAULT_SETTINGS.aspectRatio,
    stylePreset: settings.stylePreset || DEFAULT_SETTINGS.stylePreset,
  };
}

export function getResolutionForAspectRatio(aspectRatio: AspectRatio): [number, number] {
  return ASPECT_RATIOS[aspectRatio].resolution;
}
