// IC Pin Configuration Database for 7400-Series Logic ICs

export interface ICPin {
    number: number;
    label: string;
    type: 'input' | 'output' | 'power' | 'ground' | 'clock' | 'control';
    side: 'left' | 'right';
    position: number; // 0-based index on that side
}

export interface ICPackage {
    partNumber: string;
    name: string;
    pinCount: 14 | 16 | 20 | 24;
    pins: ICPin[];
}

// Helper to create standard DIP pin layout
function createDIPPins(pinCount: 14 | 16 | 20 | 24, pinDefs: Omit<ICPin, 'side' | 'position'>[]): ICPin[] {
    const pinsPerSide = pinCount / 2;

    return pinDefs.map(def => {
        const { number } = def;
        // Standard DIP numbering: left side top to bottom (1 to n/2), right side bottom to top (n/2+1 to n)
        if (number <= pinsPerSide) {
            return { ...def, side: 'left' as const, position: number - 1 };
        } else {
            return { ...def, side: 'right' as const, position: pinCount - number };
        }
    });
}

// IC Configurations
export const IC_LIBRARY: Record<string, ICPackage> = {
    // 7408 - Quad 2-Input AND Gate
    '7408': {
        partNumber: '7408',
        name: 'Quad 2-Input AND',
        pinCount: 14,
        pins: createDIPPins(14, [
            { number: 1, label: '1A', type: 'input' },
            { number: 2, label: '1B', type: 'input' },
            { number: 3, label: '1Y', type: 'output' },
            { number: 4, label: '2A', type: 'input' },
            { number: 5, label: '2B', type: 'input' },
            { number: 6, label: '2Y', type: 'output' },
            { number: 7, label: 'GND', type: 'ground' },
            { number: 8, label: '3Y', type: 'output' },
            { number: 9, label: '3A', type: 'input' },
            { number: 10, label: '3B', type: 'input' },
            { number: 11, label: '4Y', type: 'output' },
            { number: 12, label: '4A', type: 'input' },
            { number: 13, label: '4B', type: 'input' },
            { number: 14, label: 'VCC', type: 'power' },
        ]),
    },

    // 7432 - Quad 2-Input OR Gate
    '7432': {
        partNumber: '7432',
        name: 'Quad 2-Input OR',
        pinCount: 14,
        pins: createDIPPins(14, [
            { number: 1, label: '1A', type: 'input' },
            { number: 2, label: '1B', type: 'input' },
            { number: 3, label: '1Y', type: 'output' },
            { number: 4, label: '2A', type: 'input' },
            { number: 5, label: '2B', type: 'input' },
            { number: 6, label: '2Y', type: 'output' },
            { number: 7, label: 'GND', type: 'ground' },
            { number: 8, label: '3Y', type: 'output' },
            { number: 9, label: '3A', type: 'input' },
            { number: 10, label: '3B', type: 'input' },
            { number: 11, label: '4Y', type: 'output' },
            { number: 12, label: '4A', type: 'input' },
            { number: 13, label: '4B', type: 'input' },
            { number: 14, label: 'VCC', type: 'power' },
        ]),
    },

    // 7483 - 4-Bit Binary Full Adder
    '7483': {
        partNumber: '7483',
        name: '4-Bit Full Adder',
        pinCount: 16,
        pins: createDIPPins(16, [
            { number: 1, label: 'A4', type: 'input' },
            { number: 2, label: 'Σ3', type: 'output' },
            { number: 3, label: 'A3', type: 'input' },
            { number: 4, label: 'B3', type: 'input' },
            { number: 5, label: 'VCC', type: 'power' },
            { number: 6, label: 'Σ2', type: 'output' },
            { number: 7, label: 'B2', type: 'input' },
            { number: 8, label: 'A2', type: 'input' },
            { number: 9, label: 'Σ1', type: 'output' },
            { number: 10, label: 'A1', type: 'input' },
            { number: 11, label: 'B1', type: 'input' },
            { number: 12, label: 'GND', type: 'ground' },
            { number: 13, label: 'C0', type: 'input' },
            { number: 14, label: 'C4', type: 'output' },
            { number: 15, label: 'Σ4', type: 'output' },
            { number: 16, label: 'B4', type: 'input' },
        ]),
    },

    // 74157 - Quad 2-to-1 Multiplexer
    '74157': {
        partNumber: '74157',
        name: 'Quad 2-to-1 MUX',
        pinCount: 16,
        pins: createDIPPins(16, [
            { number: 1, label: 'SEL', type: 'control' },
            { number: 2, label: '1A', type: 'input' },
            { number: 3, label: '1B', type: 'input' },
            { number: 4, label: '1Y', type: 'output' },
            { number: 5, label: '2A', type: 'input' },
            { number: 6, label: '2B', type: 'input' },
            { number: 7, label: '2Y', type: 'output' },
            { number: 8, label: 'GND', type: 'ground' },
            { number: 9, label: '3Y', type: 'output' },
            { number: 10, label: '3B', type: 'input' },
            { number: 11, label: '3A', type: 'input' },
            { number: 12, label: '4Y', type: 'output' },
            { number: 13, label: '4B', type: 'input' },
            { number: 14, label: '4A', type: 'input' },
            { number: 15, label: 'EN', type: 'control' },
            { number: 16, label: 'VCC', type: 'power' },
        ]),
    },

    // 74147 - 10-to-4 Priority Encoder
    '74147': {
        partNumber: '74147',
        name: '10-to-4 Priority Encoder',
        pinCount: 16,
        pins: createDIPPins(16, [
            { number: 1, label: 'I4', type: 'input' },
            { number: 2, label: 'I5', type: 'input' },
            { number: 3, label: 'I6', type: 'input' },
            { number: 4, label: 'I7', type: 'input' },
            { number: 5, label: 'I8', type: 'input' },
            { number: 6, label: 'D', type: 'output' },
            { number: 7, label: 'C', type: 'output' },
            { number: 8, label: 'GND', type: 'ground' },
            { number: 9, label: 'B', type: 'output' },
            { number: 10, label: 'A', type: 'output' },
            { number: 11, label: 'I9', type: 'input' },
            { number: 12, label: 'I1', type: 'input' },
            { number: 13, label: 'I2', type: 'input' },
            { number: 14, label: 'I3', type: 'input' },
            { number: 15, label: 'I0', type: 'input' },
            { number: 16, label: 'VCC', type: 'power' },
        ]),
    },

    // 7475 - 4-Bit Bistable Latch
    '7475': {
        partNumber: '7475',
        name: '4-Bit Latch',
        pinCount: 16,
        pins: createDIPPins(16, [
            { number: 1, label: 'Q0', type: 'output' },
            { number: 2, label: '~Q0', type: 'output' },
            { number: 3, label: 'D0', type: 'input' },
            { number: 4, label: 'D1', type: 'input' },
            { number: 5, label: 'VCC', type: 'power' },
            { number: 6, label: 'D2', type: 'input' },
            { number: 7, label: 'D3', type: 'input' },
            { number: 8, label: 'EN34', type: 'control' },
            { number: 9, label: 'Q3', type: 'output' },
            { number: 10, label: '~Q3', type: 'output' },
            { number: 11, label: 'Q2', type: 'output' },
            { number: 12, label: 'GND', type: 'ground' },
            { number: 13, label: 'EN12', type: 'control' },
            { number: 14, label: '~Q2', type: 'output' },
            { number: 15, label: 'Q1', type: 'output' },
            { number: 16, label: '~Q1', type: 'output' },
        ]),
    },

    // 74193 - Synchronous 4-Bit Up/Down Counter
    '74193': {
        partNumber: '74193',
        name: '4-Bit Up/Down Counter',
        pinCount: 16,
        pins: createDIPPins(16, [
            { number: 1, label: 'B', type: 'input' },
            { number: 2, label: 'QB', type: 'output' },
            { number: 3, label: 'QA', type: 'output' },
            { number: 4, label: 'DOWN', type: 'clock' },
            { number: 5, label: 'UP', type: 'clock' },
            { number: 6, label: 'QC', type: 'output' },
            { number: 7, label: 'QD', type: 'output' },
            { number: 8, label: 'GND', type: 'ground' },
            { number: 9, label: 'D', type: 'input' },
            { number: 10, label: 'C', type: 'input' },
            { number: 11, label: 'LOAD', type: 'control' },
            { number: 12, label: 'CO', type: 'output' },
            { number: 13, label: 'BO', type: 'output' },
            { number: 14, label: 'CLR', type: 'control' },
            { number: 15, label: 'A', type: 'input' },
            { number: 16, label: 'VCC', type: 'power' },
        ]),
    },

    // 74164 - 8-Bit Serial-In Parallel-Out Shift Register
    '74164': {
        partNumber: '74164',
        name: '8-Bit SIPO Shift Register',
        pinCount: 14,
        pins: createDIPPins(14, [
            { number: 1, label: 'A', type: 'input' },
            { number: 2, label: 'B', type: 'input' },
            { number: 3, label: 'QA', type: 'output' },
            { number: 4, label: 'QB', type: 'output' },
            { number: 5, label: 'QC', type: 'output' },
            { number: 6, label: 'QD', type: 'output' },
            { number: 7, label: 'GND', type: 'ground' },
            { number: 8, label: 'CLK', type: 'clock' },
            { number: 9, label: 'CLR', type: 'control' },
            { number: 10, label: 'QE', type: 'output' },
            { number: 11, label: 'QF', type: 'output' },
            { number: 12, label: 'QG', type: 'output' },
            { number: 13, label: 'QH', type: 'output' },
            { number: 14, label: 'VCC', type: 'power' },
        ]),
    },

    // Custom - Sequence Detector (simplified as state machine)
    'SEQ101': {
        partNumber: 'SEQ101',
        name: 'Sequence Detector',
        pinCount: 14,
        pins: createDIPPins(14, [
            { number: 1, label: 'BIT', type: 'input' },
            { number: 2, label: 'RST', type: 'control' },
            { number: 3, label: 'S0', type: 'output' },
            { number: 4, label: 'S1', type: 'output' },
            { number: 5, label: 'S2', type: 'output' },
            { number: 6, label: 'DET', type: 'output' },
            { number: 7, label: 'GND', type: 'ground' },
            { number: 8, label: 'CLK', type: 'clock' },
            { number: 9, label: 'NC', type: 'control' },
            { number: 10, label: 'NC', type: 'control' },
            { number: 11, label: 'NC', type: 'control' },
            { number: 12, label: 'NC', type: 'control' },
            { number: 13, label: 'NC', type: 'control' },
            { number: 14, label: 'VCC', type: 'power' },
        ]),
    },

    // Custom - FSM Accumulator
    'FSM4': {
        partNumber: 'FSM4',
        name: 'FSM Accumulator',
        pinCount: 14,
        pins: createDIPPins(14, [
            { number: 1, label: 'ADD1', type: 'input' },
            { number: 2, label: 'ADD2', type: 'input' },
            { number: 3, label: 'RST', type: 'control' },
            { number: 4, label: 'A0', type: 'output' },
            { number: 5, label: 'A1', type: 'output' },
            { number: 6, label: 'A2', type: 'output' },
            { number: 7, label: 'GND', type: 'ground' },
            { number: 8, label: 'CLK', type: 'clock' },
            { number: 9, label: 'A3', type: 'output' },
            { number: 10, label: 'OVF', type: 'output' },
            { number: 11, label: 'CRY', type: 'output' },
            { number: 12, label: 'NC', type: 'control' },
            { number: 13, label: 'NC', type: 'control' },
            { number: 14, label: 'VCC', type: 'power' },
        ]),
    },

    // Custom - Traffic Light Controller
    'TRAF6': {
        partNumber: 'TRAF6',
        name: 'Traffic Light FSM',
        pinCount: 16,
        pins: createDIPPins(16, [
            { number: 1, label: 'OVR', type: 'input' },
            { number: 2, label: 'R1', type: 'output' },
            { number: 3, label: 'Y1', type: 'output' },
            { number: 4, label: 'G1', type: 'output' },
            { number: 5, label: 'VCC', type: 'power' },
            { number: 6, label: 'R2', type: 'output' },
            { number: 7, label: 'Y2', type: 'output' },
            { number: 8, label: 'G2', type: 'output' },
            { number: 9, label: 'S0', type: 'output' },
            { number: 10, label: 'S1', type: 'output' },
            { number: 11, label: 'NC', type: 'control' },
            { number: 12, label: 'GND', type: 'ground' },
            { number: 13, label: 'CLK', type: 'clock' },
            { number: 14, label: 'NC', type: 'control' },
            { number: 15, label: 'NC', type: 'control' },
            { number: 16, label: 'NC', type: 'control' },
        ]),
    },
};

// Helper function to get IC by part number
export function getICPackage(partNumber: string): ICPackage | null {
    return IC_LIBRARY[partNumber] || null;
}

// Helper to calculate pin positions for a DIP package
export interface PinPosition {
    x: number;
    y: number;
    number: number;
    label: string;
    type: ICPin['type'];
}

export function calculatePinPositions(
    ic: ICPackage,
    chipX: number,
    chipY: number,
    chipWidth: number,
    chipHeight: number
): PinPosition[] {
    const pinsPerSide = ic.pinCount / 2;
    const pinSpacing = chipHeight / (pinsPerSide + 1);
    const pinLength = 8; // pixels extending from chip

    return ic.pins.map(pin => {
        if (pin.side === 'left') {
            return {
                x: chipX - pinLength,
                y: chipY + pinSpacing * (pin.position + 1),
                number: pin.number,
                label: pin.label,
                type: pin.type,
            };
        } else {
            return {
                x: chipX + chipWidth + pinLength,
                y: chipY + pinSpacing * (pin.position + 1),
                number: pin.number,
                label: pin.label,
                type: pin.type,
            };
        }
    });
}
