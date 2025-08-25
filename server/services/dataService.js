
// Import weather service singleton
const weatherService = require('./weatherService');

class DataService {

  /**
   * Get weather data
   * @param {string} location - Optional location override
   * @returns {Promise<Object>} - Weather information
   */
  static async getWeather(location) {
    try {
      return await weatherService.getWeatherData(location);
    } catch (error) {
      console.error('Weather data unavailable:', error.message);
      return {
        error: true,
        message: 'Weather data unavailable',
        current: {
          temperature: null,
          condition: 'Unknown',
          icon: '❓'
        },
        forecast: [],
        location: location || 'Unknown',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get system status
   * @returns {Promise<Object>} - System status information
   */
  static async getSystemStatus() {
    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };
  }
}

module.exports = DataService;
