import { cn } from "@/lib/utils";

interface ChartCardProps {
    title: string;
    description?: string;
    /** Trailing control — a range selector, a total, a link. */
    action?: React.ReactNode;
    /** Rendered under the plot; use for the legend. */
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    /** Removes body padding for charts that should bleed to the card edge. */
    flush?: boolean;
}

/**
 * Bento cell shell for a single figure.
 *
 * The title names the measure so a single-series chart needs no legend box;
 * multi-series charts pass a value-bearing legend through `footer`.
 */
export function ChartCard({
    title,
    description,
    action,
    footer,
    children,
    className,
    flush,
}: ChartCardProps) {
    return (
        <figure
            className={cn(
                "bg-white rounded-2xl border border-slate-100 flex flex-col min-w-0 overflow-hidden",
                className
            )}
        >
            <figcaption className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 shrink-0">
                <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-medium text-slate-900 truncate">{title}</h3>
                    {description && (
                        <p className="text-[11px] text-slate-400 font-normal leading-snug">{description}</p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </figcaption>

            <div className={cn("flex-1 min-h-0 min-w-0", flush ? "" : "px-5")}>{children}</div>

            {footer && <div className="px-5 py-4 mt-auto shrink-0">{footer}</div>}
        </figure>
    );
}
