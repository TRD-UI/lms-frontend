import { useState } from "react";
import type { RetentionCohort } from "@/data/analytics";
import { SEQUENTIAL, sequentialStep } from "@/lib/chart-palette";
import { cn } from "@/lib/utils";

interface RetentionHeatGridProps {
    cohorts: RetentionCohort[];
    weekLabels?: string[];
}

/**
 * Cohort retention as a sequential heat grid.
 *
 * Magnitude is encoded with a single-hue ramp (light = low), and every cell also
 * carries its number — so the value is readable without relying on colour.
 */
export function RetentionHeatGrid({ cohorts, weekLabels }: RetentionHeatGridProps) {
    const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
    const weeks = weekLabels ?? cohorts[0]?.weeks.map((_, i) => `W${i}`) ?? [];

    return (
        <div className="overflow-x-auto">
            {/* `table-fixed` stops the label column absorbing the row's slack —
              * without it the cells get pushed to the right edge. */}
            <table className="w-full table-fixed border-separate border-spacing-1 min-w-[440px]">
                <caption className="sr-only">
                    Percentage of each cohort still active by week since enrolment
                </caption>
                <colgroup>
                    <col className="w-[132px]" />
                </colgroup>
                <thead>
                    <tr>
                        <th className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest pb-1 pr-2">
                            Cohort
                        </th>
                        {weeks.map((w) => (
                            <th
                                key={w}
                                scope="col"
                                className="text-[10px] font-medium text-slate-400 uppercase tracking-widest pb-1 text-center"
                            >
                                {w}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {cohorts.map((cohort, row) => (
                        <tr key={cohort.cohort}>
                            <th
                                scope="row"
                                className="text-left text-[11px] font-medium text-slate-600 whitespace-nowrap pr-2"
                            >
                                {cohort.cohort}
                                <span className="text-slate-300 ml-1.5 font-normal tabular-nums">
                                    {cohort.size}
                                </span>
                            </th>
                            {cohort.weeks.map((value, col) => {
                                // 0 marks a week the cohort has not reached yet.
                                const pending = value === 0;
                                const isHovered = hover?.row === row && hover?.col === col;
                                const bg = pending ? "transparent" : sequentialStep(value / 100);
                                // Ink flips to white on the darker half of the ramp.
                                const dark = !pending && value >= 72;

                                return (
                                    <td key={col} className="p-0">
                                        <div
                                            onMouseEnter={() => setHover({ row, col })}
                                            onMouseLeave={() => setHover(null)}
                                            title={
                                                pending
                                                    ? `${cohort.cohort} — ${weeks[col]}: not reached yet`
                                                    : `${cohort.cohort} — ${weeks[col]}: ${value}% retained`
                                            }
                                            className={cn(
                                                "h-9 rounded-lg flex items-center justify-center text-[11px] font-medium tabular-nums transition-all cursor-default",
                                                pending && "border border-dashed border-slate-200 text-slate-300",
                                                isHovered && "ring-2 ring-slate-900/20 scale-[1.06]"
                                            )}
                                            style={
                                                pending
                                                    ? undefined
                                                    : { backgroundColor: bg, color: dark ? "#ffffff" : "#0f172a" }
                                            }
                                        >
                                            {pending ? "—" : value}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Ramp key */}
            <div className="flex items-center gap-2 mt-4 pl-1">
                <span className="text-[10px] font-medium text-slate-400">0%</span>
                <div className="flex gap-0.5" aria-hidden>
                    {SEQUENTIAL.map((c) => (
                        <span key={c} className="h-2.5 w-6 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                </div>
                <span className="text-[10px] font-medium text-slate-400">100% retained</span>
            </div>
        </div>
    );
}
