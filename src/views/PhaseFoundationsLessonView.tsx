import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { BlochSphereVisualizer } from '../components/bloch/BlochSphereVisualizer';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Play,
  Layers,
  Scale,
  Zap,
} from 'lucide-react';

interface PhaseFoundationsLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
  onNextLesson?: () => void;
}

// Smooth continuous 3D spherical angles interpolation hook
function useAnimatedSphereAngles(
  targetTheta: number,
  targetPhi: number,
  duration: number = 850
) {
  const [theta, setTheta] = useState(targetTheta);
  const [phi, setPhi] = useState(targetPhi);
  const [isAnimating, setIsAnimating] = useState(false);

  const animRef = React.useRef<{
    startTheta: number;
    endTheta: number;
    startPhi: number;
    endPhi: number;
    startTime: number;
    rafId: number | null;
  }>({
    startTheta: targetTheta,
    endTheta: targetTheta,
    startPhi: targetPhi,
    endPhi: targetPhi,
    startTime: 0,
    rafId: null,
  });

  useEffect(() => {
    if (animRef.current.rafId !== null) {
      cancelAnimationFrame(animRef.current.rafId);
      animRef.current.rafId = null;
    }

    const startT = theta;
    const endT = targetTheta;
    const startP = phi;
    const endP = targetPhi;

    if (Math.abs(startT - endT) < 0.001 && Math.abs(startP - endP) < 0.001) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const startTime = performance.now();
    animRef.current = {
      startTheta: startT,
      endTheta: endT,
      startPhi: startP,
      endPhi: endP,
      startTime,
      rafId: null,
    };

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-in-out curve
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setTheta(startT + (endT - startT) * ease);
      setPhi(startP + (endP - startP) * ease);

      if (progress < 1) {
        animRef.current.rafId = requestAnimationFrame(tick);
      } else {
        setTheta(endT);
        setPhi(endP);
        setIsAnimating(false);
        animRef.current.rafId = null;
      }
    };

    animRef.current.rafId = requestAnimationFrame(tick);

    return () => {
      if (animRef.current.rafId !== null) {
        cancelAnimationFrame(animRef.current.rafId);
      }
    };
  }, [targetTheta, targetPhi, duration]);

  return { theta, phi, isAnimating };
}

export const PhaseFoundationsLessonView: React.FC<PhaseFoundationsLessonViewProps> = ({
  onExit,
  onComplete,
  onNextLesson,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: Fix the H-Gate Misconception
  // =========================================================================
  const [step1HApplied, setStep1HApplied] = useState(false);
  const [step1QuizAnswer, setStep1QuizAnswer] = useState<'yes' | 'no' | null>(null);
  const [step1SecondHApplied, setStep1SecondHApplied] = useState(false);

  // Angles for Step 1:
  // Initial: theta = 0 (at |0⟩)
  // After 1st H: theta = PI/2 (equal superposition on equator)
  // After 2nd H: theta = 0 (returns to |0⟩)
  const step1TargetTheta = !step1HApplied
    ? 0
    : step1SecondHApplied
    ? 0
    : Math.PI / 2;
  const { theta: step1Theta, isAnimating: step1IsAnimating } = useAnimatedSphereAngles(
    step1TargetTheta,
    0,
    900
  );

  const handleStep1ApplyH = () => {
    if (step1IsAnimating) return;
    setStep1HApplied(true);
  };

  const handleStep1AnswerQuiz = (ans: 'yes' | 'no') => {
    setStep1QuizAnswer(ans);
    if (ans === 'no') {
      setMaxUnlockedStep((prev) => Math.max(prev, 2));
    }
  };

  const handleStep1ApplySecondH = () => {
    if (step1IsAnimating) return;
    setStep1SecondHApplied(true);
    setMaxUnlockedStep((prev) => Math.max(prev, 2));
  };

  const handleStep1Reset = () => {
    setStep1HApplied(false);
    setStep1SecondHApplied(false);
    setStep1QuizAnswer(null);
  };

  // =========================================================================
  // STEP 2 STATE: Amplitude and Probability
  // =========================================================================
  const [step2StateMode, setStep2StateMode] = useState<'zero' | 'equal' | 'one'>('equal');
  const step2TargetTheta =
    step2StateMode === 'zero' ? 0 : step2StateMode === 'one' ? Math.PI : Math.PI / 2;
  const { theta: step2Theta } = useAnimatedSphereAngles(step2TargetTheta, 0, 850);

  // =========================================================================
  // STEP 3 STATE: Simple Probability Examples (A, B, C, D & Practice Check)
  // =========================================================================
  const [step3Example, setStep3Example] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [step3PracticeAnswer, setStep3PracticeAnswer] = useState<'A' | 'B' | 'C' | null>(null);

  // Theta for each example
  // A: 1|0⟩ + 0|1⟩ -> theta = 0
  // B: 0|0⟩ + 1|1⟩ -> theta = PI
  // C: (sqrt(3)/2)|0⟩ + (1/2)|1⟩ -> cos(theta/2) = sqrt(3)/2 -> theta = PI/3
  // D: (1/2)|0⟩ + (sqrt(3)/2)|1⟩ -> cos(theta/2) = 1/2 -> theta = 2*PI/3
  const step3TargetTheta =
    step3Example === 'A'
      ? 0
      : step3Example === 'B'
      ? Math.PI
      : step3Example === 'C'
      ? Math.PI / 3
      : (2 * Math.PI) / 3;

  const { theta: step3Theta } = useAnimatedSphereAngles(step3TargetTheta, 0, 800);

  const handleStep3AnswerPractice = (choice: 'A' | 'B' | 'C') => {
    setStep3PracticeAnswer(choice);
    if (choice === 'C') {
      setMaxUnlockedStep((prev) => Math.max(prev, 4));
    }
  };

  // =========================================================================
  // STEP 4 STATE: Introduce |+⟩
  // =========================================================================
  const [step4HApplied, setStep4HApplied] = useState(false);
  // Starts at |0⟩ (theta = 0), rotates to |+⟩ (theta = PI/2, phi = 0)
  const step4TargetTheta = step4HApplied ? Math.PI / 2 : 0;
  const { theta: step4Theta, isAnimating: step4IsAnimating } = useAnimatedSphereAngles(
    step4TargetTheta,
    0,
    950
  );

  const handleStep4ApplyH = () => {
    if (step4IsAnimating) return;
    setStep4HApplied(true);
    setMaxUnlockedStep((prev) => Math.max(prev, 5));
  };

  // =========================================================================
  // STEP 5 STATE: Introduce |−⟩
  // =========================================================================
  const [step5HApplied, setStep5HApplied] = useState(false);
  // Starts at |1⟩ (theta = PI, phi = PI), rotates to |−⟩ (theta = PI/2, phi = PI)
  const step5TargetTheta = step5HApplied ? Math.PI / 2 : Math.PI;
  const { theta: step5Theta, phi: step5Phi, isAnimating: step5IsAnimating } = useAnimatedSphereAngles(
    step5TargetTheta,
    Math.PI,
    950
  );

  const handleStep5ApplyH = () => {
    if (step5IsAnimating) return;
    setStep5HApplied(true);
    setMaxUnlockedStep((prev) => Math.max(prev, 6));
  };

  // =========================================================================
  // STEP 6 STATE: Compare |+⟩ and |−⟩
  // =========================================================================
  const [step6SelectedState, setStep6SelectedState] = useState<'+' | '-'>('+');
  const [step6QuizAnswer, setStep6QuizAnswer] = useState<'yes' | 'no' | null>(null);

  // Both on equator: theta = PI/2.
  // |+⟩: phi = 0. |−⟩: phi = PI.
  const step6TargetPhi = step6SelectedState === '+' ? 0 : Math.PI;
  const { phi: step6Phi, isAnimating: step6IsAnimating } = useAnimatedSphereAngles(
    Math.PI / 2,
    step6TargetPhi,
    900
  );

  const handleStep6SelectState = (st: '+' | '-') => {
    if (step6IsAnimating) return;
    setStep6SelectedState(st);
  };

  const handleStep6Quiz = (ans: 'yes' | 'no') => {
    setStep6QuizAnswer(ans);
    if (ans === 'no') {
      setMaxUnlockedStep((prev) => Math.max(prev, 7));
    }
  };

  // =========================================================================
  // STEP 7 STATE: Introduce Phase
  // =========================================================================
  const [step7ActiveState, setStep7ActiveState] = useState<'+' | '-'>('+');
  const step7TargetPhi = step7ActiveState === '+' ? 0 : Math.PI;
  const { phi: step7Phi } = useAnimatedSphereAngles(Math.PI / 2, step7TargetPhi, 850);

  // =========================================================================
  // STEP 8 STATE: Show Why Phase Matters (The H-Gate Test)
  // =========================================================================
  const [step8InputState, setStep8InputState] = useState<'+' | '-'>('+');
  const [step8GateApplied, setStep8GateApplied] = useState(false);

  // Angles:
  // If input is |+⟩: starts at (theta=PI/2, phi=0). After H: (theta=0, phi=0) -> |0⟩
  // If input is |−⟩: starts at (theta=PI/2, phi=PI). After H: (theta=PI, phi=PI) -> |1⟩
  const step8TargetTheta = !step8GateApplied
    ? Math.PI / 2
    : step8InputState === '+'
    ? 0
    : Math.PI;
  const step8TargetPhi = step8InputState === '+' ? 0 : Math.PI;

  const { theta: step8Theta, phi: step8Phi, isAnimating: step8IsAnimating } = useAnimatedSphereAngles(
    step8TargetTheta,
    step8TargetPhi,
    950
  );

  const handleStep8SetInput = (st: '+' | '-') => {
    if (step8IsAnimating) return;
    setStep8InputState(st);
    setStep8GateApplied(false);
  };

  const handleStep8ApplyH = () => {
    if (step8IsAnimating) return;
    setStep8GateApplied(true);
    setMaxUnlockedStep((prev) => Math.max(prev, 9));
  };

  // =========================================================================
  // STEP 9 STATE: Final Summary Explorer
  // =========================================================================
  const [step9InspectedState, setStep9InspectedState] = useState<'0' | '1' | '+' | '-'>('+');

  const step9TargetTheta =
    step9InspectedState === '0'
      ? 0
      : step9InspectedState === '1'
      ? Math.PI
      : Math.PI / 2;
  const step9TargetPhi = step9InspectedState === '-' ? Math.PI : 0;

  const { theta: step9Theta, phi: step9Phi } = useAnimatedSphereAngles(
    step9TargetTheta,
    step9TargetPhi,
    800
  );

  // Step names for navigation
  const stepTitles = [
    'H-Gate Misconception',
    'Amplitude & Probability',
    'Probability Examples',
    'Introduce |+⟩',
    'Introduce |−⟩',
    'Compare |+⟩ and |−⟩',
    'What is Phase?',
    'Why Phase Matters',
    'Final Summary',
  ];

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxUnlockedStep((prev) => Math.max(prev, next));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isStepComplete = (step: number) => step < currentStep || step <= maxUnlockedStep;

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={totalSteps}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={(step) => {
        if (step <= maxUnlockedStep) {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
      onExit={onExit}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col flex-1 justify-between">
        
        {/* Step Header Badge & Title */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132238] border border-[#243B55] text-xs font-mono font-bold text-[#38BDF8] mb-2 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Intermediate Track • Lesson 2: Phase Foundations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            {stepTitles[currentStep - 1]}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mt-1">
            {currentStep === 1 && 'Test whether Hadamard is really just a 50/50 button or something much deeper.'}
            {currentStep === 2 && 'Connect state amplitudes α and β directly to measurement probabilities.'}
            {currentStep === 3 && 'Square real amplitudes step-by-step through interactive worked calculations.'}
            {currentStep === 4 && 'Meet the famous |+⟩ equal superposition state created by H on |0⟩.'}
            {currentStep === 5 && 'Understand the |−⟩ state and why negative amplitudes do not mean negative probabilities.'}
            {currentStep === 6 && 'Observe two states with identical 50/50 outcomes that are completely different.'}
            {currentStep === 7 && 'Learn how relative signs encode quantum phase information.'}
            {currentStep === 8 && 'See the Hadamard gate reveal hidden phase information into measurable 0s and 1s.'}
            {currentStep === 9 && 'Synthesize key rules of quantum amplitudes, probabilities, and relative phase.'}
          </p>
        </div>

        {/* ================================================================= */}
        {/* MAIN 2-COLUMN DISPLAY: Left = Large Bloch Sphere, Right = Learning */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: Large Bloch Sphere Visualizer */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 rounded-3xl bg-[#0F172A]/60 border border-[#243B55]/70 relative shadow-2xl backdrop-blur-sm min-h-[460px]">
            
            {/* STEP 1 BLOCH SPHERE: H-Gate Misconception */}
            {currentStep === 1 && (
              <div className="w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                {/* Visual Circuit Wire Above Sphere */}
                <div className="w-full max-w-md bg-[#132238]/90 border border-[#243B55] rounded-2xl px-5 py-3 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Input</span>
                    <span className="px-2.5 py-1 rounded-md bg-[#1E293B] border border-[#334155] font-mono font-bold text-xs text-[#22D3EE]">
                      {!step1HApplied ? '|0⟩' : step1SecondHApplied ? 'Equal Superposition' : '|0⟩'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="h-0.5 w-6 bg-[#475569]"></span>
                    <span className="px-2 py-1 rounded bg-[#22D3EE]/20 border border-[#22D3EE]/50 font-mono font-extrabold text-xs text-[#22D3EE]">
                      H
                    </span>
                    <span className="h-0.5 w-6 bg-[#475569]"></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Output</span>
                    <span className="px-2.5 py-1 rounded-md bg-[#1E293B] border border-[#334155] font-mono font-bold text-xs text-[#34D399]">
                      {!step1HApplied
                        ? '|0⟩'
                        : step1SecondHApplied
                        ? '|0⟩'
                        : 'Equal Superposition'}
                    </span>
                  </div>
                </div>

                {/* Single Large Bloch Sphere */}
                <BlochSphereVisualizer
                  theta={step1Theta}
                  phi={0}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight={step1Theta < 0.1 ? '0' : 'superposition'}
                  stateLabel={step1Theta < 0.1 ? '|0⟩' : '|ψ⟩'}
                  size={320}
                  pointerAccent={step1Theta < 0.1 ? 'cyan' : 'emerald'}
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Interactive Action Control */}
                <div className="flex items-center gap-3 mt-2">
                  {!step1HApplied ? (
                    <button
                      type="button"
                      onClick={handleStep1ApplyH}
                      disabled={step1IsAnimating}
                      className="px-5 py-2.5 rounded-full bg-[#22D3EE] hover:bg-[#38BDF8] text-[#0A1128] font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-[#22D3EE]/20 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Apply H to |0⟩</span>
                    </button>
                  ) : !step1SecondHApplied && step1QuizAnswer !== null ? (
                    <button
                      type="button"
                      onClick={handleStep1ApplySecondH}
                      disabled={step1IsAnimating}
                      className="px-5 py-2.5 rounded-full bg-[#34D399] hover:bg-[#10B981] text-[#0A1128] font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-[#34D399]/20 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Apply H to Equal Superposition</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStep1Reset}
                      className="px-4 py-2 rounded-full bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Step 1</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 BLOCH SPHERE: Amplitude & Probability */}
            {currentStep === 2 && (
              <div className="w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step2Theta}
                  phi={0}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight={
                    step2StateMode === 'zero'
                      ? '0'
                      : step2StateMode === 'one'
                      ? '1'
                      : 'superposition'
                  }
                  stateLabel={
                    step2StateMode === 'zero'
                      ? '|0⟩'
                      : step2StateMode === 'one'
                      ? '|1⟩'
                      : '|ψ⟩'
                  }
                  size={320}
                  pointerAccent={
                    step2StateMode === 'zero'
                      ? 'cyan'
                      : step2StateMode === 'one'
                      ? 'purple'
                      : 'emerald'
                  }
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* State Mode Toggles */}
                <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#132238] border border-[#243B55]">
                  <button
                    type="button"
                    onClick={() => {
                      setStep2StateMode('zero');
                      setMaxUnlockedStep((prev) => Math.max(prev, 3));
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      step2StateMode === 'zero'
                        ? 'bg-[#22D3EE] text-[#0A1128] shadow'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    |0⟩ State
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep2StateMode('equal');
                      setMaxUnlockedStep((prev) => Math.max(prev, 3));
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      step2StateMode === 'equal'
                        ? 'bg-[#34D399] text-[#0A1128] shadow'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    Superposition
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep2StateMode('one');
                      setMaxUnlockedStep((prev) => Math.max(prev, 3));
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      step2StateMode === 'one'
                        ? 'bg-[#A78BFA] text-[#0A1128] shadow'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    |1⟩ State
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 BLOCH SPHERE: Simple Probability Examples */}
            {currentStep === 3 && (
              <div className="w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step3Theta}
                  phi={0}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight={
                    step3Example === 'A'
                      ? '0'
                      : step3Example === 'B'
                      ? '1'
                      : 'superposition'
                  }
                  stateLabel="|ψ⟩"
                  size={310}
                  pointerAccent={
                    step3Example === 'A'
                      ? 'cyan'
                      : step3Example === 'B'
                      ? 'purple'
                      : 'emerald'
                  }
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Example Tabs */}
                <div className="grid grid-cols-4 gap-2 w-full max-w-md">
                  {(['A', 'B', 'C', 'D'] as const).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setStep3Example(ex)}
                      className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                        step3Example === ex
                          ? 'bg-[#1E293B] border-[#38BDF8] text-[#38BDF8] shadow-md'
                          : 'bg-[#132238]/60 border-[#243B55] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Ex {ex}
                    </button>
                  ))}
                </div>

                {/* Probability Bar for current example */}
                <div className="w-full max-w-md bg-[#132238] border border-[#243B55] rounded-2xl p-3.5 shadow-inner">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#22D3EE] font-bold">
                      0: {step3Example === 'A' ? '100%' : step3Example === 'B' ? '0%' : step3Example === 'C' ? '75%' : '25%'}
                    </span>
                    <span className="text-[#A78BFA] font-bold">
                      1: {step3Example === 'A' ? '0%' : step3Example === 'B' ? '100%' : step3Example === 'C' ? '25%' : '75%'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#0A1128] rounded-full overflow-hidden flex border border-[#243B55]">
                    <div
                      className="h-full bg-[#22D3EE] transition-all duration-500"
                      style={{
                        width:
                          step3Example === 'A'
                            ? '100%'
                            : step3Example === 'B'
                            ? '0%'
                            : step3Example === 'C'
                            ? '75%'
                            : '25%',
                      }}
                    />
                    <div
                      className="h-full bg-[#A78BFA] transition-all duration-500"
                      style={{
                        width:
                          step3Example === 'A'
                            ? '0%'
                            : step3Example === 'B'
                            ? '100%'
                            : step3Example === 'C'
                            ? '25%'
                            : '75%',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 BLOCH SPHERE: Introduce |+⟩ */}
            {currentStep === 4 && (
              <div className="w-full flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step4Theta}
                  phi={0}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  showPhaseMarkers={true}
                  highlight={step4HApplied ? '+' : '0'}
                  stateLabel={step4HApplied ? '|+⟩' : '|0⟩'}
                  size={320}
                  pointerAccent={step4HApplied ? 'emerald' : 'cyan'}
                  subtleNote="Visualization only — not the physical qubit."
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStep4ApplyH}
                    disabled={step4IsAnimating}
                    className="px-5 py-2.5 rounded-full bg-[#34D399] hover:bg-[#10B981] text-[#0A1128] font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-[#34D399]/20 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{step4HApplied ? 'Applied: H|0⟩ = |+⟩' : 'Apply H to |0⟩'}</span>
                  </button>

                  {step4HApplied && (
                    <button
                      type="button"
                      onClick={() => setStep4HApplied(false)}
                      className="px-3 py-2 rounded-full bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] font-mono text-xs transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5 BLOCH SPHERE: Introduce |−⟩ */}
            {currentStep === 5 && (
              <div className="w-full flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step5Theta}
                  phi={step5Phi}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  showPhaseMarkers={true}
                  highlight={step5HApplied ? '-' : '1'}
                  stateLabel={step5HApplied ? '|−⟩' : '|1⟩'}
                  size={320}
                  pointerAccent={step5HApplied ? 'purple' : 'purple'}
                  subtleNote="Visualization only — not the physical qubit."
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStep5ApplyH}
                    disabled={step5IsAnimating}
                    className="px-5 py-2.5 rounded-full bg-[#A78BFA] hover:bg-[#C084FC] text-[#0A1128] font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-[#A78BFA]/20 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{step5HApplied ? 'Applied: H|1⟩ = |−⟩' : 'Apply H to |1⟩'}</span>
                  </button>

                  {step5HApplied && (
                    <button
                      type="button"
                      onClick={() => setStep5HApplied(false)}
                      className="px-3 py-2 rounded-full bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] font-mono text-xs transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6 BLOCH SPHERE: Compare |+⟩ and |−⟩ */}
            {currentStep === 6 && (
              <div className="w-full flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={Math.PI / 2}
                  phi={step6Phi}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  showPhaseMarkers={true}
                  highlight={step6SelectedState}
                  stateLabel={step6SelectedState === '+' ? '|+⟩' : '|−⟩'}
                  size={320}
                  pointerAccent={step6SelectedState === '+' ? 'emerald' : 'purple'}
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* State Selector along Equator */}
                <div className="flex items-center gap-3 p-1.5 rounded-full bg-[#132238] border border-[#243B55]">
                  <button
                    type="button"
                    onClick={() => handleStep6SelectState('+')}
                    disabled={step6IsAnimating}
                    className={`px-5 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      step6SelectedState === '+'
                        ? 'bg-[#34D399] text-[#0A1128] shadow-md shadow-[#34D399]/20'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    Select |+⟩ (Right)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep6SelectState('-')}
                    disabled={step6IsAnimating}
                    className={`px-5 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      step6SelectedState === '-'
                        ? 'bg-[#A78BFA] text-[#0A1128] shadow-md shadow-[#A78BFA]/20'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    Select |−⟩ (Left)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7 BLOCH SPHERE: Introduce Phase */}
            {currentStep === 7 && (
              <div className="w-full flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={Math.PI / 2}
                  phi={step7Phi}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  showPhaseMarkers={true}
                  highlight={step7ActiveState}
                  stateLabel={step7ActiveState === '+' ? '|+⟩' : '|−⟩'}
                  size={320}
                  pointerAccent={step7ActiveState === '+' ? 'emerald' : 'purple'}
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Relative Sign Switcher */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep7ActiveState('+');
                      setMaxUnlockedStep((prev) => Math.max(prev, 8));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      step7ActiveState === '+'
                        ? 'bg-[#34D399]/15 border-[#34D399] text-[#34D399]'
                        : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                    }`}
                  >
                    |+⟩ : Positive Sign (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep7ActiveState('-');
                      setMaxUnlockedStep((prev) => Math.max(prev, 8));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      step7ActiveState === '-'
                        ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA]'
                        : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                    }`}
                  >
                    |−⟩ : Negative Sign (−)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 8 BLOCH SPHERE: Why Phase Matters */}
            {currentStep === 8 && (
              <div className="w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                {/* Circuit Test Wire */}
                <div className="w-full max-w-md bg-[#132238]/90 border border-[#243B55] rounded-2xl px-5 py-3 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Input</span>
                    <span
                      className={`px-2.5 py-1 rounded-md border font-mono font-bold text-xs ${
                        step8InputState === '+'
                          ? 'bg-[#34D399]/15 border-[#34D399]/40 text-[#34D399]'
                          : 'bg-[#A78BFA]/15 border-[#A78BFA]/40 text-[#A78BFA]'
                      }`}
                    >
                      |{step8InputState}⟩
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-0.5 w-6 bg-[#475569]"></span>
                    <span className="px-2 py-1 rounded bg-[#38BDF8]/20 border border-[#38BDF8]/50 font-mono font-extrabold text-xs text-[#38BDF8]">
                      H
                    </span>
                    <span className="h-0.5 w-6 bg-[#475569]"></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Output</span>
                    <span className="px-2.5 py-1 rounded-md bg-[#1E293B] border border-[#334155] font-mono font-bold text-xs text-[#F8FAFC]">
                      {!step8GateApplied
                        ? `|${step8InputState}⟩`
                        : step8InputState === '+'
                        ? '|0⟩ (100%)'
                        : '|1⟩ (100%)'}
                    </span>
                  </div>
                </div>

                <BlochSphereVisualizer
                  theta={step8Theta}
                  phi={step8Phi}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  showPhaseMarkers={true}
                  highlight={
                    !step8GateApplied
                      ? step8InputState
                      : step8InputState === '+'
                      ? '0'
                      : '1'
                  }
                  stateLabel={
                    !step8GateApplied
                      ? `|${step8InputState}⟩`
                      : step8InputState === '+'
                      ? '|0⟩'
                      : '|1⟩'
                  }
                  size={310}
                  pointerAccent={
                    !step8GateApplied
                      ? step8InputState === '+'
                        ? 'emerald'
                        : 'purple'
                      : step8InputState === '+'
                      ? 'cyan'
                      : 'purple'
                  }
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Test State Controls & H Gate Action */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#132238] border border-[#243B55]">
                    <button
                      type="button"
                      onClick={() => handleStep8SetInput('+')}
                      disabled={step8IsAnimating}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        step8InputState === '+'
                          ? 'bg-[#34D399] text-[#0A1128]'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Input: |+⟩
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep8SetInput('-')}
                      disabled={step8IsAnimating}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        step8InputState === '-'
                          ? 'bg-[#A78BFA] text-[#0A1128]'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Input: |−⟩
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleStep8ApplyH}
                    disabled={step8IsAnimating || step8GateApplied}
                    className="px-5 py-2 rounded-full bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0A1128] font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-[#38BDF8]/20 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Apply H Gate</span>
                  </button>

                  {step8GateApplied && (
                    <button
                      type="button"
                      onClick={() => setStep8GateApplied(false)}
                      className="px-3 py-2 rounded-full bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] font-mono text-xs transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 9 BLOCH SPHERE: Final Summary */}
            {currentStep === 9 && (
              <div className="w-full flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step9Theta}
                  phi={step9Phi}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  showPhaseMarkers={true}
                  highlight={step9InspectedState}
                  stateLabel={
                    step9InspectedState === '0'
                      ? '|0⟩'
                      : step9InspectedState === '1'
                      ? '|1⟩'
                      : `|${step9InspectedState}⟩`
                  }
                  size={320}
                  pointerAccent={
                    step9InspectedState === '0'
                      ? 'cyan'
                      : step9InspectedState === '1'
                      ? 'purple'
                      : step9InspectedState === '+'
                      ? 'emerald'
                      : 'purple'
                  }
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* State selector pills */}
                <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#132238] border border-[#243B55]">
                  {(['0', '1', '+', '-'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStep9InspectedState(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        step9InspectedState === st
                          ? 'bg-[#38BDF8] text-[#0A1128] shadow'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      |{st}⟩
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Explanations, Synchronized Equations, & Interactions */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-[#0F172A]/40 border border-[#243B55]/60 shadow-xl backdrop-blur-sm space-y-6">
            
            {/* =============================================================== */}
            {/* STEP 1: H-GATE MISCONCEPTION */}
            {/* =============================================================== */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#132238]/70 border border-[#243B55]">
                  <p className="text-sm text-[#F8FAFC] leading-relaxed">
                    You already learned that <span className="font-mono font-bold text-[#22D3EE]">H</span> can turn{' '}
                    <span className="font-mono font-bold text-[#22D3EE]">|0⟩</span> into an equal superposition.
                  </p>
                  
                  {step1HApplied && (
                    <div className="mt-3 pt-3 border-t border-[#243B55] flex items-center justify-around text-xs font-mono">
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">Measurement</span>
                        <span className="text-[#22D3EE] font-bold">0 → 50%</span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">Measurement</span>
                        <span className="text-[#A78BFA] font-bold">1 → 50%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question */}
                <div className="p-4 rounded-2xl bg-[#132238]/90 border border-[#243B55]">
                  <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] mb-3">
                    Does that mean H is always a 50/50 gate?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleStep1AnswerQuiz('yes')}
                      className={`py-2.5 px-4 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        step1QuizAnswer === 'yes'
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#FCA5A5]'
                          : 'bg-[#0A1128] border-[#243B55] text-[#94A3B8] hover:border-[#475569]'
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep1AnswerQuiz('no')}
                      className={`py-2.5 px-4 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        step1QuizAnswer === 'no'
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#6EE7B7]'
                          : 'bg-[#0A1128] border-[#243B55] text-[#94A3B8] hover:border-[#475569]'
                      }`}
                    >
                      NO
                    </button>
                  </div>

                  {step1QuizAnswer === 'yes' && (
                    <div className="mt-3 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#FCA5A5] leading-relaxed">
                      A very common misconception! Click the green button on the left to apply H to an equal superposition and see what happens!
                    </div>
                  )}

                  {step1QuizAnswer === 'no' && (
                    <div className="mt-3 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#6EE7B7] leading-relaxed">
                      Correct! Now apply H to the equal superposition on the left to watch it return to |0⟩.
                    </div>
                  )}
                </div>

                {/* Demonstration Payoff */}
                {step1SecondHApplied && (
                  <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#22D3EE]/40 space-y-3 animate-in fade-in">
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      “H does not always mean 50/50.”
                    </p>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      “H changes the quantum state depending on the input state.”
                    </p>

                    <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55] text-center">
                      <div className="text-[11px] font-mono text-[#38BDF8] font-bold">
                        Key Takeaway
                      </div>
                      <div className="text-xs font-bold text-[#F8FAFC] mt-1">
                        H = state-changing gate <span className="text-[#EF4444] font-normal mx-1">NOT</span> a 50/50 button
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 2: AMPLITUDE AND PROBABILITY */}
            {/* =============================================================== */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* General State Formula */}
                <div className="p-4 rounded-2xl bg-[#132238]/90 border border-[#243B55] text-center">
                  <span className="text-[10px] font-mono text-[#94A3B8] block mb-1 uppercase tracking-wider">
                    General Quantum State
                  </span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-[#F8FAFC] tracking-wider">
                    |ψ⟩ = α|0⟩ + β|1⟩
                  </div>
                </div>

                {/* Definitions */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#38BDF8] font-bold">|ψ⟩</span>
                    <span className="text-[#94A3B8]">= current qubit state</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#22D3EE] font-bold">α</span>
                    <span className="text-[#94A3B8]">= amplitude of |0⟩</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#A78BFA] font-bold">β</span>
                    <span className="text-[#94A3B8]">= amplitude of |1⟩</span>
                  </div>
                </div>

                {/* Probability Formulas */}
                <div className="p-4 rounded-2xl bg-[#132238]/70 border border-[#243B55] space-y-3">
                  <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>The Probability Formulas</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center font-mono">
                    <div className="p-3 rounded-xl bg-[#0A1128] border border-[#334155]">
                      <span className="text-[10px] text-[#94A3B8] block">Prob(0)</span>
                      <span className="text-base font-bold text-[#22D3EE]">P(0) = |α|²</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A1128] border border-[#334155]">
                      <span className="text-[10px] text-[#94A3B8] block">Prob(1)</span>
                      <span className="text-base font-bold text-[#A78BFA]">P(1) = |β|²</span>
                    </div>
                  </div>

                  <div className="text-center font-mono text-xs text-[#34D399] font-bold pt-1">
                    |α|² + |β|² = 1 (100% total)
                  </div>
                </div>

                {/* Simple Explanations */}
                <div className="p-3.5 rounded-xl bg-[#0A1128]/80 border border-[#243B55] text-xs text-[#CBD5E1] space-y-1.5 leading-relaxed">
                  <p>• “To find the probability of measuring 0, square the magnitude of the amplitude of |0⟩.”</p>
                  <p>• “To find the probability of measuring 1, square the magnitude of the amplitude of |1⟩.”</p>
                  <p className="text-[11px] text-[#94A3B8] pt-1">
                    Amplitudes can be positive or negative numbers. We simply square them to get positive probabilities.
                  </p>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 3: SIMPLE PROBABILITY EXAMPLES & PRACTICE CHECK */}
            {/* =============================================================== */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Active Example Calculation */}
                <div className="p-4 rounded-2xl bg-[#132238]/90 border border-[#243B55] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#243B55] pb-2">
                    <span className="text-[#38BDF8] font-bold text-sm">Example {step3Example}</span>
                    <span className="text-[#94A3B8]">
                      {step3Example === 'A' && '|ψ⟩ = 1|0⟩ + 0|1⟩'}
                      {step3Example === 'B' && '|ψ⟩ = 0|0⟩ + 1|1⟩'}
                      {step3Example === 'C' && '|ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩'}
                      {step3Example === 'D' && '|ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩'}
                    </span>
                  </div>

                  {/* Step-by-step Math */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-[#0A1128] p-2.5 rounded-xl border border-[#243B55]">
                      <span className="text-[#22D3EE] font-bold">P(0) = |α|²</span>
                      <span className="text-[#F8FAFC]">
                        {step3Example === 'A' && '= |1|² = 1 = 100%'}
                        {step3Example === 'B' && '= |0|² = 0 = 0%'}
                        {step3Example === 'C' && '= |√3/2|² = 3/4 = 75%'}
                        {step3Example === 'D' && '= |1/2|² = 1/4 = 25%'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#0A1128] p-2.5 rounded-xl border border-[#243B55]">
                      <span className="text-[#A78BFA] font-bold">P(1) = |β|²</span>
                      <span className="text-[#F8FAFC]">
                        {step3Example === 'A' && '= |0|² = 0 = 0%'}
                        {step3Example === 'B' && '= |1|² = 1 = 100%'}
                        {step3Example === 'C' && '= |1/2|² = 1/4 = 25%'}
                        {step3Example === 'D' && '= |√3/2|² = 3/4 = 75%'}
                      </span>
                    </div>
                  </div>

                  {(step3Example === 'C' || step3Example === 'D') && (
                    <p className="text-[11px] text-[#94A3B8] italic">
                      Note: You do not need to derive √3; this is a worked example showing how amplitudes square to probabilities.
                    </p>
                  )}
                </div>

                {/* Practice Check Quiz */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F8FAFC]">
                    <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Practice Check</span>
                  </div>
                  <p className="text-xs text-[#CBD5E1]">
                    If <span className="font-mono text-[#22D3EE]">α = 1/√2</span> and{' '}
                    <span className="font-mono text-[#A78BFA]">β = 1/√2</span>, what are the probabilities?
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleStep3AnswerPractice('A')}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer ${
                        step3PracticeAnswer === 'A'
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#FCA5A5]'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      A. 100%, 0%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep3AnswerPractice('B')}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer ${
                        step3PracticeAnswer === 'B'
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#FCA5A5]'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      B. 75%, 25%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep3AnswerPractice('C')}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer ${
                        step3PracticeAnswer === 'C'
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#6EE7B7]'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      C. 50%, 50%
                    </button>
                  </div>

                  {step3PracticeAnswer === 'C' && (
                    <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 font-mono text-[11px] text-[#6EE7B7] space-y-1">
                      <p className="font-bold">Correct! Step-by-step calculation:</p>
                      <p>P(0) = |1/√2|² = 1/2 = 50%</p>
                      <p>P(1) = |1/√2|² = 1/2 = 50%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 4: INTRODUCE |+⟩ */}
            {/* =============================================================== */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#132238]/90 border border-[#243B55] text-center space-y-1">
                  <p className="text-xs text-[#94A3B8]">“This equal-superposition state has a special name.”</p>
                  <div className="text-3xl font-mono font-black text-[#34D399] tracking-wider py-1">
                    |+⟩
                  </div>
                </div>

                {/* State Formula in Distributed Form */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-3 font-mono">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Distributed Form</span>
                  <div className="text-base sm:text-lg font-bold text-[#F8FAFC] text-center bg-[#132238] py-2.5 px-3 rounded-xl border border-[#334155]">
                    |+⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55]">
                      <span className="text-[#94A3B8] block text-[10px]">Amplitude of |0⟩</span>
                      <span className="text-[#34D399] font-bold">1/√2</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55]">
                      <span className="text-[#94A3B8] block text-[10px]">Amplitude of |1⟩</span>
                      <span className="text-[#34D399] font-bold">1/√2</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Probability Calculation */}
                <div className="p-4 rounded-2xl bg-[#132238]/70 border border-[#243B55] font-mono text-xs space-y-2">
                  <div className="text-[#94A3B8] font-bold text-[11px] uppercase">Probability Calculation</div>
                  <div className="bg-[#0A1128] p-2 rounded-lg text-[#F8FAFC]">
                    P(0) = |1/√2|² = 1/2 = 50%
                  </div>
                  <div className="bg-[#0A1128] p-2 rounded-lg text-[#F8FAFC]">
                    P(1) = |1/√2|² = 1/2 = 50%
                  </div>
                </div>

                {/* Gate Relation */}
                <div className="p-3 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 text-center font-mono text-xs font-bold text-[#34D399]">
                  H|0⟩ = |+⟩
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 5: INTRODUCE |−⟩ */}
            {/* =============================================================== */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#132238]/90 border border-[#243B55] text-center space-y-1">
                  <p className="text-xs text-[#94A3B8]">“Now observe what happens when H acts on |1⟩:”</p>
                  <div className="text-3xl font-mono font-black text-[#A78BFA] tracking-wider py-1">
                    |−⟩
                  </div>
                </div>

                {/* State Formula in Distributed Form */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-3 font-mono">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Distributed Form</span>
                  <div className="text-base sm:text-lg font-bold text-[#F8FAFC] text-center bg-[#132238] py-2.5 px-3 rounded-xl border border-[#334155]">
                    |−⟩ = (1/√2)|0⟩ - (1/√2)|1⟩
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55]">
                      <span className="text-[#94A3B8] block text-[10px]">Amplitude of |0⟩</span>
                      <span className="text-[#22D3EE] font-bold">1/√2</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#132238] border border-[#243B55]">
                      <span className="text-[#94A3B8] block text-[10px]">Amplitude of |1⟩</span>
                      <span className="text-[#A78BFA] font-bold">-1/√2</span>
                    </div>
                  </div>
                </div>

                {/* Squared Magnitude Calculation & Crucial Lesson Note */}
                <div className="p-4 rounded-2xl bg-[#132238]/70 border border-[#243B55] font-mono text-xs space-y-2">
                  <div className="text-[#94A3B8] font-bold text-[11px] uppercase">Probability Calculation</div>
                  <div className="bg-[#0A1128] p-2 rounded-lg text-[#F8FAFC]">
                    P(0) = |1/√2|² = 50%
                  </div>
                  <div className="bg-[#0A1128] p-2 rounded-lg text-[#F8FAFC]">
                    P(1) = |-1/√2|² = 50%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#A78BFA]/30 text-xs text-[#CBD5E1] space-y-1 leading-relaxed">
                  <p className="font-bold text-[#A78BFA]">Crucial Rule:</p>
                  <p>“The negative amplitude does NOT mean negative probability.”</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    “The probability is still positive because we use the squared magnitude.”
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-center font-mono text-xs font-bold text-[#A78BFA]">
                  H|1⟩ = |−⟩
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 6: COMPARE |+⟩ AND |−⟩ */}
            {/* =============================================================== */}
            {currentStep === 6 && (
              <div className="space-y-4">
                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {/* |+⟩ Card */}
                  <div className="p-3.5 rounded-2xl bg-[#132238] border border-[#34D399]/40 space-y-2">
                    <span className="text-sm font-bold text-[#34D399] block text-center">|+⟩</span>
                    <div className="text-[11px] space-y-1 text-[#CBD5E1]">
                      <div>amplitudes:</div>
                      <div className="text-[#34D399] pl-2">1/√2, 1/√2</div>
                      <div className="pt-1">probabilities:</div>
                      <div className="text-[#94A3B8] pl-2">0 → 50%</div>
                      <div className="text-[#94A3B8] pl-2">1 → 50%</div>
                    </div>
                  </div>

                  {/* |−⟩ Card */}
                  <div className="p-3.5 rounded-2xl bg-[#132238] border border-[#A78BFA]/40 space-y-2">
                    <span className="text-sm font-bold text-[#A78BFA] block text-center">|−⟩</span>
                    <div className="text-[11px] space-y-1 text-[#CBD5E1]">
                      <div>amplitudes:</div>
                      <div className="text-[#A78BFA] pl-2">1/√2, -1/√2</div>
                      <div className="pt-1">probabilities:</div>
                      <div className="text-[#94A3B8] pl-2">0 → 50%</div>
                      <div className="text-[#94A3B8] pl-2">1 → 50%</div>
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                    They have the same measurement probabilities. Are they the same quantum state?
                  </p>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => handleStep6Quiz('yes')}
                      className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                        step6QuizAnswer === 'yes'
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#FCA5A5]'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep6Quiz('no')}
                      className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                        step6QuizAnswer === 'no'
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#6EE7B7]'
                          : 'bg-[#132238] border-[#243B55] text-[#94A3B8]'
                      }`}
                    >
                      NO
                    </button>
                  </div>

                  {step6QuizAnswer === 'no' && (
                    <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#6EE7B7] leading-relaxed">
                      “The difference is not visible from the 0/1 probabilities alone.”
                      <p className="mt-1 text-[#94A3B8] text-[11px]">
                        On the sphere, |+⟩ and |−⟩ point in diametrically opposite directions! This hidden difference is called quantum phase.
                      </p>
                    </div>
                  )}

                  {step6QuizAnswer === 'yes' && (
                    <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#FCA5A5]">
                      Not the same! Even though 0/1 measurements give 50/50 for both, their internal mathematical signs differ.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 7: INTRODUCE PHASE */}
            {/* =============================================================== */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#132238]/90 border border-[#243B55] space-y-2">
                  <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold tracking-wider">
                    Core Definition
                  </span>
                  <p className="text-sm font-semibold text-[#F8FAFC] leading-relaxed">
                    “Phase is information inside the quantum state that is not always visible from immediate measurement probabilities.”
                  </p>
                </div>

                {/* Positive vs Negative Relative Sign */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#132238] flex items-center justify-between">
                    <span className="text-[#34D399] font-bold">|+⟩ State</span>
                    <span className="text-[#CBD5E1]">positive relative sign (+)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#132238] flex items-center justify-between">
                    <span className="text-[#A78BFA] font-bold">|−⟩ State</span>
                    <span className="text-[#CBD5E1]">negative relative sign (−)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#243B55] text-xs text-[#94A3B8] leading-relaxed">
                  “This plus-versus-minus difference is a simple example of a phase difference.”
                </div>

                {/* Probability vs Phase Distinction */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55] text-xs">
                    <span className="text-[#22D3EE] font-mono font-bold block mb-0.5">Probability</span>
                    <span className="text-[#CBD5E1]">tells us how likely 0 or 1 is</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55] text-xs">
                    <span className="text-[#A78BFA] font-mono font-bold block mb-0.5">Phase</span>
                    <span className="text-[#CBD5E1]">affects how the state behaves when more quantum operations are applied</span>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 8: WHY PHASE MATTERS (THE H-GATE TEST) */}
            {/* =============================================================== */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#132238]/90 border border-[#243B55] space-y-2">
                  <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold tracking-wider">
                    The Hadamard Test
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-center">
                    <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#334155]">
                      <span className="text-[#34D399] font-bold block">H|+⟩ = |0⟩</span>
                      <span className="text-[10px] text-[#94A3B8]">100% measures 0</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#334155]">
                      <span className="text-[#A78BFA] font-bold block">H|−⟩ = |1⟩</span>
                      <span className="text-[10px] text-[#94A3B8]">100% measures 1</span>
                    </div>
                  </div>
                </div>

                {/* Payoff Explanations */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-3 text-xs leading-relaxed text-[#CBD5E1]">
                  <p>• “Before H, both states gave 50/50 when measured directly.”</p>
                  <p>• “But after H, they behave differently: |+⟩ returns to |0⟩, and |−⟩ becomes |1⟩!”</p>
                  <p className="font-bold text-[#38BDF8]">
                    • “That means the phase information mattered.”
                  </p>
                  <p className="text-[11px] text-[#94A3B8] pt-1">
                    Hadamard interfered the components: the positive phase added constructively into |0⟩, while the negative phase canceled into |1⟩!
                  </p>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 9: FINAL SUMMARY */}
            {/* =============================================================== */}
            {currentStep === 9 && (
              <div className="space-y-4">
                {/* State Formulas */}
                <div className="p-3.5 rounded-2xl bg-[#132238]/90 border border-[#243B55] font-mono text-xs space-y-1.5">
                  <div className="text-[#34D399] font-bold">
                    |+⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
                  </div>
                  <div className="text-[#A78BFA] font-bold">
                    |−⟩ = (1/√2)|0⟩ - (1/√2)|1⟩
                  </div>
                  <div className="text-[#94A3B8] text-[11px] pt-1 border-t border-[#243B55]">
                    P(0) = |α|² &nbsp;&nbsp; P(1) = |β|²
                  </div>
                </div>

                {/* Synthesis bullets */}
                <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#243B55] space-y-2 text-xs text-[#CBD5E1] leading-relaxed">
                  <p>• |+⟩ and |−⟩ both give 50/50 directly</p>
                  <p>• but they are different quantum states</p>
                  <p>• because their phase is different</p>
                </div>

                {/* Final Key Takeaways */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55]">
                    <span className="text-[#22D3EE] font-bold block mb-0.5 font-mono">1. Probability</span>
                    <span className="text-[#CBD5E1]">“Probability tells us how likely a measurement result is.”</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#132238] border border-[#243B55]">
                    <span className="text-[#A78BFA] font-bold block mb-0.5 font-mono">2. Phase</span>
                    <span className="text-[#CBD5E1]">“Phase affects how quantum states behave when more gates are applied.”</span>
                  </div>
                </div>
              </div>
            )}

            {/* Next / Primary Action Button */}
            <div className="pt-2 border-t border-[#243B55]/60 flex items-center justify-between">
              <span className="text-xs font-mono text-[#64748B]">
                Step {currentStep} of {totalSteps}
              </span>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!isStepComplete(currentStep)}
                  className="px-5 py-2.5 rounded-full bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0A1128] font-mono font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#38BDF8]/20 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onComplete();
                    if (onNextLesson) {
                      onNextLesson();
                    } else {
                      onExit();
                    }
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#34D399] to-[#22D3EE] text-[#0A1128] font-mono font-black text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#34D399]/25 hover:brightness-110 cursor-pointer active:scale-95"
                >
                  <span>NEXT: Z GATE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Persistent Navigation Controls */}
        <div className="mt-8 pt-4 border-t border-[#243B55]/50 flex items-center justify-end">
          <LessonNavControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            canContinue={isStepComplete(currentStep)}
            onBack={handlePrevStep}
            onContinue={
              currentStep === totalSteps
                ? () => {
                    onComplete();
                    if (onNextLesson) {
                      onNextLesson();
                    } else {
                      onExit();
                    }
                  }
                : handleNextStep
            }
            finalStepLabel="NEXT: Z GATE"
          />
        </div>

      </div>
    </LessonShell>
  );
};
