import React from 'react';
import { motion } from 'framer-motion';
import { SensorCard } from '../components/SensorCard';
import { ValveControl } from '../components/ValveControl';
import { useGarden } from '../contexts/GardenContext';

export const Dashboard: React.FC = () => {
  const { state } = useGarden();
  const { sensorData } = state;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-8"
      >
        Garden Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SensorCard
          type="moisture"
          title="Soil Moisture"
          value={sensorData.moisture}
          unit="%"
          icon="💧"
        />
        <SensorCard
          type="temperature"
          title="Temperature"
          value={sensorData.temperature}
          unit="°C"
          icon="🌡️"
        />
        <SensorCard
          type="humidity"
          title="Humidity"
          value={sensorData.humidity}
          unit="%"
          icon="💨"
        />
        <SensorCard
          type="npk"
          title="NPK Levels"
          value={(
            sensorData.npk.nitrogen +
            sensorData.npk.phosphorus +
            sensorData.npk.potassium
          ) / 3}
          unit="ppm"
          icon="🌱"
        />
      </div>

      <div className="mt-8">
        <ValveControl />
      </div>
    </div>
  );
};
