import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIndexedDB } from '../hooks/useIndexedDB';

interface SensorData {
  moisture: number;
  temperature: number;
  humidity: number;
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

interface GardenState {
  irrigation: boolean;
  darkMode: boolean;
  sensorData: SensorData;
  isOffline: boolean;
  lastSync: number | null;
}

type Action =
  | { type: 'TOGGLE_IRRIGATION' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'UPDATE_SENSOR_DATA'; payload: Partial<SensorData> }
  | { type: 'SET_OFFLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: number };

const initialState: GardenState = {
  irrigation: false,
  darkMode: false,
  sensorData: {
    moisture: 0,
    temperature: 0,
    humidity: 0,
    npk: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0
    }
  },
  isOffline: !navigator.onLine,
  lastSync: null
};

const GardenContext = createContext<{
  state: GardenState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const gardenReducer = (state: GardenState, action: Action): GardenState => {
  switch (action.type) {
    case 'TOGGLE_IRRIGATION':
      return {
        ...state,
        irrigation: !state.irrigation
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode
      };
    case 'UPDATE_SENSOR_DATA':
      return {
        ...state,
        sensorData: {
          ...state.sensorData,
          ...action.payload
        }
      };
    case 'SET_OFFLINE_STATUS':
      return {
        ...state,
        isOffline: action.payload
      };
    case 'SET_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload
      };
    default:
      return state;
  }
};

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gardenReducer, initialState);
  const [autoSync] = useLocalStorage('autoSync', true);
  
  const { addData: cacheSensorData, getData: getCachedData } = useIndexedDB({
    name: 'verticalGardenDB',
    version: 1,
    storeName: 'sensorData'
  });

  // Handle online/offline status
  useEffect(() => {
    const handleStatusChange = () => {
      dispatch({ type: 'SET_OFFLINE_STATUS', payload: !navigator.onLine });
      if (navigator.onLine && autoSync) {
        // Trigger sync when coming back online
        dispatch({ type: 'SET_LAST_SYNC', payload: Date.now() });
      }
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [autoSync]);

  // Cache sensor data when offline
  useEffect(() => {
    if (state.isOffline) {
      cacheSensorData({
        ...state.sensorData,
        timestamp: Date.now()
      }).catch(console.error);
    }
  }, [state.sensorData, state.isOffline, cacheSensorData]);

  // Load cached data when offline
  useEffect(() => {
    if (state.isOffline) {
      getCachedData().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Use the most recent cached data
          const latestData = data[data.length - 1];
          dispatch({ 
            type: 'UPDATE_SENSOR_DATA',
            payload: {
              moisture: latestData.moisture,
              temperature: latestData.temperature,
              humidity: latestData.humidity,
              npk: latestData.npk
            }
          });
        }
      }).catch(console.error);
    }
  }, [state.isOffline, getCachedData]);

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
