import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  BookOpen, 
  Plus, 
  X, 
  FileCode, 
  AlertCircle,
  History,
  LayoutDashboard,
  Compass,
  Trophy,
  TrendingUp,
  User,
  AlertTriangle,
  Menu
} from 'lucide-react';
import { MonacoQuantumEditor } from '../components/lab/MonacoQuantumEditor';
import { OutputHelpPanel } from '../components/lab/OutputHelpPanel';
import { ExamplesModal } from '../components/lab/ExamplesModal';
import { DocumentationModal } from '../components/lab/DocumentationModal';
import { RunHistoryDrawer } from '../components/lab/RunHistoryDrawer';
import { RuntimeCapabilityModal } from '../components/lab/RuntimeCapabilityModal';
import { QubifyLogo } from '../components/brand/QubifyLogo';
import { STARTER_CODE } from '../data/codeExamples';
import { executeQuantumCode, fetchRuntimeInfo } from '../services/quantumExecutor';
import { 
  QuantumExecutionResult, 
  RuntimeEnvironmentInfo, 
  CodeFileTab, 
  QuantumCodeExample, 
  RunHistoryItem 
} from '../types/codeLab';
import { analyzeQuantumCodeHeuristics } from '../utils/errorDiagnostics';

interface QuantumLabViewProps {
  onNavigate?: (view: 'dashboard' | 'path' | 'lab' | 'challenges' | 'progress') => void;
  onOpenProfile?: () => void;
}

export const QuantumLabView: React.FC<QuantumLabViewProps> = ({
  onNavigate,
  onOpenProfile,
}) => {
  // Tabs for multiple code files
  const [tabs, setTabs] = useState<CodeFileTab[]>([
    { id: 'tab-1', filename: 'main.py', code: STARTER_CODE },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Cursor tracking
  const [cursorPos, setCursorPos] = useState<{ line: number; column: number }>({ line: 1, column: 1 });

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<QuantumExecutionResult | null>(null);
  const [panelTab, setPanelTab] = useState<'output' | 'errors' | 'results' | 'help'>('output');
  
  // Modals and Drawers
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isCapabilityModalOpen, setIsCapabilityModalOpen] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  
  // Compact Unified Header Menu State & Accessibility Refs
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Close menu on click outside or Escape key
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Execution Run History
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('qubify_lab_run_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save run history
  useEffect(() => {
    try {
      localStorage.setItem('qubify_lab_run_history', JSON.stringify(runHistory.slice(0, 30)));
    } catch {
      // ignore storage quota errors
    }
  }, [runHistory]);

  // Runtime environment detection
  const [runtimeInfo, setRuntimeInfo] =
  useState<RuntimeEnvironmentInfo>({
    status: 'offline',
    pythonVersion: 'Checking...',
    qiskitVersion: 'Checking...',
    aerVersion: 'Checking...',
    backend: 'Checking runtime...',
    provider: 'Checking...',
    capabilities: [],
    simulationMethods: [],
  });

  // Abort controller to allow stopping execution
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active file
  const activeFile = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Fetch real runtime info on load
  useEffect(() => {
    fetchRuntimeInfo().then((info) => {
      setRuntimeInfo(info);
    });
  }, []);

  // Update current file code
  const handleCodeChange = (newCode: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, code: newCode, isModified: true } : t))
    );
  };

  // Run Code
  const handleRunCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    abortControllerRef.current = new AbortController();

    // Prepare multi-file workspace payload: include other tabs
    const workspaceFiles = tabs
      .filter((t) => t.id !== activeTabId)
      .map((t) => ({ filename: t.filename, code: t.code }));

    try {
      const result = await executeQuantumCode(
        activeFile.code, 
        abortControllerRef.current.signal, 
        workspaceFiles
      );
      setExecutionResult(result);

      // Record to run history
      const historyItem: RunHistoryItem = {
        id: `run-${Date.now()}`,
        runId: result.runId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        filename: activeFile.filename,
        success: result.success,
        executionTimeMs: result.executionTimeMs,
        statusLabel: result.success ? 'Success' : 'Failed',
        codeSnapshot: activeFile.code,
        stdout: result.stdout,
        stderr: result.stderr,
        counts: result.counts,
        resultSets: result.resultSets,
        figures: result.figures,
        circuitAnalysis: result.circuitAnalysis,
        error: result.error,
      };
      setRunHistory((prev) => [historyItem, ...prev.slice(0, 29)]);

      // Automatically switch to Errors tab if run failed, or Results if visual counts/figures exist
      if (!result.success || result.error || result.stderr) {
        setPanelTab('errors');
      } else if (
        (result.counts && Object.keys(result.counts).length > 0) || 
        (result.figures && result.figures.length > 0) ||
        (result.resultSets && result.resultSets.length > 0)
      ) {
        setPanelTab('results');
      } else {
        setPanelTab('output');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setExecutionResult({
          success: false,
          executionTimeMs: 0,
          stdout: '',
          stderr: 'Execution stopped by user.',
          error: {
            type: 'Aborted',
            rawMessage: 'Execution stopped by user.',
            qubifyExplanation: 'Execution was stopped by user action.',
          },
        });
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Execution
  const handleStopExecution = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Reset current code to starter
  const handleConfirmReset = () => {
    handleCodeChange(STARTER_CODE);
    setExecutionResult(null);
    setPanelTab('output');
    setShowResetConfirm(false);
  };

  // Load an example from library
  const handleSelectExample = (example: QuantumCodeExample, mode: 'replace' | 'newTab') => {
    if (mode === 'newTab') {
      const newId = `tab-${Date.now()}`;
      setTabs((prev) => [
        ...prev,
        { id: newId, filename: example.filename, code: example.code }
      ]);
      setActiveTabId(newId);
    } else {
      handleCodeChange(example.code);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, filename: example.filename, code: example.code } : t))
      );
    }
    setExecutionResult(null);
    setPanelTab('output');
    setIsExamplesOpen(false);
  };

  // Restore snapshot from history
  const handleLoadSnapshot = (snapshotCode: string, filename: string) => {
    handleCodeChange(snapshotCode);
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, filename, code: snapshotCode } : t))
    );
    setExecutionResult(null);
    setPanelTab('output');
  };

  // Clear history
  const handleClearHistory = () => {
    setRunHistory([]);
    try {
      localStorage.removeItem('qubify_lab_run_history');
    } catch {}
  };

  // Apply suggested fix from error diagnostics
  const handleApplySuggestion = (fix: { targetLine: number; replacement: string }) => {
    const lines = activeFile.code.split('\n');
    if (fix.targetLine <= lines.length) {
      lines[fix.targetLine - 1] = fix.replacement;
      const updated = lines.join('\n');
      handleCodeChange(updated);
      setExecutionResult((prev) => (prev ? { ...prev, error: undefined } : null));
      setPanelTab('output');
    }
  };

  // Insert snippet from documentation modal
  const handleInsertDocSnippet = (snippet: string) => {
    const currentCode = activeFile.code;
    const updated = currentCode.endsWith('\n') 
      ? currentCode + '\n' + snippet + '\n'
      : currentCode + '\n\n' + snippet + '\n';
    handleCodeChange(updated);
  };

  // File tab management
  const handleNewFile = () => {
    if (tabs.length >= 8) {
      alert('Maximum 8 tabs reached.');
      return;
    }
    const newId = `tab-${Date.now()}`;
    const filename = `experiment_${tabs.length + 1}.py`;
    setTabs((prev) => [...prev, { id: newId, filename, code: STARTER_CODE }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0].id);
    }
  };

  // Non-blocking heuristics check
  const heuristics = analyzeQuantumCodeHeuristics(activeFile.code);

  return (
    <div className="w-full h-screen flex flex-col bg-[#232425] text-left select-none overflow-hidden">
      
      {/* =========================================================================
          1. CLEAN TOP BAR: Qubify | Quantum Code Lab | Qiskit Ready  ...  [☰] [Profile]
         ========================================================================= */}
      <header className="h-12 px-4 bg-[#202122] border-b border-[#44474A] flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Qubify Logo | Quantum Code Lab | Qiskit Ready Status */}
        <div className="flex items-center gap-3">
          {/* Logo with click to navigate to dashboard */}
          <div 
            onClick={() => onNavigate && onNavigate('dashboard')} 
            className="cursor-pointer flex items-center hover:opacity-90 transition-opacity"
            title="Qubify Home"
          >
            <QubifyLogo size="sm" showText={true} />
          </div>

          <div className="h-4 w-px bg-[#44474A]" />

          {/* Title */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#F1F1F1] leading-tight tracking-tight">
              Quantum Code Lab
            </span>
            <span className="hidden md:inline text-[10px] text-[#858A8E] font-medium">
              Powered by Qiskit
            </span>
          </div>

          <div className="h-4 w-px bg-[#44474A] hidden sm:block" />

          {/* Runtime Status Indicator */}
          <button
            onClick={() => setIsCapabilityModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#28292A] hover:bg-[#303234] border border-[#44474A] rounded-md text-xs font-mono text-[#F1F1F1] transition-colors cursor-pointer"
            title="Click to view runtime environment and Qiskit versions"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              isRunning
                ? 'bg-amber-400 animate-pulse'
                : runtimeInfo.status === 'ready'
                ? 'bg-emerald-400'
                : 'bg-rose-400'
            }`} />
            <span className="text-[11px] font-semibold">
              {isRunning ? 'Runtime Executing...' : runtimeInfo.status === 'ready' ? 'Qiskit Ready' : 'Runtime Offline'}
            </span>
          </button>
        </div>

        {/* Right: Single Expandable Menu Button [☰] and Profile */}
        <div className="flex items-center gap-2">
          
          {/* Compact Expandable Menu Control */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              id="lab-menu-btn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              className={`p-2 rounded-md border transition-colors cursor-pointer flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-[#1E3545] border-[#1FA7DA] text-[#1FA7DA]'
                  : 'bg-[#28292A] hover:bg-[#303234] hover:text-[#F1F1F1] border-[#44474A] text-[#858A8E]'
              }`}
              title="Open Navigation Menu (☰)"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Expandable Navigation Dropdown */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-58 bg-[#202122] border border-[#44474A] rounded-lg shadow-2xl py-1.5 z-50 text-left animate-in fade-in duration-100"
                role="menu"
              >
                {/* Section 1: Platform Navigation */}
                <div className="px-3 pt-1 pb-1 text-[10px] uppercase font-bold text-[#858A8E] tracking-wider">
                  Platform
                </div>

                {/* Current Active Section Indicator: Quantum Code Lab */}
                <div className="mx-1.5 mb-1 px-2.5 py-1.5 text-xs font-semibold text-[#1FA7DA] bg-[#1FA7DA]/10 border border-[#1FA7DA]/30 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-[#1FA7DA]" />
                    <span>Quantum Code Lab</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1FA7DA]/20 text-[#1FA7DA] font-bold">
                    ACTIVE
                  </span>
                </div>

                {onNavigate && (
                  <>
                    <button
                      onClick={() => { setIsMenuOpen(false); onNavigate('dashboard'); }}
                      className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded flex items-center gap-2 cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#858A8E]" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => { setIsMenuOpen(false); onNavigate('path'); }}
                      className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded flex items-center gap-2 cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#858A8E]" />
                      <span>Learning Path</span>
                    </button>

                    <button
                      onClick={() => { setIsMenuOpen(false); onNavigate('challenges'); }}
                      className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded flex items-center gap-2 cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#858A8E]" />
                      <span>Challenges</span>
                    </button>

                    <button
                      onClick={() => { setIsMenuOpen(false); onNavigate('progress'); }}
                      className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded flex items-center gap-2 cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#858A8E]" />
                      <span>Progress</span>
                    </button>
                  </>
                )}

                {/* Divider */}
                <div className="h-px bg-[#44474A] my-1.5 mx-2" />

                {/* Section 2: Code Lab Tools */}
                <div className="px-3 pt-0.5 pb-1 text-[10px] uppercase font-bold text-[#858A8E] tracking-wider">
                  Lab Tools
                </div>

                <button
                  id="menu-docs-btn"
                  onClick={() => { setIsMenuOpen(false); setIsDocsOpen(true); }}
                  className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded flex items-center justify-between cursor-pointer transition-colors"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#1FA7DA]" />
                    <span>Documentation</span>
                  </div>
                  <span className="text-[10px] text-[#858A8E] font-mono">Qiskit API</span>
                </button>

                <button
                  id="menu-examples-btn"
                  onClick={() => { setIsMenuOpen(false); setIsExamplesOpen(true); }}
                  className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded flex items-center justify-between cursor-pointer transition-colors"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-[#1FA7DA]" />
                    <span>Examples</span>
                  </div>
                  <span className="text-[10px] text-[#858A8E] font-mono">Circuits</span>
                </button>

                <button
                  id="menu-history-btn"
                  onClick={() => { setIsMenuOpen(false); setIsHistoryOpen(true); }}
                  className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded flex items-center justify-between cursor-pointer transition-colors"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-[#1FA7DA]" />
                    <span>History</span>
                  </div>
                  {runHistory.length > 0 ? (
                    <span className="px-1.5 py-0.2 bg-[#1FA7DA] text-white rounded text-[10px] font-bold">
                      {runHistory.length}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#858A8E] font-mono">0</span>
                  )}
                </button>

                {/* Divider */}
                <div className="h-px bg-[#44474A] my-1.5 mx-2" />

                {/* Section 3: Workspace Action */}
                <button
                  id="menu-reset-btn"
                  onClick={() => { setIsMenuOpen(false); setShowResetConfirm(true); }}
                  className="w-[calc(100%-12px)] mx-1.5 text-left px-2.5 py-1.5 text-xs text-[#858A8E] hover:text-amber-400 hover:bg-[#28292A] rounded flex items-center gap-2 cursor-pointer transition-colors"
                  role="menuitem"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Workspace</span>
                </button>

              </div>
            )}
          </div>

          {/* Profile Trigger */}
          {onOpenProfile && (
            <button
              id="lab-profile-btn"
              onClick={onOpenProfile}
              className="p-2 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] border border-[#44474A] rounded-md transition-colors cursor-pointer"
              title="Profile and Achievements"
            >
              <User className="w-4 h-4" />
            </button>
          )}

        </div>

      </header>

      {/* =========================================================================
          2. MAIN WORKSPACE (LEFT/CENTER 68%: EDITOR | RIGHT 32%: OUTPUT/HELP)
         ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT / CENTER (68%): Monaco Python Code Editor */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#1A1B1C] overflow-hidden border-b lg:border-b-0 border-[#44474A]">
          
          {/* File Tab Bar */}
          <div className="h-9 bg-[#202122] border-b border-[#44474A] flex items-center justify-between px-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer rounded-t ${
                    activeTabId === tab.id
                      ? 'bg-[#1A1B1C] text-[#1FA7DA] border-t-2 border-[#1FA7DA] font-semibold'
                      : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{tab.filename}</span>
                  {tab.isModified && <span className="w-1.5 h-1.5 rounded-full bg-[#1FA7DA]" />}
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="text-[#858A8E] hover:text-[#F1F1F1] ml-1 p-0.5 rounded hover:bg-[#28292A]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={handleNewFile}
                className="p-1 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded transition-colors cursor-pointer"
                title="New Python file"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Non-blocking code heuristics notice */}
            {heuristics.warnings.length > 0 && (
              <div 
                className="hidden xl:flex items-center gap-1.5 text-[11px] text-amber-400 font-sans px-2"
                title={heuristics.warnings[0]}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-xs">{heuristics.warnings[0]}</span>
              </div>
            )}
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 relative overflow-hidden bg-[#1A1B1C]">
            <MonacoQuantumEditor
              code={activeFile.code}
              onChange={handleCodeChange}
              onRun={handleRunCode}
              errorLine={executionResult?.error?.line}
              onCursorChange={(pos) => setCursorPos(pos)}
            />
          </div>

          {/* BOTTOM EDITOR BAR: Ln X, Col Y | Python | Qiskit | AerSimulator | RUN CODE ▶ */}
          <div className="h-11 bg-[#202122] border-t border-[#44474A] px-4 flex items-center justify-between shrink-0">
            {/* Left stats: Line/Col and environment badges */}
            <div className="flex items-center gap-3 text-xs text-[#858A8E] font-mono">
              <span className="text-[#F1F1F1] font-semibold">
                Ln {cursorPos.line}, Col {cursorPos.column}
              </span>
              <span className="text-[#44474A]">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1FA7DA]" />
                <span>{runtimeInfo.pythonVersion}</span>
              </span>
              <span className="hidden sm:inline text-[#44474A]">|</span>
              <span className="hidden sm:inline text-[#1FA7DA]">
{runtimeInfo.qiskitVersion}
</span>
              <span className="hidden sm:inline text-[#44474A]">|</span>
              <span className="hidden md:inline text-emerald-400">AerSimulator</span>
              <span className="hidden xl:inline text-[#44474A]">|</span>
              <span className="hidden xl:inline text-[11px] text-[#858A8E]">
                Shortcut: <kbd className="px-1.5 py-0.5 bg-[#28292A] border border-[#44474A] rounded text-[10px] text-[#F1F1F1]">Ctrl+Enter</kbd>
              </span>
            </div>

            {/* Primary Action Button: RUN CODE ▶ / STOP */}
            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  id="stop-quantum-code-btn"
                  onClick={handleStopExecution}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>STOP</span>
                </button>
              ) : (
                <button
                  id="run-quantum-code-btn"
                  onClick={handleRunCode}
                  className="px-5 py-1.5 bg-[#1FA7DA] hover:bg-[#27B4E8] text-white font-bold text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>RUN CODE ▶</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT (32%): OUTPUT / ERRORS / RESULTS / HELP PANEL */}
        <div className="lg:col-span-4 flex flex-col h-full bg-[#28292A] border-l border-[#44474A] overflow-hidden">
          <OutputHelpPanel
            result={executionResult}
            isRunning={isRunning}
            activeTab={panelTab}
            onTabChange={setPanelTab}
            onApplySuggestion={handleApplySuggestion}
            code={activeFile.code}
          />
        </div>

      </div>

      {/* Examples Library Modal */}
      <ExamplesModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelectExample={handleSelectExample}
      />

      {/* Documentation Quick Reference Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onInsertCodeSnippet={handleInsertDocSnippet}
      />

      {/* Execution Run History Drawer */}
      <RunHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={runHistory}
        onLoadSnapshot={handleLoadSnapshot}
        onClearHistory={handleClearHistory}
      />

      {/* Full Runtime Capabilities Modal */}
      <RuntimeCapabilityModal
        isOpen={isCapabilityModalOpen}
        onClose={() => setIsCapabilityModalOpen(false)}
        runtimeInfo={runtimeInfo}
      />

      {/* Reset Workspace Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-[#202122] border border-[#44474A] rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F1F1F1]">Reset Workspace?</h4>
                <p className="text-xs text-[#858A8E] mt-1 leading-relaxed">
                  This will reset the active file (<strong className="text-[#F1F1F1]">{activeFile.filename}</strong>) back to the original Qiskit starter template. Any unsaved edits will be replaced.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#44474A]">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded-md cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET CODE</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
