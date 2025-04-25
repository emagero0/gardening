// Frontend/src/App.tsx - CORRECTED
import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Removed GardenProvider import from here
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { KitchenAdvicePopup } from './components/KitchenAdvicePopup'; // Import the popup
import { useWebSocket } from './hooks/useWebSocket';

const App: React.FC = () => {
  // This call is now safe because GardenProvider wraps App in main.tsx
  useWebSocket();

  return (
    // GardenProvider removed from here
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <KitchenAdvicePopup /> {/* Add the popup component here */}
    </Layout>
    // GardenProvider removed from here
  );
};

export default App;
