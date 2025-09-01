import React from 'react';
import { AppView, User } from '../types';
import { ThemeSwitcher, type Theme } from './ThemeSwitcher';
import { Logo } from './Logo';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  pendingCount: number;
  currentUser: User | null;
  onLogout: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const NavButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}> = ({ isActive, onClick, children, badge }) => (
  <button
    onClick={onClick}
    className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-emerald-600 text-white'
        : 'text-emerald-700 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-800'
    }`}
  >
    {children}
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
        {badge}
      </span>
    )}
  </button>
);


export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, pendingCount, currentUser, onLogout, theme, onThemeChange }) => {
  return (
    <header className="bg-white/80 dark:bg-stone-850/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(AppView.Public); }} className="flex items-center space-x-3">
                <Logo className="h-8 w-auto text-emerald-600 dark:text-emerald-400" />
                <span className="text-xl font-bold text-emerald-700 dark:text-white">ApoiaCerto</span>
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
            <div className="h-6 w-px bg-emerald-200 dark:bg-emerald-800 mx-2"></div>
            <NavButton isActive={currentView === AppView.Public} onClick={() => onNavigate(AppView.Public)}>
              Ranking
            </NavButton>
            <NavButton 
              isActive={currentView === AppView.Submit} 
              onClick={() => onNavigate(AppView.Submit)}
            >
              Reportar Atraso
            </NavButton>
            <NavButton isActive={currentView === AppView.Dashboard || currentView === AppView.Login} onClick={() => onNavigate(AppView.Dashboard)} badge={currentUser?.role === 'SiteAdmin' ? pendingCount : undefined}>
              Minha Conta
            </NavButton>
            {currentUser && (
               <button
                onClick={onLogout}
                className="px-3 py-2 text-sm font-medium rounded-md text-emerald-700 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors duration-200"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};