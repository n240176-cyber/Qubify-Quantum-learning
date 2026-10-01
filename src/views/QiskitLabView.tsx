import React, { useState, useEffect } from 'react';
import { LessonShell } from '../components/fullscreen-lesson/LessonShell';
import { LessonNavControls } from '../components/fullscreen-lesson/LessonNavControls';
import { QiskitSummaryScreen } from '../components/fullscreen-lesson/QiskitSummaryScreen';
import { 
  ArrowRight, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Sparkles, 
  Info, 
  RefreshCw, 
  HelpCircle,
  Terminal,
  Cpu,
  Radio,
  Layers,
  Code2,
  Trash2,
  Undo2,
  AlertCircle,
  Lightbulb,
  Check
} from 'lucide-react';

interface QiskitLabViewProps {
  onExit: () => void;
  onComplete: () => void;
}

type GateType = 'X' | 'H' | 'M';

export const QiskitLabView: React.FC<QiskitLabViewProps> = ({
  onExit,
  onComplete,
}) => {
  // 1 to 10 step sequence
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);

  // Persistent help modal
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // =========================================================================
  // STEP 2: Circuit & Code are the same idea (interactive step-through)
  // =========================================================================
  const [step2Stage, setStep2Stage] = useState<number>(1); // 1: qubit, 2: h gate, 3: measure

  // =========================================================================
  // STEP 4: First Guided Build (Superposition + Measure)
  // =========================================================================
  const [step4Circuit, setStep4Circuit] = useState<GateType[]>([]);
  const [step4Shots, setStep4Shots] = useState<number>(100);

  // =========================================================================
  // STEP 5: Run on Simulator animation
  // =========================================================================
  const [step5IsRunning, setStep5IsRunning] = useState<boolean>(false);
  const [step5HasRun, setStep5HasRun] = useState<boolean>(false);
  const [step5RunProgress, setStep5RunProgress] = useState<number>(0);

  // =========================================================================
  // STEP 6: Results display (from Step 4/5)
  // =========================================================================
  const [step6Counts, setStep6Counts] = useState<{ zero: number; one: number }>({ zero: 48, one: 52 });

  // =========================================================================
  // STEP 7: Predict before running (X -> M)
  // =========================================================================
  const [step7Prediction, setStep7Prediction] = useState<'mostly_0' | 'mostly_1' | 'fifty_fifty' | null>(null);
  const [step7HasRun, setStep7HasRun] = useState<boolean>(false);
  const [step7Counts, setStep7Counts] = useState<{ zero: number; one: number }>({ zero: 0, one: 100 });

  // =========================================================================
  // STEP 8: Free Playground & Missions
  // =========================================================================
  const [playgroundCircuit, setPlaygroundCircuit] = useState<GateType[]>(['H', 'M']);
  const [playgroundShots, setPlaygroundShots] = useState<number>(100);
  const [playgroundExplainCode, setPlaygroundExplainCode] = useState<boolean>(false);
  const [playgroundRunTarget, setPlaygroundRunTarget] = useState<'simulator' | 'hardware'>('simulator');
  const [playgroundIsRunning, setPlaygroundIsRunning] = useState<boolean>(false);
  const [playgroundCounts, setPlaygroundCounts] = useState<{ zero: number; one: number } | null>(null);
  const [playgroundLastRunMeta, setPlaygroundLastRunMeta] = useState<{
    circuitStr: string;
    shots: number;
    hasMeasure: boolean;
  }>({
    circuitStr: '|0⟩ → H → M',
    shots: 100,
    hasMeasure: true,
  });
  const [playgroundWarning, setPlaygroundWarning] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<1 | 2 | null>(null);
  const [mission1Completed, setMission1Completed] = useState<boolean>(false);
  const [mission2Completed, setMission2Completed] = useState<boolean>(false);

  // Contextual gate hint in Playground
  const [selectedGateHint, setSelectedGateHint] = useState<string | null>(null);

  // Auto-scroll on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle step completion
  const handleContinue = () => {
    if (currentStep < 10) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > maxUnlockedStep) {
        setMaxUnlockedStep(next);
      }
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectStep = (step: number) => {
    if (step <= maxUnlockedStep) {
      setCurrentStep(step);
    }
  };

  // Helper: compute code string for any circuit array
  const generateQiskitCode = (circuit: GateType[]): string => {
    const lines = ['from qiskit import QuantumCircuit', '', 'qc = QuantumCircuit(1)'];
    circuit.forEach((g) => {
      if (g === 'X') lines.push('qc.x(0)');
      if (g === 'H') lines.push('qc.h(0)');
    });
    if (circuit.includes('M')) {
      lines.push('qc.measure_all()');
    }
    return lines.join('\n');
  };

  // Helper: simulate quantum measurement on 1-qubit circuit with state calculation
  const simulateCircuit = (circuit: GateType[], shots: number): { zero: number; one: number; hasMeasure: boolean } => {
    const hasMeasure = circuit.includes('M');
    if (!hasMeasure) {
      return { zero: 0, one: 0, hasMeasure: false };
    }

    // Single qubit state vector [alpha, beta] starting at |0> = [1, 0]
    let a_real = 1.0;
    let a_imag = 0.0;
    let b_real = 0.0;
    let b_imag = 0.0;

    for (const g of circuit) {
      if (g === 'M') break; // measure stops unitaries

      if (g === 'X') {
        // X|0> = |1>, X|1> = |0>
        const tempR = a_real;
        const tempI = a_imag;
        a_real = b_real;
        a_imag = b_imag;
        b_real = tempR;
        b_imag = tempI;
      } else if (g === 'H') {
        // H = 1/sqrt(2) * [[1, 1], [1, -1]]
        const invSqrt2 = 1 / Math.SQRT2;
        const nextA_R = invSqrt2 * (a_real + b_real);
        const nextA_I = invSqrt2 * (a_imag + b_imag);
        const nextB_R = invSqrt2 * (a_real - b_real);
        const nextB_I = invSqrt2 * (a_imag - b_imag);
        a_real = nextA_R;
        a_imag = nextA_I;
        b_real = nextB_R;
        b_imag = nextB_I;
      }
    }

    // Prob(0) = |alpha|^2
    const prob0 = a_real * a_real + a_imag * a_imag;
    let count0 = 0;
    let count1 = 0;

    for (let i = 0; i < shots; i++) {
      if (Math.random() < prob0) {
        count0++;
      } else {
        count1++;
      }
    }

    return { zero: count0, one: count1, hasMeasure: true };
  };

  // Playground actions
  const handleAddGateToPlayground = (g: GateType) => {
    setPlaygroundWarning(null);
    if (g === 'M') {
      if (playgroundCircuit.includes('M')) {
        setPlaygroundWarning('Measurement is already placed at the end of the circuit.');
        return;
      }
      setPlaygroundCircuit([...playgroundCircuit, 'M']);
    } else {
      // If measurement exists, insert gate before measurement
      if (playgroundCircuit.includes('M')) {
        const idx = playgroundCircuit.indexOf('M');
        const nextC = [...playgroundCircuit];
        nextC.splice(idx, 0, g);
        setPlaygroundCircuit(nextC);
      } else {
        if (playgroundCircuit.length >= 6) {
          setPlaygroundWarning('Maximum 6 gates in beginner circuit.');
          return;
        }
        setPlaygroundCircuit([...playgroundCircuit, g]);
      }
    }

    if (g === 'X') setSelectedGateHint('X changes |0⟩ to |1⟩ (bit-flip).');
    if (g === 'H') setSelectedGateHint('H creates an equal superposition from |0⟩.');
    if (g === 'M') setSelectedGateHint('Measurement collapses quantum state to classical 0 or 1.');
  };

  const handleUndoPlayground = () => {
    setPlaygroundWarning(null);
    if (playgroundCircuit.length === 0) return;
    setPlaygroundCircuit(playgroundCircuit.slice(0, -1));
  };

  const handleResetPlayground = () => {
    setPlaygroundWarning(null);
    setPlaygroundCircuit([]);
    setPlaygroundCounts(null);
  };

  const handleRunPlayground = () => {
    setPlaygroundWarning(null);
    if (playgroundCircuit.length === 0) {
      setPlaygroundWarning('Add a gate or measurement to begin.');
      return;
    }
    if (!playgroundCircuit.includes('M')) {
      setPlaygroundWarning('This circuit has no measurement yet. Add Measurement if you want a classical result.');
      return;
    }

    setPlaygroundIsRunning(true);
    setTimeout(() => {
      const res = simulateCircuit(playgroundCircuit, playgroundShots);
      setPlaygroundCounts({ zero: res.zero, one: res.one });
      setPlaygroundLastRunMeta({
        circuitStr: `|0⟩ → ${playgroundCircuit.join(' → ')}`,
        shots: playgroundShots,
        hasMeasure: true,
      });
      setPlaygroundIsRunning(false);

      // Check mini missions
      // Mission 1: Starting from |0⟩, make measured result 1 (e.g. X -> M)
      if (playgroundCircuit.length === 2 && playgroundCircuit[0] === 'X' && playgroundCircuit[1] === 'M' && res.one === playgroundShots) {
        setMission1Completed(true);
      }
      // Mission 2: Create approximately 50% 0 and 50% 1 (e.g. H -> M) with at least 100 shots
      if (playgroundCircuit.length === 2 && playgroundCircuit[0] === 'H' && playgroundCircuit[1] === 'M' && playgroundShots >= 100) {
        const ratio0 = res.zero / playgroundShots;
        if (ratio0 >= 0.35 && ratio0 <= 0.65) {
          setMission2Completed(true);
        }
      }
    }, 450);
  };

  // Step 5 run handler
  const handleRunStep5 = () => {
    if (step5IsRunning) return;
    setStep5IsRunning(true);
    setStep5RunProgress(10);

    const iv = setInterval(() => {
      setStep5RunProgress((p) => {
        if (p >= 90) {
          clearInterval(iv);
          return 90;
        }
        return p + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(iv);
      setStep5RunProgress(100);
      setStep5IsRunning(false);
      setStep5HasRun(true);
      // Run simulation for 100 shots on H -> M
      const res = simulateCircuit(['H', 'M'], 100);
      setStep6Counts({ zero: res.zero, one: res.one });
    }, 1200);
  };

  // Step 7 run handler
  const handleRunStep7 = () => {
    const res = simulateCircuit(['X', 'M'], 100);
    setStep7Counts({ zero: res.zero, one: res.one });
    setStep7HasRun(true);
  };

  // Navigation conditions
  const canContinueCurrent = (() => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return step2Stage === 3;
      case 3:
        return true;
      case 4:
        return step4Circuit.includes('H') && step4Circuit.includes('M');
      case 5:
        return step5HasRun;
      case 6:
        return true;
      case 7:
        return step7HasRun;
      case 8:
        return playgroundCounts !== null;
      case 9:
        return true;
      case 10:
        return true;
      default:
        return true;
    }
  })();

  return (
    <LessonShell
      currentStep={currentStep}
      totalSteps={10}
      maxUnlockedStep={maxUnlockedStep}
      onSelectStep={handleSelectStep}
      onExit={onExit}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 py-3 sm:py-5 px-3 sm:px-6">

        {/* Global Mini Flow Breadcrumb Bar (Steps 3-9) */}
        {currentStep >= 3 && currentStep <= 9 && (
          <div className="w-full mb-4 px-3 py-2 rounded-xl bg-[#0D1B2A]/90 border border-[#243B55] flex items-center justify-between overflow-x-auto text-[11px] font-mono text-[#94A3B8] select-none">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded ${currentStep === 4 || currentStep === 8 ? 'bg-[#22D3EE]/20 text-[#22D3EE] font-bold' : ''}`}>
                1. BUILD
              </span>
              <ArrowRight className="w-3 h-3 text-[#4F7CFF]" />
              <span className={`px-2 py-0.5 rounded ${currentStep === 4 || currentStep === 8 ? 'bg-[#4F7CFF]/20 text-[#4F7CFF] font-bold' : ''}`}>
                2. CODE
              </span>
              <ArrowRight className="w-3 h-3 text-[#4F7CFF]" />
              <span className={`px-2 py-0.5 rounded ${currentStep === 4 || currentStep === 8 ? 'bg-purple-400/20 text-purple-300 font-bold' : ''}`}>
                3. SHOTS
              </span>
              <ArrowRight className="w-3 h-3 text-[#4F7CFF]" />
              <span className={`px-2 py-0.5 rounded ${currentStep === 5 || currentStep === 7 ? 'bg-amber-400/20 text-amber-300 font-bold' : ''}`}>
                4. RUN
              </span>
              <ArrowRight className="w-3 h-3 text-[#4F7CFF]" />
              <span className={`px-2 py-0.5 rounded ${currentStep === 6 || currentStep === 8 ? 'bg-emerald-400/20 text-emerald-300 font-bold' : ''}`}>
                5. RESULTS
              </span>
            </div>

            {/* Persistent Help Button */}
            <button
              id="qiskit-help-toggle-btn"
              type="button"
              onClick={() => setShowHelpModal(!showHelpModal)}
              className="ml-3 shrink-0 flex items-center gap-1 text-[#CBD5E1] hover:text-white bg-[#132238] px-2.5 py-1 rounded-lg border border-[#243B55] text-[11px] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="hidden sm:inline">How to use this lab</span>
              <span className="sm:hidden">Help</span>
            </button>
          </div>
        )}

        {/* Modal: How to use this lab */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#0D1B2A] border border-[#4F7CFF]/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#243B55] pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#22D3EE]" />
                  <h3 className="font-bold text-white text-base">How to Use the Qiskit Lab</h3>
                </div>
                <button
                  id="qiskit-help-close-btn"
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="text-[#94A3B8] hover:text-white font-bold text-sm px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <p><strong className="text-white">Add gates:</strong> Click <code className="text-[#22D3EE]">X</code> or <code className="text-purple-300">H</code> to prepare your quantum state.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#4F7CFF]/20 text-[#4F7CFF] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <p><strong className="text-white">Add measurement:</strong> Always add <code className="text-white">MEASURE</code> at the end to get classical output bits.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-400/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <p><strong className="text-white">Choose shots:</strong> Select 10, 100, or 1000 to repeat the experiment.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                  <p><strong className="text-white">Press RUN:</strong> Sends the circuit to the classical simulator.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">5</span>
                  <p><strong className="text-white">Read results:</strong> Counts tell you how many runs yielded 0 or 1, and the histogram shows the probability distribution.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="qiskit-help-gotit-btn"
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#3d6bf0] text-white font-bold text-xs cursor-pointer transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 1: WHAT IS QISKIT?
            ===================================================================== */}
        {currentStep === 1 && (
          <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-auto py-4">
            
            {/* LEFT (~50%): The familiar visual circuit */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
              <div className="w-full max-w-md bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    FAMILIAR CIRCUIT
                  </span>
                  <span className="text-[11px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/20">
                    Visual Blueprint
                  </span>
                </div>

                {/* Circuit wire diagram */}
                <div className="py-6 px-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center">
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-[#94A3B8]">q0:</span>
                    <span className="text-[#22D3EE] font-bold">|0⟩</span>
                    <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/40 text-purple-300 font-bold">
                      H
                    </span>
                    <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-[#22D3EE]" /> M
                    </span>
                    <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D1B2A]/80 border border-[#243B55] text-xs text-[#CBD5E1]">
                  You already know how to build a quantum circuit using wires and gates.
                </div>
              </div>
            </div>

            {/* RIGHT (~50%): Reveal Qiskit & Workflow */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                  Step 1 • The Bridge to Software
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  How do we create and run this circuit using software?
                </h2>
              </div>

              {/* Qiskit definition callout */}
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#4F7CFF]/40 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Terminal className="w-5 h-5 text-[#22D3EE]" />
                  <span>Meet Qiskit</span>
                </div>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  <strong className="text-white">Qiskit</strong> is an open-source Python toolkit used to create and run quantum circuits.
                </p>
                <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-xs text-amber-300 font-medium">
                  “Qiskit is software — it is not the quantum computer itself.”
                </div>
              </div>

              {/* Visual Workflow Flow */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2 font-mono text-xs">
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">The Complete Pipeline</span>
                <div className="flex flex-wrap items-center gap-2 text-[#CBD5E1]">
                  <span className="text-white font-bold">YOU</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span className="text-[#22D3EE] font-bold">QISKIT</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span className="text-purple-300 font-bold">CIRCUIT</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span className="text-[#4F7CFF] font-bold">SIMULATOR / HARDWARE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span className="text-emerald-300 font-bold">RESULTS</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  id="qiskit-step1-show-me-btn"
                  type="button"
                  onClick={handleContinue}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all"
                >
                  <span>SHOW ME HOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 2: CIRCUIT AND CODE ARE THE SAME IDEA
            ===================================================================== */}
        {currentStep === 2 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Step 2 • The Visual Connection
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Circuit and code are the same idea.
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Watch the quantum circuit wire and the Python Qiskit code assemble together.
              </p>
            </div>

            {/* Split view: LEFT CIRCUIT, RIGHT CODE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT: Circuit Wire */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    1. VISUAL CIRCUIT
                  </span>
                  <span className="text-xs font-mono text-[#22D3EE]">Qubit Wire</span>
                </div>

                <div className="py-8 px-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center min-h-[140px]">
                  <div className="flex items-center gap-2 sm:gap-3 font-mono text-sm">
                    <span className="text-[#94A3B8]">q0:</span>
                    <span className={`px-2 py-1 rounded border font-bold transition-all ${
                      step2Stage >= 1 ? 'bg-[#22D3EE]/20 border-[#22D3EE]/50 text-[#22D3EE]' : 'text-[#94A3B8] border-transparent'
                    }`}>
                      |0⟩
                    </span>
                    <span className="w-8 h-0.5 bg-[#4F7CFF]"></span>

                    {/* H Gate */}
                    {step2Stage >= 2 ? (
                      <span className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/50 text-purple-300 font-bold animate-in fade-in zoom-in-95 duration-300">
                        H
                      </span>
                    ) : (
                      <span className="w-8 h-0.5 border-t border-dashed border-[#243B55]"></span>
                    )}

                    <span className="w-8 h-0.5 bg-[#4F7CFF]"></span>

                    {/* M Gate */}
                    {step2Stage >= 3 ? (
                      <span className="px-3 py-1.5 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1 animate-in fade-in zoom-in-95 duration-300">
                        <Radio className="w-3.5 h-3.5 text-[#22D3EE]" /> M
                      </span>
                    ) : (
                      <span className="w-8 h-0.5 border-t border-dashed border-[#243B55]"></span>
                    )}

                    <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                  </div>
                </div>

                {/* Stage description */}
                <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-xs text-[#CBD5E1]">
                  {step2Stage === 1 && '“Create one qubit, initialized in state |0⟩.”'}
                  {step2Stage === 2 && '“Apply Hadamard gate (H) to qubit 0 to create superposition.”'}
                  {step2Stage === 3 && '“Measure qubit 0 to collapse and extract a classical bit.”'}
                </div>
              </div>

              {/* RIGHT: Qiskit Code */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    2. QISKIT CODE (PYTHON)
                  </span>
                  <span className="text-xs font-mono text-[#94A3B8]">qc</span>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-[#08111F] border border-[#243B55] font-mono text-xs sm:text-sm text-[#CBD5E1] space-y-2 min-h-[140px]">
                  <div className="text-[#94A3B8] text-[11px]">from qiskit import QuantumCircuit</div>
                  <div className="h-2"></div>
                  <div className={`p-1.5 rounded transition-all ${step2Stage === 1 ? 'bg-[#22D3EE]/20 text-white border border-[#22D3EE]/40' : 'text-white'}`}>
                    <span className="text-[#22D3EE]">qc</span> = <span className="text-purple-300">QuantumCircuit</span>(<span className="text-amber-300">1</span>)
                  </div>

                  {step2Stage >= 2 && (
                    <div className={`p-1.5 rounded transition-all animate-in fade-in ${step2Stage === 2 ? 'bg-purple-950/60 text-white border border-purple-400/40' : 'text-white'}`}>
                      qc.<span className="text-[#22D3EE]">h</span>(<span className="text-amber-300">0</span>)
                    </div>
                  )}

                  {step2Stage >= 3 && (
                    <div className={`p-1.5 rounded transition-all animate-in fade-in ${step2Stage === 3 ? 'bg-[#4F7CFF]/20 text-white border border-[#4F7CFF]/40' : 'text-white'}`}>
                      qc.<span className="text-emerald-400">measure_all</span>()
                    </div>
                  )}
                </div>

                {/* Stepper Buttons for this demonstration */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      id="step2-stage1-btn"
                      type="button"
                      onClick={() => setStep2Stage(1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                        step2Stage === 1 ? 'bg-[#22D3EE] text-[#08111F] font-bold' : 'bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55]'
                      }`}
                    >
                      1. Qubit
                    </button>
                    <button
                      id="step2-stage2-btn"
                      type="button"
                      onClick={() => setStep2Stage(2)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                        step2Stage === 2 ? 'bg-purple-400 text-[#08111F] font-bold' : 'bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55]'
                      }`}
                    >
                      2. Add H
                    </button>
                    <button
                      id="step2-stage3-btn"
                      type="button"
                      onClick={() => setStep2Stage(3)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                        step2Stage === 3 ? 'bg-emerald-400 text-[#08111F] font-bold' : 'bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55]'
                      }`}
                    >
                      3. Measure
                    </button>
                  </div>

                  {step2Stage < 3 && (
                    <button
                      id="step2-next-stage-btn"
                      type="button"
                      onClick={() => setStep2Stage(step2Stage + 1)}
                      className="px-4 py-1.5 rounded-lg bg-[#4F7CFF] text-white text-xs font-bold hover:bg-[#3d6bf0] cursor-pointer"
                    >
                      Next Step
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* Prominent Takeaway Banner */}
            <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/40 text-center">
              <p className="text-sm sm:text-base font-bold text-white">
                “The circuit and the code describe the same experiment.”
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                You don’t need to be a Python expert — Qubify bridges visual thinking with real quantum programming.
              </p>
            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 3: HOW TO USE THE LAB (Guided Walkthrough)
            ===================================================================== */}
        {currentStep === 3 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Step 3 • Interface Orientation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How to use the Qiskit Lab
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Understand the 5 steps before building your first circuit.
              </p>
            </div>

            {/* 5 Guided cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="p-5 rounded-2xl bg-[#132238] border border-[#22D3EE]/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#22D3EE] text-[#08111F] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span className="font-bold text-white text-sm">BUILD</span>
                </div>
                <p className="text-xs text-[#CBD5E1]">
                  Choose a gate (<code className="text-[#22D3EE]">X</code> or <code className="text-purple-300">H</code>) and add it to the qubit wire.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#132238] border border-[#4F7CFF]/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span className="font-bold text-white text-sm">WATCH THE CODE</span>
                </div>
                <p className="text-xs text-[#CBD5E1]">
                  Qubify automatically generates standard Qiskit Python code line-by-line as you build.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#132238] border border-purple-400/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-400 text-[#08111F] flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span className="font-bold text-white text-sm">CHOOSE SHOTS</span>
                </div>
                <p className="text-xs text-[#CBD5E1]">
                  Shots tell the simulator how many times to repeat the whole experiment from start to finish.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#132238] border border-amber-400/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-[#08111F] flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span className="font-bold text-white text-sm">RUN</span>
                </div>
                <p className="text-xs text-[#CBD5E1]">
                  Press RUN to execute your circuit on the mathematical quantum simulator.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#132238] border border-emerald-400/40 space-y-2 sm:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-400 text-[#08111F] flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <span className="font-bold text-white text-sm">READ RESULTS</span>
                </div>
                <p className="text-xs text-[#CBD5E1]">
                  See the counts (how often each outcome occurred) and view the histogram representing the probability distribution.
                </p>
              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 4: FIRST GUIDED BUILD (Superposition + Measure)
            ===================================================================== */}
        {currentStep === 4 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Step 4 • First Guided Build
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Mission: Create an equal superposition and measure it
              </h2>
            </div>

            {/* Interactive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT: Builder controls & wire */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                      CIRCUIT BUILDER
                    </span>
                    <span className="text-xs font-mono text-[#22D3EE]">
                      {step4Circuit.length}/2 elements
                    </span>
                  </div>

                  {/* Wire Display */}
                  <div className="py-6 px-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center min-h-[110px]">
                    <div className="flex items-center gap-2 sm:gap-3 font-mono text-sm">
                      <span className="text-[#94A3B8]">q0:</span>
                      <span className="text-[#22D3EE] font-bold">|0⟩</span>
                      <span className="w-8 h-0.5 bg-[#4F7CFF]"></span>

                      {step4Circuit.map((g, idx) => (
                        <React.Fragment key={idx}>
                          {g === 'H' && (
                            <span className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/50 text-purple-300 font-bold animate-in zoom-in-90">
                              H
                            </span>
                          )}
                          {g === 'X' && (
                            <span className="px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-400/50 text-[#22D3EE] font-bold animate-in zoom-in-90">
                              X
                            </span>
                          )}
                          {g === 'M' && (
                            <span className="px-3 py-1.5 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1 animate-in zoom-in-90">
                              <Radio className="w-3.5 h-3.5 text-[#22D3EE]" /> M
                            </span>
                          )}
                          <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>
                        </React.Fragment>
                      ))}

                      {step4Circuit.length === 0 && (
                        <span className="text-xs text-[#94A3B8] italic font-sans">
                          Empty wire. Click H below to begin.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gate buttons */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1]">
                    Available Controls:
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      id="step4-gate-x-btn"
                      type="button"
                      disabled={true}
                      className="px-4 py-2 rounded-xl bg-[#0D1B2A] text-[#94A3B8] border border-[#243B55] opacity-50 cursor-not-allowed text-xs font-bold"
                    >
                      X (Bit Flip)
                    </button>

                    <button
                      id="step4-gate-h-btn"
                      type="button"
                      onClick={() => {
                        if (!step4Circuit.includes('H')) {
                          setStep4Circuit(['H']);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        !step4Circuit.includes('H')
                          ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/40 animate-pulse'
                          : 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      H (Superposition)
                    </button>

                    <button
                      id="step4-gate-m-btn"
                      type="button"
                      disabled={!step4Circuit.includes('H') || step4Circuit.includes('M')}
                      onClick={() => {
                        if (step4Circuit.includes('H') && !step4Circuit.includes('M')) {
                          setStep4Circuit(['H', 'M']);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        step4Circuit.includes('H') && !step4Circuit.includes('M')
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/40 animate-pulse cursor-pointer'
                          : step4Circuit.includes('M')
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-[#0D1B2A] text-[#94A3B8] border-[#243B55] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      MEASURE
                    </button>
                  </div>
                </div>

                {/* Guidance box */}
                <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-xs text-[#CBD5E1]">
                  {!step4Circuit.includes('H') && (
                    <span className="text-purple-300 font-medium">👉 “First, choose H to create an equal superposition.”</span>
                  )}
                  {step4Circuit.includes('H') && !step4Circuit.includes('M') && (
                    <span className="text-emerald-300 font-medium">👉 “Now add Measurement so we can read the outcome.”</span>
                  )}
                  {step4Circuit.includes('H') && step4Circuit.includes('M') && (
                    <span className="text-white font-medium">✨ “Nice. You have built the circuit! Next, choose shots and press RUN.”</span>
                  )}
                </div>

              </div>

              {/* RIGHT: Live Generated Qiskit Code & Shots */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      LIVE QISKIT CODE
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">Python 3</span>
                  </div>

                  {/* Code box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#08111F] border border-[#243B55] font-mono text-xs text-[#CBD5E1] space-y-1.5">
                    <div className="text-[#94A3B8]">from qiskit import QuantumCircuit</div>
                    <div className="h-1"></div>
                    <div className="text-white">qc = QuantumCircuit(1)</div>
                    {step4Circuit.includes('H') && (
                      <div className="text-purple-300 animate-in fade-in">qc.h(0)</div>
                    )}
                    {step4Circuit.includes('M') && (
                      <div className="text-emerald-300 animate-in fade-in">qc.measure_all()</div>
                    )}
                  </div>
                </div>

                {/* Shots selector */}
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#94A3B8]">RUN SETTINGS:</span>
                    <span className="text-white font-bold">Shots: {step4Shots}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 100, 1000].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStep4Shots(s)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                          step4Shots === s ? 'bg-[#4F7CFF] text-white' : 'bg-[#132238] text-[#94A3B8] hover:text-white border border-[#243B55]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1B2A]/60 border border-[#243B55] text-xs text-[#94A3B8]">
                  Default is <strong>100 shots</strong>. When both H and Measure are added, proceed to Step 5 to run on the simulator.
                </div>

              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 5: RUN ON SIMULATOR
            ===================================================================== */}
        {currentStep === 5 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Step 5 • Execution Target
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Run on Simulator
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Before running, let’s see where the quantum circuit actually executes.
              </p>
            </div>

            <div className="max-w-2xl mx-auto w-full bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Target Selector */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  RUN ON:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border-2 border-[#22D3EE] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE]"></span>
                        Simulator (Local/Cloud)
                      </span>
                      <span className="text-[10px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded">Active</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] pt-1">
                      A classical computer mathematically simulates the quantum circuit instantaneously.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0D1B2A]/50 border border-[#243B55] opacity-60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8] font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span>
                        Real Quantum Hardware
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded">Coming Later</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] pt-1">
                      Physical dilution fridges with superconducting chips.
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution Animation Banner */}
              <div className="p-5 rounded-2xl bg-[#08111F] border border-[#243B55] space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">CIRCUIT: |0⟩ → H → M</span>
                  <span className="text-purple-300">100 SHOTS</span>
                </div>

                {/* Progress Pipeline */}
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                  <div className={`p-2 rounded-xl border ${step5RunProgress >= 25 ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-white' : 'bg-[#0D1B2A] border-[#243B55] text-[#94A3B8]'}`}>
                    1. Circuit
                  </div>
                  <div className={`p-2 rounded-xl border ${step5RunProgress >= 50 ? 'bg-[#4F7CFF]/20 border-[#4F7CFF] text-white' : 'bg-[#0D1B2A] border-[#243B55] text-[#94A3B8]'}`}>
                    2. Simulator
                  </div>
                  <div className={`p-2 rounded-xl border ${step5RunProgress >= 75 ? 'bg-purple-950/50 border-purple-400 text-white' : 'bg-[#0D1B2A] border-[#243B55] text-[#94A3B8]'}`}>
                    3. 100 Shots
                  </div>
                  <div className={`p-2 rounded-xl border ${step5RunProgress >= 100 ? 'bg-emerald-950/50 border-emerald-400 text-white' : 'bg-[#0D1B2A] border-[#243B55] text-[#94A3B8]'}`}>
                    4. Results
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#0D1B2A] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#22D3EE] via-[#4F7CFF] to-emerald-400 transition-all duration-300"
                    style={{ width: `${step5RunProgress}%` }}
                  />
                </div>
              </div>

              {/* RUN Action Button */}
              <div className="text-center pt-2">
                <button
                  id="step5-run-simulator-btn"
                  type="button"
                  disabled={step5IsRunning}
                  onClick={handleRunStep5}
                  className={`py-3.5 px-8 rounded-full font-bold text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all shadow-lg ${
                    step5HasRun
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      : 'bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white shadow-[#4F7CFF]/20 active:scale-[0.99]'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{step5IsRunning ? 'Simulating 100 shots...' : step5HasRun ? 'Re-Run Simulator' : 'RUN ON SIMULATOR'}</span>
                </button>
              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 6: RESULTS (Counts + Histogram)
            ===================================================================== */}
        {currentStep === 6 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                Step 6 • Empirical Results
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Reading Counts and Histogram
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Here is what the simulator produced after running your circuit 100 times.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT: Raw Counts & Histogram */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    SIMULATOR OUTPUT (100 SHOTS)
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    Finished
                  </span>
                </div>

                {/* Counts breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center space-y-1">
                    <span className="text-xs font-mono text-[#94A3B8]">Outcome 0</span>
                    <div className="text-3xl font-extrabold text-[#22D3EE] font-mono">{step6Counts.zero}</div>
                    <span className="text-[11px] text-[#94A3B8]">{step6Counts.zero}% of runs</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] text-center space-y-1">
                    <span className="text-xs font-mono text-[#94A3B8]">Outcome 1</span>
                    <div className="text-3xl font-extrabold text-purple-400 font-mono">{step6Counts.one}</div>
                    <span className="text-[11px] text-[#94A3B8]">{step6Counts.one}% of runs</span>
                  </div>
                </div>

                {/* Visual Histogram */}
                <div className="p-5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                    <span>HISTOGRAM</span>
                    <span>Counts / 100</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {/* Bar for 0 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[#CBD5E1]">
                        <span>State |0⟩</span>
                        <span className="text-[#22D3EE] font-bold">{step6Counts.zero}</span>
                      </div>
                      <div className="w-full h-5 rounded-md bg-[#132238] overflow-hidden flex">
                        <div 
                          className="h-full bg-[#22D3EE] transition-all duration-500"
                          style={{ width: `${step6Counts.zero}%` }}
                        />
                      </div>
                    </div>

                    {/* Bar for 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[#CBD5E1]">
                        <span>State |1⟩</span>
                        <span className="text-purple-300 font-bold">{step6Counts.one}</span>
                      </div>
                      <div className="w-full h-5 rounded-md bg-[#132238] overflow-hidden flex">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${step6Counts.one}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT: Understand what this means */}
              <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded">
                      What does this mean?
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                    <p>
                      • Qiskit ran the same circuit <strong>100 times</strong> from starting preparation.
                    </p>
                    <p>
                      • <strong>{step6Counts.zero} runs</strong> gave 0.
                    </p>
                    <p>
                      • <strong>{step6Counts.one} runs</strong> gave 1.
                    </p>
                    <p>
                      • These raw totals are called <strong className="text-white">counts</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30 space-y-2">
                    <span className="text-xs font-bold text-white block">Connection to what you learned:</span>
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-[#CBD5E1]">
                      <span>Shots</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      <span>Results</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      <span className="text-[#22D3EE] font-bold">Counts</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      <span className="text-emerald-300 font-bold">Histogram</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] pt-1">
                      The histogram helps us see that the H gate produced approximately an equal 50/50 probability distribution.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                  “Oh, this is exactly what I learned in the Shots lesson!”
                </div>

              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 7: PREDICT BEFORE RUNNING (|0⟩ → X → M)
            ===================================================================== */}
        {currentStep === 7 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Step 7 • Scientific Thinking
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Predict Before Running
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Let’s change the circuit to <code className="text-[#22D3EE]">|0⟩ → X → M</code>.
              </p>
            </div>

            <div className="max-w-3xl mx-auto w-full bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Circuit + Code preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex flex-col justify-center items-center">
                  <span className="text-[10px] font-mono text-[#94A3B8] mb-2 uppercase">Circuit Under Test</span>
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-[#94A3B8]">q0:</span>
                    <span className="text-[#22D3EE] font-bold">|0⟩</span>
                    <span className="w-4 h-0.5 bg-[#4F7CFF]"></span>
                    <span className="px-2.5 py-1 rounded bg-blue-600/30 border border-blue-400/50 text-[#22D3EE] font-bold">
                      X
                    </span>
                    <span className="w-4 h-0.5 bg-[#4F7CFF]"></span>
                    <span className="px-2.5 py-1 rounded bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1">
                      <Radio className="w-3 h-3 text-[#22D3EE]" /> M
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#08111F] border border-[#243B55] font-mono text-xs text-[#CBD5E1] space-y-1">
                  <span className="text-[10px] text-[#94A3B8] block">Equivalent Qiskit:</span>
                  <div className="text-[#22D3EE]">qc = QuantumCircuit(1)</div>
                  <div className="text-[#22D3EE]">qc.x(0)</div>
                  <div className="text-emerald-300">qc.measure_all()</div>
                </div>
              </div>

              {/* The Question */}
              <div className="space-y-3">
                <span className="text-sm font-bold text-white block text-center">
                  “What do you expect when we run this circuit for 100 shots?”
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    id="step7-predict-mostly-0-btn"
                    type="button"
                    onClick={() => setStep7Prediction('mostly_0')}
                    className={`p-3.5 rounded-2xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      step7Prediction === 'mostly_0'
                        ? 'bg-[#4F7CFF] text-white border-white shadow-lg'
                        : 'bg-[#0D1B2A] text-[#CBD5E1] border-[#243B55] hover:border-[#4F7CFF]'
                    }`}
                  >
                    Mostly 0
                  </button>

                  <button
                    id="step7-predict-mostly-1-btn"
                    type="button"
                    onClick={() => setStep7Prediction('mostly_1')}
                    className={`p-3.5 rounded-2xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      step7Prediction === 'mostly_1'
                        ? 'bg-emerald-600 text-white border-white shadow-lg'
                        : 'bg-[#0D1B2A] text-[#CBD5E1] border-[#243B55] hover:border-emerald-400'
                    }`}
                  >
                    Mostly 1
                  </button>

                  <button
                    id="step7-predict-fifty-fifty-btn"
                    type="button"
                    onClick={() => setStep7Prediction('fifty_fifty')}
                    className={`p-3.5 rounded-2xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      step7Prediction === 'fifty_fifty'
                        ? 'bg-purple-600 text-white border-white shadow-lg'
                        : 'bg-[#0D1B2A] text-[#CBD5E1] border-[#243B55] hover:border-purple-400'
                    }`}
                  >
                    About 50 / 50
                  </button>
                </div>
              </div>

              {/* Prediction feedback & RUN */}
              {step7Prediction && (
                <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#CBD5E1]">
                      {step7Prediction === 'mostly_1' ? (
                        <strong className="text-emerald-300">✓ Good prediction! Now test it on the simulator:</strong>
                      ) : (
                        <strong className="text-amber-300">Interesting hypothesis! Let’s test it to find out:</strong>
                      )}
                    </span>
                    <button
                      id="step7-run-test-btn"
                      type="button"
                      onClick={handleRunStep7}
                      className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#3d6bf0] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>RUN TEST</span>
                    </button>
                  </div>

                  {/* Results after running */}
                  {step7HasRun && (
                    <div className="p-4 rounded-xl bg-[#132238] border border-emerald-500/30 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#94A3B8]">RESULTS:</span>
                        <span className="text-emerald-400 font-bold">1 → 100 shots (100%)</span>
                      </div>

                      <div className="w-full h-4 rounded-md bg-[#0D1B2A] overflow-hidden flex">
                        <div className="h-full bg-emerald-500 w-full" />
                      </div>

                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        <strong className="text-white">Explanation:</strong> The X gate deterministically changed <code className="text-[#22D3EE]">|0⟩</code> into <code className="text-purple-300">|1⟩</code> before measurement. Thus, every single shot produced 1!
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#94A3B8]">
                        <span>PREDICT</span>
                        <ArrowRight className="w-3 h-3 text-[#4F7CFF]" />
                        <span>RUN</span>
                        <ArrowRight className="w-3 h-3 text-[#4F7CFF]" />
                        <span>OBSERVE</span>
                        <ArrowRight className="w-3 h-3 text-[#4F7CFF]" />
                        <span className="text-emerald-300 font-bold">UNDERSTAND</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 8: FREE PLAYGROUND WITH LIVE CODE, EXPLANATIONS & MISSIONS
            ===================================================================== */}
        {currentStep === 8 && (
          <div className="w-full flex-1 flex flex-col space-y-4 py-2">
            
            {/* Header with quick stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#243B55] pb-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded border border-[#22D3EE]/20">
                  Step 8 • Free Playground
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                  Qiskit Quantum Playground
                </h2>
              </div>

              {/* Mini Missions Quick Access */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#94A3B8] hidden md:inline">Missions:</span>
                <button
                  id="mission1-btn"
                  type="button"
                  onClick={() => setActiveMission(1)}
                  className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
                    mission1Completed 
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300' 
                      : activeMission === 1 
                      ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE]' 
                      : 'bg-[#132238] border-[#243B55] text-[#CBD5E1]'
                  }`}
                >
                  {mission1Completed && <Check className="w-3 h-3" />}
                  <span>Mission 1: Output 1</span>
                </button>

                <button
                  id="mission2-btn"
                  type="button"
                  onClick={() => setActiveMission(2)}
                  className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
                    mission2Completed 
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300' 
                      : activeMission === 2 
                      ? 'bg-purple-950/50 border-purple-400 text-purple-300' 
                      : 'bg-[#132238] border-[#243B55] text-[#CBD5E1]'
                  }`}
                >
                  {mission2Completed && <Check className="w-3 h-3" />}
                  <span>Mission 2: 50/50 Superposition</span>
                </button>
              </div>
            </div>

            {/* Mission Prompt Banner if active */}
            {activeMission && (
              <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#4F7CFF]/40 flex items-center justify-between text-xs">
                <div>
                  {activeMission === 1 && (
                    <span className="text-[#CBD5E1]">
                      🎯 <strong className="text-white">Mission 1:</strong> “Starting from |0⟩, make the measured result 1.” (Hint: Build <code className="text-[#22D3EE]">|0⟩ → X → M</code> and Run).
                    </span>
                  )}
                  {activeMission === 2 && (
                    <span className="text-[#CBD5E1]">
                      🎯 <strong className="text-white">Mission 2:</strong> “Create approximately 50% 0 and 50% 1.” (Hint: Build <code className="text-purple-300">|0⟩ → H → M</code> with at least 100 shots).
                    </span>
                  )}
                </div>
                <button
                  id="close-mission-prompt-btn"
                  type="button"
                  onClick={() => setActiveMission(null)}
                  className="text-[#94A3B8] hover:text-white font-mono px-2 py-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Contextual Warning if any */}
            {playgroundWarning && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{playgroundWarning}</span>
                </div>
                <button
                  id="close-warning-btn"
                  type="button"
                  onClick={() => setPlaygroundWarning(null)}
                  className="text-amber-400 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Main Workspace Layout (LEFT: BUILD ~50%, RIGHT: CODE & RESULTS ~50%) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              
              {/* ==================== LEFT COLUMN: BUILD ==================== */}
              <div className="space-y-4">
                
                {/* 1. Circuit Wire */}
                <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                      CIRCUIT WIRE (Q0)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        id="playground-undo-btn"
                        type="button"
                        onClick={handleUndoPlayground}
                        title="Undo last element"
                        disabled={playgroundCircuit.length === 0}
                        className="p-1.5 rounded-lg bg-[#0D1B2A] text-[#94A3B8] hover:text-white border border-[#243B55] disabled:opacity-30 cursor-pointer"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id="playground-reset-btn"
                        type="button"
                        onClick={handleResetPlayground}
                        title="Clear circuit"
                        disabled={playgroundCircuit.length === 0}
                        className="p-1.5 rounded-lg bg-[#0D1B2A] text-red-400 hover:text-red-300 border border-[#243B55] disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Wire Display */}
                  <div className="py-6 px-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-center min-h-[100px] overflow-x-auto">
                    <div className="flex items-center gap-2 sm:gap-2.5 font-mono text-xs sm:text-sm">
                      <span className="text-[#94A3B8]">q0:</span>
                      <span className="text-[#22D3EE] font-bold">|0⟩</span>
                      <span className="w-6 h-0.5 bg-[#4F7CFF]"></span>

                      {playgroundCircuit.map((g, idx) => (
                        <React.Fragment key={idx}>
                          {g === 'X' && (
                            <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 border border-blue-400/50 text-[#22D3EE] font-bold">
                              X
                            </span>
                          )}
                          {g === 'H' && (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-600/30 border border-purple-400/50 text-purple-300 font-bold">
                              H
                            </span>
                          )}
                          {g === 'M' && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#243B55] border border-white/30 text-white font-bold flex items-center gap-1">
                              <Radio className="w-3 h-3 text-[#22D3EE]" /> M
                            </span>
                          )}
                          <span className="w-4 h-0.5 bg-[#4F7CFF]"></span>
                        </React.Fragment>
                      ))}

                      {playgroundCircuit.length === 0 && (
                        <span className="text-xs text-[#94A3B8] italic font-sans">
                          Empty wire. Click a gate below to add.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gate Addition Palette */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                      <span>ADD ELEMENT:</span>
                      <span className="text-[#94A3B8]">Max 6 gates</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        id="pg-add-x-btn"
                        type="button"
                        onClick={() => handleAddGateToPlayground('X')}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-blue-950/50 text-[#22D3EE] border border-blue-400/30 hover:border-blue-400 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer transition-all"
                      >
                        <span>[ X ]</span>
                        <span className="text-[10px] font-normal text-[#94A3B8]">Bit Flip</span>
                      </button>

                      <button
                        id="pg-add-h-btn"
                        type="button"
                        onClick={() => handleAddGateToPlayground('H')}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-purple-950/50 text-purple-300 border border-purple-400/30 hover:border-purple-400 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer transition-all"
                      >
                        <span>[ H ]</span>
                        <span className="text-[10px] font-normal text-[#94A3B8]">Superposition</span>
                      </button>

                      <button
                        id="pg-add-m-btn"
                        type="button"
                        onClick={() => handleAddGateToPlayground('M')}
                        disabled={playgroundCircuit.includes('M')}
                        className="py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-emerald-950/50 text-white border border-white/20 hover:border-emerald-400 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer transition-all disabled:opacity-40"
                      >
                        <span className="flex items-center gap-1">
                          <Radio className="w-3 h-3 text-[#22D3EE]" /> [ MEASURE ]
                        </span>
                        <span className="text-[10px] font-normal text-[#94A3B8]">Read state</span>
                      </button>
                    </div>

                    {selectedGateHint && (
                      <div className="p-2 rounded-lg bg-[#0D1B2A]/60 border border-[#243B55] text-[11px] text-[#22D3EE]">
                        💡 {selectedGateHint}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Run Settings */}
                <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#94A3B8] uppercase font-bold">RUN SETTINGS</span>
                    <span className="text-[#22D3EE] font-bold">Backend: Simulator</span>
                  </div>

                  {/* Shots buttons */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-[#CBD5E1] block">Number of shots:</span>
                    <div className="flex items-center gap-2">
                      {[10, 100, 1000].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPlaygroundShots(s)}
                          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
                            playgroundShots === s
                              ? 'bg-[#4F7CFF] text-white border border-[#4F7CFF] shadow-sm'
                              : 'bg-[#0D1B2A] text-[#94A3B8] hover:text-white border border-[#243B55]'
                          }`}
                        >
                          {s} shots
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary RUN button */}
                  <button
                    id="pg-run-btn"
                    type="button"
                    disabled={playgroundIsRunning}
                    onClick={handleRunPlayground}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{playgroundIsRunning ? 'Simulating...' : 'RUN CIRCUIT'}</span>
                  </button>
                </div>

              </div>

              {/* ==================== RIGHT COLUMN: CODE & RESULTS ==================== */}
              <div className="space-y-4">
                
                {/* 1. Qiskit Code Panel */}
                <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      QISKIT CODE
                    </span>
                    <button
                      id="toggle-explain-code-btn"
                      type="button"
                      onClick={() => setPlaygroundExplainCode(!playgroundExplainCode)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                        playgroundExplainCode
                          ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE] font-bold'
                          : 'bg-[#0D1B2A] border-[#243B55] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {playgroundExplainCode ? 'Hide explanations' : 'Explain this code'}
                    </button>
                  </div>

                  {/* Code box */}
                  <div className="p-4 rounded-2xl bg-[#08111F] border border-[#243B55] font-mono text-xs text-[#CBD5E1] space-y-1 overflow-x-auto">
                    <div className="text-[#94A3B8]">from qiskit import QuantumCircuit</div>
                    <div className="h-1"></div>
                    <div className="text-white">qc = QuantumCircuit(1)</div>
                    {playgroundCircuit.map((g, idx) => {
                      if (g === 'X') return <div key={idx} className="text-[#22D3EE]">qc.x(0)</div>;
                      if (g === 'H') return <div key={idx} className="text-purple-300">qc.h(0)</div>;
                      if (g === 'M') return <div key={idx} className="text-emerald-300">qc.measure_all()</div>;
                      return null;
                    })}
                  </div>

                  {/* Line by line explanations if enabled */}
                  {playgroundExplainCode && (
                    <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30 space-y-2 text-xs animate-in fade-in">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8]">Code Breakdown:</span>
                      <div className="space-y-1.5 text-[#CBD5E1]">
                        <div className="flex items-start gap-2">
                          <code className="text-white font-mono shrink-0">QuantumCircuit(1)</code>
                          <span>→ creates a quantum circuit with 1 qubit (q0).</span>
                        </div>
                        {playgroundCircuit.includes('X') && (
                          <div className="flex items-start gap-2">
                            <code className="text-[#22D3EE] font-mono shrink-0">qc.x(0)</code>
                            <span>→ applies Pauli-X gate to qubit 0 (flips |0⟩ to |1⟩).</span>
                          </div>
                        )}
                        {playgroundCircuit.includes('H') && (
                          <div className="flex items-start gap-2">
                            <code className="text-purple-300 font-mono shrink-0">qc.h(0)</code>
                            <span>→ applies Hadamard gate to qubit 0 (equal superposition).</span>
                          </div>
                        )}
                        {playgroundCircuit.includes('M') && (
                          <div className="flex items-start gap-2">
                            <code className="text-emerald-300 font-mono shrink-0">qc.measure_all()</code>
                            <span>→ measures all qubits into classical bits.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Results & Histogram Panel */}
                <div className="bg-[#132238] border border-[#243B55] rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                      RESULTS & HISTOGRAM
                    </span>
                    {playgroundCounts && (
                      <span className="text-xs font-mono text-emerald-400">
                        {playgroundLastRunMeta.shots} shots
                      </span>
                    )}
                  </div>

                  {playgroundCounts ? (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Meta badge */}
                      <div className="text-xs font-mono text-[#94A3B8]">
                        Circuit: <strong className="text-white font-sans">{playgroundLastRunMeta.circuitStr}</strong>
                      </div>

                      {/* Counts box */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-center">
                          <span className="text-xs font-mono text-[#94A3B8]">Outcome 0</span>
                          <div className="text-2xl font-extrabold text-[#22D3EE] font-mono">{playgroundCounts.zero}</div>
                          <span className="text-[10px] text-[#94A3B8]">
                            {((playgroundCounts.zero / playgroundLastRunMeta.shots) * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] text-center">
                          <span className="text-xs font-mono text-[#94A3B8]">Outcome 1</span>
                          <div className="text-2xl font-extrabold text-purple-400 font-mono">{playgroundCounts.one}</div>
                          <span className="text-[10px] text-[#94A3B8]">
                            {((playgroundCounts.one / playgroundLastRunMeta.shots) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Histogram */}
                      <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#243B55] space-y-3">
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-[#CBD5E1]">
                            <span>State |0⟩</span>
                            <span className="text-[#22D3EE] font-bold">{playgroundCounts.zero}</span>
                          </div>
                          <div className="w-full h-4 rounded-md bg-[#132238] overflow-hidden flex">
                            <div 
                              className="h-full bg-[#22D3EE] transition-all duration-300"
                              style={{ width: `${(playgroundCounts.zero / playgroundLastRunMeta.shots) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-[#CBD5E1]">
                            <span>State |1⟩</span>
                            <span className="text-purple-300 font-bold">{playgroundCounts.one}</span>
                          </div>
                          <div className="w-full h-4 rounded-md bg-[#132238] overflow-hidden flex">
                            <div 
                              className="h-full bg-purple-500 transition-all duration-300"
                              style={{ width: `${(playgroundCounts.one / playgroundLastRunMeta.shots) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Short interpretation */}
                      <div className="p-3 rounded-xl bg-[#08111F] border border-[#243B55] text-xs text-[#CBD5E1]">
                        {playgroundCounts.zero > 0 && playgroundCounts.one > 0 && Math.abs(playgroundCounts.zero - playgroundCounts.one) <= playgroundLastRunMeta.shots * 0.25 ? (
                          <span>⚖️ “This circuit produced approximately equal numbers of 0 and 1.”</span>
                        ) : playgroundCounts.zero === playgroundLastRunMeta.shots ? (
                          <span>🎯 “This circuit deterministically produced 100% state 0.”</span>
                        ) : playgroundCounts.one === playgroundLastRunMeta.shots ? (
                          <span>🎯 “This circuit deterministically produced 100% state 1.”</span>
                        ) : (
                          <span>📊 “Empirical measurement distribution matches quantum probability calculation.”</span>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#0D1B2A] border border-dashed border-[#243B55] text-center text-xs text-[#94A3B8]">
                      Build your circuit and press <strong>RUN CIRCUIT</strong> to view counts and histogram here.
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-3 flex items-center justify-between sm:justify-end gap-3 border-t border-[#243B55]">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 9: SIMULATOR VS REAL QUANTUM COMPUTER
            ===================================================================== */}
        {currentStep === 9 && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-6 my-auto py-4">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Step 9 • Backend Perspectives
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Simulator vs Real Quantum Computer
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Qiskit can target both virtual simulators and physical hardware.
              </p>
            </div>

            <div className="max-w-2xl mx-auto w-full bg-[#132238] border border-[#243B55] rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Architecture Diagram */}
              <div className="p-4 rounded-2xl bg-[#08111F] border border-[#243B55] space-y-4 font-mono text-xs">
                <div className="text-center text-[#22D3EE] font-bold">
                  QISKIT QUANTUM CIRCUIT
                </div>

                <div className="flex justify-center -my-1 text-[#4F7CFF]">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Simulator */}
                  <div className="p-4 rounded-xl bg-[#0D1B2A] border-2 border-[#4F7CFF] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-[#4F7CFF]" />
                        SIMULATOR
                      </span>
                      <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
                        Available Now
                      </span>
                    </div>
                    <p className="text-[11px] text-[#CBD5E1] font-sans">
                      Classical algorithms calculate exact quantum wavefunctions and probabilities mathematically.
                    </p>
                    <ul className="text-[10px] text-[#94A3B8] font-sans space-y-1">
                      <li>• Instantaneous execution</li>
                      <li>• No hardware queue wait times</li>
                      <li>• Ideal for learning & debugging</li>
                    </ul>
                  </div>

                  {/* Real QPU */}
                  <div className="p-4 rounded-xl bg-[#0D1B2A]/60 border border-[#243B55] space-y-2 opacity-75">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#CBD5E1] flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-purple-400" />
                        REAL QPU
                      </span>
                      <span className="text-[10px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded">
                        Coming Later
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] font-sans">
                      Physical superconducting quantum processors cooled down to nearly absolute zero (15 millikelvin).
                    </p>
                    <ul className="text-[10px] text-[#94A3B8] font-sans space-y-1">
                      <li>• Real physical quantum entanglement</li>
                      <li>• Subject to environmental noise & decoherence</li>
                      <li>• Accessed via cloud queues</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Core takeaway */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30 space-y-2 text-xs text-[#CBD5E1]">
                <p className="leading-relaxed">
                  <strong className="text-white">“Qiskit can work with simulators or real quantum hardware.”</strong>
                </p>
                <p className="text-[#94A3B8] leading-relaxed">
                  For now, Qubify uses a simulator so you can experiment instantly with zero friction, no API keys, and no cloud queue delays.
                </p>
              </div>

            </div>

            {/* Nav Footer */}
            <div className="pt-2 flex items-center justify-between sm:justify-end gap-3">
              <LessonNavControls
                currentStep={currentStep}
                totalSteps={10}
                canContinue={canContinueCurrent}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 10: FINAL SUMMARY & MASTERY
            ===================================================================== */}
        {currentStep === 10 && (
          <QiskitSummaryScreen
            onNextLesson={onComplete}
            onBackToPath={onExit}
            onBack={handleBack}
            isAlreadyViewed={maxUnlockedStep >= 10}
          />
        )}

      </div>
    </LessonShell>
  );
};
