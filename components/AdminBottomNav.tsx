import React from 'react';
import { AdminView } from '../types';
import { InboxIcon } from './icons/InboxIcon';
import { DuplicateIcon } from './icons/DuplicateIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CogIcon } from './icons/CogIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';


interface AdminBottomNavProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  pendingCount: number;
}

const NavItem: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}> = ({ isActive, onClick, icon, label, badge }) => (
    <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center w-1/6 md:w-auto md:px-4 pt-2 pb-1 text-xs transition-colors duration-200 ${isActive ? 'text-emerald-500' : 'text-stone-500 dark:text-white/70 hover:text-emerald-500 dark:hover:text-emerald-300'}`}
    >
        {icon}
        <span className="mt-1">{label}</span>
        {badge !== undefined && badge > 0 && (
             <span className="absolute top-0 right-1/2 translate-x-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {badge > 9 ? '9+' : badge}
            </span>
        )}
    </button>
);


export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ currentView, onNavigate, pendingCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-stone-850 border-t border-stone-200 dark:border-stone-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-around items-center h-full">
          <NavItem
              isActive={currentView === AdminView.Pending}
              onClick={() => onNavigate(AdminView.Pending)}
              icon={<InboxIcon className="w-6 h-6"/>}
              label="Pendentes"
              badge={pendingCount}
          />
          <NavItem
              isActive={currentView === AdminView.Duplicates}
              onClick={() => onNavigate(AdminView.Duplicates)}
              icon={<DuplicateIcon className="w-6 h-6"/>}
              label="Duplicatas"
          />
          <NavItem
              isActive={currentView === AdminView.Submissions}
              onClick={() => onNavigate(AdminView.Submissions)}
              icon={<ListBulletIcon className="w-6 h-6"/>}
              label="Envios"
          />
          <NavItem
              isActive={currentView === AdminView.Users}
              onClick={() => onNavigate(AdminView.Users)}
              icon={<UsersIcon className="w-6 h-6"/>}
              label="Usuários"
          />
           <NavItem
              isActive={currentView === AdminView.MyAccount}
              onClick={() => onNavigate(AdminView.MyAccount)}
              icon={<UserCircleIcon className="w-6 h-6"/>}
              label="Minha Conta"
          />
          <NavItem
              isActive={currentView === AdminView.Settings}
              onClick={() => onNavigate(AdminView.Settings)}
              icon={<CogIcon className="w-6 h-6"/>}
              label="Ajustes"
          />
        </div>
      </div>
    </div>
  );
};