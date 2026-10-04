import React, {
  useState,
} from 'react';

import {
  CalendarDays,
  CheckCircle2,
  Flame,
  Sparkles,
} from 'lucide-react';

import {
  ActiveWeeklyChallenge,
  LearningNodeItem,
} from '../../types';

import {
  DailyChallengeSet,
  loadOrCreateDailyChallenge,
  saveDailyChallenge,
} from '../../utils/dailyChallengeGenerator';

import { WeeklyChallengeModal } from './WeeklyChallengeModal';

interface DailyChallengePanelProps {
  beginnerNodes: LearningNodeItem[];
  intermediateNodes: LearningNodeItem[];
}

export const DailyChallengePanel:
  React.FC<
    DailyChallengePanelProps
  > = ({
    beginnerNodes,
    intermediateNodes,
  }) => {
    const [
      dailySet,
      setDailySet,
    ] =
      useState<DailyChallengeSet>(
        () =>
          loadOrCreateDailyChallenge(
            beginnerNodes,
            intermediateNodes
          )
      );

    const [
      activeChallenge,
      setActiveChallenge,
    ] =
      useState<ActiveWeeklyChallenge | null>(
        null
      );

    const [
      isModalOpen,
      setIsModalOpen,
    ] =
      useState(false);

    const [
      isReadOnly,
      setIsReadOnly,
    ] =
      useState(false);

    const handleOpen = (
      challenge:
        ActiveWeeklyChallenge
    ) => {
      setActiveChallenge(
        challenge
      );

      setIsReadOnly(
        challenge.status ===
          'completed'
      );

      setIsModalOpen(true);

      if (
        challenge.status ===
        'not_started'
      ) {
        const updatedChallenges =
          dailySet.challenges.map(
            (item) =>
              item.id ===
              challenge.id
                ? {
                    ...item,
                    status:
                      'in_progress' as const,
                  }
                : item
          );

        const updated = {
          ...dailySet,
          challenges:
            updatedChallenges,
        };

        setDailySet(updated);

        saveDailyChallenge(
          updated
        );
      }
    };

    const handleComplete = (
      challengeId: string
    ) => {
      setDailySet(
        (previous) => {
          const challenges =
            previous.challenges.map(
              (challenge) =>
                challenge.id ===
                challengeId
                  ? {
                      ...challenge,

                      status:
                        'completed' as const,

                      completedAt:
                        new Date().toISOString(),
                    }
                  : challenge
            );

          const updated = {
            ...previous,

            challenges,

            completedCount:
              challenges.filter(
                (challenge) =>
                  challenge.status ===
                  'completed'
              ).length,
          };

          saveDailyChallenge(
            updated
          );

          return updated;
        }
      );
    };

    const handleNext = () => {
      if (
        !activeChallenge
      ) {
        return;
      }

      const next =
        dailySet.challenges.find(
          (challenge) =>
            challenge.orderNumber ===
            activeChallenge.orderNumber +
              1
        );

      if (next) {
        setActiveChallenge(
          next
        );

        setIsReadOnly(
          next.status ===
            'completed'
        );
      } else {
        setIsModalOpen(
          false
        );
      }
    };

    const allComplete =
      dailySet.challenges.length >
        0 &&
      dailySet.completedCount ===
        dailySet.challenges.length;

    return (
      <>
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/25 bg-[#202A33] p-5 sm:p-6">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#67E8F9]">
                <Flame className="w-4 h-4" />

                <span className="text-xs font-bold uppercase tracking-wider">
                  Daily Challenge
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold text-[#F1F1F1]">
                Today's Quantum Sprint
              </h2>

              <p className="mt-1 text-xs sm:text-sm text-[#B7BABD]">
                3 short questions based
                on your unlocked lessons
                and weaker topics.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#B7BABD]">
              <CalendarDays className="w-4 h-4 text-[#1FA7DA]" />

              {dailySet.completedCount}
              {' / '}
              {dailySet.challenges.length}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            {dailySet.challenges.map(
              (challenge) => {
                const completed =
                  challenge.status ===
                  'completed';

                return (
                  <button
                    key={
                      challenge.id
                    }
                    onClick={() =>
                      handleOpen(
                        challenge
                      )
                    }
                    className={`text-left p-4 rounded-lg border transition-all ${
                      completed
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-[#28292A] border-[#44474A] hover:border-[#1FA7DA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#858A8E]">
                        QUESTION{' '}
                        {
                          challenge.orderNumber
                        }
                      </span>

                      {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#1FA7DA]" />
                      )}
                    </div>

                    <div className="mt-3 text-sm font-semibold text-[#F1F1F1]">
                      {
                        challenge.topic
                      }
                    </div>

                    <div className="mt-1 text-[11px] text-[#858A8E] capitalize">
                      {
                        challenge.difficulty
                      }
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {allComplete && (
            <div className="mt-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />

              Daily Challenge complete.
              Come back tomorrow for a
              new adaptive set.
            </div>
          )}
        </div>

        <WeeklyChallengeModal
          isOpen={
            isModalOpen
          }
          challenge={
            activeChallenge
          }
          onClose={() =>
            setIsModalOpen(
              false
            )
          }
          onCompleteChallenge={
            handleComplete
          }
          onNextChallenge={
            handleNext
          }
          isReadOnly={
            isReadOnly
          }
        />
      </>
    );
  };