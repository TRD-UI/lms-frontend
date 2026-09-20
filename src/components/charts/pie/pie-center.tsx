"use client";

import { usePie } from "./pie-context";

export interface PieCenterProps {
    /** Shown when nothing is hovered. */
    defaultLabel?: string;
    /** Overrides the total shown when nothing is hovered. */
    defaultValue?: string;
    formatValue?: (value: number) => string;
}

/**
 * The readout in the hole: the total at rest, the hovered slice while hovering.
 * Rendered as SVG text so it scales with the chart.
 */
export function PieCenter({
    defaultLabel,
    defaultValue,
    formatValue = (v) => v.toLocaleString(),
}: PieCenterProps) {
    const { data, total, size, hoveredIndex } = usePie();
    const active = hoveredIndex !== null ? data[hoveredIndex] : null;

    const value = active ? formatValue(active.value) : defaultValue ?? formatValue(total);
    const label = active ? active.label : defaultLabel;

    return (
        <g style={{ pointerEvents: "none" }}>
            <text
                x={size / 2}
                y={size / 2 - (label ? 2 : -6)}
                textAnchor="middle"
                className="fill-slate-900 font-medium tabular-nums"
                style={{ fontSize: size * 0.16 }}
            >
                {value}
            </text>
            {label && (
                <text
                    x={size / 2}
                    y={size / 2 + size * 0.11}
                    textAnchor="middle"
                    className="fill-slate-400 font-medium"
                    style={{ fontSize: size * 0.068 }}
                >
                    {label.length > 18 ? `${label.slice(0, 17)}…` : label}
                </text>
            )}
        </g>
    );
}
