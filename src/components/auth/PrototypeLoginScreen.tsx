import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PrototypeLoginScreenProps {
  onLogin: () => Promise<void>;
}

export const PrototypeLoginScreen: React.FC<PrototypeLoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#232425] text-[#F1F1F1] flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        
        {/* Brand Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 flex items-center justify-center">
          <img
            src="/qubify-logo.png"
            alt="Qubify Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-2xl"
          />
        </div>

        {/* Brand Name */}
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F1F1] mb-6">
          QUBIFY
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F1F1] tracking-tight">
          Welcome to Qubify
        </h1>
        <p className="mt-2 text-sm text-[#858A8E] max-w-xs leading-relaxed">
          Continue your quantum learning journey.
        </p>

        {/* Centered Sign-In Action Block */}
        <div className="w-full mt-8 flex flex-col items-center">
          <button
            id="prototype-google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 min-h-[44px] px-5 bg-[#1FA7DA] hover:bg-[#27B4E8] active:bg-[#188BB5] disabled:opacity-75 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-3 shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                {/* Generic Google "G" indicator */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.4 0 12.7s.6 4.4 1.6 6.3l3.7-4.3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16.4C3.5 20.3 7.4 23.5 12 23.5z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Prototype disclaimer label */}
          <span className="mt-3 text-[11px] font-mono text-[#858A8E]">
            Prototype Sign-In
          </span>
        </div>

      </div>
    </div>
  );
};
