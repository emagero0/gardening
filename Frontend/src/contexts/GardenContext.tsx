import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Import useLocalStorage
// Import ThresholdSettings and defaultThresholds from Settings.tsx
// Assuming Settings.tsx exports them or defining them here if not.
// For simplicity, let's define a similar structure here.
// Ideally, share the type from Settings.tsx.
interface ThresholdSettings {
  moistureLow: number;
  moistureHigh: number;
  tempLow: number;
  tempHigh: number;
  humidityLow: number;
  humidityHigh: number;
  nitrogenLow: number;
  nitrogenHigh: number;
  phosphorusLow: number;
  phosphorusHigh: number;
  potassiumLow: number;
  potassiumHigh: number;
  nitrogenAdviceLow: number;
  phosphorusAdviceLow: number;
  potassiumAdviceLow: number;
}

const defaultThresholds: ThresholdSettings = {
  moistureLow: 30, moistureHigh: 70, tempLow: 18, tempHigh: 28, humidityLow: 40, humidityHigh: 80,
  nitrogenLow: 20, nitrogenHigh: 60, phosphorusLow: 15, phosphorusHigh: 50, potassiumLow: 25, potassiumHigh: 70,
  nitrogenAdviceLow: 15, phosphorusAdviceLow: 10, potassiumAdviceLow: 20,
};


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

// Define the type for the advice popup state
type AdvicePopupNutrient = 'Nitrogen' | 'Phosphorus' | 'Potassium';
interface AdvicePopupState {
  nutrient: AdvicePopupNutrient | null;
}

interface GardenState {
  irrigation: boolean;
  darkMode: boolean;
  sensorData: SensorData;
  lastSync: number | null; // Keep lastSync to show freshness
  thresholds: ThresholdSettings; // Add thresholds to state
  advicePopup: AdvicePopupState; // Add advice popup state
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
  | { type: 'SET_LAST_SYNC'; payload: number }
  | { type: 'SHOW_ADVICE_POPUP'; payload: AdvicePopupNutrient } // Action to show popup
  | { type: 'HIDE_ADVICE_POPUP' }; // Action to hide popup
  // Removed SET_OFFLINE_STATUS

// Function to get thresholds from local storage or use defaults
const getInitialThresholds = (): ThresholdSettings => {
  try {
    const stored = localStorage.getItem('sensorThresholds');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Basic validation to ensure it has some expected keys
      if (parsed && typeof parsed.moistureLow === 'number') {
        // Merge with defaults to ensure all keys are present
        return { ...defaultThresholds, ...parsed };
      }
    }
  } catch (error) {
    console.error("Error reading thresholds from localStorage:", error);
  }
  return defaultThresholds;
};


const initialState: GardenState = {
  irrigation: false,
  darkMode: false, // Default dark mode can be handled elsewhere if needed
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
  lastSync: null,
  // Removed isOffline
  thresholds: getInitialThresholds(), // Initialize thresholds from localStorage
  advicePopup: { nutrient: null } // Initialize popup state
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
    case 'SHOW_ADVICE_POPUP':
      // Only show if not already showing for the same nutrient
      if (state.advicePopup.nutrient === action.payload) {
        return state;
      }
      return {
        ...state,
        advicePopup: { nutrient: action.payload }
      };
    case 'HIDE_ADVICE_POPUP':
      if (state.advicePopup.nutrient === null) {
         return state; // No change needed if already hidden
      }
      return {
        ...state,
        advicePopup: { nutrient: null }
      };
    default:
      // Ensure exhaustive check (optional, requires `never` type)
      // const _exhaustiveCheck: never = action; // Uncomment if using strict checks
      return state;
  }
};

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use useLocalStorage hook to keep thresholds sync'd with localStorage changes from Settings page
  const [storedThresholds, setStoredThresholds] = useLocalStorage<ThresholdSettings>(
    'sensorThresholds',
    defaultThresholds
  );
  const [state, dispatch] = useReducer(gardenReducer, {
    ...initialState,
    thresholds: storedThresholds // Initialize with potentially updated values
  });

  // Effect to update context state if localStorage changes (e.g., from Settings page)
  // This ensures the context reflects the latest saved settings without needing a refresh.
  useEffect(() => {
    // Check if the storedThresholds are different from the context state's thresholds
    // This prevents unnecessary state updates if the values are already in sync.
    if (JSON.stringify(state.thresholds) !== JSON.stringify(storedThresholds)) {
       // Update the context state. We don't dispatch an action here,
       // as this effect directly synchronizes the state derived from localStorage.
       // A dedicated action could be created if more complex logic is needed.
       // For now, directly updating the state via the reducer during initialization
       // and relying on this effect for subsequent updates is sufficient.
       // Note: This approach assumes the reducer logic doesn't need to run
       // when thresholds are updated externally. If actions depend on threshold
       // changes, a dedicated 'UPDATE_THRESHOLDS' action would be better.
       // Let's refine initialState calculation instead.
       console.log("Thresholds updated in localStorage, context state needs update (relying on re-render or next state change)");
       // A better approach might be to pass setStoredThresholds down or trigger a specific action.
       // For now, we rely on the fact that useLocalStorage provides the latest value on re-render.
       // Let's adjust the initial state logic slightly.
    }
  }, [storedThresholds, state.thresholds]);


  // Recalculate initial state if storedThresholds changes after initial load
  // This is a bit redundant with useLocalStorage but ensures context has latest on provider mount/update
  const currentInitialState = React.useMemo(() => ({
      ...initialState,
      thresholds: storedThresholds
  }), [storedThresholds]);

  // Use the recalculated initial state if needed, though useReducer initializes only once.
  // The effect above is the primary mechanism for reacting to external changes.

  // Removed offline/caching useEffect hooks

  return (
    // Pass the potentially updated state down
    <GardenContext.Provider value={{ state: { ...state, thresholds: storedThresholds }, dispatch }}>
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
