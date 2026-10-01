import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { BeginnerCompletionScreen } from '../components/fullscreen-lesson/BeginnerCompletionScreen';
import { 
  ArrowRight, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Sparkles, 
  Info, 
  RefreshCw, 
  HelpCircle,
  Terminal,
  Cpu,
  Radio,
  Layers,
  Code2,
  Trash2,
  Undo2,
  AlertCircle,
  Lightbulb,
  Check,
  ChevronRight,
  HelpCircle as QuestionIcon
} from 'lucide-react';

interface BeginnerChallengeViewProps {
  onExit: () => void;
  onComplete: () => void;
  onNavigateToLab?: () => void;
  onReviewLesson?: (lessonId: string) => void;
  onContinueToIntermediate?: () => void;
}

type GateType = 'X' | 'H' | 'M';

export const BeginnerChallengeView: React.FC<BeginnerChallengeViewProps> = ({
  onExit,
  onComplete,
  onNavigateToLab,
  onReviewLesson,
  onContinueToIntermediate,
}) => {
  // Current challenge: 1 to 6, with stage 7 being the final Completion Screen
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);

  // =========================================================================
  // CHALLENGE 1 STATE: Make output 1
  // =========================================================================
  const [c1Circuit, setC1Circuit] = useState<GateType[]>([]);
  const [c1HasRun, setC1HasRun] = useState<boolean>(false);
  const [c1Result, setC1Result] = useState<0 | 1 | null>(null);
  const [c1Attempts, setC1Attempts] = useState<number>(0);
  const [c1ShowExplanation, setC1ShowExplanation] = useState<boolean>(false);

  // =========================================================================
  // CHALLENGE 2 STATE: Create approximately 50/50 (100 shots)
  // =========================================================================
  const [c2Circuit, setC2Circuit] = useState<GateType[]>([]);
  const [c2HasRun, setC2HasRun] = useState<boolean>(false);
  const [c2Counts, setC2Counts] = useState<{ zero: number; one: number } | null>(null);
  const [c2Attempts, setC2Attempts] = useState<number>(0);
  const [c2ShowExplanation, setC2ShowExplanation] = useState<boolean>(false);

  // =========================================================================
  // CHALLENGE 3 STATE: Read the circuit
  // Circuit: |0> -- X -- H -- M
  // =========================================================================
  const [c3AnswerQ1, setC3AnswerQ1] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [c3AnswerQ2, setC3AnswerQ2] = useState<'left_to_right' | 'right_to_left' | null>(null);
  const [c3IsAnimated, setC3IsAnimated] = useState<boolean>(false);

  // =========================================================================
  // CHALLENGE 4 STATE: Measurement vs Shot
  // =========================================================================
  const [c4AnswerSame, setC4AnswerSame] = useState<'yes' | 'no' | null>(null);
  const [c4AnswerEstimate, setC4AnswerEstimate] = useState<'one' | 'many' | null>(null);

  // =========================================================================
  // CHALLENGE 5 STATE: Qiskit mini mission
  // Target: |0> -- H -- M (100 shots)
  // =========================================================================
  const [c5Circuit, setC5Circuit] = useState<GateType[]>([]);
  const [c5Shots, setC5Shots] = useState<number>(100);
  const [c5HasRun, setC5HasRun] = useState<boolean>(false);
  const [c5Counts, setC5Counts] = useState<{ zero: number; one: number } | null>(null);
  const [c5RoleAnswer, setC5RoleAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  // =========================================================================
  // CHALLENGE 6 STATE: Quick concept check (5 questions)
  // =========================================================================
  const [c6Answers, setC6Answers] = useState<{
    q1: string | null;
    q2: string | null;
    q3: string | null;
    q4: string | null;
    q5: string | null;
  }>({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
  });

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Simulation Helper for Challenge 1 & 2
  const runSingleShotSimulation = (circuit: GateType[]): 0 | 1 => {
    let state: 0 | 1 | 'superposition' = 0;
    for (const g of circuit) {
      if (g === 'M') break;
      if (g === 'X') {
        state = state === 0 ? 1 : state === 1 ? 0 : 'superposition';
      } else if (g === 'H') {
        state = 'superposition';
      }
    }
    if (state === 0) return 0;
    if (state === 1) return 1;
    return Math.random() < 0.5 ? 0 : 1;
  };

  const runMultiShotSimulation = (circuit: GateType[], shots: number): { zero: number; one: number } => {
    let a_real = 1.0;
    let a_imag = 0.0;
    let b_real = 0.0;
    let b_imag = 0.0;

    for (const g of circuit) {
      if (g === 'M') break;
      if (g === 'X') {
        const tr = a_real;
        const ti = a_imag;
        a_real = b_real;
        a_imag = b_imag;
        b_real = tr;
        b_imag = ti;
      } else if (g === 'H') {
        const invSqrt2 = 1 / Math.SQRT2;
        const nAR = invSqrt2 * (a_real + b_real);
        const nAI = invSqrt2 * (a_imag + b_imag);
        const nBR = invSqrt2 * (a_real - b_real);
        const nBI = invSqrt2 * (a_imag - b_imag);
        a_real = nAR;
        a_imag = nAI;
        b_real = nBR;
        b_imag = nBI;
      }
    }

    const prob0 = a_real * a_real + a_imag * a_imag;
    let c0 = 0;
    let c1 = 0;
    for (let i = 0; i < shots; i++) {
      if (Math.random() < prob0) c0++;
      else c1++;
    }
    return { zero: c0, one: c1 };
  };

  // Step 1: Run Challenge 1
  const handleRunC1 = () => {
    setC1Attempts(prev => prev + 1);
    const res = runSingleShotSimulation(c1Circuit);
    setC1Result(res);
    setC1HasRun(true);
  };

  // Step 2: Run Challenge 2
  const handleRunC2 = () => {
    setC2Attempts(prev => prev + 1);
    const counts = runMultiShotSimulation(c2Circuit, 100);
    setC2Counts(counts);
    setC2HasRun(true);
  };

  // Step 5: Run Challenge 5
  const handleRunC5 = () => {
    const counts = runMultiShotSimulation(c5Circuit, c5Shots);
    setC5Counts(counts);
    setC5HasRun(true);
  };

  // Step navigation
  const handleContinue = () => {
    if (currentStep < 7) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > maxUnlockedStep) {
        setMaxUnlockedStep(next);
      }
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectStep = (step: number) => {
    if (step <= maxUnlockedStep) {
      setCurrentStep(step);
    }
  };

  // Can Continue validation for each challenge
  const canContinueCurrent = (() => {
    switch (currentStep) {
      case 1:
        return c1HasRun && c1Circuit.length === 2 && c1Circuit[0] === 'X' && c1Circuit[1] === 'M';
      case 2:
        return (
          c2HasRun &&
          c2Circuit.length === 2 &&
          c2Circuit[0] === 'H' &&
          c2Circuit[1] === 'M' &&
          c2Counts !== null &&
          c2Counts.zero >= 30 &&
          c2Counts.zero <= 70
        );
      case 3:
        return c3AnswerQ1 === 'B' && c3AnswerQ2 === 'left_to_right';
      case 4:
        return c4AnswerSame === 'no' && c4AnswerEstimate === 'many';
      case 5:
        return (
          c5HasRun &&
          c5Circuit.length === 2 &&
          c5Circuit[0] === 'H' &&
          c5Circuit[1] === 'M' &&
          c5RoleAnswer === 'B'
        );
      case 6:
        return (
          c6Answers.q1 === '0_or_1' &&
          c6Answers.q2 === 'how_likely' &&
          c6Answers.q3 === 'changes_state' &&
          c6Answers.q4 === 'classical_result' &&
          c6Answers.q5 === 'complete_run'
        );
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
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 py-3 sm:py-5 px-3 sm:px-6">
        
        {/* Challenge Header Progress Banner */}
        {currentStep <= 6 && (
          <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-[#0D1B2A]/90 border border-[#243B55] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#22D3EE] font-bold uppercase tracking-wider">
                Beginner Challenge:
              </span>
              <span className="text-white font-bold">
                Stage {currentStep} of 6
              </span>
            </div>

            {/* Visual Dot Stepper */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleSelectStep(st)}
                  disabled={st > maxUnlockedStep}
                  className={`w-3 h-3 rounded-full transition-all ${
                    st === currentStep
                      ? 'bg-[#22D3EE] ring-4 ring-[#22D3EE]/20 scale-110'
                      : st < currentStep
                      ? 'bg-emerald-400 cursor-pointer'
                      : 'bg-[#243B55] cursor-not-allowed'
                  }`}
                  title={`Stage ${st}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            CHALLENGE 1: MAKE THE OUTPUT 1
            ===================================================================== */}
        {currentStep === 1 && (
          <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-auto py-4">
            
            {/* LEFT (~55%): Build & Run */}
            <div className="w-full lg:w-[55%] flex flex-col justify-between bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  CIRCUIT BUILDER
                </span>
                <span className="text-xs font-mono text-[#22D3EE]">
                  Target Output: 1
                </span>
              </div>

              {/* Wire Display */}
              <div className="py-7 px-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center min-h-[120px]">
                <div className="flex items-center gap-2 sm:gap-3 font-mono text-sm">
                  <span className="text-[#94A3B8]">q0:</span>
                  <span className="text-[#22D3EE] font-bold">|0⟩</span>
                  <span className="w-8 h-0.5 bg-[#4F7CFF]"></span>

                  {c1Circuit.map((g, idx) => (
                    <React.Fragment key={idx}>
                      {g === 'X' && (
                        <span className="px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-400/50 text-[#22D3EE] font-bold animate-in zoom-in-90">
                          X
                        </span>
                      )}
                      {g === 'H' && (
                        <span className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/50 text-purple-300 font-bold animate-in zoom-in-90">
                          H
                        </span>
                      )}
                      {g === 'M' && (
                        <span className="px-3 py-1.5 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1 animate-in zoom-in-90">
                          <Radio className="w-3.5 h-3.5 text-[#22D3EE]" /> M
                        </span>
                      )}
                      <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                    </React.Fragment>
                  ))}

                  {c1Circuit.length === 0 && (
                    <span className="text-xs text-[#94A3B8] italic font-sans">
                      Wire empty. Choose a gate to add.
                    </span>
                  )}
                </div>
              </div>

              {/* Gate Controls */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1]">
                  Add Gate or Measurement:
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    id="c1-gate-x-btn"
                    type="button"
                    onClick={() => {
                      if (!c1Circuit.includes('M') && c1Circuit.length < 3) {
                        setC1Circuit([...c1Circuit, 'X']);
                        setC1HasRun(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-400/40 text-[#22D3EE] font-bold text-xs cursor-pointer transition-all active:scale-95"
                  >
                    + X (Bit Flip)
                  </button>

                  <button
                    id="c1-gate-h-btn"
                    type="button"
                    onClick={() => {
                      if (!c1Circuit.includes('M') && c1Circuit.length < 3) {
                        setC1Circuit([...c1Circuit, 'H']);
                        setC1HasRun(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-400/40 text-purple-300 font-bold text-xs cursor-pointer transition-all active:scale-95"
                  >
                    + H (Superposition)
                  </button>

                  <button
                    id="c1-gate-m-btn"
                    type="button"
                    onClick={() => {
                      if (!c1Circuit.includes('M') && c1Circuit.length > 0) {
                        setC1Circuit([...c1Circuit, 'M']);
                        setC1HasRun(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#1f3654] hover:bg-[#28486f] border border-white/40 text-white font-bold text-xs cursor-pointer transition-all active:scale-95"
                  >
                    + MEASURE
                  </button>

                  <button
                    id="c1-clear-btn"
                    type="button"
                    onClick={() => {
                      setC1Circuit([]);
                      setC1HasRun(false);
                      setC1Result(null);
                    }}
                    className="ml-auto px-3 py-2 rounded-xl bg-[#0D1B2A] hover:bg-[#132238] border border-[#243B55] text-[#94A3B8] hover:text-white text-xs cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              {/* Action: RUN */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  id="c1-run-btn"
                  type="button"
                  disabled={!c1Circuit.includes('M')}
                  onClick={handleRunC1}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    c1Circuit.includes('M')
                      ? 'bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white shadow-lg shadow-[#4F7CFF]/25'
                      : 'bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55] cursor-not-allowed opacity-60'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN CIRCUIT</span>
                </button>
              </div>

            </div>

            {/* RIGHT (~45%): Goal & Feedback */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                  Mission 1 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Starting from |0⟩, make the measured output 1.
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Build a circuit that deterministically flips the initial state into |1⟩ before measurement.
                </p>
              </div>

              {/* Dynamic Feedback Card */}
              {c1HasRun ? (
                <div className={`p-5 rounded-2xl border space-y-3 animate-in fade-in duration-300 ${
                  c1Result === 1 && c1Circuit.includes('X') && !c1Circuit.includes('H')
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-amber-950/30 border-amber-500/40'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1]">
                      Execution Result
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      c1Result === 1 && c1Circuit.includes('X') && !c1Circuit.includes('H')
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      Output: {c1Result}
                    </span>
                  </div>

                  {/* Flow visualization */}
                  <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] font-mono text-xs text-[#CBD5E1] flex items-center justify-center gap-2">
                    <span>|0⟩</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    {c1Circuit.includes('X') && <span className="text-[#22D3EE] font-bold">[X] → |1⟩</span>}
                    {c1Circuit.includes('H') && <span className="text-purple-300 font-bold">[H] → Superposition</span>}
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span>[M]</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span className="text-white font-bold text-sm">{c1Result}</span>
                  </div>

                  {c1Result === 1 && c1Circuit.includes('X') && !c1Circuit.includes('H') ? (
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                        ✨ Nice! X changed |0⟩ into |1⟩ before measurement.
                      </p>
                      <p className="text-xs text-[#CBD5E1]">
                        Because the state became |1⟩, measuring it deterministically yields classical 1.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-amber-200 font-medium">
                        {c1Circuit.includes('H')
                          ? 'H creates a superposition (50% 0, 50% 1), so it does not guarantee output 1.'
                          : 'Not quite output 1.'}
                      </p>
                      <p className="text-xs text-[#CBD5E1]">
                        Try using the gate that flips a bit directly: from |0⟩ to |1⟩.
                      </p>
                      {c1Attempts >= 2 && !c1ShowExplanation && (
                        <button
                          type="button"
                          onClick={() => setC1ShowExplanation(true)}
                          className="text-xs font-mono text-[#22D3EE] hover:underline cursor-pointer"
                        >
                          Need a hint? Show explanation
                        </button>
                      )}
                      {c1ShowExplanation && (
                        <div className="p-2.5 rounded-lg bg-[#08111F] text-[11px] text-[#94A3B8]">
                          Hint: Build <code className="text-[#22D3EE]">|0⟩ → X → MEASURE</code>.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2 text-xs text-[#CBD5E1]">
                  <span className="text-[#22D3EE] font-bold block font-mono uppercase text-[11px]">Instructions</span>
                  <p>1. Add a gate that converts |0⟩ into |1⟩.</p>
                  <p>2. Add MEASURE at the end.</p>
                  <p>3. Click RUN to execute your circuit.</p>
                </div>
              )}

              {/* Nav Controls */}
              <div className="pt-2">
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
            CHALLENGE 2: CREATE APPROXIMATELY 50/50
            ===================================================================== */}
        {currentStep === 2 && (
          <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-auto py-4">
            
            {/* LEFT (~55%): Builder & Histogram */}
            <div className="w-full lg:w-[55%] flex flex-col justify-between bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  CIRCUIT BUILDER (100 SHOTS)
                </span>
                <span className="text-xs font-mono text-purple-300">
                  Target: ~50% 0 & ~50% 1
                </span>
              </div>

              {/* Wire Display */}
              <div className="py-7 px-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center min-h-[110px]">
                <div className="flex items-center gap-2 sm:gap-3 font-mono text-sm">
                  <span className="text-[#94A3B8]">q0:</span>
                  <span className="text-[#22D3EE] font-bold">|0⟩</span>
                  <span className="w-8 h-0.5 bg-[#4F7CFF]"></span>

                  {c2Circuit.map((g, idx) => (
                    <React.Fragment key={idx}>
                      {g === 'X' && (
                        <span className="px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-400/50 text-[#22D3EE] font-bold animate-in zoom-in-90">
                          X
                        </span>
                      )}
                      {g === 'H' && (
                        <span className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/50 text-purple-300 font-bold animate-in zoom-in-90">
                          H
                        </span>
                      )}
                      {g === 'M' && (
                        <span className="px-3 py-1.5 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1 animate-in zoom-in-90">
                          <Radio className="w-3.5 h-3.5 text-[#22D3EE]" /> M
                        </span>
                      )}
                      <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                    </React.Fragment>
                  ))}

                  {c2Circuit.length === 0 && (
                    <span className="text-xs text-[#94A3B8] italic font-sans">
                      Click a gate below to begin.
                    </span>
                  )}
                </div>
              </div>

              {/* Gate Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="c2-gate-h-btn"
                  type="button"
                  onClick={() => {
                    if (!c2Circuit.includes('M')) {
                      setC2Circuit([...c2Circuit, 'H']);
                      setC2HasRun(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-400/40 text-purple-300 font-bold text-xs cursor-pointer transition-all active:scale-95"
                >
                  + H (Hadamard)
                </button>

                <button
                  id="c2-gate-x-btn"
                  type="button"
                  onClick={() => {
                    if (!c2Circuit.includes('M')) {
                      setC2Circuit([...c2Circuit, 'X']);
                      setC2HasRun(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-400/40 text-[#22D3EE] font-bold text-xs cursor-pointer transition-all active:scale-95"
                >
                  + X (Bit Flip)
                </button>

                <button
                  id="c2-gate-m-btn"
                  type="button"
                  onClick={() => {
                    if (!c2Circuit.includes('M') && c2Circuit.length > 0) {
                      setC2Circuit([...c2Circuit, 'M']);
                      setC2HasRun(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1f3654] hover:bg-[#28486f] border border-white/40 text-white font-bold text-xs cursor-pointer transition-all active:scale-95"
                >
                  + MEASURE
                </button>

                <button
                  id="c2-clear-btn"
                  type="button"
                  onClick={() => {
                    setC2Circuit([]);
                    setC2HasRun(false);
                    setC2Counts(null);
                  }}
                  className="ml-auto px-3 py-1.5 rounded-xl bg-[#0D1B2A] hover:bg-[#132238] border border-[#243B55] text-[#94A3B8] hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {/* Results & Histogram if run */}
              {c2Counts && (
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#94A3B8]">Counts (100 shots):</span>
                    <span className="text-white font-bold">0 → {c2Counts.zero} | 1 → {c2Counts.one}</span>
                  </div>

                  {/* Visual Bar Histogram */}
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-[#CBD5E1] text-right font-bold">0:</span>
                      <div className="flex-1 bg-[#132238] h-4 rounded-md overflow-hidden flex">
                        <div 
                          className="bg-[#22D3EE] h-full transition-all duration-500 rounded-md"
                          style={{ width: `${c2Counts.zero}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-[#22D3EE] font-bold">{c2Counts.zero}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-4 text-[#CBD5E1] text-right font-bold">1:</span>
                      <div className="flex-1 bg-[#132238] h-4 rounded-md overflow-hidden flex">
                        <div 
                          className="bg-purple-400 h-full transition-all duration-500 rounded-md"
                          style={{ width: `${c2Counts.one}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-purple-300 font-bold">{c2Counts.one}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RUN button */}
              <button
                id="c2-run-btn"
                type="button"
                disabled={!c2Circuit.includes('M')}
                onClick={handleRunC2}
                className={`w-full py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  c2Circuit.includes('M')
                    ? 'bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white shadow-lg shadow-[#4F7CFF]/25'
                    : 'bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55] cursor-not-allowed opacity-60'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RUN (100 SHOTS)</span>
              </button>

            </div>

            {/* RIGHT (~45%): Feedback & Explanation */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                  Mission 2 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Build a circuit that gives approximately equal numbers of 0 and 1.
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Which gate creates an equal superposition where both outcomes are equally probable?
                </p>
              </div>

              {c2HasRun && c2Counts && (
                <div className={`p-5 rounded-2xl border space-y-2.5 animate-in fade-in duration-300 ${
                  c2Circuit.includes('H') && !c2Circuit.includes('X')
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-amber-950/30 border-amber-500/40'
                }`}>
                  {c2Circuit.includes('H') && !c2Circuit.includes('X') ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Great! H prepared an equal superposition.</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#CBD5E1]">
                        Across 100 shots, the results are approximately 50% 0 and 50% 1 (observed {c2Counts.zero} vs {c2Counts.one}).
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        Exact 50/50 is not required because quantum measurement is genuinely probabilistic.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-amber-200 font-medium">
                        This circuit yielded a deterministic output rather than an equal superposition.
                      </p>
                      <p className="text-xs text-[#CBD5E1]">
                        Remember: The Hadamard (<code className="text-purple-300 font-bold">H</code>) gate creates an equal superposition from |0⟩.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Nav Controls */}
              <div className="pt-2">
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
            CHALLENGE 3: READ THE CIRCUIT
            Circuit: |0> -- X -- H -- M
            ===================================================================== */}
        {currentStep === 3 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Mission 3 of 6 • Circuit Reading
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Read the Circuit
              </h2>
            </div>

            {/* The Circuit Display */}
            <div className="max-w-2xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-[#132238] border border-[#243B55] flex flex-col items-center justify-center space-y-4">
              <span className="text-xs font-mono text-[#94A3B8] uppercase">Target Circuit:</span>
              <div className="py-4 px-6 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center gap-3 font-mono text-sm">
                <span className="text-[#94A3B8]">q0:</span>
                <span className="text-[#22D3EE] font-bold">|0⟩</span>
                <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                <span className={`px-3 py-1.5 rounded-lg border font-bold ${
                  c3AnswerQ1 === 'B' ? 'bg-blue-600/40 border-blue-400 text-[#22D3EE] ring-2 ring-blue-400/40' : 'bg-blue-950/40 border-blue-400/30 text-[#22D3EE]'
                }`}>
                  X
                </span>
                <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                <span className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-400/30 text-purple-300 font-bold">
                  H
                </span>
                <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                <span className="px-3 py-1.5 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-[#22D3EE]" /> M
                </span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
              
              {/* Question 1 */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-3">
                <span className="text-xs font-mono font-bold text-[#22D3EE]">QUESTION 1:</span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  What happens first to qubit 0?
                </h3>
                <div className="space-y-2 pt-1">
                  {[
                    { key: 'A', label: 'H is applied' },
                    { key: 'B', label: 'X is applied' },
                    { key: 'C', label: 'Measurement happens' },
                    { key: 'D', label: 'The result appears' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setC3AnswerQ1(opt.key as any)}
                      className={`w-full p-3 rounded-xl border text-xs font-mono text-left flex items-center justify-between cursor-pointer transition-all ${
                        c3AnswerQ1 === opt.key
                          ? opt.key === 'B'
                            ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-amber-950/50 border-amber-400 text-amber-300 font-bold'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white hover:bg-[#152336]'
                      }`}
                    >
                      <span>{opt.key}. {opt.label}</span>
                      {c3AnswerQ1 === opt.key && opt.key === 'B' && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-3">
                <span className="text-xs font-mono font-bold text-purple-300">QUESTION 2:</span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Which direction do we read the quantum circuit?
                </h3>
                <div className="space-y-2 pt-1">
                  {[
                    { key: 'left_to_right', label: 'Left to right (along the timeline)' },
                    { key: 'right_to_left', label: 'Right to left' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setC3AnswerQ2(opt.key as any)}
                      className={`w-full p-3 rounded-xl border text-xs font-mono text-left flex items-center justify-between cursor-pointer transition-all ${
                        c3AnswerQ2 === opt.key
                          ? opt.key === 'left_to_right'
                            ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-amber-950/50 border-amber-400 text-amber-300 font-bold'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white hover:bg-[#152336]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {c3AnswerQ2 === opt.key && opt.key === 'left_to_right' && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Animated timeline breakdown if both answered correctly */}
                {c3AnswerQ1 === 'B' && c3AnswerQ2 === 'left_to_right' && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 animate-in fade-in space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Correct!
                    </p>
                    <p className="text-[11px] text-[#CBD5E1]">
                      “Quantum circuit operations are applied from left to right: |0⟩ → X → |1⟩ → H → Superposition → Measurement.”
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3 max-w-4xl mx-auto w-full">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={7}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            CHALLENGE 4: MEASUREMENT VS SHOT
            ===================================================================== */}
        {currentStep === 4 && (
          <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-auto py-4">
            
            {/* LEFT (~50%): Diagram comparison */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                SCENARIO: PREPARE ONCE, MEASURE THREE TIMES
              </span>

              {/* Repeated Measurement diagram */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2 font-mono text-xs">
                <div className="text-[#22D3EE] font-bold">1. Single Preparation, Multiple Reads:</div>
                <div className="flex items-center gap-2 text-[#CBD5E1]">
                  <span>|0⟩</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>H</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span className="text-purple-300 font-bold">Superposition</span>
                </div>
                <div className="pl-6 border-l border-[#243B55] space-y-1.5 py-1 text-[11px] text-[#CBD5E1]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#4F7CFF]">M1:</span> 
                    <span>collapses state to</span> 
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#4F7CFF]">M2:</span> 
                    <span>re-reads collapsed state →</span> 
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#4F7CFF]">M3:</span> 
                    <span>re-reads collapsed state →</span> 
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                </div>
              </div>

              {/* Shots diagram */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2 font-mono text-xs">
                <div className="text-purple-300 font-bold">2. Three Independent Shots:</div>
                <div className="space-y-1 text-[11px] text-[#CBD5E1]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8]">Shot 1:</span>
                    <span>Prepare |0⟩ → H → Measure →</span>
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8]">Shot 2:</span>
                    <span>Prepare |0⟩ → H → Measure →</span>
                    <span className="text-white font-bold">0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8]">Shot 3:</span>
                    <span>Prepare |0⟩ → H → Measure →</span>
                    <span className="text-white font-bold">1</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#08111F] text-xs text-[#94A3B8] font-mono">
                “A measurement reads the current state. A shot repeats the complete circuit from initial preparation.”
              </div>
            </div>

            {/* RIGHT (~50%): Interactive Questions */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                  Mission 4 of 6 • Core Distinction
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Measurement vs Shot
                </h2>
              </div>

              {/* Question 1: Are they the same? */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Are these three sequential measurements on a single preparation the same as three shots?
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setC4AnswerSame('yes')}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      c4AnswerSame === 'yes'
                        ? 'bg-amber-950/50 border-amber-400 text-amber-300'
                        : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    YES
                  </button>

                  <button
                    type="button"
                    onClick={() => setC4AnswerSame('no')}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      c4AnswerSame === 'no'
                        ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300'
                        : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    NO (Correct)
                  </button>
                </div>
              </div>

              {/* Question 2: Which estimates output distribution? */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Which one helps us estimate the circuit’s output distribution?
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setC4AnswerEstimate('one')}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      c4AnswerEstimate === 'one'
                        ? 'bg-amber-950/50 border-amber-400 text-amber-300'
                        : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    One measurement
                  </button>

                  <button
                    type="button"
                    onClick={() => setC4AnswerEstimate('many')}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      c4AnswerEstimate === 'many'
                        ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300'
                        : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                    }`}
                  >
                    Many shots (Correct)
                  </button>
                </div>
              </div>

              {/* Feedback if both are correct */}
              {c4AnswerSame === 'no' && c4AnswerEstimate === 'many' && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 animate-in fade-in space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Exactly!
                  </p>
                  <p className="text-[11px] text-[#CBD5E1]">
                    Because the first measurement collapses superposition, subsequent reads just echo the collapsed value. To sample the true superposition probabilities, we run multiple independent shots.
                  </p>
                </div>
              )}

              {/* Nav Controls */}
              <div className="pt-2">
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
            CHALLENGE 5: QISKIT MINI MISSION
            Target: |0> -> H -> M (100 shots)
            ===================================================================== */}
        {currentStep === 5 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Mission 5 of 6 • Qiskit Execution
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Build this experiment using Qiskit
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Goal: <code className="text-white font-mono font-bold">|0⟩ → H → Measure</code> (100 shots on simulator)
              </p>
            </div>

            {/* Split view: LEFT Circuit + Run, RIGHT Qiskit Code + Role question */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT: Builder */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    CIRCUIT WIRE
                  </span>
                  <span className="text-xs font-mono text-[#22D3EE]">
                    {c5Circuit.length}/2 gates
                  </span>
                </div>

                <div className="py-6 px-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center min-h-[100px]">
                  <div className="flex items-center gap-2 sm:gap-3 font-mono text-sm">
                    <span className="text-[#94A3B8]">q0:</span>
                    <span className="text-[#22D3EE] font-bold">|0⟩</span>
                    <span className="w-8 h-0.5 bg-[#4F7CFF]"></span>

                    {c5Circuit.map((g, idx) => (
                      <React.Fragment key={idx}>
                        {g === 'H' && (
                          <span className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/50 text-purple-300 font-bold animate-in zoom-in-90">
                            H
                          </span>
                        )}
                        {g === 'M' && (
                          <span className="px-3 py-1.5 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1 animate-in zoom-in-90">
                            <Radio className="w-3.5 h-3.5 text-[#22D3EE]" /> M
                          </span>
                        )}
                        <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                      </React.Fragment>
                    ))}

                    {c5Circuit.length === 0 && (
                      <span className="text-xs text-[#94A3B8] italic font-sans">
                        Add H and Measure below.
                      </span>
                    )}
                  </div>
                </div>

                {/* Gate controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!c5Circuit.includes('H')) {
                        setC5Circuit(['H']);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      !c5Circuit.includes('H')
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-2 ring-purple-400/30'
                        : 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    + H Gate
                  </button>

                  <button
                    type="button"
                    disabled={!c5Circuit.includes('H')}
                    onClick={() => {
                      if (c5Circuit.includes('H') && !c5Circuit.includes('M')) {
                        setC5Circuit(['H', 'M']);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      c5Circuit.includes('H') && !c5Circuit.includes('M')
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/30 cursor-pointer'
                        : c5Circuit.includes('M')
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        : 'bg-[#0D1B2A] text-[#94A3B8] border-[#243B55] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    + Measure
                  </button>
                </div>

                {/* RUN Button */}
                <button
                  type="button"
                  disabled={!c5Circuit.includes('M')}
                  onClick={handleRunC5}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    c5Circuit.includes('M')
                      ? 'bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] text-white shadow-md'
                      : 'bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN ON SIMULATOR (100 SHOTS)</span>
                </button>

                {/* Counts breakdown if run */}
                {c5Counts && (
                  <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between text-xs font-mono animate-in fade-in">
                    <span className="text-[#94A3B8]">Counts:</span>
                    <span className="text-white font-bold">0 → {c5Counts.zero} runs | 1 → {c5Counts.one} runs</span>
                  </div>
                )}
              </div>

              {/* RIGHT: Live Code & Question */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] block mb-3">
                    LIVE QISKIT PYTHON CODE:
                  </span>
                  <div className="p-4 rounded-2xl bg-[#08111F] border border-[#243B55] font-mono text-xs text-[#CBD5E1] space-y-1.5">
                    <div className="text-[#94A3B8]">qc = QuantumCircuit(1)</div>
                    {c5Circuit.includes('H') && <div className="text-purple-300">qc.h(0)</div>}
                    {c5Circuit.includes('M') && <div className="text-emerald-300">qc.measure_all()</div>}
                  </div>
                </div>

                {/* The Concept Question */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    What did Qiskit do in this experiment?
                  </h4>
                  <div className="space-y-2">
                    {[
                      { key: 'A', text: 'Qiskit became the physical quantum computer' },
                      { key: 'B', text: 'Qiskit described and ran the circuit on the simulator' },
                      { key: 'C', text: 'Qiskit changed quantum probabilities manually' },
                      { key: 'D', text: 'Qiskit stored both outputs at once permanently' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setC5RoleAnswer(opt.key as any)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-mono text-left flex items-center justify-between cursor-pointer transition-all ${
                          c5RoleAnswer === opt.key
                            ? opt.key === 'B'
                              ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 font-bold'
                              : 'bg-amber-950/50 border-amber-400 text-amber-300'
                            : 'bg-[#132238] border-[#243B55] text-[#CBD5E1] hover:text-white'
                        }`}
                      >
                        <span>{opt.key}. {opt.text}</span>
                        {c5RoleAnswer === opt.key && opt.key === 'B' && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#08111F] text-[11px] text-[#94A3B8]">
                  “Qiskit is software used to compose circuits and send them to backends.”
                </div>
              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={7}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            CHALLENGE 6: QUICK CONCEPT CHECK (5 Questions)
            ===================================================================== */}
        {currentStep === 6 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Mission 6 of 6 • Foundations Check
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Quick Concept Check
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Confirm your grasp of the 5 fundamental definitions of quantum computing.
              </p>
            </div>

            {/* 5 Card Questions */}
            <div className="max-w-3xl mx-auto w-full space-y-4">
              
              {/* Q1: Bit */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                <span className="text-[10px] font-mono text-[#22D3EE] font-bold uppercase">1. BITS</span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  A classical bit can have which logical values?
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: '0_or_1', label: '0 or 1' },
                    { id: 'any_wave', label: 'Any continuous percentage' },
                    { id: 'negative', label: 'Negative infinity' },
                  ].map((ans) => (
                    <button
                      key={ans.id}
                      type="button"
                      onClick={() => setC6Answers({ ...c6Answers, q1: ans.id })}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                        c6Answers.q1 === ans.id
                          ? ans.id === '0_or_1'
                            ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-amber-950/60 border-amber-400 text-amber-300'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                      }`}
                    >
                      {ans.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Probability */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">2. PROBABILITY</span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  What does probability tell us in quantum measurement?
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: 'how_likely', label: 'How likely an outcome is' },
                    { id: 'exact_time', label: 'The exact CPU clock cycle' },
                    { id: 'temperature', label: 'The temperature of the lab' },
                  ].map((ans) => (
                    <button
                      key={ans.id}
                      type="button"
                      onClick={() => setC6Answers({ ...c6Answers, q2: ans.id })}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                        c6Answers.q2 === ans.id
                          ? ans.id === 'how_likely'
                            ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-amber-950/60 border-amber-400 text-amber-300'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                      }`}
                    >
                      {ans.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Quantum Gate */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                <span className="text-[10px] font-mono text-[#4F7CFF] font-bold uppercase">3. QUANTUM GATES</span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  What does a quantum gate do?
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: 'changes_state', label: 'Changes or prepares a qubit’s quantum state' },
                    { id: 'prints_screen', label: 'Prints text to a terminal' },
                    { id: 'destroys_wire', label: 'Destroys the circuit wire' },
                  ].map((ans) => (
                    <button
                      key={ans.id}
                      type="button"
                      onClick={() => setC6Answers({ ...c6Answers, q3: ans.id })}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                        c6Answers.q3 === ans.id
                          ? ans.id === 'changes_state'
                            ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-amber-950/60 border-amber-400 text-amber-300'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                      }`}
                    >
                      {ans.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4: Measurement */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase">4. MEASUREMENT</span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  What does measurement give?
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: 'classical_result', label: 'A classical result such as 0 or 1' },
                    { id: 'infinite_data', label: 'Infinite information at once' },
                    { id: 'unmeasured_wave', label: 'Keeps the superposition forever intact' },
                  ].map((ans) => (
                    <button
                      key={ans.id}
                      type="button"
                      onClick={() => setC6Answers({ ...c6Answers, q4: ans.id })}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                        c6Answers.q4 === ans.id
                          ? ans.id === 'classical_result'
                            ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-amber-950/60 border-amber-400 text-amber-300'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                      }`}
                    >
                      {ans.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5: Shot */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-2">
                <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">5. SHOT</span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  What is a shot in quantum computing?
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: 'complete_run', label: 'One complete circuit run from its starting preparation to measurement' },
                    { id: 'only_measurement', label: 'Re-measuring the same collapsed qubit 100 times' },
                    { id: 'saving_file', label: 'Saving the python script to disk' },
                  ].map((ans) => (
                    <button
                      key={ans.id}
                      type="button"
                      onClick={() => setC6Answers({ ...c6Answers, q5: ans.id })}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                        c6Answers.q5 === ans.id
                          ? ans.id === 'complete_run'
                            ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-amber-950/60 border-amber-400 text-amber-300'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#CBD5E1] hover:text-white'
                      }`}
                    >
                      {ans.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3 max-w-3xl mx-auto w-full">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={7}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STAGE 7: BEGINNER LEVEL COMPLETE (Calm, rewarding capstone screen)
            ===================================================================== */}
        {currentStep === 7 && (
          <BeginnerCompletionScreen
            onExploreLab={onNavigateToLab || onExit}
            onBackToPath={onExit}
            onReviewLesson={onReviewLesson}
            onContinueToIntermediate={onContinueToIntermediate}
          />
        )}

      </div>
    </LessonShell>
  );
};
