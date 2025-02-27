import React from 'react';
import { motion } from 'framer-motion';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon,
  color = 'primary'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-dark p-4 rounded-lg shadow-lg border-l-4 border-${color} flex items-center justify-between`}
    >
      <div className="flex items-center space-x-4">
        <div className={`text-${color} text-2xl`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-inter text-gray-600 dark:text-gray-300">
            {title}
          </h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-roboto-mono font-bold text-gray-900 dark:text-white">
              {value.toFixed(1)}
            </span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
