import { useState, useEffect } from 'react';

interface StorageEstimate {
  quota: number;
  usage: number;
  available: number;
  percentageUsed: number;
}

export const useStorageEstimate = () => {
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getEstimate = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const { quota, usage } = await navigator.storage.estimate();
          if (typeof quota === 'number' && typeof usage === 'number') {
            const available = quota - usage;
            const percentageUsed = (usage / quota) * 100;
            
            setEstimate({
              quota,
              usage,
              available,
              percentageUsed
            });
          }
        } else {
          throw new Error('Storage estimation not supported');
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error estimating storage:', err);
      }
    };

    getEstimate();
    
    // Update estimate every minute
    const interval = setInterval(getEstimate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return {
    estimate,
    error,
    formatBytes,
    isSupported: 'storage' in navigator && 'estimate' in navigator.storage
  };
};
