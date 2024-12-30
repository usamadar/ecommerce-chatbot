'use client'

import { useState } from 'react'

interface RatingComponentProps {
  onRate: (rating: number) => void;
  initialRating?: number;
  maxRating?: number;
  readOnly?: boolean;
  className?: string;
}

export function RatingComponent({
  onRate,
  initialRating = 0,
  maxRating = 5,
  readOnly = false,
  className = ''
}: RatingComponentProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleRating = (ratingValue: number) => {
    if (!readOnly) {
      setRating(ratingValue);
      onRate(ratingValue);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <fieldset className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[...Array(maxRating)].map((_, index) => {
          const ratingValue = index + 1;
          const isActive = ratingValue <= (hover || rating);
          
          return (
            <label key={index} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                checked={isActive}
                onChange={() => handleRating(ratingValue)}
                onMouseEnter={() => !readOnly && setHover(ratingValue)}
                onMouseLeave={() => !readOnly && setHover(0)}
                disabled={readOnly}
                className="sr-only"
                aria-label={`Rate ${ratingValue} out of ${maxRating}`}
              />
              <span 
                className={`text-2xl transition-colors ${
                  isActive ? 'text-yellow-400' : 'text-gray-300'
                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                ★
              </span>
            </label>
          );
        })}
      </fieldset>
      <p className="text-sm text-gray-500">
        {rating > 0 ? `You rated ${rating} out of ${maxRating}` : 'Rate your chat experience'}
      </p>
    </div>
  );
}
