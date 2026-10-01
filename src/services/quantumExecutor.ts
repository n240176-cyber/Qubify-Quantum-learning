import {
  QuantumExecutionResult,
  RuntimeEnvironmentInfo,
  WorkspaceFile,
} from '../types/codeLab';

import { parsePythonTraceback } from '../utils/errorDiagnostics';

/*
 * Local development:
 * VITE_API_BASE_URL is empty, so requests go to:
 *   /api/quantum/status
 *   /api/quantum/execute
 *
 * Later on Vercel, we can set:
 * VITE_API_BASE_URL=https://your-render-backend.onrender.com
 */
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/**
 * Execute real Python + Qiskit code using the backend.
 * No fake counts or simulated frontend results.
 */
export async function executeQuantumCode(
  code: string,
  abortSignal?: AbortSignal,
  files?: WorkspaceFile[]
): Promise<QuantumExecutionResult> {
  const startTime = performance.now();

  try {
    const response = await fetch(apiUrl('/api/quantum/execute'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        files,
      }),
      signal: abortSignal,
    });

    const localExecutionTime = Math.round(
      performance.now() - startTime
    );

    if (!response.ok) {
      let errorData: any = {};

      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const stderr =
        errorData.stderr ||
        errorData.error ||
        'Server error during execution.';

      const parsedError = parsePythonTraceback(stderr, code);

      return {
        success: false,
        runId: errorData.runId,
        stdout: errorData.stdout || '',
        stderr,
        executionTimeMs: localExecutionTime,
        error:
          parsedError || {
            type: 'ExecutionError',
            rawMessage: stderr,
            qubifyExplanation:
              'The quantum program could not be executed by the backend.',
            suggestion:
              'Check your code and verify that the Qiskit backend is running.',
          },
      };
    }

    const data = await response.json();

    let errorInfo: QuantumExecutionResult['error'];

    if (!data.success || data.stderr) {
      errorInfo = parsePythonTraceback(
        data.stderr || '',
        code
      );
    }

    return {
      success: Boolean(data.success),
      runId: data.runId,

      stdout: data.stdout || '',
      stderr: data.stderr || '',

      executionTimeMs:
        data.executionTimeMs ?? localExecutionTime,

      counts: data.counts,
      totalShots: data.totalShots,

      resultSets: data.resultSets,
      figures: data.figures,

      circuitAnalysis: data.circuitAnalysis,
      circuitDiagram: data.circuitDiagram,

      qregCount: data.qregCount,
      cregCount: data.cregCount,
      gateCount: data.gateCount,

      peakMemoryMb: data.peakMemoryMb,

      error: errorInfo,
    };
  } catch (err: any) {
    const executionTimeMs = Math.round(
      performance.now() - startTime
    );

    if (err?.name === 'AbortError') {
      return {
        success: false,
        stdout: '',
        stderr: 'Execution cancelled by user.',
        executionTimeMs,
        error: {
          type: 'Cancelled',
          rawMessage: 'Execution was aborted.',
          qubifyExplanation:
            'You stopped the running quantum simulation.',
        },
      };
    }

    const message =
      err?.message || 'Execution backend not reachable.';

    return {
      success: false,
      stdout: '',
      stderr: message,
      executionTimeMs,
      error: {
        type: 'NetworkError',
        rawMessage: message,
        qubifyExplanation:
          'Could not connect to the Python/Qiskit backend.',
        suggestion:
          'Make sure the Qubify backend server is running.',
      },
    };
  }
}

/**
 * Get the actual runtime environment from the backend.
 *
 * Important:
 * Never show fake Python/Qiskit versions if the backend
 * cannot be reached.
 */
export async function fetchRuntimeInfo(): Promise<RuntimeEnvironmentInfo> {
  try {
    const response = await fetch(
      apiUrl('/api/quantum/status')
    );

    if (!response.ok) {
      throw new Error(
        `Runtime status request failed: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    return {
      status:
        data.status === 'ready'
          ? 'ready'
          : 'offline',

      pythonVersion:
        data.pythonVersion || 'Unknown',

      qiskitVersion:
        data.qiskitVersion || 'Unknown',

      aerVersion:
        data.aerVersion || 'Unknown',

      backend:
        data.backend || 'Unavailable',

      provider:
        data.provider || 'Unavailable',

      packages:
        data.packages,

      capabilities:
        data.capabilities,

      simulationMethods:
        data.simulationMethods,
    };
  } catch (error) {
    return {
      status: 'offline',

      pythonVersion: 'Unknown',
      qiskitVersion: 'Unknown',
      aerVersion: 'Unknown',

      backend: 'Unavailable',
      provider: 'Unavailable',

      
      capabilities: [],
      simulationMethods: [],
    };
  }
}