import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  const isLocal =
    origin?.startsWith('http://localhost:') ||
    origin?.startsWith('http://127.0.0.1:');

  const isAllowed =
    !origin ||
    isLocal ||
    allowedOrigins.includes(origin);

  if (!isAllowed) {
    return res.status(403).json({
      error: 'Origin not allowed',
    });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
const PORT = Number(process.env.PORT) || 3000;

  // JSON request body parser
  app.use(express.json({ limit: '2mb' }));

  // =========================================================================
  // QUANTUM API: Check real Python & Qiskit installation status & capabilities
  // =========================================================================
  app.get('/api/quantum/status', async (req, res) => {
    try {
      const pyCode = `
import sys, json

status = {
    'python': sys.version.split()[0],
    'packages': {},
    'capabilities': [],
    'simulationMethods': []
}

try:
    import qiskit
    status['packages']['qiskit'] = qiskit.__version__
    status['capabilities'].append({'name': 'Qiskit Core', 'status': 'ready', 'detail': f'v{qiskit.__version__}'})
except ImportError:
    status['capabilities'].append({'name': 'Qiskit Core', 'status': 'not_installed', 'detail': 'Not available'})

try:
    import qiskit_aer
    status['packages']['qiskit_aer'] = qiskit_aer.__version__
    sim = qiskit_aer.AerSimulator()
    methods = list(sim.available_methods())
    status['simulationMethods'] = methods
    status['capabilities'].append({'name': 'Qiskit Aer', 'status': 'ready', 'detail': f'v{qiskit_aer.__version__} ({len(methods)} methods)'})
    
    from qiskit_aer.noise import NoiseModel
    status['capabilities'].append({'name': 'Noise Simulation', 'status': 'ready', 'detail': 'qiskit_aer.noise ready'})
except Exception as e:
    status['capabilities'].append({'name': 'Qiskit Aer', 'status': 'not_installed', 'detail': 'AerSimulator not ready'})

try:
    import numpy
    status['packages']['numpy'] = numpy.__version__
    status['capabilities'].append({'name': 'NumPy', 'status': 'ready', 'detail': f'v{numpy.__version__}'})
except ImportError:
    pass

try:
    import scipy
    status['packages']['scipy'] = scipy.__version__
    status['capabilities'].append({'name': 'SciPy', 'status': 'ready', 'detail': f'v{scipy.__version__}'})
except ImportError:
    pass

try:
    import matplotlib
    status['packages']['matplotlib'] = matplotlib.__version__
    status['capabilities'].append({'name': 'Matplotlib', 'status': 'ready', 'detail': f'v{matplotlib.__version__} (Agg non-interactive)'})
except ImportError:
    pass

try:
    import qiskit_algorithms
    status['packages']['qiskit_algorithms'] = qiskit_algorithms.__version__
    status['capabilities'].append({'name': 'Qiskit Algorithms', 'status': 'ready', 'detail': f'v{qiskit_algorithms.__version__}'})
except ImportError:
    status['capabilities'].append({'name': 'Qiskit Algorithms', 'status': 'not_installed', 'detail': 'Not installed'})

try:
    from qiskit.quantum_info import Statevector, DensityMatrix
    status['capabilities'].append({'name': 'Statevector & Quantum Info', 'status': 'ready', 'detail': 'Statevector & DensityMatrix ready'})
except ImportError:
    pass

# IBM Hardware integration status (honest detection)
status['capabilities'].append({
    'name': 'IBM Quantum Hardware',
    'status': 'not_connected',
    'detail': 'IBM Quantum hardware integration not configured'
})

print(json.dumps(status))
`;

      const py = spawn('python3', ['-c', pyCode]);
      let stdout = '';
let responded = false;

py.stdout.on('data', (d) => {
  stdout += d.toString();
});

py.on('close', (code) => {
  if (responded) return;
  responded = true;

  if (code === 0 && stdout.trim()) {
    try {
      const parsed = JSON.parse(stdout.trim());

      const qiskitReady =
        !!parsed.packages?.qiskit &&
        !!parsed.packages?.qiskit_aer;

      return res.json({
        status: qiskitReady ? 'ready' : 'offline',
        pythonVersion: parsed.python
          ? `Python ${parsed.python}`
          : 'Unknown',
        qiskitVersion: parsed.packages?.qiskit
          ? `Qiskit ${parsed.packages.qiskit}`
          : 'Unknown',
        aerVersion: parsed.packages?.qiskit_aer
          ? `Qiskit Aer ${parsed.packages.qiskit_aer}`
          : 'Unknown',
        backend: qiskitReady
          ? 'AerSimulator (Local CPU)'
          : 'Unavailable',
        provider: qiskitReady
          ? 'Qiskit Aer'
          : 'Unavailable',
        packages: parsed.packages ?? {},
        capabilities: parsed.capabilities ?? [],
        simulationMethods: parsed.simulationMethods ?? [],
      });
    } catch (error) {
      console.error('Failed to parse quantum status:', error);
    }
  }

  return res.json({
    status: 'offline',
    pythonVersion: 'Unknown',
    qiskitVersion: 'Unknown',
    aerVersion: 'Unknown',
    backend: 'Unavailable',
    provider: 'Unavailable',
    packages: {},
    capabilities: [],
    simulationMethods: [],
  });
});

py.on('error', (error) => {
  if (responded) return;
  responded = true;

  console.error('Quantum status process failed:', error);

  return res.json({
    status: 'offline',
    pythonVersion: 'Unknown',
    qiskitVersion: 'Unknown',
    aerVersion: 'Unknown',
    backend: 'Unavailable',
    provider: 'Unavailable',
    packages: {},
    capabilities: [],
    simulationMethods: [],
  });
});

      py.on('error', () => {
        res.json({
          status: 'offline',
          pythonVersion: 'Unknown',
          qiskitVersion: 'Unknown',
          aerVersion: 'Unknown',
          backend: 'Unavailable',
          provider: 'AerSandboxProvider',
        });
      });
    } catch {
      res.json({ status: 'offline', pythonVersion: 'Unknown', qiskitVersion: 'Unknown', aerVersion: 'Unknown', backend: 'Unavailable' });
    }
  });

  // =========================================================================
  // QUANTUM API: Execute Python + Qiskit Code in Sandboxed Worker
  // =========================================================================
  // =========================================================================
// QUANTUM API: Structured Circuit Simulation
// Used by lessons and interactive visualizations.
// =========================================================================

app.post('/api/quantum/simulate', express.json(), (req, res) => {
  try {
    const {
      numQubits = 1,
      shots = 1024,
      operations = [],
    } = req.body || {};

    // Basic validation
    if (
      !Number.isInteger(numQubits) ||
      numQubits < 1 ||
      numQubits > 10
    ) {
      return res.status(400).json({
        success: false,
        error: 'numQubits must be between 1 and 10.',
      });
    }

    const safeShots = Math.min(
      Math.max(Number(shots) || 1024, 1),
      10000
    );

    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: 'operations must be an array.',
      });
    }

    const payload = JSON.stringify({
      numQubits,
      shots: safeShots,
      operations,
    });

const pythonCode = `
import json
import sys

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

payload = json.loads(sys.stdin.read())

num_qubits = int(payload.get("numQubits", 1))
shots = int(payload.get("shots", 1024))
operations = payload.get("operations", [])

qc = QuantumCircuit(num_qubits, num_qubits)

for operation in operations:
    gate = str(operation.get("gate", "")).lower()
    qubits = operation.get("qubits", [])
    params = operation.get("params", [])

    if gate == "h":
        qc.h(int(qubits[0]))

    elif gate == "x":
        qc.x(int(qubits[0]))

    elif gate == "y":
        qc.y(int(qubits[0]))

    elif gate == "z":
        qc.z(int(qubits[0]))

    elif gate == "s":
        qc.s(int(qubits[0]))

    elif gate == "t":
        qc.t(int(qubits[0]))

    elif gate == "rx":
        qc.rx(float(params[0]), int(qubits[0]))

    elif gate == "ry":
        qc.ry(float(params[0]), int(qubits[0]))

    elif gate == "rz":
        qc.rz(float(params[0]), int(qubits[0]))

    elif gate in ("cx", "cnot"):
        qc.cx(int(qubits[0]), int(qubits[1]))

    elif gate == "cz":
        qc.cz(int(qubits[0]), int(qubits[1]))

    elif gate == "swap":
        qc.swap(int(qubits[0]), int(qubits[1]))

    elif gate == "barrier":
        qc.barrier()

    else:
        raise ValueError("Unsupported gate: " + gate)

qc.measure(range(num_qubits), range(num_qubits))

simulator = AerSimulator()

result = simulator.run(
    qc,
    shots=shots,
    memory=True
).result()

counts = result.get_counts(qc)
memory = result.get_memory(qc)

probabilities = {
    state: count / shots
    for state, count in counts.items()
}

print(json.dumps({
    "success": True,
    "counts": counts,
    "memory": memory,
    "probabilities": probabilities,
    "shots": shots,
    "numQubits": num_qubits,
    "depth": qc.depth(),
    "size": qc.size()
}))
`;

    const py = spawn('python3', ['-c', pythonCode]);

    let stdout = '';
    let stderr = '';
    let responded = false;

    const sendOnce = (
      status: number,
      data: Record<string, unknown>
    ) => {
      if (responded) return;

      responded = true;
      res.status(status).json(data);
    };

    py.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    py.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    py.on('error', (error) => {
      sendOnce(500, {
        success: false,
        error: `Python runtime unavailable: ${error.message}`,
      });
    });

    py.on('close', (code) => {
      if (responded) return;

      if (code !== 0) {
        return sendOnce(500, {
          success: false,
          error: stderr || 'Quantum simulation failed.',
        });
      }

      try {
        const data = JSON.parse(stdout.trim());

        if (!data.success) {
          return sendOnce(400, data);
        }

        return sendOnce(200, data);
      } catch {
        return sendOnce(500, {
          success: false,
          error: 'Invalid response from Qiskit runtime.',
          details: stderr,
        });
      }
    });

    py.stdin.write(payload);
    py.stdin.end();

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Simulation failed.',
    });
  }
});
  app.post('/api/quantum/execute', async (req, res) => {
    if (process.env.ENABLE_CODE_LAB === 'false') {
  return res.status(503).json({
    success: false,
    stderr: 'Code Lab execution is disabled on this public deployment.',
    error: {
      type: 'CodeLabDisabled',
      rawMessage: 'Public arbitrary Python execution is disabled.',
      qubifyExplanation:
        'Qubify public deployment currently uses the controlled quantum simulation API for safe execution.',
      suggestion:
        'Use the interactive lessons and simulator. Code Lab can be enabled in a secured environment.',
    },
  });
}
    const { code, files = [], timeoutMs = 20000 } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        stderr: 'Error: No Python code provided for execution.',
      });
    }

    const runId = `QL-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Package policy enforcement
    if (/^\s*(?:!|%|)\s*pip\s+install/m.test(code) || /pip\s+install/i.test(code)) {
      return res.status(400).json({
        success: false,
        runId,
        stdout: '',
        stderr: 'Package installation is disabled in the Qubify sandbox.',
        executionTimeMs: 0,
        error: {
          type: 'PolicyError',
          rawMessage: 'Package installation is disabled in the Qubify sandbox.',
          qubifyExplanation: 'The Qubify Quantum Code Lab provides a pre-configured scientific environment with Qiskit 2.5, Qiskit Aer, NumPy, SciPy, Matplotlib, and Qiskit Algorithms. Custom package installation is restricted to maintain sandbox security and deterministic execution.',
          suggestion: 'Use the pre-installed packages: qiskit, qiskit_aer, qiskit.quantum_info, qiskit_aer.noise, numpy, scipy, and matplotlib.',
        },
      });
    }

    // 2. Security filter: block dangerous process/network/system calls
    const forbiddenPatterns = [
      /import\s+subprocess\b/,
      /from\s+subprocess\b/,
      /import\s+socket\b/,
      /from\s+socket\b/,
      /import\s+pty\b/,
      /os\.system\s*\(/,
      /os\.popen\s*\(/,
      /os\.spawn/,
      /os\.kill/,
      /__import__\s*\(\s*['"]subprocess['"]\s*\)/,
      /__import__\s*\(\s*['"]socket['"]\s*\)/,
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        return res.status(400).json({
          success: false,
          runId,
          stdout: '',
          stderr: 'Security Policy Violation: Arbitrary subprocess, shell execution, or network operations are prohibited in this quantum sandbox.',
          executionTimeMs: 0,
        });
      }
    }

    const startTime = Date.now();
    let runDir: string | null = null;

    try {
      // Create isolated temporary directory for this run
      runDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'qubify_run_'));

      // Write multi-file workspace files if provided
      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          if (file && typeof file.filename === 'string' && typeof file.code === 'string') {
            const safeName = path.basename(file.filename);
            if (safeName && safeName !== 'runner.py' && !safeName.startsWith('.')) {
              await fs.promises.writeFile(path.join(runDir, safeName), file.code, 'utf-8');
            }
          }
        }
      }

      // Write user's main program
      const userScriptPath = path.join(runDir, 'main.py');
      await fs.promises.writeFile(userScriptPath, code, 'utf-8');

      // Write the scientific execution harness
      const harnessScriptPath = path.join(runDir, '_qubify_harness.py');
      const harnessCode = `
import sys, os, io, json, base64, traceback, resource

# 1. Enforce memory limits (soft 1.5GB, hard 2GB)
try:
    resource.setrlimit(resource.RLIMIT_AS, (1500 * 1024 * 1024, 2000 * 1024 * 1024))
except Exception:
    pass

# 2. Configure non-interactive matplotlib backend
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    # Prevent plt.show() from blocking or failing
    def dummy_show(*args, **kwargs):
        pass
    plt.show = dummy_show
except Exception:
    pass

# 3. Hook Qiskit Result.get_counts to capture all simulation counts
recorded_results = []
try:
    from qiskit.result import Result
    orig_get_counts = Result.get_counts
    def hooked_get_counts(self, *args, **kwargs):
        res = orig_get_counts(self, *args, **kwargs)
        if isinstance(res, dict):
            recorded_results.append({
                'id': f'res_{len(recorded_results) + 1}',
                'label': f'Circuit {len(recorded_results) + 1}',
                'counts': res,
                'totalShots': sum(res.values()) if all(isinstance(v, (int, float)) for v in res.values()) else 0
            })
        elif isinstance(res, list):
            for idx, r in enumerate(res):
                if isinstance(r, dict):
                    recorded_results.append({
                        'id': f'res_{len(recorded_results) + 1}',
                        'label': f'Circuit {len(recorded_results) + 1}',
                        'counts': r,
                        'totalShots': sum(r.values()) if all(isinstance(v, (int, float)) for v in r.values()) else 0
                    })
        return res
    Result.get_counts = hooked_get_counts
except Exception:
    pass

# 4. Insert current directory into path for multi-file imports
sys.path.insert(0, os.path.abspath('.'))

# Capture stdout and stderr
captured_stdout = io.StringIO()
captured_stderr = io.StringIO()
old_stdout = sys.stdout
old_stderr = sys.stderr
sys.stdout = captured_stdout
sys.stderr = captured_stderr

execution_success = True
user_globals = {
    '__name__': '__main__',
    '__file__': os.path.abspath('main.py'),
}

try:
    with open('main.py', 'r', encoding='utf-8') as f:
        user_code = f.read()
    exec(compile(user_code, 'main.py', 'exec'), user_globals)
except MemoryError:
    execution_success = False
    sys.stderr.write("Simulation stopped because the circuit required more memory than the current sandbox allows.\\n")
except Exception as e:
    execution_success = False
    traceback.print_exc()

# Restore stdout and stderr
sys.stdout = old_stdout
sys.stderr = old_stderr

stdout_val = captured_stdout.getvalue()
stderr_val = captured_stderr.getvalue()

# Truncate stdout if very large (512 KB limit)
MAX_STDOUT = 512 * 1024
if len(stdout_val) > MAX_STDOUT:
    stdout_val = stdout_val[:MAX_STDOUT] + "\\n[Output truncated: Exceeded sandbox output limit (512 KB)]"

# Statevector / large output line truncation helper
lines = stdout_val.split('\\n')
if len(lines) > 250:
    truncated_lines = lines[:200]
    truncated_lines.append(f"[Output truncated: showing first 200 of {len(lines)} lines]")
    stdout_val = '\\n'.join(truncated_lines)

# 5. Capture all generated Matplotlib figures (up to 8 figures)
figures = []
try:
    import matplotlib.pyplot as plt
    for fignum in plt.get_fignums()[:8]:
        fig = plt.figure(fignum)
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=120)
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode('utf-8')
        figures.append(f'data:image/png;base64,{b64}')
        plt.close(fig)
except Exception:
    pass

# 6. Introspect QuantumCircuit instances for Circuit Analysis
circuits_info = []
try:
    from qiskit import QuantumCircuit
    entangling_names = {'cx', 'cy', 'cz', 'ch', 'cp', 'crx', 'cry', 'crz', 'swap', 'iswap', 'ccx', 'cswap', 'rxx', 'ryy', 'rzz', 'mcx'}
    for name, val in list(user_globals.items()):
        if isinstance(val, QuantumCircuit) and val.num_qubits > 0:
            ops = dict(val.count_ops())
            entangling_count = sum(ops.get(gate, 0) for gate in entangling_names)
            circuits_info.append({
                'name': name if not name.startswith('_') else 'QuantumCircuit',
                'numQubits': val.num_qubits,
                'numClbits': val.num_clbits,
                'depth': val.depth(),
                'size': val.size(),
                'countOps': ops,
                'numParameters': val.num_parameters,
                'hasMeasurements': bool(val.num_clbits > 0 and any(inst.operation.name in ('measure', 'measure_all') for inst in val.data)),
                'entanglingGateCount': entangling_count
            })
            if len(circuits_info) >= 5:
                break
except Exception:
    pass

# Check peak memory
peak_mem_mb = 0
try:
    peak_mem_mb = round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 1)
except Exception:
    pass

output_payload = {
    'success': execution_success,
    'stdout': stdout_val,
    'stderr': stderr_val,
    'resultSets': recorded_results,
    'figures': figures,
    'circuitAnalysis': circuits_info,
    'peakMemoryMb': peak_mem_mb,
}

with open('_qubify_out.json', 'w', encoding='utf-8') as f:
    json.dump(output_payload, f)
`;

      await fs.promises.writeFile(harnessScriptPath, harnessCode, 'utf-8');

      // Spawn Python process in isolated runDir
      const pythonProcess = spawn('python3', ['_qubify_harness.py'], {
        cwd: runDir,
        timeout: Math.min(timeoutMs, 25000),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONDONTWRITEBYTECODE: '1',
        },
      });

      let procStdout = '';
      let procStderr = '';
      let isTerminated = false;

      pythonProcess.stdout.on('data', (d) => { procStdout += d.toString(); });
      pythonProcess.stderr.on('data', (d) => { procStderr += d.toString(); });

      const timeoutId = setTimeout(() => {
        isTerminated = true;
        pythonProcess.kill('SIGKILL');
      }, timeoutMs);

      pythonProcess.on('close', async (exitCode) => {
        clearTimeout(timeoutId);
        const executionTimeMs = Date.now() - startTime;

        if (isTerminated) {
          if (runDir) {
            try { await fs.promises.rm(runDir, { recursive: true, force: true }); } catch {}
          }
          return res.status(200).json({
            success: false,
            runId,
            stdout: procStdout,
            stderr: `Execution stopped: Time limit exceeded (${timeoutMs / 1000}s). Check for infinite loops or reduce simulation complexity.`,
            executionTimeMs,
          });
        }

        // Read output from _qubify_out.json
        let payload: any = null;
        try {
          const outContent = await fs.promises.readFile(path.join(runDir!, '_qubify_out.json'), 'utf-8');
          payload = JSON.parse(outContent);
        } catch {}

        // Cleanup temporary directory
        if (runDir) {
          try { await fs.promises.rm(runDir, { recursive: true, force: true }); } catch {}
        }

        if (payload) {
          // If Aer or Python gave memory error in stderr
          if (payload.stderr && (
            payload.stderr.includes('Insufficient memory') ||
            payload.stderr.includes('MemoryError') ||
            payload.stderr.includes('std::bad_alloc')
          )) {
            payload.success = false;
            if (!payload.stderr.includes('Simulation stopped because the circuit required more memory')) {
              payload.stderr = 'Simulation stopped because the circuit required more memory than the current sandbox allows.\n' + payload.stderr;
            }
          }

          // Compute primary counts and totalShots from resultSets or fallback
          let primaryCounts: Record<string, number> | undefined = undefined;
          let primaryShots: number | undefined = undefined;

          if (payload.resultSets && payload.resultSets.length > 0) {
            primaryCounts = payload.resultSets[0].counts;
            primaryShots = payload.resultSets[0].totalShots;
          } else {
            // Fallback regex detection on stdout
            const dictRegex = /\{(?:\s*['"][01]+['"]\s*:\s*\d+\s*,?)+\}/g;
            const matches = [...payload.stdout.matchAll(dictRegex)];
            if (matches.length > 0) {
              const detectedResults: any[] = [];
              matches.forEach((m, idx) => {
                try {
                  const parsed = JSON.parse(m[0].replace(/'/g, '"'));
                  const total = Object.values(parsed).reduce((a: any, b: any) => a + b, 0) as number;
                  detectedResults.push({
                    id: `res_${idx + 1}`,
                    label: `Circuit ${idx + 1}`,
                    counts: parsed,
                    totalShots: total,
                  });
                } catch {}
              });
              if (detectedResults.length > 0) {
                payload.resultSets = detectedResults;
                primaryCounts = detectedResults[0].counts;
                primaryShots = detectedResults[0].totalShots;
              }
            }
          }

          return res.status(200).json({
            success: payload.success && exitCode === 0,
            runId,
            stdout: payload.stdout || procStdout,
            stderr: payload.stderr || procStderr,
            executionTimeMs,
            counts: primaryCounts,
            totalShots: primaryShots,
            resultSets: payload.resultSets || [],
            figures: payload.figures || [],
            circuitAnalysis: payload.circuitAnalysis || [],
            peakMemoryMb: payload.peakMemoryMb,
          });
        }

        // Fallback if harness JSON wasn't generated
        return res.status(200).json({
          success: exitCode === 0,
          runId,
          stdout: procStdout,
          stderr: procStderr || (exitCode !== 0 ? 'Execution failed with non-zero exit code.' : ''),
          executionTimeMs,
        });
      });

      pythonProcess.on('error', async (err) => {
        clearTimeout(timeoutId);
        if (runDir) {
          try { await fs.promises.rm(runDir, { recursive: true, force: true }); } catch {}
        }
        return res.status(500).json({
          success: false,
          runId,
          stdout: '',
          stderr: `Failed to spawn Python executor: ${err.message}`,
          executionTimeMs: Date.now() - startTime,
        });
      });
    } catch (err: any) {
      if (runDir) {
        try { await fs.promises.rm(runDir, { recursive: true, force: true }); } catch {}
      }
      return res.status(500).json({
        success: false,
        runId,
        stdout: '',
        stderr: `Server error preparing script: ${err.message}`,
        executionTimeMs: Date.now() - startTime,
      });
    }
  });

  // =========================================================================
  // VITE MIDDLEWARE SETUP
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Qubify Quantum Server running on port ${PORT}`);
  });
}

startServer();
