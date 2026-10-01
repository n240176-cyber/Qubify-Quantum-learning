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

      {/* 3. MAIN CHALLENGES LIST: Flat Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#858A8E] flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#1FA7DA]" />
            <span>Challenge Set ({completedCount} of 7 Solved)</span>
          </h2>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-semibold text-[#858A8E] hover:text-[#F1F1F1] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Hide Archive' : 'Previous Weeks'}</span>
          </button>
        </div>

        {/* Flat Rows */}
        <div className="space-y-2">
          {weeklySet.challenges.map((challenge) => {
            const isCompleted = challenge.status === 'completed';
            const isInProgress = challenge.status === 'in_progress';

            return (
              <div
                key={challenge.id}
                onClick={() => handleOpenChallenge(challenge, isCompleted)}
                className={`p-3.5 sm:p-4 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                  challenge.isFinalChallenge
                    ? isCompleted
                      ? 'bg-[#2B2C2D] border-[#44474A]'
                      : 'bg-[#2B2C2D] border-purple-500/40 hover:border-purple-400'
                    : isCompleted
                    ? 'bg-[#28292A] border-[#44474A]/80'
                    : 'bg-[#2B2C2D] border-[#44474A] hover:border-[#858A8E]'
                }`}
              >
                {/* Left: Challenge Number & Topic */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isCompleted
                      ? 'bg-[#1C3325] text-emerald-400 border border-emerald-500/50'
                      : challenge.isFinalChallenge
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                      : 'bg-[#28292A] text-[#1FA7DA] border border-[#44474A]'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : String(challenge.orderNumber).padStart(2, '0')}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#F1F1F1]">
                        {challenge.topic}
                      </span>
                      {challenge.isFinalChallenge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-950/60 text-purple-300 border border-purple-500/40">
                          Weekly Final
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#858A8E] mt-0.5 line-clamp-1">
                      {challenge.question}
                    </div>
                  </div>
                </div>

                {/* Right: Difficulty, Status & Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block">
                    {difficultyBadge(challenge.difficulty)}
                  </div>

                  <div className="text-right">
                    {isCompleted ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#28292A] text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                        Completed
                      </span>
                    ) : isInProgress ? (
                      <button
                        className="px-3 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        className="px-3.5 py-1 rounded-md bg-[#1FA7DA] hover:bg-[#27B4E8] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PREVIOUS WEEKS / CHALLENGE HISTORY */}
      {showHistory && (
        <div className="p-4 bg-[#28292A] border border-[#44474A] rounded-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#44474A]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#1FA7DA]" />
              <h3 className="text-sm font-semibold text-[#F1F1F1]">Past Weeks Archive</h3>
            </div>
            <span className="text-xs text-[#858A8E]">Archived sets</span>
          </div>

          {history.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#858A8E]">
              No archived weeks yet. Completed sets from previous weeks will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {history.map((record) => (
                <div 
                  key={record.weekId}
                  className="p-3 bg-[#2B2C2D] border border-[#44474A] rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#F1F1F1]">{record.weekLabel}</div>
                    <div className="text-[11px] text-[#858A8E] font-mono">Archived {record.completedDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {record.completedCount} / {record.totalCount}
                    </span>
                    <button
                      onClick={() => handleOpenChallenge(record.challenges[0], true)}
                      className="px-2.5 py-1 text-[11px] bg-[#28292A] hover:bg-[#303234] text-[#B7BABD] rounded-md border border-[#44474A] cursor-pointer transition-colors"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
