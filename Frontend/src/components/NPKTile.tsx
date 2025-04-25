import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGarden } from '../contexts/GardenContext';

type NutrientType = 'Nitrogen' | 'Phosphorus' | 'Potassium';

interface NPKTileProps {
  nutrient: NutrientType;
  value: number;
  unit: string;
  icon: string;
}

export const NPKTile: React.FC<NPKTileProps> = ({ nutrient, value, unit, icon }) => {
  const { state, dispatch } = useGarden();
  const { thresholds, lastSync } = state;

  const adviceThresholdKey: keyof typeof thresholds = `${nutrient.toLowerCase()}AdviceLow` as keyof typeof thresholds;
  const adviceThreshold = thresholds[adviceThresholdKey];

  const lowThresholdKey: keyof typeof thresholds = `${nutrient.toLowerCase()}Low` as keyof typeof thresholds;
  const highThresholdKey: keyof typeof thresholds = `${nutrient.toLowerCase()}High` as keyof typeof thresholds;
  const lowThreshold = thresholds[lowThresholdKey];
  const highThreshold = thresholds[highThresholdKey];

  useEffect(() => {
    if (value < adviceThreshold) {
      if (state.advicePopup.nutrient !== nutrient) {
        dispatch({ type: 'SHOW_ADVICE_POPUP', payload: nutrient });
      }
    }
  }, [value, adviceThreshold, nutrient, dispatch, state.advicePopup.nutrient]);

  const getStatusColor = () => {
    if (value < lowThreshold) return 'text-red-500';
    if (value > highThreshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    const diff = Date.now() - lastSync;
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
            {nutrient}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              Live
            </span>
          </p>
        </div>
        <span className="text-3xl" role="img" aria-label={nutrient}>
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
    </motion.div>
  );
};
