import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { Switch } from './ui/switch';

interface ThemeToggleProps {
  theme?: 'admin' | 'landlord';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme = 'admin' }) => {
  const { theme: currentTheme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-3">
      <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      <Switch
        checked={currentTheme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
        theme={theme}
      />
      <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
    </div>
  );
};

export default ThemeToggle;
