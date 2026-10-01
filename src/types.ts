export type AppView = 
  | 'landing' 
  | 'auth'
  | 'onboarding'
  | 'dashboard' 
  | 'path' 
  | 'lesson' 
  | 'lab' 
  | 'challenges' 
  | 'progress';

export type NodeStatus = 'completed' | 'current' | 'upcoming' | 'locked';

export interface LearningNodeItem {
  id: string;
  number: number | string;
  title: string;
  subtitle?: string;
  status: NodeStatus;
  category: 'beginner' | 'intermediate';
  xp?: number;
  estimatedMinutes?: number;
  subGates?: string[];
}

export type LessonStepKey = 
  | 'what_you_know'
  | 'natural_question'
  | 'interactive_visual'
  | 'observe'
  | 'short_explanation'
  | 'try_it'
  | 'takeaway'
  | 'continue';

export interface LessonStepConfig {
  id: LessonStepKey;
  stepNumber: number;
  label: string;
  title: string;
  summary: string;
  detail?: string;
  tag?: string;
}

export type QuantumGateType = 'X' | 'H' | 'Measure';

export interface CircuitSlot {
  id: string;
  gate: QuantumGateType | null;
}

export interface ChallengeItem {
  id: string;
  number: number;
  title: string;
  mission: string;
  objective: string;
  targetState: string;
  expectedOutcome: string;
  hints: string[];
  solved: boolean;
  type: 'builder' | 'choice' | 'conceptual';
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export type WeeklyChallengeType = 
  | 'multiple_choice' 
  | 'prediction' 
  | 'bloch_sphere' 
  | 'true_false' 
  | 'fix_statement' 
  | 'circuit_interpretation' 
  | 'code_understanding' 
  | 'error_identification';

export type ChallengeDifficulty = 'easy' | 'medium' | 'challenge';

export interface ChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanationNote?: string;
}

export interface BankChallenge {
  id: string;
  topic: string;
  difficulty: ChallengeDifficulty;
  type: WeeklyChallengeType;
  question: string;
  codeSnippet?: string;
  circuitDiagram?: string;
  options: ChallengeOption[];
  correctAnswer: string;
  explanation: string;
  requiredLesson: string;
  secondaryLesson?: string;
  hint: string;
  isFinalChallenge?: boolean;
  points?: number;
}

export interface ActiveWeeklyChallenge extends BankChallenge {
  orderNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
  selectedOptionId?: string;
  attemptsCount: number;
  completedAt?: string;
}

export interface WeeklyChallengeSet {
  weekId: string;
  weekLabel: string;
  generatedForLessons: string[];
  challenges: ActiveWeeklyChallenge[];
  daysRemaining: number;
  completedCount: number;
  isCurrentWeek: boolean;
}

export interface WeeklyHistoryRecord {
  weekId: string;
  weekLabel: string;
  completedCount: number;
  totalCount: number;
  completedDate: string;
  challenges: ActiveWeeklyChallenge[];
}

export interface UserStats {
  name: string;
  level: string;
  levelTitle: string;
  currentLessonId: string;
  currentLessonTitle: string;
  streakDays: number;
  xp: number;
  beginnerCompletionPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
  challengesCompleted: number;
  totalChallenges: number;
  labExperimentsCompleted: number;
}
