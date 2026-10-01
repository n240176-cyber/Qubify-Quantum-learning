import { QuantumCodeExample } from '../types/codeLab';

export const STARTER_CODE = `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)

qc.h(0)
qc.measure(0, 0)

simulator = AerSimulator()

result = simulator.run(qc, shots=1000).result()

counts = result.get_counts()

print(counts)
`;

export const CODE_EXAMPLES_LIBRARY: QuantumCodeExample[] = [
  // Foundations
  {
    id: 'ex-1-single-qubit-0',
    title: '1. Single Qubit |0⟩ Ground State',
    category: 'foundations',
    filename: 'single_qubit_zero.py',
    description: 'Prepare a qubit in the default |0⟩ state and measure it 1000 times.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Qubits initialize in |0> by default
qc = QuantumCircuit(1, 1)
qc.measure(0, 0)

simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts()

print("Measurement outcomes for |0>:")
print(counts)
`
  },
  {
    id: 'ex-2-x-gate',
    title: '2. Pauli-X (Bit Flip) Gate',
    category: 'foundations',
    filename: 'x_gate_flip.py',
    description: 'Apply the Pauli-X gate to flip |0⟩ into deterministic |1⟩.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)

# Apply Pauli-X: flips |0> -> |1>
qc.x(0)
qc.measure(0, 0)

simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts()

print("Measurement outcomes after X gate (|1>):")
print(counts)
`
  },
  {
    id: 'ex-3-h-gate',
    title: '3. Hadamard (Superposition) Gate',
    category: 'foundations',
    filename: 'hadamard_superposition.py',
    description: 'Create an equal superposition state (|+⟩ = (|0⟩ + |1⟩)/√2).',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)

# Apply Hadamard: creates 50/50 superposition
qc.h(0)
qc.measure(0, 0)

simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts()

print("Superposition measurement counts:")
print(counts)
`
  },
  {
    id: 'ex-4-measurement',
    title: '4. Measurement & State Collapse',
    category: 'foundations',
    filename: 'measurement_collapse.py',
    description: 'Understand how measuring collapses quantum state to classical bits.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)
qc.h(0)

# Explicit measurement maps qubit 0 to classical bit 0
qc.measure(0, 0)

# Visual text circuit diagram print
print("Circuit diagram:")
print(qc.draw(output="text"))

simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
print("\\nMeasured Counts:")
print(result.get_counts())
`
  },
  {
    id: 'ex-5-multiple-shots',
    title: '5. Multiple Shots Experiment',
    category: 'foundations',
    filename: 'shots_comparison.py',
    description: 'Observe how statistical variance changes between 100, 1000, and 5000 shots.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)

simulator = AerSimulator()

for test_shots in [100, 1000, 4000]:
    res = simulator.run(qc, shots=test_shots).result()
    c = res.get_counts()
    p0 = c.get('0', 0) / test_shots
    p1 = c.get('1', 0) / test_shots
    print(f"Shots: {test_shots:4d} -> Counts: {c} (Prob '0': {p0:.3f}, '1': {p1:.3f})")
`
  },

  // Intermediate
  {
    id: 'ex-6-xyz-gates',
    title: '6. Pauli X, Y, Z Gates Exploration',
    category: 'intermediate',
    filename: 'pauli_rotations.py',
    description: 'Apply X, Y, and Z gates and observe their algebraic effects on Bloch vectors.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)

# X flips state, Z adds a phase flip to |1>, Y flips with phase
qc.x(0)
qc.z(0)  # flips phase: -|1>
qc.measure(0, 0)

simulator = AerSimulator()
counts = simulator.run(qc, shots=1000).result().get_counts()
print("Counts after X + Z:")
print(counts)
`
  },
  {
    id: 'ex-7-rotation-gates',
    title: '7. Continuous Rotations: Rx, Ry, Rz',
    category: 'intermediate',
    filename: 'rotation_gates.py',
    description: 'Rotate state vector by arbitrary angles (e.g. π/3, π/2).',
    code: `import math
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)

# Rotate around Y-axis by 60 degrees (pi/3)
theta = math.pi / 3
qc.ry(theta, 0)
qc.measure(0, 0)

simulator = AerSimulator()
counts = simulator.run(qc, shots=2000).result().get_counts()

print(f"Counts for Ry(pi/3): {counts}")
expected_p0 = (math.cos(theta / 2)) ** 2
print(f"Theoretical Prob(|0>): {expected_p0:.3f}")
`
  },
  {
    id: 'ex-8-two-qubit',
    title: '8. Two-Qubit Independent System',
    category: 'intermediate',
    filename: 'two_qubits.py',
    description: 'Construct a 2-qubit register with product state (|01⟩, |10⟩, |11⟩).',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# 2 quantum bits, 2 classical bits
qc = QuantumCircuit(2, 2)

qc.h(0)     # q[0] in superposition
qc.x(1)     # q[1] flipped to |1>

qc.measure([0, 1], [0, 1])

simulator = AerSimulator()
counts = simulator.run(qc, shots=1000).result().get_counts()

print("2-Qubit Counts (Qiskit orders bits [q1, q0]):")
print(counts)
`
  },
  {
    id: 'ex-9-cnot',
    title: '9. CNOT (Controlled-NOT) Gate',
    category: 'intermediate',
    filename: 'cnot_gate.py',
    description: 'Controlled NOT flips target qubit if and only if control qubit is |1⟩.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)

# Set control q[0] = 1, target q[1] = 0
qc.x(0)
# CNOT: control=0, target=1
qc.cx(0, 1)

qc.measure([0, 1], [0, 1])

simulator = AerSimulator()
counts = simulator.run(qc, shots=1000).result().get_counts()

print("CNOT with control=|1> yields |11>:")
print(counts)
`
  },
  {
    id: 'ex-10-bell-state',
    title: '10. Bell State Entanglement (|Φ+⟩)',
    category: 'intermediate',
    filename: 'bell_state_phi_plus.py',
    description: 'Generate maximally entangled Bell pair: (|00⟩ + |11⟩)/√2.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create 2-qubit maximally entangled Bell state
qc = QuantumCircuit(2, 2)

qc.h(0)        # Put qubit 0 into superposition
qc.cx(0, 1)    # Entangle qubit 0 with qubit 1

qc.measure([0, 1], [0, 1])

print("Bell Circuit:")
print(qc.draw(output="text"))

simulator = AerSimulator()
counts = simulator.run(qc, shots=1000).result().get_counts()

print("\\nMeasurement Results (|00> and |11> strictly correlated):")
print(counts)
`
  },

  // Experiments
  {
    id: 'ex-11-random-bit',
    title: '11. True Quantum Random Bit Generator',
    category: 'experiments',
    filename: 'quantum_rng.py',
    description: 'Generate true quantum random integers using measurement collapse.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

def generate_quantum_bits(num_bits=8):
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.measure(0, 0)
    
    sim = AerSimulator()
    raw_res = sim.run(qc, shots=num_bits, memory=True).result()
    # memory=True yields the list of individual shot outcomes
    bits = raw_res.get_memory()
    bitstring = "".join(bits)
    decimal_val = int(bitstring, 2)
    return bitstring, decimal_val

bitstr, dec = generate_quantum_bits(8)
print(f"Generated 8-bit quantum random string: {bitstr}")
print(f"Decimal equivalent: {dec}")
`
  },
  {
    id: 'ex-12-measurement-stats',
    title: '12. Measurement Statistics & Error Limits',
    category: 'experiments',
    filename: 'measurement_statistics.py',
    description: 'Analyze sample mean and standard error of quantum measurements.',
    code: `import math
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)

simulator = AerSimulator()
shots = 5000
counts = simulator.run(qc, shots=shots).result().get_counts()

n0 = counts.get('0', 0)
n1 = counts.get('1', 0)
p0 = n0 / shots
p1 = n1 / shots

# Standard error of binomial proportion
std_error = math.sqrt(0.5 * 0.5 / shots)

print(f"Total Shots: {shots}")
print(f"|0> count: {n0} ({p0*100:.2f}%)")
print(f"|1> count: {n1} ({p1*100:.2f}%)")
print(f"Expected Standard Error: +/- {std_error*100:.2f}%")
`
  },
  {
    id: 'ex-13-compare-shots',
    title: '13. Compare Shot Counts Accuracy',
    category: 'experiments',
    filename: 'compare_shots.py',
    description: 'Evaluate convergence towards theoretical quantum limits as shots increase.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)

sim = AerSimulator()
shot_levels = [50, 200, 1000, 5000]

print("Convergence to 50% as shot count scales:")
print("------------------------------------------")
for s in shot_levels:
    c = sim.run(qc, shots=s).result().get_counts()
    ratio_0 = (c.get('0', 0) / s) * 100
    delta = abs(50.0 - ratio_0)
    print(f"Shots: {s:5d} | |0>: {ratio_0:5.1f}% | Deviation from ideal: {delta:4.1f}%")
`
  },
  {
    id: 'ex-14-simple-entanglement',
    title: '14. Entanglement Verification (|Ψ+⟩)',
    category: 'experiments',
    filename: 'bell_psi_plus.py',
    description: 'Construct Bell state (|01⟩ + |10⟩)/√2 and verify zero probability for |00⟩ and |11⟩.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)

# Prepare |1> on q1, then H on q0, then CNOT
qc.x(1)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

simulator = AerSimulator()
counts = simulator.run(qc, shots=1000).result().get_counts()

print("Bell State (|01> + |10>):")
print(counts)
print("Notice that 00 and 11 never occur in this entangled state.")
`
  },

  // Advanced
  {
    id: 'ex-15-parameterized-circuit',
    title: '15. Parameterized Circuit with Qiskit Circuit Parameter',
    category: 'advanced',
    filename: 'parameterized_circuit.py',
    description: 'Use Qiskit Parameter to define dynamic circuit templates.',
    code: `import math
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit_aer import AerSimulator

theta = Parameter('θ')
qc = QuantumCircuit(1, 1)
qc.rx(theta, 0)
qc.measure(0, 0)

sim = AerSimulator()

# Bind parameter at runtime
bound_qc = qc.assign_parameters({theta: math.pi / 2})

print("Parameterized circuit with bound θ = π/2:")
print(bound_qc.draw(output="text"))

res = sim.run(bound_qc, shots=1000).result()
print("\\nResults:")
print(res.get_counts())
`
  },
  {
    id: 'ex-16-ghz-state',
    title: '16. 3-Qubit Greenberger–Horne–Zeilinger (GHZ) State',
    category: 'advanced',
    filename: 'ghz_state.py',
    description: 'Tripartite entanglement: (|000⟩ + |111⟩)/√2 across 3 qubits.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# 3 qubits, 3 classical bits
qc = QuantumCircuit(3, 3)

qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)

qc.measure([0, 1, 2], [0, 1, 2])

print("3-Qubit GHZ Circuit:")
print(qc.draw(output="text"))

simulator = AerSimulator()
counts = simulator.run(qc, shots=1500).result().get_counts()

print("\\nGHZ Entangled Counts:")
print(counts)
`
  },
  {
    id: 'ex-17-noise-model-comparison',
    title: '17. Aer Noise Model: Ideal vs Noisy Simulation',
    category: 'experiments',
    filename: 'noise_model_comparison.py',
    description: 'Construct a depolarizing noise model and simulate ideal vs noisy Bell state execution side-by-side.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

# Build 2-qubit Bell circuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

# 1. Ideal Simulation
ideal_sim = AerSimulator()
ideal_counts = ideal_sim.run(qc, shots=1000).result().get_counts()
print("Ideal Simulator (No Noise):")
print(ideal_counts)

# 2. Build Depolarizing Noise Model
noise_model = NoiseModel()
error_1q = depolarizing_error(0.02, 1) # 2% 1-qubit gate error
error_2q = depolarizing_error(0.08, 2) # 8% 2-qubit CX gate error

noise_model.add_all_qubit_quantum_error(error_1q, ['h'])
noise_model.add_all_qubit_quantum_error(error_2q, ['cx'])

# 3. Noisy Simulation
noisy_sim = AerSimulator(noise_model=noise_model)
noisy_counts = noisy_sim.run(qc, shots=1000).result().get_counts()

print("\\nNoisy Simulator (8% CX Error):")
print(noisy_counts)
`
  },
  {
    id: 'ex-18-statevector-analysis',
    title: '18. Statevector Evolution & Exact Probabilities',
    category: 'advanced',
    filename: 'statevector_analysis.py',
    description: 'Inspect exact complex statevector amplitudes, norm, and analytical measurement probabilities.',
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Prepare an entangled circuit without measurement
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.rz(np.pi / 4, 1)

# Analytical Statevector calculation
sv = Statevector(qc)

print("Circuit:")
print(qc.draw('text'))

print("\\nComplex Statevector Amplitudes:")
for idx, amp in enumerate(sv.data):
    bitstring = format(idx, '02b')
    mag = np.abs(amp)
    phase = np.angle(amp)
    print(f"|{bitstring}>: {amp.real:+.4f} {amp.imag:+.4f}j  (magnitude: {mag:.4f}, phase: {phase:+.3f} rad)")

print("\\nExact Analytical Probabilities:")
probs = sv.probabilities_dict()
for state, p in probs.items():
    print(f"P(|{state}>) = {p:.4f}")
`
  },
  {
    id: 'ex-19-density-matrix-purity',
    title: '19. Density Matrix & Partial Trace / Purity',
    category: 'advanced',
    filename: 'density_matrix_purity.py',
    description: 'Compute full density matrix, trace out subsystem qubit, and verify mixed-state entropy.',
    code: `from qiskit import QuantumCircuit
from qiskit.quantum_info import DensityMatrix, partial_trace, purity

# Create maximally entangled Bell state |Φ+>
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

# Full system density matrix ρ_AB
rho_full = DensityMatrix(qc)
print("Full 2-Qubit State Purity Tr(ρ²):", purity(rho_full))

# Partial trace over qubit 1 to obtain reduced state of qubit 0
rho_q0 = partial_trace(rho_full, [1])
print("\\nReduced Density Matrix of Qubit 0 (Tracing out Qubit 1):")
print(rho_q0.data)

print("\\nSubsystem Qubit 0 Purity:", purity(rho_q0))
print("(Purity = 0.5 confirms Qubit 0 is in a maximally mixed state due to entanglement!)")
`
  },
  {
    id: 'ex-20-transpilation-optimization',
    title: '20. Transpilation & Optimization Levels',
    category: 'advanced',
    filename: 'transpile_optimization.py',
    description: 'Transpile an unoptimized circuit to physical basis gates and compare optimization levels 0 vs 3.',
    code: `from qiskit import QuantumCircuit, transpile
import math

# Create circuit with redundant and rotatable gates
qc = QuantumCircuit(2)
qc.h(0)
qc.h(0) # Cancels out (Identity)
qc.cx(0, 1)
qc.rz(math.pi / 4, 1)
qc.rz(math.pi / 4, 1) # Combines to π/2
qc.cx(0, 1)

print("Original Circuit:")
print(f"Depth: {qc.depth()}, Gate count: {qc.size()}")
print(qc.draw('text'))

basis_gates = ['cx', 'id', 'rz', 'sx', 'x']

# Transpile Level 0 (Raw mapping)
t_qc0 = transpile(qc, basis_gates=basis_gates, optimization_level=0)
print("\\nTranspiled Level 0 (Raw mapping):")
print(f"Depth: {t_qc0.depth()}, Gate count: {t_qc0.size()}")
print(t_qc0.draw('text'))

# Transpile Level 3 (Aggressive commutation & gate cancellation)
t_qc3 = transpile(qc, basis_gates=basis_gates, optimization_level=3)
print("\\nTranspiled Level 3 (Optimized & Cancelled):")
print(f"Depth: {t_qc3.depth()}, Gate count: {t_qc3.size()}")
print(t_qc3.draw('text'))
`
  },
  {
    id: 'ex-21-grover-search',
    title: '21. Grover\'s Search Algorithm (2 Qubits)',
    category: 'advanced',
    filename: 'grovers_search.py',
    description: 'Quantum search algorithm marking target state |11⟩ and amplifying amplitude using diffuser.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Target marked state is |11>
qc = QuantumCircuit(2, 2)

# Step 1: Initialize uniform superposition
qc.h([0, 1])

# Step 2: Phase Oracle for |11> (Controlled-Z gate)
qc.cz(0, 1)

# Step 3: Grover Diffusion Operator
qc.h([0, 1])
qc.x([0, 1])
qc.cz(0, 1)
qc.x([0, 1])
qc.h([0, 1])

# Step 4: Measurement
qc.measure([0, 1], [0, 1])

print("2-Qubit Grover Search Circuit (Target: |11>):")
print(qc.draw('text'))

sim = AerSimulator()
counts = sim.run(qc, shots=1000).result().get_counts()

print("\\nMeasurement Results (Amplified Target |11>):")
print(counts)
`
  },
  {
    id: 'ex-22-matplotlib-drawing',
    title: '22. Matplotlib Circuit Visualization & Plots',
    category: 'experiments',
    filename: 'matplotlib_visualizer.py',
    description: 'Draw graphical circuit schematics using Qiskit mpl drawer rendered directly in the Results panel.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import matplotlib.pyplot as plt

# Build 3-qubit circuit with various gates
qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
qc.barrier()
qc.measure([0, 1, 2], [0, 1, 2])

# Run simulation
sim = AerSimulator()
counts = sim.run(qc, shots=1000).result().get_counts()
print("Counts:", counts)

# Generate publication-grade matplotlib circuit diagram
# Qubify automatically captures all open matplotlib figures!
fig = qc.draw('mpl', style='iqp')
`
  },
  {
    id: 'ex-23-mps-large-simulation',
    title: '23. Matrix Product State (MPS) Large Circuit',
    category: 'advanced',
    filename: 'mps_large_simulation.py',
    description: 'Simulate a 10-qubit entangled 1D chain using Matrix Product State tensor network methods.',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

n_qubits = 10
qc = QuantumCircuit(n_qubits, n_qubits)

# Create 1D linear cluster entanglement
qc.h(0)
for i in range(n_qubits - 1):
    qc.cx(i, i + 1)

qc.measure(range(n_qubits), range(n_qubits))

print(f"Simulating {n_qubits}-Qubit Entangled Chain with Aer MPS method:")
print(f"Qubits: {qc.num_qubits}, Gates: {qc.size()}, Depth: {qc.depth()}")

# Using matrix_product_state simulator method
sim_mps = AerSimulator(method='matrix_product_state')
result = sim_mps.run(qc, shots=1000).result()
counts = result.get_counts()

print("\\nMeasurement Sample Outcomes:")
for k, v in list(counts.items())[:10]:
    print(f"State |{k}>: {v} shots")
`
  }
];
