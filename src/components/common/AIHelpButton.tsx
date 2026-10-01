import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, ArrowRight, Lightbulb, Bot } from 'lucide-react';

interface AIHelpButtonProps {
  contextTopic?: string;
}

export const AIHelpButton: React.FC<AIHelpButtonProps> = ({ 
  contextTopic = 'Quantum Measurement & Qubits' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `Hi! I'm Qubify AI, your quantum learning companion. Ask me anything about ${contextTopic}, or click one of the suggestions below!`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const suggestions = [
    'Explain this simply',
    'Why does this happen?',
    'Give me an example',
    'Explain deeper',
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');

    // Responsive placeholder response showing framework behavior
    setTimeout(() => {
      let aiReply = '';
      if (text.includes('simply')) {
        aiReply = `Simple analogy: Think of a classical bit like a coin glued down as Heads (0) or Tails (1). A qubit in superposition is like that coin spinning in mid-air—it has amplitudes of both until measurement forces it to land!`;
      } else if (text.includes('Why')) {
        aiReply = `In quantum mechanics, measurement disturbs the system. When a detector interacts with a qubit in superposition, the quantum state collapses into one of the definite computational basis states (|0⟩ or |1⟩).`;
      } else if (text.includes('example')) {
        aiReply = `Real-world example: A random number generator! In quantum computing, measuring a qubit in an equal superposition state (H gate) creates true physical randomness, unlike pseudo-random software formulas.`;
      } else {
        aiReply = `Under the hood: A quantum state is represented as a state vector |ψ⟩ = α|0⟩ + β|1⟩ in a complex 2-dimensional Hilbert space, where |α|² + |β|² = 1 represents total probability.`;
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    }, 450);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="ask-qubify-ai-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#4F7CFF] via-[#6366F1] to-purple-600 text-white font-bold text-sm rounded-full shadow-lg shadow-[#4F7CFF]/30 hover:shadow-[#4F7CFF]/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group border border-white/20"
        aria-label="Ask Qubify AI assistant"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-[#22D3EE] animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#22D3EE] rounded-full animate-ping opacity-75" />
        </div>
        <span className="tracking-tight">Ask Qubify AI</span>
      </button>

      {/* Side Panel / Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#08111F]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-10 w-full max-w-md bg-[#132238] text-[#F8FAFC] h-full shadow-2xl flex flex-col border-l border-[#243B55] animate-in slide-in-from-right duration-250">
            
            {/* Header */}
            <div className="p-4 border-b border-[#243B55] flex items-center justify-between bg-[#08111F]/90 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#22D3EE] to-[#4F7CFF] flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                    Qubify AI Assistant
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/30">
                      Tutor
                    </span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] truncate">
                    Topic: {contextTopic}
                  </p>
                </div>
              </div>

              <button
                id="close-ai-drawer-button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#1E3A5F] transition-colors cursor-pointer"
                aria-label="Close AI assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#08111F]/50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center shrink-0 mt-1 text-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#4F7CFF] text-white rounded-tr-xs font-medium'
                        : 'bg-[#132238] border border-[#243B55] text-[#CBD5E1] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions Chips */}
            <div className="px-4 py-2 bg-[#08111F]/80 border-t border-[#243B55]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick prompts</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    id={`ai-suggestion-${suggestion.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => handleSend(suggestion)}
                    className="px-2.5 py-1 bg-[#132238] hover:bg-[#1E3A5F] border border-[#243B55] hover:border-[#22D3EE]/50 rounded-full text-xs text-[#CBD5E1] hover:text-[#22D3EE] font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{suggestion}</span>
                    <ArrowRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Footer */}
            <div className="p-3.5 border-t border-[#243B55] bg-[#08111F]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="ai-prompt-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question about this step..."
                  className="flex-1 bg-[#132238] border border-[#243B55] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/50 focus:border-[#4F7CFF] transition-all"
                />
                <button
                  id="ai-send-button"
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-3.5 py-2 bg-[#4F7CFF] hover:bg-[#3d6bf0] disabled:opacity-40 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shrink-0"
                >
                  Send
                </button>
              </form>
              <p className="text-[10px] text-[#64748B] text-center mt-2">
                Quantum AI Mentor helps you explore beyond basic curriculum.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
