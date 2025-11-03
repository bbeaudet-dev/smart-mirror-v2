import React from 'react';
import StatusIndicator from '../StatusIndicator';

interface StatusIndicatorsProps {
  isMotionDetected?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean; // Computer is playing audio (output)
  isListening?: boolean; // User microphone input detection (future feature)
  isWebcamActive?: boolean;
  onWebcamToggle?: () => void;
}

const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
  isMotionDetected = false,
  isThinking = false,
  isSpeaking = false,
  isListening = false, // Future: user voice input detection
  isWebcamActive = false,
  onWebcamToggle
}) => {
  // Motion icon - concentric circles (radar/sensor style)
  const MotionIcon = (
    <svg 
      className={`w-5 h-5 transition-colors duration-300 ${
        isMotionDetected ? 'text-mirror-text' : 'text-mirror-text-dimmed'
      }`}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 20 20"
    >
      <circle cx="10" cy="10" r="3" fill="currentColor" />
      <circle cx="10" cy="10" r="6" />
      <circle cx="10" cy="10" r="8.5" />
    </svg>
  );

  // Speaker icon for computer audio output
  const SpeakerIcon = (
    <svg 
      className={`w-5 h-5 transition-colors duration-300 ${
        isSpeaking ? 'text-mirror-text' : 'text-mirror-text-dimmed'
      }`}
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.366 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.366l4.017-3.793a1 1 0 011.617-.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
    </svg>
  );

  // Microphone icon for user audio input
  const MicrophoneIcon = (
    <svg 
      className={`w-5 h-5 transition-colors duration-300 ${
        isListening ? 'text-mirror-text' : 'text-mirror-text-dimmed'
      }`}
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
      <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
    </svg>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-row gap-3 items-center">
      {/* Motion Indicator - Motion Icon */}
      <StatusIndicator isActive={isMotionDetected}>
        {MotionIcon}
      </StatusIndicator>

      {/* Thinking Indicator - AI Text */}
      <StatusIndicator isActive={isThinking}>
        <span className={`text-sm font-bold transition-colors duration-300 ${
          isThinking ? 'text-mirror-text' : 'text-mirror-text-dimmed'
        }`}>AI</span>
      </StatusIndicator>

      {/* Speaking Indicator - Speaker Icon */}
      <StatusIndicator isActive={isSpeaking}>
        {SpeakerIcon}
      </StatusIndicator>

      {/* Listening Indicator - Microphone Icon */}
      <StatusIndicator isActive={isListening}>
        {MicrophoneIcon}
      </StatusIndicator>

      {/* Webcam Indicator - Camera Icon with Start/Stop button */}
      {onWebcamToggle && (
        <div className="flex items-center gap-2">
          <StatusIndicator 
            isActive={isWebcamActive}
            onClick={onWebcamToggle}
            title={isWebcamActive ? 'Stop Webcam' : 'Start Webcam'}
          >
            <svg 
              className={`w-5 h-5 transition-colors duration-300 ${
                isWebcamActive ? 'text-mirror-text' : 'text-mirror-text-dimmed'
              }`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </StatusIndicator>
          <button
            onClick={onWebcamToggle}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isWebcamActive
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-500'
            }`}
          >
            {isWebcamActive ? 'Stop' : 'Start'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusIndicators;

