import React from 'react';

interface LoadingSpinnerProps {
  isVisible?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white';
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  isVisible = true,
  size = 'md',
  color = 'blue',
  label
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    sm: { outer: 'w-4 h-4', inner: 'w-1.5 h-1.5' },
    md: { outer: 'w-8 h-8', inner: 'w-3 h-3' },
    lg: { outer: 'w-12 h-12', inner: 'w-4 h-4' }
  };

  const colorClasses = {
    blue: {
      border: 'border-blue-300',
      borderTop: 'border-t-blue-500',
      bg: 'bg-blue-400',
      text: 'text-blue-400'
    },
    gray: {
      border: 'border-gray-300',
      borderTop: 'border-t-gray-500',
      bg: 'bg-gray-400',
      text: 'text-gray-400'
    },
    white: {
      border: 'border-white/30',
      borderTop: 'border-t-white',
      bg: 'bg-white/40',
      text: 'text-white'
    }
  };

  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizes.outer} border-3 ${colors.border} rounded-full animate-spin`}>
          <div className={`absolute top-0 left-0 ${sizes.outer} border-3 border-transparent ${colors.borderTop} rounded-full animate-spin`}></div>
        </div>
        
        {/* Inner pulse */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`${sizes.inner} ${colors.bg} rounded-full animate-pulse`}></div>
        </div>
      </div>
      
      {label && (
        <span className={`${colors.text} text-lg font-bold`}>{label}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;

