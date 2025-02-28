import React from 'react';
import { motion } from 'framer-motion';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

export const ConnectionStatus: React.FC = () => {
  const isOffline = useOfflineStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg
        flex items-center space-x-2
        ${isOffline 
          ? 'bg-red-500 text-white' 
          : 'bg-green-500 text-white'}
      `}
    >
      <span className={`
        h-2 w-2 rounded-full
        ${isOffline ? 'bg-red-200' : 'bg-green-200'}
        animate-pulse
      `} />
      <span className="text-sm font-medium">
        {isOffline ? 'Working Offline' : 'Connected'}
      </span>
    </motion.div>
  );
};
