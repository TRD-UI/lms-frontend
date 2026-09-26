import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Add01Icon } from "hugeicons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScheduleXWeek } from "./ScheduleXWeek";
import { ScheduleClassDialog } from "./ScheduleClassDialog";
import { useLms } from "@/store/lms-store";
import { useSession } from "@/store/session";
import { formatSessionDate, formatSessionTime, type ClassSession } from "@/data/classes";
import { toast } from "sonner";

interface ScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * The week timetable, as a modal.
 *
 * One component for both roles: a learner sees every class across the courses
 * they are enrolled on, tinted by whether their entry pass is released; an
 * instructor sees only the classes they run, and can add one from any day.
 */
export function ScheduleDialog({ open, onOpenChange }: ScheduleDialogProps) {
    const navigate = useNavigate();
    const { user } = useSession();
    const {
        sessionsForCourses,
        sessionsForInstructor,
        coursesByInstructor,
        getCourse,
        entryPassUnlocked,
        assessmentsForCourse,
        bestAttempt,
        enrolledCourseIds,
    } = useLms();

    const [addOpen, setAddOpen] = useState(false);
    const [addDate, setAddDate] = useState<string | undefined>();
    const [editing, setEditing] = useState<ClassSession | null>(null);

    const isInstructor = user?.role === "instructor";
    const myCourses = isInstructor && user ? coursesByInstructor(user.id) : [];
    const sessions =
        isInstructor && user ? sessionsForInstructor(user.id) : sessionsForCourses(enrolledCourseIds);

    /** A class is entered with a pass, released only once its gate is passed. */
    const passFor = (session: ClassSession) => {
        if (!user) return { unlocked: false, blocking: undefined };
        const unlocked = entryPassUnlocked(session.courseId, user.id);
        const blocking = unlocked
            ? undefined
            : assessmentsForCourse(session.courseId).find(
                (a) =>
                    a.gatesEntryPass &&
                    a.status === "published" &&
                    bestAttempt(a.id, user.id)?.passed !== true
            );
        return { unlocked, blocking };
    };

    const openAdd = (dateKey?: string) => {
        setEditing(null);
        setAddDate(dateKey);
        setAddOpen(true);
    };

    const handleEventClick = (session: ClassSession) => {
        if (isInstructor) {
            setEditing(session);
            setAddDate(undefined);
            setAddOpen(true);
            return;
        }

        const { unlocked, blocking } = passFor(session);
        if (unlocked) {
            onOpenChange(false);
            navigate("/dashboard/passes");
        } else if (blocking) {
            toast.info("Entry pass locked", {
                description: `Pass "${blocking.title}" to unlock entry to this class.`,
                action: {
                    label: "Take it",
                    onClick: () => {
                        onOpenChange(false);
                        navigate(`/dashboard/assessments/${blocking.id}/take`);
                    },
                },
            });
        } else {
            toast.info(session.title, {
                description: `${formatSessionDate(session.date)} · ${formatSessionTime(session)} · ${session.venue}`,
            });
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl max-w-[min(96vw,78rem)] p-0 overflow-hidden h-[86vh] flex flex-col gap-0">
                    <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <DialogTitle className="text-xl font-medium text-slate-900">
                                    {isInstructor ? "Class schedule" : "Your schedule"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-sm">
                                    {isInstructor
                                        ? "The classes you run, on site and online. Hover a day to add one there."
                                        : "Classes across every course you are enrolled on."}
                                </DialogDescription>
                            </div>

                            {isInstructor && (
                                <Button
                                    onClick={() => openAdd()}
                                    disabled={myCourses.length === 0}
                                    className="h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shrink-0 mr-8"
                                >
                                    <Add01Icon size={16} className="mr-1.5" />
                                    Add class
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 min-h-0">
                        <ScheduleXWeek
                            sessions={sessions}
                            courseTitle={(id) => getCourse(id)?.title ?? "Unknown course"}
                            onAdd={isInstructor && myCourses.length > 0 ? openAdd : undefined}
                            onEventClick={handleEventClick}
                            passState={
                                isInstructor
                                    ? undefined
                                    : (session) => (passFor(session).unlocked ? "ready" : "locked")
                            }
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {isInstructor && user && (
                <ScheduleClassDialog
                    open={addOpen}
                    onOpenChange={(o) => {
                        setAddOpen(o);
                        if (!o) {
                            setEditing(null);
                            setAddDate(undefined);
                        }
                    }}
                    courses={myCourses}
                    instructorId={user.id}
                    session={editing}
                    defaultDate={addDate}
                />
            )}
        </>
    );
}
