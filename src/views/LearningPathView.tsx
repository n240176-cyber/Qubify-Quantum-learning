import React from 'react';
import { LearningNodeItem, UserStats } from '../types';
import { LearningNode } from '../components/learning/LearningNode';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  GraduationCap,
  Atom
} from 'lucide-react';

interface LearningPathViewProps {
  beginnerNodes: LearningNodeItem[];
  intermediateNodes: LearningNodeItem[];
  userStats: UserStats;
  onSelectNode: (item: LearningNodeItem) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  beginnerNodes,
  intermediateNodes,
  userStats,
  onSelectNode,
}) => {
  // Gentle horizontal rhythm offsets for interactive path progression
  const getCurveOffset = (index: number) => {
    const pattern = [
      'translate-x-0',
      '-translate-x-6 sm:-translate-x-8',
      'translate-x-0',
      'translate-x-6 sm:translate-x-8',
      'translate-x-0',
      '-translate-x-6 sm:-translate-x-8',
      'translate-x-0',
      'translate-x-6 sm:translate-x-8',
      'translate-x-0',
    ];
    return pattern[index % pattern.length];
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1FA7DA] mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Curriculum</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F1F1] tracking-tight">
            Quantum Foundations
          </h1>
          <p className="text-xs sm:text-sm text-[#B7BABD] mt-0.5">
            Progress sequentially through interactive quantum topics and visual concepts.
          </p>
        </div>

        <div className="sm:text-right min-w-[200px] pt-2 sm:pt-0 border-t sm:border-t-0 border-[#44474A]">
          <div className="text-xs font-semibold text-[#B7BABD] mb-1">Beginner Track Progress</div>
          <ProgressBar value={userStats.beginnerCompletionPercent} size="sm" color="cyan" />
          <span className="text-[11px] text-[#858A8E] font-mono mt-1 block">
            {userStats.lessonsCompleted} of {userStats.totalLessons} Completed
          </span>
        </div>
      </div>

      {/* LEVEL 1: BEGINNER TRACK */}
      <section className="relative">
        
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2B2C2D] border border-[#44474A] text-[#1FA7DA] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Level 1: Beginner Track</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#F1F1F1]">
            From Classical Bits to Quantum Circuits
          </h2>
          <p className="text-xs text-[#858A8E] max-w-md mx-auto mt-0.5">
            Single-qubit superposition, state collapse, and basic quantum gates.
          </p>
        </div>

        {/* Path Container */}
        <div className="relative flex flex-col items-center py-4">
          {/* Subtle vertical connector line */}
          <div className="absolute top-8 bottom-8 w-0.5 bg-[#44474A] rounded-full z-0" />

          {/* Beginner Nodes */}
          <div className="relative z-10 w-full flex flex-col items-center space-y-4">
            {beginnerNodes.map((node, index) => (
              <LearningNode
                key={node.id}
                item={node}
                onClick={onSelectNode}
                offsetStyle={getCurveOffset(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* LEVEL 2: INTERMEDIATE TRACK */}
      <section className="relative pt-6 border-t border-[#44474A]">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2B2C2D] border border-[#44474A] text-[#B7BABD] text-xs font-semibold uppercase tracking-wider mb-2">
            <Atom className="w-3.5 h-3.5 text-[#1FA7DA]" />
            <span>Level 2: Intermediate Track</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#F1F1F1]">
            The Bloch Sphere & Multi-Axis Rotations
          </h2>
          <p className="text-xs text-[#858A8E] max-w-md mx-auto mt-0.5">
            Pauli rotations, geometric phases, and 3D state representations.
          </p>
        </div>

        <div className="relative flex flex-col items-center py-4">
          <div className="absolute top-8 bottom-8 w-0.5 bg-[#44474A] rounded-full z-0" />

          <div className="relative z-10 w-full flex flex-col items-center space-y-4">
            {intermediateNodes.map((node, index) => (
              <LearningNode
                key={node.id}
                item={node}
                onClick={onSelectNode}
                offsetStyle={getCurveOffset(index)}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
