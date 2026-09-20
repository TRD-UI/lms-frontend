"use client";

import { usePie } from "./pie-context";

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Annular sector path — an arc out, an arc back, closed. */
function arcPath(
    cx: number,
    cy: number,
    outer: number,
    inner: number,
    start: number,
    sweep: number
) {
    // A full circle cannot be drawn as one arc; nudge it just short.
    const end = start + Math.min(sweep, 359.999);
    const large = sweep > 180 ? 1 : 0;

    const p = (r: number, a: number) => [cx + r * Math.cos(toRad(a)), cy + r * Math.sin(toRad(a))];
    const [x1, y1] = p(outer, start);
    const [x2, y2] = p(outer, end);

    if (inner <= 0) {
        return `M ${cx} ${cy} L ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} Z`;
    }

    const [x3, y3] = p(inner, end);
    const [x4, y4] = p(inner, start);
    return [
        `M ${x1} ${y1}`,
        `A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4}`,
        "Z",
    ].join(" ");
}

export function PieSlice({ index }: { index: number }) {
    const { data, arcs, size, innerRadius, hoveredIndex, setHovered, colorAt } = usePie();
    const datum = data[index];
    const arc = arcs[index];
    if (!datum || !arc || arc.sweep === 0) return null;

    const cx = size / 2;
    const cy = size / 2;
    const isHovered = hoveredIndex === index;
    const dimmed = hoveredIndex !== null && !isHovered;

    // Hovering grows the slice outward rather than moving it, so the shared
    // centre stays put and the shape is still comparable.
    const outer = size / 2 - 2 + (isHovered ? 3 : 0);

    return (
        <path
            d={arcPath(cx, cy, outer, innerRadius, arc.start, arc.sweep)}
            fill={colorAt(index)}
            stroke="var(--chart-background, #fff)"
            strokeWidth={2}
            opacity={dimmed ? 0.35 : 1}
            className="transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setHovered(index)}
            onFocus={() => setHovered(index)}
            tabIndex={0}
            role="graphics-symbol"
            aria-label={`${datum.label}: ${datum.value}`}
        />
    );
}
