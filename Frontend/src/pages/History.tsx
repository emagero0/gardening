import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  // ReferenceArea, // Remove zoom-related imports for now
} from 'recharts';
// Removed useSensorHistory import
import { Spinner } from '../components/Spinner';
import { NPKBreakdownChart } from '../components/NPKBreakdownChart';
// import { ChartAnnotation } from '../components/ChartAnnotation'; // Remove event-related imports for now
// Correctly import export functions - ensure no local redeclaration conflicts
import { exportToCSV, exportToJSON } from '../utils/exportData';
import { config } from '../config';

const CHART_COLORS = {
  temperature: '#F56565',
  humidity: '#4299E1',
  moistureA: '#48BB78', // Color for Moisture A
  moistureB: '#38A169', // Color for Moisture B
  npk: '#9F7AEA'
};

// Keep time range options for UI, but fetching logic won't use them yet
type TimeRange = '24h' | '7d' | '30d';
const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

// Define the structure of processed data points for charts
interface ProcessedDataPoint {
  timestamp: string; // Keep as formatted string for XAxis
  date: Date; // Keep Date object for sorting/filtering
  temperature?: number;
  humidity?: number;
  moistureA?: number;
  moistureB?: number;
  // NPK object should match expected structure, provide defaults
  npk: { nitrogen: number; phosphorus: number; potassium: number };
}

// Define the structure of raw data from the backend API
interface RawHistoryPoint {
  id: number;
  timestamp: string; // ISO string from DB
  sensor_type: 'moisture' | 'dht11' | 'npk';
  sensor_id: 'A' | 'B' | null;
  value_1: number | null;
  value_2: number | null;
  value_3: number | null;
}


interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: any;
    color: string;
  }>;
  label?: string; // Formatted timestamp string
}

// --- Custom Tooltip (Keep as is for now, might need minor adjustments later) ---
const CustomTooltip = React.memo(({ active, payload, label }: TooltipContentProps) => {
  if (!active || !payload || payload.length === 0) return null;

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
              {/* Check if value exists before formatting */}
              {typeof item.value === 'number' ? item.value.toFixed(1) : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// --- Time Range Button (Keep as is) ---
const TimeRangeButton = React.memo(({ label, selected, onClick }: {
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


// --- Main History Component ---
export const History: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h'); // Keep for UI selection
  const [historyData, setHistoryData] = useState<ProcessedDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Removed zoom state and event state

  // Function to process raw data from backend
  const processRawData = (rawData: RawHistoryPoint[]): ProcessedDataPoint[] => {
    const processedMap = new Map<string, ProcessedDataPoint>();

    // Sort raw data by timestamp ascending to process in order
    rawData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    rawData.forEach(point => {
      const date = new Date(point.timestamp);
      // Format timestamp for display (e.g., "Apr 23, 10:50 AM")
      const formattedTimestamp = date.toLocaleString(undefined, {
          month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
      });

      let entry = processedMap.get(formattedTimestamp);
      if (!entry) {
        // Initialize with default NPK structure
        entry = {
          timestamp: formattedTimestamp,
          date: date,
          npk: { nitrogen: 0, phosphorus: 0, potassium: 0 }
        };
        processedMap.set(formattedTimestamp, entry);
      }

      switch (point.sensor_type) {
        case 'moisture':
          if (point.sensor_id === 'A' && point.value_1 !== null) entry.moistureA = point.value_1;
          if (point.sensor_id === 'B' && point.value_1 !== null) entry.moistureB = point.value_1;
          break;
        case 'dht11':
          if (point.value_1 !== null) entry.temperature = point.value_1;
          if (point.value_2 !== null) entry.humidity = point.value_2;
          break;
        case 'npk':
          // Assign to nitrogen, phosphorus, potassium properties
          if (point.value_1 !== null) entry.npk.nitrogen = point.value_1;
          if (point.value_2 !== null) entry.npk.phosphorus = point.value_2;
          if (point.value_3 !== null) entry.npk.potassium = point.value_3;
          break;
      }
    });

    // Convert map values to array and sort by date object
    return Array.from(processedMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  };


  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Add timeRange parameter to API call.
        // NOTE: This assumes the backend API at /api/sensor-history
        // can accept a query parameter like ?range=24h, ?range=7d, or ?range=30d.
        // If the backend doesn't support this, it will likely ignore the parameter.
        const apiUrl = `${config.endpoints.sensorHistory}?range=${timeRange}`;
        console.log(`Fetching history data from: ${apiUrl}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData: RawHistoryPoint[] = await response.json();
        const processed = processRawData(rawData);
        setHistoryData(processed);
      } catch (e) {
        console.error("Failed to fetch sensor history:", e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Add timeRange to dependency array so data refetches when the range changes.
  }, [timeRange]); // Refetch when timeRange changes

  // Removed zoom handlers and resetZoom

  // Adapt export handler
  const handleExport = useCallback((format: 'csv' | 'json') => {
    // Transform data for export if necessary. Let's assume export functions
    // can handle the current structure (with moistureA/B and nested npk).
    // If export errors persist, we'll need to check/modify exportData.ts
    // Transform data for export
    const dataToExport = historyData.map(item => ({
      timestamp: item.timestamp,
      temperature: item.temperature ?? null,
      humidity: item.humidity ?? null,
      moistureA: item.moistureA ?? null,
      moistureB: item.moistureB ?? null,
      nitrogen: item.npk.nitrogen,
      phosphorus: item.npk.phosphorus,
      potassium: item.npk.potassium,
    }));

    if (dataToExport.length === 0) {
      console.warn("No data available to export.");
      alert("No data available to export for the selected period.");
      return;
    }

    // Generate filename based on time range and date
    const filenameBase = `garden_history_${timeRange}_${new Date().toISOString().split('T')[0]}`;

    // Call the correct export function with data and filename
    // Call the export functions with only the data argument.
    // Filename generation might be handled within the utils or defaults to a standard name.
    try {
      if (format === 'csv') {
        exportToCSV(dataToExport); // Pass only data
      } else {
        exportToJSON(dataToExport); // Pass only data
      }
      console.log(`Exported data as ${format}`);
      // Optionally inform user about default filename if known
      // alert(`Data exported as ${format}. Check your downloads for the file.`);
    } catch (exportError) {
        console.error(`Failed to export data as ${format}:`, exportError);
        alert(`Failed to export data as ${format}. See console for details.`);
    }
  }, [historyData, timeRange]); // Correct dependencies

  // --- Chart Rendering Logic ---
  const chartProps = useMemo(() => ({
    margin: { top: 20, right: 30, bottom: 5, left: 0 }, // Increased top margin for annotations
    cartesianGrid: { strokeDasharray: "3 3", stroke: "#718096", opacity: 0.2 },
    xAxis: { dataKey: "timestamp", stroke: "#718096", fontSize: 10, tick: { fill: "#718096" } }, // Use formatted timestamp
    yAxis: { fontSize: 12, tick: { fill: "#718096" } },
    tooltip: { content: <CustomTooltip /> },
    legend: {}
  }), []);

  const isEmpty = !loading && historyData.length === 0;

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 dark:text-red-400 py-16">
          Error loading sensor history: {error}
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No historical data available yet.
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
              <LineChart data={historyData} {...chartProps}>
                <CartesianGrid {...chartProps.cartesianGrid} />
                <XAxis {...chartProps.xAxis} />
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
                <Tooltip {...chartProps.tooltip} />
                <Legend {...chartProps.legend} />
                {/* Removed ChartAnnotation and ReferenceArea */}
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke={CHART_COLORS.temperature}
                  name="Temperature (°C)"
                  dot={false}
                  strokeWidth={2}
                  connectNulls // Connect lines across missing data points
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
                  connectNulls
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
              <LineChart data={historyData} {...chartProps}>
                <CartesianGrid {...chartProps.cartesianGrid} />
                <XAxis {...chartProps.xAxis} />
                <YAxis
                  orientation="left"
                  // Use an average color or a specific one if preferred
                  stroke={CHART_COLORS.moistureA}
                  {...chartProps.yAxis}
                  label={{ value: '%', position: 'insideLeft', angle: -90, dx: -10 }}
                />
                <Tooltip {...chartProps.tooltip} />
                <Legend {...chartProps.legend} />
                {/* Removed ChartAnnotation and ReferenceArea */}
                <Line
                  type="monotone"
                  dataKey="moistureA" // Plot Moisture A
                  stroke={CHART_COLORS.moistureA}
                  name="Moisture A (%)"
                  dot={false}
                  strokeWidth={2}
                  connectNulls
                  activeDot={{ r: 6 }}
                />
                 <Line
                  type="monotone"
                  dataKey="moistureB" // Plot Moisture B
                  stroke={CHART_COLORS.moistureB}
                  name="Moisture B (%)"
                  dot={false}
                  strokeWidth={2}
                  connectNulls
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
            {/* Pass historyData directly, assuming NPKBreakdownChart can handle the array */}
            {/* It might be better to pass only the latest NPK data point if the chart expects a single object */}
            <NPKBreakdownChart data={historyData} className="h-full" />
          </div>
        </div>
      </div>
    );
  }, [loading, error, isEmpty, historyData, chartProps]); // Updated dependencies

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Keep outer structure and header */}
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
            {/* Time Range Options (UI only for now) */}
            {timeRangeOptions.map(({ value, label }) => (
              <TimeRangeButton
                key={value}
                label={label}
                selected={timeRange === value}
                onClick={() => {
                  setTimeRange(value);
                  // Fetching logic doesn't use timeRange yet
                  // resetZoom(); // Zoom removed
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

            {/* Removed Reset Zoom button */}
          </div>
        </div>

        {/* Render loading/error/empty/chart content */}
        {renderContent}
      </motion.div>
    </div>
  );
};
