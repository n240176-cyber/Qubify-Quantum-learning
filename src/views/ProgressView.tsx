import React from 'react';
import { UserStats } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  BarChart3, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface ProgressViewProps {
  userStats: UserStats;
  onNavigateToPath: () => void;
  onNavigateToLab: () => void;
  onNavigateToChallenges: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userStats,
  onNavigateToPath,
  onNavigateToLab,
  onNavigateToChallenges,
}) => {
  // Topic mastery list matching the requirements:
  // Bits, Probability, Qubits, Measurement, Gates, Circuits, Shots, Qiskit, Bloch Sphere
  const topicMasteryList = [
    { name: 'Bits', percent: userStats.lessonsCompleted >= 1 ? 100 : 0, status: userStats.lessonsCompleted >= 1 ? 'Mastered' : 'Locked' },
    { name: 'Probability', percent: userStats.lessonsCompleted >= 2 ? 100 : userStats.lessonsCompleted >= 1 ? 40 : 0, status: userStats.lessonsCompleted >= 2 ? 'Mastered' : userStats.lessonsCompleted >= 1 ? 'In Progress' : 'Locked' },
    { name: 'Qubits', percent: userStats.lessonsCompleted >= 3 ? 100 : userStats.lessonsCompleted >= 2 ? 30 : 0, status: userStats.lessonsCompleted >= 3 ? 'Mastered' : userStats.lessonsCompleted >= 2 ? 'In Progress' : 'Locked' },
    { name: 'Measurement', percent: userStats.lessonsCompleted >= 4 ? 100 : userStats.lessonsCompleted >= 3 ? 20 : 0, status: userStats.lessonsCompleted >= 4 ? 'Mastered' : userStats.lessonsCompleted >= 3 ? 'In Progress' : 'Locked' },
    { name: 'Gates', percent: userStats.lessonsCompleted >= 5 ? 100 : userStats.lessonsCompleted >= 4 ? 25 : 0, status: userStats.lessonsCompleted >= 5 ? 'Mastered' : userStats.lessonsCompleted >= 4 ? 'In Progress' : 'Locked' },
    { name: 'Circuits', percent: userStats.lessonsCompleted >= 6 ? 100 : userStats.lessonsCompleted >= 5 ? 20 : 0, status: userStats.lessonsCompleted >= 6 ? 'Mastered' : userStats.lessonsCompleted >= 5 ? 'In Progress' : 'Locked' },
    { name: 'Shots', percent: userStats.lessonsCompleted >= 7 ? 100 : userStats.lessonsCompleted >= 6 ? 30 : 0, status: userStats.lessonsCompleted >= 7 ? 'Mastered' : userStats.lessonsCompleted >= 6 ? 'In Progress' : 'Locked' },
    { name: 'Qiskit', percent: userStats.lessonsCompleted >= 8 ? 100 : userStats.lessonsCompleted >= 7 ? 35 : 0, status: userStats.lessonsCompleted >= 8 ? 'Mastered' : userStats.lessonsCompleted >= 7 ? 'In Progress' : 'Locked' },
    { name: 'Bloch Sphere', percent: userStats.lessonsCompleted >= 9 ? 60 : 0, status: userStats.lessonsCompleted >= 9 ? 'In Progress' : 'Locked' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left pb-12">
      
      {/* Header */}
      <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1FA7DA] mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Profile & Statistics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F1F1] tracking-tight">
            Learning Progress
          </h1>
          <p className="text-xs sm:text-sm text-[#B7BABD] mt-0.5">
            Your quantum concept mastery, study streak, and milestones.
          </p>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-3 bg-[#28292A] border border-[#44474A] rounded-lg p-3 shrink-0">
          <div className="w-9 h-9 rounded-md bg-[#1E3545] border border-[#1FA7DA]/40 text-[#1FA7DA] flex items-center justify-center font-bold text-sm">
            L1
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F1F1F1]">{userStats.levelTitle}</div>
            <div className="text-[11px] text-[#858A8E] font-mono">Foundations Track</div>
          </div>
        </div>
      </div>

      {/* Primary Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1: Total Lessons Completed */}
        <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#858A8E] uppercase tracking-wider">
            <span>Lessons</span>
            <BookOpen className="w-4 h-4 text-[#1FA7DA]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F1F1]">
            {userStats.lessonsCompleted} <span className="text-sm font-normal text-[#858A8E]">/ {userStats.totalLessons}</span>
          </div>
          <ProgressBar value={userStats.beginnerCompletionPercent} color="cyan" size="sm" showPercent={false} />
          <p className="text-[11px] text-[#858A8E]">
            {userStats.beginnerCompletionPercent}% curriculum complete
          </p>
        </div>

        {/* Metric 2: Current Streak */}
        <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#858A8E] uppercase tracking-wider">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-[#F1F1F1]">
            {userStats.streakDays} <span className="text-sm font-normal text-[#858A8E]">Days</span>
          </div>
          <div className="h-1.5 w-full bg-[#202122] rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, (userStats.streakDays / 7) * 100)}%` }} />
          </div>
          <p className="text-[11px] text-[#858A8E]">
            Active consecutive study days
          </p>
        </div>

        {/* Metric 3: Challenges Solved */}
        <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#858A8E] uppercase tracking-wider">
            <span>Challenges</span>
            <Trophy className="w-4 h-4 text-[#1FA7DA]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F1F1]">
            {Math.min(7, userStats.challengesCompleted)} <span className="text-sm font-normal text-[#858A8E]">/ 7 Solved</span>
          </div>
          <ProgressBar value={Math.round((Math.min(7, userStats.challengesCompleted) / 7) * 100)} color="cyan" size="sm" showPercent={false} />
          <p className="text-[11px] text-[#858A8E]">
            Current weekly set progress
          </p>
        </div>

        {/* Metric 4: XP Earned */}
        <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#858A8E] uppercase tracking-wider">
            <span>Experience</span>
            <Zap className="w-4 h-4 text-[#1FA7DA]" />
          </div>
          <div className="text-2xl font-bold text-[#1FA7DA]">
            {userStats.xp} <span className="text-sm font-normal text-[#858A8E]">XP</span>
          </div>
          <div className="h-1.5 w-full bg-[#202122] rounded-full overflow-hidden">
            <div className="h-full bg-[#1FA7DA] rounded-full" style={{ width: `${Math.min(100, (userStats.xp / 500) * 100)}%` }} />
          </div>
          <p className="text-[11px] text-[#858A8E]">
            Earned from simulations & tests
          </p>
        </div>

      </div>

      {/* Topic Mastery List */}
      <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#44474A]">
          <div>
            <h3 className="text-base font-semibold text-[#F1F1F1]">
              Topic Mastery
            </h3>
            <p className="text-xs text-[#858A8E] mt-0.5">
              Breakdown of conceptual understanding across quantum computing topics.
            </p>
          </div>
          <span className="text-xs font-mono text-[#1FA7DA]">
            {topicMasteryList.filter(t => t.percent === 100).length} of {topicMasteryList.length} Mastered
          </span>
        </div>

        {/* Topic Mastery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {topicMasteryList.map((topic) => (
            <div 
              key={topic.name} 
              className="p-3 bg-[#28292A] border border-[#44474A] rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F1F1F1]">{topic.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  topic.percent === 100
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                    : topic.percent > 0
                    ? 'text-[#1FA7DA] bg-[#1E3545] border-[#1FA7DA]/30'
                    : 'text-[#858A8E] bg-[#202122] border-[#44474A]'
                }`}>
                  {topic.status}
                </span>
              </div>

              <ProgressBar value={topic.percent} size="sm" color={topic.percent === 100 ? 'success' : 'cyan'} showPercent={false} />

              <div className="flex items-center justify-between text-[11px] text-[#858A8E] font-mono">
                <span>Mastery</span>
                <span>{topic.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onNavigateToPath}
          className="p-3.5 bg-[#2B2C2D] hover:bg-[#303234] border border-[#44474A] rounded-lg text-left transition-colors cursor-pointer group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-[#F1F1F1]">Curriculum</div>
            <div className="text-[11px] text-[#858A8E]">Continue structured track</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#858A8E] group-hover:text-[#1FA7DA] transition-colors" />
        </button>

        <button
          onClick={onNavigateToChallenges}
          className="p-3.5 bg-[#2B2C2D] hover:bg-[#303234] border border-[#44474A] rounded-lg text-left transition-colors cursor-pointer group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-[#F1F1F1]">Weekly Challenges</div>
            <div className="text-[11px] text-[#858A8E]">Practice progress questions</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#858A8E] group-hover:text-[#1FA7DA] transition-colors" />
        </button>

        <button
          onClick={onNavigateToLab}
          className="p-3.5 bg-[#2B2C2D] hover:bg-[#303234] border border-[#44474A] rounded-lg text-left transition-colors cursor-pointer group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-[#F1F1F1]">Quantum Code Lab</div>
            <div className="text-[11px] text-[#858A8E]">Python & Qiskit workspace</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#858A8E] group-hover:text-[#1FA7DA] transition-colors" />
        </button>
      </div>

    </div>
  );
};
