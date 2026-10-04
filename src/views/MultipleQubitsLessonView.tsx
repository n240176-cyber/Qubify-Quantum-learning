import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { simulateLessonCircuit } from '../services/lessonQuantumSimulator';

interface MultipleQubitsLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

type SimpleQubitState = '0' | '1' | 'plus' | 'minus';
type GateName = 'I' | 'X' | 'H' | 'Z';

const TOTAL_STEPS = 7;

/* ============================================================================
   Small reusable visual components
   ============================================================================ */

const stateLabel = (state: SimpleQubitState) => {
  if (state === 'plus') return '|+⟩';
  if (state === 'minus') return '|−⟩';
  return `|${state}⟩`;
};

const gateFromZero = (gate: GateName): SimpleQubitState => {
  if (gate === 'X') return '1';
  if (gate === 'H') return 'plus';

  // Z|0⟩ = |0⟩
  return '0';
};

const BlochSphere: React.FC<{
  state: SimpleQubitState;
  label: string;
}> = ({ state, label }) => {
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

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[170px] h-[170px]">
        <svg
          viewBox="0 0 180 180"
          className="w-full h-full"
          aria-label={`${label} Bloch sphere`}
        >
          <defs>
            <radialGradient id={`sphere-${label}`}>
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#08111F" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          <circle
            cx="90"
            cy="90"
            r="63"
            fill={`url(#sphere-${label})`}
            stroke="#4F7CFF"
            strokeOpacity="0.65"
            strokeWidth="2"
          />

          <ellipse
            cx="90"
            cy="90"
            rx="63"
            ry="22"
            fill="none"
            stroke="#64748B"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          <line
            x1="90"
            y1="18"
            x2="90"
            y2="162"
            stroke="#64748B"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />

          <line
            x1="20"
            y1="90"
            x2="160"
            y2="90"
            stroke="#64748B"
            strokeOpacity="0.35"
            strokeWidth="1"
          />

          <text
            x="94"
            y="20"
            fill="#67E8F9"
            fontSize="12"
            fontFamily="monospace"
          >
            |0⟩
          </text>

          <text
            x="94"
            y="169"
            fill="#A78BFA"
            fontSize="12"
            fontFamily="monospace"
          >
            |1⟩
          </text>

          <text
            x="150"
            y="84"
            fill="#CBD5E1"
            fontSize="11"
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
            fill="#FFFFFF"
          />
        </svg>
      </div>

      <div className="text-center -mt-2">
        <p className="text-xs font-mono font-bold text-[#94A3B8]">
          {label}
        </p>

        <p className="text-lg font-mono font-extrabold text-[#22D3EE]">
          {stateLabel(state)}
        </p>
      </div>
    </div>
  );
};

const GateBox: React.FC<{
  gate: GateName;
  active?: boolean;
}> = ({ gate, active = false }) => {
  if (gate === 'I') {
    return (
      <div className="w-12 h-12 rounded-xl border border-dashed border-[#475569] bg-[#08111F] flex items-center justify-center text-[#64748B] font-mono text-xs">
        —
      </div>
    );
  }

  return (
    <div
      className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-extrabold transition-all ${
        active
          ? 'bg-[#22D3EE] text-[#08111F] border-[#67E8F9] shadow-lg shadow-[#22D3EE]/25 scale-105'
          : 'bg-[#132238] text-white border-[#4F7CFF]/60'
      }`}
    >
      {gate}
    </div>
  );
};

const CircuitWire: React.FC<{
  qubit: string;
  gate?: GateName;
  active?: boolean;
  measured?: boolean;
}> = ({
  qubit,
  gate = 'I',
  active = false,
  measured = false,
}) => {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="w-7 text-xs font-mono font-bold text-[#94A3B8]">
        {qubit}
      </span>

      <span className="font-mono font-bold text-[#22D3EE]">
        |0⟩
      </span>

      <div className="relative flex-1 h-14 flex items-center justify-center">
        <div className="absolute left-0 right-0 h-0.5 bg-[#4F7CFF]/50" />

        <div className="relative z-10">
          <GateBox gate={gate} active={active} />
        </div>
      </div>

      {measured ? (
        <div className="w-10 h-10 rounded-xl border border-emerald-400/50 bg-emerald-950/30 flex items-center justify-center text-emerald-300 font-mono font-bold">
          M
        </div>
      ) : (
        <div className="w-10" />
      )}
    </div>
  );
};

const CodePanel: React.FC<{
  lines: string[];
  activeLine?: number | null;
  onLineClick?: (index: number) => void;
}> = ({
  lines,
  activeLine = null,
  onLineClick,
}) => {
  return (
    <div className="rounded-2xl bg-[#07101D] border border-[#243B55] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#243B55] bg-[#0D1B2A]">
        <Code2 className="w-4 h-4 text-[#22D3EE]" />
        <span className="text-xs font-mono font-bold text-[#94A3B8]">
          QISKIT
        </span>
      </div>

      <div className="p-3 space-y-1 overflow-x-auto">
        {lines.map((line, index) => {
          const isActive = activeLine === index;

          return (
            <button
              key={`${line}-${index}`}
              type="button"
              onClick={() => onLineClick?.(index)}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all ${
                isActive
                  ? 'bg-[#22D3EE]/15 text-[#67E8F9] border border-[#22D3EE]/40'
                  : 'text-[#CBD5E1] border border-transparent'
              } ${
                onLineClick
                  ? 'cursor-pointer hover:bg-[#132238]'
                  : 'cursor-default'
              }`}
            >
              <span className="text-[#64748B] mr-3">
                {index + 1}
              </span>

              {line}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ThreeViewFrame: React.FC<{
  q0State: SimpleQubitState;
  q1State?: SimpleQubitState;
  q0Gate?: GateName;
  q1Gate?: GateName;
  showSecondQubit?: boolean;
  codeLines: string[];
  activeCircuitQubit?: 0 | 1 | null;
  measured?: boolean;
}> = ({
  q0State,
  q1State = '0',
  q0Gate = 'I',
  q1Gate = 'I',
  showSecondQubit = true,
  codeLines,
  activeCircuitQubit = null,
  measured = false,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
      {/* CIRCUIT */}
      <div className="rounded-2xl bg-[#132238]/90 border border-[#243B55] p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#22D3EE]">
            ① VISUAL CIRCUIT
          </p>

          <p className="text-xs text-[#94A3B8] mt-1">
            Each horizontal wire represents one qubit.
          </p>
        </div>

        <div className="space-y-4">
          <CircuitWire
            qubit="q0"
            gate={q0Gate}
            active={activeCircuitQubit === 0}
            measured={measured}
          />

          {showSecondQubit && (
            <CircuitWire
              qubit="q1"
              gate={q1Gate}
              active={activeCircuitQubit === 1}
              measured={measured}
            />
          )}
        </div>
      </div>

      {/* BLOCH */}
      <div className="rounded-2xl bg-[#132238]/90 border border-[#243B55] p-4 sm:p-5">
        <div className="mb-2">
          <p className="text-[11px] font-mono font-bold tracking-widest text-purple-300">
            ② QUANTUM STATE
          </p>

          <p className="text-xs text-[#94A3B8] mt-1">
            Watch each qubit move on its own Bloch sphere.
          </p>
        </div>

        <div
          className={`grid ${
            showSecondQubit
              ? 'grid-cols-2'
              : 'grid-cols-1'
          } gap-1 items-center justify-items-center`}
        >
          <BlochSphere
            state={q0State}
            label="q0"
          />

          {showSecondQubit && (
            <BlochSphere
              state={q1State}
              label="q1"
            />
          )}
        </div>
      </div>

      {/* CODE */}
      <div>
        <CodePanel lines={codeLines} />
      </div>
    </div>
  );
};

/* ============================================================================
   Main lesson
   ============================================================================ */

export const MultipleQubitsLessonView: React.FC<
  MultipleQubitsLessonViewProps
> = ({
  onExit,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  /* --------------------------------------------------------------------------
     STEP 1
     -------------------------------------------------------------------------- */

  const [secondAdded, setSecondAdded] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 2
     -------------------------------------------------------------------------- */

  const [basisQ0, setBasisQ0] = useState<0 | 1>(0);
  const [basisQ1, setBasisQ1] = useState<0 | 1>(0);
  const [basisTouched, setBasisTouched] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 3
     -------------------------------------------------------------------------- */

  const [q0Gate, setQ0Gate] = useState<GateName>('I');
  const [q1Gate, setQ1Gate] = useState<GateName>('I');

  /* --------------------------------------------------------------------------
     STEP 4
     -------------------------------------------------------------------------- */

  const [mappingLine, setMappingLine] = useState<number | null>(null);
  const [mappingSeen, setMappingSeen] = useState<Set<number>>(
    new Set()
  );

  /* --------------------------------------------------------------------------
     STEP 5
     -------------------------------------------------------------------------- */

  const [simulationCounts, setSimulationCounts] =
    useState<Record<string, number>>({});

  const [simulationShots, setSimulationShots] = useState<number | null>(
    null
  );

  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState('');
  const [hasRun100, setHasRun100] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 6
     -------------------------------------------------------------------------- */

  const [qubitCount, setQubitCount] = useState(1);

  /* --------------------------------------------------------------------------
     STEP 7
     -------------------------------------------------------------------------- */

  const [challengeQ0, setChallengeQ0] =
    useState<GateName>('I');

  const [challengeQ1, setChallengeQ1] =
    useState<GateName>('I');

  const challengeCorrect =
    challengeQ0 === 'H' &&
    challengeQ1 === 'X';

  /* ==========================================================================
     Helpers
     ========================================================================== */

  const unlockNext = (nextStep: number) => {
    setMaxUnlockedStep((prev) =>
      Math.max(prev, Math.min(nextStep, TOTAL_STEPS))
    );
  };

  const chooseStep3Gate = (
    qubit: 0 | 1,
    gate: GateName
  ) => {
    const nextQ0 =
      qubit === 0 ? gate : q0Gate;

    const nextQ1 =
      qubit === 1 ? gate : q1Gate;

    if (qubit === 0) {
      setQ0Gate(gate);
    } else {
      setQ1Gate(gate);
    }

    if (
      nextQ0 !== 'I' &&
      nextQ1 !== 'I'
    ) {
      unlockNext(4);
    }
  };

  const step3Code = useMemo(() => {
    const lines = [
      'from qiskit import QuantumCircuit',
      'qc = QuantumCircuit(2)',
    ];

    if (q0Gate !== 'I') {
      lines.push(
        `qc.${q0Gate.toLowerCase()}(0)`
      );
    }

    if (q1Gate !== 'I') {
      lines.push(
        `qc.${q1Gate.toLowerCase()}(1)`
      );
    }

    return lines;
  }, [q0Gate, q1Gate]);

  const handleMappingLine = (index: number) => {
    setMappingLine(index);

    setMappingSeen((prev) => {
      const next = new Set(prev);
      next.add(index);

      if (next.size >= 3) {
        unlockNext(5);
      }

      return next;
    });
  };

  const runExperiment = async (
    shots: number
  ) => {
    if (simulationLoading) return;

    setSimulationLoading(true);
    setSimulationError('');

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
            gate: 'x',
            qubits: [1],
          },
        ],
      });

    if (!result.success) {
      setSimulationError(
        result.error ||
          'The quantum simulator could not run this experiment.'
      );

      setSimulationLoading(false);
      return;
    }

    setSimulationCounts(
      result.counts || {}
    );

    setSimulationShots(shots);
    setSimulationLoading(false);

    if (shots === 100) {
      setHasRun100(true);
      unlockNext(6);
    }
  };

  const setStateSpaceCount = (
    nextCount: number
  ) => {
    const safe = Math.max(
      1,
      Math.min(5, nextCount)
    );

    setQubitCount(safe);

    if (safe >= 3) {
      unlockNext(7);
    }
  };

  const handleChallengeGate = (
    qubit: 0 | 1,
    gate: GateName
  ) => {
    const nextQ0 =
      qubit === 0
        ? gate
        : challengeQ0;

    const nextQ1 =
      qubit === 1
        ? gate
        : challengeQ1;

    if (qubit === 0) {
      setChallengeQ0(gate);
    } else {
      setChallengeQ1(gate);
    }

    if (
      nextQ0 === 'H' &&
      nextQ1 === 'X'
    ) {
      setMaxUnlockedStep(TOTAL_STEPS);
    }
  };

  const canContinueCurrent = (() => {
    switch (currentStep) {
      case 1:
        return secondAdded;

      case 2:
        return basisTouched;

      case 3:
        return (
          q0Gate !== 'I' &&
          q1Gate !== 'I'
        );

      case 4:
        return mappingSeen.size >= 3;

      case 5:
        return hasRun100;

      case 6:
        return qubitCount >= 3;

      case 7:
        return challengeCorrect;

      default:
        return false;
    }
  })();

  const handleContinue = () => {
    if (!canContinueCurrent) return;

    if (currentStep === TOTAL_STEPS) {
      onComplete();
      return;
    }

    const nextStep =
      currentStep + 1;

    setCurrentStep(nextStep);

    setMaxUnlockedStep((prev) =>
      Math.max(prev, nextStep)
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleBack = () => {
    if (currentStep <= 1) {
      return;
    }

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

  const nav = (
    <div className="pt-5 w-full">
      <LessonNavControls
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        canContinue={canContinueCurrent}
        onBack={handleBack}
        onContinue={handleContinue}
        finalStepLabel="NEXT: CNOT GATE"
      />
    </div>
  );

  /* ==========================================================================
     Render
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
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-3 py-1 rounded-full">
                FROM QISKIT PRACTICE
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                One wire was enough...
                until now.
              </h1>

              <p className="mt-3 text-[#CBD5E1] leading-relaxed max-w-3xl">
                In Qiskit Practice, you learned how to describe and
                simulate a single qubit. A larger quantum computer needs
                more quantum information, so the first thing we do is add
                another qubit.
              </p>

              <p className="mt-2 text-[#94A3B8] text-sm">
                Watch the circuit, Bloch view, and code change together.
              </p>
            </div>

            <ThreeViewFrame
              q0State="0"
              q1State="0"
              q0Gate="I"
              q1Gate="I"
              showSecondQubit={secondAdded}
              codeLines={
                secondAdded
                  ? [
                      'from qiskit import QuantumCircuit',
                      'qc = QuantumCircuit(2)',
                    ]
                  : [
                      'from qiskit import QuantumCircuit',
                      'qc = QuantumCircuit(1)',
                    ]
              }
            />

            {!secondAdded ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSecondAdded(true);
                    unlockNext(2);
                  }}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono text-sm flex items-center gap-2 shadow-lg shadow-[#22D3EE]/20"
                >
                  <Plus className="w-4 h-4" />
                  ADD A SECOND QUBIT
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-emerald-950/20 border border-emerald-400/30 text-center">
                <p className="font-bold text-emerald-300">
                  One extra qubit → one extra circuit wire → one extra
                  quantum state to control.
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
              <span className="text-xs font-mono font-bold text-purple-300">
                TWO QUBITS • FOUR BASIS STATES
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                What can two qubits store?
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                Each qubit can be measured as 0 or 1. With two qubits,
                there are four computational basis states.
              </p>

              <p className="mt-2 text-xs font-mono text-[#94A3B8]">
                In this lesson we write the pair as |q0 q1⟩.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-5">
              <div className="rounded-3xl bg-[#132238]/90 border border-[#243B55] p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      q0
                    </p>

                    <p className="text-3xl font-mono font-extrabold text-[#22D3EE] my-3">
                      |{basisQ0}⟩
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setBasisQ0(
                          basisQ0 === 0 ? 1 : 0
                        );
                        setBasisTouched(true);
                        unlockNext(3);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#132238] hover:bg-[#1a2e48] border border-[#4F7CFF]/50 text-white font-mono text-sm"
                    >
                      Apply X
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      q1
                    </p>

                    <p className="text-3xl font-mono font-extrabold text-purple-300 my-3">
                      |{basisQ1}⟩
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setBasisQ1(
                          basisQ1 === 0 ? 1 : 0
                        );
                        setBasisTouched(true);
                        unlockNext(3);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#132238] hover:bg-[#1a2e48] border border-purple-400/40 text-white font-mono text-sm"
                    >
                      Apply X
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/40 text-center">
                  <p className="text-xs text-[#94A3B8] font-mono mb-2">
                    CURRENT TWO-QUBIT STATE
                  </p>

                  <p className="text-5xl font-mono font-extrabold text-white">
                    |{basisQ0}
                    {basisQ1}⟩
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238]/90 border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8] mb-4">
                  ALL POSSIBLE BASIS STATES
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    '00',
                    '01',
                    '10',
                    '11',
                  ].map((state) => {
                    const current =
                      state ===
                      `${basisQ0}${basisQ1}`;

                    return (
                      <div
                        key={state}
                        className={`p-5 rounded-2xl border text-center transition-all ${
                          current
                            ? 'bg-[#22D3EE]/15 border-[#22D3EE] scale-[1.02] shadow-lg shadow-[#22D3EE]/10'
                            : 'bg-[#0D1B2A] border-[#243B55]'
                        }`}
                      >
                        <span
                          className={`text-3xl font-mono font-extrabold ${
                            current
                              ? 'text-[#67E8F9]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          |{state}⟩
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                  <p className="text-sm text-[#CBD5E1]">
                    One qubit gave us{' '}
                    <strong className="text-white">
                      2
                    </strong>{' '}
                    basis states.
                  </p>

                  <p className="text-sm text-[#CBD5E1] mt-1">
                    Two qubits give us{' '}
                    <strong className="text-[#22D3EE]">
                      4
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 3
            ==================================================================== */}

        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-[#22D3EE]">
                INDEPENDENT CONTROL
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Different wires can receive different gates.
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                Choose a gate for each qubit. The circuit, Bloch spheres,
                and Qiskit code update together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[0, 1].map((qubit) => {
                const selected =
                  qubit === 0
                    ? q0Gate
                    : q1Gate;

                return (
                  <div
                    key={qubit}
                    className="rounded-2xl bg-[#132238] border border-[#243B55] p-4"
                  >
                    <p className="font-mono font-bold text-white mb-3">
                      Choose gate for q{qubit}
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          'I',
                          'X',
                          'H',
                          'Z',
                        ] as GateName[]
                      ).map((gate) => (
                        <button
                          type="button"
                          key={gate}
                          onClick={() =>
                            chooseStep3Gate(
                              qubit as 0 | 1,
                              gate
                            )
                          }
                          className={`py-3 rounded-xl border font-mono font-extrabold transition-all ${
                            selected === gate
                              ? 'bg-[#22D3EE] border-[#67E8F9] text-[#08111F]'
                              : 'bg-[#0D1B2A] border-[#243B55] text-white hover:border-[#4F7CFF]'
                          }`}
                        >
                          {gate === 'I'
                            ? 'None'
                            : gate}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <ThreeViewFrame
              q0State={gateFromZero(q0Gate)}
              q1State={gateFromZero(q1Gate)}
              q0Gate={q0Gate}
              q1Gate={q1Gate}
              codeLines={step3Code}
            />

            <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/30 text-center">
              <p className="text-sm text-[#CBD5E1]">
                Notice something important:
              </p>

              <p className="font-bold text-white mt-1">
                q0 can move without changing q1, and q1 can move without
                changing q0.
              </p>

              <p className="text-sm text-[#22D3EE] mt-2">
                For now, the qubits are being controlled independently.
              </p>
            </div>

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 4
            ==================================================================== */}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-purple-300">
                PICTURE ↔ CODE
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                The code is describing the circuit you can see.
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                Click the Qiskit lines. Watch which part of the circuit
                they describe.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE] mb-5">
                  THE CIRCUIT
                </p>

                <div className="space-y-5">
                  <CircuitWire
                    qubit="q0"
                    gate="H"
                    active={mappingLine === 1}
                    measured={mappingLine === 3}
                  />

                  <CircuitWire
                    qubit="q1"
                    gate="X"
                    active={mappingLine === 2}
                    measured={mappingLine === 3}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <BlochSphere
                    state="plus"
                    label="q0"
                  />

                  <BlochSphere
                    state="1"
                    label="q1"
                  />
                </div>
              </div>

              <CodePanel
                lines={[
                  'qc = QuantumCircuit(2, 2)',
                  'qc.h(0)',
                  'qc.x(1)',
                  'qc.measure([0, 1], [0, 1])',
                ]}
                activeLine={mappingLine}
                onLineClick={handleMappingLine}
              />
            </div>

            <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/30">
              <p className="text-center font-bold text-[#67E8F9]">
                Circuit diagrams and Qiskit are not two different ideas.
                They are two descriptions of the same experiment.
              </p>
            </div>

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 5
            ==================================================================== */}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-emerald-300">
                CONNECTING BACK TO SHOTS
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                A shot now measures more than one qubit.
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                You already know that a shot reruns the complete circuit.
                The idea has not changed. The difference is that each run
                now gives a multi-bit measurement result.
              </p>
            </div>

            <ThreeViewFrame
              q0State="plus"
              q1State="1"
              q0Gate="H"
              q1Gate="X"
              measured
              codeLines={[
                'qc = QuantumCircuit(2)',
                'qc.h(0)',
                'qc.x(1)',
                'qc.measure_all()',
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5 space-y-3">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  RUN THE REAL SIMULATOR
                </p>

                <button
                  type="button"
                  disabled={simulationLoading}
                  onClick={() =>
                    runExperiment(1)
                  }
                  className="w-full py-3 rounded-xl bg-[#0D1B2A] border border-[#4F7CFF]/50 text-white font-bold font-mono flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  RUN 1 SHOT
                </button>

                <button
                  type="button"
                  disabled={simulationLoading}
                  onClick={() =>
                    runExperiment(100)
                  }
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />

                  {simulationLoading
                    ? 'SIMULATING...'
                    : 'RUN 100 SHOTS'}
                </button>

                {simulationError && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-400/30 text-red-300 text-xs">
                    {simulationError}
                  </div>
                )}

                {simulationShots !== null && (
                  <div className="p-3 rounded-xl bg-[#08111F] border border-[#243B55]">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      Latest experiment
                    </p>

                    <p className="font-bold text-white mt-1">
                      {simulationShots}{' '}
                      {simulationShots === 1
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

                {Object.keys(
                  simulationCounts
                ).length === 0 ? (
                  <div className="min-h-[200px] flex items-center justify-center rounded-2xl bg-[#08111F] border border-dashed border-[#334155]">
                    <p className="text-sm text-[#64748B] text-center px-6">
                      Run the circuit to see real Qiskit Aer results here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(
                      simulationCounts
                    )
                      .sort(
                        ([a], [b]) =>
                          a.localeCompare(b)
                      )
                      .map(
                        ([result, count]) => {
                          const maxCount =
                            Math.max(
                              ...Object.values(
                                simulationCounts
                              )
                            );

                          const width =
                            maxCount > 0
                              ? (count /
                                  maxCount) *
                                100
                              : 0;

                          return (
                            <div
                              key={result}
                              className="grid grid-cols-[55px_1fr_50px] items-center gap-3"
                            >
                              <span className="font-mono font-extrabold text-[#67E8F9]">
                                {result}
                              </span>

                              <div className="h-9 rounded-lg bg-[#08111F] border border-[#243B55] overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#22D3EE]/80 to-[#4F7CFF]/80 transition-all duration-500"
                                  style={{
                                    width: `${width}%`,
                                  }}
                                />
                              </div>

                              <span className="font-mono text-sm text-white text-right">
                                {count}
                              </span>
                            </div>
                          );
                        }
                      )}
                  </div>
                )}

                <p className="mt-5 text-xs text-[#94A3B8] leading-relaxed">
                  Qiskit normally prints classical multi-qubit bitstrings
                  in its classical-bit ordering. The important idea here
                  is simple: one shot now produces a result containing
                  information from multiple qubits.
                </p>
              </div>
            </div>

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 6
            ==================================================================== */}

        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-[#22D3EE]">
                THE WOW MOMENT
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Every qubit makes the state space grow.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                This is one reason multi-qubit systems become so
                interesting. The number of computational basis states
                doubles every time we add a qubit.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-6">
                <p className="text-xs font-mono text-[#94A3B8]">
                  NUMBER OF QUBITS
                </p>

                <div className="flex items-center justify-center gap-5 my-6">
                  <button
                    type="button"
                    onClick={() =>
                      setStateSpaceCount(
                        qubitCount - 1
                      )
                    }
                    className="w-12 h-12 rounded-full bg-[#08111F] border border-[#243B55] text-white text-xl"
                  >
                    −
                  </button>

                  <span className="text-6xl font-extrabold text-[#22D3EE]">
                    {qubitCount}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setStateSpaceCount(
                        qubitCount + 1
                      )
                    }
                    className="w-12 h-12 rounded-full bg-[#08111F] border border-[#4F7CFF]/60 text-white text-xl"
                  >
                    +
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30 text-center">
                  <p className="text-[#94A3B8] text-xs font-mono">
                    BASIS STATES
                  </p>

                  <p className="text-5xl font-extrabold text-white mt-2">
                    {2 ** qubitCount}
                  </p>

                  <p className="mt-2 font-mono text-[#67E8F9]">
                    2^{qubitCount}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-mono font-bold text-[#94A3B8]">
                    STATE SPACE
                  </p>

                  <span className="text-xs font-mono text-purple-300">
                    {2 ** qubitCount} states
                  </span>
                </div>

                <div
                  className={`grid gap-2 ${
                    qubitCount <= 2
                      ? 'grid-cols-2'
                      : qubitCount === 3
                      ? 'grid-cols-4'
                      : 'grid-cols-4 sm:grid-cols-8'
                  }`}
                >
                  {Array.from({
                    length:
                      2 ** qubitCount,
                  }).map((_, index) => {
                    const binary =
                      index
                        .toString(2)
                        .padStart(
                          qubitCount,
                          '0'
                        );

                    return (
                      <div
                        key={binary}
                        className="aspect-square rounded-xl bg-gradient-to-br from-[#22D3EE]/15 to-[#4F7CFF]/10 border border-[#4F7CFF]/35 flex items-center justify-center transition-all hover:scale-105 hover:border-[#22D3EE]"
                      >
                        <span
                          className={`font-mono font-bold text-[#CBD5E1] ${
                            qubitCount >= 5
                              ? 'text-[9px]'
                              : 'text-xs'
                          }`}
                        >
                          |{binary}⟩
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-purple-950/20 border border-purple-400/30">
              <p className="text-center text-[#CBD5E1] leading-relaxed">
                This does <strong className="text-white">not</strong> mean
                a quantum computer simply gives us every answer at once.
                It means adding qubits rapidly increases the size of the
                quantum state space that quantum operations can work
                within.
              </p>
            </div>

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 7
            ==================================================================== */}

        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-amber-300">
                MINI BUILD CHALLENGE
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Build this two-qubit state.
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                Mission: put <strong className="text-white">q0</strong>{' '}
                into superposition and place{' '}
                <strong className="text-white">q1</strong> in |1⟩.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[0, 1].map((qubit) => {
                const selected =
                  qubit === 0
                    ? challengeQ0
                    : challengeQ1;

                return (
                  <div
                    key={qubit}
                    className="rounded-2xl bg-[#132238] border border-[#243B55] p-4"
                  >
                    <p className="font-mono font-bold text-white mb-3">
                      q{qubit}
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          'I',
                          'X',
                          'H',
                        ] as GateName[]
                      ).map((gate) => (
                        <button
                          type="button"
                          key={gate}
                          onClick={() =>
                            handleChallengeGate(
                              qubit as 0 | 1,
                              gate
                            )
                          }
                          className={`py-3 rounded-xl border font-mono font-extrabold ${
                            selected === gate
                              ? 'bg-[#22D3EE] text-[#08111F] border-[#67E8F9]'
                              : 'bg-[#0D1B2A] text-white border-[#243B55]'
                          }`}
                        >
                          {gate === 'I'
                            ? 'None'
                            : gate}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <ThreeViewFrame
              q0State={gateFromZero(
                challengeQ0
              )}
              q1State={gateFromZero(
                challengeQ1
              )}
              q0Gate={challengeQ0}
              q1Gate={challengeQ1}
              codeLines={[
                'from qiskit import QuantumCircuit',
                'qc = QuantumCircuit(2)',
                ...(challengeQ0 !== 'I'
                  ? [
                      `qc.${challengeQ0.toLowerCase()}(0)`,
                    ]
                  : []),
                ...(challengeQ1 !== 'I'
                  ? [
                      `qc.${challengeQ1.toLowerCase()}(1)`,
                    ]
                  : []),
              ]}
            />

            {challengeCorrect ? (
              <div className="space-y-4">
                <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-emerald-950/25 border border-emerald-400/40">
                  <div className="flex items-center justify-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />

                    <span className="font-extrabold">
                      Perfect.
                    </span>
                  </div>

                  <p className="text-center text-[#CBD5E1] mt-2">
                    You built a two-qubit circuit, predicted the individual
                    states, and connected the circuit directly to Qiskit.
                  </p>
                </div>

                <div className="relative overflow-hidden max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#132238] to-[#0D1B2A] border border-[#4F7CFF]/40">
                  <Sparkles className="absolute top-5 right-5 w-7 h-7 text-purple-300 opacity-60" />

                  <p className="text-xs font-mono font-bold text-purple-300">
                    BUT SOMETHING IS STILL MISSING...
                  </p>

                  <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
                    These two qubits still do not interact.
                  </h2>

                  <div className="my-6 p-5 rounded-2xl bg-[#08111F] border border-[#243B55]">
                    <CircuitWire
                      qubit="q0"
                      gate="H"
                    />

                    <div className="h-7 flex items-center justify-center">
                      <div className="px-4 py-1 rounded-full border border-dashed border-purple-400/60 text-purple-300 font-mono text-xs animate-pulse">
                        ?
                      </div>
                    </div>

                    <CircuitWire
                      qubit="q1"
                      gate="X"
                    />
                  </div>

                  <p className="text-lg sm:text-xl font-semibold text-[#CBD5E1] leading-relaxed">
                    We know how to control q0 and q1 separately.
                  </p>

                  <p className="mt-3 text-xl sm:text-2xl font-extrabold text-[#67E8F9]">
                    But what if the state of one qubit could decide what
                    happens to the other?
                  </p>

                  <div className="flex items-center gap-2 mt-5 text-purple-300 font-mono text-sm">
                    <span>
                      That requires our first two-qubit interaction
                    </span>

                    <ArrowRight className="w-4 h-4" />

                    <span className="font-bold">
                      CNOT
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-[#132238] border border-[#243B55] text-center">
                <p className="text-sm text-[#94A3B8]">
                  Hint: Which gate puts |0⟩ into superposition? Which gate
                  flips |0⟩ to |1⟩?
                </p>
              </div>
            )}

            {nav}
          </div>
        )}
      </div>
    </LessonShell>
  );
};