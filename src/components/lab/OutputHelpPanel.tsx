import React, { useState } from 'react';
import { 
  Terminal, 
  AlertOctagon, 
  BarChart2, 
  HelpCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Play, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Info,
  Maximize2,
  Download,
  Layers,
  Cpu,
  Hash
} from 'lucide-react';
import { QuantumExecutionResult } from '../../types/codeLab';

interface OutputHelpPanelProps {
  result: QuantumExecutionResult | null;
  isRunning: boolean;
  activeTab: 'output' | 'errors' | 'results' | 'help';
  onTabChange: (tab: 'output' | 'errors' | 'results' | 'help') => void;
  onApplySuggestion?: (replacement: { targetLine: number; replacement: string }) => void;
  onAskAI?: (prompt: string) => void;
  code: string;
}

export const OutputHelpPanel: React.FC<OutputHelpPanelProps> = ({
  result,
  isRunning,
  activeTab,
  onTabChange,
  onApplySuggestion,
  onAskAI,
  code,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedResultSetIndex, setSelectedResultSetIndex] = useState(0);
  const [selectedFigureModal, setSelectedFigureModal] = useState<string | null>(null);

  const hasError = !!(result && (!result.success || result.error || result.stderr));
  const hasFigures = !!(result && result.figures && result.figures.length > 0);
  const resultSets = result?.resultSets && result.resultSets.length > 0 ? result.resultSets : [];
  const hasCounts = resultSets.length > 0 || !!(result && result.counts && Object.keys(result.counts).length > 0);

  const handleCopyOutput = () => {
    const textToCopy = result?.stdout || result?.stderr || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine active counts and total shots based on selected result set
  const currentResultSet = resultSets[selectedResultSetIndex] || null;
  const activeCounts = currentResultSet ? currentResultSet.counts : (result?.counts || {});
  const activeTotalShots = currentResultSet 
    ? currentResultSet.totalShots 
    : (result?.totalShots || Object.values(activeCounts).reduce((a, b) => a + b, 0));

  const handleDownloadFigure = (dataUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qubify_circuit_plot_${index + 1}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#28292A] text-left">
      
      {/* Panel Header & Tabs */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#202122] border-b border-[#44474A]">
        <div className="flex items-center gap-1">
          
          {/* OUTPUT TAB */}
          <button
            id="tab-output"
            onClick={() => onTabChange('output')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'output'
                ? 'bg-[#1E3545] text-[#1FA7DA] border border-[#1FA7DA]/30'
                : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          {/* ERRORS TAB */}
          <button
            id="tab-errors"
            onClick={() => onTabChange('errors')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer relative ${
              activeTab === 'errors'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                : hasError
                ? 'text-rose-400 hover:bg-rose-950/40'
                : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Errors</span>
            {hasError && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* RESULTS TAB */}
          <button
            id="tab-results"
            onClick={() => onTabChange('results')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'results'
                ? 'bg-[#1E3545] text-[#1FA7DA] border border-[#1FA7DA]/30'
                : (hasCounts || hasFigures)
                ? 'text-emerald-400 hover:bg-emerald-950/30'
                : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Results</span>
            {(hasCounts || hasFigures) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* HELP TAB */}
          <button
            id="tab-help"
            onClick={() => onTabChange('help')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'help'
                ? 'bg-[#1E3545] text-[#1FA7DA] border border-[#1FA7DA]/30'
                : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>
        </div>

        {/* Copy button */}
        {(result?.stdout || result?.stderr) && (
          <button
            onClick={handleCopyOutput}
            className="p-1 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded transition-colors cursor-pointer"
            title="Copy output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 font-mono text-xs text-[#CBD5E1]">
        
        {/* RUNNING STATE */}
        {isRunning && (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-7 h-7 border-2 border-[#1FA7DA] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-[#B7BABD]">
              Executing in Python &amp; Qiskit sandbox...
            </p>
          </div>
        )}

        {/* NO RUN YET STATE */}
        {!isRunning && !result && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4 space-y-2.5 font-sans">
            <div className="w-10 h-10 rounded-lg bg-[#202122] border border-[#44474A] flex items-center justify-center text-[#858A8E]">
              <Play className="w-4 h-4 ml-0.5 text-[#1FA7DA]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F1F1F1]">No Output Yet</h4>
              <p className="text-xs text-[#858A8E] max-w-xs mt-0.5 leading-relaxed">
                Click <strong className="text-[#1FA7DA] font-semibold">Run Code</strong> or press <kbd className="px-1.5 py-0.5 bg-[#202122] border border-[#44474A] rounded text-[11px] font-mono text-[#F1F1F1]">Ctrl + Enter</kbd>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: OUTPUT */}
        {!isRunning && result && activeTab === 'output' && (
          <div className="space-y-3 font-mono text-xs">
            {/* Run Execution Metadata */}
            <div className="flex items-center justify-between pb-2 border-b border-[#44474A] text-[11px] text-[#858A8E]">
              <div className="flex items-center gap-2.5">
                {result.runId && (
                  <span className="flex items-center gap-1 font-semibold text-[#1FA7DA]">
                    <Hash className="w-3 h-3" />
                    <span>{result.runId}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#858A8E]" />
                  <span>Time: <strong className="text-[#F1F1F1]">{(result.executionTimeMs / 1000).toFixed(2)}s</strong></span>
                </span>
                {result.peakMemoryMb ? (
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[#858A8E]" />
                    <span>Memory: <strong className="text-[#F1F1F1]">{result.peakMemoryMb} MB</strong></span>
                  </span>
                ) : null}
              </div>
              <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${
                result.success ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
              }`}>
                {result.success ? 'Success' : 'Failed'}
              </span>
            </div>

            {/* Captured stdout */}
            {result.stdout ? (
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#858A8E]">
                  stdout:
                </div>
                <pre className="p-3 bg-[#202122] border border-[#44474A] rounded-lg overflow-x-auto text-[#F1F1F1] leading-relaxed whitespace-pre-wrap font-mono text-xs">
                  {result.stdout}
                </pre>
              </div>
            ) : !result.stderr ? (
              <div className="p-3 bg-[#202122] border border-[#44474A] rounded-lg text-xs text-[#858A8E]">
                Program completed successfully with no standard output.
              </div>
            ) : null}

            {/* If there was also stderr in output tab */}
            {result.stderr && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  <span>stderr:</span>
                  <button 
                    onClick={() => onTabChange('errors')}
                    className="text-[#1FA7DA] hover:underline cursor-pointer flex items-center gap-1 font-sans text-xs"
                  >
                    <span>View Explanation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <pre className="p-3 bg-[#381F24] border border-rose-500/40 rounded-lg overflow-x-auto text-rose-300 leading-relaxed whitespace-pre-wrap">
                  {result.stderr}
                </pre>
              </div>
            )}

            {/* Quick action: Explain Run */}
            {result.success && onAskAI && (
              <div className="pt-1">
                <button
                  onClick={() => onAskAI(`Please explain this Qiskit quantum run. Here is the code:\n\`\`\`python\n${code}\n\`\`\`\nAnd output:\n${result.stdout}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2B2C2D] hover:bg-[#303234] border border-[#44474A] text-xs font-sans font-medium text-[#1FA7DA] rounded-md transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain Run with AI</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ERRORS */}
        {!isRunning && result && activeTab === 'errors' && (
          <div className="space-y-3 font-sans text-xs">
            {!hasError ? (
              <div className="p-6 text-center text-[#858A8E] space-y-1.5">
                <Check className="w-7 h-7 mx-auto text-emerald-400" />
                <h4 className="text-sm font-bold text-[#F1F1F1]">No Errors Encountered</h4>
                <p className="text-xs">Your Python and Qiskit program executed without exceptions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* 1. REAL PYTHON TRACEBACK */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Python Traceback</span>
                    </span>
                    {result.error?.line && (
                      <span className="px-2 py-0.2 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded font-mono text-[11px]">
                        Line {result.error.line}
                      </span>
                    )}
                  </div>
                  <pre className="p-3 bg-[#381F24] border border-rose-500/40 rounded-lg font-mono text-[11px] text-rose-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {result.stderr || result.error?.rawMessage}
                  </pre>
                </div>

                {/* 2. QUBIFY EDUCATIONAL EXPLANATION */}
                {result.error && (
                  <div className="p-3.5 bg-[#2B2C2D] border border-[#44474A] rounded-lg space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1FA7DA]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Diagnostic Explanation</span>
                    </div>

                    <p className="text-xs text-[#F1F1F1] leading-relaxed font-sans">
                      {result.error.qubifyExplanation}
                    </p>

                    {result.error.suggestion && (
                      <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-md space-y-1.5">
                        <div className="text-[11px] font-bold text-[#B7BABD]">
                          Suggested Fix:
                        </div>
                        <div className="text-xs font-mono text-[#1FA7DA]">
                          {result.error.suggestion}
                        </div>
                        {result.error.suggestedCodeReplacement && onApplySuggestion && (
                          <button
                            onClick={() => onApplySuggestion(result.error!.suggestedCodeReplacement!)}
                            className="mt-1 px-2.5 py-1 bg-[#1FA7DA] hover:bg-[#27B4E8] text-white font-semibold text-xs rounded transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Apply Suggestion</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Ask AI option */}
                {onAskAI && (
                  <button
                    onClick={() => onAskAI(`Help me fix this Python Qiskit error:\nError: ${result.stderr || result.error?.rawMessage}\n\nCode:\n\`\`\`python\n${code}\n\`\`\``)}
                    className="w-full py-1.5 bg-[#1E3545] hover:bg-[#254257] border border-[#1FA7DA]/30 text-[#1FA7DA] font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Qubify AI for Troubleshooting</span>
                  </button>
                )}

              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESULTS */}
        {!isRunning && result && activeTab === 'results' && (
          <div className="space-y-4 font-sans">
            
            {/* A. MATPLOTLIB FIGURES */}
            {hasFigures && (
              <div className="space-y-2.5 pb-3 border-b border-[#44474A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1FA7DA]" />
                    <h4 className="text-xs font-bold text-[#F1F1F1] uppercase tracking-wider">
                      Matplotlib Circuit Figures ({result.figures!.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#858A8E] font-mono">Qiskit mpl drawer</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {result.figures!.map((figUrl, idx) => (
                    <div 
                      key={idx} 
                      className="group relative bg-[#202122] border border-[#44474A] hover:border-[#1FA7DA]/40 rounded-lg p-2 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-1 px-1 text-[11px] text-[#858A8E]">
                        <span>Figure {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedFigureModal(figUrl)}
                            className="p-1 hover:text-[#1FA7DA] rounded cursor-pointer transition-colors"
                            title="View Full Resolution"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadFigure(figUrl, idx)}
                            className="p-1 hover:text-[#1FA7DA] rounded cursor-pointer transition-colors"
                            title="Download PNG"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div 
                        className="overflow-hidden rounded bg-white/5 cursor-pointer flex items-center justify-center p-2"
                        onClick={() => setSelectedFigureModal(figUrl)}
                      >
                        <img 
                          src={figUrl} 
                          alt={`Qiskit Circuit Figure ${idx + 1}`} 
                          className="max-h-64 object-contain rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B. CIRCUIT ANALYSIS METRICS */}
            {result.circuitAnalysis && result.circuitAnalysis.length > 0 && (
              <div className="space-y-2.5 pb-3 border-b border-[#44474A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#1FA7DA]" />
                    <h4 className="text-xs font-bold text-[#F1F1F1] uppercase tracking-wider">
                      Circuit Analysis
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#858A8E] font-mono">Qiskit Introspection</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.circuitAnalysis.map((ca, idx) => (
                    <div key={idx} className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between font-bold text-[#1FA7DA]">
                        <span>{ca.name}</span>
                        <span className="text-[#858A8E] font-normal text-[10px]">depth: {ca.depth}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1 text-[#B7BABD]">
                        <div>Qubits: <strong className="text-[#F1F1F1]">{ca.numQubits}</strong></div>
                        <div>Clbits: <strong className="text-[#F1F1F1]">{ca.numClbits}</strong></div>
                        <div>Total Gates: <strong className="text-[#F1F1F1]">{ca.size}</strong></div>
                        <div>Entangling: <strong className="text-[#1FA7DA]">{ca.entanglingGateCount}</strong></div>
                      </div>
                      {ca.countOps && Object.keys(ca.countOps).length > 0 && (
                        <div className="pt-1 border-t border-[#44474A] text-[10px] text-[#858A8E] flex flex-wrap gap-1">
                          {Object.entries(ca.countOps).map(([op, cnt]) => (
                            <span key={op} className="bg-[#28292A] px-1.5 py-0.2 rounded border border-[#44474A]">
                              {op}: {cnt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. MULTIPLE RESULT SETS / EXPERIMENTS SWITCHER */}
            {resultSets.length > 1 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#858A8E] uppercase tracking-wider">
                  Result Sets ({resultSets.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resultSets.map((rs, idx) => (
                    <button
                      key={rs.id || idx}
                      onClick={() => setSelectedResultSetIndex(idx)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        selectedResultSetIndex === idx
                          ? 'bg-[#1E3545] text-[#1FA7DA] border border-[#1FA7DA]/40'
                          : 'bg-[#202122] text-[#858A8E] hover:text-[#F1F1F1] border border-[#44474A]'
                      }`}
                    >
                      <span>{rs.label || `Circuit ${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* D. MEASUREMENT HISTOGRAM SECTION */}
            {!hasCounts && !hasFigures ? (
              <div className="p-6 text-center text-[#858A8E] space-y-1.5">
                <Info className="w-7 h-7 mx-auto text-[#858A8E]" />
                <h4 className="text-sm font-bold text-[#F1F1F1]">No Visual Results Detected</h4>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">
                  Call <code className="text-[#1FA7DA]">result.get_counts()</code> or <code className="text-[#1FA7DA]">qc.draw('mpl')</code> to view histograms and diagrams.
                </p>
              </div>
            ) : hasCounts ? (
              <div className="space-y-3">
                {/* Shots & Summary Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#44474A]">
                  <div>
                    <h4 className="text-xs font-bold text-[#F1F1F1]">
                      {currentResultSet ? currentResultSet.label : 'Measurement Distribution'}
                    </h4>
                    <p className="text-[11px] text-[#858A8E] mt-0.5 font-mono">
                      Shots: <strong className="text-[#F1F1F1]">{activeTotalShots}</strong>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    AerSimulator
                  </span>
                </div>

                {/* Histogram Bars */}
                <div className="space-y-2 font-mono">
                  {Object.entries(activeCounts).map(([bitstring, count]) => {
                    const pct = activeTotalShots > 0 ? (count / activeTotalShots) * 100 : 0;
                    return (
                      <div key={bitstring} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1FA7DA]">|{bitstring}⟩</span>
                          <span className="text-[#858A8E]">
                            <strong className="text-[#F1F1F1]">{count}</strong> ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#202122] rounded-full overflow-hidden border border-[#44474A]">
                          <div 
                            className="h-full bg-[#1FA7DA] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RAW COUNTS JSON */}
                <div className="pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#858A8E] mb-1 font-mono">
                    Counts:
                  </div>
                  <pre className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg font-mono text-xs text-[#F1F1F1] overflow-x-auto">
                    {JSON.stringify(activeCounts, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 4: HELP & CHEATSHEET */}
        {!isRunning && activeTab === 'help' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1FA7DA]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Qiskit Quick Reference</span>
              </div>
              <a
                href="https://docs.quantum.ibm.com/api/qiskit"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#1FA7DA] hover:underline flex items-center gap-1 font-mono"
              >
                <span>IBM Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg space-y-1">
                <div className="font-bold text-[#F1F1F1]">1. Circuit Allocation</div>
                <code className="text-[#1FA7DA] font-mono text-[11px] block">
                  qc = QuantumCircuit(qubits, clbits)
                </code>
              </div>

              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg space-y-1">
                <div className="font-bold text-[#F1F1F1]">2. Gates & Operations</div>
                <div className="font-mono text-[11px] text-[#1FA7DA] space-y-0.5">
                  <div>qc.h(0)           # Hadamard</div>
                  <div>qc.x(0)           # Pauli-X</div>
                  <div>qc.z(0)           # Pauli-Z</div>
                  <div>qc.cx(0, 1)       # CNOT</div>
                  <div>qc.ry(math.pi/4, 0)# RY rotation</div>
                  <div>qc.draw('mpl')    # Plot circuit</div>
                </div>
              </div>

              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg space-y-1">
                <div className="font-bold text-[#F1F1F1]">3. Simulation</div>
                <div className="font-mono text-[11px] text-[#1FA7DA] space-y-0.5">
                  <div>from qiskit_aer import AerSimulator</div>
                  <div>sim = AerSimulator()</div>
                  <div>counts = sim.run(qc, shots=1000).result().get_counts()</div>
                </div>
              </div>
            </div>

            {onAskAI && (
              <div className="pt-1">
                <button
                  onClick={() => onAskAI('Explain how to construct a quantum circuit, simulate it with AerSimulator, and transpile it for physical basis gates in Qiskit.')}
                  className="w-full py-1.5 bg-[#1E3545] hover:bg-[#254257] border border-[#1FA7DA]/30 text-[#1FA7DA] font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Qubify AI</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Full-size Image Modal for Matplotlib Figure */}
      {selectedFigureModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedFigureModal(null)}
        >
          <div 
            className="max-w-4xl max-h-[90vh] bg-[#28292A] border border-[#44474A] rounded-xl p-4 overflow-auto flex flex-col space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#44474A]">
              <span className="text-xs font-bold text-[#F1F1F1]">Circuit Diagram</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadFigure(selectedFigureModal, 0)}
                  className="text-xs text-[#1FA7DA] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button 
                  onClick={() => setSelectedFigureModal(null)}
                  className="text-xs text-[#858A8E] hover:text-[#F1F1F1] px-2 py-0.5 rounded bg-[#202122] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            <img 
              src={selectedFigureModal} 
              alt="Full Resolution Circuit" 
              className="rounded object-contain max-h-[75vh] mx-auto bg-white/5 p-2"
            />
          </div>
        </div>
      )}

    </div>
  );
};
