import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Check for saved theme preference or default to system preference
const darkModeEnabled = 
  localStorage.theme === 'dark' || 
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

// Apply dark mode class if needed
if (darkModeEnabled) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
