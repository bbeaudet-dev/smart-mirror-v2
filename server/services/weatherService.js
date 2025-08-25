const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'http://api.weatherapi.com/v1';
    
    // Default location (can be made configurable)
    this.defaultLocation = process.env.WEATHER_LOCATION || 'New York, NY';
    
    // Weather cache
    this.cache = {
      data: null,
      timestamp: null,
      location: null
    };
    
    // Cache duration: 10 minutes
    this.cacheDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
  }

  /**
   * Get current weather and forecast with caching
   * @param {string} location - City, state or coordinates
   * @returns {Promise<Object>} - Weather data
   */
  async getWeatherData(location = this.defaultLocation) {
    try {
      if (!this.apiKey) {
        console.warn('Weather API key not configured');
        throw new Error('Weather API key not configured');
      }

      // Check if we have valid cached data
      const now = Date.now();
      if (this.cache.data && 
          this.cache.timestamp && 
          this.cache.location === location &&
          (now - this.cache.timestamp) < this.cacheDuration) {
        console.log('Using cached weather data');
        return this.cache.data;
      }

      console.log('Fetching fresh weather data from API');
      const response = await axios.get(`${this.baseUrl}/forecast.json`, {
        params: {
          key: this.apiKey,
          q: location,
          days: 3,
          aqi: 'no'
        }
      });

      const weatherData = this.formatWeatherData(response.data);
      
      // Cache the new data
      this.cache = {
        data: weatherData,
        timestamp: now,
        location: location
      };
      
      console.log('Weather data cached for 10 minutes');
      return weatherData;
    } catch (error) {
      console.error('Weather API Error:', error.message);
      throw new Error(`Unable to retrieve weather data: ${error.message}`);
    }
  }

  /**
   * Format weather data from API response
   * @param {Object} apiData - Raw API response
   * @returns {Object} - Formatted weather data
   */
  formatWeatherData(apiData) {
    const current = apiData.current;
    const forecast = apiData.forecast.forecastday;

    return {
      current: {
        temperature: Math.round(current.temp_f),
        condition: current.condition.text,
        icon: this.getWeatherIcon(current.condition.code, current.is_day),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_mph),
        feelsLike: Math.round(current.feelslike_f),
        uvIndex: current.uv,
        visibility: Math.round(current.vis_miles),
        pressure: Math.round(current.pressure_mb),
        windDirection: current.wind_dir,
        gustSpeed: Math.round(current.gust_mph || 0),
        cloudCover: current.cloud,
        dewPoint: Math.round(current.dewpoint_f)
      },
      forecast: forecast.map((day, index) => ({
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
        high: Math.round(day.day.maxtemp_f),
        low: Math.round(day.day.mintemp_f),
        condition: day.day.condition.text,
        icon: this.getWeatherIcon(day.day.condition.code, 1), // 1 for day
        chanceOfRain: day.day.daily_chance_of_rain
      })),
      location: apiData.location.name,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get weather icon based on condition code
   * @param {number} code - Weather condition code from API
   * @param {number} isDay - 1 for day, 0 for night
   * @returns {string} - Weather icon emoji
   */
  getWeatherIcon(code, isDay) {
    // WeatherAPI.com condition codes - using Linux-compatible icons with intensity
    const icons = {
      1000: isDay ? '☀' : '☾', // Clear
      1003: '☁☀', // Partly cloudy
      1006: '☁', // Cloudy
      1009: '☁☁', // Overcast (more clouds)
      1030: '≡', // Mist
      1063: '☔', // Patchy rain
      1066: '❄', // Patchy snow
      1069: '❄☔', // Patchy sleet (rain + snow)
      1087: '⚡', // Thundery outbreaks
      1114: '❄≡', // Blowing snow (snow + wind)
      1117: '❄❄❄', // Blizzard (most intense)
      1135: '≡', // Fog
      1147: '≡❄', // Freezing fog (fog + freezing)
      1150: '☔', // Patchy light drizzle
      1153: '☔', // Light drizzle
      1168: '☔☔', // Heavy drizzle (more intense)
      1171: '☔☔', // Heavy drizzle (more intense)
      1180: '☔', // Slight rain showers
      1183: '☔', // Light rain showers
      1186: '☔☔', // Moderate rain showers (more intense)
      1189: '☔☔☔', // Heavy rain showers (most intense)
      1192: '☔☔☔☔', // Torrential rain showers (most intense!)
      1195: '☔☔☔', // Heavy rain (very intense)
      1225: '❄❄❄', // Heavy snow (most intense)
      1252: '☔❄', // Light sleet showers (rain + snow)
      1255: '☔☔❄', // Moderate sleet showers (more rain + snow)
      1258: '☔☔❄❄', // Heavy sleet showers (heavy rain + heavy snow)
      1261: '❄', // Light snow showers
      1264: '❄❄', // Moderate snow showers
      1273: '⚡☔', // Patchy light rain with thunder
      1276: '⚡⚡☔', // Moderate or heavy rain with thunder (more intense)
    };

    return icons[code] || '?';
  }

  /**
   * Clear the weather cache
   */
  clearCache() {
    this.cache = {
      data: null,
      timestamp: null,
      location: null
    };
    console.log('Weather cache cleared');
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    if (!this.cache.data || !this.cache.timestamp) {
      return { cached: false, age: null };
    }
    
    const age = Date.now() - this.cache.timestamp;
    const isValid = age < this.cacheDuration;
    
    return {
      cached: isValid,
      age: age,
      location: this.cache.location,
      expiresIn: this.cacheDuration - age
    };
  }
}

// Export a singleton instance
module.exports = new WeatherService();
