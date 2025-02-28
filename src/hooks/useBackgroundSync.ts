import { useState, useEffect } from 'react';
import { useOfflineStatus } from './useOfflineStatus';
import { useIndexedDB } from './useIndexedDB';

interface QueuedAction {
  type: 'irrigation' | 'settings';
  payload: any;
  timestamp: number;
}

export const useBackgroundSync = () => {
  const isOffline = useOfflineStatus();
  const { addData: queueAction, getData: getQueue, clearData: clearQueue } = useIndexedDB({
    name: 'verticalGardenDB',
    version: 1,
    storeName: 'actionQueue'
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Process queued actions when coming back online
  useEffect(() => {
    const processQueue = async () => {
      if (isOffline) return;

      try {
        setIsPending(true);
        const queue = await getQueue() as QueuedAction[];
        
        if (queue.length === 0) {
          setIsPending(false);
          return;
        }

        // Sort actions by timestamp
        const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

        // Process each action
        for (const action of sortedQueue) {
          try {
            // Here you would implement the actual API calls
            // For example:
            // if (action.type === 'irrigation') {
            //   await api.updateIrrigation(action.payload);
            // }

            console.log('Processing queued action:', action);
          } catch (err) {
            console.error('Error processing action:', err);
            setError(err as Error);
          }
        }

        // Clear the queue after successful processing
        await clearQueue();
      } catch (err) {
        console.error('Error processing queue:', err);
        setError(err as Error);
      } finally {
        setIsPending(false);
      }
    };

    // When coming back online, process the queue
    if (!isOffline) {
      processQueue();
    }
  }, [isOffline, getQueue, clearQueue]);

  // Queue an action when offline
  const queueOfflineAction = async (type: QueuedAction['type'], payload: any) => {
    if (!isOffline) {
      throw new Error('Should only queue actions when offline');
    }

    try {
      await queueAction({
        type,
        payload,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Error queueing action:', err);
      setError(err as Error);
      throw err;
    }
  };

  return {
    queueOfflineAction,
    isPending,
    error
  };
};
