import { useState } from "react";
import { Add01Icon, Calendar03Icon, Delete02Icon, Edit01Icon } from "hugeicons-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageActions } from "@/components/shared/PageActions";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { RowActions } from "@/components/shared/RowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClassCalendar } from "@/components/classes/ClassCalendar";
import { ScheduleClassDialog } from "@/components/classes/ScheduleClassDialog";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { toDateKey, type ClassSession } from "@/data/classes";
import { toast } from "sonner";

/** Instructor: the on-site classes they run, on a calendar. */
export default function InstructorClasses() {
    const instructor = useActingUser("instructor");
    const { coursesByInstructor, sessionsForInstructor, getCourse, cancelClassSession } = useLms();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ClassSession | null>(null);

    const myCourses = coursesByInstructor(instructor.id);
    const sessions = sessionsForInstructor(instructor.id);

    const today = toDateKey(new Date());
    const upcoming = sessions.filter((s) => s.date >= today);
    const thisMonth = sessions.filter((s) => s.date.slice(0, 7) === today.slice(0, 7));

    const openNew = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <PageHeader
                title="Classes"
                description="Schedule the on-site sessions your learners attend."
                actions={
                    <PageActions
                        actions={[
                            { label: "Schedule class", icon: Add01Icon, onSelect: openNew, disabled: myCourses.length === 0 },
                        ]}
                    />
                }
            />

            <div className="px-1 sm:px-2">
                <StatGrid>
                    <StatTile label="Upcoming" value={String(upcoming.length)} icon={Calendar03Icon} />
                    <StatTile label="This month" value={String(thisMonth.length)} />
                    <StatTile label="Courses taught" value={String(myCourses.length)} />
                    <StatTile label="Total scheduled" value={String(sessions.length)} />
                </StatGrid>
            </div>

            <div className="px-1 sm:px-2">
                {myCourses.length === 0 ? (
                    <EmptyState
                        variant="inset"
                        icon={Calendar03Icon}
                        title="No courses assigned"
                        description="An administrator assigns courses to you. Once one is, you can schedule its classes here."
                    />
                ) : (
                    <ClassCalendar
                        sessions={sessions}
                        courseTitle={(id) => getCourse(id)?.title ?? "Unknown course"}
                        emptyLabel="Nothing scheduled on this day."
                        renderActions={(session) => (
                            <RowActions
                                label={`Actions for ${session.title}`}
                                actions={[
                                    {
                                        label: "Edit class",
                                        icon: Edit01Icon,
                                        onSelect: () => {
                                            setEditing(session);
                                            setDialogOpen(true);
                                        },
                                    },
                                    {
                                        label: "Cancel class",
                                        icon: Delete02Icon,
                                        destructive: true,
                                        separatorBefore: true,
                                        onSelect: () => {
                                            cancelClassSession(session.id);
                                            toast.success("Class cancelled");
                                        },
                                        confirm: {
                                            title: "Cancel this class?",
                                            description: `"${session.title}" will be removed from every enrolled learner's schedule.`,
                                            actionLabel: "Cancel class",
                                        },
                                    },
                                ]}
                            />
                        )}
                    />
                )}
            </div>

            <ScheduleClassDialog
                open={dialogOpen}
                onOpenChange={(o) => {
                    setDialogOpen(o);
                    if (!o) setEditing(null);
                }}
                courses={myCourses}
                instructorId={instructor.id}
                session={editing}
            />
        </div>
    );
}
