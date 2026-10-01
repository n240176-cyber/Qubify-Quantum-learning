import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { SuccessFeedback } from '../components/fullscreen-lesson/SuccessFeedback';
import { ProbabilitySummaryScreen } from '../components/fullscreen-lesson/ProbabilitySummaryScreen';
import { 
  Check, 
  HelpCircle,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ProbabilityLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

export const ProbabilityLessonView: React.FC<ProbabilityLessonViewProps> = ({
  onExit,
  onComplete,
}) => {
  // Current active step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Furthest unlocked step (starts at 1; unlocked steps can be revisited freely)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // =========================================================================
  // STEP 1 STATE: Experience Uncertainty (Coin Toss)
  // =========================================================================
  const [step1Prediction, setStep1Prediction] = useState<'heads' | 'tails' | null>(null);
  const [step1IsFlipping, setStep1IsFlipping] = useState(false);
  const [step1CoinResult, setStep1CoinResult] = useState<'heads' | 'tails' | null>(null);
  const [step1RevealedNotice, setStep1RevealedNotice] = useState(false);

  const handlePredictAndToss = (prediction: 'heads' | 'tails') => {
    if (step1IsFlipping) return;
    setStep1Prediction(prediction);
    setStep1IsFlipping(true);

    // Randomize or select result with realistic flip duration
    const outcomes: ('heads' | 'tails')[] = ['heads', 'tails'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    setTimeout(() => {
      setStep1CoinResult(outcome);
      setStep1IsFlipping(false);
      setTimeout(() => {
        setStep1RevealedNotice(true);
        setMaxUnlockedStep((prev) => Math.max(prev, 2));
      }, 500);
    }, 1100);
  };

  // =========================================================================
  // STEP 2 STATE: Repeat the Experiment (10 tosses -> 100 tosses)
  // =========================================================================
  const [step2TossMode, setStep2TossMode] = useState<'10' | '100'>('10');
  const tenTossSequence: ('H' | 'T')[] = ['H', 'T', 'H', 'H', 'T', 'T', 'H', 'H', 'T', 'H'];

  const handleRun100Tosses = () => {
    setStep2TossMode('100');
    setMaxUnlockedStep((prev) => Math.max(prev, 3));
  };

  // =========================================================================
  // STEP 3 STATE: Probability is Not Always 50-50 (Ball Bag)
  // =========================================================================
  const [step3SelectedOption, setStep3SelectedOption] = useState<string | null>(null);
  const [step3Feedback, setStep3Feedback] = useState<{
    status: 'idle' | 'success' | 'hint';
    message: string;
    subMessage?: string;
  }>({ status: 'idle', message: '' });

  const handleSelectStep3Option = (optionId: 'red' | 'blue' | 'equal') => {
    setStep3SelectedOption(optionId);
    if (optionId === 'red') {
      setStep3Feedback({
        status: 'success',
        message: 'Right. Red is more likely because 3 out of the 4 balls are red.',
      });
      setMaxUnlockedStep((prev) => Math.max(prev, 4));
    } else if (optionId === 'blue') {
      setStep3Feedback({
        status: 'hint',
        message: 'Look closely at the quantities.',
        subMessage: 'There are 3 red balls and only 1 blue ball in the bag.',
      });
    } else {
      setStep3Feedback({
        status: 'hint',
        message: 'The chances would only be equal if both colors had the same number of balls.',
        subMessage: 'Which color has more balls inside?',
      });
    }
  };

  // =========================================================================
  // STEP 4 STATE: Misconception Checks (Two questions in one step)
  // =========================================================================
  const [step4ChoiceQ1, setStep4ChoiceQ1] = useState<string | null>(null);
  const [step4FeedbackQ1, setStep4FeedbackQ1] = useState<{
    status: 'idle' | 'success' | 'hint';
    message: string;
    subMessage?: string;
  }>({ status: 'idle', message: '' });

  const [step4ChoiceQ2, setStep4ChoiceQ2] = useState<'yes' | 'no' | null>(null);
  const [step4FeedbackQ2, setStep4FeedbackQ2] = useState<{
    status: 'idle' | 'success' | 'hint';
    message: string;
    subMessage?: string;
  }>({ status: 'idle', message: '' });

  const handleSelectStep4Q1 = (choice: 'A' | 'B' | 'C') => {
    setStep4ChoiceQ1(choice);
    if (choice === 'C') {
      setStep4FeedbackQ1({
        status: 'success',
        message: 'Exactly! Both sequences are possible.',
      });
    } else {
      setStep4FeedbackQ1({
        status: 'hint',
        message: 'Every sequence of 10 fair coin tosses is possible.',
        subMessage: 'Does a coin have rules about repeating or alternating?',
      });
    }
  };

  const handleSelectStep4Q2 = (choice: 'yes' | 'no') => {
    setStep4ChoiceQ2(choice);
    if (choice === 'no') {
      setStep4FeedbackQ2({
        status: 'success',
        message: 'No.',
        subMessage: 'For an independent fair coin toss, the next toss still has a 50% chance of HEADS and a 50% chance of TAILS.',
      });
      setMaxUnlockedStep((prev) => Math.max(prev, 5));
    } else {
      setStep4FeedbackQ2({
        status: 'hint',
        message: 'Does a physical coin remember what it landed on in previous tosses?',
        subMessage: 'Think about whether previous tosses change the physical coin.',
      });
    }
  };

  // =========================================================================
  // NAVIGATION HANDLERS (FORWARD / BACKWARD)
  // =========================================================================
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

  // Check if current step can advance
  const isStep1Complete = step1RevealedNotice || maxUnlockedStep > 1;
  const isStep2Complete = step2TossMode === '100' || maxUnlockedStep > 2;
  const isStep3Complete = (step3SelectedOption === 'red' && step3Feedback.status === 'success') || maxUnlockedStep > 3;
  const isStep4Complete = (step4ChoiceQ1 === 'C' && step4ChoiceQ2 === 'no') || maxUnlockedStep > 4;

  let canContinueCurrent = false;
  if (currentStep === 1) canContinueCurrent = isStep1Complete;
  else if (currentStep === 2) canContinueCurrent = isStep2Complete;
  else if (currentStep === 3) canContinueCurrent = isStep3Complete;
  else if (currentStep === 4) canContinueCurrent = isStep4Complete;
  else if (currentStep === 5) canContinueCurrent = true;

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={5}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      {/* =========================================================================
          STEP 1: EXPERIENCE UNCERTAINTY (Coin Toss Prediction)
          ========================================================================= */}
      {currentStep === 1 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - One large clean coin & prediction buttons */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
            <div className="relative flex flex-col items-center w-full max-w-md">
              
              {/* Subtle ambient blur aura */}
              <div 
                className="absolute w-64 h-64 rounded-full blur-3xl -z-10 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(79,124,255,0.08) 50%, transparent 70%)',
                }}
              />

              {/* Large Clean Coin with 3D Flip */}
              <div className="perspective-1000 my-4">
                <div
                  className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-transform duration-1000 select-none shadow-xl border-4 border-amber-300 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 ring-8 ring-amber-400/20 ${
                    step1IsFlipping ? 'animate-bounce [transform:rotateY(1440deg)_scale(1.08)]' : ''
                  }`}
                  style={{
                    boxShadow: '0 20px 40px -10px rgba(245, 158, 11, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -4px 6px rgba(180, 83, 9, 0.5)'
                  }}
                >
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-amber-300/80 flex flex-col items-center justify-center bg-amber-400/30">
                    <span className="font-mono font-black text-4xl sm:text-5xl text-amber-950 tracking-wider drop-shadow-xs">
                      {step1CoinResult === 'tails' ? 'T' : 'H'}
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-950/80 mt-1">
                      {step1CoinResult === 'tails' ? 'TAILS' : 'HEADS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prediction prompt & Two Prediction Buttons */}
              <div className="w-full max-w-xs mt-6 flex flex-col items-center gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  {step1CoinResult ? 'Predicted outcome' : 'Make your prediction:'}
                </span>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    id="predict-heads-btn"
                    type="button"
                    disabled={step1IsFlipping}
                    onClick={() => handlePredictAndToss('heads')}
                    className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-1 ${
                      step1Prediction === 'heads'
                        ? 'border-[#4F7CFF] bg-[#0D1B2A] text-[#22D3EE] ring-2 ring-[#4F7CFF]/30 shadow-sm'
                        : 'border-[#243B55] bg-[#132238] hover:border-[#4F7CFF]/50 hover:bg-[#1a2f4c] text-[#F8FAFC] shadow-xs'
                    }`}
                  >
                    <span className="font-black text-base">HEADS</span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">Option H</span>
                  </button>

                  <button
                    id="predict-tails-btn"
                    type="button"
                    disabled={step1IsFlipping}
                    onClick={() => handlePredictAndToss('tails')}
                    className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-1 ${
                      step1Prediction === 'tails'
                        ? 'border-[#4F7CFF] bg-[#0D1B2A] text-[#22D3EE] ring-2 ring-[#4F7CFF]/30 shadow-sm'
                        : 'border-[#243B55] bg-[#132238] hover:border-[#4F7CFF]/50 hover:bg-[#1a2f4c] text-[#F8FAFC] shadow-xs'
                    }`}
                  >
                    <span className="font-black text-base">TAILS</span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">Option T</span>
                  </button>
                </div>

                {/* Optional re-toss button */}
                {step1CoinResult && (
                  <button
                    id="toss-again-btn"
                    type="button"
                    onClick={() => handlePredictAndToss(step1Prediction || 'heads')}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-mono transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip again</span>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Headings, progressive reveals & Controls */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
              {!step1Prediction
                ? 'Choose what you think will come next.'
                : step1IsFlipping
                ? 'Flipping the coin...'
                : `The coin landed on ${step1CoinResult?.toUpperCase()}!`}
            </h1>

            {/* Prompt explanation before toss */}
            {!step1Prediction && (
              <p className="text-base sm:text-lg text-[#CBD5E1] font-medium leading-relaxed">
                A standard coin will be flipped into the air. Before it lands, pick what you expect to see.
              </p>
            )}

            {/* Reveal after coin toss */}
            {step1RevealedNotice && (
              <div className="space-y-4 w-full animate-in fade-in duration-500">
                <p className="text-lg sm:text-xl font-bold text-[#FFFFFF] leading-snug">
                  Did you know for sure what would happen before the toss?
                </p>

                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-base sm:text-lg text-[#CBD5E1] font-medium leading-relaxed">
                    We knew the possible outcomes — <strong className="text-[#22D3EE] font-bold">HEADS</strong> or <strong className="text-[#22D3EE] font-bold">TAILS</strong> — but we did not know the exact outcome in advance.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
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
          STEP 2: REPEAT THE EXPERIMENT (10 tosses vs 100 tosses)
          ========================================================================= */}
      {currentStep === 2 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Sequence of 10 tosses and 100 toss proportion bar */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* 10 Tosses Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Experiment: 10 Tosses
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#CBD5E1] bg-[#0D1B2A] border border-[#243B55] px-2.5 py-0.5 rounded-full">
                    Raju&apos;s trial
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[#CBD5E1] mb-3">
                  “Raju tossed a fair coin 10 times.”
                </p>

                {/* 10 Coins visual sequence */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {tenTossSequence.map((val, idx) => (
                    <div
                      key={idx}
                      className={`h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm border transition-all ${
                        val === 'H'
                          ? 'bg-[#0D1B2A] text-[#22D3EE] border-[#4F7CFF]/40 shadow-xs'
                          : 'bg-[#0D1B2A] text-[#94A3B8] border-[#243B55] shadow-xs'
                      }`}
                      title={`Toss ${idx + 1}: ${val === 'H' ? 'Heads' : 'Tails'}`}
                    >
                      {val}
                    </div>
                  ))}
                </div>

                {/* 10 Toss Counts */}
                <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                  <span className="text-[#22D3EE] font-bold bg-[#0D1B2A] px-2.5 py-1 rounded-lg border border-[#4F7CFF]/40">
                    Heads = 6
                  </span>
                  <span className="text-[#CBD5E1] font-bold bg-[#0D1B2A] px-2.5 py-1 rounded-lg border border-[#243B55]">
                    Tails = 4
                  </span>
                </div>
              </div>

              {/* Transition to 100 Tosses */}
              {step2TossMode === '10' ? (
                <div className="pt-4 border-t border-[#243B55] flex flex-col items-center gap-3">
                  <button
                    id="run-100-tosses-btn"
                    type="button"
                    onClick={handleRun100Tosses}
                    className="group w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-md shadow-[#4F7CFF]/20 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Repeat Experiment 100 Times</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    See what happens when sample size increases
                  </span>
                </div>
              ) : (
                /* 100 Tosses Result Visualization */
                <div className="pt-4 border-t border-[#243B55] space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                      Raju repeated the experiment 100 times
                    </span>
                    <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/30">
                      100 Total
                    </span>
                  </div>

                  {/* Proportion bar */}
                  <div className="space-y-1.5">
                    <div className="h-6 w-full rounded-xl overflow-hidden flex bg-[#0D1B2A] border border-[#243B55] shadow-inner">
                      <div
                        className="h-full bg-[#4F7CFF] flex items-center justify-center text-white text-[11px] font-mono font-bold transition-all duration-1000"
                        style={{ width: '48%' }}
                      >
                        48%
                      </div>
                      <div
                        className="h-full bg-slate-600 flex items-center justify-center text-white text-[11px] font-mono font-bold transition-all duration-1000"
                        style={{ width: '52%' }}
                      >
                        52%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-[#94A3B8] px-1">
                      <span>Heads: 48</span>
                      <span>Tails: 52</span>
                    </div>
                  </div>

                  {/* Summary badge */}
                  <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#CBD5E1] font-medium">Balance after 100 tosses:</span>
                    <span className="font-bold text-[#FFFFFF]">48 Heads / 52 Tails</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Key insight & Introduction to Probability */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            {step2TossMode === '10' ? (
              /* After 10 tosses */
              <div className="space-y-4 animate-in fade-in duration-400">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-snug">
                  Interesting observation.
                </h2>
                <p className="text-base sm:text-lg text-[#CBD5E1] font-medium leading-relaxed">
                  A fair coin does not have to give exactly 5 heads and 5 tails in every 10 tosses.
                </p>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Small samples frequently fluctuate. What happens if Raju repeats this many more times?
                </p>
              </div>
            ) : (
              /* After 100 tosses */
              <div className="space-y-5 animate-in fade-in duration-500 w-full">
                <p className="text-base sm:text-lg text-[#CBD5E1] font-medium leading-relaxed">
                  As we repeat the experiment many times, the results tend to become closer to the expected balance.
                </p>

                {/* Concept Definition: PROBABILITY Highlight Card */}
                <div className="p-5 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30 shadow-sm space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#22D3EE]">
                    Fundamental Concept
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-snug">
                    The chance of an outcome happening is called{' '}
                    <span className="text-[#22D3EE] font-extrabold text-xl sm:text-2xl tracking-tight underline decoration-[#22D3EE]/40 underline-offset-4">
                      probability
                    </span>.
                  </p>
                </div>

                {/* Theoretical Fair Coin Probability Card */}
                <div className="bg-[#0D1B2A] border border-[#243B55] rounded-2xl p-4 w-full space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                    FAIR COIN
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#132238] p-3 rounded-xl border border-[#243B55] flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#CBD5E1]">HEADS</span>
                      <span className="font-mono font-black text-base text-[#22D3EE]">50%</span>
                    </div>
                    <div className="bg-[#132238] p-3 rounded-xl border border-[#243B55] flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#CBD5E1]">TAILS</span>
                      <span className="font-mono font-black text-base text-[#22D3EE]">50%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
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
          STEP 3: PROBABILITY IS NOT ALWAYS 50-50 (Ball Bag)
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Transparent container with 3 Red balls and 1 Blue ball */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-sm flex flex-col items-center">
              
              {/* Glass Container / Bag */}
              <div
                className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center relative overflow-hidden"
              >
                {/* Bag rim */}
                <div className="w-32 h-2.5 rounded-full bg-[#243B55] mb-6 shadow-inner" />

                {/* 4 Spherical Balls in container: 🔴 🔴 🔴 🔵 */}
                <div className="grid grid-cols-2 gap-5 p-4 my-2">
                  {/* Red Ball 1 */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 shadow-lg shadow-rose-500/30 flex items-center justify-center relative cursor-default transition-transform hover:scale-105"
                    style={{
                      boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.7), 0 10px 20px -5px rgba(225,29,72,0.4)',
                    }}
                  >
                    <div className="w-4 h-2 rounded-full bg-white/60 absolute top-2 left-3 -rotate-45 blur-[0.5px]" />
                  </div>

                  {/* Red Ball 2 */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 shadow-lg shadow-rose-500/30 flex items-center justify-center relative cursor-default transition-transform hover:scale-105"
                    style={{
                      boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.7), 0 10px 20px -5px rgba(225,29,72,0.4)',
                    }}
                  >
                    <div className="w-4 h-2 rounded-full bg-white/60 absolute top-2 left-3 -rotate-45 blur-[0.5px]" />
                  </div>

                  {/* Red Ball 3 */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 shadow-lg shadow-rose-500/30 flex items-center justify-center relative cursor-default transition-transform hover:scale-105"
                    style={{
                      boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.7), 0 10px 20px -5px rgba(225,29,72,0.4)',
                    }}
                  >
                    <div className="w-4 h-2 rounded-full bg-white/60 absolute top-2 left-3 -rotate-45 blur-[0.5px]" />
                  </div>

                  {/* Blue Ball 1 */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center relative cursor-default transition-transform hover:scale-105"
                    style={{
                      boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.7), 0 10px 20px -5px rgba(37,99,235,0.4)',
                    }}
                  >
                    <div className="w-4 h-2 rounded-full bg-white/60 absolute top-2 left-3 -rotate-45 blur-[0.5px]" />
                  </div>
                </div>

                {/* Bag Label */}
                <div className="mt-4 pt-3 border-t border-[#243B55] flex items-center justify-center gap-3 text-xs font-mono font-bold">
                  <span className="text-rose-300 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-500/30">
                    3 Red
                  </span>
                  <span className="text-[#22D3EE] bg-cyan-950/40 px-2.5 py-1 rounded-full border border-[#22D3EE]/30">
                    1 Blue
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="mt-4 text-center space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                  A bag contains 3 red balls and 1 blue ball.
                </p>
                <p className="text-xs text-[#94A3B8]">
                  One ball will be picked without looking.
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Question, Options & Revelation */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-5">
            
            {/* Question */}
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                Unequal Chances
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-snug mt-1">
                Which colour is more likely to be picked?
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-2.5 w-full max-w-md">
              {[
                { id: 'red', label: 'RED', isCorrect: true, badge: '3 in bag' },
                { id: 'blue', label: 'BLUE', isCorrect: false, badge: '1 in bag' },
                { id: 'equal', label: 'BOTH ARE EQUALLY LIKELY', isCorrect: false, badge: 'Equal' },
              ].map((opt) => {
                const isSelected = step3SelectedOption === opt.id;
                const isCorrect = isSelected && opt.isCorrect;

                return (
                  <button
                    key={opt.id}
                    id={`prob-opt-${opt.id}`}
                    type="button"
                    onClick={() => handleSelectStep3Option(opt.id as 'red' | 'blue' | 'equal')}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isCorrect
                        ? 'border-[#22C55E]/70 bg-emerald-950/30 ring-1 ring-emerald-500/40 text-[#F8FAFC] shadow-sm'
                        : isSelected
                        ? 'border-[#EF4444]/60 bg-rose-950/25 text-[#F8FAFC]'
                        : 'border-[#243B55] bg-[#132238] hover:border-[#4F7CFF]/50 hover:bg-[#1a2f4c] text-[#F8FAFC] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isCorrect
                            ? 'border-[#22C55E] bg-[#22C55E] text-slate-950'
                            : 'border-[#243B55] bg-[#0D1B2A]'
                        }`}
                      >
                        {isCorrect && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className="font-bold text-sm sm:text-base text-[#F8FAFC]">
                        {opt.label}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-[#94A3B8]">
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Revelation */}
            {step3Feedback.status !== 'idle' && (
              <div className="space-y-4 w-full animate-in fade-in duration-300">
                <SuccessFeedback
                  message={step3Feedback.message}
                  subMessage={step3Feedback.subMessage}
                  type={step3Feedback.status === 'success' ? 'success' : 'hint'}
                  className="items-start text-left max-w-none mx-0"
                />

                {/* Successful breakdown */}
                {step3Feedback.status === 'success' && (
                  <div className="space-y-3 pt-2 border-t border-[#243B55] animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="grid grid-cols-2 gap-3 bg-[#0D1B2A] p-3.5 rounded-2xl border border-[#243B55]">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-[#94A3B8]">Red (3 of 4)</span>
                        <span className="font-mono font-black text-xl text-rose-400">75%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-[#94A3B8]">Blue (1 of 4)</span>
                        <span className="font-mono font-black text-xl text-[#22D3EE]">25%</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-base font-bold text-[#FFFFFF] leading-snug">
                        “Probability does not always have to be 50–50.”
                      </p>
                      <p className="text-sm text-[#CBD5E1]">
                        Different outcomes can have different chances.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Controls */}
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
          STEP 4: MISCONCEPTION CHECK (Alternation & Memory)
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-14 xl:gap-20 my-auto py-4 pb-24 sm:pb-4">
          
          {/* LEFT SIDE (~55%): SEE / DO - Sequences A and B & 3-Heads visual */}
          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-lg bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Visual for Misconception 1: Two Sequences */}
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8] block mb-3">
                  Two Observed 10-Toss Sequences:
                </span>

                {/* Sequence A */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] mb-3">
                  <div className="text-xs font-mono font-bold text-[#CBD5E1] mb-2 flex items-center justify-between">
                    <span>Sequence A:</span>
                    <span className="text-[10px] font-normal text-[#94A3B8]">Strictly alternating</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {['H','T','H','T','H','T','H','T','H','T'].map((v, i) => (
                      <span
                        key={i}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                          v === 'H' ? 'bg-[#132238] text-[#22D3EE] border-[#4F7CFF]/40' : 'bg-[#132238] text-[#94A3B8] border-[#243B55]'
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sequence B */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55]">
                  <div className="text-xs font-mono font-bold text-[#CBD5E1] mb-2 flex items-center justify-between">
                    <span>Sequence B:</span>
                    <span className="text-[10px] font-normal text-[#94A3B8]">Clusters & streaks</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {['H','H','H','T','T','H','T','H','T','T'].map((v, i) => (
                      <span
                        key={i}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                          v === 'H' ? 'bg-[#132238] text-[#22D3EE] border-[#4F7CFF]/40' : 'bg-[#132238] text-[#94A3B8] border-[#243B55]'
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual for Misconception 2: Three heads in a row */}
              {step4ChoiceQ1 === 'C' && (
                <div className="pt-4 border-t border-[#243B55] animate-in fade-in duration-400">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">
                    Scenario 2: First 3 tosses were HEADS
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#0D1B2A] text-[#22D3EE] border border-[#4F7CFF]/40 flex items-center justify-center font-mono font-black text-sm">
                      H
                    </span>
                    <span className="w-10 h-10 rounded-xl bg-[#0D1B2A] text-[#22D3EE] border border-[#4F7CFF]/40 flex items-center justify-center font-mono font-black text-sm">
                      H
                    </span>
                    <span className="w-10 h-10 rounded-xl bg-[#0D1B2A] text-[#22D3EE] border border-[#4F7CFF]/40 flex items-center justify-center font-mono font-black text-sm">
                      H
                    </span>
                    <span className="text-[#94A3B8] font-mono">→</span>
                    <span className="w-10 h-10 rounded-xl bg-amber-950/40 text-amber-300 border-2 border-dashed border-amber-400/60 flex items-center justify-center font-mono font-black text-base animate-pulse">
                      ?
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#94A3B8] mt-2 block">
                    Does toss #4 have to be TAILS?
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT SIDE (~45%): UNDERSTAND - Question 1 & Question 2 */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
            
            {/* Question 1: Alternating Misconception */}
            <div className="space-y-3 w-full">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                Misconception Check 1
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FFFFFF] tracking-tight leading-snug">
                Raju tosses a fair coin 10 times. Which result is possible?
              </h2>

              {/* Options for Q1 */}
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {[
                  { id: 'A', label: 'A. H T H T H T H T H T' },
                  { id: 'B', label: 'B. H H H T T H T H T T' },
                  { id: 'C', label: 'C. Both are possible' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    id={`misconception-q1-${opt.id}`}
                    type="button"
                    onClick={() => handleSelectStep4Q1(opt.id as 'A' | 'B' | 'C')}
                    className={`p-3.5 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      step4ChoiceQ1 === opt.id
                        ? opt.id === 'C'
                          ? 'border-[#22C55E]/70 bg-emerald-950/30 text-[#F8FAFC] ring-1 ring-emerald-500/40'
                          : 'border-[#EF4444]/60 bg-rose-950/25 text-[#F8FAFC]'
                        : 'border-[#243B55] bg-[#132238] hover:bg-[#1a2f4c] text-[#F8FAFC]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {step4ChoiceQ1 === opt.id && opt.id === 'C' && (
                      <Check className="w-4 h-4 text-[#22C55E]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Feedback Q1 */}
              {step4FeedbackQ1.status !== 'idle' && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                  <SuccessFeedback
                    message={step4FeedbackQ1.message}
                    subMessage={step4FeedbackQ1.subMessage}
                    type={step4FeedbackQ1.status === 'success' ? 'success' : 'hint'}
                    className="items-start text-left max-w-none mx-0"
                  />

                  {step4ChoiceQ1 === 'C' && (
                    <div className="space-y-3 pt-2">
                      <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                        A 50% probability does not mean HEADS and TAILS must appear alternately.
                      </p>

                      {/* Small visual alternating pattern */}
                      <div className="p-3 bg-[#0D1B2A] rounded-xl border border-[#243B55] flex flex-col items-start gap-1">
                        <span className="font-mono font-bold text-xs sm:text-sm text-[#22D3EE] tracking-wider">
                          H → T → H → T → H → T
                        </span>
                        <span className="text-[11px] font-mono text-[#94A3B8]">
                          “Alternating pattern”
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                        HEADS and TAILS do not have to follow this pattern. Probability tells us how likely an outcome is. It does not tell us the exact order of individual results.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Question 2: Memory Misconception */}
            {step4ChoiceQ1 === 'C' && (
              <div className="space-y-3 w-full pt-4 border-t border-[#243B55] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                  Misconception Check 2
                </span>
                <p className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-snug">
                  If the first three tosses are HEADS, must the next one be TAILS?
                </p>

                {/* YES / NO buttons */}
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <button
                    id="misconception-q2-yes"
                    type="button"
                    onClick={() => handleSelectStep4Q2('yes')}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                      step4ChoiceQ2 === 'yes'
                        ? 'border-[#EF4444]/60 bg-rose-950/25 text-[#F8FAFC]'
                        : 'border-[#243B55] bg-[#132238] hover:bg-[#1a2f4c] text-[#F8FAFC]'
                    }`}
                  >
                    YES
                  </button>

                  <button
                    id="misconception-q2-no"
                    type="button"
                    onClick={() => handleSelectStep4Q2('no')}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                      step4ChoiceQ2 === 'no'
                        ? 'border-[#22C55E]/70 bg-emerald-950/30 text-[#F8FAFC] ring-1 ring-emerald-500/40'
                        : 'border-[#243B55] bg-[#132238] hover:bg-[#1a2f4c] text-[#F8FAFC]'
                    }`}
                  >
                    NO
                  </button>
                </div>

                {/* Feedback Q2 */}
                {step4FeedbackQ2.status !== 'idle' && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <SuccessFeedback
                      message={step4FeedbackQ2.message}
                      subMessage={step4FeedbackQ2.subMessage}
                      type={step4FeedbackQ2.status === 'success' ? 'success' : 'hint'}
                      className="items-start text-left max-w-none mx-0"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Navigation Controls */}
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
          STEP 5: FINAL SUMMARY (Scale on Left, Takeaways on Right, Bridge to Qubit)
          ========================================================================= */}
      {currentStep === 5 && (
        <ProbabilitySummaryScreen
          onNextLesson={onComplete}
          onBackToPath={onExit}
          onBack={handleBack}
          isAlreadyViewed={maxUnlockedStep >= 5}
        />
      )}

    </LessonShell>
  );
};
