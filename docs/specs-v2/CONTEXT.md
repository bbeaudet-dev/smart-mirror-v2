# Context for v2 Development

This document provides essential context for developing Smart Mirror v2. The specs cover **what to build**; this covers **how the codebase works** and **existing patterns to follow**.

## Quick Start

1. **Read the specs**: Start with `docs/specs-v2/overview.md` then dive into individual feature specs
2. **Explore the codebase**: Familiarize yourself with the structure below
3. **Understand existing patterns**: See "Key Implementation Patterns" section

## Project Structure

```
smart-mirror-v2/
├── client-mirror/          # React + Electron frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── MirrorInterface.tsx      # Main interface
│   │   │   ├── modules/                 # Feature modules (weather, news, time, etc.)
│   │   │   │   ├── messages/
│   │   │   │   │   └── MessagePanel.tsx  # CURRENT: Only shows AI analysis messages
│   │   │   │   └── debug/               # Debug panel (Ctrl+Shift+D)
│   │   ├── hooks/
│   │   │   ├── useMotionDetection.ts   # Motion detection logic
│   │   │   └── useWebcam.ts            # Webcam access
│   │   └── services/
│   │       ├── apiClient.js             # API communication
│   │       └── speechService.ts        # TTS client-side wrapper
│   └── public/
├── server/                 # Node.js + Express backend
│   ├── routes/
│   │   ├── ai.js                        # AI analysis endpoints
│   │   ├── preGeneratedAudio.js        # Pre-generated audio routes
│   │   └── tts.js                       # TTS generation
│   ├── services/
│   │   ├── preGeneratedAudioService.js # Manages audio library
│   │   ├── ttsService.js                # OpenAI TTS wrapper
│   │   └── promptService.js            # AI personality prompts
│   └── data/
│       └── audio-pre-generated/        # Audio files library
└── docs/
    ├── specs-v2/                       # V2 feature specs
    └── mermaid/                        # Architecture diagrams
```

## Current State (v1)

### What's Working

**Motion Detection Flow:**
1. Motion detected → Plays pre-generated motion response (audio only, no text)
2. Stabilization period → Person detection
3. If person detected → Plays welcome response (audio only, no text)
4. AI analysis starts → Generates TTS → Plays with text display
5. Sendoff response → Plays after AI completes (audio only, no text)

**Message Display:**
- Only the main AI analysis message shows text (`MessagePanel.tsx`)
- Motion/welcome/sendoff messages are audio-only
- MessagePanel has `type` prop: `'ai-response' | 'motivation' | 'outfit-analysis' | 'general'`

**Audio System:**
- Pre-generated audio: `server/data/audio-pre-generated/` (motion, welcome, sendoff)
- TTS generation: OpenAI API via `ttsService.js`
- Audio caching: Both pre-generated and TTS are cached
- Voice selection: Based on personality (ash, fable, onyx, shimmer, etc.)

**Motion Detection:**
- Implemented in `useMotionDetection.ts` hook
- Frame differencing approach
- Triggers on threshold + duration
- Calls `/api/ai/automatic` for analysis

### What Needs Work (v2)

- **Calendar**: Currently returns mock data (`server/services/calendarService.js`)
- **Clothing Detection**: Roboflow integration exists but needs re-implementation
- **Voice Commands**: Not implemented yet
- **Routines**: Not implemented yet
- **Insights**: Not implemented yet
- **Power Management**: Not implemented yet

## Key Implementation Patterns

### Message Display Pattern

**Current (AI messages only):**
```typescript
// In useMotionDetection.ts or wherever
onAiMessage?.(text, 'ai-response');
```

**V2 Goal: Display ALL messages**
- Motion, welcome, AI, sendoff should all show text
- Use same `MessagePanel` component with appropriate `type`
- Hook into audio playback events to sync text display

**Reference:** `client-mirror/src/components/modules/messages/MessagePanel.tsx`

### Audio Playback Pattern

**Pre-generated audio:**
```typescript
// Pattern used in useMotionDetection.ts
const response = await fetch(`/api/pre-generated-audio/${type}`);
const audioBlob = await response.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
await audio.play();
audio.onended = () => { /* cleanup */ };
```

**TTS audio:**
```typescript
// Pattern for AI responses
const response = await fetch('/api/tts/generate', { method: 'POST', body: JSON.stringify({ text, personality }) });
const audioBlob = await response.blob();
// ... same playback pattern
```

**V2 Enhancement:** Add text display synchronized with `audio.onended` events

### Motion Detection Pattern

**Current flow:**
- `useMotionDetection` hook monitors webcam frames
- On motion → `playMotionResponse()` → stabilization → `playWelcomeResponse()` → `handleAutomaticAnalysis()`

**Key files:**
- `client-mirror/src/hooks/useMotionDetection.ts` (main logic)
- `client-mirror/src/components/MirrorInterface.tsx` (uses the hook)

### State Management

- React hooks (`useState`, `useEffect`, `useCallback`)
- Props drilling for callbacks (`onAiMessage`, `onAiLoading`)
- No global state library (consider adding for v2 if complexity grows)

### API Communication

- `apiClient.js` handles base URL resolution
- Routes defined in `server/routes/`
- Services in `server/services/` contain business logic

**Pattern:**
```javascript
// client-mirror/src/services/apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

// Usage
fetch(`${API_BASE_URL}/api/endpoint`);
```

## Key Files to Reference

### For Unified Messages & Indicators
- `client-mirror/src/components/modules/messages/MessagePanel.tsx` - Message display component
- `client-mirror/src/hooks/useMotionDetection.ts` - Audio playback and motion logic
- `client-mirror/src/services/speechService.ts` - TTS client wrapper

### For Routines & Voice
- `client-mirror/src/hooks/useWebcam.ts` - Webcam access (also has microphone)
- `server/routes/preGeneratedAudio.js` - Audio endpoint patterns

### For Calendar & Insights
- `server/services/calendarService.js` - Currently returns mock data
- `server/services/dataService.js` - Example of data aggregation
- `client-mirror/src/components/modules/CalendarPanel.tsx` - UI component (uses mock)

### For Event Tailoring
- `server/services/preGeneratedAudioService.js` - Audio library management
- `server/routes/preGeneratedAudio.js` - Audio API patterns
- `server/data/audio-pre-generated/` - File structure

### For Roboflow
- `docs/specs-v1/ROBOFLOW-SPEC.md` - Previous implementation attempt
- `server/services/roboflowService.js` - May exist, check if it needs updating

## Hardware Context

- **Raspberry Pi 5** (8GB)
- **Inland iC800 webcam** (1080p, built-in microphone)
- **ARZOPA 16" Monitor** (portrait orientation)
- **Two-way acrylic panel** (mirror overlay)

**Note:** Hardware is already set up; focus on software features.

## Environment Variables

```env
# Root .env
VITE_API_URL=http://raspberrypi:5005

# server/.env
OPENAI_API_KEY=...
WEATHER_API_KEY=...
NEWS_API_KEY=...
# Google Calendar credentials (to be restored)
```

## Testing Approach

- Debug panel accessible via `Ctrl+Shift+D`
- Manual motion detection testing
- Local development: `npm run dev`
- Production: `npm start`

## Common Gotchas

1. **Audio format**: Server returns Opus, browser handles it
2. **Message timing**: Currently only AI message displays; need to add others
3. **Voice selection**: Happens per-interaction, stored in refs
4. **Motion sensitivity**: Tuned in `useMotionDetection.ts` options
5. **Calendar**: Mock data - need to restore Google Calendar auth

## Next Steps for New Agent

1. **Read specs**: `docs/specs-v2/overview.md` first, then individual specs
2. **Understand flow**: Review `docs/mermaid/voice-system.md` and `docs/mermaid/motion-detection-flow.md`
3. **Pick a spec**: Start with "Unified Messages & Indicators" - it's foundational
4. **Reference existing**: Look at how AI messages currently work, extend to other message types
5. **Test incrementally**: Use debug panel to test each feature

## Questions to Resolve

- See "Open Questions" section in each spec
- Some architectural decisions may need clarification during implementation

---

**Remember:** The specs define **what** to build. This context explains **how** the codebase currently works so you can build on existing patterns rather than reinventing the wheel.

