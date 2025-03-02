import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
} from 'recharts';
import { useSensorHistory, TimeRange, SensorDataPoint, Event } from '../hooks/useSensorHistory';
import { Spinner } from '../components/Spinner';
import { NPKBreakdownChart } from '../components/NPKBreakdownChart';
import { ChartAnnotation } from '../components/ChartAnnotation';
import { exportToCSV, exportToJSON } from '../utils/exportData';

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

interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: any;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = React.memo(({ active, payload, label }: TooltipContentProps) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((item, index) => (
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
});

CustomTooltip.displayName = 'CustomTooltip';

const TimeRangeButton = React.memo(({ value, label, selected, onClick }: {
  value: TimeRange;
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-colors
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

export const History: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const { data, events, loading, error, isEmpty } = useSensorHistory(timeRange);
  const [zoom, setZoom] = useState<ZoomState>({ startIndex: null, endIndex: null });
  const [zoomedData, setZoomedData] = useState<SensorDataPoint[]>([]);
  const [zoomedEvents, setZoomedEvents] = useState<Event[]>([]);

  // Reset zoom when data changes
  useEffect(() => {
    setZoomedData(data);
    setZoomedEvents(events);
  }, [data, events]);

  const handleZoomStart = useCallback((e: any) => {
    if (!e) return;
    const { activeTooltipIndex } = e;
    setZoom((prev: ZoomState) => ({ ...prev, startIndex: activeTooltipIndex }));
  }, []);

  const handleZoomEnd = useCallback((e: any) => {
    if (!e) return;
    const { activeTooltipIndex } = e;
    if (zoom.startIndex !== null && activeTooltipIndex !== null) {
      const start = Math.min(zoom.startIndex, activeTooltipIndex);
      const end = Math.max(zoom.startIndex, activeTooltipIndex);
      
      const zoomedDataSlice = data.slice(start, end + 1);
      setZoomedData(zoomedDataSlice);
      
      const startTime = new Date(zoomedDataSlice[0].timestamp).getTime();
      const endTime = new Date(zoomedDataSlice[zoomedDataSlice.length - 1].timestamp).getTime();
      
      const filteredEvents = events.filter(event => {
        const eventTime = new Date(event.timestamp).getTime();
        return eventTime >= startTime && eventTime <= endTime;
      });
      
      setZoomedEvents(filteredEvents);
      setZoom({ startIndex: null, endIndex: null });
    }
  }, [zoom.startIndex, data, events]);

  const resetZoom = useCallback(() => {
    setZoomedData(data);
    setZoomedEvents(events);
    setZoom({ startIndex: null, endIndex: null });
  }, [data, events]);

  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (format === 'csv') {
      exportToCSV(zoomedData);
    } else {
      exportToJSON(zoomedData);
    }
  }, [zoomedData]);

  const chartProps = useMemo(() => ({
    margin: { top: 5, right: 30, bottom: 5, left: 0 },
    cartesianGrid: {
      strokeDasharray: "3 3",
      stroke: "#718096",
      opacity: 0.2
    },
    xAxis: {
      stroke: "#718096",
      fontSize: 12,
      tick: { fill: "#718096" }
    },
    yAxis: {
      fontSize: 12,
      tick: { fill: "#718096" }
    }
  }), []);

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 dark:text-red-400 py-8">
          Error loading sensor history. Please try again.
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No data available for this time range.
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Temperature & Humidity Chart */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Temperature & Humidity
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={zoomedData}
                {...chartProps}
                onMouseDown={handleZoomStart}
                onMouseUp={handleZoomEnd}
                margin={{ ...chartProps.margin, top: 30 }}
              >
                <CartesianGrid {...chartProps.cartesianGrid} />
                <XAxis dataKey="timestamp" {...chartProps.xAxis} />
                <YAxis 
                  yAxisId="temp"
                  orientation="left"
                  stroke={CHART_COLORS.temperature}
                  {...chartProps.yAxis}
                  label={{ value: '°C', position: 'insideLeft', angle: -90, dx: -10 }}
                />
                <YAxis 
                  yAxisId="humidity"
                  orientation="right"
                  stroke={CHART_COLORS.humidity}
                  {...chartProps.yAxis}
                  label={{ value: '%', position: 'insideRight', angle: 90, dx: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ChartAnnotation events={zoomedEvents} position="top" />
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

        {/* Moisture Chart */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Soil Moisture
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={zoomedData}
                {...chartProps}
                onMouseDown={handleZoomStart}
                onMouseUp={handleZoomEnd}
                margin={{ ...chartProps.margin, top: 30 }}
              >
                <CartesianGrid {...chartProps.cartesianGrid} />
                <XAxis dataKey="timestamp" {...chartProps.xAxis} />
                <YAxis
                  orientation="left"
                  stroke={CHART_COLORS.moisture}
                  {...chartProps.yAxis}
                  label={{ value: '%', position: 'insideLeft', angle: -90, dx: -10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ChartAnnotation 
                  events={zoomedEvents.filter(e => e.type === 'watering')}
                  position="top"
                />
                {zoom.startIndex !== null && (
                  <ReferenceArea
                    x1={data[zoom.startIndex]?.timestamp}
                    x2={data[zoom.endIndex ?? zoom.startIndex]?.timestamp}
                    strokeOpacity={0.3}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="moisture"
                  stroke={CHART_COLORS.moisture}
                  name="Moisture (%)"
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NPK Breakdown Chart */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            NPK Breakdown
          </h3>
          <div className="h-96">
            <NPKBreakdownChart data={zoomedData} className="h-full" />
          </div>
        </div>
      </div>
    );
  }, [loading, error, isEmpty, zoomedData, zoomedEvents, data, zoom, chartProps, handleZoomStart, handleZoomEnd]);

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div 
          key="history-page"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sensor History
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {/* Time Range Options */}
              {timeRangeOptions.map(({ value, label }) => (
                <TimeRangeButton
                  key={value}
                  value={value}
                  label={label}
                  selected={timeRange === value}
                  onClick={() => {
                    setTimeRange(value);
                    resetZoom();
                  }}
                />
              ))}

              {/* Export Options */}
              {!isEmpty && !loading && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('csv')}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Export JSON
                  </button>
                </div>
              )}

              {/* Reset Zoom */}
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

          {renderContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
