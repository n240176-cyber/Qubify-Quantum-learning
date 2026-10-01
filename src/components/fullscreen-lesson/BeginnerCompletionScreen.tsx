import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Check, 
  BookOpen, 
  Lock, 
  Compass
} from 'lucide-react';

interface BeginnerCompletionScreenProps {
  onExploreLab: () => void;
  onBackToPath: () => void;
  onReviewLesson?: (lessonId: string) => void;
  onContinueToIntermediate?: () => void;
}

export const BeginnerCompletionScreen: React.FC<BeginnerCompletionScreenProps> = ({
  onExploreLab,
  onBackToPath,
  onReviewLesson,
  onContinueToIntermediate,
}) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  const masteredTopics = [
    { title: 'Bits', desc: 'Binary 0 and 1, deterministic states' },
    { title: 'Probability', desc: 'How likely an outcome is, normalization' },
    { title: 'Qubits', desc: 'State vectors, |0⟩, |1⟩, and superposition' },
    { title: 'Quantum Gates', desc: 'X (bit-flip) and H (Hadamard)' },
    { title: 'Quantum Circuits', desc: 'Left-to-right timeline operations' },
    { title: 'Shots', desc: 'Re-running experiments for statistical sampling' },
    { title: 'Qiskit Basics', desc: 'Creating and executing circuits with Python software' },
  ];

  const resultsReview = [
    { topic: 'Circuit Building', status: 'Completed', correct: true },
    { topic: 'Measurement Mechanics', status: 'Completed', correct: true },
    { topic: 'Shots & Sampling', status: 'Completed', correct: true },
    { topic: 'Qiskit Workflow', status: 'Completed', correct: true },
    { topic: 'Core Foundations', status: 'Completed', correct: true },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto py-6 px-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Achievement Header Badge */}
      <div className="flex flex-col items-center text-center space-y-2.5">
        <div className="w-14 h-14 rounded-xl bg-[#28292A] border border-[#44474A] flex items-center justify-center text-[#1FA7DA]">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-500/30 uppercase">
            Track Completed: Quantum Foundations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F1F1] tracking-tight">
            Beginner Level Complete
          </h1>
          <p className="text-sm text-[#B7BABD] max-w-xl mx-auto">
            You have mastered the foundational visual principles and circuits of quantum computing.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout: Mastered Concepts + Results Checklist */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        
        {/* LEFT: Mastered Concepts */}
        <div className="p-5 rounded-xl bg-[#2B2C2D] border border-[#44474A] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#44474A] mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1FA7DA]">
                What You Mastered
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 7 / 7 Core Topics
              </span>
            </div>

            <div className="space-y-2">
              {masteredTopics.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded-lg bg-[#28292A] border border-[#44474A]/60 flex items-center justify-between text-xs transition-opacity ${
                    revealed ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      ✓
                    </span>
                    <span className="text-[#F1F1F1] font-semibold">{item.title}</span>
                  </div>
                  <span className="text-[11px] text-[#858A8E] hidden sm:inline">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#28292A] border border-[#44474A] text-center font-mono text-xs text-[#B7BABD]">
            “You didn’t just read these concepts — you simulated and verified them.”
          </div>
        </div>

        {/* RIGHT: Challenge Results Breakdown */}
        <div className="p-5 rounded-xl bg-[#2B2C2D] border border-[#44474A] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#44474A] mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B7BABD]">
                Challenge Results
              </span>
              <span className="text-xs font-mono text-[#858A8E]">
                Evaluated by simulation
              </span>
            </div>

            <div className="space-y-2">
              {resultsReview.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#28292A] border border-[#44474A]/60 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-[#F1F1F1]">{item.topic}</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review links */}
          <div className="p-3 rounded-lg bg-[#28292A] border border-[#44474A] text-xs text-[#858A8E] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#B7BABD]">Need a refresher?</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => onReviewLesson && onReviewLesson('lesson-7')}
                className="px-2.5 py-1 rounded-md bg-[#2B2C2D] text-[#B7BABD] hover:text-[#F1F1F1] border border-[#44474A] cursor-pointer transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3 text-[#1FA7DA]" /> Review Shots
              </button>
              <button
                type="button"
                onClick={() => onReviewLesson && onReviewLesson('lesson-8')}
                className="px-2.5 py-1 rounded-md bg-[#2B2C2D] text-[#B7BABD] hover:text-[#F1F1F1] border border-[#44474A] cursor-pointer transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3 text-[#1FA7DA]" /> Review Qiskit
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Primary Action Buttons */}
      <div className="w-full max-w-lg flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          id="beginner-challenge-explore-lab-btn"
          type="button"
          onClick={onExploreLab}
          className="flex-1 w-full py-2.5 px-5 rounded-lg bg-[#1FA7DA] hover:bg-[#27B4E8] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <span>Explore Quantum Code Lab</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Intermediate button */}
        {onContinueToIntermediate ? (
          <button
            id="beginner-challenge-intermediate-btn"
            type="button"
            onClick={onContinueToIntermediate}
            className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-[#2B2C2D] hover:bg-[#303234] border border-[#44474A] text-[#F1F1F1] font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Compass className="w-4 h-4 text-[#1FA7DA]" />
            <span>Continue to Intermediate</span>
          </button>
        ) : (
          <button
            id="beginner-challenge-intermediate-btn"
            type="button"
            disabled={true}
            className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-[#28292A] border border-[#44474A] text-[#858A8E] font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Intermediate Track</span>
          </button>
        )}
      </div>

      {/* Return to learning path button */}
      <button
        id="beginner-challenge-back-path-btn"
        type="button"
        onClick={onBackToPath}
        className="text-xs font-medium text-[#858A8E] hover:text-[#F1F1F1] cursor-pointer transition-colors"
      >
        ← Return to curriculum
      </button>

    </div>
  );
};
