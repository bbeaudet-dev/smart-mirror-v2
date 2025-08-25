import React, { useState, useEffect } from 'react';

interface AiControlButtonsProps {
  isInitialized: boolean;
  isAnalyzing: boolean;
  onOutfitAnalysis: () => void;
  onWeatherOutfitAnalysis: () => void;
  onEnhancedAnalysis: () => void;
  onStartWebcam: () => void;
  onStopWebcam: () => void;
  onVoiceChange?: (voice: string) => void;
}

/**
 * AiControlButtons Component
 * 
 * This component provides all the AI analysis control buttons.
 * Each button triggers a different AI personality or analysis type.
 * Buttons are disabled during analysis to prevent multiple requests.
 */
const AiControlButtons: React.FC<AiControlButtonsProps> = ({
  isInitialized,
  isAnalyzing,

  onOutfitAnalysis,
  onWeatherOutfitAnalysis,
  onEnhancedAnalysis,
  
  onStartWebcam,
  onStopWebcam,
  onVoiceChange
}) => {
  const [voices, setVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      // Get ElevenLabs voices from the API
      const response = await fetch('http://localhost:5005/api/tts/voices');
      const data = await response.json();
      
      if (data.voices && data.voices.length > 0) {
        setVoices(data.voices);
      } else {
        // Fallback to popular ElevenLabs voices
        setVoices(['nova', 'rachel', 'clyde', 'roger', 'sarah', 'laura', 'thomas', 'charlie', 'george', 'callum', 'river', 'harry', 'liam', 'alice', 'matilda', 'will', 'jessica', 'eric', 'chris', 'brian', 'daniel', 'lily', 'bill']);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
      // Fallback to basic voices
      setVoices(['nova', 'rachel', 'clyde', 'roger', 'sarah', 'laura', 'thomas', 'charlie', 'george', 'callum', 'river', 'harry', 'liam', 'alice', 'matilda', 'will', 'jessica', 'eric', 'chris', 'brian', 'daniel', 'lily', 'bill']);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleVoiceChange = (voice: string) => {
    console.log('Voice changed to:', voice);
    setSelectedVoice(voice);
    onVoiceChange?.(voice);
  };
  return (
    <div className="flex flex-col items-end py-2 px-4 space-y-2">
      <div className="flex space-x-2">
        {/* Webcam Control Button */}
        <button
          onClick={isInitialized ? onStopWebcam : onStartWebcam}
          className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
            isInitialized
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isInitialized ? 'Stop Webcam' : 'Start Webcam'}
        </button>

        <button
          onClick={onOutfitAnalysis}
          disabled={isAnalyzing}
          className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
            isAnalyzing
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          {isAnalyzing ? 'Processing...' : 'Outfit'}
        </button>

        <button
          onClick={onWeatherOutfitAnalysis}
          disabled={isAnalyzing}
          className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
            isAnalyzing
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isAnalyzing ? 'Processing...' : 'Outfit + Weather'}
        </button>

        <button
          onClick={onEnhancedAnalysis}
          disabled={isAnalyzing}
          className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
            isAnalyzing
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isAnalyzing ? 'Processing...' : 'Roboflow'}
        </button>
      </div>

      {/* Voice Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-xs text-white font-medium">Voice:</label>
        <select
          value={selectedVoice}
          onChange={(e) => handleVoiceChange(e.target.value)}
          disabled={isLoadingVoices}
          className="px-2 py-1 rounded text-xs bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          {isLoadingVoices ? (
            <option>Loading...</option>
          ) : (
            voices.map((voice) => (
              <option key={voice} value={voice}>
                {voice}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default AiControlButtons;
