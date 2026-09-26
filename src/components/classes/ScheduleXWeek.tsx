import { useEffect, useMemo, useState } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewWeek, createViewDay, createViewMonthGrid } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
// The side-effect import installs globalThis.Temporal, which Schedule-X
// reads internally; the named import is what this file builds dates with.
import "temporal-polyfill/global";
import { Temporal } from "temporal-polyfill";
import "@schedule-x/theme-default/dist/index.css";
import { Add01Icon, Calendar03Icon, QrCode01Icon, SquareLock02Icon } from "hugeicons-react";
import type { ClassSession } from "@/data/classes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Schedule-X hides the week and month grids under 700px and offers only the
 * day view. That is a reasonable default for a 7-column grid, but it left the
 * phone with no way to see a week or a month at all. The flag is a plain
 * writable property on the view, so the views are opted back in and the grid
 * is given a minimum width to scroll within (see `.sx-lms` in index.css).
 */
const onSmallScreens = <T,>(view: T): T =>
    Object.assign(view as object, { hasSmallScreenCompat: true }) as T;

/** `2026-03-14` + `10:00` → a zoned instant Schedule-X can place on the grid. */
function zoned(dateKey: string, hhmm: string) {
    return Temporal.PlainDateTime.from(`${dateKey}T${hhmm}:00`).toZonedDateTime(
        Temporal.Now.timeZoneId()
    );
}

export type PassState = "ready" | "locked" | "none";

interface ScheduleXWeekProps {
    sessions: ClassSession[];
    courseTitle: (courseId: string) => string;
    /** Tints the event and drives its badge. */
    passState?: (session: ClassSession) => PassState;
    onEventClick?: (session: ClassSession) => void;
    /** Shown as a per-day add control when supplied. */
    onAdd?: (dateKey: string) => void;
}

/**
 * The week timetable, on Schedule-X.
 *
 * Only the pieces that carry product meaning are overridden: the day heading
 * (a weekday and a date, no month), and the event card (which has to show
 * entry-pass standing). Everything else — layout, the now-marker, navigation —
 * is the library's.
 */
export function ScheduleXWeek({
    sessions,
    courseTitle,
    passState,
    onEventClick,
    onAdd,
}: ScheduleXWeekProps) {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const isMobile = useIsMobile();

    // Schedule-X keys events by id; keep a lookup so a click can hand back the
    // domain object rather than the library's shape.
    const byId = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

    const events = useMemo(
        () =>
            sessions.map((s) => ({
                id: s.id,
                title: s.title,
                start: zoned(s.date, s.startTime),
                end: zoned(s.date, s.endTime),
                location: s.roomNumber ? `${s.venue} · ${s.roomNumber}` : s.venue,
                description: courseTitle(s.courseId),
            })),
        [sessions, courseTitle]
    );

    const calendar = useCalendarApp({
        views: [
            onSmallScreens(createViewWeek()),
            createViewDay(),
            onSmallScreens(createViewMonthGrid()),
        ],
        // A single day is the sensible opening view on a phone; the others are
        // still reachable from the dropdown.
        defaultView: isMobile ? "day" : "week",
        events,
        plugins: [eventsService],
        dayBoundaries: { start: "07:00", end: "21:00" },
        weekOptions: { gridHeight: 640, nDays: 7 },
        callbacks: {
            onEventClick: (event) => {
                const session = byId.get(String(event.id));
                if (session) onEventClick?.(session);
            },
            onClickDate: (date) => onAdd?.(String(date)),
        },
    });

    // The config above is captured once, so later data changes go through the
    // events service rather than a re-created app.
    useEffect(() => {
        eventsService.set(events);
    }, [events, eventsService]);

    return (
        <div className={cn("sx-lms h-full", onAdd && "sx-lms-addable")}>
            <ScheduleXCalendar
                calendarApp={calendar}
                customComponents={{
                    /** Weekday and date only — the month lives in the header. */
                    weekGridDate: ({ date }: { date: unknown }) => {
                        const d = new Date(String(date));
                        if (Number.isNaN(d.getTime())) return <span />;
                        const isToday = d.toDateString() === new Date().toDateString();
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        return (
                            <div
                                className={cn(
                                    "group relative flex flex-col items-center justify-center rounded-xl py-1.5 px-2 transition-colors",
                                    isToday ? "bg-slate-900 text-white" : "text-slate-600"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-[10px] font-medium tracking-widest",
                                        isToday ? "text-white/70" : "text-slate-400"
                                    )}
                                >
                                    {DAY_NAMES[d.getDay()]}
                                </span>
                                <span className="text-sm font-medium tabular-nums leading-tight">
                                    {d.getDate()}
                                </span>

                                {onAdd && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAdd(key);
                                        }}
                                        aria-label={`Add a class on ${DAY_NAMES[d.getDay()]} ${d.getDate()}`}
                                        title="Add a class"
                                        className={cn(
                                            "absolute -top-0.5 -right-1 h-5 w-5 rounded-full flex items-center justify-center",
                                            "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
                                            isToday
                                                ? "bg-white/20 text-white"
                                                : "bg-white text-slate-400 hover:text-primary shadow-sm border border-slate-100"
                                        )}
                                    >
                                        <Add01Icon size={12} />
                                    </button>
                                )}
                            </div>
                        );
                    },

                    /** Event card, carrying entry-pass standing. */
                    timeGridEvent: ({ calendarEvent }: { calendarEvent: { id: string | number; title?: string } }) => {
                        const session = byId.get(String(calendarEvent.id));
                        if (!session) return <div />;
                        const state = passState?.(session) ?? "none";

                        return (
                            <div
                                className={cn(
                                    "h-full w-full rounded-xl border p-2 overflow-hidden cursor-pointer transition-shadow hover:shadow-md",
                                    state === "ready" && "bg-emerald-50 border-emerald-200",
                                    state === "locked" && "bg-amber-50 border-amber-200",
                                    state === "none" && "bg-accent/20 border-primary/20"
                                )}
                            >
                                <div className="flex items-start gap-1.5">
                                    <span
                                        className={cn(
                                            "h-4 w-4 rounded-md flex items-center justify-center shrink-0 mt-px",
                                            state === "ready" && "bg-emerald-100 text-emerald-700",
                                            state === "locked" && "bg-amber-100 text-amber-700",
                                            state === "none" && "bg-primary/10 text-primary"
                                        )}
                                    >
                                        {state === "ready" ? (
                                            <QrCode01Icon size={10} />
                                        ) : state === "locked" ? (
                                            <SquareLock02Icon size={10} />
                                        ) : (
                                            <Calendar03Icon size={10} />
                                        )}
                                    </span>
                                    <p className="text-[11px] font-medium text-slate-800 leading-tight line-clamp-2">
                                        {session.title}
                                    </p>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                    {session.startTime} – {session.endTime}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium truncate">
                                    {session.venue}
                                </p>
                                {state !== "none" && (
                                    <span
                                        className={cn(
                                            "mt-1 inline-block text-[9px] font-medium",
                                            state === "ready" ? "text-emerald-700" : "text-amber-700"
                                        )}
                                    >
                                        {state === "ready" ? "Pass ready" : "Pass locked"}
                                    </span>
                                )}
                            </div>
                        );
                    },
                }}
            />
        </div>
    );
}
