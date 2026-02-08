/**
 * Converts emotion analysis into EmotionTimeline format for virtual actor animation.
 */

import { EmotionTimeline } from '../backend';
import { EmotionAnalysis } from './sceneEmotionClassifier';

/**
 * Generate EmotionTimeline array from emotion analysis.
 * Always returns a valid array with at least one cue at time 0.
 */
export function generateEmotionTimeline(
  analysis: EmotionAnalysis,
  duration: number = 10
): EmotionTimeline[] {
  const timeline: EmotionTimeline[] = [];

  // Always add initial emotion cue at time 0
  timeline.push({
    time: 0,
    emotion: analysis.emotion,
    intensity: analysis.intensity,
  });

  // Add mid-point variation if duration is long enough
  if (duration > 5) {
    const midIntensity = Math.min(analysis.intensity * 1.2, 1.0);
    timeline.push({
      time: duration / 2,
      emotion: analysis.emotion,
      intensity: midIntensity,
    });
  }

  // Add end cue with slight decay
  if (duration > 2) {
    const endIntensity = Math.max(analysis.intensity * 0.8, 0.2);
    timeline.push({
      time: duration - 0.5,
      emotion: analysis.emotion,
      intensity: endIntensity,
    });
  }

  return timeline;
}

/**
 * Generate gesture cues based on emotion and energy.
 * Returns empty array if no gestures are appropriate.
 */
export function generateGestureCues(
  analysis: EmotionAnalysis,
  duration: number = 10
): Array<{ time: number; gesture: string }> {
  const gestures: Array<{ time: number; gesture: string }> = [];

  // Map emotions to gesture types
  const emotionGestures: Record<string, string[]> = {
    fear: ['recoil', 'defensive', 'retreat'],
    joy: ['wave', 'celebrate', 'clap'],
    calm: ['meditate', 'breathe', 'relax'],
    sadness: ['slump', 'sigh', 'look_down'],
    anger: ['point', 'fist', 'aggressive'],
    surprise: ['gasp', 'step_back', 'wide_eyes'],
    wonder: ['reach', 'look_up', 'explore'],
  };

  const availableGestures = emotionGestures[analysis.emotion] || [];
  
  if (availableGestures.length === 0) {
    return gestures;
  }

  // Add gestures based on energy level
  const gestureCount = analysis.energy === 'high' ? 3 : analysis.energy === 'medium' ? 2 : 1;
  const interval = duration / (gestureCount + 1);

  for (let i = 0; i < gestureCount && i < availableGestures.length; i++) {
    gestures.push({
      time: interval * (i + 1),
      gesture: availableGestures[i],
    });
  }

  return gestures;
}
