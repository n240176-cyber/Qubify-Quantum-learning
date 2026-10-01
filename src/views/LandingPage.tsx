import React from 'react';
import { QubifyLogo } from '../components/brand/QubifyLogo';
import { AppView } from '../types';
import { 
  ArrowRight, 
  Cpu, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  Atom
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#08111F] text-[#F8FAFC] flex flex-col selection:bg-[#4F7CFF]/30 selection:text-white">
      {/* Background ambient glowing spheres */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div 
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.06) 0%, rgba(79, 124, 255, 0.03) 50%, transparent 70%)',
          }}
        />
        <div 
          className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full blur-[160px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(79, 124, 255, 0.04) 0%, rgba(139, 92, 246, 0.02) 50%, transparent 70%)',
          }}
        />
        <div 
          className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full blur-[150px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.035) 0%, transparent 65%)',
          }}
        />
      </div>
      
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between z-10">
        <QubifyLogo size="md" />
        <div className="flex items-center gap-3">
          <button
            id="landing-header-login-btn"
            onClick={() => onNavigate('auth')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#132238] rounded-xl transition-colors cursor-pointer"
          >
            Learner Login
          </button>
          <button
            id="landing-header-cta-btn"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-[#4F7CFF] hover:bg-[#3d6bf0] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Start Learning
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex flex-col items-center text-center z-10">
        
        {/* Brand Showcase Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-3.5 bg-[#132238] border border-[#243B55] shadow-xl shadow-[#4F7CFF]/10 flex items-center justify-center">
            <img
              src="/qubify-logo.png"
              alt="Qubify Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Product Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E3A5F] border border-[#22D3EE]/30 text-[#22D3EE] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Interactive Quantum Learning Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight max-w-3xl leading-[1.1]">
          Quantum intuition through visual discovery.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#94A3B8] max-w-2xl font-normal leading-relaxed">
          Learn quantum computing by exploring, building, and experimenting. No math barriers, no tedious syntax hurdles.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          <button
            id="hero-primary-cta"
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-base rounded-xl shadow-lg shadow-[#4F7CFF]/25 hover:shadow-[#4F7CFF]/35 transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="hero-secondary-cta"
            onClick={() => onNavigate('lab')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#132238] hover:bg-[#1E3A5F] text-[#F8FAFC] font-bold text-base rounded-xl border border-[#243B55] hover:border-[#4F7CFF]/40 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Cpu className="w-4 h-4 text-[#22D3EE]" />
            <span>Open Quantum Lab</span>
          </button>
        </div>

        {/* Core Pedagogical Framework Strip: CONCEPT -> SEE -> UNDERSTAND -> TRY -> OBSERVE -> TAKEAWAY */}
        <div className="mt-14 w-full max-w-4xl">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Qubify Learning Philosophy
          </div>
          <div className="bg-[#132238]/80 border border-[#243B55] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-left backdrop-blur-xs">
            {[
              { label: 'Concept', desc: 'Real-world hook' },
              { label: 'See', desc: 'Interactive 3D state' },
              { label: 'Understand', desc: 'Plain-language physics' },
              { label: 'Try', desc: 'Hands-on gates' },
              { label: 'Observe', desc: 'Statistical collapse' },
              { label: 'Takeaway', desc: 'Core takeaway' },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.label}>
                <div className="flex-1 min-w-[110px] p-2 rounded-xl hover:bg-[#1E3A5F]/40 transition-colors">
                  <div className="text-xs font-mono font-bold text-[#22D3EE]">{step.label}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">{step.desc}</div>
                </div>
                {idx < arr.length - 1 && (
                  <span className="hidden sm:block text-[#243B55] font-bold text-sm">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl text-left">
          <div className="bg-[#132238]/60 border border-[#243B55] rounded-2xl p-5 backdrop-blur-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[#F8FAFC]">Sequential Visual Lessons</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Step-by-step interactive modules from classical bits to Bloch sphere rotation gates (Rx, Ry, Rz).
            </p>
          </div>

          <div className="bg-[#132238]/60 border border-[#243B55] rounded-2xl p-5 backdrop-blur-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] border border-[#4F7CFF]/30 flex items-center justify-center text-[#4F7CFF]">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[#F8FAFC]">Quantum Circuit Lab</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Drag-and-drop circuit simulator with live Qiskit Python translation and empirical shot histograms.
            </p>
          </div>

          <div className="bg-[#132238]/60 border border-[#243B55] rounded-2xl p-5 backdrop-blur-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[#F8FAFC]">Empirical Challenges</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Test your intuition with quantum target constraints, measurement mechanics, and track mastery.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#243B55] text-xs text-[#64748B]">
        <div>Qubify · Interactive Quantum Computing Education Platform</div>
        <div className="flex items-center gap-4 text-[#94A3B8]">
          <button onClick={() => onNavigate('path')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">Curriculum</button>
          <button onClick={() => onNavigate('lab')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">Circuit Lab</button>
          <button onClick={() => onNavigate('auth')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">Learner Login</button>
        </div>
      </footer>
    </div>
  );
};
