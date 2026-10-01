import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { ContinueButton } from './ContinueButton';

interface SummaryScreenProps {
  lessonTitle: string;
  nextLessonTitle: string;
  onNextLesson: () => void;
  onBackToPath: () => void;
  onBack?: () => void;
  isAlreadyViewed?: boolean;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  lessonTitle,
  nextLessonTitle,
  onNextLesson,
  onBackToPath,
  onBack,
  isAlreadyViewed = false,
}) => {
  // Reveal statements one at a time for calm, absorbable reading, or immediately if already completed
  const [revealedStep, setRevealedStep] = useState(isAlreadyViewed ? 5 : 1);

  useEffect(() => {
    if (isAlreadyViewed) {
      setRevealedStep(5);
      return;
    }

    const t1 = setTimeout(() => setRevealedStep(2), 600);
    const t2 = setTimeout(() => setRevealedStep(3), 1200);
    const t3 = setTimeout(() => setRevealedStep(4), 1800);
    const t4 = setTimeout(() => setRevealedStep(5), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isAlreadyViewed]);

  return (
    <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4">
      
      {/* =========================================================================
          LEFT SIDE (~55%): SEE - Visual / subtle animated diagram
          ========================================================================= */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-6 sm:py-10">
        <div className="relative w-full max-w-sm flex flex-col items-center">
          
          {/* Subtle glowing ambient backdrop */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(79, 124, 255, 0.12) 0%, transparent 70%)',
            }}
          />

          {/* BIT badge */}
          <div className="px-8 py-4 rounded-2xl bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] shadow-sm flex flex-col items-center transition-all duration-300 hover:border-[#4F7CFF]/50">
            <span className="text-xs font-mono font-bold tracking-widest text-[#94A3B8] uppercase mb-1">
              Classical Information
            </span>
            <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-[#FFFFFF]">
              BIT
            </span>
          </div>

          {/* Connecting arrow / branch lines */}
          <div className="flex flex-col items-center my-3">
            <div className="w-0.5 h-7 bg-gradient-to-b from-[#243B55] to-[#4F7CFF]" />
            <span className="text-xs font-mono font-bold text-[#22D3EE] my-0.5">↓</span>
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">one of two states</span>
          </div>

          {/* 0 and 1 bifurcated visual */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-5 rounded-2xl bg-[#132238]/90 border border-[#243B55] shadow-xs flex flex-col items-center transition-all hover:border-[#22D3EE]/50">
              <span className="font-mono font-black text-3xl sm:text-4xl text-[#22D3EE] mb-1">
                0
              </span>
              <span className="text-xs font-mono font-bold text-[#CBD5E1] uppercase tracking-wider">
                Logical Zero
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#132238]/90 border border-[#243B55] shadow-xs flex flex-col items-center transition-all hover:border-[#4F7CFF]/50">
              <span className="font-mono font-black text-3xl sm:text-4xl text-[#4F7CFF] mb-1">
                1
              </span>
              <span className="text-xs font-mono font-bold text-[#CBD5E1] uppercase tracking-wider">
                Logical One
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (~45%): UNDERSTAND - Lesson Explanation, Takeaways & Actions
          ========================================================================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
        
        {/* Short Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF] tracking-tight">
          What did you learn?
        </h2>

        {/* Sequential Statements */}
        <div className="space-y-4 w-full">
          
          {/* Statement 1 */}
          <div
            className={`transition-all duration-600 ${
              revealedStep >= 1
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
              A bit is the basic unit of classical digital information.
            </p>
          </div>

          {/* Statement 2 */}
          <div
            className={`transition-all duration-600 ${
              revealedStep >= 2
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
              A bit can have one of two logical values: <strong className="font-mono font-bold text-[#FFFFFF]">0</strong> or <strong className="font-mono font-bold text-[#FFFFFF]">1</strong>.
            </p>
          </div>

          {/* Statement 3 */}
          <div
            className={`transition-all duration-600 ${
              revealedStep >= 3
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
              Bits are used by classical computers to represent and process information.
            </p>
          </div>

          {/* Final Takeaway */}
          <div
            className={`transition-all duration-600 pt-2 border-t border-[#243B55] ${
              revealedStep >= 4
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-relaxed">
              “A bit is one piece of classical information represented by either 0 or 1.”
            </p>
          </div>

        </div>

        {/* Completion Badge & Continue Action */}
        <div
          className={`pt-2 flex flex-col items-start gap-4 transition-all duration-600 w-full ${
            revealedStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{lessonTitle} complete</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto pt-1">
            {onBack && (
              <button
                id="summary-back-btn"
                type="button"
                onClick={onBack}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-normal transition-all duration-200 cursor-pointer active:scale-[0.98] bg-[#132238]/80 hover:bg-[#132238] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#243B55] hover:border-[#4F7CFF]/40 shadow-xs"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-4 h-4 text-current transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Back</span>
              </button>
            )}

            <button
              id="next-lesson-summary-btn"
              type="button"
              onClick={onNextLesson}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold tracking-normal transition-all duration-200 cursor-pointer active:scale-[0.98] bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white shadow-md shadow-[#4F7CFF]/20 ring-1 ring-[#22D3EE]/30"
            >
              <span>Next: {nextLessonTitle}</span>
              <ArrowRight className="w-4 h-4 text-current transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          <button
            id="back-to-path-summary-btn"
            type="button"
            onClick={onBackToPath}
            className="text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] py-1 transition-colors cursor-pointer text-left"
          >
            Back to learning path
          </button>
        </div>

      </div>

    </div>
  );
};
