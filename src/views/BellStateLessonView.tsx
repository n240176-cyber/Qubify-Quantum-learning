import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Eye,
  Play,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';

import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import {
  simulateLessonCircuit,
  type QuantumOperation,
} from '../services/lessonQuantumSimulator';

interface BellStateLessonViewProps {
  onExit: () => void;
  onComplete: () => void;
}

type BellName =
  | 'phi-plus'
  | 'phi-minus'
  | 'psi-plus'
  | 'psi-minus';

type BellFamily = 'phi' | 'psi';
type BellSign = 'plus' | 'minus';
type Relation = 'same' | 'opposite';

type BuilderGate =
  | 'h0'
  | 'cx'
  | 'x1'
  | 'z0';

const TOTAL_STEPS = 7;

/* ============================================================================
   BELL STATE DATA
   ============================================================================ */

const BELL_STATES: Record<
  BellName,
  {
    symbol: string;
    formula: string;
    family: BellFamily;
    sign: BellSign;
    zRelation: Relation;
    xRelation: Relation;
  }
> = {
  'phi-plus': {
    symbol: '|Φ+⟩',
    formula: '(|00⟩ + |11⟩) / √2',
    family: 'phi',
    sign: 'plus',
    zRelation: 'same',
    xRelation: 'same',
  },

  'phi-minus': {
    symbol: '|Φ−⟩',
    formula: '(|00⟩ − |11⟩) / √2',
    family: 'phi',
    sign: 'minus',
    zRelation: 'same',
    xRelation: 'opposite',
  },

  'psi-plus': {
    symbol: '|Ψ+⟩',
    formula: '(|01⟩ + |10⟩) / √2',
    family: 'psi',
    sign: 'plus',
    zRelation: 'opposite',
    xRelation: 'same',
  },

  'psi-minus': {
    symbol: '|Ψ−⟩',
    formula: '(|01⟩ − |10⟩) / √2',
    family: 'psi',
    sign: 'minus',
    zRelation: 'opposite',
    xRelation: 'opposite',
  },
};

const ALL_BELL_STATES: BellName[] = [
  'phi-plus',
  'phi-minus',
  'psi-plus',
  'psi-minus',
];

/* ============================================================================
   QUANTUM HELPERS
   ============================================================================ */

const buildBellOperations = (
  bell: BellName,
  measureInX = false
): QuantumOperation[] => {
  const info = BELL_STATES[bell];

  const operations: QuantumOperation[] = [
    {
      gate: 'h',
      qubits: [0],
    },
    {
      gate: 'cx',
      qubits: [0, 1],
    },
  ];

  /*
   * Start from |Φ+>.
   *
   * X on q1:
   * Φ family → Ψ family
   *
   * Z on q0:
   * + phase → − phase
   */
  if (info.family === 'psi') {
    operations.push({
      gate: 'x',
      qubits: [1],
    });
  }

  if (info.sign === 'minus') {
    operations.push({
      gate: 'z',
      qubits: [0],
    });
  }

  /*
   * To inspect X-basis correlations,
   * rotate both qubits with H before the
   * simulator performs normal Z measurement.
   */
  if (measureInX) {
    operations.push(
      {
        gate: 'h',
        qubits: [0],
      },
      {
        gate: 'h',
        qubits: [1],
      }
    );
  }

  return operations;
};

const bellCodeLines = (
  bell: BellName,
  includeMeasurement = false,
  xBasis = false
): string[] => {
  const info = BELL_STATES[bell];

  const lines = [
    'qc = QuantumCircuit(2)',
    'qc.h(0)',
    'qc.cx(0, 1)',
  ];

  if (info.family === 'psi') {
    lines.push('qc.x(1)');
  }

  if (info.sign === 'minus') {
    lines.push('qc.z(0)');
  }

  if (xBasis) {
    lines.push(
      '# measure in the X basis',
      'qc.h(0)',
      'qc.h(1)'
    );
  }

  if (includeMeasurement) {
    lines.push('qc.measure_all()');
  }

  return lines;
};

/* ============================================================================
   REUSABLE CODE PANEL
   ============================================================================ */

const CodePanel: React.FC<{
  lines: string[];
  activeLine?: number | null;
}> = ({
  lines,
  activeLine = null,
}) => {
  return (
    <div className="h-full rounded-2xl bg-[#07101D] border border-[#243B55] overflow-hidden">
      <div className="px-4 py-3 bg-[#0D1B2A] border-b border-[#243B55] flex items-center gap-2">
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
   BELL STATE VISUAL
   ============================================================================ */

const BellStateCard: React.FC<{
  bell: BellName;
  compact?: boolean;
}> = ({
  bell,
  compact = false,
}) => {
  const info = BELL_STATES[bell];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/35 to-[#132238] border border-purple-400/40 p-5">
      <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl" />

      <p className="relative text-xs font-mono font-bold text-purple-300">
        JOINT TWO-QUBIT STATE
      </p>

      <p
        className={`relative mt-4 font-serif font-bold text-[#67E8F9] ${
          compact
            ? 'text-3xl'
            : 'text-4xl sm:text-5xl'
        }`}
      >
        {info.symbol}
      </p>

      <p
        className={`relative mt-4 font-mono font-extrabold text-white ${
          compact
            ? 'text-lg'
            : 'text-xl sm:text-2xl'
        }`}
      >
        {info.formula}
      </p>

      <div className="relative grid grid-cols-2 gap-3 mt-5">
        <div className="p-3 rounded-xl bg-[#08111F] border border-[#22D3EE]/20">
          <p className="text-[10px] font-mono text-[#94A3B8]">
            FAMILY
          </p>

          <p className="mt-1 font-bold text-[#67E8F9]">
            {info.family === 'phi'
              ? 'Φ — same Z outcomes'
              : 'Ψ — opposite Z outcomes'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#08111F] border border-purple-400/20">
          <p className="text-[10px] font-mono text-[#94A3B8]">
            RELATIVE PHASE
          </p>

          <p className="mt-1 font-bold text-purple-300">
            {info.sign === 'plus'
              ? '+ phase'
              : '− phase'}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   BELL CIRCUIT VISUAL
   ============================================================================ */

const BellCircuit: React.FC<{
  bell: BellName;
  showMeasure?: boolean;
  xBasis?: boolean;
  pulse?: boolean;
}> = ({
  bell,
  showMeasure = false,
  xBasis = false,
  pulse = false,
}) => {
  const info = BELL_STATES[bell];

  const showX =
    info.family === 'psi';

  const showZ =
    info.sign === 'minus';

  return (
    <div className="w-full font-mono space-y-8">
      {/* q0 */}
      <div className="grid grid-cols-[38px_38px_1fr_42px] items-center gap-2">
        <span className="text-xs font-bold text-[#94A3B8]">
          q0
        </span>

        <span className="font-bold text-[#22D3EE]">
          |0⟩
        </span>

        <div className="relative h-14">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#4F7CFF]/50" />

          {/* H */}
          <div className="absolute left-[12%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-purple-950 border border-purple-400/50 text-purple-300 flex items-center justify-center font-extrabold z-10">
            H
          </div>

          {/* CNOT control */}
          <div
            className={`absolute left-[38%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 z-20 transition-all ${
              pulse
                ? 'bg-[#22D3EE] border-[#67E8F9] scale-125 shadow-lg shadow-[#22D3EE]/60'
                : 'bg-[#4F7CFF] border-[#93C5FD]'
            }`}
          />

          <div
            className={`absolute left-[38%] top-1/2 w-0.5 h-[98px] z-10 transition-all ${
              pulse
                ? 'bg-[#22D3EE]'
                : 'bg-[#4F7CFF]/70'
            }`}
          />

          {/* Z modifier */}
          {showZ && (
            <div className="absolute left-[59%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#132238] border border-amber-400/50 text-amber-300 flex items-center justify-center font-extrabold z-10">
              Z
            </div>
          )}

          {/* X-basis rotation */}
          {xBasis && (
            <div className="absolute left-[80%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#132238] border border-[#22D3EE]/50 text-[#67E8F9] flex items-center justify-center font-extrabold z-10">
              H
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

      {/* q1 */}
      <div className="grid grid-cols-[38px_38px_1fr_42px] items-center gap-2">
        <span className="text-xs font-bold text-[#94A3B8]">
          q1
        </span>

        <span className="font-bold text-purple-300">
          |0⟩
        </span>

        <div className="relative h-14">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#4F7CFF]/50" />

          {/* CNOT target */}
          <div
            className={`absolute left-[38%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 bg-[#0D1B2A] flex items-center justify-center z-20 transition-all ${
              pulse
                ? 'border-[#22D3EE] shadow-lg shadow-[#22D3EE]/40'
                : 'border-[#4F7CFF]'
            }`}
          >
            <span className="text-2xl font-light text-[#67E8F9]">
              +
            </span>
          </div>

          {/* X modifier */}
          {showX && (
            <div className="absolute left-[59%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#132238] border border-[#22D3EE]/50 text-[#67E8F9] flex items-center justify-center font-extrabold z-10">
              X
            </div>
          )}

          {/* X-basis rotation */}
          {xBasis && (
            <div className="absolute left-[80%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#132238] border border-[#22D3EE]/50 text-[#67E8F9] flex items-center justify-center font-extrabold z-10">
              H
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
    </div>
  );
};

/* ============================================================================
   COUNTS
   ============================================================================ */

const CountsHistogram: React.FC<{
  counts: Record<string, number>;
}> = ({ counts }) => {
  if (Object.keys(counts).length === 0) {
    return (
      <div className="min-h-[210px] rounded-2xl bg-[#08111F] border border-dashed border-[#334155] flex items-center justify-center">
        <p className="text-sm text-[#64748B] text-center px-5">
          Run the real simulator to reveal the measurement pattern.
        </p>
      </div>
    );
  }

  const maximum = Math.max(
    1,
    ...Object.values(counts)
  );

  return (
    <div className="space-y-3">
      {[
        '00',
        '01',
        '10',
        '11',
      ].map((result) => {
        const value =
          counts[result] || 0;

        const width =
          (value / maximum) * 100;

        return (
          <div
            key={result}
            className="grid grid-cols-[45px_1fr_45px] gap-3 items-center"
          >
            <span className="font-mono font-bold text-[#67E8F9]">
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

            <span className="font-mono text-right text-white">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================================
   MAIN LESSON
   ============================================================================ */

export const BellStateLessonView: React.FC<
  BellStateLessonViewProps
> = ({
  onExit,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] =
    useState(1);

  const [
    maxUnlockedStep,
    setMaxUnlockedStep,
  ] = useState(1);

  /* --------------------------------------------------------------------------
     STEP 1
     -------------------------------------------------------------------------- */

  const [nameRevealed, setNameRevealed] =
    useState(false);

  /* --------------------------------------------------------------------------
     STEP 2
     -------------------------------------------------------------------------- */

  const [
    selectedBell,
    setSelectedBell,
  ] = useState<BellName>('phi-plus');

  const [
    exploredBellStates,
    setExploredBellStates,
  ] = useState<Set<BellName>>(
    new Set()
  );

  /* --------------------------------------------------------------------------
     STEP 3
     -------------------------------------------------------------------------- */

  const [
    transformBell,
    setTransformBell,
  ] = useState<BellName>('phi-plus');

  const [usedXTransform, setUsedXTransform] =
    useState(false);

  const [usedZTransform, setUsedZTransform] =
    useState(false);

  const [transformPulse, setTransformPulse] =
    useState(false);

  /* --------------------------------------------------------------------------
     STEP 4
     -------------------------------------------------------------------------- */

  const [
    zExperimentBell,
    setZExperimentBell,
  ] = useState<BellName>('phi-plus');

  const [
    zCounts,
    setZCounts,
  ] = useState<Record<string, number>>({});

  const [zLoading, setZLoading] =
    useState(false);

  const [zError, setZError] =
    useState('');

  const [
    zFamiliesSeen,
    setZFamiliesSeen,
  ] = useState<Set<BellFamily>>(
    new Set()
  );

  /* --------------------------------------------------------------------------
     STEP 5
     -------------------------------------------------------------------------- */

  const [
    xExperimentBell,
    setXExperimentBell,
  ] = useState<BellName>('phi-plus');

  const [
    xCounts,
    setXCounts,
  ] = useState<Record<string, number>>({});

  const [xLoading, setXLoading] =
    useState(false);

  const [xError, setXError] =
    useState('');

  const [
    xSignsSeen,
    setXSignsSeen,
  ] = useState<Set<BellSign>>(
    new Set()
  );

  /* --------------------------------------------------------------------------
     STEP 6
     -------------------------------------------------------------------------- */

  const decoderCases: Array<{
    z: Relation;
    x: Relation;
    answer: BellName;
  }> = [
    {
      z: 'same',
      x: 'same',
      answer: 'phi-plus',
    },
    {
      z: 'same',
      x: 'opposite',
      answer: 'phi-minus',
    },
    {
      z: 'opposite',
      x: 'same',
      answer: 'psi-plus',
    },
    {
      z: 'opposite',
      x: 'opposite',
      answer: 'psi-minus',
    },
  ];

  const [
    decoderIndex,
    setDecoderIndex,
  ] = useState(0);

  const [
    decoderAnswer,
    setDecoderAnswer,
  ] = useState<BellName | null>(
    null
  );

  const [
    decoderFeedback,
    setDecoderFeedback,
  ] = useState<
    'correct' | 'wrong' | null
  >(null);

  const [
    decoderCompleted,
    setDecoderCompleted,
  ] = useState(0);

  /* --------------------------------------------------------------------------
     STEP 7
     -------------------------------------------------------------------------- */

  const [
    builderGates,
    setBuilderGates,
  ] = useState<BuilderGate[]>([]);

  /* ==========================================================================
     NAV HELPERS
     ========================================================================== */

  const unlock = (step: number) => {
    setMaxUnlockedStep((prev) =>
      Math.max(
        prev,
        Math.min(
          step,
          TOTAL_STEPS
        )
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

  const exploreBellState = (
    bell: BellName
  ) => {
    setSelectedBell(bell);

    setExploredBellStates((prev) => {
      const next =
        new Set(prev);

      next.add(bell);

      if (next.size === 4) {
        unlock(3);
      }

      return next;
    });
  };

  /* ==========================================================================
     STEP 3
     ========================================================================== */

  const toggleFamily = () => {
    const info =
      BELL_STATES[transformBell];

    const nextBell: BellName =
      info.family === 'phi'
        ? info.sign === 'plus'
          ? 'psi-plus'
          : 'psi-minus'
        : info.sign === 'plus'
        ? 'phi-plus'
        : 'phi-minus';

    setTransformPulse(true);

    setTimeout(() => {
      setTransformBell(nextBell);
      setTransformPulse(false);
      setUsedXTransform(true);
    }, 450);
  };

  const toggleSign = () => {
    const info =
      BELL_STATES[transformBell];

    const nextBell: BellName =
      info.sign === 'plus'
        ? info.family === 'phi'
          ? 'phi-minus'
          : 'psi-minus'
        : info.family === 'phi'
        ? 'phi-plus'
        : 'psi-plus';

    setTransformPulse(true);

    setTimeout(() => {
      setTransformBell(nextBell);
      setTransformPulse(false);
      setUsedZTransform(true);
    }, 450);
  };

  /* ==========================================================================
     STEP 4
     ========================================================================== */

  const runZExperiment = async () => {
    if (zLoading) return;

    setZLoading(true);
    setZError('');
    setZCounts({});

    const result =
      await simulateLessonCircuit({
        numQubits: 2,
        shots: 100,
        operations:
          buildBellOperations(
            zExperimentBell
          ),
      });

    if (!result.success) {
      setZError(
        result.error ||
          'Could not run the Bell-state experiment.'
      );

      setZLoading(false);
      return;
    }

    setZCounts(
      result.counts || {}
    );

    setZLoading(false);

    const family =
      BELL_STATES[
        zExperimentBell
      ].family;

    setZFamiliesSeen((prev) => {
      const next =
        new Set(prev);

      next.add(family);

      if (
        next.has('phi') &&
        next.has('psi')
      ) {
        unlock(5);
      }

      return next;
    });
  };

  /* ==========================================================================
     STEP 5
     ========================================================================== */

  const runXExperiment = async () => {
    if (xLoading) return;

    setXLoading(true);
    setXError('');
    setXCounts({});

    const result =
      await simulateLessonCircuit({
        numQubits: 2,
        shots: 100,
        operations:
          buildBellOperations(
            xExperimentBell,
            true
          ),
      });

    if (!result.success) {
      setXError(
        result.error ||
          'Could not run the X-basis experiment.'
      );

      setXLoading(false);
      return;
    }

    setXCounts(
      result.counts || {}
    );

    setXLoading(false);

    const sign =
      BELL_STATES[
        xExperimentBell
      ].sign;

    setXSignsSeen((prev) => {
      const next =
        new Set(prev);

      next.add(sign);

      if (
        next.has('plus') &&
        next.has('minus')
      ) {
        unlock(6);
      }

      return next;
    });
  };

  /* ==========================================================================
     STEP 6
     ========================================================================== */

  const currentDecoderCase =
    decoderCases[
      Math.min(
        decoderIndex,
        decoderCases.length - 1
      )
    ];

  const answerDecoder = (
    bell: BellName
  ) => {
    setDecoderAnswer(bell);

    if (
      bell ===
      currentDecoderCase.answer
    ) {
      setDecoderFeedback('correct');
    } else {
      setDecoderFeedback('wrong');
    }
  };

  const advanceDecoder = () => {
    if (
      decoderFeedback !== 'correct'
    ) {
      return;
    }

    const completed =
      decoderCompleted + 1;

    setDecoderCompleted(completed);

    if (
      decoderIndex ===
      decoderCases.length - 1
    ) {
      unlock(7);
      return;
    }

    setDecoderIndex(
      (prev) => prev + 1
    );

    setDecoderAnswer(null);
    setDecoderFeedback(null);
  };

  /* ==========================================================================
     STEP 7 BUILDER
     ========================================================================== */

  const addBuilderGate = (
    gate: BuilderGate
  ) => {
    if (
      builderGates.length >= 4
    ) {
      return;
    }

    setBuilderGates((prev) => [
      ...prev,
      gate,
    ]);
  };

  const builderBaseCorrect =
    builderGates.length >= 2 &&
    builderGates[0] === 'h0' &&
    builderGates[1] === 'cx';

  const builderModifiers =
    builderGates.slice(2);

  const builderCorrect =
    builderGates.length === 4 &&
    builderBaseCorrect &&
    builderModifiers.includes(
      'x1'
    ) &&
    builderModifiers.includes(
      'z0'
    );

  const builderBell: BellName =
    builderBaseCorrect
      ? builderModifiers.includes(
          'x1'
        )
        ? builderModifiers.includes(
            'z0'
          )
          ? 'psi-minus'
          : 'psi-plus'
        : builderModifiers.includes(
            'z0'
          )
        ? 'phi-minus'
        : 'phi-plus'
      : 'phi-plus';

  const builderCode = useMemo(() => {
    const lines = [
      'qc = QuantumCircuit(2)',
    ];

    builderGates.forEach(
      (gate) => {
        if (gate === 'h0') {
          lines.push(
            'qc.h(0)'
          );
        }

        if (gate === 'cx') {
          lines.push(
            'qc.cx(0, 1)'
          );
        }

        if (gate === 'x1') {
          lines.push(
            'qc.x(1)'
          );
        }

        if (gate === 'z0') {
          lines.push(
            'qc.z(0)'
          );
        }
      }
    );

    return lines;
  }, [builderGates]);

  /* ==========================================================================
     CONTINUE RULES
     ========================================================================== */

  const canContinue = (() => {
    switch (currentStep) {
      case 1:
        return nameRevealed;

      case 2:
        return (
          exploredBellStates.size ===
          4
        );

      case 3:
        return (
          usedXTransform &&
          usedZTransform
        );

      case 4:
        return (
          zFamiliesSeen.has('phi') &&
          zFamiliesSeen.has('psi')
        );

      case 5:
        return (
          xSignsSeen.has('plus') &&
          xSignsSeen.has('minus')
        );

      case 6:
        return (
          decoderCompleted >= 4
        );

      case 7:
        return builderCorrect;

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
      finalStepLabel="FINISH & VIEW MASTERY CHALLENGE"
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
                CONTINUING FROM ENTANGLEMENT
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
                The entangled state you built has a name.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl leading-relaxed">
                You started with |00⟩, applied H to q0, then connected the
                qubits with CNOT.
              </p>

              <p className="mt-2 text-[#67E8F9] font-bold text-lg">
                The result was:
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-6">
                  <BellCircuit
                    bell="phi-plus"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5 flex flex-col justify-center text-center">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② JOINT STATE
                </p>

                <p className="mt-6 text-2xl sm:text-3xl font-mono font-extrabold text-[#67E8F9]">
                  (|00⟩ + |11⟩) / √2
                </p>

                {!nameRevealed ? (
                  <div className="mt-6">
                    <p className="text-sm text-[#94A3B8]">
                      You already understand the state.
                    </p>

                    <p className="text-white font-bold mt-2">
                      Now reveal its standard name.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      BELL STATE
                    </p>

                    <p className="mt-2 text-5xl font-serif font-bold text-purple-200">
                      |Φ+⟩
                    </p>
                  </div>
                )}
              </div>

              <CodePanel
                lines={[
                  'qc = QuantumCircuit(2)',
                  'qc.h(0)',
                  'qc.cx(0, 1)',
                ]}
              />
            </div>

            {!nameRevealed ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setNameRevealed(true);
                    unlock(2);
                  }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#22D3EE] to-purple-500 text-[#08111F] font-extrabold font-mono flex items-center gap-2 shadow-lg"
                >
                  <Eye className="w-5 h-5" />
                  REVEAL ITS NAME
                </button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-purple-950/25 border border-purple-400/30">
                <p className="text-xl font-extrabold text-white">
                  |Φ+⟩ is one of the four standard Bell states.
                </p>

                <p className="text-[#CBD5E1] mt-3 leading-relaxed">
                  Each Bell state is a maximally entangled two-qubit state.
                  They have similar structure, but different correlations
                  and relative phases.
                </p>

                <p className="text-[#67E8F9] font-bold mt-4">
                  So what are the other three?
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
                THE BELL FAMILY
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Four states. Two simple labels.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                Do not memorize four long formulas independently. Look for
                the pattern in the names.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {ALL_BELL_STATES.map(
                (bell) => {
                  const info =
                    BELL_STATES[bell];

                  const selected =
                    selectedBell === bell;

                  const explored =
                    exploredBellStates.has(
                      bell
                    );

                  return (
                    <button
                      type="button"
                      key={bell}
                      onClick={() =>
                        exploreBellState(
                          bell
                        )
                      }
                      className={`relative p-5 rounded-2xl border transition-all ${
                        selected
                          ? 'bg-purple-950/35 border-purple-400 scale-[1.02]'
                          : explored
                          ? 'bg-emerald-950/15 border-emerald-400/30'
                          : 'bg-[#132238] border-[#243B55] hover:border-[#4F7CFF]'
                      }`}
                    >
                      {explored && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-300" />
                      )}

                      <p className="text-3xl font-serif font-bold text-[#67E8F9]">
                        {info.symbol}
                      </p>

                      <p className="mt-3 text-xs font-mono text-[#CBD5E1]">
                        {info.formula}
                      </p>
                    </button>
                  );
                }
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
              <BellStateCard
                bell={selectedBell}
              />

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-6">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  READ THE NAME
                </p>

                <div className="mt-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-[#08111F] border border-[#22D3EE]/30">
                    <p className="font-serif text-3xl font-bold text-[#67E8F9]">
                      Φ or Ψ
                    </p>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      Tells us which pair of computational-basis outcomes
                      appear.
                    </p>

                    <div className="mt-3 font-mono text-sm space-y-1">
                      <p className="text-white">
                        Φ → 00 and 11
                      </p>

                      <p className="text-white">
                        Ψ → 01 and 10
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#08111F] border border-purple-400/30">
                    <p className="text-3xl font-bold text-purple-300">
                      + or −
                    </p>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      Tells us the relative phase between the two components.
                    </p>

                    <p className="text-sm text-purple-200 mt-3">
                      The sign matters even when ordinary 0/1 measurement
                      cannot see it directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {exploredBellStates.size ===
              4 && (
              <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-emerald-950/20 border border-emerald-400/30">
                <p className="text-center font-bold text-emerald-300">
                  You do not need four separate memorization rules.
                </p>

                <p className="text-center text-[#CBD5E1] mt-2">
                  Think: family Φ/Ψ + phase sign +/−.
                </p>
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
              <span className="text-xs font-mono font-bold text-amber-300">
                TRANSFORM THE BELL STATE
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                X changes the family. Z changes the phase.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                Start from the Bell state you already know: |Φ+⟩.
                Then use familiar single-qubit gates to move around the
                Bell family.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-6">
                  <BellCircuit
                    bell={transformBell}
                    pulse={transformPulse}
                  />
                </div>
              </div>

              <BellStateCard
                bell={transformBell}
                compact
              />

              <CodePanel
                lines={bellCodeLines(
                  transformBell
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={toggleFamily}
                className="p-5 rounded-2xl bg-[#132238] border border-[#22D3EE]/40 hover:border-[#22D3EE] transition-all text-left"
              >
                <p className="text-xs font-mono font-bold text-[#67E8F9]">
                  APPLY X TO q1
                </p>

                <p className="text-xl font-extrabold text-white mt-2">
                  Φ ↔ Ψ
                </p>

                <p className="text-sm text-[#CBD5E1] mt-2">
                  Change which computational-basis pair appears.
                </p>
              </button>

              <button
                type="button"
                onClick={toggleSign}
                className="p-5 rounded-2xl bg-[#132238] border border-amber-400/40 hover:border-amber-400 transition-all text-left"
              >
                <p className="text-xs font-mono font-bold text-amber-300">
                  APPLY Z TO q0
                </p>

                <p className="text-xl font-extrabold text-white mt-2">
                  + ↔ −
                </p>

                <p className="text-sm text-[#CBD5E1] mt-2">
                  Change the relative phase sign.
                </p>
              </button>
            </div>

            {usedXTransform &&
              usedZTransform && (
                <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30">
                  <p className="text-xs font-mono text-[#94A3B8]">
                    EXPLAIN IT SIMPLY
                  </p>

                  <p className="mt-2 text-lg font-bold text-white">
                    “X changes Φ ↔ Ψ. Z changes + ↔ −.”
                  </p>

                  <p className="text-sm text-[#CBD5E1] mt-2">
                    This gives you a compact mental map of all four Bell states.
                  </p>
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
                READ THE Φ / Ψ LABEL
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Z-basis measurement reveals the Bell family.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                You already know Z-basis measurement means asking
                “0 or 1?”. Now use it like a detective.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {ALL_BELL_STATES.map(
                (bell) => (
                  <button
                    type="button"
                    key={bell}
                    onClick={() => {
                      setZExperimentBell(
                        bell
                      );
                      setZCounts({});
                    }}
                    className={`p-3 rounded-xl border font-serif font-bold text-xl ${
                      zExperimentBell ===
                      bell
                        ? 'bg-[#22D3EE] text-[#08111F] border-[#67E8F9]'
                        : 'bg-[#132238] text-white border-[#243B55]'
                    }`}
                  >
                    {
                      BELL_STATES[
                        bell
                      ].symbol
                    }
                  </button>
                )
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  CIRCUIT
                </p>

                <div className="mt-6">
                  <BellCircuit
                    bell={zExperimentBell}
                    showMeasure
                  />
                </div>
              </div>

              <BellStateCard
                bell={zExperimentBell}
                compact
              />

              <CodePanel
                lines={bellCodeLines(
                  zExperimentBell,
                  true
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono text-[#94A3B8]">
                  Z-BASIS QUESTION
                </p>

                <p className="text-2xl font-extrabold text-[#67E8F9] mt-2">
                  0 or 1?
                </p>

                <button
                  type="button"
                  disabled={zLoading}
                  onClick={runZExperiment}
                  className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />

                  {zLoading
                    ? 'SIMULATING...'
                    : 'RUN 100 SHOTS'}
                </button>

                {zError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-400/30 text-red-300 text-xs">
                    {zError}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8] mb-4">
                  RESULTS
                </p>

                <CountsHistogram
                  counts={zCounts}
                />
              </div>
            </div>

            {zFamiliesSeen.has('phi') &&
              zFamiliesSeen.has('psi') && (
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/30">
                    <p className="font-serif text-3xl font-bold text-[#67E8F9]">
                      Φ
                    </p>

                    <p className="mt-2 font-bold text-white">
                      Same Z-basis outcomes
                    </p>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      00 or 11
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-950/25 border border-purple-400/30">
                    <p className="font-serif text-3xl font-bold text-purple-300">
                      Ψ
                    </p>

                    <p className="mt-2 font-bold text-white">
                      Opposite Z-basis outcomes
                    </p>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      01 or 10
                    </p>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[#08111F] border border-[#243B55]">
                    <p className="text-center text-[#CBD5E1]">
                      Notice something important:
                      <strong className="text-white">
                        {' '}Z measurement distinguishes Φ from Ψ,
                      </strong>
                      {' '}but it cannot distinguish + from −.
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
            <div className="max-w-4xl">
              <span className="text-xs font-mono font-bold text-purple-300">
                READ THE + / − LABEL
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                The X basis reveals the phase relationship.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                In the previous Entanglement lesson you learned that
                X-basis measurement asks “+ or −?”. We use H before
                measurement to ask that question with Qiskit.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {ALL_BELL_STATES.map(
                (bell) => (
                  <button
                    type="button"
                    key={bell}
                    onClick={() => {
                      setXExperimentBell(
                        bell
                      );
                      setXCounts({});
                    }}
                    className={`p-3 rounded-xl border font-serif font-bold text-xl ${
                      xExperimentBell ===
                      bell
                        ? 'bg-purple-400 text-[#08111F] border-purple-300'
                        : 'bg-[#132238] text-white border-[#243B55]'
                    }`}
                  >
                    {
                      BELL_STATES[
                        bell
                      ].symbol
                    }
                  </button>
                )
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  X-BASIS CIRCUIT
                </p>

                <p className="text-xs text-[#94A3B8] mt-1">
                  Extra H gates rotate the +/− question into normal measurement.
                </p>

                <div className="mt-6">
                  <BellCircuit
                    bell={xExperimentBell}
                    showMeasure
                    xBasis
                  />
                </div>
              </div>

              <BellStateCard
                bell={xExperimentBell}
                compact
              />

              <CodePanel
                lines={bellCodeLines(
                  xExperimentBell,
                  true,
                  true
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono text-[#94A3B8]">
                  X-BASIS QUESTION
                </p>

                <p className="text-2xl font-extrabold text-purple-300 mt-2">
                  + or −?
                </p>

                <button
                  type="button"
                  disabled={xLoading}
                  onClick={runXExperiment}
                  className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-400 to-[#4F7CFF] text-[#08111F] font-extrabold font-mono flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />

                  {xLoading
                    ? 'SIMULATING...'
                    : 'RUN 100 SHOTS'}
                </button>

                {xError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-400/30 text-red-300 text-xs">
                    {xError}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#94A3B8] mb-4">
                  RESULTS
                </p>

                <CountsHistogram
                  counts={xCounts}
                />

                {Object.keys(xCounts)
                  .length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-[#08111F] border border-[#243B55] text-xs text-[#CBD5E1]">
                    In this rotated measurement,
                    00 means ++, 11 means −−,
                    while 01 and 10 represent opposite X-basis outcomes.
                  </div>
                )}
              </div>
            </div>

            {xSignsSeen.has('plus') &&
              xSignsSeen.has('minus') && (
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-purple-950/25 border border-purple-400/30">
                    <p className="text-3xl font-bold text-purple-300">
                      +
                    </p>

                    <p className="mt-2 font-bold text-white">
                      Same X-basis outcomes
                    </p>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      ++ or −−
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-400/30">
                    <p className="text-3xl font-bold text-amber-300">
                      −
                    </p>

                    <p className="mt-2 font-bold text-white">
                      Opposite X-basis outcomes
                    </p>

                    <p className="text-sm text-[#CBD5E1] mt-2">
                      +− or −+
                    </p>
                  </div>

                  <div className="sm:col-span-2 p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      NOW YOU CAN READ THE WHOLE NAME
                    </p>

                    <p className="mt-3 text-lg font-bold text-white">
                      Φ / Ψ tells you the Z-basis relationship.
                    </p>

                    <p className="mt-1 text-lg font-bold text-purple-200">
                      + / − tells you the X-basis relationship.
                    </p>
                  </div>
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
                BELL-STATE DETECTIVE
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Can you identify the state from its correlations?
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                No formulas are shown. Use what you learned about the two
                measurement questions.
              </p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-bold text-[#94A3B8]">
                    CLUE {Math.min(
                      decoderIndex + 1,
                      4
                    )} OF 4
                  </p>

                  <span className="text-xs font-mono text-emerald-300">
                    {decoderCompleted}/4 solved
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-5 rounded-2xl bg-[#08111F] border border-[#22D3EE]/30">
                    <p className="text-xs font-mono text-[#67E8F9]">
                      Z-BASIS RESULTS
                    </p>

                    <p className="text-2xl font-extrabold text-white mt-2">
                      {currentDecoderCase.z ===
                      'same'
                        ? 'SAME'
                        : 'OPPOSITE'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#08111F] border border-purple-400/30">
                    <p className="text-xs font-mono text-purple-300">
                      X-BASIS RESULTS
                    </p>

                    <p className="text-2xl font-extrabold text-white mt-2">
                      {currentDecoderCase.x ===
                      'same'
                        ? 'SAME'
                        : 'OPPOSITE'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                  <p className="text-sm text-[#CBD5E1]">
                    Remember:
                  </p>

                  <p className="text-sm text-white mt-1">
                    Z tells Φ/Ψ.
                  </p>

                  <p className="text-sm text-white">
                    X tells +/−.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-6">
                <p className="text-xs font-mono font-bold text-[#94A3B8]">
                  WHICH BELL STATE?
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  {ALL_BELL_STATES.map(
                    (bell) => {
                      const selected =
                        decoderAnswer === bell;

                      const correct =
                        bell ===
                        currentDecoderCase.answer;

                      return (
                        <button
                          type="button"
                          key={bell}
                          onClick={() =>
                            answerDecoder(
                              bell
                            )
                          }
                          className={`p-4 rounded-2xl border transition-all ${
                            selected
                              ? correct
                                ? 'bg-emerald-950/30 border-emerald-400'
                                : 'bg-red-950/30 border-red-400'
                              : 'bg-[#08111F] border-[#243B55] hover:border-[#4F7CFF]'
                          }`}
                        >
                          <span className="text-3xl font-serif font-bold text-[#67E8F9]">
                            {
                              BELL_STATES[
                                bell
                              ].symbol
                            }
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                {decoderFeedback ===
                  'wrong' && (
                  <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-400/30">
                    <p className="text-sm text-red-200">
                      Not quite. First use the Z clue to decide Φ or Ψ.
                      Then use the X clue to decide + or −.
                    </p>
                  </div>
                )}

                {decoderFeedback ===
                  'correct' && (
                  <div className="mt-4 space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-400/30">
                      <p className="font-bold text-emerald-300">
                        Correct.
                      </p>

                      <p className="text-sm text-[#CBD5E1] mt-1">
                        You decoded the Bell-state name from measurement
                        behavior instead of memorizing a formula.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={advanceDecoder}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#4F7CFF] text-[#08111F] font-extrabold font-mono"
                    >
                      {decoderIndex === 3
                        ? 'COMPLETE DETECTIVE CHALLENGE'
                        : 'NEXT CLUE'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {decoderCompleted >= 4 && (
              <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-emerald-950/20 border border-emerald-400/30">
                <p className="text-xl text-center font-extrabold text-emerald-300">
                  You can now identify all four Bell states from their
                  correlations.
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
              <span className="text-xs font-mono font-bold text-[#22D3EE]">
                FINAL BUILD
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Build |Ψ−⟩ from |00⟩.
              </h1>

              <p className="mt-3 text-[#CBD5E1] max-w-3xl">
                This is your final circuit-building task for the core
                quantum path.
              </p>

              <p className="mt-2 text-[#67E8F9] font-bold">
                Create entanglement first. Then change both the family and
                the phase.
              </p>
            </div>

            <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-mono font-bold text-[#94A3B8]">
                    GATE TRAY
                  </p>

                  <p className="text-sm text-[#CBD5E1] mt-1">
                    Correct recipe: create |Φ+⟩ first, then transform it.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setBuilderGates([])
                  }
                  className="px-4 py-2 rounded-xl bg-[#08111F] border border-[#243B55] text-[#94A3B8] text-xs font-mono flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESET
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <button
                  type="button"
                  disabled={
                    builderGates.length >= 4
                  }
                  onClick={() =>
                    addBuilderGate('h0')
                  }
                  className="py-3 rounded-xl bg-purple-950/30 border border-purple-400/40 text-purple-300 font-bold font-mono disabled:opacity-40"
                >
                  H ON q0
                </button>

                <button
                  type="button"
                  disabled={
                    builderGates.length >= 4
                  }
                  onClick={() =>
                    addBuilderGate('cx')
                  }
                  className="py-3 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/40 text-[#67E8F9] font-bold font-mono disabled:opacity-40"
                >
                  CNOT
                </button>

                <button
                  type="button"
                  disabled={
                    builderGates.length >= 4
                  }
                  onClick={() =>
                    addBuilderGate('x1')
                  }
                  className="py-3 rounded-xl bg-[#08111F] border border-[#4F7CFF]/40 text-white font-bold font-mono disabled:opacity-40"
                >
                  X ON q1
                </button>

                <button
                  type="button"
                  disabled={
                    builderGates.length >= 4
                  }
                  onClick={() =>
                    addBuilderGate('z0')
                  }
                  className="py-3 rounded-xl bg-amber-950/20 border border-amber-400/40 text-amber-300 font-bold font-mono disabled:opacity-40"
                >
                  Z ON q0
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {builderGates.length ===
                0 ? (
                  <span className="text-xs font-mono text-[#64748B]">
                    Choose your first gate.
                  </span>
                ) : (
                  builderGates.map(
                    (gate, index) => (
                      <span
                        key={`${gate}-${index}`}
                        className="px-3 py-1.5 rounded-full bg-[#08111F] border border-[#243B55] text-xs font-mono text-white"
                      >
                        {index + 1}.{' '}
                        {gate === 'h0'
                          ? 'H(q0)'
                          : gate === 'cx'
                          ? 'CNOT'
                          : gate === 'x1'
                          ? 'X(q1)'
                          : 'Z(q0)'}
                      </span>
                    )
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-[#22D3EE]">
                  ① CIRCUIT
                </p>

                <div className="mt-6">
                  {builderBaseCorrect ? (
                    <BellCircuit
                      bell={builderBell}
                    />
                  ) : (
                    <div className="min-h-[190px] flex items-center justify-center rounded-2xl bg-[#08111F] border border-dashed border-[#334155]">
                      <p className="text-center text-sm text-[#64748B] px-5">
                        First create the Bell-pair foundation with
                        H(q0) followed by CNOT.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-[#132238] border border-[#243B55] p-5">
                <p className="text-xs font-mono font-bold text-purple-300">
                  ② STATE
                </p>

                {!builderBaseCorrect ? (
                  <div className="min-h-[210px] flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      STARTING STATE
                    </p>

                    <p className="text-5xl font-mono font-extrabold text-white mt-4">
                      |00⟩
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <BellStateCard
                      bell={builderBell}
                      compact
                    />
                  </div>
                )}
              </div>

              <CodePanel
                lines={builderCode}
                activeLine={
                  builderCode.length - 1
                }
              />
            </div>

            {builderGates.length >= 2 &&
              !builderBaseCorrect && (
                <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-amber-950/20 border border-amber-400/30">
                  <p className="text-center text-amber-200">
                    Build the entanglement foundation first:
                    H on q0 → CNOT.
                  </p>
                </div>
              )}

            {builderBaseCorrect &&
              !builderCorrect && (
                <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30">
                  <p className="text-xs font-mono text-[#94A3B8]">
                    CURRENT THINKING
                  </p>

                  <p className="mt-2 text-white font-bold">
                    You have created {
                      BELL_STATES[
                        builderBell
                      ].symbol
                    }.
                  </p>

                  <p className="text-sm text-[#CBD5E1] mt-2">
                    Target = |Ψ−⟩. Ask yourself:
                    do I still need to change Φ/Ψ, +/−, or both?
                  </p>
                </div>
              )}

            {builderCorrect && (
              <div className="space-y-5">
                <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-emerald-950/20 border border-emerald-400/40">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />

                    <p className="text-xl font-extrabold text-emerald-300">
                      You built |Ψ−⟩.
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                      <p className="text-xs font-mono text-purple-300">
                        H + CNOT
                      </p>

                      <p className="text-white font-bold mt-1">
                        create |Φ+⟩
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                      <p className="text-xs font-mono text-[#67E8F9]">
                        X
                      </p>

                      <p className="text-white font-bold mt-1">
                        Φ → Ψ
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                      <p className="text-xs font-mono text-amber-300">
                        Z
                      </p>

                      <p className="text-white font-bold mt-1">
                        + → −
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-w-5xl mx-auto p-7 rounded-3xl bg-gradient-to-br from-purple-950/35 to-[#132238] border border-purple-400/40">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-300" />

                    <span className="text-xs font-mono font-bold text-purple-300">
                      YOUR CORE QUANTUM CIRCUIT JOURNEY
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">
                    You can now explain the Bell states instead of just
                    memorizing them.
                  </h2>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-[#08111F] border border-[#22D3EE]/20">
                      <p className="text-[#67E8F9] font-bold">
                        Φ / Ψ
                      </p>

                      <p className="text-sm text-[#CBD5E1] mt-1">
                        tells the Z-basis relationship.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08111F] border border-purple-400/20">
                      <p className="text-purple-300 font-bold">
                        + / −
                      </p>

                      <p className="text-sm text-[#CBD5E1] mt-1">
                        tells the relative phase and X-basis relationship.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                      <p className="text-white font-bold">
                        H + CNOT
                      </p>

                      <p className="text-sm text-[#CBD5E1] mt-1">
                        creates the familiar |Φ+⟩ Bell pair.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08111F] border border-[#243B55]">
                      <p className="text-white font-bold">
                        X and Z
                      </p>

                      <p className="text-sm text-[#CBD5E1] mt-1">
                        move you through the Bell family.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl bg-[#08111F] border border-[#4F7CFF]/30">
                    <p className="text-xs font-mono text-[#94A3B8]">
                      SAY IT TO SOMEONE ELSE
                    </p>

                    <p className="mt-2 text-lg font-bold text-white leading-relaxed">
                      “Bell states are four standard maximally entangled
                      two-qubit states. Φ or Ψ tells me which computational
                      outcomes are correlated, while + or − tells me the
                      relative phase. I can create |Φ+⟩ with H and CNOT,
                      then use X and Z to reach the others.”
                    </p>
                  </div>

                  <div className="mt-6 text-center">
                    <Target className="w-8 h-8 text-[#67E8F9] mx-auto" />

                    <p className="mt-3 text-xl font-extrabold text-[#67E8F9]">
                      Ready to test the whole journey?
                    </p>

                    <p className="mt-2 text-[#CBD5E1]">
                      Your Quantum Mastery Challenge is waiting on the
                      learning path.
                    </p>
                  </div>
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