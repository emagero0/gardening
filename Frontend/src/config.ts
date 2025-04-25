// API Configuration
export const config = {
    apiUrl: '/api',
    wsUrl: `ws://${window.location.host}/ws`,
    endpoints: {
        sensorHistory: '/api/sensor-history',
        sensorData: '/api/sensor-data',
        health: '/api/health'
    }
};
