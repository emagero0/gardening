import React from 'react';
import { motion } from 'framer-motion';
import { useGarden } from '../contexts/GardenContext';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

interface SensorCardProps {
  type: 'moisture' | 'temperature' | 'humidity' | 'npk';
  title: string;
  value: number;
  unit: string;
  icon: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({ type, title, value, unit, icon }) => {
  const { state } = useGarden();
  const isOffline = useOfflineStatus();

  const getStatusColor = () => {
    // Define thresholds for each sensor type
    const thresholds = {
      moisture: { low: 30, high: 70 },
      temperature: { low: 18, high: 28 },
      humidity: { low: 40, high: 80 },
      npk: { low: 20, high: 60 }
    };

    if (isOffline) return 'text-gray-500';

    const threshold = thresholds[type];
    if (value < threshold.low) return 'text-red-500';
    if (value > threshold.high) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatLastSync = () => {
    if (!state.lastSync) return 'Never';
    const diff = Date.now() - state.lastSync;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-inter font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isOffline ? (
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                Offline
              </span>
            ) : (
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Live
              </span>
            )}
          </p>
        </div>
        <span className="text-3xl" role="img" aria-label={title}>
          {icon}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-roboto-mono ${getStatusColor()}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-lg text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last synced: {formatLastSync()}
        </div>
      </div>

      {isOffline && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
          Showing cached data
        </div>
      )}
    </motion.div>
  );
};
