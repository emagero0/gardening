import React from 'react';
import { motion } from 'framer-motion';
import { useGarden } from '../contexts/GardenContext';

// Helper function to determine color based on value and thresholds
const getSectionColor = (value: number, lowThreshold: number, highThreshold: number): string => {
  if (value < lowThreshold) return 'bg-red-500'; // Low moisture - Red
  if (value > highThreshold) return 'bg-blue-400'; // High moisture - Blue (adjust as needed)
  return 'bg-green-500'; // Normal moisture - Green
};

export const VisualGarden: React.FC = () => {
  const { state } = useGarden();
  const { sensorData, thresholds } = state;

  const colorA = getSectionColor(sensorData.moistureA, thresholds.moistureLow, thresholds.moistureHigh);
  const colorB = getSectionColor(sensorData.moistureB, thresholds.moistureLow, thresholds.moistureHigh);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }} // Add delay
      className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg"
    >
      <h3 className="text-lg font-inter font-semibold text-gray-900 dark:text-white mb-4">
        Garden Sections (Moisture Status)
      </h3>
      <div className="flex space-x-4 h-24"> {/* Container for sections */}
        {/* Section A */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Section A</span>
          <div className={`w-full h-full rounded ${colorA} transition-colors duration-500 flex items-center justify-center`}>
             <span className="text-white font-bold text-lg">{sensorData.moistureA.toFixed(1)}%</span>
          </div>
        </div>

        {/* Section B */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
           <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Section B</span>
           <div className={`w-full h-full rounded ${colorB} transition-colors duration-500 flex items-center justify-center`}>
             <span className="text-white font-bold text-lg">{sensorData.moistureB.toFixed(1)}%</span>
           </div>
        </div>
      </div>
       <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
         Color indicates moisture level: Red (Low), Green (Normal), Blue (High). Based on thresholds set in Settings.
       </p>
    </motion.div>
  );
};
