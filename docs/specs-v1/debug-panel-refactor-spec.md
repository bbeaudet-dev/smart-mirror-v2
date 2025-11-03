# Debug Panel Refactor & Architecture Reorganization

## Overview

The DebugPanel has grown to handle core application logic instead of just debugging functionality. This spec outlines the refactoring to separate concerns and create a proper architecture.

## Current Problems

- DebugPanel handles motion detection logic, AI analysis, webcam management, and audio playback
- Core application logic mixed with debugging functionality
- Poor separation of concerns
- Difficult to test and maintain

## Target Architecture

### Frontend Structure

```
client-mirror/src/
├── hooks/
│   ├── useMotionDetection.ts (existing, enhanced)
│   ├── useAiAnalysis.ts (new)
│   ├── useAudioPlayback.ts (new)
│   └── useWebcam.ts (existing, enhanced)
├── managers/ (new)
│   └── conversationManager.ts
├── components/
│   ├── MirrorInterface.tsx (orchestrates services)
│   ├── modules/
│   │   ├── debug/
│   │   │   └── DebugPanel.tsx (display only)
│   │   └── motion-detection/ (new)
│   │       └── MotionStatus.tsx (moved from debug)
└── services/
    └── apiClient.js (existing, enhanced)
```

### Backend Structure

```
server/
├── services/
│   ├── motionDetectionService.js (new, if needed)
│   └── conversationFlowService.js (new, if needed)
└── routes/
    └── motionDetection.js (new, if needed)
```

## Phase 1: Create New Hooks

### 1.1 useAiAnalysis Hook

**File**: `client-mirror/src/hooks/useAiAnalysis.ts`

**Responsibilities**:

- Handle automatic AI analysis logic
- Manage analysis state (loading, error, results)
- Coordinate with API client for analysis requests
- Provide manual analysis triggers for debugging

**Interface**:

```typescript
interface UseAiAnalysisReturn {
  isAnalyzing: boolean;
  analysisResult: string | null;
  error: string | null;
  handleAutomaticAnalysis: (imageFile: File) => Promise<void>;
  handleManualAnalysis: (type: AnalysisType, imageFile: File) => Promise<void>;
  resetAnalysis: () => void;
}
```

### 1.2 useAudioPlayback Hook

**File**: `client-mirror/src/hooks/useAudioPlayback.ts`

**Responsibilities**:

- Manage pre-generated audio playback
- Handle audio lifecycle (play, stop)
- Coordinate motion and welcome audio responses
- Provide audio status for debugging

**Interface**:

```typescript
interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  currentAudio: string | null;
  playMotionResponse: () => Promise<void>;
  playWelcomeResponse: () => Promise<void>;
  stopAudio: () => void;
}
```

## Phase 2: Enhance Existing Hooks

### 2.1 Enhance useMotionDetection Hook

**File**: `client-mirror/src/hooks/useMotionDetection.ts`

**Enhancements**:

- Add motion level history tracking
- Add motion event callbacks
- Improve reset functionality
- Add configuration management

### 2.2 Enhance useWebcam Hook

**File**: `client-mirror/src/hooks/useWebcam.ts`

**Enhancements**:

- Add frame capture utilities
- Add video element management
- Add webcam configuration
- Add error recovery

## Phase 3: Create Motion Detection Components

### 3.1 Motion Detection Module

**Directory**: `client-mirror/src/components/modules/motion-detection/`

**Components**:

- `MotionStatus.tsx` (moved from debug)
- `MotionControls.tsx` (if needed)
- `MotionVisualizer.tsx` (if needed)

## Phase 4: Refactor DebugPanel

### 4.1 Remove Core Logic

**Remove from DebugPanel**:

- Motion detection logic (useEffect for three-stage flow)
- AI analysis logic (handleAutomaticAnalysis)
- Audio playback logic (playMotionResponse, playWelcomeResponse)
- Webcam management logic
- Pre-generated response loading

### 4.2 Keep Debug Functionality

**Keep in DebugPanel**:

- Motion status display
- Analysis status display
- Manual test buttons
- Debug image capture (if still needed)
- Configuration toggles

### 4.3 Simplify Interface

**New DebugPanel Interface**:

```typescript
interface DebugPanelProps {
  motionStatus: MotionStatus;
  analysisStatus: AnalysisStatus;
  audioStatus: AudioStatus;
  onManualTest: (testType: TestType) => void;
  onToggleConfig: (configType: ConfigType) => void;
}
```

## Phase 5: Update MirrorInterface

### 5.1 Orchestrate Services

**Responsibilities**:

- Initialize and coordinate all hooks
- Manage video element for motion detection
- Handle service communication
- Manage application state

### 5.2 Service Coordination

**Pattern**: Direct function calls between services

- MirrorInterface calls hook functions directly
- Hooks communicate through callbacks and state
- No complex event system initially

## Phase 6: Backend Services (If Needed)

### 6.1 Motion Detection Service

**File**: `server/services/motionDetectionService.js`

**Responsibilities**:

- Process motion detection data
- Store motion detection history
- Provide motion analytics

### 6.2 Conversation Service

**File**: `server/services/conversationService.js`

**Responsibilities**:

- Manage conversation state
- Coordinate between motion, audio, and AI services
- Handle conversation flow logic

## Implementation Phases

### Phase 1: Foundation

1. Create `useAiAnalysis` hook
2. Create `useAudioPlayback` hook
3. Test hooks in isolation

### Phase 2: Motion Detection

1. Enhance `useMotionDetection` hook
2. Create motion detection components
3. Move motion logic out of DebugPanel

### Phase 3: DebugPanel Cleanup

1. Remove core logic from DebugPanel
2. Simplify DebugPanel interface
3. Update DebugPanel to use new hooks

### Phase 4: Integration

1. Update MirrorInterface to orchestrate services
2. Test full integration
3. Fix any issues

### Phase 5: Backend

1. Create backend services
2. Add backend routes
3. Integrate with frontend

## Testing Strategy

- Test each hook in isolation
- Test component communication
- Test full motion detection flow
- Maintain debug functionality throughout

## Success Criteria

- Motion detection works as before
- AI analysis triggers correctly
- Audio responses play properly
- DebugPanel only displays information
- Clear separation of concerns
- No performance regression

## Risk Mitigation

- Implement changes incrementally
- Test each phase thoroughly
- Keep existing functionality working
- Start with simplest approach
- Avoid over-engineering



NEW THINGS TO ADD:
- Clean up unused / old prompts/routes/buttons/tests
- Hone prompts we want to keep