import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GardenProvider } from './contexts/GardenContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { SwUpdateNotification } from './components/SwUpdateNotification';

const App: React.FC = () => {
  return (
    <GardenProvider>
      <Layout>
        <SwUpdateNotification />
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
