// Use environment variable or try to detect the correct server URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname ? 'http://localhost:5005' : `http://${window.location.hostname}:5005`);

console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 window.location.hostname:', window.location.hostname);
console.log('🔧 import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
  

class ApiClient {
  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  static async get(endpoint) {
    try {
      console.log(`🌐 API GET Request: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API GET Error (${endpoint}):`, error);
      console.error(`API Base URL: ${API_BASE_URL}`);
      console.error(`Full URL: ${API_BASE_URL}${endpoint}`);
      console.error(`Error type:`, typeof error);
      console.error(`Error message:`, error.message);
      console.error(`Error stack:`, error.stack);
      throw error;
    }
  }

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - Response data
   */
  static async post(endpoint, data) {
    try {
      console.log(`🌐 API POST Request: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`API POST Error (${endpoint}):`, error);
      console.error(`API Base URL: ${API_BASE_URL}`);
      console.error(`Full URL: ${API_BASE_URL}${endpoint}`);
      throw error;
    }
  }

  /**
   * Get weather data
   * @returns {Promise<Object>} - Weather information
   */
  static async getWeather() {
    return this.get('/api/weather');
  }

  /**
   * Get calendar events
   * @returns {Promise<Array>} - Calendar events
   */
  static async getCalendar() {
    return this.get('/api/calendar');
  }

  /**
   * Get routine by type
   * @param {string} type - 'morning' or 'evening'
   * @returns {Promise<Array>} - Routine tasks
   */
  static async getRoutine(type) {
    return this.get(`/api/routine/${type}`);
  }

  /**
   * Get news headlines
   * @returns {Promise<Array>} - News articles
   */
  static async getNews() {
    return this.get('/api/news');
  }

  /**
   * Get horoscope data
   * @returns {Promise<Object>} - Horoscope information
   */
  static async getHoroscope() {
    return this.get('/api/horoscope');
  }

  /**
   * Get outfit recommendation based on weather
   * @param {number} temperature - Temperature in Fahrenheit
   * @param {string} condition - Weather condition
   * @param {string} timeOfDay - Time of day (morning/afternoon/evening/night)
   * @param {string} recommendationType - Type of recommendation (current/tomorrow)
   * @param {Array} forecast - Weather forecast data
   * @returns {Promise<Object>} - Outfit recommendation
   */
  static async getOutfitRecommendation(temperature, condition, timeOfDay, recommendationType, forecast) {
    if (!temperature || !condition) {
      throw new Error('Temperature and condition are required for outfit recommendations');
    }
    return this.post('/api/ai/outfit-recommendation', {
      temperature,
      condition,
      timeOfDay,
      recommendationType,
      forecast
    });
  }

  /**
   * Analyze outfit with weather context
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Weather-aware outfit analysis result
   */
  static async analyzeOutfitWithWeather(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const url = `${API_BASE_URL}/api/ai/analyze-outfit-with-weather`;
    console.log('Attempting weather-aware outfit analysis:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Weather-Aware Outfit Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Basic outfit analysis
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Outfit analysis result
   */
  static async analyzeOutfit(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-outfit`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Outfit Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Detect clothing items using Roboflow
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Clothing detection results
   */
  static async detectClothing(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/detect-clothing`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Clothing Detection Error:', error);
      throw error;
    }
  }

  /**
   * Enhanced outfit analysis with Roboflow + OpenAI
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Enhanced analysis results with detections
   */
  static async analyzeOutfitEnhanced(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-outfit-enhanced`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Enhanced Outfit Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Magic Mirror text-only analysis
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Magic Mirror analysis result
   */
  static async magicMirrorAnalysis(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/magic-mirror`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Magic Mirror Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Magic Mirror analysis with TTS
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Magic Mirror analysis result with audio
   */
  static async magicMirrorTTS(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/magic-mirror-tts`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Magic Mirror TTS Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Snoop Dogg analysis with TTS
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Snoop Dogg analysis result with audio
   */
  static async snoopAnalysis(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/snoop`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Snoop Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Automatic analysis for motion detection
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Automatic analysis result with audio
   */
  static async automaticAnalysis(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/automatic`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Automatic Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Get pre-generated audio status
   * @returns {Promise<Object>} - Status of pre-generated audio files
   */
  static async getPreGeneratedAudioStatus() {
    return this.get('/api/pre-generated-audio/status');
  }

  /**
   * Generate all pre-generated audio files
   * @returns {Promise<Object>} - Generation result
   */
  static async generatePreGeneratedAudio() {
    return this.post('/api/pre-generated-audio/generate', {});
  }

  /**
   * Get a random motion response audio URL
   * @returns {string} - URL to motion audio file
   */
  static getMotionAudioUrl() {
    return `${API_BASE_URL}/api/pre-generated-audio/motion`;
  }

  /**
   * Get a random welcome response audio URL
   * @returns {string} - URL to welcome audio file
   */
  static getWelcomeAudioUrl() {
    return `${API_BASE_URL}/api/pre-generated-audio/welcome`;
  }

  /**
   * Get a random sendoff response audio URL
   * @returns {string} - URL to sendoff audio file
   */
  static getSendoffAudioUrl() {
    return `${API_BASE_URL}/api/pre-generated-audio/sendoff`;
  }

  /**
   * Get motion response with both audio and text (JSON format)
   * @param {string} voice - Voice to use
   * @returns {Promise<Object>} - Motion response with text and base64 audio
   */
  static async getMotionWithText(voice = 'ash') {
    return this.get(`/api/pre-generated-audio/motion?format=json&voice=${voice}`);
  }

  /**
   * Get welcome response with both audio and text (JSON format)
   * @param {string} voice - Voice to use
   * @returns {Promise<Object>} - Welcome response with text and base64 audio
   */
  static async getWelcomeWithText(voice = 'ash') {
    return this.get(`/api/pre-generated-audio/welcome?format=json&voice=${voice}`);
  }

  /**
   * Get sendoff response with both audio and text (JSON format)
   * @param {string} voice - Voice to use
   * @returns {Promise<Object>} - Sendoff response with text and base64 audio
   */
  static async getSendoffWithText(voice = 'ash') {
    return this.get(`/api/pre-generated-audio/sendoff?format=json&voice=${voice}`);
  }

  /**
   * Get a random motion response text
   * @returns {Promise<Object>} - Motion response text
   */
  static async getMotionText() {
    return this.get('/api/pre-generated-audio/motion-text');
  }

  /**
   * Get a random welcome response text
   * @returns {Promise<Object>} - Welcome response text
   */
  static async getWelcomeText() {
    return this.get('/api/pre-generated-audio/welcome-text');
  }

  /**
   * Get a random sendoff response text
   * @returns {Promise<Object>} - Sendoff response text
   */
  static async getSendoffText() {
    return this.get('/api/pre-generated-audio/sendoff-text');
  }

  /**
   * Get all available response messages
   * @returns {Promise<Object>} - All response messages
   */
  static async getResponses() {
    return this.get('/api/pre-generated-audio/responses');
  }

}

export default ApiClient;
