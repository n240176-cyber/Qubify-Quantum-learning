import React, { useState, useEffect } from 'react';
import { AppView, LearningNodeItem, UserStats, ChallengeItem } from './types';
import {
  BEGINNER_NODES,
  INTERMEDIATE_NODES,
  INITIAL_USER_STATS,
  CHALLENGE_LIST,
  CURRICULUM_SECTIONS,
} from './data/learningData';

// Reusable Navigation & Common Components
import { AIHelpButton } from './components/common/AIHelpButton';
import { ProfileModal } from './components/common/ProfileModal';

// Auth & Intro Components
import { QubifyIntroView } from './views/QubifyIntroView';
import { PrototypeLoginScreen } from './components/auth/PrototypeLoginScreen';
import { AuthProvider } from './context/AuthContext';

// Views
import { LandingPage } from './views/LandingPage';
import { AuthPage } from './views/AuthPage';
import { OnboardingPage } from './views/OnboardingPage';
import { AppShell } from './components/navigation/AppShell';
import { LearnerDashboard } from './views/LearnerDashboard';
import { LearningPathView } from './views/LearningPathView';
import { LessonTemplateView } from './views/LessonTemplateView';
import { ClassicalVsQuantumLessonView } from './views/ClassicalVsQuantumLessonView';
import { BitLessonView } from './views/BitLessonView';
import { ProbabilityLessonView } from './views/ProbabilityLessonView';
import { QubitLessonView } from './views/QubitLessonView';
import { QuantumGatesLessonView } from './views/QuantumGatesLessonView';
import { QuantumCircuitLessonView } from './views/QuantumCircuitLessonView';
import { ShotsLessonView } from './views/ShotsLessonView';
import { QiskitLabView } from './views/QiskitLabView';
import { BeginnerChallengeView } from './views/BeginnerChallengeView';
import { BlochSphereLessonView } from './views/BlochSphereLessonView';
import { PhaseFoundationsLessonView } from './views/PhaseFoundationsLessonView';
import { ZGateLessonView } from './views/ZGateLessonView';
import { YGateLessonView } from './views/YGateLessonView';
import { SingleQubitComparisonView } from './views/SingleQubitComparisonView';
import { RotationGatesLessonView } from './views/RotationGatesLessonView';
import { MultipleQubitsLessonView } from './views/MultipleQubitsLessonView';
import { CNOTGateLessonView } from './views/CNOTGateLessonView';
import { EntanglementLessonView } from './views/EntanglementLessonView';
import { BellStateLessonView } from './views/BellStateLessonView';
import { QuantumLabView } from './views/QuantumLabView';
import { ChallengesView } from './views/ChallengesView';
import { ProgressView } from './views/ProgressView';

const getTrackedUserIdFromStorage = (): string | null => {
  try {
    const savedUser = localStorage.getItem('qubify_prototype_user');

    if (!savedUser) return null;

    const user = JSON.parse(savedUser);

    if (user?.tracked === true && user?.id) {
      return user.id;
    }
  } catch {}

  return null;
};

const userStorageKey = (
  userId: string,
  key: string
) => `qubify_${userId}_${key}`;
export default function App() {
  // 1. Intro Screen State (plays on initial open, ~2s)
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('qubify_has_seen_intro') === 'true';
    } catch {
      return false;
    }
  });

  // 2. Authentication State (Prototype local session)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qubify_is_authenticated') === 'true';
    } catch {
      return false;
    }
  });

 // Navigation View State
const [currentView, setCurrentView] =
  useState<AppView>('dashboard');

// The currently tracked demo user.
// null = guest or logged out.
const [
  activeTrackedUserId,
  setActiveTrackedUserId,
] = useState<string | null>(() =>
  getTrackedUserIdFromStorage()
);

// ---------------------------------------------------------
// USER STATS
// ---------------------------------------------------------

const [userStats, setUserStats] =
  useState<UserStats>(() => {
    const userId =
      getTrackedUserIdFromStorage();

    if (userId) {
      try {
        const saved = localStorage.getItem(
          userStorageKey(
            userId,
            'user_stats'
          )
        );

        if (saved) {
          return JSON.parse(saved);
        }
      } catch {}
    }

    return {
      ...INITIAL_USER_STATS,
      name: 'Qubify Learner',
    };
  });

// ---------------------------------------------------------
// BEGINNER NODES
// ---------------------------------------------------------

const [
  beginnerNodes,
  setBeginnerNodes,
] = useState<LearningNodeItem[]>(() => {
  const userId =
    getTrackedUserIdFromStorage();

  if (userId) {
    try {
      const saved = localStorage.getItem(
        userStorageKey(
          userId,
          'beginner_nodes'
        )
      );

      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }

  return BEGINNER_NODES;
});

// ---------------------------------------------------------
// INTERMEDIATE NODES
// ---------------------------------------------------------

const [
  intermediateNodes,
  setIntermediateNodes,
] = useState<LearningNodeItem[]>(() => {
  const userId =
    getTrackedUserIdFromStorage();

  if (userId) {
    try {
      const saved = localStorage.getItem(
        userStorageKey(
          userId,
          'intermediate_nodes'
        )
      );

      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }

  return INTERMEDIATE_NODES;
});

// ---------------------------------------------------------
// CHALLENGES
// ---------------------------------------------------------

const [
  challenges,
  setChallenges,
] = useState<ChallengeItem[]>(() => {
  const userId =
    getTrackedUserIdFromStorage();

  if (userId) {
    try {
      const saved = localStorage.getItem(
        userStorageKey(
          userId,
          'challenges'
        )
      );

      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }

  return CHALLENGE_LIST;
});

// ---------------------------------------------------------
// SELECTED LESSON
// ---------------------------------------------------------

const [
  selectedLesson,
  setSelectedLesson,
] = useState<LearningNodeItem>(
  beginnerNodes[0] ||
    BEGINNER_NODES[0]
);

// Profile modal
const [
  isProfileOpen,
  setIsProfileOpen,
] = useState(false);

// ---------------------------------------------------------
// LOAD ONE USER'S SAVED PROGRESS
// ---------------------------------------------------------

const loadProgressForUser = (
  userId: string,
  userName: string
) => {
  let nextStats: UserStats = {
    ...INITIAL_USER_STATS,
    name: userName,
  };

  let nextBeginner =
    BEGINNER_NODES;

  let nextIntermediate =
    INTERMEDIATE_NODES;

  let nextChallenges =
    CHALLENGE_LIST;

  try {
    const savedStats =
      localStorage.getItem(
        userStorageKey(
          userId,
          'user_stats'
        )
      );

    if (savedStats) {
      nextStats = {
        ...JSON.parse(savedStats),
        name: userName,
      };
    }

    const savedBeginner =
      localStorage.getItem(
        userStorageKey(
          userId,
          'beginner_nodes'
        )
      );

    if (savedBeginner) {
      nextBeginner =
        JSON.parse(savedBeginner);
    }

    const savedIntermediate =
      localStorage.getItem(
        userStorageKey(
          userId,
          'intermediate_nodes'
        )
      );

    if (savedIntermediate) {
      nextIntermediate =
        JSON.parse(
          savedIntermediate
        );
    }

    const savedChallenges =
      localStorage.getItem(
        userStorageKey(
          userId,
          'challenges'
        )
      );

    if (savedChallenges) {
      nextChallenges =
        JSON.parse(savedChallenges);
    }
  } catch {}

  setUserStats(nextStats);
  setBeginnerNodes(nextBeginner);
  setIntermediateNodes(
    nextIntermediate
  );
  setChallenges(nextChallenges);

  const allNodes = [
    ...nextBeginner,
    ...nextIntermediate,
  ];

  const currentNode =
    allNodes.find(
      (node) =>
        node.status === 'current'
    ) ||
    nextBeginner[0] ||
    BEGINNER_NODES[0];

  setSelectedLesson(currentNode);
};

// ---------------------------------------------------------
// SAVE ONLY TRACKED USERS
// ---------------------------------------------------------

useEffect(() => {
  if (!activeTrackedUserId) return;

  try {
    localStorage.setItem(
      userStorageKey(
        activeTrackedUserId,
        'user_stats'
      ),
      JSON.stringify(userStats)
    );
  } catch {}
}, [
  userStats,
  activeTrackedUserId,
]);

useEffect(() => {
  if (!activeTrackedUserId) return;

  try {
    localStorage.setItem(
      userStorageKey(
        activeTrackedUserId,
        'beginner_nodes'
      ),
      JSON.stringify(
        beginnerNodes
      )
    );
  } catch {}
}, [
  beginnerNodes,
  activeTrackedUserId,
]);

useEffect(() => {
  if (!activeTrackedUserId) return;

  try {
    localStorage.setItem(
      userStorageKey(
        activeTrackedUserId,
        'intermediate_nodes'
      ),
      JSON.stringify(
        intermediateNodes
      )
    );
  } catch {}
}, [
  intermediateNodes,
  activeTrackedUserId,
]);

useEffect(() => {
  if (!activeTrackedUserId) return;

  try {
    localStorage.setItem(
      userStorageKey(
        activeTrackedUserId,
        'challenges'
      ),
      JSON.stringify(challenges)
    );
  } catch {}
}, [
  challenges,
  activeTrackedUserId,
]);

  // Prototype login handler
  
// Demo tracked login handler
const handlePrototypeLogin = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  await new Promise((resolve) =>
    setTimeout(resolve, 450)
  );

  const demoUsers = [
    {
      id: 'qub-demo-1',
      name: 'Demo Learner 1',
      email: 'student1@qubify.demo',
      password: 'qubify123',
      avatar: 'D1',
    },
    {
      id: 'qub-demo-2',
      name: 'Demo Learner 2',
      email: 'student2@qubify.demo',
      password: 'qubify123',
      avatar: 'D2',
    },
    {
      id: 'qub-demo-3',
      name: 'Demo Learner 3',
      email: 'student3@qubify.demo',
      password: 'qubify123',
      avatar: 'D3',
    },
  ];

  const normalizedEmail =
    email.trim().toLowerCase();

  const user = demoUsers.find(
    (candidate) =>
      candidate.email ===
        normalizedEmail &&
      candidate.password ===
        password
  );

  if (!user) {
    return {
      success: false,
      error:
        'Invalid demo email or password.',
    };
  }

  try {
    localStorage.setItem(
      'qubify_is_authenticated',
      'true'
    );

    localStorage.setItem(
      'qubify_prototype_user',
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: 'demo-account',
        tracked: true,
      })
    );
  } catch {}

 setActiveTrackedUserId(
  user.id
);

loadProgressForUser(
  user.id,
  user.name
);

setIsAuthenticated(true);
setCurrentView('dashboard');

  return {
    success: true,
  };
};

// Guest login handler
const handleGuestLogin = async () => {
  await new Promise((resolve) =>
    setTimeout(resolve, 250)
  );

  try {
    localStorage.setItem(
      'qubify_is_authenticated',
      'true'
    );

    localStorage.setItem(
      'qubify_prototype_user',
      JSON.stringify({
        id: 'guest',
        name: 'Guest Learner',
        email: null,
        avatar: 'G',
        provider: 'guest',
        tracked: false,
      })
    );
  } catch {}

  setUserStats((prev) => ({
    ...prev,
    name: 'Guest Learner',
  }));
setActiveTrackedUserId(null);

setUserStats({
  ...INITIAL_USER_STATS,
  name: 'Guest Learner',
});

setBeginnerNodes(
  BEGINNER_NODES
);

setIntermediateNodes(
  INTERMEDIATE_NODES
);

setChallenges(
  CHALLENGE_LIST
);

setSelectedLesson(
  BEGINNER_NODES[0]
);
  setIsAuthenticated(true);
  setCurrentView('dashboard');
};
  // Prototype logout handler (returns to login screen, keeps learning progress)
  const handleLogout = () => {
  try {
    localStorage.setItem(
      'qubify_is_authenticated',
      'false'
    );

    localStorage.removeItem(
      'qubify_prototype_user'
    );
  } catch {}

  setActiveTrackedUserId(null);
  setIsAuthenticated(false);
};

  // Reset Prototype Progress
const handleResetProgress = () => {
  let learnerName = 'Qubify Learner';
  let learnerId: string | null = null;

  try {
    // Keep the logged-in account, but remove its learning data.
    const rawUser = localStorage.getItem(
      'qubify_prototype_user'
    );

    if (rawUser) {
      const user = JSON.parse(rawUser);

      learnerName =
        user?.name || 'Qubify Learner';

      if (
        user?.tracked === true &&
        user?.id
      ) {
        learnerId = user.id;
      }
    }

    // --------------------------------------------------
    // DELETE ALL DATA BELONGING TO THIS DEMO LEARNER
    // --------------------------------------------------

    if (learnerId) {
      const prefix =
        `qubify_${learnerId}_`;

      const keysToDelete: string[] = [];

      for (
        let i = 0;
        i < localStorage.length;
        i++
      ) {
        const key =
          localStorage.key(i);

        if (
          key &&
          key.startsWith(prefix)
        ) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(
        (key) =>
          localStorage.removeItem(key)
      );
    }

    // --------------------------------------------------
    // DELETE OLD LEGACY / SHARED DATA
    // --------------------------------------------------

    const legacyKeys = [
      'qubify_user_stats',
      'qubify_beginner_nodes',
      'qubify_intermediate_nodes',
      'qubify_challenges',
      'qubify_weekly_challenges',
      'qubify_weekly_set_v2',
      'qubify_weekly_history_v2',
      'qubify_lab_run_history',
    ];

    legacyKeys.forEach(
      (key) =>
        localStorage.removeItem(key)
    );
  } catch {}

  // --------------------------------------------------
  // RESET REACT STATE TO TRUE BEGINNER STATE
  // --------------------------------------------------

  setUserStats({
    ...INITIAL_USER_STATS,
    name: learnerName,
  });

  setBeginnerNodes(
    BEGINNER_NODES.map(
      (node) => ({ ...node })
    )
  );

  setIntermediateNodes(
    INTERMEDIATE_NODES.map(
      (node) => ({ ...node })
    )
  );

  setChallenges(
    CHALLENGE_LIST.map(
      (challenge) => ({
        ...challenge,
      })
    )
  );

  setSelectedLesson(
    BEGINNER_NODES[0]
  );

  setCurrentView(
    'dashboard'
  );
};

  // Navigation handler
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lesson selector
  const handleSelectLesson = (item: LearningNodeItem) => {
    if (item.status === 'locked') return;
    setSelectedLesson(item);
    setCurrentView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

const handleCompleteLesson = (
  advanceToNext = false
) => {
  /*
   * The curriculum itself now defines the real
   * learning order.
   *
   * Advanced Quantum is intentionally excluded.
   */
  const curriculumOrder =
    CURRICULUM_SECTIONS
      .filter(
        (section) => !section.isFuture
      )
      .flatMap(
        (section) => section.nodeIds
      );

  const currentIndex =
    curriculumOrder.indexOf(
      selectedLesson.id
    );

  const nextLessonId =
    currentIndex >= 0 &&
    currentIndex <
      curriculumOrder.length - 1
      ? curriculumOrder[
          currentIndex + 1
        ]
      : null;

  const allCurrentNodes = [
    ...beginnerNodes,
    ...intermediateNodes,
  ];

  const nextNode = nextLessonId
    ? allCurrentNodes.find(
        (node) =>
          node.id === nextLessonId
      )
    : undefined;

  /*
   * Complete/unlock beginner nodes.
   */
  setBeginnerNodes((prev) =>
    prev.map((node) => {
      if (
        node.id === selectedLesson.id
      ) {
        return {
          ...node,
          status: 'completed',
        };
      }

      if (
        nextLessonId &&
        node.id === nextLessonId
      ) {
        return {
          ...node,
          status: 'current',
        };
      }

      return node;
    })
  );

  /*
   * Complete/unlock intermediate nodes.
   */
  setIntermediateNodes((prev) =>
    prev.map((node) => {
      if (
        node.id === selectedLesson.id
      ) {
        return {
          ...node,
          status: 'completed',
        };
      }

      if (
        nextLessonId &&
        node.id === nextLessonId
      ) {
        return {
          ...node,
          status: 'current',
        };
      }

      return node;
    })
  );

  /*
   * Basic learner statistics.
   */
  setUserStats((prev) => ({
    ...prev,

    xp: prev.xp + 50,

    lessonsCompleted:
      prev.lessonsCompleted + 1,

    currentLessonId:
      nextNode?.id ??
      prev.currentLessonId,

    currentLessonTitle:
      nextNode?.title ??
      prev.currentLessonTitle,
  }));

  /*
   * Move directly into next lesson when
   * lesson completion requests it.
   */
  if (
    advanceToNext &&
    nextNode
  ) {
    setSelectedLesson({
      ...nextNode,
      status: 'current',
    });

    setCurrentView('lesson');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  } else {
    setCurrentView('path');
  }
};

  // Challenge solved handler
  const handleSolveChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, solved: true } : c))
    );

    setUserStats((prev) => {
      const alreadySolved = challenges.find((c) => c.id === challengeId)?.solved;
      if (alreadySolved) return prev;

      const newSolvedCount = prev.challengesCompleted + 1;
      return {
        ...prev,
        xp: prev.xp + 40,
        challengesCompleted: newSolvedCount,
        beginnerCompletionPercent: Math.min(
          100,
          Math.round(((prev.lessonsCompleted + newSolvedCount) / (prev.totalLessons + prev.totalChallenges)) * 100)
        ),
      };
    });
  };

  // Complete Intro Screen transition
  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('qubify_has_seen_intro', 'true');
    } catch {}
    setHasSeenIntro(true);
  };

  return (
    <AuthProvider onResetProgress={handleResetProgress}>
      <div className="min-h-screen bg-[#232425] text-[#F1F1F1] flex flex-col font-sans antialiased selection:bg-[#1FA7DA]/30 selection:text-white">
        
        {/* =======================================================
            STAGE 1: BRANDED INTRO SCREEN (Plays ~2s on initial load)
            ======================================================= */}
       {!hasSeenIntro ? (
  <QubifyIntroView onComplete={handleIntroComplete} />
) : !isAuthenticated ? (
          /* =====================================================
              STAGE 2: PROTOTYPE LOGIN SCREEN ("Welcome to Qubify")
              ===================================================== */
          <PrototypeLoginScreen
  onLogin={handlePrototypeLogin}
  onGuest={handleGuestLogin}
/>
        ) : (
          /* =====================================================
              STAGE 3: MAIN APP (Dashboard, Path, Lessons, Lab, etc.)
              ===================================================== */
          <>
            {currentView === 'landing' ? (
              <LandingPage onNavigate={handleNavigate} />
            ) : currentView === 'auth' ? (
              <AuthPage 
                onNavigate={handleNavigate}
                onLoginSuccess={(name) => {
                  if (name) {
                    setUserStats((prev) => ({ ...prev, name }));
                  }
                  setIsAuthenticated(true);
                }}
              />
            ) : currentView === 'onboarding' ? (
              <OnboardingPage
                userName={userStats.name || 'Qubify Learner'}
                onCompleteOnboarding={() => {
                  handleNavigate('dashboard');
                }}
              />
 ) : currentView === 'lesson' ? (
  /* Full-screen lesson views */
  selectedLesson.id === 'lesson-0' ||
  selectedLesson.title.toLowerCase() === 'classical vs quantum computing' ? (
    <ClassicalVsQuantumLessonView
      onExit={() => handleNavigate('path')}
      onComplete={() => {
        handleCompleteLesson(true);
      }}
    />
  ) : selectedLesson.id === 'lesson-1' ||
      selectedLesson.title.toLowerCase() === 'bit' ? (
    <BitLessonView
      onExit={() => handleNavigate('path')}
      onComplete={() => {
        handleCompleteLesson(true);
      }}
    />
              ) : selectedLesson.id === 'lesson-2' || selectedLesson.title.toLowerCase() === 'probability' ? (
                <ProbabilityLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(true);
                  }}
                />
              ) : selectedLesson.id === 'lesson-3' || selectedLesson.title.toLowerCase() === 'qubit' ? (
                <QubitLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(true);
                  }}
                />
              ) : selectedLesson.id === 'lesson-4' || (selectedLesson.id?.startsWith('lesson-') && selectedLesson.title.toLowerCase().includes('gate') && !selectedLesson.title.toLowerCase().includes('circuit')) || (selectedLesson.id === 'quantum-gates') ? (
                <QuantumGatesLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(true);
                  }}
                />
              ) : selectedLesson.id === 'lesson-5' || selectedLesson.id === 'lesson-6' || selectedLesson.title.toLowerCase().includes('circuit') ? (
                <QuantumCircuitLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(true);
                  }}
                />
              ) : selectedLesson.id === 'lesson-7' || selectedLesson.title.toLowerCase().includes('shot') ? (
                <ShotsLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(true);
                  }}
                />
              ) : selectedLesson.id === 'lesson-8' || selectedLesson.title.toLowerCase().includes('qiskit') ? (
                <QiskitLabView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(true);
                  }}
                />
              ) : selectedLesson.id === 'lesson-9' || selectedLesson.title.toLowerCase().includes('challenge') ? (
                <BeginnerChallengeView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(true);
                  }}
                  onNavigateToLab={() => handleNavigate('lab')}
                  onReviewLesson={(lessonId: string) => {
                    const node = beginnerNodes.find(n => n.id === lessonId);
                    if (node) {
                      handleSelectLesson(node);
                    } else {
                      handleNavigate('path');
                    }
                  }}
                  onContinueToIntermediate={() => {
                    const blochNode = intermediateNodes.find((n: LearningNodeItem) => n.id === 'inter-1') || {
                      id: 'inter-1',
                      number: 'Int 1',
                      title: 'Bloch Sphere',
                      subtitle: 'Visualizing single-qubit quantum states',
                      status: 'current' as const,
                      category: 'intermediate' as const,
                      xp: 50,
                      estimatedMinutes: 8,
                    };
                    handleSelectLesson(blochNode);
                  }}
                />
              ) : selectedLesson.id === 'inter-1' || selectedLesson.id === 'bloch-sphere' || selectedLesson.title.toLowerCase().includes('bloch') ? (
                <BlochSphereLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(false);
                  }}
                  onNextLesson={() => {
                    const phaseNode = intermediateNodes.find((n) => n.id === 'inter-2') || {
                      id: 'inter-2',
                      number: 'Int 2',
                      title: 'Phase Foundations',
                      subtitle: 'Amplitudes, probabilities, and the |+⟩ & |−⟩ states',
                      status: 'current' as const,
                      category: 'intermediate' as const,
                      xp: 60,
                      estimatedMinutes: 10,
                    };
                    handleSelectLesson(phaseNode);
                  }}
                />
              ) : selectedLesson.id === 'inter-2' || selectedLesson.id === 'phase-foundations' || selectedLesson.title.toLowerCase().includes('phase') ? (
                <PhaseFoundationsLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(false);
                  }}
                  onNextLesson={() => {
                    const zNode = intermediateNodes.find((n) => n.id === 'inter-3') || {
                      id: 'inter-3',
                      number: 'Int 3',
                      title: 'Z Gate',
                      subtitle: 'Phase flips, |+⟩ ↔ |−⟩, and equator rotations',
                      status: 'current' as const,
                      category: 'intermediate' as const,
                      xp: 60,
                      estimatedMinutes: 8,
                    };
                    handleSelectLesson(zNode);
                  }}
                />
              ) : selectedLesson.id === 'inter-3' || selectedLesson.id === 'z-gate' || selectedLesson.title.toLowerCase().includes('z gate') ? (
                <ZGateLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(false);
                  }}
                  onNextLesson={() => {
                    const yNode = intermediateNodes.find((n) => n.id === 'inter-4') || {
                      id: 'inter-4',
                      number: 'Int 4',
                      title: 'Y Gate',
                      subtitle: 'Phase rotation and complex dynamics',
                      status: 'current' as const,
                      category: 'intermediate' as const,
                      xp: 60,
                      estimatedMinutes: 8,
                    };
                    handleSelectLesson(yNode);
                  }}
                />
              ) : selectedLesson.id === 'inter-4' || selectedLesson.id === 'y-gate' || selectedLesson.title.toLowerCase().includes('y gate') ? (
                <YGateLessonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(false);
                  }}
                  onNextLesson={() => {
                    const compNode = intermediateNodes.find((n) => n.id === 'inter-5') || {
                      id: 'inter-5',
                      number: 'Int 5',
                      title: 'Single-Qubit Gate Comparison',
                      subtitle: 'Geometric rotation sticks: X vs Y vs Z',
                      status: 'current' as const,
                      category: 'intermediate' as const,
                      xp: 75,
                      estimatedMinutes: 12,
                    };
                    handleSelectLesson(compNode);
                  }}
                />
              ) : selectedLesson.id === 'inter-5' ||
                selectedLesson.id === 'single-qubit-gate-comparison' ||
                selectedLesson.title.toLowerCase().includes('comparison') ? (
                <SingleQubitComparisonView
                  onExit={() => handleNavigate('path')}
                  onComplete={() => {
                    handleCompleteLesson(false);
                  }}
                  onNextLesson={() => {
                    const rotNode = intermediateNodes.find((n) => n.id === 'inter-6') || {
                      id: 'inter-6',
                      number: 'Int 6',
                      title: 'Rotation Gates',
                      subtitle: 'Continuous angles: Rx, Ry, and Rz',
                      status: 'current' as const,
                      category: 'intermediate' as const,
                      xp: 75,
                      estimatedMinutes: 10,
                    };
                    handleSelectLesson(rotNode);
                  }}
                />
              ) : selectedLesson.id === 'inter-6' ||
                selectedLesson.id === 'rotation-gates' ||
                selectedLesson.title.toLowerCase().includes('rotation') ? (
                <RotationGatesLessonView
  onExit={() => handleNavigate('path')}
  onComplete={() => {
    handleCompleteLesson(true);
  }}
/>
              ) : selectedLesson.id === 'inter-7' ||
  selectedLesson.title.toLowerCase().includes('multiple qubits') ? (
  <MultipleQubitsLessonView
    onExit={() => handleNavigate('path')}
    onComplete={() => {
      handleCompleteLesson(true);
    }}
  />
) : selectedLesson.id === 'inter-8' ||
  selectedLesson.title.toLowerCase().includes('cnot') ? (
  <CNOTGateLessonView
    onExit={() => handleNavigate('path')}
    onComplete={() => {
      handleCompleteLesson(true);
    }}
  />
) : selectedLesson.id === 'inter-9' ||
  selectedLesson.title.toLowerCase().includes('entanglement') ? (
  <EntanglementLessonView
    onExit={() => handleNavigate('path')}
    onComplete={() => {
      handleCompleteLesson(true);
    }}
  />
) : selectedLesson.id === 'inter-10' ||
  selectedLesson.title.toLowerCase().includes('bell state') ? (
  <BellStateLessonView
    onExit={() => handleNavigate('path')}
    onComplete={() => {
      handleCompleteLesson(false);
    }}
  />
) : (
  <LessonTemplateView
                  currentLesson={selectedLesson}
                  allLessons={beginnerNodes}
                  onSelectLesson={handleSelectLesson}
                  onBackToPath={() => handleNavigate('path')}
                  onCompleteLesson={() => handleCompleteLesson(false)}
                />
              )
            ) : currentView === 'lab' ? (
              <QuantumLabView
                onNavigate={handleNavigate}
                onOpenProfile={() => setIsProfileOpen(true)}
              />
            ) : (
              /* Platform Shell Layout with Persistent Left Sidebar */
              <AppShell
                currentView={currentView}
                onNavigate={handleNavigate}
                userStats={userStats}
                onOpenProfile={() => setIsProfileOpen(true)}
              >
                {currentView === 'dashboard' && (
                  <LearnerDashboard
                    userStats={userStats}
                    beginnerNodes={beginnerNodes}
                    onNavigate={handleNavigate}
                    onSelectLesson={handleSelectLesson}
                  />
                )}

                {currentView === 'path' && (
                  <LearningPathView
                    beginnerNodes={beginnerNodes}
                    intermediateNodes={intermediateNodes}
                    userStats={userStats}
                    onSelectNode={handleSelectLesson}
                  />
                )}

                {currentView === 'challenges' && (
                  <ChallengesView
                    challenges={challenges}
                    onSolveChallenge={handleSolveChallenge}
                    onContinueToNextTrack={() => handleNavigate('path')}
                    beginnerNodes={beginnerNodes}
                    intermediateNodes={intermediateNodes}
                    userStats={userStats}
                  />
                )}

                {currentView === 'progress' && (
                  <ProgressView
  userStats={userStats}
  beginnerNodes={beginnerNodes}
  intermediateNodes={intermediateNodes}
  onNavigateToPath={() => handleNavigate('path')}
  onNavigateToLab={() => handleNavigate('lab')}
  onNavigateToChallenges={() => handleNavigate('challenges')}
/>
                )}

                {/* Floating AI Help Assistant: "Ask Qubify AI" */}
                <AIHelpButton
                  contextTopic={
                    currentView === 'challenges'
                      ? 'Quantum Challenge Verification'
                      : currentView === 'path'
                      ? 'Quantum Learning Roadmap'
                      : 'Quantum Computing Foundations'
                  }
                />

               
              </AppShell>
            )}
            {/* Global Profile Modal */}
            <ProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              userStats={userStats}
              onLogout={handleLogout}
              onResetProgress={handleResetProgress}
            />

          </>
        )}

      </div>
    </AuthProvider>
  );
}
