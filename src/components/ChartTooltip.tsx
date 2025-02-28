import React from 'react';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
}

export const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
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
};
