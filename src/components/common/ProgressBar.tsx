import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'primary' | 'cyan' | 'purple' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  color = 'primary',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const barColors = {
    primary: 'bg-[#1FA7DA]',
    cyan: 'bg-[#1FA7DA]',
    purple: 'bg-[#8B5CF6]',
    success: 'bg-[#22C55E]',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-semibold text-[#858A8E] mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && (
            <span className="font-mono text-[#F1F1F1] font-medium">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-[#202122] border border-[#44474A] rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${barColors[color]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
