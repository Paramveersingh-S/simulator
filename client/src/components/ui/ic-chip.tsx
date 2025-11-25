import { useEffect, useRef } from 'react';
import { getICPackage, calculatePinPositions, type PinPosition, type ICPackage } from '@/lib/ic-pins';

interface ICChipProps {
    partNumber: string;
    onPinPositionsCalculated?: (positions: Map<number, PinPosition>) => void;
    className?: string;
}

export function ICChip({ partNumber, onPinPositionsCalculated, className = '' }: ICChipProps) {
    const chipRef = useRef<HTMLDivElement>(null);
    const ic = getICPackage(partNumber);

    useEffect(() => {
        if (!chipRef.current || !ic) return;

        const updatePinPositions = () => {
            if (!chipRef.current) return;
            const rect = chipRef.current.getBoundingClientRect();
            const parent = chipRef.current.offsetParent?.getBoundingClientRect();

            if (!parent) return;

            const chipX = rect.left - parent.left;
            const chipY = rect.top - parent.top;
            const chipWidth = rect.width;
            const chipHeight = rect.height;

            const positions = calculatePinPositions(ic, chipX, chipY, chipWidth, chipHeight);
            const posMap = new Map(positions.map(p => [p.number, p]));

            onPinPositionsCalculated?.(posMap);
        };

        // Update positions after render
        const timeoutId = setTimeout(updatePinPositions, 0);

        // Update on resize
        const observer = new ResizeObserver(updatePinPositions);
        observer.observe(chipRef.current);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [ic, onPinPositionsCalculated]);

    if (!ic) {
        return (
            <div className={`ic-chip ${className}`}>
                <div className="text-xs text-red-400">Unknown IC: {partNumber}</div>
            </div>
        );
    }

    const pinsPerSide = ic.pinCount / 2;
    const leftPins = ic.pins.filter(p => p.side === 'left').sort((a, b) => a.position - b.position);
    const rightPins = ic.pins.filter(p => p.side === 'right').sort((a, b) => a.position - b.position);

    return (
        <div ref={chipRef} className={`relative ${className}`}>
            {/* IC Chip Body */}
            <div className="ic-chip-body relative w-32 md:w-48 h-32 md:h-40 rounded-md flex items-center justify-center">
                {/* Notch indicator for pin 1 (top center) */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-slate-900 rounded-b-full border-t-0"></div>

                {/* Left side pins */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around -ml-2">
                    {leftPins.map((pin) => (
                        <div key={pin.number} className="flex items-center gap-1 group">
                            <div
                                className={`ic-pin w-2 h-1 rounded-sm transition-all ${pin.type === 'power' ? 'bg-red-400' :
                                        pin.type === 'ground' ? 'bg-blue-400' :
                                            pin.type === 'clock' ? 'bg-amber-400' :
                                                'bg-slate-400'
                                    }`}
                                data-pin={pin.number}
                                title={`Pin ${pin.number}: ${pin.label}`}
                            ></div>
                            <div className="text-[8px] md:text-[10px] text-slate-500 font-mono select-none">{pin.number}</div>
                            <div className="text-[7px] md:text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity absolute left-6 whitespace-nowrap bg-slate-800 px-1 rounded">
                                {pin.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right side pins */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around -mr-2">
                    {rightPins.map((pin) => (
                        <div key={pin.number} className="flex items-center gap-1 flex-row-reverse group">
                            <div
                                className={`ic-pin w-2 h-1 rounded-sm transition-all ${pin.type === 'power' ? 'bg-red-400' :
                                        pin.type === 'ground' ? 'bg-blue-400' :
                                            pin.type === 'clock' ? 'bg-amber-400' :
                                                'bg-slate-400'
                                    }`}
                                data-pin={pin.number}
                                title={`Pin ${pin.number}: ${pin.label}`}
                            ></div>
                            <div className="text-[8px] md:text-[10px] text-slate-500 font-mono select-none">{pin.number}</div>
                            <div className="text-[7px] md:text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity absolute right-6 whitespace-nowrap bg-slate-800 px-1 rounded">
                                {pin.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chip label and info */}
                <div className="text-center z-10 pointer-events-none">
                    <div className="text-xs md:text-sm font-bold text-slate-300 font-mono tracking-wider">
                        {ic.partNumber}
                    </div>
                    <div className="text-[9px] md:text-[11px] text-slate-500 mt-1">
                        {ic.name}
                    </div>
                    <div className="text-[8px] text-slate-600 mt-1">
                        {ic.pinCount}-PIN DIP
                    </div>
                </div>
            </div>
        </div>
    );
}
