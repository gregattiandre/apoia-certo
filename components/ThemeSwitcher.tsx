import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { DesktopIcon } from './icons/DesktopIcon';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ThemeButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`p-2 rounded-md transition-colors ${
      isActive ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-200 dark:text-white dark:hover:bg-emerald-700'
    }`}
  >
    {children}
  </button>
);

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onThemeChange }) => {
  return (
    <div className="flex items-center p-1 space-x-1 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
      <ThemeButton label="Light theme" isActive={theme === 'light'} onClick={() => onThemeChange('light')}>
        <SunIcon className="w-5 h-5" />
      </ThemeButton>
      <ThemeButton label="Dark theme" isActive={theme === 'dark'} onClick={() => onThemeChange('dark')}>
        <MoonIcon className="w-5 h-5" />
      </ThemeButton>
      <ThemeButton label="System theme" isActive={theme === 'system'} onClick={() => onThemeChange('system')}>
        <DesktopIcon className="w-5 h-5" />
      </ThemeButton>
    </div>
  );
};