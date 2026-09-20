import { useEffect, useMemo, useRef, useState } from "react";
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { toDateKey, type ClassSession } from "@/data/classes";
import { cn } from "@/lib/utils";

const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_HEIGHT = 76;
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

/** Monday of the week containing `date`. */
function startOfWeek(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = (d.getDay() + 6) % 7; // Sunday(0) → 6
    d.setDate(d.getDate() - offset);
    return d;
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

const fmtDay = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

/**
 * Lays overlapping sessions side by side within a day column, so two classes at
 * the same hour each get half the width rather than stacking on top of one
 * another.
 */
function packColumns(sessions: ClassSession[]) {
    const sorted = [...sessions].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    const lanes: ClassSession[][] = [];

    for (const s of sorted) {
        const start = toMinutes(s.startTime);
        const lane = lanes.find((l) => toMinutes(l[l.length - 1].endTime) <= start);
        if (lane) lane.push(s);
        else lanes.push([s]);
    }

    return sorted.map((s) => {
        const laneIndex = lanes.findIndex((l) => l.includes(s));
        return { session: s, laneIndex, laneCount: lanes.length };
    });
}

interface WeekScheduleProps {
    sessions: ClassSession[];
    courseTitle: (courseId: string) => string;
    /** Badge / CTA rendered inside an event card — pass status, join link, etc. */
    renderEventExtra?: (session: ClassSession) => React.ReactNode;
    /** Tone an event card, e.g. by pass state. */
    eventTone?: (session: ClassSession) => "default" | "ready" | "locked";
    /** Shown when set: a per-day add control. */
    onAdd?: (dateKey: string) => void;
    onEventClick?: (session: ClassSession) => void;
}

/**
 * Week timetable — day columns, half-hour gutter, events placed by their real
 * start and duration, with a line marking the current time.
 */
export function WeekSchedule({
    sessions,
    courseTitle,
    renderEventExtra,
    eventTone,
    onAdd,
    onEventClick,
}: WeekScheduleProps) {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const gridRef = useRef<HTMLDivElement>(null);

    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    const byDay = useMemo(() => {
        const map = new Map<string, ClassSession[]>();
        for (const s of sessions) {
            const list = map.get(s.date) ?? [];
            list.push(s);
            map.set(s.date, list);
        }
        return map;
    }, [sessions]);

    // Re-render the "now" line each minute rather than once per mount.
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(t);
    }, []);

    const todayKey = toDateKey(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowOffset = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const showNowLine = nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;
    const weekHasToday = days.some((d) => toDateKey(d) === todayKey);

    // Open on the working day, not at 07:00.
    useEffect(() => {
        const el = gridRef.current;
        if (el && showNowLine) el.scrollTop = Math.max(0, nowOffset - 120);
        // Only on mount — scrolling on every tick would fight the user.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

    const rangeLabel = `${fmtDay(days[0])} – ${fmtDay(days[6])}`;

    return (
        <div className="flex flex-col min-h-0 h-full">
            {/* Week controls */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Previous week"
                        onClick={() => setWeekStart((w) => addDays(w, -7))}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100"
                    >
                        <ArrowLeft01Icon size={16} />
                    </Button>
                    <span className="text-sm font-medium text-slate-800 tabular-nums px-2 min-w-[7.5rem] text-center">
                        {rangeLabel}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Next week"
                        onClick={() => setWeekStart((w) => addDays(w, 7))}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100"
                    >
                        <ArrowRight01Icon size={16} />
                    </Button>
                </div>

                <Button
                    variant={weekHasToday ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWeekStart(startOfWeek(new Date()))}
                    className={cn(
                        "h-8 px-4 rounded-full text-xs font-medium",
                        weekHasToday
                            ? "bg-slate-900 hover:bg-slate-800 text-white"
                            : "border-slate-200 text-slate-600"
                    )}
                >
                    Today
                </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1.5 px-5 pt-3 pb-2 shrink-0">
                <div />
                {days.map((d) => {
                    const key = toDateKey(d);
                    const isToday = key === todayKey;
                    const count = byDay.get(key)?.length ?? 0;
                    return (
                        <div
                            key={key}
                            className={cn(
                                "group rounded-xl py-2 px-1 text-center transition-colors relative",
                                isToday ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600"
                            )}
                        >
                            <p className={cn("text-[10px] font-medium tracking-widest", isToday ? "text-white/70" : "text-slate-400")}>
                                {DAY_LABELS[(d.getDay() + 6) % 7]}
                            </p>
                            <p className="text-sm font-medium tabular-nums">{fmtDay(d)}</p>

                            {onAdd && (
                                <button
                                    onClick={() => onAdd(key)}
                                    aria-label={`Add a class on ${fmtDay(d)}`}
                                    title="Add a class"
                                    className={cn(
                                        "absolute top-1 right-1 h-5 w-5 rounded-full flex items-center justify-center transition-all",
                                        "opacity-0 group-hover:opacity-100 focus:opacity-100",
                                        isToday
                                            ? "bg-white/20 text-white hover:bg-white/30"
                                            : "bg-white text-slate-400 hover:text-primary shadow-sm"
                                    )}
                                >
                                    <Add01Icon size={12} />
                                </button>
                            )}

                            {count > 0 && !onAdd && (
                                <span className={cn("text-[9px] font-medium", isToday ? "text-white/60" : "text-slate-300")}>
                                    {count}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Time grid */}
            <div ref={gridRef} className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-5 min-h-0">
                <div
                    className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1.5 relative"
                    style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
                >
                    {/* Hour gutter */}
                    <div className="relative">
                        {hours.map((h, i) => (
                            <span
                                key={h}
                                className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-slate-300 tabular-nums"
                                style={{ top: i * HOUR_HEIGHT }}
                            >
                                {String(h).padStart(2, "0")}:00
                            </span>
                        ))}
                    </div>

                    {days.map((d) => {
                        const key = toDateKey(d);
                        const packed = packColumns(byDay.get(key) ?? []);
                        return (
                            <div key={key} className="relative">
                                {/* Hour rules */}
                                {hours.map((h, i) => (
                                    <div
                                        key={h}
                                        className="absolute left-0 right-0 border-t border-slate-50"
                                        style={{ top: i * HOUR_HEIGHT }}
                                    />
                                ))}

                                {packed.map(({ session, laneIndex, laneCount }) => {
                                    const start = toMinutes(session.startTime);
                                    const end = toMinutes(session.endTime);
                                    const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                                    const height = Math.max(44, ((end - start) / 60) * HOUR_HEIGHT - 4);
                                    const tone = eventTone?.(session) ?? "default";

                                    return (
                                        <button
                                            key={session.id}
                                            onClick={() => onEventClick?.(session)}
                                            className={cn(
                                                "absolute rounded-xl p-2 text-left overflow-hidden transition-all border",
                                                "hover:shadow-md hover:z-10",
                                                tone === "ready" && "bg-emerald-50 border-emerald-200",
                                                tone === "locked" && "bg-amber-50 border-amber-200",
                                                tone === "default" && "bg-accent/20 border-primary/20"
                                            )}
                                            style={{
                                                top,
                                                height,
                                                left: `${(laneIndex / laneCount) * 100}%`,
                                                width: `${(1 / laneCount) * 100}%`,
                                            }}
                                        >
                                            <p className="text-[11px] font-medium text-slate-800 leading-tight line-clamp-2">
                                                {session.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                                {session.startTime} – {session.endTime}
                                            </p>
                                            {height > 70 && (
                                                <p className="text-[10px] text-slate-400 font-medium truncate">
                                                    {session.venue}
                                                </p>
                                            )}
                                            {height > 96 && (
                                                <p className="text-[10px] text-slate-400 truncate">
                                                    {courseTitle(session.courseId)}
                                                </p>
                                            )}
                                            {height > 118 && renderEventExtra?.(session)}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Current time */}
                    {showNowLine && weekHasToday && (
                        <div
                            className="absolute left-0 right-0 pointer-events-none z-20 flex items-center"
                            style={{ top: nowOffset }}
                        >
                            <span className="text-[9px] font-medium text-primary bg-white pr-1 tabular-nums">
                                {String(now.getHours()).padStart(2, "0")}:
                                {String(now.getMinutes()).padStart(2, "0")}
                            </span>
                            <div className="flex-1 border-t border-dashed border-primary/60" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
