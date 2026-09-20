"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import { SERIES } from "@/lib/chart-palette";

export interface PieDatum {
    /** Display label — also what the legend and centre read out. */
    label: string;
    value: number;
    /** Overrides the categorical slot for this slice. */
    color?: string;
}

interface PieContextValue {
    data: PieDatum[];
    total: number;
    size: number;
    innerRadius: number;
    hoveredIndex: number | null;
    setHovered: (index: number | null) => void;
    /** Start and sweep angle, in degrees, for each slice. */
    arcs: { start: number; sweep: number }[];
    colorAt: (index: number) => string;
}

const PieContext = createContext<PieContextValue | null>(null);

export function usePie() {
    const ctx = useContext(PieContext);
    if (!ctx) throw new Error("Pie components must be rendered inside <PieChart>");
    return ctx;
}

export function PieProvider({
    data,
    size,
    innerRadius,
    hoveredIndex,
    onHoverChange,
    children,
}: {
    data: PieDatum[];
    size: number;
    innerRadius: number;
    hoveredIndex: number | null;
    onHoverChange: (index: number | null) => void;
    children: ReactNode;
}) {
    const value = useMemo<PieContextValue>(() => {
        const total = data.reduce((s, d) => s + d.value, 0);

        // Twelve o'clock, clockwise — the reading order people expect.
        let cursor = -90;
        const arcs = data.map((d) => {
            const sweep = total === 0 ? 0 : (d.value / total) * 360;
            const arc = { start: cursor, sweep };
            cursor += sweep;
            return arc;
        });

        return {
            data,
            total,
            size,
            innerRadius,
            hoveredIndex,
            setHovered: onHoverChange,
            arcs,
            // Categorical slots are assigned in order and never cycled past five.
            colorAt: (i: number) => data[i]?.color ?? SERIES[i % SERIES.length],
        };
    }, [data, size, innerRadius, hoveredIndex, onHoverChange]);

    return <PieContext.Provider value={value}>{children}</PieContext.Provider>;
}
