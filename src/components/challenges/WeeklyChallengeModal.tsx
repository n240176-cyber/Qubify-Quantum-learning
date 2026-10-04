import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import { ActiveWeeklyChallenge } from '../../types';

import {
  recordTopicAttempt,
} from '../../utils/topicPerformance';
interface WeeklyChallengeModalProps {
  isOpen: boolean;
  challenge: ActiveWeeklyChallenge | null;
  onClose: () => void;
  onCompleteChallenge: (challengeId: string) => void;
  onNextChallenge?: () => void;
  isReadOnly?: boolean;
}

export const WeeklyChallengeModal: React.FC<WeeklyChallengeModalProps> = ({
  isOpen,
  challenge,
  onClose,
  onCompleteChallenge,
  onNextChallenge,
  isReadOnly = false,
}) => {
  if (!isOpen || !challenge) return null;

  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    challenge.selectedOptionId || (isReadOnly ? challenge.correctAnswer : '')
  );
  const [submissionState, setSubmissionState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [attempts, setAttempts] = useState<number>(challenge.attemptsCount || 0);
  const [showExplanationOverride, setShowExplanationOverride] = useState<boolean>(false);

  useEffect(() => {
    setSelectedOptionId(challenge.selectedOptionId || (isReadOnly ? challenge.correctAnswer : ''));
    setSubmissionState(challenge.status === 'completed' ? 'correct' : 'idle');
    setAttempts(challenge.attemptsCount || 0);
    setShowExplanationOverride(false);
  }, [challenge, isReadOnly]);

  const handleCheckAnswer = () => {
  if (
    !selectedOptionId ||
    isReadOnly
  ) {
    return;
  }

  const isCorrect =
    selectedOptionId ===
    challenge.correctAnswer;

  const newAttempts =
    attempts + 1;

  setAttempts(newAttempts);

  // Track this attempt by topic.
  // Guest users are automatically ignored.
  recordTopicAttempt(
    challenge.topic,
    isCorrect
  );

  if (isCorrect) {
    setSubmissionState(
      'correct'
    );

    onCompleteChallenge(
      challenge.id
    );
  } else {
    setSubmissionState(
      'wrong'
    );
  }
};

  const handleRetry = () => {
    setSubmissionState('idle');
  };

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30',
    medium: 'text-[#1FA7DA] bg-[#1E3545] border-[#1FA7DA]/30',
    challenge: 'text-purple-400 bg-purple-950/50 border-purple-500/30',
  };

  const typeLabels = {
    multiple_choice: 'Multiple Choice',
    prediction: 'Predict the Result',
    bloch_sphere: 'Bloch Sphere Reasoning',
    true_false: 'True / False',
    fix_statement: 'Fix the Statement',
    circuit_interpretation: 'Circuit Interpretation',
    code_understanding: 'Code Understanding',
    error_identification: 'Error Identification',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#2B2C2D] border border-[#44474A] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#202122] border-b border-[#44474A]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#28292A] border border-[#44474A] text-[#1FA7DA] flex items-center justify-center font-mono font-bold text-xs">
              #{challenge.orderNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F1F1F1]">
                  {challenge.topic}
                </h3>
                {challenge.isFinalChallenge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-950/60 text-purple-300 border border-purple-500/40">
                    Weekly Final
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#858A8E]">
                <span>{typeLabels[challenge.type]}</span>
                <span>•</span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] border capitalize ${difficultyColors[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-[#B7BABD]">
          
          {/* Question text */}
          <div className="text-sm sm:text-base font-semibold text-[#F1F1F1] leading-relaxed">
            {challenge.question}
          </div>

          {/* Optional Circuit Diagram */}
          {challenge.circuitDiagram && (
            <div className="p-3 bg-[#202122] border border-[#44474A] rounded-lg font-mono text-xs text-[#1FA7DA] flex items-center justify-center tracking-wider overflow-x-auto">
              <span className="font-semibold">{challenge.circuitDiagram}</span>
            </div>
          )}

          {/* Optional Code Snippet */}
          {challenge.codeSnippet && (
            <div className="p-3 bg-[#202122] border border-[#44474A] rounded-lg font-mono text-xs text-[#B7BABD] overflow-x-auto">
              <pre className="text-[11px] leading-normal">{challenge.codeSnippet}</pre>
            </div>
          )}

          {/* Interactive Answer Area (Options) */}
          <div className="space-y-2 pt-1">
            {challenge.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isRevealedCorrect = (submissionState === 'correct' || showExplanationOverride || isReadOnly) && opt.isCorrect;
              const isRevealedWrong = submissionState === 'wrong' && isSelected && !opt.isCorrect;

              return (
                <button
                  key={opt.id}
                  disabled={submissionState === 'correct' || isReadOnly}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 ${
                    isRevealedCorrect
                      ? 'bg-[#1C3325] border-emerald-500/80 text-[#F1F1F1]'
                      : isRevealedWrong
                      ? 'bg-[#381F24] border-rose-500/80 text-[#F1F1F1]'
                      : isSelected
                      ? 'bg-[#1E3545] border-[#1FA7DA] text-[#F1F1F1]'
                      : 'bg-[#28292A] border-[#44474A] text-[#B7BABD] hover:text-[#F1F1F1] hover:border-[#858A8E]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold mt-0.5 shrink-0 ${
                    isRevealedCorrect
                      ? 'bg-emerald-500 text-black'
                      : isRevealedWrong
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-[#1FA7DA] text-white'
                      : 'bg-[#202122] text-[#858A8E]'
                  }`}>
                    {isRevealedCorrect ? '✓' : isRevealedWrong ? '✕' : opt.id.toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm flex-1 leading-snug">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanations */}
          {submissionState === 'correct' && (
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-lg space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Correct!</span>
              </div>
              <p className="text-xs text-[#B7BABD] leading-relaxed">
                {challenge.explanation}
              </p>
            </div>
          )}

          {submissionState === 'wrong' && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Not quite.</span>
              </div>
              <p className="text-xs text-[#B7BABD] leading-relaxed">
                {challenge.hint}
              </p>
              {attempts >= 2 && !showExplanationOverride && (
                <button
                  onClick={() => setShowExplanationOverride(true)}
                  className="text-[11px] text-[#1FA7DA] hover:underline pt-1 block cursor-pointer"
                >
                  Reveal explanation
                </button>
              )}
            </div>
          )}

          {showExplanationOverride && (
            <div className="p-3.5 bg-[#28292A] border border-[#44474A] rounded-lg space-y-1 animate-in fade-in">
              <div className="text-xs font-bold text-[#1FA7DA]">Explanation</div>
              <p className="text-xs text-[#B7BABD] leading-relaxed">
                {challenge.explanation}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#202122] border-t border-[#44474A] flex items-center justify-between">
          <div className="text-xs text-[#858A8E]">
            {isReadOnly ? (
              <span className="font-mono text-emerald-400">Reviewing completed challenge</span>
            ) : submissionState === 'wrong' ? (
              <span>Attempt #{attempts}</span>
            ) : challenge.status === 'completed' ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
            ) : (
              <span>Select an answer and check</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {submissionState === 'wrong' ? (
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-[#28292A] hover:bg-[#303234] text-[#F1F1F1] font-semibold text-xs rounded-lg border border-[#44474A] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#1FA7DA]" />
                <span>Try Again</span>
              </button>
            ) : submissionState === 'correct' || isReadOnly ? (
              <button
                onClick={() => {
                  if (onNextChallenge) {
                    onNextChallenge();
                  } else {
                    onClose();
                  }
                }}
                className="px-5 py-2 bg-[#1FA7DA] hover:bg-[#27B4E8] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                disabled={!selectedOptionId}
                onClick={handleCheckAnswer}
                className={`px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedOptionId
                    ? 'bg-[#1FA7DA] hover:bg-[#27B4E8] text-white'
                    : 'bg-[#28292A] text-[#858A8E] cursor-not-allowed border border-[#44474A]'
                }`}
              >
                <span>Check Answer</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
