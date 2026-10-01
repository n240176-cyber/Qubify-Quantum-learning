import React from 'react';
import { Check, Sparkles, HelpCircle } from 'lucide-react';

interface SuccessFeedbackProps {
  message: string;
  subMessage?: string;
  type?: 'success' | 'hint' | 'observation';
  className?: string;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  message,
  subMessage,
  type = 'success',
  className = '',
}) => {
  const isHint = type === 'hint';
  const isObservation = type === 'observation';

  return (
    <div
      className={`transition-all duration-300 ease-out flex flex-col items-center text-center max-w-md mx-auto ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-1">
        {isHint ? (
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-[#EF4444] border border-rose-500/40 flex items-center justify-center shrink-0">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
        ) : isObservation ? (
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#22C55E] border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        )}
        <span className="text-sm sm:text-base font-bold text-[#F8FAFC] tracking-tight">
          {message}
        </span>
      </div>

      {subMessage && (
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-sm mt-0.5">
          {subMessage}
        </p>
      )}
    </div>
  );
};
