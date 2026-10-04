import React, { useState } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import {
  Laptop,
  Atom,
  Binary,
  Sparkles,
  GitBranch,
  Check,
  X,
  Zap,
  Link2,
  Waves,
  Lightbulb,
} from 'lucide-react';

interface ClassicalVsQuantumLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

export const ClassicalVsQuantumLessonView: React.FC<
  ClassicalVsQuantumLessonViewProps
> = ({
  onExit,
  onComplete,
}) => {
  const TOTAL_STEPS = 6;

  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // STEP 1
  const [viewedComputers, setViewedComputers] = useState<
    Set<'classical' | 'quantum'>
  >(() => new Set());

  // STEP 2
  

  // STEP 3
  const [viewedModels, setViewedModels] = useState<
    Set<'classical' | 'quantum'>
  >(() => new Set());

  // STEP 4
  const [specialViewed, setSpecialViewed] = useState<Set<string>>(
    () => new Set()
  );

  // STEP 5
  const [useCasesReviewed, setUseCasesReviewed] = useState(false);

  // STEP 6
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);

  const unlockStep = (step: number) => {
    setMaxUnlockedStep((prev) => Math.max(prev, step));
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < TOTAL_STEPS) {
      const next = currentStep + 1;
      setCurrentStep(next);
      unlockStep(next);
    } else {
      onComplete();
    }
  };

  const handleSelectStep = (step: number) => {
    if (step <= maxUnlockedStep) {
      setCurrentStep(step);
    }
  };

  const handleComputerView = (
    type: 'classical' | 'quantum'
  ) => {
    setViewedComputers((prev) => {
      const next = new Set(prev);
      next.add(type);

      if (next.size === 2) {
        unlockStep(2);
      }

      return next;
    });
  };

  const handleModelView = (
    type: 'classical' | 'quantum'
  ) => {
    setViewedModels((prev) => {
      const next = new Set(prev);
      next.add(type);

      if (next.size === 2) {
        unlockStep(3);
      }

      return next;
    });
  };

  const handleSpecialView = (id: string) => {
    setSpecialViewed((prev) => {
      const next = new Set(prev);
      next.add(id);

      if (next.size === 3) {
        unlockStep(4);
      }

      return next;
    });
  };

 const step1Complete = viewedComputers.size === 2;
const step2Complete = viewedModels.size === 2;
const step3Complete = specialViewed.size === 3;
const step4Complete = useCasesReviewed;
const step5Complete = finalAnswer === 'no';

let canContinue = false;

if (currentStep === 1) canContinue = step1Complete;
if (currentStep === 2) canContinue = step2Complete;
if (currentStep === 3) canContinue = step3Complete;
if (currentStep === 4) canContinue = step4Complete;
if (currentStep === 5) canContinue = step5Complete;
if (currentStep === 6) canContinue = true;
  const Nav = () => (
    <LessonNavControls
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      canContinue={canContinue}
      onBack={handleBack}
      onContinue={handleContinue}
      finalStepLabel="Next: Bit"
    />
  );

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      {/* ======================================================
          STEP 1 — TWO WAYS TO COMPUTE
      ======================================================= */}
      {currentStep === 1 && (
        <div className="w-full max-w-5xl mx-auto my-auto pb-20 sm:pb-0">
          <div className="text-center mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#1FA7DA] mb-2">
              Quantum Foundations
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Two ways to compute
            </h1>

            <p className="text-[#B7BABD] mt-3 max-w-2xl mx-auto">
              Before learning qubits, first understand how a quantum
              computer differs from the computers we already use every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <button
              type="button"
              onClick={() => handleComputerView('classical')}
              className={`text-left rounded-2xl border p-6 transition-all cursor-pointer ${
                viewedComputers.has('classical')
                  ? 'border-[#1FA7DA] bg-[#1E3545]'
                  : 'border-[#44474A] bg-[#2B2C2D] hover:border-[#858A8E]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#202122] border border-[#44474A] flex items-center justify-center mb-5">
                <Laptop className="w-6 h-6 text-[#1FA7DA]" />
              </div>

              <h2 className="text-xl font-bold text-white">
                Classical Computer
              </h2>

              <p className="text-sm text-[#B7BABD] mt-2">
                The computers in phones, laptops and servers process
                information using classical bits.
              </p>

              {viewedComputers.has('classical') && (
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex gap-2 text-[#D7D9DB]">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Uses bits represented as 0 or 1.</span>
                  </div>

                  <div className="flex gap-2 text-[#D7D9DB]">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Classical logic operations transform those bits.
                    </span>
                  </div>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleComputerView('quantum')}
              className={`text-left rounded-2xl border p-6 transition-all cursor-pointer ${
                viewedComputers.has('quantum')
                  ? 'border-[#A855F7] bg-[#332642]'
                  : 'border-[#44474A] bg-[#2B2C2D] hover:border-[#858A8E]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#202122] border border-[#44474A] flex items-center justify-center mb-5">
                <Atom className="w-6 h-6 text-[#D68BE8]" />
              </div>

              <h2 className="text-xl font-bold text-white">
                Quantum Computer
              </h2>

              <p className="text-sm text-[#B7BABD] mt-2">
                A quantum computer processes information using quantum
                systems called qubits.
              </p>

              {viewedComputers.has('quantum') && (
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex gap-2 text-[#D7D9DB]">
                    <Check className="w-4 h-4 text-[#D68BE8] shrink-0 mt-0.5" />
                    <span>Uses qubits and quantum states.</span>
                  </div>

                  <div className="flex gap-2 text-[#D7D9DB]">
                    <Check className="w-4 h-4 text-[#D68BE8] shrink-0 mt-0.5" />
                    <span>
                      Quantum gates transform those quantum states.
                    </span>
                  </div>
                </div>
              )}
            </button>
          </div>

          {step1Complete && (
            <div className="mt-6 rounded-xl border border-[#44474A] bg-[#202122] p-4 text-center">
              <p className="text-sm text-[#D7D9DB]">
                Both are computers — but they represent and manipulate
                information differently.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Nav />
          </div>
        </div>
      )}

      

      {/* ======================================================
          STEP 3 — HOW INFORMATION CHANGES
      ======================================================= */}
      {currentStep === 2 && (
        <div className="w-full max-w-5xl mx-auto my-auto pb-20 sm:pb-0">
          <div className="text-center mb-8">
            <GitBranch className="w-8 h-8 text-[#1FA7DA] mx-auto mb-3" />

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              How is information changed?
            </h1>

            <p className="text-[#B7BABD] mt-3">
              Both systems use operations — but the operations act on
              different kinds of states.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <button
              type="button"
              onClick={() => handleModelView('classical')}
              className={`rounded-2xl border p-6 text-left cursor-pointer ${
                viewedModels.has('classical')
                  ? 'border-[#1FA7DA] bg-[#1E3545]'
                  : 'border-[#44474A] bg-[#2B2C2D]'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-[#1FA7DA] font-bold">
                Classical
              </div>

              <h2 className="text-xl font-bold text-white mt-2">
                Logic Operations
              </h2>

              <div className="font-mono text-center text-lg my-6 text-[#F1F1F1]">
                bits → logic gate → bits
              </div>

              {viewedModels.has('classical') && (
                <p className="text-sm text-[#B7BABD]">
                  Operations such as NOT, AND and XOR transform classical
                  values.
                </p>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleModelView('quantum')}
              className={`rounded-2xl border p-6 text-left cursor-pointer ${
                viewedModels.has('quantum')
                  ? 'border-[#A855F7] bg-[#332642]'
                  : 'border-[#44474A] bg-[#2B2C2D]'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-[#D68BE8] font-bold">
                Quantum
              </div>

              <h2 className="text-xl font-bold text-white mt-2">
                Quantum Gates
              </h2>

              <div className="font-mono text-center text-lg my-6 text-[#F1F1F1]">
                qubits → quantum gate → new quantum state
              </div>

              {viewedModels.has('quantum') && (
                <p className="text-sm text-[#B7BABD]">
                  Gates such as X, H and later CNOT transform quantum states.
                </p>
              )}
            </button>
          </div>

          {step3Complete && (
            <div className="mt-6 p-4 rounded-xl border border-[#44474A] bg-[#202122]">
              <p className="text-center text-sm text-[#D7D9DB]">
                This is why Qubify later connects each circuit operation
                directly to its Qiskit code.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Nav />
          </div>
        </div>
      )}

      {/* ======================================================
          STEP 4 — QUANTUM EFFECTS
      ======================================================= */}
      {currentStep === 3 && (
        <div className="w-full max-w-5xl mx-auto my-auto pb-20 sm:pb-0">
          <div className="text-center mb-8">
            <Sparkles className="w-8 h-8 text-[#D68BE8] mx-auto mb-3" />

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              What makes quantum computing different?
            </h1>

            <p className="text-[#B7BABD] mt-3">
              Explore three ideas that give quantum computation its
              distinctive behavior.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                id: 'superposition',
                title: 'Superposition',
                description:
                  'A quantum state can involve amplitudes for multiple basis states before measurement.',
                icon: Sparkles,
              },
              {
                id: 'interference',
                title: 'Interference',
                description:
                  'Quantum amplitudes can reinforce or cancel one another.',
                icon: Waves,
              },
              {
                id: 'entanglement',
                title: 'Entanglement',
                description:
                  'Multiple qubits can share a joint quantum state with correlations that cannot be described independently.',
                icon: Link2,
              },
            ].map((item) => {
              const Icon = item.icon;
              const viewed = specialViewed.has(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSpecialView(item.id)}
                  className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                    viewed
                      ? 'border-[#A855F7] bg-[#332642]'
                      : 'border-[#44474A] bg-[#2B2C2D] hover:border-[#858A8E]'
                  }`}
                >
                  <Icon className="w-6 h-6 text-[#D68BE8] mb-4" />

                  <h2 className="text-lg font-bold text-white">
                    {item.title}
                  </h2>

                  {viewed ? (
                    <p className="text-sm text-[#B7BABD] mt-2">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#858A8E] mt-2">
                      Click to explore
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Nav />
          </div>
        </div>
      )}

      {/* ======================================================
          STEP 5 — WHERE EACH IS USEFUL
      ======================================================= */}
      {currentStep === 4 && (
        <div className="w-full max-w-5xl mx-auto my-auto pb-20 sm:pb-0">
          <div className="text-center mb-8">
            <Zap className="w-8 h-8 text-[#E6A93D] mx-auto mb-3" />

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Quantum does not replace classical
            </h1>

            <p className="text-[#B7BABD] mt-3 max-w-2xl mx-auto">
              Different computers are useful for different kinds of work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-[#44474A] bg-[#2B2C2D] p-6">
              <Laptop className="w-6 h-6 text-[#1FA7DA] mb-4" />

              <h2 className="text-lg font-bold text-white">
                Classical computers
              </h2>

              <ul className="mt-4 space-y-3 text-sm text-[#B7BABD]">
                <li>• Browsing the web</li>
                <li>• Running applications</li>
                <li>• Databases and operating systems</li>
                <li>• Most everyday computation</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#5B3F68] bg-[#2E2633] p-6">
              <Atom className="w-6 h-6 text-[#D68BE8] mb-4" />

              <h2 className="text-lg font-bold text-white">
                Quantum computers
              </h2>

              <ul className="mt-4 space-y-3 text-sm text-[#B7BABD]">
                <li>• Studying quantum systems</li>
                <li>• Some specialized search or optimization approaches</li>
                <li>• Certain cryptographic and algorithmic problems</li>
                <li>• Research into problems with useful quantum structure</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#5B4B31] bg-[#302A20] p-4">
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 text-[#E6A93D] shrink-0" />

              <p className="text-sm text-[#D7D9DB]">
                Quantum computers are not automatically faster for every
                problem. They are designed to exploit quantum effects for
                particular computational tasks.
              </p>
            </div>
          </div>

          {!useCasesReviewed && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setUseCasesReviewed(true);
                  unlockStep(5);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#1FA7DA] hover:bg-[#27B4E8] text-white text-sm font-semibold cursor-pointer"
              >
                I understand
              </button>
            </div>
          )}

          {useCasesReviewed && (
            <div className="mt-5 text-center text-sm text-emerald-300">
              Great — neither system replaces the other.
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Nav />
          </div>
        </div>
      )}

      {/* ======================================================
          STEP 6 — QUICK CHECK
      ======================================================= */}
      {currentStep === 5 && (
        <div className="w-full max-w-2xl mx-auto my-auto pb-20 sm:pb-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Quick check
            </h1>

            <p className="text-[#B7BABD] mt-3">
              Is a quantum computer simply a faster replacement for every
              classical computer?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFinalAnswer('yes')}
              className={`rounded-xl border p-6 text-center cursor-pointer ${
                finalAnswer === 'yes'
                  ? 'border-red-500/60 bg-red-950/20'
                  : 'border-[#44474A] bg-[#2B2C2D]'
              }`}
            >
              <div className="flex justify-center mb-3">
                <X className="w-6 h-6 text-red-400" />
              </div>

              <div className="font-bold text-white">
                Yes
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFinalAnswer('no');
                unlockStep(6);
              }}
              className={`rounded-xl border p-6 text-center cursor-pointer ${
                finalAnswer === 'no'
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-[#44474A] bg-[#2B2C2D]'
              }`}
            >
              <div className="flex justify-center mb-3">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="font-bold text-white">
                No
              </div>
            </button>
          </div>

          {finalAnswer === 'yes' && (
            <div className="mt-5 p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-sm text-amber-200">
              Quantum computers are specialized machines. Classical computers
              remain better suited to most everyday tasks.
            </div>
          )}

          {finalAnswer === 'no' && (
            <div className="mt-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-sm text-emerald-200">
              Correct. Quantum and classical computing complement each other.
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Nav />
          </div>
        </div>
      )}

      {/* ======================================================
          STEP 7 — TAKEAWAY
      ======================================================= */}
      {currentStep === 6 && (
        <div className="w-full max-w-3xl mx-auto my-auto text-center pb-20 sm:pb-0">
          <div className="w-16 h-16 mx-auto rounded-2xl border border-emerald-500/50 bg-emerald-950/30 flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-400 mb-2">
            Lesson Complete
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Classical vs Quantum Computing
          </h1>

          <p className="text-[#B7BABD] mt-4 max-w-xl mx-auto">
            You now know the big picture. Next, we begin with the basic unit
            of classical information: the bit.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8 text-left">
            <div className="rounded-xl border border-[#44474A] bg-[#2B2C2D] p-5">
              <h3 className="font-bold text-white">
                Classical
              </h3>

              <p className="text-sm text-[#B7BABD] mt-2">
                Bits + classical logic operations.
              </p>
            </div>

            <div className="rounded-xl border border-[#5B3F68] bg-[#2E2633] p-5">
              <h3 className="font-bold text-white">
                Quantum
              </h3>

              <p className="text-sm text-[#B7BABD] mt-2">
                Qubits + quantum gates + quantum effects.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#44474A] bg-[#202122] p-5">
            <p className="text-sm font-semibold text-[#F1F1F1]">
              Next question:
            </p>

            <p className="text-sm text-[#B7BABD] mt-1">
              What exactly is a bit, and why does classical computing use
              0 and 1?
            </p>
          </div>

          <div className="mt-8 flex justify-center sm:justify-end">
            <Nav />
          </div>
        </div>
      )}
    </LessonShell>
  );
};