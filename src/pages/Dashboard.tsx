import React from 'react';
import { SensorCard } from '../components/SensorCard';
import { ValveControl } from '../components/ValveControl';
import { useGarden } from '../contexts/GardenContext';
import { useWebSocket } from '../hooks/useWebSocket';

// Icons (using emoji for now, would use Material Icons in production)
const ICONS = {
  moisture: '💧',
  temperature: '🌡️',
  humidity: '💨',
  nitrogen: '🌱',
  phosphorus: '🌿',
  potassium: '🍃'
};

export const Dashboard: React.FC = () => {
  const { state } = useGarden();
  useWebSocket(); // Initialize WebSocket connection

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-inter font-bold text-gray-900 dark:text-white mb-8">
        Garden Status
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SensorCard
          title="Soil Moisture"
          value={state.sensorData.moisture}
          unit="%"
          icon={ICONS.moisture}
          color="primary"
        />
        <SensorCard
          title="Temperature"
          value={state.sensorData.temperature}
          unit="°C"
          icon={ICONS.temperature}
          color="secondary"
        />
        <SensorCard
          title="Humidity"
          value={state.sensorData.humidity}
          unit="%"
          icon={ICONS.humidity}
          color="primary"
        />
      </div>

      <div className="mb-8">
        <ValveControl />
      </div>

      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-inter font-semibold text-gray-900 dark:text-white mb-4">
          NPK Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SensorCard
            title="Nitrogen"
            value={state.sensorData.npk.nitrogen}
            unit="mg/kg"
            icon={ICONS.nitrogen}
            color="secondary"
          />
          <SensorCard
            title="Phosphorus"
            value={state.sensorData.npk.phosphorus}
            unit="mg/kg"
            icon={ICONS.phosphorus}
            color="secondary"
          />
          <SensorCard
            title="Potassium"
            value={state.sensorData.npk.potassium}
            unit="mg/kg"
            icon={ICONS.potassium}
            color="secondary"
          />
        </div>
      </div>
    </div>
  );
};
