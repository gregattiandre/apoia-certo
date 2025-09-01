import React from 'react';

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM3 13.239V18a3 3 0 0 0 3 3h9.256A4.5 4.5 0 0 0 18 15.239V13.24a3 3 0 0 0-1.256-2.492M3 13.239c0-.411.168-.79.44-1.062a3 3 0 0 1 2.11-2.11M3 13.239V7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v.346c0 .196.023.391.068.581a3 3 0 0 1-1.256 2.492M18 13.239V7.5a3 3 0 0 0-3-3h-9a3 3 0 0 0-3 3v5.739m18 13.239a3 3 0 0 1-1.256 2.492M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
