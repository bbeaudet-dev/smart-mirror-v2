# Motion Detection and Automatic Webcam Analysis Specification

## Overview

Transform the smart mirror from manual button-triggered AI analysis to an automatic, motion-aware system that provides real-time outfit feedback without user interaction.

## Priority 1: Automatic AI Analysis

### 1.1 Person Detection & Triggering

- **Three-Stage Response**:
  1. Immediate pre-generated response on motion detection
  2. Stabilization period, send welcome message if person detected
  3. Full AI analysis message if person is detected
- **Stabilization Period**: 0.5-1 second after motion detection for better image quality
- **Person Detection**: After stabilization, determine if motion was caused by a person
- **Analysis Frequency**: Every 5-10 seconds while a person remains in frame
- **Smart Triggering**: Only send images to AI when:
  - Motion is detected, stabilization completes, and person is confirmed
  - After the previous analysis response has completed
  - Rate limiting allows (see section 1.4)

### 1.2 Analysis Implementation

- **New Route**: Create `/api/ai/automatic` endpoint
- **Initial Prompt**: Use same prompt as Magic Mirror TTS for now
- **Response Type**: TTS + text display (same as current Magic Mirror TTS)
- **Future Enhancement**: Add randomized personality system

### 1.3 Response Handling

- **TTS Priority**: TTS is required for automatic mode
- **Text Display**: Show text on screen simultaneously with TTS
- **Sequential Processing**: Wait for current response to complete before starting new analysis
- **No Interruption**: Don't start new analysis while TTS is playing

### 1.4 Rate Limiting & Performance

- **Rate Limiting**: Implement 10-second cooldown between AI API calls
- **No Caching**: Don't cache responses (as requested)
- **Smart Detection**: Only analyze when person is present and previous analysis is complete
- **Error Handling**: If AI fails, show error message (no fallback responses)

## Priority 2: Motion Detection & Pre-generated Responses

### 2.1 Motion Detection Implementation

- **Person Entry Detection**: Detect when a person enters the webcam frame
- **Simple Motion**: Start with basic frame differencing for performance
- **Future Enhancement**: Distinguish between standing still vs. walking (lower priority)
- **Lower Resolution**: Use reduced resolution for motion detection to improve performance

### 2.2 Pre-generated Response System

- **Two Categories of Responses**:
  1. **Motion Responses** (30 responses): Immediate reactions to motion detection
     - "Hey you! Over here!"
     - "Don't look at me like that!"
     - "Well, well, well, what do we have here?"
     - "Someone's looking fancy today!"
     - "Oh my, what a sight for sore eyes!"
  2. **Welcome Responses** (10 responses): Played after stabilization, before AI analysis
     - "Why hello there!"
     - "Welcome, step right up!"
     - "Ah, a visitor!"
     - "Let me take a look at you!"
     - "What have we here?"
- **Display Method**: TTS + text display (same as current AI responses)
- **Future Enhancement**: Context-aware responses based on time, weather, etc.

### 2.3 Response Timing

- **Immediate Motion Response**: Plays instantly upon motion detection
- **Stabilization Period**: 0.5-1 second wait for better image quality
- **Person Detection**: After stabilization, determine if motion was caused by a person
- **Welcome Response**: Plays only if person is confirmed, before AI analysis message
- **AI Analysis**: Begins only if person is confirmed, at same time as welcome response is being played
- **Sequential Flow**: Motion → Stabilize → Person Check → Welcome (if person) → AI Analysis (if person) → Complete

## Technical Implementation

### 3.1 Webcam Processing

- **Dual Resolution System**:
  - High resolution (current): For AI analysis images
  - Low resolution (320x240): For motion detection
- **Separate Streams**: Process motion detection and AI capture independently
- **Performance Optimization**: Lower resolution motion detection reduces CPU usage

### 3.2 Motion Detection Options

#### Option A: Basic Frame Differencing

```javascript
// Simple pixel difference between consecutive frames
function detectMotion(frame1, frame2, threshold = 0.1) {
  // Calculate percentage of pixels that changed
  // Return true if change exceeds threshold
}

// Complete interaction flow
function handleMotionDetection() {
  // 1. Motion detected - play immediate response
  playMotionResponse();

  // 2. Start stabilization period
  setTimeout(() => {
    // 3. Check if motion was caused by a person
    if (detectPerson()) {
      // 4. Person confirmed - start both welcome response and AI analysis
      playWelcomeResponse();
      startAIAnalysis(); // Both start simultaneously
    }
    // If no person detected, return to motion detection
  }, 1000); // 1 second stabilization
}
```

#### Option B: Motion Detection Library

- **Library**: `@mediapipe/motion-detection` or similar
- **Pros**: More accurate, handles lighting changes better
- **Cons**: Larger bundle size, more complex

**Recommendation**: Start with Option A (frame differencing) for simplicity and performance.

### 3.2.1 Person Detection Methods

#### Option A: Simple Shape Detection (Fastest)

```javascript
function detectPerson(frame) {
  // Look for human-like proportions
  // Check for vertical rectangular shapes (person standing)
  // Check for head-like circular shapes at the top
  // Simple edge detection for body outlines
}
```

- **Pros**: Very fast (<10ms), no external dependencies
- **Cons**: Less accurate, may detect non-human objects

#### Option B: Face Detection (Good Balance)

```javascript
function detectPerson(frame) {
  // Use browser's built-in face detection API
  // navigator.mediaDevices.getUserMedia with face detection
  // Or use a lightweight face detection library
}
```

- **Pros**: Accurate for people, built into browsers
- **Cons**: May miss people facing away from camera

#### Option C: AI-Based Person Detection (Most Accurate)

```javascript
function detectPerson(frame) {
  // Use Roboflow or similar for person detection
  // Send frame to person detection API
  // Return true if person confidence > 0.7
}
```

- **Pros**: Most accurate, handles various poses/angles
- **Cons**: Slower (100-200ms), requires API call

#### Option D: Hybrid Approach (Recommended)

```javascript
function detectPerson(frame) {
  // 1. Quick shape detection first
  if (simpleShapeDetection(frame)) {
    // 2. If shape looks human-like, do face detection
    return faceDetection(frame);
  }
  return false;
}
```

**Recommendation**: Start with Option D (hybrid) for best balance of speed and accuracy.

### 3.3 UI Changes

- **Debug Panel**: Keep accessible via keyboard shortcut (Ctrl+Shift+D)
- **Response Display**: Use existing AI message display system
- **No Conflicts**: Automatic responses use same display area as manual responses
- **Mode Indicator**: Show current mode (Automatic/Manual) and status

### 3.4 Error Handling & Fallback

- **No Fake Data**: Never show placeholder responses
- **Error Display**: Show actual error messages when AI fails
- **Manual Fallback**: If automatic mode fails, allow switching to manual mode
- **Status Indicators**: Clear indication of current mode and any failures

## Implementation Phases

### Phase 1: Basic Automatic Analysis

1. Implement motion detection (basic frame differencing)
2. Create `/api/ai/automatic` route
3. Add rate limiting (10-second cooldown)
4. Implement automatic analysis trigger
5. Test with existing Magic Mirror prompt

### Phase 2: Motion Detection & Pre-generated Responses

1. Implement person detection system
2. Create pool of 30 motion responses and 10 welcome responses
3. Add immediate motion response playback
4. Add welcome response after person detection
5. Test complete flow: Motion → Pre-Generated Message → Stabilize → Person Check → Welcome / Start AI Analysis → Full AI Analysis

### Phase 3: UI & Polish

1. Add keyboard shortcut for debug panel
2. Implement mode indicator
3. Add "speaking" visual indicator
4. Optimize performance and timing

### Phase 4: Future Enhancements

1. Randomized personality system
2. Context-aware responses
3. Standing vs. walking detection
4. Advanced motion detection library

## Technical Considerations

### Performance

- **Motion Detection**: Target <50ms processing time
- **AI Analysis**: Current 2-5 second response time is acceptable
- **Memory Usage**: Monitor for memory leaks with continuous processing
- **CPU Usage**: Keep motion detection under 10% CPU

### Reliability

- **Webcam Failures**: Graceful degradation to manual mode
- **AI API Failures**: Clear error messages, retry logic
- **Network Issues**: Handle offline scenarios

### User Experience

- **Responsiveness**: Motion responses should feel immediate
- **Non-intrusive**: Don't overwhelm with constant responses
- **Clear Feedback**: Users should understand what the mirror is doing

## Success Metrics

- **Response Time**: Motion responses <100ms from detection
- **Accuracy**: Person detection >90% accuracy
- **Performance**: <10% CPU usage for motion detection
- **User Satisfaction**: Natural, magical interaction feel
