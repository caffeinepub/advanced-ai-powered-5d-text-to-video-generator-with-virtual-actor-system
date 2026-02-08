# Specification

## Summary
**Goal:** Integrate a deterministic, rules-based emotion analysis into the Create preview flow to generate and persist an emotion timeline and apply emotion-based timing/parameter biasing—entirely in the frontend with no external calls.

**Planned changes:**
- Add a frontend utility that deterministically classifies scene text into a strict schema: {emotion, intensity, energy, mood}, with intensity clamped to [0.0, 1.0] and enums constrained to allowed values.
- Replace the Create preview pipeline’s backend emotion-timeline generation dependency with a frontend-generated EmotionTimeline[] and pass it into the existing 3D scene/virtual actor preview.
- Apply an emotion-based duration multiplier to ScenePreview duration calculations (calm×1.3, wonder×1.2, joy×1.1, sadness×1.1, fear×0.8, anger×0.7, surprise×0.6; default×1.0) and deterministically bias at least one existing generation/rendering step using energy and/or mood.
- Persist the detected emotion analysis object alongside the existing emotions timeline in the scene configuration JSON payload saved via addSceneConfig, without requiring backend schema changes.

**User-visible outcome:** In the Create preview, entering different scene text deterministically changes the detected emotion, drives the avatar’s facial animation timeline, adjusts scene timing, and saves the emotion analysis with the scene so it remains viewable in the library.
