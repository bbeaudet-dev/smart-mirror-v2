# AI-Powered Smart Mirror - Implementation Plan

## Project Overview

Building an AI-powered smart mirror with live outfit analysis and other features. This will be demoed as a graduation project showcasing advanced AI integration with physical hardware.

**Timeline**: 1 Week (Wednesday to next Wednesday)
**Budget**: Additional $100-200 maximum (excluding existing Pi, monitor, cables)
**Focus**: Functional smart mirror, integrated camera, sending data to AI, using response from AI for delightful features like outfit analysis
**Bonus**: Different AI personalities (Snoop Dogg, Elle Woods) for demo
**Future Demo Idea**: Multi-user experience where multiple phones connect simultaneously, each user gets personalized AI responses with different personalities/voices

## Hardware Components

### Core Components (Already Available)

- **Raspberry Pi 5** - Main computing unit
- **ARZOPA 16" Monitor** - Display unit (2.5K resolution)
- **Relevant Cables** - HDMI, power, etc.
- **Power Supply** - for Raspberry Pi, monitor, etc.

### Components to Purchase

#### Essential (Must Purchase)

- **Two-Way Mirror/Acrylic** (12" x 18" recommended)

  - Budget: $25-50
  - **RECOMMENDATION**: 0.12" thick scratch-resistant acrylic (40% transparent)
  - Source: Amazon or local acrylic supplier (preferred for custom drilling)
  - Thickness: 0.12" (3mm) is ideal - avoid 0.04" (too thin)
  - **Size Justification**: 12"x18" provides good coverage for 16" monitor while being cost-effective
  - **Local Option**: If available, local acrylic shop can drill mounting holes

- **Frame/Case** (Pre-made picture frame recommended)
  - Budget: $20-60
  - **RECOMMENDATION**: 12"x18" picture frame with deep enough rabbet for monitor
  - Size: 12" x 18" to match acrylic sheet
  - Options:
    - Deep shadow box frame (preferred - more space for monitor)
    - Standard picture frame with extended backing
    - Simple wooden frame with custom backing
  - **Alternative Option**: The Raspberry Pi tutorial uses machine bolts/nuts and spacing pillars with drilled holes in the acrylic, eliminating most of the need for a frame.

#### Camera & Audio Options

**Option A: USB Webcam + ARZOPA Speakers** (PRIMARY APPROACH)

- **USB Webcam** (Inland iC800 or similar 1080p minimum)
  - Budget: $30-60
  - **RECOMMENDATION**: Inland iC800 (good low-light performance, built-in mic)
  - **ADVANTAGES**: Direct USB connection, no network issues, reliable, simple implementation
- **Audio**: Use ARZOPA monitor's built-in speakers
  - Budget: $0 (already available)
  - Pros: No additional hardware needed
  - Cons: May need external speakers for demo volume

**Option B: Phone as Camera + Bluetooth Speaker** (BACKUP APPROACH)

- **Phone Mount**
  - Budget: $10-20
  - **Bluetooth Speaker**
  - Budget: $20-40 (if you don't have one)
  - Pros: Better camera quality, good audio, no additional webcam needed
  - Cons: More complex setup, potential connectivity issues
  - **STATUS**: WebRTC implementation complete but complex - keeping as backup

**Option C: USB Webcam + External Speakers** (Fallback)

- **USB Webcam** (1080p minimum)
  - Budget: $30-60
- **Small Speakers** (2-3W RMS)
  - Budget: $15-30
  - Options: USB-powered speakers or small bookshelf speakers

#### Assembly Hardware

- **Mounting Hardware**
  - Budget: $15-30
  - Screws, brackets, cable management
- **Lighting** (Recommended for demo)
  - Budget: $20-40
  - LED strip or small LED light
  - Improves webcam performance in low-light demo environment

## Software Architecture

### Current State Analysis

- ✅ React frontend with modular components
- ✅ Node.js backend with API routes
- ✅ OpenAI integration for text responses
- ✅ Weather and calendar data integration
- ✅ WebRTC phone interface (backup option)
- ❌ USB webcam integration
- ❌ Real-time video processing
- ❌ Audio input/output
- ❌ Computer vision features

### Development Phases (8-Day Timeline)

#### Phase 1: USB Webcam Integration (Days 1-2) - PRIMARY APPROACH

**Goal**: Get USB webcam working and capturing images for AI analysis

**Tasks**:

1. **Hardware Setup** (Day 1)

   - Connect Inland iC800 USB webcam to Pi
   - Test webcam detection and video feed
   - Verify Pi can detect and use webcam
   - Test built-in microphone

2. **Webcam Integration** (Day 1-2)
   - Implement webcam access in React app
   - Add video feed display to mirror interface
   - Implement frame capture functionality
   - Test video quality and positioning
   - Ensure frames are ready for AI processing

**Deliverables**:

- Working USB webcam hardware
- Video feed displayed on mirror
- Image capture working
- Frames ready for AI processing

#### Phase 2: AI Vision Integration (Days 3-4)

**Goal**: Connect webcam to AI vision processing

**Tasks**:

1. **Image Processing Pipeline** (Day 3)

   - Capture images from webcam feed
   - Send images to OpenAI Vision API
   - Test basic image analysis
   - Handle API responses

2. **AI Response Display** (Day 4)
   - Create component to display AI responses on mirror
   - Test end-to-end flow: webcam → AI → display
   - Add basic error handling
   - Implement response formatting

**Deliverables**:

- Working AI image analysis
- AI responses displaying on mirror
- Complete webcam → AI → display pipeline

#### Phase 3: Demo Preparation & Pi Deployment (TODAY - Practice Demo)

**Goal**: Deploy working system to Raspberry Pi for practice demo

**Tasks**:

1. **Pi API Troubleshooting** (Priority 1)

   - Debug "weather data unavailable" errors on Pi
   - Debug "AI analysis failed" errors on Pi
   - Test API connectivity and environment variables
   - Ensure all services work on Pi hardware

2. **UI Cleanup & Polish** (Priority 2)

   - Remove debug/experimental components
   - Clean up smart mirror interface
   - Ensure reliable display of: weather, calendar, news headlines
   - Make UI visually appealing and demo-ready

3. **Text-to-Speech Integration** (Priority 3 - if time permits)
   - Integrate Web Speech API for AI responses
   - Test audio output on Pi
   - Add voice personality matching

**Deliverables**:

- Working smart mirror on Raspberry Pi
- Clean, demo-ready UI
- Reliable weather, calendar, news display
- Optional: Text-to-speech working

#### Phase 4: Automation & Polish (Days 5-6)

**Goal**: Add automation and polish for final demo

**Tasks**:

1. **Automated Trigger System** (Day 5)

   - Add motion detection for automatic capture
   - Implement smooth user experience flow
   - Add loading states and feedback

2. **Text-to-Speech Enhancement** (Day 6)

   - Integrate Web Speech API
   - Add voice output for AI responses
   - Test audio quality and timing

**Deliverables**:

- Complete automated system
- Text-to-speech working
- Demo-ready smart mirror

**Goal**: Add automation and polish for final demo

**Tasks**:

1. **Automated Trigger System** (Day 7)

   - Add motion detection for automatic capture
   - Implement smooth user experience flow
   - Add loading states and feedback

2. **Text-to-Speech Enhancement** (Day 8)

   - Integrate Web Speech API
   - Add voice output for AI responses
   - Test audio quality and timing

**Deliverables**:

- Complete automated system
- Text-to-speech working
- Demo-ready smart mirror

#### Phase 5: Roboflow Object Detection Integration (Day 7) - STRETCH GOAL

**Goal**: Add real-time object detection using Roboflow for enhanced smart mirror capabilities

**Tasks**:

1. **Roboflow Setup & Integration** (Day 7)

   - Set up Roboflow account and API access
   - Choose/upload clothing detection dataset (shirts, pants, shoes, accessories)
   - Train or use pre-trained clothing detection model
   - Integrate Roboflow API into backend services
   - Test object detection accuracy and performance

2. **Real-time Detection Implementation** (Day 7)

   - Implement real-time object detection on webcam feed
   - Add visual bounding boxes and labels for detected items
   - Create detection overlay component for mirror interface
   - Integrate detection results with AI analysis prompts
   - Optimize for performance on Raspberry Pi

**Deliverables**:

- Working Roboflow object detection
- Real-time clothing item detection
- Visual detection overlay on mirror
- Enhanced AI prompts using detected objects

#### Phase 6: Phone Backup Testing (Day 8) - OPTIONAL

**Goal**: Ensure phone interface works as backup

**Tasks**:

1. **Phone Interface Testing** (Day 8)
   - Test WebRTC connection from phone
   - Verify camera access on mobile browsers
   - Ensure phone can stream to Pi as backup
   - Document phone setup process

**Deliverables**:

- Working phone backup option
- Documentation for phone setup

#### Phase 7: Final Demo Preparation (Day 8)

**Goal**: Final testing and demo preparation

**Tasks**:

1. **Final Testing** (Day 8)
   - Test complete USB webcam flow
   - Test phone backup flow
   - Test Roboflow integration (if implemented)
   - Final UI/UX refinements
   - Demo flow preparation

**Deliverables**:

- Fully functional smart mirror
- Backup phone interface
- Demo-ready system

## Feature Complexity Analysis

### Outfit Analysis vs Simon Says

**Outfit Analysis** (Recommended for Demo)

- **Complexity**: Medium
- **Core Requirements**: USB webcam capture + OpenAI Vision API + Text-to-speech
- **Demo Value**: High - anyone can participate
- **Technical Stack**: React + USB Webcam + OpenAI + Web Speech API

**Simon Says** (Stretch Goal)

- **Complexity**: High
- **Core Requirements**: Gesture recognition + Real-time processing + Complex game logic
- **Demo Value**: Medium - single person experience
- **Technical Stack**: React + Computer Vision + Gesture Recognition + Real-time audio

**Divergence Point**: After basic webcam integration (Day 2). Both features need:

- Webcam access ✅
- Audio output ✅
- Basic UI framework ✅

**Recommendation**: Focus on outfit analysis for demo. Simon Says can be added later if time permits.

## Technical Implementation Details

### USB Webcam Integration

```typescript
// client-mirror/src/hooks/useWebcam.ts
import { useState, useRef, useEffect } from "react";

export const useWebcam = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false, // We'll use Pi speakers for output
      });
      setStream(mediaStream);
    } catch (error) {
      console.error("Webcam access failed:", error);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL("image/jpeg");
    }
    return null;
  };

  return { stream, isCapturing, videoRef, startWebcam, captureFrame };
};
```

### Roboflow Object Detection Integration

```typescript
// server/services/roboflowService.js
import { Roboflow } from "roboflow";

export class RoboflowService {
  private roboflow: Roboflow;
  private model: string;

  constructor() {
    this.roboflow = new Roboflow({
      apiKey: process.env.ROBOFLOW_API_KEY,
    });
    this.model = "clothing-detection-xyz"; // Replace with actual model
  }

  async detectClothing(imageData: string): Promise<DetectionResult[]> {
    try {
      const predictions = await this.roboflow.detect({
        model: this.model,
        image: imageData,
        confidence: 0.5,
        overlap: 0.5,
      });

      return predictions.map((pred) => ({
        label: pred.class,
        confidence: pred.confidence,
        bbox: {
          x: pred.bbox.x,
          y: pred.bbox.y,
          width: pred.bbox.width,
          height: pred.bbox.height,
        },
      }));
    } catch (error) {
      console.error("Roboflow detection failed:", error);
      return [];
    }
  }

  generateEnhancedPrompt(detections: DetectionResult[], weather: any): string {
    const detectedItems = detections.map((d) => d.label).join(", ");

    return `I can see you're wearing: ${detectedItems}. 
    Considering it's ${weather.temperature}°F and ${weather.condition} today, 
    how does this outfit work for the weather? Any suggestions for improvement?`;
  }
}
```

### AI Integration Enhancement

```typescript
// server/services/outfitAnalysisService.js
const analyzeOutfit = async (imageData, weather, personality = "default") => {
  // First, detect clothing items using Roboflow
  const roboflowService = new RoboflowService();
  const detections = await roboflowService.detectClothing(imageData);

  // Generate enhanced prompt with detected items
  const enhancedPrompt = roboflowService.generateEnhancedPrompt(
    detections,
    weather
  );
  const prompt = generateOutfitPrompt(weather, personality, enhancedPrompt);

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageData } },
        ],
      },
    ],
    max_tokens: 300,
  });

  return {
    analysis: response.choices[0].message.content,
    detections: detections,
  };
};

const generateOutfitPrompt = (weather, personality) => {
  const basePrompt = `Analyze this outfit considering it's ${weather.temperature}°F and ${weather.condition} today. `;

  const personalityPrompts = {
    snoop:
      basePrompt +
      "Respond like Snoop Dogg would - keep it real, use some slang, but be encouraging.",
    elle:
      basePrompt +
      "Respond like Elle Woods from Legally Blonde - be enthusiastic, fashion-forward, and empowering.",
    default:
      basePrompt +
      "Give a friendly, encouraging analysis with specific suggestions.",
  };

  return personalityPrompts[personality] || personalityPrompts.default;
};
```

### Text-to-Speech with Personality

```typescript
// client-mirror/src/services/speechService.ts
export class SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private currentPersonality: string = "default";

  constructor() {
    this.loadVoices();
  }

  private loadVoices() {
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
      };
    }
  }

  speakWithPersonality(text: string, personality: string) {
    const utterance = new SpeechSynthesisUtterance(text);

    // Adjust voice properties based on personality
    switch (personality) {
      case "snoop":
        utterance.rate = 0.8; // Slower, more relaxed
        utterance.pitch = 0.9; // Slightly lower pitch
        break;
      case "elle":
        utterance.rate = 1.2; // Faster, more energetic
        utterance.pitch = 1.1; // Slightly higher pitch
        break;
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
    }

    speechSynthesis.speak(utterance);
  }
}
```

## USB Webcam vs Phone Integration Comparison

### USB Webcam Approach (PRIMARY)

**Pros**:

- Direct USB connection - no network issues
- Reliable and consistent performance
- No browser compatibility problems
- Simpler implementation
- Built-in microphone support
- Works offline (except for AI calls)

**Cons**:

- Requires additional hardware purchase
- Fixed positioning (can't move around)

**Implementation Complexity**: Low-Medium
**Timeline**: 1-2 days for full integration

### Phone Integration Approach (BACKUP)

**Pros**:

- Better camera quality (iPhone cameras)
- No additional hardware needed
- Portable and flexible

**Cons**:

- Complex WebRTC implementation
- Network dependency
- Browser compatibility issues
- Camera permission problems
- Multiple devices to manage

**Implementation Complexity**: High
**Timeline**: 3-5 days for reliable implementation

**Recommendation**: USB webcam for primary demo, phone as backup option

## Risk Assessment & Mitigation

### Technical Risks

1. **Webcam Performance Issues**

   - Risk: Poor video quality or latency
   - Mitigation: Test multiple webcams, optimize video settings

2. **AI API Latency**

   - Risk: Slow responses during demo
   - Mitigation: Implement caching, use faster models, have backup responses

3. **Hardware Failures**
   - Risk: Components fail during demo
   - Mitigation: Have backup hardware, test thoroughly

### Demo Risks

1. **Lighting Issues**

   - Risk: Poor webcam performance in low-light demo environment
   - Mitigation: Bring additional lighting, test in similar conditions

2. **Network Issues**

   - Risk: AI APIs unavailable during demo
   - Mitigation: Implement offline fallbacks, cache responses

3. **Timing Issues**
   - Risk: Demo runs too long or too short, or unclear presentation
   - Mitigation: Practice timing and flow, have flexible demo flow

## Roboflow Integration Benefits

### Technical Benefits

- **Real-time Object Detection**: Identify specific clothing items (shirts, pants, shoes, accessories)
- **Enhanced AI Prompts**: More specific analysis based on detected items
- **Visual Feedback**: Bounding boxes and labels on detected items
- **Performance**: Roboflow models optimized for real-time inference

### Demo & Interview Benefits

- **Roboflow Interview Opportunity**: Using their software makes the project eligible for their interview series
- **Showcase Advanced AI**: Demonstrates integration of multiple AI services (OpenAI + Roboflow)
- **Technical Sophistication**: Shows understanding of computer vision and object detection
- **Real-world Application**: Practical use case for object detection in smart home technology

### Implementation Strategy

1. **Model Selection**: Use pre-trained clothing detection model or train custom model
2. **API Integration**: Seamless integration with existing AI analysis pipeline
3. **Visual Overlay**: Real-time bounding boxes on webcam feed
4. **Enhanced Prompts**: AI responses reference specific detected clothing items

## Success Metrics

### Technical Metrics

- Webcam latency < 100ms
- AI response time < 3 seconds
- Object detection accuracy > 85%
- System uptime > 95%
- Audio/video sync < 50ms

### Demo Metrics

- Audience engagement (reactions, questions)
- Technical execution (no major failures)
- Feature demonstration (all planned features work)
- Professional presentation
- Roboflow integration showcase

## Budget Summary

| Component         | Estimated Cost | Priority    |
| ----------------- | -------------- | ----------- |
| Two-Way Acrylic   | $25-50         | Essential   |
| Frame/Case        | $20-60         | Essential   |
| USB Webcam        | $30-60         | Essential   |
| Speakers          | $0-30          | Essential   |
| Microphone        | $0-25          | Essential   |
| Mounting Hardware | $15-30         | Essential   |
| Lighting          | $20-40         | Recommended |
| **Total**         | **$110-255**   |             |

## Next Steps

1. **Immediate Actions** (Today)

   - Purchase Inland iC800 USB webcam
   - Set up development environment
   - Begin Phase 1 implementation (USB webcam integration)

2. **Daily Check-ins**

   - Review progress against phase goals
   - Adjust timeline if needed
   - Address any technical blockers

3. **Demo Preparation**
   - Start practicing demo flow early
   - Record backup videos of features
   - Prepare technical documentation

## Phone as Camera/Audio Analysis

**Pros of Using Phone**:

- Better camera quality than most USB webcams
- Built-in microphone and speakers
- No additional hardware needed
- Potentially better low-light performance

**Cons of Using Phone**:

- More complex setup (WebRTC, phone app, or web interface)
- Requires phone to be mounted and connected
- Additional development time
- Potential connectivity issues during demo

**Recommendation**: Start with USB webcam for simplicity and reliability. Phone integration can be a stretch goal if time permits.

## Future Demo Ideas

### Multi-User Smart Mirror Experience

**Concept**: Interactive demo where multiple audience members connect their phones simultaneously to the smart mirror system.

**Implementation**:

- Each phone connects to the same WebRTC server
- Input fields for Name and Personality on phone interface
- Each phone makes separate AI API calls with personalized prompts
- Simultaneous responses create a "mirror party" effect

**Technical Considerations**:

- **API Rate Limits**: OpenAI has rate limits (3 requests/minute for free tier, higher for paid)
- **Server Load**: WebRTC server can handle multiple connections
- **Network Bandwidth**: Multiple video streams may require good WiFi
- **Audio Coordination**: Multiple responses playing simultaneously could be chaotic

**Demo Flow**:

1. "Everyone take out your phones and go to [URL]"
2. Each person enters their name and chooses a personality
3. Compliments start playing from each person's phone

**Risk Mitigation**:

- Implement request queuing to avoid API rate limits
- Add audio coordination (stagger responses)
- Have fallback responses if API fails
- Test with 3-5 users first, then scale

**Potential Impact**: This could be a show-stopping demo that demonstrates real-time AI integration, multi-user systems, and creates memorable audience engagement.

---

_This plan prioritizes USB webcam integration as the primary approach for outfit analysis with AI personalities, focusing on reliability and audience engagement over technical complexity. Phone integration is maintained as a backup option._
