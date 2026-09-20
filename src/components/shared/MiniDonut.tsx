import { cn } from "@/lib/utils";

interface MiniDonutProps {
    /** 0–100. */
    value: number;
    size?: number;
    stroke?: number;
    /** Ring colour. Defaults to the brand. */
    color?: string;
    /** Hidden when the ring is too small to read. */
    showLabel?: boolean;
    label?: string;
    className?: string;
}

/**
 * A percentage as a ring with the number in the middle.
 *
 * Deliberately minimal — no axis, no legend, no tooltip. It reads at table-row
 * size, which a bar with its own label does not.
 */
export function MiniDonut({
    value,
    size = 44,
    stroke = 5,
    color = "hsl(var(--primary))",
    showLabel = true,
    label,
    className,
}: MiniDonutProps) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dash = (clamped / 100) * circumference;

    return (
        <div
            className={cn("relative shrink-0", className)}
            style={{ width: size, height: size }}
            role="img"
            aria-label={`${clamped}%${label ? ` ${label}` : ""}`}
        >
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    className="transition-[stroke-dasharray] duration-500 ease-out"
                />
            </svg>

            {showLabel && (
                <span
                    className="absolute inset-0 flex items-center justify-center font-medium text-slate-700 tabular-nums"
                    style={{ fontSize: size * 0.27 }}
                >
                    {clamped}
                    <span style={{ fontSize: size * 0.18 }} className="text-slate-400">
                        %
                    </span>
                </span>
            )}
        </div>
    );
}
