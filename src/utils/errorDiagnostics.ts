import { QuantumExecutionResult } from '../types/codeLab';

interface ParsedErrorResult {
  type: string;
  rawMessage: string;
  line?: number;
  qubifyExplanation: string;
  suggestion?: string;
  suggestedCodeReplacement?: {
    targetLine: number;
    replacement: string;
  };
}

export function parsePythonTraceback(stderr: string, code: string): ParsedErrorResult | undefined {
  if (!stderr || !stderr.trim()) return undefined;

  const lines = stderr.trim().split('\n');
  const lastLine = lines[lines.length - 1] || '';

  // Extract error type and error message
  const errorMatch = lastLine.match(/^([A-Za-z0-9_]+Error|CircuitError|QiskitError|Exception):\s*(.*)$/);
  const errorType = errorMatch ? errorMatch[1] : (lastLine.split(':')[0] || 'ExecutionError');
  const rawMessage = errorMatch ? errorMatch[2] : lastLine;

  // Find line number in script
  let targetLine: number | undefined;
  for (let i = lines.length - 1; i >= 0; i--) {
    const lineMatch = lines[i].match(/line\s+(\d+)/i);
    if (lineMatch) {
      targetLine = parseInt(lineMatch[1], 10);
      break;
    }
  }

  const codeLines = code.split('\n');
  const problematicCodeLine = (targetLine && targetLine <= codeLines.length) 
    ? codeLines[targetLine - 1] 
    : '';

  // Rule-based high accuracy diagnostic explanations
  let explanation = `An error occurred while executing your Python/Qiskit script: ${errorType}`;
  let suggestion = 'Review the traceback details and verify spelling, indentation, and Qiskit API parameters.';
  let suggestedCodeReplacement: { targetLine: number; replacement: string } | undefined;

  // 1. NameError (e.g. typos in QuantumCircuit, AerSimulator)
  if (errorType === 'NameError') {
    const nameMatch = rawMessage.match(/name '([A-Za-z0-9_]+)' is not defined/);
    const missingName = nameMatch ? nameMatch[1] : '';

    if (missingName === 'QuantumCircut' || missingName.toLowerCase().includes('quantumcirc')) {
      explanation = `Python cannot find '${missingName}'. Did you mean 'QuantumCircuit'? Check spelling carefully.`;
      suggestion = 'Replace with QuantumCircuit and ensure "from qiskit import QuantumCircuit" is imported.';
      if (targetLine && problematicCodeLine.includes(missingName)) {
        suggestedCodeReplacement = {
          targetLine,
          replacement: problematicCodeLine.replace(missingName, 'QuantumCircuit')
        };
      }
    } else if (missingName === 'AerSimulator' || missingName.toLowerCase().includes('aersim')) {
      explanation = `Python cannot find '${missingName}'. Remember to import 'from qiskit_aer import AerSimulator'.`;
      suggestion = 'Import AerSimulator at the top of the file: from qiskit_aer import AerSimulator';
    } else if (missingName === 'qc') {
      explanation = `The variable 'qc' is referenced before assignment. Make sure to define 'qc = QuantumCircuit(qubits, classical_bits)' first.`;
      suggestion = 'Define your circuit instance before calling gate methods: qc = QuantumCircuit(1, 1)';
    } else if (missingName) {
      explanation = `The identifier '${missingName}' has not been defined or imported in this file.`;
      suggestion = `Verify that '${missingName}' is spelled correctly or imported from 'qiskit' / 'qiskit_aer'.`;
    }
  }

  // 1b. AttributeError (e.g. qc.hadamard() instead of qc.h(), qc.cnot instead of qc.cx())
  else if (errorType === 'AttributeError') {
    const attrMatch = rawMessage.match(/'([A-Za-z0-9_]+)' object has no attribute '([A-Za-z0-9_]+)'/);
    const objName = attrMatch ? attrMatch[1] : '';
    const attrName = attrMatch ? attrMatch[2] : '';

    if (objName === 'QuantumCircuit') {
      if (attrName === 'hadamard') {
        explanation = "QuantumCircuit has no method 'hadamard'. In Qiskit, use 'qc.h(qubit)' to apply the Hadamard gate.";
        suggestion = "Replace 'qc.hadamard(...)' with 'qc.h(...)'.";
        if (targetLine && problematicCodeLine.includes('.hadamard(')) {
          suggestedCodeReplacement = {
            targetLine,
            replacement: problematicCodeLine.replace(/\.hadamard\(/g, '.h(')
          };
        }
      } else if (attrName === 'cnot') {
        explanation = "QuantumCircuit has no method 'cnot'. In Qiskit, use 'qc.cx(control, target)' for the Controlled-NOT gate.";
        suggestion = "Replace 'qc.cnot(...)' with 'qc.cx(...)'.";
        if (targetLine && problematicCodeLine.includes('.cnot(')) {
          suggestedCodeReplacement = {
            targetLine,
            replacement: problematicCodeLine.replace(/\.cnot\(/g, '.cx(')
          };
        }
      } else if (attrName === 'pauli_x' || attrName === 'not_gate') {
        explanation = `QuantumCircuit has no method '${attrName}'. In Qiskit, use 'qc.x(qubit)' for the Pauli-X gate.`;
        suggestion = "Replace with 'qc.x(...)'.";
        if (targetLine && problematicCodeLine.includes(`.${attrName}(`)) {
          suggestedCodeReplacement = {
            targetLine,
            replacement: problematicCodeLine.replace(new RegExp(`\\.${attrName}\\(`, 'g'), '.x(')
          };
        }
      } else {
        explanation = `QuantumCircuit has no method or attribute '${attrName}'. Check Qiskit method names: h, x, y, z, cx, cz, rx, ry, rz, measure, measure_all, barrier, draw.`;
        suggestion = `Check the Qiskit QuantumCircuit API documentation or Documentation reference tab for available methods.`;
      }
    } else {
      explanation = `Attribute error: '${objName}' has no attribute '${attrName}'. ${rawMessage}`;
      suggestion = `Verify the object type and consult documentation for supported attributes.`;
    }
  }

  // 2. Qiskit CircuitError (qubit index out of bounds, mismatched classical registers)
  else if (errorType === 'CircuitError' || lastLine.includes('CircuitError')) {
    if (rawMessage.toLowerCase().includes('out of range') || rawMessage.toLowerCase().includes('index')) {
      explanation = `Qubit or classical bit index is out of bounds. ${rawMessage}`;
      suggestion = 'Remember that quantum registers are 0-indexed. For QuantumCircuit(1), only qubit index 0 is valid.';
    } else if (rawMessage.toLowerCase().includes('measurement') || rawMessage.toLowerCase().includes('size')) {
      explanation = `Classical register or qubit register mismatch. ${rawMessage}`;
      suggestion = 'Ensure your QuantumCircuit(num_qubits, num_clbits) has allocated enough classical bits for measurement.';
    } else {
      explanation = `Qiskit encountered a circuit construction constraint: ${rawMessage}`;
      suggestion = 'Verify qubit registers, classical registers, and gate parameters.';
    }
  }

  // 3. SyntaxError / IndentationError
  else if (errorType === 'SyntaxError') {
    explanation = `Python syntax error on line ${targetLine || '?'}. Python could not parse this line.`;
    if (rawMessage.includes('invalid syntax')) {
      suggestion = 'Check for missing colons (:), unclosed parentheses (), unmatched quotes, or stray characters.';
    } else {
      suggestion = `Review line ${targetLine}: ensure all brackets, commas, and parentheses are properly closed.`;
    }
  } else if (errorType === 'IndentationError') {
    explanation = `Indentation error: Python requires consistent spacing at block levels.`;
    suggestion = 'Use consistent 4-space indentation for loops, functions, and conditional blocks.';
  }

  // 4. ModuleNotFoundError / ImportError
  else if (errorType === 'ModuleNotFoundError' || errorType === 'ImportError') {
    const modMatch = rawMessage.match(/No module named '([A-Za-z0-9_]+)'/);
    const modName = modMatch ? modMatch[1] : '';

    if (modName === 'qiskit_aer') {
      explanation = `Cannot import '${modName}'. Ensure you are importing AerSimulator via 'from qiskit_aer import AerSimulator'.`;
      suggestion = 'Use from qiskit_aer import AerSimulator';
    } else if (modName) {
      explanation = `Module '${modName}' is not installed or available in the sandbox.`;
      suggestion = 'Use standard libraries and supported packages: qiskit, qiskit_aer, math, numpy.';
    }
  }

  // 5. TypeError
  else if (errorType === 'TypeError') {
    if (rawMessage.includes('missing') && rawMessage.includes('argument')) {
      explanation = `Missing required arguments in function or gate call. ${rawMessage}`;
      suggestion = 'Check the arguments: e.g. qc.cx(control, target) requires 2 qubits; qc.ry(theta, qubit) requires an angle and qubit index.';
    } else if (rawMessage.includes('unexpected keyword')) {
      explanation = `Unrecognized parameter name in function call. ${rawMessage}`;
      suggestion = 'Check Qiskit API documentation for the correct parameter names.';
    } else {
      explanation = `Type mismatch in operation: ${rawMessage}`;
      suggestion = 'Verify parameter data types (e.g. shots should be an integer, angles should be floats).';
    }
  }

  // MemoryError or Insufficient memory
  else if (
    errorType === 'MemoryError' ||
    rawMessage.includes('Insufficient memory') ||
    rawMessage.includes('std::bad_alloc') ||
    rawMessage.includes('more memory than the current sandbox allows')
  ) {
    explanation = 'Simulation stopped because the circuit required more memory than the current sandbox allows.';
    suggestion = 'The circuit statevector requires more memory than the sandbox allows. Consider reducing the number of qubits or setting AerSimulator(method="matrix_product_state") for large entanglement circuits.';
  }

  // PolicyError (e.g. pip install)
  else if (errorType === 'PolicyError' || rawMessage.includes('Package installation is disabled')) {
    explanation = 'Package installation is disabled in the Qubify sandbox.';
    suggestion = 'Use the pre-installed scientific stack: qiskit, qiskit_aer, qiskit.quantum_info, qiskit_aer.noise, numpy, scipy, and matplotlib.';
  }

  // TranspilerError
  else if (errorType === 'TranspilerError' || rawMessage.includes('TranspilerError')) {
    explanation = `Qiskit transpilation failed: ${rawMessage.split('\n')[0]}`;
    suggestion = 'Check that your target basis gates, coupling map, or optimization level match your circuit layout.';
  }

  // AerError
  else if (errorType === 'AerError' || rawMessage.includes('AerError')) {
    explanation = `Qiskit Aer simulation engine reported an error: ${rawMessage.split('\n')[0]}`;
    suggestion = 'Check your simulation method, noise model channels, or circuit parameters.';
  }

  // 6. IndexError
  else if (errorType === 'IndexError') {
    explanation = `List or register index is out of range.`;
    suggestion = 'Check that your qubit index exists within the circuit allocated dimensions.';
  }

  // 7. Timeout
  else if (rawMessage.toLowerCase().includes('timeout') || rawMessage.toLowerCase().includes('time limit')) {
    explanation = `Execution stopped: The process exceeded the sandbox time limit (20 seconds).`;
    suggestion = 'Check for infinite loops (while True) or reduce the number of simulation shots or circuit depth.';
  }

  return {
    type: errorType,
    rawMessage,
    line: targetLine,
    qubifyExplanation: explanation,
    suggestion,
    suggestedCodeReplacement
  };
}

export function analyzeQuantumCodeHeuristics(code: string): {
  hasImports: boolean;
  hasCircuit: boolean;
  hasMeasurement: boolean;
  hasSimulator: boolean;
  qubitCount?: number;
  clbitCount?: number;
  warnings: string[];
} {
  const warnings: string[] = [];

  const hasImports = /from\s+qiskit\s+import|import\s+qiskit/.test(code);
  const hasCircuit = /QuantumCircuit\s*\(/.test(code);
  const hasMeasurement = /\.measure\(|\.measure_all\(/.test(code);
  const hasSimulator = /AerSimulator|simulator\.run|sim\.run/i.test(code);
  const isStatevectorOrMath = /Statevector|DensityMatrix|Operator|SparsePauliOp|draw\(|transpile\(/i.test(code);

  if (hasCircuit && !hasImports) {
    warnings.push('QuantumCircuit is used, but "from qiskit import QuantumCircuit" was not found.');
  }

  if (hasCircuit && !hasMeasurement && !isStatevectorOrMath) {
    warnings.push('This circuit has no classical measurement. If you want measurement count statistics, call qc.measure() or qc.measure_all().');
  }

  if (hasCircuit && !hasSimulator && !isStatevectorOrMath) {
    warnings.push('Circuit is defined, but no simulator was run. Use "sim = AerSimulator()" and "sim.run(qc)" to execute.');
  }

  // Check shots = 0
  const shotsZeroMatch = code.match(/shots\s*=\s*0\b/);
  if (shotsZeroMatch) {
    warnings.push('Shots is set to 0. Shots must be a positive integer (e.g. shots=1000) to collect statistics.');
  }

  // Detect qubit counts
  let qubitCount: number | undefined;
  let clbitCount: number | undefined;
  const qcInitMatch = code.match(/QuantumCircuit\s*\(\s*(\d+)(?:\s*,\s*(\d+))?\s*\)/);
  if (qcInitMatch) {
    qubitCount = parseInt(qcInitMatch[1], 10);
    if (qcInitMatch[2]) {
      clbitCount = parseInt(qcInitMatch[2], 10);
    }
  }

  return {
    hasImports,
    hasCircuit,
    hasMeasurement,
    hasSimulator,
    qubitCount,
    clbitCount,
    warnings
  };
}
