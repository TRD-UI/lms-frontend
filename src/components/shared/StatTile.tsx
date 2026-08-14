import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight01Icon, ArrowUpRight01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

/**
 * The app's metric card, matching the student dashboard's StatsGrid:
 * icon chip on top, whisper-cased label, then the number.
 *
 * `delta` and `hint` are optional extras for the admin/instructor surfaces;
 * they render below the number so the base card is visually identical.
 */

interface StatTileProps {
    label: string;
    value: string;
    /** Signed percentage change vs the previous period. */
    delta?: number;
    /** Overrides the automatic good/bad reading of `delta` — for metrics where down is good. */
    deltaIsGood?: boolean;
    hint?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    className?: string;
}

export function StatTile({
    label,
    value,
    delta,
    deltaIsGood,
    hint,
    icon: Icon,
    className,
}: StatTileProps) {
    const hasDelta = typeof delta === "number";
    const up = hasDelta && delta > 0;
    const good = hasDelta ? (deltaIsGood ?? up) : undefined;

    return (
        <Card
            className={cn(
                "border-none bg-white rounded-2xl overflow-hidden shadow-none transition-all hover:shadow-sm",
                className
            )}
        >
            <CardContent className="p-4 md:p-6 flex flex-col gap-3 md:gap-4 text-primary h-full">
                {Icon && (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={20} />
                    </div>
                )}

                <div className="flex flex-col gap-1 mt-auto">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                        {label}
                    </p>

                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-2xl font-medium tracking-tight text-slate-800 tabular-nums">
                            {value}
                        </h3>
                        {hasDelta && (
                            <span
                                className={cn(
                                    "inline-flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5 tabular-nums",
                                    good ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                                )}
                            >
                                {up ? <ArrowUpRight01Icon size={10} /> : <ArrowDownRight01Icon size={10} />}
                                {Math.abs(delta)}%
                            </span>
                        )}
                    </div>

                    {hint && (
                        <p className="text-[11px] text-slate-400 font-normal leading-snug">{hint}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * The slate tray the metric cards sit in — the framing used on the student
 * Overview and admin Analytics. Wrap a row of StatTiles in this.
 */
export function StatGrid({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("bg-slate-100 p-2 md:p-4 rounded-2xl md:rounded-[2rem]", className)}>
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">{children}</div>
        </div>
    );
}
