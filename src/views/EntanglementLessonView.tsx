import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Eye,
  Link2,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { simulateLessonCircuit } from '../services/lessonQuantumSimulator';

interface EntanglementLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

type Basis = 'Z' | 'X';
type SimpleState = '0' | '1' | 'plus' | 'minus';
type BuilderGate = 'h0' | 'x0' | 'cx';

const TOTAL_STEPS = 7;

/* ============================================================================
   SMALL VISUAL HELPERS
   ============================================================================ */

const BlochSphere: React.FC<{
  state: SimpleState;
  label: string;
  faded?: boolean;
}> = ({
  state,
  label,
  faded = false,
}) => {
  const endpoint = (() => {
    switch (state) {
      case '0':
        return { x: 90, y: 28 };

      case '1':
        return { x: 90, y: 152 };

      case 'plus':
        return { x: 150, y: 90 };

      case 'minus':
        return { x: 30, y: 90 };

      default:
        return { x: 90, y: 28 };
    }
  })();

  const labelText = (() => {
    if (state === 'plus') return '|+⟩';
    if (state === 'minus') return '|−⟩';

    return `|${state}⟩`;
  })();

  return (
    <div
      className={`flex flex-col items-center transition-all duration-700 ${
        faded
          ? 'opacity-25 scale-90'
          : 'opacity-100 scale-100'
      }`}
    >
      <svg
        viewBox="0 0 180 180"
        className="w-[145px] h-[145px] sm:w-[160px] sm:h-[160px]"
      >
        <circle
          cx="90"
          cy="90"
          r="62"
          fill="#0D1B2A"
          stroke="#4F7CFF"
          strokeOpacity="0.7"
          strokeWidth="2"
        />

        <ellipse
          cx="90"
          cy="90"
          rx="62"
          ry="21"
          fill="none"
          stroke="#64748B"
          strokeOpacity="0.45"
          strokeDasharray="4 4"
        />

        <line
          x1="90"
          y1="20"
          x2="90"
          y2="160"
          stroke="#64748B"
          strokeOpacity="0.45"
        />

        <line
          x1="20"
          y1="90"
          x2="160"
          y2="90"
          stroke="#64748B"
          strokeOpacity="0.35"
        />

        <text
          x="96"
          y="22"
          fill="#67E8F9"
          fontSize="11"
          fontFamily="monospace"
        >
          |0⟩
        </text>

        <text
          x="96"
          y="170"
          fill="#C4B5FD"
          fontSize="11"
          fontFamily="monospace"
        >
          |1⟩
        </text>

        <text
          x="145"
          y="82"
          fill="#CBD5E1"
          fontSize="10"
          fontFamily="monospace"
        >
          |+⟩
        </text>

        <line
          x1="90"
          y1="90"
          x2={endpoint.x}
          y2={endpoint.y}
          stroke="#22D3EE"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <circle
          cx={endpoint.x}
          cy={endpoint.y}
          r="6"
          fill="#22D3EE"
        />

        <circle
          cx="90"
          cy="90"
          r="4"
          fill="white"
        />
      </svg>

      <p className="text-xs font-mono font-bold text-[#94A3B8]">
        {label}
      </p>

      <p className="font-mono font-extrabold text-[#22D3EE]">
        {labelText}
      </p>
    </div>
  );
};

/* ============================================================================
   CIRCUIT
   ============================================================================ */

const BellCircuit: React.FC<{
  showH?: boolean;
  showCNOT?: boolean;
  showMeasurement?: boolean;
  showBasisH?: boolean;
  pulse?: boolean;
}> = ({
  showH = true,
  showCNOT = true,
  showMeasurement = false,
  showBasisH = false,
  pulse = false,
}) => {
  return (
    <div className="w-full font-mono space-y-7">
      {/* q0 */}
      <div className="grid grid-cols-[40px_40px_1fr_42px] gap-2 items-center">
        <span className="text-xs font-bold text-[#94A3B8]">
          q0
        </span>

        <span className="text-[#22D3EE] font-bold">
          |0⟩
        </span>

        <div className="relative h-14 flex items-center">
          <div className="absolute left-0 right-0 h-0.5 bg-[#4F7CFF]/50" />

          {showH && (
            <div className="absolute left-[16%] -translate-x-1/2 w-11 h-11 rounded-xl bg-purple-950 border border-purple-400/60 text-purple-300 flex items-center justify-center font-extrabold z-10">
              H
            </div>
          )}

          {showCNOT && (
            <>
              <div
                className={`absolute left-[52%] -translate-x-1/2 w-5 h-5 rounded-full border-2 z-20 transition-all duration-300 ${
                  pulse
                    ? 'bg-[#22D3EE] border-[#67E8F9] scale-125 shadow-lg shadow-[#22D3EE]/70'
                    : 'bg-[#4F7CFF] border-[#93C5FD]'
                }`}
              />

              <div
                className={`absolute left-[52%] -translate-x-1/2 top-1/2 h-[93px] w-0.5 z-10 transition-all ${
                  pulse
                    ? 'bg-[#22D3EE] shadow-lg shadow-[#22D3EE]'
                    : 'bg-[#4F7CFF]/70'
                }`}
              />
            </>
          )}

          {showBasisH && (
            <div className="absolute left-[76%] -translate-x-1/2 w-11 h-11 rounded-xl bg-[#132238] border border-[#22D3EE]/50 text-[#67E8F9] flex items-center justify-center font-extrabold z-10">
              H
            </div>
          )}
        </div>

        {showMeasurement ? (
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
            M
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* q1 */}
      <div className="grid grid-cols-[40px_40px_1fr_42px] gap-2 items-center">
        <span className="text-xs font-bold text-[#94A3B8]">
          q1
        </span>

        <span className="text-purple-300 font-bold">
          |0⟩
        </span>

        <div className="relative h-14 flex items-center">
          <div className="absolute left-0 right-0 h-0.5 bg-[#4F7CFF]/50" />

          {showCNOT && (
            <div
              className={`absolute left-[52%] -translate-x-1/2 w-11 h-11 rounded-full border-2 bg-[#0D1B2A] flex items-center justify-center z-20 transition-all ${
                pulse
                  ? 'border-[#22D3EE] shadow-lg shadow-[#22D3EE]/50'
                  : 'border-[#4F7CFF]'
              }`}
            >
              <span className="text-2xl font-light text-[#67E8F9]">
                +
              </span>
            </div>
          )}

          {showBasisH && (
            <div className="absolute left-[76%] -translate-x-1/2 w-11 h-11 rounded-xl bg-[#132238] border border-[#22D3EE]/50 text-[#67E8F9] flex items-center justify-center font-extrabold z-10">
              H
            </div>
          )}
        </div>

        {showMeasurement ? (
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
            M
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   CODE
   ============================================================================ */

const CodePanel: React.FC<{
  lines: string[];
  activeLine?: number | null;
}> = ({
  lines,
  activeLine = null,
}) => {
  return (
    <div className="rounded-2xl bg-[#07101D] border border-[#243B55] overflow-hidden h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#243B55] bg-[#0D1B2A]">
        <Code2 className="w-4 h-4 text-[#22D3EE]" />

        <span className="text-xs font-mono font-bold text-[#94A3B8]">
          QISKIT
        </span>
      </div>

      <div className="p-3 space-y-1">
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className={`px-3 py-2 rounded-lg border font-mono text-xs sm:text-sm transition-all ${
              activeLine === index
                ? 'bg-[#22D3EE]/15 border-[#22D3EE]/40 text-[#67E8F9]'
                : 'border-transparent text-[#CBD5E1]'
            }`}
          >
            <span className="text-[#64748B] mr-3">
              {index + 1}
            </span>

            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   JOINT STATE
   ============================================================================ */

const JointStateCard: React.FC<{
  highlighted?: boolean;
  compact?: boolean;
}> = ({
  highlighted = true,
  compact = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition-all duration-700 ${
        highlighted
          ? 'bg-gradient-to-br from-purple-950/35 to-[#132238] border-purple-400/40 shadow-lg shadow-purple-500/10'
          : 'bg-[#132238] border-[#243B55]'
      } ${compact ? 'p-4' : 'p-6'}`}
    >
      {highlighted && (
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-purple-500/10 blur-2xl" />
      )}

      <p className="relative text-xs font-mono font-bold text-purple-300">
        JOINT TWO-QUBIT STATE
      </p>

      <p
        className={`relative mt-4 font-mono font-extrabold text-[#67E8F9] ${
          compact
            ? 'text-xl'
            : 'text-2xl sm:text-3xl'
        }`}
      >
        (|00⟩ + |11⟩) / √2
      </p>

      <div className="relative grid grid-cols-2 gap-3 mt-5">
        <div className="p-3 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-center">
          <span className="font-mono font-bold text-[#67E8F9]">
            |00⟩
          </span>
        </div>

        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-400/30 text-center">
          <span className="font-mono font-bold text-purple-300">
            |11⟩
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   HISTOGRAM
   ============================================================================ */

const CountsHistogram: React.FC<{
  counts: Record<string, number>;
}> = ({ counts }) => {
  if (Object.keys(counts).length === 0) {
    return (
      <div className="min-h-[210px] rounded-2xl bg-[#08111F] border border-dashed border-[#334155] flex items-center justify-center">
        <p className="text-sm text-[#64748B] text-center px-5">
          Run the experiment to reveal the measurement pattern.
        </p>
      </div>
    );
  }

  const maximum = Math.max(
    1,
    ...Object.values(counts)
  );

  return (
    <div className="space-y-4">
      {['00', '01', '10', '11'].map(
        (result) => {
          const value =
            counts[result] || 0;

          const width =
            (value / maximum) * 100;

          return (
            <div
              key={result}
              className="grid grid-cols-[45px_1fr_45px] items-center gap-3"
            >
              <span
                className={`font-mono font-extrabold ${
                  result === '00' ||
                  result === '11'
                    ? 'text-[#67E8F9]'
                    : 'text-[#64748B]'
                }`}
              >
                {result}
              </span>

              <div className="h-9 rounded-lg bg-[#08111F] border border-[#243B55] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#22D3EE]/80 to-purple-500/70 transition-all duration-700"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>

              <span className="text-right font-mono text-white">
                {value}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
};

/* ============================================================================
   MAIN LESSON
   ============================================================================ */

export const EntanglementLessonView: React.FC<
  EntanglementLessonViewProps
> = ({
  onExit,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  /* --------------------------------------------------------------------------
     STEP 1
     -------------------------------------------------------------------------- */

  const [investigated, setInvestigated] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 2
     -------------------------------------------------------------------------- */

  const [guessQ0, setGuessQ0] =
    useState<SimpleState>('plus');

  const [guessQ1, setGuessQ1] =
    useState<SimpleState>('0');

  const [separationAttempts, setSeparationAttempts] =
    useState(0);

  const [separationRevealed, setSeparationRevealed] =
    useState(false);

  /* --------------------------------------------------------------------------
     STEP 3
     -------------------------------------------------------------------------- */

  const [correlationCounts, setCorrelationCounts] =
    useState<Record<string, number>>({});

  const [correlationShots, setCorrelationShots] =
    useState<number | null>(null);

  const [correlationLoading, setCorrelationLoading] =
    useState(false);

  const [correlationError, setCorrelationError] =
    useState('');

  const [ranCorrelation100, setRanCorrelation100] =
    useState(false);

  /* --------------------------------------------------------------------------
     STEP 4
     -------------------------------------------------------------------------- */

  const [measureChoice, setMeasureChoice] =
    useState<0 | 1 | null>(null);

  const [collapseResult, setCollapseResult] =
    useState<'00' | '11' | null>(null);

  const [collapseLoading, setCollapseLoading] =
    useState(false);

 /* --------------------------------------------------------------------------
   STEP 5
   -------------------------------------------------------------------------- */

const [basis, setBasis] =
  useState<Basis>('Z');

const [basisCounts, setBasisCounts] =
  useState<Record<string, number>>({});

const [basisLoading, setBasisLoading] =
  useState(false);

const [basisError, setBasisError] =
  useState('');

const [basisSeen, setBasisSeen] =
  useState<Set<Basis>>(new Set());

  /* --------------------------------------------------------------------------
     STEP 6
     -------------------------------------------------------------------------- */

  const [builderGates, setBuilderGates] =
    useState<BuilderGate[]>([]);

  /* --------------------------------------------------------------------------
     STEP 7
     -------------------------------------------------------------------------- */

  const [answers, setAnswers] =
    useState<Record<number, boolean>>({});

  /* ==========================================================================
     HELPERS
     ========================================================================== */

  const unlock = (step: number) => {
    setMaxUnlockedStep((prev) =>
      Math.max(
        prev,
        Math.min(step, TOTAL_STEPS)
      )
    );
  };

  const handleBack = () => {
    if (currentStep <= 1) return;

    setCurrentStep((prev) =>
      Math.max(1, prev - 1)
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSelectStep = (
    step: number
  ) => {
    if (
      step < 1 ||
      step > maxUnlockedStep
    ) {
      return;
    }

    setCurrentStep(step);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* ==========================================================================
     STEP 2
     ========================================================================== */

  const stateName = (
    state: SimpleState
  ) => {
    if (state === 'plus') return '|+⟩';
    if (state === 'minus') return '|−⟩';

    return `|${state}⟩`;
  };

  const trySeparation = () => {
    const next =
      separationAttempts + 1;

    setSeparationAttempts(next);

    if (next >= 2) {
      setSeparationRevealed(true);
      unlock(3);
    }
  };

  /* ==========================================================================
     STEP 3
     ========================================================================== */

  const runCorrelationExperiment = async (
    shots: number
  ) => {
    if (correlationLoading) return;

    setCorrelationLoading(true);
    setCorrelationError('');

    const result =
      await simulateLessonCircuit({
        numQubits: 2,
        shots,
        operations: [
          {
            gate: 'h',
            qubits: [0],
          },
          {
            gate: 'cx',
            qubits: [0, 1],
          },
        ],
      });

    if (!result.success) {
      setCorrelationError(
        result.error ||
          'The simulator could not run this experiment.'
      );

      setCorrelationLoading(false);
      return;
    }

    setCorrelationCounts(
      result.counts || {}
    );

    setCorrelationShots(shots);
    setCorrelationLoading(false);

    if (shots === 100) {
      setRanCorrelation100(true);
      unlock(4);
    }
  };

  /* ==========================================================================
     STEP 4
     ========================================================================== */

  const measureOneQubit = async (
    qubit: 0 | 1
  ) => {
    if (collapseLoading) return;

    setMeasureChoice(qubit);
    setCollapseResult(null);
    setCollapseLoading(true);

    const result =
      await simulateLessonCircuit({
        numQubits: 2,
        shots: 1,
        operations: [
          {
            gate: 'h',
            qubits: [0],
          },
          {
            gate: 'cx',
            qubits: [0, 1],
          },
        ],
      });

    if (!result.success) {
      setCollapseLoading(false);
      return;
    }

    const firstResult =
      result.memory?.[0] ||
      Object.keys(
        result.counts || {}
      )[0] ||
      '00';

    const collapsed =
      firstResult.includes('11')
        ? '11'
        : '00';

    setTimeout(() => {
      setCollapseResult(collapsed);
      setCollapseLoading(false);
      unlock(5);
    }, 500);
  };

  /* ==========================================================================
     STEP 5
     ========================================================================== */

  const runBasisExperiment = async () => {
    if (basisLoading) return;

    setBasisLoading(true);
    setBasisError('');
    setBasisCounts({});

    const operations =
      basis === 'Z'
        ? [
            {
              gate: 'h',
              qubits: [0],
            },
            {
              gate: 'cx',
              qubits: [0, 1],
            },
          ]
        : [
            {
              gate: 'h',
              qubits: [0],
            },
            {
              gate: 'cx',
              qubits: [0, 1],
            },
            {
              gate: 'h',
              qubits: [0],
            },
            {
              gate: 'h',
              qubits: [1],
            },
          ];

    const result =
      await simulateLessonCircuit({
        numQubits: 2,
        shots: 100,
        operations,
      });

    if (!result.success) {
      setBasisError(
        result.error ||
          'Could not run this basis experiment.'
      );

      setBasisLoading(false);
      return;
    }

    setBasisCounts(
      result.counts || {}
    );

    setBasisLoading(false);

    setBasisSeen((prev) => {
      const next = new Set(prev);
      next.add(basis);

      if (
        next.has('Z') &&
        next.has('X')
      ) {
        unlock(6);
      }

      return next;
    });
  };

  /* ==========================================================================
     STEP 6 BUILDER
     ========================================================================== */

  const addBuilderGate = (
    gate: BuilderGate
  ) => {
    setBuilderGates((prev) => {
      if (prev.length >= 2) {
        return prev;
      }

      const next = [
        ...prev,
        gate,
      ];

      if (
        next.length === 2 &&
        next[0] === 'h0' &&
        next[1] === 'cx'
      ) {
        unlock(7);
      }

      return next;
    });
  };

  const builderCorrect =
    builderGates.length === 2 &&
    builderGates[0] === 'h0' &&
    builderGates[1] === 'cx';

  const builderState = useMemo(() => {
    if (builderGates.length === 0) {
      return '|00⟩';
    }

    if (
      builderGates.length >= 1 &&
      builderGates[0] === 'h0'
    ) {
      if (
        builderGates.length === 2 &&
        builderGates[1] === 'cx'
      ) {
        return '(|00⟩ + |11⟩) / √2';
      }

      return '(|00⟩ + |10⟩) / √2';
    }

    if (
      builderGates.length >= 1 &&
      builderGates[0] === 'x0'
    ) {
      return '|10⟩';
    }

    return '|00⟩';
  }, [builderGates]);

  const builderCode = useMemo(() => {
    const lines = [
      'qc = QuantumCircuit(2)',
    ];

    builderGates.forEach(
      (gate) => {
        if (gate === 'h0') {
          lines.push('qc.h(0)');
        }

        if (gate === 'x0') {
          lines.push('qc.x(0)');
        }

        if (gate === 'cx') {
          lines.push(
            'qc.cx(0, 1)'
          );
        }
      }
    );

    return lines;
  }, [builderGates]);

  /* ==========================================================================
     STEP 7
     ========================================================================== */

  const correctAnswers: Record<
    number,
    boolean
  > = {
    0: true,
    1: true,
    2: true,
    3: false,
  };

  const allSummaryCorrect =
    [0, 1, 2, 3].every(
      (index) =>
        answers[index] ===
        correctAnswers[index]
    );

  /* ==========================================================================
     CONTINUE
     ========================================================================== */

  const canContinue = (() => {
    switch (currentStep) {
      case 1:
        return investigated;

      case 2:
        return separationRevealed;

      case 3:
        return ranCorrelation100;

      case 4:
        return collapseResult !== null;

      case 5:
        return (
          basisSeen.has('Z') &&
          basisSeen.has('X')
        );

      case 6:
        return builderCorrect;

      case 7:
        return allSummaryCorrect;

      default:
        return false;
    }
  })();

  const handleContinue = () => {
    if (!canContinue) return;

    if (
      currentStep === TOTAL_STEPS
    ) {
      onComplete();
      return;
    }

    const next =
      currentStep + 1;

    setCurrentStep(next);
    unlock(next);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const nav = (
    <LessonNavControls
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      canContinue={canContinue}
      onBack={handleBack}
      onContinue={handleContinue}
      finalStepLabel="NEXT: BELL STATE"
    />
  );

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-80px)]">

        {/* ====================================================================
            STEP 1
            ==================================================================== */}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/30 border border-purple-400/30 px-3 py-1 rounded-full">
                CONTINUING FROM CNOT
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
                Why are these two qubits behaving like one connected system?
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl leading-relaxed">
                You already created this circuit with H followed by CNOT.
                Its measurements gave 00 and 11 — but almost never 01 or
                10.
              </p>

              <p className="mt-2 text-lg font-bold text-[#67E8F9]">
                Let&apos;s investigate what actually changed.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-6">
                  <BellCircuit />
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5 relative overflow-hidden">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② STATE VIEW
                </p>

                {!investigated ? (
                  <div className="grid grid-cols-2 mt-3">
                    <BlochSphere
                      state="plus"
                      label="q0"
                    />

                    <BlochSphere
                      state="0"
                      label="q1"
                    />
                  </div>
                ) : (
                  <div className="relative pt-3">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="grid grid-cols-2 opacity-20 scale-90">
                        <BlochSphere
                          state="plus"
                          label="q0"
                          faded
                        />

                        <BlochSphere
                          state="0"
                          label="q1"
                          faded
                        />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <JointStateCard />
                    </div>
                  </div>
                )}
              </div>

              <CodePanel
                lines={[
                  'qc = QuantumCircuit(2)',
                  'qc.h(0)',
                  'qc.cx(0, 1)',
                ]}
                activeLine={
                  investigated ? 2 : null
                }
              />
            </div>

            {!investigated ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setInvestigated(true);
                    unlock(2);
                  }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#22D3EE] to-purple-500 text-[#08111F] font-extrabold font-mono flex items-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Eye className="w-5 h-5" />
                  INVESTIGATE THE PAIR
                </button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-purple-950/25 border border-purple-400/30 text-center">
                <p className="text-lg font-bold text-white">
                  The most useful description is no longer
                  &quot;q0 has one state and q1 has another.&quot;
                </p>

                <p className="text-[#C4B5FD] mt-2 font-semibold">
                  We need to describe the state of the pair.
                </p>
              </div>
            )}

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 2
            ==================================================================== */}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-[#22D3EE]">
                INDEPENDENT VS ENTANGLED
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Can we describe each qubit separately?
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                Before CNOT, we could say what q0 was and what q1 was.
                Try doing that for the new joint state.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* independent */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-emerald-300">
                  BEFORE CNOT — SEPARABLE
                </p>

                <div className="grid grid-cols-2 mt-3">
                  <BlochSphere
                    state="plus"
                    label="q0"
                  />

                  <BlochSphere
                    state="0"
                    label="q1"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#08111F] border border-[#243B55] text-center font-mono">
                  <p className="text-white">
                    q0 = |+⟩
                  </p>

                  <p className="text-white">
                    q1 = |0⟩
                  </p>

                  <p className="text-[#67E8F9] mt-3">
                    joint state =
                    (|00⟩ + |10⟩) / √2
                  </p>
                </div>
              </div>

              {/* entangled */}
              <div className="space-y-4">
                <JointStateCard />

                <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                  <p className="text-xs font-mono font-bold text-[#94A3B8]">
                    TRY TO SEPARATE IT
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-mono text-[#94A3B8] mb-2">
                        q0 =
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            '0',
                            '1',
                            'plus',
                            'minus',
                          ] as SimpleState[]
                        ).map((state) => (
                          <button
                            type="button"
                            key={state}
                            onClick={() =>
                              setGuessQ0(state)
                            }
                            className={`py-2.5 rounded-xl border font-mono ${
                              guessQ0 === state
                                ? 'bg-[#22D3EE] text-[#08111F] border-[#67E8F9]'
                                : 'bg-[#08111F] text-white border-[#243B55]'
                            }`}
                          >
                            {stateName(state)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-mono text-[#94A3B8] mb-2">
                        q1 =
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            '0',
                            '1',
                            'plus',
                            'minus',
                          ] as SimpleState[]
                        ).map((state) => (
                          <button
                            type="button"
                            key={state}
                            onClick={() =>
                              setGuessQ1(state)
                            }
                            className={`py-2.5 rounded-xl border font-mono ${
                              guessQ1 === state
                                ? 'bg-purple-400 text-[#08111F] border-purple-300'
                                : 'bg-[#08111F] text-white border-[#243B55]'
                            }`}
                          >
                            {stateName(state)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={trySeparation}
                    className="w-full mt-4 py-3 rounded-xl bg-[#0D1B2A] border border-[#4F7CFF]/50 text-white font-bold font-mono"
                  >
                    TEST THIS DESCRIPTION
                  </button>

                  {separationAttempts > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-400/30">
                      <p className="text-sm text-amber-200">
                        q0 = {stateName(guessQ0)} and q1 = {stateName(guessQ1)}
                        {' '}do not reproduce only the two joint components
                        |00⟩ and |11⟩ with the required quantum relationship.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {separationRevealed && (
              <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-purple-950/30 to-[#132238] border border-purple-400/40">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-300" />

                  <span className="font-extrabold text-purple-200">
                    This is the key idea.
                  </span>
                </div>

                <p className="mt-3 text-xl font-bold text-white">
                  The complete state cannot be described as two independent
                  pure qubit states.
                </p>

                <p className="mt-3 text-[#CBD5E1]">
                  We call this kind of joint quantum state
                  <strong className="text-purple-200"> entangled</strong>.
                </p>

                <div className="mt-5 p-4 rounded-2xl bg-[#08111F] border border-[#243B55]">
                  <p className="text-xs font-mono text-[#94A3B8]">
                    EXPLAIN IT TO SOMEONE ELSE
                  </p>

                  <p className="mt-2 text-[#67E8F9] font-bold">
                    “Entanglement means the pair has a quantum state that
                    cannot be reduced to two independent pure-state
                    descriptions.”
                  </p>
                </div>
              </div>
            )}

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 3
            ==================================================================== */}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-emerald-300">
                OBSERVE THE CONSEQUENCE
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Each result is uncertain. The relationship is not.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                Use your Shots knowledge again. Every shot rebuilds the Bell
                circuit and measures both qubits.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-6">
                  <BellCircuit
                    showMeasurement
                  />
                </div>
              </div>

              <JointStateCard />

              <CodePanel
                lines={[
                  'qc = QuantumCircuit(2)',
                  'qc.h(0)',
                  'qc.cx(0, 1)',
                  'qc.measure_all()',
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5 space-y-3">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  RUN REAL QISKIT AER
                </p>

                {[1, 10, 100].map(
                  (shots) => (
                    <button
                      type="button"
                      key={shots}
                      disabled={
                        correlationLoading
                      }
                      onClick={() =>
                        runCorrelationExperiment(
                          shots
                        )
                      }
                      className={`w-full py-3 rounded-xl border font-bold font-mono flex items-center justify-center gap-2 disabled:opacity-50 ${
                        shots === 100
                          ? 'bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] border-transparent'
                          : 'bg-[#08111F] text-white border-[#4F7CFF]/40'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      RUN {shots}{' '}
                      {shots === 1
                        ? 'SHOT'
                        : 'SHOTS'}
                    </button>
                  )
                )}

                {correlationError && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-400/30 text-red-300 text-xs">
                    {correlationError}
                  </div>
                )}

                {correlationShots !== null && (
                  <div className="p-3 rounded-xl bg-[#08111F] border border-[#243B55]">
                    <p className="text-xs text-[#94A3B8] font-mono">
                      Last experiment
                    </p>

                    <p className="text-white font-bold mt-1">
                      {correlationShots}{' '}
                      {correlationShots === 1
                        ? 'shot'
                        : 'shots'}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8] mb-4">
                  MEASUREMENT COUNTS
                </p>

                <CountsHistogram
                  counts={correlationCounts}
                />
              </div>
            </div>

            {ranCorrelation100 && (
              <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-5 rounded-2xl bg-[#132238] border border-[#243B55] text-center">
                  <p className="text-xs font-mono text-[#94A3B8]">
                    EACH QUBIT
                  </p>

                  <p className="mt-2 text-lg font-bold text-white">
                    Individually uncertain
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-950/25 border border-purple-400/30 text-center">
                  <p className="text-xs font-mono text-purple-300">
                    THE PAIR
                  </p>

                  <p className="mt-2 text-lg font-bold text-purple-100">
                    Strongly correlated
                  </p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-2xl bg-[#08111F] border border-[#243B55]">
                  <p className="text-sm text-[#CBD5E1] text-center">
                    Correlated results alone are not the definition of
                    entanglement. Here they are a visible consequence of
                    the joint quantum state we deliberately created.
                  </p>
                </div>
              </div>
            )}

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 4
            ==================================================================== */}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-[#22D3EE]">
                MEASURE ONE PART OF THE PAIR
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                What happens when one qubit is observed?
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                Before measurement, the pair is described by one joint
                quantum state.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
              <div className="space-y-4">
                <JointStateCard />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={collapseLoading}
                    onClick={() =>
                      measureOneQubit(0)
                    }
                    className="py-3.5 rounded-xl bg-[#0D1B2A] border border-[#22D3EE]/50 text-[#67E8F9] font-bold font-mono disabled:opacity-50"
                  >
                    MEASURE q0
                  </button>

                  <button
                    type="button"
                    disabled={collapseLoading}
                    onClick={() =>
                      measureOneQubit(1)
                    }
                    className="py-3.5 rounded-xl bg-[#0D1B2A] border border-purple-400/40 text-purple-300 font-bold font-mono disabled:opacity-50"
                  >
                    MEASURE q1
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-6 flex flex-col justify-center">
                {collapseResult === null ? (
                  <div className="text-center">
                    <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-4" />

                    <p className="text-[#CBD5E1]">
                      Choose either qubit to measure.
                    </p>

                    <p className="text-[#94A3B8] text-sm mt-2">
                      The simulator will generate a real one-shot quantum
                      measurement.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="text-center">
                      <p className="text-xs font-mono text-[#94A3B8]">
                        MEASURED q{measureChoice}
                      </p>

                      <p className="mt-3 text-5xl font-mono font-extrabold text-[#67E8F9]">
                        {collapseResult[
                          measureChoice || 0
                        ]}
                      </p>
                    </div>

                    <ArrowRight className="mx-auto text-[#4F7CFF]" />

                    <div className="p-5 rounded-2xl bg-[#08111F] border border-emerald-400/30 text-center">
                      <p className="text-xs font-mono text-[#94A3B8]">
                        STATE AFTER THIS MEASUREMENT
                      </p>

                      <p className="text-4xl font-mono font-extrabold text-emerald-300 mt-3">
                        |{collapseResult}⟩
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {collapseResult && (
              <div className="max-w-4xl mx-auto space-y-3">
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-400/30">
                  <p className="font-bold text-emerald-300">
                    For this Bell state:
                  </p>

                  <p className="text-[#CBD5E1] mt-2">
                    once one result is observed, the corresponding partner
                    result is fixed for that measurement.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-400/30">
                  <p className="font-bold text-amber-200">
                    Important:
                  </p>

                  <p className="text-[#CBD5E1] mt-2">
                    we cannot choose whether the random measurement gives
                    0 or 1. Entanglement does not give us a button for
                    controllable instant communication.
                  </p>
                </div>
              </div>
            )}

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 5
            ==================================================================== */}

        {currentStep === 5 && (
          <div className="space-y-6">
           <div className="space-y-5">
  <div className="max-w-4xl">
    <span className="text-xs font-mono font-bold text-purple-300">
      A NEW WAY TO ASK A MEASUREMENT QUESTION
    </span>

    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
      You already know one measurement basis.
    </h1>

    <p className="mt-3 text-[#CBD5E1] max-w-3xl leading-relaxed">
      Until now, whenever you measured a qubit, you usually asked:
    </p>

    <p className="mt-3 text-xl sm:text-2xl font-extrabold text-[#67E8F9]">
      “Is the qubit 0 or 1?”
    </p>

    <p className="mt-3 text-[#CBD5E1] max-w-3xl">
      That familiar question has a name:
      <strong className="text-white"> Z-basis measurement</strong>.
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="rounded-3xl bg-[#132238] border border-[#22D3EE]/30 p-5">
      <p className="text-xs font-mono font-bold text-[#22D3EE]">
        Z BASIS
      </p>

      <p className="mt-3 text-2xl font-extrabold text-white">
        Ask: 0 or 1?
      </p>

      <div className="grid grid-cols-2 mt-3">
        <BlochSphere
          state="0"
          label="0"
        />

        <BlochSphere
          state="1"
          label="1"
        />
      </div>

      <p className="text-sm text-[#CBD5E1] mt-2">
        This is the measurement you have already been using.
        On the Bloch sphere it corresponds to the vertical
        |0⟩ ↔ |1⟩ direction.
      </p>
    </div>

    <div className="rounded-3xl bg-[#132238] border border-purple-400/30 p-5">
      <p className="text-xs font-mono font-bold text-purple-300">
        X BASIS
      </p>

      <p className="mt-3 text-2xl font-extrabold text-white">
        Ask: + or −?
      </p>

      <div className="grid grid-cols-2 mt-3">
        <BlochSphere
          state="plus"
          label="+"
        />

        <BlochSphere
          state="minus"
          label="−"
        />
      </div>

      <p className="text-sm text-[#CBD5E1] mt-2">
        This asks about the horizontal Bloch-sphere direction:
        |+⟩ ↔ |−⟩.
      </p>
    </div>
  </div>

  <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30">
    <p className="text-sm text-[#CBD5E1]">
      <strong className="text-white">Why does H appear?</strong>
      {' '}Qiskit normally measures 0 or 1. Applying H first
      lets us rotate the +/− question into that familiar
      measurement.
    </p>

    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm">
      <div className="p-3 rounded-xl bg-[#132238] border border-[#22D3EE]/20">
        <span className="text-[#67E8F9]">
          Z basis:
        </span>{' '}
        <span className="text-white">
          measure directly
        </span>
      </div>

      <div className="p-3 rounded-xl bg-[#132238] border border-purple-400/20">
        <span className="text-purple-300">
          X basis:
        </span>{' '}
        <span className="text-white">
          H → measure
        </span>
      </div>
    </div>
  </div>
</div>

            <div className="flex justify-center">
              <div className="inline-grid grid-cols-2 p-1 rounded-2xl bg-[#08111F] border border-[#243B55]">
                {(
                  ['Z', 'X'] as Basis[]
                ).map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => {
                      setBasis(value);
                      setBasisCounts({});
                    }}
                    className={`px-6 py-3 rounded-xl font-mono font-bold transition-all ${
                      basis === value
                        ? 'bg-[#22D3EE] text-[#08111F]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                   {value === 'Z'
  ? '0 / 1 — Z BASIS'
  : '+ / − — X BASIS'}
  
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-6">
                  <BellCircuit
                    showMeasurement
                    showBasisH={
                      basis === 'X'
                    }
                  />
                </div>
              </div>

              <JointStateCard />

              <CodePanel
                lines={
                  basis === 'Z'
                    ? [
                        'qc = QuantumCircuit(2)',
                        'qc.h(0)',
                        'qc.cx(0, 1)',
                        'qc.measure_all()',
                      ]
                    : [
                        'qc = QuantumCircuit(2)',
                        'qc.h(0)',
                        'qc.cx(0, 1)',
                        'qc.h(0)',
                        'qc.h(1)',
                        'qc.measure_all()',
                      ]
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  CURRENT BASIS
                </p>

                <p className="text-4xl font-extrabold text-[#67E8F9] mt-3">
                  {basis}
                </p>

                <p className="text-sm text-[#CBD5E1] mt-3">
                  {basis === 'Z'
                    ? 'Direct computational-basis measurement.'
                    : 'H rotates the X basis into the computational basis before measurement.'}
                </p>

                <button
                  type="button"
                  disabled={basisLoading}
                  onClick={runBasisExperiment}
                  className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />

                  {basisLoading
                    ? 'SIMULATING...'
                    : 'RUN 100 SHOTS'}
                </button>

                {basisSeen.has(basis) && (
                  <div className="mt-3 flex items-center gap-2 text-emerald-300 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    {basis} basis explored
                  </div>
                )}

                {basisError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-400/30 text-red-300 text-xs">
                    {basisError}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8] mb-4">
                  RESULTS
                </p>

                <CountsHistogram
                  counts={basisCounts}
                />
              </div>
            </div>

            {basisSeen.has('Z') &&
              basisSeen.has('X') && (
                <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-purple-950/25 border border-purple-400/30">
                  <p className="text-lg font-bold text-white">
                    The relationship is deeper than simply storing two
                    matching classical bits.
                  </p>

                  <p className="text-[#CBD5E1] mt-3">
                    The joint quantum state has structured correlations
                    that can be examined in more than one measurement
                    basis.
                  </p>
                </div>
              )}

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 6
            ==================================================================== */}

        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-amber-300">
                BUILD IT YOURSELF
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Create entanglement from |00⟩.
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                Mission: build the state
                <strong className="text-[#67E8F9]">
                  {' '}(|00⟩ + |11⟩) / √2
                </strong>.
              </p>
            </div>

            <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
              <p className="text-xs font-mono font-bold text-[#94A3B8]">
                GATE TRAY
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    addBuilderGate('h0')
                  }
                  disabled={
                    builderGates.length >= 2
                  }
                  className="py-3 rounded-xl bg-purple-950/30 border border-purple-400/40 text-purple-300 font-bold font-mono disabled:opacity-40"
                >
                  H ON q0
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addBuilderGate('x0')
                  }
                  disabled={
                    builderGates.length >= 2
                  }
                  className="py-3 rounded-xl bg-[#08111F] border border-[#4F7CFF]/40 text-white font-bold font-mono disabled:opacity-40"
                >
                  X ON q0
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addBuilderGate('cx')
                  }
                  disabled={
                    builderGates.length >= 2
                  }
                  className="py-3 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/40 text-[#67E8F9] font-bold font-mono disabled:opacity-40"
                >
                  CNOT q0 → q1
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBuilderGates([])
                }
                className="mt-3 px-4 py-2 rounded-xl bg-[#08111F] border border-[#243B55] text-[#94A3B8] text-xs font-mono flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                RESET
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* circuit */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-5">
                  <BellCircuit
                    showH={
                      builderGates.includes(
                        'h0'
                      )
                    }
                    showCNOT={
                      builderGates.includes(
                        'cx'
                      )
                    }
                  />
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  {builderGates.length ===
                  0 ? (
                    <span className="text-xs text-[#64748B] font-mono">
                      No gates added yet.
                    </span>
                  ) : (
                    builderGates.map(
                      (gate, index) => (
                        <span
                          key={`${gate}-${index}`}
                          className="px-3 py-1 rounded-full bg-[#08111F] border border-[#243B55] text-xs font-mono text-white"
                        >
                          {index + 1}.{' '}
                          {gate === 'h0'
                            ? 'H(q0)'
                            : gate === 'x0'
                            ? 'X(q0)'
                            : 'CNOT'}
                        </span>
                      )
                    )
                  )}
                </div>
              </div>

              {/* state */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5 flex flex-col justify-center">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② STATE
                </p>

                <div className="mt-6 text-center">
                  <p className="text-xs text-[#94A3B8] font-mono">
                    CURRENT JOINT STATE
                  </p>

                  <p
                    className={`mt-4 font-mono font-extrabold ${
                      builderCorrect
                        ? 'text-2xl text-[#67E8F9]'
                        : 'text-xl text-white'
                    }`}
                  >
                    {builderState}
                  </p>
                </div>

                {builderGates.length ===
                  1 &&
                  builderGates[0] ===
                    'h0' && (
                    <div className="mt-5 p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                      <p className="text-sm text-[#CBD5E1]">
                        H created superposition on q0.
                      </p>

                      <p className="text-xs text-emerald-300 mt-2">
                        The state is still separable at this point.
                      </p>
                    </div>
                  )}

                {builderCorrect && (
                  <div className="mt-5 p-4 rounded-xl bg-purple-950/25 border border-purple-400/30">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-purple-300" />

                      <p className="font-bold text-purple-200">
                        Entangled.
                      </p>
                    </div>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      CNOT converted the right kind of superposition into
                      a joint entangled state.
                    </p>
                  </div>
                )}
              </div>

              {/* code */}
              <CodePanel
                lines={builderCode}
                activeLine={
                  builderCode.length - 1
                }
              />
            </div>

            {!builderCorrect &&
              builderGates.length >= 2 && (
                <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-amber-950/20 border border-amber-400/30 text-center">
                  <p className="text-amber-200">
                    Not quite. Start by creating superposition on q0, then
                    let CNOT connect q0 with q1.
                  </p>
                </div>
              )}

            {builderCorrect && (
              <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-emerald-950/20 border border-emerald-400/30">
                <p className="text-center text-lg font-extrabold text-emerald-300">
                  You built entanglement yourself.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      H
                    </p>

                    <p className="text-white mt-1 font-bold">
                      creates superposition
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      CNOT
                    </p>

                    <p className="text-white mt-1 font-bold">
                      creates the joint connection
                    </p>
                  </div>
                </div>
              </div>
            )}

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 7
            ==================================================================== */}

        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-[#22D3EE]">
                CAN YOU EXPLAIN IT NOW?
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Decide which statements are true.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                If you can explain why each answer is right or wrong, you
                understand the core idea.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'The complete system can have one joint quantum state.',
                'Entangled qubits can show strongly correlated measurement outcomes.',
                'An entangled pure state cannot always be described as two independent pure qubit states.',
                'Entanglement lets us choose a measurement result and instantly send information.',
              ].map(
                (statement, index) => {
                  const chosen =
                    answers[index];

                  const hasAnswer =
                    chosen !== undefined;

                  const correct =
                    hasAnswer &&
                    chosen ===
                      correctAnswers[
                        index
                      ];

                  return (
                    <div
                      key={statement}
                      className={`p-5 rounded-2xl border transition-all ${
                        !hasAnswer
                          ? 'bg-[#132238] border-[#243B55]'
                          : correct
                          ? 'bg-emerald-950/20 border-emerald-400/40'
                          : 'bg-red-950/20 border-red-400/40'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <p className="text-white font-semibold">
                          {index + 1}.{' '}
                          {statement}
                        </p>

                        <div className="grid grid-cols-2 gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setAnswers(
                                (prev) => ({
                                  ...prev,
                                  [index]:
                                    true,
                                })
                              )
                            }
                            className={`px-5 py-2.5 rounded-xl border font-mono font-bold ${
                              answers[index] ===
                              true
                                ? correctAnswers[
                                    index
                                  ] === true
                                  ? 'bg-emerald-500 text-[#08111F] border-emerald-300'
                                  : 'bg-red-500/30 text-red-200 border-red-400'
                                : 'bg-[#08111F] border-[#243B55] text-white'
                            }`}
                          >
                            TRUE
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setAnswers(
                                (prev) => ({
                                  ...prev,
                                  [index]:
                                    false,
                                })
                              )
                            }
                            className={`px-5 py-2.5 rounded-xl border font-mono font-bold ${
                              answers[index] ===
                              false
                                ? correctAnswers[
                                    index
                                  ] === false
                                  ? 'bg-emerald-500 text-[#08111F] border-emerald-300'
                                  : 'bg-red-500/30 text-red-200 border-red-400'
                                : 'bg-[#08111F] border-[#243B55] text-white'
                            }`}
                          >
                            FALSE
                          </button>
                        </div>
                      </div>

                      {hasAnswer &&
                        !correct && (
                          <p className="text-sm text-red-200 mt-3">
                            Think again using the experiments from this
                            lesson.
                          </p>
                        )}
                    </div>
                  );
                }
              )}
            </div>

            {allSummaryCorrect && (
              <div className="space-y-5">
                <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#132238] to-purple-950/30 border border-purple-400/40 p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />

                    <span className="font-extrabold text-emerald-300">
                      You can explain entanglement.
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1.3fr] items-center gap-3">
                    <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55] text-center">
                      <p className="text-xs font-mono text-[#94A3B8]">
                        START
                      </p>

                      <p className="text-xl font-mono font-bold text-white mt-2">
                        |00⟩
                      </p>
                    </div>

                    <ArrowRight className="hidden md:block text-[#4F7CFF]" />

                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-400/30 text-center">
                      <p className="text-xs font-mono text-purple-300">
                        H ON q0
                      </p>

                      <p className="text-sm font-mono font-bold text-white mt-2">
                        superposition
                      </p>
                    </div>

                    <ArrowRight className="hidden md:block text-[#4F7CFF]" />

                    <div className="p-4 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-center">
                      <p className="text-xs font-mono text-[#67E8F9]">
                        CNOT
                      </p>

                      <p className="text-lg font-mono font-extrabold text-[#67E8F9] mt-2">
                        (|00⟩ + |11⟩) / √2
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl bg-[#08111F] border border-[#243B55]">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      SAY IT SIMPLY
                    </p>

                    <p className="mt-2 text-lg font-bold text-white leading-relaxed">
                      “Entanglement is when the quantum state belongs to
                      the pair as a whole, so the qubits cannot be fully
                      described as independent pure states.”
                    </p>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto p-7 rounded-3xl bg-gradient-to-br from-purple-950/35 to-[#132238] border border-purple-400/40 text-center">
                  <Sparkles className="w-8 h-8 text-purple-300 mx-auto" />

                  <p className="text-xs font-mono font-bold text-purple-300 mt-4">
                    ONE MORE THING...
                  </p>

                  <p className="mt-3 text-[#CBD5E1]">
                    The entangled state you created has a special name.
                  </p>

                  <p className="mt-5 text-5xl font-serif font-bold text-[#67E8F9]">
                    |Φ+⟩
                  </p>

                  <p className="mt-4 text-xl sm:text-2xl font-extrabold text-white">
                    Is this the only maximally entangled two-qubit state?
                  </p>

                  <p className="mt-3 text-purple-200 font-mono">
                    Let&apos;s meet the Bell states.
                  </p>
                </div>
              </div>
            )}

            {nav}
          </div>
        )}
      </div>
    </LessonShell>
  );
};