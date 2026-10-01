import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Repeat, BarChart3, Radio, Layers, RefreshCw } from 'lucide-react';

interface ShotsSummaryScreenProps {
  onNextLesson: () => void;
  onBackToPath: () => void;
  onBack?: () => void;
  isAlreadyViewed?: boolean;
}

export const ShotsSummaryScreen: React.FC<ShotsSummaryScreenProps> = ({
  onNextLesson,
  onBackToPath,
  onBack,
  isAlreadyViewed = false,
}) => {
  // Reveal key takeaways progressively
  const [revealedStep, setRevealedStep] = useState(isAlreadyViewed ? 6 : 1);

  useEffect(() => {
    if (isAlreadyViewed) {
      setRevealedStep(6);
      return;
    }

    const t1 = setTimeout(() => setRevealedStep(2), 400);
    const t2 = setTimeout(() => setRevealedStep(3), 800);
    const t3 = setTimeout(() => setRevealedStep(4), 1200);
    const t4 = setTimeout(() => setRevealedStep(5), 1600);
    const t5 = setTimeout(() => setRevealedStep(6), 2000);

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
          LEFT SIDE (~55%): Clean Visual Architecture of Measurement vs Shot vs Many Shots
          ========================================================================= */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-xl flex flex-col items-center">
          
          {/* Ambient Glow */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(79, 124, 255, 0.14) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
            }}
          />

          {/* Container Card */}
          <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                SUMMARY ARCHITECTURE
              </span>
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Shots Complete
              </span>
            </div>

            {/* 3 Visual Blocks: Measurement, Shot, Many Shots */}
            <div className="space-y-3.5">
              
              {/* 1. MEASUREMENT */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    1. Single Measurement
                  </span>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    Reads current state once
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#132238] border border-[#243B55] text-xs font-mono">
                  <div className="flex flex-col items-center">
                    <span className="text-purple-300 font-bold">Current State</span>
                    <span className="text-[10px] text-[#94A3B8]">e.g. Superposition</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-[#22D3EE] font-bold">Measure Once</span>
                    <span className="text-[10px] text-[#94A3B8]">Collapses state</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-300 font-bold">0 or 1</span>
                    <span className="text-[10px] text-[#94A3B8]">Leaves state in |0⟩ or |1⟩</span>
                  </div>
                </div>
              </div>

              {/* 2. SHOT */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4F7CFF] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    2. One Shot
                  </span>
                  <span className="text-[11px] font-mono text-indigo-300">
                    One complete circuit run
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#132238] border border-[#243B55] text-xs font-mono">
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold">Prepare |0⟩</span>
                    <span className="text-[10px] text-[#94A3B8]">Starting baseline</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-purple-300 font-bold">Apply Gates</span>
                    <span className="text-[10px] text-[#94A3B8]">Transformations</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-[#22D3EE] font-bold">Measure</span>
                    <span className="text-[10px] text-[#94A3B8]">Readout</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-300 font-bold">1 Result</span>
                    <span className="text-[10px] text-[#94A3B8]">Stored in batch</span>
                  </div>
                </div>
              </div>

              {/* 3. MANY SHOTS */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    3. Many Shots (e.g. 100 / 1024)
                  </span>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    Statistical distribution
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#132238] border border-[#243B55] text-xs font-mono">
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold">Repeat Circuit</span>
                    <span className="text-[10px] text-[#94A3B8]">Fresh preparation</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-indigo-300 font-bold">Many Results</span>
                    <span className="text-[10px] text-[#94A3B8]">Collection of bits</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-[#22D3EE] font-bold">Histogram</span>
                    <span className="text-[10px] text-[#94A3B8]">Counts & frequency</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-300 font-bold">Probabilities</span>
                    <span className="text-[10px] text-[#94A3B8]">Circuit behavior</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Crucial Takeaway Contrast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55] space-y-1">
                <span className="text-[11px] text-[#22D3EE] font-bold uppercase">5 Measurements</span>
                <p className="text-[11px] text-[#94A3B8] leading-tight">
                  Prepare once → measure → measure → measure...
                </p>
                <span className="text-[10px] text-amber-300 font-semibold block">
                  Continues reading same collapsed state!
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#132238] border border-[#4F7CFF]/30 space-y-1">
                <span className="text-[11px] text-purple-300 font-bold uppercase">5 Shots</span>
                <p className="text-[11px] text-[#CBD5E1] leading-tight">
                  Prepare → measure, prepare → measure, prepare → measure...
                </p>
                <span className="text-[10px] text-emerald-300 font-semibold block">
                  Repeats the entire quantum experiment!
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (~45%): UNDERSTAND - Synthesis & Takeaways
          ========================================================================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Shots complete
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            What did you learn?
          </h2>
        </div>

        {/* Core Definition Banner */}
        <div className="w-full p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/30 space-y-1">
          <p className="text-sm font-semibold text-white leading-snug">
            “A shot is one complete circuit run from its intended starting preparation to measurement.”
          </p>
        </div>

        {/* Takeaway Cards */}
        <div className="w-full space-y-2.5">
          
          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded border border-[#22D3EE]/20 mt-0.5 shrink-0">
              MEASURE
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Reads current state once.</strong> Measurement gives one result and leaves the qubit in that collapsed state.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-400/20 mt-0.5 shrink-0">
              AGAIN
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Measuring again reads the remaining state.</strong> Unless re-prepared, it does not re-test the original superposition.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-[#4F7CFF] bg-blue-950/60 px-2 py-0.5 rounded border border-[#4F7CFF]/20 mt-0.5 shrink-0">
              1 SHOT
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Repeats the entire experiment.</strong> Prepares the intended starting state, applies gates, and measures once.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-400/20 mt-0.5 shrink-0">
              HISTOGRAM
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Many shots reveal output distributions.</strong> Aggregated counts estimate the underlying probabilities of the quantum circuit.
            </span>
          </div>

        </div>

        {/* Transition Teaser */}
        <div className={`w-full p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-1.5 transition-all duration-300 ${
          revealedStep >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#22D3EE] font-bold">Next Up:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            You now understand how circuits execute on real quantum systems and simulators.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-white">
            “How do we express circuits and run shots using Python code in Qiskit?”
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 w-full flex flex-col sm:flex-row items-center gap-3">
          {onBack && (
            <button
              id="shots-summary-back-btn"
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#CBD5E1] hover:text-white bg-[#132238] hover:bg-[#1a2e48] border border-[#243B55] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            id="shots-summary-next-qiskit-btn"
            type="button"
            onClick={onNextLesson}
            className="flex-1 w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all"
          >
            <span>NEXT: QISKIT</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="shots-summary-path-btn"
            type="button"
            onClick={onBackToPath}
            className="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#132238]/60 cursor-pointer transition-all"
          >
            Back to learning path
          </button>
        </div>

      </div>

    </div>
  );
};
