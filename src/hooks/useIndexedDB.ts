import { useState, useEffect } from 'react';

interface DBConfig {
  name: string;
  version: number;
  storeName: string;
}

const defaultConfig: DBConfig = {
  name: 'verticalGardenDB',
  version: 1,
  storeName: 'sensorData'
};

export const useIndexedDB = (config: DBConfig = defaultConfig) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const request = indexedDB.open(config.name, config.version);

    request.onerror = (event) => {
      setError(new Error('Error opening IndexedDB'));
      console.error('IndexedDB error:', event);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      setDb(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(config.storeName)) {
        db.createObjectStore(config.storeName, {
          keyPath: 'timestamp'
        });
      }
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, [config.name, config.version, config.storeName]);

  const addData = async (data: any) => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([config.storeName], 'readwrite');
      const store = transaction.objectStore(config.storeName);
      const request = store.add({ ...data, timestamp: Date.now() });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getData = async () => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([config.storeName], 'readonly');
      const store = transaction.objectStore(config.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const clearData = async () => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = db.transaction([config.storeName], 'readwrite');
      const store = transaction.objectStore(config.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  };

  return {
    db,
    error,
    addData,
    getData,
    clearData
  };
};
