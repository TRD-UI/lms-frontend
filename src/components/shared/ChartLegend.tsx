import { Legend, LegendItem, LegendLabel, LegendMarker } from "@/components/charts/legend";
import { cn } from "@/lib/utils";

export interface ChartLegendEntry {
    label: string;
    color: string;
}

interface ChartLegendProps {
    items: ChartLegendEntry[];
    /** Optional hover sync with the chart (used by the funnel). */
    hoveredIndex?: number | null;
    onHoverChange?: (index: number | null) => void;
    className?: string;
}

/**
 * Single-line chart legend: marker + label only.
 *
 * Values are deliberately omitted — the chart already carries them, so
 * repeating them here is noise. Identity stays off colour-alone because every
 * series keeps a written label.
 */
export function ChartLegend({ items, hoveredIndex, onHoverChange, className }: ChartLegendProps) {
    return (
        <Legend
            // `value` is required by the legend model but never rendered here.
            items={items.map((i) => ({ ...i, value: 0 }))}
            hoveredIndex={hoveredIndex}
            onHoverChange={onHoverChange}
            // `flex-row` is explicit: the base Legend ships `flex-col`, and
            // tailwind-merge only replaces it when the same property is set.
            className={cn("flex flex-row flex-wrap items-center gap-x-4 gap-y-1", className)}
        >
            <LegendItem className="flex flex-row items-center gap-2 cursor-default px-1.5 py-1">
                <LegendMarker />
                <LegendLabel className="text-[11px] font-medium text-slate-500 whitespace-nowrap" />
            </LegendItem>
        </Legend>
    );
}
