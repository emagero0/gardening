import { SensorDataPoint } from '../hooks/useSensorHistory';

const POINTS_PER_HOUR = {
  '24h': 4,    // Every 15 minutes for 24h
  '7d': 1,     // Hourly for 7d
  '30d': 0.25  // Every 4 hours for 30d
};

const roundToDecimal = (num: number, decimals: number = 1): number => {
  return Number(Number(num).toFixed(decimals));
};

export const generateSampleData = (days: number = 7): SensorDataPoint[] => {
  console.log('Generating sample data for', days, 'days');
  const data: SensorDataPoint[] = [];
  const now = Date.now();
  
  // Determine points per hour based on time range
  let pointsPerHour = 1;
  if (days === 1) pointsPerHour = POINTS_PER_HOUR['24h'];
  else if (days === 7) pointsPerHour = POINTS_PER_HOUR['7d'];
  else if (days === 30) pointsPerHour = POINTS_PER_HOUR['30d'];

  const intervalMs = Math.floor(3600000 / pointsPerHour); // Convert to milliseconds
  const totalPoints = Math.floor(days * 24 * pointsPerHour);

  console.log(`Generating ${totalPoints} points with ${intervalMs}ms interval`);

  try {
    for (let i = totalPoints - 1; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      const timeOfDay = new Date(timestamp).getHours();
      
      // Simulate daily patterns
      const dayProgress = timeOfDay / 24;
      const isDaytime = timeOfDay >= 6 && timeOfDay <= 18;

      // Temperature varies between 18-28°C with daily cycle
      const baseTemp = 23 + Math.sin(dayProgress * Math.PI * 2) * 5;
      const temperature = roundToDecimal(Math.max(18, Math.min(28, baseTemp + (Math.random() * 2 - 1))));

      // Humidity inverse to temperature, ranges 40-80%
      const baseHumidity = 60 - Math.sin(dayProgress * Math.PI * 2) * 20;
      const humidity = roundToDecimal(Math.max(40, Math.min(80, baseHumidity + (Math.random() * 5 - 2.5))));

      // Moisture decreases during day, increases with random watering
      const baseMoisture = 65 - (isDaytime ? 10 : 0);
      const moisture = roundToDecimal(Math.max(30, Math.min(90, baseMoisture + (Math.random() * 10 - 5))));

      // NPK levels slowly decrease over time with random fluctuations
      const baseNpk = 50 - (i / totalPoints * 10);
      const point: SensorDataPoint = {
        timestamp: new Date(timestamp).toISOString(),
        temperature,
        humidity,
        moisture,
        npk: {
          nitrogen: roundToDecimal(Math.max(20, Math.min(80, baseNpk + (Math.random() * 5 - 2.5)))),
          phosphorus: roundToDecimal(Math.max(20, Math.min(80, baseNpk + (Math.random() * 5 - 2.5)))),
          potassium: roundToDecimal(Math.max(20, Math.min(80, baseNpk + (Math.random() * 5 - 2.5))))
        }
      };

      data.push(point);
    }

    console.log('Sample data generated:', data.length, 'points');
    // Validate data structure
    if (data.length > 0) {
      const sample = data[0];
      console.log('Sample data point:', {
        timestamp: sample.timestamp,
        temperature: sample.temperature,
        humidity: sample.humidity,
        moisture: sample.moisture,
        npk: sample.npk
      });
    }

    return data;
  } catch (error) {
    console.error('Error generating sample data:', error);
    return [];
  }
};
