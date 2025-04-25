import React from 'react';
import { motion } from 'framer-motion';
import { SensorCard } from '../components/SensorCard';
import { NPKTile } from '../components/NPKTile';
import { TrendChart } from '../components/TrendChart';
import { VisualGarden } from '../components/VisualGarden'; // Import VisualGarden
import { useGarden } from '../contexts/GardenContext';

// Define colors for charts (can be moved to a theme file later)
const CHART_COLORS = {
  temperature: '#F56565', // Red
  humidity: '#4299E1',    // Blue
  moistureA: '#48BB78',   // Green
  moistureB: '#38A169',   // Darker Green
  nitrogen: '#ECC94B',    // Yellow
  phosphorus: '#9F7AEA', // Purple
  potassium: '#ED8936'   // Orange
};

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

      {/* Updated grid layout to potentially accommodate more cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        <SensorCard
          type="moisture" // Keep type for threshold logic in SensorCard
          title="Moisture A" // Update title
          value={sensorData.moistureA} // Use moistureA
          unit="%"
          icon="💧"
        />
         <SensorCard
          type="moisture" // Keep type for threshold logic
          title="Moisture B" // Update title
          value={sensorData.moistureB} // Use moistureB
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
        {/* Replace combined NPK card with individual tiles */}
        <NPKTile
          nutrient="Nitrogen"
          value={sensorData.npk.nitrogen}
          unit="mg/kg"
          icon="🌱" // Plant growth icon for Nitrogen
        />
        <NPKTile
          nutrient="Phosphorus"
          value={sensorData.npk.phosphorus}
          unit="mg/kg"
          icon="🧪" // Lab/chemical icon for Phosphorus
        />
        <NPKTile
          nutrient="Potassium"
          value={sensorData.npk.potassium}
          unit="mg/kg"
          icon="⚡" // Energy/power icon for Potassium
        />
      </div>

      {/* Analytics Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} // Add a slight delay
        className="mt-10" // Add margin top
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Sensor Trends
        </h2>
        {/* Grid for charts - adjust columns as needed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Temperature Chart */}
          <div className="h-64"> {/* Set a fixed height for chart containers */}
            <TrendChart
              sensorType="temperature"
              title="Temperature"
              unit="°C"
              color={CHART_COLORS.temperature}
              showTimeRangeSelector={false}
            />
          </div>
          {/* Humidity Chart */}
          <div className="h-64">
            <TrendChart
              sensorType="humidity"
              title="Humidity"
              unit="%"
              color={CHART_COLORS.humidity}
              showTimeRangeSelector={false}
            />
          </div>
          {/* Moisture A Chart */}
          <div className="h-64">
            <TrendChart
              sensorType="moistureA"
              title="Moisture A"
              unit="%"
              color={CHART_COLORS.moistureA}
              showTimeRangeSelector={false}
            />
          </div>
          {/* Moisture B Chart */}
          <div className="h-64">
            <TrendChart
              sensorType="moistureB"
              title="Moisture B"
              unit="%"
              color={CHART_COLORS.moistureB}
              showTimeRangeSelector={false}
            />
          </div>
          {/* Nitrogen Chart */}
          <div className="h-64">
            <TrendChart
              sensorType="nitrogen"
              title="Nitrogen"
              unit="ppm"
              color={CHART_COLORS.nitrogen}
              showTimeRangeSelector={false}
            />
          </div>
          {/* Phosphorus Chart */}
          <div className="h-64">
            <TrendChart
              sensorType="phosphorus"
              title="Phosphorus"
              unit="ppm"
              color={CHART_COLORS.phosphorus}
              showTimeRangeSelector={false}
            />
          </div>
          {/* Potassium Chart */}
          <div className="h-64">
            <TrendChart
              sensorType="potassium"
              title="Potassium"
              unit="ppm"
              color={CHART_COLORS.potassium}
              showTimeRangeSelector={false}
            />
          </div>
        </div>
      </motion.div>

      {/* Visual Garden Representation Section */}
      <div className="mt-10"> {/* Add margin top */}
        <VisualGarden />
      </div>

      {/* Removed ValveControl component from the dashboard */}
      {/* <div className="mt-8">
        <ValveControl />
      </div> */}
    </div>
  );
};
