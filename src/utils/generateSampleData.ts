interface SensorDataPoint {
  timestamp: number;
  moisture: number;
  temperature: number;
  humidity: number;
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export const generateSampleData = (days: number = 7): SensorDataPoint[] => {
  const data: SensorDataPoint[] = [];
  const now = Date.now();
  const interval = 1000 * 60 * 30; // 30 minutes
  const points = (days * 24 * 2); // 2 points per hour

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const timeOfDay = new Date(timestamp).getHours();
    
    // Simulate daily patterns
    const dayProgress = timeOfDay / 24;
    const isDaytime = timeOfDay >= 6 && timeOfDay <= 18;

    // Temperature varies between 18-28°C with daily cycle
    const baseTemp = 23 + Math.sin(dayProgress * Math.PI * 2) * 5;
    const temperature = baseTemp + (Math.random() * 2 - 1);

    // Humidity inverse to temperature, ranges 40-80%
    const baseHumidity = 60 - Math.sin(dayProgress * Math.PI * 2) * 20;
    const humidity = baseHumidity + (Math.random() * 5 - 2.5);

    // Moisture decreases during day, increases with random watering
    const baseMoisture = 65 - (isDaytime ? 10 : 0);
    const moisture = baseMoisture + (Math.random() * 10 - 5);

    // NPK levels slowly decrease over time with random fluctuations
    const baseNpk = 50 - (i / points * 10);
    data.push({
      timestamp,
      temperature: Math.max(18, Math.min(28, temperature)),
      humidity: Math.max(40, Math.min(80, humidity)),
      moisture: Math.max(30, Math.min(90, moisture)),
      npk: {
        nitrogen: baseNpk + (Math.random() * 5 - 2.5),
        phosphorus: baseNpk + (Math.random() * 5 - 2.5),
        potassium: baseNpk + (Math.random() * 5 - 2.5)
      }
    });
  }

  return data;
};
