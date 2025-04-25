import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Spinner } from './Spinner';
import { config } from '../config';

// Define structure for raw history points (matching History.tsx)
interface RawHistoryPoint {
  id: number;
  timestamp: string; // ISO string from DB
  sensor_type: 'moisture' | 'dht11' | 'npk';
  sensor_id: 'A' | 'B' | null;
  value_1: number | null;
  value_2: number | null;
  value_3: number | null;
}

// Define structure for processed data points for charts
interface ProcessedDataPoint {
  timestamp: string; // ISO timestamp string
  value: number | null; // The specific value for this chart
}

type TimeRange = '1d' | '7d' | '30d';
const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

// Define the types of sensors this chart can display
type SensorType = 'temperature' | 'humidity' | 'moistureA' | 'moistureB' | 'nitrogen' | 'phosphorus' | 'potassium';

interface TrendChartProps {
  sensorType: SensorType;
  title: string;
  unit: string;
  color: string; // Color for the line
  showTimeRangeSelector?: boolean;
}

// --- Time Range Button (Similar to History.tsx) ---
const TimeRangeButton = React.memo(({ label, selected, onClick }: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1 rounded text-xs font-medium transition-colors
      ${selected
        ? 'bg-primary text-white'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }
    `}
  >
    {label}
  </button>
));
TimeRangeButton.displayName = 'TimeRangeButton';

// --- Custom Tooltip (Simplified for single value) ---
const CustomTooltip = React.memo(({ active, payload, label, unit, timeRange }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  unit: string;
  timeRange: TimeRange;
}) => {
  if (active && payload && payload.length) {
    try {
      const date = new Date(label as string);
      const formattedTime = timeRange === '1d' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
          });

      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{formattedTime}</p>
          <p className="text-sm font-medium" style={{ color: payload[0].color }}>
            {`${payload[0].name}: ${payload[0].value.toFixed(1)} ${unit}`}
          </p>
        </div>
      );
    } catch (e) {
      console.error('Error formatting tooltip date:', label);
      return null;
    }
  }
  return null;
});
CustomTooltip.displayName = 'CustomTooltip';


export const TrendChart: React.FC<TrendChartProps> = ({ 
  sensorType, 
  title, 
  unit, 
  color,
  showTimeRangeSelector = true 
}) => {
  // Always start with 1d time range for dashboard, allow change only if selector is shown
  const [timeRange] = useState<TimeRange>('1d');
  const setTimeRange = showTimeRangeSelector ? useState<TimeRange>('1d')[1] : () => {};
  const [allHistoryData, setAllHistoryData] = useState<ProcessedDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to process raw data specifically for the given sensorType
  const processRawData = (rawData: RawHistoryPoint[], targetSensor: SensorType): ProcessedDataPoint[] => {
    const processed: ProcessedDataPoint[] = [];

    rawData.forEach(point => {
      let value: number | null = null;

      switch (targetSensor) {
        case 'temperature':
          if (point.sensor_type === 'dht11') value = point.value_1;
          break;
        case 'humidity':
          if (point.sensor_type === 'dht11') value = point.value_2;
          break;
        case 'moistureA':
          if (point.sensor_type === 'moisture' && point.sensor_id === 'A') value = point.value_1;
          break;
        case 'moistureB':
          if (point.sensor_type === 'moisture' && point.sensor_id === 'B') value = point.value_1;
          break;
        case 'nitrogen':
          if (point.sensor_type === 'npk') value = point.value_1;
          break;
        case 'phosphorus':
          if (point.sensor_type === 'npk') value = point.value_2;
          break;
        case 'potassium':
          if (point.sensor_type === 'npk') value = point.value_3;
          break;
      }

      // Only add if the value is relevant for this sensor type
      if (value !== null) {
        processed.push({
          timestamp: point.timestamp, // Keep original ISO timestamp
          value: value
        });
      }
    });

    // Sort by date ascending
    return processed.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all history - backend filtering would be better
        const response = await fetch(config.endpoints.sensorHistory);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData: RawHistoryPoint[] = await response.json();
        const processed = processRawData(rawData, sensorType);
        setAllHistoryData(processed);
      } catch (e) {
        console.error(`Failed to fetch sensor history for ${sensorType}:`, e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sensorType]); // Refetch if sensorType changes (though unlikely in this setup)

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const now = Date.now();
    let startTime: number;

    switch (timeRange) {
      case '7d':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '1d':
      default:
        startTime = now - 1 * 24 * 60 * 60 * 1000;
        break;
    }

    return allHistoryData.filter(point => new Date(point.timestamp).getTime() >= startTime);
  }, [allHistoryData, timeRange]);

  const isEmpty = !loading && filteredData.length === 0;

  return (
    <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-inter font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {showTimeRangeSelector && (
          <div className="flex space-x-1">
            {timeRangeOptions.map(({ value, label }) => (
              <TimeRangeButton
                key={value}
                label={label}
                selected={timeRange === value}
                onClick={() => setTimeRange(value)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-grow"> {/* Make chart container grow */}
        {loading && <div className="flex items-center justify-center h-full"><Spinner /></div>}
        {error && <div className="text-center text-red-500 dark:text-red-400 py-4 text-sm">Error: {error}</div>}
        {isEmpty && !loading && !error && <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">No data available for this range.</div>}

        {!loading && !error && !isEmpty && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}> {/* Adjusted margins */}
              <CartesianGrid strokeDasharray="3 3" stroke="#718096" opacity={0.2} />
              <XAxis
                dataKey="timestamp"
                stroke="#718096"
                fontSize={9} // Smaller font size
                tick={{ fill: "#718096" }}
                tickFormatter={(isoString) => {
                    try {
                        const date = new Date(isoString);
                        // Basic formatter: show time for 1d, date for others
                        if (timeRange === '1d') {
                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    } catch (e) {
                        console.error('Error formatting date:', isoString);
                        return '';
                    }
                }}
                interval="preserveStartEnd"
                minTickGap={30}
                tickCount={5}
              />
              <YAxis
                stroke="#718096"
                fontSize={10}
                tick={{ fill: "#718096" }}
                domain={['auto', 'auto']} // Auto-scale Y-axis
                tickFormatter={(value) => value.toFixed(0)} // Format Y-axis ticks
              />
              <Tooltip content={<CustomTooltip unit={unit} timeRange={timeRange} />} />
              <Legend verticalAlign="top" height={30} />
              <Line
                type="monotone"
                dataKey="value"
                name={title} // Use title for legend name
                stroke={color}
                dot={false}
                strokeWidth={2}
                connectNulls // Connect lines across missing data points
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
