import React from 'react';
import { Lightbulb, Check } from 'lucide-react';

interface TakeawayCardProps {
  takeaway: string;
  topic?: string;
  className?: string;
}

export const TakeawayCard: React.FC<TakeawayCardProps> = ({
  takeaway,
  topic = 'Key Principle',
  className = '',
}) => {
  return (
    <div 
      id="lesson-takeaway-card"
      className={`rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-blue-50 via-cyan-50/40 to-indigo-50/60 border-2 border-blue-200/80 shadow-xs relative overflow-hidden ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Lightbulb className="w-5 h-5 text-amber-300" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
            <span>One-Line Takeaway</span>
            <span className="text-slate-400">·</span>
            <span className="text-blue-600 font-semibold">{topic}</span>
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            "{takeaway}"
          </p>

          <p className="text-xs text-slate-600 mt-1.5 leading-normal">
            Keep this core principle in mind as you move to the Quantum Lab and challenges.
          </p>
        </div>
      </div>
    </div>
  );
};
