import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Layers, 
  BarChart2, 
  Cpu, 
  Code2 
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCodeSnippet?: (snippet: string) => void;
}

interface DocSection {
  id: string;
  title: string;
  category: string;
  description: string;
  signature: string;
  example: string;
  notes?: string;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'quantum-circuit',
    title: 'QuantumCircuit',
    category: 'Core',
    description: 'Creates a quantum circuit container with the specified number of qubits and classical bits.',
    signature: 'QuantumCircuit(num_qubits, num_clbits=None, name=None)',
    example: 'from qiskit import QuantumCircuit\n\n# Create a circuit with 2 qubits and 2 classical bits\nqc = QuantumCircuit(2, 2)',
    notes: 'Qubit indices range from 0 to num_qubits - 1. Classical registers store measurement outcomes.',
  },
  {
    id: 'hadamard-gate',
    title: 'Hadamard Gate (H)',
    category: 'Single-Qubit Gates',
    description: 'Puts a qubit into an equal superposition state: |0⟩ → (|0⟩+|1⟩)/√2 and |1⟩ → (|0⟩-|1⟩)/√2.',
    signature: 'qc.h(qubit)',
    example: 'qc.h(0)  # Superposition on qubit 0',
    notes: 'Matrix representation: [[1, 1], [1, -1]] / √2. Applying H twice returns the state to the original.',
  },
  {
    id: 'pauli-x-gate',
    title: 'Pauli-X Gate (NOT / Bit-Flip)',
    category: 'Single-Qubit Gates',
    description: 'Flips |0⟩ to |1⟩ and |1⟩ to |0⟩. Quantum analog of classical NOT.',
    signature: 'qc.x(qubit)',
    example: 'qc.x(0)  # Flips qubit 0 from |0> to |1>',
    notes: 'Matrix representation: [[0, 1], [1, 0]].',
  },
  {
    id: 'pauli-y-gate',
    title: 'Pauli-Y Gate',
    category: 'Single-Qubit Gates',
    description: 'Applies both a bit-flip and phase-flip with an imaginary factor: |0⟩ → i|1⟩, |1⟩ → -i|0⟩.',
    signature: 'qc.y(qubit)',
    example: 'qc.y(0)  # Pauli-Y on qubit 0',
    notes: 'Matrix representation: [[0, -i], [i, 0]].',
  },
  {
    id: 'pauli-z-gate',
    title: 'Pauli-Z Gate (Phase Flip)',
    category: 'Single-Qubit Gates',
    description: 'Leaves |0⟩ unchanged, but flips the phase of |1⟩ to -|1⟩. Converts |+⟩ ↔ |−⟩.',
    signature: 'qc.z(qubit)',
    example: 'qc.z(0)  # Phase flip on qubit 0',
    notes: 'Matrix representation: [[1, 0], [0, -1]].',
  },
  {
    id: 'rotation-gates',
    title: 'Rotation Gates (Rx, Ry, Rz)',
    category: 'Single-Qubit Gates',
    description: 'Applies continuous single-qubit rotations by angle θ (in radians) around X, Y, or Z Bloch sphere axes.',
    signature: 'qc.rx(theta, qubit) / qc.ry(theta, qubit) / qc.rz(phi, qubit)',
    example: 'import math\n\n# Rotate 90 degrees around Y axis\nqc.ry(math.pi / 2, 0)',
    notes: 'Angles are specified in radians. math.pi is commonly imported for angle calculations.',
  },
  {
    id: 'cnot-gate',
    title: 'Controlled-NOT (CNOT / CX)',
    category: 'Two-Qubit Gates',
    description: 'Flips the target qubit if and only if the control qubit is in the |1⟩ state. Primary entangling gate.',
    signature: 'qc.cx(control_qubit, target_qubit)',
    example: '# Control on qubit 0, target on qubit 1\nqc.cx(0, 1)',
    notes: 'Combined with Hadamard on control qubit, creates maximally entangled Bell pairs.',
  },
  {
    id: 'cz-gate',
    title: 'Controlled-Z (CZ)',
    category: 'Two-Qubit Gates',
    description: 'Applies a π phase shift (-1) only when both control and target qubits are in the |1⟩ state.',
    signature: 'qc.cz(control_qubit, target_qubit)',
    example: 'qc.cz(0, 1)  # Controlled-Z between qubits 0 and 1',
    notes: 'Symmetric gate: swapping control and target yields the same quantum operation.',
  },
  {
    id: 'measure-operation',
    title: 'Measurement (measure / measure_all)',
    category: 'Measurement',
    description: 'Measures quantum states in computational Z-basis and projects the outcome into classical bits.',
    signature: 'qc.measure(qubit, clbit) or qc.measure_all()',
    example: '# Single measurement:\nqc.measure(0, 0)\n\n# Or measure all qubits at once:\nqc.measure_all()',
    notes: 'Measurement collapses superposition into deterministic classical bitstrings (0 or 1).',
  },
  {
    id: 'aer-simulator',
    title: 'AerSimulator Execution',
    category: 'Simulation',
    description: 'Runs quantum circuits on the high-performance local AerSimulator backend with specified shot counts.',
    signature: 'simulator = AerSimulator(); simulator.run(circuit, shots=N).result()',
    example: 'from qiskit_aer import AerSimulator\n\nsimulator = AerSimulator()\njob = simulator.run(qc, shots=1000)\nresult = job.result()\ncounts = result.get_counts()\nprint(counts)',
    notes: 'Default shots parameter is 1024. Counts returns a dictionary of bitstrings mapping to sample frequencies.',
  },
  {
    id: 'circuit-drawer',
    title: 'Circuit Drawing (draw)',
    category: 'Visualization',
    description: 'Renders the circuit diagram as terminal text or as a rich Matplotlib publication figure.',
    signature: 'qc.draw(output="text" | "mpl")',
    example: '# Terminal ASCII format:\nprint(qc.draw("text"))\n\n# Or Matplotlib diagram (rendered in Results tab):\nfig = qc.draw("mpl")',
    notes: 'Qubify automatically intercepts Matplotlib figure generation and displays high-res images in Results.',
  },
  {
    id: 'statevector',
    title: 'Statevector (Quantum Info)',
    category: 'Simulation',
    description: 'Computes the exact analytic wave function without statistical shot sampling.',
    signature: 'Statevector(circuit)',
    example: 'from qiskit.quantum_info import Statevector\n\nsv = Statevector(qc)\nprint("State amplitudes:", sv)\nprint("Probabilities:", sv.probabilities_dict())',
    notes: 'Use Statevector for small circuits (<= 14 qubits) to study exact theoretical amplitudes without measurement noise.',
  },
];

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  onInsertCodeSnippet,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Core', 'Single-Qubit Gates', 'Two-Qubit Gates', 'Measurement', 'Simulation', 'Visualization'];

  const filtered = DOC_SECTIONS.filter((item) => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase()) ||
                          item.signature.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#202122] border border-[#44474A] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#44474A] bg-[#232425]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#28292A] border border-[#44474A] text-[#1FA7DA] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F1F1]">Qiskit API Quick Reference</h3>
              <p className="text-xs text-[#858A8E]">QuantumCircuit syntax, gates, simulation, and measurement</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://docs.quantum.ibm.com/api/qiskit"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#1FA7DA] hover:underline flex items-center gap-1 font-mono mr-2"
            >
              <span>IBM Qiskit Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-[#44474A] bg-[#202122] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#858A8E]" />
            <input
              type="text"
              placeholder="Search Qiskit functions, gates, signatures (e.g. Hadamard, cx, AerSimulator)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#28292A] border border-[#44474A] rounded-lg text-xs text-[#F1F1F1] placeholder-[#858A8E] focus:outline-none focus:border-[#1FA7DA]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-[#1FA7DA] text-white font-semibold'
                    : 'bg-[#28292A] text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#303234]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#232425]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#858A8E] text-xs">
              No matching Qiskit functions found for "{search}".
            </div>
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-[#202122] border border-[#44474A] hover:border-[#1FA7DA]/40 rounded-lg space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#F1F1F1]">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#28292A] border border-[#44474A] text-[#1FA7DA]">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onInsertCodeSnippet && (
                      <button
                        onClick={() => {
                          onInsertCodeSnippet(item.example);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs bg-[#28292A] hover:bg-[#303234] border border-[#44474A] text-[#1FA7DA] rounded transition-colors cursor-pointer flex items-center gap-1"
                        title="Insert into active file"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Insert Code</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(item.id, item.example)}
                      className="p-1.5 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded transition-colors cursor-pointer"
                      title="Copy snippet"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">{item.description}</p>

                <div className="p-2 bg-[#28292A] border border-[#44474A]/80 rounded font-mono text-[11px] text-[#1FA7DA]">
                  {item.signature}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#858A8E]">Example:</div>
                  <pre className="p-3 bg-[#1A1B1C] border border-[#44474A] rounded-md font-mono text-xs text-[#E2E8F0] overflow-x-auto leading-relaxed">
                    {item.example}
                  </pre>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-[#858A8E] italic pt-1 border-t border-[#44474A]/40">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
