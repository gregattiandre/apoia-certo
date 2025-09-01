
import React, { useId } from 'react';

interface StarIconProps {
  className?: string;
  fillPercentage: number; // 0 to 100
}

export const StarIcon: React.FC<StarIconProps> = ({ className, fillPercentage }) => {
  const uniqueId = useId();
  const stopOffset = `${Math.max(0, Math.min(100, fillPercentage))}%`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={uniqueId}>
          <stop offset={stopOffset} stopColor="currentColor" />
          <stop offset={stopOffset} stopColor="gray" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path 
        fill={`url(#${uniqueId})`} 
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" 
      />
    </svg>
  );
};
