import React, { useState } from 'react';
import { QubifyLogo } from '../components/brand/QubifyLogo';
import { AppView } from '../types';
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  Lightbulb, 
  Cpu, 
  Atom, 
  Target, 
  Layers,
  GraduationCap
} from 'lucide-react';

interface OnboardingPageProps {
  onCompleteOnboarding: () => void;
  userName: string;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onCompleteOnboarding,
  userName,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('foundations');
  const [selectedPace, setSelectedPace] = useState<string>('balanced');
  const [step, setStep] = useState<number>(1);

  const learningGoals = [
    {
      id: 'foundations',
      title: 'Quantum Foundations from Scratch',
      desc: 'No heavy mathematics or physics required. Understand bits, superposition, and quantum gates visually.',
      icon: Atom,
    },
    {
      id: 'developer',
      title: 'Software Engineer to Quantum Dev',
      desc: 'Connect classical coding concepts to quantum circuits and Qiskit Python execution.',
      icon: Cpu,
    },
    {
      id: 'curious',
      title: 'Conceptual & Scientific Curiosity',
      desc: 'See how reality works at the quantum level through interactive simulations without the hype.',
      icon: Lightbulb,
    },
  ];

  const paces = [
    {
      id: 'casual',
      title: '5-10 mins / day',
      desc: '1 lesson daily with interactive check-ins.',
    },
    {
      id: 'balanced',
      title: '15-20 mins / day',
      desc: 'Ideal pace to finish the Beginner track in 2 weeks.',
    },
    {
      id: 'immersive',
      title: 'Weekend Deep-Dive',
      desc: 'Explore lessons, lab circuit builder, and challenges freely.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08111F] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#4F7CFF]/30 selection:text-white">
      {/* Background subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div 
          className="absolute top-1/4 left-1/3 w-[650px] h-[650px] rounded-full blur-[160px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.05) 0%, rgba(79, 124, 255, 0.03) 50%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <QubifyLogo size="md" />
        <div className="text-xs font-mono text-[#94A3B8]">
          Step {step} of 2
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
        {step === 1 ? (
          <div className="bg-[#132238]/80 border border-[#243B55] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A5F] border border-[#22D3EE]/30 text-[#22D3EE] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>Personalize Your Pathway</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
                Welcome, {userName.split(' ')[0]}! What is your primary learning goal?
              </h1>
              <p className="text-xs text-[#94A3B8] mt-1">
                We will tailor your learning path recommendations and challenge difficulty.
              </p>
            </div>

            <div className="space-y-3">
              {learningGoals.map((g) => {
                const Icon = g.icon;
                const isSelected = selectedGoal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'bg-[#1E3A5F] border-[#22D3EE] shadow-sm'
                        : 'bg-[#08111F]/60 border-[#243B55] hover:border-[#4F7CFF]/50 hover:bg-[#132238]'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-[#22D3EE]/20 text-[#22D3EE]' : 'bg-[#132238] text-[#94A3B8]'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-bold text-[#F8FAFC] flex items-center justify-between">
                        <span>{g.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#22D3EE]" />}
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-[#4F7CFF] hover:bg-[#3d6bf0] text-white font-bold text-sm shadow-md shadow-[#4F7CFF]/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#132238]/80 border border-[#243B55] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A5F] border border-[#22D3EE]/30 text-[#22D3EE] text-[11px] font-bold uppercase tracking-wider mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Study Rhythm</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
                How much time would you like to dedicate?
              </h1>
              <p className="text-xs text-[#94A3B8] mt-1">
                You can change this anytime from your learner profile.
              </p>
            </div>

            <div className="space-y-3">
              {paces.map((p) => {
                const isSelected = selectedPace === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPace(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1E3A5F] border-[#22D3EE] shadow-sm'
                        : 'bg-[#08111F]/60 border-[#243B55] hover:border-[#4F7CFF]/50 hover:bg-[#132238]'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold text-[#F8FAFC]">{p.title}</div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{p.desc}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-[#22D3EE]" />}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onCompleteOnboarding}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#22D3EE] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#4F7CFF]/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Enter Quantum Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#64748B]">
        Qubify · Interactive Quantum Computing Education Platform
      </footer>
    </div>
  );
};
