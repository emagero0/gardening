import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface NPKData {
  timestamp: string;
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

interface Props {
  data: NPKData[];
  className?: string;
}

const OPTIMAL_RANGES = {
  nitrogen: { min: 40, max: 60 },
  phosphorus: { min: 35, max: 55 },
  potassium: { min: 45, max: 65 }
};

const NPK_COLORS = {
  nitrogen: '#22c55e',   // Green
  phosphorus: '#6366f1',  // Indigo
  potassium: '#f59e0b'   // Amber
};

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
              {item.value.toFixed(1)} ppm
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NPKBreakdownChart: React.FC<Props> = ({ data, className }) => {
  // Memoize data transformation
  const formattedData = useMemo(() => {
    return data.map(point => ({
      timestamp: point.timestamp,
      Nitrogen: point.npk.nitrogen,
      Phosphorus: point.npk.phosphorus,
      Potassium: point.npk.potassium
    }));
  }, [data]);

  // Memoize reference lines to prevent unnecessary re-renders
  const referenceLines = useMemo(() => {
    return Object.entries(OPTIMAL_RANGES).map(([nutrient, range]) => (
      <React.Fragment key={nutrient}>
        <ReferenceLine 
          y={range.min}
          stroke={NPK_COLORS[nutrient as keyof typeof NPK_COLORS]}
          strokeDasharray="3 3"
          opacity={0.5}
        />
        <ReferenceLine 
          y={range.max}
          stroke={NPK_COLORS[nutrient as keyof typeof NPK_COLORS]}
          strokeDasharray="3 3"
          opacity={0.5}
        />
      </React.Fragment>
    ));
  }, []);

  if (!data?.length) {
    return null;
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          barGap={0}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#718096" opacity={0.2} />
          <XAxis 
            dataKey="timestamp"
            stroke="#718096"
            fontSize={12}
            tick={{ fill: '#718096' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#718096"
            fontSize={12}
            tick={{ fill: '#718096' }}
            domain={[0, 100]}
            label={{ 
              value: 'Concentration (ppm)',
              position: 'insideLeft',
              angle: -90,
              dx: -10
            }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(113, 128, 150, 0.1)' }}
          />
          <Legend />
          {referenceLines}
          <Bar
            dataKey="Nitrogen"
            fill={NPK_COLORS.nitrogen}
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
          <Bar
            dataKey="Phosphorus"
            fill={NPK_COLORS.phosphorus}
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
          <Bar
            dataKey="Potassium"
            fill={NPK_COLORS.potassium}
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
