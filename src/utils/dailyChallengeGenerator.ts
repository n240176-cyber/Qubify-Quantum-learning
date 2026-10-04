import {
  ActiveWeeklyChallenge,
  LearningNodeItem,
} from '../types';

import { CHALLENGE_BANK } from '../data/challengeBank';

import { getEligibleLessonIds } from './weeklyChallengeGenerator';

import { getWeakTopics } from './topicPerformance';

export interface DailyChallengeSet {
  dateId: string;
  completedCount: number;
  challenges: ActiveWeeklyChallenge[];
}

const getDateId = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getCurrentUserId = () => {
  try {
    const raw =
      localStorage.getItem(
        'qubify_prototype_user'
      );

    if (!raw) return null;

    const user = JSON.parse(raw);

    if (
      user?.tracked === true &&
      user?.id
    ) {
      return user.id as string;
    }
  } catch {}

  return null;
};

const getStorageKey = () => {
  const userId =
    getCurrentUserId();

  const dateId = getDateId();

  return userId
    ? `qubify_${userId}_daily_${dateId}`
    : `qubify_guest_daily_${dateId}`;
};

const readStorage = () => {
  const key = getStorageKey();

  try {
    const userId =
      getCurrentUserId();

    return userId
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export const saveDailyChallenge = (
  set: DailyChallengeSet
) => {
  const key = getStorageKey();

  try {
    const userId =
      getCurrentUserId();

    if (userId) {
      localStorage.setItem(
        key,
        JSON.stringify(set)
      );
    } else {
      sessionStorage.setItem(
        key,
        JSON.stringify(set)
      );
    }
  } catch {}
};

const seededRandom = (
  seed: string
) => {
  let h =
    1779033703 ^ seed.length;

  for (
    let i = 0;
    i < seed.length;
    i++
  ) {
    h = Math.imul(
      h ^ seed.charCodeAt(i),
      3432918353
    );

    h =
      (h << 13) |
      (h >>> 19);
  }

  return () => {
    h = Math.imul(
      h ^ (h >>> 16),
      2246822507
    );

    h = Math.imul(
      h ^ (h >>> 13),
      3266489909
    );

    return (
      ((h ^= h >>> 16) >>> 0) /
      4294967296
    );
  };
};

export const generateDailyChallenge = (
  beginnerNodes: LearningNodeItem[],
  intermediateNodes: LearningNodeItem[]
): DailyChallengeSet => {
 const { completedIds } =
  getEligibleLessonIds(
    beginnerNodes,
    intermediateNodes
  );

  const eligible =
    CHALLENGE_BANK.filter(
      (challenge) => {
        const mainUnlocked =
          completedIds.includes(
  challenge.requiredLesson
);

        const secondaryUnlocked =
          !challenge.secondaryLesson ||
         completedIds.includes(
  challenge.secondaryLesson
);

        return (
          mainUnlocked &&
          secondaryUnlocked
        );
      }
    );
    // Always make enough questions available for the
// 3-question Daily Challenge.
//
// First preference = learner's unlocked topics.
// If fewer than 3 questions exist, safely include
// foundation questions from lesson-1 (Bit).

  const userId =
    getCurrentUserId() ||
    'guest';

  const dateId =
    getDateId();

  const rng =
    seededRandom(
      `${dateId}_${userId}`
    );
const shuffled = [
  ...eligible,
].sort(
  () => rng() - 0.5
);
  
  const weakTopics =
    getWeakTopics(2).map(
      (item) => item.topic
    );

  const selected =
    [] as typeof eligible;

  const usedIds =
    new Set<string>();

  // Question 1 + 2:
  // prefer weak topics
  for (
    const topic of weakTopics
  ) {
    const candidate =
      shuffled.find(
        (challenge) =>
          challenge.topic === topic &&
          !usedIds.has(
            challenge.id
          )
      );

    if (candidate) {
      selected.push(candidate);

      usedIds.add(
        candidate.id
      );
    }

    if (
      selected.length >= 2
    ) {
      break;
    }
  }

  // Fill remaining slots
  // with unlocked review questions.
  for (
    const challenge of shuffled
  ) {
    if (
      selected.length >= 3
    ) {
      break;
    }

    if (
      !usedIds.has(
        challenge.id
      )
    ) {
      selected.push(
        challenge
      );

      usedIds.add(
        challenge.id
      );
    }
  }
 


  const challenges =
    selected.map(
      (
        challenge,
        index
      ): ActiveWeeklyChallenge => ({
        ...challenge,

        orderNumber:
          index + 1,

        status:
          'not_started',

        attemptsCount: 0,

        isFinalChallenge:
          false,
      })
    );

  return {
    dateId,
    challenges,
    completedCount: 0,
  };
};

export const loadOrCreateDailyChallenge = (
  beginnerNodes: LearningNodeItem[],
  intermediateNodes: LearningNodeItem[]
): DailyChallengeSet => {
  const saved =
    readStorage();

  if (saved) {
    try {
      const parsed =
        JSON.parse(
          saved
        ) as DailyChallengeSet;

      if (
        parsed.dateId ===
        getDateId()
      ) {
        return {
          ...parsed,

          completedCount:
            parsed.challenges.filter(
              (challenge) =>
                challenge.status ===
                'completed'
            ).length,
        };
      }
    } catch {}
  }

  const newSet =
    generateDailyChallenge(
      beginnerNodes,
      intermediateNodes
    );

  saveDailyChallenge(
    newSet
  );

  return newSet;
};