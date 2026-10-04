import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Cpu, Waves, Radio } from 'lucide-react';

interface QubitSummaryScreenProps {
  onNextLesson: () => void;
  onBackToPath: () => void;
  onBack?: () => void;
  isAlreadyViewed?: boolean;
}

export const QubitSummaryScreen: React.FC<QubitSummaryScreenProps> = ({
  onNextLesson,
  onBackToPath,
  onBack,
  isAlreadyViewed = false,
}) => {
  // Reveal steps progressively for calm, absorbable reading
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
    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
      
      {/* =========================================================================
          LEFT SIDE (~55%): SEE / OBSERVE - Progressive Classical vs Quantum Comparison
          ========================================================================= */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-lg flex flex-col items-center">
          
          {/* Ambient Glow */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(79, 124, 255, 0.12) 0%, rgba(34, 211, 238, 0.05) 50%, transparent 70%)',
            }}
          />

          {/* Comparison Container Card */}
          <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-7">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                Architectural Flow
              </span>
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Classical vs Quantum
              </span>
            </div>

            {/* Side-by-side / Dual Column Progression */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* CLASSICAL COLUMN */}
              <div className="bg-[#0D1B2A] border border-[#243B55] rounded-2xl p-5 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
                <div className="w-full pb-2 border-b border-[#243B55] flex items-center justify-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    CLASSICAL
                  </span>
                </div>

                {/* Step 1: BIT */}
                <div className="w-full py-2.5 px-3 rounded-xl bg-[#132238] border border-[#243B55]">
                  <span className="font-mono font-extrabold text-sm text-slate-200">BIT</span>
                  <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Basic unit</div>
                </div>

                <div className="text-slate-500 font-mono text-xs">↓</div>

                {/* Step 2: 0 or 1 */}
                <div className="w-full py-3 px-3 rounded-xl bg-[#132238] border border-[#243B55]">
                  <span className="font-mono font-black text-base text-[#F8FAFC]">0 or 1</span>
                  <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Fixed classical value</div>
                </div>

                <div className="mt-auto pt-4 text-[11px] text-[#94A3B8] leading-relaxed">
                  Only ever in one definite state at any moment.
                </div>
              </div>

              {/* QUANTUM COLUMN */}
              <div className="bg-[#0D1B2A] border border-[#4F7CFF]/40 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 relative overflow-hidden ring-1 ring-[#4F7CFF]/20 shadow-lg shadow-[#4F7CFF]/5">
                <div className="w-full pb-2 border-b border-[#4F7CFF]/30 flex items-center justify-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                    QUANTUM
                  </span>
                </div>

                {/* Step 1: QUBIT */}
                <div className="w-full py-2 px-3 rounded-xl bg-[#132238] border border-[#4F7CFF]/50 shadow-xs">
                  <span className="font-mono font-extrabold text-sm text-[#22D3EE]">QUBIT</span>
                  <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Quantum information</div>
                </div>

                <div className="text-[#4F7CFF] font-mono text-xs">↓</div>

                {/* Step 2: Quantum State */}
                <div className="w-full py-1.5 px-3 rounded-xl bg-[#132238] border border-[#243B55]">
                  <span className="font-mono font-bold text-xs text-[#F8FAFC]">Quantum State |ψ⟩</span>
                </div>

                <div className="text-[#4F7CFF] font-mono text-xs">↓</div>

                {/* Step 3: |0⟩ / |1⟩ / Superposition */}
                <div className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-purple-950/40 border border-[#4F7CFF]/40">
                  <span className="font-mono font-black text-xs text-cyan-300">|0⟩</span>
                  <span className="text-[11px] text-[#94A3B8] mx-1">/</span>
                  <span className="font-mono font-black text-xs text-purple-300">|1⟩</span>
                  <div className="text-[10px] font-mono text-[#CBD5E1] mt-0.5">or Superposition</div>
                </div>

                <div className="text-[#4F7CFF] font-mono text-xs">↓</div>

                {/* Step 4: Measurement */}
                <div className="w-full py-1.5 px-3 rounded-xl bg-[#132238] border border-amber-500/30 flex items-center justify-center gap-1.5">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span className="font-mono font-bold text-xs text-amber-300">Measurement</span>
                </div>

                <div className="text-slate-500 font-mono text-xs">↓</div>

                {/* Step 5: Classical 0 or 1 */}
                <div className="w-full py-2 px-3 rounded-xl bg-[#132238] border border-[#22C55E]/50">
                  <span className="font-mono font-black text-sm text-[#22C55E]">0 or 1</span>
                  <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Classical outcome</div>
                </div>
              </div>

            </div>

            {/* Bottom summary footnote */}
            <div className="pt-2 border-t border-[#243B55] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span>Continuous quantum state</span>
              <span className="text-[#22D3EE] font-semibold">→ Discrete classical readout</span>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (~45%): UNDERSTAND - Key Takeaways & Completion
          ========================================================================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
        
        {/* Completion Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-mono font-bold tracking-wide">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Qubit complete</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
            What did you learn?
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] font-medium">
            Review the essential conceptual breakthroughs of the quantum bit.
          </p>
        </div>

        {/* Takeaway Items (Revealed sequentially) */}
        <div className="space-y-3.5 w-full">
          
          {revealedStep >= 2 && (
            <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                A bit represents classical information using <strong className="text-[#FFFFFF]">0 or 1</strong>.
              </p>
            </div>
          )}

          {revealedStep >= 3 && (
            <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                A qubit represents quantum information using a <strong className="text-[#22D3EE]">quantum state</strong>.
              </p>
            </div>
          )}

          {revealedStep >= 4 && (
            <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                A qubit can be in <strong className="text-[#22D3EE]">|0⟩</strong>, <strong className="text-[#A78BFA]">|1⟩</strong>, or a <strong className="text-[#FFFFFF]">superposition</strong> formed from both.
              </p>
            </div>
          )}

          {revealedStep >= 5 && (
            <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                4
              </span>
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                Measurement gives a classical result: <strong className="text-[#FFFFFF]">0 or 1</strong>.
              </p>
            </div>
          )}

          {/* Final Central Takeaway Banner */}
          {revealedStep >= 6 && (
            <div className="p-4 rounded-2xl bg-[#132238] border-2 border-[#4F7CFF]/50 shadow-md shadow-[#4F7CFF]/10 space-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-400">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Core Takeaway</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-[#FFFFFF] leading-snug">
                “A bit has a classical value. A qubit has a quantum state, and measurement turns that state into a classical result.”
              </p>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="pt-2 w-full flex flex-col sm:flex-row items-center gap-3">
          
          {/* Back button to revisit previous step */}
          {onBack && (
            <button
              id="qubit-summary-back-btn"
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer bg-[#132238] hover:bg-[#1a2f4c] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#243B55] hover:border-[#4F7CFF]/40 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* Primary Action Button: NEXT: BLOCH SPHERE */}
          <button
            id="qubit-next-lesson-btn"
            type="button"
            onClick={onNextLesson}
            className="w-full sm:flex-1 group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white shadow-lg shadow-[#4F7CFF]/25 ring-1 ring-[#22D3EE]/30 active:scale-[0.98]"
          >
            <span>NEXT: BLOCH SPHERE</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary Action: Back to learning path */}
          <button
            id="qubit-back-to-path-btn"
            type="button"
            onClick={onBackToPath}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-full text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#132238] transition-colors cursor-pointer"
          >
            <span>Learning path</span>
          </button>

        </div>

      </div>

    </div>
  );
};
