import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { SuccessFeedback } from '../components/fullscreen-lesson/SuccessFeedback';
import { SummaryScreen } from '../components/fullscreen-lesson/SummaryScreen';
import { 
  Lightbulb, 
  Info, 
  Check, 
  ToggleRight,
  Thermometer,
  Ruler,
  Gauge,
} from 'lucide-react';

interface BitLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

export const BitLessonView: React.FC<BitLessonViewProps> = ({
  onExit,
  onComplete,
}) => {
  // Current active step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Furthest unlocked step (starts at 1; unlocked steps can be revisited freely)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // ==========================================
  // STEP 1 STATE: Two States (Light Switch)
  // ==========================================
  const [isLightOn, setIsLightOn] = useState(false);
  const [hasToggledOnce, setHasToggledOnce] = useState(false);
  const [toggleCount, setToggleCount] = useState(0);
  const [step1NoticeRevealed, setStep1NoticeRevealed] = useState(false);

  const handleToggleLight = () => {
    const nextState = !isLightOn;
    setIsLightOn(nextState);
    setHasToggledOnce(true);
    const nextCount = toggleCount + 1;
    setToggleCount(nextCount);

    if (nextCount >= 2 && !step1NoticeRevealed) {
      setTimeout(() => {
        setStep1NoticeRevealed(true);
        setMaxUnlockedStep((prev) => Math.max(prev, 2));
      }, 400);
    }
  };

  // ==========================================
  // STEP 2 STATE: Recognize Two-State System
  // ==========================================
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [step2RevealedPause, setStep2RevealedPause] = useState(false);
  const [step2Feedback, setStep2Feedback] = useState<{
    status: 'idle' | 'success' | 'hint';
    message: string;
    subMessage?: string;
  }>({ status: 'idle', message: '' });

  const twoStateOptions = [
    {
      id: 'switch',
      title: 'Light switch',
      subtitle: 'OFF / ON',
      icon: ToggleRight,
      isCorrect: true,
    },
    {
      id: 'temp',
      title: 'Temperature',
      subtitle: 'many possible values',
      icon: Thermometer,
      isCorrect: false,
    },
    {
      id: 'distance',
      title: 'Distance',
      subtitle: 'many possible values',
      icon: Ruler,
      isCorrect: false,
    },
    {
      id: 'speed',
      title: 'Speed',
      subtitle: 'many possible values',
      icon: Gauge,
      isCorrect: false,
    },
  ];

  const handleSelectStep2Option = (opt: typeof twoStateOptions[0]) => {
    setSelectedOptionId(opt.id);
    if (opt.isCorrect) {
      setStep2Feedback({
        status: 'success',
        message: 'Exactly! A light switch has two distinct states: OFF and ON.',
      });
      setTimeout(() => {
        setStep2RevealedPause(true);
        setMaxUnlockedStep((prev) => Math.max(prev, 3));
      }, 500);
    } else {
      setStep2Feedback({
        status: 'hint',
        message: `${opt.title} can have continuous, infinite variations.`,
        subMessage: 'Which of these naturally has only two clear states?',
      });
    }
  };

  // ==========================================
  // STEP 3 STATE: Connect OFF/ON to 0/1
  // ==========================================
  const [step3RevealedStage, setStep3RevealedStage] = useState(1);
  const [step3ActiveMapping, setStep3ActiveMapping] = useState<'off' | 'on'>('on');
  const [showBinaryOriginInfo, setShowBinaryOriginInfo] = useState(false);

  useEffect(() => {
    if (currentStep === 3) {
      if (maxUnlockedStep >= 4 || step3RevealedStage >= 4) {
        setStep3RevealedStage(4);
        return;
      }

      const t1 = setTimeout(() => setStep3RevealedStage(2), 600);
      const t2 = setTimeout(() => setStep3RevealedStage(3), 1200);
      const t3 = setTimeout(() => {
        setStep3RevealedStage(4);
        setMaxUnlockedStep((prev) => Math.max(prev, 4));
      }, 1800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [currentStep, maxUnlockedStep]);

  // ==========================================
  // STEP 4 STATE: Use One Bit (0 / 1)
  // ==========================================
  const [selectedBitChoice, setSelectedBitChoice] = useState<number | null>(null);
  const [step4Feedback, setStep4Feedback] = useState<{
    status: 'idle' | 'success' | 'hint';
    message: string;
    subMessage?: string;
  }>({ status: 'idle', message: '' });

  const handleChooseBit = (val: number) => {
    setSelectedBitChoice(val);
    if (val === 1) {
      setStep4Feedback({
        status: 'success',
        message: 'Nice! You just represented information using one bit.',
        subMessage: 'A bit can represent one of two possible choices.',
      });
      setMaxUnlockedStep((prev) => Math.max(prev, 5));
    } else {
      setStep4Feedback({
        status: 'hint',
        message: 'The light is ON. Which value represents YES?',
        subMessage: 'Remember: 0 = NO, 1 = YES.',
      });
    }
  };

  // ==========================================
  // NAVIGATION LOGIC (FORWARD / BACKWARD)
  // ==========================================
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 5) {
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

  // Check if current step can advance to next
  const isStep1Complete = step1NoticeRevealed || maxUnlockedStep > 1;
  const isStep2Complete = (selectedOptionId === 'switch' && step2Feedback.status === 'success') || maxUnlockedStep > 2;
  const isStep3Complete = step3RevealedStage >= 4 || maxUnlockedStep > 3;
  const isStep4Complete = (selectedBitChoice === 1) || maxUnlockedStep > 4;

  let canContinueCurrent = false;
  if (currentStep === 1) canContinueCurrent = isStep1Complete;
  else if (currentStep === 2) canContinueCurrent = isStep2Complete;
  else if (currentStep === 3) canContinueCurrent = isStep3Complete;
  else if (currentStep === 4) canContinueCurrent = isStep4Complete;
  else if (currentStep === 5) canContinueCurrent = true;

  // Step 1 dark environment when light is OFF
  const isDarkEnv = currentStep === 1 && !isLightOn;

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={5}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      {/* =========================================================================
          STEP 1: LIGHT INTERACTION (TWO STATES)
          ========================================================================= */}
      {currentStep === 1 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Bulb fixture, current state & switch */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
            <div className="relative flex flex-col items-center w-full max-w-md">
              
              {/* Soft ambient light glow behind bulb when ON */}
              <div
                className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full -z-10 blur-3xl transition-opacity duration-700 pointer-events-none ${
                  isLightOn ? 'bg-amber-400/25 opacity-100' : 'opacity-0'
                }`}
              />

              {/* Prominent Bulb Fixture */}
              <div
                className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center transition-all duration-700 ${
                  isLightOn
                    ? 'bg-amber-400/20 text-amber-300 border-2 border-amber-400/60 shadow-[0_0_45px_rgba(251,191,36,0.35)] ring-8 ring-amber-400/20 scale-105'
                    : 'bg-[#0D1B2A] text-slate-500 border border-[#243B55] scale-95 shadow-inner'
                }`}
              >
                <Lightbulb
                  className={`w-20 h-20 sm:w-24 sm:h-24 transition-all duration-500 ${
                    isLightOn
                      ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]'
                      : 'text-slate-500 fill-none'
                  }`}
                />
              </div>

              {/* State label */}
              <div className="mt-5 flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold tracking-widest uppercase transition-colors duration-500 px-3.5 py-1 rounded-full ${
                    isLightOn
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55]'
                  }`}
                >
                  State: {isLightOn ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* Tactile Switch Button */}
              <button
                id="light-switch-btn"
                type="button"
                onClick={handleToggleLight}
                className={`mt-6 px-9 py-4 rounded-full font-bold text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer active:scale-95 shadow-md flex items-center gap-2.5 ${
                  isLightOn
                    ? 'bg-[#132238] hover:bg-[#1a2f4c] text-[#F8FAFC] border border-[#243B55] hover:border-[#4F7CFF]/50'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-[0_2px_18px_rgba(251,191,36,0.35)]'
                }`}
              >
                <span>{isLightOn ? 'SWITCH OFF' : 'SWITCH ON'}</span>
              </button>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Headings, progressive reveals & Controls */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            {/* Primary Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#FFFFFF] leading-tight">
              {hasToggledOnce || maxUnlockedStep > 1
                ? 'Great! The light is ON.'
                : 'It’s dark here. Can you turn on the light?'}
            </h1>

            {/* Progressive text reveals */}
            {(hasToggledOnce || maxUnlockedStep > 1) && (
              <div className="space-y-4 w-full animate-in fade-in duration-500">
                <p className="text-base sm:text-lg font-medium leading-relaxed text-[#CBD5E1]">
                  Try switching it OFF and ON.
                </p>

                {/* Observation revealed after learner switches between states */}
                {(step1NoticeRevealed || maxUnlockedStep > 1) && (
                  <div className="space-y-2 pt-2 border-t border-[#243B55] animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-sm sm:text-base font-medium italic text-[#94A3B8]">
                      Notice something?
                    </p>
                    <p className="text-lg sm:text-xl font-bold leading-relaxed text-[#FFFFFF]">
                      The light has two clear states:{' '}
                      <span className="text-[#22D3EE] underline decoration-[#22D3EE]/50 underline-offset-4">OFF</span> and{' '}
                      <span className="text-[#22D3EE] underline decoration-[#22D3EE]/50 underline-offset-4">ON</span>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Controls: Desktop bottom-right / Mobile sticky area */}
            <div
              className={`pt-4 w-full flex items-center justify-between sm:justify-end transition-opacity duration-300 fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0 ${
                canContinueCurrent ? 'opacity-100' : 'opacity-40 sm:opacity-50'
              }`}
            >
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={5}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 2: IDENTIFY TWO STATES
          ========================================================================= */}
      {currentStep === 2 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Four simple visual choices */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              {twoStateOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedOptionId === opt.id || (maxUnlockedStep > 2 && opt.isCorrect);
                const isCorrectSelection = isSelected && opt.isCorrect;

                return (
                  <button
                    key={opt.id}
                    id={`two-state-opt-${opt.id}`}
                    type="button"
                    onClick={() => handleSelectStep2Option(opt)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isCorrectSelection
                        ? 'border-[#22C55E]/70 bg-emerald-950/30 ring-1 ring-emerald-500/40 text-[#F8FAFC] shadow-sm'
                        : isSelected
                        ? 'border-[#EF4444]/60 bg-rose-950/25 text-[#F8FAFC]'
                        : 'border-[#243B55] bg-[#132238] hover:border-[#4F7CFF]/50 hover:bg-[#1a2f4c] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isCorrectSelection
                            ? 'bg-[#22C55E] text-slate-950'
                            : 'bg-[#0D1B2A] text-[#CBD5E1] border border-[#243B55]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {isCorrectSelection && (
                        <div className="w-5 h-5 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#F8FAFC] mb-0.5">
                        {opt.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] font-mono">
                        {opt.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Question, Feedback & Controls */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-5">
            
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-snug">
                Which of these naturally has two clear states?
              </h2>
              <p className="text-sm text-[#94A3B8] mt-2">
                Look at how each behaves in the physical world.
              </p>
            </div>

            {/* Feedback & Revelation */}
            {(step2Feedback.status !== 'idle' || maxUnlockedStep > 2) && (
              <div className="space-y-4 w-full animate-in fade-in duration-300">
                <SuccessFeedback
                  message={
                    step2Feedback.message ||
                    'Exactly! A light switch has two distinct states: OFF and ON.'
                  }
                  subMessage={step2Feedback.subMessage}
                  type={step2Feedback.status === 'hint' ? 'hint' : 'success'}
                  className="items-start text-left max-w-none mx-0"
                />

                {(step2RevealedPause || maxUnlockedStep > 2) && (
                  <div className="pt-2 border-t border-[#243B55] animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <p className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-relaxed">
                      Computers also use the idea of two distinct logical states.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Controls: Desktop bottom-right / Mobile sticky area */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={5}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 3: CONNECT OFF / ON TO 0 / 1
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Animated mapping visual OFF -> 0 and ON -> 1 */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-md bg-[#132238]/80 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm">
              
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8] text-center mb-6">
                Logical State Mapping
              </div>

              <div className="space-y-4">
                {/* Row 1: OFF -> 0 */}
                <button
                  type="button"
                  onClick={() => setStep3ActiveMapping('off')}
                  className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    step3ActiveMapping === 'off'
                      ? 'border-[#4F7CFF] bg-[#0D1B2A] ring-2 ring-[#4F7CFF]/30 shadow-xs'
                      : 'border-[#243B55] bg-[#0D1B2A]/60 hover:bg-[#0D1B2A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#132238] border border-[#243B55] text-slate-400 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-mono font-bold text-base text-[#CBD5E1]">OFF</span>
                  </div>

                  <span className="text-[#94A3B8] font-mono text-lg">→</span>

                  <div className="w-12 text-right">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-[#22D3EE]">0</span>
                  </div>
                </button>

                {/* Row 2: ON -> 1 */}
                <button
                  type="button"
                  onClick={() => setStep3ActiveMapping('on')}
                  className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    step3ActiveMapping === 'on'
                      ? 'border-[#4F7CFF] bg-[#0D1B2A] ring-2 ring-[#4F7CFF]/30 shadow-xs'
                      : 'border-[#243B55] bg-[#0D1B2A]/60 hover:bg-[#0D1B2A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-xs">
                      <Lightbulb className="w-4 h-4 fill-amber-300 text-amber-300" />
                    </div>
                    <span className="font-mono font-bold text-base text-[#FFFFFF]">ON</span>
                  </div>

                  <span className="text-[#94A3B8] font-mono text-lg">→</span>

                  <div className="w-12 text-right">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-[#4F7CFF]">1</span>
                  </div>
                </button>
              </div>

              {/* Supporting visual badge */}
              <div className="mt-6 pt-4 border-t border-[#243B55] flex items-center justify-center text-xs font-mono text-[#94A3B8]">
                <span>Click a state to observe mapping</span>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Transition text, Definition & Controls */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            {/* Reveal 1: Core conceptual transition */}
            <div
              className={`transition-all duration-500 ${
                step3RevealedStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
                A digital computer also works with two logical states.
                <br className="hidden sm:inline" />
                {' '}Instead of writing <strong className="font-semibold text-[#FFFFFF]">OFF</strong> and <strong className="font-semibold text-[#FFFFFF]">ON</strong>, we usually represent these two states using <strong className="font-mono font-bold text-[#22D3EE]">0</strong> and <strong className="font-mono font-bold text-[#4F7CFF]">1</strong>.
              </p>
            </div>

            {/* Reveal 2: Definition of BIT */}
            <div
              className={`transition-all duration-500 ${
                step3RevealedStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed font-medium">
                A single value that can be either 0 or 1 is called a{' '}
                <strong className="text-[#22D3EE] font-extrabold text-xl sm:text-2xl tracking-tight underline decoration-[#22D3EE]/40 underline-offset-4">
                  bit
                </strong>.
              </p>
            </div>

            {/* Reveal 3: Prominent BIT -> 0 or 1 Diagram */}
            <div
              className={`transition-all duration-500 w-full ${
                step3RevealedStage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="bg-[#0D1B2A] border border-[#243B55] rounded-2xl px-6 py-4 flex flex-col items-center w-full max-w-xs shadow-xs">
                <span className="font-mono font-black text-lg tracking-widest text-[#FFFFFF]">
                  BIT
                </span>
                <span className="text-[#94A3B8] text-xs my-0.5 font-mono">↓</span>
                <span className="font-mono font-bold text-base text-[#22D3EE] tracking-wider">
                  0 or 1
                </span>
              </div>
            </div>

            {/* Reveal 4: Small supporting line, optional fact */}
            <div
              className={`transition-all duration-500 space-y-4 w-full ${
                step3RevealedStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                0 and 1 are logical values used to represent two distinct states.
              </p>

              {/* Optional tiny info icon for origin */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowBinaryOriginInfo(!showBinaryOriginInfo)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-mono transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{showBinaryOriginInfo ? 'Hide origin' : 'Bit comes from binary digit'}</span>
                </button>

                {showBinaryOriginInfo && (
                  <p className="text-xs font-mono text-[#CBD5E1] mt-1.5 animate-in fade-in">
                    “Bit” comes from <strong className="text-[#FFFFFF]">bi</strong>nary digi<strong className="text-[#FFFFFF]">t</strong>.
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Controls: Desktop bottom-right / Mobile sticky area */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={5}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 4: USE ONE BIT (Now You Try)
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Light in ON state & two large answer options [0] [1] */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-sm flex flex-col items-center">
              
              {/* Light fixture in the ON state */}
              <div className="w-full bg-[#132238]/80 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 shadow-sm flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-amber-400/20 text-amber-300 shadow-lg shadow-amber-400/10 ring-4 ring-amber-400/25 flex items-center justify-center mb-3">
                  <Lightbulb className="w-12 h-12 fill-amber-300 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold px-3 py-1 bg-amber-500/20 rounded-full border border-amber-400/40">
                  Light: ON
                </span>
              </div>

              {/* Two large options: [0] and [1] */}
              <div className="grid grid-cols-2 gap-4 w-full">
                {[0, 1].map((val) => {
                  const isSelected = selectedBitChoice === val || (maxUnlockedStep > 4 && val === 1);
                  const isCorrect = val === 1 && isSelected;

                  return (
                    <button
                      key={val}
                      id={`bit-choice-btn-${val}`}
                      type="button"
                      onClick={() => handleChooseBit(val)}
                      className={`py-6 rounded-2xl border-2 font-mono font-black text-4xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                        isCorrect
                          ? 'border-[#22C55E]/70 bg-emerald-950/30 ring-2 ring-emerald-500/40 text-[#F8FAFC] shadow-sm'
                          : isSelected
                          ? 'border-[#EF4444]/60 bg-rose-950/25 text-[#F8FAFC]'
                          : 'border-[#243B55] bg-[#132238] hover:border-[#4F7CFF]/50 hover:bg-[#1a2f4c] text-[#F8FAFC] shadow-xs'
                      }`}
                    >
                      <span>{val}</span>
                      <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#94A3B8] mt-1">
                        {val === 0 ? 'NO' : 'YES'}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Heading, Convention, Question, Feedback */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-5">
            
            {/* Heading */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">
                Practice
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight">
                Now you try.
              </h2>
            </div>

            {/* Key convention */}
            <div className="inline-flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-sm font-mono font-bold text-[#CBD5E1]">
              <span>0 = NO</span>
              <span className="text-[#94A3B8]">·</span>
              <span>1 = YES</span>
            </div>

            {/* Question */}
            <p className="text-xl sm:text-2xl font-bold text-[#FFFFFF]">
              Is the light ON?
            </p>

            {/* Feedback & Continue */}
            {(step4Feedback.status !== 'idle' || maxUnlockedStep > 4) && (
              <div className="space-y-4 w-full animate-in fade-in duration-300">
                <SuccessFeedback
                  message={
                    step4Feedback.message ||
                    'Nice! You just represented information using one bit.'
                  }
                  subMessage={
                    step4Feedback.subMessage ||
                    'A bit can represent one of two possible choices.'
                  }
                  type={step4Feedback.status === 'hint' ? 'hint' : 'success'}
                  className="items-start text-left max-w-none mx-0"
                />
              </div>
            )}

            {/* Navigation Controls: Desktop bottom-right / Mobile sticky area */}
            <div className="pt-4 w-full flex items-center justify-between sm:justify-end fixed bottom-0 inset-x-0 sm:static p-4 sm:p-0 z-30 bg-[#08111F]/95 sm:bg-transparent border-t border-[#243B55] sm:border-0">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={5}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 5: FINAL SUMMARY (SEE / DO on Left, UNDERSTAND on Right)
          ========================================================================= */}
      {currentStep === 5 && (
        <SummaryScreen
          lessonTitle="Bit"
          nextLessonTitle="Probability"
          onNextLesson={onComplete}
          onBackToPath={onExit}
          onBack={handleBack}
          isAlreadyViewed={maxUnlockedStep >= 5}
        />
      )}

    </LessonShell>
  );
};

