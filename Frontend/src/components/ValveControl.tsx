import React from 'react';
import { motion } from 'framer-motion';
import { useGarden } from '../contexts/GardenContext';
// Removed useOfflineStatus and useBackgroundSync imports

export const ValveControl: React.FC = () => {
  const { state, dispatch } = useGarden();
  // Removed isOffline and isPending variables

  const handleToggle = () => {
    // Simplified: Just dispatch the state change.
    // Sending the command via WebSocket should be handled elsewhere (e.g., in GardenContext).
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
          {/* Removed isPending indicator */}
        </span>
        <button
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${state.irrigation ? 'bg-primary' : 'bg-gray-200'}
            {/* Removed disabled state based on isPending */}
          `}
          role="switch"
          aria-checked={state.irrigation}
          // Removed disabled={isPending}
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
        {/* Simplified text, removed offline condition */}
        {state.irrigation 
          ? 'Click to stop watering'
          : 'Click to start watering'
        }
      </p>
    </motion.div>
  );
};
