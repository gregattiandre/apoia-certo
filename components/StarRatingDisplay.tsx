
import React from 'react';
import { StarIcon } from './icons/StarIcon';

interface StarRatingDisplayProps {
  rating: number;
  className?: string;
  starSize?: string;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, className = 'text-amber-400', starSize = 'h-5 w-5' }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        let fillPercentage = 0;
        if (rating >= starValue) {
          fillPercentage = 100;
        } else if (rating > index && rating < starValue) {
          fillPercentage = (rating - index) * 100;
        }
        
        return (
          <StarIcon
            key={index}
            className={`${className} ${starSize}`}
            fillPercentage={fillPercentage}
          />
        );
      })}
    </div>
  );
};
