import React, { useState, useEffect } from 'react';
import { WeatherData } from '../../../data/types';
import CurrentWeather from './CurrentWeather';
import WeeklyForecast from './WeeklyForecast';
import ApiClient from '../../../services/apiClient';

const WeatherPanel: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch weather data, but don't block the UI if it fails
    const fetchWeather = async () => {
      try {
        const data = await ApiClient.getWeather() as { weather: WeatherData };
        setWeather(data.weather);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Weather service unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">Weather</h3>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="text-mirror-xs text-mirror-text font-mirror-primary">
            <p>Loading weather...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !weather) {
    return (
      <div className="flex flex-col">
        <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">Weather</h3>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="text-mirror-xs text-mirror-text font-mirror-primary">
            <p>Weather data unavailable</p>
            <p className="text-mirror-text-dimmed">Check API configuration</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">Weather</h3>
      
      {/* Current Weather */}
      <CurrentWeather weather={weather} isRefreshing={false} />
      
      {/* Weekly Forecast */}
      <WeeklyForecast weather={weather} />
    </div>
  );
};

export default WeatherPanel;
