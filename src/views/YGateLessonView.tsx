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
  ArrowDown,
  Layers,
} from 'lucide-react';

interface YGateLessonViewProps {
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

export const YGateLessonView: React.FC<YGateLessonViewProps> = ({
  onExit,
  onComplete,
  onNextLesson,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: Start from X (|0⟩ ↔ |1⟩)
  // =========================================================================
  const [step1State, setStep1State] = useState<'0' | '1'>('0');
  const [step1FlippedOnce, setStep1FlippedOnce] = useState(false);

  // =========================================================================
  // STEP 2 STATE: The Y-Axis Stick
  // =========================================================================
  const [step2Explored, setStep2Explored] = useState(false);

  // =========================================================================
  // STEP 3 STATE: Y on |0⟩ -> i|1⟩
  // =========================================================================
  const [step3Transformed, setStep3Transformed] = useState(false);

  // =========================================================================
  // STEP 4 STATE: Explain i & Overall Phase
  // =========================================================================
  const [step4ActiveTab, setStep4ActiveTab] = useState<'1' | 'i1'>('1');
  const [step4Understood, setStep4Understood] = useState(false);

  // =========================================================================
  // STEP 5 STATE: Probability Check (|i|² = 1)
  // =========================================================================
  const [step5Choice, setStep5Choice] = useState<'0' | '100' | 'complex' | null>(null);
  const [step5SelectedState, setStep5SelectedState] = useState<'i1' | 'minus_i0'>('i1');

  // =========================================================================
  // STEP 6 STATE: Y on |1⟩ -> -i|0⟩
  // =========================================================================
  const [step6Transformed, setStep6Transformed] = useState(false);

  // =========================================================================
  // STEP 7 STATE: Compare X and Y
  // =========================================================================
  const [step7Input, setStep7Input] = useState<'0' | '1'>('0');
  const [step7Gate, setStep7Gate] = useState<'X' | 'Y'>('X');

  // =========================================================================
  // STEP 8 STATE: Show where X and Y differ (|+⟩ test)
  // =========================================================================
  const [step8AppliedGate, setStep8AppliedGate] = useState<'none' | 'X' | 'Y'>('none');

  // =========================================================================
  // STEP 9 STATE: Overall Phase vs Relative Phase
  // =========================================================================
  const [step9PhaseMode, setStep9PhaseMode] = useState<'overall' | 'relative'>('overall');

  // =========================================================================
  // BLOCH SPHERE TARGET ANGLES
  // =========================================================================
  // Polar angle theta: 0 = |0⟩ (top), PI = |1⟩ (bottom), PI/2 = Equator
  // Azimuthal phi: 0 = |+⟩ (right, +X), PI = |−⟩ (left, -X)
  let targetTheta = 0;
  let targetPhi = 0;
  let stateLabel = '|0⟩';
  let highlight: '0' | '1' | '+' | '-' | 'superposition' | null = '0';
  let pointerAccent: 'cyan' | 'purple' | 'amber' | 'emerald' = 'cyan';
  let showYStick = false;
  let showXStick = false;
  let showPhaseMarkers = false;

  if (currentStep === 1) {
    if (step1State === '0') {
      targetTheta = 0;
      stateLabel = '|0⟩';
      highlight = '0';
      pointerAccent = 'cyan';
    } else {
      targetTheta = Math.PI;
      stateLabel = '|1⟩';
      highlight = '1';
      pointerAccent = 'purple';
    }
  } else if (currentStep === 2) {
    targetTheta = 0;
    stateLabel = '|0⟩';
    highlight = '0';
    showYStick = true;
    pointerAccent = 'amber';
  } else if (currentStep === 3) {
    showYStick = true;
    if (!step3Transformed) {
      targetTheta = 0;
      stateLabel = '|0⟩';
      highlight = '0';
      pointerAccent = 'cyan';
    } else {
      targetTheta = Math.PI;
      // In physics, the Bloch point for i|1⟩ is strictly |1⟩
      stateLabel = '|1⟩';
      highlight = '1';
      pointerAccent = 'purple';
    }
  } else if (currentStep === 4) {
    // Both |1⟩ and i|1⟩ point to the exact same bottom pole!
    targetTheta = Math.PI;
    stateLabel = '|1⟩';
    highlight = '1';
    pointerAccent = step4ActiveTab === '1' ? 'purple' : 'amber';
  } else if (currentStep === 5) {
    if (step5SelectedState === 'i1') {
      targetTheta = Math.PI;
      stateLabel = '|1⟩';
      highlight = '1';
      pointerAccent = 'purple';
    } else {
      targetTheta = 0;
      stateLabel = '|0⟩';
      highlight = '0';
      pointerAccent = 'cyan';
    }
  } else if (currentStep === 6) {
    showYStick = true;
    if (!step6Transformed) {
      targetTheta = Math.PI;
      stateLabel = '|1⟩';
      highlight = '1';
      pointerAccent = 'purple';
    } else {
      targetTheta = 0;
      // In physics, the Bloch point for -i|0⟩ is strictly |0⟩
      stateLabel = '|0⟩';
      highlight = '0';
      pointerAccent = 'cyan';
    }
  } else if (currentStep === 7) {
    showYStick = step7Gate === 'Y';
    showXStick = step7Gate === 'X';
    if (step7Input === '0') {
      targetTheta = Math.PI;
      stateLabel = '|1⟩';
      highlight = '1';
      pointerAccent = 'purple';
    } else {
      targetTheta = 0;
      stateLabel = '|0⟩';
      highlight = '0';
      pointerAccent = 'cyan';
    }
  } else if (currentStep === 8) {
    showPhaseMarkers = true;
    showXStick = step8AppliedGate === 'X';
    showYStick = step8AppliedGate === 'Y';

    if (step8AppliedGate === 'none') {
      targetTheta = Math.PI / 2;
      targetPhi = 0; // right = |+⟩
      stateLabel = '|+⟩';
      highlight = '+';
      pointerAccent = 'emerald';
    } else if (step8AppliedGate === 'X') {
      // |+⟩ lies on X-axis stick, so X leaves pointer right at |+⟩
      targetTheta = Math.PI / 2;
      targetPhi = 0;
      stateLabel = '|+⟩';
      highlight = '+';
      pointerAccent = 'emerald';
    } else {
      // Y rotates around depth axis by 180°, moving right |+⟩ to left |−⟩!
      targetTheta = Math.PI / 2;
      targetPhi = Math.PI; // left = |−⟩
      stateLabel = '|−⟩';
      highlight = '-';
      pointerAccent = 'purple';
    }
  } else if (currentStep === 9) {
    showPhaseMarkers = true;
    if (step9PhaseMode === 'overall') {
      // Overall phase i|1⟩ points strictly to |1⟩
      targetTheta = Math.PI;
      stateLabel = '|1⟩';
      highlight = '1';
      pointerAccent = 'purple';
    } else {
      // Relative phase (1/√2)|0⟩ + (i/√2)|1⟩ points along Y-axis into/out of screen!
      // In spherical coordinates: theta = PI/2, phi = PI/2 (+Y into depth)
      targetTheta = Math.PI / 2;
      targetPhi = Math.PI / 2;
      stateLabel = '|+i⟩';
      highlight = 'superposition';
      pointerAccent = 'amber';
      showYStick = true;
    }
  } else if (currentStep === 10) {
    targetTheta = 0;
    stateLabel = '|0⟩';
    highlight = '0';
    showYStick = true;
    showPhaseMarkers = true;
    pointerAccent = 'amber';
  }

  const { theta: animTheta, phi: animPhi, isAnimating } = useAnimatedSphereAngles(
    targetTheta,
    targetPhi,
    850
  );

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

  const stepTitles = [
    'Start from X',
    'The Y-Axis Stick',
    'Y on |0⟩',
    'Explain i',
    'Probability Check',
    'Y on |1⟩',
    'Compare X and Y',
    'Where X and Y Differ',
    'Overall vs Relative Phase',
    'Y Gate Summary',
  ];

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={totalSteps}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={(s) => setCurrentStep(s)}
      onExit={onExit}
    >
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: 3D BLOCH SPHERE VISUALIZER                           */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full bg-[#08111F]/90 border border-[#1E293B] rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center">
            {/* Top Badge: Global Coordinate Reference */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-[#1E293B]/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
                <span className="text-xs font-mono font-semibold tracking-wider text-[#94A3B8] uppercase">
                  Bloch Map · Global Standard
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2.5 py-0.5 rounded-full font-medium">
                Y = Depth Axis (Into/Out)
              </div>
            </div>

            {/* Visualizer Canvas */}
            <div className="relative my-2">
              <BlochSphereVisualizer
                theta={animTheta}
                phi={animPhi}
                stateLabel={stateLabel}
                highlight={highlight}
                showPhaseMarkers={showPhaseMarkers}
                showYAxisStick={showYStick}
                showXAxisStick={showXStick}
                pointerAccent={pointerAccent}
                size={340}
                subtleNote="State vector arrow originates at center & points to current qubit state."
              />

              {/* Axis guide pill overlay */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 text-[10px] font-mono bg-[#0B1528]/85 border border-[#1E293B] p-2 rounded-lg pointer-events-none select-none text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]"></span>
                  <span>Top: |0⟩ (+Z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"></span>
                  <span>Bottom: |1⟩ (-Z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
                  <span>Right: |+⟩ (+X)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]"></span>
                  <span>Left: |−⟩ (-X)</span>
                </div>
              </div>
            </div>

            {/* Pointer Status HUD */}
            <div className="w-full mt-4 bg-[#0B1528] border border-[#1E293B] rounded-xl p-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[#64748B]">Current Pointer:</span>
                <span className="text-[#F8FAFC] font-bold">{stateLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#64748B]">Motion:</span>
                <span
                  className={`font-semibold ${
                    isAnimating ? 'text-[#F59E0B]' : 'text-[#10B981]'
                  }`}
                >
                  {isAnimating ? '180° Rotating...' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE STEP LESSON CONTENT                    */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-[#08111F]/90 border border-[#1E293B] rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            {/* Step Breadcrumb Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                  Step {currentStep} of {totalSteps}
                </span>
                <h2 className="text-base font-bold text-[#F8FAFC]">
                  {stepTitles[currentStep - 1]}
                </h2>
              </div>
            </div>

            {/* STEP 1: START FROM X */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Start from something familiar. In the beginner track, we met the{' '}
                  <strong className="text-[#F8FAFC]">X Gate</strong>, which flips a
                  basis state across the horizontal axis:
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono text-center text-sm">
                  <div className="bg-[#0B1528] border border-[#1E293B] p-3 rounded-xl">
                    <span className="text-xs text-[#64748B] block mb-1">From North Pole</span>
                    <span className="text-[#38BDF8] font-bold">X|0⟩ = |1⟩</span>
                  </div>
                  <div className="bg-[#0B1528] border border-[#1E293B] p-3 rounded-xl">
                    <span className="text-xs text-[#64748B] block mb-1">From South Pole</span>
                    <span className="text-[#C084FC] font-bold">X|1⟩ = |0⟩</span>
                  </div>
                </div>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl flex items-center justify-between">
                  <div className="font-mono text-xs text-[#94A3B8]">
                    Current State:{' '}
                    <strong className="text-[#F8FAFC]">
                      {step1State === '0' ? '|0⟩ (top)' : '|1⟩ (bottom)'}
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      setStep1State((prev) => (prev === '0' ? '1' : '0'));
                      setStep1FlippedOnce(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8]/30 transition font-mono text-xs font-bold"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Apply X Gate
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#F59E0B]/30">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] mb-1.5 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    A Key Question
                  </h3>
                  <p className="text-sm text-[#E2E8F0]">
                    Can another gate also move <span className="font-mono text-[#38BDF8]">|0⟩</span> to{' '}
                    <span className="font-mono text-[#C084FC]">|1⟩</span>, but in a fundamentally different way?
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#94A3B8]">The answer is the:</span>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                      Y GATE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: THE Y-AXIS STICK */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Look at the Bloch sphere on the left. In 3D space, three perpendicular axes pass through the central origin:
                </p>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl font-mono text-xs space-y-2 text-[#CBD5E1]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Z Axis (Vertical):</span>
                    <span className="text-[#38BDF8] font-bold">Top |0⟩ ↔ Bottom |1⟩</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">X Axis (Horizontal):</span>
                    <span className="text-[#34D399] font-bold">Left |−⟩ ↔ Right |+⟩</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#F59E0B]/10 p-2 rounded border border-[#F59E0B]/30">
                    <span className="text-[#F59E0B] font-bold">Y Axis (Depth):</span>
                    <span className="text-[#FCD34D] font-bold">Into / Out of the screen</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                    The Rotation Stick Intuition
                  </h3>
                  <p className="text-sm text-[#E2E8F0] leading-relaxed">
                    Imagine a rigid skewer or stick passing directly through the center of the sphere in the depth direction:
                  </p>
                  <p className="text-sm font-semibold text-[#FCD34D] italic bg-[#0B1528] p-3 rounded-lg border border-[#1E293B]">
                    “The Y gate rotates the state vector 180° around this Y-axis stick.”
                  </p>
                </div>

                {!step2Explored ? (
                  <button
                    onClick={() => setStep2Explored(true)}
                    className="w-full py-2.5 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/30 font-mono text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    I See the Y-Axis Depth Stick
                  </button>
                ) : (
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#34D399] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Depth axis visualized. Now let’s test what happens when we start at |0⟩!
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Y ON |0⟩ */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Start with the state vector pointing straight up at{' '}
                  <span className="font-mono text-[#38BDF8] font-bold">|0⟩</span> (the top of the Bloch sphere).
                </p>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl text-center font-mono">
                  <span className="text-xs text-[#64748B] block mb-1">Theoretical Quantum Equation</span>
                  <span className="text-lg font-bold text-[#F59E0B]">Y|0⟩ = i|1⟩</span>
                </div>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#94A3B8]">Interactive Rotation:</span>
                    <button
                      onClick={() => setStep3Transformed((prev) => !prev)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F59E0B] text-[#030712] font-mono text-xs font-bold hover:bg-[#FBBF24] transition shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {step3Transformed ? 'Reset to |0⟩' : 'Apply Y Gate (Rotate 180°)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs pt-2 border-t border-[#1E293B]">
                    <div className="p-2 rounded bg-[#030712]/60">
                      <span className="text-[#64748B] block text-[10px]">Start</span>
                      <span className="text-[#38BDF8] font-bold">|0⟩ (top)</span>
                    </div>
                    <div className="p-2 rounded bg-[#030712]/60 flex items-center justify-center text-[#F59E0B] font-bold">
                      ↓ 180° Y-rot
                    </div>
                    <div className="p-2 rounded bg-[#030712]/60">
                      <span className="text-[#64748B] block text-[10px]">Result</span>
                      <span className="text-[#C084FC] font-bold">i|1⟩</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] space-y-2 text-sm text-[#E2E8F0]">
                  <p>
                    <strong className="text-[#F8FAFC]">Look closely at the sphere:</strong> Visually, the pointer rotated around the depth stick and ended at the bottom pole{' '}
                    <span className="font-mono text-[#C084FC] font-bold">|1⟩</span>.
                  </p>
                  <p>
                    Yet mathematically, the state is written as{' '}
                    <span className="font-mono text-[#FCD34D] font-bold">i|1⟩</span>.
                  </p>
                  <p className="text-xs text-[#94A3B8] italic pt-1 border-t border-[#1E293B]">
                    Why does <span className="font-mono text-[#FCD34D]">i|1⟩</span> point to the exact same place as{' '}
                    <span className="font-mono text-[#C084FC]">|1⟩</span>? Let’s demystify <span className="font-mono text-[#FCD34D]">i</span>.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: EXPLAIN i & OVERALL PHASE */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-[#0B1528] border border-[#1E293B] p-3 rounded-xl flex items-center justify-between font-mono text-xs">
                  <span className="text-[#94A3B8]">The Imaginary Unit:</span>
                  <span className="text-[#FCD34D] font-bold px-3 py-1 bg-[#F59E0B]/10 rounded border border-[#F59E0B]/30">
                    i² = −1
                  </span>
                </div>

                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  <strong className="text-[#F8FAFC]">Good news:</strong> You do not need complex-number mathematics yet! In quantum states,{' '}
                  <span className="font-mono text-[#FCD34D] font-bold">i</span> simply carries{' '}
                  <strong className="text-[#F8FAFC]">phase information</strong>.
                </p>

                {/* Side-by-side comparison */}
                <div className="grid grid-cols-2 gap-3 font-mono text-center text-xs">
                  <button
                    onClick={() => setStep4ActiveTab('1')}
                    className={`p-3 rounded-xl border transition ${
                      step4ActiveTab === '1'
                        ? 'bg-[#C084FC]/20 border-[#C084FC] text-[#F8FAFC]'
                        : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                    }`}
                  >
                    <span className="block text-base font-bold text-[#C084FC] mb-1">|1⟩</span>
                    <span>Standard South Pole</span>
                  </button>

                  <button
                    onClick={() => setStep4ActiveTab('i1')}
                    className={`p-3 rounded-xl border transition ${
                      step4ActiveTab === 'i1'
                        ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F8FAFC]'
                        : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                    }`}
                  >
                    <span className="block text-base font-bold text-[#FCD34D] mb-1">i|1⟩</span>
                    <span>Multiplied by i</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#38BDF8]/30 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
                    Overall Phase Rule
                  </h3>
                  <p className="text-sm text-[#E2E8F0] leading-relaxed">
                    If <span className="font-mono text-[#FCD34D]">i</span> multiplies the <em>whole state</em>, it is an{' '}
                    <strong className="text-[#38BDF8]">overall phase factor</strong>. Overall phase cannot be detected in any measurement and does not change the physical qubit state!
                  </p>
                  <div className="bg-[#0B1528] p-3 rounded-lg font-mono text-xs text-[#CBD5E1] space-y-1">
                    <div className="text-[#34D399] font-bold">|1⟩ and i|1⟩:</div>
                    <div>→ Same Bloch-sphere pointer (bottom pole)</div>
                    <div>→ Same measurement probabilities (100% |1⟩)</div>
                    <div>→ Same physical qubit state</div>
                  </div>
                </div>

                {!step4Understood ? (
                  <button
                    onClick={() => setStep4Understood(true)}
                    className="w-full py-2.5 rounded-xl bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 hover:bg-[#34D399]/30 font-mono text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    I Understand: Overall Phase Leaves the Pointer at the Same Point
                  </button>
                ) : (
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#34D399] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Concept locked. Next, let’s verify the measurement probability!
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: PROBABILITY CHECK */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Let’s verify whether multiplying by <span className="font-mono text-[#FCD34D]">i</span> changes what you see when measuring:
                </p>

                {/* State selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStep5SelectedState('i1');
                      setStep5Choice(null);
                    }}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                      step5SelectedState === 'i1'
                        ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#FCD34D] font-bold'
                        : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                    }`}
                  >
                    State: i|1⟩
                  </button>
                  <button
                    onClick={() => {
                      setStep5SelectedState('minus_i0');
                      setStep5Choice(null);
                    }}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                      step5SelectedState === 'minus_i0'
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                        : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                    }`}
                  >
                    State: −i|0⟩
                  </button>
                </div>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl font-mono text-xs space-y-2">
                  {step5SelectedState === 'i1' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">State vector:</span>
                        <span className="text-[#FCD34D] font-bold">i|1⟩</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Amplitude of |1⟩:</span>
                        <span className="text-[#E2E8F0]">i</span>
                      </div>
                      <div className="flex justify-between border-t border-[#1E293B] pt-2">
                        <span className="text-[#64748B]">Probability P(1) = |i|²:</span>
                        <span className="text-[#34D399] font-bold">1 = 100%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">State vector:</span>
                        <span className="text-[#38BDF8] font-bold">−i|0⟩</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Amplitude of |0⟩:</span>
                        <span className="text-[#E2E8F0]">−i</span>
                      </div>
                      <div className="flex justify-between border-t border-[#1E293B] pt-2">
                        <span className="text-[#64748B]">Probability P(0) = |−i|²:</span>
                        <span className="text-[#34D399] font-bold">1 = 100%</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#94A3B8] block">
                    Concept Check: Does <span className="text-[#FCD34D]">i</span> mean an imaginary measurement outcome?
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStep5Choice('complex')}
                      className={`p-2.5 rounded-lg border font-mono text-xs text-left transition ${
                        step5Choice === 'complex'
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#F87171]'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#CBD5E1] hover:border-[#475569]'
                      }`}
                    >
                      Yes, measurement gives i
                    </button>
                    <button
                      onClick={() => setStep5Choice('100')}
                      className={`p-2.5 rounded-lg border font-mono text-xs text-left transition ${
                        step5Choice === '100'
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#34D399]'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#CBD5E1] hover:border-[#475569]'
                      }`}
                    >
                      No, probability is 100% real
                    </button>
                  </div>
                </div>

                {step5Choice === '100' && (
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#34D399] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Correct! Since |i|² = 1, measurement outcomes are always strictly 0 or 1 with 100% certainty.
                  </div>
                )}
                {step5Choice === 'complex' && (
                  <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs font-mono text-[#F87171]">
                    Not quite! Measuring a physical qubit always yields a real classical bit (0 or 1). The factor i is phase information.
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Y ON |1⟩ */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Now let’s begin at the South Pole with{' '}
                  <span className="font-mono text-[#C084FC] font-bold">|1⟩</span> and apply the Y gate:
                </p>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl text-center font-mono">
                  <span className="text-xs text-[#64748B] block mb-1">Theoretical Quantum Equation</span>
                  <span className="text-lg font-bold text-[#F59E0B]">Y|1⟩ = −i|0⟩</span>
                </div>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#94A3B8]">Interactive Rotation:</span>
                    <button
                      onClick={() => setStep6Transformed((prev) => !prev)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F59E0B] text-[#030712] font-mono text-xs font-bold hover:bg-[#FBBF24] transition shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {step6Transformed ? 'Reset to |1⟩' : 'Apply Y Gate (Rotate 180°)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs pt-2 border-t border-[#1E293B]">
                    <div className="p-2 rounded bg-[#030712]/60">
                      <span className="text-[#64748B] block text-[10px]">Start</span>
                      <span className="text-[#C084FC] font-bold">|1⟩ (bottom)</span>
                    </div>
                    <div className="p-2 rounded bg-[#030712]/60 flex items-center justify-center text-[#F59E0B] font-bold">
                      ↓ 180° Y-rot
                    </div>
                    <div className="p-2 rounded bg-[#030712]/60">
                      <span className="text-[#64748B] block text-[10px]">Result</span>
                      <span className="text-[#38BDF8] font-bold">−i|0⟩</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] space-y-2 text-sm text-[#E2E8F0]">
                  <p>
                    <strong className="text-[#F8FAFC]">Physical Result:</strong> The equation says{' '}
                    <span className="font-mono text-[#FCD34D]">−i|0⟩</span>.
                  </p>
                  <p>
                    Because <span className="font-mono text-[#FCD34D]">−i</span> multiplies the entire state, it is purely an overall phase. The Bloch pointer sits precisely at the top pole{' '}
                    <span className="font-mono text-[#38BDF8] font-bold">|0⟩</span>.
                  </p>
                  <p className="text-xs font-mono text-[#34D399] pt-2 border-t border-[#1E293B]">
                    Visually: |1⟩ → |0⟩ · Mathematically: Y|1⟩ = −i|0⟩
                  </p>
                </div>
              </div>
            )}

            {/* STEP 7: COMPARE X AND Y */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Notice something striking about <strong className="text-[#38BDF8]">X</strong> and{' '}
                  <strong className="text-[#F59E0B]">Y</strong> when acting on the computational basis states:
                </p>

                {/* Inputs & Gates interactive grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B]">Starting State:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep7Input('0')}
                        className={`flex-1 py-1.5 rounded font-mono text-xs border ${
                          step7Input === '0'
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        |0⟩ (Top)
                      </button>
                      <button
                        onClick={() => setStep7Input('1')}
                        className={`flex-1 py-1.5 rounded font-mono text-xs border ${
                          step7Input === '1'
                            ? 'bg-[#C084FC]/20 border-[#C084FC] text-[#C084FC] font-bold'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        |1⟩ (Bottom)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B]">Select Gate:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep7Gate('X')}
                        className={`flex-1 py-1.5 rounded font-mono text-xs border ${
                          step7Gate === 'X'
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        X Gate
                      </button>
                      <button
                        onClick={() => setStep7Gate('Y')}
                        className={`flex-1 py-1.5 rounded font-mono text-xs border ${
                          step7Gate === 'Y'
                            ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] font-bold'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        Y Gate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0B1528] border border-[#1E293B] rounded-xl p-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
                    <span className="text-[#64748B]">Equation Result:</span>
                    <span className="text-sm font-bold text-[#F8FAFC]">
                      {step7Input === '0'
                        ? step7Gate === 'X'
                          ? 'X|0⟩ = |1⟩'
                          : 'Y|0⟩ = i|1⟩'
                        : step7Gate === 'X'
                        ? 'X|1⟩ = |0⟩'
                        : 'Y|1⟩ = −i|0⟩'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Bloch Pointer Location:</span>
                    <span className="text-sm font-bold text-[#34D399]">
                      {step7Input === '0' ? 'Bottom Pole (|1⟩)' : 'Top Pole (|0⟩)'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#EF4444]/30 space-y-2 text-sm text-[#E2E8F0]">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EF4444] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Crucial Warning: Don't Confuse X and Y
                  </h3>
                  <p>
                    For these two starting states (|0⟩ and |1⟩), X and Y end at the <em>exact same Bloch-sphere point</em>.
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    They can give the same pointer position for some inputs, but they are <strong className="text-[#F8FAFC]">different operations</strong>. Next, let’s test a state where X and Y behave completely differently!
                  </p>
                </div>
              </div>
            )}

            {/* STEP 8: WHERE X AND Y DIFFER (|+⟩ TEST) */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Start with the superposition state{' '}
                  <span className="font-mono text-[#34D399] font-bold">|+⟩</span> on the right side of the equator:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep8AppliedGate('X')}
                    className={`p-3 rounded-xl border text-left font-mono transition ${
                      step8AppliedGate === 'X'
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8]'
                        : 'bg-[#0B1528] border-[#1E293B] hover:border-[#475569]'
                    }`}
                  >
                    <span className="text-xs text-[#38BDF8] font-bold block mb-1">Apply X Gate</span>
                    <span className="text-xs text-[#94A3B8]">
                      |+⟩ lies ON the X stick → pointer stays at |+⟩!
                    </span>
                  </button>

                  <button
                    onClick={() => setStep8AppliedGate('Y')}
                    className={`p-3 rounded-xl border text-left font-mono transition ${
                      step8AppliedGate === 'Y'
                        ? 'bg-[#F59E0B]/20 border-[#F59E0B]'
                        : 'bg-[#0B1528] border-[#1E293B] hover:border-[#475569]'
                    }`}
                  >
                    <span className="text-xs text-[#F59E0B] font-bold block mb-1">Apply Y Gate</span>
                    <span className="text-xs text-[#94A3B8]">
                      Rotates 180° around depth stick → moves to |−⟩!
                    </span>
                  </button>
                </div>

                <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Starting State:</span>
                    <span className="text-[#34D399] font-bold">|+⟩ (Right side of equator)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Action on Pointer:</span>
                    <span className="text-[#F8FAFC] font-bold">
                      {step8AppliedGate === 'none'
                        ? 'Select a gate above'
                        : step8AppliedGate === 'X'
                        ? 'X|+⟩ → Unchanged at |+⟩'
                        : 'Y|+⟩ = −i|−⟩ → Swings to |−⟩'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#34D399]/30 text-sm text-[#E2E8F0] space-y-1">
                  <p className="font-semibold text-[#34D399]">Now the distinction is crystal clear:</p>
                  <p className="text-xs text-[#CBD5E1]">
                    Because the overall factor <span className="font-mono text-[#FCD34D]">−i</span> does not change the Bloch point, the pointer on the equator moved from <span className="font-mono text-[#34D399]">|+⟩</span> (right) to <span className="font-mono text-[#C084FC]">|−⟩</span> (left).
                  </p>
                  <p className="text-xs text-[#94A3B8] pt-1">
                    X kept the pointer still, while Y rotated it across the equator. X and Y are distinct physical transformations.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 9: OVERALL PHASE VS RELATIVE PHASE */}
            {currentStep === 9 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  To complete your quantum intuition, compare <strong className="text-[#38BDF8]">Overall Phase</strong> with{' '}
                  <strong className="text-[#F59E0B]">Relative Phase</strong>:
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep9PhaseMode('overall')}
                    className={`flex-1 py-2.5 rounded-xl font-mono text-xs border transition ${
                      step9PhaseMode === 'overall'
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                        : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                    }`}
                  >
                    1. Overall Phase
                  </button>
                  <button
                    onClick={() => setStep9PhaseMode('relative')}
                    className={`flex-1 py-2.5 rounded-xl font-mono text-xs border transition ${
                      step9PhaseMode === 'relative'
                        ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] font-bold'
                        : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                    }`}
                  >
                    2. Relative Phase
                  </button>
                </div>

                {step9PhaseMode === 'overall' ? (
                  <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl font-mono text-xs space-y-3">
                    <div className="text-sm font-bold text-[#38BDF8]">State: i|1⟩</div>
                    <p className="text-[#CBD5E1] font-sans text-xs leading-relaxed">
                      The <span className="font-mono text-[#FCD34D]">i</span> multiplies the <strong>entire state</strong>.
                    </p>
                    <div className="p-3 bg-[#030712] rounded-lg text-[#34D399] space-y-1">
                      <div>✓ Result: Same Bloch point as |1⟩ (bottom pole)</div>
                      <div>✓ Result: Same physical state</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl font-mono text-xs space-y-3">
                    <div className="text-sm font-bold text-[#FCD34D]">
                      State: (1/√2)|0⟩ + (i/√2)|1⟩
                    </div>
                    <p className="text-[#CBD5E1] font-sans text-xs leading-relaxed">
                      Here, only the <span className="font-mono text-[#C084FC]">|1⟩</span> component has the factor <span className="font-mono text-[#FCD34D]">i</span> relative to <span className="font-mono text-[#38BDF8]">|0⟩</span>.
                    </p>
                    <div className="p-3 bg-[#030712] rounded-lg text-[#F59E0B] space-y-1">
                      <div>✓ Result: Points in a DIFFERENT direction (along Y depth axis)</div>
                      <div>✓ Both still have P(0) = 50% and P(1) = 50%</div>
                      <div>✓ But pointer direction in space is completely different!</div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-[#94A3B8] font-mono space-y-1">
                  <div className="text-[#F8FAFC] font-bold">Key Distinction:</div>
                  <div>• Overall phase multiplies EVERYTHING → Pointer doesn't move.</div>
                  <div>• Relative phase differences between components → Pointer points in a new direction!</div>
                </div>
              </div>
            )}

            {/* STEP 10: Y GATE SUMMARY */}
            {currentStep === 10 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#34D399] mb-1 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    Mastery Unlocked: The Y Gate
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    You understand single-qubit Y rotations, imaginary phase units, and overall phase conservation on the Bloch sphere.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="bg-[#0B1528] border border-[#1E293B] p-3 rounded-xl">
                    <span className="text-[#64748B] block mb-1">Rotation Axis</span>
                    <span className="text-[#F59E0B] font-bold">180° around Y (depth)</span>
                  </div>
                  <div className="bg-[#0B1528] border border-[#1E293B] p-3 rounded-xl">
                    <span className="text-[#64748B] block mb-1">Phase Effect</span>
                    <span className="text-[#FCD34D] font-bold">Y|0⟩ = i|1⟩ · Y|1⟩ = −i|0⟩</span>
                  </div>
                  <div className="bg-[#0B1528] border border-[#1E293B] p-3 rounded-xl">
                    <span className="text-[#64748B] block mb-1">Bloch Pointer Flips</span>
                    <span className="text-[#38BDF8] font-bold">|0⟩ ↔ |1⟩ and |+⟩ ↔ |−⟩</span>
                  </div>
                  <div className="bg-[#0B1528] border border-[#1E293B] p-3 rounded-xl">
                    <span className="text-[#64748B] block mb-1">Overall Phase</span>
                    <span className="text-[#34D399] font-bold">Pointer stays identical</span>
                  </div>
                </div>

                <div className="bg-[#0F172A] border border-[#1E293B] p-4 rounded-xl font-mono text-xs text-[#CBD5E1] space-y-1.5">
                  <div className="text-[#F8FAFC] font-bold mb-1">Takeaways to Remember:</div>
                  <div>• i|1⟩ and |1⟩ share the exact same Bloch point (South Pole).</div>
                  <div>• −i|0⟩ and |0⟩ share the exact same Bloch point (North Pole).</div>
                  <div>• Overall phase does not move the Bloch pointer or change measurement probabilities.</div>
                  <div>• Relative phase can steer the pointer toward new directions on the sphere.</div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onComplete();
                      if (onNextLesson) onNextLesson();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#030712] font-mono text-xs font-bold hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>NEXT: ROTATION GATES</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            {currentStep < 10 && (
              <div className="mt-6 pt-4 border-t border-[#1E293B]">
                <LessonNavControls
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  canContinue={currentStep <= maxUnlockedStep}
                  onBack={handlePrevStep}
                  onContinue={handleNextStep}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </LessonShell>
);
};
