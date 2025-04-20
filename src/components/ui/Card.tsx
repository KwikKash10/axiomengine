import React from 'react';
import classNames from 'classnames';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Card component with consistent styling
 */
export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div 
      className={classNames(
        'rounded-lg shadow-sm',
        'border border-gray-200',
        'bg-white',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card; 