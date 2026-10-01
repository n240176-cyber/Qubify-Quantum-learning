import { BankChallenge } from '../types';

/**
 * High-quality, scientifically sound challenge bank for Qubify.
 * Strictly categorized by prerequisite lesson IDs so that learners
 * are never presented with concepts they have not yet unlocked.
 */
export const CHALLENGE_BANK: BankChallenge[] = [
  // ==========================================
  // LESSON 1: BIT (Foundations)
  // ==========================================
  {
    id: 'bit_mc_01',
    topic: 'Bit',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: 'How does a classical bit store information compared to a physical switch?',
    options: [
      { id: 'a', text: 'It can only exist in one of two mutually exclusive states (0 or 1)', isCorrect: true },
      { id: 'b', text: 'It can store any continuous fraction between 0 and 1 simultaneously', isCorrect: false },
      { id: 'c', text: 'It requires quantum phase angles to maintain its value', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'A classical bit is binary: it is strictly constrained to either state 0 (off) or state 1 (on).',
    requiredLesson: 'lesson-1',
    hint: 'Think of a standard binary light switch: it is either on or off.',
    points: 15,
  },
  {
    id: 'bit_tf_01',
    topic: 'Bit',
    difficulty: 'easy',
    type: 'true_false',
    question: 'True or False: Before reading a classical bit, it exists in an undefined state that only decides 0 or 1 upon observation.',
    options: [
      { id: 'true', text: 'True', isCorrect: false },
      { id: 'false', text: 'False', isCorrect: true },
    ],
    correctAnswer: 'false',
    explanation: 'Classical bits always have a definite value (0 or 1) at all times, regardless of whether anyone is observing them.',
    requiredLesson: 'lesson-1',
    hint: 'In classical computing, observation does not change or force the value of a bit.',
    points: 15,
  },

  // ==========================================
  // LESSON 2: PROBABILITY
  // ==========================================
  {
    id: 'prob_pred_01',
    topic: 'Probability',
    difficulty: 'easy',
    type: 'prediction',
    question: 'A fair coin has P(Heads) = 0.5. If you flip it 1,000 times, what will you most likely observe?',
    options: [
      { id: 'a', text: 'Exactly 500 Heads and 500 Tails with zero deviation every trial', isCorrect: false },
      { id: 'b', text: 'Approximately 50% Heads with small statistical fluctuation due to finite sampling', isCorrect: true },
      { id: 'c', text: 'All Heads in the first 500 flips and all Tails in the last 500 flips', isCorrect: false },
    ],
    correctAnswer: 'b',
    explanation: 'Statistical sampling yields empirical distributions clustering near 50%, but finite trials always show small probabilistic variance.',
    requiredLesson: 'lesson-2',
    hint: 'Finite random trials show statistical clustering, not rigid mathematical perfection.',
    points: 20,
  },
  {
    id: 'prob_tf_01',
    topic: 'Probability',
    difficulty: 'medium',
    type: 'true_false',
    question: 'True or False: In quantum mechanics, an amplitude of −1/√2 represents a negative probability of −50%.',
    options: [
      { id: 'true', text: 'True', isCorrect: false },
      { id: 'false', text: 'False', isCorrect: true },
    ],
    correctAnswer: 'false',
    explanation: 'Probability is the absolute square of the amplitude: |−1/√2|² = 1/2 = 50%. Probabilities can never be negative.',
    requiredLesson: 'lesson-2',
    hint: 'Probabilities are calculated by squaring the magnitude of the amplitude.',
    points: 20,
  },

  // ==========================================
  // LESSON 3: QUBIT
  // ==========================================
  {
    id: 'qubit_fix_01',
    topic: 'Qubit',
    difficulty: 'medium',
    type: 'fix_statement',
    question: 'A student says: "Superposition means a qubit is simply 0 and 1 at the same time, like having two classical numbers."',
    options: [
      { id: 'a', text: 'Accurate: a qubit literally contains both numbers simultaneously.', isCorrect: false },
      { id: 'b', text: 'Inaccurate: superposition is a single coherent quantum state with probability amplitudes, not two separate classical numbers.', isCorrect: true },
      { id: 'c', text: 'Inaccurate: a qubit can only be in superposition if connected to an external battery.', isCorrect: false },
    ],
    correctAnswer: 'b',
    explanation: 'Superposition is a unique single physical state vector |ψ⟩ = α|0⟩ + β|1⟩. It is not two classical values stored simultaneously.',
    requiredLesson: 'lesson-3',
    hint: 'Quantum states are linear combinations of basis states, not multiple classical values.',
    points: 25,
  },
  {
    id: 'qubit_mc_01',
    topic: 'Qubit',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: 'What mathematical condition must the probability amplitudes α and β satisfy for any valid normalized state |ψ⟩ = α|0⟩ + β|1⟩?',
    options: [
      { id: 'a', text: '|α|² + |β|² = 1', isCorrect: true },
      { id: 'b', text: 'α + β = 1', isCorrect: false },
      { id: 'c', text: 'α × β = 0', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'Total measurement probability must equal 100%, meaning the sum of squared magnitudes |α|² + |β|² must equal 1.',
    requiredLesson: 'lesson-3',
    hint: 'The sum of all measurement probabilities must equal 1.',
    points: 20,
  },

  // ==========================================
  // LESSON 4: QUANTUM GATES (X and H)
  // ==========================================
  {
    id: 'gate_pred_01',
    topic: 'Quantum Gates',
    difficulty: 'easy',
    type: 'prediction',
    question: 'A qubit is initialized in state |0⟩. You apply an X gate. What is the resulting state?',
    options: [
      { id: 'a', text: '|1⟩', isCorrect: true },
      { id: 'b', text: '|0⟩', isCorrect: false },
      { id: 'c', text: '|+⟩', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'The Pauli-X gate acts as a quantum bit-flip: X|0⟩ = |1⟩ and X|1⟩ = |0⟩.',
    requiredLesson: 'lesson-4',
    hint: 'The X gate is analogous to the classical NOT operation.',
    points: 20,
  },
  {
    id: 'gate_pred_02',
    topic: 'Quantum Gates',
    difficulty: 'medium',
    type: 'prediction',
    question: 'What happens when you apply two successive Hadamard gates to a qubit: H followed immediately by H on |0⟩?',
    options: [
      { id: 'a', text: 'The state returns to |0⟩ because H is its own inverse (H² = I)', isCorrect: true },
      { id: 'b', text: 'The state flips to |1⟩', isCorrect: false },
      { id: 'c', text: 'The superposition becomes permanent and can never be undone', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'The Hadamard gate is self-inverse (unitary and Hermitian). Applying it twice restores the original state: H(H|0⟩) = |0⟩.',
    requiredLesson: 'lesson-4',
    hint: 'Unitary gates like H satisfy H × H = Identity.',
    points: 25,
  },
  {
    id: 'gate_circuit_01',
    topic: 'Quantum Gates',
    difficulty: 'medium',
    type: 'circuit_interpretation',
    circuitDiagram: '|0⟩ ──[ X ]──[ H ]──',
    question: 'Consider the circuit: |0⟩ → X → H. What state does this produce before measurement?',
    options: [
      { id: 'a', text: '|−⟩ = (|0⟩ − |1⟩) / √2', isCorrect: true },
      { id: 'b', text: '|+⟩ = (|0⟩ + |1⟩) / √2', isCorrect: false },
      { id: 'c', text: '|0⟩', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'X flips |0⟩ to |1⟩. Then H maps |1⟩ to the negative superposition state |−⟩ = (|0⟩ − |1⟩)/√2.',
    requiredLesson: 'lesson-4',
    hint: 'H|0⟩ = |+⟩, whereas H|1⟩ = |−⟩.',
    points: 30,
  },

  // ==========================================
  // LESSON 5 & 6: QUANTUM CIRCUITS & MEASUREMENT
  // ==========================================
  {
    id: 'circuit_mc_01',
    topic: 'Circuits',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: 'In standard quantum circuit diagrams, what does time ordering represent?',
    options: [
      { id: 'a', text: 'Operations execute sequentially from left to right along the qubit timeline', isCorrect: true },
      { id: 'b', text: 'Operations execute from right to left like Arabic text', isCorrect: false },
      { id: 'c', text: 'All gates on a wire execute simultaneously in parallel', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'Circuit timelines advance strictly from left to right, representing chronological gate application.',
    requiredLesson: 'lesson-5',
    hint: 'Quantum circuits read like Western sheet music or text: left to right.',
    points: 20,
  },
  {
    id: 'circuit_tf_01',
    topic: 'Circuits',
    difficulty: 'medium',
    type: 'true_false',
    question: 'True or False: If a qubit in superposition (|0⟩ + |1⟩)/√2 is measured and yields outcome 0, subsequent measurements immediately afterward can still yield 1.',
    options: [
      { id: 'true', text: 'True', isCorrect: false },
      { id: 'false', text: 'False', isCorrect: true },
    ],
    correctAnswer: 'false',
    explanation: 'Measurement collapses the state vector to |0⟩. Any immediate repeated measurement in the same basis will deterministically yield 0.',
    requiredLesson: 'lesson-5',
    hint: 'Wavefunction collapse is projective and irreversible without new gates.',
    points: 25,
  },

  // ==========================================
  // LESSON 7: SHOTS (Statistical Sampling)
  // ==========================================
  {
    id: 'shots_mc_01',
    topic: 'Shots',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'Why do we run a quantum circuit with 1,024 shots instead of just 1 shot?',
    options: [
      { id: 'a', text: 'A single shot only reveals one collapsed outcome; multiple shots reconstruct the underlying probability distribution', isCorrect: true },
      { id: 'b', text: 'Running more shots increases the qubit frequency', isCorrect: false },
      { id: 'c', text: 'More shots guarantee 100% deterministic mathematical outcomes', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'Quantum measurement is probabilistic. Sampling with multiple shots allows us to estimate the state amplitudes through output counts.',
    requiredLesson: 'lesson-7',
    hint: 'You cannot reconstruct probabilities from a single coin flip.',
    points: 25,
  },
  {
    id: 'shots_tf_01',
    topic: 'Shots',
    difficulty: 'easy',
    type: 'true_false',
    question: 'True or False: Running 10,000 shots guarantees that an equal superposition will produce exactly 5,000 zeros and 5,000 ones.',
    options: [
      { id: 'true', text: 'True', isCorrect: false },
      { id: 'false', text: 'False', isCorrect: true },
    ],
    correctAnswer: 'false',
    explanation: 'Random sampling reduces relative uncertainty, but statistical variance remains. Counts might be 4,982 vs 5,018, which is completely expected.',
    requiredLesson: 'lesson-7',
    hint: 'Physical sampling converges in the limit, but exact equality is not guaranteed.',
    points: 20,
  },

  // ==========================================
  // LESSON 8: QISKIT PRACTICE (Code Understanding)
  // ==========================================
  {
    id: 'qiskit_code_01',
    topic: 'Qiskit',
    difficulty: 'easy',
    type: 'code_understanding',
    codeSnippet: 'from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\nqc.h(0)',
    question: 'What does the method `qc.h(0)` do in this Qiskit program?',
    options: [
      { id: 'a', text: 'Applies a Hadamard gate to qubit index 0, creating superposition', isCorrect: true },
      { id: 'b', text: 'Halts execution for 0 seconds', isCorrect: false },
      { id: 'c', text: 'Measures the qubit into classical register 0', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: '`qc.h(0)` appends a Hadamard gate to qubit 0, transforming |0⟩ into equal superposition |+⟩.',
    requiredLesson: 'lesson-8',
    hint: 'In Qiskit, gate methods like `.x()`, `.h()`, and `.z()` take qubit indices.',
    points: 25,
  },
  {
    id: 'qiskit_err_01',
    topic: 'Qiskit',
    difficulty: 'medium',
    type: 'error_identification',
    codeSnippet: 'qc = QuantumCircuit(1, 1)\nqc.x(2)\nqc.measure(0, 0)',
    question: 'What error will occur when executing this Qiskit script?',
    options: [
      { id: 'a', text: 'CircuitError / IndexError: qubit index 2 is out of range for a 1-qubit circuit', isCorrect: true },
      { id: 'b', text: 'SyntaxError: measure requires three arguments', isCorrect: false },
      { id: 'c', text: 'Quantum circuits cannot have classical registers', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: '`QuantumCircuit(1, 1)` allocates only 1 qubit (index 0). Attempting `qc.x(2)` raises an out-of-range error.',
    requiredLesson: 'lesson-8',
    hint: 'Look at the number of qubits allocated in `QuantumCircuit(1, 1)`.',
    points: 30,
  },

  // ==========================================
  // INTERMEDIATE 1: BLOCH SPHERE
  // ==========================================
  {
    id: 'bloch_geom_01',
    topic: 'Bloch Sphere',
    difficulty: 'easy',
    type: 'bloch_sphere',
    question: 'On the standard Bloch Sphere, where do the computational basis states |0⟩ and |1⟩ point?',
    options: [
      { id: 'a', text: '|0⟩ points to the North Pole (+Z) and |1⟩ points to the South Pole (−Z)', isCorrect: true },
      { id: 'b', text: '|0⟩ points to the East (+X) and |1⟩ points to the West (−X)', isCorrect: false },
      { id: 'c', text: 'Both states point directly at the center of the sphere', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'The Z-axis represents the computational basis: |0⟩ is at the North Pole (θ = 0) and |1⟩ is at the South Pole (θ = π).',
    requiredLesson: 'inter-1',
    hint: 'The Z-axis is the vertical axis of the Bloch Sphere.',
    points: 25,
  },
  {
    id: 'bloch_pred_01',
    topic: 'Bloch Sphere',
    difficulty: 'medium',
    type: 'bloch_sphere',
    question: 'The qubit starts in the state |+⟩. Where is this vector located on the Bloch sphere?',
    options: [
      { id: 'a', text: 'On the equator pointing along the positive X-axis', isCorrect: true },
      { id: 'b', text: 'At the North Pole on the positive Z-axis', isCorrect: false },
      { id: 'c', text: 'Inside the sphere at the origin', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'The state |+⟩ = (|0⟩ + |1⟩)/√2 lies on the equator at (x=1, y=0, z=0), pointing directly along +X.',
    requiredLesson: 'inter-1',
    hint: 'Equal superpositions with real coefficients lie on the equator along the X-axis.',
    points: 25,
  },

  // ==========================================
  // INTERMEDIATE 2: PHASE FOUNDATIONS
  // ==========================================
  {
    id: 'phase_mc_01',
    topic: 'Phase',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'How do the states |+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2 behave when measured in the standard computational (Z) basis?',
    options: [
      { id: 'a', text: 'Both yield 0 and 1 with identical 50% / 50% probabilities', isCorrect: true },
      { id: 'b', text: '|+⟩ yields 100% 0, while |−⟩ yields 100% 1', isCorrect: false },
      { id: 'c', text: '|−⟩ yields a negative count of measurements', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'Because |1/√2|² = |−1/√2|² = 1/2, both states have identical 50/50 measurement probabilities in the Z-basis.',
    requiredLesson: 'inter-2',
    hint: 'Probabilities depend on the squared magnitude of amplitudes, ignoring relative sign.',
    points: 30,
  },
  {
    id: 'phase_fix_01',
    topic: 'Phase',
    difficulty: 'medium',
    type: 'fix_statement',
    question: 'A classmate argues: "Since |+⟩ and |−⟩ give identical 50/50 measurement results, relative phase does not physically matter in quantum computing."',
    options: [
      { id: 'a', text: 'Accurate: relative phase is purely mathematical notation and has no physical impact.', isCorrect: false },
      { id: 'b', text: 'Inaccurate: phase creates constructive and destructive interference when further gates (like H) are applied.', isCorrect: true },
      { id: 'c', text: 'Inaccurate: phase only matters when temperature exceeds absolute zero.', isCorrect: false },
    ],
    correctAnswer: 'b',
    explanation: 'Relative phase is critical: applying H to |+⟩ returns |0⟩, whereas applying H to |−⟩ yields |1⟩ due to quantum interference.',
    requiredLesson: 'inter-2',
    hint: 'Think about what happens if you apply a Hadamard gate to |+⟩ versus |−⟩.',
    points: 30,
  },

  // ==========================================
  // INTERMEDIATE 3: Z GATE
  // ==========================================
  {
    id: 'zgate_pred_01',
    topic: 'Z Gate',
    difficulty: 'easy',
    type: 'prediction',
    question: 'What is the action of the Pauli-Z gate on the ground state |0⟩?',
    options: [
      { id: 'a', text: 'Leaves |0⟩ unchanged (Z|0⟩ = |0⟩)', isCorrect: true },
      { id: 'b', text: 'Flips |0⟩ to |1⟩', isCorrect: false },
      { id: 'c', text: 'Multiplies |0⟩ by −1', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'The Z gate leaves |0⟩ unchanged and applies a −1 phase factor only to |1⟩: Z|0⟩ = |0⟩ and Z|1⟩ = −|1⟩.',
    requiredLesson: 'inter-3',
    hint: 'The Z gate is a phase flip, not a bit flip.',
    points: 25,
  },
  {
    id: 'zgate_bloch_01',
    topic: 'Z Gate',
    difficulty: 'medium',
    type: 'bloch_sphere',
    question: 'On the Bloch sphere, the qubit is at |+⟩ (+X axis). You apply a Z gate. Where does the vector point now?',
    options: [
      { id: 'a', text: 'To |−⟩ along the −X axis (a 180° rotation around the Z-axis)', isCorrect: true },
      { id: 'b', text: 'To the North Pole (+Z axis)', isCorrect: false },
      { id: 'c', text: 'To the South Pole (−Z axis)', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'The Pauli-Z gate rotates the state by 180° (π radians) around the Z-axis, swinging +X (|+⟩) to −X (|−⟩).',
    requiredLesson: 'inter-3',
    hint: 'Rotation around the vertical Z-axis moves points along the equator.',
    points: 30,
  },

  // ==========================================
  // INTERMEDIATE 4: Y GATE
  // ==========================================
  {
    id: 'ygate_pred_01',
    topic: 'Y Gate',
    difficulty: 'medium',
    type: 'prediction',
    question: 'The Pauli-Y gate combines both bit flip and phase flip. What is its geometric rotation on the Bloch sphere?',
    options: [
      { id: 'a', text: 'A 180° rotation around the Y-axis', isCorrect: true },
      { id: 'b', text: 'A 90° rotation around the Z-axis only', isCorrect: false },
      { id: 'c', text: 'A reflection through the origin', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'Like all Pauli gates, Y represents a π (180°) rotation, specifically around the Cartesian Y-axis of the Bloch sphere.',
    requiredLesson: 'inter-4',
    hint: 'Pauli operators X, Y, and Z correspond to 180° rotations around their respective axes.',
    points: 30,
  },

  // ==========================================
  // INTERMEDIATE 6: ROTATION GATES (Rx, Ry, Rz)
  // ==========================================
  {
    id: 'rot_mc_01',
    topic: 'Rotation Gates',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'How do continuous rotation gates Rx(θ), Ry(θ), and Rz(θ) differ from discrete Pauli gates X, Y, and Z?',
    options: [
      { id: 'a', text: 'They allow arbitrary continuous angles θ rather than fixed 180° (π) steps', isCorrect: true },
      { id: 'b', text: 'They can only rotate qubits if measured first', isCorrect: false },
      { id: 'c', text: 'They do not preserve normalization', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'Rotation gates parameterize continuous rotations by any arbitrary real angle θ on the Bloch sphere.',
    requiredLesson: 'inter-6',
    hint: 'Think of turning a knob smoothly by any angle θ.',
    points: 30,
  },

  // ==========================================
  // WEEKLY FINAL CHALLENGES (Combining 2+ Concepts)
  // ==========================================
  {
    id: 'final_comb_01',
    topic: 'Qubit + Measurement',
    difficulty: 'challenge',
    type: 'circuit_interpretation',
    circuitDiagram: '|0⟩ ──[ H ]──[ M ]──[ H ]──[ M ]',
    question: 'In the circuit: |0⟩ → H → Measure → H → Measure. Suppose the first measurement observes outcome 1. What is the probability of the second measurement yielding 0?',
    options: [
      { id: 'a', text: '50% (because after collapsing to |1⟩, the second H creates (|0⟩ − |1⟩)/√2)', isCorrect: true },
      { id: 'b', text: '100% (because the first outcome was 1)', isCorrect: false },
      { id: 'c', text: '0% (a qubit cannot be superposed after measurement)', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'The first measurement collapses the state to |1⟩. Applying H to |1⟩ produces |−⟩ = (|0⟩ − |1⟩)/√2. Measuring |−⟩ has |1/√2|² = 50% chance of yielding 0.',
    requiredLesson: 'lesson-5',
    secondaryLesson: 'lesson-4',
    isFinalChallenge: true,
    hint: 'Follow the state step-by-step: |0⟩ → H gives |+⟩ → measurement collapses to |1⟩ → next H gives |−⟩.',
    points: 50,
  },
  {
    id: 'final_comb_02',
    topic: 'H Gate + Probability',
    difficulty: 'challenge',
    type: 'circuit_interpretation',
    circuitDiagram: '|0⟩ ──[ H ]──[ H ]──[ M ]',
    question: 'A learner runs this circuit with 10,000 shots. What outcome counts will be observed?',
    options: [
      { id: 'a', text: '10,000 counts of outcome 0 (100% deterministic)', isCorrect: true },
      { id: 'b', text: 'Approximately 5,000 counts of 0 and 5,000 counts of 1', isCorrect: false },
      { id: 'c', text: '10,000 counts of outcome 1', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'H is self-inverse: H(H|0⟩) = |0⟩. The second Hadamard creates destructive interference for |1⟩ and constructive interference for |0⟩, deterministically yielding 0.',
    requiredLesson: 'lesson-4',
    secondaryLesson: 'lesson-7',
    isFinalChallenge: true,
    hint: 'Remember that H applied twice is the Identity operation (H² = I).',
    points: 50,
  },
  {
    id: 'final_comb_03',
    topic: 'Bloch Sphere + Z Gate',
    difficulty: 'challenge',
    type: 'bloch_sphere',
    circuitDiagram: '|0⟩ ──[ H ]──[ Z ]──[ H ]──[ M ]',
    question: 'A qubit starts at |0⟩ (North Pole). You apply H, then Z, then H, and measure. What is the deterministic outcome?',
    options: [
      { id: 'a', text: 'Outcome 1 with 100% probability', isCorrect: true },
      { id: 'b', text: 'Outcome 0 with 100% probability', isCorrect: false },
      { id: 'c', text: '50% 0 and 50% 1', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'H|0⟩ = |+⟩ (vector at +X). Z|+⟩ = |−⟩ (vector at −X). Then H|−⟩ = |1⟩ (South Pole). Measuring yields 1 deterministically!',
    requiredLesson: 'inter-3',
    secondaryLesson: 'inter-1',
    isFinalChallenge: true,
    hint: 'Track the vector on the equator: +X rotates to −X, and H flips −X into the South Pole |1⟩.',
    points: 50,
  },
  {
    id: 'final_comb_04',
    topic: 'Phase + H Gate',
    difficulty: 'challenge',
    type: 'prediction',
    question: 'Why does H transform |+⟩ into |0⟩, but transforms |−⟩ into |1⟩?',
    options: [
      { id: 'a', text: 'The relative minus sign in |−⟩ causes amplitudes for |0⟩ to destructively cancel: (1 − 1)/2 = 0, while amplitudes for |1⟩ constructively add: (1 − (−1))/2 = 1', isCorrect: true },
      { id: 'b', text: 'Because the H gate randomly measures the qubit before calculating', isCorrect: false },
      { id: 'c', text: 'Because negative phase flips the physical direction of gravity on the ion trap', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'This is the essence of quantum interference: amplitude addition or subtraction depends directly on the relative phase.',
    requiredLesson: 'inter-2',
    secondaryLesson: 'lesson-4',
    isFinalChallenge: true,
    hint: 'Amplitudes add like waves: positive amplitudes reinforce, while opposite signs cancel out.',
    points: 50,
  },
  {
    id: 'final_comb_05',
    topic: 'Rotation Gate + Bloch Sphere',
    difficulty: 'challenge',
    type: 'bloch_sphere',
    question: 'Starting at |0⟩ (North Pole), which rotation gate and angle moves the vector directly to |+⟩ (+X axis)?',
    options: [
      { id: 'a', text: 'Ry(π/2): a 90° rotation around the Y-axis', isCorrect: true },
      { id: 'b', text: 'Rz(π/2): a 90° rotation around the Z-axis', isCorrect: false },
      { id: 'c', text: 'Rx(π): a 180° rotation around the X-axis', isCorrect: false },
    ],
    correctAnswer: 'a',
    explanation: 'Rotating from +Z (North Pole) down to +X on the equator requires a 90° (π/2 radian) rotation around the orthogonal Y-axis.',
    requiredLesson: 'inter-6',
    secondaryLesson: 'inter-1',
    isFinalChallenge: true,
    hint: 'To tip a vector from the Z pole toward the X axis, you must rotate around the Y axis.',
    points: 50,
  }
];
