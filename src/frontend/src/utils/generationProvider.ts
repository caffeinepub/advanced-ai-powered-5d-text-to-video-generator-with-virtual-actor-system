// Client-side generation provider persistence and availability

export type GenerationProvider = 'local' | 'gemini' | 'grok' | 'runway' | 'pictory' | 'fliki' | 'veed' | 'kling26';

export interface ProviderInfo {
  id: GenerationProvider;
  name: string;
  description: string;
  available: boolean;
  badge?: string;
}

export const GENERATION_PROVIDERS: Record<GenerationProvider, ProviderInfo> = {
  local: {
    id: 'local',
    name: 'Local (Browser-based)',
    description: 'Fast, deterministic generation using local algorithms',
    available: true,
  },
  kling26: {
    id: 'kling26',
    name: 'Kling 2.6',
    description: 'Best quality-to-cost ratio for professional video generation',
    available: false,
    badge: 'Best value',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Advanced AI-powered generation with Gemini models',
    available: false,
  },
  grok: {
    id: 'grok',
    name: 'Grok AI',
    description: 'Next-generation video synthesis with Grok',
    available: false,
  },
  runway: {
    id: 'runway',
    name: 'Runway (via Easemate.ai)',
    description: 'Popular model for generating 5-10 second clips with customizable aspect ratios',
    available: false,
  },
  pictory: {
    id: 'pictory',
    name: 'Pictory AI',
    description: 'Ideal for turning scripts and articles into videos with matched visuals and music',
    available: false,
  },
  fliki: {
    id: 'fliki',
    name: 'Fliki',
    description: 'Offers 2,000+ human-like AI voices for generating videos from blog posts or text',
    available: false,
  },
  veed: {
    id: 'veed',
    name: 'VEED.IO',
    description: 'Allows for creating animated and customized videos with voiceovers',
    available: false,
  },
};

const STORAGE_KEY = 'generation-provider';

export function getGenerationProvider(): GenerationProvider {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidProvider(stored)) {
      return stored as GenerationProvider;
    }
  } catch (error) {
    console.error('Failed to read generation provider from localStorage:', error);
  }
  return 'kling26';
}

function isValidProvider(value: string): boolean {
  return value === 'local' || 
         value === 'gemini' || 
         value === 'grok' || 
         value === 'runway' || 
         value === 'pictory' || 
         value === 'fliki' || 
         value === 'veed' ||
         value === 'kling26';
}

export function setGenerationProvider(provider: GenerationProvider): void {
  try {
    localStorage.setItem(STORAGE_KEY, provider);
  } catch (error) {
    console.error('Failed to save generation provider to localStorage:', error);
  }
}

export function isProviderAvailable(provider: GenerationProvider): boolean {
  return GENERATION_PROVIDERS[provider]?.available || false;
}
