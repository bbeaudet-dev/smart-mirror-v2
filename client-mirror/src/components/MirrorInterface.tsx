import React, { useState } from 'react';

// Components
import TimeDisplay from './modules/TimeDisplay';
import WeatherPanel from './modules/weather/WeatherPanel';
import CalendarPanel from './modules/CalendarPanel';
import RotatingNewsPanel from './modules/RotatingNewsPanel';
import WebcamPanel from './modules/webcam/WebcamPanel';
import MessagePanel from './modules/MessagePanel';

function MirrorInterface() {
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isWebcamInitialized, setIsWebcamInitialized] = useState(false);
  const [isWebcamAnalyzing, setIsWebcamAnalyzing] = useState(false);

  return (
    <div className="w-full h-full bg-mirror-bg text-mirror-text font-mirror-primary">
      <div className="w-full h-full flex flex-col">
        {/* Time Display - Top Left */}
        <div className="flex justify-start py-1 px-1">
          <TimeDisplay />
        </div>
        
        {/* Spacing between time and weather */}
        <div className="h-8"></div>
        
        {/* Left Column - Weather, Calendar, News, Webcam */}
        <div className="flex justify-start px-1">
          <div className="w-[30%] flex flex-col">
            {/* Weather Panel */}
            <WeatherPanel />
            
            {/* Spacing */}
            <div className="h-4 mb-16"></div>
            
            {/* Calendar Panel */}
            <CalendarPanel />
            
            {/* Spacing */}
            <div className="h-4 mb-16"></div>
            
            {/* News Panel */}
            <RotatingNewsPanel />
            
            {/* Spacing */}
            <div className="h-4 mb-16"></div>
            
            {/* Webcam Panel */}
            <WebcamPanel 
              onAiMessage={setAiMessage}
              onAiLoading={setIsAiLoading}
            />
          </div>
        </div>

        {/* AI Message Panel - Bottom Center */}
        <MessagePanel 
          message={aiMessage}
          isLoading={isAiLoading}
          type="ai-response"
        />
      </div>
    </div>
  );
}

export default MirrorInterface;
