import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { BlochSphereVisualizer } from '../components/bloch/BlochSphereVisualizer';
import {
  Compass,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
  HelpCircle,
  Play,
  Info,
} from 'lucide-react';

interface BlochSphereLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
  onNextLesson?: () => void;
}

// Smooth angle interpolation hook for continuous state-vector rotations
function useAnimatedAngle(targetAngle: number, duration: number = 850) {
  const [angle, setAngle] = useState(targetAngle);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = React.useRef<{
    start: number;
    end: number;
    startTime: number;
    rafId: number | null;
  }>({
    start: targetAngle,
    end: targetAngle,
    startTime: 0,
    rafId: null,
  });

  useEffect(() => {
    if (animRef.current.rafId !== null) {
      cancelAnimationFrame(animRef.current.rafId);
      animRef.current.rafId = null;
    }

    const start = angle;
    const end = targetAngle;
    if (Math.abs(start - end) < 0.001) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const startTime = performance.now();
    animRef.current = {
      start,
      end,
      startTime,
      rafId: null,
    };

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Clean cubic ease-in-out interpolation
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const current = start + (end - start) * ease;
      setAngle(current);

      if (progress < 1) {
        animRef.current.rafId = requestAnimationFrame(tick);
      } else {
        setAngle(end);
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
  }, [targetAngle, duration]);

  return { angle, isAnimating };
}

export const BlochSphereLessonView: React.FC<BlochSphereLessonViewProps> = ({
  onExit,
  onComplete,
  onNextLesson,
}) => {
  // Navigation steps: 1 to 6
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 2 STATE: |0⟩ and |1⟩ Smooth Transition & Equation Synchronization
  // =========================================================================
  const [step2TargetPole, setStep2TargetPole] = useState<'0' | '1'>('0');
  const [step2HasMoved, setStep2HasMoved] = useState(false);

  const step2TargetTheta = step2TargetPole === '0' ? 0 : Math.PI;
  const { angle: step2Theta, isAnimating: step2IsAnimating } = useAnimatedAngle(step2TargetTheta, 900);

  const handleStep2SetPole = (pole: '0' | '1') => {
    setStep2TargetPole(pole);
    if (pole === '1') {
      setStep2HasMoved(true);
      setMaxUnlockedStep((prev) => Math.max(prev, 3));
    }
  };

  const isStep2At0 = step2Theta < 0.08 && !step2IsAnimating;
  const isStep2At1 = step2Theta > Math.PI - 0.08 && !step2IsAnimating;

  // =========================================================================
  // STEP 3 STATE: Superposition on the sphere
  // =========================================================================
  const [step3Mode, setStep3Mode] = useState<'pole' | 'superposition'>('pole');
  const step3TargetTheta = step3Mode === 'pole' ? 0 : Math.PI / 2;
  const { angle: step3Theta, isAnimating: step3IsAnimating } = useAnimatedAngle(step3TargetTheta, 900);

  useEffect(() => {
    if (currentStep === 3) {
      setStep3Mode('pole');
    }
  }, [currentStep]);

  const handleStep3Toggle = () => {
    if (step3Mode === 'pole') {
      setStep3Mode('superposition');
      setMaxUnlockedStep((prev) => Math.max(prev, 4));
    } else {
      setStep3Mode('pole');
    }
  };

  const isStep3AtPole = step3Theta < 0.08 && !step3IsAnimating;

  // =========================================================================
  // STEP 4 STATE: Interactive State Movement (Slider)
  // =========================================================================
  const [step4Percent, setStep4Percent] = useState<number>(50); // 0 to 100
  const [step4Interacted, setStep4Interacted] = useState(false);

  const step4Theta = (step4Percent / 100) * Math.PI;
  // Probabilities: P(0) = cos^2(theta / 2), P(1) = sin^2(theta / 2)
  const step4P0 = Math.round(Math.pow(Math.cos(step4Theta / 2), 2) * 100);
  const step4P1 = 100 - step4P0;

  const handleStep4SliderChange = (val: number) => {
    setStep4Percent(val);
    if (!step4Interacted) {
      setStep4Interacted(true);
      setMaxUnlockedStep((prev) => Math.max(prev, 5));
    }
  };

  // =========================================================================
  // STEP 5 STATE: Gate + Bloch Sphere + Equation
  // =========================================================================
  const [step5SelectedGate, setStep5SelectedGate] = useState<'X' | 'H'>('X');
  const [step5GateApplied, setStep5GateApplied] = useState(false);

  const step5TargetTheta = !step5GateApplied
    ? 0 // Start at |0⟩
    : step5SelectedGate === 'X'
    ? Math.PI // Moves to |1⟩
    : Math.PI / 2; // Moves to equator

  const { angle: step5Theta, isAnimating: step5IsAnimating } = useAnimatedAngle(step5TargetTheta, 950);

  const handleStep5ApplyGate = () => {
    if (step5IsAnimating) return;
    setStep5GateApplied(true);
    setMaxUnlockedStep((prev) => Math.max(prev, 6));
  };

  const handleStep5ResetGate = () => {
    setStep5GateApplied(false);
  };

  const handleStep5SwitchGate = (gate: 'X' | 'H') => {
    setStep5SelectedGate(gate);
    setStep5GateApplied(false);
  };

  // =========================================================================
  // STEP NAVIGATION HELPERS
  // =========================================================================
  const handleNextStep = () => {
    if (currentStep < 6) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxUnlockedStep((prev) => Math.max(prev, next));
    } else {
      onComplete();
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
      totalSteps={6}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={(s) => setCurrentStep(s)}
      onExit={onExit}
    >
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-between">
        
        {/* Main Content Area: Desktop Split View (~55% Left, ~45% Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* ================================================================= */}
          {/* LEFT SIDE (~55%): BLOCH SPHERE, STATE VISUAL & INTERACTION       */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 rounded-3xl bg-[#0F172A]/50 border border-[#243B55]/60 relative shadow-2xl backdrop-blur-sm min-h-[460px]">
            
            {/* Step 1: Clean Sphere with State Vector pointing upward toward |0⟩ */}
            {currentStep === 1 && (
              <div className="w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <BlochSphereVisualizer
                  theta={0}
                  showEquator={false}
                  showAxes={false}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight="0"
                  stateLabel="|0⟩"
                  size={340}
                  pointerAccent="cyan"
                  subtleNote="Visualization only — not the physical qubit."
                  secondaryNote="The arrow shows the qubit’s state on this visual map."
                />
              </div>
            )}

            {/* Step 2: |0⟩ and |1⟩ Poles with Continuous Rotating State Vector */}
            {currentStep === 2 && (
              <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step2Theta}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight={isStep2At0 ? '0' : isStep2At1 ? '1' : 'superposition'}
                  stateLabel={isStep2At0 ? '|0⟩' : isStep2At1 ? '|1⟩' : '|ψ⟩'}
                  size={340}
                  pointerAccent={isStep2At0 ? 'cyan' : isStep2At1 ? 'purple' : 'emerald'}
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* State Controls and Live Synchronized Equation */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
                  <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#132238] border border-[#243B55]">
                    <button
                      type="button"
                      onClick={() => handleStep2SetPole('0')}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        step2TargetPole === '0'
                          ? 'bg-[#22D3EE] text-[#0A1128] shadow-md shadow-[#22D3EE]/20'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Point to |0⟩
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep2SetPole('1')}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        step2TargetPole === '1'
                          ? 'bg-[#A78BFA] text-[#0A1128] shadow-md shadow-[#A78BFA]/20'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Point to |1⟩
                    </button>
                  </div>

                  {/* Clean State Equation Synchronized in Real-Time */}
                  <div className="px-4 py-2 rounded-xl bg-[#1E293B]/80 border border-[#334155] text-sm font-mono tracking-wider text-[#F8FAFC] flex items-center gap-2 shadow-inner">
                    <span className="text-[#94A3B8] text-xs">Current State:</span>
                    <span
                      className={
                        isStep2At0
                          ? 'text-[#22D3EE] font-bold'
                          : isStep2At1
                          ? 'text-[#A78BFA] font-bold'
                          : 'text-[#34D399] font-bold'
                      }
                    >
                      {isStep2At0
                        ? '|ψ⟩ = |0⟩'
                        : isStep2At1
                        ? '|ψ⟩ = |1⟩'
                        : '|ψ⟩ = α|0⟩ + β|1⟩'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Superposition on the sphere */}
            {currentStep === 3 && (
              <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step3Theta}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight={isStep3AtPole ? '0' : 'superposition'}
                  stateLabel={isStep3AtPole ? '|0⟩' : '|ψ⟩'}
                  size={340}
                  pointerAccent={isStep3AtPole ? 'cyan' : 'emerald'}
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Transition toggle button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
                  <button
                    type="button"
                    onClick={handleStep3Toggle}
                    className="px-5 py-2.5 rounded-full bg-[#132238] hover:bg-[#1E293B] border border-[#243B55] hover:border-[#38BDF8]/60 text-sm font-semibold text-[#F8FAFC] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                    <span>
                      {step3Mode === 'pole' ? 'Move to Superposition Point' : 'Reset to Top |0⟩'}
                    </span>
                  </button>

                  <div className="px-4 py-2 rounded-xl bg-[#1E293B]/80 border border-[#334155] text-sm font-mono tracking-wider text-[#F8FAFC]">
                    {isStep3AtPole ? (
                      <span className="text-[#22D3EE] font-bold">|ψ⟩ = |0⟩</span>
                    ) : (
                      <span className="text-[#34D399] font-bold">|ψ⟩ = α|0⟩ + β|1⟩</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Interactive State Movement (Slider + Live Probabilities) */}
            {currentStep === 4 && (
              <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={step4Theta}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight={step4Percent === 0 ? '0' : step4Percent === 100 ? '1' : 'superposition'}
                  stateLabel={step4Percent === 0 ? '|0⟩' : step4Percent === 100 ? '|1⟩' : '|ψ⟩'}
                  size={320}
                  pointerAccent={
                    step4Percent === 0 ? 'cyan' : step4Percent === 100 ? 'purple' : 'emerald'
                  }
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Horizontal Learning Slider & Outcome Probabilities */}
                <div className="w-full max-w-md bg-[#132238]/90 border border-[#243B55] rounded-2xl p-4.5 space-y-4 shadow-lg">
                  {/* Slider Control */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-[#22D3EE]">|0⟩ (Top)</span>
                      <span className="text-[#CBD5E1] text-[11px] font-normal">Equator (Superposition)</span>
                      <span className="text-[#A78BFA]">|1⟩ (Bottom)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={step4Percent}
                      onChange={(e) => handleStep4SliderChange(Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-[#0A1128] appearance-none cursor-pointer accent-[#38BDF8]"
                    />
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex items-center justify-center gap-2 pt-1 border-t border-[#243B55]/50">
                    <button
                      type="button"
                      onClick={() => handleStep4SliderChange(0)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                        step4Percent === 0
                          ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 font-bold'
                          : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#243B55]'
                      }`}
                    >
                      100% |0⟩
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep4SliderChange(50)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                        step4Percent === 50
                          ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 font-bold'
                          : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#243B55]'
                      }`}
                    >
                      50/50 Equal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep4SliderChange(100)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                        step4Percent === 100
                          ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 font-bold'
                          : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#243B55]'
                      }`}
                    >
                      100% |1⟩
                    </button>
                  </div>

                  {/* Live Outcome Probabilities */}
                  <div className="pt-2 border-t border-[#243B55]/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-[#CBD5E1]">
                      <span>Measurement Probabilities:</span>
                      <span className="font-mono text-xs text-[#38BDF8]">
                        {step4Percent === 0
                          ? '|ψ⟩ = |0⟩'
                          : step4Percent === 100
                          ? '|ψ⟩ = |1⟩'
                          : '|ψ⟩ = α|0⟩ + β|1⟩'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      {/* 0 Bar */}
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-[#22D3EE] font-bold">0:</span>
                        <div className="flex-1 h-3 rounded-full bg-[#0A1128] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#22D3EE] to-[#0284C7] transition-all duration-150 rounded-full"
                            style={{ width: `${step4P0}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-[#CBD5E1]">{step4P0}%</span>
                      </div>

                      {/* 1 Bar */}
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-[#A78BFA] font-bold">1:</span>
                        <div className="flex-1 h-3 rounded-full bg-[#0A1128] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#818CF8] to-[#A78BFA] transition-all duration-150 rounded-full"
                            style={{ width: `${step4P1}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-[#CBD5E1]">{step4P1}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Gate + Bloch Sphere + Equation */}
            {currentStep === 5 && (
              <div className="w-full flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                
                {/* Circuit Wire Diagram above the sphere */}
                <div className="w-full max-w-md bg-[#132238]/90 border border-[#243B55] rounded-2xl px-6 py-3.5 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#94A3B8]">Input State</span>
                    <span className="px-2 py-0.5 rounded bg-[#0A1128] text-xs font-mono text-[#22D3EE] font-bold border border-[#243B55]">
                      |0⟩
                    </span>
                  </div>

                  {/* Wire with Gate Box */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-[#475569]"></div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm border transition-all duration-300 ${
                        step5GateApplied
                          ? 'bg-[#4F7CFF] border-[#60A5FA] text-white shadow-lg shadow-[#4F7CFF]/40 scale-105'
                          : 'bg-[#1E293B] border-[#475569] text-[#CBD5E1]'
                      }`}
                    >
                      {step5SelectedGate}
                    </div>
                    <div className="w-8 h-[2px] bg-[#475569]"></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#94A3B8]">Output</span>
                    <span className="px-2 py-0.5 rounded bg-[#0A1128] text-xs font-mono font-bold border border-[#243B55] text-white">
                      |ψ'⟩
                    </span>
                  </div>
                </div>

                {/* Bloch Sphere with Smooth Gate Rotation */}
                <BlochSphereVisualizer
                  theta={step5Theta}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight={
                    !step5GateApplied
                      ? '0'
                      : step5SelectedGate === 'X'
                      ? step5IsAnimating
                        ? 'superposition'
                        : '1'
                      : 'superposition'
                  }
                  stateLabel={
                    !step5GateApplied
                      ? '|0⟩'
                      : step5IsAnimating
                      ? '|ψ⟩'
                      : step5SelectedGate === 'X'
                      ? '|1⟩'
                      : "|ψ'⟩"
                  }
                  size={310}
                  pointerAccent={
                    !step5GateApplied
                      ? 'cyan'
                      : step5SelectedGate === 'X'
                      ? 'purple'
                      : 'emerald'
                  }
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Gate Selector, Action, and Equation */}
                <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#132238]/60 p-3 rounded-2xl border border-[#243B55]">
                  {/* Gate tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A1128]">
                    <button
                      type="button"
                      onClick={() => handleStep5SwitchGate('X')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        step5SelectedGate === 'X'
                          ? 'bg-[#4F7CFF] text-white shadow-sm'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      X Gate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep5SwitchGate('H')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        step5SelectedGate === 'H'
                          ? 'bg-[#4F7CFF] text-white shadow-sm'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      H Gate
                    </button>
                  </div>

                  {/* Apply Gate Button */}
                  <div className="flex items-center gap-2">
                    {!step5GateApplied ? (
                      <button
                        type="button"
                        onClick={handleStep5ApplyGate}
                        disabled={step5IsAnimating}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>APPLY {step5SelectedGate}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStep5ResetGate}
                        className="px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border border-[#475569]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* State Equation Evolution Synchronized with Gate Rotation */}
                <div className="w-full max-w-md px-4 py-2.5 rounded-xl bg-[#0A1128] border border-[#243B55] text-xs font-mono flex items-center justify-around text-center">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase">Before {step5SelectedGate}</span>
                    <span className="text-[#22D3EE] font-bold">|ψ⟩ = |0⟩</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#475569]" />
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase">After {step5SelectedGate}</span>
                    {step5GateApplied ? (
                      step5IsAnimating ? (
                        <span className="text-[#38BDF8] animate-pulse">Rotating...</span>
                      ) : step5SelectedGate === 'X' ? (
                        <span className="text-[#A78BFA] font-bold">|ψ'⟩ = |1⟩</span>
                      ) : (
                        <span className="text-[#34D399] font-bold">|ψ'⟩ = (|0⟩ + |1⟩)/√2</span>
                      )
                    ) : (
                      <span className="text-[#64748B]">Click Apply</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Final Summary Sphere View */}
            {currentStep === 6 && (
              <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <BlochSphereVisualizer
                  theta={Math.PI / 2}
                  showEquator={true}
                  showAxes={true}
                  showCenterLabel={true}
                  showVectorLabel={true}
                  highlight="superposition"
                  stateLabel="|ψ⟩"
                  size={340}
                  pointerAccent="emerald"
                  subtleNote="Visualization only — not the physical qubit."
                />

                {/* Visual Identity Capsule */}
                <div className="px-6 py-3 rounded-2xl bg-[#132238] border border-[#243B55] text-center shadow-lg">
                  <div className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">
                    Bloch Sphere
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Visual map of one qubit state
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================================================================= */}
          {/* RIGHT SIDE (~45%): EXPLANATION, EQUATION & PROGRESSION            */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pl-2">
            
            {/* Step 1: Why Do We Need a Visual? */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132238] border border-[#243B55] text-[#22D3EE] text-xs font-mono font-semibold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Intermediate Level • Step 1</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                    Why do we need a visual?
                  </h2>
                  <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                    You already know that a qubit can be in <span className="text-[#22D3EE] font-mono font-bold">|0⟩</span>, <span className="text-[#A78BFA] font-mono font-bold">|1⟩</span>, or a superposition of both.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#132238]/80 border border-[#243B55] space-y-3 shadow-sm">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#CBD5E1] font-semibold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#4F7CFF]" />
                    <span>The Natural Question</span>
                  </h3>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    How can we visualize the state of one qubit?
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#132238] to-[#1A2E4C] border border-[#38BDF8]/30 space-y-2 shadow-md">
                  <div className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-bold">
                    The Solution
                  </div>
                  <div className="text-lg font-bold text-white">
                    The Bloch Sphere
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    The Bloch sphere is a visual map of all the possible states of a single qubit.
                  </p>
                  <p className="text-xs text-[#64748B] pt-1 font-mono">
                    It is not the physical qubit itself — it is our geometric map.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: |0⟩ and |1⟩ Poles */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132238] border border-[#243B55] text-[#22D3EE] text-xs font-mono font-semibold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Intermediate Level • Step 2</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                    The Poles: |0⟩ and |1⟩
                  </h2>
                  <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                    Every map has reference points. On the Bloch sphere, the two basic states live at the opposite poles:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#132238]/70 border border-[#22D3EE]/30 flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] mt-1.5 shrink-0"></div>
                    <div>
                      <div className="text-sm font-bold text-white">Top of the sphere</div>
                      <div className="text-xs text-[#94A3B8]">Represents the standard basis state <span className="font-mono text-[#22D3EE] font-bold">|0⟩</span>.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#132238]/70 border border-[#A78BFA]/30 flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] mt-1.5 shrink-0"></div>
                    <div>
                      <div className="text-sm font-bold text-white">Bottom of the sphere</div>
                      <div className="text-xs text-[#94A3B8]">Represents the flipped basis state <span className="font-mono text-[#A78BFA] font-bold">|1⟩</span>.</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#243B55] text-xs text-[#CBD5E1] space-y-1 font-mono">
                  <div className="text-[#38BDF8] font-bold">The State Pointer:</div>
                  <p className="text-[#94A3B8]">
                    The arrow points to the qubit's current state on this visual map. Try toggling between |0⟩ and |1⟩ on the left.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Superposition on the sphere */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132238] border border-[#243B55] text-[#22D3EE] text-xs font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Intermediate Level • Step 3</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                    Superposition on the Sphere
                  </h2>
                  <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                    A qubit is not limited to only the top or the bottom. Other points on the sphere represent <span className="text-[#34D399] font-semibold">superposition states</span>.
                  </p>
                </div>

                {/* The Equation Connection */}
                <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] space-y-3">
                  <div className="text-xs font-mono text-[#CBD5E1] uppercase tracking-wider">
                    The State Equation
                  </div>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-white text-center py-2 bg-[#0A1128] rounded-xl border border-[#243B55]/60">
                    |ψ⟩ = α|0⟩ + β|1⟩
                  </div>
                  <div className="space-y-2 pt-2 text-xs text-[#94A3B8] font-mono leading-relaxed">
                    <div>• <span className="text-white font-bold">|ψ⟩</span> : the qubit's current state</div>
                    <div>• <span className="text-[#22D3EE] font-bold">|0⟩</span> and <span className="text-[#A78BFA] font-bold">|1⟩</span> : the two basic states</div>
                    <div>• <span className="text-[#34D399] font-bold">α</span> and <span className="text-[#34D399] font-bold">β</span> : how much each state contributes</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#243B55] text-xs text-[#CBD5E1]">
                  <span className="font-bold text-[#38BDF8]">Key Takeaway:</span> Superposition is one quantum state, not two separate classical values running in parallel.
                </div>
              </div>
            )}

            {/* Step 4: Interactive State Movement */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132238] border border-[#243B55] text-[#22D3EE] text-xs font-mono font-semibold">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Intermediate Level • Step 4</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                    State Movement & Probability
                  </h2>
                  <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                    The state can move between different points on this visual map.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#132238]/70 border border-[#243B55] space-y-1 text-xs">
                    <div className="font-bold text-white">Visual Angle Determines Outcome:</div>
                    <p className="text-[#94A3B8] leading-relaxed">
                      When the pointer is closer to the top pole, measuring gives 0 more often. When closer to the bottom pole, it gives 1 more often.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#132238]/70 border border-[#243B55] space-y-1 text-xs">
                    <div className="font-bold text-white">Equator = Equal 50/50:</div>
                    <p className="text-[#94A3B8] leading-relaxed">
                      At the equator, the state is midway between both poles, giving an equal 50% probability for 0 and 50% for 1.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#243B55] text-xs text-[#94A3B8] font-mono">
                  Move the slider on the left to see how the state pointer and outcome chances shift together in real time.
                </div>
              </div>
            )}

            {/* Step 5: Gate + Bloch Sphere + Equation */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132238] border border-[#243B55] text-[#22D3EE] text-xs font-mono font-semibold">
                  <Layers className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>Intermediate Level • Step 5</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                    Gates on the Sphere
                  </h2>
                  <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                    In quantum circuits, quantum gates change the qubit state.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#132238]/80 border border-[#243B55] space-y-2">
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#4F7CFF] text-white flex items-center justify-center text-[10px]">X</span>
                      <span>The NOT Gate (X)</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      The X gate flips the state from top (|0⟩) to bottom (|1⟩). On the sphere, this moves the pointer straight across to the opposite pole.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#132238]/80 border border-[#243B55] space-y-2">
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#4F7CFF] text-white flex items-center justify-center text-[10px]">H</span>
                      <span>The Hadamard Gate (H)</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      The H gate creates an equal superposition: it moves the pointer from the top pole (|0⟩) down to the equator!
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#64748B] font-mono">
                  Try applying both gates on the left to watch the circuit, sphere, and equation update together.
                </p>
              </div>
            )}

            {/* Step 6: Final Summary & Progression */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132238] border border-[#243B55] text-[#34D399] text-xs font-mono font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Intermediate Concept Mastery</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                    What did you learn?
                  </h2>
                </div>

                {/* Takeaway Bullets */}
                <div className="space-y-2.5">
                  {[
                    'The Bloch sphere is a visual representation of one qubit’s state.',
                    '|0⟩ is represented at the top pole.',
                    '|1⟩ is represented at the bottom pole.',
                    'Other points on the sphere represent superposition states.',
                    'Quantum gates change the state, moving the point on the Bloch sphere.',
                    'The Bloch sphere is not the physical qubit — it is only a way to visualize its state.',
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#132238]/70 border border-[#243B55] flex items-start gap-2.5 text-xs text-[#CBD5E1]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Transition teaser: Why? */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#132238] to-[#1B2A4A] border border-[#4F7CFF]/30 space-y-2">
                  <div className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                    The Next Mystery
                  </div>
                  <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                    “Two quantum states can sometimes have the same measurement probabilities and still be different.”
                  </p>
                  <p className="text-xs text-[#A78BFA] font-mono font-bold">
                    Why? The answer is Quantum Phase.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="pt-4 border-t border-[#243B55]/60">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={6}
                canContinue={true}
                onBack={handlePrevStep}
                onContinue={() => {
                  if (currentStep < 6) {
                    handleNextStep();
                  } else {
                    if (onNextLesson) {
                      onNextLesson();
                    } else {
                      onComplete();
                    }
                  }
                }}
                finalStepLabel="NEXT: QUANTUM PHASE"
              />
            </div>

          </div>

        </div>

      </div>
    </LessonShell>
  );
};
