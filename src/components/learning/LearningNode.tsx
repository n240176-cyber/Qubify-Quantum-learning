import React from 'react';
import { LearningNodeItem } from '../../types';
import { 
  Check, 
  Lock, 
  Binary, 
  Dice5, 
  Eye, 
  GitBranch, 
  Cpu, 
  Repeat, 
  Code, 
  Trophy, 
  RotateCw,
  Sparkles
} from 'lucide-react';

interface LearningNodeProps {
  item: LearningNodeItem;
  onClick: (item: LearningNodeItem) => void;
  offsetStyle?: string;
}

export const LearningNode: React.FC<LearningNodeProps> = ({
  item,
  onClick,
  offsetStyle = '',
}) => {
  const isCompleted = item.status === 'completed';
  const isCurrent = item.status === 'current';
  const isUpcoming = item.status === 'upcoming';
  const isLocked = item.status === 'locked';

  // Topic icon mapping
  const getTopicIcon = () => {
    switch (item.title.toLowerCase()) {
      case 'bit':
        return Binary;
      case 'probability':
        return Dice5;
      case 'qubit':
        return Sparkles;
      case 'measurement':
        return Eye;
      case 'quantum gates':
        return GitBranch;
      case 'quantum circuit':
        return Cpu;
      case 'shots':
        return Repeat;
      case 'qiskit practice':
        return Code;
      case 'beginner challenge':
      case 'intermediate challenge':
        return Trophy;
      default:
        if (item.title.toLowerCase().includes('rotation') || item.title.toLowerCase().includes('bloch')) {
          return RotateCw;
        }
        return Sparkles;
    }
  };

  const IconComponent = getTopicIcon();

  return (
    <div className={`flex flex-col items-center group relative my-2 ${offsetStyle}`}>
      {/* Node Button */}
      <button
        id={`learning-node-${item.id}`}
        disabled={isLocked}
        onClick={() => onClick(item)}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
          isCurrent
            ? 'bg-[#1E3545] border-2 border-[#1FA7DA] text-[#1FA7DA] shadow-xs'
            : isCompleted
            ? 'bg-[#1C3325] border-2 border-emerald-500/80 text-emerald-400'
            : isUpcoming
            ? 'bg-[#2B2C2D] border border-[#44474A] hover:border-[#858A8E] text-[#B7BABD]'
            : 'bg-[#28292A] border border-[#44474A]/60 text-[#858A8E] opacity-50 cursor-not-allowed'
        }`}
        aria-label={`${item.title} - ${item.status}`}
      >
        {isCompleted ? (
          <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
        ) : isLocked ? (
          <Lock className="w-4 h-4 text-[#858A8E]" />
        ) : (
          <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${isCurrent ? 'text-[#1FA7DA]' : 'text-[#B7BABD]'}`} />
        )}
      </button>

      {/* Lesson Title & Number */}
      <div className="mt-2 text-center max-w-[140px] pointer-events-none">
        <div className="text-[10px] font-mono font-medium text-[#858A8E]">
          {item.number}.
        </div>
        <div className={`text-xs font-semibold leading-tight line-clamp-1 ${
          isCurrent ? 'text-[#1FA7DA]' : isCompleted ? 'text-[#F1F1F1]' : isLocked ? 'text-[#858A8E]' : 'text-[#B7BABD]'
        }`}>
          {item.title}
        </div>
      </div>
    </div>
  );
};
