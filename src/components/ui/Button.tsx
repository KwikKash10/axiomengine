import React from 'react';
import classNames from 'classnames';

export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  form?: string;
}

/**
 * Button component with consistent styling
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  form,
  ...props
}) => {
  // Color variants
  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent focus:ring-amber-500',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white border-transparent focus:ring-cyan-500'
  };

  // Size variants
  const sizeClasses = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-sm',
    lg: 'py-2.5 px-5 text-base',
    xl: 'py-3 px-6 text-lg'
  };

  return (
    <button
      type={type}
      className={classNames(
        'inline-flex items-center justify-center font-medium border rounded-md',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        colorClasses[color],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      form={form}
      {...props}
    >
      {loading && (
        <svg 
          className={classNames(
            'animate-spin -ml-1 mr-2 h-4 w-4', 
            color === 'secondary' ? 'text-gray-600' : 'text-white'
          )} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button; 