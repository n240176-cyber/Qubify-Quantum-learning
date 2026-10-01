import React from 'react';

interface LessonProgressProps {
  currentStep: number;
  totalSteps: number;
  maxUnlockedStep: number;
  onSelectStep: (step: number) => void;
  isDarkEnvironment?: boolean;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  currentStep,
  totalSteps,
  maxUnlockedStep,
  onSelectStep,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Visual dot & line indicator: ● — ● — ● — ○ — ○ */}
      <div 
        className="flex items-center" 
        role="tablist" 
        aria-label="Lesson step navigation"
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCurrent = stepNum === currentStep;
          const isUnlocked = stepNum <= maxUnlockedStep;
          const isCompleted = stepNum < currentStep && isUnlocked;

          return (
            <React.Fragment key={stepNum}>
              {/* Connector line between dots */}
              {i > 0 && (
                <div
                  className={`w-3 sm:w-5 h-0.5 transition-colors ${
                    stepNum <= maxUnlockedStep
                      ? 'bg-[#1FA7DA]'
                      : 'bg-[#44474A]'
                  }`}
                />
              )}

              {/* Step Dot Button */}
              <button
                type="button"
                id={`lesson-progress-step-${stepNum}`}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Step ${stepNum}${isCurrent ? ' (Current)' : isCompleted ? ' (Completed)' : isUnlocked ? ' (Unlocked)' : ' (Locked)'}`}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectStep(stepNum)}
                title={
                  isUnlocked
                    ? `Go to Step ${stepNum}`
                    : `Step ${stepNum} (complete previous steps to unlock)`
                }
                className={`relative rounded-md flex items-center justify-center transition-colors ${
                  isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Center Box */}
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                    isCurrent
                      ? 'bg-[#1FA7DA] text-white'
                      : isCompleted
                      ? 'bg-[#1C3325] border border-emerald-500/80 text-emerald-400'
                      : isUnlocked
                      ? 'bg-[#2B2C2D] border border-[#44474A] text-[#B7BABD] hover:border-[#858A8E]'
                      : 'bg-[#28292A] border border-[#44474A]/60 text-[#858A8E]'
                  }`}
                >
                  <span>{stepNum}</span>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Text label: Step 3 of 5 */}
      <span className="text-xs font-mono font-medium hidden sm:inline-block pl-1 text-[#858A8E]">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
};
