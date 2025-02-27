import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/history', label: 'History', icon: '📈' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Top Navigation for Desktop */}
      <nav className="hidden md:flex items-center justify-between bg-white dark:bg-gray-800 shadow-lg px-6 py-4">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-inter font-bold text-primary">
            Vertical Garden
          </h1>
          <div className="flex space-x-4">
            {NAV_ITEMS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`
                  px-4 py-2 rounded-lg font-inter text-sm transition-colors
                  ${location.pathname === path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <ThemeToggle />
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex justify-around items-center py-3">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`
                flex flex-col items-center px-4 py-2 rounded-lg font-inter text-sm
                ${location.pathname === path
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-300'
                }
              `}
            >
              <span className="text-xl mb-1">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
          <div className="flex flex-col items-center px-4 py-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
};
