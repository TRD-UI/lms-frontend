import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search01Icon,
    BookOpen01Icon,
    PlayIcon,
    Task01Icon,
    Calendar03Icon,
    QrCode01Icon,
    UserMultiple02Icon,
    Location01Icon,
    Tag01Icon,
    ArrowRight01Icon,
    Cancel01Icon,
} from "hugeicons-react";
import {
    GROUP_ORDER,
    searchDashboard,
    type SearchGroup,
    type SearchResult,
} from "@/lib/search";
import { useLms } from "@/store/lms-store";
import { useSession } from "@/store/session";
import { cn } from "@/lib/utils";

const GROUP_ICON: Record<SearchGroup, React.ComponentType<{ size?: number; className?: string }>> = {
    Pages: ArrowRight01Icon,
    Courses: BookOpen01Icon,
    Lessons: PlayIcon,
    Assessments: Task01Icon,
    Classes: Calendar03Icon,
    "Entry passes": QrCode01Icon,
    People: UserMultiple02Icon,
    Venues: Location01Icon,
    Categories: Tag01Icon,
};

/**
 * Dashboard search, in the header bar itself.
 *
 * Matching runs against what the LMS store already holds, so results appear as
 * fast as you can type and nothing is requested while typing. Results drop
 * below the field rather than taking over the screen.
 */
export function GlobalSearch({ placeholder = "Search..." }: { placeholder?: string }) {
    const navigate = useNavigate();
    const { user } = useSession();
    const { courses, assessments, classSessions, entryPasses, venues, categories, instructors } = useLms();

    const [term, setTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(
        () =>
            user
                ? searchDashboard(term, user.role, {
                    courses, assessments, classSessions, entryPasses, venues, categories, instructors,
                })
                : [],
        [term, user, courses, assessments, classSessions, entryPasses, venues, categories, instructors]
    );

    const grouped = useMemo(() => {
        const byGroup = new Map<SearchGroup, SearchResult[]>();
        for (const r of results) byGroup.set(r.group, [...(byGroup.get(r.group) ?? []), r]);
        return GROUP_ORDER.filter((g) => byGroup.has(g)).map((g) => [g, byGroup.get(g)!] as const);
    }, [results]);

    // Flat order is what the arrow keys walk, so it has to match what renders.
    const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

    useEffect(() => setActive(0), [term]);

    // Pointer down rather than click, so selecting a result still fires.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const go = (result: SearchResult) => {
        setOpen(false);
        setTerm("");
        inputRef.current?.blur();
        navigate(result.to);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
            return;
        }
        if (flat.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i + 1) % flat.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + flat.length) % flat.length);
        } else if (e.key === "Enter" && open) {
            e.preventDefault();
            go(flat[active]);
        }
    };

    const showPanel = open && term.trim().length > 0;

    return (
        <div ref={rootRef} className="relative w-full">
            <Search01Icon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={showPanel}
                aria-controls="global-search-results"
                aria-label="Search the dashboard"
                autoComplete="off"
                value={term}
                onChange={(e) => {
                    setTerm(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className="h-10 md:h-11 w-full pl-11 pr-9 rounded-full md:rounded-xl bg-slate-50 md:bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
            />
            {term ? (
                <button
                    type="button"
                    onClick={() => {
                        setTerm("");
                        inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                    <Cancel01Icon size={14} />
                </button>
            ) : (
                <kbd
                    aria-hidden
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-400 pointer-events-none"
                >
                    ⌘K
                </kbd>
            )}

            {showPanel && (
                <div
                    id="global-search-results"
                    role="listbox"
                    className="absolute top-full left-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] sm:w-full rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5 overflow-hidden"
                >
                    <div className="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
                        {flat.length === 0 ? (
                            <p className="px-3 py-6 text-center text-xs text-slate-400 font-medium">
                                {term.trim().length < 2
                                    ? "Keep going — two characters or more."
                                    : `Nothing on your dashboard matches “${term.trim()}”.`}
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
                                                    role="option"
                                                    aria-selected={index === active}
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
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
