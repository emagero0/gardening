import { useState, useEffect } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { generateSampleData } from '../utils/generateSampleData';

export type TimeRange = '24h' | '7d' | '30d';

export interface Event {
  timestamp: string;
  type: 'watering' | 'fertilization' | 'maintenance';
  description: string;
}

export interface SensorDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  moisture: number;
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export const useSensorHistory = (timeRange: TimeRange) => {
  const [data, setData] = useState<SensorDataPoint[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('Fetching data for timeRange:', timeRange);
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert timeRange to days
        const rangeDays = {
          '24h': 1,
          '7d': 7,
          '30d': 30
        };

        // Generate sample data
        const sampleData = generateSampleData(rangeDays[timeRange]);
        console.log('Generated sample data:', sampleData.length, 'points');

        // Generate sample events
        const sampleEvents: Event[] = [];
        const eventChance = timeRange === '24h' ? 0.1 : timeRange === '7d' ? 0.05 : 0.02;

        sampleData.forEach(point => {
          if (Math.random() < eventChance) {
            const eventTypes: Array<Event['type']> = ['watering', 'fertilization', 'maintenance'];
            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const descriptions = {
              watering: 'Automatic watering cycle',
              fertilization: 'NPK supplement added',
              maintenance: 'System maintenance check'
            };

            sampleEvents.push({
              timestamp: point.timestamp,
              type,
              description: descriptions[type]
            });
          }
        });

        // Format timestamps
        const formattedData = sampleData.map(point => ({
          ...point,
          timestamp: formatTimestamp(point.timestamp, timeRange)
        }));

        setData(formattedData);
        setEvents(sampleEvents.map(event => ({
          ...event,
          timestamp: formatTimestamp(event.timestamp, timeRange)
        })));
        setLoading(false);
      } catch (err) {
        console.error('Error in useSensorHistory:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [timeRange]);

  const formatTimestamp = (timestamp: string, range: TimeRange): string => {
    try {
      const date = new Date(timestamp);
      if (range === '24h') {
        return date.toLocaleTimeString([], { 
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      return date.toLocaleDateString([], { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (err) {
      console.error('Error formatting timestamp:', timestamp, err);
      return timestamp;
    }
  };

  return {
    data,
    events,
    loading,
    error,
    isEmpty: data.length === 0
  };
};
