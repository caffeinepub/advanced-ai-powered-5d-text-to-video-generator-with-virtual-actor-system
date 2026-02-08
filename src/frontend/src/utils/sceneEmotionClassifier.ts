/**
 * Rules-based emotion classifier for scene text analysis.
 * Deterministic, browser-only classification with no network calls.
 */

export type Emotion = 'fear' | 'joy' | 'calm' | 'sadness' | 'anger' | 'surprise' | 'wonder';
export type Energy = 'low' | 'medium' | 'high';
export type Mood = 'dark' | 'neutral' | 'bright';

export interface EmotionAnalysis {
  emotion: Emotion;
  intensity: number; // 0.0 to 1.0
  energy: Energy;
  mood: Mood;
}

// Keyword patterns for emotion detection
const EMOTION_PATTERNS: Record<Emotion, RegExp[]> = {
  fear: [
    /\b(afraid|scared|terrified|frightened|horror|panic|dread|nightmare|danger|threat|monster|dark|shadow|creep)\b/i,
    /\b(anxious|nervous|worried|tense|uneasy|alarmed)\b/i,
  ],
  joy: [
    /\b(happy|joyful|delighted|cheerful|excited|thrilled|elated|celebrate|laugh|smile|fun|party)\b/i,
    /\b(wonderful|amazing|fantastic|great|awesome|brilliant)\b/i,
  ],
  calm: [
    /\b(calm|peaceful|serene|tranquil|quiet|still|gentle|soft|relaxed|soothing|meditative)\b/i,
    /\b(rest|ease|comfort|harmony|balance)\b/i,
  ],
  sadness: [
    /\b(sad|unhappy|depressed|melancholy|sorrowful|gloomy|miserable|lonely|cry|tears|grief)\b/i,
    /\b(loss|lost|empty|hopeless|despair)\b/i,
  ],
  anger: [
    /\b(angry|furious|enraged|mad|irritated|annoyed|frustrated|hostile|aggressive|rage)\b/i,
    /\b(fight|battle|war|conflict|attack|destroy)\b/i,
  ],
  surprise: [
    /\b(surprise|shocked|astonished|amazed|stunned|startled|unexpected|sudden|wow)\b/i,
    /\b(gasp|reveal|discover|appear)\b/i,
  ],
  wonder: [
    /\b(wonder|magical|mystical|enchanted|mysterious|curious|fascinating|awe|marvel)\b/i,
    /\b(dream|fantasy|imagination|explore|discover|beauty|magnificent)\b/i,
  ],
};

// Energy level patterns
const ENERGY_PATTERNS = {
  high: /\b(fast|quick|rapid|energetic|dynamic|vibrant|intense|explosive|rush|race|run|jump|burst)\b/i,
  low: /\b(slow|gentle|soft|quiet|still|calm|peaceful|rest|sleep|drift|float)\b/i,
};

// Mood patterns
const MOOD_PATTERNS = {
  dark: /\b(dark|night|shadow|black|gloomy|dim|dusk|twilight|sinister|ominous)\b/i,
  bright: /\b(bright|light|sunny|radiant|glowing|luminous|dawn|day|shine|sparkle|golden)\b/i,
};

/**
 * Classify scene text into emotion, intensity, energy, and mood.
 * Fully deterministic with no network calls.
 */
export function classifySceneEmotion(text: string): EmotionAnalysis {
  // Handle empty or very short text
  if (!text || text.trim().length < 3) {
    return {
      emotion: 'calm',
      intensity: 0.3,
      energy: 'low',
      mood: 'neutral',
    };
  }

  const lowerText = text.toLowerCase();

  // Count matches for each emotion
  const emotionScores: Record<Emotion, number> = {
    fear: 0,
    joy: 0,
    calm: 0,
    sadness: 0,
    anger: 0,
    surprise: 0,
    wonder: 0,
  };

  // Calculate emotion scores
  for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        emotionScores[emotion as Emotion] += matches.length;
      }
    }
  }

  // Find dominant emotion
  let dominantEmotion: Emotion = 'calm';
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion as Emotion;
    }
  }

  // Calculate intensity based on match count and text length
  const textLength = text.split(/\s+/).length;
  const rawIntensity = Math.min(maxScore / Math.max(textLength / 10, 1), 1.0);
  
  // Boost intensity for certain emotions
  const intensityBoost = ['fear', 'anger', 'surprise'].includes(dominantEmotion) ? 1.2 : 1.0;
  const intensity = Math.min(Math.max(rawIntensity * intensityBoost, 0.3), 1.0);

  // Determine energy level
  let energy: Energy = 'medium';
  const highEnergyMatch = lowerText.match(ENERGY_PATTERNS.high);
  const lowEnergyMatch = lowerText.match(ENERGY_PATTERNS.low);

  if (highEnergyMatch && highEnergyMatch.length > (lowEnergyMatch?.length || 0)) {
    energy = 'high';
  } else if (lowEnergyMatch && lowEnergyMatch.length > (highEnergyMatch?.length || 0)) {
    energy = 'low';
  } else {
    // Default energy based on emotion
    if (['fear', 'anger', 'surprise'].includes(dominantEmotion)) {
      energy = 'high';
    } else if (['calm', 'sadness'].includes(dominantEmotion)) {
      energy = 'low';
    }
  }

  // Determine mood
  let mood: Mood = 'neutral';
  const darkMatch = lowerText.match(MOOD_PATTERNS.dark);
  const brightMatch = lowerText.match(MOOD_PATTERNS.bright);

  if (darkMatch && darkMatch.length > (brightMatch?.length || 0)) {
    mood = 'dark';
  } else if (brightMatch && brightMatch.length > (darkMatch?.length || 0)) {
    mood = 'bright';
  } else {
    // Default mood based on emotion
    if (['fear', 'sadness', 'anger'].includes(dominantEmotion)) {
      mood = 'dark';
    } else if (['joy', 'wonder'].includes(dominantEmotion)) {
      mood = 'bright';
    }
  }

  return {
    emotion: dominantEmotion,
    intensity: Number(intensity.toFixed(2)),
    energy,
    mood,
  };
}

/**
 * Get duration multiplier based on emotion.
 * Maps emotion to timing bias for scene duration.
 */
export function getEmotionDurationMultiplier(emotion: Emotion): number {
  const multipliers: Record<Emotion, number> = {
    calm: 1.3,
    wonder: 1.2,
    joy: 1.1,
    sadness: 1.1,
    fear: 0.8,
    anger: 0.7,
    surprise: 0.6,
  };

  return multipliers[emotion] || 1.0;
}

/**
 * Get visual prompt modifiers based on emotion and mood.
 * Used for scene rendering adjustments.
 */
export function getEmotionVisualModifiers(emotion: Emotion, mood: Mood) {
  const emotionModifiers: Record<Emotion, { lighting: number; saturation: number; contrast: number }> = {
    fear: { lighting: 0.4, saturation: 0.6, contrast: 1.3 },
    joy: { lighting: 1.2, saturation: 1.2, contrast: 0.9 },
    calm: { lighting: 0.8, saturation: 0.8, contrast: 0.7 },
    sadness: { lighting: 0.6, saturation: 0.5, contrast: 0.8 },
    anger: { lighting: 1.1, saturation: 1.3, contrast: 1.4 },
    surprise: { lighting: 1.3, saturation: 1.0, contrast: 1.2 },
    wonder: { lighting: 1.1, saturation: 1.1, contrast: 1.0 },
  };

  const moodModifiers: Record<Mood, { lightingBoost: number; fogDensity: number }> = {
    dark: { lightingBoost: 0.7, fogDensity: 1.3 },
    neutral: { lightingBoost: 1.0, fogDensity: 1.0 },
    bright: { lightingBoost: 1.3, fogDensity: 0.7 },
  };

  return {
    emotion: emotionModifiers[emotion],
    mood: moodModifiers[mood],
  };
}

/**
 * Get music synthesis parameters based on emotion and energy.
 */
export function getEmotionMusicParameters(emotion: Emotion, energy: Energy) {
  const baseFrequencies: Record<Emotion, number> = {
    fear: 180,
    joy: 440,
    calm: 220,
    sadness: 200,
    anger: 160,
    surprise: 500,
    wonder: 330,
  };

  const energyMultipliers: Record<Energy, number> = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
  };

  return {
    baseFrequency: baseFrequencies[emotion] * energyMultipliers[energy],
    tempo: energy === 'high' ? 1.5 : energy === 'low' ? 0.7 : 1.0,
    decay: emotion === 'calm' ? 8 : emotion === 'surprise' ? 2 : 5,
  };
}
