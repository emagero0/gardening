import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarden } from '../contexts/GardenContext';

// Simple advice mapping - can be expanded
const adviceMap = {
  Nitrogen: "Low Nitrogen: Consider adding coffee grounds or grass clippings to your compost.",
  Phosphorus: "Low Phosphorus: Bone meal or banana peels can help increase phosphorus levels.",
  Potassium: "Low Potassium: Wood ash (use sparingly) or citrus rinds are good sources of potassium.",
};

export const KitchenAdvicePopup: React.FC = () => {
  const { state, dispatch } = useGarden();
  const { nutrient } = state.advicePopup;

  const handleClose = () => {
    dispatch({ type: 'HIDE_ADVICE_POPUP' });
  };

  const adviceText = nutrient ? adviceMap[nutrient] : '';

  return (
    <AnimatePresence>
      {nutrient && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 z-50" // Positioned at bottom-right
        >
          <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg shadow-lg max-w-sm" role="alert">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">Kitchen Waste Advice</p>
                <p className="text-sm">{adviceText}</p>
              </div>
              <button
                onClick={handleClose}
                className="ml-4 text-yellow-700 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
                aria-label="Close advice popup"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
