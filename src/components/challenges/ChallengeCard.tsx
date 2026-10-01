import React, { useState } from 'react';
import { ChallengeItem, QuantumGateType } from '../../types';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface ChallengeCardProps {
  challenge: ChallengeItem;
  onSolve?: (id: string) => void;
  onSolveSuccess?: (id: string) => void;
  onNext?: () => void;
  onNextChallenge?: () => void;
  isLast?: boolean;
  isLastChallenge?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onSolve,
  onSolveSuccess,
  onNext,
  onNextChallenge,
  isLast = false,
  isLastChallenge = false,
}) => {
  const triggerSolve = onSolve || onSolveSuccess || (() => {});
  const triggerNext = onNext || onNextChallenge;
  const isFinal = isLast || isLastChallenge;

  // Local testing states
  const [selectedGate, setSelectedGate] = useState<QuantumGateType | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'incorrect';
    message: string;
  }>({ status: 'idle', message: '' });
  const [showHint, setShowHint] = useState(false);

  const handleTestMission = () => {
    if (challenge.type === 'builder') {
      if (!selectedGate) {
        setFeedback({
          status: 'incorrect',
          message: 'Please select a quantum gate first to complete your circuit.',
        });
        return;
      }

      // Check mission criteria
      if (challenge.number === 1) {
        // "Make the output 1" -> Needs X gate
        if (selectedGate === 'X') {
          setFeedback({
            status: 'success',
            message: 'Target Achieved! The X gate flipped |0⟩ to |1⟩ with 100% probability.',
          });
          triggerSolve(challenge.id);
        } else {
          setFeedback({
            status: 'incorrect',
            message: 'Not quite. That gate resulted in |0⟩ or a 50/50 superposition instead of deterministic 1.',
          });
        }
      } else if (challenge.number === 2) {
        // "Create approximately 50/50 results" -> Needs H gate
        if (selectedGate === 'H') {
          setFeedback({
            status: 'success',
            message: 'Target Achieved! The Hadamard gate created an equal superposition (|0⟩ + |1⟩) / √2.',
          });
          triggerSolve(challenge.id);
        } else {
          setFeedback({
            status: 'incorrect',
            message: 'Not quite. The target requires an equal superposition with roughly 50% probability on |0⟩ and |1⟩.',
          });
        }
      } else {
        // Default general check
        setFeedback({
          status: 'success',
          message: 'Circuit executed and evaluated successfully!',
        });
        triggerSolve(challenge.id);
      }
    } else {
      // Quiz / conceptual challenge
      if (!selectedOption) {
        setFeedback({
          status: 'incorrect',
          message: 'Please select an answer to submit.',
        });
        return;
      }

      const correct = challenge.options?.find((o) => o.id === selectedOption)?.isCorrect;
      if (correct) {
        setFeedback({
          status: 'success',
          message: 'Correct! You understood the underlying quantum mechanic.',
        });
        triggerSolve(challenge.id);
      } else {
        setFeedback({
          status: 'incorrect',
          message: 'Not quite. Revisit the concept or use the hint to reconsider.',
        });
      }
    }
  };

  const handleReset = () => {
    setSelectedGate(null);
    setSelectedOption(null);
    setFeedback({ status: 'idle', message: '' });
  };

  return (
    <div 
      id={`challenge-card-${challenge.id}`}
      className="bg-[#132238]/80 border border-[#243B55] rounded-3xl p-6 sm:p-8 shadow-sm text-left backdrop-blur-xs"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#1E3A5F] border border-[#22D3EE]/30 px-2.5 py-0.5 rounded-lg">
              Challenge {challenge.number}
            </span>
            {challenge.solved && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#F8FAFC] mt-1.5">
            "{challenge.title}"
          </h3>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] text-purple-400 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-500/30">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      {/* Mission Objective Callout */}
      <div className="p-4 rounded-2xl bg-[#08111F]/70 border border-[#243B55] mb-5">
        <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
          Mission Directive:
        </div>
        <p className="text-sm font-semibold text-[#F8FAFC]">
          {challenge.mission}
        </p>
        <div className="mt-2 text-xs text-[#CBD5E1] flex items-center gap-2">
          <span className="font-mono text-[#22D3EE] font-bold">Goal:</span>
          <span>{challenge.expectedOutcome}</span>
        </div>
      </div>

      {/* Challenge Interactive Workspace */}
      <div className="space-y-4">
        {challenge.type === 'builder' ? (
          <div>
            <div className="text-xs font-bold text-[#CBD5E1] mb-2">
              Select gate to apply to initial state |0⟩:
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {(['X', 'H', 'Measure'] as QuantumGateType[]).map((gate) => (
                <button
                  key={gate}
                  type="button"
                  onClick={() => setSelectedGate(gate)}
                  className={`p-3.5 rounded-2xl border font-mono font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    selectedGate === gate
                      ? 'border-[#22D3EE] bg-[#1E3A5F] text-[#22D3EE] ring-2 ring-[#22D3EE]/40'
                      : 'border-[#243B55] bg-[#08111F]/70 hover:border-[#4F7CFF] text-[#CBD5E1]'
                  }`}
                >
                  <span className="text-base">{gate}</span>
                  <span className="text-[10px] font-sans text-[#94A3B8]">
                    {gate === 'X' ? 'Flip' : gate === 'H' ? 'Superpose' : 'Inspect'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#CBD5E1] mb-2">
              Choose the correct quantum answer:
            </div>
            {challenge.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedOption === option.id
                    ? 'border-[#22D3EE] bg-[#1E3A5F]/70 text-[#F8FAFC]'
                    : 'border-[#243B55] bg-[#08111F]/70 hover:bg-[#1E3A5F]/30 text-[#CBD5E1]'
                }`}
              >
                <input
                  type="radio"
                  name={`challenge-${challenge.id}`}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  className="mt-0.5 text-[#4F7CFF] focus:ring-[#4F7CFF] h-4 w-4 bg-[#08111F] border-[#243B55]"
                />
                <span className="text-xs sm:text-sm font-medium">{option.text}</span>
              </label>
            ))}
          </div>
        )}

        {/* Immediate Feedback Notification */}
        {feedback.status !== 'idle' && (
          <div
            className={`p-3.5 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in ${
              feedback.status === 'success'
                ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40'
                : 'bg-rose-950/60 text-rose-200 border border-rose-500/40'
            }`}
          >
            {feedback.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-medium">{feedback.message}</div>
          </div>
        )}

        {/* Hint Accordion */}
        {showHint && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200 animate-in fade-in">
            <div className="font-bold flex items-center gap-1 mb-1 text-amber-300">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hint</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-200/90">
              {challenge.hints.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[#243B55]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
            </button>

            {(selectedGate || selectedOption) && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#64748B] hover:text-[#94A3B8] flex items-center gap-1 cursor-pointer ml-2 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {feedback.status === 'success' && triggerNext ? (
              <button
                id={`next-challenge-btn-${challenge.number}`}
                onClick={triggerNext}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{isFinal ? 'Finish All Challenges' : 'Next Challenge'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id={`submit-challenge-btn-${challenge.number}`}
                onClick={handleTestMission}
                className="px-4 py-2.5 bg-[#4F7CFF] hover:bg-[#3d6bf0] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Run / Submit Mission</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
