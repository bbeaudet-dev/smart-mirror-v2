import React, { ReactNode } from 'react';

interface StatusIndicatorProps {
  isActive: boolean;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isActive,
  children,
  onClick,
  title,
  className = ''
}) => {
  const baseClasses = 'bg-black/80 backdrop-blur-md border border-mirror-text-dimmed/40 rounded-lg px-3 py-2 transition-opacity duration-300';
  const activeClasses = isActive ? 'opacity-100' : 'opacity-30';
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-90' : '';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${baseClasses} ${activeClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      title={title}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

export default StatusIndicator;

