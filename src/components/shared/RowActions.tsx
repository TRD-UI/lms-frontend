import { useState } from "react";
import { MoreVerticalIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface RowAction {
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    onSelect: () => void;
    /** Renders in destructive red and, with `confirm`, gets a red confirm button. */
    destructive?: boolean;
    disabled?: boolean;
    /** When set, the action routes through a confirmation dialog first. */
    confirm?: {
        title: string;
        description: string;
        actionLabel?: string;
    };
    /** Inserts a divider above this item. */
    separatorBefore?: boolean;
}

interface RowActionsProps {
    actions: RowAction[];
    /** Accessible name — include the row subject, e.g. "Actions for Tech Odyssey". */
    label?: string;
    align?: "start" | "end";
    className?: string;
    /**
     * Controlled open state, so a click anywhere on the row can raise the same
     * menu the three dots do. Leave unset for the uncontrolled default.
     */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * The standard three-dot menu for table rows.
 *
 * Confirmation is handled here rather than at each call site: an action with a
 * `confirm` block opens an AlertDialog and only fires `onSelect` on confirm.
 */
export function RowActions({
    actions,
    label = "Row actions",
    align = "end",
    className,
    open,
    onOpenChange,
}: RowActionsProps) {
    const [pending, setPending] = useState<RowAction | null>(null);

    return (
        <>
            <DropdownMenu open={open} onOpenChange={onOpenChange}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={label}
                        className={cn(
                            "h-9 w-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700",
                            className
                        )}
                    >
                        <MoreVerticalIcon size={16} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align={align}
                    sideOffset={6}
                    className="w-52 rounded-2xl border-slate-100 shadow-xl p-1.5"
                >
                    {actions.map((action) => {
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
                                        if (action.confirm) setPending(action);
                                        else action.onSelect();
                                    }}
                                    className={cn(
                                        "gap-3 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors",
                                        action.destructive
                                            ? "text-destructive focus:bg-destructive/5 focus:text-destructive"
                                            : "text-slate-600 focus:bg-slate-50 focus:text-slate-900"
                                    )}
                                >
                                    {Icon && <Icon size={16} />}
                                    {action.label}
                                </DropdownMenuItem>
                            </div>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
                <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-medium text-slate-900">
                            {pending?.confirm?.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-normal text-sm">
                            {pending?.confirm?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                pending?.onSelect();
                                setPending(null);
                            }}
                            className={cn(
                                "rounded-full h-10 font-normal text-white",
                                pending?.destructive
                                    ? "bg-destructive hover:bg-destructive/90"
                                    : "bg-primary hover:bg-primary/90"
                            )}
                        >
                            {pending?.confirm?.actionLabel ?? "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
