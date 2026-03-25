import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, RotateCcw, Wifi, WifiOff, FileText, Sun, Moon } from 'lucide-react';
import { isUsingMockApi, apiDocsUrl } from '../api/client';
import { resetMockData, checkHealth } from '../api/schedules';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isUsingMockApi) return;
    checkHealth().then(setHealthy);
    const interval = setInterval(() => checkHealth().then(setHealthy), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 no-underline">
            <Calendar className="w-6 h-6" />
            <span className="font-semibold text-lg">EVV Logger</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* API Health Indicator */}
            {!isUsingMockApi && healthy !== null && (
              <span
                className={`flex items-center gap-1 text-xs ${healthy ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}
                title={healthy ? 'API connected' : 'API unreachable'}
              >
                {healthy ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{healthy ? 'Connected' : 'Offline'}</span>
              </span>
            )}

            {/* API Docs Link */}
            {!isUsingMockApi && apiDocsUrl && (
              <a
                href={apiDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 no-underline"
                title="API Documentation"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">API Docs</span>
              </a>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border-0 bg-transparent"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Mock Reset */}
            {isUsingMockApi && (
              <button
                onClick={() => { resetMockData(); window.location.reload(); }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 cursor-pointer"
                title="Reset mock data"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                CG
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Caregiver</span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      {!isHome && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <Link
            to="/"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 no-underline"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Schedules
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main
        key={location.pathname}
        className="max-w-4xl mx-auto px-4 py-4 pb-8 animate-fade-in"
      >
        {children}
      </main>
    </div>
  );
}
