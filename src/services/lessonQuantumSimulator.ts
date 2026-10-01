export type QuantumOperation = {
  gate: string;
  qubits: number[];
  params?: number[];
};

export type LessonSimulationRequest = {
  numQubits: number;
  shots?: number;
  operations: QuantumOperation[];
};

export type LessonSimulationResult = {
  success: boolean;
  counts?: Record<string, number>;
  memory?: string[];
  probabilities?: Record<string, number>;
  shots?: number;
  numQubits?: number;
  depth?: number;
  size?: number;
  error?: string;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function simulateLessonCircuit(
  request: LessonSimulationRequest
): Promise<LessonSimulationResult> {
  try {
    const response = await fetch(
      apiUrl('/api/quantum/simulate'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numQubits: request.numQubits,
          shots: request.shots ?? 1024,
          operations: request.operations,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error:
          data.error ||
          'Quantum simulation failed.',
      };
    }

    return {
      success: true,
      counts: data.counts,
      memory: data.memory,
      probabilities: data.probabilities, 
      shots: data.shots,
      numQubits: data.numQubits,
      depth: data.depth,
      size: data.size,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error?.message ||
        'Could not connect to the quantum backend.',
    };
  }
}