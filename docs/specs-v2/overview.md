# Smart Mirror v2 Specification (Concise)

## Purpose

Deliver a cohesive v2 focused on: unified message display, richer status indicators, routines, voice commands, calendar fix, an Insights engine, power management, event-tailored messaging, and revived clothing detection.

## Scope & Outcomes

- Unified display of all spoken messages on `MirrorInterface` with consistent styling/behavior.
- Realtime UI indicators for motion, loading/thinking, and speaking.
- Morning/Evening routines with time-of-day aware content.
- Voice command support (mic via Inland iC800) to trigger actions and simple setup flows.
- Restore Google Calendar (replace mock) with OAuth/device auth and caching.
- Insights engine: periodic multi-signal analysis (AI) producing actionable tips.
- Power management on Raspberry Pi: idle strategies and motion-activated wake.
- Event/message tailoring interface to generate and switch pre-generated audio sets.
- Roboflow clothing detection re-implementation with a simpler, documented path.

## Functional Requirements

### 1) Unified Message Display

- Show on-screen text synchronized with audio for ALL message types:
  - Motion (immediate) message
  - Welcome (post-stabilization) message
  - Main AI analysis message
  - Sendoff/goodbye message
- Reuse the existing message component/animation and queue sequencing.
- Dismiss/auto-fade rules aligned with audio end events and timeouts.

### 2) Status Indicators

- Motion indicator: visible while thresholds are met; hides immediately when not.
- Thinking/Loading indicator: visible while AI text is being created/fetched.
- Speaking indicator: visible while audio is playing; ends on audio `ended`.
- Indicators must be unobtrusive, always-on-top within the debug-safe area.

### 3) Morning/Evening Routines

- Determine time-of-day locally; select routine list accordingly (configurable ranges).
- Display routine items panel; allow per-item completion highlighting.
- Optional: voice cue to read key items on first motion detection of the period.

### 4) Voice Commands

- Hardware: Inland iC800 webcam includes a built-in microphone; use it if present.
- MVP: wake word optional; start/stop via UI/debug toggle; push-to-talk acceptable initially.
- Commands: switch mode, trigger analysis, read routines, select voice/personality, swap event preset, regenerate messages.
- Local recognition (Web Speech API) with server fallback later if needed.

### 5) Calendar Integration (Fix)

- Replace mock with live Google Calendar via OAuth (or device flow on Pi).
- Server caching (in-memory + file cache) with ETag/If-Modified-Since where possible.
- Normalize events for Insights and Routines; support primary calendar first.

### 6) Insights Engine

- Inputs: weather, location, date/time, calendar, clothing detection (Roboflow), recent interactions.
- Cadence: run every 5–30 minutes (configurable) and on key triggers (e.g., first morning motion).
- Output: short, actionable recommendation string; surfaced in a dedicated Insights panel and optionally read aloud.
- Safety: rate-limit AI calls; skip when inputs unchanged since last run.

### 7) Power Management (Raspberry Pi)

- Screen power: enable DPMS/screen blanking after idle; wake on motion.
- Camera duty cycle: reduce FPS/resolution when idle; stop capture after idle window.
- Service throttling: pause heavy AI/Insights when idle; resume on motion.
- Scheduling: window heavy work to defined hours; cron-based wake windows if desired.
- Networking/battery: Wi‑Fi power save on; log CPU/temp; provide quick restart commands.

### 8) Event/Message Tailoring Interface

- CLI or voice-driven flow to select event/time-of-day preset and generate messages.
- Steps: choose context → propose texts → confirm → generate TTS → store as named preset.
- Storage: versioned library under `server/data/audio-pre-generated/<preset>/<type>/` with metadata.
- Switching presets updates active mapping without code changes.

### 9) Roboflow Clothing Detection (Re-introduce)

- Start with a hosted public model for apparel/attributes; no custom training required initially.
- Abstraction layer: single `detectClothing(frame)` returning normalized attributes and confidences.
- Privacy/perf: low-res captures; sample at modest cadence; cache last N results.
- Document how to swap models and where to add keys.

## Non-Functional Requirements

- Performance: indicators update <100ms; motion detection <50ms CPU budget target.
- Reliability: graceful degradation if camera/AI unavailable; clear on-screen status.
- Configurability: .env flags for Insights cadence, DPMS, voice, routines windows, presets.
- Accessibility: high-contrast text; minimal motion animations; user-adjustable durations.

## API & Data Notes

- Calendar: `/api/calendar/events` live fetch + cached; ISO timestamps; next-24h, next-7d filters.
- Insights: `/api/insights/run` (manual) + scheduled job; returns { text, sources, createdAt }.
- Messages: `/api/pre-generated-audio/:type` for motion/welcome/sendoff; `/api/tts/generate` for dynamic.
- Clothing: `/api/vision/clothing` (optional server proxy) or direct client call if permitted.

## Implementation Plan (Milestones)

1. Unified messages + indicators
   - Wire motion/welcome/sendoff to existing message display and audio events
   - Add motion/thinking/speaking indicators
2. Routines + Voice (MVP)
   - Time-of-day routines display; basic voice commands with Web Speech API
3. Calendar restore + Insights (baseline)
   - Live Google Calendar with caching; periodic Insights using available signals
4. Power management
   - DPMS/screen blanking; camera/service throttling; idle/resume hooks
5. Event tailoring flow
   - CLI/voice wizard to generate/confirm/store presets; switch active preset at runtime
6. Roboflow integration
   - Plug-in hosted model; normalized attributes; docs for swapping models

## Open Questions

- Wake word vs. push-to-talk preference on Pi hardware?
- Minimum acceptable latency before speaking begins (vs. waiting for text sync)?
- Insights voice: always spoken vs. only on first daily motion?
- Calendar auth UX on headless Pi (device code flow vs. QR-code link)?

## References

- Motion detection spec (`docs/specs/motion-detection-spec.md`)
- Voice system diagram (`docs/mermaid/voice-system.md`)
- Server audio routes and pre-generated library (`server/routes/preGeneratedAudio.js`, `server/services/preGeneratedAudioService.js`)
- Pi setup + hardware (`PI-SETUP.md`)
