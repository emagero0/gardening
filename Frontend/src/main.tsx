// Frontend/src/main.tsx - CORRECTED
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GardenProvider } from './contexts/GardenContext'; // Correct path
import './styles/theme.css'; // Keep your theme import

// Theme logic remains the same
const darkModeEnabled =
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

if (darkModeEnabled) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap App with the GardenProvider here */}
      <GardenProvider>
        <App />
      </GardenProvider>
    </BrowserRouter>
  </React.StrictMode>
);