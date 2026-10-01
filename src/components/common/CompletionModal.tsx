import React from 'react';
import { Trophy, CheckCircle2, ArrowRight, Zap, Sparkles, X, Share2 } from 'lucide-react';
import { QubifyLogo } from '../brand/QubifyLogo';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  badgeTitle?: string;
  xpEarned?: number;
  onContinueAction?: () => void;
  continueText?: string;
  description?: string;
  ctaLabel?: string;
  onContinue?: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  title = 'Beginner Level Complete!',
  subtitle,
  description,
  badgeTitle = 'Quantum Initiate Badge',
  xpEarned = 250,
  onContinueAction,
  continueText,
  ctaLabel,
  onContinue,
}) => {
  if (!isOpen) return null;

  const resolvedSubtitle = description || subtitle || 'You have mastered the foundations of Quantum Computing with Qubify.';
  const resolvedContinueText = ctaLabel || continueText || 'Explore Intermediate Track';
  const resolvedOnContinue = onContinue || onContinueAction || onClose;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08111F]/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="completion-modal-card"
        className="relative w-full max-w-md bg-[#132238] rounded-3xl shadow-2xl border border-[#243B55] p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200 text-white"
      >
        {/* Close button */}
        <button
          id="close-completion-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E3A5F] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Central Logo / Badge Showcase */}
        <div className="relative mx-auto mb-5 w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#22D3EE] via-[#4F7CFF] to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-[#08111F] border-2 border-[#243B55] shadow-md flex items-center justify-center p-3">
            <img
              src="/qubify-logo.png"
              alt="Qubify Badge"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -bottom-2 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-[#132238]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          <span>Milestone Achieved</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 leading-relaxed max-w-xs mx-auto">
          {resolvedSubtitle}
        </p>

        {/* Reward Pill / XP Box */}
        <div className="mt-5 p-3 rounded-2xl bg-[#08111F]/70 border border-[#243B55] flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1E3A5F] text-[#22D3EE] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#F8FAFC]">+{xpEarned} XP</div>
              <div className="text-[10px] text-[#94A3B8]">Quantum Mastery</div>
            </div>
          </div>

          <div className="h-6 w-px bg-[#243B55]" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1E3A5F] text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#F8FAFC]">{badgeTitle}</div>
              <div className="text-[10px] text-[#94A3B8]">Unlocked</div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            id="completion-modal-continue-cta"
            onClick={resolvedOnContinue}
            className="w-full py-3.5 bg-[#4F7CFF] hover:bg-[#3d6bf0] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#4F7CFF]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{resolvedContinueText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
