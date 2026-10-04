import React, { useState, useEffect, useRef } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { BlochSphereVisualizer } from '../components/bloch/BlochSphereVisualizer';
import {
  RotateCcw,
  Sparkles,
  HelpCircle,
  Play,
  Check,
  Compass,
  ArrowRight,
  History,
  Sliders,
  Award,
  Layers,
  Repeat,
} from 'lucide-react';
import {
  getRotatedState,
  getMeasurementProbabilities,
  sphericalToCartesian,
} from '../utils/rotationPhysics';

interface RotationGatesLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
  onNextLesson?: () => void;
}

export type BaseStateId = '0' | '1' | '+' | '-' | '+y' | '-y';

export interface BaseStateDef {
  id: BaseStateId;
  label: string;
  name: string;
  theta: number;
  phi: number;
  accent: 'cyan' | 'purple' | 'emerald' | 'amber';
}

export const BASE_STATES: Record<BaseStateId, BaseStateDef> = {
  '0': {
    id: '0',
    label: '|0⟩',
    name: 'North Pole (+Z)',
    theta: 0,
    phi: 0,
    accent: 'cyan',
  },
  '1': {
    id: '1',
    label: '|1⟩',
    name: 'South Pole (-Z)',
    theta: Math.PI,
    phi: 0,
    accent: 'purple',
  },
  '+': {
    id: '+',
    label: '|+⟩',
    name: 'Right Equator (+X)',
    theta: Math.PI / 2,
    phi: 0,
    accent: 'emerald',
  },
  '-': {
    id: '-',
    label: '|−⟩',
    name: 'Left Equator (-X)',
    theta: Math.PI / 2,
    phi: Math.PI,
    accent: 'purple',
  },
  '+y': {
    id: '+y',
    label: '|+i⟩',
    name: 'Front (+Y out)',
    theta: Math.PI / 2,
    phi: Math.PI / 2,
    accent: 'amber',
  },
  '-y': {
    id: '-y',
    label: '|−i⟩',
    name: 'Back (-Y in)',
    theta: Math.PI / 2,
    phi: (3 * Math.PI) / 2,
    accent: 'amber',
  },
};

export const RotationGatesLessonView: React.FC<RotationGatesLessonViewProps> = ({
  onExit,
  onComplete,
  onNextLesson,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 12;
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // Common interactive state for Steps 3, 4, 5, 6
  const [step3Angle, setStep3Angle] = useState(0); // Rx on |0⟩
  const [step4Angle, setStep4Angle] = useState(0); // Ry on |0⟩
  const [step5Start, setStep5Start] = useState<BaseStateId>('0');
  const [step5Angle, setStep5Angle] = useState(0); // Rz on |0⟩ or |+⟩

  // Step 6: Multi-comparator
  const [step6Start, setStep6Start] = useState<BaseStateId>('0');
  const [step6Axis, setStep6Axis] = useState<'X' | 'Y' | 'Z'>('Y');
  const [step6Angle, setStep6Angle] = useState(90);

  // Step 7: Connection to X, Y, Z
  const [step7Mode, setStep7Mode] = useState<'X' | 'Y' | 'Z'>('X');
  const [step7UseContinuous, setStep7UseContinuous] = useState(false);
  const [step7Angle, setStep7Angle] = useState(180);

  // Step 8: Invariance rules test
  const [step8State, setStep8State] = useState<BaseStateId>('+');
  const [step8Axis, setStep8Axis] = useState<'X' | 'Y' | 'Z'>('X');
  const [step8Angle, setStep8Angle] = useState(90);

  // Step 9: Full Interactive Rotation Playground
  const [playgroundStart, setPlaygroundStart] = useState<BaseStateId>('0');
  const [playgroundAxis, setPlaygroundAxis] = useState<'X' | 'Y' | 'Z'>('Y');
  const [playgroundAngle, setPlaygroundAngle] = useState(90);

  // Step 10: Predict & Rotate
  const [step10Idx, setStep10Idx] = useState(0);
  const [step10Selected, setStep10Selected] = useState<string | null>(null);
  const [step10Angle, setStep10Angle] = useState(0);
  const [step10Solved, setStep10Solved] = useState<number[]>([]);

  // Step 11: Repeated rotations demo
  const [step11Axis, setStep11Axis] = useState<'X' | 'Y' | 'Z'>('X');
  const [step11QuarterSteps, setStep11QuarterSteps] = useState(0); // 0, 1, 2, 3, 4 (0 to 360)

  // Step 10 quiz definitions
  const PREDICT_CHALLENGES = [
    {
      id: 1,
      start: '0' as BaseStateId,
      axis: 'X' as const,
      angle: 180,
      question: 'Start at |0⟩. Apply Rx(180°). Where does the pointer end?',
      options: ['|1⟩', '|0⟩', '|+⟩', '|−⟩'],
      answer: '|1⟩',
      explanation: 'Rx rotates 180° around the horizontal X stick, flipping top |0⟩ directly to bottom |1⟩.',
    },
    {
      id: 2,
      start: '+' as BaseStateId,
      axis: 'Z' as const,
      angle: 180,
      question: 'Start at |+⟩. Apply Rz(180°). Where does the pointer end?',
      options: ['|−⟩', '|+⟩', '|0⟩', '|1⟩'],
      answer: '|−⟩',
      explanation: 'Rz rotates 180° around the vertical Z stick, swinging right |+⟩ across the equator to left |−⟩.',
    },
    {
      id: 3,
      start: '0' as BaseStateId,
      axis: 'Z' as const,
      angle: 90,
      question: 'Start at |0⟩. Apply Rz(90°). Where does the pointer end?',
      options: ['Same Bloch point |0⟩', '|1⟩', '|+⟩', '|−⟩'],
      answer: 'Same Bloch point |0⟩',
      explanation: '|0⟩ lies directly on the vertical Z stick! Any rotation around Z leaves its Bloch point unchanged.',
    },
    {
      id: 4,
      start: '0' as BaseStateId,
      axis: 'Y' as const,
      angle: 90,
      question: 'Start at |0⟩. Apply Ry(90°). Where does the pointer move?',
      options: ['Toward |+⟩ (Right equator)', 'Toward |−⟩', '|1⟩', 'Stays at |0⟩'],
      answer: 'Toward |+⟩ (Right equator)',
      explanation: 'Ry rotates around the depth stick. A 90° turn tilts the North Pole directly toward the right equator (|+⟩).',
    },
    {
      id: 5,
      start: '+' as BaseStateId,
      axis: 'X' as const,
      angle: 90,
      question: 'Start at |+⟩. Apply Rx(90°). Where does the pointer end?',
      options: ['Same Bloch point |+⟩', 'Toward |0⟩', 'Toward |1⟩', '|−⟩'],
      answer: 'Same Bloch point |+⟩',
      explanation: '|+⟩ lies right ON the horizontal X stick! Rotating around the X axis leaves it right in place.',
    },
  ];

  // Dynamic visual state calculation depending on currentStep
  let targetTheta = 0;
  let targetPhi = 0;
  let activeStick: 'X' | 'Y' | 'Z' | null = null;
  let displayGateLabel = 'State Vector';
  let pointerAccent: 'cyan' | 'purple' | 'emerald' | 'amber' = 'cyan';

  if (currentStep === 1) {
    // Introduction
    targetTheta = 0;
    targetPhi = 0;
    activeStick = 'X';
    displayGateLabel = '|0⟩ (Top)';
  } else if (currentStep === 2) {
    // Angle breakdown (0, 90, 180, 270, 360)
    targetTheta = 0;
    targetPhi = 0;
    activeStick = null;
    displayGateLabel = 'Rotation θ';
  } else if (currentStep === 3) {
    // Rx on |0⟩
    activeStick = 'X';
    const rot = getRotatedState(0, 0, 'X', step3Angle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `Rx(${step3Angle}°) on |0⟩`;
    pointerAccent = 'cyan';
  } else if (currentStep === 4) {
    // Ry on |0⟩
    activeStick = 'Y';
    const rot = getRotatedState(0, 0, 'Y', step4Angle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `Ry(${step4Angle}°) on |0⟩`;
    pointerAccent = 'amber';
  } else if (currentStep === 5) {
    // Rz on |0⟩ or |+⟩
    activeStick = 'Z';
    const startDef = BASE_STATES[step5Start];
    const rot = getRotatedState(startDef.theta, startDef.phi, 'Z', step5Angle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `Rz(${step5Angle}°) on ${startDef.label}`;
    pointerAccent = 'purple';
  } else if (currentStep === 6) {
    // Compare Rx, Ry, Rz
    activeStick = step6Axis;
    const startDef = BASE_STATES[step6Start];
    const rot = getRotatedState(startDef.theta, startDef.phi, step6Axis, step6Angle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `R${step6Axis.toLowerCase()}(${step6Angle}°) on ${startDef.label}`;
    pointerAccent = startDef.accent;
  } else if (currentStep === 7) {
    // Connect to X, Y, Z (180°)
    activeStick = step7Mode;
    const rot = getRotatedState(0, 0, step7Mode, step7Angle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `${step7Mode} Gate ≈ R${step7Mode.toLowerCase()}(${step7Angle}°)`;
    pointerAccent = step7Mode === 'X' ? 'cyan' : step7Mode === 'Y' ? 'amber' : 'purple';
  } else if (currentStep === 8) {
    // Axis Invariance
    activeStick = step8Axis;
    const startDef = BASE_STATES[step8State];
    const rot = getRotatedState(startDef.theta, startDef.phi, step8Axis, step8Angle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `R${step8Axis.toLowerCase()}(${step8Angle}°) on ${startDef.label}`;
    pointerAccent = startDef.accent;
  } else if (currentStep === 9) {
    // Interactive Playground
    activeStick = playgroundAxis;
    const startDef = BASE_STATES[playgroundStart];
    const rot = getRotatedState(startDef.theta, startDef.phi, playgroundAxis, playgroundAngle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `R${playgroundAxis.toLowerCase()}(${playgroundAngle}°) on ${startDef.label}`;
    pointerAccent = startDef.accent;
  } else if (currentStep === 10) {
    // Predict then Rotate
    const q = PREDICT_CHALLENGES[step10Idx];
    activeStick = q.axis;
    const startDef = BASE_STATES[q.start];
    const rot = getRotatedState(startDef.theta, startDef.phi, q.axis, step10Angle);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `R${q.axis.toLowerCase()}(${step10Angle}°) on ${startDef.label}`;
    pointerAccent = 'cyan';
  } else if (currentStep === 11) {
    // Same rotation repeated (90 x 4)
    activeStick = step11Axis;
    const totalDeg = step11QuarterSteps * 90;
    const rot = getRotatedState(0, 0, step11Axis, totalDeg);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = `R${step11Axis.toLowerCase()}(${totalDeg}°) on |0⟩`;
    pointerAccent = 'emerald';
  } else if (currentStep === 12) {
    // Final Summary
    activeStick = 'Y';
    const rot = getRotatedState(0, 0, 'Y', 45);
    targetTheta = rot.theta;
    targetPhi = rot.phi;
    displayGateLabel = 'Continuous Bloch State';
    pointerAccent = 'cyan';
  }

  // Smooth continuous animation hook for angles
  const [animTheta, setAnimTheta] = useState(targetTheta);
  const [animPhi, setAnimPhi] = useState(targetPhi);
  const [isRotating, setIsRotating] = useState(false);

  const animRef = useRef<{
    startT: number;
    endT: number;
    startP: number;
    endP: number;
    startTime: number;
    rafId: number | null;
  }>({
    startT: targetTheta,
    endT: targetTheta,
    startP: targetPhi,
    endP: targetPhi,
    startTime: 0,
    rafId: null,
  });

  useEffect(() => {
    if (animRef.current.rafId !== null) {
      cancelAnimationFrame(animRef.current.rafId);
      animRef.current.rafId = null;
    }

    const startT = animTheta;
    const endT = targetTheta;
    const startP = animPhi;
    const endP = targetPhi;

    if (Math.abs(startT - endT) < 0.002 && Math.abs(startP - endP) < 0.002) {
      setIsRotating(false);
      return;
    }

    setIsRotating(true);
    const startTime = performance.now();
    const duration = 500; // ms

    animRef.current = {
      startT,
      endT,
      startP,
      endP,
      startTime,
      rafId: null,
    };

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimTheta(startT + (endT - startT) * ease);
      setAnimPhi(startP + (endP - startP) * ease);

      if (progress < 1) {
        animRef.current.rafId = requestAnimationFrame(tick);
      } else {
        setAnimTheta(endT);
        setAnimPhi(endP);
        setIsRotating(false);
        animRef.current.rafId = null;
      }
    };

    animRef.current.rafId = requestAnimationFrame(tick);

    return () => {
      if (animRef.current.rafId !== null) {
        cancelAnimationFrame(animRef.current.rafId);
      }
    };
  }, [targetTheta, targetPhi]);

  const { p0, p1 } = getMeasurementProbabilities(animTheta);

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
    'Beyond Fixed 180° Flips',
    'What Does Angle θ Mean?',
    'Rx(θ) — Rotation Around X Stick',
    'Ry(θ) — Rotation Around Y Stick',
    'Rz(θ) — Rotation Around Z Stick',
    'Side-by-Side Comparison: Rx vs Ry vs Rz',
    'Connecting Rotation Gates to X, Y, Z',
    'When Does the Pointer Not Move?',
    'Interactive Continuous Playground',
    'Predict Then Rotate',
    'Accumulating Rotations (90° × 4 = 360°)',
    'Master Geometric Mental Model',
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
          {/* =============================================================== */}
          {/* LEFT: MAIN LARGE BLOCH SPHERE                                  */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full bg-[#08111F]/90 border border-[#1E293B] rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center">
              {/* Header HUD: Active Stick Indicator */}
              <div className="w-full flex items-center justify-between mb-2 border-b border-[#1E293B]/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
                  <span className="text-xs font-mono font-semibold tracking-wider text-[#94A3B8] uppercase">
                    3D Rotation Visualizer
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="text-[#64748B]">Active Stick:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      activeStick === 'X'
                        ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                        : activeStick === 'Y'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                        : activeStick === 'Z'
                        ? 'bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/40'
                        : 'bg-[#1E293B] text-[#94A3B8]'
                    }`}
                  >
                    {activeStick ? `${activeStick}-Axis Stick` : 'None'}
                  </span>
                </div>
              </div>

              {/* Large Bloch Sphere Visualizer */}
              <div className="relative my-2">
                <BlochSphereVisualizer
                  theta={animTheta}
                  phi={animPhi}
                  stateLabel={displayGateLabel}
                  showPhaseMarkers={true}
                  showXAxisStick={activeStick === 'X'}
                  showYAxisStick={activeStick === 'Y'}
                  showZAxisStick={activeStick === 'Z'}
                  pointerAccent={pointerAccent}
                  size={340}
                  subtleNote="State vector arrow originates from center core with tip on shell."
                />

                {/* Compass coordinate guide */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 text-[10px] font-mono bg-[#0B1528]/85 border border-[#1E293B] p-2 rounded-lg pointer-events-none select-none text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                    <span>Top: |0⟩ (+Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]"></span>
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

              {/* State and Measurement Probability Panel */}
              <div className="w-full mt-2 bg-[#0B1528] border border-[#1E293B] rounded-xl p-3 flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#38BDF8]" />
                    <span className="text-[#64748B]">Current:</span>
                    <span className="text-[#F8FAFC] font-bold text-xs">{displayGateLabel}</span>
                  </div>
                  <span className={`text-[11px] ${isRotating ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                    {isRotating ? 'Rotating...' : 'Stable'}
                  </span>
                </div>

                {/* Live Probability Bars */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E293B]/80 text-[11px]">
                  <div>
                    <div className="flex justify-between text-[#94A3B8] mb-1">
                      <span>P(|0⟩):</span>
                      <span className="text-[#38BDF8] font-bold">{p0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#38BDF8] transition-all duration-300"
                        style={{ width: `${p0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[#94A3B8] mb-1">
                      <span>P(|1⟩):</span>
                      <span className="text-[#C084FC] font-bold">{p1}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C084FC] transition-all duration-300"
                        style={{ width: `${p1}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT: INTERACTIVE STEP LESSON & CONTROLS                       */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-[#08111F]/90 border border-[#1E293B] rounded-2xl p-6 shadow-2xl backdrop-blur-md">
              {/* Step Header */}
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <h2 className="text-base font-bold text-[#F8FAFC]">
                    {stepTitles[currentStep - 1]}
                  </h2>
                </div>
              </div>

              {/* STEP 1: CONNECT TO X, Y, Z */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    You have mastered the foundational Pauli gates:
                  </p>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-3 bg-[#0B1528] border border-[#38BDF8]/40 rounded-xl text-center">
                      <div className="text-sm font-bold text-[#38BDF8]">X Gate</div>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">Fixed 180° turn</div>
                      <div className="text-[10px] text-[#64748B]">around X axis</div>
                    </div>
                    <div className="p-3 bg-[#0B1528] border border-[#F59E0B]/40 rounded-xl text-center">
                      <div className="text-sm font-bold text-[#F59E0B]">Y Gate</div>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">Fixed 180° turn</div>
                      <div className="text-[10px] text-[#64748B]">around Y axis</div>
                    </div>
                    <div className="p-3 bg-[#0B1528] border border-[#A855F7]/40 rounded-xl text-center">
                      <div className="text-sm font-bold text-[#A855F7]">Z Gate</div>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">Fixed 180° turn</div>
                      <div className="text-[10px] text-[#64748B]">around Z axis</div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl space-y-2 text-center">
                    <div className="text-sm text-[#CBD5E1] font-semibold">
                      “What if we do not want a full 180° flip?”
                    </div>
                    <div className="text-xs text-[#94A3B8]">
                      What if our quantum algorithm requires rotating just 90°, 45°, or any fine-tuned angle?
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F172A] border border-[#38BDF8]/40 space-y-2">
                    <div className="text-xs font-mono font-bold uppercase text-[#38BDF8] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Introducing Rotation Gates
                    </div>
                    <div className="flex justify-around font-mono text-sm font-bold text-[#F8FAFC]">
                      <span>Rx(θ)</span>
                      <span>Ry(θ)</span>
                      <span>Rz(θ)</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] pt-1">
                      Here, the symbol <strong className="text-[#38BDF8]">θ (theta)</strong> simply tells us <em>how much to rotate</em>.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: WHAT DOES θ MEAN? */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Think of rotation in terms of intuitive angles on a clock face:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    <div className="p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl">
                      <div className="text-base font-bold text-[#38BDF8]">0°</div>
                      <div className="text-[#F8FAFC] font-semibold mt-0.5">No turn</div>
                      <div className="text-[11px] text-[#64748B]">State stays untouched</div>
                    </div>
                    <div className="p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl">
                      <div className="text-base font-bold text-[#34D399]">90°</div>
                      <div className="text-[#F8FAFC] font-semibold mt-0.5">Quarter turn</div>
                      <div className="text-[11px] text-[#64748B]">Rotates 1/4 of circle</div>
                    </div>
                    <div className="p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl">
                      <div className="text-base font-bold text-[#F59E0B]">180°</div>
                      <div className="text-[#F8FAFC] font-semibold mt-0.5">Half turn</div>
                      <div className="text-[11px] text-[#64748B]">Standard Pauli flip!</div>
                    </div>
                    <div className="p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl">
                      <div className="text-base font-bold text-[#A855F7]">360°</div>
                      <div className="text-[#F8FAFC] font-semibold mt-0.5">Full turn</div>
                      <div className="text-[11px] text-[#64748B]">Returns to start</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#CBD5E1] space-y-1">
                    <span className="font-bold text-[#F8FAFC] block">The Rotation Stick Principle:</span>
                    <p>
                      The gate name specifies the stick (X, Y, or Z), and θ specifies the angle of rotation around that stick.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Rx */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl font-mono text-xs text-[#38BDF8]">
                    <strong className="block mb-0.5 text-sm font-bold">Rx(θ):</strong>
                    Rotates the state vector around the horizontal X-axis stick.
                  </div>

                  <p className="text-xs text-[#94A3B8]">
                    Starting at <strong className="text-[#F8FAFC]">|0⟩</strong> (North Pole). Choose an angle to watch the vector rotate around the horizontal X stick:
                  </p>

                  {/* Angle preset buttons */}
                  <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                    {[0, 90, 180, 270, 360].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setStep3Angle(deg)}
                        className={`py-2 rounded-lg border transition font-bold text-center ${
                          step3Angle === deg
                            ? 'bg-[#38BDF8] text-[#030712] border-[#38BDF8]'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>

                  {/* Status explanation */}
                  <div className="p-3.5 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs space-y-1 text-[#CBD5E1]">
                    <div className="flex justify-between font-bold">
                      <span>Selected Angle:</span>
                      <span className="text-[#38BDF8]">{step3Angle}°</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {step3Angle === 0 && 'At 0°: Pointer remains at |0⟩ (North Pole).'}
                      {step3Angle === 90 && 'At 90°: Rotates quarter turn in depth, placing amplitudes at 50/50.'}
                      {step3Angle === 180 && 'At 180°: Reaches |1⟩ at the South Pole (exact X flip)!'}
                      {step3Angle === 270 && 'At 270°: Three-quarter turn around the X stick.'}
                      {step3Angle === 360 && 'At 360°: Full circle — returns precisely to |0⟩!'}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Ry */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl font-mono text-xs text-[#F59E0B]">
                    <strong className="block mb-0.5 text-sm font-bold">Ry(θ):</strong>
                    Rotates the state vector around the Y-axis depth stick (into/out of the screen).
                  </div>

                  <p className="text-xs text-[#94A3B8]">
                    Start at <strong className="text-[#F8FAFC]">|0⟩</strong>. Notice how Ry(90°) tilts the pointer directly toward <strong className="text-[#34D399]">|+⟩</strong> (right equator):
                  </p>

                  <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                    {[0, 90, 180, 270, 360].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setStep4Angle(deg)}
                        className={`py-2 rounded-lg border transition font-bold text-center ${
                          step4Angle === deg
                            ? 'bg-[#F59E0B] text-[#030712] border-[#F59E0B]'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs space-y-1.5 text-[#CBD5E1]">
                    <div className="flex justify-between font-bold">
                      <span>Selected Angle:</span>
                      <span className="text-[#F59E0B]">{step4Angle}°</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {step4Angle === 90 ? (
                        <span className="text-[#FCD34D]">
                          ★ Ry(90°) cleanly creates an equal superposition along the visible equator, moving from top |0⟩ toward right |+⟩!
                        </span>
                      ) : step4Angle === 180 ? (
                        'At 180°: Rotates half turn to South Pole |1⟩.'
                      ) : step4Angle === 360 ? (
                        'At 360°: Returns cleanly to North Pole |0⟩.'
                      ) : (
                        'Rotates smoothly along the visible vertical plane.'
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Rz */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#A855F7]/10 border border-[#A855F7]/30 rounded-xl font-mono text-xs text-[#D8B4FE]">
                    <strong className="block mb-0.5 text-sm font-bold">Rz(θ):</strong>
                    Rotates the state vector around the vertical Z-axis stick.
                  </div>

                  {/* Starting State Switcher */}
                  <div className="flex gap-2 font-mono text-xs">
                    <button
                      onClick={() => {
                        setStep5Start('0');
                        setStep5Angle(90);
                      }}
                      className={`flex-1 py-2 rounded-lg border transition ${
                        step5Start === '0'
                          ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                      }`}
                    >
                      Case A: Start at |0⟩ (On Z stick)
                    </button>
                    <button
                      onClick={() => {
                        setStep5Start('+');
                        setStep5Angle(90);
                      }}
                      className={`flex-1 py-2 rounded-lg border transition ${
                        step5Start === '+'
                          ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399] font-bold'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                      }`}
                    >
                      Case B: Start at |+⟩ (Equator)
                    </button>
                  </div>

                  {/* Angles */}
                  <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                    {[0, 90, 180, 270, 360].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setStep5Angle(deg)}
                        className={`py-2 rounded-lg border transition font-bold text-center ${
                          step5Angle === deg
                            ? 'bg-[#A855F7] text-[#030712] border-[#A855F7]'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs text-[#CBD5E1]">
                    {step5Start === '0' ? (
                      <p className="text-[#38BDF8]">
                        Because |0⟩ lies directly on the Z stick, rotating around Z by <strong>any angle</strong> leaves the Bloch pointer right at |0⟩!
                      </p>
                    ) : (
                      <p className="text-[#34D399]">
                        At |+⟩ (right equator), Rz rotates the vector along the equator: 90° swings toward Y, 180° reaches |−⟩, and 360° returns to |+⟩!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: COMPARE Rx, Ry, Rz */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <p className="text-xs text-[#94A3B8]">
                    Pick a starting state, rotation stick, and angle to observe how different axes drive distinct 3D paths:
                  </p>

                  {/* Starting State */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B]">Starting State:</span>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                      {(['0', '1', '+', '-'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStep6Start(st)}
                          className={`py-1.5 rounded border transition ${
                            step6Start === st
                              ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8]'
                          }`}
                        >
                          {BASE_STATES[st].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Axis */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B]">Rotation Gate:</span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      {(['X', 'Y', 'Z'] as const).map((ax) => (
                        <button
                          key={ax}
                          onClick={() => setStep6Axis(ax)}
                          className={`py-2 rounded-lg border transition font-bold ${
                            step6Axis === ax
                              ? ax === 'X'
                                ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                                : ax === 'Y'
                                ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                                : 'bg-[#A855F7]/20 border-[#A855F7] text-[#D8B4FE]'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          R{ax.toLowerCase()}(θ)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Angle */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B]">Angle θ:</span>
                    <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                      {[0, 90, 180, 270, 360].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => setStep6Angle(deg)}
                          className={`py-1.5 rounded border transition font-bold ${
                            step6Angle === deg
                              ? 'bg-[#F8FAFC] text-[#030712] border-[#F8FAFC]'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8]'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: CONNECTION TO NORMAL X, Y, Z */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Now the big connection clicks into place:
                  </p>

                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl space-y-2 text-center font-mono">
                    <div className="text-xs text-[#64748B] uppercase">Equivalent Bloch Motion</div>
                    <div className="grid grid-cols-3 gap-2 text-sm font-bold text-[#F8FAFC]">
                      <span className="text-[#38BDF8]">X ≈ Rx(180°)</span>
                      <span className="text-[#F59E0B]">Y ≈ Ry(180°)</span>
                      <span className="text-[#A855F7]">Z ≈ Rz(180°)</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    “For Bloch-sphere motion, the usual X, Y, and Z gates behave like 180° rotations around their matching axes.”
                  </p>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    {(['X', 'Y', 'Z'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setStep7Mode(g);
                          setStep7Angle(180);
                        }}
                        className={`p-2.5 rounded-xl border transition text-center font-bold ${
                          step7Mode === g
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        Compare {g} &amp; R{g.toLowerCase()}(180°)
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-[#0F172A] border border-[#334155] rounded-xl font-mono text-xs flex justify-between">
                    <span className="text-[#94A3B8]">Applied Motion:</span>
                    <span className="text-[#34D399] font-bold">180° Half-Turn around {step7Mode}</span>
                  </div>
                </div>
              )}

              {/* STEP 8: WHEN DOES THE POINTER NOT MOVE? */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#34D399] space-y-1">
                    <strong className="block text-sm font-bold">The Axis Invariance Rule:</strong>
                    <p>
                      “If the state vector lies on the rotation axis, rotating around that axis does not move it to a different Bloch point.”
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      onClick={() => {
                        setStep8State('+');
                        setStep8Axis('X');
                        setStep8Angle(90);
                      }}
                      className={`p-2.5 rounded-xl border text-left ${
                        step8Axis === 'X' && step8State === '+'
                          ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8]'
                      }`}
                    >
                      <div className="font-bold">Rx on |+⟩ or |−⟩</div>
                      <div className="text-[10px] text-[#64748B]">State on X stick → Unmoved</div>
                    </button>

                    <button
                      onClick={() => {
                        setStep8State('0');
                        setStep8Axis('Z');
                        setStep8Angle(90);
                      }}
                      className={`p-2.5 rounded-xl border text-left ${
                        step8Axis === 'Z' && step8State === '0'
                          ? 'bg-[#A855F7]/20 border-[#A855F7] text-[#D8B4FE]'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8]'
                      }`}
                    >
                      <div className="font-bold">Rz on |0⟩ or |1⟩</div>
                      <div className="text-[10px] text-[#64748B]">State on Z stick → Unmoved</div>
                    </button>
                  </div>

                  {/* Angle slider to test invariance */}
                  <div className="space-y-2 p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">Rotate θ:</span>
                      <span className="text-[#F8FAFC] font-bold">{step8Angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={step8Angle}
                      onChange={(e) => setStep8Angle(Number(e.target.value))}
                      className="w-full accent-[#38BDF8] cursor-pointer"
                    />
                    <div className="text-[11px] text-[#64748B]">
                      Notice: As you drag the angle, the state vector does not wander away because it has zero lever arm from the active stick!
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: INTERACTIVE ROTATION PLAYGROUND */}
              {currentStep === 9 && (
                <div className="space-y-4">
                  {/* Starting state picker (6 cardinal states) */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B]">Choose Starting State:</span>
                    <div className="grid grid-cols-6 gap-1 font-mono text-xs">
                      {(['0', '1', '+', '-', '+y', '-y'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setPlaygroundStart(st)}
                          className={`py-1.5 rounded border transition text-center ${
                            playgroundStart === st
                              ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8]'
                          }`}
                        >
                          {BASE_STATES[st].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Axis choice */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B]">Select Rotation Axis:</span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      {(['X', 'Y', 'Z'] as const).map((ax) => (
                        <button
                          key={ax}
                          onClick={() => setPlaygroundAxis(ax)}
                          className={`py-2 rounded-lg border font-bold transition ${
                            playgroundAxis === ax
                              ? ax === 'X'
                                ? 'bg-[#38BDF8] text-[#030712] border-[#38BDF8]'
                                : ax === 'Y'
                                ? 'bg-[#F59E0B] text-[#030712] border-[#F59E0B]'
                                : 'bg-[#A855F7] text-[#030712] border-[#A855F7]'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8]'
                          }`}
                        >
                          R{ax.toLowerCase()}(θ) Stick
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continuous Slider & Quick Buttons */}
                  <div className="p-3.5 bg-[#0B1528] border border-[#1E293B] rounded-xl space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#94A3B8] flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                        Continuous Angle Slider:
                      </span>
                      <span className="text-[#F8FAFC] font-bold text-sm bg-[#030712] px-2 py-0.5 rounded border border-[#1E293B]">
                        {playgroundAngle}°
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="2"
                      value={playgroundAngle}
                      onChange={(e) => setPlaygroundAngle(Number(e.target.value))}
                      className="w-full accent-[#38BDF8] cursor-pointer"
                    />

                    {/* Quick snap buttons */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {[0, 90, 180, 270, 360].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => setPlaygroundAngle(deg)}
                          className={`py-1 rounded border text-[11px] transition ${
                            playgroundAngle === deg
                              ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                              : 'bg-[#0F172A] border-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: PREDICT THEN ROTATE */}
              {currentStep === 10 && (
                <div className="space-y-4">
                  <div className="flex justify-between font-mono text-xs border-b border-[#1E293B] pb-2 text-[#94A3B8]">
                    <span>Prediction Challenge {step10Idx + 1} of {PREDICT_CHALLENGES.length}</span>
                    <span className="text-[#34D399] font-bold">
                      Solved: {step10Solved.length}/{PREDICT_CHALLENGES.length}
                    </span>
                  </div>

                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs space-y-1.5">
                    <div className="text-[#38BDF8] uppercase font-bold text-[10px]">Challenge:</div>
                    <div className="text-sm font-bold text-[#F8FAFC]">
                      {PREDICT_CHALLENGES[step10Idx].question}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {PREDICT_CHALLENGES[step10Idx].options.map((opt) => {
                      const isChosen = step10Selected === opt;
                      const isCorrect = opt === PREDICT_CHALLENGES[step10Idx].answer;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setStep10Selected(opt);
                            setStep10Angle(PREDICT_CHALLENGES[step10Idx].angle);
                            if (isCorrect && !step10Solved.includes(step10Idx)) {
                              setStep10Solved((prev) => [...prev, step10Idx]);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition ${
                            isChosen
                              ? isCorrect
                                ? 'bg-[#10B981]/20 border-[#10B981] text-[#34D399] font-bold'
                                : 'bg-[#EF4444]/20 border-[#EF4444] text-[#F87171]'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#CBD5E1] hover:border-[#475569]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {step10Selected && (
                    <div
                      className={`p-3 rounded-xl font-mono text-xs ${
                        step10Selected === PREDICT_CHALLENGES[step10Idx].answer
                          ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#34D399]'
                          : 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171]'
                      }`}
                    >
                      <div className="font-bold mb-0.5">
                        {step10Selected === PREDICT_CHALLENGES[step10Idx].answer
                          ? '✓ Correct Prediction!'
                          : '✗ Incorrect Prediction'}
                      </div>
                      <div className="text-[11px] text-[#CBD5E1]">
                        {PREDICT_CHALLENGES[step10Idx].explanation}
                      </div>

                      {step10Idx < PREDICT_CHALLENGES.length - 1 && (
                        <button
                          onClick={() => {
                            setStep10Idx((p) => p + 1);
                            setStep10Selected(null);
                            setStep10Angle(0);
                          }}
                          className="mt-3 px-3 py-1.5 rounded bg-[#38BDF8] text-[#030712] font-bold flex items-center gap-1.5 hover:bg-[#7DD3FC] transition text-xs"
                        >
                          Next Prediction <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 11: SAME ROTATION REPEATED */}
              {currentStep === 11 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Watch angle accumulation in action. What happens if we apply four consecutive 90° rotations?
                  </p>

                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl text-center font-mono text-sm">
                    <span className="text-[#34D399] font-bold text-base block mb-1">
                      90° + 90° + 90° + 90° = 360°
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      Four quarter turns complete a full 360° circle, returning the Bloch pointer exactly to the start!
                    </span>
                  </div>

                  <div className="flex gap-2 font-mono text-xs">
                    {(['X', 'Y', 'Z'] as const).map((ax) => (
                      <button
                        key={ax}
                        onClick={() => {
                          setStep11Axis(ax);
                          setStep11QuarterSteps(0);
                        }}
                        className={`flex-1 py-1.5 rounded border transition font-bold ${
                          step11Axis === ax
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        R{ax.toLowerCase()}(90°)
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setStep11QuarterSteps((prev) => (prev >= 4 ? 1 : prev + 1));
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#34D399] text-[#030712] font-mono text-xs font-bold hover:bg-[#6EE7B7] transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {step11QuarterSteps === 0
                      ? `Apply 1st R${step11Axis.toLowerCase()}(90°)`
                      : step11QuarterSteps === 3
                      ? `Apply 4th R${step11Axis.toLowerCase()}(90°) (Return to 360°)`
                      : step11QuarterSteps === 4
                      ? `Restart 90° Cycle`
                      : `Apply Next R${step11Axis.toLowerCase()}(90°)`}
                  </button>

                  <div className="p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs flex justify-between">
                    <span className="text-[#94A3B8]">Quarter turns applied:</span>
                    <span className="text-[#F8FAFC] font-bold">
                      {step11QuarterSteps} / 4 ({step11QuarterSteps * 90}°)
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 12: FINAL MENTAL MODEL */}
              {currentStep === 12 && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs space-y-2">
                    <span className="text-[#38BDF8] font-bold block text-sm">
                      Master Rotation Gates Summary
                    </span>
                    <ul className="space-y-1.5 text-[#CBD5E1]">
                      <li>• <strong className="text-[#38BDF8]">Rx(θ)</strong> rotates θ around horizontal X stick.</li>
                      <li>• <strong className="text-[#F59E0B]">Ry(θ)</strong> rotates θ around depth Y stick.</li>
                      <li>• <strong className="text-[#A855F7]">Rz(θ)</strong> rotates θ around vertical Z stick.</li>
                      <li>• 0° = no turn, 90° = quarter turn, 180° = half turn, 360° = full return.</li>
                      <li>• <strong>X ≈ Rx(180°)</strong>, <strong>Y ≈ Ry(180°)</strong>, <strong>Z ≈ Rz(180°)</strong>.</li>
                      <li>• If the state pointer lies on the rotation stick, its Bloch point stays there!</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#38BDF8]/40 text-xs text-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      Milestone Completed!
                    </div>
                    <p>
                      “Rotation gates give us precise control over how far the qubit state moves around the Bloch sphere.”
                    </p>
                    <p className="text-[11px] text-[#94A3B8] pt-1">
                      You now command single-qubit quantum kinematics. You are ready to explore how multiple qubits interact.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onComplete();
                      if (onNextLesson) {
                        onNextLesson();
                      }
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-white font-mono font-bold text-sm hover:opacity-95 transition shadow-xl flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    NEXT: QUANTUM CIRCUITS
                  </button>
                </div>
              )}

              {/* Step Navigation Controls */}
              {currentStep < 12 && (
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
