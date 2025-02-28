import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea
} from 'recharts';
import { useSensorHistory, TimeRange } from '../hooks/useSensorHistory';

const CHART_COLORS = {
  temperature: '#F56565',
  humidity: '#4299E1',
  moisture: '#48BB78',
  npk: '#9F7AEA'
};

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

interface ZoomState {
  startIndex: number | null;
  endIndex: number | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {item.name}:
            </span>
            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
              {item.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const History: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const { data, loading, error, isEmpty } = useSensorHistory(timeRange);
  const [zoom, setZoom] = useState<ZoomState>({ startIndex: null, endIndex: null });
  const [zoomedData, setZoomedData] = useState(data);

  const handleZoomStart = useCallback((e: any) => {
    if (!e) return;
    const { activeTooltipIndex } = e;
    setZoom(prev => ({ ...prev, startIndex: activeTooltipIndex }));
  }, []);

  const handleZoomEnd = useCallback((e: any) => {
    if (!e) return;
    const { activeTooltipIndex } = e;
    if (zoom.startIndex !== null && activeTooltipIndex !== null) {
      const start = Math.min(zoom.startIndex, activeTooltipIndex);
      const end = Math.max(zoom.startIndex, activeTooltipIndex);
      setZoomedData(data.slice(start, end + 1));
      setZoom({ startIndex: null, endIndex: null });
    }
  }, [zoom.startIndex, data]);

  const resetZoom = useCallback(() => {
    setZoomedData(data);
    setZoom({ startIndex: null, endIndex: null });
  }, [data]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sensor History
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {timeRangeOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTimeRange(value);
                  resetZoom();
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${timeRange === value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {label}
              </button>
            ))}
            {zoomedData !== data && (
              <button
                onClick={resetZoom}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Reset Zoom
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 dark:text-red-400 py-8">
            Error loading sensor history. Please try again.
          </div>
        )}

        {isEmpty && !loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No data available for this time range.
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <div className="space-y-8">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Temperature & Humidity
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={zoomedData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
                    onMouseDown={handleZoomStart}
                    onMouseUp={handleZoomEnd}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#718096" opacity={0.2} />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#718096"
                      fontSize={12}
                      tick={{ fill: '#718096' }}
                    />
                    <YAxis 
                      yAxisId="temp"
                      orientation="left"
                      stroke={CHART_COLORS.temperature}
                      fontSize={12}
                      tick={{ fill: '#718096' }}
                      label={{ value: '°C', position: 'insideLeft', angle: -90, dx: -10 }}
                    />
                    <YAxis 
                      yAxisId="humidity"
                      orientation="right"
                      stroke={CHART_COLORS.humidity}
                      fontSize={12}
                      tick={{ fill: '#718096' }}
                      label={{ value: '%', position: 'insideRight', angle: 90, dx: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {zoom.startIndex !== null && (
                      <ReferenceArea
                        x1={data[zoom.startIndex]?.timestamp}
                        x2={data[zoom.endIndex ?? zoom.startIndex]?.timestamp}
                        strokeOpacity={0.3}
                      />
                    )}
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="temperature"
                      stroke={CHART_COLORS.temperature}
                      name="Temperature (°C)"
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="humidity"
                      type="monotone"
                      dataKey="humidity"
                      stroke={CHART_COLORS.humidity}
                      name="Humidity (%)"
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Moisture & NPK Levels
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={zoomedData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
                    onMouseDown={handleZoomStart}
                    onMouseUp={handleZoomEnd}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#718096" opacity={0.2} />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#718096"
                      fontSize={12}
                      tick={{ fill: '#718096' }}
                    />
                    <YAxis 
                      yAxisId="moisture"
                      orientation="left"
                      stroke={CHART_COLORS.moisture}
                      fontSize={12}
                      tick={{ fill: '#718096' }}
                      label={{ value: '%', position: 'insideLeft', angle: -90, dx: -10 }}
                    />
                    <YAxis 
                      yAxisId="npk"
                      orientation="right"
                      stroke={CHART_COLORS.npk}
                      fontSize={12}
                      tick={{ fill: '#718096' }}
                      label={{ value: 'ppm', position: 'insideRight', angle: 90, dx: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {zoom.startIndex !== null && (
                      <ReferenceArea
                        x1={data[zoom.startIndex]?.timestamp}
                        x2={data[zoom.endIndex ?? zoom.startIndex]?.timestamp}
                        strokeOpacity={0.3}
                      />
                    )}
                    <Line
                      yAxisId="moisture"
                      type="monotone"
                      dataKey="moisture"
                      stroke={CHART_COLORS.moisture}
                      name="Moisture (%)"
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="npk"
                      type="monotone"
                      dataKey="npk"
                      stroke={CHART_COLORS.npk}
                      name="NPK Level (ppm)"
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
