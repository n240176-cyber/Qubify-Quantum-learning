import React, { useState, useEffect } from 'react';
import { AppView, LearningNodeItem, UserStats, ChallengeItem } from './types';
import { 
  BEGINNER_NODES, 
  INTERMEDIATE_NODES, 
  INITIAL_USER_STATS, 
  CHALLENGE_LIST 
} from './data/learningData';

// Reusable Navigation & Common Components
import { AIHelpButton } from './components/common/AIHelpButton';
import { ProfileModal } from './components/common/ProfileModal';

// Auth & Intro Components
import { IntroScreen } from './components/auth/IntroScreen';
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
import { QuantumLabView } from './views/QuantumLabView';
import { ChallengesView } from './views/ChallengesView';
import { ProgressView } from './views/ProgressView';

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
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  
  // User & Curriculum State with localStorage persistence
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('qubify_user_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...INITIAL_USER_STATS, name: 'Qubify Learner' };
  });

  const [beginnerNodes, setBeginnerNodes] = useState<LearningNodeItem[]>(() => {
    try {
      const saved = localStorage.getItem('qubify_beginner_nodes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return BEGINNER_NODES;
  });

  const [intermediateNodes, setIntermediateNodes] = useState<LearningNodeItem[]>(() => {
    try {
      const saved = localStorage.getItem('qubify_intermediate_nodes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INTERMEDIATE_NODES;
  });

  const [challenges, setChallenges] = useState<ChallengeItem[]>(() => {
    try {
      const saved = localStorage.getItem('qubify_challenges');
      if (saved) return JSON.parse(saved);
    } catch {}
    return CHALLENGE_LIST;
  });
  
  // Selected lesson for the Lesson Page Template (defaults to Lesson 1: Bit)
  const [selectedLesson, setSelectedLesson] = useState<LearningNodeItem>(
    beginnerNodes[0] || BEGINNER_NODES[0]
  );

  // Profile modal toggle
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qubify_user_stats', JSON.stringify(userStats));
    } catch {}
  }, [userStats]);

  useEffect(() => {
    try {
      localStorage.setItem('qubify_beginner_nodes', JSON.stringify(beginnerNodes));
    } catch {}
  }, [beginnerNodes]);

  useEffect(() => {
    try {
      localStorage.setItem('qubify_intermediate_nodes', JSON.stringify(intermediateNodes));
    } catch {}
  }, [intermediateNodes]);

  useEffect(() => {
    try {
      localStorage.setItem('qubify_challenges', JSON.stringify(challenges));
    } catch {}
  }, [challenges]);

  // Prototype login handler
  const handlePrototypeLogin = async () => {
    // 500ms simulated login
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      localStorage.setItem('qubify_is_authenticated', 'true');
      localStorage.setItem(
        'qubify_prototype_user',
        JSON.stringify({
          id: 'qub-learner-1',
          name: userStats.name || 'Qubify Learner',
          email: 'learner@qubify.demo',
          avatar: 'QL',
          provider: 'prototype-google',
        })
      );
    } catch {}
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  // Prototype logout handler (returns to login screen, keeps learning progress)
  const handleLogout = () => {
    try {
      localStorage.setItem('qubify_is_authenticated', 'false');
    } catch {}
    setIsAuthenticated(false);
  };

  // Reset Prototype Progress
  const handleResetProgress = () => {
    try {
      localStorage.removeItem('qubify_user_stats');
      localStorage.removeItem('qubify_beginner_nodes');
      localStorage.removeItem('qubify_intermediate_nodes');
      localStorage.removeItem('qubify_challenges');
      localStorage.removeItem('qubify_weekly_challenges');
      localStorage.removeItem('qubify_lab_run_history');
    } catch {}
    setUserStats({ ...INITIAL_USER_STATS, name: 'Qubify Learner' });
    setBeginnerNodes(BEGINNER_NODES);
    setIntermediateNodes(INTERMEDIATE_NODES);
    setChallenges(CHALLENGE_LIST);
    setSelectedLesson(BEGINNER_NODES[0]);
    setCurrentView('dashboard');
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

  // Lesson completion handler
  const handleCompleteLesson = (advanceToNext = false) => {
    const nextNumber = Number(selectedLesson.number) + 1;
    const nextNode = beginnerNodes.find((n) => Number(n.number) === nextNumber);

    // Mark current lesson completed
    if (selectedLesson.category === 'intermediate') {
      setIntermediateNodes((prev) =>
        prev.map((n) => {
          if (n.id === selectedLesson.id) {
            return { ...n, status: 'completed' };
          }
          if (selectedLesson.id === 'inter-1' && n.id === 'inter-2') {
            return { ...n, status: 'current' };
          }
          if (selectedLesson.id === 'inter-2' && n.id === 'inter-3') {
            return { ...n, status: 'current' };
          }
          if (selectedLesson.id === 'inter-3' && n.id === 'inter-4') {
            return { ...n, status: 'current' };
          }
          if (selectedLesson.id === 'inter-4' && n.id === 'inter-5') {
            return { ...n, status: 'current' };
          }
          if (selectedLesson.id === 'inter-5' && n.id === 'inter-6') {
            return { ...n, status: 'current' };
          }
          if (selectedLesson.id === 'inter-6' && n.id === 'inter-7') {
            return { ...n, status: 'upcoming' };
          }
          return n;
        })
      );
    } else {
      setBeginnerNodes((prev) =>
        prev.map((n) => {
          if (n.id === selectedLesson.id) {
            return { ...n, status: 'completed' };
          }
          // Unlock next lesson if upcoming
          if (n.number === nextNumber && n.status === 'upcoming') {
            return { ...n, status: 'current' };
          }
          return n;
        })
      );
    }

    // Update user stats
    setUserStats((prev) => {
      const nextCompleted = Math.min(prev.totalLessons, prev.lessonsCompleted + 1);
      return {
        ...prev,
        xp: prev.xp + 50,
        lessonsCompleted: nextCompleted,
        currentLessonId: nextNode ? nextNode.id : prev.currentLessonId,
        currentLessonTitle: nextNode ? nextNode.title : prev.currentLessonTitle,
        beginnerCompletionPercent: Math.min(
          100,
          Math.round((nextCompleted / prev.totalLessons) * 100)
        ),
      };
    });

    if (advanceToNext && nextNode) {
      setSelectedLesson({ ...nextNode, status: 'current' });
      setCurrentView('lesson');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Return to path
      setCurrentView('path');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <IntroScreen onComplete={handleIntroComplete} />
        ) : !isAuthenticated ? (
          /* =====================================================
              STAGE 2: PROTOTYPE LOGIN SCREEN ("Welcome to Qubify")
              ===================================================== */
          <PrototypeLoginScreen onLogin={handlePrototypeLogin} />
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
              selectedLesson.id === 'lesson-1' || selectedLesson.title.toLowerCase() === 'bit' ? (
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
                    handleCompleteLesson(false);
                  }}
                  onNextLesson={() => {
                    handleNavigate('path');
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

                {/* User Profile & Preferences Modal */}
                <ProfileModal
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  userStats={userStats}
                  onLogout={handleLogout}
                  onResetProgress={handleResetProgress}
                />
              </AppShell>
            )}
          </>
        )}

      </div>
    </AuthProvider>
  );
}
