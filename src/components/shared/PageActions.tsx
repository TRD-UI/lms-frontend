import { Add01Icon, ArrowDown01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PageAction {
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    onSelect: () => void;
    disabled?: boolean;
    separatorBefore?: boolean;
}

interface PageActionsProps {
    actions: PageAction[];
    /** Label on the merged trigger. */
    mergedLabel?: string;
    /** Merge once there are more than this many. Two side by side is fine. */
    mergeAfter?: number;
    className?: string;
}

/**
 * Primary page actions, top right.
 *
 * One or two render as buttons. Beyond that they collapse into a single
 * "Create" dropdown, so a header never turns into a row of competing CTAs.
 */
export function PageActions({
    actions,
    mergedLabel = "Create",
    mergeAfter = 2,
    className,
}: PageActionsProps) {
    const usable = actions.filter(Boolean);
    if (usable.length === 0) return null;

    if (usable.length <= mergeAfter) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                {usable.map((action, i) => {
                    const Icon = action.icon;
                    const primary = i === usable.length - 1;
                    return (
                        <Button
                            key={action.label}
                            onClick={action.onSelect}
                            disabled={action.disabled}
                            variant={primary ? "default" : "outline"}
                            className={cn(
                                "h-11 px-5 rounded-full font-medium",
                                primary
                                    ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10"
                                    : "border-slate-200 text-slate-600"
                            )}
                        >
                            {Icon && <Icon size={16} className="mr-1.5" />}
                            {action.label}
                        </Button>
                    );
                })}
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className={cn(
                        "h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10 gap-1.5",
                        className
                    )}
                >
                    <Add01Icon size={16} />
                    {mergedLabel}
                    <ArrowDown01Icon size={15} className="opacity-80" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={6} className="w-56 rounded-2xl border-slate-100 shadow-xl p-1.5">
                {usable.map((action) => {
                    const Icon = action.icon;
                    return (
                        <div key={action.label}>
                            {action.separatorBefore && (
                                <DropdownMenuSeparator className="bg-slate-100 my-1.5" />
                            )}
                            <DropdownMenuItem
                                disabled={action.disabled}
                                onSelect={(e) => {
                                    e.preventDefault();
                                    action.onSelect();
                                }}
                                className="gap-3 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer text-slate-600 focus:bg-slate-50 focus:text-slate-900"
                            >
                                {Icon && <Icon size={16} />}
                                {action.label}
                            </DropdownMenuItem>
                        </div>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
