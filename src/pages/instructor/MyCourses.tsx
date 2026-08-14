import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Add01Icon,
    ArrowRight01Icon,
    BookOpen01Icon,
    Copy01Icon,
    Delete02Icon,
    Edit01Icon,
    Search01Icon,
    Task01Icon,
    UserMultiple02Icon,
    ViewIcon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { RowActions } from "@/components/shared/RowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import {
    CourseFormDialog,
    draftToFees,
    type CourseDraft,
} from "@/components/courses/CourseFormDialog";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import type { Course } from "@/data/types";
import { toast } from "sonner";

/** Instructor: the courses they own, with create / edit / delete. */
export default function MyCourses() {
    const navigate = useNavigate();
    const instructor = useActingUser("instructor");
    const {
        coursesByInstructor,
        createCourse,
        updateCourse,
        deleteCourse,
        assessmentsForCourse,
    } = useLms();

    const [query, setQuery] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);

    const myCourses = coursesByInstructor(instructor.id);
    const visible = myCourses.filter(
        (c) =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleSubmit = (draft: CourseDraft) => {
        const shared = {
            title: draft.title,
            description: draft.description,
            category: draft.category,
            duration: draft.duration,
            location: draft.location,
            fees: draftToFees(draft),
            status: draft.status,
        };

        if (editing) {
            updateCourse(editing.id, {
                ...shared,
                seats: { enrolled: editing.seats.enrolled, total: draft.seatsTotal },
            });
            toast.success("Course updated", { description: `"${draft.title}" saved.` });
        } else {
            const created = createCourse({
                ...shared,
                seats: { enrolled: 0, total: draft.seatsTotal },
                instructorId: instructor.id,
                instructorName: instructor.name,
                progress: 0,
                modules: [],
            });
            toast.success("Course created", {
                description: "Add modules and assessments to make it ready for learners.",
            });
            navigate(`/instructor/courses/${created.id}`);
        }
        setEditing(null);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="My Courses"
                description={`${myCourses.length} ${myCourses.length === 1 ? "course" : "courses"} assigned to you.`}
                actions={
                    <div className="flex items-center gap-3">
                        <div className="relative group w-full lg:w-64">
                            <Search01Icon
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                            />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search my courses"
                                className="h-11 w-full pl-11 pr-4 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                            className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10 shrink-0"
                        >
                            <Add01Icon size={16} className="mr-1.5" />
                            New course
                        </Button>
                    </div>
                }
            />

            {myCourses.length === 0 ? (
                <EmptyState
                    icon={BookOpen01Icon}
                    title="No courses yet"
                    description="Create your first course, then add modules and assessments to it."
                    action={
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                            className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                        >
                            Create a course
                        </Button>
                    }
                />
            ) : visible.length === 0 ? (
                <EmptyState
                    variant="inset"
                    icon={Search01Icon}
                    title="No courses match"
                    description="Try a different search term."
                    className="mx-1 sm:mx-2"
                />
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 px-1 sm:px-2">
                    {visible.map((course) => {
                        const list = assessmentsForCourse(course.id);
                        const fill =
                            course.seats.total === 0
                                ? 0
                                : Math.round((course.seats.enrolled / course.seats.total) * 100);

                        return (
                            <div
                                key={course.id}
                                className="group bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 transition-shadow hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <Link to={`/instructor/courses/${course.id}`} className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest truncate">
                                                {course.category}
                                            </p>
                                            <StatusBadge tone={toneForStatus(course.status ?? "published")}>
                                                {course.status ?? "published"}
                                            </StatusBadge>
                                        </div>
                                        <h3 className="text-base font-medium text-slate-900 leading-snug group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                    </Link>

                                    <RowActions
                                        label={`Actions for ${course.title}`}
                                        actions={[
                                            {
                                                label: "Open course",
                                                icon: ViewIcon,
                                                onSelect: () => navigate(`/instructor/courses/${course.id}`),
                                            },
                                            {
                                                label: "Edit details",
                                                icon: Edit01Icon,
                                                onSelect: () => {
                                                    setEditing(course);
                                                    setFormOpen(true);
                                                },
                                            },
                                            {
                                                label: "Add assessment",
                                                icon: Add01Icon,
                                                onSelect: () => navigate(`/instructor/courses/${course.id}`),
                                            },
                                            {
                                                label:
                                                    (course.status ?? "published") === "published"
                                                        ? "Move to draft"
                                                        : "Publish course",
                                                icon: Copy01Icon,
                                                onSelect: () => {
                                                    const next =
                                                        (course.status ?? "published") === "published"
                                                            ? "draft"
                                                            : "published";
                                                    updateCourse(course.id, { status: next });
                                                    toast.success(
                                                        next === "published" ? "Course published" : "Moved to draft"
                                                    );
                                                },
                                            },
                                            {
                                                label: "Delete course",
                                                icon: Delete02Icon,
                                                destructive: true,
                                                separatorBefore: true,
                                                onSelect: () => {
                                                    deleteCourse(course.id);
                                                    toast.success("Course deleted", {
                                                        description: `"${course.title}" and its ${list.length} assessments were removed.`,
                                                    });
                                                },
                                                confirm: {
                                                    title: "Delete this course?",
                                                    description: `"${course.title}", its ${course.modules.length} modules and ${list.length} assessments will be removed.`,
                                                    actionLabel: "Delete",
                                                },
                                            },
                                        ]}
                                    />
                                </div>

                                <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2 min-h-[2rem]">
                                    {course.description || "No description yet."}
                                </p>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-medium">
                                        <span className="text-slate-400">Seats filled</span>
                                        <span className="text-slate-900 tabular-nums">
                                            {course.seats.enrolled} / {course.seats.total}
                                        </span>
                                    </div>
                                    <Progress value={fill} className="h-1.5 bg-slate-100" />
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-50 text-[11px] font-medium text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <BookOpen01Icon size={12} />
                                        {course.modules.length} modules
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Task01Icon size={12} />
                                        {list.length} assessments
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <UserMultiple02Icon size={12} />
                                        {course.seats.enrolled}
                                    </span>
                                </div>

                                <Link to={`/instructor/courses/${course.id}`} className="mt-auto">
                                    <Button
                                        variant="ghost"
                                        className="w-full h-10 rounded-xl text-primary hover:bg-primary/5 font-medium text-sm justify-between px-3"
                                    >
                                        Manage course
                                        <ArrowRight01Icon size={16} />
                                    </Button>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            <CourseFormDialog
                open={formOpen}
                onOpenChange={(o) => {
                    setFormOpen(o);
                    if (!o) setEditing(null);
                }}
                course={editing}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
