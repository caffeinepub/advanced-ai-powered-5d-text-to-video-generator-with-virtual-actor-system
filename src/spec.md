# Specification

## Summary
**Goal:** Let users generate and watch a short “sample preview” from the current prompt before choosing to run the existing full clip generation and download flow.

**Planned changes:**
- Add a “Preview sample” action in the Create flow that generates a short preview clip from the current prompt and plays it in the existing preview player area.
- Ensure preview generation is ephemeral on the frontend (no persistence to the user’s library) and does not trigger backend mutations that create saved media records.
- Add/adjust a distinct “Generate full clip” action that runs the existing full pipeline (including Internet Identity gating, saving to the library, and enabling download).
- Update Create UI state handling so preview/full generation cannot be triggered simultaneously, both show consistent in-progress/disabled states, and changing the prompt invalidates/resets any previously generated preview playback.

**User-visible outcome:** Users can click “Preview sample” to quickly view a short clip from their prompt, then (optionally) click “Generate full clip” to run the normal saved generation flow and download the completed full clip.
