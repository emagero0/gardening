import React, { useEffect, useState } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useStorageEstimate } from '../hooks/useStorageEstimate';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const { clearData: clearSensorData, getData: getSensorData } = useIndexedDB({
    name: 'verticalGardenDB',
    version: 1,
    storeName: 'sensorData'
  });

  const { clearData: clearActionQueue, getData: getActionQueue } = useIndexedDB({
    name: 'verticalGardenDB',
    version: 1,
    storeName: 'actionQueue'
  });

  const [offlineStorageLimit, setOfflineStorageLimit] = useLocalStorage('offlineStorageLimit', 7);
  const [autoSync, setAutoSync] = useLocalStorage('autoSync', true);
  const { estimate, formatBytes, isSupported } = useStorageEstimate();

  const [sensorDataCount, setSensorDataCount] = useState<number>(0);
  const [actionQueueCount, setActionQueueCount] = useState<number>(0);

  useEffect(() => {
    // Get counts of stored items
    const fetchCounts = async () => {
      try {
        const sensorData = await getSensorData();
        const actionData = await getActionQueue();
        setSensorDataCount(Array.isArray(sensorData) ? sensorData.length : 0);
        setActionQueueCount(Array.isArray(actionData) ? actionData.length : 0);
      } catch (error) {
        console.error('Error fetching storage counts:', error);
      }
    };

    fetchCounts();
  }, [getSensorData, getActionQueue]);

  const handleClearData = async () => {
    try {
      await clearSensorData();
      await clearActionQueue();
      setSensorDataCount(0);
      setActionQueueCount(0);
      alert('Offline data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing offline data');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-inter font-bold text-gray-900 dark:text-white mb-8">
        Settings
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg mb-6"
      >
        <h2 className="text-xl font-inter font-semibold text-gray-900 dark:text-white mb-4">
          Offline Storage
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keep Offline Data For
            </label>
            <select
              value={offlineStorageLimit}
              onChange={(e) => setOfflineStorageLimit(Number(e.target.value))}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={1}>1 day</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-sync when online
            </span>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2
                focus:ring-primary focus:ring-offset-2
                ${autoSync ? 'bg-primary' : 'bg-gray-200'}
              `}
              role="switch"
              aria-checked={autoSync}
            >
              <span className="sr-only">Enable auto-sync</span>
              <motion.span
                layout
                className={`
                  inline-block h-4 w-4 transform rounded-full
                  bg-white shadow-lg
                  ${autoSync ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          <div>
            <button
              onClick={handleClearData}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg
                       hover:bg-red-600 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear Offline Data
            </button>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will delete all cached sensor data and pending actions
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-inter font-semibold text-gray-900 dark:text-white mb-4">
          Storage Usage
        </h2>
        <div className="space-y-4">
          {isSupported && estimate && (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Total Storage Usage
                  </span>
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                    {formatBytes(estimate.usage)} / {formatBytes(estimate.quota)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${estimate.percentageUsed}%` }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Sensor Data Records
            </span>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              {sensorDataCount} items
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pending Actions
            </span>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              {actionQueueCount} items
            </span>
          </div>

          {!isSupported && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Storage estimation is not supported in your browser
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
