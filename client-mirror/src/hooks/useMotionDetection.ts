import { useState, useRef, useEffect, useCallback } from 'react';
import ApiClient from '../services/apiClient';

interface MotionDetectionOptions {
  threshold?: number; // Percentage of pixels that must change to trigger motion
  interval?: number; // How often to check for motion (ms)
  minMotionDuration?: number; // Minimum duration of motion to trigger (ms)
  isAutomaticMode?: boolean; // Whether to automatically trigger interactions
  onAiMessage?: (message: string, type: 'ai-response' | 'outfit-analysis' | 'general') => void;
  onAiLoading?: (loading: boolean) => void;
}

export const useMotionDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: MotionDetectionOptions = {}
) => {
  const {
    threshold = 0.075, // 7.5% of pixels must change (balanced sensitivity)
    interval = 100, // Check every 100ms
    minMotionDuration = 500, // Motion must last at least 500ms
    isAutomaticMode = true,
    onAiMessage,
    onAiLoading
  } = options;

  // Motion detection state
  const [isMotionDetected, setIsMotionDetected] = useState(false);
  const [motionLevel, setMotionLevel] = useState(0);
  const [isMotionDetectionRunning, setIsMotionDetectionRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction state
  const [isInteractionActive, setIsInteractionActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleteTime, setAnalysisCompleteTime] = useState(0);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const motionStartTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastAnalysisTimeRef = useRef(0);
  const currentInteractionVoiceRef = useRef<string>('ash');
  const isMotionDetectedRef = useRef(false); // Prevents circular dependency in checkMotion

  // Pre-generated responses
  const [motionResponses, setMotionResponses] = useState<string[]>([]);
  const [welcomeResponses, setWelcomeResponses] = useState<string[]>([]);
  const [sendoffResponses, setSendoffResponses] = useState<string[]>([]);
  
  // Personality to voice mapping (matches server-side)
  const personalityVoiceMapping = {
    'Magic Mirror': 'fable',
    'Snoop Dogg': 'ash', 
    'Apathetic': 'alloy'
  };
  
  // Store selected personality for the current interaction
  const currentInteractionPersonalityRef = useRef<string>('Magic Mirror');

  // Load pre-generated responses
  const loadPreGeneratedResponses = useCallback(async () => {
    try {
      const response = await ApiClient.getResponses() as any;
      if (response.success) {
        setMotionResponses(response.responses.motion);
        setWelcomeResponses(response.responses.welcome);
        setSendoffResponses(response.responses.sendoff);
      }
    } catch (error) {
      console.error('Failed to load pre-generated responses:', error);
    }
  }, []);

  // Initialize canvas for frame processing
  const initializeCanvas = useCallback(() => {
    if (!videoRef.current) return false;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      setError('Could not get canvas context for motion detection');
      return false;
    }

    // Use lower resolution for motion detection (320x240)
    canvas.width = 320;
    canvas.height = 240;

    canvasRef.current = canvas;
    ctxRef.current = ctx;
    return true;
  }, [videoRef]);

  // Calculate difference between two frames
  const calculateFrameDifference = useCallback((frame1: ImageData, frame2: ImageData): number => {
    const data1 = frame1.data;
    const data2 = frame2.data;
    let differentPixels = 0;
    const totalPixels = data1.length / 4; // RGBA = 4 bytes per pixel

    // Compare every 4th pixel (every pixel, skipping alpha channel)
    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i];
      const g1 = data1[i + 1];
      const b1 = data1[i + 2];

      const r2 = data2[i];
      const g2 = data2[i + 1];
      const b2 = data2[i + 2];

      // Calculate color difference (simple Euclidean distance)
      const diff = Math.sqrt(
        Math.pow(r1 - r2, 2) + 
        Math.pow(g1 - g2, 2) + 
        Math.pow(b1 - b2, 2)
      );

      // Consider pixel different if color difference > 50
      if (diff > 50) {
        differentPixels++;
      }
    }

    return differentPixels / totalPixels;
  }, []);

  // Capture current frame as ImageData
  const captureFrame = useCallback((): ImageData | null => {
    if (!videoRef.current || !canvasRef.current || !ctxRef.current) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    try {
      // Draw video frame to canvas (scaled down for performance)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return imageData;
    } catch (error) {
      console.error('Failed to capture frame for motion detection:', error);
      return null;
    }
  }, [videoRef]);

  // Check for motion between current and previous frame
  const checkMotion = useCallback(() => {
    const currentFrame = captureFrame();
    if (!currentFrame) return;

    if (previousFrameRef.current) {
      const motionLevel = calculateFrameDifference(previousFrameRef.current, currentFrame);
      setMotionLevel(motionLevel);

      const now = Date.now();
      const isMotion = motionLevel > threshold;

      if (isMotion) {
        // Motion detected
        if (motionStartTimeRef.current === null) {
          // Start of motion
          motionStartTimeRef.current = now;
          console.log(`Motion started - Level: ${(motionLevel * 100).toFixed(2)}%`);
        } else if (now - motionStartTimeRef.current >= minMotionDuration) {
          // Motion has lasted long enough to trigger
          if (!isMotionDetectedRef.current) {
            setIsMotionDetected(true);
            isMotionDetectedRef.current = true;
            console.log(`Motion detected! Level: ${(motionLevel * 100).toFixed(2)}%`);
          }
        }
      } else {
        // No motion
        if (motionStartTimeRef.current !== null) {
          console.log(`Motion stopped - Level: ${(motionLevel * 100).toFixed(2)}%`);
          motionStartTimeRef.current = null;
        }
        if (isMotionDetectedRef.current) {
          setIsMotionDetected(false);
          isMotionDetectedRef.current = false;
          console.log('Motion ended');
        }
      }
    }

    // Store current frame for next comparison
    previousFrameRef.current = currentFrame;
  }, [captureFrame, calculateFrameDifference, threshold, minMotionDuration]);

  // Pre-generated response functions
  const playMotionResponse = useCallback(async () => {
    try {
      // Choose a random personality and get its assigned voice
      const personalities = ['Magic Mirror', 'Snoop Dogg', 'Apathetic'];
      const selectedPersonality = personalities[Math.floor(Math.random() * personalities.length)];
      const selectedVoice = personalityVoiceMapping[selectedPersonality as keyof typeof personalityVoiceMapping];
      currentInteractionVoiceRef.current = selectedVoice;
      currentInteractionPersonalityRef.current = selectedPersonality;
      
      console.log(`Starting new interaction with personality: ${selectedPersonality} (voice: ${selectedVoice})`);
      
      // Get motion response audio with the selected voice
      const audioResponse = await fetch(`${ApiClient.getMotionAudioUrl()}?voice=${selectedVoice}`);
      
      if (audioResponse.ok) {
        const audioBlob = await audioResponse.blob();
        
        console.log(`Playing motion response audio with voice: ${selectedVoice}`);
        console.log('Audio blob size:', audioBlob.size, 'bytes');
        
        // Play the audio (no text display)
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Add error handling for audio playback
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          console.error('Audio error details:', audio.error);
        };
        
        audio.onloadstart = () => console.log('Audio loading started');
        audio.oncanplay = () => console.log('Audio can play');
        audio.onplay = () => console.log('Audio playback started');
        
        try {
          await audio.play();
          console.log('Audio play() resolved successfully');
        } catch (playError) {
          console.error('Audio play() failed:', playError);
        }
        
        // Clean up URL when audio finishes
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error playing motion response:', error);
    }
  }, []);

  const playWelcomeResponse = useCallback(async () => {
    try {
      // Use the same voice as the motion response
      const selectedVoice = currentInteractionVoiceRef.current;
      
      // Get welcome response audio with the same voice
      const audioResponse = await fetch(`${ApiClient.getWelcomeAudioUrl()}?voice=${selectedVoice}`);
      
      if (audioResponse.ok) {
        const audioBlob = await audioResponse.blob();
        
        console.log(`Playing welcome response audio with voice: ${selectedVoice}`);
        console.log('Welcome audio blob size:', audioBlob.size, 'bytes');
        
        // Play the audio (no text display)
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Add error handling for audio playback
        audio.onerror = (e) => {
          console.error('Welcome audio playback error:', e);
          console.error('Welcome audio error details:', audio.error);
        };
        
        audio.onloadstart = () => console.log('Welcome audio loading started');
        audio.oncanplay = () => console.log('Welcome audio can play');
        audio.onplay = () => console.log('Welcome audio playback started');
        
        try {
          await audio.play();
          console.log('Welcome audio play() resolved successfully');
        } catch (playError) {
          console.error('Welcome audio play() failed:', playError);
        }
        
        // Clean up URL when audio finishes
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error playing welcome response:', error);
    }
  }, []);

  const playSendoffResponse = useCallback(async () => {
    try {
      // Use the same voice as the current interaction
      const selectedVoice = currentInteractionVoiceRef.current;
      
      // Get sendoff response audio with the same voice
      const audioResponse = await fetch(`${ApiClient.getSendoffAudioUrl()}?voice=${selectedVoice}`);
      
      if (audioResponse.ok) {
        const audioBlob = await audioResponse.blob();
        
        console.log(`Playing sendoff response audio with voice: ${selectedVoice}`);
        console.log('Sendoff audio blob size:', audioBlob.size, 'bytes');
        
        console.log('Starting sendoff response');
        
        // Play the audio (no text display)
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Add error handling for audio playback
        audio.onerror = (e) => {
          console.error('Sendoff audio playback error:', e);
          console.error('Sendoff audio error details:', audio.error);
        };
        
        audio.onloadstart = () => console.log('Sendoff audio loading started');
        audio.oncanplay = () => console.log('Sendoff audio can play');
        audio.onplay = () => console.log('Sendoff audio playback started');
        
        try {
          await audio.play();
          console.log('Sendoff audio play() resolved successfully');
        } catch (playError) {
          console.error('Sendoff audio play() failed:', playError);
        }
        
        // Clean up URL when audio finishes and reset interaction state
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          
          // Reset interaction state when sendoff completes
          setIsInteractionActive(false);
          setIsAnalyzing(false);
          
          // Update analysis time after sendoff completes
          const now = Date.now();
          lastAnalysisTimeRef.current = now;
          setAnalysisCompleteTime(now);
          
          console.log('Interaction state reset and analysis time updated after sendoff completes');
        };
      }
    } catch (error) {
      console.error('Error playing sendoff response:', error);
    }
  }, []);

  // Automatic Analysis Handler
  const handleAutomaticAnalysis = useCallback(async () => {
    if (!videoRef.current) {
      console.error("Video element not available");
      return;
    }

    console.log('Starting automatic analysis');
    setIsAnalyzing(true);
    onAiLoading?.(true);

    try {
      // Capture frame for analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx || !videoRef.current) {
        throw new Error("Could not get canvas context or video element");
      }

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0);
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.8);
      });

      const imageFile = new File([blob], 'automatic-analysis.jpg', { type: 'image/jpeg' });
      const selectedPersonality = currentInteractionPersonalityRef.current;
      const result = await ApiClient.automaticAnalysis(imageFile, selectedPersonality) as { analysis: string; audio?: string };
      
      onAiMessage?.(result.analysis, 'ai-response');
      
      if (result.audio) {
        try {
          const audioBlob = new Blob([Uint8Array.from(atob(result.audio), c => c.charCodeAt(0))], { type: 'audio/opus' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          await audio.play();
          console.log('Playing automatic analysis TTS audio');
          
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            // Clear the AI message when audio finishes
            onAiMessage?.('', 'ai-response');
            // Play sendoff after analysis audio completes with delay
            setTimeout(() => {
              playSendoffResponse();
            }, 100); // 0.1 second delay between analysis and sendoff
          };
        } catch (audioError) {
          console.error('Failed to play automatic analysis TTS audio:', audioError);
          // Still play sendoff even if analysis audio fails
          playSendoffResponse();
        }
      } else {
        // Play sendoff if no analysis audio
        playSendoffResponse();
      }

    } catch (error) {
      console.error('Automatic analysis failed:', error);
      onAiMessage?.(`Automatic analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ai-response');
      // Play sendoff even if analysis fails
      playSendoffResponse();
    } finally {
      onAiLoading?.(false);
    }
  }, [videoRef, onAiMessage, onAiLoading, playSendoffResponse]);

  // Handle motion detection with proper four-stage flow
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastAnalysis = now - analysisCompleteTime;
    const minTimeBetweenAnalyses = 3000; // 3 seconds between interactions
    
    console.log('Motion detection check:', {
      isAutomaticMode,
      isMotionDetected,
      isAnalyzing,
      timeSinceLastAnalysis,
      minTimeBetweenAnalyses,
      canTrigger: timeSinceLastAnalysis > minTimeBetweenAnalyses,
      isInteractionActive
    });
    
    if (isAutomaticMode && isMotionDetected && !isAnalyzing && 
        timeSinceLastAnalysis > minTimeBetweenAnalyses && !isInteractionActive) {
      console.log('Motion detected - starting four-stage flow');
      
      // Set interaction as active immediately
      setIsInteractionActive(true);
      
      // Stage 1: Immediate motion response (pre-generated audio only)
      playMotionResponse();
      
      // Stage 2: Welcome message (1.5 seconds after motion response)
      setTimeout(() => {
        console.log('Playing welcome message');
        playWelcomeResponse();
      }, 1000); // 1 second after motion response
      
      // Stage 3: Start AI analysis (2 seconds after motion response)
      setTimeout(() => {
        console.log('Starting AI analysis');
        handleAutomaticAnalysis();
      }, 2500); // Start analysis 2.5 seconds after motion response
    }
  }, [isAutomaticMode, isMotionDetected, isAnalyzing, analysisCompleteTime, isInteractionActive]);

  // Start motion detection
  const startMotionDetection = useCallback(() => {
    if (isMotionDetectionRunning) return;

    if (!initializeCanvas()) {
      return;
    }

    setIsMotionDetectionRunning(true);
    setError(null);

    // Start checking for motion at regular intervals
    intervalRef.current = setInterval(checkMotion, interval);

    console.log('Motion detection started');
  }, [isMotionDetectionRunning, initializeCanvas, checkMotion, interval]);

  // Stop motion detection
  const stopMotionDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsMotionDetectionRunning(false);
    setIsMotionDetected(false);
    setMotionLevel(0);
    motionStartTimeRef.current = null;
    previousFrameRef.current = null;

    console.log('Motion detection stopped');
  }, []);

  // Reset interaction state
  const resetInteractionState = useCallback(() => {
    setAnalysisCompleteTime(0);
    setIsInteractionActive(false);
    console.log('Interaction state manually reset');
  }, []);

  // Load pre-generated responses on mount
  useEffect(() => {
    loadPreGeneratedResponses();
  }, [loadPreGeneratedResponses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMotionDetection();
    };
  }, [stopMotionDetection]);

  return {
    // Motion detection state
    isMotionDetected,
    motionLevel,
    isMotionDetectionRunning,
    error,
    
    // Interaction state
    isInteractionActive,
    isAnalyzing,
    analysisCompleteTime,
    
    // Methods
    startMotionDetection,
    stopMotionDetection,
    resetInteractionState,
    
    // Pre-generated response functions (for testing)
    playMotionResponse,
    playWelcomeResponse,
    playSendoffResponse,
    
    // Utility
    clearError: () => setError(null)
  };
};
