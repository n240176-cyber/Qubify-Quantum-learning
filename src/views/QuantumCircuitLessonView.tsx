import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { QuantumCircuitSummaryScreen } from '../components/fullscreen-lesson/QuantumCircuitSummaryScreen';
import { 
  ArrowRight, 
  RefreshCw, 
  Radio, 
  SlidersHorizontal, 
  ArrowDown, 
  Play, 
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface QuantumCircuitLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

type GateType = 'X' | 'H' | 'M';

export const QuantumCircuitLessonView: React.FC<QuantumCircuitLessonViewProps> = ({
  onExit,
  onComplete,
}) => {
  // Active step (1 to 8)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: Putting the Pieces Together
  // =========================================================================
  const [step1PieceStage, setStep1PieceStage] = useState<number>(3); // 1 = wire, 2 = wire+H, 3 = wire+H+M
  const [step1IsAnimating, setStep1IsAnimating] = useState<boolean>(false);

  const handleStep1PlayAnimation = () => {
    if (step1IsAnimating) return;
    setStep1IsAnimating(true);
    setStep1PieceStage(1);

    setTimeout(() => {
      setStep1PieceStage(2);
      setTimeout(() => {
        setStep1PieceStage(3);
        setStep1IsAnimating(false);
        setMaxUnlockedStep((prev) => Math.max(prev, 2));
      }, 700);
    }, 700);
  };

  // =========================================================================
  // STEP 2 STATE: Build Your First One-Qubit Circuit
  // Target: q0: |0⟩ ── H ── M
  // =========================================================================
  const [step2Gates, setStep2Gates] = useState<GateType[]>([]);
  const [step2IsRunning, setStep2IsRunning] = useState<boolean>(false);
  const [step2RunStage, setStep2RunStage] = useState<'idle' | 'init' | 'h' | 'm' | 'done'>('idle');
  const [step2Result, setStep2Result] = useState<'0' | '1' | null>(null);

  const isStep2TargetMatched = step2Gates.length === 2 && step2Gates[0] === 'H' && step2Gates[1] === 'M';

  const handleStep2AddGate = (gate: GateType) => {
    if (step2IsRunning) return;
    if (step2Gates.length >= 4) return;
    setStep2Gates((prev) => [...prev, gate]);
  };

  const handleStep2Clear = () => {
    if (step2IsRunning) return;
    setStep2Gates([]);
    setStep2RunStage('idle');
    setStep2Result(null);
  };

  const handleStep2RunCircuit = () => {
    if (step2IsRunning || !isStep2TargetMatched) return;
    setStep2IsRunning(true);
    setStep2Result(null);

    // Stage 1: Init |0⟩
    setStep2RunStage('init');

    setTimeout(() => {
      // Stage 2: H Gate (superposition)
      setStep2RunStage('h');

      setTimeout(() => {
        // Stage 3: Measure
        setStep2RunStage('m');

        setTimeout(() => {
          // Outcome (random 50/50)
          const outcome: '0' | '1' = Math.random() > 0.5 ? '1' : '0';
          setStep2Result(outcome);
          setStep2RunStage('done');
          setStep2IsRunning(false);
          setMaxUnlockedStep((prev) => Math.max(prev, 3));
        }, 800);
      }, 900);
    }, 700);
  };

  // Feedback calculation for Step 2
  const getStep2Feedback = () => {
    if (step2Gates.length === 0) {
      return 'Place gates on wire q0 to create a superposition and measure it.';
    }
    if (step2Gates[0] === 'M') {
      return 'Your circuit measures the qubit before creating the superposition. Try placing H before measurement.';
    }
    if (step2Gates[0] === 'X') {
      return 'The X gate flips the state to |1⟩, but H creates an equal superposition. Try placing H first.';
    }
    if (step2Gates.length === 1 && step2Gates[0] === 'H') {
      return 'Great! H creates the superposition. Now place the MEASURE gate to read out a result.';
    }
    if (step2Gates.length === 2 && step2Gates[0] === 'H' && step2Gates[1] === 'M') {
      return 'Target circuit ready! Click RUN CIRCUIT to watch it execute.';
    }
    return 'Target is: q0: |0⟩ ── H ── M. You can CLEAR and place H then MEASURE.';
  };

  // =========================================================================
  // STEP 3 STATE: Order of Operations
  // Target: q0: |0⟩ ── X ── H ── M
  // =========================================================================
  const [step3Gates, setStep3Gates] = useState<GateType[]>([]);
  const [step3IsRunning, setStep3IsRunning] = useState<boolean>(false);
  const [step3RunStage, setStep3RunStage] = useState<'idle' | 'init' | 'x' | 'h' | 'm' | 'done'>('idle');
  const [step3Result, setStep3Result] = useState<'0' | '1' | null>(null);

  const isStep3TargetMatched = 
    step3Gates.length === 3 && 
    step3Gates[0] === 'X' && 
    step3Gates[1] === 'H' && 
    step3Gates[2] === 'M';

  const handleStep3AddGate = (gate: GateType) => {
    if (step3IsRunning) return;
    if (step3Gates.length >= 4) return;
    setStep3Gates((prev) => [...prev, gate]);
  };

  const handleStep3Clear = () => {
    if (step3IsRunning) return;
    setStep3Gates([]);
    setStep3RunStage('idle');
    setStep3Result(null);
  };

  const handleStep3RunCircuit = () => {
    if (step3IsRunning || !isStep3TargetMatched) return;
    setStep3IsRunning(true);
    setStep3Result(null);

    // 1. Initial State |0⟩
    setStep3RunStage('init');

    setTimeout(() => {
      // 2. Apply X -> |1⟩
      setStep3RunStage('x');

      setTimeout(() => {
        // 3. Apply H -> Superposition
        setStep3RunStage('h');

        setTimeout(() => {
          // 4. Apply M -> Result
          setStep3RunStage('m');

          setTimeout(() => {
            const outcome: '0' | '1' = Math.random() > 0.5 ? '1' : '0';
            setStep3Result(outcome);
            setStep3RunStage('done');
            setStep3IsRunning(false);
            setMaxUnlockedStep((prev) => Math.max(prev, 4));
          }, 800);
        }, 900);
      }, 900);
    }, 700);
  };

  const getStep3Feedback = () => {
    if (step3Gates.length === 0) {
      return 'Build the sequence: q0: |0⟩ ── X ── H ── M. Start by placing X.';
    }
    if (step3Gates.length === 1) {
      return step3Gates[0] === 'X'
        ? 'X placed! Now place H to transform |1⟩ into an equal superposition.'
        : 'Start with X to flip |0⟩ into |1⟩.';
    }
    if (step3Gates.length === 2) {
      return step3Gates[0] === 'X' && step3Gates[1] === 'H'
        ? 'Excellent! Now place MEASURE at the end of the wire.'
        : 'Target order is X then H. Click CLEAR if needed.';
    }
    if (isStep3TargetMatched) {
      return 'Sequence complete! Click RUN CIRCUIT to observe each state transition.';
    }
    return 'Target order: X ── H ── M. Click CLEAR to rebuild.';
  };

  // =========================================================================
  // STEP 4 STATE: Introduce Two Qubits
  // =========================================================================
  const [step4HighlightedWire, setStep4HighlightedWire] = useState<'both' | 'q0' | 'q1'>('both');

  // =========================================================================
  // STEP 5 STATE: Build a Two-Qubit Circuit
  // Target:
  // q0: |0⟩ ── H ── M
  // q1: |0⟩ ── X ── M
  // =========================================================================
  const [step5ActiveWire, setStep5ActiveWire] = useState<'q0' | 'q1'>('q0');
  const [step5Q0Gates, setStep5Q0Gates] = useState<GateType[]>([]);
  const [step5Q1Gates, setStep5Q1Gates] = useState<GateType[]>([]);
  const [step5IsRunning, setStep5IsRunning] = useState<boolean>(false);
  const [step5RunStage, setStep5RunStage] = useState<'idle' | 'init' | 'gate1' | 'gate2' | 'done'>('idle');
  const [step5Q0Result, setStep5Q0Result] = useState<'0' | '1' | null>(null);
  const [step5Q1Result, setStep5Q1Result] = useState<'0' | '1' | null>(null);

  const isStep5Q0Matched = step5Q0Gates.length === 2 && step5Q0Gates[0] === 'H' && step5Q0Gates[1] === 'M';
  const isStep5Q1Matched = step5Q1Gates.length === 2 && step5Q1Gates[0] === 'X' && step5Q1Gates[1] === 'M';
  const isStep5TargetMatched = isStep5Q0Matched && isStep5Q1Matched;

  const handleStep5AddGate = (gate: GateType) => {
    if (step5IsRunning) return;
    if (step5ActiveWire === 'q0') {
      if (step5Q0Gates.length >= 3) return;
      setStep5Q0Gates((prev) => [...prev, gate]);
    } else {
      if (step5Q1Gates.length >= 3) return;
      setStep5Q1Gates((prev) => [...prev, gate]);
    }
  };

  const handleStep5ClearActiveWire = () => {
    if (step5IsRunning) return;
    if (step5ActiveWire === 'q0') {
      setStep5Q0Gates([]);
    } else {
      setStep5Q1Gates([]);
    }
    setStep5RunStage('idle');
    setStep5Q0Result(null);
    setStep5Q1Result(null);
  };

  const handleStep5ClearAll = () => {
    if (step5IsRunning) return;
    setStep5Q0Gates([]);
    setStep5Q1Gates([]);
    setStep5RunStage('idle');
    setStep5Q0Result(null);
    setStep5Q1Result(null);
  };

  const handleStep5RunCircuit = () => {
    if (step5IsRunning || !isStep5TargetMatched) return;
    setStep5IsRunning(true);
    setStep5Q0Result(null);
    setStep5Q1Result(null);

    // Stage 1: Init both |0⟩
    setStep5RunStage('init');

    setTimeout(() => {
      // Stage 2: q0 applies H, q1 applies X
      setStep5RunStage('gate1');

      setTimeout(() => {
        // Stage 3: Both measure
        setStep5RunStage('gate2');

        setTimeout(() => {
          const q0Outcome: '0' | '1' = Math.random() > 0.5 ? '1' : '0';
          // q1 had |0⟩ -> X -> |1⟩ -> measured gives strictly 1
          const q1Outcome: '0' | '1' = '1';

          setStep5Q0Result(q0Outcome);
          setStep5Q1Result(q1Outcome);
          setStep5RunStage('done');
          setStep5IsRunning(false);
          setMaxUnlockedStep((prev) => Math.max(prev, 6));
        }, 800);
      }, 950);
    }, 700);
  };

  const getStep5Feedback = () => {
    if (!isStep5Q0Matched && !isStep5Q1Matched) {
      return 'Target: q0: H ── M and q1: X ── M. Select wire q0 or q1 above to add gates.';
    }
    if (!isStep5Q0Matched && isStep5Q1Matched) {
      return 'q1 is complete! Now select wire q0 and place H then M.';
    }
    if (isStep5Q0Matched && !isStep5Q1Matched) {
      return 'q0 is complete! Now select wire q1 and place X then M.';
    }
    return 'Both wires ready! Click RUN CIRCUIT to simulate both qubits independently.';
  };

  // =========================================================================
  // STEP 6 STATE: Same Circuit, Independent Qubits
  // =========================================================================
  const [step6InspectionFocus, setStep6InspectionFocus] = useState<'all' | 'q0' | 'q1'>('all');

  // =========================================================================
  // STEP 7 STATE: How to Read a Basic Quantum Circuit
  // Anatomy elements: 'wire' | 'init' | 'gates' | 'measure' | 'arrow'
  // =========================================================================
  const [step7ActiveElement, setStep7ActiveElement] = useState<'wire' | 'init' | 'gates' | 'measure' | 'arrow'>('wire');

  // =========================================================================
  // NAVIGATION HANDLERS
  // =========================================================================
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 8) {
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

  // Check completion criteria for each step to enable Continue
  const isStep1Complete = true; // Learner can view or play animation
  const isStep2Complete = step2RunStage === 'done' || maxUnlockedStep > 2;
  const isStep3Complete = step3RunStage === 'done' || maxUnlockedStep > 3;
  const isStep4Complete = true; // Conceptual introduction of two wires
  const isStep5Complete = step5RunStage === 'done' || maxUnlockedStep > 5;
  const isStep6Complete = true; // Conceptual review of independent lines
  const isStep7Complete = true; // Reading reference anatomy
  const isStep8Complete = true;

  let canContinueCurrent = false;
  if (currentStep === 1) canContinueCurrent = isStep1Complete;
  else if (currentStep === 2) canContinueCurrent = isStep2Complete;
  else if (currentStep === 3) canContinueCurrent = isStep3Complete;
  else if (currentStep === 4) canContinueCurrent = isStep4Complete;
  else if (currentStep === 5) canContinueCurrent = isStep5Complete;
  else if (currentStep === 6) canContinueCurrent = isStep6Complete;
  else if (currentStep === 7) canContinueCurrent = isStep7Complete;
  else if (currentStep === 8) canContinueCurrent = isStep8Complete;

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={8}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      <div className="w-full flex-1 flex flex-col justify-between">
        
        {/* =====================================================================
            STEP 1: PUTTING THE PIECES TOGETHER
            ===================================================================== */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Visual Assembly Left to Right */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                {/* Ambient Glow */}
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.16) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
                  }}
                />

                {/* Card Container */}
                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-7">
                  
                  {/* Status Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      TIMELINE ASSEMBLY
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      Step {step1PieceStage} of 3
                    </span>
                  </div>

                  {/* Circuit Wire Visual Canvas */}
                  <div className="py-8 px-6 bg-[#0D1B2A] border border-[#243B55] rounded-2xl flex flex-col items-center justify-center space-y-6">
                    
                    {/* The Wire */}
                    <div className="w-full relative flex items-center py-4 px-3 bg-[#132238] rounded-xl border border-[#243B55] overflow-hidden">
                      
                      {/* Base horizontal wire line */}
                      <div className="absolute inset-x-8 h-0.5 bg-[#334155] -z-0" />

                      <div className="flex items-center justify-between w-full z-10">
                        {/* Qubit label & initial state */}
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-sm font-bold text-[#94A3B8]">q0:</span>
                          <span className="px-2.5 py-1 rounded-lg bg-[#0D1B2A] border border-[#22D3EE]/50 text-[#22D3EE] text-xs font-black shadow-xs">
                            |0⟩
                          </span>
                        </div>

                        {/* Gate 1: H */}
                        <div className={`transition-all duration-500 transform ${
                          step1PieceStage >= 2 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-75 -translate-y-2'
                        }`}>
                          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border-2 border-purple-400/80 text-purple-200 flex items-center justify-center font-mono font-extrabold text-sm shadow-md shadow-purple-950/50">
                            H
                          </div>
                        </div>

                        {/* Gate 2: M */}
                        <div className={`transition-all duration-500 transform ${
                          step1PieceStage >= 3 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-75 -translate-y-2'
                        }`}>
                          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border-2 border-[#22D3EE]/80 text-[#67E8F9] flex flex-col items-center justify-center font-mono font-extrabold text-xs shadow-md shadow-cyan-950/50">
                            <Radio className="w-3.5 h-3.5 text-[#22D3EE] mb-0.5" />
                            <span>M</span>
                          </div>
                        </div>

                        {/* Empty spacer wire end */}
                        <div className="w-4 h-0.5 bg-[#334155]" />
                      </div>

                    </div>

                    {/* Sequential Process Flow */}
                    <div className="w-full flex items-center justify-between px-4 py-3 bg-[#132238]/60 rounded-xl border border-[#243B55] text-xs font-mono text-[#94A3B8]">
                      <div className="flex flex-col items-center">
                        <span className="text-[#22D3EE] font-bold">Start in |0⟩</span>
                        <span className="text-[10px] text-slate-400">Preparation</span>
                      </div>
                      <span className="text-slate-500 font-bold">→</span>
                      <div className="flex flex-col items-center">
                        <span className={step1PieceStage >= 2 ? 'text-purple-300 font-bold' : 'text-slate-600'}>
                          Apply H
                        </span>
                        <span className="text-[10px] text-slate-400">Superposition</span>
                      </div>
                      <span className="text-slate-500 font-bold">→</span>
                      <div className="flex flex-col items-center">
                        <span className={step1PieceStage >= 3 ? 'text-[#67E8F9] font-bold' : 'text-slate-600'}>
                          Measure
                        </span>
                        <span className="text-[10px] text-slate-400">Classical bit</span>
                      </div>
                    </div>

                  </div>

                  {/* Replay / Step Animation Controls */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      id="circuit-step1-replay-btn"
                      type="button"
                      onClick={handleStep1PlayAnimation}
                      disabled={step1IsAnimating}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#0D1B2A] hover:bg-[#16273c] border border-[#243B55] hover:border-[#4F7CFF]/50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RotateCcw className={`w-4 h-4 text-[#22D3EE] ${step1IsAnimating ? 'animate-spin' : ''}`} />
                      <span>{step1IsAnimating ? 'ANIMATING LEFT TO RIGHT...' : 'REPLAY ASSEMBLY'}</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Conceptual Intro & Question */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  The Big Picture
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  You already know the pieces.
                </h2>
              </div>

              {/* 3 Known Pieces */}
              <div className="w-full space-y-2.5">
                <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] font-mono text-xs font-bold">
                      |ψ⟩
                    </div>
                    <span className="text-sm font-semibold text-white">Qubit</span>
                  </div>
                  <span className="text-xs text-[#94A3B8] font-mono">The state carrier</span>
                </div>

                <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] border border-purple-400/40 flex items-center justify-center text-purple-300 font-mono text-xs font-bold">
                      G
                    </div>
                    <span className="text-sm font-semibold text-white">Gate (X, H)</span>
                  </div>
                  <span className="text-xs text-[#94A3B8] font-mono">Changes the state</span>
                </div>

                <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] font-mono text-xs font-bold">
                      M
                    </div>
                    <span className="text-sm font-semibold text-white">Measurement</span>
                  </div>
                  <span className="text-xs text-[#94A3B8] font-mono">Reads out 0 or 1</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30 space-y-2 w-full">
                <p className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">
                  What happens when we arrange these operations in the order we want?
                </p>
                <p className="text-base sm:text-lg font-black text-[#22D3EE] tracking-wide">
                  QUANTUM CIRCUIT
                </p>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  A <strong className="text-white">quantum circuit</strong> is an ordered sequence of operations performed on one or more qubits.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#132238] border border-[#243B55] flex items-center gap-2.5 text-xs text-[#CBD5E1] w-full">
                <Info className="w-4 h-4 text-[#22D3EE] shrink-0" />
                <span>
                  <strong>Core Rule:</strong> Read the circuit from <span className="text-[#22D3EE] font-bold">left to right</span> in the direction of time.
                </span>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={8}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 2: BUILD YOUR FIRST ONE-QUBIT CIRCUIT
            ===================================================================== */}
        {currentStep === 2 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Interactive Circuit Builder */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.14) 0%, rgba(34, 211, 238, 0.06) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      CIRCUIT BUILDER (1 QUBIT)
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      Target: H → M
                    </span>
                  </div>

                  {/* Wire Canvas */}
                  <div className="p-6 bg-[#0D1B2A] border border-[#243B55] rounded-2xl space-y-4">
                    
                    <div className="relative flex items-center py-5 px-3 bg-[#132238] rounded-xl border border-[#243B55] overflow-hidden min-h-[90px]">
                      
                      {/* Wire Line */}
                      <div className="absolute inset-x-8 h-0.5 bg-[#334155] -z-0" />

                      {/* Moving Execution Indicator */}
                      {step2IsRunning && (
                        <div 
                          className="absolute w-3 h-3 rounded-full bg-[#22D3EE] shadow-lg shadow-[#22D3EE]/80 -translate-y-1/2 top-1/2 transition-all duration-700 pointer-events-none z-20"
                          style={{
                            left: step2RunStage === 'init' ? '12%' : step2RunStage === 'h' ? '50%' : '82%',
                          }}
                        />
                      )}

                      <div className="flex items-center justify-between w-full z-10">
                        {/* Initial state */}
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-sm font-bold text-[#94A3B8]">q0:</span>
                          <span className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-all ${
                            step2RunStage === 'init'
                              ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE] scale-110'
                              : 'bg-[#0D1B2A] border-[#22D3EE]/40 text-[#22D3EE]'
                          }`}>
                            |0⟩
                          </span>
                        </div>

                        {/* Placed Gates Slots */}
                        <div className="flex-1 flex items-center justify-evenly px-4">
                          {step2Gates.length === 0 ? (
                            <div className="text-xs font-mono text-[#94A3B8] italic">
                              [ Wire is empty. Click gate buttons below ]
                            </div>
                          ) : (
                            step2Gates.map((gate, index) => {
                              const isExecutingThis = 
                                (gate === 'H' && step2RunStage === 'h') ||
                                (gate === 'M' && step2RunStage === 'm');

                              return (
                                <div 
                                  key={index}
                                  className={`w-11 h-11 rounded-xl border-2 font-mono font-black text-xs flex flex-col items-center justify-center transition-all ${
                                    gate === 'X'
                                      ? 'bg-blue-950/80 border-blue-400 text-blue-200'
                                      : gate === 'H'
                                      ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                                      : 'bg-cyan-950/80 border-[#22D3EE] text-[#67E8F9]'
                                  } ${isExecutingThis ? 'ring-4 ring-[#22D3EE]/50 scale-110' : ''}`}
                                >
                                  {gate === 'M' ? (
                                    <>
                                      <Radio className="w-3 h-3 text-[#22D3EE]" />
                                      <span>M</span>
                                    </>
                                  ) : (
                                    gate
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="w-4 h-0.5 bg-[#334155]" />
                      </div>

                    </div>

                    {/* Execution State Display */}
                    <div className="p-3 bg-[#132238] rounded-xl border border-[#243B55] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8]">Active Qubit State:</span>
                      
                      {step2RunStage === 'idle' && (
                        <span className="text-slate-400">Ready</span>
                      )}
                      {step2RunStage === 'init' && (
                        <span className="text-[#22D3EE] font-bold">|0⟩ (Basis zero)</span>
                      )}
                      {step2RunStage === 'h' && (
                        <span className="text-purple-300 font-bold animate-pulse">
                          Superposition (0 → 50% | 1 → 50%)
                        </span>
                      )}
                      {step2RunStage === 'm' && (
                        <span className="text-[#67E8F9] font-bold animate-pulse">
                          Collapsing wavefunction...
                        </span>
                      )}
                      {step2RunStage === 'done' && (
                        <span className="text-white font-bold">
                          Result = <strong className="text-[#22D3EE] text-sm">{step2Result}</strong> (Collapsed to |{step2Result}⟩)
                        </span>
                      )}
                    </div>

                    {/* Feedback Note */}
                    <div className="text-xs font-mono text-[#CBD5E1] p-2.5 rounded-lg bg-[#132238]/60 border border-[#243B55]">
                      {getStep2Feedback()}
                    </div>

                  </div>

                  {/* Builder Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                      <span>Add Gate to q0:</span>
                      <span>Max 4 gates</span>
                    </div>

                    {/* Gate Placement Buttons */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <button
                        id="circuit-step2-add-x"
                        type="button"
                        onClick={() => handleStep2AddGate('X')}
                        disabled={step2IsRunning || step2Gates.length >= 4}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-blue-950/40 border border-blue-500/40 hover:border-blue-400 text-blue-200 font-mono font-bold text-sm transition-all cursor-pointer disabled:opacity-40"
                      >
                        [ X ]
                      </button>

                      <button
                        id="circuit-step2-add-h"
                        type="button"
                        onClick={() => handleStep2AddGate('H')}
                        disabled={step2IsRunning || step2Gates.length >= 4}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 text-purple-200 font-mono font-bold text-sm transition-all cursor-pointer disabled:opacity-40"
                      >
                        [ H ]
                      </button>

                      <button
                        id="circuit-step2-add-m"
                        type="button"
                        onClick={() => handleStep2AddGate('M')}
                        disabled={step2IsRunning || step2Gates.length >= 4}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-cyan-950/40 border border-[#22D3EE]/40 hover:border-[#22D3EE] text-[#67E8F9] font-mono font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>[ MEASURE ]</span>
                      </button>
                    </div>

                    {/* Action Bar: CLEAR & RUN */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        id="circuit-step2-clear"
                        type="button"
                        onClick={handleStep2Clear}
                        disabled={step2IsRunning || step2Gates.length === 0}
                        className="py-3 px-4 rounded-xl bg-[#0D1B2A] hover:bg-[#16273c] border border-[#243B55] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-40"
                      >
                        CLEAR
                      </button>

                      <button
                        id="circuit-step2-run"
                        type="button"
                        onClick={handleStep2RunCircuit}
                        disabled={step2IsRunning || !isStep2TargetMatched}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4F7CFF]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Play className={`w-4 h-4 fill-current ${step2IsRunning ? 'animate-pulse' : ''}`} />
                        <span>{step2IsRunning ? 'EXECUTING TIMELINE...' : 'RUN CIRCUIT'}</span>
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Dynamic Live Explanation */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Hands-On Builder
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Build your first one-qubit circuit
                </h2>
              </div>

              {/* Challenge prompt */}
              <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2 w-full">
                <p className="font-semibold text-white text-sm">
                  Challenge:
                </p>
                <p className="text-xs sm:text-sm text-[#CBD5E1]">
                  “Can you build a circuit that creates a superposition and then measures it?”
                </p>
                <div className="p-2.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] font-mono text-xs text-[#22D3EE]">
                  Expected: q0: |0⟩ ── H ── M
                </div>
              </div>

              {/* Live Run Narrator */}
              <div className="space-y-3 text-sm text-[#CBD5E1] leading-relaxed w-full">
                {step2RunStage === 'idle' && (
                  <p>
                    Use the buttons on the left to add <strong className="text-purple-300">H</strong> and then <strong className="text-[#22D3EE]">MEASURE</strong>. Once placed, click RUN CIRCUIT to observe the quantum state change in real time.
                  </p>
                )}

                {step2RunStage === 'init' && (
                  <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#22D3EE]/40 text-xs font-mono text-white animate-in fade-in">
                    Stage 1: <span className="text-[#22D3EE] font-bold">Start in |0⟩.</span> Qubit initializes in its ground basis state.
                  </div>
                )}

                {step2RunStage === 'h' && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono text-purple-200 animate-in fade-in">
                    Stage 2: <span className="text-white font-bold">H changes the qubit into an equal superposition.</span> (0 → 50%, 1 → 50%)
                  </div>
                )}

                {(step2RunStage === 'm' || step2RunStage === 'done') && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-[#22D3EE]/40 text-xs font-mono text-cyan-200 space-y-1 animate-in fade-in">
                    <p>
                      Stage 3: <span className="text-white font-bold">Measurement gives one classical result: 0 or 1.</span>
                    </p>
                    {step2Result !== null && (
                      <p className="text-xs text-[#22D3EE]">
                        Observed outcome this run: <strong className="text-white text-sm">{step2Result}</strong>
                      </p>
                    )}
                  </div>
                )}

                {step2RunStage === 'done' && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 font-semibold">
                    ✓ You just built and ran your first quantum circuit!
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={8}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 3: ORDER OF OPERATIONS
            ===================================================================== */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Order Builder (X -> H -> M) */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.14) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      ORDER OF OPERATIONS
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/30">
                      Target: X → H → M
                    </span>
                  </div>

                  {/* Wire Canvas */}
                  <div className="p-6 bg-[#0D1B2A] border border-[#243B55] rounded-2xl space-y-4">
                    
                    <div className="relative flex items-center py-5 px-3 bg-[#132238] rounded-xl border border-[#243B55] overflow-hidden min-h-[90px]">
                      
                      <div className="absolute inset-x-8 h-0.5 bg-[#334155] -z-0" />

                      {/* Moving Execution Indicator */}
                      {step3IsRunning && (
                        <div 
                          className="absolute w-3 h-3 rounded-full bg-[#22D3EE] shadow-lg shadow-[#22D3EE]/80 -translate-y-1/2 top-1/2 transition-all duration-700 pointer-events-none z-20"
                          style={{
                            left: step3RunStage === 'init' ? '12%' : step3RunStage === 'x' ? '35%' : step3RunStage === 'h' ? '60%' : '85%',
                          }}
                        />
                      )}

                      <div className="flex items-center justify-between w-full z-10">
                        {/* Initial state */}
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-sm font-bold text-[#94A3B8]">q0:</span>
                          <span className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-all ${
                            step3RunStage === 'init'
                              ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE] scale-110'
                              : 'bg-[#0D1B2A] border-[#22D3EE]/40 text-[#22D3EE]'
                          }`}>
                            |0⟩
                          </span>
                        </div>

                        {/* Placed Gates */}
                        <div className="flex-1 flex items-center justify-evenly px-4">
                          {step3Gates.length === 0 ? (
                            <div className="text-xs font-mono text-[#94A3B8] italic">
                              [ Place X, then H, then MEASURE ]
                            </div>
                          ) : (
                            step3Gates.map((gate, index) => {
                              const isExecutingThis = 
                                (gate === 'X' && step3RunStage === 'x') ||
                                (gate === 'H' && step3RunStage === 'h') ||
                                (gate === 'M' && step3RunStage === 'm');

                              return (
                                <div 
                                  key={index}
                                  className={`w-11 h-11 rounded-xl border-2 font-mono font-black text-xs flex flex-col items-center justify-center transition-all ${
                                    gate === 'X'
                                      ? 'bg-blue-950/80 border-blue-400 text-blue-200'
                                      : gate === 'H'
                                      ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                                      : 'bg-cyan-950/80 border-[#22D3EE] text-[#67E8F9]'
                                  } ${isExecutingThis ? 'ring-4 ring-[#22D3EE]/50 scale-110' : ''}`}
                                >
                                  {gate === 'M' ? (
                                    <>
                                      <Radio className="w-3 h-3 text-[#22D3EE]" />
                                      <span>M</span>
                                    </>
                                  ) : (
                                    gate
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="w-4 h-0.5 bg-[#334155]" />
                      </div>

                    </div>

                    {/* Step-by-Step Transition Feedback */}
                    <div className="p-3 bg-[#132238] rounded-xl border border-[#243B55] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8]">Quantum State:</span>
                      
                      {step3RunStage === 'idle' && (
                        <span className="text-slate-400">Ready</span>
                      )}
                      {step3RunStage === 'init' && (
                        <span className="text-[#22D3EE] font-bold">|0⟩ (Start)</span>
                      )}
                      {step3RunStage === 'x' && (
                        <span className="text-blue-300 font-bold animate-pulse">
                          |0⟩ ──[X]──→ |1⟩ (Flipped!)
                        </span>
                      )}
                      {step3RunStage === 'h' && (
                        <span className="text-purple-300 font-bold animate-pulse">
                          |1⟩ ──[H]──→ Superposition (50% / 50%)
                        </span>
                      )}
                      {step3RunStage === 'm' && (
                        <span className="text-[#67E8F9] font-bold animate-pulse">
                          Reading detector...
                        </span>
                      )}
                      {step3RunStage === 'done' && (
                        <span className="text-white font-bold">
                          Measured outcome = <strong className="text-[#22D3EE] text-sm">{step3Result}</strong>
                        </span>
                      )}
                    </div>

                    {/* Feedback prompt */}
                    <div className="text-xs font-mono text-[#CBD5E1] p-2.5 rounded-lg bg-[#132238]/60 border border-[#243B55]">
                      {getStep3Feedback()}
                    </div>

                  </div>

                  {/* Builder Controls */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <button
                        id="circuit-step3-add-x"
                        type="button"
                        onClick={() => handleStep3AddGate('X')}
                        disabled={step3IsRunning || step3Gates.length >= 4}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-blue-950/40 border border-blue-500/40 hover:border-blue-400 text-blue-200 font-mono font-bold text-sm transition-all cursor-pointer disabled:opacity-40"
                      >
                        [ X ]
                      </button>

                      <button
                        id="circuit-step3-add-h"
                        type="button"
                        onClick={() => handleStep3AddGate('H')}
                        disabled={step3IsRunning || step3Gates.length >= 4}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 text-purple-200 font-mono font-bold text-sm transition-all cursor-pointer disabled:opacity-40"
                      >
                        [ H ]
                      </button>

                      <button
                        id="circuit-step3-add-m"
                        type="button"
                        onClick={() => handleStep3AddGate('M')}
                        disabled={step3IsRunning || step3Gates.length >= 4}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-cyan-950/40 border border-[#22D3EE]/40 hover:border-[#22D3EE] text-[#67E8F9] font-mono font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>[ MEASURE ]</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        id="circuit-step3-clear"
                        type="button"
                        onClick={handleStep3Clear}
                        disabled={step3IsRunning || step3Gates.length === 0}
                        className="py-3 px-4 rounded-xl bg-[#0D1B2A] hover:bg-[#16273c] border border-[#243B55] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-40"
                      >
                        CLEAR
                      </button>

                      <button
                        id="circuit-step3-run"
                        type="button"
                        onClick={handleStep3RunCircuit}
                        disabled={step3IsRunning || !isStep3TargetMatched}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4F7CFF]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Play className={`w-4 h-4 fill-current ${step3IsRunning ? 'animate-pulse' : ''}`} />
                        <span>{step3IsRunning ? 'STEPPING THROUGH...' : 'RUN CIRCUIT'}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Explanation on Order */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Circuit Mechanics
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Order of Operations
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  Now try a different sequence.
                </p>
                
                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                  <p className="font-semibold text-white">
                    The order of operations matters in a quantum circuit.
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Quantum gates are applied strictly in the order they appear from left to right.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] space-y-2 font-mono text-xs">
                  <div className="text-[#94A3B8] font-bold">Execution Timeline:</div>
                  <div className="text-white">|0⟩ (initial state)</div>
                  <div className="text-blue-300">↓ X gate applies → state becomes |1⟩</div>
                  <div className="text-purple-300">↓ H gate applies → state becomes superposition</div>
                  <div className="text-[#67E8F9]">↓ Measure applies → yields classical 0 or 1</div>
                </div>

                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Changing the order of gates can change the quantum state produced by the circuit.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={8}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 4: INTRODUCE TWO QUBITS
            ===================================================================== */}
        {currentStep === 4 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Two Circuit Lines Canvas */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      MULTI-QUBIT REGISTER
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      2 Qubit Lines
                    </span>
                  </div>

                  {/* Two Wires Display */}
                  <div className="p-6 bg-[#0D1B2A] border border-[#243B55] rounded-2xl space-y-6">
                    
                    {/* First Qubit Wire: q0 */}
                    <div 
                      onClick={() => setStep4HighlightedWire('q0')}
                      className={`relative flex items-center py-4 px-4 rounded-xl border transition-all cursor-pointer ${
                        step4HighlightedWire === 'q0' || step4HighlightedWire === 'both'
                          ? 'bg-[#132238] border-[#22D3EE]/60 ring-2 ring-[#22D3EE]/20 shadow-md'
                          : 'bg-[#132238]/50 border-[#243B55] opacity-50'
                      }`}
                    >
                      <div className="absolute inset-x-12 h-0.5 bg-[#334155] -z-0" />
                      
                      <div className="flex items-center justify-between w-full z-10">
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-sm font-bold text-[#94A3B8] w-6">q0:</span>
                          <span className="px-2.5 py-1 rounded-lg bg-[#0D1B2A] border border-[#22D3EE]/50 text-[#22D3EE] text-xs font-black shadow-xs">
                            |0⟩
                          </span>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-[#0D1B2A] border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-mono font-bold">
                          first qubit
                        </span>
                      </div>
                    </div>

                    {/* Second Qubit Wire: q1 (Animated entry) */}
                    <div 
                      onClick={() => setStep4HighlightedWire('q1')}
                      className={`relative flex items-center py-4 px-4 rounded-xl border transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                        step4HighlightedWire === 'q1' || step4HighlightedWire === 'both'
                          ? 'bg-[#132238] border-indigo-400/60 ring-2 ring-indigo-400/20 shadow-md'
                          : 'bg-[#132238]/50 border-[#243B55] opacity-50'
                      }`}
                    >
                      <div className="absolute inset-x-12 h-0.5 bg-[#334155] -z-0" />
                      
                      <div className="flex items-center justify-between w-full z-10">
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-sm font-bold text-[#94A3B8] w-6">q1:</span>
                          <span className="px-2.5 py-1 rounded-lg bg-[#0D1B2A] border border-indigo-400/50 text-indigo-300 text-xs font-black shadow-xs">
                            |0⟩
                          </span>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-[#0D1B2A] border border-indigo-400/40 text-indigo-300 text-xs font-mono font-bold">
                          second qubit
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Inspector toggles */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      id="circuit-step4-toggle-both"
                      type="button"
                      onClick={() => setStep4HighlightedWire('both')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        step4HighlightedWire === 'both'
                          ? 'bg-[#132238] text-white border border-[#4F7CFF]/50 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Highlight Both
                    </button>
                    <button
                      id="circuit-step4-toggle-q0"
                      type="button"
                      onClick={() => setStep4HighlightedWire('q0')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        step4HighlightedWire === 'q0'
                          ? 'bg-[#132238] text-[#22D3EE] border border-[#22D3EE]/50 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Focus q0
                    </button>
                    <button
                      id="circuit-step4-toggle-q1"
                      type="button"
                      onClick={() => setStep4HighlightedWire('q1')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        step4HighlightedWire === 'q1'
                          ? 'bg-[#132238] text-indigo-300 border border-indigo-500/50 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Focus q1
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Explanation of Multi-Qubit Representation */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Scaling Up
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  A quantum circuit does not have to contain only one qubit.
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  We can also build circuits with multiple qubits.
                </p>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                  <p className="font-semibold text-white">
                    Each horizontal line represents one qubit.
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    In our diagram, the top line is qubit 0 (q0) and the second line is qubit 1 (q1).
                  </p>
                </div>

                <p className="text-sm text-[#22D3EE] font-semibold">
                  Now let’s build a circuit using two qubits.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={8}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 5: BUILD A TWO-QUBIT CIRCUIT
            Target:
            q0: |0⟩ ── H ── M
            q1: |0⟩ ── X ── M
            ===================================================================== */}
        {currentStep === 5 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): 2-Qubit Interactive Builder */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {/* Top Wire Target Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      2-QUBIT BUILDER
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      Target: q0(H,M) • q1(X,M)
                    </span>
                  </div>

                  {/* Wire Switcher Pill Buttons */}
                  <div className="flex items-center gap-2 p-1 bg-[#0D1B2A] rounded-xl border border-[#243B55]">
                    <span className="text-xs font-mono text-[#94A3B8] px-2">Place on:</span>
                    <button
                      id="circuit-step5-select-q0"
                      type="button"
                      onClick={() => setStep5ActiveWire('q0')}
                      disabled={step5IsRunning}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        step5ActiveWire === 'q0'
                          ? 'bg-[#132238] text-[#22D3EE] border border-[#22D3EE]/40 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Wire q0 {isStep5Q0Matched ? '✓' : ''}
                    </button>
                    <button
                      id="circuit-step5-select-q1"
                      type="button"
                      onClick={() => setStep5ActiveWire('q1')}
                      disabled={step5IsRunning}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        step5ActiveWire === 'q1'
                          ? 'bg-[#132238] text-indigo-300 border border-indigo-400/40 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Wire q1 {isStep5Q1Matched ? '✓' : ''}
                    </button>
                  </div>

                  {/* Interactive Dual-Wire Stage */}
                  <div className="p-5 bg-[#0D1B2A] border border-[#243B55] rounded-2xl space-y-4">
                    
                    {/* Wire q0 */}
                    <div 
                      onClick={() => !step5IsRunning && setStep5ActiveWire('q0')}
                      className={`relative flex items-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
                        step5ActiveWire === 'q0'
                          ? 'bg-[#132238] border-[#22D3EE]/50 ring-1 ring-[#22D3EE]/30'
                          : 'bg-[#132238]/60 border-[#243B55]'
                      }`}
                    >
                      <div className="absolute inset-x-8 h-0.5 bg-[#334155] -z-0" />
                      
                      <div className="flex items-center justify-between w-full z-10">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-xs font-bold text-[#94A3B8]">q0:</span>
                          <span className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-bold">
                            |0⟩
                          </span>
                        </div>

                        {/* Placed gates for q0 */}
                        <div className="flex-1 flex items-center justify-evenly px-3">
                          {step5Q0Gates.length === 0 ? (
                            <span className="text-[11px] font-mono text-slate-500 italic">
                              [ Needs: H ── M ]
                            </span>
                          ) : (
                            step5Q0Gates.map((gate, i) => (
                              <div
                                key={i}
                                className={`w-9 h-9 rounded-lg border font-mono font-black text-xs flex items-center justify-center ${
                                  gate === 'H'
                                    ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                                    : gate === 'X'
                                    ? 'bg-blue-950/80 border-blue-400 text-blue-200'
                                    : 'bg-cyan-950/80 border-[#22D3EE] text-[#67E8F9]'
                                }`}
                              >
                                {gate === 'M' ? <Radio className="w-3.5 h-3.5" /> : gate}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="w-4 h-0.5 bg-[#334155]" />
                      </div>
                    </div>

                    {/* Wire q1 */}
                    <div 
                      onClick={() => !step5IsRunning && setStep5ActiveWire('q1')}
                      className={`relative flex items-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
                        step5ActiveWire === 'q1'
                          ? 'bg-[#132238] border-indigo-400/50 ring-1 ring-indigo-400/30'
                          : 'bg-[#132238]/60 border-[#243B55]'
                      }`}
                    >
                      <div className="absolute inset-x-8 h-0.5 bg-[#334155] -z-0" />
                      
                      <div className="flex items-center justify-between w-full z-10">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-xs font-bold text-[#94A3B8]">q1:</span>
                          <span className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-indigo-400/40 text-indigo-300 text-xs font-bold">
                            |0⟩
                          </span>
                        </div>

                        {/* Placed gates for q1 */}
                        <div className="flex-1 flex items-center justify-evenly px-3">
                          {step5Q1Gates.length === 0 ? (
                            <span className="text-[11px] font-mono text-slate-500 italic">
                              [ Needs: X ── M ]
                            </span>
                          ) : (
                            step5Q1Gates.map((gate, i) => (
                              <div
                                key={i}
                                className={`w-9 h-9 rounded-lg border font-mono font-black text-xs flex items-center justify-center ${
                                  gate === 'H'
                                    ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                                    : gate === 'X'
                                    ? 'bg-blue-950/80 border-blue-400 text-blue-200'
                                    : 'bg-cyan-950/80 border-[#22D3EE] text-[#67E8F9]'
                                }`}
                              >
                                {gate === 'M' ? <Radio className="w-3.5 h-3.5" /> : gate}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="w-4 h-0.5 bg-[#334155]" />
                      </div>
                    </div>

                    {/* Separate Outputs Banner */}
                    <div className="p-3 bg-[#132238] rounded-xl border border-[#243B55] flex items-center justify-around text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[#94A3B8]">q0 result:</span>
                        <strong className="text-[#22D3EE] text-sm">
                          {step5Q0Result !== null ? step5Q0Result : '—'}
                        </strong>
                      </div>
                      <div className="w-px h-5 bg-[#243B55]" />
                      <div className="flex items-center gap-2">
                        <span className="text-[#94A3B8]">q1 result:</span>
                        <strong className="text-indigo-300 text-sm">
                          {step5Q1Result !== null ? step5Q1Result : '—'}
                        </strong>
                      </div>
                    </div>

                    {/* Guidance */}
                    <div className="text-xs font-mono text-[#CBD5E1] p-2.5 rounded-lg bg-[#132238]/60 border border-[#243B55]">
                      {getStep5Feedback()}
                    </div>

                  </div>

                  {/* Builder Controls for Active Wire */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <button
                        id="circuit-step5-add-x"
                        type="button"
                        onClick={() => handleStep5AddGate('X')}
                        disabled={step5IsRunning}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-blue-950/40 border border-blue-500/40 text-blue-200 font-mono font-bold text-sm transition-all cursor-pointer"
                      >
                        [ X ]
                      </button>

                      <button
                        id="circuit-step5-add-h"
                        type="button"
                        onClick={() => handleStep5AddGate('H')}
                        disabled={step5IsRunning}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-purple-950/40 border border-purple-500/40 text-purple-200 font-mono font-bold text-sm transition-all cursor-pointer"
                      >
                        [ H ]
                      </button>

                      <button
                        id="circuit-step5-add-m"
                        type="button"
                        onClick={() => handleStep5AddGate('M')}
                        disabled={step5IsRunning}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-cyan-950/40 border border-[#22D3EE]/40 text-[#67E8F9] font-mono font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>[ MEASURE ]</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        id="circuit-step5-clear-wire"
                        type="button"
                        onClick={handleStep5ClearActiveWire}
                        disabled={step5IsRunning}
                        className="py-3 px-3 rounded-xl bg-[#0D1B2A] hover:bg-[#16273c] border border-[#243B55] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer"
                      >
                        CLEAR {step5ActiveWire.toUpperCase()}
                      </button>

                      <button
                        id="circuit-step5-clear-all"
                        type="button"
                        onClick={handleStep5ClearAll}
                        disabled={step5IsRunning}
                        className="py-3 px-3 rounded-xl bg-[#0D1B2A] hover:bg-[#16273c] border border-[#243B55] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer"
                      >
                        CLEAR ALL
                      </button>

                      <button
                        id="circuit-step5-run"
                        type="button"
                        onClick={handleStep5RunCircuit}
                        disabled={step5IsRunning || !isStep5TargetMatched}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4F7CFF]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Play className={`w-4 h-4 fill-current ${step5IsRunning ? 'animate-pulse' : ''}`} />
                        <span>{step5IsRunning ? 'RUNNING BOTH WIRES...' : 'RUN CIRCUIT'}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Explanation for Two-Qubit Execution */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Two-Qubit Circuit
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  What is happening to each qubit?
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                
                {/* q0 breakdown */}
                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#22D3EE] font-bold">First Qubit (q0)</span>
                    <span className="text-[#94A3B8]">|0⟩ → H → M</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white">
                    q0 is changed by <strong className="text-purple-300">H</strong> into an equal superposition, then measured (yielding 0 or 1).
                  </p>
                </div>

                {/* q1 breakdown */}
                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-300 font-bold">Second Qubit (q1)</span>
                    <span className="text-[#94A3B8]">|0⟩ → X → M</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white">
                    q1 is changed by <strong className="text-blue-300">X</strong> from |0⟩ to |1⟩, then measured (yielding 1).
                  </p>
                </div>

                {step5RunStage === 'done' && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 font-semibold animate-in fade-in">
                    ✓ Notice the outputs are tracked independently: q0 result is {step5Q0Result} and q1 result is {step5Q1Result}.
                  </div>
                )}

              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={8}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 6: SAME CIRCUIT, INDEPENDENT QUBITS
            ===================================================================== */}
        {currentStep === 6 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Independent Wires Highlighting */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      INDEPENDENT TIMELINES
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                      No Cross-Talk
                    </span>
                  </div>

                  {/* Visual representation with selective highlights */}
                  <div className="p-6 bg-[#0D1B2A] border border-[#243B55] rounded-2xl space-y-4">
                    
                    {/* Wire q0 */}
                    <div className={`relative flex items-center py-4 px-4 rounded-xl border transition-all duration-300 ${
                      step6InspectionFocus === 'q0' || step6InspectionFocus === 'all'
                        ? 'bg-[#132238] border-[#22D3EE]/60 ring-2 ring-[#22D3EE]/20'
                        : 'bg-[#132238]/30 border-[#243B55] opacity-35'
                    }`}>
                      <div className="absolute inset-x-8 h-0.5 bg-[#334155] -z-0" />
                      
                      <div className="flex items-center justify-between w-full z-10">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-xs font-bold text-[#94A3B8]">q0:</span>
                          <span className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-bold">
                            |0⟩
                          </span>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-400 text-purple-200 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                            H
                          </div>
                          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-[#22D3EE] text-[#67E8F9] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                            <Radio className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <span className="text-xs font-mono text-[#22D3EE]">Independent</span>
                      </div>
                    </div>

                    {/* Wire q1 */}
                    <div className={`relative flex items-center py-4 px-4 rounded-xl border transition-all duration-300 ${
                      step6InspectionFocus === 'q1' || step6InspectionFocus === 'all'
                        ? 'bg-[#132238] border-indigo-400/60 ring-2 ring-indigo-400/20'
                        : 'bg-[#132238]/30 border-[#243B55] opacity-35'
                    }`}>
                      <div className="absolute inset-x-8 h-0.5 bg-[#334155] -z-0" />
                      
                      <div className="flex items-center justify-between w-full z-10">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-xs font-bold text-[#94A3B8]">q1:</span>
                          <span className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-indigo-400/40 text-indigo-300 text-xs font-bold">
                            |0⟩
                          </span>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-400 text-blue-200 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                            X
                          </div>
                          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-[#22D3EE] text-[#67E8F9] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                            <Radio className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <span className="text-xs font-mono text-indigo-300">Independent</span>
                      </div>
                    </div>

                  </div>

                  {/* Focus Toggle Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      id="circuit-step6-focus-all"
                      type="button"
                      onClick={() => setStep6InspectionFocus('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        step6InspectionFocus === 'all'
                          ? 'bg-[#132238] text-white border border-[#4F7CFF]/50 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Inspect All
                    </button>
                    <button
                      id="circuit-step6-focus-q0"
                      type="button"
                      onClick={() => setStep6InspectionFocus('q0')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        step6InspectionFocus === 'q0'
                          ? 'bg-[#132238] text-[#22D3EE] border border-[#22D3EE]/50 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Highlight q0
                    </button>
                    <button
                      id="circuit-step6-focus-q1"
                      type="button"
                      onClick={() => setStep6InspectionFocus('q1')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        step6InspectionFocus === 'q1'
                          ? 'bg-[#132238] text-indigo-300 border border-indigo-500/50 shadow-xs'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Highlight q1
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Core Understanding */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Core Concept
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Same circuit, independent qubits
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  Both qubits are part of the <strong className="text-white">same quantum circuit</strong>.
                </p>

                <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                  <p className="font-semibold text-white">
                    But in this example, they are being changed independently.
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    The H gate on q0 does not affect q1. The X gate on q1 does not affect q0.
                  </p>
                </div>

                {/* Teaser */}
                <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-indigo-500/30 text-xs sm:text-sm text-indigo-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <span>Coming Soon:</span>
                  </div>
                  <p>
                    Later, you’ll learn gates that allow qubits to interact with each other.
                  </p>
                </div>

              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={8}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 7: HOW TO READ A BASIC QUANTUM CIRCUIT
            ===================================================================== */}
        {currentStep === 7 && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
            
            {/* LEFT (~55%): Interactive Circuit Anatomy */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="relative w-full max-w-lg flex flex-col items-center">
                
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
                  }}
                />

                <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                      VISUAL ANATOMY
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                      Reading Guide
                    </span>
                  </div>

                  {/* Diagram with highlightable sections */}
                  <div className="p-6 bg-[#0D1B2A] border border-[#243B55] rounded-2xl space-y-5">
                    
                    {/* The Annotated Circuit */}
                    <div className="relative flex items-center py-6 px-4 bg-[#132238] rounded-xl border border-[#243B55] overflow-hidden">
                      
                      {/* Wire line */}
                      <div className={`absolute inset-x-8 h-0.5 transition-all ${
                        step7ActiveElement === 'wire' ? 'bg-[#22D3EE] h-1 shadow-lg shadow-[#22D3EE]/50' : 'bg-[#334155]'
                      }`} />

                      <div className="flex items-center justify-between w-full z-10">
                        {/* 1. Starting state |0⟩ */}
                        <div 
                          onClick={() => setStep7ActiveElement('init')}
                          className={`flex items-center gap-2 font-mono p-1 rounded-lg transition-all cursor-pointer ${
                            step7ActiveElement === 'init' ? 'ring-2 ring-[#22D3EE] scale-110 bg-[#0D1B2A]' : ''
                          }`}
                        >
                          <span className="text-xs font-bold text-[#94A3B8]">q0:</span>
                          <span className="px-2.5 py-1 rounded-lg bg-[#0D1B2A] border border-[#22D3EE]/50 text-[#22D3EE] text-xs font-black shadow-xs">
                            |0⟩
                          </span>
                        </div>

                        {/* 2. Quantum Gates X & H */}
                        <div 
                          onClick={() => setStep7ActiveElement('gates')}
                          className={`flex items-center gap-4 p-1 rounded-lg transition-all cursor-pointer ${
                            step7ActiveElement === 'gates' ? 'ring-2 ring-purple-400 scale-105 bg-[#0D1B2A]/70' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-400 text-blue-200 font-mono font-bold text-xs flex items-center justify-center">
                            X
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-400 text-purple-200 font-mono font-bold text-xs flex items-center justify-center">
                            H
                          </div>
                        </div>

                        {/* 3. Measurement M */}
                        <div 
                          onClick={() => setStep7ActiveElement('measure')}
                          className={`p-1 rounded-lg transition-all cursor-pointer ${
                            step7ActiveElement === 'measure' ? 'ring-2 ring-[#22D3EE] scale-110 bg-[#0D1B2A]' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-[#22D3EE] text-[#67E8F9] font-mono font-bold text-xs flex items-center justify-center">
                            <Radio className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="w-4 h-0.5 bg-[#334155]" />
                      </div>

                    </div>

                    {/* Timeline Left to Right Arrow */}
                    <div 
                      onClick={() => setStep7ActiveElement('arrow')}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono cursor-pointer transition-all ${
                        step7ActiveElement === 'arrow'
                          ? 'bg-[#132238] border-[#22D3EE] ring-2 ring-[#22D3EE]/30 text-white'
                          : 'bg-[#132238]/60 border-[#243B55] text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-bold">LEFT → RIGHT</span>
                      <div className="flex-1 mx-4 flex items-center">
                        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#22D3EE] to-[#4F7CFF]" />
                        <ArrowRight className="w-4 h-4 text-[#4F7CFF] -ml-1" />
                      </div>
                      <span className="text-[#22D3EE] font-bold">Order of Operations</span>
                    </div>

                    {/* Active anatomy feedback card */}
                    <div className="p-3.5 rounded-xl bg-[#132238] border border-[#243B55] text-xs font-mono space-y-1">
                      {step7ActiveElement === 'wire' && (
                        <p className="text-white">
                          <strong className="text-[#22D3EE]">Horizontal line:</strong> Represents one qubit wire progressing forward in time.
                        </p>
                      )}
                      {step7ActiveElement === 'init' && (
                        <p className="text-white">
                          <strong className="text-[#22D3EE]">|0⟩ on the left:</strong> Represents the starting state of the qubit prior to operations.
                        </p>
                      )}
                      {step7ActiveElement === 'gates' && (
                        <p className="text-white">
                          <strong className="text-purple-300">X & H (Boxes):</strong> Represent quantum gates that transform the state sequentially.
                        </p>
                      )}
                      {step7ActiveElement === 'measure' && (
                        <p className="text-white">
                          <strong className="text-[#67E8F9]">M (Meter Box):</strong> Measurement operation that extracts a classical 0 or 1.
                        </p>
                      )}
                      {step7ActiveElement === 'arrow' && (
                        <p className="text-white">
                          <strong className="text-[#22D3EE]">Left to Right:</strong> Operations are strictly applied in chronological order.
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Element selector tabs */}
                  <div className="grid grid-cols-5 gap-1.5 text-[11px] font-mono">
                    {[
                      { key: 'wire', label: 'Wire' },
                      { key: 'init', label: '|0⟩' },
                      { key: 'gates', label: 'Gates' },
                      { key: 'measure', label: 'Measure' },
                      { key: 'arrow', label: 'Order' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setStep7ActiveElement(item.key as any)}
                        className={`py-1.5 rounded-lg border transition-all cursor-pointer text-center ${
                          step7ActiveElement === item.key
                            ? 'bg-[#0D1B2A] border-[#22D3EE] text-[#22D3EE] font-bold'
                            : 'bg-[#0D1B2A]/40 border-[#243B55] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT (~45%): Compact Reference Guide */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/25">
                  Visual Guide
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  How to read a basic quantum circuit
                </h2>
              </div>

              {/* Compact Guide Reference */}
              <div className="w-full space-y-2 text-xs sm:text-sm font-mono">
                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <span className="text-white font-bold">Horizontal line</span>
                  <span className="text-[#22D3EE]">→ one qubit</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <span className="text-white font-bold">|0⟩</span>
                  <span className="text-[#22D3EE]">→ starting state</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <span className="text-white font-bold">X / H</span>
                  <span className="text-purple-300">→ quantum gates</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <span className="text-white font-bold">M</span>
                  <span className="text-[#67E8F9]">→ measurement</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55] flex items-center justify-between">
                  <span className="text-white font-bold">Left → Right</span>
                  <span className="text-indigo-300">→ operation order</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                “A circuit may contain one qubit or many qubits, and one gate or many gates.”
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={8}
                  canContinue={canContinueCurrent}
                  onBack={handleBack}
                  onContinue={handleContinue}
                />
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 8: FINAL SUMMARY SCREEN
            ===================================================================== */}
        {currentStep === 8 && (
          <QuantumCircuitSummaryScreen
            onNextLesson={onComplete}
            onBackToPath={onExit}
            onBack={handleBack}
          />
        )}

      </div>
    </LessonShell>
  );
};
