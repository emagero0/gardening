import { useEffect, useRef, useCallback, useState } from 'react'; // Added useState
import { useGarden } from '../contexts/GardenContext';
// Removed useLocalStorage and useOfflineStatus

export const useWebSocket = (url: string = 'ws://localhost:3001') => { // Use correct URL
  const { state, dispatch } = useGarden();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false); // Local state for connection status

  const connect = useCallback(() => {
    // Prevent multiple connections
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    console.log(`Attempting to connect WebSocket to ${url}...`);
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        // Removed SET_OFFLINE_STATUS dispatch
        // Optionally send initial state or request data
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          // Handle different message types from backend
          switch (message.type) {
            case 'sensor_update':
              dispatch({ type: 'UPDATE_SENSOR_DATA', payload: message.payload });
              dispatch({ type: 'SET_LAST_SYNC', payload: Date.now() }); // Keep track of last update
              break;
            case 'irrigation_state': // If backend confirms state changes
              dispatch({ type: 'SET_IRRIGATION_STATE', payload: message.status });
              break;
            case 'info':
              console.log('Info from server:', message.message);
              break;
            case 'error':
              console.error('Error from server:', message.message);
              break;
            default:
              console.warn('Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket Disconnected:', event.code, event.reason);
        setIsConnected(false);
        // Simple reconnect logic: try again after 3 seconds
        // Avoid immediate loops on persistent connection errors
        if (!event.wasClean) {
           console.log('Attempting to reconnect WebSocket in 3 seconds...');
           setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // ws.close(); // onclose will be called automatically after an error
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [url, dispatch]); // Added url to dependencies

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect(); // Attempt to connect when the hook mounts

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (wsRef.current) {
        console.log('Closing WebSocket connection on unmount.');
        wsRef.current.close(1000, 'Component unmounting'); // 1000 is normal closure
        wsRef.current = null;
      }
    };
  }, [connect]); // connect is stable due to useCallback

  // Function to send commands (like irrigation)
  const sendCommand = useCallback((command: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageString = JSON.stringify(command);
      console.log('Sending WebSocket command:', messageString);
      wsRef.current.send(messageString);
    } else {
      console.warn('WebSocket not open. Cannot send command:', command);
      // Optionally queue the command or notify the user
    }
  }, []); // Depends only on wsRef

  // Specific function for irrigation, using the generic sendCommand
  const sendIrrigationCommand = useCallback((status: boolean) => {
    sendCommand({
      type: 'control',
      action: 'toggle_irrigation',
      payload: { status } // Match backend expectation
    });
  }, [sendCommand]);

  // Removed auto-sync effect for irrigation

  return {
    isConnected, // Use local state for connection status
    sendCommand, // Expose generic command function
    sendIrrigationCommand // Expose specific irrigation function
  };
};
