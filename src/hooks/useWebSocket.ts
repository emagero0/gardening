import { useEffect, useRef, useCallback } from 'react';
import { useGarden } from '../contexts/GardenContext';
import { useLocalStorage } from './useLocalStorage';
import { useOfflineStatus } from './useOfflineStatus';

export const useWebSocket = () => {
  const { state, dispatch } = useGarden();
  const wsRef = useRef<WebSocket | null>(null);
  const [autoSync] = useLocalStorage('autoSync', true);
  const isOffline = useOfflineStatus();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket('wss://your-garden-api.com');

      ws.onopen = () => {
        console.log('WebSocket Connected');
        dispatch({ type: 'SET_OFFLINE_STATUS', payload: false });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          dispatch({ type: 'UPDATE_SENSOR_DATA', payload: data });
          dispatch({ type: 'SET_LAST_SYNC', payload: Date.now() });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        if (navigator.onLine) {
          // Only attempt to reconnect if we're online
          setTimeout(() => connect(), 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        ws.close();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [dispatch]);

  // Handle connection based on online/offline status
  useEffect(() => {
    if (!isOffline && autoSync) {
      connect();
    } else if (isOffline && wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOffline, autoSync, connect]);

  // Send irrigation command
  const sendIrrigationCommand = useCallback((status: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'IRRIGATION_CONTROL',
        status
      }));
    }
  }, []);

  // Auto-sync irrigation state when coming back online
  useEffect(() => {
    if (!isOffline && autoSync && wsRef.current?.readyState === WebSocket.OPEN) {
      sendIrrigationCommand(state.irrigation);
    }
  }, [isOffline, autoSync, state.irrigation, sendIrrigationCommand]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendIrrigationCommand
  };
};
