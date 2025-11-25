# Digital Logic Circuit Simulator

## Overview
An interactive, web-based educational tool for learning digital electronics through 10 comprehensive experiments. Students can visualize signal flow through realistic circuit components with a skeuomorphic dark mode design.

## Purpose
Educational platform for digital logic concepts, featuring realistic visual representations of circuits with interactive inputs (DIP switches), animated signal flow (glowing SVG wires), and visual outputs (LEDs).

## Current State
**Status:** Fully functional MVP with all 10 experiments implemented
**Last Updated:** November 25, 2025

## Features Implemented
### Core Functionality
- **10 Digital Logic Experiments:**
  1. Basic Logic Gates (AND/OR)
  2. Full Adder (Binary Addition)
  3. 2:1 Multiplexer (Data Routing)
  4. 4-to-2 Priority Encoder
  5. SR Latch (Sequential Logic)
  6. 4-Bit Synchronous Counter (0-15 counting)
  7. 8-Bit Shift Register (SIPO)
  8. Sequence Detector (101 pattern)
  9. Finite State Machine (Accumulator)
  10. Traffic Light Controller (Cyclic State Machine)

### Visual Components
- **DIP Switches:** 3D toggle switches with raised/pressed states and glow effects
- **LEDs:** Realistic circular LEDs with multi-layer radial glow when active
- **IC Chips:** Central processing units with gradient backgrounds and depth shadows
- **SVG Wires:** Animated signal paths that glow emerald when carrying HIGH signals
- **Circuit Board:** Grid-patterned slate background simulating PCB texture
- **Clock Indicator:** Auto-pulsing amber indicator for sequential circuits

### Responsive Design
- **Mobile:** Vertical stack layout, collapsible sidebar sheet, horizontally scrollable circuit board
- **Desktop:** Split-screen with fixed sidebar (320px) and centered circuit board
- Touch-optimized controls with proper spacing for mobile interaction

## Project Architecture
### Frontend (Client-Side Only)
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with custom utilities for circuit components
- **State Management:** React hooks (useState, useEffect)
- **Routing:** Wouter for SPA navigation
- **Font:** JetBrains Mono for technical/monospace aesthetic

### File Structure
```
client/src/
  ├── pages/
  │   └── simulator.tsx          # Main simulator UI with all components
  ├── lib/
  │   └── experiments.ts          # Experiment configs, logic functions, and wire mappings
  ├── index.css                   # Custom circuit styles (glows, shadows, gradients)
  └── App.tsx                     # App router
```

### Key Design Decisions
1. **No Backend:** All circuit logic runs client-side for instant response
2. **Single Page Application:** Entire simulator in one comprehensive component
3. **Dark Mode Only:** Slate-900 background optimized for circuit board aesthetic
4. **Monospace Typography:** JetBrains Mono for technical accuracy and readability
5. **Skeuomorphic Components:** 3D effects using CSS gradients, shadows, and inset effects

## Circuit Logic Implementation
Each experiment includes:
- **Input Configuration:** Array of labeled switches with initial states
- **Output Configuration:** Array of labeled LEDs
- **Logic Function:** Pure function taking inputs and optional clockTick → outputs
- **Wire Mapping:** Function returning SVG line coordinates based on current state
- **Clock Support:** Optional auto-incrementing tick for sequential circuits

### Sequential Circuit Clock
- Auto-increments every 1 second when enabled
- Visual pulse indicator on Clock button
- Pause/Resume functionality
- Tick counter display in status panel

## Design System
### Colors
- **Background:** Slate-900 (#0f172a)
- **Circuit Board:** Slate-800 (#1e293b) with grid pattern
- **Active Signal:** Emerald-400 (#34d399)
- **Inactive Signal:** Slate-600 (#475569)
- **Clock/Warning:** Amber-500 (#f59e0b)
- **Text Primary:** Slate-100 (#f1f5f9)
- **Text Secondary:** Slate-400 (#94a3b8)

### Spacing
- Component padding: 16-32px (p-4 to p-8)
- Section gaps: 24-48px (gap-6 to gap-12)
- Mobile switches: 48px height, Desktop: 64px height
- Mobile LEDs: 32px diameter, Desktop: 40px diameter

### Interactions
- Hover states on experiment list items
- Instant visual feedback on switch toggle
- Smooth wire color transitions (200ms)
- LED glow animations with radial gradients
- Clock pulse animation (1s fade in/out)

## Usage
1. Select an experiment from the sidebar (mobile: tap menu icon)
2. Toggle DIP switches to change inputs
3. Watch wires glow and LEDs light up based on circuit logic
4. For sequential circuits: Enable clock to see state progression
5. Monitor status panel for real-time circuit information

## Development Notes
- All experiments are self-contained with their own logic functions
- Wire coordinates are hardcoded for visual clarity (can be made dynamic)
- Clock tick resets when switching experiments
- No external dependencies for circuit simulation
- Fully keyboard accessible with ARIA labels

## Future Enhancements (Not in MVP)
- Truth table display panel
- State diagram visualization
- Waveform viewer for signal timing
- Step-by-step execution mode
- Save/load circuit configurations
- Custom circuit builder
- Educational hints and tutorials
