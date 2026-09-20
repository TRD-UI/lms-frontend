import { Calendar03Icon } from "hugeicons-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClassCalendar } from "@/components/classes/ClassCalendar";
import { useLms } from "@/store/lms-store";
import { purchasedCourseIds } from "@/data/courses";
import { toDateKey } from "@/data/classes";

/**
 * Learner: every on-site class across their enrolled courses.
 *
 * Same calendar the instructor sees, scoped to enrolment rather than to
 * ownership — so a learner sees the union of their courses, an instructor only
 * the classes they run.
 */
export default function Schedule() {
    const { sessionsForCourses, getCourse } = useLms();

    const sessions = sessionsForCourses(purchasedCourseIds);
    const today = toDateKey(new Date());
    const upcoming = sessions.filter((s) => s.date >= today);
    const thisWeek = upcoming.filter((s) => {
        const in7 = new Date();
        in7.setDate(in7.getDate() + 7);
        return s.date <= toDateKey(in7);
    });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <PageHeader
                title="Schedule"
                description="On-site classes across every course you are enrolled on."
            />

            <div className="px-1 sm:px-2">
                <StatGrid>
                    <StatTile label="Upcoming classes" value={String(upcoming.length)} icon={Calendar03Icon} />
                    <StatTile label="Next 7 days" value={String(thisWeek.length)} />
                    <StatTile label="Courses" value={String(purchasedCourseIds.length)} />
                    <StatTile
                        label="Next class"
                        value={upcoming[0] ? upcoming[0].date.slice(8) + "/" + upcoming[0].date.slice(5, 7) : "—"}
                    />
                </StatGrid>
            </div>

            <div className="px-1 sm:px-2">
                {sessions.length === 0 ? (
                    <EmptyState
                        variant="inset"
                        icon={Calendar03Icon}
                        title="No classes scheduled"
                        description="When your instructors schedule on-site sessions, they will appear here and you will be notified."
                    />
                ) : (
                    <ClassCalendar
                        sessions={sessions}
                        courseTitle={(id) => getCourse(id)?.title ?? "Unknown course"}
                        emptyLabel="No classes on this day."
                    />
                )}
            </div>
        </div>
    );
}
