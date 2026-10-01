import React, { useState } from 'react';
import { QubifyLogo } from '../components/brand/QubifyLogo';
import { AppView, UserStats } from '../types';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Atom, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  Trophy,
  Compass
} from 'lucide-react';

interface AuthPageProps {
  onNavigate: (view: AppView) => void;
  onLoginSuccess: (name?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [learnerName, setLearnerName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex.rivera@quantum.edu');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(learnerName);
    if (isSignUp) {
      onNavigate('onboarding');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#4F7CFF]/30 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div 
          className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.05) 0%, rgba(79, 124, 255, 0.03) 50%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <button 
          onClick={() => onNavigate('landing')}
          className="hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
        >
          <QubifyLogo size="md" />
        </button>
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          Back to Overview
        </button>
      </header>

      {/* Main Login/Sign-Up Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#132238]/80 border border-[#243B55] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A5F] border border-[#22D3EE]/30 text-[#22D3EE] text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSignUp ? 'New Learner Registration' : 'Student Access'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              {isSignUp ? 'Join the Quantum Journey' : 'Welcome Back to Qubify'}
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              {isSignUp 
                ? 'Create your free account to track your progress across interactive quantum modules.' 
                : 'Resume your interactive quantum computing lessons and lab simulations.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5 text-left">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#08111F] border border-[#243B55] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] transition-all"
                  placeholder="e.g. Marie Curie"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5 text-left">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#08111F] border border-[#243B55] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] transition-all"
                placeholder="you@institution.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#CBD5E1] text-left">
                  Password
                </label>
                {!isSignUp && (
                  <span className="text-[11px] text-[#22D3EE] hover:underline cursor-pointer">
                    Demo Mode Active
                  </span>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#08111F] border border-[#243B55] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#4F7CFF] hover:bg-[#3d6bf0] text-white font-bold text-sm shadow-md shadow-[#4F7CFF]/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>{isSignUp ? 'Create Learner Account' : 'Sign In to Qubify'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Bypass */}
          <div className="mt-5 pt-5 border-t border-[#243B55] flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onLoginSuccess('Alex Rivera');
                onNavigate('dashboard');
              }}
              className="text-xs text-[#94A3B8] hover:text-[#22D3EE] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Atom className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Instant Guest Mode (Continue as Alex Rivera)</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                {isSignUp ? (
                  <span>Already have an account? <strong className="text-[#22D3EE] font-semibold">Sign in</strong></span>
                ) : (
                  <span>New to Qubify? <strong className="text-[#22D3EE] font-semibold">Create account</strong></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#64748B]">
        Qubify · Interactive Quantum Computing Education Platform
      </footer>
    </div>
  );
};
