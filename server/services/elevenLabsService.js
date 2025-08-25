const ElevenLabs = require('elevenlabs-node');

class ElevenLabsService {
  constructor() {
    console.log('ElevenLabs API Key:', process.env.ELEVENLABS_API_KEY ? 'Present' : 'Missing');
    this.client = new ElevenLabs({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    
    // Real voice IDs from ElevenLabs API
    this.voices = {
      'nova': 'pNInz6obpgDQGcFmaJgB', // Default Nova voice
      'rachel': '21m00Tcm4TlvDq8ikWAM', // Rachel - casual woman
      'clyde': '2EiwWnXFnvU5JabPnv8n', // Clyde - intense male
      'roger': 'CwhRBWXzGAHq8TQ4Fs17', // Roger - classy male
      'sarah': 'EXAVITQu4vr4xnSDxMaL', // Sarah - professional woman
      'laura': 'FGY2WhTYpPnrIDTdsKH5', // Laura - sassy young woman
      'thomas': 'GBv7mTt0atIp3Br8iCZE', // Thomas - meditative male
      'charlie': 'IKne3meq5aSn9XLyUdCD', // Charlie - Australian male
      'george': 'JBFqnCBsd6RMkjVDRZzb', // George - British mature male
      'callum': 'N2lVS1w4EtoT3dr4eOWO', // Callum - gravelly male
      'river': 'SAz9YHcvj6GT2YYXdXww', // River - neutral voice
      'harry': 'SOYHLrjzK2X1ezoPC6cr', // Harry - rough warrior
      'liam': 'TX3LPaxmHKxFdv7VOQHJ', // Liam - confident young male
      'alice': 'Xb7hH8MSUJpSbSDYk0k2', // Alice - British professional
      'matilda': 'XrExE9yKIg1WjnnlVkGX', // Matilda - upbeat woman
      'will': 'bIHbv24MWmeRgasZH58o', // Will - chill male
      'jessica': 'cgSgspJ2msm6clMCkdW9', // Jessica - cute young woman
      'eric': 'cjVigY5qzO86Huf0OWal', // Eric - classy male
      'chris': 'iP95p4xoKVk53GoZ742B', // Chris - casual male
      'brian': 'nPczCjzI2devNBz1zQrb', // Brian - classy middle-aged
      'daniel': 'onwK4e9ZLuTAKqWW03F9', // Daniel - British formal
      'lily': 'pFZP5JQG7iQjIQuC4Bku', // Lily - British warm
      'bill': 'pqHfZKP75CvOlQylNhV4', // Bill - friendly old male
    };
  }

  /**
   * Stream audio from text using ElevenLabs
   * @param {string} text - Text to convert to speech
   * @param {string} voiceId - Voice ID to use
   * @returns {Promise<ReadableStream>} - Audio stream
   */
  async streamAudio(text, voiceId = 'nova') {
    try {
      console.log('ElevenLabs streamAudio called with voiceId:', voiceId);
      console.log('Available voices:', Object.keys(this.voices));
      
      const voice = this.voices[voiceId] || this.voices['nova'];
      console.log('Selected voice ID:', voice);
      
      if (!voice) {
        throw new Error(`Voice '${voiceId}' not found. Available voices: ${Object.keys(this.voices).join(', ')}`);
      }
      
      console.log('Generating TTS with voice:', voiceId, 'voice_id:', voice);
      
      // Try using textToSpeechStream method instead
      const audioStream = await this.client.textToSpeechStream({
        textInput: text,
        voice_id: voice,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      });

      console.log('Audio stream received:', typeof audioStream);
      return audioStream;
    } catch (error) {
      console.error('ElevenLabs streaming error:', error);
      throw new Error(`Failed to stream audio: ${error.message}`);
    }
  }

  /**
   * Get available voices
   * @returns {Promise<Array>} - List of available voices
   */
  async getVoices() {
    try {
      const voices = await this.client.getVoices();
      console.log('Raw voices response:', typeof voices, voices);
      if (voices && typeof voices === 'object' && voices.voices) {
        console.log('Found voices in response.voices:', voices.voices.length);
        return voices.voices;
      }
      return voices;
    } catch (error) {
      console.error('Failed to get ElevenLabs voices:', error);
      return [];
    }
  }

  /**
   * Test if API key is valid
   * @returns {Promise<boolean>} - True if valid
   */
  async testConnection() {
    try {
      console.log('Attempting to get voices from ElevenLabs...');
      // Try a simple API call to test connection
      const voices = await this.client.getVoices();
      console.log('ElevenLabs getVoices response:', voices ? 'success' : 'null');
      console.log('Voices type:', typeof voices);
      console.log('Voices:', voices);
      
      // Check if we got a valid response (even if empty array)
      if (voices !== null && voices !== undefined) {
        console.log('✅ ElevenLabs API is responding');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('ElevenLabs connection test failed:', error);
      console.error('Error details:', error.message);
      return false;
    }
  }
}

module.exports = ElevenLabsService;
