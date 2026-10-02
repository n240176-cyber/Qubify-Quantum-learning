import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface MonacoQuantumEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onRun: () => void;
  errorLine?: number;
  readOnly?: boolean;
  onCursorChange?: (pos: { line: number; column: number }) => void;
}

export const MonacoQuantumEditor: React.FC<MonacoQuantumEditorProps> = ({
  code,
  onChange,
  onRun,
  errorLine,
  readOnly = false,
  onCursorChange,
}) => {
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define Qubify dark theme for Monaco
    monaco.editor.defineTheme('qubify-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '858A8E', fontStyle: 'italic' },
        { token: 'keyword', foreground: '1FA7DA', fontStyle: 'bold' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'identifier', foreground: 'F1F1F1' },
        { token: 'type', foreground: '818CF8' },
        { token: 'function', foreground: '60A5FA' },
      ],
      colors: {
        'editor.background': '#1A1B1C',
        'editor.foreground': '#F1F1F1',
        'editorCursor.foreground': '#1FA7DA',
        'editor.lineHighlightBackground': '#252627',
        'editorLineNumber.foreground': '#5A5E62',
        'editorLineNumber.activeForeground': '#1FA7DA',
        'editor.selectionBackground': '#2F4858',
        'editor.inactiveSelectionBackground': '#232A30',
      },
    });

    monaco.editor.setTheme('qubify-dark');

    // Add keyboard shortcut: Ctrl+Enter or Cmd+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    // Track cursor movements for bottom status bar
  editor.onDidChangeCursorPosition((e: any) => {
      if (onCursorChange) {
        onCursorChange({ line: e.position.lineNumber, column: e.position.column });
      }
    });

    // Register Rich Qiskit Hover Provider
    monaco.languages.registerHoverProvider('python', {
      provideHover: (model: any, position: any) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const docs: Record<string, { title: string; desc: string; example: string }> = {
          QuantumCircuit: {
            title: 'class QuantumCircuit(num_qubits, num_clbits=None, name=None)',
            desc: 'Primary container representing an instruction stream of quantum gates and classical registers.',
            example: 'qc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)',
          },
          AerSimulator: {
            title: 'class AerSimulator(configuration=None, properties=None, ...)',
            desc: 'Qiskit Aer high-performance C++ simulator backend supporting statevector, matrix_product_state, and realistic noise models.',
            example: 'sim = AerSimulator(method="statevector")\nresult = sim.run(qc, shots=1000).result()',
          },
          transpile: {
            title: 'function transpile(circuits, backend=None, basis_gates=None, optimization_level=None)',
            desc: 'Compiles and rewrites quantum circuits into target physical hardware basis gates and optimizes gate cancellations.',
            example: 't_qc = transpile(qc, basis_gates=["cx", "rz", "sx", "x"], optimization_level=3)',
          },
          Statevector: {
            title: 'class Statevector(data, dims=None)',
            desc: 'Statevector representation of pure quantum states in quantum_info. Computes exact analytical probabilities, amplitudes, and inner products.',
            example: 'from qiskit.quantum_info import Statevector\nsv = Statevector(qc)\nprobs = sv.probabilities_dict()',
          },
          DensityMatrix: {
            title: 'class DensityMatrix(data, dims=None)',
            desc: 'Density matrix representation of pure and mixed quantum states. Supports partial_trace and purity Tr(ρ²).',
            example: 'from qiskit.quantum_info import DensityMatrix, purity\nrho = DensityMatrix(qc)\nprint(purity(rho))',
          },
          NoiseModel: {
            title: 'class NoiseModel(basis_gates=None)',
            desc: 'Qiskit Aer noise model class used to inject depolarizing, amplitude damping, thermal relaxation, and readout errors into simulations.',
            example: 'from qiskit_aer.noise import NoiseModel, depolarizing_error\nnoise = NoiseModel()\nnoise.add_all_qubit_quantum_error(depolarizing_error(0.05, 2), ["cx"])',
          },
          h: {
            title: 'QuantumCircuit.h(qubit)',
            desc: 'Applies Hadamard gate H = (X + Z)/√2. Maps |0⟩ -> (|0⟩+|1⟩)/√2 and |1⟩ -> (|0⟩-|1⟩)/√2 creating equal superposition.',
            example: 'qc.h(0)',
          },
          x: {
            title: 'QuantumCircuit.x(qubit)',
            desc: 'Applies Pauli-X (NOT / bit-flip) gate. Maps |0⟩ -> |1⟩ and |1⟩ -> |0⟩.',
            example: 'qc.x(0)',
          },
          y: {
            title: 'QuantumCircuit.y(qubit)',
            desc: 'Applies Pauli-Y gate (bit and phase flip with imaginary factor i).',
            example: 'qc.y(0)',
          },
          z: {
            title: 'QuantumCircuit.z(qubit)',
            desc: 'Applies Pauli-Z (phase flip) gate. Maps |0⟩ -> |0⟩ and |1⟩ -> -|1⟩.',
            example: 'qc.z(0)',
          },
          cx: {
            title: 'QuantumCircuit.cx(control_qubit, target_qubit)',
            desc: 'Controlled-NOT (CNOT) 2-qubit entangling gate. Inverts target qubit if control qubit is |1⟩.',
            example: 'qc.cx(0, 1)',
          },
          cz: {
            title: 'QuantumCircuit.cz(control_qubit, target_qubit)',
            desc: 'Controlled-Z 2-qubit gate. Applies phase flip -1 only when both control and target are |1⟩.',
            example: 'qc.cz(0, 1)',
          },
          rx: {
            title: 'QuantumCircuit.rx(theta, qubit)',
            desc: 'Rotation around X-axis by angle theta: exp(-i θ X / 2).',
            example: 'qc.rx(math.pi / 2, 0)',
          },
          ry: {
            title: 'QuantumCircuit.ry(theta, qubit)',
            desc: 'Rotation around Y-axis by angle theta: exp(-i θ Y / 2).',
            example: 'qc.ry(math.pi / 4, 0)',
          },
          rz: {
            title: 'QuantumCircuit.rz(phi, qubit)',
            desc: 'Rotation around Z-axis by angle phi: exp(-i φ Z / 2).',
            example: 'qc.rz(math.pi / 2, 0)',
          },
          measure: {
            title: 'QuantumCircuit.measure(qubit, clbit)',
            desc: 'Measures quantum state of qubit in computational Z-basis and projects result into classical bit.',
            example: 'qc.measure(0, 0)',
          },
          measure_all: {
            title: 'QuantumCircuit.measure_all(inplace=True)',
            desc: 'Adds classical register and measures all qubits in circuit automatically.',
            example: 'qc.measure_all()',
          },
          draw: {
            title: 'QuantumCircuit.draw(output=None)',
            desc: 'Renders circuit schematic. Supported formats in Qubify: "text" (ASCII) and "mpl" (publication-grade matplotlib graphic).',
            example: 'qc.draw("text")\n# or\nfig = qc.draw("mpl")',
          },
        };

        const item = docs[word.word];
        if (item) {
          return {
            range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
            contents: [
              { value: `**${item.title}**` },
              { value: item.desc },
              { value: '```python\n' + item.example + '\n```' },
            ],
          };
        }
        return null;
      },
    });

    // Provide intelligent autocomplete completions for Qiskit if not already provided
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: 'QuantumCircuit',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'QuantumCircuit(${1:2}, ${2:2})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Qiskit QuantumCircuit(num_qubits, num_clbits)',
            range,
          },
          {
            label: 'AerSimulator',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'AerSimulator()',
            documentation: 'High-performance Qiskit Aer quantum circuit simulator backend',
            range,
          },
          {
            label: 'Statevector',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Statevector(${1:qc})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'from qiskit.quantum_info import Statevector - exact analytical wave function',
            range,
          },
          {
            label: 'DensityMatrix',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'DensityMatrix(${1:qc})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'from qiskit.quantum_info import DensityMatrix - density operator ρ',
            range,
          },
          {
            label: 'NoiseModel',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'NoiseModel()',
            documentation: 'from qiskit_aer.noise import NoiseModel',
            range,
          },
          {
            label: 'transpile',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'transpile(${1:qc}, basis_gates=[\'cx\', \'rz\', \'sx\', \'x\'], optimization_level=${2:3})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Transpile circuit to target basis gates and optimize depth',
            range,
          },
          {
            label: 'qc.h',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.h(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Hadamard (superposition) gate to qubit index',
            range,
          },
          {
            label: 'qc.x',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.x(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Pauli-X (NOT / bit-flip) gate to qubit index',
            range,
          },
          {
            label: 'qc.y',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.y(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Pauli-Y gate',
            range,
          },
          {
            label: 'qc.z',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.z(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Pauli-Z (phase flip) gate to qubit index',
            range,
          },
          {
            label: 'qc.rx',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.rx(${1:math.pi / 2}, ${2:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Rx(theta) rotation around X axis',
            range,
          },
          {
            label: 'qc.ry',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.ry(${1:math.pi / 2}, ${2:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Ry(theta) rotation around Y axis',
            range,
          },
          {
            label: 'qc.rz',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.rz(${1:math.pi / 2}, ${2:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Rz(phi) rotation around Z axis',
            range,
          },
          {
            label: 'qc.cx',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.cx(${1:0}, ${2:1})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply CNOT (controlled NOT) gate between control and target qubits',
            range,
          },
          {
            label: 'qc.cz',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.cz(${1:0}, ${2:1})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Apply Controlled-Z gate',
            range,
          },
          {
            label: 'qc.swap',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.swap(${1:0}, ${2:1})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Swap states of two qubits',
            range,
          },
          {
            label: 'qc.ccx',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.ccx(${1:0}, ${2:1}, ${3:2})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Toffoli (Controlled-Controlled-NOT) gate',
            range,
          },
          {
            label: 'qc.barrier',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.barrier()',
            documentation: 'Add barrier across qubits to prevent circuit optimization across stages',
            range,
          },
          {
            label: 'qc.draw',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.draw(${1:\'mpl\'})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Draw circuit schematic using "text" or "mpl"',
            range,
          },
          {
            label: 'qc.measure',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.measure(${1:0}, ${2:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Measure qubit into classical bit',
            range,
          },
          {
            label: 'qc.measure_all',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'qc.measure_all()',
            documentation: 'Add measurements to all qubits in circuit',
            range,
          },
          {
            label: 'result.get_counts',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'result.get_counts()',
            documentation: 'Extract dictionary of measured bitstring counts',
            range,
          },
        ];

        return { suggestions };
      },
    });
  };

  // Highlight error line with gutter marker and inline wave
  useEffect(() => {
    if (!editorRef.current) return;

    if (errorLine && errorLine > 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: {
              startLineNumber: errorLine,
              startColumn: 1,
              endLineNumber: errorLine,
              endColumn: 1,
            },
            options: {
              isWholeLine: true,
              className: 'bg-rose-950/40 border-l-2 border-rose-500',
              glyphMarginClassName: 'text-rose-500',
              hoverMessage: { value: `Error on line ${errorLine}` },
            },
          },
        ]
      );

      // Smoothly scroll to the error line
      editorRef.current.revealLineInCenter(errorLine);
    } else {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        []
      );
    }
  }, [errorLine]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#070E1A]">
      <Editor
        height="100%"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 20,
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
          fontLigatures: true,
          tabSize: 4,
          insertSpaces: true,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          folding: true,
          wordWrap: 'off',
        }}
        loading={
          <div className="flex items-center justify-center h-full text-xs text-[#94A3B8] font-mono">
            Loading Python Code Editor...
          </div>
        }
      />
    </div>
  );
};
