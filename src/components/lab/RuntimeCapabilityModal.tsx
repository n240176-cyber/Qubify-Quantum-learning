import React from 'react';
import { 
  X, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  Zap,
  HardDrive,
  Clock,
  Radio
} from 'lucide-react';
import { RuntimeEnvironmentInfo } from '../../types/codeLab';

interface RuntimeCapabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  runtimeInfo: RuntimeEnvironmentInfo;
}

export const RuntimeCapabilityModal: React.FC<RuntimeCapabilityModalProps> = ({
  isOpen,
  onClose,
  runtimeInfo,
}) => {
  if (!isOpen) return null;

  const packages = runtimeInfo.packages ?? {
  python: runtimeInfo.pythonVersion || 'Unknown',
  qiskit: runtimeInfo.qiskitVersion || 'Unknown',
  qiskit_aer: runtimeInfo.aerVersion || 'Unknown',
  numpy: 'Unknown',
};

  const capabilities = runtimeInfo.capabilities ?? [];

 const simMethods = runtimeInfo.simulationMethods ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
   <div className="w-full max-w-2xl h-[85vh] min-h-0 bg-[#202122] border border-[#44474A] rounded-xl shadow-2xl overflow-hidden flex flex-col text-left">
        
      
    
      {/* Header */}
<div className="flex items-center justify-between px-6 py-4 border-b border-[#44474A] bg-[#232425]">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-[#28292A] border border-[#44474A] text-[#1FA7DA] flex items-center justify-center">
      <Cpu className="w-4 h-4" />
    </div>

    <div>
      <h3 className="text-base font-bold text-[#F1F1F1]">
        Qubify Quantum Runtime Environment
      </h3>

      <p className="text-xs text-[#858A8E]">
        Local Qiskit Execution Environment
      </p>
    </div>
  </div>

  <button
    onClick={onClose}
    className="p-1.5 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded-lg transition-colors cursor-pointer"
  >
    <X className="w-5 h-5" />
  </button>
</div>

        {/* Modal Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 text-xs font-sans text-[#CBD5E1] bg-[#232425]"></div>
          
         {/* Status Overview Card */}
<div className="p-4 bg-[#202122] border border-[#44474A] rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
  <div className="space-y-1">
    <div className="text-[11px] text-[#858A8E] uppercase tracking-wider font-semibold">
      Engine Status
    </div>

    <div className="text-sm font-bold text-[#F1F1F1] flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          runtimeInfo.status === 'ready'
            ? 'bg-emerald-400'
            : 'bg-rose-400'
        }`}
      />

      <span>
        {runtimeInfo.status === 'ready'
          ? 'Qiskit Runtime Active'
          : 'Runtime Offline'}
      </span>
    </div>
  </div>

  <div className="text-left md:text-right font-mono text-[11px] text-[#858A8E] min-w-0">
    <div>
      Backend:{' '}
      <span className="text-[#1FA7DA] font-semibold">
        {runtimeInfo.backend}
      </span>
    </div>

    <div>
      Provider:{' '}
      <span className="text-emerald-400">
        {runtimeInfo.provider || 'Unavailable'}
      </span>
    </div>
  </div>
</div>
          {/* Primary Runtime Specs Grid */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#F1F1F1] uppercase tracking-wider text-[11px]">
              Runtime Specifications
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[10px] uppercase font-bold text-[#858A8E]">Python Version</div>
                <div className="text-sm font-mono font-semibold text-[#F1F1F1] mt-0.5">{runtimeInfo.pythonVersion}</div>
              </div>
              <div className="p-3 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[10px] uppercase font-bold text-[#858A8E]">Qiskit Version</div>
                <div className="text-sm font-mono font-semibold text-[#1FA7DA] mt-0.5">{runtimeInfo.qiskitVersion}</div>
              </div>
              <div className="p-3 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[10px] uppercase font-bold text-[#858A8E]">Qiskit Aer Version</div>
                <div className="text-sm font-mono font-semibold text-emerald-400 mt-0.5">{runtimeInfo.aerVersion}</div>
              </div>
              <div className="p-3 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[10px] uppercase font-bold text-[#858A8E]">Execution Backend</div>
                <div className="text-sm font-mono font-semibold text-[#F1F1F1] mt-0.5">{runtimeInfo.backend}</div>
              </div>
            </div>
          </div>

          {/* Real Quantum Hardware Notice */}
          <div className="p-3.5 bg-[#202122] border border-[#44474A] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#28292A] border border-[#44474A] text-[#858A8E] flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F1F1F1]">Real Quantum Hardware (QPU)</div>
              <div className="text-[11px] text-[#858A8E]">
  Not connected — AerSimulator is active locally
</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-[#28292A] border border-[#44474A] rounded text-[10px] font-mono text-amber-400 font-bold uppercase">
              Future
            </span>
          </div>

          {/* Installed Scientific Packages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#F1F1F1]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1FA7DA]" />
                <span>Installed Scientific Packages</span>
              </span>
              <span className="text-[10px] text-[#858A8E] font-mono">Dynamically Introspected</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">Python</div>
                <div className="text-[#F1F1F1] font-semibold truncate">{packages.python}</div>
              </div>
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">Qiskit Core</div>
                <div className="text-[#1FA7DA] font-semibold truncate">{packages.qiskit}</div>
              </div>
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">Qiskit Aer</div>
                <div className="text-emerald-400 font-semibold truncate">{packages.qiskit_aer}</div>
              </div>
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">NumPy</div>
                <div className="text-[#F1F1F1] font-semibold truncate">{packages.numpy}</div>
              </div>
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">SciPy</div>
                <div className="text-[#F1F1F1] font-semibold truncate">{packages.scipy || 'Not Installed'}
              </div>
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">Matplotlib</div>
                <div className="text-[#F1F1F1] font-semibold truncate">{packages.matplotlib || 'Not Installed'}
              </div>
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">Algorithms</div>
                <div className="text-[#F1F1F1] font-semibold truncate">{packages.qiskit_algorithms || 'Not Installed'}
              </div>
              <div className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg">
                <div className="text-[#858A8E] text-[10px]">QPU Status</div>
                <div className="text-amber-400 font-semibold truncate">Not Connected
              </div>
            </div>
          </div>

          {/* Capabilities List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#F1F1F1] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Engineering Capabilities</span>
            </div>
            <div className="space-y-1.5">
              {capabilities.map((cap, idx) => (
                <div key={idx} className="p-2.5 bg-[#202122] border border-[#44474A] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#F1F1F1]">{cap.name}</div>
                    <div className="text-[11px] text-[#858A8E]">{cap.detail}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    cap.status === 'ready' 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-[#28292A] text-[#858A8E] border border-[#44474A]'
                  }`}>
                    {cap.status === 'ready' ? 'READY' : 'OPTIONAL'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Aer Simulation Methods */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#F1F1F1]">
              Supported Aer Simulation Methods (Methods for AerSimulator(method=...)):
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {simMethods.map((m) => (
                <span key={m} className="px-2.5 py-1 bg-[#202122] text-[#1FA7DA] rounded-md border border-[#44474A]">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Sandbox Resource Limits & Safety */}
          <div className="p-3 bg-[#202122] border border-[#44474A] rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F1F1F1]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Execution Policy &amp; Limits</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#858A8E] pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#1FA7DA]" />
                <span>Max Execution: <strong className="text-[#F1F1F1]">20 seconds</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-[#1FA7DA]" />
                <span>Memory Ceiling: <strong className="text-[#F1F1F1]">1.5 GB RAM</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
               <span>Isolated Temporary Workspace</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    </div>
    </div>
    </div>
  );
};
