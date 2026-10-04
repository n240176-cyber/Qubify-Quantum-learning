import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Link2,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { simulateLessonCircuit } from '../services/lessonQuantumSimulator';

interface CNOTGateLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

type Bit = 0 | 1;

const TOTAL_STEPS = 7;

/* ============================================================================
   LOGIC HELPERS
   ============================================================================ */

const applyCNOT = (
  control: Bit,
  target: Bit
): [Bit, Bit] => {
  if (control === 1) {
    return [control, target === 0 ? 1 : 0];
  }

  return [control, target];
};

const stateText = (
  control: Bit,
  target: Bit
) => `|${control}${target}⟩`;

/* ============================================================================
   SMALL VISUAL COMPONENTS
   ============================================================================ */

const BlochSphere: React.FC<{
  value: Bit | 'plus';
  label: string;
  dimmed?: boolean;
}> = ({
  value,
  label,
  dimmed = false,
}) => {
  const endpoint =
    value === 0
      ? { x: 90, y: 28 }
      : value === 1
      ? { x: 90, y: 152 }
      : { x: 150, y: 90 };

  return (
    <div
      className={`flex flex-col items-center transition-all duration-500 ${
        dimmed ? 'opacity-30 scale-95' : 'opacity-100'
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
          className="transition-all duration-500"
        />

        <circle
          cx={endpoint.x}
          cy={endpoint.y}
          r="6"
          fill="#22D3EE"
          className="transition-all duration-500"
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
        {value === 'plus'
          ? '|+⟩'
          : `|${value}⟩`}
      </p>
    </div>
  );
};

/* ============================================================================
   CNOT CIRCUIT
   ============================================================================ */

const CNOTCircuit: React.FC<{
  control: Bit | 'plus';
  target: Bit;
  connected?: boolean;
  pulse?: boolean;
  resultTarget?: Bit;
  showH?: boolean;
  showMeasure?: boolean;
}> = ({
  control,
  target,
  connected = true,
  pulse = false,
  resultTarget,
  showH = false,
  showMeasure = false,
}) => {
  return (
    <div className="w-full space-y-6 font-mono">
      {/* q0 */}
      <div className="grid grid-cols-[45px_42px_1fr_42px] items-center gap-2">
        <span className="text-xs font-bold text-[#94A3B8]">
          q0
        </span>

        <span className="text-[#22D3EE] font-bold">
          |0⟩
        </span>

        <div className="relative h-14 flex items-center">
          <div className="absolute inset-x-0 h-0.5 bg-[#4F7CFF]/50" />

          {showH && (
            <div className="absolute left-[20%] z-10 w-11 h-11 rounded-xl bg-purple-950 border border-purple-400/60 text-purple-300 flex items-center justify-center font-extrabold">
              H
            </div>
          )}

          {connected && (
            <div className="absolute left-[67%] -translate-x-1/2 z-20">
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                  pulse
                    ? 'bg-[#22D3EE] border-[#67E8F9] shadow-lg shadow-[#22D3EE]/70 scale-125'
                    : 'bg-[#4F7CFF] border-[#93C5FD]'
                }`}
              />
            </div>
          )}
        </div>

        {showMeasure ? (
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
            M
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* CNOT vertical connector */}
      <div className="relative h-3">
        {connected && (
          <div className="absolute left-[calc(45px+42px+1rem+67%)]" />
        )}
      </div>

      {/* q1 */}
      <div className="grid grid-cols-[45px_42px_1fr_42px] items-center gap-2">
        <span className="text-xs font-bold text-[#94A3B8]">
          q1
        </span>

        <span className="text-purple-300 font-bold">
          |0⟩
        </span>

        <div className="relative h-14 flex items-center">
          <div className="absolute inset-x-0 h-0.5 bg-[#4F7CFF]/50" />

          {connected && (
            <>
              <div
                className={`absolute left-[67%] -translate-x-1/2 z-10 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  pulse
                    ? 'border-[#22D3EE] bg-[#22D3EE]/20 shadow-lg shadow-[#22D3EE]/40'
                    : 'border-[#4F7CFF] bg-[#0D1B2A]'
                }`}
              >
                <span className="text-2xl text-[#67E8F9] font-light">
                  +
                </span>
              </div>

              <div
                className={`absolute left-[67%] -translate-x-1/2 bottom-full h-[92px] w-0.5 transition-all duration-300 ${
                  pulse
                    ? 'bg-[#22D3EE] shadow-lg shadow-[#22D3EE]'
                    : 'bg-[#4F7CFF]/70'
                }`}
              />
            </>
          )}

          {resultTarget !== undefined && (
            <div className="absolute right-1 text-xs text-emerald-300 font-bold">
              → |{resultTarget}⟩
            </div>
          )}
        </div>

        {showMeasure ? (
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
            M
          </div>
        ) : (
          <div />
        )}
      </div>

      <div className="flex items-center justify-center gap-5 pt-2 text-[11px]">
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <div className="w-3 h-3 rounded-full bg-[#4F7CFF]" />
          <span>control</span>
        </div>

        <div className="flex items-center gap-2 text-[#94A3B8]">
          <div className="w-5 h-5 rounded-full border border-[#4F7CFF] flex items-center justify-center text-[#67E8F9]">
            +
          </div>
          <span>target</span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   CODE PANEL
   ============================================================================ */

const CodePanel: React.FC<{
  lines: string[];
  activeLine?: number | null;
}> = ({
  lines,
  activeLine = null,
}) => {
  return (
    <div className="rounded-2xl bg-[#07101D] border border-[#243B55] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0D1B2A] border-b border-[#243B55]">
        <Code2 className="w-4 h-4 text-[#22D3EE]" />

        <span className="text-xs font-mono font-bold text-[#94A3B8]">
          QISKIT
        </span>
      </div>

      <div className="p-3 space-y-1">
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className={`px-3 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all duration-300 ${
              activeLine === index
                ? 'bg-[#22D3EE]/15 border border-[#22D3EE]/40 text-[#67E8F9]'
                : 'border border-transparent text-[#CBD5E1]'
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
   BASIS STATE CARD
   ============================================================================ */

const BasisStateCard: React.FC<{
  value: string;
  selected?: boolean;
  completed?: boolean;
  onClick?: () => void;
}> = ({
  value,
  selected = false,
  completed = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-5 rounded-2xl border text-center transition-all ${
        selected
          ? 'bg-[#22D3EE]/15 border-[#22D3EE] scale-[1.03]'
          : completed
          ? 'bg-emerald-950/20 border-emerald-400/40'
          : 'bg-[#0D1B2A] border-[#243B55] hover:border-[#4F7CFF]'
      }`}
    >
      {completed && (
        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-300" />
      )}

      <span className="text-2xl font-mono font-extrabold text-white">
        |{value}⟩
      </span>
    </button>
  );
};

/* ============================================================================
   MAIN VIEW
   ============================================================================ */

export const CNOTGateLessonView: React.FC<
  CNOTGateLessonViewProps
> = ({
  onExit,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  /* --------------------------------------------------------------------------
     STEP 1
     -------------------------------------------------------------------------- */

  const [connected, setConnected] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 2
     -------------------------------------------------------------------------- */

  const [step2Control, setStep2Control] = useState<Bit>(0);
  const [step2Target, setStep2Target] = useState<Bit>(0);
  const [step2Output, setStep2Output] =
    useState<[Bit, Bit] | null>(null);
  const [step2Pulse, setStep2Pulse] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 3
     -------------------------------------------------------------------------- */

  const [selectedCase, setSelectedCase] = useState('00');

  const [discoveredCases, setDiscoveredCases] =
    useState<Set<string>>(new Set());

  /* --------------------------------------------------------------------------
     STEP 4
     -------------------------------------------------------------------------- */

  const [prepControl, setPrepControl] = useState<Bit>(1);
  const [prepTarget, setPrepTarget] = useState<Bit>(0);
  const [step4ActiveLine, setStep4ActiveLine] =
    useState<number | null>(null);
  const [step4Running, setStep4Running] = useState(false);
  const [step4Finished, setStep4Finished] = useState(false);
  const [step4Pulse, setStep4Pulse] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 5
     -------------------------------------------------------------------------- */

  const [quizAnswer, setQuizAnswer] =
    useState<string | null>(null);

  const [quizSecondAnswer, setQuizSecondAnswer] =
    useState<string | null>(null);

  /* --------------------------------------------------------------------------
     STEP 6
     -------------------------------------------------------------------------- */

  const [quantumStage, setQuantumStage] =
    useState<'ready' | 'superposition' | 'entangled'>('ready');

  const [quantumPulse, setQuantumPulse] = useState(false);

  /* --------------------------------------------------------------------------
     STEP 7
     -------------------------------------------------------------------------- */

  const [counts, setCounts] =
    useState<Record<string, number>>({});

  const [shotsRun, setShotsRun] = useState<number | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState('');
  const [ran100Shots, setRan100Shots] = useState(false);

  /* ==========================================================================
     SHARED HELPERS
     ========================================================================== */

  const unlock = (step: number) => {
    setMaxUnlockedStep((prev) =>
      Math.max(prev, Math.min(step, TOTAL_STEPS))
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

  const handleSelectStep = (step: number) => {
    if (step > maxUnlockedStep) return;

    setCurrentStep(step);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* ==========================================================================
     STEP 2
     ========================================================================== */

  const runStep2 = () => {
    setStep2Output(null);
    setStep2Pulse(false);

    setTimeout(() => {
      setStep2Pulse(true);
    }, 150);

    setTimeout(() => {
      setStep2Output(
        applyCNOT(
          step2Control,
          step2Target
        )
      );

      setStep2Pulse(false);
      unlock(3);
    }, 750);
  };

  /* ==========================================================================
     STEP 3
     ========================================================================== */

  const exploreCase = (value: string) => {
    setSelectedCase(value);

    setDiscoveredCases((prev) => {
      const next = new Set(prev);
      next.add(value);

      if (next.size === 4) {
        unlock(4);
      }

      return next;
    });
  };

  const selectedControl =
    Number(selectedCase[0]) as Bit;

  const selectedTarget =
    Number(selectedCase[1]) as Bit;

  const selectedOutput =
    applyCNOT(
      selectedControl,
      selectedTarget
    );

  /* ==========================================================================
     STEP 4
     ========================================================================== */

  const step4Output = applyCNOT(
    prepControl,
    prepTarget
  );

  const step4Code = useMemo(() => {
    const lines = [
      'from qiskit import QuantumCircuit',
      'qc = QuantumCircuit(2)',
    ];

    if (prepControl === 1) {
      lines.push('qc.x(0)');
    }

    if (prepTarget === 1) {
      lines.push('qc.x(1)');
    }

    lines.push('qc.cx(0, 1)');

    return lines;
  }, [
    prepControl,
    prepTarget,
  ]);

  const runStep4 = () => {
    if (step4Running) return;

    setStep4Running(true);
    setStep4Finished(false);
    setStep4Pulse(false);
    setStep4ActiveLine(1);

    const cnotLine =
      step4Code.length - 1;

    let delay = 500;

    if (prepControl === 1) {
      setTimeout(() => {
        setStep4ActiveLine(2);
      }, delay);

      delay += 600;
    }

    if (prepTarget === 1) {
      const targetLine =
        prepControl === 1 ? 3 : 2;

      setTimeout(() => {
        setStep4ActiveLine(targetLine);
      }, delay);

      delay += 600;
    }

    setTimeout(() => {
      setStep4ActiveLine(cnotLine);
      setStep4Pulse(true);
    }, delay);

    setTimeout(() => {
      setStep4Pulse(false);
      setStep4Finished(true);
      setStep4Running(false);
      setStep4ActiveLine(null);
      unlock(5);
    }, delay + 800);
  };

  /* ==========================================================================
     STEP 5
     ========================================================================== */

  const quiz1Correct =
    quizAnswer === 'target';

  const quiz2Correct =
    quizSecondAnswer === 'no';

  /* ==========================================================================
     STEP 6
     ========================================================================== */

  const createSuperposition = () => {
    setQuantumStage('superposition');
  };

  const runQuantumCNOT = () => {
    setQuantumPulse(true);

    setTimeout(() => {
      setQuantumPulse(false);
      setQuantumStage('entangled');
      unlock(7);
    }, 900);
  };

  /* ==========================================================================
     STEP 7 — REAL QISKIT
     ========================================================================== */

  const runBellExperiment = async (
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
            gate: 'cx',
            qubits: [0, 1],
          },
        ],
      });

    if (!result.success) {
      setSimulationError(
        result.error ||
          'The simulator could not run this circuit.'
      );

      setSimulationLoading(false);
      return;
    }

    setCounts(
      result.counts || {}
    );

    setShotsRun(shots);
    setSimulationLoading(false);

    if (shots === 100) {
      setRan100Shots(true);
    }
  };

  /* ==========================================================================
     CONTINUE RULES
     ========================================================================== */

  const canContinue = (() => {
    switch (currentStep) {
      case 1:
        return connected;

      case 2:
        return step2Output !== null;

      case 3:
        return discoveredCases.size === 4;

      case 4:
        return step4Finished;

      case 5:
        return quiz1Correct && quiz2Correct;

      case 6:
        return quantumStage === 'entangled';

      case 7:
        return ran100Shots;

      default:
        return false;
    }
  })();

  const handleContinue = () => {
    if (!canContinue) return;

    if (currentStep === TOTAL_STEPS) {
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
      finalStepLabel="NEXT: ENTANGLEMENT"
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
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-3 py-1 rounded-full">
                FROM MULTIPLE QUBITS
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
                We controlled two qubits separately.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl leading-relaxed">
                In the previous lesson, q0 and q1 each had their own
                circuit wire, Bloch sphere, and gates.
              </p>

              <p className="mt-2 text-lg font-bold text-[#67E8F9]">
                But what if q0 could decide what happens to q1?
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Circuit */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-6">
                  <CNOTCircuit
                    control={0}
                    target={0}
                    connected={connected}
                  />
                </div>
              </div>

              {/* State */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② QUBIT STATES
                </p>

                <div className="grid grid-cols-2 mt-3">
                  <BlochSphere
                    value={0}
                    label="q0"
                  />

                  <BlochSphere
                    value={0}
                    label="q1"
                  />
                </div>
              </div>

              {/* Code */}
              <CodePanel
                lines={
                  connected
                    ? [
                        'qc = QuantumCircuit(2)',
                        'qc.cx(0, 1)',
                      ]
                    : [
                        'qc = QuantumCircuit(2)',
                        '# q0 and q1 are separate',
                      ]
                }
                activeLine={
                  connected ? 1 : null
                }
              />
            </div>

            {!connected ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setConnected(true);
                    unlock(2);
                  }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono flex items-center gap-2 shadow-lg shadow-[#22D3EE]/20"
                >
                  <Link2 className="w-5 h-5" />
                  CONNECT THE QUBITS
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-center">
                <p className="font-bold text-white">
                  Meet the CNOT gate.
                </p>

                <p className="text-[#67E8F9] mt-1 font-mono">
                  qc.cx(0, 1)
                </p>

                <p className="text-sm text-[#CBD5E1] mt-2">
                  q0 is the control. q1 is the target.
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
                THE CNOT RULE
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                The control decides. The target may flip.
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-[#132238] border border-[#243B55]">
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#08111F] border border-[#243B55]">
                    <span className="font-mono text-[#67E8F9] font-bold">
                      If control = 0
                    </span>

                    <p className="text-[#CBD5E1] mt-1">
                      Do nothing to the target.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/40">
                    <span className="font-mono text-purple-300 font-bold">
                      If control = 1
                    </span>

                    <p className="text-white mt-1 font-semibold">
                      Flip the target.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div>
                    <p className="text-xs text-[#94A3B8] font-mono mb-2">
                      CONTROL q0
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setStep2Control(
                              value as Bit
                            );
                            setStep2Output(null);
                          }}
                          className={`py-3 rounded-xl border font-mono font-bold ${
                            step2Control === value
                              ? 'bg-[#22D3EE] text-[#08111F] border-[#67E8F9]'
                              : 'bg-[#08111F] text-white border-[#243B55]'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8] font-mono mb-2">
                      TARGET q1
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setStep2Target(
                              value as Bit
                            );
                            setStep2Output(null);
                          }}
                          className={`py-3 rounded-xl border font-mono font-bold ${
                            step2Target === value
                              ? 'bg-purple-400 text-[#08111F] border-purple-300'
                              : 'bg-[#08111F] text-white border-[#243B55]'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runStep2}
                  className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  RUN CNOT
                </button>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <CNOTCircuit
                  control={step2Control}
                  target={step2Target}
                  pulse={step2Pulse}
                  resultTarget={
                    step2Output
                      ? step2Output[1]
                      : undefined
                  }
                />

                <div className="mt-6 p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30 text-center">
                  <p className="text-xs font-mono text-[#94A3B8]">
                    INPUT → OUTPUT
                  </p>

                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="text-3xl font-mono font-extrabold text-white">
                      {stateText(
                        step2Control,
                        step2Target
                      )}
                    </span>

                    <ArrowRight className="text-[#4F7CFF]" />

                    <span className="text-3xl font-mono font-extrabold text-[#67E8F9]">
                      {step2Output
                        ? stateText(
                            step2Output[0],
                            step2Output[1]
                          )
                        : '?'}
                    </span>
                  </div>
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
          <div className="space-y-6">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-purple-300">
                DISCOVER IT YOURSELF
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                What does CNOT do to all four basis states?
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                Click every input state and predict what CNOT will do.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                '00',
                '01',
                '10',
                '11',
              ].map((value) => (
                <BasisStateCard
                  key={value}
                  value={value}
                  selected={
                    selectedCase === value
                  }
                  completed={
                    discoveredCases.has(value)
                  }
                  onClick={() =>
                    exploreCase(value)
                  }
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-6">
                <CNOTCircuit
                  control={selectedControl}
                  target={selectedTarget}
                  resultTarget={selectedOutput[1]}
                />

                <div className="flex items-center justify-center gap-4 mt-5">
                  <span className="text-4xl font-mono font-extrabold text-white">
                    {stateText(
                      selectedControl,
                      selectedTarget
                    )}
                  </span>

                  <ArrowRight className="text-[#4F7CFF]" />

                  <span className="text-4xl font-mono font-extrabold text-[#22D3EE]">
                    {stateText(
                      selectedOutput[0],
                      selectedOutput[1]
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  DISCOVERED
                </p>

                <div className="space-y-2 mt-4 font-mono">
                  {[
                    '00',
                    '01',
                    '10',
                    '11',
                  ].map((value) => {
                    const c =
                      Number(value[0]) as Bit;

                    const t =
                      Number(value[1]) as Bit;

                    const output =
                      applyCNOT(c, t);

                    const revealed =
                      discoveredCases.has(value);

                    return (
                      <div
                        key={value}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          revealed
                            ? 'bg-[#08111F] border-[#4F7CFF]/40'
                            : 'bg-[#08111F]/50 border-[#243B55] opacity-35'
                        }`}
                      >
                        <span>
                          |{value}⟩
                        </span>

                        <ArrowRight className="w-4 h-4 text-[#64748B]" />

                        <span className="text-[#67E8F9]">
                          {revealed
                            ? stateText(
                                output[0],
                                output[1]
                              )
                            : '|??⟩'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {discoveredCases.size === 4 && (
                  <div className="mt-5 p-4 rounded-xl bg-emerald-950/20 border border-emerald-400/30">
                    <p className="font-bold text-emerald-300">
                      Pattern found.
                    </p>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      q0 = 0 → q1 stays the same
                    </p>

                    <p className="text-sm text-white font-bold mt-1">
                      q0 = 1 → q1 flips
                    </p>
                  </div>
                )}
              </div>
            </div>

            {nav}
          </div>
        )}

        {/* ====================================================================
            STEP 4
            ==================================================================== */}

        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-[#22D3EE]">
                CIRCUIT ↔ STATE ↔ CODE
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Watch one experiment in all three languages.
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                Prepare the inputs, then run the circuit. The Qiskit line,
                circuit gate, and qubit state all describe the same event.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55]">
                <p className="text-xs font-mono text-[#94A3B8] mb-3">
                  PREPARE q0
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => {
                        setPrepControl(
                          value as Bit
                        );
                        setStep4Finished(false);
                      }}
                      className={`py-3 rounded-xl border font-mono font-bold ${
                        prepControl === value
                          ? 'bg-[#22D3EE] text-[#08111F] border-[#67E8F9]'
                          : 'bg-[#08111F] text-white border-[#243B55]'
                      }`}
                    >
                      |{value}⟩
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#132238] border border-[#243B55]">
                <p className="text-xs font-mono text-[#94A3B8] mb-3">
                  PREPARE q1
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => {
                        setPrepTarget(
                          value as Bit
                        );
                        setStep4Finished(false);
                      }}
                      className={`py-3 rounded-xl border font-mono font-bold ${
                        prepTarget === value
                          ? 'bg-purple-400 text-[#08111F] border-purple-300'
                          : 'bg-[#08111F] text-white border-[#243B55]'
                      }`}
                    >
                      |{value}⟩
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-5">
                  <CNOTCircuit
                    control={prepControl}
                    target={prepTarget}
                    pulse={step4Pulse}
                    resultTarget={
                      step4Finished
                        ? step4Output[1]
                        : undefined
                    }
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-4">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② STATE
                </p>

                <div className="grid grid-cols-2 mt-2">
                  <BlochSphere
                    value={prepControl}
                    label="q0"
                  />

                  <BlochSphere
                    value={
                      step4Finished
                        ? step4Output[1]
                        : prepTarget
                    }
                    label="q1"
                  />
                </div>

                <div className="text-center font-mono text-sm">
                  <span className="text-white">
                    {stateText(
                      prepControl,
                      prepTarget
                    )}
                  </span>

                  <ArrowRight className="inline mx-3 w-4 h-4 text-[#4F7CFF]" />

                  <span className="text-[#67E8F9] font-bold">
                    {step4Finished
                      ? stateText(
                          step4Output[0],
                          step4Output[1]
                        )
                      : '?'}
                  </span>
                </div>
              </div>

              <CodePanel
                lines={step4Code}
                activeLine={step4ActiveLine}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                disabled={step4Running}
                onClick={runStep4}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />

                {step4Running
                  ? 'RUNNING CIRCUIT...'
                  : 'RUN CIRCUIT'}
              </button>
            </div>

            {step4Finished && (
              <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-emerald-950/20 border border-emerald-400/30 text-center">
                <p className="font-bold text-emerald-300">
                  The picture, state and code all told the same story.
                </p>
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
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-amber-300">
                COMMON BEGINNER TRAP
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Who actually changes?
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-6">
                <CNOTCircuit
                  control={1}
                  target={0}
                />

                <div className="mt-4 p-4 rounded-2xl bg-[#08111F] border border-[#243B55] text-center">
                  <span className="text-2xl font-mono font-bold text-white">
                    |10⟩
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-5 rounded-3xl bg-[#132238] border border-[#243B55]">
                  <p className="font-bold text-white">
                    q0 = 1 and q1 = 0.
                  </p>

                  <p className="text-[#CBD5E1] mt-1">
                    Which qubit changes after CNOT?
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                      ['control', 'q0'],
                      ['target', 'q1'],
                      ['both', 'Both'],
                      ['neither', 'Neither'],
                    ].map(
                      ([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() =>
                            setQuizAnswer(value)
                          }
                          className={`p-3 rounded-xl border font-mono ${
                            quizAnswer === value
                              ? value === 'target'
                                ? 'bg-emerald-950/30 border-emerald-400 text-emerald-300'
                                : 'bg-red-950/30 border-red-400 text-red-300'
                              : 'bg-[#08111F] border-[#243B55] text-white'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {quiz1Correct && (
                  <div className="p-5 rounded-3xl bg-[#132238] border border-[#243B55]">
                    <p className="font-bold text-white">
                      Does CNOT flip the control qubit?
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setQuizSecondAnswer('yes')
                        }
                        className={`p-3 rounded-xl border font-mono ${
                          quizSecondAnswer === 'yes'
                            ? 'bg-red-950/30 border-red-400 text-red-300'
                            : 'bg-[#08111F] border-[#243B55] text-white'
                        }`}
                      >
                        Yes
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuizSecondAnswer('no');
                          unlock(6);
                        }}
                        className={`p-3 rounded-xl border font-mono ${
                          quizSecondAnswer === 'no'
                            ? 'bg-emerald-950/30 border-emerald-400 text-emerald-300'
                            : 'bg-[#08111F] border-[#243B55] text-white'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {quiz1Correct &&
                  quiz2Correct && (
                    <div className="p-5 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/30">
                      <p className="text-lg text-center font-extrabold text-white">
                        The control decides.
                      </p>

                      <p className="text-lg text-center font-extrabold text-[#67E8F9]">
                        The target may change.
                      </p>
                    </div>
                  )}
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
              <span className="text-xs font-mono font-bold text-purple-300">
                NOW THE QUANTUM PART
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                What if the control is not simply 0 or 1?
              </h1>

              <p className="mt-3 text-[#CBD5E1]">
                CNOT was easy to predict for classical-looking basis
                states. Now put q0 into superposition first.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Circuit */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-5">
                  <CNOTCircuit
                    control={
                      quantumStage === 'ready'
                        ? 0
                        : 'plus'
                    }
                    target={0}
                    showH
                    pulse={quantumPulse}
                  />
                </div>
              </div>

              {/* State */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② QUANTUM STATE
                </p>

                {quantumStage !== 'entangled' ? (
                  <div className="grid grid-cols-2 mt-2">
                    <BlochSphere
                      value={
                        quantumStage === 'ready'
                          ? 0
                          : 'plus'
                      }
                      label="q0"
                    />

                    <BlochSphere
                      value={0}
                      label="q1"
                    />
                  </div>
                ) : (
                  <div className="min-h-[265px] flex flex-col items-center justify-center text-center">
                    <div className="relative mb-5">
                      <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />

                      <Sparkles className="relative w-12 h-12 text-purple-300" />
                    </div>

                    <p className="text-xs font-mono font-bold text-[#94A3B8]">
                      JOINT TWO-QUBIT STATE
                    </p>

                    <p className="mt-4 text-2xl sm:text-3xl font-mono font-extrabold text-[#67E8F9]">
                      (|00⟩ + |11⟩) / √2
                    </p>

                    <div className="flex gap-3 mt-5">
                      <span className="px-4 py-2 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 font-mono text-[#67E8F9]">
                        |00⟩
                      </span>

                      <span className="px-4 py-2 rounded-xl bg-purple-950/30 border border-purple-400/30 font-mono text-purple-300">
                        |11⟩
                      </span>
                    </div>

                    <p className="text-xs text-[#94A3B8] mt-5 max-w-sm">
                      Two separate pure-state Bloch arrows are no longer
                      enough to describe the complete system.
                    </p>
                  </div>
                )}
              </div>

              {/* Code */}
              <CodePanel
                lines={[
                  'qc = QuantumCircuit(2)',
                  'qc.h(0)',
                  'qc.cx(0, 1)',
                ]}
                activeLine={
                  quantumStage === 'ready'
                    ? null
                    : quantumStage ===
                      'superposition'
                    ? 1
                    : 2
                }
              />
            </div>

            {quantumStage === 'ready' && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={createSuperposition}
                  className="px-8 py-3.5 rounded-full bg-purple-500 text-white font-extrabold font-mono"
                >
                  APPLY H TO q0
                </button>
              </div>
            )}

            {quantumStage ===
              'superposition' && (
              <div className="space-y-4">
                <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-[#132238] border border-purple-400/30 text-center">
                  <p className="text-[#CBD5E1]">
                    q0 is now in superposition while q1 is still |0⟩.
                  </p>

                  <p className="text-lg font-bold text-white mt-2">
                    So what does CNOT do now?
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={runQuantumCNOT}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#22D3EE] to-purple-500 text-[#08111F] font-extrabold font-mono flex items-center gap-2 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    RUN QUANTUM CNOT
                  </button>
                </div>
              </div>
            )}

            {quantumStage ===
              'entangled' && (
              <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-purple-950/30 to-[#132238] border border-purple-400/40">
                <p className="text-xs font-mono font-bold text-purple-300">
                  SOMETHING NEW HAPPENED
                </p>

                <p className="mt-3 text-xl sm:text-2xl font-extrabold text-white">
                  The complete state is now a joint state of both qubits.
                </p>

                <p className="mt-3 text-[#CBD5E1]">
                  We should not think of this simply as two independent
                  arrows anymore.
                </p>
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
              <span className="text-xs font-mono font-bold text-emerald-300">
                FINAL EXPERIMENT
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Measure the mysterious pair.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                We created the circuit with H followed by CNOT. Now use
                real Qiskit Aer simulation and look for a pattern in the
                measurements.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-5">
                  <CNOTCircuit
                    control="plus"
                    target={0}
                    showH
                    showMeasure
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5 flex flex-col justify-center">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② JOINT STATE
                </p>

                <div className="text-center my-8">
                  <p className="text-2xl sm:text-3xl font-mono font-extrabold text-[#67E8F9]">
                    (|00⟩ + |11⟩) / √2
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-center">
                    <span className="font-mono font-bold text-[#67E8F9]">
                      00
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-400/30 text-center">
                    <span className="font-mono font-bold text-purple-300">
                      11
                    </span>
                  </div>
                </div>
              </div>

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
              {/* controls */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5 space-y-3">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  RUN QISKIT AER
                </p>

                <button
                  type="button"
                  disabled={simulationLoading}
                  onClick={() =>
                    runBellExperiment(1)
                  }
                  className="w-full py-3 rounded-xl bg-[#08111F] border border-[#4F7CFF]/50 text-white font-bold font-mono flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  RUN 1 SHOT
                </button>

                <button
                  type="button"
                  disabled={simulationLoading}
                  onClick={() =>
                    runBellExperiment(100)
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

                {shotsRun !== null && (
                  <div className="p-3 rounded-xl bg-[#08111F] border border-[#243B55]">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      Latest experiment
                    </p>

                    <p className="font-bold text-white mt-1">
                      {shotsRun}{' '}
                      {shotsRun === 1
                        ? 'shot'
                        : 'shots'}
                    </p>
                  </div>
                )}
              </div>

              {/* results */}
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  MEASUREMENT RESULTS
                </p>

                {Object.keys(counts).length ===
                0 ? (
                  <div className="min-h-[220px] mt-4 rounded-2xl bg-[#08111F] border border-dashed border-[#334155] flex items-center justify-center">
                    <p className="text-sm text-[#64748B] text-center px-5">
                      Run the Bell circuit to reveal the measurement
                      pattern.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-5">
                    {['00', '01', '10', '11'].map(
                      (result) => {
                        const value =
                          counts[result] || 0;

                        const maximum =
                          Math.max(
                            1,
                            ...Object.values(
                              counts
                            )
                          );

                        const width =
                          (value / maximum) *
                          100;

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
                )}
              </div>
            </div>

            {ran100Shots && (
              <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#132238] to-purple-950/30 border border-purple-400/40 p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-300" />

                  <span className="text-xs font-mono font-bold text-purple-300">
                    LOOK AT THE PATTERN
                  </span>
                </div>

                <p className="mt-4 text-lg text-[#CBD5E1]">
                  Each individual measurement was uncertain.
                </p>

                <p className="mt-2 text-xl sm:text-2xl font-extrabold text-white">
                  But the two qubits did not behave independently.
                </p>

                <div className="mt-5 p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30 text-center">
                  <p className="font-mono text-[#67E8F9] text-xl font-bold">
                    00 or 11
                  </p>

                  <p className="text-[#94A3B8] text-sm mt-2">
                    Their measurement results are strongly correlated.
                  </p>
                </div>

                <p className="mt-6 text-xl sm:text-2xl font-extrabold text-purple-200 text-center">
                  Why do two separate qubits now behave like one connected
                  quantum system?
                </p>

                <p className="mt-3 text-center text-[#94A3B8] font-mono">
                  That is our next idea.
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