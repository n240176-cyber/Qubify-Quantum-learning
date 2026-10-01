import { 
  BankChallenge, 
  ActiveWeeklyChallenge, 
  WeeklyChallengeSet, 
  WeeklyHistoryRecord,
  LearningNodeItem 
} from '../types';
import { CHALLENGE_BANK } from '../data/challengeBank';

const STORAGE_CURRENT_WEEK_KEY = 'qubify_weekly_set_v2';
const STORAGE_HISTORY_KEY = 'qubify_weekly_history_v2';

/**
 * Returns ISO week string, e.g. "2026-W39"
 */
export function getIsoWeekString(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Calculates days remaining until the end of the current week (Sunday midnight UTC)
 */
export function getDaysRemainingInWeek(date: Date = new Date()): number {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  const daysUntilSunday = (7 - day) % 7;
  return daysUntilSunday === 0 ? 1 : daysUntilSunday;
}

/**
 * Simple deterministic pseudo-random number generator using a seed string
 */
function seededRandom(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Extracts unlocked lesson IDs from learner nodes
 */
export function getEligibleLessonIds(
  beginnerNodes: LearningNodeItem[],
  intermediateNodes: LearningNodeItem[]
): { unlockedIds: string[]; completedIds: string[]; topicNames: string[] } {
  const allNodes = [...beginnerNodes, ...intermediateNodes];
  const unlockedNodes = allNodes.filter((n) => n.status === 'completed' || n.status === 'current');
  const completedNodes = allNodes.filter((n) => n.status === 'completed');

  // Fallback: at least lesson-1 is always unlocked
  const unlockedIds = unlockedNodes.length > 0 ? unlockedNodes.map((n) => n.id) : ['lesson-1'];
  const completedIds = completedNodes.map((n) => n.id);
  const topicNames = Array.from(new Set(unlockedNodes.map((n) => n.title)));

  return { unlockedIds, completedIds, topicNames };
}

/**
 * Generates a stable set of 7 challenges for the week based on learner progress.
 */
export function generateWeeklyChallengeSet(
  unlockedLessonIds: string[],
  completedLessonIds: string[],
  learnerSeed: string = 'guest'
): WeeklyChallengeSet {
  const weekId = getIsoWeekString();
  const weekNum = weekId.split('-W')[1] || '01';
  const weekLabel = `Week ${parseInt(weekNum, 10)}`;
  const daysRemaining = getDaysRemainingInWeek();

  // 1. Filter bank to ONLY challenges whose requiredLesson AND optional secondaryLesson are unlocked
  const eligibleChallenges = CHALLENGE_BANK.filter((c) => {
    const mainEligible = unlockedLessonIds.includes(c.requiredLesson);
    const secondaryEligible = !c.secondaryLesson || unlockedLessonIds.includes(c.secondaryLesson);
    return mainEligible && secondaryEligible;
  });

  // Fallback safeguard: if somehow empty, allow lesson-1 questions
  const pool = eligibleChallenges.length >= 7 
    ? eligibleChallenges 
    : CHALLENGE_BANK.filter((c) => c.requiredLesson === 'lesson-1' || unlockedLessonIds.includes(c.requiredLesson));

  const rng = seededRandom(`${weekId}_${learnerSeed}`);

  // Shuffle pool with deterministic RNG
  const shuffled = [...pool].sort(() => rng() - 0.5);

  const selected: BankChallenge[] = [];
  const usedIds = new Set<string>();

  // Slot 1: Review an older completed topic (if any completed)
  const reviewPool = shuffled.filter((c) => completedLessonIds.includes(c.requiredLesson) && !usedIds.has(c.id));
  const challenge1 = reviewPool[0] || shuffled[0];
  selected.push(challenge1);
  usedIds.add(challenge1.id);

  // Slot 7: Weekly Final Challenge (Combines 2+ concepts or highest difficulty)
  const finalPool = shuffled.filter((c) => c.isFinalChallenge && !usedIds.has(c.id));
  const challenge7 = finalPool[0] || shuffled.find((c) => c.difficulty === 'challenge' && !usedIds.has(c.id)) || shuffled.find((c) => !usedIds.has(c.id)) || pool[0];
  usedIds.add(challenge7.id);

  // Slots 2 to 6: Balanced mix of concept reasoning, predictions, bloch sphere, circuit interpretation
  const targetTypes: (BankChallenge['type'] | undefined)[] = [
    undefined, // Slot 2: current topic
    undefined, // Slot 3: current topic
    'fix_statement', // Slot 4: concept reasoning
    'prediction', // Slot 5: visual / prediction
    'circuit_interpretation', // Slot 6: mixed concept
  ];

  for (let i = 0; i < targetTypes.length; i++) {
    const targetType = targetTypes[i];
    let candidate: BankChallenge | undefined;

    if (targetType) {
      candidate = shuffled.find((c) => c.type === targetType && !usedIds.has(c.id));
    }
    if (!candidate) {
      candidate = shuffled.find((c) => !usedIds.has(c.id));
    }
    if (!candidate) {
      // If pool is small, reuse another with fallback
      candidate = pool[i % pool.length];
    }

    selected.push(candidate);
    usedIds.add(candidate.id);
  }

  // Insert challenge7 at the end (slot 7)
  selected.push(challenge7);

  // Transform into ActiveWeeklyChallenge
  const activeChallenges: ActiveWeeklyChallenge[] = selected.map((c, index) => ({
    ...c,
    orderNumber: index + 1,
    status: 'not_started',
    attemptsCount: 0,
    isFinalChallenge: index === 6,
  }));

  return {
    weekId,
    weekLabel,
    generatedForLessons: unlockedLessonIds,
    challenges: activeChallenges,
    daysRemaining,
    completedCount: 0,
    isCurrentWeek: true,
  };
}

/**
 * Loads current weekly challenge set from localStorage, or generates a fresh one
 * if the week has refreshed or if unlocked lessons changed significantly.
 */
export function loadOrInitWeeklyChallenges(
  unlockedLessonIds: string[],
  completedLessonIds: string[],
  learnerId: string = 'guest'
): { currentSet: WeeklyChallengeSet; history: WeeklyHistoryRecord[] } {
  const currentWeekId = getIsoWeekString();
  let currentSet: WeeklyChallengeSet | null = null;
  let history: WeeklyHistoryRecord[] = [];

  // Load history
  try {
    const rawHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (rawHistory) {
      history = JSON.parse(rawHistory);
    }
  } catch (e) {
    history = [];
  }

  // Load saved current week
  try {
    const rawCurrent = localStorage.getItem(STORAGE_CURRENT_WEEK_KEY);
    if (rawCurrent) {
      const parsed: WeeklyChallengeSet = JSON.parse(rawCurrent);
      // If same week, retain user progress
      if (parsed.weekId === currentWeekId) {
        currentSet = {
          ...parsed,
          daysRemaining: getDaysRemainingInWeek(),
          completedCount: parsed.challenges.filter((c) => c.status === 'completed').length,
        };
      } else {
        // Week has rolled over! Archive previous week into history
        const archiveRecord: WeeklyHistoryRecord = {
          weekId: parsed.weekId,
          weekLabel: parsed.weekLabel,
          completedCount: parsed.challenges.filter((c) => c.status === 'completed').length,
          totalCount: parsed.challenges.length,
          completedDate: new Date().toLocaleDateString(),
          challenges: parsed.challenges,
        };
        history = [archiveRecord, ...history.slice(0, 11)];
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
      }
    }
  } catch (e) {
    currentSet = null;
  }

  // If no current week set exists for this week, generate one
  if (!currentSet) {
    currentSet = generateWeeklyChallengeSet(unlockedLessonIds, completedLessonIds, learnerId);
    saveWeeklyChallengeSet(currentSet);
  }

  return { currentSet, history };
}

/**
 * Saves the weekly challenge set to localStorage
 */
export function saveWeeklyChallengeSet(set: WeeklyChallengeSet): void {
  try {
    localStorage.setItem(STORAGE_CURRENT_WEEK_KEY, JSON.stringify(set));
  } catch (e) {
    // ignore quota errors
  }
}

/**
 * Updates a challenge's status (e.g. when solved or attempted)
 */
export function updateChallengeInSet(
  set: WeeklyChallengeSet,
  challengeId: string,
  updates: Partial<ActiveWeeklyChallenge>
): WeeklyChallengeSet {
  const updatedChallenges = set.challenges.map((c) => {
    if (c.id === challengeId) {
      return { ...c, ...updates };
    }
    return c;
  });

  const completedCount = updatedChallenges.filter((c) => c.status === 'completed').length;

  const newSet: WeeklyChallengeSet = {
    ...set,
    challenges: updatedChallenges,
    completedCount,
  };

  saveWeeklyChallengeSet(newSet);
  return newSet;
}
