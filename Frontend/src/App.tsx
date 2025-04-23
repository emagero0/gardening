import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GardenProvider } from './contexts/GardenContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { useWebSocket } from './hooks/useWebSocket'; // Import the hook
// Removed SwUpdateNotification import

const App: React.FC = () => {
  // Call the hook to establish the WebSocket connection
  // We don't necessarily need the returned values here, but calling the hook runs its effects.
  useWebSocket();

  return (
    <GardenProvider>
      <Layout>
        {/* Removed SwUpdateNotification component */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </GardenProvider>
  );
};

export default App;
