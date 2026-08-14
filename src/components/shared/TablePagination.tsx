import { useEffect, useMemo, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Client-side pagination for the admin/instructor tables.
 *
 * Returns the current page's slice plus everything the footer needs. The page
 * resets whenever the row count changes (a search or filter narrowing the set),
 * so you never end up stranded on an empty page.
 */
export function usePagination<T>(rows: T[], pageSize = 8) {
    const [page, setPage] = useState(1);
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

    useEffect(() => {
        setPage(1);
    }, [rows.length]);

    const safePage = Math.min(page, pageCount);

    const pageRows = useMemo(
        () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
        [rows, safePage, pageSize]
    );

    return {
        page: safePage,
        pageCount,
        pageRows,
        setPage,
        total: rows.length,
        from: rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
        to: Math.min(safePage * pageSize, rows.length),
    };
}

interface TablePaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    from: number;
    to: number;
    total: number;
    /** Noun for the row type, e.g. "courses". */
    label?: string;
    className?: string;
}

/** Compact page numbers with ellipses — always shows first, last and neighbours. */
function pageNumbers(page: number, pageCount: number): (number | "…")[] {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const out: (number | "…")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pageCount - 1, page + 1);
    if (start > 2) out.push("…");
    for (let i = start; i <= end; i++) out.push(i);
    if (end < pageCount - 1) out.push("…");
    out.push(pageCount);
    return out;
}

export function TablePagination({
    page,
    pageCount,
    onPageChange,
    from,
    to,
    total,
    label = "rows",
    className,
}: TablePaginationProps) {
    if (total === 0) return null;

    return (
        <nav
            aria-label="Pagination"
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100",
                className
            )}
        >
            <p className="text-[11px] font-medium text-slate-400 tabular-nums">
                Showing {from}–{to} of {total} {label}
            </p>

            {pageCount > 1 && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Previous page"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    >
                        <ArrowLeft01Icon size={15} />
                    </Button>

                    {pageNumbers(page, pageCount).map((n, i) =>
                        n === "…" ? (
                            <span
                                key={`gap-${i}`}
                                className="h-8 w-8 flex items-center justify-center text-[11px] text-slate-300"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={n}
                                onClick={() => onPageChange(n)}
                                aria-label={`Page ${n}`}
                                aria-current={n === page ? "page" : undefined}
                                className={cn(
                                    "h-8 min-w-8 px-2 rounded-lg text-[11px] font-medium tabular-nums transition-colors",
                                    n === page
                                        ? "bg-primary text-white"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                )}
                            >
                                {n}
                            </button>
                        )
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Next page"
                        disabled={page === pageCount}
                        onClick={() => onPageChange(page + 1)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    >
                        <ArrowRight01Icon size={15} />
                    </Button>
                </div>
            )}
        </nav>
    );
}
