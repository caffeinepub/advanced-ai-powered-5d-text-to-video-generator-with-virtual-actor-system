// Client-side emotion analysis provider settings

export type EmotionProvider = 'local' | 'gemini';

const STORAGE_KEY = 'emotion-analysis-provider';
const DEFAULT_PROVIDER: EmotionProvider = 'local';

export const EMOTION_PROVIDERS = {
  local: {
    id: 'local' as EmotionProvider,
    name: 'Local (Deterministic)',
    description: 'Fast, browser-based emotion detection using rule-based classification',
    available: true,
  },
  gemini: {
    id: 'gemini' as EmotionProvider,
    name: 'Google Gemini',
    description: 'AI-powered emotion analysis (Coming soon)',
    available: false,
  },
} as const;

/**
 * Get the currently selected emotion analysis provider
 */
export function getEmotionAnalysisProvider(): EmotionProvider {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'local' || stored === 'gemini')) {
      return stored as EmotionProvider;
    }
  } catch (error) {
    console.error('Failed to read emotion provider from localStorage:', error);
  }
  return DEFAULT_PROVIDER;
}

/**
 * Save the emotion analysis provider selection
 */
export function setEmotionAnalysisProvider(provider: EmotionProvider): void {
  try {
    localStorage.setItem(STORAGE_KEY, provider);
  } catch (error) {
    console.error('Failed to save emotion provider to localStorage:', error);
  }
}

/**
 * Check if a provider is available for use
 */
export function isProviderAvailable(provider: EmotionProvider): boolean {
  return EMOTION_PROVIDERS[provider].available;
}
