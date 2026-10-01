import { simulateLessonCircuit } from '../services/lessonQuantumSimulator';
import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { ShotsSummaryScreen } from '../components/fullscreen-lesson/ShotsSummaryScreen';
import { 
  ArrowRight, 
  RotateCcw, 
  Radio, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Sparkles, 
  Info, 
  RefreshCw, 
  HelpCircle,
  TrendingUp,
  Layers,
  Repeat
} from 'lucide-react';

interface ShotsLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

export const ShotsLessonView: React.FC<ShotsLessonViewProps> = ({
  onExit,
  onComplete,
}) => {
  // Active step: 1 to 7
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: What Happens After Measurement?
  // =========================================================================
  const [step1State, setStep1State] = useState<'superposition' | 'collapsed'>('superposition');
  const [step1MeasuredVal, setStep1MeasuredVal] = useState<0 | 1 | null>(null);
  const [step1ReadCount, setStep1ReadCount] = useState<number>(0);
  const [step1ReadHistory, setStep1ReadHistory] = useState<Array<{ count: number; val: 0 | 1; note: string }>>([]);
  const [step1IsMeasuring, setStep1IsMeasuring] = useState(false);

 const handleStep1MeasureInitial = async () => {
  if (step1IsMeasuring) return;

  setStep1IsMeasuring(true);

  const result = await simulateLessonCircuit({
    numQubits: 1,
    shots: 1,
    operations: [
      {
        gate: 'h',
        qubits: [0],
      },
    ],
  });

  if (!result.success || !result.memory?.length) {
    console.error('Qiskit measurement failed:', result.error);
    setStep1IsMeasuring(false);
    return;
  }

  const outcome: 0 | 1 =
    result.memory[0] === '1' ? 1 : 0;

  setStep1MeasuredVal(outcome);
  setStep1State('collapsed');
  setStep1ReadCount(1);

  setStep1ReadHistory([
    {
      count: 1,
      val: outcome,
      note: `Collapsed from superposition to |${outcome}⟩`,
    },
  ]);

  setStep1IsMeasuring(false);
  setMaxUnlockedStep((prev) => Math.max(prev, 2));
};

  const handleStep1MeasureAgain = () => {
    if (step1State !== 'collapsed' || step1MeasuredVal === null || step1IsMeasuring) return;
    setStep1IsMeasuring(true);

    setTimeout(() => {
      // Deterministic read of the collapsed state
      const nextCount = step1ReadCount + 1;
      setStep1ReadCount(nextCount);
      setStep1ReadHistory((prev) => [
        ...prev,
        { count: nextCount, val: step1MeasuredVal, note: `Read current state |${step1MeasuredVal}⟩ (100% deterministic)` },
      ]);
      setStep1IsMeasuring(false);
    }, 300);
  };

  const handleStep1Reset = () => {
    setStep1State('superposition');
    setStep1MeasuredVal(null);
    setStep1ReadCount(0);
    setStep1ReadHistory([]);
  };

  // =========================================================================
  // STEP 2 STATE: Five Measurements, One Preparation
  // =========================================================================
  const [step2Measurements, setStep2Measurements] = useState<Array<{ id: number; val: number; desc: string; stateAfter: string }>>([
    { id: 1, val: 1, desc: 'Superposition collapses to |1⟩', stateAfter: '|1⟩' },
    { id: 2, val: 1, desc: 'Reads state |1⟩ left by M1', stateAfter: '|1⟩' },
    { id: 3, val: 1, desc: 'Reads state |1⟩ left by M2', stateAfter: '|1⟩' },
    { id: 4, val: 1, desc: 'Reads state |1⟩ left by M3', stateAfter: '|1⟩' },
    { id: 5, val: 1, desc: 'Reads state |1⟩ left by M4', stateAfter: '|1⟩' },
  ]);
  const [step2RevealedCount, setStep2RevealedCount] = useState<number>(5);
  const [step2IsPlaying, setStep2IsPlaying] = useState<boolean>(false);

  const handleStep2RunSequence = () => {
    if (step2IsPlaying) return;
    setStep2IsPlaying(true);
    setStep2RevealedCount(1);

    const timeouts = [
      setTimeout(() => setStep2RevealedCount(2), 500),
      setTimeout(() => setStep2RevealedCount(3), 1000),
      setTimeout(() => setStep2RevealedCount(4), 1500),
      setTimeout(() => {
        setStep2RevealedCount(5);
        setStep2IsPlaying(false);
        setMaxUnlockedStep((prev) => Math.max(prev, 3));
      }, 2000),
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  // =========================================================================
  // STEP 3 STATE: What is One Shot?
  // =========================================================================
  const [step3Stage, setStep3Stage] = useState<'idle' | 'prepare' | 'gate' | 'measure' | 'result' | 'reset'>('result');
  const [step3IsAnimating, setStep3IsAnimating] = useState<boolean>(false);
  const [step3ResultVal, setStep3ResultVal] = useState<0 | 1>(1);

  const handleStep3RunShotAnimation = async () => {
  if (step3IsAnimating) return;

  setStep3IsAnimating(true);
  setStep3Stage('prepare');

  const result = await simulateLessonCircuit({
    numQubits: 1,
    shots: 1,
    operations: [
      {
        gate: 'h',
        qubits: [0],
      },
    ],
  });

  if (!result.success || !result.memory?.length) {
    console.error('Qiskit shot failed:', result.error);
    setStep3IsAnimating(false);
    setStep3Stage('idle');
    return;
  }

  const outcome: 0 | 1 =
    result.memory[0] === '1' ? 1 : 0;

  setTimeout(() => {
    setStep3Stage('gate');

    setTimeout(() => {
      setStep3Stage('measure');

      setTimeout(() => {
        setStep3ResultVal(outcome);
        setStep3Stage('result');

        setTimeout(() => {
          setStep3Stage('reset');
          setStep3IsAnimating(false);
          setMaxUnlockedStep((prev) => Math.max(prev, 4));
        }, 800);
      }, 600);
    }, 600);
  }, 600);
};

  // =========================================================================
  // STEP 4 STATE: Five Shots
  // =========================================================================
  const [step4Shots, setStep4Shots] = useState<Array<{ id: number; result: 0 | 1 }>>([
    { id: 1, result: 1 },
    { id: 2, result: 0 },
    { id: 3, result: 1 },
    { id: 4, result: 0 },
    { id: 5, result: 1 },
  ]);
  const [step4RevealedCount, setStep4RevealedCount] = useState<number>(5);
  const [step4IsRunning, setStep4IsRunning] = useState<boolean>(false);

  const handleStep4RunFiveShots = async () => {
  if (step4IsRunning) return;

  setStep4IsRunning(true);
  setStep4RevealedCount(0);

  const result = await simulateLessonCircuit({
    numQubits: 1,
    shots: 5,
    operations: [
      {
        gate: 'h',
        qubits: [0],
      },
    ],
  });

  if (!result.success || !result.memory?.length) {
    console.error('Qiskit 5-shot run failed:', result.error);
    setStep4IsRunning(false);
    return;
  }

  const newShots: Array<{ id: number; result: 0 | 1 }> =
    result.memory.slice(0, 5).map((value, index) => ({
      id: index + 1,
      result: value === '1' ? 1 : 0,
    }));

  setStep4Shots(newShots);

  let current = 0;

  const interval = setInterval(() => {
    current += 1;
    setStep4RevealedCount(current);

    if (current >= newShots.length) {
      clearInterval(interval);
      setStep4IsRunning(false);
      setMaxUnlockedStep((prev) => Math.max(prev, 5));
    }
  }, 450);
};

  // =========================================================================
  // STEP 5 STATE: Five Measurements vs Five Shots (Comparison)
  // =========================================================================
  // Comparison step is visual/inspection oriented, unlocks next immediately
  useEffect(() => {
    if (currentStep === 5) {
      setMaxUnlockedStep((prev) => Math.max(prev, 6));
    }
  }, [currentStep]);

  // =========================================================================
  // STEP 6 STATE: Why Many Shots? (1 shot vs 100 shots histogram)
  // =========================================================================
  const [step6SingleShotResult, setStep6SingleShotResult] = useState<0 | 1>(1);
  const [step6ZeroCount, setStep6ZeroCount] = useState<number>(48);
  const [step6OneCount, setStep6OneCount] = useState<number>(52);
  const [step6HasRun100, setStep6HasRun100] = useState<boolean>(true);
  const [step6IsSampling, setStep6IsSampling] = useState<boolean>(false);

  const handleStep6Run100Shots = async () => {
  if (step6IsSampling) return;

  setStep6IsSampling(true);

  const result = await simulateLessonCircuit({
    numQubits: 1,
    shots: 100,
    operations: [
      {
        gate: 'h',
        qubits: [0],
      },
    ],
  });

  if (!result.success || !result.counts) {
    console.error('Qiskit 100-shot run failed:', result.error);
    setStep6IsSampling(false);
    return;
  }

  const zeros = result.counts['0'] ?? 0;
  const ones = result.counts['1'] ?? 0;

  setStep6ZeroCount(zeros);
  setStep6OneCount(ones);

  if (result.memory?.length) {
    setStep6SingleShotResult(
      result.memory[0] === '1' ? 1 : 0
    );
  }

  setStep6HasRun100(true);
  setStep6IsSampling(false);

  setMaxUnlockedStep((prev) =>
    Math.max(prev, 7)
  );
};
  // Navigation Handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 7) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxUnlockedStep((prev) => Math.max(prev, next));
    } else {
      onComplete();
    }
  };

  const handleSelectStep = (step: number) => {
    if (step <= maxUnlockedStep) {
      setCurrentStep(step);
    }
  };

  // Validation for continuing
  const canContinueCurrent = (() => {
    switch (currentStep) {
      case 1:
        return step1ReadCount >= 1;
      case 2:
        return step2RevealedCount >= 1;
      case 3:
        return true;
      case 4:
        return step4RevealedCount >= 1;
      case 5:
        return true;
      case 6:
        return step6HasRun100;
      case 7:
        return true;
      default:
        return false;
    }
  })();

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={7}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        
        {/* =====================================================================
            STEP 1: WHAT HAPPENS AFTER MEASUREMENT?
            ===================================================================== */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto">
            
            {/* LEFT SIDE (~55%): State visual & repeated measurement */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    CIRCUIT & QUBIT STATE
                  </span>
                  <span className="text-xs font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-1 rounded-full border border-[#22D3EE]/20">
                    Step 1 of 7
                  </span>
                </div>

                {/* Circuit wire diagram */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs text-[#94A3B8]">
                    <span>Wire q0</span>
                    <span>Timeline →</span>
                  </div>

                  <div className="relative flex items-center justify-between py-4 px-2">
                    {/* Horizontal wire line */}
                    <div className="absolute left-12 right-12 h-0.5 bg-[#4F7CFF]/40 -z-0" />

                    {/* Initial State |0⟩ */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-11 h-11 rounded-xl bg-[#132238] border border-[#22D3EE]/50 flex items-center justify-center text-[#22D3EE] font-mono font-bold text-sm shadow-xs">
                        |0⟩
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono mt-1">Init</span>
                    </div>

                    {/* H Gate */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-11 h-11 rounded-xl bg-[#132238] border border-purple-400/50 flex items-center justify-center text-purple-300 font-mono font-bold text-sm shadow-xs">
                        H
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono mt-1">Superpos</span>
                    </div>

                    {/* Measurement Detector */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                        step1State === 'collapsed'
                          ? 'bg-emerald-950/60 border border-emerald-400/50 text-emerald-300'
                          : 'bg-[#132238] border border-[#67E8F9]/40 text-[#67E8F9]'
                      }`}>
                        <Radio className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono mt-1">
                        {step1State === 'collapsed' ? 'Measured' : 'Ready'}
                      </span>
                    </div>

                    {/* Classical Output Box */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono font-extrabold text-base transition-all duration-300 ${
                        step1MeasuredVal !== null
                          ? step1MeasuredVal === 0
                            ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE] scale-105'
                            : 'bg-purple-950/70 border-purple-400 text-purple-300 scale-105'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                      }`}>
                        {step1MeasuredVal !== null ? step1MeasuredVal : '?'}
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono mt-1">Bit</span>
                    </div>
                  </div>
                </div>

                {/* State Transition Visual Card */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#94A3B8] font-bold">CURRENT PHYSICAL STATE:</span>
                    {step1State === 'superposition' ? (
                      <span className="text-purple-300 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-400/30">
                        Superposition
                      </span>
                    ) : (
                      <span className={`font-bold px-2.5 py-0.5 rounded border ${
                        step1MeasuredVal === 0 
                          ? 'text-[#22D3EE] bg-cyan-950/40 border-[#22D3EE]/40' 
                          : 'text-purple-300 bg-purple-950/40 border-purple-400/40'
                      }`}>
                        Collapsed to |{step1MeasuredVal}⟩
                      </span>
                    )}
                  </div>

                  {/* Superposition probability bars (before collapse) vs Collapsed state */}
                  {step1State === 'superposition' ? (
                    <div className="space-y-2 py-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#22D3EE] font-bold">0 → 50%</span>
                        <span className="text-purple-300 font-bold">1 → 50%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#132238] overflow-hidden flex border border-[#243B55]">
                        <div className="w-1/2 h-full bg-[#22D3EE]" />
                        <div className="w-1/2 h-full bg-purple-500" />
                      </div>
                      <p className="text-[11px] text-[#94A3B8] text-center font-mono">
                        Equal chance of measuring 0 or 1 upon first readout
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55] space-y-2 text-center">
                      <div className="flex items-center justify-center gap-2 font-mono text-sm">
                        <span className="text-[#94A3B8]">Superposition</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                        <span className="text-emerald-300 font-bold">Result = {step1MeasuredVal}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                        <span className={`font-bold ${step1MeasuredVal === 0 ? 'text-[#22D3EE]' : 'text-purple-300'}`}>
                          State = |{step1MeasuredVal}⟩
                        </span>
                      </div>
                      <p className="text-xs text-amber-300 font-mono">
                        The superposition collapsed. The qubit now resides strictly in |{step1MeasuredVal}⟩.
                      </p>
                    </div>
                  )}
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {step1State === 'superposition' ? (
                    <button
                      id="shots-step1-measure-btn"
                      type="button"
                      onClick={handleStep1MeasureInitial}
                      disabled={step1IsMeasuring}
                      className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] hover:from-[#1bc5df] hover:to-[#3d6bf0] text-[#08111F] font-extrabold text-sm font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#22D3EE]/20 active:scale-[0.99] transition-all"
                    >
                      <Radio className="w-4 h-4 text-[#08111F]" />
                      <span>MEASURE</span>
                    </button>
                  ) : (
                    <>
                      <button
                        id="shots-step1-measure-again-btn"
                        type="button"
                        onClick={handleStep1MeasureAgain}
                        disabled={step1IsMeasuring}
                        className="flex-1 w-full py-3 px-5 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all"
                      >
                        <Repeat className="w-4 h-4" />
                        <span>MEASURE AGAIN</span>
                      </button>

                      <button
                        id="shots-step1-reset-btn"
                        type="button"
                        onClick={handleStep1Reset}
                        className="w-full sm:w-auto px-4 py-3 rounded-full bg-[#0D1B2A] hover:bg-[#1a2e48] border border-[#243B55] text-xs font-mono text-[#94A3B8] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Circuit</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Read History Log */}
                {step1ReadHistory.length > 0 && (
                  <div className="pt-2 border-t border-[#243B55]/60 space-y-1.5 font-mono text-[11px]">
                    <span className="text-[#94A3B8] font-bold block">MEASUREMENT LOG:</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {step1ReadHistory.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-[#0D1B2A] border border-[#243B55]/50">
                          <span className="text-[#22D3EE] font-bold">Read #{item.count}: Result {item.val}</span>
                          <span className="text-[#94A3B8] truncate ml-2">{item.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT SIDE (~45%): Explanation & Insight */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/20">
                    Collapse vs. Re-testing
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  What happens after measurement?
                </h1>
              </div>

              {/* Prompt before measurement */}
              {step1State === 'superposition' ? (
                <div className="w-full space-y-4 text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                  <p>
                    You already know that measuring a superposition collapses it into a single classical result (0 or 1).
                  </p>
                  <div className="p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/30">
                    <p className="font-semibold text-white">
                      “But what happens if we measure the qubit again immediately after?”
                    </p>
                  </div>
                  <p className="text-xs text-[#94A3B8] font-mono">
                    Click <strong>MEASURE</strong> on the left to see how the qubit behaves.
                  </p>
                </div>
              ) : (
                /* Revealed explanation after measurement */
                <div className="w-full space-y-4 text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                  <div className="p-4 rounded-2xl bg-[#132238] border border-emerald-500/30 space-y-2">
                    <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Measurement leaves the qubit in the measured state
                    </p>
                    <p className="text-xs sm:text-sm text-white font-mono">
                      Result = {step1MeasuredVal} ──→ State = |{step1MeasuredVal}⟩
                    </p>
                  </div>

                  <p>
                    When we press <strong>MEASURE AGAIN</strong>, we are <strong className="text-white">not measuring the original superposition again</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                    <p className="text-xs sm:text-sm text-[#CBD5E1]">
                      We are only measuring the <strong className="text-white">current state left by the previous measurement</strong>.
                    </p>
                    <p className="text-xs text-amber-300 font-mono">
                      Since it already collapsed into |{step1MeasuredVal}⟩, measuring it again yields {step1MeasuredVal} with 100% certainty.
                    </p>
                  </div>

                  <p className="text-xs text-[#94A3B8]">
                    Try clicking <strong>MEASURE AGAIN</strong> on the left, then continue to explore what happens across repeated readings.
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={7}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 2: FIVE MEASUREMENTS, ONE PREPARATION
            ===================================================================== */}
        {currentStep === 2 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto">
            
            {/* LEFT SIDE (~55%): Chain of 5 measurements on 1 preparation */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    ONE PREPARATION ONLY
                  </span>
                  <span className="text-xs font-mono text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-400/30">
                    Single Superposition
                  </span>
                </div>

                {/* Circuit origin */}
                <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#22D3EE] font-bold">|0⟩</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span className="text-purple-300 font-bold bg-[#132238] px-2 py-0.5 rounded border border-purple-400/40">H Gate</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span className="text-white font-bold">Superposition</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                    Prepared Once
                  </span>
                </div>

                {/* Sequential chain M1 through M5 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs text-[#94A3B8] px-1">
                    <span>MEASUREMENT CHAIN:</span>
                    <span>State after reading</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {step2Measurements.map((m, idx) => {
                      const isRevealed = idx < step2RevealedCount;
                      const isFirst = m.id === 1;

                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                            !isRevealed
                              ? 'opacity-20 bg-[#0D1B2A] border-[#243B55]'
                              : isFirst
                              ? 'bg-purple-950/40 border-purple-400/50 shadow-sm'
                              : 'bg-[#0D1B2A] border-[#243B55]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isFirst ? 'bg-purple-500 text-white' : 'bg-[#132238] text-[#94A3B8] border border-[#243B55]'
                            }`}>
                              M{m.id}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-white font-bold">
                                {isFirst ? 'Superposition → 1' : '|1⟩ → 1'}
                              </span>
                              <span className="text-[10px] text-[#94A3B8]">{m.desc}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-amber-300 font-bold bg-[#132238] px-2 py-0.5 rounded border border-[#243B55]">
                              {m.stateAfter}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Summary Row */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                    <span>RESULT VECTOR:</span>
                    <span className="text-amber-300 font-bold">5 identical results</span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 text-center font-mono">
                    {step2Measurements.map((m, idx) => (
                      <div 
                        key={m.id} 
                        className={`p-2 rounded-xl border flex flex-col items-center ${
                          idx === 0 
                            ? 'bg-purple-950/60 border-purple-400/60 text-purple-300 font-extrabold' 
                            : 'bg-[#132238] border-[#243B55] text-white font-bold'
                        }`}
                      >
                        <span className="text-[10px] text-[#94A3B8]">M{m.id}</span>
                        <span className="text-base mt-0.5">{m.val}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#94A3B8] text-center font-mono pt-1">
                    M1 altered the original state; M2-M5 only re-read the collapsed state.
                  </p>
                </div>

                {/* Re-run button */}
                <button
                  id="shots-step2-replay-btn"
                  type="button"
                  onClick={handleStep2RunSequence}
                  disabled={step2IsPlaying}
                  className="w-full py-2.5 px-4 rounded-full bg-[#0D1B2A] hover:bg-[#1a2e48] border border-[#243B55] text-xs font-mono text-[#CBD5E1] hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Animate 5-Measurement Chain</span>
                </button>

              </div>
            </div>

            {/* RIGHT SIDE (~45%): Explanation leading to Shots */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-400/30">
                    Observation
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Five measurements, one preparation
                </h1>
              </div>

              <div className="w-full space-y-4 text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                <p>
                  Here, we prepared the superposition <strong className="text-white">only once</strong>.
                </p>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                  <p className="text-sm text-[#CBD5E1]">
                    After the first measurement (M1), the qubit state became <strong className="text-purple-300">|1⟩</strong>.
                  </p>
                  <p className="text-sm text-[#CBD5E1]">
                    The next measurements (M2, M3, M4, M5) are simply reading that current state.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                  <p className="text-sm font-bold text-amber-300">
                    They are NOT five separate tests of the original superposition.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30">
                  <p className="text-sm font-semibold text-white">
                    “What if we actually want to test the same superposition five separate times?”
                  </p>
                </div>

                <p className="text-xs text-[#94A3B8]">
                  To test the superposition repeatedly, we must re-prepare the entire experiment from the start. That is called a <strong>Shot</strong>.
                </p>
              </div>

              {/* Navigation Controls with explicit Introduce Shots primary button */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    id="shots-step2-back-btn"
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#CBD5E1] hover:text-white bg-[#132238] border border-[#243B55] cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    id="shots-step2-introduce-btn"
                    type="button"
                    onClick={handleContinue}
                    className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-xs sm:text-sm font-mono flex items-center gap-2 cursor-pointer shadow-md shadow-[#4F7CFF]/20 transition-all"
                  >
                    <span>INTRODUCE SHOTS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 3: WHAT IS ONE SHOT?
            ===================================================================== */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto">
            
            {/* LEFT SIDE (~55%): Full experiment timeline from preparation to measurement */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    THE ANATOMY OF ONE SHOT
                  </span>
                  <span className="text-xs font-mono text-[#4F7CFF] bg-[#4F7CFF]/10 px-2.5 py-1 rounded-full border border-[#4F7CFF]/20">
                    Full Cycle
                  </span>
                </div>

                {/* Complete timeline visual */}
                <div className="space-y-3">
                  
                  {/* Step A: Prepare */}
                  <div className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    step3Stage === 'prepare'
                      ? 'bg-[#4F7CFF]/20 border-[#4F7CFF] shadow-sm'
                      : 'bg-[#0D1B2A] border-[#243B55]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#132238] border border-[#22D3EE]/40 text-[#22D3EE] font-mono font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <div className="flex flex-col font-mono">
                        <span className="text-white font-bold text-xs sm:text-sm">Initialize / Prepare</span>
                        <span className="text-[10px] text-[#94A3B8]">Set qubit to starting ground state |0⟩</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#22D3EE]">|0⟩</span>
                  </div>

                  {/* Step B: Apply Gates */}
                  <div className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    step3Stage === 'gate'
                      ? 'bg-purple-950/50 border-purple-400 shadow-sm'
                      : 'bg-[#0D1B2A] border-[#243B55]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#132238] border border-purple-400/40 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <div className="flex flex-col font-mono">
                        <span className="text-white font-bold text-xs sm:text-sm">Apply Gates</span>
                        <span className="text-[10px] text-[#94A3B8]">Transform into Superposition via H</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-300">H Gate</span>
                  </div>

                  {/* Step C: Measure */}
                  <div className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    step3Stage === 'measure'
                      ? 'bg-[#22D3EE]/20 border-[#22D3EE] shadow-sm'
                      : 'bg-[#0D1B2A] border-[#243B55]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#132238] border border-[#67E8F9]/40 text-[#67E8F9] font-mono font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <div className="flex flex-col font-mono">
                        <span className="text-white font-bold text-xs sm:text-sm">Measure</span>
                        <span className="text-[10px] text-[#94A3B8]">Collapse state and read classical bit</span>
                      </div>
                    </div>
                    <Radio className="w-4 h-4 text-[#67E8F9]" />
                  </div>

                  {/* Step D: Collect Result */}
                  <div className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    step3Stage === 'result' || step3Stage === 'reset'
                      ? 'bg-emerald-950/50 border-emerald-400/60 shadow-sm'
                      : 'bg-[#0D1B2A] border-[#243B55]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">
                        4
                      </span>
                      <div className="flex flex-col font-mono">
                        <span className="text-white font-bold text-xs sm:text-sm">Collect One Result</span>
                        <span className="text-[10px] text-[#94A3B8]">Recorded for this run</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-300 px-2 py-0.5 rounded bg-[#132238] border border-emerald-500/30">
                      Result = {step3ResultVal}
                    </span>
                  </div>

                </div>

                {/* Transition to next run animation block */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>CYCLE COMPLETION:</span>
                    <span className="text-[#22D3EE] font-bold">Ready for next run</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#132238] border border-[#243B55] text-[11px]">
                    <span className="text-[#CBD5E1]">Previous run ends</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span className="text-[#22D3EE] font-bold">Prepare |0⟩ again</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span className="text-white font-bold">Ready for next run</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  id="shots-step3-animate-btn"
                  type="button"
                  onClick={handleStep3RunShotAnimation}
                  disabled={step3IsAnimating}
                  className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${step3IsAnimating ? 'animate-spin' : ''}`} />
                  <span>WATCH 1 SHOT TIMELINE</span>
                </button>

              </div>
            </div>

            {/* RIGHT SIDE (~45%): Term definition & Key concepts */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4F7CFF] bg-[#4F7CFF]/10 px-3 py-1 rounded-full border border-[#4F7CFF]/20">
                    Core Definition
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  What is one shot?
                </h1>
              </div>

              <div className="w-full space-y-4 text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                <p>
                  In quantum computing, we introduce the formal term: <strong className="text-white text-lg">SHOT</strong>.
                </p>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/40 space-y-1">
                  <p className="text-sm font-semibold text-white">
                    “A shot is one complete run of the circuit from its starting preparation to measurement.”
                  </p>
                </div>

                {/* Compact definition card */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] font-mono text-xs sm:text-sm space-y-2">
                  <span className="text-[#22D3EE] font-bold tracking-wider">1 SHOT =</span>
                  <div className="pl-3 space-y-1 text-[#CBD5E1]">
                    <div>• Prepare starting state</div>
                    <div>• Apply gates</div>
                    <div>• Measure</div>
                    <div>• Collect one result</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55]">
                  <p className="text-xs sm:text-sm text-[#CBD5E1]">
                    “Before another shot, we <strong className="text-white">prepare the intended starting state again</strong>.”
                  </p>
                </div>

                <p className="text-xs text-[#94A3B8]">
                  Each shot starts with a fresh preparation — never inheriting the leftover collapsed state of a previous measurement.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={7}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 4: FIVE SHOTS
            ===================================================================== */}
        {currentStep === 4 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto">
            
            {/* LEFT SIDE (~55%): Five separate circuit runs */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    FIVE SEPARATE RUNS
                  </span>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-400/30">
                    5 Complete Shots
                  </span>
                </div>

                {/* Circuit descriptor */}
                <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#94A3B8]">Same circuit repeated:</span>
                  <span className="text-white font-bold">|0⟩ ── H ── M</span>
                </div>

                {/* Five shots rows */}
                <div className="space-y-2 font-mono text-xs">
                  {step4Shots.map((s, idx) => {
                    const isVisible = idx < step4RevealedCount;

                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                          !isVisible
                            ? 'opacity-20 bg-[#0D1B2A] border-[#243B55]'
                            : 'bg-[#0D1B2A] border-[#243B55] shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#132238] border border-[#4F7CFF]/40 text-[#4F7CFF] font-bold text-xs flex items-center justify-center">
                            S{s.id}
                          </span>
                          <span className="text-[#CBD5E1] text-[11px]">
                            Prepare |0⟩ → H → Superposition → M
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                            s.result === 0
                              ? 'bg-[#22D3EE]/20 border border-[#22D3EE] text-[#22D3EE]'
                              : 'bg-purple-950/60 border border-purple-400 text-purple-300'
                          }`}>
                            {s.result}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary outcome row */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>COLLECTED SHOT OUTCOMES:</span>
                    <span className="text-[#22D3EE] font-bold">5 Independent Tests</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center">
                    {step4Shots.map((s, idx) => {
                      const isVisible = idx < step4RevealedCount;
                      return (
                        <div
                          key={s.id}
                          className={`p-2 rounded-xl border flex flex-col items-center transition-all ${
                            !isVisible
                              ? 'opacity-20 bg-[#132238] border-[#243B55]'
                              : s.result === 0
                              ? 'bg-cyan-950/40 border-[#22D3EE]/40 text-[#22D3EE]'
                              : 'bg-purple-950/40 border-purple-400/40 text-purple-300'
                          }`}
                        >
                          <span className="text-[10px] text-[#94A3B8]">S{s.id}</span>
                          <span className="text-base font-extrabold mt-0.5">{isVisible ? s.result : '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive run button */}
                <button
                  id="shots-step4-run-btn"
                  type="button"
                  onClick={handleStep4RunFiveShots}
                  disabled={step4IsRunning}
                  className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] hover:from-[#1bc5df] hover:to-[#3d6bf0] text-[#08111F] font-extrabold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#22D3EE]/20 active:scale-[0.99] transition-all"
                >
                  <Play className={`w-4 h-4 text-[#08111F] ${step4IsRunning ? 'animate-pulse' : ''}`} />
                  <span>RUN 5 SHOTS AGAIN</span>
                </button>

              </div>
            </div>

            {/* RIGHT SIDE (~45%): Explanation */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                    Independent Experiments
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Five shots
                </h1>
              </div>

              <div className="w-full space-y-4 text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                <div className="p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/30 space-y-2">
                  <p className="text-sm font-semibold text-white">
                    “Every shot runs the same circuit again from the same starting preparation.”
                  </p>
                </div>

                <p>
                  Because each run starts from scratch by preparing <strong className="text-[#22D3EE]">|0⟩</strong> and applying <strong className="text-purple-300">H</strong>, it creates a genuine fresh superposition each time.
                </p>

                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                  <p className="text-sm text-emerald-300 font-semibold">
                    “That is why each shot can give a new measurement result.”
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-xs font-mono text-[#94A3B8]">
                  Concept: Re-prepare the starting state again for every shot.
                </div>

                <p className="text-xs text-[#94A3B8]">
                  Notice that in these 5 shots we might observe both 0s and 1s, reflecting the underlying 50/50 probability.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={7}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 5: FIVE MEASUREMENTS VS FIVE SHOTS (The Core Distinction)
            ===================================================================== */}
        {currentStep === 5 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto">
            
            {/* LEFT SIDE (~55%): Split comparison visual */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-xl bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    THE CORE COMPARISON
                  </span>
                  <span className="text-xs font-mono text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-400/30">
                    Side-by-Side
                  </span>
                </div>

                {/* 2-Column Split: Five Measurements vs Five Shots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* LEFT HALF: Five Measurements */}
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-amber-500/30 space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-extrabold text-amber-300 uppercase tracking-wider block">
                        FIVE MEASUREMENTS
                      </span>
                      <span className="text-[11px] font-mono text-[#94A3B8] block">
                        One preparation
                      </span>
                    </div>

                    {/* Flow chain */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-[#132238] border border-[#243B55] font-mono text-[11px]">
                      <div className="text-white font-bold">|0⟩ → H → Superposition</div>
                      <div className="text-amber-300 pl-4">↓ M → 1 → |1⟩</div>
                      <div className="text-[#94A3B8] pl-8">↓ M → 1</div>
                      <div className="text-[#94A3B8] pl-8">↓ M → 1</div>
                      <div className="text-[#94A3B8] pl-8">↓ M → 1</div>
                      <div className="text-[#94A3B8] pl-8">↓ M → 1</div>
                    </div>

                    {/* Outcome preview */}
                    <div className="p-2 rounded-lg bg-[#132238] border border-[#243B55] text-center font-mono">
                      <span className="text-[10px] text-[#94A3B8] block">Results:</span>
                      <span className="text-xs font-bold text-amber-300">[ 1, 1, 1, 1, 1 ]</span>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] leading-tight">
                      “Keep reading the state left by the previous measurement”
                    </p>
                  </div>

                  {/* RIGHT HALF: Five Shots */}
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/40 space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-extrabold text-[#4F7CFF] uppercase tracking-wider block">
                        FIVE SHOTS
                      </span>
                      <span className="text-[11px] font-mono text-indigo-300 block">
                        Re-prepared each run
                      </span>
                    </div>

                    {/* Flow chain */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-[#132238] border border-[#243B55] font-mono text-[11px]">
                      <div className="text-[#CBD5E1]">Prepare → H → M → <span className="text-purple-300 font-bold">1</span></div>
                      <div className="text-[#CBD5E1]">Prepare → H → M → <span className="text-[#22D3EE] font-bold">0</span></div>
                      <div className="text-[#CBD5E1]">Prepare → H → M → <span className="text-purple-300 font-bold">1</span></div>
                      <div className="text-[#CBD5E1]">Prepare → H → M → <span className="text-[#22D3EE] font-bold">0</span></div>
                      <div className="text-[#CBD5E1]">Prepare → H → M → <span className="text-purple-300 font-bold">1</span></div>
                    </div>

                    {/* Outcome preview */}
                    <div className="p-2 rounded-lg bg-[#132238] border border-[#243B55] text-center font-mono">
                      <span className="text-[10px] text-[#94A3B8] block">Results:</span>
                      <span className="text-xs font-bold text-emerald-300">[ 1, 0, 1, 0, 1 ]</span>
                    </div>

                    <p className="text-[11px] text-[#CBD5E1] leading-tight">
                      “Same starting preparation recreated for every run”
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT SIDE (~45%): Compact comparison & visual takeaway */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-950/40 px-3 py-1 rounded-full border border-purple-400/30">
                    Key Distinction
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Five measurements vs five shots
                </h1>
              </div>

              {/* Compact comparison cards */}
              <div className="w-full space-y-2.5 font-mono text-xs sm:text-sm">
                
                <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3">
                  <span className="font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded border border-[#22D3EE]/20 shrink-0">
                    MEASUREMENT
                  </span>
                  <span className="text-[#CBD5E1]">
                    = read current state once
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3">
                  <span className="font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-400/20 shrink-0">
                    MEASURE AGAIN
                  </span>
                  <span className="text-[#CBD5E1]">
                    = read the state left after previous measurement
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#4F7CFF]/40 flex items-start gap-3">
                  <span className="font-bold text-[#4F7CFF] bg-[#4F7CFF]/10 px-2 py-0.5 rounded border border-[#4F7CFF]/20 shrink-0">
                    SHOT
                  </span>
                  <span className="text-white font-semibold">
                    = run the complete circuit again from the intended starting preparation
                  </span>
                </div>

              </div>

              {/* Two visually prominent emphasis lines */}
              <div className="w-full p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/40 space-y-2">
                <p className="text-sm sm:text-base font-bold text-white leading-snug">
                  “Measurements can repeatedly read the current state.”
                </p>
                <p className="text-sm sm:text-base font-extrabold text-[#22D3EE] leading-snug">
                  “Shots repeat the whole experiment.”
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={7}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 6: WHY MANY SHOTS? (Histogram & Sampling)
            ===================================================================== */}
        {currentStep === 6 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto">
            
            {/* LEFT SIDE (~55%): 1 shot vs 100 shots with clean histogram */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    STATISTICAL SAMPLING
                  </span>
                  <span className="text-xs font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-1 rounded-full border border-[#22D3EE]/20 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    100 Shots
                  </span>
                </div>

                {/* Single Shot Card */}
                <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#94A3B8]">1 Shot Outcome:</span>
                    <span className="text-purple-300 font-extrabold text-sm px-2 py-0.5 rounded bg-[#132238] border border-purple-400/30">
                      Result = {step6SingleShotResult}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300 font-mono italic">
                    “Does this one result tell us how the circuit usually behaves?”
                  </p>
                </div>

                {/* 100 Shots Histogram */}
                <div className="p-5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-white font-bold">100 SHOTS HISTOGRAM</span>
                    <span className="text-[#94A3B8]">Total: 100 runs</span>
                  </div>

                  {/* Horizontal Bar: 0 */}
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#22D3EE] font-bold">State |0⟩</span>
                      <span className="text-[#22D3EE] font-bold">{step6ZeroCount} counts ({step6ZeroCount}%)</span>
                    </div>
                    <div className="w-full h-5 rounded-lg bg-[#132238] overflow-hidden border border-[#243B55] p-0.5">
                      <div
                        className="h-full rounded-md bg-[#22D3EE] transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-[#08111F] font-bold"
                        style={{ width: `${step6ZeroCount}%` }}
                      >
                        {step6ZeroCount}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar: 1 */}
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-300 font-bold">State |1⟩</span>
                      <span className="text-purple-300 font-bold">{step6OneCount} counts ({step6OneCount}%)</span>
                    </div>
                    <div className="w-full h-5 rounded-lg bg-[#132238] overflow-hidden border border-[#243B55] p-0.5">
                      <div
                        className="h-full rounded-md bg-purple-500 transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                        style={{ width: `${step6OneCount}%` }}
                      >
                        {step6OneCount}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#94A3B8] font-mono text-center pt-1">
                    H Hadamard gate creates a 50/50 superposition. With 100 shots, the sampled distribution closely approximates ~50% |0⟩ and ~50% |1⟩.
                  </p>
                </div>

                {/* Re-sample button */}
                <button
                  id="shots-step6-sample-btn"
                  type="button"
                  onClick={handleStep6Run100Shots}
                  disabled={step6IsSampling}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all"
                >
                  <BarChart3 className={`w-4 h-4 ${step6IsSampling ? 'animate-pulse' : ''}`} />
                  <span>RUN 100 SHOTS AGAIN</span>
                </button>

              </div>
            </div>

            {/* RIGHT SIDE (~45%): Why shots matter & Probability chain */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/20">
                    Probability Distribution
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Why many shots?
                </h1>
              </div>

              <div className="w-full space-y-4 text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                <p>
                  <strong className="text-white">One shot gives one result.</strong> If we only ran the circuit once and got 1, we wouldn’t know if the circuit always outputs 1 or if it was a 50/50 toss!
                </p>

                <p>
                  <strong className="text-white">Many shots give many results</strong> from the same quantum experiment.
                </p>

                {/* Flow chain */}
                <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] font-mono text-xs space-y-1.5">
                  <span className="text-[#22D3EE] font-bold block mb-1">THE INFERENCE CHAIN:</span>
                  <div className="flex items-center gap-2 text-white">
                    <span>Many shots</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span>Many results</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span>Counts</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#CBD5E1] pt-1">
                    <span>Histogram</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span>Probability distribution</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span className="text-emerald-300 font-bold">Circuit behaviour</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/30">
                  <p className="text-xs sm:text-sm text-white font-medium">
                    “We count those results to estimate the output probability distribution. That distribution helps us understand how the circuit behaves.”
                  </p>
                </div>

                {/* Secondary clarification note */}
                <div className="p-3 rounded-xl bg-[#0D1B2A]/70 border border-[#243B55]/70 text-[11px] text-[#94A3B8] space-y-1">
                  <span className="text-amber-300 font-bold block">Important note:</span>
                  <p>
                    More shots make the statistical estimate more stable. They do not automatically remove hardware noise or physical errors.
                  </p>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={7}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 7: FINAL SUMMARY SCREEN
            ===================================================================== */}
        {currentStep === 7 && (
          <ShotsSummaryScreen
            onNextLesson={onComplete}
            onBackToPath={onExit}
            onBack={handleBack}
            isAlreadyViewed={maxUnlockedStep >= 7}
          />
        )}

      </div>
    </LessonShell>
  );
};
