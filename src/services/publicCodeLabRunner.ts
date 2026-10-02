import { simulateLessonCircuit } from './lessonQuantumSimulator';
import type {
  QuantumExecutionResult,
  CircuitAnalysisInfo,
} from '../types/codeLab';

type ParsedOperation = {
  gate: string;
  qubits: number[];
  params?: number[];
};

type ParsedProgram = {
  numQubits: number;
  numClbits: number;
  shots: number;
  operations: ParsedOperation[];
};

function parseAngle(
  expression: string,
  variables: Record<string, number>
): number | null {
  const value = expression.trim();

  if (value in variables) {
    return variables[value];
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  if (value === 'math.pi' || value === 'pi') {
    return Math.PI;
  }

  const division = value.match(
    /^(?:math\.)?pi\s*\/\s*([0-9.]+)$/
  );

  if (division) {
    const divisor = Number(division[1]);
    return divisor !== 0 ? Math.PI / divisor : null;
  }

  const multiplication = value.match(
    /^(?:math\.)?pi\s*\*\s*([0-9.]+)$/
  );

  if (multiplication) {
    return Math.PI * Number(multiplication[1]);
  }

  const reverseMultiplication = value.match(
    /^([0-9.]+)\s*\*\s*(?:math\.)?pi$/
  );

  if (reverseMultiplication) {
    return Number(reverseMultiplication[1]) * Math.PI;
  }

  return null;
}

function parsePublicQiskitCode(code: string): ParsedProgram {
  const lines = code.split('\n');

  let numQubits = 0;
  let numClbits = 0;
  let shots = 1024;

  const operations: ParsedOperation[] = [];
  const variables: Record<string, number> = {};

  const circuitMatch = code.match(
    /QuantumCircuit\s*\(\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)/
  );

  if (!circuitMatch) {
    throw new Error(
      'Create a circuit with QuantumCircuit(number_of_qubits, number_of_classical_bits).'
    );
  }

  numQubits = Number(circuitMatch[1]);
  numClbits = Number(circuitMatch[2] ?? circuitMatch[1]);

  if (
    !Number.isInteger(numQubits) ||
    numQubits < 1 ||
    numQubits > 8
  ) {
    throw new Error(
      'Public demo circuits currently support 1 to 8 qubits.'
    );
  }

  const shotsMatch = code.match(
    /simulator\.run\s*\([^)]*shots\s*=\s*(\d+)/
  );

  if (shotsMatch) {
    shots = Number(shotsMatch[1]);
  }

  shots = Math.min(Math.max(shots, 1), 4096);

  for (const rawLine of lines) {
    const line = rawLine
      .replace(/#.*$/, '')
      .trim();

    if (!line) continue;

    const variableMatch = line.match(
      /^([A-Za-z_]\w*)\s*=\s*(.+)$/
    );

    if (
      variableMatch &&
      !line.includes('QuantumCircuit') &&
      !line.includes('AerSimulator') &&
      !line.includes('simulator.run') &&
      !line.includes('get_counts') &&
      !line.includes('.result()')
    ) {
      const parsed = parseAngle(
        variableMatch[2],
        variables
      );

      if (parsed !== null) {
        variables[variableMatch[1]] = parsed;
      }
    }

    const singleGate = line.match(
      /^qc\.(h|x|y|z|s|t)\s*\(\s*(\d+)\s*\)/
    );

    if (singleGate) {
      operations.push({
        gate: singleGate[1],
        qubits: [Number(singleGate[2])],
      });
      continue;
    }

    const rotationGate = line.match(
      /^qc\.(rx|ry|rz)\s*\(\s*([^,]+)\s*,\s*(\d+)\s*\)/
    );

    if (rotationGate) {
      const angle = parseAngle(
        rotationGate[2],
        variables
      );

      if (angle === null) {
        throw new Error(
          `Unsupported rotation angle: ${rotationGate[2]}`
        );
      }

      operations.push({
        gate: rotationGate[1],
        qubits: [Number(rotationGate[3])],
        params: [angle],
      });
      continue;
    }

    const twoQubitGate = line.match(
      /^qc\.(cx|cnot|cz|swap)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/
    );

    if (twoQubitGate) {
      operations.push({
        gate:
          twoQubitGate[1] === 'cnot'
            ? 'cx'
            : twoQubitGate[1],
        qubits: [
          Number(twoQubitGate[2]),
          Number(twoQubitGate[3]),
        ],
      });
      continue;
    }

    const barrier = line.match(
      /^qc\.barrier\s*\((.*?)\)/
    );

    if (barrier) {
      const qubits = barrier[1].trim()
        ? barrier[1]
            .split(',')
            .map((item) => Number(item.trim()))
        : Array.from(
            { length: numQubits },
            (_, index) => index
          );

      operations.push({
        gate: 'barrier',
        qubits,
      });
    }
  }

  for (const operation of operations) {
    for (const qubit of operation.qubits) {
      if (
        !Number.isInteger(qubit) ||
        qubit < 0 ||
        qubit >= numQubits
      ) {
        throw new Error(
          `Qubit index ${qubit} is outside this ${numQubits}-qubit circuit.`
        );
      }
    }
  }

  return {
    numQubits,
    numClbits,
    shots,
    operations,
  };
}

export async function executePublicQiskitCode(
  code: string
): Promise<QuantumExecutionResult> {
  const startTime = performance.now();

  try {
    if (
      /\b(for|while|def|class|import\s+os|import\s+sys|subprocess|open\s*\(|eval\s*\(|exec\s*\()\b/.test(
        code
      )
    ) {
      throw new Error(
        'This public Code Lab supports circuit-building statements only. General Python execution is disabled for security.'
      );
    }

    const parsed = parsePublicQiskitCode(code);

    if (parsed.operations.length === 0) {
      throw new Error(
        'No supported quantum gates were found in the circuit.'
      );
    }

    const result = await simulateLessonCircuit({
      numQubits: parsed.numQubits,
      shots: parsed.shots,
      operations: parsed.operations,
    });

    const executionTimeMs = Math.round(
      performance.now() - startTime
    );

    if (!result.success || !result.counts) {
      throw new Error(
        result.error || 'Quantum simulation failed.'
      );
    }

    const gateCounts: Record<string, number> = {};

    for (const operation of parsed.operations) {
      gateCounts[operation.gate] =
        (gateCounts[operation.gate] ?? 0) + 1;
    }

    const circuitAnalysis: CircuitAnalysisInfo[] = [
      {
        name: 'qc',
        numQubits: parsed.numQubits,
        numClbits: parsed.numClbits,
        depth: result.depth ?? 0,
        size: result.size ?? parsed.operations.length,
        countOps: gateCounts,
        numParameters: parsed.operations.filter(
          (operation) =>
            operation.params &&
            operation.params.length > 0
        ).length,
        hasMeasurements: true,
        entanglingGateCount:
          parsed.operations.filter((operation) =>
            ['cx', 'cz', 'swap'].includes(
              operation.gate
            )
          ).length,
      },
    ];

    return {
      success: true,
      runId: `PUBLIC-${Date.now()}`,
      stdout:
        `Executed safely with Qiskit Aer\n` +
        `Shots: ${parsed.shots}\n` +
        `Counts: ${JSON.stringify(result.counts)}`,
      stderr: '',
      executionTimeMs,
      counts: result.counts,
      totalShots: parsed.shots,
      resultSets: [
        {
          id: `result-${Date.now()}`,
          label: 'Measurement Results',
          counts: result.counts,
          totalShots: parsed.shots,
          circuitName: 'qc',
        },
      ],
      circuitAnalysis,
      qregCount: parsed.numQubits,
      cregCount: parsed.numClbits,
      gateCount: parsed.operations.length,
    };
  } catch (error: any) {
    const message =
      error?.message ||
      'The public quantum program could not be executed.';

    return {
      success: false,
      stdout: '',
      stderr: message,
      executionTimeMs: Math.round(
        performance.now() - startTime
      ),
      error: {
        type: 'PublicCodeValidationError',
        rawMessage: message,
        qubifyExplanation:
          'The public Code Lab runs a restricted Qiskit circuit language instead of unrestricted Python.',
        suggestion:
          'Use QuantumCircuit with supported gates such as h, x, y, z, s, t, rx, ry, rz, cx, cz, swap, followed by AerSimulator execution.',
      },
    };
  }
}