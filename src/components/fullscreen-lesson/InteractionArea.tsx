import React from 'react';

interface InteractionAreaProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const InteractionArea: React.FC<InteractionAreaProps> = ({
  children,
  className = '',
  maxWidth = 'md',
}) => {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-xl';
      case 'xl':
        return 'max-w-2xl';
      default:
        return 'max-w-md';
    }
  };

  return (
    <div className={`w-full ${getMaxWidth()} mx-auto my-6 sm:my-8 flex flex-col items-center justify-center ${className}`}>
      {children}
    </div>
  );
};
