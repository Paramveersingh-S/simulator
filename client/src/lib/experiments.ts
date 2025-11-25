export interface Input {
  id: string;
  label: string;
  value: boolean;
}

export interface Output {
  id: string;
  label: string;
  value: boolean;
}

export interface Wire {
  from: { x: number; y: number };
  to: { x: number; y: number };
  active: boolean;
  delay?: number;
}

export interface CircuitState {
  [key: string]: any;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  inputs: Input[];
  outputs: Output[];
  hasClock?: boolean;
  initialState?: () => CircuitState;
  logic: (inputs: Record<string, boolean>, state: CircuitState, clockEdge?: boolean) => { outputs: Record<string, boolean>; newState: CircuitState };
  getWires: (inputs: Record<string, boolean>, outputs: Record<string, boolean>) => Wire[];
}

export const experiments: Experiment[] = [
  {
    id: "logic-gates",
    name: "Basic Logic Gates",
    description: "Implementation of AND/OR logic",
    inputs: [
      { id: "A", label: "A", value: false },
      { id: "B", label: "B", value: false },
      { id: "C", label: "C", value: false },
    ],
    outputs: [{ id: "Y", label: "Y", value: false }],
    initialState: () => ({}),
    logic: (inputs, state) => ({
      outputs: { Y: (inputs.A && inputs.B) || inputs.C },
      newState: state,
    }),
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 80 }, to: { x: 200, y: 100 }, active: inputs.A, delay: 0 },
      { from: { x: 100, y: 140 }, to: { x: 200, y: 120 }, active: inputs.B, delay: 0 },
      { from: { x: 100, y: 200 }, to: { x: 200, y: 160 }, active: inputs.C, delay: 0 },
      { from: { x: 350, y: 130 }, to: { x: 450, y: 130 }, active: outputs.Y, delay: 0.3 },
    ],
  },
  {
    id: "full-adder",
    name: "Full Adder",
    description: "Binary addition circuit",
    inputs: [
      { id: "A", label: "A", value: false },
      { id: "B", label: "B", value: false },
      { id: "Cin", label: "Cin", value: false },
    ],
    outputs: [
      { id: "Sum", label: "Sum", value: false },
      { id: "Cout", label: "Cout", value: false },
    ],
    initialState: () => ({}),
    logic: (inputs, state) => ({
      outputs: {
        Sum: inputs.A !== inputs.B !== inputs.Cin,
        Cout: (inputs.A && inputs.B) || (inputs.Cin && (inputs.A !== inputs.B)),
      },
      newState: state,
    }),
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 80 }, to: { x: 200, y: 100 }, active: inputs.A, delay: 0 },
      { from: { x: 100, y: 140 }, to: { x: 200, y: 120 }, active: inputs.B, delay: 0 },
      { from: { x: 100, y: 200 }, to: { x: 200, y: 140 }, active: inputs.Cin, delay: 0 },
      { from: { x: 350, y: 110 }, to: { x: 450, y: 110 }, active: outputs.Sum, delay: 0.3 },
      { from: { x: 350, y: 150 }, to: { x: 450, y: 150 }, active: outputs.Cout, delay: 0.3 },
    ],
  },
  {
    id: "multiplexer",
    name: "2:1 Multiplexer",
    description: "Data routing circuit",
    inputs: [
      { id: "Select", label: "SEL", value: false },
      { id: "In0", label: "IN0", value: false },
      { id: "In1", label: "IN1", value: false },
    ],
    outputs: [{ id: "Y", label: "Y", value: false }],
    initialState: () => ({}),
    logic: (inputs, state) => ({
      outputs: { Y: inputs.Select ? inputs.In1 : inputs.In0 },
      newState: state,
    }),
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 80 }, to: { x: 200, y: 100 }, active: inputs.Select, delay: 0 },
      { from: { x: 100, y: 140 }, to: { x: 200, y: 120 }, active: inputs.In0, delay: 0 },
      { from: { x: 100, y: 200 }, to: { x: 200, y: 140 }, active: inputs.In1, delay: 0 },
      { from: { x: 350, y: 130 }, to: { x: 450, y: 130 }, active: outputs.Y, delay: 0.3 },
    ],
  },
  {
    id: "priority-encoder",
    name: "4-to-2 Priority Encoder",
    description: "Priority encoding circuit",
    inputs: [
      { id: "I0", label: "I0", value: false },
      { id: "I1", label: "I1", value: false },
      { id: "I2", label: "I2", value: false },
      { id: "I3", label: "I3", value: false },
    ],
    outputs: [
      { id: "Y1", label: "Y1", value: false },
      { id: "Y0", label: "Y0", value: false },
    ],
    initialState: () => ({}),
    logic: (inputs, state) => {
      let outputs: Record<string, boolean>;
      if (inputs.I3) outputs = { Y1: true, Y0: true };
      else if (inputs.I2) outputs = { Y1: true, Y0: false };
      else if (inputs.I1) outputs = { Y1: false, Y0: true };
      else if (inputs.I0) outputs = { Y1: false, Y0: false };
      else outputs = { Y1: false, Y0: false };
      return { outputs, newState: state };
    },
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 70 }, to: { x: 200, y: 90 }, active: inputs.I0, delay: 0 },
      { from: { x: 100, y: 120 }, to: { x: 200, y: 110 }, active: inputs.I1, delay: 0 },
      { from: { x: 100, y: 170 }, to: { x: 200, y: 130 }, active: inputs.I2, delay: 0 },
      { from: { x: 100, y: 220 }, to: { x: 200, y: 150 }, active: inputs.I3, delay: 0 },
      { from: { x: 350, y: 110 }, to: { x: 450, y: 110 }, active: outputs.Y1, delay: 0.3 },
      { from: { x: 350, y: 140 }, to: { x: 450, y: 140 }, active: outputs.Y0, delay: 0.3 },
    ],
  },
  {
    id: "sr-latch",
    name: "SR Latch (Lockout Circuit)",
    description: "Sequential logic with set/reset - maintains state",
    inputs: [
      { id: "Set1", label: "S1", value: false },
      { id: "Set2", label: "S2", value: false },
      { id: "Set3", label: "S3", value: false },
      { id: "Reset", label: "RST", value: false },
    ],
    outputs: [
      { id: "Q1", label: "Q1", value: false },
      { id: "Q2", label: "Q2", value: false },
      { id: "Q3", label: "Q3", value: false },
    ],
    initialState: () => ({ Q1: false, Q2: false, Q3: false }),
    logic: (inputs, state) => {
      let newQ1 = state.Q1;
      let newQ2 = state.Q2;
      let newQ3 = state.Q3;
      
      if (inputs.Reset) {
        newQ1 = false;
        newQ2 = false;
        newQ3 = false;
      } else {
        if (inputs.Set1) newQ1 = true;
        if (inputs.Set2) newQ2 = true;
        if (inputs.Set3) newQ3 = true;
      }
      
      return {
        outputs: { Q1: newQ1, Q2: newQ2, Q3: newQ3 },
        newState: { Q1: newQ1, Q2: newQ2, Q3: newQ3 },
      };
    },
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 70 }, to: { x: 200, y: 90 }, active: inputs.Set1, delay: 0 },
      { from: { x: 100, y: 120 }, to: { x: 200, y: 110 }, active: inputs.Set2, delay: 0 },
      { from: { x: 100, y: 170 }, to: { x: 200, y: 130 }, active: inputs.Set3, delay: 0 },
      { from: { x: 100, y: 220 }, to: { x: 200, y: 150 }, active: inputs.Reset, delay: 0 },
      { from: { x: 350, y: 100 }, to: { x: 450, y: 100 }, active: outputs.Q1, delay: 0.3 },
      { from: { x: 350, y: 130 }, to: { x: 450, y: 130 }, active: outputs.Q2, delay: 0.3 },
      { from: { x: 350, y: 160 }, to: { x: 450, y: 160 }, active: outputs.Q3, delay: 0.3 },
    ],
  },
  {
    id: "counter",
    name: "4-Bit Synchronous Counter",
    description: "Counts 0-15 with clock - maintains state",
    inputs: [
      { id: "CountUp", label: "UP", value: false },
      { id: "CountDown", label: "DOWN", value: false },
    ],
    outputs: [
      { id: "Q3", label: "Q3", value: false },
      { id: "Q2", label: "Q2", value: false },
      { id: "Q1", label: "Q1", value: false },
      { id: "Q0", label: "Q0", value: false },
    ],
    hasClock: true,
    initialState: () => ({ count: 0 }),
    logic: (inputs, state, clockEdge) => {
      let newCount = state.count || 0;
      
      if (clockEdge) {
        if (inputs.CountUp && !inputs.CountDown) {
          newCount = (newCount + 1) % 16;
        } else if (inputs.CountDown && !inputs.CountUp) {
          newCount = (newCount - 1 + 16) % 16;
        }
      }
      
      return {
        outputs: {
          Q3: Boolean(newCount & 8),
          Q2: Boolean(newCount & 4),
          Q1: Boolean(newCount & 2),
          Q0: Boolean(newCount & 1),
        },
        newState: { count: newCount },
      };
    },
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 100 }, to: { x: 200, y: 110 }, active: inputs.CountUp, delay: 0 },
      { from: { x: 100, y: 160 }, to: { x: 200, y: 140 }, active: inputs.CountDown, delay: 0 },
      { from: { x: 350, y: 90 }, to: { x: 450, y: 90 }, active: outputs.Q3, delay: 0.3 },
      { from: { x: 350, y: 120 }, to: { x: 450, y: 120 }, active: outputs.Q2, delay: 0.3 },
      { from: { x: 350, y: 150 }, to: { x: 450, y: 150 }, active: outputs.Q1, delay: 0.3 },
      { from: { x: 350, y: 180 }, to: { x: 450, y: 180 }, active: outputs.Q0, delay: 0.3 },
    ],
  },
  {
    id: "shift-register",
    name: "8-Bit Shift Register (SIPO)",
    description: "Serial-In Parallel-Out - maintains state",
    inputs: [{ id: "Data", label: "DATA", value: false }],
    outputs: [
      { id: "Q0", label: "Q0", value: false },
      { id: "Q1", label: "Q1", value: false },
      { id: "Q2", label: "Q2", value: false },
      { id: "Q3", label: "Q3", value: false },
      { id: "Q4", label: "Q4", value: false },
      { id: "Q5", label: "Q5", value: false },
      { id: "Q6", label: "Q6", value: false },
      { id: "Q7", label: "Q7", value: false },
    ],
    hasClock: true,
    initialState: () => ({ register: 0 }),
    logic: (inputs, state, clockEdge) => {
      let newRegister = state.register || 0;
      
      if (clockEdge) {
        newRegister = ((newRegister << 1) | (inputs.Data ? 1 : 0)) & 0xFF;
      }
      
      return {
        outputs: {
          Q0: Boolean((newRegister >> 0) & 1),
          Q1: Boolean((newRegister >> 1) & 1),
          Q2: Boolean((newRegister >> 2) & 1),
          Q3: Boolean((newRegister >> 3) & 1),
          Q4: Boolean((newRegister >> 4) & 1),
          Q5: Boolean((newRegister >> 5) & 1),
          Q6: Boolean((newRegister >> 6) & 1),
          Q7: Boolean((newRegister >> 7) & 1),
        },
        newState: { register: newRegister },
      };
    },
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 130 }, to: { x: 200, y: 130 }, active: inputs.Data, delay: 0 },
      { from: { x: 350, y: 80 }, to: { x: 450, y: 80 }, active: outputs.Q0, delay: 0.3 },
      { from: { x: 350, y: 100 }, to: { x: 450, y: 100 }, active: outputs.Q1, delay: 0.3 },
      { from: { x: 350, y: 120 }, to: { x: 450, y: 120 }, active: outputs.Q2, delay: 0.3 },
      { from: { x: 350, y: 140 }, to: { x: 450, y: 140 }, active: outputs.Q3, delay: 0.3 },
      { from: { x: 350, y: 160 }, to: { x: 450, y: 160 }, active: outputs.Q4, delay: 0.3 },
      { from: { x: 350, y: 180 }, to: { x: 450, y: 180 }, active: outputs.Q5, delay: 0.3 },
      { from: { x: 350, y: 200 }, to: { x: 450, y: 200 }, active: outputs.Q6, delay: 0.3 },
      { from: { x: 350, y: 220 }, to: { x: 450, y: 220 }, active: outputs.Q7, delay: 0.3 },
    ],
  },
  {
    id: "sequence-detector",
    name: "Sequence Detector (101)",
    description: "Detects pattern 1-0-1 - maintains state",
    inputs: [
      { id: "Bit", label: "BIT", value: false },
      { id: "Reset", label: "RST", value: false },
    ],
    outputs: [{ id: "Detected", label: "DET", value: false }],
    hasClock: true,
    initialState: () => ({ history: [] as number[] }),
    logic: (inputs, state, clockEdge) => {
      let history = [...(state.history || [])];
      
      if (inputs.Reset) {
        history = [];
      } else if (clockEdge) {
        history.push(inputs.Bit ? 1 : 0);
        if (history.length > 3) {
          history.shift();
        }
      }
      
      const detected = history.length === 3 && 
                      history[0] === 1 && 
                      history[1] === 0 && 
                      history[2] === 1;
      
      return {
        outputs: { Detected: detected },
        newState: { history },
      };
    },
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 100 }, to: { x: 200, y: 110 }, active: inputs.Bit, delay: 0 },
      { from: { x: 100, y: 160 }, to: { x: 200, y: 140 }, active: inputs.Reset, delay: 0 },
      { from: { x: 350, y: 130 }, to: { x: 450, y: 130 }, active: outputs.Detected, delay: 0.3 },
    ],
  },
  {
    id: "fsm-accumulator",
    name: "Finite State Machine (Accumulator)",
    description: "Adds values until overflow - maintains state",
    inputs: [
      { id: "Add1", label: "ADD1", value: false },
      { id: "Add2", label: "ADD2", value: false },
      { id: "Reset", label: "RST", value: false },
    ],
    outputs: [
      { id: "Overflow", label: "OVF", value: false },
      { id: "Carry", label: "CRY", value: false },
    ],
    hasClock: true,
    initialState: () => ({ accumulator: 0 }),
    logic: (inputs, state, clockEdge) => {
      let acc = state.accumulator || 0;
      
      if (inputs.Reset) {
        acc = 0;
      } else if (clockEdge) {
        const add = (inputs.Add1 ? 1 : 0) + (inputs.Add2 ? 2 : 0);
        acc = (acc + add) % 16;
      }
      
      return {
        outputs: {
          Overflow: acc >= 15,
          Carry: acc > 0,
        },
        newState: { accumulator: acc },
      };
    },
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 80 }, to: { x: 200, y: 100 }, active: inputs.Add1, delay: 0 },
      { from: { x: 100, y: 140 }, to: { x: 200, y: 120 }, active: inputs.Add2, delay: 0 },
      { from: { x: 100, y: 200 }, to: { x: 200, y: 140 }, active: inputs.Reset, delay: 0 },
      { from: { x: 350, y: 110 }, to: { x: 450, y: 110 }, active: outputs.Overflow, delay: 0.3 },
      { from: { x: 350, y: 140 }, to: { x: 450, y: 140 }, active: outputs.Carry, delay: 0.3 },
    ],
  },
  {
    id: "traffic-light",
    name: "Traffic Light Controller",
    description: "Cyclic state machine with 6 LEDs - maintains state",
    inputs: [{ id: "Override", label: "OVR", value: false }],
    outputs: [
      { id: "R1", label: "R1", value: false },
      { id: "Y1", label: "Y1", value: false },
      { id: "G1", label: "G1", value: false },
      { id: "R2", label: "R2", value: false },
      { id: "Y2", label: "Y2", value: false },
      { id: "G2", label: "G2", value: false },
    ],
    hasClock: true,
    initialState: () => ({ state: 0, subCycle: 0 }),
    logic: (inputs, state, clockEdge) => {
      let currentState = state.state || 0;
      let subCycle = state.subCycle || 0;
      
      if (inputs.Override) {
        return {
          outputs: { R1: true, Y1: true, G1: false, R2: true, Y2: true, G2: false },
          newState: { state: currentState, subCycle },
        };
      }
      
      if (clockEdge) {
        subCycle++;
        if (subCycle >= 3) {
          subCycle = 0;
          currentState = (currentState + 1) % 4;
        }
      }
      
      let outputs: Record<string, boolean>;
      switch (currentState) {
        case 0:
          outputs = { R1: false, Y1: false, G1: true, R2: true, Y2: false, G2: false };
          break;
        case 1:
          outputs = { R1: false, Y1: true, G1: false, R2: true, Y2: false, G2: false };
          break;
        case 2:
          outputs = { R1: true, Y1: false, G1: false, R2: false, Y2: false, G2: true };
          break;
        case 3:
          outputs = { R1: true, Y1: false, G1: false, R2: false, Y2: true, G2: false };
          break;
        default:
          outputs = { R1: true, Y1: false, G1: false, R2: true, Y2: false, G2: false };
      }
      
      return {
        outputs,
        newState: { state: currentState, subCycle },
      };
    },
    getWires: (inputs, outputs) => [
      { from: { x: 100, y: 130 }, to: { x: 200, y: 130 }, active: inputs.Override, delay: 0 },
      { from: { x: 350, y: 70 }, to: { x: 450, y: 70 }, active: outputs.R1, delay: 0.3 },
      { from: { x: 350, y: 100 }, to: { x: 450, y: 100 }, active: outputs.Y1, delay: 0.3 },
      { from: { x: 350, y: 130 }, to: { x: 450, y: 130 }, active: outputs.G1, delay: 0.3 },
      { from: { x: 350, y: 160 }, to: { x: 450, y: 160 }, active: outputs.R2, delay: 0.3 },
      { from: { x: 350, y: 190 }, to: { x: 450, y: 190 }, active: outputs.Y2, delay: 0.3 },
      { from: { x: 350, y: 220 }, to: { x: 450, y: 220 }, active: outputs.G2, delay: 0.3 },
    ],
  },
];
