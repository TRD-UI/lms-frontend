import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SERIES, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_STYLE } from "@/lib/chart-palette";
import { cn } from "@/lib/utils";

export interface DonutSlice {
    label: string;
    value: number;
}

interface DonutChartProps {
    data: DonutSlice[];
    /** Big number in the hole. */
    centerValue: string;
    centerLabel?: string;
    formatValue?: (value: number) => string;
    height?: number;
    className?: string;
}

/**
 * Share-of-total donut.
 *
 * A donut has no position channel, so identity rests on colour — which is why
 * each slice also gets a written label in the list beneath, and the tooltip
 * names the slice. Categorical slots are assigned in fixed order.
 */
export function DonutChart({
    data,
    centerValue,
    centerLabel,
    formatValue = (v) => v.toLocaleString(),
    height = 190,
    className,
}: DonutChartProps) {
    const [active, setActive] = useState<number | null>(null);
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="relative w-full" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="label"
                            innerRadius="62%"
                            outerRadius="92%"
                            paddingAngle={2}
                            stroke="var(--chart-background)"
                            strokeWidth={2}
                            startAngle={90}
                            endAngle={-270}
                            onMouseEnter={(_, i) => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                        >
                            {data.map((slice, i) => (
                                <Cell
                                    key={slice.label}
                                    fill={SERIES[i % SERIES.length]}
                                    opacity={active === null || active === i ? 1 : 0.35}
                                    className="transition-opacity duration-200"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={TOOLTIP_LABEL_STYLE}
                            itemStyle={TOOLTIP_ITEM_STYLE}
                            formatter={(value: number, name: string) => [
                                `${formatValue(value)} · ${Math.round((value / total) * 100)}%`,
                                name,
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Centre readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-medium tracking-tight text-slate-800 tabular-nums">
                        {centerValue}
                    </span>
                    {centerLabel && (
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                            {centerLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Labelled breakdown — keeps identity off colour-alone */}
            <ul className="mt-3 space-y-1.5">
                {data.map((slice, i) => (
                    <li
                        key={slice.label}
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(null)}
                        className="flex items-center gap-2 text-[11px] font-medium"
                    >
                        <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: SERIES[i % SERIES.length] }}
                        />
                        <span className="text-slate-500 truncate flex-1">{slice.label}</span>
                        <span className="text-slate-900 tabular-nums shrink-0">
                            {Math.round((slice.value / total) * 100)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
