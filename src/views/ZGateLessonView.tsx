import React, { useState, useEffect, useRef } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { BlochSphereVisualizer } from '../components/bloch/BlochSphereVisualizer';
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Play,
  Zap,
  Check,
  Compass,
} from 'lucide-react';

interface ZGateLessonViewProps {
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

  const animRef = useRef<{
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

export const ZGateLessonView: React.FC<ZGateLessonViewProps> = ({
  onExit,
  onComplete,
  onNextLesson,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: Recall X Gate (|0⟩ ↔ |1⟩)
  // =========================================================================
  const [step1State, setStep1State] = useState<'0' | '1'>('0');
  const step1TargetTheta = step1State === '0' ? 0 : Math.PI;
  const { theta: step1Theta } = useAnimatedSphereAngles(step1TargetTheta, 0, 800);

  // =========================================================================
  // STEP 2 STATE: Introduce Z on |0⟩
  // =========================================================================
  const [step2ZApplied, setStep2ZApplied] = useState(false);
  const { theta: step2Theta } = useAnimatedSphereAngles(0, 0, 600);

  // =========================================================================
  // STEP 3 STATE: Z on |1⟩ -> -|1⟩
  // =========================================================================
  const [step3ZApplied, setStep3ZApplied] = useState(false);
  const { theta: step3Theta } = useAnimatedSphereAngles(Math.PI, 0, 600);

  // =========================================================================
  // STEP 4 STATE: Connect Z to |+⟩ -> |−⟩
  // =========================================================================
  const [step4ZApplied, setStep4ZApplied] = useState(false);
  // theta = PI/2 (equator). phi: 0 for |+⟩, PI for |−⟩
  const step4TargetPhi = step4ZApplied ? Math.PI : 0;
  const { theta: step4Theta, phi: step4Phi, isAnimating: step4Animating } =
    useAnimatedSphereAngles(Math.PI / 2, step4TargetPhi, 1000);

  // =========================================================================
  // STEP 5 STATE: Check Probabilities (|0⟩/|1⟩ unchanged at 50/50)
  // =========================================================================
  const [step5QuizAnswer, setStep5QuizAnswer] = useState<'yes' | 'no' | null>(null);
  const { theta: step5Theta, phi: step5Phi } = useAnimatedSphereAngles(
    Math.PI / 2,
    Math.PI,
    700
  );

  // =========================================================================
  // STEP 6 STATE: Z on |−⟩ -> |+⟩
  // =========================================================================
  const [step6ZApplied, setStep6ZApplied] = useState(false);
  // starts at |−⟩ (phi = PI), moves to |+⟩ (phi = 0)
  const step6TargetPhi = step6ZApplied ? 0 : Math.PI;
  const { theta: step6Theta, phi: step6Phi, isAnimating: step6Animating } =
    useAnimatedSphereAngles(Math.PI / 2, step6TargetPhi, 1000);

  // =========================================================================
  // STEP 7 STATE: X vs Z Comparison
  // =========================================================================
  const [step7Mode, setStep7Mode] = useState<'X' | 'Z'>('X');
  const [step7Toggled, setStep7Toggled] = useState(false);
  const step7TargetTheta =
    step7Mode === 'X' ? (step7Toggled ? Math.PI : 0) : Math.PI / 2;
  const step7TargetPhi =
    step7Mode === 'Z' ? (step7Toggled ? Math.PI : 0) : 0;
  const { theta: step7Theta, phi: step7Phi } = useAnimatedSphereAngles(
    step7TargetTheta,
    step7TargetPhi,
    850
  );

  // =========================================================================
  // STEP 8 STATE: Interactive Mini Experiment
  // =========================================================================
  type StartingState = '0' | '1' | '+' | '-';
  const [step8State, setStep8State] = useState<StartingState>('0');
  const [step8ZActive, setStep8ZActive] = useState(false);

  // Compute angles for Step 8 based on starting state + Z
  const getStep8Angles = (state: StartingState, zApplied: boolean) => {
    if (state === '0') {
      return { theta: 0, phi: 0 };
    }
    if (state === '1') {
      return { theta: Math.PI, phi: 0 };
    }
    if (state === '+') {
      return { theta: Math.PI / 2, phi: zApplied ? Math.PI : 0 };
    }
    // state === '-'
    return { theta: Math.PI / 2, phi: zApplied ? 0 : Math.PI };
  };

  const currentStep8Target = getStep8Angles(step8State, step8ZActive);
  const { theta: step8Theta, phi: step8Phi } = useAnimatedSphereAngles(
    currentStep8Target.theta,
    currentStep8Target.phi,
    800
  );

  // =========================================================================
  // STEP 9 STATE: Why Does Z Matter? (Interference with H)
  // =========================================================================
  const [step9Path, setStep9Path] = useState<'withZ' | 'withoutZ'>('withZ');
  // With Z: |+⟩ -> |−⟩ -> |1⟩ (theta = PI)
  // Without Z: |+⟩ -> |0⟩ (theta = 0)
  const step9TargetTheta = step9Path === 'withZ' ? Math.PI : 0;
  const { theta: step9Theta, phi: step9Phi } = useAnimatedSphereAngles(
    step9TargetTheta,
    0,
    900
  );

  // =========================================================================
  // STEP 10 STATE: Final Summary
  // =========================================================================
  const [step10SelectedGate, setStep10SelectedGate] = useState<'0' | '1' | '+' | '-'>('+');
  const step10Angles =
    step10SelectedGate === '0'
      ? { theta: 0, phi: 0 }
      : step10SelectedGate === '1'
      ? { theta: Math.PI, phi: 0 }
      : step10SelectedGate === '+'
      ? { theta: Math.PI / 2, phi: Math.PI } // Result of Z|+⟩ is |−⟩
      : { theta: Math.PI / 2, phi: 0 }; // Result of Z|−⟩ is |+⟩
  const { theta: step10Theta, phi: step10Phi } = useAnimatedSphereAngles(
    step10Angles.theta,
    step10Angles.phi,
    750
  );

  // Step Completion Validation
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return step2ZApplied;
      case 3:
        return step3ZApplied;
      case 4:
        return step4ZApplied;
      case 5:
        return step5QuizAnswer === 'no';
      case 6:
        return step6ZApplied;
      case 7:
        return true;
      case 8:
        return step8ZActive;
      case 9:
        return true;
      case 10:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxUnlockedStep((prev) => Math.max(prev, next));
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={totalSteps}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={(s) => setCurrentStep(s)}
      onExit={onExit}
    >
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col flex-1">
        
        {/* Main 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          
          {/* =================================================================== */}
          {/* LEFT COLUMN: Bloch Sphere & Synchronized Visual State               */}
          {/* =================================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#0F172A]/80 border border-[#243B55] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            
            {/* Subtle header tag */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8]">
                  Bloch Sphere Map
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#64748B] px-2.5 py-0.5 rounded-full bg-[#1E293B] border border-[#334155]">
                Intermediate 3
              </span>
            </div>

            {/* Visualizer Container */}
            <div className="relative py-2 flex flex-col items-center">
              {currentStep === 1 && (
                <BlochSphereVisualizer
                  theta={step1Theta}
                  phi={0}
                  stateLabel={step1State === '0' ? '|0⟩' : '|1⟩'}
                  highlight={step1State}
                  showPhaseMarkers={false}
                  subtleNote="X rotates state between North pole (|0⟩) and South pole (|1⟩)."
                  pointerAccent="cyan"
                  size={320}
                />
              )}

              {currentStep === 2 && (
                <BlochSphereVisualizer
                  theta={step2Theta}
                  phi={0}
                  stateLabel="|0⟩"
                  highlight="0"
                  showPhaseMarkers={false}
                  subtleNote="Z leaves |0⟩ completely unchanged at the North pole."
                  pointerAccent="cyan"
                  size={320}
                />
              )}

              {currentStep === 3 && (
                <BlochSphereVisualizer
                  theta={step3Theta}
                  phi={0}
                  stateLabel={step3ZApplied ? '-|1⟩' : '|1⟩'}
                  highlight="1"
                  showPhaseMarkers={false}
                  subtleNote="Vector remains at the South pole with a minus sign in phase."
                  pointerAccent="purple"
                  size={320}
                />
              )}

              {currentStep === 4 && (
                <BlochSphereVisualizer
                  theta={step4Theta}
                  phi={step4Phi}
                  stateLabel={step4ZApplied ? '|−⟩' : '|+⟩'}
                  highlight={step4ZApplied ? '-' : '+'}
                  showPhaseMarkers={true}
                  subtleNote="Z smoothly rotates the vector across the equator to the opposite side."
                  pointerAccent="emerald"
                  size={320}
                />
              )}

              {currentStep === 5 && (
                <BlochSphereVisualizer
                  theta={step5Theta}
                  phi={step5Phi}
                  stateLabel="|−⟩"
                  highlight="-"
                  showPhaseMarkers={true}
                  subtleNote="Vector is at |−⟩. Probabilities for |0⟩ and |1⟩ are still 50% each."
                  pointerAccent="emerald"
                  size={320}
                />
              )}

              {currentStep === 6 && (
                <BlochSphereVisualizer
                  theta={step6Theta}
                  phi={step6Phi}
                  stateLabel={step6ZApplied ? '|+⟩' : '|−⟩'}
                  highlight={step6ZApplied ? '+' : '-'}
                  showPhaseMarkers={true}
                  subtleNote="Z rotates the vector from |−⟩ back across the equator to |+⟩."
                  pointerAccent="emerald"
                  size={320}
                />
              )}

              {currentStep === 7 && (
                <BlochSphereVisualizer
                  theta={step7Theta}
                  phi={step7Phi}
                  stateLabel={
                    step7Mode === 'X'
                      ? step7Toggled
                        ? '|1⟩'
                        : '|0⟩'
                      : step7Toggled
                      ? '|−⟩'
                      : '|+⟩'
                  }
                  highlight={
                    step7Mode === 'X'
                      ? step7Toggled
                        ? '1'
                        : '0'
                      : step7Toggled
                      ? '-'
                      : '+'
                  }
                  showPhaseMarkers={step7Mode === 'Z'}
                  subtleNote={
                    step7Mode === 'X'
                      ? 'X Gate: vertical flip along polar axis (|0⟩ ↔ |1⟩)'
                      : 'Z Gate: horizontal flip across the equator (|+⟩ ↔ |−⟩)'
                  }
                  pointerAccent={step7Mode === 'X' ? 'cyan' : 'emerald'}
                  size={320}
                />
              )}

              {currentStep === 8 && (
                <BlochSphereVisualizer
                  theta={step8Theta}
                  phi={step8Phi}
                  stateLabel={
                    step8State === '0'
                      ? '|0⟩'
                      : step8State === '1'
                      ? step8ZActive
                        ? '-|1⟩'
                        : '|1⟩'
                      : step8State === '+'
                      ? step8ZActive
                        ? '|−⟩'
                        : '|+⟩'
                      : step8ZActive
                      ? '|+⟩'
                      : '|−⟩'
                  }
                  highlight={
                    step8State === '0'
                      ? '0'
                      : step8State === '1'
                      ? '1'
                      : step8State === '+'
                      ? step8ZActive
                        ? '-'
                        : '+'
                      : step8ZActive
                      ? '+'
                      : '-'
                  }
                  showPhaseMarkers={true}
                  subtleNote="Observe how Z affects polar states vs equator states."
                  pointerAccent="amber"
                  size={320}
                />
              )}

              {currentStep === 9 && (
                <BlochSphereVisualizer
                  theta={step9Theta}
                  phi={step9Phi}
                  stateLabel={step9Path === 'withZ' ? '|1⟩' : '|0⟩'}
                  highlight={step9Path === 'withZ' ? '1' : '0'}
                  showPhaseMarkers={false}
                  subtleNote={
                    step9Path === 'withZ'
                      ? 'With Z: phase flip turns |+⟩ into |−⟩, and H yields |1⟩.'
                      : 'Without Z: H on |+⟩ directly returns |0⟩.'
                  }
                  pointerAccent={step9Path === 'withZ' ? 'purple' : 'cyan'}
                  size={320}
                />
              )}

              {currentStep === 10 && (
                <BlochSphereVisualizer
                  theta={step10Theta}
                  phi={step10Phi}
                  stateLabel={
                    step10SelectedGate === '0'
                      ? '|0⟩'
                      : step10SelectedGate === '1'
                      ? '-|1⟩'
                      : step10SelectedGate === '+'
                      ? '|−⟩'
                      : '|+⟩'
                  }
                  highlight={
                    step10SelectedGate === '0'
                      ? '0'
                      : step10SelectedGate === '1'
                      ? '1'
                      : step10SelectedGate === '+'
                      ? '-'
                      : '+'
                  }
                  showPhaseMarkers={true}
                  subtleNote="Z transforms phase while preserving immediate 0/1 measurement odds."
                  pointerAccent="emerald"
                  size={320}
                />
              )}
            </div>

            {/* Bottom mini readout banner under Bloch sphere */}
            <div className="w-full mt-4 pt-3 border-t border-[#243B55]/60 flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Polar Axis: |0⟩ ↔ |1⟩</span>
              </span>
              <span className="text-[#34D399]">Equator: |+⟩ ↔ |−⟩</span>
            </div>

          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: Curriculum Narrative, Equations & Interactions        */}
          {/* =================================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">

            {/* ================================================================= */}
            {/* STEP 1: RECALL X GATE                                             */}
            {/* ================================================================= */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#38BDF8] mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Step 1 • Recall X Gate</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    You already know the X gate.
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    X changes the basic state by flipping between classical basis states.
                  </p>
                </div>

                {/* Circuit display */}
                <div className="bg-[#0F172A] border border-[#243B55] rounded-2xl p-5 space-y-4">
                  <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
                    Quantum Wire
                  </div>
                  <div className="flex items-center justify-center gap-3 font-mono text-base text-white py-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#38BDF8] font-bold">
                      |{step1State}⟩
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span className="px-3.5 py-1.5 rounded-lg bg-[#0284C7] text-white font-bold shadow-md shadow-[#0284C7]/30">
                      X
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#A78BFA] font-bold">
                      |{step1State === '0' ? '1' : '0'}⟩
                    </span>
                  </div>

                  <div className="flex justify-center pt-1">
                    <button
                      id="step1-flip-x-btn"
                      type="button"
                      onClick={() => setStep1State((prev) => (prev === '0' ? '1' : '0'))}
                      className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#243B55] text-xs font-mono text-[#38BDF8] border border-[#38BDF8]/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Flip Input (|{step1State === '0' ? '1' : '0'}⟩)</span>
                    </button>
                  </div>
                </div>

                {/* Conceptual prompt */}
                <div className="p-4 rounded-2xl bg-[#132238]/60 border border-[#243B55] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#CBD5E1]">
                    <span className="font-bold text-[#38BDF8]">X:</span>
                    <span>|0⟩ ↔ |1⟩</span>
                  </div>
                  <p className="text-sm font-medium text-[#F8FAFC]">
                    Can a gate change something other than the 0/1 state?
                  </p>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 2: INTRODUCE Z ON |0⟩                                        */}
            {/* ================================================================= */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#38BDF8] mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Step 2 • The Z Gate</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    The Z gate does not change |0⟩.
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    Input |0⟩ → output |0⟩.
                  </p>
                </div>

                {/* Circuit display */}
                <div className="bg-[#0F172A] border border-[#243B55] rounded-2xl p-5 space-y-4">
                  <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
                    Circuit Action
                  </div>
                  <div className="flex items-center justify-center gap-3 font-mono text-base text-white py-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#38BDF8] font-bold">
                      |0⟩
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                        step2ZApplied
                          ? 'bg-[#38BDF8] text-[#08111F] shadow-lg shadow-[#38BDF8]/40 ring-2 ring-[#38BDF8]'
                          : 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]'
                      }`}
                    >
                      Z
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#38BDF8] font-bold">
                      |0⟩
                    </span>
                  </div>

                  <div className="flex justify-center pt-1">
                    <button
                      id="step2-apply-z-btn"
                      type="button"
                      onClick={() => {
                        setStep2ZApplied(true);
                        setMaxUnlockedStep((prev) => Math.max(prev, 3));
                      }}
                      className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                        step2ZApplied
                          ? 'bg-[#10B981]/20 text-[#34D399] border border-[#34D399]'
                          : 'bg-[#38BDF8] text-[#08111F] hover:bg-[#0EA5E9] shadow-md shadow-[#38BDF8]/20'
                      }`}
                    >
                      {step2ZApplied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Z Applied — |0⟩ Unchanged</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>APPLY Z GATE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Equation box */}
                <div className="p-4 rounded-2xl bg-[#132238]/60 border border-[#243B55] text-center font-mono">
                  <div className="text-xs text-[#64748B] mb-1">State Equation</div>
                  <div className="text-lg font-bold text-white tracking-wide">
                    Z|0⟩ = |0⟩
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 3: Z ON |1⟩                                                  */}
            {/* ================================================================= */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#C084FC] mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Step 3 • Z on |1⟩</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Z changes |1⟩ to -|1⟩.
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    The minus sign does not mean “negative 1”. It represents a phase change.
                  </p>
                </div>

                {/* Circuit display */}
                <div className="bg-[#0F172A] border border-[#243B55] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-center gap-3 font-mono text-base text-white py-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#A78BFA] font-bold">
                      |1⟩
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                        step3ZApplied
                          ? 'bg-[#C084FC] text-[#08111F] shadow-lg shadow-[#C084FC]/40 ring-2 ring-[#C084FC]'
                          : 'bg-[#1E293B] text-[#C084FC] border border-[#C084FC]'
                      }`}
                    >
                      Z
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#C084FC] font-bold">
                      {step3ZApplied ? '-|1⟩' : '?'}
                    </span>
                  </div>

                  <div className="flex justify-center pt-1">
                    <button
                      id="step3-apply-z-btn"
                      type="button"
                      onClick={() => {
                        setStep3ZApplied(true);
                        setMaxUnlockedStep((prev) => Math.max(prev, 4));
                      }}
                      className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                        step3ZApplied
                          ? 'bg-[#10B981]/20 text-[#34D399] border border-[#34D399]'
                          : 'bg-[#C084FC] text-[#08111F] hover:bg-[#A855F7] shadow-md shadow-[#C084FC]/20'
                      }`}
                    >
                      {step3ZApplied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Z Applied: Z|1⟩ = -|1⟩</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>APPLY Z GATE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Measurement Probability Comparison */}
                <div className="bg-[#132238]/60 border border-[#243B55] rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="text-[#94A3B8] font-bold uppercase tracking-wider">
                    Measurement Probabilities:
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]">
                      <div className="text-[#64748B] text-[10px]">Before Z (|1⟩)</div>
                      <div className="text-sm font-bold text-[#A78BFA] mt-0.5">P(1) = 100%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]">
                      <div className="text-[#64748B] text-[10px]">After Z (-|1⟩)</div>
                      <div className="text-sm font-bold text-[#C084FC] mt-0.5">P(1) = 100%</div>
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed pt-1">
                    |1⟩ and -|1⟩ give the same immediate measurement result in normal 0/1 measurement.
                    The quantum state has changed in phase, even though the immediate measurement probability is unchanged.
                  </p>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 4: CONNECT Z TO |+⟩                                          */}
            {/* ================================================================= */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#34D399] mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Step 4 • Superposition & Phase</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Connecting Z to |+⟩
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    Now use a state where the phase change becomes clearly useful.
                  </p>
                </div>

                {/* Circuit & Action */}
                <div className="bg-[#0F172A] border border-[#243B55] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-center gap-3 font-mono text-base text-white py-1">
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#34D399] font-bold">
                      |+⟩
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                        step4ZApplied
                          ? 'bg-[#34D399] text-[#08111F] shadow-lg shadow-[#34D399]/40 ring-2 ring-[#34D399]'
                          : 'bg-[#1E293B] text-[#34D399] border border-[#34D399]'
                      }`}
                    >
                      Z
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#C084FC] font-bold">
                      {step4ZApplied ? '|−⟩' : '?'}
                    </span>
                  </div>

                  <div className="flex justify-center pt-1">
                    <button
                      id="step4-apply-z-btn"
                      type="button"
                      disabled={step4Animating}
                      onClick={() => {
                        setStep4ZApplied(true);
                        setMaxUnlockedStep((prev) => Math.max(prev, 5));
                      }}
                      className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 ${
                        step4ZApplied
                          ? 'bg-[#10B981]/20 text-[#34D399] border border-[#34D399]'
                          : 'bg-[#34D399] text-[#08111F] hover:bg-[#10B981] shadow-md shadow-[#34D399]/20'
                      }`}
                    >
                      {step4ZApplied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Z Applied: Z|+⟩ = |−⟩</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>APPLY Z</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Equation Transition Box */}
                <div className="p-4 rounded-2xl bg-[#132238]/60 border border-[#243B55] space-y-3 font-mono text-xs">
                  <div className="text-[#94A3B8] font-bold uppercase tracking-wider">
                    Equation Transition:
                  </div>
                  <div className="space-y-2 text-center py-1">
                    <div className="text-slate-400">
                      BEFORE Z:{' '}
                      <span className="text-white font-bold">
                        |+⟩ = (1/√2)|0⟩ <span className="text-[#34D399]">+ (1/√2)|1⟩</span>
                      </span>
                    </div>
                    {step4ZApplied && (
                      <div className="text-slate-300 transition-all">
                        AFTER Z:{' '}
                        <span className="text-white font-bold">
                          (1/√2)|0⟩ <span className="text-[#C084FC] font-black">- (1/√2)|1⟩</span>
                        </span>
                        <div className="text-sm text-[#C084FC] font-bold mt-1.5">
                          = |−⟩ &nbsp;→&nbsp; Z|+⟩ = |−⟩
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-around pt-2 border-t border-[#334155]/60 text-[11px] text-[#94A3B8]">
                    <span>α = 1/√2</span>
                    <span>β = {step4ZApplied ? '-1/√2' : '1/√2'}</span>
                    <span>P(0) = 50% &nbsp; P(1) = 50%</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 5: CHECK THE PROBABILITY                                     */}
            {/* ================================================================= */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#38BDF8] mb-3">
                    <HelpCircle className="w-3 h-3" />
                    <span>Step 5 • Concept Check</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Check the probabilities.
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    Compare the immediate measurement outcomes before and after applying Z.
                  </p>
                </div>

                {/* Before vs After Table */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#243B55] text-center space-y-2">
                    <div className="text-[#64748B] uppercase text-[10px]">Before Z</div>
                    <div className="text-lg font-bold text-[#34D399]">|+⟩</div>
                    <div className="space-y-1 text-slate-300">
                      <div>P(0) = 50%</div>
                      <div>P(1) = 50%</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#243B55] text-center space-y-2">
                    <div className="text-[#64748B] uppercase text-[10px]">After Z</div>
                    <div className="text-lg font-bold text-[#C084FC]">|−⟩</div>
                    <div className="space-y-1 text-slate-300">
                      <div>P(0) = 50%</div>
                      <div>P(1) = 50%</div>
                    </div>
                  </div>
                </div>

                {/* Quiz Question */}
                <div className="p-5 rounded-2xl bg-[#132238]/70 border border-[#243B55] space-y-4">
                  <div className="text-sm font-semibold text-white">
                    Did the immediate 0/1 probabilities change?
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="step5-quiz-yes-btn"
                      type="button"
                      onClick={() => setStep5QuizAnswer('yes')}
                      className={`py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        step5QuizAnswer === 'yes'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                          : 'bg-[#1E293B] text-slate-300 border-[#334155] hover:bg-[#243B55]'
                      }`}
                    >
                      YES
                    </button>

                    <button
                      id="step5-quiz-no-btn"
                      type="button"
                      onClick={() => {
                        setStep5QuizAnswer('no');
                        setMaxUnlockedStep((prev) => Math.max(prev, 6));
                      }}
                      className={`py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        step5QuizAnswer === 'no'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-2 ring-emerald-400/40'
                          : 'bg-[#1E293B] text-slate-300 border-[#334155] hover:bg-[#243B55]'
                      }`}
                    >
                      NO
                    </button>
                  </div>

                  {step5QuizAnswer === 'no' && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 leading-relaxed space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct: Probabilities stayed 50/50.</span>
                      </div>
                      <p className="text-slate-300">
                        But the quantum state did change! This is why probability alone does not describe the full quantum state.
                      </p>
                    </div>
                  )}

                  {step5QuizAnswer === 'yes' && (
                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 leading-relaxed">
                      Notice that both |+⟩ and |−⟩ have 50% chance of 0 and 50% chance of 1. The probabilities did not change!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 6: Z ON |−⟩ -> |+⟩                                          */}
            {/* ================================================================= */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#C084FC] mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Step 6 • Reverse Phase Flip</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Z on |−⟩
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    Z flips the sign of the |1⟩ component again, turning |−⟩ back into |+⟩.
                  </p>
                </div>

                {/* Circuit Action */}
                <div className="bg-[#0F172A] border border-[#243B55] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-center gap-3 font-mono text-base text-white py-1">
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#C084FC] font-bold">
                      |−⟩
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                        step6ZApplied
                          ? 'bg-[#C084FC] text-[#08111F] shadow-lg shadow-[#C084FC]/40 ring-2 ring-[#C084FC]'
                          : 'bg-[#1E293B] text-[#C084FC] border border-[#C084FC]'
                      }`}
                    >
                      Z
                    </span>
                    <span className="text-[#64748B]">────</span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#34D399] font-bold">
                      {step6ZApplied ? '|+⟩' : '?'}
                    </span>
                  </div>

                  <div className="flex justify-center pt-1">
                    <button
                      id="step6-apply-z-btn"
                      type="button"
                      disabled={step6Animating}
                      onClick={() => {
                        setStep6ZApplied(true);
                        setMaxUnlockedStep((prev) => Math.max(prev, 7));
                      }}
                      className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 ${
                        step6ZApplied
                          ? 'bg-[#10B981]/20 text-[#34D399] border border-[#34D399]'
                          : 'bg-[#C084FC] text-[#08111F] hover:bg-[#A855F7] shadow-md shadow-[#C084FC]/20'
                      }`}
                    >
                      {step6ZApplied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Z Applied: Z|−⟩ = |+⟩</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>APPLY Z</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Clear Step-by-Step Sign Flip */}
                <div className="p-4 rounded-2xl bg-[#132238]/60 border border-[#243B55] space-y-3 font-mono text-xs">
                  <div className="text-[#94A3B8] font-bold uppercase tracking-wider">
                    Sign Flip Math:
                  </div>
                  <div className="space-y-2 text-center py-1">
                    <div className="text-slate-400">
                      START: |−⟩ = (1/√2)|0⟩ - (1/√2)|1⟩
                    </div>
                    {step6ZApplied && (
                      <div className="space-y-1.5 text-slate-200">
                        <div className="text-[#94A3B8]">
                          Z changes sign of |1⟩ component:
                        </div>
                        <div className="text-white font-bold">
                          (1/√2)|0⟩ - [-(1/√2)|1⟩] = (1/√2)|0⟩ + (1/√2)|1⟩
                        </div>
                        <div className="text-sm text-[#34D399] font-bold pt-1">
                          = |+⟩ &nbsp;→&nbsp; Z|−⟩ = |+⟩
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 7: X VS Z COMPARISON                                         */}
            {/* ================================================================= */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#38BDF8] mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Step 7 • X vs Z Comparison</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Comparing X and Z
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    X changes the basic 0/1 state. Z changes the phase.
                  </p>
                </div>

                {/* Side-by-side cards */}
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div
                    onClick={() => {
                      setStep7Mode('X');
                      setStep7Toggled(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      step7Mode === 'X'
                        ? 'bg-[#0F172A] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/20 ring-1 ring-[#38BDF8]'
                        : 'bg-[#0F172A]/50 border-[#243B55] opacity-70'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#38BDF8]">X GATE</div>
                    <div className="text-base font-black text-white my-2">|0⟩ ↔ |1⟩</div>
                    <p className="text-[11px] text-[#94A3B8] leading-snug">
                      Changes the basic 0/1 state.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setStep7Mode('Z');
                      setStep7Toggled(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      step7Mode === 'Z'
                        ? 'bg-[#0F172A] border-[#34D399] shadow-lg shadow-[#34D399]/20 ring-1 ring-[#34D399]'
                        : 'bg-[#0F172A]/50 border-[#243B55] opacity-70'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#34D399]">Z GATE</div>
                    <div className="text-base font-black text-white my-2">|+⟩ ↔ |−⟩</div>
                    <p className="text-[11px] text-[#94A3B8] leading-snug">
                      Changes phase.
                    </p>
                  </div>
                </div>

                {/* Interactive comparison toggle */}
                <div className="p-4 rounded-2xl bg-[#132238]/60 border border-[#243B55] flex flex-col items-center gap-3">
                  <div className="text-xs text-[#CBD5E1]">
                    Currently testing:{' '}
                    <span className="font-bold text-white">
                      {step7Mode === 'X' ? 'X Gate (|0⟩ ↔ |1⟩)' : 'Z Gate (|+⟩ ↔ |−⟩)'}
                    </span>
                  </div>
                  <button
                    id="step7-toggle-gate-btn"
                    type="button"
                    onClick={() => setStep7Toggled((prev) => !prev)}
                    className="px-5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#243B55] text-xs font-mono text-[#38BDF8] border border-[#38BDF8]/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Apply {step7Mode} Gate</span>
                  </button>
                </div>

                <p className="text-xs text-[#64748B] italic">
                  Note: Z can act on any qubit state. These examples make its phase effect easy to see.
                </p>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 8: INTERACTIVE MINI EXPERIMENT                               */}
            {/* ================================================================= */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F59E0B] mb-3">
                    <Zap className="w-3 h-3" />
                    <span>Step 8 • Interactive Mini Experiment</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Test Z on any state.
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    Pick a starting state, then apply Z to observe the equation, Bloch vector, and probabilities.
                  </p>
                </div>

                {/* State selector buttons */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
                    Choose Starting State:
                  </div>
                  <div className="grid grid-cols-4 gap-2 font-mono text-sm">
                    {(['0', '1', '+', '-'] as StartingState[]).map((st) => (
                      <button
                        key={st}
                        id={`step8-state-${st}-btn`}
                        type="button"
                        onClick={() => {
                          setStep8State(st);
                          setStep8ZActive(false);
                        }}
                        className={`py-2.5 rounded-xl font-bold transition-all border cursor-pointer ${
                          step8State === st
                            ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]'
                            : 'bg-[#0F172A] text-slate-400 border-[#243B55] hover:bg-[#1E293B]'
                        }`}
                      >
                        |{st}⟩
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Z Button */}
                <div className="flex justify-center">
                  <button
                    id="step8-apply-z-btn"
                    type="button"
                    onClick={() => {
                      setStep8ZActive(true);
                      setMaxUnlockedStep((prev) => Math.max(prev, 9));
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#08111F] font-mono text-xs font-black tracking-wider transition-all shadow-md shadow-[#F59E0B]/20 hover:brightness-110 cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>APPLY Z</span>
                  </button>
                </div>

                {/* Combined Output: Equation + Probabilities */}
                <div className="bg-[#0F172A] border border-[#243B55] rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] uppercase text-[10px]">Result Equation:</span>
                    <span className="text-[#FBBF24] font-bold text-sm">
                      {step8State === '0' && 'Z|0⟩ = |0⟩'}
                      {step8State === '1' && (step8ZActive ? 'Z|1⟩ = -|1⟩' : '|1⟩')}
                      {step8State === '+' && (step8ZActive ? 'Z|+⟩ = |−⟩' : '|+⟩')}
                      {step8State === '-' && (step8ZActive ? 'Z|−⟩ = |+⟩' : '|−⟩')}
                    </span>
                  </div>

                  {/* Probability Bars */}
                  <div className="space-y-2 pt-2 border-t border-[#334155]/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">P(0) Probability:</span>
                      <span className="text-white font-bold">
                        {step8State === '0' ? '100%' : step8State === '1' ? '0%' : '50%'}
                      </span>
                    </div>
                    <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#38BDF8] h-full transition-all duration-500"
                        style={{
                          width:
                            step8State === '0' ? '100%' : step8State === '1' ? '0%' : '50%',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">P(1) Probability:</span>
                      <span className="text-white font-bold">
                        {step8State === '0' ? '0%' : step8State === '1' ? '100%' : '50%'}
                      </span>
                    </div>
                    <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#A78BFA] h-full transition-all duration-500"
                        style={{
                          width:
                            step8State === '0' ? '0%' : step8State === '1' ? '100%' : '50%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 9: WHY DOES Z MATTER?                                        */}
            {/* ================================================================= */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#38BDF8] mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Step 9 • Connecting Phase to Measurement</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Why does Z matter?
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    Z changed the phase. Later, the Hadamard (H) gate can turn that phase difference into a different measurement result!
                  </p>
                </div>

                {/* Interactive Circuit comparison */}
                <div className="space-y-3 font-mono text-xs">
                  {/* Path with Z */}
                  <div
                    onClick={() => setStep9Path('withZ')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      step9Path === 'withZ'
                        ? 'bg-[#0F172A] border-[#A78BFA] ring-1 ring-[#A78BFA]'
                        : 'bg-[#0F172A]/50 border-[#243B55] opacity-70'
                    }`}
                  >
                    <div className="text-[10px] text-[#A78BFA] font-bold mb-2 uppercase">
                      Path A: With Z Gate
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white py-1">
                      <span className="text-[#34D399]">|+⟩</span>
                      <span className="text-[#64748B]">→</span>
                      <span className="px-2 py-0.5 rounded bg-[#38BDF8] text-[#08111F] font-bold">
                        Z
                      </span>
                      <span className="text-[#64748B]">→</span>
                      <span className="text-[#C084FC]">|−⟩</span>
                      <span className="text-[#64748B]">→</span>
                      <span className="px-2 py-0.5 rounded bg-[#4F7CFF] text-white font-bold">
                        H
                      </span>
                      <span className="text-[#64748B]">→</span>
                      <span className="text-[#A78BFA] font-black text-base">|1⟩ (100%)</span>
                    </div>
                  </div>

                  {/* Path without Z */}
                  <div
                    onClick={() => setStep9Path('withoutZ')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      step9Path === 'withoutZ'
                        ? 'bg-[#0F172A] border-[#38BDF8] ring-1 ring-[#38BDF8]'
                        : 'bg-[#0F172A]/50 border-[#243B55] opacity-70'
                    }`}
                  >
                    <div className="text-[10px] text-[#38BDF8] font-bold mb-2 uppercase">
                      Path B: Without Z Gate
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white py-1">
                      <span className="text-[#34D399]">|+⟩</span>
                      <span className="text-[#64748B]">→</span>
                      <span className="px-2 py-0.5 rounded bg-[#4F7CFF] text-white font-bold">
                        H
                      </span>
                      <span className="text-[#64748B]">→</span>
                      <span className="text-[#38BDF8] font-black text-base">|0⟩ (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Key takeaway box */}
                <div className="p-4 rounded-2xl bg-[#132238]/60 border border-[#243B55] space-y-2">
                  <div className="text-xs font-mono font-bold text-[#38BDF8]">
                    The Phase Secret:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Even though Z alone didn't change the 50/50 probability, the next gate (H) turns that hidden phase into a 100% chance of getting |1⟩ instead of |0⟩!
                  </p>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 10: FINAL SUMMARY                                            */}
            {/* ================================================================= */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#34D399] mb-3">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Lesson Complete • Summary</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Z Gate Mastered!
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                    You have unlocked how phase operates on the quantum Bloch sphere.
                  </p>
                </div>

                {/* Core Summary Grid */}
                <div className="bg-[#0F172A] border border-[#243B55] rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="text-[#64748B] uppercase text-[10px] tracking-wider">
                    Core Transformations:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setStep10SelectedGate('0')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        step10SelectedGate === '0'
                          ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white'
                          : 'bg-[#1E293B] border-[#334155] text-slate-400'
                      }`}
                    >
                      Z|0⟩ = |0⟩
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep10SelectedGate('1')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        step10SelectedGate === '1'
                          ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-white'
                          : 'bg-[#1E293B] border-[#334155] text-slate-400'
                      }`}
                    >
                      Z|1⟩ = -|1⟩
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep10SelectedGate('+')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        step10SelectedGate === '+'
                          ? 'bg-[#34D399]/20 border-[#34D399] text-white'
                          : 'bg-[#1E293B] border-[#334155] text-slate-400'
                      }`}
                    >
                      Z|+⟩ = |−⟩
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep10SelectedGate('-')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        step10SelectedGate === '-'
                          ? 'bg-[#C084FC]/20 border-[#C084FC] text-white'
                          : 'bg-[#1E293B] border-[#334155] text-slate-400'
                      }`}
                    >
                      Z|−⟩ = |+⟩
                    </button>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="p-4 rounded-2xl bg-[#132238]/60 border border-[#243B55] space-y-2 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-[#38BDF8] font-bold">•</span>
                    <span>X mainly helps us see changes between |0⟩ and |1⟩.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#34D399] font-bold">•</span>
                    <span>Z mainly helps us see phase changes.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#FBBF24] font-bold">•</span>
                    <span>Z can change the quantum state without changing immediate 0/1 probabilities.</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 text-slate-400 italic">
                    <span className="text-[#C084FC] font-bold">•</span>
                    <span>A minus sign in the state does not mean negative probability.</span>
                  </div>
                </div>

                {/* Completion CTA */}
                <div className="pt-2">
                  <button
                    id="step10-complete-btn"
                    type="button"
                    onClick={() => {
                      onComplete();
                      if (onNextLesson) {
                        onNextLesson();
                      } else {
                        onExit();
                      }
                    }}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#34D399] via-[#22D3EE] to-[#38BDF8] text-[#0A1128] font-mono font-black text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#34D399]/25 hover:brightness-110 cursor-pointer active:scale-95"
                  >
                    <span>NEXT: Y GATE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Lesson Navigation Bar */}
            {currentStep < 10 && (
              <div className="pt-4 border-t border-[#243B55]/50 flex items-center justify-end">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  canContinue={isStepComplete(currentStep)}
                  onBack={handlePrevStep}
                  onContinue={handleNextStep}
                />
              </div>
            )}

          </div>

        </div>

      </div>
    </LessonShell>
  );
};
