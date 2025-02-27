import React from 'react';
import { motion } from 'framer-motion';
import { useGarden } from '../contexts/GardenContext';

export const ValveControl: React.FC = () => {
  const { state, dispatch } = useGarden();

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_IRRIGATION' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-dark p-4 rounded-lg shadow-lg"
    >
      <h3 className="text-lg font-inter font-semibold text-gray-900 dark:text-white mb-4">
        Irrigation Control
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {state.irrigation ? 'Watering Active' : 'Watering Inactive'}
        </span>
        <button
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            ${state.irrigation ? 'bg-primary' : 'bg-gray-200'}
            transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          `}
          role="switch"
          aria-checked={state.irrigation}
        >
          <span className="sr-only">Toggle irrigation</span>
          <motion.span
            layout
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
              ${state.irrigation ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {state.irrigation 
          ? 'Click to stop watering'
          : 'Click to start watering'
        }
      </p>
    </motion.div>
  );
};
