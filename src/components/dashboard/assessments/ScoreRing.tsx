import { cn } from "@/lib/utils";

interface ScoreRingProps {
    /** 0–100. */
    score: number;
    /** Draws a tick mark on the ring at the pass threshold. */
    passingScore?: number;
    passed: boolean;
    size?: number;
    className?: string;
}

/**
 * Radial score gauge for the results screen.
 *
 * Pass/fail is carried by the label and the ✓/✗ glyph as well as the colour, so
 * the outcome never depends on colour alone.
 */
export function ScoreRing({ score, passingScore, passed, size = 168, className }: ScoreRingProps) {
    const stroke = 12;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, score));
    const dash = (clamped / 100) * circumference;

    const color = passed ? "#1baf7a" : "#e34948";

    // Threshold tick, drawn on the ring at the passing score.
    const thresholdAngle = passingScore != null ? (passingScore / 100) * 360 - 90 : null;
    const tickInner = radius - stroke / 2 - 2;
    const tickOuter = radius + stroke / 2 + 2;
    const center = size / 2;
    const rad = thresholdAngle != null ? (thresholdAngle * Math.PI) / 180 : 0;

    return (
        <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Score ${clamped} percent`}>
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={stroke}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    className="transition-[stroke-dasharray] duration-1000 ease-out"
                />
                {thresholdAngle != null && (
                    <line
                        x1={center + tickInner * Math.cos(rad)}
                        y1={center + tickInner * Math.sin(rad)}
                        x2={center + tickOuter * Math.cos(rad)}
                        y2={center + tickOuter * Math.sin(rad)}
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-medium tracking-tight text-slate-900 tabular-nums">
                    {clamped}%
                </span>
                {/* On a fail the threshold is carried here, so the summary above
                    does not need a sentence restating it. */}
                <span
                    className={cn(
                        "text-[10px] mt-0.5",
                        passed ? "tracking-widest text-emerald-600" : "tracking-wide text-red-500"
                    )}
                >
                    {passed
                        ? "Passed"
                        : `Not passed${passingScore != null ? ` (${passingScore}%)` : ""}`}
                </span>
            </div>
        </div>
    );
}
