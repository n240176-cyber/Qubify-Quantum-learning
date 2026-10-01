import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  ChevronRight, 
  Plus, 
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { QuantumCodeExample } from '../../types/codeLab';
import { CODE_EXAMPLES_LIBRARY } from '../../data/codeExamples';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (example: QuantumCodeExample, mode: 'replace' | 'newTab') => void;
}

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  isOpen,
  onClose,
  onSelectExample,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'foundations' | 'intermediate' | 'experiments' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExample, setSelectedExample] = useState<QuantumCodeExample>(CODE_EXAMPLES_LIBRARY[0]);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredExamples = CODE_EXAMPLES_LIBRARY.filter((ex) => {
    const matchesCat = activeCategory === 'all' || ex.category === activeCategory;
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenInNewTab = () => {
    onSelectExample(selectedExample, 'newTab');
    setShowReplaceConfirm(false);
    onClose();
  };

  const handleConfirmReplace = () => {
    onSelectExample(selectedExample, 'replace');
    setShowReplaceConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#202122] border border-[#44474A] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#44474A] bg-[#232425]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#28292A] border border-[#44474A] text-[#1FA7DA] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F1F1]">Qiskit Examples Library</h3>
              <p className="text-xs text-[#858A8E]">Verified quantum Python programs ready to inspect and run</p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowReplaceConfirm(false);
              onClose();
            }}
            className="p-1.5 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left List + Right Code Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden relative">
          
          {/* Left: Example List (5 cols) */}
          <div className="md:col-span-5 border-r border-[#44474A] flex flex-col bg-[#202122] overflow-hidden">
            
            {/* Search & Category Pills */}
            <div className="p-3 border-b border-[#44474A] space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#858A8E]" />
                <input
                  type="text"
                  placeholder="Search examples..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#28292A] border border-[#44474A] rounded-lg text-xs text-[#F1F1F1] placeholder-[#858A8E] focus:outline-none focus:border-[#1FA7DA]"
                />
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'foundations', label: 'Foundations' },
                  { id: 'intermediate', label: 'Intermediate' },
                  { id: 'experiments', label: 'Experiments' },
                  { id: 'advanced', label: 'Advanced' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id as any);
                      setShowReplaceConfirm(false);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-[#1FA7DA] text-white font-semibold'
                        : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredExamples.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedExample(item);
                    setShowReplaceConfirm(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                    selectedExample.id === item.id
                      ? 'bg-[#28292A] border border-[#1FA7DA]/50 text-[#F1F1F1]'
                      : 'hover:bg-[#28292A]/60 border border-transparent text-[#CBD5E1]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold truncate">{item.title}</div>
                    <div className="text-[10px] text-[#858A8E] font-mono mt-0.5 truncate">{item.filename}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#858A8E] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Code Preview & Action Buttons (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-[#232425] overflow-hidden">
            <div className="p-4 border-b border-[#44474A] bg-[#202122]">
              <div className="text-xs font-bold text-[#F1F1F1]">{selectedExample.title}</div>
              <p className="text-xs text-[#858A8E] mt-1 leading-relaxed">{selectedExample.description}</p>
            </div>

            {/* Code preview block */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-[#CBD5E1] bg-[#1A1B1C]">
              <pre className="whitespace-pre leading-relaxed">{selectedExample.code}</pre>
            </div>

            {/* Action Bar */}
            <div className="p-3 border-t border-[#44474A] bg-[#202122] flex items-center justify-between gap-3">
              <span className="text-xs text-[#858A8E] font-mono">
                Load into workspace:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenInNewTab}
                  className="px-3 py-1.5 text-xs font-semibold text-[#F1F1F1] bg-[#28292A] hover:bg-[#303234] border border-[#44474A] rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1FA7DA]" />
                  <span>Open in New Tab</span>
                </button>

                <button
                  onClick={() => setShowReplaceConfirm(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1FA7DA] hover:bg-[#27B4E8] rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replace Current</span>
                </button>
              </div>
            </div>

            {/* Replace Current Confirmation Prompt Overlay */}
            {showReplaceConfirm && (
              <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
                <div className="max-w-md w-full bg-[#202122] border border-amber-500/40 rounded-xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F1F1F1]">Replace current code?</h4>
                      <p className="text-xs text-[#858A8E] mt-1 leading-relaxed">
                        This will replace the contents of your active file with <strong className="text-[#F1F1F1]">{selectedExample.title}</strong>. You can also open it in a new tab to preserve your current code.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#44474A]">
                    <button
                      onClick={() => setShowReplaceConfirm(false)}
                      className="w-full sm:w-auto px-3 py-1.5 text-xs text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded-md cursor-pointer transition-colors"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleOpenInNewTab}
                      className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-[#F1F1F1] bg-[#28292A] hover:bg-[#303234] border border-[#44474A] rounded-md cursor-pointer transition-colors"
                    >
                      OPEN IN NEW TAB
                    </button>
                    <button
                      onClick={handleConfirmReplace}
                      className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-md cursor-pointer transition-colors"
                    >
                      REPLACE
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
