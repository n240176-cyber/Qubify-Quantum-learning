import React, { useState } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { QuantumGatesSummaryScreen } from '../components/fullscreen-lesson/QuantumGatesSummaryScreen';
import { 
  ArrowRight, 
  RefreshCw, 
  Radio, 
  SlidersHorizontal, 
  ArrowDown, 
  Play, 
  Repeat
} from 'lucide-react';

interface QuantumGatesLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

export const QuantumGatesLessonView: React.FC<QuantumGatesLessonViewProps> = ({
  onExit,
  onComplete,
}) => {
  // Current active step (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);

  // Furthest unlocked step (starts at 1; completed/unlocked steps can be revisited freely)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: Experience What Measurement Does
  // =========================================================================
  const [step1State, setStep1State] = useState<'superposition' | 'measured-0' | 'measured-1'>('superposition');
  const [step1IsMeasuring, setStep1IsMeasuring] = useState(false);
  const [step1Result, setStep1Result] = useState<'0' | '1' | null>(null);
  const [step1RepeatCount, setStep1RepeatCount] = useState(0);
  const [step1HasPreparedAgain, setStep1HasPreparedAgain] = useState(false);

  // Handle first or repeated measurement in Step 1
  const handleStep1Measure = (isRepeat: boolean = false) => {
    if (step1IsMeasuring) return;
    setStep1IsMeasuring(true);

    setTimeout(() => {
      if (!isRepeat || step1State === 'superposition') {
        // First measurement from superposition: 50% random outcome
        const outcome: '0' | '1' = Math.random() > 0.5 ? '1' : '0';
        setStep1Result(outcome);
        setStep1State(outcome === '1' ? 'measured-1' : 'measured-0');
        setStep1RepeatCount(0);
      } else {
        // Repeated measurement on already collapsed state: gives identical outcome
        const outcome: '0' | '1' = step1State === 'measured-1' ? '1' : '0';
        setStep1Result(outcome);
        setStep1RepeatCount((prev) => prev + 1);
      }
      setStep1IsMeasuring(false);
    }, 450);
  };

  // Reset back to original superposition
  const handleStep1PrepareOriginal = () => {
    setStep1State('superposition');
    setStep1Result(null);
    setStep1RepeatCount(0);
    setStep1HasPreparedAgain(true);
    setMaxUnlockedStep((prev) => Math.max(prev, 2));
  };

  // =========================================================================
  // STEP 2 STATE: Repeat the Same Experiment
  // =========================================================================
  const [step2ExpNum, setStep2ExpNum] = useState<number>(1); // 1, 2, 3
  const [step2CurrentPhase, setStep2CurrentPhase] = useState<'ready' | 'measuring' | 'collapsed'>('ready');
  const [step2CurrentResult, setStep2CurrentResult] = useState<'0' | '1' | null>(null);
  const [step2History, setStep2History] = useState<Array<{ exp: number; result: '0' | '1' }>>([]);

  const handleStep2RunExperiment = () => {
    if (step2CurrentPhase === 'measuring') return;
    setStep2CurrentPhase('measuring');

    // Predetermined sequence matching curriculum spec (1, 0, 1) or random
    const presetResults: Record<number, '0' | '1'> = { 1: '1', 2: '0', 3: '1' };
    const outcome = presetResults[step2ExpNum] || (Math.random() > 0.5 ? '1' : '0');

    setTimeout(() => {
      setStep2CurrentResult(outcome);
      setStep2CurrentPhase('collapsed');
      const updatedHistory = [...step2History, { exp: step2ExpNum, result: outcome }];
      setStep2History(updatedHistory);

      if (step2ExpNum >= 3) {
        setMaxUnlockedStep((prev) => Math.max(prev, 3));
      }
    }, 450);
  };

  const handleStep2ResetForNext = () => {
    setStep2ExpNum((prev) => Math.min(4, prev + 1));
    setStep2CurrentPhase('ready');
    setStep2CurrentResult(null);
  };

  // =========================================================================
  // STEP 3 STATE: What is a Quantum Gate?
  // =========================================================================
  const [step3GateActive, setStep3GateActive] = useState(false);
  const [step3Transformed, setStep3Transformed] = useState(false);

  const handleStep3TriggerGate = () => {
    setStep3GateActive(true);
    setTimeout(() => {
      setStep3Transformed((prev) => !prev);
      setStep3GateActive(false);
      setMaxUnlockedStep((prev) => Math.max(prev, 4));
    }, 400);
  };

  // =========================================================================
  // STEP 4 STATE: X Gate (Basis States + 4B Superposition Swap)
  // =========================================================================
  const [step4SubTab, setStep4SubTab] = useState<'basis' | 'superposition'>('basis');
  
  // 4A: Basis state |0⟩ <-> |1⟩
  const [step4BasisState, setStep4BasisState] = useState<'0' | '1'>('0');
  const [step4IsAnimatingX, setStep4IsAnimatingX] = useState(false);
  const [step4BasisFlipCount, setStep4BasisFlipCount] = useState(0);

  const handleStep4ApplyX = () => {
    if (step4IsAnimatingX) return;
    setStep4IsAnimatingX(true);
    setTimeout(() => {
      setStep4BasisState((prev) => (prev === '0' ? '1' : '0'));
      setStep4BasisFlipCount((c) => c + 1);
      setStep4IsAnimatingX(false);
      setMaxUnlockedStep((prev) => Math.max(prev, 5));
    }, 350);
  };

  // 4B: Superposition probability swap (80/20 <-> 20/80)
  const [step4SuperpositionFlipped, setStep4SuperpositionFlipped] = useState(false);
  const [step4IsSwappingSuper, setStep4IsSwappingSuper] = useState(false);

  const handleStep4ApplyXToSuperposition = () => {
    if (step4IsSwappingSuper) return;
    setStep4IsSwappingSuper(true);
    setTimeout(() => {
      setStep4SuperpositionFlipped((prev) => !prev);
      setStep4IsSwappingSuper(false);
      setMaxUnlockedStep((prev) => Math.max(prev, 5));
    }, 350);
  };

  // =========================================================================
  // STEP 5 STATE: H Gate (Hadamard & Run Loop)
  // =========================================================================
  const [step5State, setStep5State] = useState<'0' | 'superposition'>('0');
  const [step5IsApplyingH, setStep5IsApplyingH] = useState(false);

  const handleStep5ApplyH = () => {
    if (step5IsApplyingH) return;
    setStep5IsApplyingH(true);
    setTimeout(() => {
      setStep5State('superposition');
      setStep5IsApplyingH(false);
      setMaxUnlockedStep((prev) => Math.max(prev, 6));
    }, 400);
  };

  // Circuit Run Loop (|0⟩ -> H -> Superposition -> Measure)
  const [step5RunHistory, setStep5RunHistory] = useState<Array<{ run: number; result: '0' | '1' }>>([]);
  const [step5IsRunningCircuit, setStep5IsRunningCircuit] = useState(false);
  const [step5CurrentCircuitStage, setStep5CurrentCircuitStage] = useState<'idle' | 'init' | 'h' | 'super' | 'measuring' | 'done'>('idle');

  const handleStep5RunPipeline = () => {
    if (step5IsRunningCircuit) return;
    const runNum = step5RunHistory.length + 1;
    setStep5IsRunningCircuit(true);

    // Stage 1: Initialize |0⟩
    setStep5CurrentCircuitStage('init');

    setTimeout(() => {
      // Stage 2: Apply H
      setStep5CurrentCircuitStage('h');

      setTimeout(() => {
        // Stage 3: In Superposition
        setStep5CurrentCircuitStage('super');

        setTimeout(() => {
          // Stage 4: Measuring
          setStep5CurrentCircuitStage('measuring');

          setTimeout(() => {
            // Predetermined sequence matching spec (Run 1: 1, Run 2: 0, Run 3: 1) or random
            const preset: Record<number, '0' | '1'> = { 1: '1', 2: '0', 3: '1' };
            const result = preset[runNum] || (Math.random() > 0.5 ? '1' : '0');

            setStep5RunHistory((prev) => [...prev, { run: runNum, result }]);
            setStep5CurrentCircuitStage('done');
            setStep5IsRunningCircuit(false);
            setMaxUnlockedStep((prev) => Math.max(prev, 6));
          }, 450);
        }, 350);
      }, 350);
    }, 300);
  };

  // =========================================================================
  // NAVIGATION HANDLERS (FORWARD / BACKWARD)
  // =========================================================================
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

  // Check if current step allows continuing
  const isStep1Complete = step1HasPreparedAgain || step1Result !== null || maxUnlockedStep > 1;
  const isStep2Complete = step2ExpNum >= 3 || step2History.length >= 3 || maxUnlockedStep > 2;
  const isStep3Complete = step3Transformed || maxUnlockedStep > 3;
  const isStep4Complete = step4BasisFlipCount > 0 || step4SuperpositionFlipped || maxUnlockedStep > 4;
  const isStep5Complete = step5RunHistory.length > 0 || step5State === 'superposition' || maxUnlockedStep > 5;
  const isStep6Complete = true; // Side-by-side conceptual review can always proceed
  const isStep7Complete = true;

  let canContinueCurrent = false;
  if (currentStep === 1) canContinueCurrent = isStep1Complete;
  else if (currentStep === 2) canContinueCurrent = isStep2Complete;
  else if (currentStep === 3) canContinueCurrent = isStep3Complete;
  else if (currentStep === 4) canContinueCurrent = isStep4Complete;
  else if (currentStep === 5) canContinueCurrent = isStep5Complete;
  else if (currentStep === 6) canContinueCurrent = isStep6Complete;
  else if (currentStep === 7) canContinueCurrent = isStep7Complete;

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={7}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      <div className="w-full flex-1 flex flex-col justify-between">
        
        {/* =====================================================================
            STEP 1: EXPERIENCE WHAT MEASUREMENT DOES
            ===================================================================== */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Interactive Measurement Experience */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                {/* Visual Ambient Glow */}
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: step1State === 'superposition' 
                      ? 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)'
                      : step1State === 'measured-0'
                      ? 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
                  }}
                />

                {/* State Card Container */}
                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-7">
                  
                  {/* Status Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      Qubit State
                    </span>
                    <span 
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition-colors ${
                        step1State === 'superposition'
                          ? 'text-[#22D3EE] bg-[#22D3EE]/10 border-[#22D3EE]/30'
                          : step1State === 'measured-0'
                          ? 'text-[#22D3EE] bg-[#22D3EE]/15 border-[#22D3EE]/40'
                          : 'text-purple-300 bg-purple-950/40 border-purple-400/40'
                      }`}
                    >
                      {step1State === 'superposition' ? 'SUPERPOSITION' : `MEASURED: |${step1Result}⟩`}
                    </span>
                  </div>

                  {/* Visual State Indicator Track */}
                  <div className="relative w-full py-10 px-4 bg-[#0D1B2A] border border-[#243B55] rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                    
                    {/* Measurement Animation Radar Sweep */}
                    {step1IsMeasuring && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22D3EE]/25 to-transparent animate-pulse pointer-events-none" />
                    )}

                    {/* Basis Anchor Points */}
                    <div className="w-full max-w-sm flex items-center justify-between text-xs font-mono font-black mb-3 px-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[#22D3EE] text-base">|0⟩</span>
                        <span className="text-[11px] text-[#94A3B8] font-normal">Pure 0</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
                        State Continuum
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-purple-300 text-base">|1⟩</span>
                        <span className="text-[11px] text-[#94A3B8] font-normal">Pure 1</span>
                      </div>
                    </div>

                    {/* Continuum Track */}
                    <div className="w-full max-w-sm h-3 bg-[#132238] rounded-full relative border border-[#243B55] flex items-center my-2">
                      
                      {/* Gradient Bar */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#22D3EE]/40 via-indigo-500/30 to-purple-500/40" />

                      {/* Moving Orb Indicator */}
                      <div 
                        className={`absolute w-8 h-8 rounded-full border-2 shadow-lg transition-all duration-500 transform -translate-x-1/2 flex items-center justify-center ${
                          step1State === 'superposition'
                            ? 'left-1/2 bg-gradient-to-r from-[#22D3EE] to-purple-500 border-white text-white shadow-[#4F7CFF]/50'
                            : step1State === 'measured-0'
                            ? 'left-4 bg-[#22D3EE] border-white text-[#0D1B2A] shadow-[#22D3EE]/50'
                            : 'left-[calc(100%-16px)] bg-purple-500 border-white text-white shadow-purple-500/50'
                        }`}
                      >
                        <span className="text-xs font-mono font-black">
                          {step1State === 'superposition' ? 'ψ' : step1Result}
                        </span>
                      </div>
                    </div>

                    {/* Current State Text Feedback */}
                    <div className="mt-4 text-center">
                      {step1State === 'superposition' ? (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[#F8FAFC]">
                            Superposition
                          </p>
                          <p className="text-xs font-mono text-[#94A3B8]">
                            0 → 50% &nbsp;|&nbsp; 1 → 50%
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 animate-in fade-in duration-300">
                          <p className="text-sm font-bold text-white">
                            Measured State
                          </p>
                          <p className="text-xs font-mono text-[#22D3EE]">
                            Result = <strong className="text-white text-sm">{step1Result}</strong> &nbsp;→&nbsp; State = <strong className="text-white text-sm">|{step1Result}⟩</strong>
                          </p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Interactive Action Controls */}
                  <div className="space-y-3">
                    
                    {step1State === 'superposition' ? (
                      /* Initial MEASURE button */
                      <button
                        id="gates-step1-measure-btn"
                        type="button"
                        onClick={() => handleStep1Measure(false)}
                        disabled={step1IsMeasuring}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-base tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-[#4F7CFF]/20 active:scale-[0.99] disabled:opacity-50"
                      >
                        <Radio className={`w-5 h-5 ${step1IsMeasuring ? 'animate-spin' : ''}`} />
                        <span>{step1IsMeasuring ? 'MEASURING QUBIT...' : 'MEASURE'}</span>
                      </button>
                    ) : (
                      /* Post-measurement controls: MEASURE AGAIN & PREPARE ORIGINAL STATE */
                      <div className="space-y-3">
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* MEASURE AGAIN */}
                          <button
                            id="gates-step1-measure-again-btn"
                            type="button"
                            onClick={() => handleStep1Measure(true)}
                            disabled={step1IsMeasuring}
                            className="flex-1 py-3 px-4 rounded-xl bg-[#0D1B2A] hover:bg-[#152a42] border border-[#243B55] hover:border-[#4F7CFF]/50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <Repeat className="w-4 h-4 text-[#22D3EE]" />
                            <span>MEASURE AGAIN</span>
                          </button>

                          {/* PREPARE ORIGINAL STATE */}
                          <button
                            id="gates-step1-prepare-original-btn"
                            type="button"
                            onClick={handleStep1PrepareOriginal}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-900/30"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>PREPARE ORIGINAL STATE</span>
                          </button>
                        </div>

                        {step1RepeatCount > 0 && (
                          <div className="p-2.5 rounded-xl bg-[#0D1B2A]/80 border border-[#243B55] text-center text-xs font-mono text-slate-300 animate-in fade-in">
                            Measured again → Output is still <strong className="text-white">{step1Result}</strong> (repeated {step1RepeatCount}x)
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Explanatory Feedback & Guiding Questions */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Core Quantum Principle
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  What happens to the qubit after measurement?
                </h2>
              </div>

              {step1State === 'superposition' ? (
                /* Before measurement */
                <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                  <p>
                    You already know that measurement gives a classical result.
                  </p>
                  <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                    <p className="font-semibold text-white">
                      But what happens to the qubit after measurement?
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Press <span className="text-[#22D3EE] font-mono font-bold">MEASURE</span> on the left to find out.
                    </p>
                  </div>
                </div>
              ) : (
                /* After measurement */
                <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed animate-in fade-in duration-300">
                  <p>
                    Measurement gives one result — <strong className="text-white font-mono">0</strong> or <strong className="text-white font-mono">1</strong> — and leaves the qubit in the corresponding measured state.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-around font-mono text-sm sm:text-base">
                    <div className="text-center">
                      <div className="text-xs text-[#94A3B8]">Outcome</div>
                      <div className="font-extrabold text-[#22D3EE] text-lg">Result = {step1Result}</div>
                    </div>
                    <div className="text-slate-500 font-bold">↓</div>
                    <div className="text-center">
                      <div className="text-xs text-[#94A3B8]">New State</div>
                      <div className="font-extrabold text-white text-lg">State = |{step1Result}⟩</div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#94A3B8]">
                    So the qubit is <strong className="text-white">no longer in the original superposition</strong>.
                  </p>

                  {step1RepeatCount > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#132238] border border-[#4F7CFF]/30 text-xs sm:text-sm text-slate-200 space-y-1.5 animate-in fade-in">
                      <p>
                        After the first measurement, the state became <strong className="text-white font-mono">|{step1Result}⟩</strong>.
                      </p>
                      <p className="text-[#94A3B8]">
                        So measuring the same state again gives <strong className="text-white font-mono">{step1Result}</strong> again in this ideal example.
                      </p>
                    </div>
                  )}

                  {step1HasPreparedAgain ? (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs sm:text-sm text-emerald-200 space-y-1">
                      <p className="font-semibold text-white">
                        Key Takeaway:
                      </p>
                      <p>
                        Measurement ≠ repeating the original experiment, because after measurement the state has changed.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-[#22D3EE]">
                      What if we want to measure the original superposition again? Press "PREPARE ORIGINAL STATE".
                    </p>
                  )}

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
            STEP 2: REPEAT THE SAME EXPERIMENT
            ===================================================================== */}
        {currentStep === 2 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Running Three Repeated Experiments */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.12) 0%, rgba(34, 211, 238, 0.06) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      ORIGINAL STATE
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      {step2ExpNum <= 3 ? `Experiment ${step2ExpNum} of 3` : 'All 3 Completed'}
                    </span>
                  </div>

                  {/* Active Experiment Workbench */}
                  <div className="p-5 bg-[#0D1B2A] border border-[#243B55] rounded-2xl space-y-4">
                    
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8]">Starting State</span>
                      <span className="text-indigo-300 font-bold bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-500/30">
                        Superposition (0 → 50% | 1 → 50%)
                      </span>
                    </div>

                    {/* Step visualization */}
                    <div className="p-4 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xs text-[#94A3B8] font-mono">
                          {step2CurrentPhase === 'ready' && 'Ready to measure'}
                          {step2CurrentPhase === 'measuring' && 'Measuring wavefunction...'}
                          {step2CurrentPhase === 'collapsed' && `Outcome recorded`}
                        </div>
                        <div className="font-mono font-bold text-sm text-white">
                          {step2CurrentPhase === 'collapsed'
                            ? `Result = ${step2CurrentResult} → State = |${step2CurrentResult}⟩`
                            : 'Superposition (50% / 50%)'}
                        </div>
                      </div>

                      {step2CurrentPhase === 'collapsed' ? (
                        <div className="w-10 h-10 rounded-xl bg-[#0D1B2A] border border-[#22D3EE] flex items-center justify-center font-mono font-black text-lg text-[#22D3EE]">
                          {step2CurrentResult}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center font-mono font-black text-sm text-indigo-300">
                          ψ
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div>
                      {step2CurrentPhase === 'ready' && (
                        <button
                          id="gates-step2-measure-btn"
                          type="button"
                          onClick={handleStep2RunExperiment}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          <Radio className="w-4 h-4" />
                          <span>MEASURE EXPERIMENT {step2ExpNum}</span>
                        </button>
                      )}

                      {step2CurrentPhase === 'measuring' && (
                        <div className="w-full py-3 px-4 rounded-xl bg-[#132238] text-slate-300 font-mono text-sm text-center animate-pulse">
                          Reading detector...
                        </div>
                      )}

                      {step2CurrentPhase === 'collapsed' && step2ExpNum < 3 && (
                        <button
                          id="gates-step2-prepare-next-btn"
                          type="button"
                          onClick={handleStep2ResetForNext}
                          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>PREPARE ORIGINAL STATE AGAIN</span>
                        </button>
                      )}

                      {step2CurrentPhase === 'collapsed' && step2ExpNum >= 3 && (
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center text-xs font-mono text-emerald-300">
                          ✓ All 3 experiments executed: State reset before each measurement
                        </div>
                      )}
                    </div>

                  </div>

                  {/* History Log */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Experiment Log
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((exp) => {
                        const record = step2History.find((h) => h.exp === exp);
                        return (
                          <div 
                            key={exp}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              record
                                ? 'bg-[#0D1B2A] border-[#4F7CFF]/50 text-white'
                                : 'bg-[#0D1B2A]/40 border-[#243B55] text-slate-500'
                            }`}
                          >
                            <div className="text-[11px] font-mono text-[#94A3B8]">Experiment {exp}</div>
                            <div className="text-lg font-mono font-black mt-0.5">
                              {record ? (
                                <span className={record.result === '0' ? 'text-[#22D3EE]' : 'text-purple-300'}>
                                  → {record.result}
                                </span>
                              ) : (
                                '—'
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Explanatory Insights */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Sequential Protocol
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Repeating the same experiment
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  Each measurement gives <strong className="text-white">one result</strong>.
                </p>
                <p>
                  To repeat the same experiment, we prepare the <strong className="text-[#22D3EE]">same starting state</strong> before each measurement.
                </p>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-3">
                  <p className="font-semibold text-white">
                    “But how do we intentionally prepare or change a qubit into the state we want?”
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    This is the central purpose of quantum gates.
                  </p>
                </div>

                {step2History.length >= 3 && (
                  <button
                    id="gates-step2-meet-gates-btn"
                    type="button"
                    onClick={() => {
                      setMaxUnlockedStep((prev) => Math.max(prev, 3));
                      setCurrentStep(3);
                    }}
                    className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4F7CFF]/20"
                  >
                    <span>MEET QUANTUM GATES</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

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
            STEP 3: WHAT IS A QUANTUM GATE?
            ===================================================================== */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Simple Flow: Current State -> Gate -> New State */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(34, 211, 238, 0.05) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      Flow of State
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      Standard Gate Model
                    </span>
                  </div>

                  {/* Visual Flow Column */}
                  <div className="py-6 px-4 bg-[#0D1B2A] border border-[#243B55] rounded-2xl flex flex-col items-center space-y-4">
                    
                    {/* 1. Current State */}
                    <div className="w-full max-w-xs py-3 px-4 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                      <span className="text-xs font-mono text-[#94A3B8]">Current quantum state</span>
                      <span className="text-sm font-mono font-black text-[#22D3EE]">
                        {step3Transformed ? '|1⟩' : '|0⟩'}
                      </span>
                    </div>

                    <ArrowDown className="w-4 h-4 text-[#4F7CFF]" />

                    {/* 2. Quantum Gate Node */}
                    <div className={`w-full max-w-xs py-3 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                      step3GateActive
                        ? 'bg-[#4F7CFF]/25 border-[#22D3EE] shadow-lg shadow-[#4F7CFF]/30 scale-105'
                        : 'bg-[#132238] border-[#4F7CFF]/50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#4F7CFF]" />
                        <span className="text-xs font-mono font-semibold text-white">Quantum gate</span>
                      </div>
                      <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-indigo-950 border border-indigo-400/40 text-indigo-300">
                        GATE
                      </span>
                    </div>

                    <ArrowDown className="w-4 h-4 text-[#4F7CFF]" />

                    {/* 3. New State */}
                    <div className="w-full max-w-xs py-3 px-4 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                      <span className="text-xs font-mono text-[#94A3B8]">New quantum state</span>
                      <span className="text-sm font-mono font-black text-purple-300">
                        {step3Transformed ? '|0⟩' : '|1⟩'}
                      </span>
                    </div>

                  </div>

                  {/* Interactive Button */}
                  <button
                    id="gates-step3-apply-demo-gate-btn"
                    type="button"
                    onClick={handleStep3TriggerGate}
                    disabled={step3GateActive}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#132238] hover:bg-[#1a2f4c] border border-[#4F7CFF]/40 hover:border-[#4F7CFF] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <SlidersHorizontal className={`w-4 h-4 text-[#22D3EE] ${step3GateActive ? 'animate-spin' : ''}`} />
                    <span>TRIGGER GATE OPERATION</span>
                  </button>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Short & Focused Explanation */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Definition
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Quantum Gates
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  A <strong className="text-white">quantum gate</strong> is an operation used to intentionally change a qubit’s quantum state.
                </p>
                <p>
                  Different gates change the state in different ways.
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
            STEP 4: X GATE (Basis States + 4B Superposition)
            ===================================================================== */}
        {currentStep === 4 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Interactive X Gate Controls */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {/* Mode Subtabs: Basis States vs Superposition */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 p-1 bg-[#0D1B2A] rounded-xl border border-[#243B55]">
                      <button
                        id="gates-step4-tab-basis"
                        type="button"
                        onClick={() => setStep4SubTab('basis')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          step4SubTab === 'basis'
                            ? 'bg-[#132238] text-white border border-[#4F7CFF]/40 shadow-xs'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        |0⟩ ↔ |1⟩ Basic
                      </button>
                      <button
                        id="gates-step4-tab-super"
                        type="button"
                        onClick={() => setStep4SubTab('superposition')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          step4SubTab === 'superposition'
                            ? 'bg-[#132238] text-white border border-[#4F7CFF]/40 shadow-xs'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        On Superposition
                      </button>
                    </div>

                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-500/30">
                      X Gate
                    </span>
                  </div>

                  {/* Display Area */}
                  {step4SubTab === 'basis' ? (
                    /* PART 4A: Basis states |0⟩ <-> |1⟩ */
                    <div className="py-8 px-4 bg-[#0D1B2A] border border-[#243B55] rounded-2xl flex flex-col items-center justify-center space-y-6">
                      
                      <div className="flex items-center justify-center gap-6">
                        <div className={`text-4xl sm:text-5xl font-mono font-black transition-all duration-300 ${
                          step4BasisState === '0' ? 'text-[#22D3EE] scale-110' : 'text-slate-600 opacity-40'
                        }`}>
                          |0⟩
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-xs font-mono text-[#94A3B8]">X</span>
                          <span className="text-indigo-400 font-mono text-lg">↔</span>
                        </div>

                        <div className={`text-4xl sm:text-5xl font-mono font-black transition-all duration-300 ${
                          step4BasisState === '1' ? 'text-purple-400 scale-110' : 'text-slate-600 opacity-40'
                        }`}>
                          |1⟩
                        </div>
                      </div>

                      <div className="text-center text-xs font-mono text-[#94A3B8]">
                        Current state: <strong className="text-white text-sm">|{step4BasisState}⟩</strong>
                      </div>

                      <button
                        id="gates-step4-apply-x-btn"
                        type="button"
                        onClick={handleStep4ApplyX}
                        disabled={step4IsAnimatingX}
                        className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-900/30 active:scale-[0.99]"
                      >
                        <SlidersHorizontal className={`w-4 h-4 ${step4IsAnimatingX ? 'animate-spin' : ''}`} />
                        <span>APPLY X</span>
                      </button>

                    </div>
                  ) : (
                    /* PART 4B: Superposition swapping 80/20 <-> 20/80 */
                    <div className="py-6 px-4 bg-[#0D1B2A] border border-[#243B55] rounded-2xl flex flex-col space-y-5">
                      
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#94A3B8]">
                          {step4SuperpositionFlipped ? 'AFTER X' : 'BEFORE X'}
                        </span>
                        <span className="text-indigo-300 font-bold">
                          Measurement Probabilities
                        </span>
                      </div>

                      {/* Swapping Probability Bars */}
                      <div className="space-y-3">
                        
                        {/* 0 outcome probability bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-[#22D3EE] font-bold">0</span>
                            <span className="text-white font-bold">
                              {step4SuperpositionFlipped ? '20%' : '80%'}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-[#132238] rounded-full overflow-hidden border border-[#243B55]">
                            <div 
                              className="h-full bg-[#22D3EE] rounded-full transition-all duration-500"
                              style={{ width: step4SuperpositionFlipped ? '20%' : '80%' }}
                            />
                          </div>
                        </div>

                        {/* 1 outcome probability bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-purple-300 font-bold">1</span>
                            <span className="text-white font-bold">
                              {step4SuperpositionFlipped ? '80%' : '20%'}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-[#132238] rounded-full overflow-hidden border border-[#243B55]">
                            <div 
                              className="h-full bg-purple-500 rounded-full transition-all duration-500"
                              style={{ width: step4SuperpositionFlipped ? '80%' : '20%' }}
                            />
                          </div>
                        </div>

                      </div>

                      <button
                        id="gates-step4-apply-x-super-btn"
                        type="button"
                        onClick={handleStep4ApplyXToSuperposition}
                        disabled={step4IsSwappingSuper}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-900/30"
                      >
                        <SlidersHorizontal className={`w-4 h-4 ${step4IsSwappingSuper ? 'animate-spin' : ''}`} />
                        <span>APPLY X</span>
                      </button>

                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Explanations for X Gate and Step 4B */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Quantum Inverter
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  The X Gate
                </h2>
              </div>

              {step4SubTab === 'basis' ? (
                <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                  <p>
                    The X gate changes <strong className="text-[#22D3EE] font-mono">|0⟩</strong> to <strong className="text-purple-300 font-mono">|1⟩</strong>.
                  </p>
                  <p>
                    It also changes <strong className="text-purple-300 font-mono">|1⟩</strong> to <strong className="text-[#22D3EE] font-mono">|0⟩</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center space-y-1">
                    <div className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">
                      X GATE
                    </div>
                    <div className="text-xl font-mono font-extrabold text-white">
                      <span className="text-[#22D3EE]">|0⟩</span> ↔ <span className="text-purple-300">|1⟩</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#94A3B8]">
                    Try clicking the "On Superposition" tab to see how X behaves on general quantum states.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                  <p className="font-semibold text-white">
                    Does X only work on |0⟩ and |1⟩?
                  </p>
                  <p>
                    <strong className="text-white">No.</strong> X can act on any qubit state.
                  </p>
                  <p>
                    For a superposition, X swaps the <strong className="text-[#22D3EE]">|0⟩</strong> and <strong className="text-purple-300">|1⟩</strong> parts.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] font-mono text-xs sm:text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">Before:</span>
                      <span className="text-white">0 → 80% &nbsp;|&nbsp; 1 → 20%</span>
                    </div>
                    <div className="flex justify-between text-[#22D3EE]">
                      <span>After X:</span>
                      <span className="font-bold">0 → 20% &nbsp;|&nbsp; 1 → 80%</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-normal">
                    If the probabilities are already 50% and 50%, applying X still leaves the measurement probabilities at 50% and 50%.
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
            STEP 5: H GATE (Hadamard & Run Loop)
            ===================================================================== */}
        {currentStep === 5 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): H Gate Transformation & Pipeline Run */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(79, 124, 255, 0.08) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      Superposition Generator
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30">
                      H Gate
                    </span>
                  </div>

                  {/* Section 1: Applying H from |0⟩ */}
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-3">
                    
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8]">Input State</span>
                      <span className="text-[#22D3EE] font-bold">|0⟩</span>
                    </div>

                    <div className="py-3 px-4 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-300">
                        {step5State === '0' ? 'Basis state |0⟩' : 'Superposition (0 → 50% | 1 → 50%)'}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-[#22D3EE]">
                        {step5State === '0' ? '|0⟩' : 'ψ'}
                      </span>
                    </div>

                    {step5State === '0' && (
                      <button
                        id="gates-step5-apply-h-btn"
                        type="button"
                        onClick={handleStep5ApplyH}
                        disabled={step5IsApplyingH}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <SlidersHorizontal className={`w-3.5 h-3.5 ${step5IsApplyingH ? 'animate-spin' : ''}`} />
                        <span>APPLY H</span>
                      </button>
                    )}

                  </div>

                  {/* Section 2: LET THE LEARNER RUN IT (|0⟩ -> H -> Superposition -> Measure) */}
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Full Loop
                      </span>
                      <span className="text-xs font-mono text-[#94A3B8]">
                        Runs: {step5RunHistory.length}
                      </span>
                    </div>

                    {/* Visual pipeline stages */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-mono py-2">
                      
                      <div className={`p-2 rounded-lg border transition-all ${
                        step5CurrentCircuitStage === 'init'
                          ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-white font-bold'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                      }`}>
                        |0⟩
                      </div>

                      <div className={`p-2 rounded-lg border transition-all ${
                        step5CurrentCircuitStage === 'h'
                          ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                      }`}>
                        H
                      </div>

                      <div className={`p-2 rounded-lg border transition-all ${
                        step5CurrentCircuitStage === 'super'
                          ? 'bg-purple-600/30 border-purple-400 text-white font-bold'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                      }`}>
                        Superposition
                      </div>

                      <div className={`p-2 rounded-lg border transition-all ${
                        step5CurrentCircuitStage === 'measuring' || step5CurrentCircuitStage === 'done'
                          ? 'bg-amber-600/30 border-amber-400 text-white font-bold'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                      }`}>
                        Measure
                      </div>

                    </div>

                    {/* RUN Button */}
                    <button
                      id="gates-step5-run-circuit-btn"
                      type="button"
                      onClick={handleStep5RunPipeline}
                      disabled={step5IsRunningCircuit}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      <span>{step5IsRunningCircuit ? 'RUNNING...' : 'RUN'}</span>
                    </button>

                    {/* Run log cards */}
                    {step5RunHistory.length > 0 && (
                      <div className="pt-2 flex gap-2 overflow-x-auto">
                        {step5RunHistory.slice(-4).map((h) => (
                          <div 
                            key={h.run}
                            className="px-3 py-1.5 rounded-lg bg-[#132238] border border-[#243B55] text-xs font-mono shrink-0 flex items-center gap-2"
                          >
                            <span className="text-[#94A3B8]">Run {h.run} →</span>
                            <span className={`font-bold ${h.result === '0' ? 'text-[#22D3EE]' : 'text-purple-300'}`}>
                              {h.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Explaining H Gate */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Superposition Gate
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  H Gate
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  The H gate can change <strong className="text-[#22D3EE] font-mono">|0⟩</strong> into an equal superposition.
                </p>

                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center font-mono space-y-1">
                  <div className="text-sm font-bold text-white">
                    <span className="text-[#22D3EE]">|0⟩</span> ↓ H → Superposition
                  </div>
                  <div className="text-xs text-[#22D3EE]">
                    0 → 50% &nbsp;|&nbsp; 1 → 50%
                  </div>
                </div>

                <p>
                  This is how we can prepare the superposition used in the earlier experiment.
                </p>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2 text-xs sm:text-sm">
                  <p className="font-semibold text-white">
                    Now you can see how the original superposition was prepared:
                  </p>
                  <ul className="space-y-1 text-[#CBD5E1] list-disc list-inside font-medium">
                    <li>Start from |0⟩.</li>
                    <li>Apply H.</li>
                    <li>Measure.</li>
                    <li>To repeat the same experiment, prepare |0⟩ and apply H again.</li>
                  </ul>
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
            STEP 6: GATE VS MEASUREMENT
            ===================================================================== */}
        {currentStep === 6 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Clean Side-by-Side Visual */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.12) 0%, rgba(34, 211, 238, 0.05) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      Two Fundamental Roles
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      Side-by-Side
                    </span>
                  </div>

                  {/* Clean Side-by-Side Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* GATE Column */}
                    <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/40 space-y-3 flex flex-col items-center text-center">
                      <div className="font-mono font-extrabold text-sm text-[#4F7CFF] bg-[#4F7CFF]/15 px-3 py-0.5 rounded-full border border-[#4F7CFF]/30">
                        GATE
                      </div>
                      
                      <div className="w-full space-y-2 font-mono text-xs">
                        <div className="p-2 rounded-lg bg-[#132238] text-[#CBD5E1]">Quantum state</div>
                        <div className="text-[#4F7CFF]">↓</div>
                        <div className="p-2 rounded-lg bg-[#132238] border border-[#4F7CFF]/50 text-white font-bold">Gate</div>
                        <div className="text-[#4F7CFF]">↓</div>
                        <div className="p-2 rounded-lg bg-[#132238] text-indigo-300 font-bold">Changed quantum state</div>
                      </div>
                    </div>

                    {/* MEASUREMENT Column */}
                    <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-amber-500/40 space-y-3 flex flex-col items-center text-center">
                      <div className="font-mono font-extrabold text-sm text-amber-300 bg-amber-950/60 px-3 py-0.5 rounded-full border border-amber-500/30">
                        MEASUREMENT
                      </div>

                      <div className="w-full space-y-2 font-mono text-xs">
                        <div className="p-2 rounded-lg bg-[#132238] text-[#CBD5E1]">Quantum state</div>
                        <div className="text-amber-400">↓</div>
                        <div className="p-2 rounded-lg bg-[#132238] border border-amber-500/50 text-white font-bold">Measurement</div>
                        <div className="text-amber-400">↓</div>
                        <div className="p-2 rounded-lg bg-[#132238] text-[#22C55E] font-extrabold">0 or 1</div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Core Contrast */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Distinction
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Gate vs Measurement
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  Gates help us prepare and control the quantum state.
                </p>
                <p>
                  Measurement reads the qubit and gives a classical result.
                </p>

                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#4F7CFF] font-bold">GATE</span>
                    <span className="text-white">= change / prepare state</span>
                  </div>
                  <div className="h-px bg-[#243B55]" />
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-amber-300 font-bold">MEASUREMENT</span>
                    <span className="text-white">= read state → 0 or 1</span>
                  </div>
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
            STEP 7: FINAL SUMMARY
            ===================================================================== */}
        {currentStep === 7 && (
          <QuantumGatesSummaryScreen
            onNextLesson={onComplete}
            onBackToPath={onExit}
            onBack={handleBack}
          />
        )}

      </div>
    </LessonShell>
  );
};
