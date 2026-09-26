import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Search01Icon,
    BookOpen01Icon,
    PlayIcon,
    Task01Icon,
    Calendar03Icon,
    Certificate01Icon,
    QrCode01Icon,
    UserMultiple02Icon,
    Location01Icon,
    ArrowRight01Icon,
} from "hugeicons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { globalSearch, type SearchGroup, type SearchResult } from "@/lib/api/search";
import { useSession } from "@/store/session";
import { cn } from "@/lib/utils";

const GROUP_ICON: Record<SearchGroup, React.ComponentType<{ size?: number; className?: string }>> = {
    Pages: ArrowRight01Icon,
    Courses: BookOpen01Icon,
    Lessons: PlayIcon,
    Assessments: Task01Icon,
    Classes: Calendar03Icon,
    Certificates: Certificate01Icon,
    "Entry passes": QrCode01Icon,
    People: UserMultiple02Icon,
    Venues: Location01Icon,
};

/** The order groups appear in, regardless of which queries answered first. */
const GROUP_ORDER: SearchGroup[] = [
    "Pages", "Courses", "Lessons", "Assessments", "Classes",
    "Entry passes", "Certificates", "People", "Venues",
];

/**
 * Search across everything the signed-in person can see.
 *
 * The header control is a button that looks like a field; the real input lives
 * in the panel, which gives grouped results room and behaves the same on a
 * phone, where it arrives as a bottom sheet.
 */
export function GlobalSearch({ placeholder = "Search..." }: { placeholder?: string }) {
    const [open, setOpen] = useState(false);

    // ⌘K / Ctrl+K from anywhere.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="h-10 md:h-11 w-full flex items-center gap-3 pl-4 pr-3 rounded-full md:rounded-xl bg-slate-50 md:bg-slate-100 text-sm text-slate-400 hover:text-slate-500 transition-colors group"
            >
                <Search01Icon size={18} className="shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{placeholder}</span>
                <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                    ⌘K
                </kbd>
            </button>

            <SearchPanel open={open} onOpenChange={setOpen} />
        </>
    );
}

function SearchPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
    const navigate = useNavigate();
    const { user } = useSession();
    const [term, setTerm] = useState("");
    const [debounced, setDebounced] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            setTerm("");
            setDebounced("");
            setActive(0);
        }
    }, [open]);

    // One request per pause in typing, not one per keystroke.
    useEffect(() => {
        const id = window.setTimeout(() => setDebounced(term), 180);
        return () => window.clearTimeout(id);
    }, [term]);

    const { data: results = [], isFetching } = useQuery({
        queryKey: ["global-search", debounced, user?.role],
        queryFn: () => globalSearch(debounced, user!.role),
        enabled: open && Boolean(user) && debounced.trim().length >= 2,
        staleTime: 30_000,
    });

    const grouped = useMemo(() => {
        const byGroup = new Map<SearchGroup, SearchResult[]>();
        for (const r of results) byGroup.set(r.group, [...(byGroup.get(r.group) ?? []), r]);
        return GROUP_ORDER.filter((g) => byGroup.has(g)).map((g) => [g, byGroup.get(g)!] as const);
    }, [results]);

    // Flat order is what the arrow keys walk, so it must match what is rendered.
    const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

    useEffect(() => setActive(0), [results]);

    const go = (result: SearchResult) => {
        onOpenChange(false);
        navigate(result.to);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (flat.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % flat.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + flat.length) % flat.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            go(flat[active]);
        }
    };

    const tooShort = debounced.trim().length > 0 && debounced.trim().length < 2;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    inputRef.current?.focus();
                }}
                className="max-w-xl p-0 gap-0 rounded-2xl border-slate-100 overflow-hidden [&>button]:hidden"
            >
                <DialogTitle className="sr-only">Search</DialogTitle>
                <DialogDescription className="sr-only">
                    Search courses, lessons, assessments, classes and people.
                </DialogDescription>

                <div className="flex items-center gap-3 px-4 border-b border-slate-100">
                    <Search01Icon size={18} className="text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Search courses, lessons, classes, people…"
                        aria-label="Search"
                        className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                    {isFetching && (
                        <span className="h-4 w-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin shrink-0" />
                    )}
                </div>

                <div className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
                    {term.trim().length === 0 ? (
                        <p className="px-3 py-8 text-center text-xs text-slate-400 font-medium">
                            Start typing to search across the whole app.
                        </p>
                    ) : tooShort ? (
                        <p className="px-3 py-8 text-center text-xs text-slate-400 font-medium">
                            Keep going — two characters or more.
                        </p>
                    ) : flat.length === 0 && !isFetching ? (
                        <p className="px-3 py-8 text-center text-xs text-slate-400 font-medium">
                            Nothing matches “{term.trim()}”.
                        </p>
                    ) : (
                        grouped.map(([group, items]) => {
                            const Icon = GROUP_ICON[group];
                            return (
                                <div key={group} className="mb-1 last:mb-0">
                                    <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                        {group}
                                    </p>
                                    {items.map((result) => {
                                        const index = flat.indexOf(result);
                                        return (
                                            <button
                                                key={result.id}
                                                onClick={() => go(result)}
                                                onMouseEnter={() => setActive(index)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                                                    index === active ? "bg-slate-50" : "hover:bg-slate-50/60"
                                                )}
                                            >
                                                <span className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                    <Icon size={15} />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-medium text-slate-800 truncate">
                                                        {result.title}
                                                    </span>
                                                    {result.subtitle && (
                                                        <span className="block text-[11px] text-slate-400 truncate">
                                                            {result.subtitle}
                                                        </span>
                                                    )}
                                                </span>
                                                <ArrowRight01Icon
                                                    size={15}
                                                    className={cn(
                                                        "shrink-0 transition-colors",
                                                        index === active ? "text-primary" : "text-slate-200"
                                                    )}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
