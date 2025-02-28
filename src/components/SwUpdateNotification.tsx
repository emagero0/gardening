import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SwUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      window.addEventListener('sw-update-available', () => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  const handleUpdate = () => {
    // Reload the page to activate the new service worker
    window.location.reload();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 
                     bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Update Available
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                A new version of the app is available. Update now to get the latest features and improvements.
              </p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleUpdate}
                  className="inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold 
                           text-white bg-primary hover:bg-primary/90 focus:outline-none 
                           focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Update Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold 
                           text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 
                           hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none 
                           focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 inline-flex flex-shrink-0 justify-center rounded-md 
                       text-gray-400 hover:text-gray-500 focus:outline-none 
                       focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
