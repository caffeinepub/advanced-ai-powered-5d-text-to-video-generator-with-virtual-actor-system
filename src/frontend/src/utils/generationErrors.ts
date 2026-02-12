// Error normalization for user-friendly generation error messages

export interface NormalizedError {
  summary: string;
  technicalHint: string;
}

export function normalizeGenerationError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // MediaRecorder errors
    if (message.includes('mediarecorder') || message.includes('recording')) {
      return {
        summary: 'Video recording failed. Please try again.',
        technicalHint: 'MediaRecorder API error - check browser compatibility',
      };
    }

    // Canvas errors
    if (message.includes('canvas')) {
      return {
        summary: 'Failed to capture video scene. Please refresh and try again.',
        technicalHint: 'Canvas capture error - scene may not be ready',
      };
    }

    // Network/upload errors
    if (message.includes('network') || message.includes('fetch') || message.includes('upload')) {
      return {
        summary: 'Network error during upload. Please check your connection.',
        technicalHint: 'Network connectivity issue',
      };
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return {
        summary: 'Authentication required. Please log in and try again.',
        technicalHint: 'User not authenticated',
      };
    }

    // Backend errors
    if (message.includes('actor') || message.includes('canister')) {
      return {
        summary: 'Backend service error. Please try again in a moment.',
        technicalHint: 'Backend actor/canister error',
      };
    }

    // Browser support errors
    if (message.includes('not supported')) {
      return {
        summary: 'Your browser does not support video generation. Try Chrome or Firefox.',
        technicalHint: 'Browser API not supported',
      };
    }

    // Generic error with message
    return {
      summary: `Generation failed: ${error.message}`,
      technicalHint: 'See console for details',
    };
  }

  // Unknown error type
  return {
    summary: 'An unexpected error occurred. Please try again.',
    technicalHint: 'Unknown error type',
  };
}
