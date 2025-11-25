import type { PinPosition } from './ic-pins';

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

export interface PinMapping {
  pin: number;  // Physical pin number on the IC
}

export interface Wire {
  points: { x: number; y: number }[];
  active: boolean;
  delay?: number;
}

export interface CircuitState {
  [key: string]: any;
}

export interface LayoutMetrics {
  inputPositions: { x: number; y: number }[];
  outputPositions: { x: number; y: number }[];
  chipLeft: number;
  chipRight: number;
  chipCenter: number;
  pinPositions?: Map<number, PinPosition>;  // Map of pin number to position
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  inputs: Input[];
  outputs: Output[];
  hasClock?: boolean;
  icChip: string;  // IC part number (e.g., '7408', '7483')
  pinMapping: {
    inputs: Record<string, PinMapping>;   // Maps input ID to pin number
    outputs: Record<string, PinMapping>;  // Maps output ID to pin number
    clock?: PinMapping;  // Optional clock pin
  };
  initialState?: () => CircuitState;
  logic: (inputs: Record<string, boolean>, state: CircuitState, clockEdge?: boolean) => { outputs: Record<string, boolean>; newState: CircuitState };
  getWires: (inputs: Record<string, boolean>, outputs: Record<string, boolean>, layout: LayoutMetrics) => Wire[];
}

// Helper to create orthogonal wire paths
function createOrthogonalWire(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  active: boolean,
  delay: number = 0
): Wire {
  const midX = (fromX + toX) / 2;
  return {
    points: [
      { x: fromX, y: fromY },
      { x: midX, y: fromY },
      { x: midX, y: toY },
      { x: toX, y: toY },
    ],
    active,
    delay,
  };
}

// Helper to create wire from input/output to IC pin
function createPinWire(
  fromX: number,
  fromY: number,
  pinPosition: { x: number; y: number } | undefined,
  active: boolean,
  delay: number = 0
): Wire {
  if (!pinPosition) {
    // Fallback to simple wire if pin position not available
    return {
      points: [{ x: fromX, y: fromY }],
      active,
      delay,
    };
  }

  return createOrthogonalWire(fromX, fromY, pinPosition.x, pinPosition.y, active, delay);
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
    icChip: '7408',  // Using 7408 Quad 2-Input AND gate
    pinMapping: {
      inputs: {
        A: { pin: 1 },   // 1A
        B: { pin: 2 },   // 1B
        C: { pin: 4 },   // 2A (using as third input for OR)
      },
      outputs: {
        Y: { pin: 3 },   // 1Y (AND output, then ORed internally)
      },
    },
    initialState: () => ({}),
    logic: (inputs, state) => ({
      outputs: { Y: (inputs.A && inputs.B) || inputs.C },
      newState: state,
    }),
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      // Input wires to IC pins
      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["A", "B", "C"][idx];
        const pinNum = { A: 1, B: 2, C: 4 }[inputKey as 'A' | 'B' | 'C'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      // Output wires from IC pins
      layout.outputPositions.forEach((pos) => {
        const pinPos = pinPositions?.get(3);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs.Y, 0.3));
      });

      return wires;
    },
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
    icChip: '7483',  // 4-Bit Binary Full Adder
    pinMapping: {
      inputs: {
        A: { pin: 10 },    // A1
        B: { pin: 11 },    // B1
        Cin: { pin: 13 },  // C0 (carry in)
      },
      outputs: {
        Sum: { pin: 9 },   // Σ1
        Cout: { pin: 14 }, // C4 (carry out)
      },
    },
    initialState: () => ({}),
    logic: (inputs, state) => ({
      outputs: {
        Sum: inputs.A !== inputs.B !== inputs.Cin,
        Cout: (inputs.A && inputs.B) || (inputs.Cin && (inputs.A !== inputs.B)),
      },
      newState: state,
    }),
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      // Input wires
      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["A", "B", "Cin"][idx];
        const pinNum = { A: 10, B: 11, Cin: 13 }[inputKey as 'A' | 'B' | 'Cin'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      // Output wires
      layout.outputPositions.forEach((pos, idx) => {
        const outputKey = ["Sum", "Cout"][idx];
        const pinNum = { Sum: 9, Cout: 14 }[outputKey as 'Sum' | 'Cout'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs[outputKey], 0.3));
      });

      return wires;
    },
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
    icChip: '74157',  // Quad 2-to-1 Multiplexer
    pinMapping: {
      inputs: {
        Select: { pin: 1 },  // SEL
        In0: { pin: 2 },     // 1A
        In1: { pin: 3 },     // 1B
      },
      outputs: {
        Y: { pin: 4 },       // 1Y
      },
    },
    initialState: () => ({}),
    logic: (inputs, state) => ({
      outputs: { Y: inputs.Select ? inputs.In1 : inputs.In0 },
      newState: state,
    }),
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["Select", "In0", "In1"][idx];
        const pinNum = { Select: 1, In0: 2, In1: 3 }[inputKey as 'Select' | 'In0' | 'In1'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos) => {
        const pinPos = pinPositions?.get(4);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs.Y, 0.3));
      });

      return wires;
    },
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
    icChip: '74147',  // 10-to-4 Priority Encoder (using first 4 inputs)
    pinMapping: {
      inputs: {
        I0: { pin: 15 },  // I0
        I1: { pin: 12 },  // I1
        I2: { pin: 13 },  // I2
        I3: { pin: 14 },  // I3
      },
      outputs: {
        Y1: { pin: 9 },   // B
        Y0: { pin: 10 },  // A
      },
    },
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
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["I0", "I1", "I2", "I3"][idx];
        const pinNum = { I0: 15, I1: 12, I2: 13, I3: 14 }[inputKey as 'I0' | 'I1' | 'I2' | 'I3'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos, idx) => {
        const outputKey = ["Y1", "Y0"][idx];
        const pinNum = { Y1: 9, Y0: 10 }[outputKey as 'Y1' | 'Y0'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs[outputKey], 0.3));
      });

      return wires;
    },
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
    icChip: '7475',  // 4-Bit Bistable Latch
    pinMapping: {
      inputs: {
        Set1: { pin: 3 },    // D0
        Set2: { pin: 4 },    // D1
        Set3: { pin: 6 },    // D2
        Reset: { pin: 13 },  // EN12 (enable/reset)
      },
      outputs: {
        Q1: { pin: 1 },      // Q0
        Q2: { pin: 15 },     // Q1
        Q3: { pin: 11 },     // Q2
      },
    },
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
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["Set1", "Set2", "Set3", "Reset"][idx];
        const pinNum = { Set1: 3, Set2: 4, Set3: 6, Reset: 13 }[inputKey as 'Set1' | 'Set2' | 'Set3' | 'Reset'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos, idx) => {
        const outputKey = ["Q1", "Q2", "Q3"][idx];
        const pinNum = { Q1: 1, Q2: 15, Q3: 11 }[outputKey as 'Q1' | 'Q2' | 'Q3'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs[outputKey], 0.3));
      });

      return wires;
    },
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
    icChip: '74193',  // Synchronous 4-Bit Up/Down Counter
    pinMapping: {
      inputs: {
        CountUp: { pin: 5 },     // UP clock
        CountDown: { pin: 4 },   // DOWN clock
      },
      outputs: {
        Q3: { pin: 7 },  // QD
        Q2: { pin: 6 },  // QC
        Q1: { pin: 2 },  // QB
        Q0: { pin: 3 },  // QA
      },
      clock: { pin: 5 },  // UP is treated as clock
    },
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
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["CountUp", "CountDown"][idx];
        const pinNum = { CountUp: 5, CountDown: 4 }[inputKey as 'CountUp' | 'CountDown'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos, idx) => {
        const outputKey = ["Q3", "Q2", "Q1", "Q0"][idx];
        const pinNum = { Q3: 7, Q2: 6, Q1: 2, Q0: 3 }[outputKey as 'Q3' | 'Q2' | 'Q1' | 'Q0'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs[outputKey], 0.3));
      });

      return wires;
    },
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
    icChip: '74164',  // 8-Bit Serial-In Parallel-Out Shift Register
    pinMapping: {
      inputs: {
        Data: { pin: 1 },    // A (serial input)
      },
      outputs: {
        Q0: { pin: 3 },  // QA
        Q1: { pin: 4 },  // QB
        Q2: { pin: 5 },  // QC
        Q3: { pin: 6 },  // QD
        Q4: { pin: 10 }, // QE
        Q5: { pin: 11 }, // QF
        Q6: { pin: 12 }, // QG
        Q7: { pin: 13 }, // QH
      },
      clock: { pin: 8 },
    },
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
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["Data"][idx];
        const pinPos = pinPositions?.get(1);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos, idx) => {
        const outputKey = ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"][idx];
        const pinNum = { Q0: 3, Q1: 4, Q2: 5, Q3: 6, Q4: 10, Q5: 11, Q6: 12, Q7: 13 }[outputKey as 'Q0' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs[outputKey], 0.3));
      });

      return wires;
    },
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
    icChip: 'SEQ101',  // Custom Sequence Detector IC
    pinMapping: {
      inputs: {
        Bit: { pin: 1 },     // BIT input
        Reset: { pin: 2 },   // RST (reset)
      },
      outputs: {
        Detected: { pin: 6 }, // DET output
      },
      clock: { pin: 8 },
    },
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
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["Bit", "Reset"][idx];
        const pinNum = { Bit: 1, Reset: 2 }[inputKey as 'Bit' | 'Reset'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos) => {
        const pinPos = pinPositions?.get(6);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs.Detected, 0.3));
      });

      return wires;
    },
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
    icChip: 'FSM4',  // Custom FSM Accumulator IC
    pinMapping: {
      inputs: {
        Add1: { pin: 1 },    // ADD1
        Add2: { pin: 2 },    // ADD2
        Reset: { pin: 3 },   // RST
      },
      outputs: {
        Overflow: { pin: 10 }, // OVF
        Carry: { pin: 11 },    // CRY
      },
      clock: { pin: 8 },
    },
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
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["Add1", "Add2", "Reset"][idx];
        const pinNum = { Add1: 1, Add2: 2, Reset: 3 }[inputKey as 'Add1' | 'Add2' | 'Reset'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos, idx) => {
        const outputKey = ["Overflow", "Carry"][idx];
        const pinNum = { Overflow: 10, Carry: 11 }[outputKey as 'Overflow' | 'Carry'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs[outputKey], 0.3));
      });

      return wires;
    },
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
    icChip: 'TRAF6',  // Custom Traffic Light Controller IC
    pinMapping: {
      inputs: {
        Override: { pin: 1 },  // OVR
      },
      outputs: {
        R1: { pin: 2 },  // R1
        Y1: { pin: 3 },  // Y1
        G1: { pin: 4 },  // G1
        R2: { pin: 6 },  // R2
        Y2: { pin: 7 },  // Y2
        G2: { pin: 8 },  // G2
      },
      clock: { pin: 13 },
    },
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
    getWires: (inputs, outputs, layout) => {
      const wires: Wire[] = [];
      const { pinPositions } = layout;

      layout.inputPositions.forEach((pos, idx) => {
        const inputKey = ["Override"][idx];
        const pinPos = pinPositions?.get(1);
        wires.push(createPinWire(pos.x, pos.y, pinPos, inputs[inputKey], 0));
      });

      layout.outputPositions.forEach((pos, idx) => {
        const outputKey = ["R1", "Y1", "G1", "R2", "Y2", "G2"][idx];
        const pinNum = { R1: 2, Y1: 3, G1: 4, R2: 6, Y2: 7, G2: 8 }[outputKey as 'R1' | 'Y1' | 'G1' | 'R2' | 'Y2' | 'G2'];
        const pinPos = pinPositions?.get(pinNum);
        wires.push(createPinWire(pinPos?.x ?? layout.chipRight, pinPos?.y ?? pos.y, { x: pos.x, y: pos.y }, outputs[outputKey], 0.3));
      });

      return wires;
    },
  },
];

