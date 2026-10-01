import React from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  RotateCcw, 
  Hash, 
  Trash2,
  FileCode,
  Terminal,
  BarChart2
} from 'lucide-react';
import { RunHistoryItem } from '../../types/codeLab';

interface RunHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: RunHistoryItem[];
  onLoadSnapshot: (code: string, filename: string) => void;
  onClearHistory: () => void;
}

export const RunHistoryDrawer: React.FC<RunHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadSnapshot,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#0B1526] border-l border-[#243B55] h-full shadow-2xl flex flex-col text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#08111F] border-b border-[#243B55]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#22D3EE]" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">Execution History</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#132238] text-[#94A3B8] border border-[#243B55]">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 text-[#94A3B8] hover:text-rose-400 hover:bg-[#132238] rounded-lg transition-colors cursor-pointer"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#132238] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-[#94A3B8] space-y-2">
              <Clock className="w-8 h-8 text-[#64748B]" />
              <p className="font-semibold text-[#F8FAFC]">No execution history yet</p>
              <p className="text-xs max-w-xs">Run a quantum program in the lab to record snapshots and outputs here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className="p-3 bg-[#08111F] border border-[#243B55] hover:border-[#22D3EE]/40 rounded-xl space-y-2.5 transition-colors"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    {item.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-[#F8FAFC]">
                      {item.runId || 'QL-RUN'}
                    </span>
                    <span className="text-[#64748B]">•</span>
                    <span className="text-[#94A3B8]">{item.timestamp}</span>
                  </div>
                  <span className="font-mono text-[#94A3B8]">
                    {(item.executionTimeMs / 1000).toFixed(2)}s
                  </span>
                </div>

                {/* File info and brief output */}
                <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span className="flex items-center gap-1 font-mono text-[#CBD5E1]">
                    <FileCode className="w-3 h-3 text-[#22D3EE]" />
                    <span>{item.filename}</span>
                  </span>
                  {item.counts && Object.keys(item.counts).length > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      <BarChart2 className="w-3 h-3" />
                      <span>{Object.keys(item.counts).length} states</span>
                    </span>
                  )}
                </div>

                {/* Code preview snippet */}
                <pre className="p-2 bg-[#040810] border border-[#1E293B] rounded-lg font-mono text-[10px] text-[#94A3B8] overflow-hidden max-h-16 line-clamp-3">
                  {item.codeSnapshot}
                </pre>

                {/* Action button */}
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onLoadSnapshot(item.codeSnapshot, item.filename);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#132238] hover:bg-[#1E3A5F] text-[#22D3EE] font-semibold text-[11px] rounded-lg border border-[#243B55] hover:border-[#22D3EE]/40 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore Code</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
