import React from 'react';
import { LearningNodeItem } from '../../types';
import { Play, CheckCircle2, Lock, Clock, Zap, ArrowRight } from 'lucide-react';

interface LessonCardProps {
  item: LearningNodeItem;
  onStart: (item: LearningNodeItem) => void;
  variant?: 'featured' | 'standard';
}

export const LessonCard: React.FC<LessonCardProps> = ({
  item,
  onStart,
  variant = 'standard',
}) => {
  const isCompleted = item.status === 'completed';
  const isCurrent = item.status === 'current';
  const isLocked = item.status === 'locked';

  if (variant === 'featured') {
    return (
      <div 
        id="featured-lesson-card"
        className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 sm:p-6 text-left transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#28292A] border border-[#44474A] text-[#1FA7DA] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1FA7DA]" />
              <span>Current Milestone</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F1F1]">
              Lesson {item.number}: {item.title}
            </h3>

            <p className="text-[#B7BABD] text-sm leading-relaxed">
              {item.subtitle || 'Explore quantum fundamentals, state collapse, and how observing a qubit turns amplitudes into classical probabilities.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#858A8E] pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#B7BABD]" />
                <span>{item.estimatedMinutes || 6} mins</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-[#1FA7DA]" />
                <span>+{item.xp || 30} XP</span>
              </span>
              <span>· {item.category === 'beginner' ? 'Beginner Track' : 'Intermediate Track'}</span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              id="continue-learning-main-cta"
              onClick={() => onStart(item)}
              className="w-full sm:w-auto px-5 py-3 bg-[#1FA7DA] hover:bg-[#27B4E8] text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-xl border p-4 text-left flex flex-col justify-between transition-colors ${
        isCurrent
          ? 'bg-[#303234] border-[#1FA7DA]'
          : isCompleted
          ? 'bg-[#2B2C2D] border-[#44474A] hover:border-[#858A8E]'
          : isLocked
          ? 'bg-[#28292A] border-[#44474A]/50 opacity-60'
          : 'bg-[#2B2C2D] border-[#44474A]'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-mono text-[#858A8E]">Topic {item.number}</span>
          <h4 className="text-sm font-bold text-[#F1F1F1] mt-0.5">{item.title}</h4>
          {item.subtitle && <p className="text-xs text-[#B7BABD] mt-0.5 line-clamp-2">{item.subtitle}</p>}
        </div>

        <button
          disabled={isLocked}
          onClick={() => onStart(item)}
          className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
            isCompleted
              ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/40'
              : isCurrent
              ? 'text-white bg-[#1FA7DA] hover:bg-[#27B4E8]'
              : isLocked
              ? 'text-[#858A8E] bg-[#28292A] border border-[#44474A] cursor-not-allowed'
              : 'text-[#B7BABD] bg-[#28292A] border border-[#44474A] hover:text-[#F1F1F1]'
          }`}
          aria-label={isLocked ? 'Locked' : `Start ${item.title}`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#858A8E] pt-2 border-t border-[#44474A]/60">
        <span>{item.estimatedMinutes || 5} mins</span>
        <span>+{item.xp || 25} XP</span>
      </div>
    </div>
  );
};
