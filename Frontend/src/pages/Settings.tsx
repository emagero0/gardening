import React from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Re-add useLocalStorage

// Define a type for the thresholds
interface ThresholdSettings {
  moistureLow: number;
  moistureHigh: number;
  tempLow: number;
  tempHigh: number;
  humidityLow: number;
  humidityHigh: number;
  // Add NPK thresholds if needed later
}

const defaultThresholds: ThresholdSettings = {
  moistureLow: 30,
  moistureHigh: 70,
  tempLow: 18,
  tempHigh: 28,
  humidityLow: 40,
  humidityHigh: 80,
};

export const Settings: React.FC = () => {
  // Use useLocalStorage to manage threshold settings
  const [thresholds, setThresholds] = useLocalStorage<ThresholdSettings>(
    'sensorThresholds',
    defaultThresholds
  );

  // Helper function to handle input changes
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setThresholds(prev => ({
      ...prev,
      [name]: Number(value) // Store as number
    }));
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-inter font-bold text-gray-900 dark:text-white mb-8">
        Settings
      </h1>

      {/* Placeholder for future settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg mb-6"
      >
        <h2 className="text-xl font-inter font-semibold text-gray-900 dark:text-white mb-6">
          Sensor Warning Thresholds
        </h2>
        <div className="space-y-6">
          {/* Moisture Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Soil Moisture (%)
            </label>
            <div className="flex space-x-2 md:col-span-2">
              <input
                type="number"
                name="moistureLow"
                value={thresholds.moistureLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Low"
              />
              <input
                type="number"
                name="moistureHigh"
                value={thresholds.moistureHigh}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="High"
              />
            </div>
          </div>

          {/* Temperature Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Temperature (°C)
            </label>
            <div className="flex space-x-2 md:col-span-2">
              <input
                type="number"
                name="tempLow"
                value={thresholds.tempLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Low"
              />
              <input
                type="number"
                name="tempHigh"
                value={thresholds.tempHigh}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="High"
              />
            </div>
          </div>

          {/* Humidity Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Humidity (%)
            </label>
            <div className="flex space-x-2 md:col-span-2">
              <input
                type="number"
                name="humidityLow"
                value={thresholds.humidityLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Low"
              />
              <input
                type="number"
                name="humidityHigh"
                value={thresholds.humidityHigh}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="High"
              />
            </div>
          </div>

          {/* Add NPK thresholds here if needed */}

        </div>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          These thresholds determine the color coding (red/yellow/green) on the dashboard sensor cards. Settings are saved locally in your browser.
        </p>
      </motion.div>
    </div>
  );
};
