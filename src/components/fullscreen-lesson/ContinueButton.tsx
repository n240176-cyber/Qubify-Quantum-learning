import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ContinueButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'subtle';
  id?: string;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onClick,
  label = 'Continue',
  disabled = false,
  className = '',
  variant = 'primary',
  id = 'lesson-continue-btn',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-[#2B2C2D] hover:bg-[#303234] text-[#F1F1F1] border border-[#44474A]';
      case 'subtle':
        return 'text-[#858A8E] hover:text-[#F1F1F1] bg-transparent';
      default:
        return 'bg-[#1FA7DA] hover:bg-[#27B4E8] text-white';
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${getStyles()} ${className}`}
    >
      <span>{label}</span>
      {variant !== 'subtle' && (
        <ArrowRight className="w-4 h-4 text-current" />
      )}
    </button>
  );
};
