# useMotionDetection.ts Refactoring Analysis

## Current Issues

### 1. **onSpeakingChange Callback**

**Purpose**: Notifies parent component (`MirrorInterface`) when speaking state changes so `StatusIndicators` can update.

**Flow**:

```
useMotionDetection (manages speaking state)
  ↓ onSpeakingChange(true/false)
MirrorInterface (receives callback)
  ↓ passes to StatusIndicators
StatusIndicators (displays speaking icon)
```

**Why needed**: Speaking state is managed inside the hook, but the UI indicator is in the parent component. This is a valid pattern for lifting state up.

### 2. **Refs Usage - Good Practice vs Code Smell**

#### ✅ **Good Practice (Appropriate Refs)**

- `intervalRef`, `canvasRef`, `ctxRef` - Store DOM refs and intervals (non-reactive values)
- `previousFrameRef`, `motionStartTimeRef` - Avoid unnecessary re-renders for frequent updates
- `currentInteractionVoiceRef` - Track voice without triggering re-renders
- `isMotionDetectedRef` - Prevents circular dependency in `checkMotion`

**Why refs here**: These are values that don't need to trigger re-renders, or are accessed in callbacks that might have stale closures.

#### ⚠️ **Code Smell (Could Be Better)**

- `messageQueueRef` - Used to avoid stale closures in async callbacks (`audio.onended`)
- `isProcessingQueueRef` - Used to track queue processing state without triggering re-renders

**Why refs here**: These are accessed inside async callbacks (`audio.onended`) that are set after the component renders. If we used state, we'd have stale closure issues.

**Better approach**: Extract queue logic into separate hook (`useAudioQueue`) that manages its own state.

### 3. **playSendoffResponseRef - Why Needed?**

**Circular Dependency Problem**:

```typescript
// processMessageQueue is defined first
const processMessageQueue = useCallback(async () => {
  // ...
  if (message.type === "ai-response") {
    playSendoffResponse(); // ❌ playSendoffResponse doesn't exist yet!
  }
}, [onMessage, onSpeakingChange]);

// playSendoffResponse is defined later
const playSendoffResponse = useCallback(async () => {
  // ...
}, [queueMessage]);
```

**Solution**: Store function in ref after it's defined:

```typescript
const playSendoffResponseRef = useRef<(() => Promise<void>) | null>(null);

// Later, after playSendoffResponse is defined:
useEffect(() => {
  playSendoffResponseRef.current = playSendoffResponse;
}, [playSendoffResponse]);

// In processMessageQueue:
if (message.type === "ai-response" && playSendoffResponseRef.current) {
  playSendoffResponseRef.current();
}
```

**Why not for motion/welcome**: They're only queued, never called from within the queue processor. Only `playSendoffResponse` is called from within the queue processor.

### 4. **Separation of Concerns - Current Issues**

The `useMotionDetection.ts` file is **549 lines** and handles:

1. **Motion Detection** (~200 lines)

   - Frame differencing
   - Threshold checking
   - Motion state management

2. **Message Queueing** (~70 lines)

   - Queue management
   - Sequential playback
   - State synchronization

3. **Audio Playback** (~100 lines)

   - API calls to fetch audio+text
   - Base64 decoding
   - Audio element creation

4. **Interaction Flow Orchestration** (~150 lines)

   - Motion → Motion Response → Welcome → AI → Sendoff
   - State management across flow
   - Timing coordination

5. **State Management** (~30 lines)
   - Multiple useState hooks
   - Multiple useRef hooks
   - Callback props

## Proposed Refactoring

### Option 1: Extract Hooks (Recommended)

Separate into focused hooks:

1. **`useMotionDetection`** - Pure motion detection

   - Frame processing
   - Threshold checking
   - Motion state only

2. **`useAudioQueue`** - Message queue management

   - Queue operations
   - Sequential playback
   - Speaking state

3. **`useAudioPlayback`** - Audio fetching and preparation

   - API calls
   - Audio element creation
   - Base64 decoding

4. **`useInteractionFlow`** - Orchestrates the flow
   - Combines motion detection + audio queue + playback
   - Manages interaction lifecycle
   - Handles timing

### Option 2: Keep Current Structure, Extract Queue

Minimal refactor - just extract queue logic:

- Keep motion detection in `useMotionDetection`
- Extract `useAudioQueue` for queue management
- Use both hooks in `DebugPanel`

## Recommendations

1. **Keep `onSpeakingChange`** - This is good pattern for lifting state
2. **Extract queue logic** - Use `useAudioQueue` hook (already created)
3. **Extract audio fetching** - Use `useAudioPlayback` hook (already created)
4. **Simplify `useMotionDetection`** - Focus only on motion detection
5. **Consider `useInteractionFlow`** - Orchestrate the full flow in one place

## Benefits of Refactoring

- ✅ **Better testability** - Each hook can be tested independently
- ✅ **Reusability** - Audio queue can be used elsewhere
- ✅ **Readability** - Each file has single responsibility
- ✅ **Maintainability** - Easier to find and fix bugs
- ✅ **No circular dependencies** - Cleaner dependency graph

## Migration Path

1. Create new hooks (`useAudioQueue`, `useAudioPlayback`) ✅ Done
2. Update `useMotionDetection` to use new hooks
3. Test thoroughly
4. Remove old code
5. Update `DebugPanel` if needed
