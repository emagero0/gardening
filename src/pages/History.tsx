import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useGarden } from '../contexts/GardenContext';

type TimeRange = '24h' | '7d' | '30d';

// Mock data - In production, this would come from an API
const generateMockData = (range: TimeRange) => {
  const now = new Date();
  const data = [];
  const points = range === '24h' ? 24 : range === '7d' ? 7 : 30;
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * (range === '24h' ? 3600000 : 86400000)));
    data.push({
      timestamp: time.toLocaleString(),
      moisture: Math.random() * 30 + 50,
      temperature: Math.random() * 10 + 20,
      humidity: Math.random() * 20 + 60
    });
  }
  
  return data;
};

export const History: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const { state } = useGarden();
  const data = generateMockData(timeRange);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-inter font-bold text-gray-900 dark:text-white">
          Sensor History
        </h1>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-4 py-2 rounded-lg font-inter text-sm
                ${timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}
                transition-colors hover:bg-opacity-90
              `}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-inter font-semibold text-gray-900 dark:text-white mb-6">
          Moisture & Temperature
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="moisture"
                stroke="#2d5a27"
                name="Moisture (%)"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#7cb342"
                name="Temperature (°C)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-inter font-semibold text-gray-900 dark:text-white mb-6">
          Humidity
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#2d5a27"
                name="Humidity (%)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
