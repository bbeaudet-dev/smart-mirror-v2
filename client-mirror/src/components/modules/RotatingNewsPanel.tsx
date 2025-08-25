import React, { useState, useEffect } from 'react';
import NewsClient from '../../services/newsClient';

interface NewsHeadline {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface NewsData {
  headlines: NewsHeadline[];
  count: number;
  timestamp: string;
}

const RotatingNewsPanel: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await NewsClient.getHeadlines(8) as NewsData; // Get more headlines for rotation
        setNewsData(data);
      } catch (err) {
        console.error('News fetch error:', err);
        setError('News service unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
    
    // Refresh news every 15 minutes
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate through headlines every 4 seconds
  useEffect(() => {
    if (!newsData || newsData.headlines.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex + 1 >= newsData.headlines.length ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 300); // Half of transition duration
    }, 4000);

    return () => clearInterval(interval);
  }, [newsData]);

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">News</h3>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="text-mirror-xs text-mirror-text font-mirror-primary">
            <p>Loading headlines...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !newsData) {
    return (
      <div className="flex flex-col">
        <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">News</h3>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="text-mirror-xs text-mirror-text font-mirror-primary">
            <p>News unavailable</p>
            <p className="text-mirror-text-dimmed">Check NewsAPI configuration</p>
          </div>
        </div>
      </div>
    );
  }

  const currentHeadline = newsData.headlines[currentIndex];

  return (
    <div className="flex flex-col mb-4">
      <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">News</h3>
      
      <div className="overflow-hidden">
        {newsData.headlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-mirror-lg text-mirror-text-dimmed mb-2">HEADLINES</div>
            <div className="text-mirror-xs text-mirror-text font-mirror-primary">
              <p>No headlines available</p>
            </div>
          </div>
        ) : (
          <div 
            className={`transition-opacity duration-600 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div key={currentHeadline.id} className="border-l-2 border-mirror-text-dimmed pl-2">
              <div className="text-mirror-xs font-mirror-primary text-mirror-text leading-tight">
                {currentHeadline.title}
              </div>
              <div className="text-[0.75rem] text-mirror-text-dimmed mt-1">
                {currentHeadline.source} • {NewsClient.formatTimestamp(currentHeadline.publishedAt)}
              </div>
            </div>
            
            {/* Show rotation indicator if there are more headlines */}
            {newsData.headlines.length > 1 && (
              <div className="text-mirror-xs text-mirror-text-dimmed text-center pt-2">
                {currentIndex + 1} of {newsData.headlines.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatingNewsPanel;
