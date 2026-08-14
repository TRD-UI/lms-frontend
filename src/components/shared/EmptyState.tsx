import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description?: string;
    action?: React.ReactNode;
    /** `inset` sits inside a card; `page` stands alone on the page. */
    variant?: "page" | "inset";
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    variant = "page",
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500",
                variant === "page"
                    ? "py-12 sm:py-20"
                    : "py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200",
                className
            )}
        >
            <div
                className={cn(
                    "rounded-full flex items-center justify-center mb-4 sm:mb-6",
                    variant === "page"
                        ? "h-16 w-16 sm:h-20 sm:w-20 bg-slate-50 text-slate-200"
                        : "h-16 w-16 bg-white text-slate-300 shadow-sm"
                )}
            >
                <Icon size={variant === "page" ? 36 : 24} />
            </div>
            <h3
                className={cn(
                    "font-medium text-slate-900",
                    variant === "page" ? "text-xl sm:text-2xl mb-1.5 sm:mb-2" : "text-lg"
                )}
            >
                {title}
            </h3>
            {description && (
                <p className="text-slate-500 max-w-sm mx-auto font-medium text-xs sm:text-sm leading-relaxed px-4">
                    {description}
                </p>
            )}
            {action && <div className="mt-6 sm:mt-8">{action}</div>}
        </div>
    );
}
