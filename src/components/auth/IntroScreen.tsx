import React, { useEffect, useState } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setStep(4);
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(onComplete, 250);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Sequence timeline:
    // 0.0s: Background (step 0)
    // 0.2s: Logo fades in with scale 0.94 -> 1.0 (step 1)
    // 0.7s: "QUBIFY" fades in (step 2)
    // 1.0s: "Interactive Quantum Learning Platform" fades in (step 3)
    // 1.3s: Supporting line fades in (step 4)
    // 1.9s: Smooth fadeout to login (onComplete)
    const t1 = setTimeout(() => setStep(1), 200);
    const t2 = setTimeout(() => setStep(2), 700);
    const t3 = setTimeout(() => setStep(3), 1000);
    const t4 = setTimeout(() => setStep(4), 1300);
    const t5 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 300);
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  // Click or key to skip immediately
  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 150);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 bg-[#232425] flex flex-col items-center justify-center p-6 select-none cursor-pointer transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      role="banner"
      aria-label="Qubify Intro"
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Qubify Brand Logo with 0.2s fade-in & 0.94 -> 1.0 scale */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 mb-6 transition-all duration-500 ease-out transform ${
            step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.94]'
          }`}
        >
          <img
            src="/qubify-logo.png"
            alt="Qubify Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-2xl"
          />
        </div>

        {/* Brand Title: QUBIFY */}
        <h1
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F1F1F1] transition-all duration-400 ease-out transform ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          QUBIFY
        </h1>

        {/* Subtitle: Interactive Quantum Learning Platform */}
        <p
          className={`mt-2 text-sm sm:text-base font-medium text-[#B7BABD] transition-all duration-400 ease-out transform ${
            step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          Interactive Quantum Learning Platform
        </p>

        {/* Optional supporting line: Learn • Visualize • Simulate • Code */}
        <p
          className={`mt-3 text-[11px] sm:text-xs font-mono text-[#858A8E] tracking-wider transition-all duration-400 ease-out ${
            step >= 4 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Learn • Visualize • Simulate • Code
        </p>
      </div>
    </div>
  );
};
