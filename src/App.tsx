import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GardenProvider } from './contexts/GardenContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import './styles/theme.css';

const App: React.FC = () => {
  return (
    <GardenProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Layout>
      </Router>
    </GardenProvider>
  );
};

export default App;
