# Unified Messages & Status Indicators (v2)

## Goal

Display all spoken messages with consistent on-screen text and add clear motion/thinking/speaking indicators.

## Requirements

- Show synchronized text for: motion, welcome, main AI, sendoff.
- Use a single message queue/display component (existing animations/styles).
- Auto-dismiss aligned to audio end or max timeout.
- Indicators:
  - Motion: visible while thresholds met; hide immediately when not.
  - Thinking/Loading: visible while generating/fetching text.
  - Speaking: visible while audio plays; hide on `ended`.

## Technical Notes

- Hook message display to the same events that start audio (pre-generated and TTS).
- Centralize playback events in one controller to toggle indicators.
- Non-intrusive overlay; remains readable with other panels.

## Milestones

1. Wire motion/welcome/sendoff to text display.
2. Add motion indicator tied to detection hook thresholds.
3. Add thinking indicator bound to AI request lifecycle.
4. Add speaking indicator bound to audio element lifecycle.
