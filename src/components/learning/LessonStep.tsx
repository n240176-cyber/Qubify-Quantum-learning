import React from 'react';
import { LessonStepConfig } from '../../types';
import { 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  Sparkles, 
  FileText, 
  Wrench, 
  Lightbulb, 
  ArrowRight 
} from 'lucide-react';

interface LessonStepProps {
  step: LessonStepConfig;
  isActive: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  onActivate: () => void;
  children?: React.ReactNode;
}

export const LessonStep: React.FC<LessonStepProps> = ({
  step,
  isActive,
  isCompleted,
  isUnlocked,
  onActivate,
  children,
}) => {
  const getStepIcon = () => {
    switch (step.id) {
      case 'what_you_know':
        return CheckCircle2;
      case 'natural_question':
        return HelpCircle;
      case 'interactive_visual':
        return Sparkles;
      case 'observe':
        return Eye;
      case 'short_explanation':
        return FileText;
      case 'try_it':
        return Wrench;
      case 'takeaway':
        return Lightbulb;
      default:
        return ArrowRight;
    }
  };

  const Icon = getStepIcon();

  if (!isUnlocked) {
    return (
      <div className="opacity-40 select-none py-3 px-4 border border-dashed border-slate-200 rounded-xl flex items-center gap-3 bg-slate-50/50">
        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-mono font-bold">
          {step.stepNumber}
        </div>
        <div className="text-xs font-medium text-slate-400">
          Step {step.stepNumber}: {step.label}
        </div>
      </div>
    );
  }

  return (
    <div
      id={`lesson-step-${step.id}`}
      className={`rounded-2xl transition-all duration-300 ${
        isActive
          ? 'bg-white border-2 border-blue-600/80 shadow-md ring-4 ring-blue-100/60 p-5 sm:p-6'
          : isCompleted
          ? 'bg-white/80 border border-slate-200/80 p-4 hover:border-slate-300'
          : 'bg-white border border-slate-200 p-4'
      }`}
    >
      {/* Header */}
      <div 
        onClick={onActivate} 
        className="flex items-start justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-700'
                : isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {step.label}
              </span>
              {step.tag && (
                <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200">
                  {step.tag}
                </span>
              )}
            </div>
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
              {step.title}
            </h3>
          </div>
        </div>

        <div className="shrink-0 pt-1">
          <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
        </div>
      </div>

      {/* Expanded Content for Active Step */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {step.summary}
          </p>

          {step.detail && (
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700 font-mono">
              {step.detail}
            </div>
          )}

          {/* Optional slot for Interactive Panel or custom widget */}
          {children && <div className="pt-2">{children}</div>}
        </div>
      )}
    </div>
  );
};
