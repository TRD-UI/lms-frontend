"use client";

import { cn } from "@/lib/utils";
import { PieProvider, type PieDatum } from "./pie-context";

export interface PieChartProps {
    data: PieDatum[];
    /** Controlled hover, shared with the legend so the two highlight together. */
    hoveredIndex?: number | null;
    onHoverChange?: (index: number | null) => void;
    /** Hole radius in px. 0 renders a full pie. */
    innerRadius?: number;
    size?: number;
    className?: string;
    children: React.ReactNode;
}

/**
 * Share-of-total pie.
 *
 * A pie has no position channel, so identity rests on colour alone — pair it
 * with a <Legend> using the same `hoveredIndex` so hovering either highlights
 * both, and keep the slice count low.
 */
export function PieChart({
    data,
    hoveredIndex = null,
    onHoverChange = () => undefined,
    innerRadius = 0,
    size = 180,
    className,
    children,
}: PieChartProps) {
    return (
        <PieProvider
            data={data}
            size={size}
            innerRadius={innerRadius}
            hoveredIndex={hoveredIndex}
            onHoverChange={onHoverChange}
        >
            <div
                className={cn("relative shrink-0", className)}
                style={{ width: size, height: size }}
                onMouseLeave={() => onHoverChange(null)}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    role="img"
                    aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}
                >
                    {children}
                </svg>
            </div>
        </PieProvider>
    );
}
