import { Link } from "react-router-dom";
import { ArrowLeft01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

export interface Crumb {
    label: string;
    to?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    /** Trailing controls — search, primary action. */
    actions?: React.ReactNode;
    /** Renders a breadcrumb trail above the title. */
    breadcrumbs?: Crumb[];
    /** Renders an icon-only back control to the left of the title. */
    backTo?: string;
    /** Same control, for a back action that pops local state rather than routing. */
    onBack?: () => void;
    backLabel?: string;
    className?: string;
}

/** Consistent page masthead across all three portals. */
export function PageHeader({
    title,
    description,
    actions,
    breadcrumbs,
    backTo,
    onBack,
    backLabel = "Back",
    className,
}: PageHeaderProps) {
    const backClass =
        "h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-slate-400 " +
        "hover:text-primary hover:bg-slate-100 transition-colors";
    return (
        <div className={cn("space-y-3 px-1 sm:px-2", className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                            {i > 0 && <span className="text-slate-300 text-xs">/</span>}
                            {crumb.to ? (
                                <Link
                                    to={crumb.to}
                                    className="text-xs font-medium text-slate-400 hover:text-primary transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-xs font-medium text-slate-600">{crumb.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    {backTo ? (
                        <Link to={backTo} aria-label={backLabel} title={backLabel} className={backClass}>
                            <ArrowLeft01Icon size={18} />
                        </Link>
                    ) : onBack ? (
                        <button type="button" onClick={onBack} aria-label={backLabel} title={backLabel} className={backClass}>
                            <ArrowLeft01Icon size={18} />
                        </button>
                    ) : null}
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 truncate">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-slate-500 font-medium text-xs sm:text-sm">{description}</p>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}
