import React, { useState, useEffect } from 'react';
import { useWebcam } from '../../../hooks/useWebcam';
import ApiClient from '../../../services/apiClient';
import { speechService } from '../../../services/speechService';
import VideoFeed from './VideoFeed';
import AiControlButtons from './AiControlButtons';
import DetectionOverlay, { DetectionResult } from './DetectionOverlay';

interface WebcamPanelProps {
  onAiMessage?: (message: string, type: 'ai-response' | 'outfit-analysis' | 'general') => void;
  onAiLoading?: (loading: boolean) => void;
}

const WebcamPanel: React.FC<WebcamPanelProps> = ({ onAiMessage, onAiLoading }) => {
  const {
    stream,
    isCapturing,
    isInitialized,
    error,
    videoRef,
    startWebcam,
    stopWebcam,
    captureFrame,
    captureFrameAsBlob
  } = useWebcam();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalysisInterval, setAutoAnalysisInterval] = useState<NodeJS.Timeout | null>(null);
  const [showDebugControls, setShowDebugControls] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [showDetectionOverlay, setShowDetectionOverlay] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  
  const handleVoiceChange = (voice: string) => {
    console.log('WebcamPanel received voice change:', voice);
    setSelectedVoice(voice);
  };

  // Auto-start webcam when component mounts
  useEffect(() => {
    startWebcam();
    
    // Cleanup on unmount
    return () => {
      stopWebcam();
    };
  }, []); // Empty dependency array - only run once

  /**
   * Shared AI Analysis Handler
   * 
   * This function handles basic outfit analysis, weather-aware outfit analysis, and enhanced analysis.
   * It captures a webcam frame and sends it to the appropriate AI service based on the type.
   */
  const handleAiAnalysis = async (analysisType: 'basic' | 'weather' | 'enhanced' | 'roboflow') => {
    if (!isInitialized) {
      console.error("Webcam not initialized");
      onAiMessage?.("Webcam not initialized. Please start the webcam first.", 'ai-response');
      return;
    }

    setIsAnalyzing(true);
    onAiLoading?.(true);

    try {
      // Step 1: Capture current webcam frame as a blob
      const blob = await captureFrameAsBlob();
      if (!blob) {
        throw new Error("Failed to capture frame");
      }

      // Step 2: Convert blob to File object for API transmission
      const filename = analysisType === 'weather' ? 'weather-outfit-analysis.jpg' 
        : analysisType === 'enhanced' ? 'enhanced-analysis.jpg' 
        : 'outfit-analysis.jpg';
      const imageFile = new File([blob], filename, { type: 'image/jpeg' });
      
      // Step 3: Send to appropriate AI service with voice preference
      let result;
      if (analysisType === 'enhanced') {
        result = await ApiClient.analyzeOutfitEnhanced(imageFile) as any;
        // Update detections state for overlay display
        setDetections(result.detections || []);
      } else if (analysisType === 'weather') {
        // Use enhanced analysis with weather context
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('voice', selectedVoice);
        
        console.log('Sending enhanced analysis request with voice:', selectedVoice);
        
        const response = await fetch(`http://localhost:5005/api/ai/analyze-outfit-enhanced?voice=${selectedVoice}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        result = await response.json();
        
        console.log('Received enhanced analysis result:', result);
        
        // Update detections state for overlay display
        setDetections(result.detections || []);
      } else if (analysisType === 'roboflow') {
        result = await ApiClient.detectClothing(imageFile) as any;
        // Update detections state for overlay display
        setDetections(result.detections || []);
      } else {
        // Create FormData with voice preference
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('voice', selectedVoice);
        
        console.log('Sending outfit analysis request with voice:', selectedVoice);
        
        const response = await fetch(`http://localhost:5005/api/ai/analyze-outfit?voice=${selectedVoice}`, {
          method: 'POST',
          body: formData,
        });
        result = await response.json();
        
        console.log('Received outfit analysis result:', result);
      }
      
      // Step 4: Display the response and play audio if available
      if (analysisType === 'weather') {
        // Weather analysis is handled in the streaming section above
        // No additional processing needed here
      } else if (analysisType === 'roboflow') {
        // Pure Roboflow detection - format the response
        if (result.detections && result.detections.length > 0) {
          const detectedItems = result.detections.map((d: any) => 
            `${d.label} (${(d.confidence * 100).toFixed(0)}% confidence)`
          ).join(', ');
          
          const roboflowMessage = `ROBOFLOW DETECTION: I detected the following clothing items: ${detectedItems}`;
          onAiMessage?.(roboflowMessage, 'ai-response');
          speechService.speak(roboflowMessage);
        } else {
          const noDetectionMessage = "ROBOFLOW DETECTION: No clothing items detected in the image.";
          onAiMessage?.(noDetectionMessage, 'ai-response');
          speechService.speak(noDetectionMessage);
        }
      } else {
        // AI analysis responses with combined audio (basic and enhanced)
        console.log('AI response structure:', result);
        // Extract the actual analysis text from the response
        let analysisText;
        if (result.analysis && typeof result.analysis === 'object' && result.analysis.value) {
          // Handle Promise.allSettled result structure
          analysisText = result.analysis.value;
        } else if (typeof result.analysis === 'string') {
          analysisText = result.analysis;
        } else {
          analysisText = JSON.stringify(result.analysis);
        }
        console.log('Analysis text:', analysisText);
        onAiMessage?.(analysisText, 'ai-response');
        
        // Play audio immediately if provided in response
        if (result.audio) {
          try {
            console.log('Audio data length:', result.audio.length);
            console.log('Voice from response:', result.voice);
            
            // Convert base64 to binary data
            const binaryString = atob(result.audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
            console.log('Audio blob size:', audioBlob.size);
            
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            // Add event listeners
            audio.onloadstart = () => console.log('Audio loading started');
            audio.oncanplay = () => console.log('Audio can play, duration:', audio.duration);
            audio.onplay = () => console.log('Audio started playing');
            audio.onended = () => {
              console.log('Audio finished playing');
              URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = (e) => console.error('Audio error:', e);
            
            await audio.play();
            console.log('Playing ElevenLabs audio with voice:', result.voice);
            
          } catch (audioError) {
            console.error('Failed to play ElevenLabs audio, falling back to TTS:', audioError);
            speechService.speak(analysisText);
          }
        } else {
          // Fallback to TTS if no audio provided
          console.log('No audio provided, using TTS fallback');
          speechService.speak(analysisText);
        }
      }
      
    } catch (error) {
      const errorType = analysisType === 'weather' ? 'Weather outfit analysis' 
        : analysisType === 'enhanced' ? 'Enhanced analysis' 
        : analysisType === 'roboflow' ? 'Roboflow detection'
        : 'Outfit analysis';
      console.error(`${errorType} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : `${errorType} failed. Please try again.`;
      onAiMessage?.(errorMessage, 'ai-response');
    } finally {
      setIsAnalyzing(false);
      onAiLoading?.(false);
    }
  };

  // Wrapper functions for the buttons
  const handleOutfitAnalysis = () => handleAiAnalysis('basic');
  const handleWeatherOutfitAnalysis = () => handleAiAnalysis('weather');
  const handleRoboflowDetection = () => handleAiAnalysis('roboflow');

  return (
    <div className="flex flex-col">
      {/* Video Feed Component */}
      <VideoFeed
        stream={stream}
        isInitialized={isInitialized}
        isCapturing={isCapturing}
        error={error}
        videoRef={videoRef}
      />

      {/* Detection Overlay */}
      <DetectionOverlay
        detections={detections}
        videoRef={videoRef}
        showOverlay={showDetectionOverlay}
      />

      {/* AI Control Buttons Component */}
      <AiControlButtons
        isInitialized={isInitialized}
        isAnalyzing={isAnalyzing}
        onOutfitAnalysis={handleOutfitAnalysis}
        onWeatherOutfitAnalysis={handleWeatherOutfitAnalysis}
        onEnhancedAnalysis={handleRoboflowDetection}
        onStartWebcam={startWebcam}
        onStopWebcam={stopWebcam}
        onVoiceChange={handleVoiceChange}
      />
    </div>
  );
};

export default WebcamPanel;
