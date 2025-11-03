# Morning/Evening Routines & Voice Commands (v2)

## Goals

- Time-of-day routines panel with checkable items.
- Basic voice commands using available microphone (Inland iC800).

## Requirements

- Time windows configurable (e.g., Morning 5:00–11:00, Evening 17:00–23:00).
- Display routines list for active window; persist completion until window ends.
- Voice command MVP:
  - Start/stop listening via UI toggle or push-to-talk.
  - Commands: trigger analysis, read routines, switch personality/voice, change preset, regenerate messages.
- Wake word optional; can be added later.

## Technical Notes

- Use Web Speech API for MVP; plan server fallback later.
- Mic source: iC800 built-in microphone if available; handle permissions gracefully.
- Intent parsing: simple keyword/phrase mapping initially.

## Milestones

1. Time window detection and routines panel UI.
2. Persist routine completion state per window.
3. Voice listening toggle + basic command routing.
4. Optional: voice readout of key routines at first motion in window.
