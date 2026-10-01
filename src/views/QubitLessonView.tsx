import React, { useState } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { QubitSummaryScreen } from '../components/fullscreen-lesson/QubitSummaryScreen';
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Radio, 
  Cpu, 
  Zap, 
  Compass, 
  Layers, 
  Info,
  CheckCircle2,
  Atom
} from 'lucide-react';

interface QubitLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

export const QubitLessonView: React.FC<QubitLessonViewProps> = ({
  onExit,
  onComplete,
}) => {
  // Current active step (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Furthest unlocked step (starts at 1; unlocked steps can be revisited freely)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: From Bit to Qubit
  // =========================================================================
  const [step1Transitioned, setStep1Transitioned] = useState(false);

  const handleStep1Transition = () => {
    setStep1Transitioned(true);
    setMaxUnlockedStep((prev) => Math.max(prev, 2));
  };

  // =========================================================================
  // STEP 2 STATE: Values vs Quantum States (Simulation)
  // =========================================================================
  const [step2SelectedKet, setStep2SelectedKet] = useState<'0' | '1'>('0');
  const [step2IsMeasuring, setStep2IsMeasuring] = useState(false);
  const [step2MeasuredValue, setStep2MeasuredValue] = useState<'0' | '1' | null>('0');
  const [step2HasInteracted, setStep2HasInteracted] = useState(false);

  const handleSelectStep2Ket = (ket: '0' | '1') => {
    if (step2IsMeasuring) return;
    setStep2SelectedKet(ket);
    setStep2IsMeasuring(true);
    setStep2MeasuredValue(null);

    // Simulate quantum measurement collapse to definite classical bit
    setTimeout(() => {
      setStep2MeasuredValue(ket);
      setStep2IsMeasuring(false);
      setStep2HasInteracted(true);
      setMaxUnlockedStep((prev) => Math.max(prev, 3));
    }, 600);
  };

  // =========================================================================
  // STEP 3 STATE: What Makes a Qubit Special? (Superposition & Equation)
  // =========================================================================
  // Ratio represents contribution of |1⟩ (from 0 to 1). 0 = pure |0⟩, 0.5 = equal, 1 = pure |1⟩
  const [step3Ratio, setStep3Ratio] = useState<number>(0.5);
  const [step3HoveredTerm, setStep3HoveredTerm] = useState<'psi' | 'zero' | 'one' | 'alpha' | 'beta' | null>(null);

  const alphaPercent = Math.round((1 - step3Ratio) * 100);
  const betaPercent = Math.round(step3Ratio * 100);

  const handleSetRatio = (val: number) => {
    setStep3Ratio(val);
    setMaxUnlockedStep((prev) => Math.max(prev, 4));
  };

  // =========================================================================
  // STEP 4 STATE: Probability + Measurement (Quantum collapse simulation)
  // =========================================================================
  const [step4State, setStep4State] = useState<'superposition' | 'measuring' | 'collapsed'>('superposition');
  const [step4Result, setStep4Result] = useState<'0' | '1' | null>(null);
  const [step4History, setStep4History] = useState<('0' | '1')[]>([]);

  const handleMeasureStep4 = () => {
    if (step4State === 'measuring') return;
    setStep4State('measuring');

    setTimeout(() => {
      // 50-50 equal probability outcome for standard equal superposition
      const outcome: '0' | '1' = Math.random() < 0.5 ? '0' : '1';
      setStep4Result(outcome);
      setStep4History((prev) => [outcome, ...prev].slice(0, 8));
      setStep4State('collapsed');
      setMaxUnlockedStep((prev) => Math.max(prev, 5));
    }, 700);
  };

  const handlePrepareAgain = () => {
    setStep4State('superposition');
    setStep4Result(null);
  };

  // =========================================================================
  // STEP 5 STATE: Is a Qubit Physically Real? (Hardware implementations)
  // =========================================================================
  const [step5SelectedTech, setStep5SelectedTech] = useState<string>('circuit');

  const hardwareTechs = [
    {
      id: 'circuit',
      name: 'Superconducting Circuit',
      shortLabel: 'Superconducting',
      desc: 'Microscopic electrical circuits cooled near absolute zero that behave as artificial quantum atoms.',
      icon: Cpu,
      color: '#22D3EE',
    },
    {
      id: 'ion',
      name: 'Trapped Ion',
      shortLabel: 'Trapped Ion',
      desc: 'Individual electrically charged atoms suspended in high vacuum by electromagnetic fields and controlled with lasers.',
      icon: Zap,
      color: '#818CF8',
    },
    {
      id: 'atom',
      name: 'Neutral Atom',
      shortLabel: 'Neutral Atom',
      desc: 'Uncharged individual atoms held in place in precision grids using optical laser tweezers.',
      icon: Atom,
      color: '#38BDF8',
    },
    {
      id: 'photon',
      name: 'Photon',
      shortLabel: 'Photon',
      desc: 'Particles of laser light traveling through optical waveguides, storing information in light polarization.',
      icon: Sparkles,
      color: '#F472B6',
    },
    {
      id: 'spin',
      name: 'Electron / Nuclear Spin',
      shortLabel: 'Spin Qubit',
      desc: 'The intrinsic magnetic angular momentum (spin-up or spin-down) of a single trapped electron or atomic nucleus.',
      icon: Compass,
      color: '#FBBF24',
    },
  ];

  // =========================================================================
  // NAVIGATION HANDLERS (FORWARD / BACKWARD)
  // =========================================================================
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 6) {
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

  // Check if current step can advance
  const isStep1Complete = step1Transitioned || maxUnlockedStep > 1;
  const isStep2Complete = step2HasInteracted || step2MeasuredValue !== null || maxUnlockedStep > 2;
  const isStep3Complete = maxUnlockedStep > 3 || true; // Learner can freely observe superposition
  const isStep4Complete = step4Result !== null || maxUnlockedStep > 4;
  const isStep5Complete = maxUnlockedStep >= 5;

  let canContinueCurrent = false;
  if (currentStep === 1) canContinueCurrent = isStep1Complete;
  else if (currentStep === 2) canContinueCurrent = isStep2Complete;
  else if (currentStep === 3) canContinueCurrent = isStep3Complete;
  else if (currentStep === 4) canContinueCurrent = isStep4Complete;
  else if (currentStep === 5) canContinueCurrent = isStep5Complete;
  else if (currentStep === 6) canContinueCurrent = true;

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={6}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      {/* =========================================================================
          STEP 1: FROM BIT TO QUBIT
          ========================================================================= */}
      {currentStep === 1 && (
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Recall Bit -> Transition to Qubit pointer */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="relative flex flex-col items-center w-full max-w-lg">
              
              {/* Background ambient radial glow */}
              <div 
                className="absolute w-72 h-72 rounded-full blur-3xl -z-10 pointer-events-none transition-all duration-700"
                style={{
                  background: step1Transitioned 
                    ? 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(99,102,241,0.1) 50%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(79,124,255,0.12) 0%, transparent 65%)',
                }}
              />

              {/* Main Container Card */}
              <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col items-center">
                
                {/* 1. Classical Bit Visual (Diminishes smoothly when transitioned) */}
                <div 
                  className={`w-full transition-all duration-500 rounded-2xl p-4 border flex flex-col items-center ${
                    step1Transitioned 
                      ? 'bg-[#0D1B2A]/60 border-[#243B55]/60 scale-95 opacity-50' 
                      : 'bg-[#0D1B2A] border-[#243B55] scale-100 opacity-100 shadow-sm'
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-3 text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    <span>Classical Architecture</span>
                    <span className="text-slate-400 bg-[#132238] px-2 py-0.5 rounded-full border border-[#243B55]">
                      Lesson 1 Recall
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-6 sm:gap-8 my-2">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#132238] border-2 border-[#243B55] flex items-center justify-center shadow-inner">
                        <span className="font-mono font-black text-2xl sm:text-3xl text-slate-300">0</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-[#94A3B8] mt-1.5 uppercase">State Off</span>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                      OR
                    </span>

                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#132238] border-2 border-[#4F7CFF]/50 flex items-center justify-center shadow-inner">
                        <span className="font-mono font-black text-2xl sm:text-3xl text-[#4F7CFF]">1</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-[#94A3B8] mt-1.5 uppercase">State On</span>
                    </div>
                  </div>
                </div>

                {/* Transition Divider / Button */}
                {!step1Transitioned ? (
                  <button
                    id="step1-transition-btn"
                    type="button"
                    onClick={handleStep1Transition}
                    className="group w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer shadow-md shadow-[#4F7CFF]/20 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Apply Quantum Mechanical Principles</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  /* 2. Quantum State Pointer Visual */
                  <div className="w-full bg-[#0D1B2A] border border-[#22D3EE]/40 rounded-2xl p-5 flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
                    <div className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
                      <span className="text-[#22D3EE] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                        Quantum State Space
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#CBD5E1] bg-[#132238] px-2.5 py-0.5 rounded-full border border-[#243B55]">
                        Visual Model
                      </span>
                    </div>

                    {/* Glowing Quantum State Circle & Pointer */}
                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-dashed border-[#4F7CFF]/40 bg-gradient-to-b from-[#132238]/60 to-[#0D1B2A] flex items-center justify-center shadow-inner">
                      
                      {/* Orbital ring */}
                      <div className="absolute inset-4 rounded-full border border-[rgba(255,255,255,0.06)]" />

                      {/* Cardinal Poles */}
                      <span className="absolute top-2 font-mono font-extrabold text-xs text-[#22D3EE]">|0⟩</span>
                      <span className="absolute bottom-2 font-mono font-extrabold text-xs text-purple-300">|1⟩</span>
                      <span className="absolute left-2 font-mono text-[10px] text-slate-500">−</span>
                      <span className="absolute right-2 font-mono text-[10px] text-slate-500">+</span>

                      {/* State Vector Pointer Line */}
                      <div 
                        className="absolute w-1.5 h-20 sm:h-24 bg-gradient-to-t from-transparent via-[#22D3EE] to-[#FFFFFF] rounded-full origin-bottom shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-transform duration-700"
                        style={{
                          bottom: '50%',
                          transform: 'rotate(35deg)',
                        }}
                      />

                      {/* Central Glowing State Point Core */}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#4F7CFF] ring-4 ring-[#22D3EE]/30 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </div>

                      {/* Floating glowing state indicator */}
                      <div 
                        className="absolute w-4 h-4 rounded-full bg-[#22D3EE] border-2 border-white shadow-[0_0_12px_#22D3EE] z-10 transition-all duration-700"
                        style={{
                          top: '22%',
                          right: '28%',
                        }}
                      />
                    </div>

                    <div className="text-center">
                      <span className="font-mono font-bold text-xs text-[#CBD5E1]">
                        Continuous Quantum State Vector
                      </span>
                      <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                        Points within quantum state space rather than locking to 0 or 1
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Short Explanation & Concept Revelation */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            {/* Initial classical explanation */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                Foundation
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
                A classical computer processes information using bits.
              </h1>
            </div>

            {/* Bit definition */}
            <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] w-full flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Classical Unit</div>
                <div className="text-lg font-black text-[#F8FAFC]">BIT</div>
              </div>
              <div className="font-mono font-extrabold text-sm px-3 py-1.5 rounded-xl bg-[#132238] border border-[#243B55] text-slate-300">
                0 or 1
              </div>
            </div>

            {/* Revealed Question & Qubit Introduction */}
            {step1Transitioned && (
              <div className="space-y-5 w-full animate-in fade-in duration-500">
                
                <p className="text-base sm:text-lg text-[#CBD5E1] font-medium leading-relaxed">
                  What if we process information using the principles of quantum mechanics?
                </p>

                {/* Prominent Qubit Revelation Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0D1B2A] to-[#132238] border-2 border-[#4F7CFF]/50 shadow-lg shadow-[#4F7CFF]/10 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#22D3EE]">
                    Quantum Information
                  </span>
                  
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#FFFFFF] tracking-tight">
                      We use a quantum bit, called a
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-[#22D3EE] underline decoration-[#4F7CFF]/50 underline-offset-4">
                      qubit
                    </span>.
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-[#CBD5E1] pt-1">
                    A qubit is the basic unit of quantum information.
                  </p>
                </div>

              </div>
            )}

            {/* Navigation Controls */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={6}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 2: VALUES VS QUANTUM STATES
          ========================================================================= */}
      {currentStep === 2 && (
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Comparison & Measurement Simulation */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Values vs States
                </span>
                <span className="text-xs font-mono font-semibold text-[#22D3EE] bg-[#0D1B2A] border border-[#243B55] px-2.5 py-0.5 rounded-full">
                  Interactive Simulation
                </span>
              </div>

              {/* Classical Bit vs Quantum Qubit Comparison Blocks */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Classical Bit Column */}
                <div className="bg-[#0D1B2A] border border-[#243B55] rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    CLASSICAL BIT
                  </span>
                  <div className="flex gap-2">
                    <span className="w-10 h-10 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-center font-mono font-black text-slate-300">
                      0
                    </span>
                    <span className="w-10 h-10 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-center font-mono font-black text-slate-300">
                      1
                    </span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    Logical values
                  </span>
                </div>

                {/* Quantum Qubit Column */}
                <div className="bg-[#0D1B2A] border border-[#4F7CFF]/40 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 ring-1 ring-[#4F7CFF]/20">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                    QUANTUM QUBIT
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectStep2Ket('0')}
                      className={`w-11 h-10 rounded-xl border font-mono font-black text-sm transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        step2SelectedKet === '0'
                          ? 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE] shadow-[0_0_10px_rgba(34,211,238,0.3)] scale-105'
                          : 'bg-[#132238] text-slate-400 border-[#243B55] hover:border-[#4F7CFF]/50 hover:text-white'
                      }`}
                    >
                      |0⟩
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectStep2Ket('1')}
                      className={`w-11 h-10 rounded-xl border font-mono font-black text-sm transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        step2SelectedKet === '1'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] scale-105'
                          : 'bg-[#132238] text-slate-400 border-[#243B55] hover:border-[#4F7CFF]/50 hover:text-white'
                      }`}
                    >
                      |1⟩
                    </button>
                  </div>
                  <span className="text-[11px] text-[#22D3EE] font-mono font-semibold">
                    Quantum states
                  </span>
                </div>

              </div>

              {/* Tap prompt */}
              <div className="text-center">
                <span className="text-xs font-mono text-[#94A3B8]">
                  Tap <strong className="text-[#22D3EE]">|0⟩</strong> or <strong className="text-purple-300">|1⟩</strong> to observe measurement:
                </span>
              </div>

              {/* Interactive Measurement Pipeline Simulation: State -> Measure -> Bit */}
              <div className="p-5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex flex-col items-center space-y-4">
                
                {/* 1. Chosen Quantum State */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] mb-1">
                    Prepared State
                  </span>
                  <div className="px-5 py-2.5 rounded-2xl bg-[#132238] border-2 border-[#4F7CFF]/50 shadow-sm flex items-center gap-2">
                    <span className="font-mono font-black text-2xl text-[#22D3EE]">
                      |{step2SelectedKet}⟩
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">
                      ({step2SelectedKet === '0' ? 'ket zero' : 'ket one'})
                    </span>
                  </div>
                </div>

                {/* Arrow down */}
                <div className="text-slate-500 font-mono text-sm">↓</div>

                {/* 2. Measurement Instrument */}
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                  step2IsMeasuring 
                    ? 'bg-amber-950/40 border-amber-400 text-amber-300 animate-pulse ring-2 ring-amber-400/30' 
                    : 'bg-[#132238] border-[#243B55] text-[#CBD5E1]'
                }`}>
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span className="font-mono font-bold text-xs uppercase tracking-wider">
                    {step2IsMeasuring ? 'Measuring State...' : 'Measure'}
                  </span>
                </div>

                {/* Arrow down */}
                <div className="text-slate-500 font-mono text-sm">↓</div>

                {/* 3. Classical Result */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] mb-1">
                    Classical Readout
                  </span>
                  <div className="w-16 h-14 rounded-2xl bg-[#132238] border-2 border-[#22C55E]/60 flex items-center justify-center shadow-md">
                    <span className="font-mono font-black text-3xl text-[#22C55E]">
                      {step2IsMeasuring ? '?' : step2MeasuredValue}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Values vs States Explanation */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                Notation & Meaning
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
                Values vs Quantum States
              </h1>
            </div>

            <div className="space-y-3.5 text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
              <p>
                <strong className="text-white">0 and 1</strong> are classical logical values.
              </p>
              
              <p>
                <strong className="text-[#22D3EE]">|0⟩</strong> and <strong className="text-purple-300">|1⟩</strong> are quantum states.
              </p>

              {/* Pronunciation Helper */}
              <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#22D3EE] font-bold">|0⟩</span>
                  <span className="text-[#94A3B8]">→ “ket zero”</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold">|1⟩</span>
                  <span className="text-[#94A3B8]">→ “ket one”</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-sm sm:text-base">
                  When we measure <strong className="text-[#22D3EE]">|0⟩</strong>, we get <strong className="text-white">0</strong>.
                </p>
                <p className="text-sm sm:text-base">
                  When we measure <strong className="text-purple-300">|1⟩</strong>, we get <strong className="text-white">1</strong>.
                </p>
              </div>
            </div>

            {/* Provocative Question Card */}
            <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30 space-y-2 w-full">
              <p className="text-sm sm:text-base font-bold text-[#FFFFFF]">
                So is a qubit just a bit with different symbols?
              </p>
              <p className="text-base sm:text-lg font-black text-[#22D3EE] tracking-wide">
                Not quite.
              </p>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                A qubit can do something a classical bit can never do.
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={6}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 3: WHAT MAKES A QUBIT SPECIAL? (SUPERPOSITION)
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - State Spectrum Marker & Interactive Sliders */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Quantum State Continuum
                </span>
                <span className="text-xs font-mono font-semibold text-[#22D3EE] bg-[#0D1B2A] border border-[#243B55] px-2.5 py-0.5 rounded-full">
                  Visual Model
                </span>
              </div>

              {/* Classical bit comparison: 0 OR 1 only */}
              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Classical Bit
                </span>
                <div className="flex items-center gap-3 font-mono font-black text-sm">
                  <span className="px-3 py-1 rounded-xl bg-[#132238] text-slate-300 border border-[#243B55]">0</span>
                  <span className="text-xs text-slate-500 font-bold">OR</span>
                  <span className="px-3 py-1 rounded-xl bg-[#132238] text-slate-300 border border-[#243B55]">1</span>
                </div>
              </div>

              {/* Continuous Quantum Spectrum Track */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold transition-colors ${
                    step3HoveredTerm === 'zero' ? 'text-white scale-110' : 'text-[#22D3EE]'
                  }`}>
                    |0⟩ ({alphaPercent}%)
                  </span>
                  <span className="text-[#94A3B8] uppercase text-[10px] tracking-wider">
                    Superposition Spectrum
                  </span>
                  <span className={`font-bold transition-colors ${
                    step3HoveredTerm === 'one' ? 'text-white scale-110' : 'text-purple-300'
                  }`}>
                    |1⟩ ({betaPercent}%)
                  </span>
                </div>

                {/* State line with moving glowing state marker */}
                <div className="relative h-12 flex items-center px-3">
                  
                  {/* Background Track Line */}
                  <div className="w-full h-3 rounded-full bg-[#0D1B2A] border border-[#243B55] overflow-hidden relative shadow-inner">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#22D3EE] via-[#6366F1] to-[#A855F7] transition-all duration-300 rounded-full opacity-80"
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Movable glowing state marker (Visual model) */}
                  <div 
                    className={`absolute -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200 cursor-grab active:cursor-grabbing shadow-[0_0_16px_rgba(34,211,238,0.9)] ${
                      step3HoveredTerm === 'psi' ? 'scale-125 ring-4 ring-[#22D3EE]' : ''
                    }`}
                    style={{
                      left: `${step3Ratio * 100}%`,
                      background: `linear-gradient(135deg, #22D3EE 0%, #A855F7 100%)`,
                    }}
                    title="Movable state marker: |ψ⟩"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>

                </div>

                {/* Free Interactive Range Slider */}
                <div className="space-y-1">
                  <input
                    id="qubit-ratio-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={step3Ratio}
                    onChange={(e) => handleSetRatio(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#0D1B2A] rounded-lg appearance-none cursor-pointer accent-[#22D3EE]"
                    aria-label="Adjust superposition ratio"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>Pure |0⟩</span>
                    <span>50% / 50%</span>
                    <span>Pure |1⟩</span>
                  </div>
                </div>

                {/* Preset Quick-Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSetRatio(0)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-mono font-bold transition-all ${
                      step3Ratio === 0 
                        ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE]' 
                        : 'bg-[#0D1B2A] border-[#243B55] text-slate-400 hover:text-white'
                    }`}
                  >
                    Pure |0⟩
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetRatio(0.25)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-mono font-bold transition-all ${
                      Math.abs(step3Ratio - 0.25) < 0.05 
                        ? 'bg-[#4F7CFF]/20 border-[#4F7CFF] text-[#4F7CFF]' 
                        : 'bg-[#0D1B2A] border-[#243B55] text-slate-400 hover:text-white'
                    }`}
                  >
                    75% | 25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetRatio(0.5)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-mono font-bold transition-all ${
                      Math.abs(step3Ratio - 0.5) < 0.05 
                        ? 'bg-[#6366F1]/20 border-[#6366F1] text-indigo-300' 
                        : 'bg-[#0D1B2A] border-[#243B55] text-slate-400 hover:text-white'
                    }`}
                  >
                    50% | 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetRatio(1)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-mono font-bold transition-all ${
                      step3Ratio === 1 
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300' 
                        : 'bg-[#0D1B2A] border-[#243B55] text-slate-400 hover:text-white'
                    }`}
                  >
                    Pure |1⟩
                  </button>
                </div>

              </div>

              {/* State Representation Bar */}
              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Weight α (|0⟩): <strong className="text-[#22D3EE]">{alphaPercent}%</strong></span>
                  <span className="text-[#94A3B8]">Weight β (|1⟩): <strong className="text-purple-300">{betaPercent}%</strong></span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden flex bg-[#132238]">
                  <div className="h-full bg-[#22D3EE] transition-all duration-300" style={{ width: `${alphaPercent}%` }} />
                  <div className="h-full bg-purple-400 transition-all duration-300" style={{ width: `${betaPercent}%` }} />
                </div>
              </div>

              {/* Bottom label */}
              <div className="text-center">
                <span className="text-xs font-mono text-[#CBD5E1]">
                  The qubit state is not restricted to only the two endpoints.
                </span>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Superposition & Single Clean Equation */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                Quantum Phenomenon
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
                Superposition
              </h1>
            </div>

            <div className="space-y-3 text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
              <p>
                A classical bit has one logical value: 0 or 1.
              </p>
              <p>
                A qubit is <strong className="text-white">not restricted</strong> to only |0⟩ or |1⟩.
              </p>
              <p>
                It can also have a quantum state formed from both.
              </p>
            </div>

            {/* THE ONE QUANTUM EQUATION: |ψ⟩ = α|0⟩ + β|1⟩ */}
            <div className="w-full p-5 rounded-2xl bg-[#0D1B2A] border-2 border-[#4F7CFF]/50 shadow-md shadow-[#4F7CFF]/10 space-y-4">
              
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#22D3EE] font-bold uppercase tracking-wider">
                  The Superposition State
                </span>
                <span className="text-[#94A3B8] text-[10px]">
                  Hover or tap terms to connect
                </span>
              </div>

              {/* Equation display */}
              <div className="py-3 px-4 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-3xl lg:text-4xl font-mono font-black select-none">
                
                {/* |ψ⟩ */}
                <button
                  type="button"
                  onMouseEnter={() => setStep3HoveredTerm('psi')}
                  onMouseLeave={() => setStep3HoveredTerm(null)}
                  onClick={() => setStep3HoveredTerm(step3HoveredTerm === 'psi' ? null : 'psi')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    step3HoveredTerm === 'psi' 
                      ? 'bg-[#4F7CFF]/30 text-white ring-2 ring-[#22D3EE] scale-105' 
                      : 'text-[#FFFFFF] hover:text-[#22D3EE]'
                  }`}
                  title="|ψ⟩ : Current quantum state"
                >
                  |ψ⟩
                </button>

                <span className="text-slate-400 font-light">=</span>

                {/* α */}
                <button
                  type="button"
                  onMouseEnter={() => setStep3HoveredTerm('alpha')}
                  onMouseLeave={() => setStep3HoveredTerm(null)}
                  onClick={() => setStep3HoveredTerm(step3HoveredTerm === 'alpha' ? null : 'alpha')}
                  className={`px-1.5 py-1 rounded-lg transition-all cursor-pointer ${
                    step3HoveredTerm === 'alpha' 
                      ? 'bg-[#22D3EE]/30 text-white ring-2 ring-[#22D3EE] scale-105' 
                      : 'text-[#22D3EE] hover:text-white'
                  }`}
                  title="α : Contribution of |0⟩"
                >
                  α
                </button>

                {/* |0⟩ */}
                <button
                  type="button"
                  onMouseEnter={() => setStep3HoveredTerm('zero')}
                  onMouseLeave={() => setStep3HoveredTerm(null)}
                  onClick={() => setStep3HoveredTerm(step3HoveredTerm === 'zero' ? null : 'zero')}
                  className={`px-1.5 py-1 rounded-lg transition-all cursor-pointer ${
                    step3HoveredTerm === 'zero' 
                      ? 'bg-[#22D3EE]/30 text-white ring-2 ring-[#22D3EE] scale-105' 
                      : 'text-[#22D3EE] hover:text-white'
                  }`}
                  title="|0⟩ : Basic state zero"
                >
                  |0⟩
                </button>

                <span className="text-slate-400 font-light">+</span>

                {/* β */}
                <button
                  type="button"
                  onMouseEnter={() => setStep3HoveredTerm('beta')}
                  onMouseLeave={() => setStep3HoveredTerm(null)}
                  onClick={() => setStep3HoveredTerm(step3HoveredTerm === 'beta' ? null : 'beta')}
                  className={`px-1.5 py-1 rounded-lg transition-all cursor-pointer ${
                    step3HoveredTerm === 'beta' 
                      ? 'bg-purple-500/30 text-white ring-2 ring-purple-400 scale-105' 
                      : 'text-purple-300 hover:text-white'
                  }`}
                  title="β : Contribution of |1⟩"
                >
                  β
                </button>

                {/* |1⟩ */}
                <button
                  type="button"
                  onMouseEnter={() => setStep3HoveredTerm('one')}
                  onMouseLeave={() => setStep3HoveredTerm(null)}
                  onClick={() => setStep3HoveredTerm(step3HoveredTerm === 'one' ? null : 'one')}
                  className={`px-1.5 py-1 rounded-lg transition-all cursor-pointer ${
                    step3HoveredTerm === 'one' 
                      ? 'bg-purple-500/30 text-white ring-2 ring-purple-400 scale-105' 
                      : 'text-purple-300 hover:text-white'
                  }`}
                  title="|1⟩ : Basic state one"
                >
                  |1⟩
                </button>

              </div>

              {/* Term Annotations */}
              <div className="space-y-2 text-xs font-mono">
                <div className={`p-2 rounded-xl transition-colors ${
                  step3HoveredTerm === 'psi' ? 'bg-[#132238] border border-[#22D3EE]' : 'bg-[#132238]/50'
                }`}>
                  <strong className="text-white">|ψ⟩</strong>: The qubit&apos;s current quantum state
                </div>
                <div className={`p-2 rounded-xl transition-colors ${
                  step3HoveredTerm === 'zero' || step3HoveredTerm === 'one' ? 'bg-[#132238] border border-[#22D3EE]' : 'bg-[#132238]/50'
                }`}>
                  <strong className="text-[#22D3EE]">|0⟩</strong> and <strong className="text-purple-300">|1⟩</strong>: The two basic quantum states
                </div>
                <div className={`p-2 rounded-xl transition-colors ${
                  step3HoveredTerm === 'alpha' || step3HoveredTerm === 'beta' ? 'bg-[#132238] border border-[#22D3EE]' : 'bg-[#132238]/50'
                }`}>
                  <strong className="text-[#22D3EE]">α</strong> and <strong className="text-purple-300">β</strong>: How much |0⟩ and |1⟩ contribute to the state
                </div>
              </div>

            </div>

            {/* Crucial Conceptual Distinction Box */}
            <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-1.5 w-full">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                <Info className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Essential Rule</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-[#FFFFFF] leading-snug">
                “Superposition is one quantum state — not two separate classical values stored at once.”
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={6}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 4: PROBABILITY + MEASUREMENT
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Measurement Simulation & Collapse */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  State → Measurement → Outcome
                </span>
                <span className="text-xs font-mono font-semibold text-[#22D3EE] bg-[#0D1B2A] border border-[#243B55] px-2.5 py-0.5 rounded-full">
                  Lesson 2 Connection
                </span>
              </div>

              {/* State visual with outcome probabilities */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-4">
                
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Prepared Quantum State:</span>
                  <span className="font-bold text-[#FFFFFF]">
                    {step4State === 'collapsed' 
                      ? `Collapsed to |${step4Result}⟩` 
                      : 'Equal Superposition (50/50)'}
                  </span>
                </div>

                {/* State line showing position */}
                <div className="relative h-10 flex items-center px-3">
                  <div className="w-full h-2.5 rounded-full bg-[#132238] border border-[#243B55] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#22D3EE] via-[#6366F1] to-[#A855F7] opacity-70" />
                  </div>

                  {/* Marker collapses to measured endpoint if collapsed */}
                  <div 
                    className={`absolute -translate-x-1/2 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center transition-all duration-700 shadow-[0_0_15px_rgba(34,211,238,0.9)] ${
                      step4State === 'measuring' ? 'animate-ping' : ''
                    }`}
                    style={{
                      left: step4State === 'collapsed' 
                        ? (step4Result === '0' ? '5%' : '95%') 
                        : '50%',
                      background: step4State === 'collapsed'
                        ? (step4Result === '0' ? '#22D3EE' : '#A855F7')
                        : 'linear-gradient(135deg, #22D3EE 0%, #A855F7 100%)',
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                {/* Outcome Probabilities Bars */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  
                  {/* Outcome 0 */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    step4Result === '0' 
                      ? 'bg-cyan-950/40 border-[#22D3EE] ring-1 ring-[#22D3EE]' 
                      : 'bg-[#132238] border-[#243B55]'
                  }`}>
                    <div className="flex items-center justify-between font-mono text-xs mb-1">
                      <span className="font-bold text-[#22D3EE]">Result 0</span>
                      <span className="font-bold text-white">50%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0D1B2A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#22D3EE] w-1/2" />
                    </div>
                  </div>

                  {/* Outcome 1 */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    step4Result === '1' 
                      ? 'bg-purple-950/40 border-purple-400 ring-1 ring-purple-400' 
                      : 'bg-[#132238] border-[#243B55]'
                  }`}>
                    <div className="flex items-center justify-between font-mono text-xs mb-1">
                      <span className="font-bold text-purple-300">Result 1</span>
                      <span className="font-bold text-white">50%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0D1B2A] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 w-1/2" />
                    </div>
                  </div>

                </div>

              </div>

              {/* Action Area: MEASURE button or Prepare Again */}
              <div className="flex flex-col items-center gap-3">
                {step4State !== 'collapsed' ? (
                  <button
                    id="qubit-measure-btn"
                    type="button"
                    onClick={handleMeasureStep4}
                    disabled={step4State === 'measuring'}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-extrabold text-base tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-[#4F7CFF]/25 flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
                  >
                    <Radio className={`w-5 h-5 ${step4State === 'measuring' ? 'animate-spin' : ''}`} />
                    <span>{step4State === 'measuring' ? 'MEASURING QUBIT...' : 'MEASURE'}</span>
                  </button>
                ) : (
                  <div className="w-full space-y-3 animate-in fade-in duration-300">
                    
                    {/* Measurement result badge */}
                    <div className="p-4 rounded-2xl bg-[#0D1B2A] border-2 border-[#22C55E]/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-mono font-black text-xl">
                          {step4Result}
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Classical Outcome</div>
                          <div className="text-sm font-bold text-white">
                            Result = {step4Result}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-[#22D3EE] bg-[#132238] px-2.5 py-1 rounded-lg border border-[#243B55]">
                          Now in state |{step4Result}⟩
                        </span>
                      </div>
                    </div>

                    {/* Prepare Again Button */}
                    <button
                      id="qubit-prepare-again-btn"
                      type="button"
                      onClick={handlePrepareAgain}
                      className="w-full py-3 px-4 rounded-2xl bg-[#132238] hover:bg-[#1a2f4c] border border-[#243B55] hover:border-[#4F7CFF]/40 text-[#CBD5E1] hover:text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Prepare again (restore superposition)</span>
                    </button>

                  </div>
                )}
              </div>

              {/* History log (if measured multiple times) */}
              {step4History.length > 0 && (
                <div className="pt-3 border-t border-[#243B55] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Recent measurement runs:</span>
                  <div className="flex gap-1.5">
                    {step4History.map((val, idx) => (
                      <span 
                        key={idx}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] border ${
                          val === '0' 
                            ? 'bg-cyan-950/40 text-[#22D3EE] border-[#22D3EE]/30' 
                            : 'bg-purple-950/40 text-purple-300 border-purple-400/30'
                        }`}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Probability & Measurement Result */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                Observation
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
                Remember probability?
              </h1>
            </div>

            <div className="space-y-3.5 text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
              <p>
                A qubit in superposition can have different chances of giving 0 or 1 when measured.
              </p>
              
              <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between font-mono text-xs">
                <span className="text-[#CBD5E1]">Equal superposition:</span>
                <span className="font-bold text-[#FFFFFF]">0 → 50% &nbsp;|&nbsp; 1 → 50%</span>
              </div>

              <p className="text-sm sm:text-base">
                <strong className="text-white">Probability</strong> tells us what may happen and how likely it is.
              </p>
              <p className="text-sm sm:text-base">
                <strong className="text-[#22D3EE]">Measurement</strong> gives the actual result.
              </p>
            </div>

            {/* Measurement Feedback */}
            {step4Result !== null && (
              <div className="space-y-3 w-full p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/40 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-sm sm:text-base font-bold text-white">
                  A measurement gives one classical result: 0 or 1.
                </div>
                
                <div className="text-sm text-[#CBD5E1]">
                  Result = <strong className="text-[#22C55E] text-base">{step4Result}</strong>. The qubit is now in the measured state <strong className="text-[#22D3EE]">|{step4Result}⟩</strong>.
                </div>

                <div className="pt-2 border-t border-[#243B55] text-xs text-[#94A3B8]">
                  Important: It was not secretly both 0 and 1. <strong className="text-[#CBD5E1]">It was in a superposition formed from |0⟩ and |1⟩.</strong>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={6}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 5: IS A QUBIT PHYSICALLY REAL? (HARDWARE REALITY CHECK)
          ========================================================================= */}
      {currentStep === 5 && (
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Physical Implementations Orbiting Central Qubit */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Physical Reality
                </span>
                <span className="text-xs font-mono font-semibold text-[#22D3EE] bg-[#0D1B2A] border border-[#243B55] px-2.5 py-0.5 rounded-full">
                  Quantum Systems
                </span>
              </div>

              {/* Radial System Diagram */}
              <div className="relative py-4 flex flex-col items-center">
                
                {/* Central QUBIT Node */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#0D1B2A] to-[#132238] border-2 border-[#4F7CFF] shadow-[0_0_30px_rgba(79,124,255,0.3)] z-10 flex flex-col items-center justify-center text-center p-2 mb-6">
                  <span className="font-mono font-black text-xl sm:text-2xl text-[#22D3EE] tracking-tight">
                    QUBIT
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#94A3B8] mt-0.5">
                    Information
                  </span>
                </div>

                {/* 5 Implementation Cards connected around the center */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {hardwareTechs.map((tech) => {
                    const IconComp = tech.icon;
                    const isSelected = step5SelectedTech === tech.id;

                    return (
                      <button
                        key={tech.id}
                        type="button"
                        onClick={() => setStep5SelectedTech(tech.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#0D1B2A] border-[#4F7CFF] ring-1 ring-[#4F7CFF]/40 shadow-sm'
                            : 'bg-[#0D1B2A]/60 border-[#243B55] hover:bg-[#0D1B2A] hover:border-[#4F7CFF]/40'
                        }`}
                      >
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${tech.color}15`,
                            borderColor: `${tech.color}40`,
                            color: tech.color,
                          }}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-bold text-xs text-white truncate">
                            {tech.name}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] truncate">
                            Physical implementation
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active implementation detail card */}
                {step5SelectedTech && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] w-full text-xs text-[#CBD5E1] leading-relaxed animate-in fade-in duration-200">
                    <span className="font-mono font-bold text-white block mb-0.5">
                      {hardwareTechs.find((t) => t.id === step5SelectedTech)?.name}:
                    </span>
                    {hardwareTechs.find((t) => t.id === step5SelectedTech)?.desc}
                  </div>
                )}

              </div>

              {/* Core visual message */}
              <div className="pt-3 border-t border-[#243B55] flex items-center justify-center gap-2 text-xs font-mono text-[#22D3EE] text-center">
                <span>Different physical technologies</span>
                <span className="text-white">→</span>
                <span>Same information concept</span>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Reality Check Explanation */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                Reality Check
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
                Is a qubit only something in software?
              </h1>
            </div>

            <div className="space-y-4 text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
              <p className="text-xl font-bold text-white">
                No. A real qubit needs a physical quantum system.
              </p>

              <p>
                Different quantum computers can implement qubits using technologies such as superconducting circuits, trapped ions, atoms, photons, or spins.
              </p>

              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                  Key Insight
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                  So a qubit is not one specific particle or chip — it is quantum information implemented using a physical quantum system.
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={6}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 6: FINAL SUMMARY & NEXT LESSON
          ========================================================================= */}
      {currentStep === 6 && (
        <QubitSummaryScreen
          onNextLesson={onComplete}
          onBackToPath={onExit}
          onBack={handleBack}
          isAlreadyViewed={maxUnlockedStep >= 6}
        />
      )}

    </LessonShell>
  );
};
