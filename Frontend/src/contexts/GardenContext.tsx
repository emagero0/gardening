import React, { createContext, useContext, useReducer } from 'react';
// Removed useEffect, useLocalStorage, useIndexedDB

interface SensorData {
  // Split moisture into A and B for clarity
  moistureA: number;
  moistureB: number;
  temperature: number; // From DHT11
  humidity: number; // From DHT11
  npk: { // From NPK sensor
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

interface GardenState {
  irrigation: boolean;
  darkMode: boolean;
  sensorData: SensorData;
  lastSync: number | null; // Keep lastSync to show freshness
}

// Define specific payload structures for sensor updates
interface MoisturePayload { type: 'moisture'; id: 'A' | 'B'; value: number; timestamp?: string; }
interface DhtPayload { type: 'dht11'; temp: number; humidity: number; timestamp?: string; }
interface NpkPayload { type: 'npk'; n: number; p: number; k: number; timestamp?: string; }

type SensorUpdatePayload = MoisturePayload | DhtPayload | NpkPayload;

type Action =
  | { type: 'TOGGLE_IRRIGATION' }
  | { type: 'SET_IRRIGATION_STATE'; payload: boolean } // Added action
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'UPDATE_SENSOR_DATA'; payload: SensorUpdatePayload } // Updated payload type
  // Removed SET_OFFLINE_STATUS
  | { type: 'SET_LAST_SYNC'; payload: number };

const initialState: GardenState = {
  irrigation: false,
  darkMode: false, // Default dark mode can be handled elsewhere if needed (e.g., main.tsx)
  sensorData: {
    moistureA: 0,
    moistureB: 0,
    temperature: 0,
    humidity: 0,
    npk: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0
    }
  },
  // Removed isOffline
  lastSync: null
};

const GardenContext = createContext<{
  state: GardenState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const gardenReducer = (state: GardenState, action: Action): GardenState => {
  switch (action.type) {
    case 'TOGGLE_IRRIGATION':
      // Note: This only toggles local state. The actual command is sent via WebSocket.
      // Consider if SET_IRRIGATION_STATE driven by backend confirmation is preferred.
      return {
        ...state,
        irrigation: !state.irrigation
      };
    case 'SET_IRRIGATION_STATE': // Added case
      return {
        ...state,
        irrigation: action.payload
      };
    case 'TOGGLE_DARK_MODE':
      // Dark mode logic might be better handled outside this context now
      return {
        ...state,
        darkMode: !state.darkMode
      };
    case 'UPDATE_SENSOR_DATA': {
      const payload = action.payload;
      const newSensorData = { ...state.sensorData };

      switch (payload.type) {
        case 'moisture':
          if (payload.id === 'A') newSensorData.moistureA = payload.value;
          if (payload.id === 'B') newSensorData.moistureB = payload.value;
          break;
        case 'dht11':
          newSensorData.temperature = payload.temp;
          newSensorData.humidity = payload.humidity;
          break;
        case 'npk':
          newSensorData.npk = {
            nitrogen: payload.n,
            phosphorus: payload.p,
            potassium: payload.k
          };
          break;
        default:
          // Handle potential future sensor types or log unknown
          console.warn('Reducer received unknown sensor data type:', payload);
          return state; // Return current state if type is unknown
      }
      return {
        ...state,
        sensorData: newSensorData
      };
    }
    // Removed SET_OFFLINE_STATUS case
    case 'SET_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload
      };
    default:
      // Ensure exhaustive check (optional, requires `never` type)
      // const _exhaustiveCheck: never = action;
      return state;
  }
};

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gardenReducer, initialState);

  // Removed offline/caching useEffect hooks

  return (
    <GardenContext.Provider value={{ state, dispatch }}>
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error('useGarden must be used within a GardenProvider');
  }
  return context;
};
