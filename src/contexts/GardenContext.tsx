import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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

interface Alert {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface GardenState {
  sensorData: SensorData;
  irrigation: boolean;
  alerts: Alert[];
  darkMode: boolean;
}

type GardenAction =
  | { type: 'UPDATE_SENSOR_DATA'; payload: SensorData }
  | { type: 'TOGGLE_IRRIGATION' }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'TOGGLE_DARK_MODE' };

const initialState: GardenState = {
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
  irrigation: false,
  alerts: [],
  darkMode: false
};

const gardenReducer = (state: GardenState, action: GardenAction): GardenState => {
  switch (action.type) {
    case 'UPDATE_SENSOR_DATA':
      return {
        ...state,
        sensorData: action.payload
      };
    case 'TOGGLE_IRRIGATION':
      return {
        ...state,
        irrigation: !state.irrigation
      };
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts]
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode
      };
    default:
      return state;
  }
};

const GardenContext = createContext<{
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
} | undefined>(undefined);

export const GardenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gardenReducer, initialState);

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
