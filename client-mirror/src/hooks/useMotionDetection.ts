import { useState, useRef, useEffect, useCallback } from 'react';
import ApiClient from '../services/apiClient';
import { useAudioQueue } from './useAudioQueue';
import { useAudioPlayback } from './useAudioPlayback';

interface MotionDetectionOptions {
  threshold?: number; // Percentage of pixels that must change to trigger motion
  interval?: number; // How often to check for motion (ms)
  minMotionDuration?: number; // Minimum duration of motion to trigger (ms)
  isAutomaticMode?: boolean; // Whether to automatically trigger interactions
  onAiMessage?: (message: string, type: 'ai-response' | 'outfit-analysis' | 'general' | 'motion' | 'welcome' | 'sendoff') => void;
  onAiLoading?: (loading: boolean) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export const useMotionDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: MotionDetectionOptions = {}
) => {
  const {
    threshold = 0.025, // % of pixels must change to trigger motion
    interval = 100, // Check every 100ms
    minMotionDuration = 250, // duration of motion to trigger
    isAutomaticMode = true,
    onAiMessage,
    onAiLoading,
    onSpeakingChange
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

  // Refs for motion detection
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const motionStartTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastAnalysisTimeRef = useRef(0);
  const isMotionDetectedRef = useRef(false); // Prevents circular dependency in checkMotion

  // Audio queue and playback hooks
  const { queueMessage, isSpeaking, setSendoffFunction } = useAudioQueue({
    onMessage: onAiMessage,
    onSpeakingChange: onSpeakingChange,
    onSendoffComplete: () => {
      // Reset interaction state when sendoff completes
      setIsInteractionActive(false);
      setIsAnalyzing(false);
      const now = Date.now();
      lastAnalysisTimeRef.current = now;
      setAnalysisCompleteTime(now);
    }
  });

  const { getMotionResponse, getWelcomeResponse, getSendoffResponse, prepareAudioFromBase64 } = useAudioPlayback();

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
        } else if (now - motionStartTimeRef.current >= minMotionDuration) {
          // Motion has lasted long enough to trigger
          if (!isMotionDetectedRef.current) {
            setIsMotionDetected(true);
            isMotionDetectedRef.current = true;
          }
        }
      } else {
        // No motion
        if (motionStartTimeRef.current !== null) {
          motionStartTimeRef.current = null;
        }
        if (isMotionDetectedRef.current) {
          setIsMotionDetected(false);
          isMotionDetectedRef.current = false;
        }
      }
    }

    // Store current frame for next comparison
    previousFrameRef.current = currentFrame;
  }, [captureFrame, calculateFrameDifference, threshold, minMotionDuration]);

  // Pre-generated response functions
  const playMotionResponse = useCallback(async () => {
    try {
      const response = await getMotionResponse();
      if (response) {
        queueMessage(response.text, response.type, response.audio);
      }
    } catch (error) {
      console.error('Error playing motion response:', error);
    }
  }, [getMotionResponse, queueMessage]);

  const playWelcomeResponse = useCallback(async () => {
    try {
      const response = await getWelcomeResponse();
      if (response) {
        queueMessage(response.text, response.type, response.audio);
      }
    } catch (error) {
      console.error('Error playing welcome response:', error);
    }
  }, [getWelcomeResponse, queueMessage]);

  const playSendoffResponse = useCallback(async () => {
    try {
      const response = await getSendoffResponse();
      if (response) {
        queueMessage(response.text, response.type, response.audio);
      }
    } catch (error) {
      console.error('Error playing sendoff response:', error);
    }
  }, [getSendoffResponse, queueMessage]);

  // Set sendoff function reference for queue processor
  useEffect(() => {
    setSendoffFunction(playSendoffResponse);
  }, [playSendoffResponse, setSendoffFunction]);

  // Automatic Analysis Handler
  const handleAutomaticAnalysis = useCallback(async () => {
    if (!videoRef.current) {
      console.error("Video element not available");
      return;
    }

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
      const result = await ApiClient.automaticAnalysis(imageFile) as { analysis: string; audio?: string };
      
      if (result.audio) {
        try {
          const audioData = prepareAudioFromBase64(result.audio, result.analysis);
          queueMessage(audioData.text, audioData.type, audioData.audio);
        } catch (audioError) {
          console.error('Failed to prepare audio:', audioError);
          // Still play sendoff even if analysis audio fails
          playSendoffResponse();
        }
      } else {
        // Display text-only message if no audio
        onAiMessage?.(result.analysis, 'ai-response');
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
  }, [videoRef, onAiMessage, onAiLoading, playSendoffResponse, queueMessage, prepareAudioFromBase64]);

  // Handle motion detection with proper four-stage flow
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastAnalysis = now - analysisCompleteTime;
    const minTimeBetweenAnalyses = 1500; // 1.5 seconds between interactions
    
    if (isAutomaticMode && isMotionDetected && !isAnalyzing && 
        timeSinceLastAnalysis > minTimeBetweenAnalyses && !isInteractionActive) {
      
      // Set interaction as active immediately
      setIsInteractionActive(true);
      
      // Show AI loading spinner immediately
      onAiLoading?.(true);
      
      // Stage 1: Immediate motion response
      playMotionResponse();
      
      // Stage 2: Start AI analysis 
      setTimeout(() => {
        handleAutomaticAnalysis();
      }, 1000); // Start analysis 1 second after motion response
      
      // Stage 3: Welcome message
      setTimeout(() => {
        playWelcomeResponse();
      }, 2500); // 2.5 seconds after motion response
    }
  }, [isAutomaticMode, isMotionDetected, isAnalyzing, analysisCompleteTime, isInteractionActive, playMotionResponse, handleAutomaticAnalysis, playWelcomeResponse, onAiLoading]);

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
  }, []);

  // Reset interaction state
  const resetInteractionState = useCallback(() => {
    setAnalysisCompleteTime(0);
    setIsInteractionActive(false);
  }, []);

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
    isSpeaking,
    
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
