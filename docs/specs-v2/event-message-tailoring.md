# Event & Message Tailoring Interface (v2)

## Goal

Generate and switch pre-generated audio/text presets for events or time-of-day without code changes.

## Requirements

- Flow (CLI or voice): choose context → propose texts → confirm → generate TTS → store.
- Storage: `server/data/audio-pre-generated/<preset>/<type>/` + metadata (JSON).
- Preset switching updates active mapping at runtime.
- Re-generate per-voice/personality; keep version history.

## Technical Notes

- Reuse existing preGeneratedAudio routes/services; add preset parameter.
- Confirmation step before TTS to avoid churn; show sample count/duration.

## Milestones

1. CLI wizard for preset creation and switching.
2. Metadata schema and library layout.
3. Integration into playback selection.
4. Optional: voice-driven preset creation.
