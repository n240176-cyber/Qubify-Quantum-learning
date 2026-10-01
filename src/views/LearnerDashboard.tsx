import React from 'react';
import { AppView, UserStats, LearningNodeItem } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { LessonCard } from '../components/learning/LessonCard';
import { 
  ArrowRight, 
  Code2, 
  Trophy, 
  CheckCircle2, 
  Circle,
  Clock, 
  ChevronRight,
  Sparkles,
  Route
} from 'lucide-react';

interface LearnerDashboardProps {
  userStats: UserStats;
  beginnerNodes: LearningNodeItem[];
  onNavigate: (view: AppView) => void;
  onSelectLesson: (item: LearningNodeItem) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  userStats,
  beginnerNodes,
  onNavigate,
  onSelectLesson,
}) => {
  // Current active lesson node
  const currentLesson = beginnerNodes.find((n) => n.id === userStats.currentLessonId) || beginnerNodes[0];

  return (
    <div className="w-full space-y-6 text-left">
      
      {/* 1. Header: "Your Learning Journey" */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#44474A]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F1F1] tracking-tight">
            Your Learning Journey
          </h1>
          <p className="text-sm text-[#B7BABD] mt-0.5">
            Welcome back, <span className="text-[#F1F1F1] font-semibold">{userStats.name || 'Learner'}</span>. You are currently on <span className="text-[#F1F1F1] font-semibold">{userStats.levelTitle}</span>.
          </p>
        </div>

        {/* Quick jump to curriculum */}
        <button
          onClick={() => onNavigate('path')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#2B2C2D] border border-[#44474A] hover:border-[#858A8E] text-[#F1F1F1] text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Route className="w-3.5 h-3.5 text-[#1FA7DA]" />
          <span>View Curriculum</span>
        </button>
      </div>

      {/* 2. Flat Journey Status Overview Card */}
      <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#44474A]">
        
        {/* Beginner Track Progress */}
        <div className="space-y-2 md:pr-4">
          <div className="text-xs font-semibold text-[#858A8E] uppercase tracking-wide">
            Track Progress
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-[#F1F1F1]">Beginner Track</span>
            <span className="text-sm font-semibold text-[#1FA7DA]">{userStats.beginnerCompletionPercent}%</span>
          </div>
          <ProgressBar value={userStats.beginnerCompletionPercent} size="sm" showPercent={false} color="cyan" />
          <p className="text-xs text-[#858A8E] pt-1">
            {userStats.lessonsCompleted} of {userStats.totalLessons} lessons completed
          </p>
        </div>

        {/* Current Lesson Status */}
        <div className="space-y-1.5 md:px-4 pt-4 md:pt-0">
          <div className="text-xs font-semibold text-[#858A8E] uppercase tracking-wide">
            Current Lesson
          </div>
          <div className="text-base font-bold text-[#F1F1F1] truncate">
            {currentLesson.title}
          </div>
          <p className="text-xs text-[#B7BABD] line-clamp-2">
            {currentLesson.subtitle || 'Learn quantum measurements and state collapse with interactive simulations.'}
          </p>
        </div>

        {/* Weekly Challenges Summary */}
        <div className="space-y-2 md:pl-4 pt-4 md:pt-0 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#858A8E] uppercase tracking-wide">
              Weekly Challenges
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-[#F1F1F1]">
                {Math.min(7, userStats.challengesCompleted)} / 7
              </span>
              <span className="text-xs text-emerald-400 font-medium">Completed</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('challenges')}
            className="text-xs font-semibold text-[#1FA7DA] hover:text-[#27B4E8] inline-flex items-center gap-1 cursor-pointer transition-colors pt-1"
          >
            <span>Practice this week</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3. Continue Learning Panel */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#858A8E] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1FA7DA]" />
            <span>Next Recommended Step</span>
          </h2>
        </div>

        <LessonCard
          item={currentLesson}
          onStart={(item) => onSelectLesson(item)}
          variant="featured"
        />
      </section>

      {/* 4. Quick Access Grid: Quantum Lab & Weekly Challenges */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Lab Card */}
        <div 
          onClick={() => onNavigate('lab')}
          className="bg-[#2B2C2D] border border-[#44474A] hover:border-[#858A8E] rounded-xl p-5 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#28292A] border border-[#44474A] text-[#1FA7DA] flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1FA7DA]">
                Quantum Code Lab
              </div>
              <h3 className="text-base font-bold text-[#F1F1F1] mt-0.5">
                Python & Qiskit Sandbox
              </h3>
              <p className="text-xs text-[#B7BABD] mt-1 leading-relaxed">
                Run arbitrary Qiskit circuits, state vectors, error diagnostics, and view Matplotlib probability histograms.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#44474A] text-xs font-semibold text-[#F1F1F1]">
            <span>Open Code Lab</span>
            <ArrowRight className="w-4 h-4 text-[#1FA7DA]" />
          </div>
        </div>

        {/* Weekly Challenges Card */}
        <div 
          onClick={() => onNavigate('challenges')}
          className="bg-[#2B2C2D] border border-[#44474A] hover:border-[#858A8E] rounded-xl p-5 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-[#28292A] border border-[#44474A] text-[#1FA7DA] flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold text-[#1FA7DA] bg-[#28292A] border border-[#44474A]">
                {Math.min(7, userStats.challengesCompleted)} / 7 Done
              </span>
            </div>
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1FA7DA]">
                Weekly Practice
              </div>
              <h3 className="text-base font-bold text-[#F1F1F1] mt-0.5">
                Progress-Aware Challenges
              </h3>
              <p className="text-xs text-[#B7BABD] mt-1 leading-relaxed">
                7 curated challenges specifically adapted to the quantum topics and gates you have unlocked.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#44474A] text-xs font-semibold text-[#F1F1F1]">
            <span>Continue Challenges</span>
            <ArrowRight className="w-4 h-4 text-[#1FA7DA]" />
          </div>
        </div>

      </section>

      {/* 5. Curriculum Overview Summary List */}
      <section className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F1F1F1]">Curriculum Topics</h3>
          <button
            onClick={() => onNavigate('path')}
            className="text-xs font-semibold text-[#1FA7DA] hover:text-[#27B4E8] cursor-pointer"
          >
            See all
          </button>
        </div>
        <div className="divide-y divide-[#44474A]">
          {beginnerNodes.slice(0, 5).map((node) => {
            const isDone = node.status === 'completed';
            const isCurr = node.status === 'current';
            return (
              <div 
                key={node.id} 
                onClick={() => onSelectLesson(node)}
                className="py-2.5 flex items-center justify-between hover:bg-[#28292A] px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurr ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#1FA7DA] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1FA7DA]" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-[#858A8E] shrink-0" />
                  )}
                  <div>
                    <div className={`text-xs font-semibold ${isCurr ? 'text-[#1FA7DA]' : 'text-[#F1F1F1]'}`}>
                      {node.title}
                    </div>
                    <div className="text-[11px] text-[#858A8E]">{node.subtitle || 'Quantum lesson'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#858A8E]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{node.estimatedMinutes}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
