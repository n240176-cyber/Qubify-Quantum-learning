import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface LessonNavControlsProps {
  currentStep: number;
  totalSteps: number;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  className?: string;
  isDarkEnvironment?: boolean;
  finalStepLabel?: string;
}

export const LessonNavControls: React.FC<LessonNavControlsProps> = ({
  currentStep,
  totalSteps,
  canContinue,
  onBack,
  onContinue,
  className = '',
  finalStepLabel = 'Next: Probability',
}) => {
  const isFirstStep = currentStep <= 1;
  const isFinalStep = currentStep === totalSteps;

  return (
    <div
      className={`flex items-center gap-3 ${
        isFirstStep ? 'justify-end' : 'justify-between sm:justify-end'
      } ${className}`}
    >
      {/* Back Button */}
      {!isFirstStep && (
        <button
          id="lesson-nav-back-btn"
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer bg-[#2B2C2D] hover:bg-[#303234] text-[#F1F1F1] border border-[#44474A]"
          aria-label="Previous step"
        >
          <ArrowLeft className="w-4 h-4 text-current" />
          <span>Back</span>
        </button>
      )}

      {/* Continue or Final Next Button */}
      <button
        id="lesson-nav-continue-btn"
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-[#1FA7DA] hover:bg-[#27B4E8] text-white"
        aria-label={isFinalStep ? 'Complete lesson and advance' : 'Next step'}
      >
        <span>{isFinalStep ? finalStepLabel : 'Continue'}</span>
        <ArrowRight className="w-4 h-4 text-current" />
      </button>
    </div>
  );
};
