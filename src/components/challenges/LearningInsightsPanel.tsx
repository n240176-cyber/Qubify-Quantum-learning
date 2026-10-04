import React, { useMemo } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import {
  getTopicPerformance,
  getWeakTopics,
} from '../../utils/topicPerformance';

export const LearningInsightsPanel: React.FC = () => {
  const performance = useMemo(() => {
    return Object.values(
      getTopicPerformance()
    ).sort(
      (a, b) =>
        a.masteryScore -
        b.masteryScore
    );
  }, []);

  const weakTopics = useMemo(
    () => getWeakTopics(3),
    []
  );

  if (performance.length === 0) {
    return (
      <div className="rounded-xl border border-[#44474A] bg-[#28292A] p-5">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />

          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Learning Insights
          </span>
        </div>

        <p className="mt-3 text-sm text-[#B7BABD]">
          Complete some challenge questions
          to start building your topic mastery
          profile.
        </p>
      </div>
    );
  }

  const getStatus = (
    mastery: number
  ) => {
    if (mastery >= 80) {
      return {
        label: 'Strong',
        icon: (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ),
        className:
          'text-emerald-400',
      };
    }

    if (mastery >= 60) {
      return {
        label: 'Improving',
        icon: (
          <TrendingUp className="w-3.5 h-3.5" />
        ),
        className:
          'text-[#1FA7DA]',
      };
    }

    return {
      label: 'Needs Review',
      icon: (
        <AlertTriangle className="w-3.5 h-3.5" />
      ),
      className:
        'text-amber-400',
    };
  };

  return (
    <div className="rounded-xl border border-[#44474A] bg-[#28292A] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-purple-300">
            <Brain className="w-4 h-4" />

            <span className="text-xs font-bold uppercase tracking-wider">
              Learning Insights
            </span>
          </div>

          <h2 className="mt-2 text-lg font-bold text-[#F1F1F1]">
            Topic Mastery
          </h2>

          <p className="mt-1 text-xs text-[#858A8E]">
            Based on your challenge answers.
          </p>
        </div>

        {weakTopics.length > 0 && (
          <div className="text-xs text-[#B7BABD]">
            Focus:{' '}
            <span className="text-amber-300 font-semibold">
              {weakTopics
                .map(
                  (topic) =>
                    topic.topic
                )
                .join(' • ')}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {performance.map(
          (topic) => {
            const status =
              getStatus(
                topic.masteryScore
              );

            return (
              <div
                key={topic.topic}
                className="rounded-lg border border-[#44474A] bg-[#232425] p-3.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[#F1F1F1]">
                      {topic.topic}
                    </div>

                    <div className="mt-1 text-[11px] text-[#858A8E]">
                      {
                        topic.correct
                      }{' '}
                      correct •{' '}
                      {topic.wrong}{' '}
                      wrong •{' '}
                      {
                        topic.attempts
                      }{' '}
                      attempts
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-[#F1F1F1]">
                      {
                        topic.masteryScore
                      }
                      %
                    </div>

                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] font-semibold ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-[#151617] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-[#1FA7DA] to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${topic.masteryScore}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};