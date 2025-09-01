
import React, { useState } from 'react';
import { StarIcon } from './icons/StarIcon';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = (e.clientX - rect.left) / rect.width < 0.5;
    setHoverRating(index + (isHalf ? 0.5 : 1));
  };
  
  const handleClick = () => {
    onRatingChange(hoverRating);
  };

  return (
    <div className="flex" onMouseLeave={() => setHoverRating(0)}>
      {[...Array(5)].map((_, index) => {
        const displayRating = hoverRating > 0 ? hoverRating : rating;
        const starValue = index + 1;
        let fillPercentage = 0;
        if (displayRating >= starValue) {
          fillPercentage = 100;
        } else if (displayRating > index && displayRating < starValue) {
          fillPercentage = (displayRating - index) * 100;
        }
        
        return (
          <div
            key={index}
            className="cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={handleClick}
          >
            <StarIcon
              className="h-8 w-8 text-amber-400"
              fillPercentage={fillPercentage}
            />
          </div>
        );
      })}
    </div>
  );
};
