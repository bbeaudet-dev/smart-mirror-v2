const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

class TTSService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Available OpenAI TTS voices
    this.voices = {
      alloy: 'alloy',
      echo: 'echo', 
      fable: 'fable',
      onyx: 'onyx',
      nova: 'nova',
      shimmer: 'shimmer'
    };
    
    // Default voice
    this.defaultVoice = 'nova';
    
    // Audio cache directory
    this.cacheDir = path.join(__dirname, '..', 'data', 'audio-cache');
    this.ensureCacheDirectory();
  }

  /**
   * Ensure audio cache directory exists
   */
  ensureCacheDirectory() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(text, voice = null, personality = 'default') {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Select voice based on personality or use default
      const selectedVoice = this.selectVoiceForPersonality(personality, voice);
      
      console.log(`Generating speech with voice: ${selectedVoice}`);

      // Create a unique filename for caching
      const textHash = this.hashText(text);
      const cacheFile = path.join(this.cacheDir, `${textHash}_${selectedVoice}.opus`);

      // Check if we have a cached version
      if (fs.existsSync(cacheFile)) {
        console.log('Using cached audio file');
        return {
          audioBuffer: fs.readFileSync(cacheFile),
          voice: selectedVoice,
          cached: true
        };
      }

      // Generate new speech with optimized settings
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: selectedVoice,
        input: text,
        response_format: 'opus', // Use opus format for smaller files (better than OGG)
        speed: 1.3 // Faster speed for quicker responses
      });

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      // Cache the audio file asynchronously to not block the response
      fs.writeFile(cacheFile, audioBuffer, (err) => {
        if (err) {
          console.error('Error caching audio:', err);
        } else {
          console.log('Audio cached for future use');
        }
      });

      return {
        audioBuffer,
        voice: selectedVoice,
        cached: false
      };

    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  /**
   * Select voice based on personality
   */
  selectVoiceForPersonality(personality, overrideVoice = null) {
    if (overrideVoice && this.voices[overrideVoice]) {
      return this.voices[overrideVoice];
    }

    const personalityVoices = {
      snoop: 'onyx',      // Deep, smooth voice
      elle: 'shimmer',    // Bright, energetic voice
      default: 'nova',    // Balanced, natural voice
      news: 'echo',       // Clear, authoritative voice
      weather: 'fable',   // Warm, friendly voice
      calendar: 'alloy'   // Professional, clear voice
    };

    return this.voices[personalityVoices[personality] || 'nova'];
  }

  /**
   * Simple hash function for text caching
   */
  hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return Object.keys(this.voices);
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.cacheDir, file));
      });
      console.log('Audio cache cleared');
    }
  }
}

module.exports = TTSService;
