import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface ProbabilitySummaryScreenProps {
  onNextLesson: () => void;
  onBackToPath: () => void;
  onBack?: () => void;
  isAlreadyViewed?: boolean;
}

export const ProbabilitySummaryScreen: React.FC<ProbabilitySummaryScreenProps> = ({
  onNextLesson,
  onBackToPath,
  onBack,
  isAlreadyViewed = false,
}) => {
  // Reveal statements one at a time for calm, absorbable reading, or immediately if already completed
  const [revealedStep, setRevealedStep] = useState(isAlreadyViewed ? 6 : 1);

  useEffect(() => {
    if (isAlreadyViewed) {
      setRevealedStep(6);
      return;
    }

    const t1 = setTimeout(() => setRevealedStep(2), 600);
    const t2 = setTimeout(() => setRevealedStep(3), 1200);
    const t3 = setTimeout(() => setRevealedStep(4), 1800);
    const t4 = setTimeout(() => setRevealedStep(5), 2400);
    const t5 = setTimeout(() => setRevealedStep(6), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isAlreadyViewed]);

  return (
    <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4">
      
      {/* =========================================================================
          LEFT SIDE (~55%): SEE / OBSERVE - Clean Probability Scale
          ========================================================================= */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-6 sm:py-10">
        <div className="relative w-full max-w-lg flex flex-col items-center">
          
          {/* Subtle ambient glow backdrop */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, rgba(79, 124, 255, 0.04) 50%, transparent 70%)',
            }}
          />

          {/* Scale Container Card */}
          <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm">
            
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                The Probability Continuum
              </span>
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                0% to 100%
              </span>
            </div>

            {/* Scale Line Track */}
            <div className="relative my-8 px-2">
              <div className="h-2.5 w-full bg-[#0D1B2A] border border-[#243B55] rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500 via-[#4F7CFF] to-[#22C55E] rounded-full" />
              </div>

              {/* Pin markers */}
              <div className="relative flex justify-between items-start pt-4">
                
                {/* 0% marker */}
                <div className="flex flex-col items-center text-center -ml-2 sm:ml-0">
                  <div className="w-3 h-3 rounded-full bg-slate-400 ring-4 ring-[#132238] mb-2" />
                  <span className="font-mono font-black text-sm text-[#F8FAFC]">0%</span>
                  <span className="text-xs font-semibold text-[#CBD5E1] mt-0.5">Impossible</span>
                  <span className="text-[10px] text-[#94A3B8] mt-1 max-w-[80px] hidden sm:inline">Cannot occur</span>
                </div>

                {/* 50% marker */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#4F7CFF] ring-4 ring-[#4F7CFF]/30 mb-2" />
                  <span className="font-mono font-black text-sm text-[#22D3EE]">50%</span>
                  <span className="text-xs font-semibold text-[#F8FAFC] mt-0.5">Equal chance</span>
                  <span className="text-[10px] text-[#94A3B8] mt-1 max-w-[100px] hidden sm:inline">Fair coin toss</span>
                </div>

                {/* 100% marker */}
                <div className="flex flex-col items-center text-center -mr-2 sm:mr-0">
                  <div className="w-3 h-3 rounded-full bg-[#22C55E] ring-4 ring-[#22C55E]/30 mb-2" />
                  <span className="font-mono font-black text-sm text-[#22C55E]">100%</span>
                  <span className="text-xs font-semibold text-[#F8FAFC] mt-0.5">Certain</span>
                  <span className="text-[10px] text-[#94A3B8] mt-1 max-w-[80px] hidden sm:inline">Always occurs</span>
                </div>

              </div>
            </div>

            {/* Three anchor cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#243B55]">
              
              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center flex flex-col items-center">
                <span className="font-mono font-bold text-xs text-[#94A3B8] mb-1">0%</span>
                <p className="text-xs font-medium text-[#CBD5E1] leading-snug">
                  Impossible outcome
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center flex flex-col items-center hover:border-[#4F7CFF]/40 transition-colors">
                <span className="font-mono font-bold text-xs text-[#22D3EE] mb-1">50%</span>
                <p className="text-xs font-medium text-[#CBD5E1] leading-snug">
                  Equal chance in a simple two-outcome case
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center flex flex-col items-center hover:border-[#22C55E]/40 transition-colors">
                <span className="font-mono font-bold text-xs text-[#22C55E] mb-1">100%</span>
                <p className="text-xs font-medium text-[#CBD5E1] leading-snug">
                  Certain to happen
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (~45%): UNDERSTAND - Key Takeaways, Bridge to Qubit & Actions
          ========================================================================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
        
        {/* Short Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF] tracking-tight">
          What did you learn?
        </h2>

        {/* Sequential Takeaways */}
        <div className="space-y-4 w-full">
          
          {/* Statement 1 */}
          <div
            className={`transition-all duration-500 ${
              revealedStep >= 1
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
              Probability tells us how likely an outcome is to happen.
            </p>
          </div>

          {/* Statement 2 */}
          <div
            className={`transition-all duration-500 ${
              revealedStep >= 2
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
              Probability describes likelihood, not the exact result of the next experiment.
            </p>
          </div>

          {/* Statement 3 */}
          <div
            className={`transition-all duration-500 ${
              revealedStep >= 3
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
              Repeating an experiment many times helps us observe the expected probability pattern through the frequency of outcomes.
            </p>
          </div>

          {/* Statement 4: Bridge between BIT and PROBABILITY */}
          <div
            className={`transition-all duration-500 pt-2 border-t border-[#243B55] ${
              revealedStep >= 4
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0D1B2A] p-4 rounded-2xl border border-[#243B55]">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Bit
                </span>
                <p className="text-xs font-mono text-[#CBD5E1] mt-1">
                  Possible classical values:
                </p>
                <p className="text-sm font-mono font-bold text-[#FFFFFF] mt-0.5">
                  0 or 1
                </p>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-[#243B55] pt-2 sm:pt-0 sm:pl-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                  Probability
                </span>
                <p className="text-xs font-mono text-[#CBD5E1] mt-1">
                  How likely is each outcome?
                </p>
                <p className="text-sm font-mono font-bold text-[#22D3EE] mt-0.5">
                  0% to 100%
                </p>
              </div>
            </div>
          </div>

          {/* Statement 5: Quantum Teaser */}
          <div
            className={`transition-all duration-500 ${
              revealedStep >= 5
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <p className="text-sm sm:text-base font-medium text-[#CBD5E1] leading-relaxed flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22D3EE] shrink-0" />
              <span>Next, we’ll see what happens when information is processed using quantum principles.</span>
            </p>
          </div>

        </div>

        {/* Completion Badge & Continue Action */}
        <div
          className={`pt-2 flex flex-col items-start gap-4 transition-all duration-500 w-full ${
            revealedStep >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Probability complete</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto pt-1">
            {onBack && (
              <button
                id="probability-summary-back-btn"
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
              id="next-lesson-qubit-btn"
              type="button"
              onClick={onNextLesson}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold tracking-normal transition-all duration-200 cursor-pointer active:scale-[0.98] bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white shadow-md shadow-[#4F7CFF]/20 ring-1 ring-[#22D3EE]/30"
            >
              <span>NEXT: QUBIT</span>
              <ArrowRight className="w-4 h-4 text-current transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          <button
            id="probability-back-to-path-btn"
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
