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
  nitrogenLow: number;
  nitrogenHigh: number;
  phosphorusLow: number;
  phosphorusHigh: number;
  potassiumLow: number;
  potassiumHigh: number;
  // Thresholds for Kitchen Waste Advice popup
  nitrogenAdviceLow: number;
  phosphorusAdviceLow: number;
  potassiumAdviceLow: number;
}

const defaultThresholds: ThresholdSettings = {
  moistureLow: 30,
  moistureHigh: 70,
  tempLow: 18,
  tempHigh: 28,
  humidityLow: 40,
  humidityHigh: 80,
  nitrogenLow: 20, // Example default
  nitrogenHigh: 60, // Example default
  phosphorusLow: 15, // Example default
  phosphorusHigh: 50, // Example default
  potassiumLow: 25, // Example default
  potassiumHigh: 70, // Example default
  nitrogenAdviceLow: 15, // Example default
  phosphorusAdviceLow: 10, // Example default
  potassiumAdviceLow: 20, // Example default
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

          {/* Nitrogen Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Nitrogen (ppm)
            </label>
            <div className="flex space-x-2 md:col-span-2">
              <input
                type="number"
                name="nitrogenLow"
                value={thresholds.nitrogenLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Low"
              />
              <input
                type="number"
                name="nitrogenHigh"
                value={thresholds.nitrogenHigh}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="High"
              />
            </div>
          </div>

          {/* Phosphorus Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Phosphorus (ppm)
            </label>
            <div className="flex space-x-2 md:col-span-2">
              <input
                type="number"
                name="phosphorusLow"
                value={thresholds.phosphorusLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Low"
              />
              <input
                type="number"
                name="phosphorusHigh"
                value={thresholds.phosphorusHigh}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="High"
              />
            </div>
          </div>

          {/* Potassium Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Potassium (ppm)
            </label>
            <div className="flex space-x-2 md:col-span-2">
              <input
                type="number"
                name="potassiumLow"
                value={thresholds.potassiumLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Low"
              />
              <input
                type="number"
                name="potassiumHigh"
                value={thresholds.potassiumHigh}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="High"
              />
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          These thresholds determine the color coding (red/yellow/green) on the dashboard sensor cards. Settings are saved locally in your browser.
        </p>
      </motion.div>

      {/* Kitchen Waste Advice Thresholds */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-inter font-semibold text-gray-900 dark:text-white mb-6">
          Kitchen Waste Advice Thresholds
        </h2>
        <div className="space-y-6">
          {/* Nitrogen Advice Threshold */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label htmlFor="nitrogenAdviceLow" className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Nitrogen Low (ppm)
            </label>
            <div className="md:col-span-2">
              <input
                id="nitrogenAdviceLow"
                type="number"
                name="nitrogenAdviceLow"
                value={thresholds.nitrogenAdviceLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Trigger Level"
              />
            </div>
          </div>

          {/* Phosphorus Advice Threshold */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label htmlFor="phosphorusAdviceLow" className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Phosphorus Low (ppm)
            </label>
            <div className="md:col-span-2">
              <input
                id="phosphorusAdviceLow"
                type="number"
                name="phosphorusAdviceLow"
                value={thresholds.phosphorusAdviceLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Trigger Level"
              />
            </div>
          </div>

          {/* Potassium Advice Threshold */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label htmlFor="potassiumAdviceLow" className="text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-1">
              Potassium Low (ppm)
            </label>
            <div className="md:col-span-2">
              <input
                id="potassiumAdviceLow"
                type="number"
                name="potassiumAdviceLow"
                value={thresholds.potassiumAdviceLow}
                onChange={handleThresholdChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Trigger Level"
              />
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          If a nutrient level drops below this value, a kitchen waste advice popup will be triggered on the dashboard. Settings are saved locally.
        </p>
      </motion.div>
    </div>
  );
};
