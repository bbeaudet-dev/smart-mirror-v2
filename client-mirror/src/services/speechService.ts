

export class SpeechService {
  private isEnabled: boolean = true;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    // Initialize audio context for TTS
    this.initAudioContext();
  }

  /**
   * Initialize audio context (required for modern browsers)
   */
  private initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Speak text using OpenAI TTS with Web Speech API fallback
   */
  async speak(text: string, personality: string = 'default') {
    if (!this.isEnabled || !text) {
      return;
    }

    try {
      // Try OpenAI TTS first
      await this.speakWithOpenAI(text, personality);
    } catch (error) {
      console.error('OpenAI TTS failed, falling back to Web Speech API:', error);
      this.speakWithWebSpeech(text, personality);
    }
  }

  /**
   * Speak text using OpenAI TTS
   */
  private async speakWithOpenAI(text: string, personality: string) {
    // Stop any currently playing audio
    this.stop();

    console.log(`Generating speech: "${text.substring(0, 50)}..." with personality: ${personality}`);

    // Generate speech using backend
    const audioBlob = await this.generateSpeech(text, personality);
    
    // Create audio element and play
    const audioUrl = URL.createObjectURL(audioBlob);
    this.currentAudio = new Audio(audioUrl);
    
    // Resume audio context if suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Play the audio
    await this.currentAudio.play();
    
    console.log('Speech playback started');

    // Clean up URL when audio finishes
    this.currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      this.currentAudio = null;
    };
  }

  /**
   * Generate speech audio blob from backend
   */
  private async generateSpeech(text: string, personality: string): Promise<Blob> {
    try {
      const response = await fetch(`http://localhost:5005/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          personality
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS generation failed');
      }

      return await response.blob();

    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Speak text using Web Speech API (fallback)
   */
  private speakWithWebSpeech(text: string, personality: string) {
    if (!('speechSynthesis' in window)) {
      console.error('Web Speech API not supported');
      return;
    }

    // Cancel any currently speaking
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Adjust voice properties based on personality (faster speeds)
    switch (personality) {
      case "snoop":
        utterance.rate = 1.1; // Faster but still relaxed
        utterance.pitch = 0.9; // Slightly lower pitch
        utterance.volume = 0.9;
        break;
      case "elle":
        utterance.rate = 1.4; // Much faster, more energetic
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 0.9;
        break;
      default:
        utterance.rate = 1.3; // Faster default speed
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
    }

    speechSynthesis.speak(utterance);
  }

  /**
   * Stop any currently speaking
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Enable or disable speech
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Check if speech is available
   */
  isAvailable(): boolean {
    return this.isSupported() || 'speechSynthesis' in window;
  }

  /**
   * Check if TTS is supported
   */
  private isSupported(): boolean {
    return typeof window !== 'undefined' && 
           (window.AudioContext || (window as any).webkitAudioContext) !== undefined;
  }
}

// Export a singleton instance
export const speechService = new SpeechService();
