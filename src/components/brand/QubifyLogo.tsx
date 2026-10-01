import React from 'react';

interface QubifyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const QubifyLogo: React.FC<QubifyLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  const textMap = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]}`}>
        {/* Official uploaded brand logo */}
        <img
          src="/qubify-logo.png"
          alt="Qubify Official Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-lg shadow-xs hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            // Graceful fallback if image is loading
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <span className={`font-bold tracking-tight text-[#F1F1F1] ${textMap[size]}`}>
          Qubi<span className="text-[#1FA7DA]">fy</span>
        </span>
      )}
    </div>
  );
};
