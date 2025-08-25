import React, { useState, useEffect } from 'react';
import CalendarClient from '../../services/calendarClient';

interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  location: string;
  attendees: any[];
  isAllDay: boolean;
}

interface CalendarData {
  todayEvents: CalendarEvent[];
  todayCount: number;
  tomorrowEvents: CalendarEvent[];
  tomorrowCount: number;
  nextEvent: CalendarEvent | null;
  hasNextEvent: boolean;
  summary: {
    todayEvents: number;
    tomorrowEvents: number;
    nextEventIn: string | null;
  };
}

const CalendarPanel: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const data = await CalendarClient.getCalendarSummary() as CalendarData;
        setCalendarData(data);
      } catch (err) {
        console.error('Calendar fetch error:', err);
        setError('Calendar service unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendar();
    
    // Refresh calendar data every 5 minutes
    const interval = setInterval(fetchCalendar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatEventTime = (startTime: string, endTime: string, isAllDay: boolean) => {
    if (isAllDay) return 'All Day';
    
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      const startStr = start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const endStr = end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      return `${startStr} - ${endStr}`;
    } catch (error) {
      console.error('Error formatting event time:', error);
      return 'Time Error';
    }
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">Calendar</h3>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="text-mirror-xs text-mirror-text font-mirror-primary">
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !calendarData) {
    return (
      <div className="flex flex-col">
        <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">Calendar</h3>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="text-mirror-xs text-mirror-text font-mirror-primary">
            <p>Calendar unavailable</p>
            <p className="text-mirror-text-dimmed">Check Google Calendar setup</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full mb-4">
      <h3 className="text-lg font-mirror-primary font-normal text-mirror-text uppercase border-b border-mirror-text-dimmed leading-4 pb-1 mb-2">Calendar</h3>
      
      <div className="flex-1 overflow-hidden">
        {calendarData.todayEvents.length === 0 && calendarData.tomorrowEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-mirror-lg text-mirror-text-dimmed mb-2">TODAY</div>
            <div className="text-mirror-xs text-mirror-text font-mirror-primary">
              <p>No events scheduled</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto h-full">
            {/* Today's Events */}
            {calendarData.todayEvents.length > 0 && (
              <>
                <div className="text-mirror-xs text-mirror-text-dimmed font-mirror-primary border-b border-mirror-text-dimmed pb-1">
                  TODAY
                </div>
                {calendarData.todayEvents.slice(0, 3).map((event: CalendarEvent) => (
                  <div key={event.id} className="border-l-2 border-mirror-text-dimmed pl-2">
                    <div className="text-mirror-xs font-mirror-primary text-mirror-text">
                      {event.summary}
                    </div>
                    <div className="text-[0.75rem] text-mirror-text-dimmed">
                      {formatEventTime(event.start, event.end, event.isAllDay)}
                    </div>
                    {event.location && (
                      <div className="text-mirror-xs text-mirror-text-dimmed">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            
            {/* Spacing between today and tomorrow */}
            {calendarData.todayEvents.length > 0 && calendarData.tomorrowEvents.length > 0 && (
              <div className="h-2"></div>
            )}
            
            {/* Tomorrow's Events */}
            {calendarData.tomorrowEvents.length > 0 && (
              <>
                <div className="text-mirror-xs text-mirror-text-dimmed font-mirror-primary border-b border-mirror-text-dimmed pb-1">
                  TOMORROW
                </div>
                {calendarData.tomorrowEvents.slice(0, 2).map((event: CalendarEvent) => (
                  <div key={event.id} className="border-l-2 border-mirror-text-dimmed pl-2">
                    <div className="text-mirror-xs font-mirror-primary text-mirror-text">
                      {event.summary}
                    </div>
                    <div className="text-[0.75rem] text-mirror-text-dimmed">
                      {formatEventTime(event.start, event.end, event.isAllDay)}
                    </div>
                    {event.location && (
                      <div className="text-mirror-xs text-mirror-text-dimmed">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            
            {/* Show more events indicator */}
            {(calendarData.todayEvents.length > 3 || calendarData.tomorrowEvents.length > 2) && (
              <div className="text-mirror-xs text-mirror-text-dimmed text-center pt-2">
                +{(calendarData.todayEvents.length - 3) + (calendarData.tomorrowEvents.length - 2)} more events
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPanel;
