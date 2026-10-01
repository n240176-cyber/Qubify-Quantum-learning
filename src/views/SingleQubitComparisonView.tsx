import React, { useState, useEffect, useRef } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { BlochSphereVisualizer } from '../components/bloch/BlochSphereVisualizer';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Play,
  Zap,
  Check,
  Compass,
  ArrowRight,
  Layers,
  History,
  Info,
  ChevronRight,
  RefreshCw,
  Award,
} from 'lucide-react';

interface SingleQubitComparisonViewProps {
  onExit: () => void;
  onComplete: () => void;
  onNextLesson?: () => void;
}

// 6 Fundamental Axis States
export type AxisState = '0' | '1' | '+' | '-' | '+y' | '-y';

export interface StateInfo {
  id: AxisState;
  label: string;
  name: string;
  axis: string;
  equation: string;
  p0: number;
  p1: number;
  theta: number;
  phi: number;
  highlight: '0' | '1' | '+' | '-' | 'superposition' | null;
  accent: 'cyan' | 'purple' | 'emerald' | 'amber';
}

export const AXIS_STATES: Record<AxisState, StateInfo> = {
  '0': {
    id: '0',
    label: '|0⟩',
    name: 'North Pole (+Z)',
    axis: '+Z Axis',
    equation: '|0⟩',
    p0: 100,
    p1: 0,
    theta: 0,
    phi: 0,
    highlight: '0',
    accent: 'cyan',
  },
  '1': {
    id: '1',
    label: '|1⟩',
    name: 'South Pole (-Z)',
    axis: '-Z Axis',
    equation: '|1⟩',
    p0: 0,
    p1: 100,
    theta: Math.PI,
    phi: 0,
    highlight: '1',
    accent: 'purple',
  },
  '+': {
    id: '+',
    label: '|+⟩',
    name: 'Right Equator (+X)',
    axis: '+X Axis',
    equation: '(1/√2)|0⟩ + (1/√2)|1⟩',
    p0: 50,
    p1: 50,
    theta: Math.PI / 2,
    phi: 0,
    highlight: '+',
    accent: 'emerald',
  },
  '-': {
    id: '-',
    label: '|−⟩',
    name: 'Left Equator (-X)',
    axis: '-X Axis',
    equation: '(1/√2)|0⟩ − (1/√2)|1⟩',
    p0: 50,
    p1: 50,
    theta: Math.PI / 2,
    phi: Math.PI,
    highlight: '-',
    accent: 'purple',
  },
  '+y': {
    id: '+y',
    label: '|+i⟩',
    name: 'Front Equator (+Y)',
    axis: '+Y Axis (Depth out)',
    equation: '(1/√2)|0⟩ + (i/√2)|1⟩',
    p0: 50,
    p1: 50,
    theta: Math.PI / 2,
    phi: Math.PI / 2,
    highlight: 'superposition',
    accent: 'amber',
  },
  '-y': {
    id: '-y',
    label: '|−i⟩',
    name: 'Back Equator (-Y)',
    axis: '-Y Axis (Depth in)',
    equation: '(1/√2)|0⟩ − (i/√2)|1⟩',
    p0: 50,
    p1: 50,
    theta: Math.PI / 2,
    phi: (3 * Math.PI) / 2,
    highlight: 'superposition',
    accent: 'amber',
  },
};

// Physics Transformation Rules for 180° Rotations on the 6 Axis States
export function applyGateToState(
  state: AxisState,
  gate: 'X' | 'Y' | 'Z'
): {
  nextState: AxisState;
  staysInPlace: boolean;
  phaseNote?: string;
  mathEquation: string;
} {
  if (gate === 'X') {
    // X rotates around X axis (horizontal stick through |+⟩ and |−⟩)
    switch (state) {
      case '0':
        return { nextState: '1', staysInPlace: false, mathEquation: 'X|0⟩ = |1⟩' };
      case '1':
        return { nextState: '0', staysInPlace: false, mathEquation: 'X|1⟩ = |0⟩' };
      case '+':
        return { nextState: '+', staysInPlace: true, mathEquation: 'X|+⟩ = |+⟩' };
      case '-':
        return {
          nextState: '-',
          staysInPlace: true,
          mathEquation: 'X|−⟩ = −|−⟩',
          phaseNote: 'Overall phase −1; same Bloch point',
        };
      case '+y':
        return {
          nextState: '-y',
          staysInPlace: false,
          mathEquation: 'X|+i⟩ = |−i⟩',
        };
      case '-y':
        return {
          nextState: '+y',
          staysInPlace: false,
          mathEquation: 'X|−i⟩ = |+i⟩',
        };
    }
  } else if (gate === 'Y') {
    // Y rotates around Y axis (depth stick through |+i⟩ and |−i⟩)
    switch (state) {
      case '0':
        return {
          nextState: '1',
          staysInPlace: false,
          mathEquation: 'Y|0⟩ = i|1⟩',
          phaseNote: 'Overall phase i; same Bloch point as |1⟩',
        };
      case '1':
        return {
          nextState: '0',
          staysInPlace: false,
          mathEquation: 'Y|1⟩ = −i|0⟩',
          phaseNote: 'Overall phase −i; same Bloch point as |0⟩',
        };
      case '+':
        return {
          nextState: '-',
          staysInPlace: false,
          mathEquation: 'Y|+⟩ = −i|−⟩',
          phaseNote: 'Overall phase −i; pointer at |−⟩',
        };
      case '-':
        return {
          nextState: '+',
          staysInPlace: false,
          mathEquation: 'Y|−⟩ = i|+⟩',
          phaseNote: 'Overall phase i; pointer at |+⟩',
        };
      case '+y':
        return { nextState: '+y', staysInPlace: true, mathEquation: 'Y|+i⟩ = |+i⟩' };
      case '-y':
        return {
          nextState: '-y',
          staysInPlace: true,
          mathEquation: 'Y|−i⟩ = −|−i⟩',
          phaseNote: 'Overall phase −1; same Bloch point',
        };
    }
  } else {
    // Z rotates around Z axis (vertical stick through |0⟩ and |1⟩)
    switch (state) {
      case '0':
        return { nextState: '0', staysInPlace: true, mathEquation: 'Z|0⟩ = |0⟩' };
      case '1':
        return {
          nextState: '1',
          staysInPlace: true,
          mathEquation: 'Z|1⟩ = −|1⟩',
          phaseNote: 'Overall phase −1; same Bloch point as |1⟩',
        };
      case '+':
        return { nextState: '-', staysInPlace: false, mathEquation: 'Z|+⟩ = |−⟩' };
      case '-':
        return { nextState: '+', staysInPlace: false, mathEquation: 'Z|−⟩ = |+⟩' };
      case '+y':
        return {
          nextState: '-y',
          staysInPlace: false,
          mathEquation: 'Z|+i⟩ = |−i⟩',
        };
      case '-y':
        return {
          nextState: '+y',
          staysInPlace: false,
          mathEquation: 'Z|−i⟩ = |+i⟩',
        };
    }
  }
}

// Smooth continuous 3D spherical angles interpolation hook
function useAnimatedSphereAngles(
  targetTheta: number,
  targetPhi: number,
  duration: number = 750
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

export const SingleQubitComparisonView: React.FC<SingleQubitComparisonViewProps> = ({
  onExit,
  onComplete,
  onNextLesson,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 12;
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // Active highlighted rotation stick: none, X, Y, or Z
  const [activeStick, setActiveStick] = useState<'none' | 'X' | 'Y' | 'Z'>('none');

  // Interactive Playground State (Shared across playground steps 5, 10)
  const [playgroundState, setPlaygroundState] = useState<AxisState>('0');
  const [playgroundHistory, setPlaygroundHistory] = useState<
    Array<{ gate: 'START' | 'X' | 'Y' | 'Z'; state: AxisState; note?: string }>
  >([{ gate: 'START', state: '0' }]);
  const [predictedState, setPredictedState] = useState<AxisState | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [selectedGateToPredict, setSelectedGateToPredict] = useState<'X' | 'Y' | 'Z' | null>(null);

  // Step 2 State: Which states stay in place?
  const [step2SubGate, setStep2SubGate] = useState<'X' | 'Y' | 'Z'>('X');
  const [step2CurrentState, setStep2CurrentState] = useState<AxisState>('+');

  // Step 3 State: Which states move to opposite side?
  const [step3SubGate, setStep3SubGate] = useState<'X' | 'Y' | 'Z'>('X');
  const [step3CurrentState, setStep3CurrentState] = useState<AxisState>('0');

  // Step 7 State: Same gate twice demo
  const [step7Gate, setStep7Gate] = useState<'X' | 'Y' | 'Z'>('X');
  const [step7Count, setStep7Count] = useState<0 | 1 | 2>(0);

  // Step 8 State: Different gates from same starting state
  const [step8StartState, setStep8StartState] = useState<'0' | '+'>('0');
  const [step8AppliedGate, setStep8AppliedGate] = useState<'none' | 'X' | 'Y' | 'Z'>('none');

  // Step 11 State: Mini Challenges (6 questions)
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizSolvedCount, setQuizSolvedCount] = useState(0);

  const QUIZ_ITEMS = [
    {
      id: 1,
      start: '0' as AxisState,
      gate: 'X' as const,
      question: 'Start at |0⟩. Apply X. Where does the pointer end?',
      options: ['|0⟩', '|1⟩', '|+⟩', '|−⟩'],
      answer: '|1⟩',
      explanation: 'X rotates around the horizontal stick. North Pole |0⟩ rotates 180° to South Pole |1⟩.',
    },
    {
      id: 2,
      start: '+' as AxisState,
      gate: 'Z' as const,
      question: 'Start at |+⟩. Apply Z. Where does the pointer end?',
      options: ['|+⟩', '|−⟩', '|0⟩', '|1⟩'],
      answer: '|−⟩',
      explanation: 'Z rotates around the vertical stick. Right equator |+⟩ swings 180° to left equator |−⟩.',
    },
    {
      id: 3,
      start: '-' as AxisState,
      gate: 'X' as const,
      question: 'Start at |−⟩. Apply X. Where does the pointer end?',
      options: ['Same Bloch point |−⟩', '|+⟩', '|0⟩', '|1⟩'],
      answer: 'Same Bloch point |−⟩',
      explanation: '|−⟩ lies directly ON the horizontal X stick! Rotation around the stick leaves the point in place.',
    },
    {
      id: 4,
      start: '0' as AxisState,
      gate: 'Y' as const,
      question: 'Start at |0⟩. Apply Y. Where does the pointer end?',
      options: ['|1⟩ Bloch point', '|0⟩', '|+⟩', '|−⟩'],
      answer: '|1⟩ Bloch point',
      explanation: 'Y rotates 180° around depth stick. Y|0⟩ = i|1⟩, whose Bloch pointer sits exactly at |1⟩.',
    },
    {
      id: 5,
      start: '+' as AxisState,
      gate: 'Y' as const,
      question: 'Start at |+⟩. Apply Y. Where does the pointer end?',
      options: ['|−⟩', '|+⟩', '|0⟩', '|1⟩'],
      answer: '|−⟩',
      explanation: 'Y rotates around the depth axis. |+⟩ on the right swings 180° across the equator to |−⟩ on the left.',
    },
    {
      id: 6,
      start: '1' as AxisState,
      gate: 'Z' as const,
      question: 'Start at |1⟩. Apply Z. Where does the pointer end?',
      options: ['Same Bloch point |1⟩', '|0⟩', '|+⟩', '|−⟩'],
      answer: 'Same Bloch point |1⟩',
      explanation: '|1⟩ lies directly ON the vertical Z stick! Rotation around Z leaves its Bloch pointer in place (Z|1⟩ = −|1⟩).',
    },
  ];

  // Derive target sphere parameters based on step
  let currentTargetState: AxisState = '0';
  let stickOverride: 'none' | 'X' | 'Y' | 'Z' = activeStick;

  if (currentStep === 1) {
    currentTargetState = '0';
    stickOverride = activeStick;
  } else if (currentStep === 2) {
    currentTargetState = step2CurrentState;
    stickOverride = step2SubGate;
  } else if (currentStep === 3) {
    currentTargetState = step3CurrentState;
    stickOverride = step3SubGate;
  } else if (currentStep === 4) {
    currentTargetState = '0';
  } else if (currentStep === 5 || currentStep === 10) {
    currentTargetState = playgroundState;
    stickOverride = activeStick;
  } else if (currentStep === 6) {
    currentTargetState = '+';
    stickOverride = activeStick !== 'none' ? activeStick : 'X';
  } else if (currentStep === 7) {
    stickOverride = step7Gate;
    if (step7Count === 0) {
      currentTargetState = step7Gate === 'Z' ? '+' : '0';
    } else if (step7Count === 1) {
      currentTargetState = step7Gate === 'Z' ? '-' : '1';
    } else {
      currentTargetState = step7Gate === 'Z' ? '+' : '0';
    }
  } else if (currentStep === 8) {
    if (step8AppliedGate === 'none') {
      currentTargetState = step8StartState;
    } else {
      const res = applyGateToState(step8StartState, step8AppliedGate);
      currentTargetState = res.nextState;
      stickOverride = step8AppliedGate;
    }
  } else if (currentStep === 9) {
    currentTargetState = '0';
  } else if (currentStep === 11) {
    const q = QUIZ_ITEMS[quizIdx];
    if (quizSelected === q.answer) {
      currentTargetState = applyGateToState(q.start, q.gate).nextState;
      stickOverride = q.gate;
    } else {
      currentTargetState = q.start;
      stickOverride = q.gate;
    }
  } else if (currentStep === 12) {
    currentTargetState = '0';
  }

  const activeInfo = AXIS_STATES[currentTargetState];
  const { theta: animTheta, phi: animPhi, isAnimating } = useAnimatedSphereAngles(
    activeInfo.theta,
    activeInfo.phi,
    750
  );

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxUnlockedStep((prev) => Math.max(prev, next));
      setActiveStick('none');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setActiveStick('none');
    }
  };

  // Helper for applying a gate in Playground
  const handlePlaygroundApply = (gate: 'X' | 'Y' | 'Z') => {
    setActiveStick(gate);
    const result = applyGateToState(playgroundState, gate);
    setPlaygroundState(result.nextState);
    setPlaygroundHistory((prev) => [
      ...prev,
      {
        gate,
        state: result.nextState,
        note: result.phaseNote,
      },
    ]);
  };

  const handlePlaygroundReset = (st: AxisState = '0') => {
    setPlaygroundState(st);
    setPlaygroundHistory([{ gate: 'START', state: st }]);
    setActiveStick('none');
    setPredictedState(null);
    setPredictionFeedback(null);
    setSelectedGateToPredict(null);
  };

  const handlePlaygroundUndo = () => {
    if (playgroundHistory.length > 1) {
      const newHist = [...playgroundHistory];
      newHist.pop();
      const prevEntry = newHist[newHist.length - 1];
      setPlaygroundHistory(newHist);
      setPlaygroundState(prevEntry.state);
      setActiveStick('none');
    }
  };

  const stepTitles = [
    'The Big Picture: All Gates are Rotations',
    'Which States Stay in Place?',
    'Which States Move to the Opposite Side?',
    'Unified Gate Comparison Table',
    'Interactive Bloch Playground',
    'The Rotation Stick Principle',
    'Applying the Same Gate Twice',
    'Different Gates from Same Starting State',
    'Summary: What Changes & What Doesn’t',
    'Free Bloch Playground',
    'Mini Prediction Challenges',
    'Final Geometric Mental Model',
  ];

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={totalSteps}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={(s) => {
        setCurrentStep(s);
        setActiveStick('none');
      }}
      onExit={onExit}
    >
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =============================================================== */}
          {/* LEFT: MAIN LARGE BLOCH SPHERE (Stable, clear, arrow from core)  */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full bg-[#08111F]/90 border border-[#1E293B] rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center">
              {/* Header HUD: Active Stick Indicator */}
              <div className="w-full flex items-center justify-between mb-3 border-b border-[#1E293B]/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
                  <span className="text-xs font-mono font-semibold tracking-wider text-[#94A3B8] uppercase">
                    Qubify Bloch Engine
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-[#64748B]">Active Stick:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      stickOverride === 'X'
                        ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                        : stickOverride === 'Y'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                        : stickOverride === 'Z'
                        ? 'bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/40'
                        : 'bg-[#1E293B] text-[#94A3B8]'
                    }`}
                  >
                    {stickOverride === 'none' ? 'None (Resting)' : `${stickOverride}-Axis Stick`}
                  </span>
                </div>
              </div>

              {/* Central Bloch Visualizer */}
              <div className="relative my-1">
                <BlochSphereVisualizer
                  theta={animTheta}
                  phi={animPhi}
                  stateLabel={activeInfo.label}
                  highlight={activeInfo.highlight}
                  showPhaseMarkers={true}
                  showXAxisStick={stickOverride === 'X'}
                  showYAxisStick={stickOverride === 'Y'}
                  showZAxisStick={stickOverride === 'Z'}
                  pointerAccent={activeInfo.accent}
                  size={340}
                  subtleNote="Pointer arrow originates at center & points to current quantum state."
                />

                {/* 4 Landmark Coordinates Key */}
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

              {/* State & Probabilities HUD */}
              <div className="w-full mt-3 bg-[#0B1528] border border-[#1E293B] rounded-xl p-3 flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#38BDF8]" />
                    <span className="text-[#64748B]">State:</span>
                    <span className="text-[#F8FAFC] font-bold text-sm">{activeInfo.label}</span>
                    <span className="text-[11px] text-[#94A3B8]">({activeInfo.axis})</span>
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Motion:{' '}
                    <span className={isAnimating ? 'text-[#F59E0B] font-bold' : 'text-[#10B981]'}>
                      {isAnimating ? '180° Rotating...' : 'Stable'}
                    </span>
                  </div>
                </div>

                {/* Live Probability Bars */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E293B]/80 text-[11px]">
                  <div>
                    <div className="flex justify-between text-[#94A3B8] mb-1">
                      <span>P(|0⟩):</span>
                      <span className="text-[#38BDF8] font-bold">{activeInfo.p0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#38BDF8] transition-all duration-500"
                        style={{ width: `${activeInfo.p0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[#94A3B8] mb-1">
                      <span>P(|1⟩):</span>
                      <span className="text-[#C084FC] font-bold">{activeInfo.p1}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C084FC] transition-all duration-500"
                        style={{ width: `${activeInfo.p1}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT: INTERACTIVE STEP CONTENT & CONTROLS                      */}
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

              {/* STEP 1: THE BIG PICTURE */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Instead of memorizing separate mathematical formulas for{' '}
                    <strong className="text-[#38BDF8]">X</strong>,{' '}
                    <strong className="text-[#F59E0B]">Y</strong>, and{' '}
                    <strong className="text-[#A855F7]">Z</strong>, quantum mechanics gives us a single, elegant geometric mental model:
                  </p>

                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl text-center">
                    <span className="text-base font-bold text-[#F8FAFC] block">
                      “X, Y, and Z are all 180° rotations.”
                    </span>
                    <span className="text-xs text-[#94A3B8] mt-1 block">
                      The gate name literally tells you which axis acts as the rotation stick!
                    </span>
                  </div>

                  {/* Interactive Stick Selector Demo */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-[#64748B] block">
                      Click a gate to preview its rotation stick on the sphere:
                    </span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      <button
                        onClick={() => setActiveStick('X')}
                        className={`p-3 rounded-xl border text-center transition ${
                          activeStick === 'X'
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold shadow-md'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                        }`}
                      >
                        <span className="block text-sm font-bold text-[#38BDF8]">X Gate</span>
                        <span className="text-[10px] text-[#64748B]">Horizontal stick</span>
                      </button>
                      <button
                        onClick={() => setActiveStick('Y')}
                        className={`p-3 rounded-xl border text-center transition ${
                          activeStick === 'Y'
                            ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] font-bold shadow-md'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                        }`}
                      >
                        <span className="block text-sm font-bold text-[#F59E0B]">Y Gate</span>
                        <span className="text-[10px] text-[#64748B]">Depth stick (in/out)</span>
                      </button>
                      <button
                        onClick={() => setActiveStick('Z')}
                        className={`p-3 rounded-xl border text-center transition ${
                          activeStick === 'Z'
                            ? 'bg-[#A855F7]/20 border-[#A855F7] text-[#D8B4FE] font-bold shadow-md'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                        }`}
                      >
                        <span className="block text-sm font-bold text-[#A855F7]">Z Gate</span>
                        <span className="text-[10px] text-[#64748B]">Vertical stick</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-[#CBD5E1] space-y-1">
                    <p className="font-semibold text-[#F8FAFC]">Key Takeaway:</p>
                    <p>
                      A 180° rotation around an axis leaves points on that axis unmoved, while flipping perpendicular points to the opposite side of the sphere.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: WHICH STATES STAY IN PLACE? */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#34D399]">
                    <strong className="block mb-1 text-sm font-bold">The Invariance Rule:</strong>
                    “If the state vector lies on the same axis as the rotation stick, its Bloch-sphere point stays in place.”
                  </div>

                  {/* Gate sub-tab */}
                  <div className="flex gap-2">
                    {(['X', 'Y', 'Z'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setStep2SubGate(g);
                          if (g === 'X') setStep2CurrentState('+');
                          if (g === 'Y') setStep2CurrentState('+y');
                          if (g === 'Z') setStep2CurrentState('0');
                        }}
                        className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                          step2SubGate === g
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        {g} Gate Axis
                      </button>
                    ))}
                  </div>

                  {/* State demo for selected gate */}
                  <div className="bg-[#0B1528] border border-[#1E293B] rounded-xl p-4 font-mono text-xs space-y-2">
                    {step2SubGate === 'X' && (
                      <>
                        <div className="text-[#38BDF8] font-bold">X-Axis States: |+⟩ and |−⟩</div>
                        <p className="text-[#94A3B8]">
                          Both |+⟩ and |−⟩ lie on the horizontal X stick.
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setStep2CurrentState('+')}
                            className={`px-3 py-1.5 rounded border ${
                              step2CurrentState === '+' ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]' : 'border-[#1E293B]'
                            }`}
                          >
                            Test |+⟩ --X--&gt; |+⟩ (Unmoved)
                          </button>
                          <button
                            onClick={() => setStep2CurrentState('-')}
                            className={`px-3 py-1.5 rounded border ${
                              step2CurrentState === '-' ? 'bg-[#C084FC]/20 border-[#C084FC] text-[#C084FC]' : 'border-[#1E293B]'
                            }`}
                          >
                            Test |−⟩ --X--&gt; |−⟩ (Unmoved)
                          </button>
                        </div>
                      </>
                    )}

                    {step2SubGate === 'Y' && (
                      <>
                        <div className="text-[#F59E0B] font-bold">Y-Axis States: |+i⟩ and |−i⟩</div>
                        <p className="text-[#94A3B8]">
                          These states lie on the depth stick into and out of the screen.
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setStep2CurrentState('+y')}
                            className={`px-3 py-1.5 rounded border ${
                              step2CurrentState === '+y' ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#FCD34D]' : 'border-[#1E293B]'
                            }`}
                          >
                            Test |+i⟩ (Front) --Y--&gt; Unmoved
                          </button>
                          <button
                            onClick={() => setStep2CurrentState('-y')}
                            className={`px-3 py-1.5 rounded border ${
                              step2CurrentState === '-y' ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#FCD34D]' : 'border-[#1E293B]'
                            }`}
                          >
                            Test |−i⟩ (Back) --Y--&gt; Unmoved
                          </button>
                        </div>
                      </>
                    )}

                    {step2SubGate === 'Z' && (
                      <>
                        <div className="text-[#A855F7] font-bold">Z-Axis States: |0⟩ and |1⟩</div>
                        <p className="text-[#94A3B8]">
                          Both |0⟩ and |1⟩ lie directly on the vertical Z stick.
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setStep2CurrentState('0')}
                            className={`px-3 py-1.5 rounded border ${
                              step2CurrentState === '0' ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]' : 'border-[#1E293B]'
                            }`}
                          >
                            Test |0⟩ --Z--&gt; |0⟩ (Unmoved)
                          </button>
                          <button
                            onClick={() => setStep2CurrentState('1')}
                            className={`px-3 py-1.5 rounded border ${
                              step2CurrentState === '1' ? 'bg-[#C084FC]/20 border-[#C084FC] text-[#C084FC]' : 'border-[#1E293B]'
                            }`}
                          >
                            Test |1⟩ --Z--&gt; |1⟩ (Unmoved)
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-3 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#94A3B8] italic">
                    “Same Bloch point does not always mean the equation looks identical, because an overall phase may appear.”
                  </div>
                </div>
              )}

              {/* STEP 3: WHICH STATES MOVE TO THE OPPOSITE SIDE? */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Now look at the perpendicular cases. When a state vector sits at 90° to the rotation stick, a 180° rotation swings it cleanly to the opposite side:
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {(['X', 'Y', 'Z'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setStep3SubGate(g);
                          if (g === 'X') setStep3CurrentState('0');
                          if (g === 'Y') setStep3CurrentState('0');
                          if (g === 'Z') setStep3CurrentState('+');
                        }}
                        className={`p-2.5 rounded-xl font-mono text-xs border transition text-center ${
                          step3SubGate === g
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        <span className="block font-bold">{g} Flip</span>
                        <span className="text-[10px]">
                          {g === 'X' ? '|0⟩ ↔ |1⟩' : g === 'Y' ? 'Both flips' : '|+⟩ ↔ |−⟩'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#0B1528] border border-[#1E293B] rounded-xl p-4 font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Active Test State:</span>
                      <span className="text-sm font-bold text-[#F8FAFC]">
                        {AXIS_STATES[step3CurrentState].label}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const res = applyGateToState(step3CurrentState, step3SubGate);
                        setStep3CurrentState(res.nextState);
                      }}
                      className="w-full py-2 rounded-lg bg-[#38BDF8] text-[#030712] font-mono text-xs font-bold hover:bg-[#7DD3FC] transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Apply {step3SubGate} Gate (Rotate 180°)
                    </button>

                    <div className="text-[11px] text-[#94A3B8] pt-1">
                      {step3SubGate === 'X' && (
                        <span>X rotates around horizontal stick: |0⟩ (top) ↔ |1⟩ (bottom).</span>
                      )}
                      {step3SubGate === 'Y' && (
                        <span>
                          Y rotates around depth stick: flips |0⟩ ↔ |1⟩ vertically AND |+⟩ ↔ |−⟩ horizontally!
                        </span>
                      )}
                      {step3SubGate === 'Z' && (
                        <span>Z rotates around vertical stick: |+⟩ (right) ↔ |−⟩ (left).</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: UNIFIED GATE COMPARISON TABLE */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Here is the complete behavior of all single-qubit rotation gates at a glance:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-[#0B1528] border-b border-[#1E293B] text-[#64748B]">
                          <th className="py-2.5 px-3 text-left">Input State</th>
                          <th className="py-2.5 px-3 text-left text-[#38BDF8]">X Gate</th>
                          <th className="py-2.5 px-3 text-left text-[#F59E0B]">Y Gate</th>
                          <th className="py-2.5 px-3 text-left text-[#A855F7]">Z Gate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B] text-[#E2E8F0]">
                        <tr className="hover:bg-[#0B1528]/50">
                          <td className="py-2 px-3 font-bold text-[#38BDF8]">|0⟩ (top)</td>
                          <td className="py-2 px-3 text-[#34D399]">|1⟩ (flipped)</td>
                          <td className="py-2 px-3 text-[#FCD34D]">|1⟩ (same point)</td>
                          <td className="py-2 px-3 text-[#94A3B8]">|0⟩ (unmoved)</td>
                        </tr>
                        <tr className="hover:bg-[#0B1528]/50">
                          <td className="py-2 px-3 font-bold text-[#C084FC]">|1⟩ (bottom)</td>
                          <td className="py-2 px-3 text-[#34D399]">|0⟩ (flipped)</td>
                          <td className="py-2 px-3 text-[#FCD34D]">|0⟩ (same point)</td>
                          <td className="py-2 px-3 text-[#94A3B8]">|1⟩ (unmoved)</td>
                        </tr>
                        <tr className="hover:bg-[#0B1528]/50">
                          <td className="py-2 px-3 font-bold text-[#34D399]">|+⟩ (right)</td>
                          <td className="py-2 px-3 text-[#94A3B8]">|+⟩ (unmoved)</td>
                          <td className="py-2 px-3 text-[#FCD34D]">|−⟩ (flipped)</td>
                          <td className="py-2 px-3 text-[#C084FC]">|−⟩ (flipped)</td>
                        </tr>
                        <tr className="hover:bg-[#0B1528]/50">
                          <td className="py-2 px-3 font-bold text-[#C084FC]">|−⟩ (left)</td>
                          <td className="py-2 px-3 text-[#94A3B8]">|−⟩ (unmoved)</td>
                          <td className="py-2 px-3 text-[#FCD34D]">|+⟩ (flipped)</td>
                          <td className="py-2 px-3 text-[#34D399]">|+⟩ (flipped)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-[#94A3B8]">
                    While this table provides a handy reference, real quantum intuition comes from manipulating the Bloch sphere directly. Let’s head to the interactive playground!
                  </p>
                </div>
              )}

              {/* STEP 5 & 10: MAIN INTERACTIVE BLOCH PLAYGROUND */}
              {(currentStep === 5 || currentStep === 10) && (
                <div className="space-y-4">
                  {/* Optional Prediction Tool */}
                  <div className="p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
                        Predict Before Applying (Optional)
                      </span>
                      {selectedGateToPredict && (
                        <button
                          onClick={() => {
                            setSelectedGateToPredict(null);
                            setPredictedState(null);
                            setPredictionFeedback(null);
                          }}
                          className="text-[10px] text-[#64748B] hover:text-[#CBD5E1]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {!selectedGateToPredict ? (
                      <div className="flex gap-2">
                        {(['X', 'Y', 'Z'] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => {
                              setSelectedGateToPredict(g);
                              setPredictedState(null);
                              setPredictionFeedback(null);
                            }}
                            className="flex-1 py-1.5 rounded font-mono text-xs bg-[#0F172A] border border-[#1E293B] hover:border-[#38BDF8] text-[#CBD5E1]"
                          >
                            Predict {g}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-[#1E293B]">
                        <span className="text-[11px] font-mono text-[#F8FAFC] block">
                          From {AXIS_STATES[playgroundState].label}, where will {selectedGateToPredict} send the pointer?
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['0', '1', '+', '-'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                setPredictedState(st);
                                const real = applyGateToState(playgroundState, selectedGateToPredict);
                                if (st === real.nextState) {
                                  setPredictionFeedback(`Correct! ${real.mathEquation}`);
                                } else {
                                  setPredictionFeedback(
                                    `Incorrect. It goes to ${AXIS_STATES[real.nextState].label}.`
                                  );
                                }
                                handlePlaygroundApply(selectedGateToPredict);
                              }}
                              className="py-1 rounded font-mono text-xs bg-[#0F172A] border border-[#334155] hover:bg-[#38BDF8]/20 hover:border-[#38BDF8] text-[#F8FAFC]"
                            >
                              {AXIS_STATES[st].label}
                            </button>
                          ))}
                        </div>
                        {predictionFeedback && (
                          <div
                            className={`p-2 rounded text-[11px] font-mono ${
                              predictionFeedback.startsWith('Correct')
                                ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30'
                                : 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30'
                            }`}
                          >
                            {predictionFeedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Starting State Selector (6 Axis States) */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-[#64748B] block">
                      Choose Starting State:
                    </span>
                    <div className="grid grid-cols-6 gap-1 font-mono text-xs">
                      {(['0', '1', '+', '-', '+y', '-y'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handlePlaygroundReset(st)}
                          className={`py-1.5 rounded border transition text-center ${
                            playgroundState === st
                              ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#94A3B8] hover:border-[#475569]'
                          }`}
                        >
                          {AXIS_STATES[st].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gate Action Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-[#64748B] block">
                      Apply 180° Rotation Gate:
                    </span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      <button
                        onClick={() => handlePlaygroundApply('X')}
                        className="py-2.5 rounded-xl bg-[#38BDF8] text-[#030712] font-bold hover:bg-[#7DD3FC] transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Apply X
                      </button>
                      <button
                        onClick={() => handlePlaygroundApply('Y')}
                        className="py-2.5 rounded-xl bg-[#F59E0B] text-[#030712] font-bold hover:bg-[#FBBF24] transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Apply Y
                      </button>
                      <button
                        onClick={() => handlePlaygroundApply('Z')}
                        className="py-2.5 rounded-xl bg-[#A855F7] text-[#030712] font-bold hover:bg-[#C084FC] transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Apply Z
                      </button>
                    </div>
                  </div>

                  {/* Tiny Sequence History */}
                  <div className="bg-[#0B1528] border border-[#1E293B] rounded-xl p-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-[#64748B] mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" />
                        Transformation History
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePlaygroundUndo}
                          disabled={playgroundHistory.length <= 1}
                          className="hover:text-[#F8FAFC] disabled:opacity-40"
                        >
                          Undo
                        </button>
                        <button
                          onClick={() => handlePlaygroundReset('0')}
                          className="hover:text-[#F8FAFC]"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
                      {playgroundHistory.map((item, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="text-[#475569]">→</span>}
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              idx === playgroundHistory.length - 1
                                ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30'
                                : 'bg-[#030712]/50 text-[#94A3B8]'
                            }`}
                          >
                            {item.gate !== 'START' ? `${item.gate} → ` : ''}
                            {AXIS_STATES[item.state].label}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: SHOW THE ROTATION STICK */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Notice how the sphere operates: <strong className="text-[#F8FAFC]">the camera never spins</strong>.
                    Instead, the sphere remains completely stable while the state vector rotates around the highlighted stick.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setActiveStick('X')}
                      className={`p-3 rounded-xl border text-center font-mono transition ${
                        activeStick === 'X' ? 'bg-[#38BDF8]/20 border-[#38BDF8]' : 'bg-[#0B1528] border-[#1E293B]'
                      }`}
                    >
                      <span className="text-[#38BDF8] font-bold block text-sm">X Stick</span>
                      <span className="text-[10px] text-[#94A3B8]">Horizontal through equator</span>
                    </button>
                    <button
                      onClick={() => setActiveStick('Y')}
                      className={`p-3 rounded-xl border text-center font-mono transition ${
                        activeStick === 'Y' ? 'bg-[#F59E0B]/20 border-[#F59E0B]' : 'bg-[#0B1528] border-[#1E293B]'
                      }`}
                    >
                      <span className="text-[#F59E0B] font-bold block text-sm">Y Stick</span>
                      <span className="text-[10px] text-[#94A3B8]">Depth through center</span>
                    </button>
                    <button
                      onClick={() => setActiveStick('Z')}
                      className={`p-3 rounded-xl border text-center font-mono transition ${
                        activeStick === 'Z' ? 'bg-[#A855F7]/20 border-[#A855F7]' : 'bg-[#0B1528] border-[#1E293B]'
                      }`}
                    >
                      <span className="text-[#D8B4FE] font-bold block text-sm">Z Stick</span>
                      <span className="text-[10px] text-[#94A3B8]">Vertical through poles</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] space-y-2 text-xs text-[#CBD5E1]">
                    <h3 className="font-bold font-mono uppercase text-[#38BDF8]">
                      Geometric Invariance Principle:
                    </h3>
                    <p>
                      When a stick is active, any quantum state pointing along that stick has zero lever arm. Therefore, 180° rotation around it leaves the pointer strictly stationary!
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 7: APPLYING SAME GATE TWICE */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Because X, Y, and Z are all 180° rotations, applying the exact same gate twice yields a full circle:
                  </p>

                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl text-center font-mono text-sm">
                    <span className="text-[#34D399] font-bold text-base block mb-1">
                      180° + 180° = 360° = 0°
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      The Bloch pointer returns directly to its starting position!
                    </span>
                  </div>

                  {/* Interactive Double Tap Demo */}
                  <div className="space-y-2">
                    <div className="flex gap-2 font-mono text-xs">
                      {(['X', 'Y', 'Z'] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => {
                            setStep7Gate(g);
                            setStep7Count(0);
                          }}
                          className={`flex-1 py-1.5 rounded border transition ${
                            step7Gate === g
                              ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                              : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          Test {g} twice
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setStep7Count((prev) => (prev === 0 ? 1 : prev === 1 ? 2 : 1));
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#34D399] text-[#030712] font-mono text-xs font-bold hover:bg-[#6EE7B7] transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {step7Count === 0
                        ? `Apply 1st ${step7Gate} Gate`
                        : step7Count === 1
                        ? `Apply 2nd ${step7Gate} Gate (Return Home)`
                        : `Apply ${step7Gate} Gate Again`}
                    </button>

                    <div className="p-3 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs flex justify-between">
                      <span className="text-[#64748B]">Cycles applied:</span>
                      <span className="font-bold text-[#F8FAFC]">
                        {step7Count === 0
                          ? 'Starting State'
                          : step7Count === 1
                          ? `After 1st ${step7Gate} (Flipped 180°)`
                          : `After 2nd ${step7Gate} (Returned 360°)`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: DIFFERENT GATES FROM SAME STARTING STATE */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Compare how X, Y, and Z behave when applied to the <em>same</em> starting state:
                  </p>

                  <div className="flex gap-2 font-mono text-xs">
                    <button
                      onClick={() => {
                        setStep8StartState('0');
                        setStep8AppliedGate('none');
                      }}
                      className={`flex-1 py-2 rounded-lg border ${
                        step8StartState === '0'
                          ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                      }`}
                    >
                      Start at |0⟩ (North Pole)
                    </button>
                    <button
                      onClick={() => {
                        setStep8StartState('+');
                        setStep8AppliedGate('none');
                      }}
                      className={`flex-1 py-2 rounded-lg border ${
                        step8StartState === '+'
                          ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399] font-bold'
                          : 'bg-[#0B1528] border-[#1E293B] text-[#64748B]'
                      }`}
                    >
                      Start at |+⟩ (Right Equator)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    {(['X', 'Y', 'Z'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setStep8AppliedGate(g)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          step8AppliedGate === g
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                            : 'bg-[#0B1528] border-[#1E293B] text-[#CBD5E1] hover:border-[#475569]'
                        }`}
                      >
                        Apply {g} Gate
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-xl font-mono text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Active Result:</span>
                      <span className="text-[#34D399] font-bold">
                        {step8AppliedGate === 'none'
                          ? `At starting ${AXIS_STATES[step8StartState].label}`
                          : applyGateToState(step8StartState, step8AppliedGate).mathEquation}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] pt-1 border-t border-[#1E293B]">
                      “Different gates can sometimes end at the same Bloch point for one input, but they are still completely different rotations!”
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 9: SUMMARY — WHAT CHANGES AND WHAT DOESN'T */}
              {currentStep === 9 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 bg-[#0B1528] border border-[#38BDF8]/40 rounded-xl space-y-1">
                    <div className="flex justify-between text-[#38BDF8] font-bold text-sm">
                      <span>X GATE</span>
                      <span>Rotation Axis: X (Horizontal)</span>
                    </div>
                    <div className="text-[#CBD5E1]">Stays on same Bloch point: |+⟩ and |−⟩ (X axis)</div>
                    <div className="text-[#94A3B8]">Moves opposite: |0⟩ ↔ |1⟩ and Y states</div>
                  </div>

                  <div className="p-3.5 bg-[#0B1528] border border-[#F59E0B]/40 rounded-xl space-y-1">
                    <div className="flex justify-between text-[#F59E0B] font-bold text-sm">
                      <span>Y GATE</span>
                      <span>Rotation Axis: Y (Depth in/out)</span>
                    </div>
                    <div className="text-[#CBD5E1]">Stays on same Bloch point: |+i⟩ and |−i⟩ (Y axis)</div>
                    <div className="text-[#94A3B8]">Moves opposite: |0⟩ ↔ |1⟩ and |+⟩ ↔ |−⟩</div>
                  </div>

                  <div className="p-3.5 bg-[#0B1528] border border-[#A855F7]/40 rounded-xl space-y-1">
                    <div className="flex justify-between text-[#D8B4FE] font-bold text-sm">
                      <span>Z GATE</span>
                      <span>Rotation Axis: Z (Vertical)</span>
                    </div>
                    <div className="text-[#CBD5E1]">Stays on same Bloch point: |0⟩ and |1⟩ (Z axis)</div>
                    <div className="text-[#94A3B8]">Moves opposite: |+⟩ ↔ |−⟩ and Y states</div>
                  </div>
                </div>
              )}

              {/* STEP 11: MINI CHALLENGES */}
              {currentStep === 11 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs border-b border-[#1E293B] pb-2">
                    <span className="text-[#94A3B8]">
                      Challenge {quizIdx + 1} of {QUIZ_ITEMS.length}
                    </span>
                    <span className="text-[#34D399] font-bold">
                      Solved: {quizSolvedCount}/{QUIZ_ITEMS.length}
                    </span>
                  </div>

                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono space-y-2">
                    <div className="text-xs text-[#38BDF8] font-bold uppercase">
                      Problem:
                    </div>
                    <div className="text-sm font-bold text-[#F8FAFC]">
                      {QUIZ_ITEMS[quizIdx].question}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {QUIZ_ITEMS[quizIdx].options.map((opt) => {
                      const isChosen = quizSelected === opt;
                      const isCorrect = opt === QUIZ_ITEMS[quizIdx].answer;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setQuizSelected(opt);
                            if (isCorrect && quizSelected !== opt) {
                              setQuizSolvedCount((p) => Math.min(QUIZ_ITEMS.length, p + 1));
                            }
                          }}
                          className={`p-3 rounded-xl border text-left font-mono text-xs transition ${
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

                  {quizSelected && (
                    <div
                      className={`p-3 rounded-xl font-mono text-xs ${
                        quizSelected === QUIZ_ITEMS[quizIdx].answer
                          ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#34D399]'
                          : 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171]'
                      }`}
                    >
                      <div className="font-bold mb-0.5">
                        {quizSelected === QUIZ_ITEMS[quizIdx].answer ? '✓ Correct!' : '✗ Not quite'}
                      </div>
                      <div className="text-[11px] text-[#CBD5E1]">
                        {QUIZ_ITEMS[quizIdx].explanation}
                      </div>

                      {quizIdx < QUIZ_ITEMS.length - 1 && quizSelected === QUIZ_ITEMS[quizIdx].answer && (
                        <button
                          onClick={() => {
                            setQuizIdx((p) => p + 1);
                            setQuizSelected(null);
                          }}
                          className="mt-3 px-3 py-1.5 rounded bg-[#34D399] text-[#030712] font-bold flex items-center gap-1.5 hover:bg-[#6EE7B7] transition text-xs"
                        >
                          Next Challenge <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 12: FINAL MENTAL MODEL */}
              {currentStep === 12 && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0B1528] border border-[#1E293B] rounded-xl font-mono text-xs space-y-2">
                    <span className="text-[#38BDF8] font-bold block text-sm">
                      Master Single-Qubit Summary
                    </span>
                    <ul className="space-y-1.5 text-[#CBD5E1]">
                      <li>• <strong className="text-[#38BDF8]">X</strong> = rotate 180° around horizontal stick</li>
                      <li>• <strong className="text-[#F59E0B]">Y</strong> = rotate 180° around depth stick</li>
                      <li>• <strong className="text-[#A855F7]">Z</strong> = rotate 180° around vertical stick</li>
                      <li>• If the pointer lies on the rotation stick, its Bloch point stays there.</li>
                      <li>• If the pointer is perpendicular to the stick, 180° sends it to the opposite side.</li>
                      <li>• Applying the same gate twice returns the pointer to its starting position.</li>
                    </ul>
                  </div>

                  {/* Prerequisite preview note requested by user */}
                  <div className="p-4 rounded-xl bg-[#0F172A] border border-[#38BDF8]/40 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#38BDF8] font-mono font-bold">
                      <Sparkles className="w-4 h-4" />
                      Before Moving Forward:
                    </div>
                    <p className="text-[#E2E8F0] leading-relaxed">
                      Before going to arbitrary-angle <strong className="text-[#F8FAFC]">Rotation Gates (Rx, Ry, Rz)</strong>, you now have a complete geometric understanding of all fundamental single-qubit basis gates (X, Y, Z, and H).
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
                    NEXT: ROTATION GATES
                  </button>
                </div>
              )}

              {/* Navigation Controls */}
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
