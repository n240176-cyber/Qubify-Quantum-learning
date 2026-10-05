export interface TopicPerformance {
  topic: string;
  correct: number;
  wrong: number;
  attempts: number;
  masteryScore: number;
  lastAttemptAt: string;
}

type TopicPerformanceMap = Record<
  string,
  TopicPerformance
>;

const getCurrentTrackedUserId =
  (): string | null => {
    try {
      const rawUser =
        localStorage.getItem(
          'qubify_prototype_user'
        );

      if (!rawUser) {
        return null;
      }

      const user = JSON.parse(rawUser);

      if (
        user?.tracked === true &&
        user?.id
      ) {
        return user.id;
      }
    } catch {}

    return null;
  };

const getStorageKey = (
  userId: string
) =>
  `qubify_${userId}_topic_performance`;

export const getTopicPerformance =
  (): TopicPerformanceMap => {
    const userId =
      getCurrentTrackedUserId();

    if (!userId) {
      return {};
    }

    try {
      const saved =
        localStorage.getItem(
          getStorageKey(userId)
        );

      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return {};
  };

export const recordTopicAttempt = (
  topic: string,
  isCorrect: boolean
) => {
  const userId =
    getCurrentTrackedUserId();

  // Guest mode is intentionally untracked.
  if (!userId) {
    return;
  }

  const allPerformance =
    getTopicPerformance();

  const existing =
    allPerformance[topic] || {
      topic,
      correct: 0,
      wrong: 0,
      attempts: 0,
      masteryScore: 0,
      lastAttemptAt: '',
    };

  const correct =
    existing.correct +
    (isCorrect ? 1 : 0);

  const wrong =
    existing.wrong +
    (isCorrect ? 0 : 1);

  const attempts =
    correct + wrong;

  const masteryScore =
    attempts > 0
      ? Math.round(
          (correct / attempts) * 100
        )
      : 0;

  allPerformance[topic] = {
    topic,
    correct,
    wrong,
    attempts,
    masteryScore,
    lastAttemptAt:
      new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(
        allPerformance
      )
    );
  } catch {}
};

export const getWeakTopics = (
  limit = 3
): TopicPerformance[] => {
  const performance =
    Object.values(
      getTopicPerformance()
    );

  return performance
    .filter(
  (item) => item.attempts >= 2
)
    .sort((a, b) => {
      if (
        a.masteryScore !==
        b.masteryScore
      ) {
        return (
          a.masteryScore -
          b.masteryScore
        );
      }

      return (
        b.attempts -
        a.attempts
      );
    })
    .slice(0, limit);
};