import { LearningNodeItem, LessonStepConfig, ChallengeItem, UserStats } from '../types';

export const INITIAL_USER_STATS: UserStats = {
  name: 'Qubify Learner',
  level: 'Level 1',
  levelTitle: 'Quantum Initiate',

  currentLessonId: 'lesson-0',
  currentLessonTitle: 'Classical vs Quantum Computing',

  streakDays: 0,
  xp: 0,

  beginnerCompletionPercent: 0,

  lessonsCompleted: 0,
  totalLessons: 17,

  challengesCompleted: 0,
  totalChallenges: 7,

  labExperimentsCompleted: 0,
};

export const BEGINNER_NODES: LearningNodeItem[] = [
  {
  id: 'lesson-0',
  number: 1,
  title: 'Classical vs Quantum Computing',
  subtitle: 'Understand how classical and quantum computers differ',
  status: 'current',
  category: 'beginner',
  xp: 20,
  estimatedMinutes: 6,
},
  {
    id: 'lesson-1',
    number: 2,
    title: 'Bit',
    subtitle: 'Classical 0 and 1 foundations',
    status: 'upcoming',
    category: 'beginner',
    xp: 20,
    estimatedMinutes: 4,
  },
  {
    id: 'lesson-2',
    number: 2,
    title: 'Probability',
    subtitle: 'Chance, distributions & coin flips',
    status: 'upcoming',
    category: 'beginner',
    xp: 25,
    estimatedMinutes: 5,
  },
  {
    id: 'lesson-3',
    number: 3,
    title: 'Qubit',
    subtitle: 'The quantum bit & superposition',
    status: 'upcoming',
    category: 'beginner',
    xp: 30,
    estimatedMinutes: 6,
  },
  {
    id: 'lesson-4',
    number: 4,
    title: 'Quantum Gates',
    subtitle: 'Transforming states with X and H',
    status: 'upcoming',
    category: 'beginner',
    xp: 40,
    estimatedMinutes: 8,
    subGates: ['X Gate', 'H Gate'],
  },
  {
    id: 'lesson-5',
    number: 5,
    title: 'Quantum Circuits',
    subtitle: 'Composing wires, gates & measurement',
    status: 'upcoming',
    category: 'beginner',
    xp: 35,
    estimatedMinutes: 7,
  },
  {
    id: 'lesson-6',
    number: 6,
    title: 'Quantum Circuit',
    subtitle: 'Composing wires and timelines',
    status: 'upcoming',
    category: 'beginner',
    xp: 35,
    estimatedMinutes: 7,
  },
  {
    id: 'lesson-7',
    number: 7,
    title: 'Shots',
    subtitle: 'Statistical sampling on quantum backends',
    status: 'upcoming',
    category: 'beginner',
    xp: 30,
    estimatedMinutes: 5,
  },
  {
    id: 'lesson-8',
    number: 8,
    title: 'Qiskit Practice',
    subtitle: 'Translating visual circuits into Python code',
    status: 'upcoming',
    category: 'beginner',
    xp: 45,
    estimatedMinutes: 9,
  },
  {
    id: 'lesson-9',
    number: 9,
    title: 'Beginner Challenge',
    subtitle: 'Capstone evaluation & Level 1 mastery',
    status: 'upcoming',
    category: 'beginner',
    xp: 60,
    estimatedMinutes: 10,
  },
];

export const INTERMEDIATE_NODES: LearningNodeItem[] = [
  {
    id: 'inter-1',
    number: 'Int 1',
    title: 'Bloch Sphere',
    subtitle: 'Visualizing single-qubit quantum states',
    status: 'upcoming',
    category: 'intermediate',
    xp: 50,
    estimatedMinutes: 8,
  },
  {
    id: 'inter-2',
    number: 'Int 2',
    title: 'Phase Foundations',
    subtitle: 'Amplitudes, probabilities, and the |+⟩ & |−⟩ states',
    status: 'upcoming',
    category: 'intermediate',
    xp: 60,
    estimatedMinutes: 10,
  },
  {
    id: 'inter-3',
    number: 'Int 3',
    title: 'Z Gate',
    subtitle: 'Phase flips, |+⟩ ↔ |−⟩, and equator rotations',
    status: 'upcoming',
    category: 'intermediate',
    xp: 60,
    estimatedMinutes: 8,
    subGates: ['Z Gate'],
  },
  {
    id: 'inter-4',
    number: 'Int 4',
    title: 'Y Gate',
    subtitle: 'Phase rotation and complex dynamics',
    status: 'upcoming',
    category: 'intermediate',
    xp: 60,
    estimatedMinutes: 8,
    subGates: ['Y Gate'],
  },
  {
    id: 'inter-5',
    number: 'Int 5',
    title: 'Single-Qubit Gate Comparison',
    subtitle: 'Geometric rotation sticks: X vs Y vs Z',
    status: 'upcoming',
    category: 'intermediate',
    xp: 75,
    estimatedMinutes: 12,
    subGates: ['X Gate', 'Y Gate', 'Z Gate'],
  },
  {
    id: 'inter-6',
    number: 'Int 6',
    title: 'Rotation Gates',
    subtitle: 'Continuous angles: Rx, Ry, and Rz',
    status: 'upcoming',
    category: 'intermediate',
    xp: 75,
    estimatedMinutes: 10,
    subGates: ['Rx Gate', 'Ry Gate', 'Rz Gate'],
  },
  {
    id: 'inter-7',
    number: 'Int 7',
    title: 'Multiple Qubits',
    subtitle: 'Tensor products & composite state spaces',
    status: 'upcoming',
    category: 'intermediate',
  },
  {
    id: 'inter-8',
    number: 'Int 8',
    title: 'CNOT Gate',
    subtitle: 'Two-qubit conditional entanglement',
    status: 'locked',
    category: 'intermediate',
  },
  {
    id: 'inter-9',
    number: 'Int 9',
    title: 'Entanglement',
    subtitle: 'Spooky action and correlated qubits',
    status: 'locked',
    category: 'intermediate',
  },
  {
    id: 'inter-10',
    number: 'Int 10',
    title: 'Bell State',
    subtitle: 'Creating maximally entangled pairs',
    status: 'locked',
    category: 'intermediate',
  },
  {
    id: 'inter-11',
    number: 'Int 11',
    title: 'Noise & Real Hardware',
    subtitle: 'Decoherence, error rates & NISQ physics',
    status: 'locked',
    category: 'intermediate',
  },
  {
    id: 'inter-12',
    number: 'Int 12',
    title: 'Intermediate Challenge',
    subtitle: 'Multi-qubit algorithm capstone',
    status: 'locked',
    category: 'intermediate',
  },
];
export interface CurriculumSection {
  id: string;
  title: string;
  subtitle: string;
  nodeIds: string[];
  isFuture?: boolean;
}

export const CURRICULUM_SECTIONS: CurriculumSection[] = [
  {
    id: 'foundations',
    title: 'Quantum Foundations',
    subtitle:
      'Build the mental model of classical computing, bits, probability, qubits, quantum states, the Bloch sphere, and phase.',
    nodeIds: [
      'lesson-0', // Classical vs Quantum Computing
      'lesson-1', // Bit
      'lesson-2', // Probability
      'lesson-3', // Qubit
      'inter-1',  // Bloch Sphere
      'inter-2',  // Phase Foundations
    ],
  },

  {
    id: 'gates',
    title: 'Quantum Gates',
    subtitle:
      'Explore how phase and state transformations work through single-qubit gates and continuous rotations.',
    nodeIds: [
      'inter-3', // Z Gate
      'inter-4', // Y Gate
      'inter-5', // Single-Qubit Gate Comparison
      'inter-6', // Rotation Gates
    ],
  },

 {
  id: 'circuits',
  title: 'Quantum Circuits',
  subtitle:
    'Build quantum circuits, understand repeated measurements, translate circuits into Qiskit, and explore multi-qubit behavior.',
  nodeIds: [
    'lesson-5',  // Quantum Circuits
    'lesson-7',  // Shots
    'lesson-8',  // Qiskit Practice
    'inter-7',   // Multiple Qubits
    'inter-8',   // CNOT Gate
    'inter-9',   // Entanglement
    'inter-10',  // Bell State
  ],
},

  {
    id: 'advanced',
    title: 'Advanced Quantum',
    subtitle:
      'Future expansion for noise, real hardware, advanced algorithms, and deeper quantum topics.',
    nodeIds: [
      'inter-11',
    ],
    isFuture: true,
  },
];

export const LESSON_4_STEPS: LessonStepConfig[] = [
  {
    id: 'what_you_know',
    stepNumber: 1,
    label: 'Recall Foundations',
    title: 'What you already know',
    summary: 'A classical bit is strictly either 0 or 1. A qubit, however, can exist in a superposition of both states with probability amplitudes α and β.',
    detail: '|ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1',
    tag: 'Prerequisite',
  },
  {
    id: 'natural_question',
    stepNumber: 2,
    label: 'The Core Curiosity',
    title: 'The natural question',
    summary: 'If a qubit can exist in a continuous combination of both 0 and 1, what happens when we open the box and actually inspect or measure it?',
    detail: 'Can our sensor read "both" at the exact same instant, or does quantum reality behave differently?',
  },
  {
    id: 'interactive_visual',
    stepNumber: 3,
    label: 'Hands-On Simulator',
    title: 'Interactive visual',
    summary: 'Use the interactive quantum state collider below. Notice how the spinning superposition state settles the moment you trigger a detector.',
    tag: 'Interactive',
  },
  {
    id: 'observe',
    stepNumber: 4,
    label: 'Notice Patterns',
    title: 'Observe',
    summary: 'Did you notice? The qubit never outputs a fuzzy intermediate value like 0.5. It always definitively resolves into 0 or 1!',
    detail: 'Observation in quantum systems is fundamentally participatory.',
  },
  {
    id: 'short_explanation',
    stepNumber: 5,
    label: 'The Concept',
    title: 'Short explanation: Wavefunction Collapse',
    summary: 'Measurement forces the quantum system to collapse from a superposition of possibilities into one concrete computational basis state.',
    detail: 'The probability of measuring |0⟩ is |α|², and |1⟩ is |β|². Once measured, the state remains collapsed for subsequent measurements.',
  },
  {
    id: 'try_it',
    stepNumber: 6,
    label: 'Experimentation',
    title: 'Try it yourself',
    summary: 'Switch the state with an X gate or prepare superposition with an H gate, then measure 3 times to observe empirical probability distribution.',
    tag: 'Lab Task',
  },
  {
    id: 'takeaway',
    stepNumber: 7,
    label: 'Key Principle',
    title: 'One-line takeaway',
    summary: 'Measurement destroys superposition: you observe probabilities beforehand, but only classical outcomes afterward.',
  },
  {
    id: 'continue',
    stepNumber: 8,
    label: 'Next Milestone',
    title: 'Continue to Quantum Gates',
    summary: 'You have completed the measurement model. Next, we will manipulate amplitudes using unitary Quantum Gates (X and H)!',
    tag: 'Milestone',
  },
];

export const CHALLENGE_LIST: ChallengeItem[] = [
  {
    id: 'ch-1',
    number: 1,
    title: 'Make the output 1',
    mission: 'Configure a quantum circuit starting from ground state |0⟩ that guarantees a deterministic output of 1 when measured.',
    objective: 'Apply the Pauli-X (NOT) gate to invert the state vector amplitude.',
    targetState: '|1⟩',
    expectedOutcome: '100% chance of measuring 1',
    hints: [
      'The qubit starts initialized at |0⟩.',
      'Which gate acts like a classical NOT bit-flipper?',
      'Pauli-X transforms |0⟩ into |1⟩.',
    ],
    solved: true,
    type: 'builder',
  },
  {
    id: 'ch-2',
    number: 2,
    title: 'Create approximately 50/50 results',
    mission: 'Construct a circuit that produces true quantum randomness: an equal 50% chance of measuring 0 and 50% chance of measuring 1.',
    objective: 'Apply the Hadamard (H) gate to create a balanced superposition.',
    targetState: '(|0⟩ + |1⟩) / √2',
    expectedOutcome: '50% |0⟩, 50% |1⟩ over many shots',
    hints: [
      'You need to place the qubit into an equal superposition.',
      'The Hadamard gate (H) turns basis states into superposition.',
    ],
    solved: false,
    type: 'builder',
  },
  {
    id: 'ch-3',
    number: 3,
    title: 'Choose the correct circuit',
    mission: 'Identify which quantum circuit sequence correctly inverts a qubit, puts it in superposition, and performs a measurement.',
    objective: 'Recognize circuit gate ordering: X → H → Measure',
    targetState: 'X then H then Measure',
    expectedOutcome: 'Correct sequence identified',
    hints: [
      'Quantum circuits execute from left to right.',
      'First invert (X), then superpose (H), then read (Measure).',
    ],
    solved: false,
    type: 'choice',
    options: [
      { id: 'opt-a', text: 'qc.measure() then qc.h() then qc.x()', isCorrect: false },
      { id: 'opt-b', text: 'qc.x(0) → qc.h(0) → qc.measure(0, 0)', isCorrect: true },
      { id: 'opt-c', text: 'qc.h(0) → qc.h(0) → qc.x(0)', isCorrect: false },
    ],
  },
  {
    id: 'ch-4',
    number: 4,
    title: 'Identify what measurement does',
    mission: 'State the physical and mathematical effect of observing a quantum state vector in superposition.',
    objective: 'Understand quantum wavefunction collapse.',
    targetState: 'State collapse',
    expectedOutcome: 'Correct conceptual principle chosen',
    hints: [
      'Does measurement preserve the superposition or alter it?',
      'Think about wavefunction collapse.',
    ],
    solved: false,
    type: 'choice',
    options: [
      { id: 'opt-1', text: 'It creates infinite copies of the qubit in different universes without changing this one.', isCorrect: false },
      { id: 'opt-2', text: 'It forces the qubit to irreversibly collapse into one definite classical basis state (|0⟩ or |1⟩).', isCorrect: true },
      { id: 'opt-3', text: 'It allows reading both 0 and 1 simultaneously with a single classical detector.', isCorrect: false },
    ],
  },
];
