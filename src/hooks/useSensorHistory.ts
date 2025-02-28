import { useState, useEffect } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { generateSampleData } from '../utils/generateSampleData';

export type TimeRange = '24h' | '7d' | '30d';

interface SensorDataPoint {
  timestamp: number;
  moisture: number;
  temperature: number;
  humidity: number;
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export const useSensorHistory = (timeRange: TimeRange) => {
  const [data, setData] = useState<SensorDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { getData } = useIndexedDB({
    name: 'verticalGardenDB',
    version: 1,
    storeName: 'sensorData'
  });

  useEffect(() => {
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

        // Always use sample data in development
        if (import.meta.env.DEV) {
          console.log('Using sample data for development');
          const sampleData = generateSampleData(rangeDays[timeRange]);
          setData(sampleData);
          setLoading(false);
          return;
        }

        // In production, use IndexedDB data
        try {
          const allData = await getData();
          if (!Array.isArray(allData)) {
            throw new Error('Invalid data format received from storage');
          }

          const now = Date.now();
          const rangeMs = rangeDays[timeRange] * 24 * 60 * 60 * 1000;
          
          const filteredData = allData
            .filter(point => (now - point.timestamp) <= rangeMs)
            .sort((a, b) => a.timestamp - b.timestamp);

          setData(filteredData);
        } catch (storageErr) {
          console.error('Storage error:', storageErr);
          // Fallback to sample data if storage fails
          const sampleData = generateSampleData(rangeDays[timeRange]);
          setData(sampleData);
        }
      } catch (err) {
        console.error('Error fetching sensor history:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [timeRange, getData]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    if (timeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const calculateNPKAverage = (point: SensorDataPoint): number => {
    const { nitrogen, phosphorus, potassium } = point.npk;
    return (nitrogen + phosphorus + potassium) / 3;
  };

  // Data transformation for charts
  const chartData = data.map(point => ({
    timestamp: formatTimestamp(point.timestamp),
    moisture: Number(point.moisture.toFixed(1)),
    temperature: Number(point.temperature.toFixed(1)),
    humidity: Number(point.humidity.toFixed(1)),
    npk: Number(calculateNPKAverage(point).toFixed(1))
  }));

  return {
    data: chartData,
    loading,
    error,
    isEmpty: data.length === 0
  };
};
