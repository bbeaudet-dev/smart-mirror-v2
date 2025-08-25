import React, { useState, useEffect } from 'react';

interface VoiceSelectorProps {
  onVoiceChange: (voice: string) => void;
  currentVoice?: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onVoiceChange, currentVoice = 'default' }) => {
  const [voices, setVoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/tts/voices');
      const data = await response.json();
      setVoices(data.voices || []);
    } catch (error) {
      console.error('Error fetching voices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const voiceDescriptions = {
    nova: 'Natural & Balanced (Default)',
    rachel: 'Casual & Personable',
    clyde: 'Intense & Character',
    roger: 'Classy & Easy-going',
    sarah: 'Professional & Warm',
    laura: 'Sassy & Energetic',
    thomas: 'Meditative & Soft',
    charlie: 'Australian & Confident',
    george: 'British & Mature',
    callum: 'Gravelly & Edgy',
    river: 'Neutral & Relaxed',
    harry: 'Rough & Warrior-like',
    liam: 'Confident & Young',
    alice: 'British Professional',
    matilda: 'Upbeat & Professional',
    will: 'Chill & Conversational',
    jessica: 'Cute & Young',
    eric: 'Classy & Smooth',
    chris: 'Casual & Natural',
    brian: 'Middle-aged & Resonant',
    daniel: 'British & Formal',
    lily: 'British & Warm',
    bill: 'Friendly & Old'
  };

  if (isLoading) {
    return <div className="text-mirror-xs text-mirror-text-dimmed">Loading voices...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {voices.map((voice) => (
        <button
          key={voice}
          onClick={() => onVoiceChange(voice)}
          className={`
            px-3 py-1 rounded-full text-xs font-medium transition-colors
            ${currentVoice === voice 
              ? 'bg-mirror-text text-mirror-bg' 
              : 'bg-mirror-text-dimmed/20 text-mirror-text hover:bg-mirror-text-dimmed/30'
            }
          `}
          title={voiceDescriptions[voice as keyof typeof voiceDescriptions] || voice}
        >
          {voice}
        </button>
      ))}
    </div>
  );
};

export default VoiceSelector;
