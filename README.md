# Qubify — Interactive Quantum Learning with Qiskit
## Live Demo

🌐 **Qubify:** https://qubify.onrender.com/

> The public deployment uses Qiskit Aer for real quantum-circuit simulation.  
> IBM Quantum hardware integration is future scope.

Qubify is a beginner-friendly interactive quantum computing learning platform designed to make the transition from quantum concepts to real Qiskit programming easier.

Instead of learning quantum computing only through theory, Qubify follows this learning flow:

**Learn → Visualize → Practice → Code → Simulate → Improve**

The platform combines guided lessons, circuit visualization, coding exercises, and real quantum simulation powered by **Qiskit Aer**.

---

## Why Qubify?

Quantum computing has a steep learning curve.

Beginners often need to understand several things at the same time:

- Qubits and quantum states
- Superposition
- Measurement
- Quantum gates
- Probabilities
- Quantum circuits
- Python
- Qiskit syntax
- Simulator outputs

Qubify is designed to bridge this gap by providing a visual and interactive learning layer around Qiskit.

---

## Core Idea

Qubify is **not a replacement for Qiskit**.

Qiskit provides the quantum computing SDK and simulation capabilities.

Qubify provides the learning experience around it.

```text
Learner
   ↓
Qubify Interactive UI
   ↓
Quantum Circuit / Lesson / Code
   ↓
Backend API
   ↓
Python + Qiskit
   ↓
Qiskit AerSimulator
   ↓
Real Simulation Results
   ↓
Visualization + Explanation
```

---

## Current Features

### Interactive Quantum Lessons

Qubify includes guided learning experiences covering concepts such as:

- Classical bits vs qubits
- Quantum states
- Superposition
- Measurement
- Probability
- Quantum gates
- Quantum circuit execution
- Repeated measurements and shots
- Qiskit fundamentals

---

## Quantum Code Lab

The Quantum Code Lab allows learners to write and execute Python + Qiskit code.

Example:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)

qc.h(0)
qc.measure(0, 0)

simulator = AerSimulator()

result = simulator.run(
    qc,
    shots=1000
).result()

print(result.get_counts())
```

The execution is performed using the Python/Qiskit backend rather than generating fake frontend results.

---

## Real Qiskit Aer Simulation

Qubify currently uses:

- Qiskit
- Qiskit Aer
- AerSimulator
- Python

The backend can return:

- Measurement counts
- Individual shot results
- Probabilities
- Circuit depth
- Circuit size
- Circuit analysis
- Runtime environment information

Example:

```json
{
  "success": true,
  "counts": {
    "0": 507,
    "1": 493
  },
  "shots": 1000,
  "numQubits": 1
}
```

---

## Structured Lesson Simulation API

Interactive lessons can send structured quantum circuit requests such as:

```json
{
  "numQubits": 2,
  "shots": 1000,
  "operations": [
    {
      "gate": "h",
      "qubits": [0]
    },
    {
      "gate": "cx",
      "qubits": [0, 1]
    }
  ]
}
```

The backend converts these operations into a real Qiskit circuit and executes it using Qiskit Aer.

This allows lesson visualizations to use real quantum simulation results instead of frontend-generated random values.

---

## Supported Circuit Operations

The structured simulator currently supports gates including:

- H
- X
- Y
- Z
- S
- T
- RX
- RY
- RZ
- CNOT / CX
- CZ
- SWAP
- Barrier

---

## Runtime Detection

Qubify can inspect the current quantum runtime environment and report information such as:

- Python version
- Qiskit version
- Qiskit Aer version
- NumPy
- SciPy
- Available Aer simulation methods
- Quantum-related capabilities

Real IBM Quantum hardware is **not currently connected**.

Current execution uses **Qiskit AerSimulator**.

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Lucide React

### Backend

- Node.js
- Express
- Python subprocess execution

### Quantum Computing

- Qiskit
- Qiskit Aer
- AerSimulator

---

## Project Structure

```text
Qubify
│
├── src/
│   ├── components/
│   ├── views/
│   ├── services/
│   │   ├── quantumExecutor.ts
│   │   └── lessonQuantumSimulator.ts
│   ├── data/
│   ├── types/
│   └── utils/
│
├── public/
│
├── server.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Run Qubify Locally

### 1. Clone the repository

```bash
git clone https://github.com/n240176-cyber/Qubify-Quantum-learning.git
cd Qubify-Quantum-learning
```

### 2. Install Node.js dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Create a Python virtual environment

```bash
python3 -m venv .venv
```

Activate it on Linux/macOS:

```bash
source .venv/bin/activate
```

### 4. Install quantum dependencies

```bash
pip install --upgrade pip
pip install qiskit qiskit-aer
```

### 5. Start Qubify

Make sure the virtual environment is active, then run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Test the Quantum Backend

Check runtime status:

```bash
curl http://localhost:3000/api/quantum/status
```

Run a Hadamard simulation:

```bash
curl -X POST http://localhost:3000/api/quantum/simulate \
-H "Content-Type: application/json" \
-d '{
  "numQubits": 1,
  "shots": 1000,
  "operations": [
    {
      "gate": "h",
      "qubits": [0]
    }
  ]
}'
```

A Hadamard circuit should produce approximately equal numbers of `0` and `1` measurements.

---

## Current Development Status

### Working

- React learning interface
- Quantum Code Lab
- Real Qiskit execution
- Qiskit Aer simulation
- Runtime environment detection
- Structured quantum simulation API
- Measurement counts
- Individual shot memory
- Circuit analysis
- Reusable lesson simulation service

### In Progress

- Connecting more interactive lessons directly to Qiskit
- Removing remaining frontend-only demonstration simulations
- Deployment configuration
- Production backend hardening
- Additional quantum visualizations

---

## Security Note

The current Quantum Code Lab is intended primarily for controlled/local prototype execution.

Executing arbitrary Python code requires stronger isolation before being safely exposed as a public production service.

The structured quantum simulation API provides a more controlled execution path for public lesson interactions.

---

## Future Scope

Planned extensions include:

- IBM Quantum hardware integration through authorized cloud access
- Richer Bloch sphere and statevector visualization
- Quantum noise experiments
- Grover's algorithm
- Quantum Fourier Transform
- Additional Qiskit challenges
- AI-assisted explanation of quantum results and programming errors
- Learning progress analytics
- Integration opportunities with the Andhra Pradesh / Amaravati quantum ecosystem

Real quantum hardware integration is future scope; the current implementation uses Qiskit Aer simulation.

---

## Vision

Qubify aims to reduce the gap between:

> “I understand the idea of a qubit”

and

> “I can build and execute quantum circuits using Qiskit.”

The goal is to provide learners with a practical path from quantum fundamentals to real quantum programming.

---

## Repository

https://github.com/n240176-cyber/Qubify-Quantum-learning

---

## Team

Developed for a quantum computing hackathon / innovation challenge.

Built around the Qiskit ecosystem.
