import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface PrototypeLoginScreenProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<LoginResult>;

  onGuest: () => Promise<void>;
}

export const PrototypeLoginScreen: React.FC<
  PrototypeLoginScreenProps
> = ({
  onLogin,
  onGuest,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isGuestLoading, setIsGuestLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        'Enter your demo email and password.'
      );
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result =
        await onLogin(
          email.trim(),
          password
        );

      if (!result.success) {
        setError(
          result.error ||
            'Invalid email or password.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    if (
      isGuestLoading ||
      isLoading
    ) {
      return;
    }

    setError('');
    setIsGuestLoading(true);

    try {
      await onGuest();
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050713] text-white font-sans">

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[130px]" />

        <div className="absolute left-[15%] bottom-[15%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />

        <div className="absolute right-[10%] top-[15%] w-[300px] h-[300px] rounded-full bg-fuchsia-500/5 blur-[100px]" />

        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(79,124,255,.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(79,124,255,.8) 1px, transparent 1px)
            `,
            backgroundSize:
              '45px 45px',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">

          {/* =====================================================
              LEFT — BRAND STORY
              ===================================================== */}

          <div className="hidden lg:block">
            <div className="flex items-center gap-4">
              <img
                src="/qubify-logo-v2.png"
                alt="Qubify"
                className="w-20 h-20 object-contain drop-shadow-[0_15px_35px_rgba(217,70,239,.25)]"
              />

              <div>
                <p className="text-xs font-mono tracking-[0.22em] text-[#94A3B8]">
                  QUANTUM LEARNING PLATFORM
                </p>

                <h1 className="text-3xl font-black tracking-[0.15em]">
                  QUBIFY
                </h1>
              </div>
            </div>

            <div className="mt-10 max-w-xl">
              <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight">
                Learn quantum computing
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-fuchsia-400">
                  by seeing it happen.
                </span>
              </h2>

              <p className="mt-5 text-[#94A3B8] text-lg leading-relaxed">
                Connect circuits,
                Bloch-sphere intuition,
                Qiskit code and real
                simulation into one learning
                journey.
              </p>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-3 max-w-xl">
              {[
                [
                  '01',
                  'LEARN',
                  'Understand the idea',
                ],
                [
                  '02',
                  'VISUALIZE',
                  'See the state change',
                ],
                [
                  '03',
                  'SIMULATE',
                  'Run real Qiskit',
                ],
              ].map(
                ([
                  number,
                  title,
                  text,
                ]) => (
                  <div
                    key={number}
                    className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07]"
                  >
                    <p className="text-[10px] font-mono text-[#64748B]">
                      {number}
                    </p>

                    <p className="text-xs font-mono font-bold text-[#67E8F9] mt-2">
                      {title}
                    </p>

                    <p className="text-xs text-[#94A3B8] mt-2">
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* =====================================================
              RIGHT — LOGIN
              ===================================================== */}

          <div className="w-full max-w-md mx-auto">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-7">
              <img
                src="/qubify-logo-v2.png"
                alt="Qubify"
                className="w-24 h-24 object-contain mx-auto"
              />

              <p className="font-black tracking-[0.18em] text-2xl mt-2">
                QUBIFY
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-[#0B1220]/95 border border-white/[0.08] shadow-2xl shadow-purple-950/30 p-6 sm:p-8">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />

                <span className="text-xs font-mono font-bold text-purple-300 tracking-wider">
                  TRACKED LEARNING
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-extrabold">
                Welcome back.
              </h2>

              <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
                Sign in with one of the
                Qubify demo accounts to track
                lessons, challenges and weak
                topics.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-4"
              >
                {/* Email */}
                <div>
                  <label className="text-xs font-mono text-[#94A3B8]">
                    EMAIL
                  </label>

                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="student1@qubify.demo"
                      autoComplete="username"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#07101D] border border-[#243B55] text-sm text-white placeholder:text-[#475569] outline-none focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-mono text-[#94A3B8]">
                    PASSWORD
                  </label>

                  <div className="relative mt-2">
                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full h-12 pl-11 pr-12 rounded-xl bg-[#07101D] border border-[#243B55] text-sm text-white placeholder:text-[#475569] outline-none focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/10 transition-all"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/25 border border-red-400/25 text-red-300 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    isGuestLoading
                  }
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#22D3EE] via-[#4F7CFF] to-purple-500 text-[#050713] font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      SIGNING IN...
                    </>
                  ) : (
                    <>
                      SIGN IN
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[#243B55]" />

                <span className="text-[10px] font-mono text-[#64748B]">
                  OR
                </span>

                <div className="flex-1 h-px bg-[#243B55]" />
              </div>

              {/* Guest */}
              <button
                type="button"
                onClick={handleGuest}
                disabled={
                  isLoading ||
                  isGuestLoading
                }
                className="w-full min-h-12 py-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.08] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGuestLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ENTERING...
                  </>
                ) : (
                  <>
                    <UserRound className="w-4 h-4 text-[#94A3B8]" />
                    CONTINUE AS GUEST
                  </>
                )}
              </button>

              <p className="mt-3 text-[11px] text-[#64748B] text-center leading-relaxed">
                Guests can explore all
                available lessons, but their
                learning history will not be
                included in tracked demo
                analytics.
              </p>
            </div>

            {/* Demo account hint */}
            <div className="mt-4 rounded-2xl bg-[#0B1220]/70 border border-[#243B55] p-4">
              <p className="text-[10px] font-mono font-bold text-[#64748B]">
                DEMO ACCOUNTS
              </p>

              <p className="mt-2 text-xs text-[#94A3B8]">
                student1@qubify.demo
              </p>

              <p className="text-xs text-[#94A3B8]">
                student2@qubify.demo
              </p>

              <p className="text-xs text-[#94A3B8]">
                student3@qubify.demo
              </p>

              <p className="mt-2 text-[11px] text-purple-300 font-mono">
                password: qubify123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};