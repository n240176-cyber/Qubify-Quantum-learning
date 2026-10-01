export interface WorkspaceFile {
  filename: string;
  code: string;
}

export interface QuantumExecutionRequest {
  code: string;
  files?: WorkspaceFile[];
  timeoutMs?: number;
}

export interface CircuitAnalysisInfo {
  name: string;
  numQubits: number;
  numClbits: number;
  depth: number;
  size: number;
  countOps: Record<string, number>;
  numParameters: number;
  hasMeasurements: boolean;
  entanglingGateCount: number;
}

export interface QuantumResultSet {
  id: string;
  label: string;
  counts: Record<string, number>;
  totalShots: number;
  circuitName?: string;
}

export interface QuantumExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  runId?: string;
  counts?: { [bitstring: string]: number };
  totalShots?: number;
  resultSets?: QuantumResultSet[];
  figures?: string[];
  circuitAnalysis?: CircuitAnalysisInfo[];
  circuitDiagram?: string;
  qregCount?: number;
  cregCount?: number;
  gateCount?: number;
  peakMemoryMb?: number;
  error?: {
    type: string;
    rawMessage: string;
    line?: number;
    qubifyExplanation: string;
    suggestion?: string;
    suggestedCodeReplacement?: {
      targetLine: number;
      replacement: string;
    };
  };
}

export interface RuntimeCapabilityItem {
  name: string;
  status: 'ready' | 'not_connected' | 'not_installed';
  detail: string;
}

export interface RuntimeEnvironmentInfo {
  status: 'ready' | 'running' | 'error' | 'offline';
  pythonVersion: string;
  qiskitVersion: string;
  aerVersion: string;
  backend: string;
  provider?: string;
  packages?: {
    python: string;
    qiskit: string;
    qiskit_aer: string;
    numpy: string;
    scipy?: string;
    matplotlib?: string;
    qiskit_algorithms?: string;
    ibm_runtime?: string | null;
  };
  capabilities?: RuntimeCapabilityItem[];
  simulationMethods?: string[];
}

export interface QuantumCodeExample {
  id: string;
  title: string;
  category: 'foundations' | 'intermediate' | 'experiments' | 'advanced';
  description: string;
  filename: string;
  code: string;
}

export interface CodeFileTab {
  id: string;
  filename: string;
  code: string;
  isModified?: boolean;
}

export interface RunHistoryItem {
  id: string;
  runId?: string;
  timestamp: string;
  filename: string;
  success: boolean;
  executionTimeMs: number;
  statusLabel: string;
  codeSnapshot: string;
  stdout: string;
  stderr: string;
  counts?: { [bitstring: string]: number };
  resultSets?: QuantumResultSet[];
  figures?: string[];
  circuitAnalysis?: CircuitAnalysisInfo[];
  error?: QuantumExecutionResult['error'];
}
