# Digital Logic Circuit Simulator - Design Guidelines

## Design Approach: Custom Educational Skeuomorphism
This is a specialized educational tool requiring realistic circuit board visualization. The design blends functional utility with engaging skeuomorphic aesthetics to create an immersive learning experience.

## Core Visual Identity

**Color Palette:**
- Primary Background: Slate-900 (#0f172a) - simulates circuit board depth
- Circuit Board Surface: Slate-800 (#1e293b) with subtle texture
- Active/HIGH State: Emerald-400 (#34d399) for glowing signals
- Inactive/LOW State: Slate-600 (#475569)
- IC Chip: Slate-700 (#334155) with gradient depth
- Text/Labels: Slate-100 (#f1f5f9) for high contrast
- Accent (Clock/Warnings): Amber-500 (#f59e0b)

**Depth & Dimensionality:**
All physical components (switches, LEDs, IC chips) must have 3D appearance:
- Multi-layered shadows (inset + drop shadows)
- Subtle gradients simulating light reflection
- Border highlights on top edges for depth
- Component elevation: switches (raised), LEDs (recessed), chips (mounted)

## Typography

**Font System:**
- Primary: 'JetBrains Mono' or 'Fira Code' (monospace for technical accuracy)
- Fallback: system monospace
- Sizes: Headings (text-lg to text-2xl), Labels (text-xs to text-sm), Body (text-sm)

**Text Hierarchy:**
- Experiment Title: Bold, text-xl, Slate-100
- Component Labels: Uppercase, text-xs, tracking-wide, Slate-300
- Input/Output IDs: Monospace, text-xs, Slate-400
- Status Indicators: Semibold, text-sm, conditional colors

## Layout System

**Spacing Primitives:**
Use Tailwind units: 2, 4, 6, 8, 12, 16 (p-4, gap-6, m-8, etc.)
- Component padding: p-4 to p-6
- Section gaps: gap-8 to gap-12
- Circuit board margin: m-8 (desktop), m-4 (mobile)

**Responsive Breakpoints:**

Mobile (default, <768px):
- Vertical stack layout
- Experiment selector: sticky header dropdown or top section
- Circuit board: full-width, horizontally scrollable if needed
- Component size: scaled down (switches h-12, LEDs h-8)

Desktop (md: 768px+):
- Split-screen: sidebar (w-80) + simulator (flex-1)
- Fixed sidebar with experiment list
- Circuit board: centered, max-w-5xl
- Component size: full scale (switches h-16, LEDs h-10)

## Component Library

### 1. Sidebar/Experiment Selector
- Desktop: Fixed left sidebar (w-80), dark gradient background
- Mobile: Collapsible dropdown or horizontal tabs at top
- Each experiment: Card with icon, title, subtle hover glow
- Active experiment: Emerald-500 left border (border-l-4)

### 2. Circuit Board Canvas
- Container: Rounded-lg, slate-800 background with circuit trace texture
- Padding: p-8 (desktop), p-4 (mobile)
- Grid layout for component positioning
- SVG overlay layer for wires (z-10)

### 3. DIP Switches (Inputs)
- Visual: Toggle switches with physical appearance
- OFF state: Slate-600, inset shadow
- ON state: Emerald-400, raised shadow, glow effect
- Size: h-16 w-10 (desktop), h-12 w-8 (mobile)
- Label: Above switch, uppercase, text-xs

### 4. LEDs (Outputs)
- Visual: Circular with recessed appearance
- OFF state: Slate-700, dark center
- ON state: Bright emerald center with radial glow (box-shadow blur)
- Size: h-10 w-10 (desktop), h-8 w-8 (mobile)
- Multiple glow layers for realistic light emission

### 5. IC Chip Component
- Visual: Rectangular with pin notches, centered in board
- Background: Linear gradient (slate-700 to slate-600)
- Border: Dual borders simulating plastic casing
- Label: Chip name centered, text-sm, semibold
- Size: Varies by experiment (min w-40 h-32)
- Pin indicators: Small circles on edges

### 6. Wires (SVG Connections)
- Static state: Slate-600, stroke-width: 2-3
- Active state: Emerald-400, stroke-width: 3-4, drop-shadow glow
- Path style: Orthogonal routing (right angles, no curves)
- Animation: Subtle pulse on signal transition (0.3s ease)

### 7. Clock Signal Indicator
- Pulsing icon/switch that auto-toggles
- Amber-500 accent color for visibility
- Position: Near sequential circuit components
- Animation: 1s interval fade in/out

### 8. Status Display Panel
- Location: Top-right or bottom of board
- Shows: Current state, output values in binary/hex
- Background: Slate-800/80 with backdrop blur
- Font: Monospace, text-sm

## Interaction Patterns

**Input Controls:**
- Click switches to toggle (instant visual feedback)
- Disabled state during clock cycles (opacity-50)
- Clear active/hover states (scale-105 on hover)

**Signal Flow Animation:**
- Wire color transition: 200ms ease
- Glow effect: Smooth brightness increase
- Sequential propagation: Slight delay cascade for realism

**Responsive Interactions:**
- Mobile: Larger touch targets (min 44px)
- Desktop: Hover previews, tooltips on components

## Accessibility

- High contrast ratios (WCAG AA minimum)
- All interactive elements keyboard accessible
- ARIA labels for switches, LEDs, and logic states
- Visual indicators paired with text labels

## Visual Enhancements

**Circuit Board Texture:**
- Subtle grid pattern overlay on slate-800
- Faint copper trace lines (decorative, not functional)

**Component Realism:**
- Micro-shadows for depth perception
- Edge highlights simulating light source from top-left
- Gradients for dimensional appearance

**Performance:**
- CSS transforms for animations (hardware accelerated)
- Minimal reflows, use transform/opacity
- Debounced clock signals

## Images
No hero images or photography needed - this is a functional simulator. All visuals are CSS/SVG-generated components to maintain the technical, educational aesthetic.