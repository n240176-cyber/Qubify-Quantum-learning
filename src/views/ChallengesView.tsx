import { CHALLENGE_BANK } from '../data/challengeBank';
import { DailyChallengePanel } from '../components/challenges/DailyChallengePanel';
import { LearningInsightsPanel } from '../components/challenges/LearningInsightsPanel';
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  History
} from 'lucide-react';
import { 
  ChallengeItem, 
  LearningNodeItem, 
  UserStats, 
  ActiveWeeklyChallenge, 
  WeeklyChallengeSet, 
  WeeklyHistoryRecord 
} from '../types';
import { BEGINNER_NODES, INTERMEDIATE_NODES } from '../data/learningData';
import { 
  getEligibleLessonIds, 
  loadOrInitWeeklyChallenges, 
  updateChallengeInSet 
} from '../utils/weeklyChallengeGenerator';
import { WeeklyChallengeModal } from '../components/challenges/WeeklyChallengeModal';
import { CompletionModal } from '../components/common/CompletionModal';
import { ProgressBar } from '../components/common/ProgressBar';

interface ChallengesViewProps {
  challenges?: ChallengeItem[];
  onSolveChallenge?: (id: string) => void;
  onContinueToNextTrack?: () => void;
  beginnerNodes?: LearningNodeItem[];
  intermediateNodes?: LearningNodeItem[];
  userStats?: UserStats;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  onSolveChallenge,
  onContinueToNextTrack,
  beginnerNodes = BEGINNER_NODES,
  intermediateNodes = INTERMEDIATE_NODES,
  userStats,
}) => {
  // Extract learner's actual unlocked and completed lessons
  const { unlockedIds, completedIds, topicNames } = getEligibleLessonIds(
    beginnerNodes,
    intermediateNodes
  );
  const learnedChallengePool =
  CHALLENGE_BANK.filter(
    (challenge) => {
      const mainLearned =
        completedIds.includes(
          challenge.requiredLesson
        );

      const secondaryLearned =
        !challenge.secondaryLesson ||
        completedIds.includes(
          challenge.secondaryLesson
        );

      return (
        mainLearned &&
        secondaryLearned
      );
    }
  );

const canStartDaily =
  learnedChallengePool.length >= 3;
  const canStartWeekly =
  learnedChallengePool.length >= 7;
  

  // Weekly challenge state
  const [weeklySet, setWeeklySet] = useState<WeeklyChallengeSet>(() => {
    const { currentSet } = loadOrInitWeeklyChallenges(
      unlockedIds,
      completedIds,
      userStats?.name || 'guest'
    );
    return currentSet;
  });

  const [history, setHistory] = useState<WeeklyHistoryRecord[]>(() => {
    const { history } = loadOrInitWeeklyChallenges(
      unlockedIds,
      completedIds,
      userStats?.name || 'guest'
    );
    return history;
  });

  // Active challenge modal state
  const [activeChallenge, setActiveChallenge] = useState<ActiveWeeklyChallenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  // Completion modal for finishing all 7 challenges
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);

  // Toggle for Previous Weeks history view
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Update set whenever lessons progress
  useEffect(() => {
    const { currentSet, history: updatedHistory } = loadOrInitWeeklyChallenges(
      unlockedIds,
      completedIds,
      userStats?.name || 'guest'
    );
    setWeeklySet(currentSet);
    setHistory(updatedHistory);
  }, [unlockedIds.length, completedIds.length, userStats?.name]);

  // Handle opening a challenge
  const handleOpenChallenge = (challenge: ActiveWeeklyChallenge, readOnly = false) => {
    setActiveChallenge(challenge);
    setIsReadOnly(readOnly);
    setIsModalOpen(true);

    // If not started, mark in progress
    if (challenge.status === 'not_started' && !readOnly) {
      const updated = updateChallengeInSet(weeklySet, challenge.id, {
        status: 'in_progress',
      });
      setWeeklySet(updated);
    }
  };

  // Handle completion of a challenge
  const handleCompleteChallenge = (challengeId: string) => {
    const updated = updateChallengeInSet(weeklySet, challengeId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    setWeeklySet(updated);

    if (onSolveChallenge) {
      onSolveChallenge(challengeId);
    }

    // Check if all 7 are now completed
    if (updated.completedCount === 7) {
      setTimeout(() => {
        setIsCelebrationOpen(true);
      }, 400);
    }
  };

  // Next challenge in sequence
  const handleNextChallenge = () => {
    if (!activeChallenge) return;
    const nextOrder = activeChallenge.orderNumber + 1;
    const nextCh = weeklySet.challenges.find((c) => c.orderNumber === nextOrder);
    if (nextCh) {
      setActiveChallenge(nextCh);
      setIsReadOnly(nextCh.status === 'completed');
    } else {
      setIsModalOpen(false);
    }
  };

  const completedCount = weeklySet.challenges.filter((c) => c.status === 'completed').length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  const difficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 capitalize">Easy</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-[#1FA7DA] bg-[#1E3545] border border-[#1FA7DA]/30 capitalize">Medium</span>;
      case 'challenge':
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-purple-400 bg-purple-950/40 border border-purple-500/30 capitalize">Challenge</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left pb-12">
    {canStartDaily ? (
  <>
    <DailyChallengePanel
      beginnerNodes={beginnerNodes}
      intermediateNodes={intermediateNodes}
    />

    <LearningInsightsPanel />
  </>
) : (
  <div className="rounded-xl border border-[#44474A] bg-[#28292A] p-6">
    <div className="text-xs font-bold uppercase tracking-wider text-[#1FA7DA]">
      Daily Challenge
    </div>

    <h2 className="mt-2 text-xl font-bold text-[#F1F1F1]">
      Keep learning to unlock practice
    </h2>

    <p className="mt-2 text-sm text-[#B7BABD]">
      Qubify only creates challenge questions
      from lessons you have already completed.
    </p>

    <p className="mt-3 text-xs text-[#858A8E]">
      Complete a few lessons first. Your Daily
      Challenge will unlock automatically when
      enough practice questions are available.
    </p>
  </div>
)}
      
      {/* 1. HEADER: Flat panel with progress and countdown */}
      <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1FA7DA] mb-1">
            <Trophy className="w-4 h-4" />
            <span>Weekly Practice</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F1F1] tracking-tight">
            Weekly Quantum Challenges
          </h1>
          <p className="text-xs sm:text-sm text-[#B7BABD] mt-0.5">
            7 tailored challenges refreshed weekly based on your current progress.
          </p>
        </div>

        {/* Progress & Countdown Snapshot */}
        <div className="bg-[#28292A] border border-[#44474A] rounded-lg p-3.5 min-w-[220px] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#B7BABD]">
            <span>This Week</span>
            <span className="font-mono text-[#1FA7DA]">{completedCount} / 7 Completed</span>
          </div>

          <ProgressBar value={progressPercent} size="sm" color="cyan" />

          <div className="flex items-center justify-between text-[11px] text-[#858A8E] pt-0.5">
            <span>{weeklySet.weekLabel}</span>
            <span className="flex items-center gap-1 text-[#B7BABD]">
              <Clock className="w-3 h-3 text-[#1FA7DA]" />
              <span>{weeklySet.daysRemaining} {weeklySet.daysRemaining === 1 ? 'day' : 'days'} left</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOPIC SUMMARY: Dynamic Unlocked Learning Topics */}
      <div className="p-3.5 bg-[#28292A] border border-[#44474A] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-[#858A8E]">
          <Sparkles className="w-3.5 h-3.5 text-[#1FA7DA] shrink-0" />
          <span className="text-[#B7BABD]">Based on your progress:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {topicNames.map((name) => (
            <span 
              key={name}
              className="px-2 py-0.5 rounded bg-[#2B2C2D] border border-[#44474A] text-[#B7BABD] text-[11px]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
{!canStartWeekly && (
  <div className="rounded-xl border border-[#44474A] bg-[#28292A] p-6">
    <div className="text-xs font-bold uppercase tracking-wider text-purple-300">
      Weekly Challenge
    </div>

    <h2 className="mt-2 text-xl font-bold text-[#F1F1F1]">
      Weekly practice is locked
    </h2>

    <p className="mt-2 text-sm text-[#B7BABD]">
      Qubify will not test you on topics you have not learned yet.
    </p>

    <p className="mt-3 text-xs text-[#858A8E]">
      Complete more lessons first. Once at least 7 suitable practice
      questions are available from completed lessons, your Weekly
      Challenge will unlock automatically.
    </p>

    <div className="mt-4 text-xs font-mono text-[#1FA7DA]">
      {learnedChallengePool.length} / 7 practice questions available
    </div>
  </div>
)}

{canStartWeekly && (
  <div className="contents">
      </div>
)}

      {/* Interactive Challenge Player Modal */}
      <WeeklyChallengeModal
        isOpen={isModalOpen}
        challenge={activeChallenge}
        onClose={() => setIsModalOpen(false)}
        onCompleteChallenge={handleCompleteChallenge}
        onNextChallenge={handleNextChallenge}
        isReadOnly={isReadOnly}
      />

      {/* Completion Modal when all 7 are solved */}
      <CompletionModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        title="Weekly Challenge Set Completed!"
        description="You have successfully solved all 7 quantum challenges for this week. Your concepts and circuit intuition are in top shape!"
        onContinue={() => {
          setIsCelebrationOpen(false);
          if (onContinueToNextTrack) onContinueToNextTrack();
        }}
        ctaLabel="Continue Learning Path"
      />

    </div>
  );
};
