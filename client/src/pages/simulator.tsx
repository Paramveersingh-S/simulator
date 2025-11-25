import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { experiments, type Experiment, type CircuitState, type LayoutMetrics } from "@/lib/experiments";
import { Cpu, Zap, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function Simulator() {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment>(experiments[0]);
  const [inputValues, setInputValues] = useState<Record<string, boolean>>({});
  const [outputValues, setOutputValues] = useState<Record<string, boolean>>({});
  const [clockTick, setClockTick] = useState(0);
  const [clockRunning, setClockRunning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [layoutMetrics, setLayoutMetrics] = useState<LayoutMetrics | null>(null);
  
  const circuitStateRef = useRef<CircuitState>({});
  const previousClockRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const outputRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const chipRef = useRef<HTMLDivElement>(null);
  const updateLayoutTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const initialInputs: Record<string, boolean> = {};
    selectedExperiment.inputs.forEach((input) => {
      initialInputs[input.id] = input.value;
    });
    setInputValues(initialInputs);
    setClockTick(0);
    setClockRunning(false);
    circuitStateRef.current = selectedExperiment.initialState?.() || {};
    previousClockRef.current = 0;
    inputRefs.current.clear();
    outputRefs.current.clear();
  }, [selectedExperiment]);

  useEffect(() => {
    const clockEdge = selectedExperiment.hasClock && clockTick > previousClockRef.current;
    previousClockRef.current = clockTick;
    
    const result = selectedExperiment.logic(inputValues, circuitStateRef.current, clockEdge);
    setOutputValues(result.outputs);
    circuitStateRef.current = result.newState;
  }, [inputValues, clockTick, selectedExperiment]);

  useEffect(() => {
    if (selectedExperiment.hasClock && clockRunning) {
      const interval = setInterval(() => {
        setClockTick((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedExperiment.hasClock, clockRunning]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const updateLayout = useCallback(() => {
    if (!boardRef.current || !chipRef.current) return;

    requestAnimationFrame(() => {
      if (!boardRef.current || !chipRef.current) return;

      const boardRect = boardRef.current.getBoundingClientRect();
      const chipRect = chipRef.current.getBoundingClientRect();

      const inputPositions = Array.from({ length: selectedExperiment.inputs.length }, (_, idx) => {
        const ref = inputRefs.current.get(idx);
        if (!ref) return { x: 0, y: 0 };
        const rect = ref.getBoundingClientRect();
        return {
          x: rect.right - boardRect.left,
          y: rect.top + rect.height / 2 - boardRect.top,
        };
      });

      const outputPositions = Array.from({ length: selectedExperiment.outputs.length }, (_, idx) => {
        const ref = outputRefs.current.get(idx);
        if (!ref) return { x: 0, y: 0 };
        const rect = ref.getBoundingClientRect();
        return {
          x: rect.left - boardRect.left,
          y: rect.top + rect.height / 2 - boardRect.top,
        };
      });

      setLayoutMetrics({
        inputPositions,
        outputPositions,
        chipLeft: chipRect.left - boardRect.left,
        chipRight: chipRect.right - boardRect.left,
        chipCenter: chipRect.left + chipRect.width / 2 - boardRect.left,
      });
    });
  }, [selectedExperiment.inputs.length, selectedExperiment.outputs.length]);

  useLayoutEffect(() => {
    updateLayout();
  }, [updateLayout, selectedExperiment, inputValues, outputValues]);

  useEffect(() => {
    const handleResize = () => {
      if (updateLayoutTimeoutRef.current !== null) {
        clearTimeout(updateLayoutTimeoutRef.current);
      }
      updateLayoutTimeoutRef.current = window.setTimeout(updateLayout, 100);
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (updateLayoutTimeoutRef.current !== null) {
        clearTimeout(updateLayoutTimeoutRef.current);
      }
    };
  }, [updateLayout]);

  const setInputRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      inputRefs.current.set(index, el);
    } else {
      inputRefs.current.delete(index);
    }
  }, []);

  const setOutputRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      outputRefs.current.set(index, el);
    } else {
      outputRefs.current.delete(index);
    }
  }, []);

  const toggleInput = (id: string) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const wires = layoutMetrics ? selectedExperiment.getWires(inputValues, outputValues, layoutMetrics) : [];

  const getBinaryString = (outputs: Record<string, boolean>) => {
    return Object.entries(outputs)
      .map(([_, value]) => (value ? "1" : "0"))
      .join("");
  };

  const getHexValue = (outputs: Record<string, boolean>) => {
    const binary = getBinaryString(outputs);
    const decimal = parseInt(binary, 2) || 0;
    return decimal.toString(16).toUpperCase().padStart(Math.ceil(binary.length / 4), "0");
  };

  const maxRows = Math.max(selectedExperiment.inputs.length, selectedExperiment.outputs.length);

  const ExperimentList = () => (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold text-slate-100">Circuit Simulator</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-testid="button-theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
      <div className="space-y-1">
        {experiments.map((exp) => (
          <button
            key={exp.id}
            onClick={() => {
              setSelectedExperiment(exp);
              setMobileMenuOpen(false);
            }}
            data-testid={`button-experiment-${exp.id}`}
            className={`w-full text-left px-4 py-3 rounded-md transition-all ${
              selectedExperiment.id === exp.id
                ? "bg-emerald-500/20 border-l-4 border-emerald-400 text-slate-100"
                : "bg-slate-800/50 text-slate-300 hover-elevate"
            }`}
          >
            <div className="font-semibold text-sm">{exp.name}</div>
            <div className="text-xs text-slate-400 mt-1">{exp.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900">
      {/* Mobile Menu */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-emerald-400" />
          <h1 className="text-lg font-bold text-slate-100">Circuit Simulator</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle-mobile"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-slate-800 border-slate-700 p-0">
              <SheetTitle className="sr-only">Experiment Selection</SheetTitle>
              <SheetDescription className="sr-only">
                Choose from 10 digital logic circuit experiments
              </SheetDescription>
              <ExperimentList />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 overflow-y-auto">
        <ExperimentList />
      </aside>

      {/* Main Circuit Board */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Card className="circuit-board p-6 md:p-8 rounded-lg">
            {/* Experiment Title */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2" data-testid="text-experiment-name">
                {selectedExperiment.name}
              </h2>
              <p className="text-sm text-slate-400">{selectedExperiment.description}</p>
            </div>

            {/* Clock Control for Sequential Circuits */}
            {selectedExperiment.hasClock && (
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => setClockRunning(!clockRunning)}
                  data-testid="button-clock-toggle"
                  className={`${
                    clockRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-700 hover:bg-slate-600"
                  } text-white`}
                >
                  <Zap className={`w-4 h-4 mr-2 ${clockRunning ? "clock-pulse" : ""}`} />
                  Clock: {clockRunning ? "Running" : "Stopped"}
                </Button>
                <div className="text-sm text-slate-400 font-mono">
                  Tick: <span data-testid="text-clock-tick">{clockTick}</span>
                </div>
              </div>
            )}

            {/* Circuit Layout - Grid Based */}
            <div ref={boardRef} className="relative min-h-[400px]">
              {/* SVG Layer for Wires - Orthogonal Polylines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {wires.map((wire, idx) => (
                  <polyline
                    key={idx}
                    points={wire.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={wire.active ? "#34d399" : "#475569"}
                    strokeWidth={wire.active ? 4 : 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={wire.active ? "url(#glow)" : "none"}
                    style={{
                      transition: `stroke ${200 + (wire.delay || 0) * 1000}ms ease, stroke-width 200ms ease`,
                      transitionDelay: `${(wire.delay || 0) * 1000}ms`,
                    }}
                  />
                ))}
              </svg>

              {/* Grid Layout: 3 columns - inputs, chip, outputs */}
              <div 
                className="grid gap-8 items-center"
                style={{
                  gridTemplateColumns: "auto 1fr auto",
                  gridTemplateRows: `repeat(${maxRows}, minmax(60px, auto))`,
                }}
              >
                {/* Input Column */}
                <div
                  className="flex flex-col justify-around"
                  style={{
                    gridColumn: 1,
                    gridRow: `1 / ${maxRows + 1}`,
                  }}
                >
                  {selectedExperiment.inputs.map((input, idx) => (
                    <div
                      key={input.id}
                      ref={setInputRef(idx)}
                      className="flex items-center gap-3 justify-end"
                    >
                      <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{input.label}</div>
                        <button
                          onClick={() => toggleInput(input.id)}
                          data-testid={`switch-${input.id}`}
                          className={`w-8 h-12 md:w-10 md:h-16 rounded transition-all ${
                            inputValues[input.id] ? "switch-on" : "switch-off"
                          }`}
                          aria-label={`Toggle ${input.label}`}
                        >
                          <div
                            className={`w-6 h-6 md:w-8 md:h-8 rounded-full mx-auto transition-transform ${
                              inputValues[input.id]
                                ? "bg-white transform translate-y-1"
                                : "bg-slate-700 transform -translate-y-1"
                            }`}
                          />
                        </button>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                          {inputValues[input.id] ? "1" : "0"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* IC Chip Column - Centered */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    gridColumn: 2,
                    gridRow: `1 / ${maxRows + 1}`,
                  }}
                >
                  <div ref={chipRef} className="relative ic-chip w-32 md:w-48 h-32 md:h-40 rounded-md flex items-center justify-center">
                    {/* Pin indicators on left */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around -ml-2">
                      {selectedExperiment.inputs.slice(0, 8).map((input, idx) => (
                        <div key={input.id} className="flex items-center gap-1">
                          <div className="w-2 h-1 bg-slate-600 rounded-sm"></div>
                          <div className="text-[8px] text-slate-500">{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                    {/* Pin indicators on right */}
                    <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around -mr-2">
                      {selectedExperiment.outputs.slice(0, 8).map((output, idx) => (
                        <div key={output.id} className="flex items-center gap-1">
                          <div className="text-[8px] text-slate-500">{idx + 9}</div>
                          <div className="w-2 h-1 bg-slate-600 rounded-sm"></div>
                        </div>
                      ))}
                    </div>
                    {/* Chip label */}
                    <div className="text-center">
                      <Cpu className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-emerald-400" />
                      <div className="text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                        Logic IC
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        74HC{selectedExperiment.id.slice(0, 3).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Output Column */}
                <div
                  className="flex flex-col justify-around"
                  style={{
                    gridColumn: 3,
                    gridRow: `1 / ${maxRows + 1}`,
                  }}
                >
                  {selectedExperiment.outputs.map((output, idx) => (
                    <div
                      key={output.id}
                      ref={setOutputRef(idx)}
                      className="flex items-center gap-3"
                    >
                      <div className="text-left">
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{output.label}</div>
                        <div
                          data-testid={`led-${output.id}`}
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-full transition-all ${
                            outputValues[output.id] ? "led-glow-on bg-emerald-400" : "led-glow-off bg-slate-700"
                          }`}
                          aria-label={`LED ${output.label}`}
                        >
                          {outputValues[output.id] && (
                            <div className="w-full h-full rounded-full bg-gradient-radial from-emerald-200 to-emerald-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                          {outputValues[output.id] ? "1" : "0"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Status Display with Binary/Hex */}
            <div className="mt-8 p-4 bg-slate-800/80 backdrop-blur-sm rounded-md border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Circuit Status</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-sm">
                <div>
                  <span className="text-slate-500">Inputs Active:</span>{" "}
                  <span className="text-emerald-400" data-testid="text-inputs-active">
                    {Object.values(inputValues).filter(Boolean).length}/{selectedExperiment.inputs.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Outputs Active:</span>{" "}
                  <span className="text-emerald-400" data-testid="text-outputs-active">
                    {Object.values(outputValues).filter(Boolean).length}/{selectedExperiment.outputs.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Binary:</span>{" "}
                  <span className="text-slate-300" data-testid="text-binary-output">
                    0b{getBinaryString(outputValues)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Hex:</span>{" "}
                  <span className="text-slate-300" data-testid="text-hex-output">
                    0x{getHexValue(outputValues)}
                  </span>
                </div>
                {selectedExperiment.hasClock && (
                  <>
                    <div>
                      <span className="text-slate-500">Clock:</span>{" "}
                      <span className="text-amber-400">{clockRunning ? "Active" : "Idle"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cycle:</span>{" "}
                      <span className="text-slate-300">{clockTick}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
