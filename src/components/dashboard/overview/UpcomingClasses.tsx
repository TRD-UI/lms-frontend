import { Link, useNavigate } from "react-router-dom";
import { Calendar03Icon, ArrowRight01Icon, Location01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLms } from "@/store/lms-store";
import { purchasedCourseIds } from "@/data/courses";
import { formatSessionDate, formatSessionTime, toDateKey } from "@/data/classes";

/**
 * The learner's next on-site sessions.
 *
 * Fed by the classes their instructors schedule, scoped to the courses they are
 * enrolled on. "Schedule" opens the full calendar.
 */
export function UpcomingClasses() {
    const navigate = useNavigate();
    const { sessionsForCourses, getCourse } = useLms();

    const today = toDateKey(new Date());
    const upcoming = sessionsForCourses(purchasedCourseIds)
        .filter((s) => s.date >= today)
        .slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-slate-800">Upcoming Classes</h2>
                <Button
                    variant="link"
                    onClick={() => navigate("/dashboard/schedule")}
                    className="text-primary font-medium text-xs p-0"
                >
                    Schedule
                </Button>
            </div>

            {upcoming.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                    <Calendar03Icon size={28} className="mx-auto text-slate-200" />
                    <p className="text-xs text-slate-400 font-medium">
                        No classes scheduled yet. You will be notified when one is.
                    </p>
                </div>
            ) : (
                <div className="space-y-1">
                    {upcoming.map((session, index) => (
                        <div key={session.id}>
                            <Link
                                to="/dashboard/schedule"
                                className="group flex items-center justify-between py-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors text-left"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <Calendar03Icon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-slate-700 text-sm leading-tight truncate">
                                            {session.title}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight truncate">
                                            {formatSessionDate(session.date)} • {formatSessionTime(session)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                                            <Location01Icon size={10} />
                                            {session.venue}
                                            <span className="text-slate-300">·</span>
                                            {getCourse(session.courseId)?.title}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight01Icon
                                    size={16}
                                    className="text-slate-200 group-hover:text-primary transition-colors shrink-0"
                                />
                            </Link>
                            {index < upcoming.length - 1 && <Separator className="bg-slate-100" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
