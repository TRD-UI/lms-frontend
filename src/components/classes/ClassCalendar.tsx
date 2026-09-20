import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Calendar03Icon, Location01Icon, Clock01Icon } from "hugeicons-react";
import {
    fromDateKey,
    toDateKey,
    formatSessionDate,
    formatSessionTime,
    type ClassSession,
} from "@/data/classes";
import { cn } from "@/lib/utils";

interface ClassCalendarProps {
    sessions: ClassSession[];
    /** Resolves a session's course title for the list. */
    courseTitle: (courseId: string) => string;
    /** Rendered under each session row — e.g. an instructor's row actions. */
    renderActions?: (session: ClassSession) => React.ReactNode;
    emptyLabel?: string;
}

/**
 * Month grid with class days marked, plus the sessions for whichever day is
 * selected. Shared by the instructor (their own classes) and the learner (every
 * class across their enrolled courses).
 */
export function ClassCalendar({
    sessions,
    courseTitle,
    renderActions,
    emptyLabel = "No classes on this day.",
}: ClassCalendarProps) {
    const [selected, setSelected] = useState<Date | undefined>(new Date());

    const byDate = useMemo(() => {
        const map = new Map<string, ClassSession[]>();
        for (const s of sessions) {
            const list = map.get(s.date) ?? [];
            list.push(s);
            map.set(s.date, list);
        }
        return map;
    }, [sessions]);

    const classDays = useMemo(() => [...byDate.keys()].map(fromDateKey), [byDate]);

    const selectedKey = selected ? toDateKey(selected) : null;
    const daySessions = selectedKey ? byDate.get(selectedKey) ?? [] : [];

    // Next few classes, so the panel is useful before anything is picked.
    const upcoming = useMemo(() => {
        const today = toDateKey(new Date());
        return sessions.filter((s) => s.date >= today).slice(0, 4);
    }, [sessions]);

    return (
        <div className="grid gap-6 lg:grid-cols-[auto,1fr] items-start">
            <div className="bg-white rounded-2xl border border-slate-100 p-3 w-fit">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    modifiers={{ hasClass: classDays }}
                    modifiersClassNames={{
                        hasClass:
                            "relative font-medium text-primary after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
                    }}
                    className="p-0"
                />
                <div className="flex items-center gap-2 px-3 pb-1 pt-3 border-t border-slate-50 mt-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[11px] font-medium text-slate-400">Day with a scheduled class</span>
                </div>
            </div>

            <div className="min-w-0 space-y-3">
                <h3 className="text-sm font-medium text-slate-800 px-1">
                    {selectedKey ? formatSessionDate(selectedKey) : "Upcoming"}
                </h3>

                {(daySessions.length > 0 ? daySessions : []).map((session) => (
                    <SessionRow
                        key={session.id}
                        session={session}
                        courseTitle={courseTitle(session.courseId)}
                        actions={renderActions?.(session)}
                    />
                ))}

                {daySessions.length === 0 && (
                    <>
                        <p className="text-xs text-slate-400 font-medium px-1">{emptyLabel}</p>
                        {upcoming.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-1">
                                    Coming up
                                </p>
                                {upcoming.map((session) => (
                                    <SessionRow
                                        key={session.id}
                                        session={session}
                                        courseTitle={courseTitle(session.courseId)}
                                        actions={renderActions?.(session)}
                                        showDate
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function SessionRow({
    session,
    courseTitle,
    actions,
    showDate,
}: {
    session: ClassSession;
    courseTitle: string;
    actions?: React.ReactNode;
    showDate?: boolean;
}) {
    const isToday = session.date === toDateKey(new Date());

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3">
            <div
                className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    isToday ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                )}
            >
                <Calendar03Icon size={18} />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-medium text-slate-800 truncate">{session.title}</h4>
                    {isToday && <StatusBadge tone="good">Today</StatusBadge>}
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">{courseTitle}</p>
                <div className="flex items-center gap-4 flex-wrap text-[11px] font-medium text-slate-500 pt-0.5">
                    {showDate && (
                        <span className="flex items-center gap-1">
                            <Calendar03Icon size={12} />
                            {formatSessionDate(session.date)}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock01Icon size={12} />
                        {formatSessionTime(session)}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                        <Location01Icon size={12} />
                        {session.venue}
                        {session.roomNumber ? ` · ${session.roomNumber}` : ""}
                    </span>
                </div>
            </div>

            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    );
}
