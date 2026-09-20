import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Calendar03Icon,
    Clock01Icon,
    Location01Icon,
    QrCode01Icon,
    SquareLock02Icon,
    ArrowRight01Icon,
} from "hugeicons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { purchasedCourseIds } from "@/data/courses";
import { entryPasses } from "@/data/entry-passes";
import {
    formatSessionDate,
    formatSessionTime,
    fromDateKey,
    toDateKey,
    type ClassSession,
} from "@/data/classes";
import { cn } from "@/lib/utils";

interface ScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * The learner's full class calendar.
 *
 * A modal rather than a page: it is something you glance at from wherever you
 * are, not a destination. Days carrying a class are dotted; picking one shows
 * every session that day with its entry-pass standing.
 */
export function ScheduleDialog({ open, onOpenChange }: ScheduleDialogProps) {
    const student = useActingUser("student");
    const { sessionsForCourses, getCourse, entryPassUnlocked, assessmentsForCourse, bestAttempt } = useLms();

    const sessions = sessionsForCourses(purchasedCourseIds);
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    const [hovered, setHovered] = useState<string | null>(null);

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

    /**
     * A class is attended with an entry pass, and the pass is only released once
     * every gating assessment on that course is passed.
     */
    const passFor = (session: ClassSession) => {
        const unlocked = entryPassUnlocked(session.courseId, student.id);
        const pass = entryPasses.find((p) => p.courseId === session.courseId);
        const blocking = unlocked
            ? undefined
            : assessmentsForCourse(session.courseId).find(
                (a) =>
                    a.gatesEntryPass &&
                    a.status === "published" &&
                    bestAttempt(a.id, student.id)?.passed !== true
            );
        return { unlocked, pass, blocking };
    };

    // The day the pointer is over wins, so hovering previews without committing.
    const activeKey = hovered ?? (selected ? toDateKey(selected) : null);
    const activeSessions = activeKey ? byDate.get(activeKey) ?? [] : [];

    const today = toDateKey(new Date());
    const upcoming = sessions.filter((s) => s.date >= today);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl border-slate-100 shadow-2xl max-w-5xl p-0 overflow-hidden">
                <DialogHeader className="px-7 pt-6 pb-4 border-b border-slate-100">
                    <DialogTitle className="text-xl font-medium text-slate-900">Your schedule</DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        On-site classes across every course you are enrolled on.
                        {upcoming.length > 0 && ` ${upcoming.length} coming up.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid lg:grid-cols-[auto,1fr] max-h-[70vh]">
                    <div className="p-6 lg:border-r border-slate-100">
                        <Calendar
                            mode="single"
                            selected={selected}
                            onSelect={setSelected}
                            modifiers={{ hasClass: classDays }}
                            modifiersClassNames={{
                                hasClass:
                                    "relative font-medium text-primary after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
                            }}
                            onDayMouseEnter={(day) => setHovered(toDateKey(day))}
                            onDayMouseLeave={() => setHovered(null)}
                            // A roomier grid than the default, since this is the point of the modal.
                            classNames={{
                                months: "flex flex-col",
                                month: "space-y-3",
                                head_cell: "text-slate-400 rounded-md w-11 font-medium text-[11px] uppercase",
                                cell: "h-11 w-11 text-center text-sm p-0 relative",
                                day: "h-11 w-11 p-0 font-normal rounded-xl hover:bg-slate-100 transition-colors",
                                day_selected:
                                    "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary",
                                day_today: "bg-slate-100 text-slate-900",
                            }}
                        />
                        <div className="flex items-center gap-4 pt-4 mt-3 border-t border-slate-50">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Class scheduled
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                <span className="h-2.5 w-2.5 rounded bg-slate-100" />
                                Today
                            </span>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto scrollbar-thin min-w-0">
                        <h3 className="text-sm font-medium text-slate-800 mb-3">
                            {activeKey ? formatSessionDate(activeKey) : "Pick a day"}
                        </h3>

                        {activeSessions.length === 0 ? (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400 font-medium">No classes on this day.</p>
                                {upcoming.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                            Coming up
                                        </p>
                                        {upcoming.slice(0, 4).map((session) => (
                                            <SessionDetail
                                                key={session.id}
                                                session={session}
                                                courseTitle={getCourse(session.courseId)?.title ?? ""}
                                                {...passFor(session)}
                                                showDate
                                                onNavigate={() => onOpenChange(false)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeSessions.map((session) => (
                                    <SessionDetail
                                        key={session.id}
                                        session={session}
                                        courseTitle={getCourse(session.courseId)?.title ?? ""}
                                        {...passFor(session)}
                                        onNavigate={() => onOpenChange(false)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SessionDetail({
    session,
    courseTitle,
    unlocked,
    pass,
    blocking,
    showDate,
    onNavigate,
}: {
    session: ClassSession;
    courseTitle: string;
    unlocked: boolean;
    pass?: { id: string };
    blocking?: { id: string; title: string };
    showDate?: boolean;
    onNavigate: () => void;
}) {
    const isToday = session.date === toDateKey(new Date());

    return (
        <div
            className={cn(
                "rounded-2xl border p-4 space-y-3",
                isToday ? "border-primary/30 bg-accent/10" : "border-slate-100 bg-white"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium text-slate-800 truncate">{session.title}</h4>
                        {isToday && <StatusBadge tone="good">Today</StatusBadge>}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{courseTitle}</p>
                </div>

                {unlocked ? (
                    <StatusBadge tone="good" icon={QrCode01Icon}>
                        Pass ready
                    </StatusBadge>
                ) : (
                    <StatusBadge tone="warning" icon={SquareLock02Icon}>
                        Pass locked
                    </StatusBadge>
                )}
            </div>

            <div className="flex items-center gap-4 flex-wrap text-[11px] font-medium text-slate-500">
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

            {unlocked ? (
                <Link to="/dashboard/passes" onClick={onNavigate}>
                    <Button
                        size="sm"
                        className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-xs"
                    >
                        View pass
                        <ArrowRight01Icon size={14} className="ml-1" />
                    </Button>
                </Link>
            ) : blocking ? (
                <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 font-normal">
                        Pass in on{" "}
                        <span className="font-medium text-slate-700">{blocking.title}</span> to unlock entry.
                    </p>
                    <Link to={`/dashboard/assessments/${blocking.id}/take`} onClick={onNavigate}>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-4 rounded-full border-slate-200 text-slate-600 font-medium text-xs"
                        >
                            Take the test
                        </Button>
                    </Link>
                </div>
            ) : (
                <p className="text-[11px] text-slate-400 font-normal">
                    Your pass will be issued closer to the date.
                </p>
            )}
        </div>
    );
}
