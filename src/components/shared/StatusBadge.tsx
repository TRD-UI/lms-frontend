import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "good" | "warning" | "critical" | "neutral" | "info";

const TONE_CLASS: Record<StatusTone, string> = {
    good: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    critical: "bg-red-50 text-red-500",
    neutral: "bg-slate-100 text-slate-500",
    info: "bg-accent/40 text-primary",
};

interface StatusBadgeProps {
    children: React.ReactNode;
    tone?: StatusTone;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    className?: string;
}

/**
 * Status is never carried by colour alone — every badge ships a label, and
 * status tones are reserved (they are never reused as a chart series colour).
 */
export function StatusBadge({ children, tone = "neutral", icon: Icon, className }: StatusBadgeProps) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                "border-none rounded-full text-[10px] font-medium px-2.5 py-0.5 gap-1 capitalize hover:bg-inherit",
                TONE_CLASS[tone],
                className
            )}
        >
            {Icon && <Icon size={10} />}
            {children}
        </Badge>
    );
}

/** Maps the common domain statuses onto tones so call sites stay consistent. */
export function toneForStatus(status: string): StatusTone {
    switch (status) {
        case "published":
        case "settled":
        case "active":
        case "present":
        case "synced":
        case "passed":
        case "optimal":
            return "good";
        case "draft":
        case "pending":
        case "excused":
        case "underutilized":
            return "warning";
        case "failed":
        case "suspended":
        case "absent":
        case "overbooked":
            return "critical";
        case "refunded":
            return "info";
        default:
            return "neutral";
    }
}
