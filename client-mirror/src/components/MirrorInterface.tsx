import React, { useState, useEffect, useRef } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useMotionDetection } from '../hooks/useMotionDetection';

// Components
import TimeDisplay from './modules/TimeDisplay';
import WeatherPanel from './modules/weather/WeatherPanel';
// import CalendarPanel from './modules/CalendarPanel'; // Temporarily disabled
import RotatingNewsPanel from './modules/RotatingNewsPanel';
import MessagePanel from './modules/messages/MessagePanel';
import StatusIndicators from './modules/StatusIndicators';

type MessageType = 'ai-response' | 'outfit-analysis' | 'general' | 'motion' | 'welcome' | 'sendoff';

function MirrorInterface() {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>('ai-response');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMotionDetected, setIsMotionDetected] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const handleAiMessage = (msg: string, type: MessageType) => {
    setMessage(msg);
    setMessageType(type);
  };

  // Webcam initialization
  const {
    stream,
    isInitialized,
    videoRef,
    startWebcam,
    stopWebcam,
  } = useWebcam();

  // Motion detection
  const {
    isMotionDetected: motionDetected,
    isSpeaking,
    isMotionDetectionRunning,
    startMotionDetection,
    stopMotionDetection,
  } = useMotionDetection(videoRef as React.RefObject<HTMLVideoElement>, {
    threshold: 0.025,
    interval: 100,
    minMotionDuration: 250,
    isAutomaticMode: true,
    onAiMessage: handleAiMessage,
    onAiLoading: setIsAiLoading,
    onSpeakingChange: () => {}, // Speaking state handled internally
  });

  // Webcam toggle function
  const toggleWebcam = () => {
    if (isInitialized) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Auto-start webcam on mount
  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      stopMotionDetection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start motion detection when webcam is initialized
  useEffect(() => {
    if (isInitialized && !isMotionDetectionRunning) {
      startMotionDetection();
    }
  }, [isInitialized, isMotionDetectionRunning, startMotionDetection]);

  // Set up video element when stream is available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // Update motion detected state
  useEffect(() => {
    setIsMotionDetected(motionDetected);
  }, [motionDetected]);

  // Update webcam active state
  useEffect(() => {
    const streamActive = stream ? stream.active : false;
    setIsWebcamActive(isInitialized && streamActive);
  }, [isInitialized, stream]);

  return (
    <div className="w-full h-full bg-mirror-bg text-mirror-text font-mirror-primary p-4">
      <div className="w-full h-full flex flex-col">
        {/* Time Display - Top Left */}
        <div className="flex justify-start py-1 px-1">
          <TimeDisplay />
        </div>
        
        {/* Spacing between time and weather */}
        <div className="h-8"></div>
        
        {/* Weather Panel - Left justified */}
        <div className="flex justify-start px-1">
          {/* Weather Panel - Left 60% */}
          <div className="w-[60%]">
            <WeatherPanel />
          </div>
        </div>
        
        {/* News Panel - Underneath weather, left justified */}
        <div className="flex justify-start px-1 mt-4">
          <div className="w-[60%]">
            <RotatingNewsPanel />
          </div>
        </div>
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Hidden video element for camera system */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
          style={{
            transform: 'rotate(90deg)',
            transformOrigin: 'center center'
          }}
        />

        {/* Status Indicators - Bottom Right */}
        <StatusIndicators
          isMotionDetected={isMotionDetected}
          isThinking={isAiLoading}
          isSpeaking={isSpeaking}
          isWebcamActive={isWebcamActive}
          onWebcamToggle={toggleWebcam}
        />

        {/* Message Panel - Bottom Center */}
        <MessagePanel 
          message={message}
          type={messageType}
        />
      </div>
    </div>
  );
}

export default MirrorInterface;
