import React, { useState, useEffect } from 'react';

interface MessagePanelProps {
  message?: string | null;
  type?: 'ai-response' | 'motivation' | 'outfit-analysis' | 'general' | 'motion' | 'welcome' | 'sendoff';
}

const MessagePanel: React.FC<MessagePanelProps> = ({ 
  message, 
  type = 'general' 
}) => {
  const [displayMessage, setDisplayMessage] = useState<string | null>(message || null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      setIsVisible(true);

      // Auto-hide message after 15 seconds (longer for better readability)
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 15000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  if (!isVisible) {
    return null;
  }

  const getMessageIcon = () => {
    switch (type) {
      case 'ai-response':
        return 'AI';
      case 'motivation':
        return 'MOTIVATION';
      case 'outfit-analysis':
        return 'OUTFIT';
      case 'motion':
        return 'MOTION';
      case 'welcome':
        return 'WELCOME';
      case 'sendoff':
        return 'SENDOFF';
      case 'general':
        return 'MESSAGE';
      default:
        return 'MESSAGE';
    }
  };

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 max-w-5xl w-full px-4">
      <div className={`
        bg-black/90 backdrop-blur-md border border-mirror-text-dimmed/40 rounded-xl p-6
        transition-all duration-700 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
      `}>
        <div className="flex items-start space-x-4">
          <div className="text-mirror-xl flex-shrink-0 font-bold">
            {getMessageIcon()}
          </div>
          <div className="flex-1">
            <p className="text-mirror-base text-mirror-text font-mirror-primary leading-relaxed">
              {displayMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel;
