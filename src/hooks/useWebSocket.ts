import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGarden } from '../contexts/GardenContext';

interface ServerToClientEvents {
  'sensor-update': (data: {
    moisture: number;
    temperature: number;
    humidity: number;
    npk: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
  }) => void;
  'alert': (data: {
    message: string;
    priority: 'low' | 'medium' | 'high';
  }) => void;
}

interface ClientToServerEvents {
  'toggle-irrigation': (status: boolean) => void;
}

export const useWebSocket = () => {
  const { dispatch } = useGarden();
  
  const handleSensorUpdate = useCallback((data: ServerToClientEvents['sensor-update']) => {
    dispatch({ type: 'UPDATE_SENSOR_DATA', payload: data });
  }, [dispatch]);

  const handleAlert = useCallback((data: ServerToClientEvents['alert']) => {
    dispatch({
      type: 'ADD_ALERT',
      payload: {
        id: Date.now().toString(),
        message: data.message,
        priority: data.priority,
        timestamp: new Date()
      }
    });
  }, [dispatch]);

  useEffect(() => {
    // In a real app, this would be an environment variable
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('ws://localhost:3001');

    socket.on('sensor-update', handleSensorUpdate);
    socket.on('alert', handleAlert);

    return () => {
      socket.off('sensor-update', handleSensorUpdate);
      socket.off('alert', handleAlert);
      socket.disconnect();
    };
  }, [handleSensorUpdate, handleAlert]);
};
