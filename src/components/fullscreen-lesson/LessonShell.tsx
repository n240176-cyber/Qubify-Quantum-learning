import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { LessonProgress } from './LessonProgress';

interface LessonShellProps {
  currentStep: number;
  totalSteps: number;
  maxUnlockedStep: number;
  onSelectStep: (step: number) => void;
  onExit: () => void;
  children: React.ReactNode;
  isDarkEnvironment?: boolean;
}

export const LessonShell: React.FC<LessonShellProps> = ({
  currentStep,
  totalSteps,
  maxUnlockedStep,
  onSelectStep,
  onExit,
  children,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none overflow-y-auto bg-[#232425] text-[#F1F1F1]"
    >
      {/* Minimal Top Bar */}
      <header className="w-full bg-[#202122] border-b border-[#44474A] px-4 sm:px-8 py-3 flex items-center justify-between z-20 shrink-0 gap-4">
        
        {/* Left: Back to learning path */}
        <button
          id="lesson-exit-btn"
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] border border-transparent hover:border-[#44474A]"
          title="Back to learning path"
          aria-label="Back to learning path"
        >
          <ArrowLeft className="w-4 h-4 text-[#858A8E]" />
          <span className="text-xs font-semibold">Back to curriculum</span>
        </button>

        {/* Center / Right: Interactive Lesson Progress Indicator */}
        <div className="flex items-center justify-end">
          <LessonProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            maxUnlockedStep={maxUnlockedStep}
            onSelectStep={onSelectStep}
          />
        </div>
      </header>

      {/* Main Focus Area: Full viewport responsive 2-column support */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full relative z-10">
        {children}
      </main>

    </div>
  );
};
