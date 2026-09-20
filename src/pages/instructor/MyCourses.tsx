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
import { MiniDonut } from "@/components/shared/MiniDonut";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    CourseFormDialog,
    draftToFees,
    type CourseDraft,
} from "@/components/courses/CourseFormDialog";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import type { Course } from "@/data/types";
import { toast } from "sonner";
import { describeError } from "@/lib/supabase";

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

    const { page, pageCount, pageRows, setPage, total, from, to } = usePagination(visible, 8);

    const handleSubmit = async (draft: CourseDraft) => {
        const shared = {
            title: draft.title,
            description: draft.description,
            category: draft.category,
            duration: draft.duration,
            location: draft.location,
            fees: draftToFees(draft),
            status: draft.status,
        };

        try {
        if (editing) {
            await updateCourse(editing.id, {
                ...shared,
                seats: { enrolled: editing.seats.enrolled, total: draft.seatsTotal },
            });
            toast.success("Course updated", { description: `"${draft.title}" saved.` });
        } else {
            const created = await createCourse({
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
        } catch (e) {
            toast.error("Could not save the course", {
                description: describeError(e as { message?: string }),
            });
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
                <div className="px-1 sm:px-2">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Course</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest w-44">Seats</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Modules</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Assessments</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pageRows.map((course) => {
                                        const assessments = assessmentsForCourse(course.id);
                                        const lessons = course.modules.reduce((n, m) => n + m.items.length, 0);
                                        const filled = course.seats.total === 0
                                            ? 0
                                            : Math.round((course.seats.enrolled / course.seats.total) * 100);
                                        return (
                                            <TableRow key={course.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <TableCell>
                                                    <Link to={`/instructor/courses/${course.id}`} className="block min-w-0 group">
                                                        <span className="text-sm font-medium text-slate-800 group-hover:text-primary transition-colors">
                                                            {course.title}
                                                        </span>
                                                        <p className="text-[11px] text-slate-400 font-medium truncate">
                                                            {course.category} · {course.duration}
                                                        </p>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge tone={toneForStatus(course.status ?? "draft")}>
                                                        {course.status ?? "draft"}
                                                    </StatusBadge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <MiniDonut value={filled} size={40} label="of seats filled" />
                                                        <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                                                            {course.seats.enrolled} / {course.seats.total}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 tabular-nums">
                                                    {course.modules.length}
                                                    <span className="text-slate-300 text-xs"> · {lessons} lessons</span>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 tabular-nums">
                                                    {assessments.length}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <RowActions
                                                        label={`Actions for ${course.title}`}
                                                        actions={[
                                                            {
                                                                label: "Manage course",
                                                                icon: ViewIcon,
                                                                onSelect: () => navigate(`/instructor/courses/${course.id}`),
                                                            },
                                                            {
                                                                label: "Edit settings",
                                                                icon: Edit01Icon,
                                                                onSelect: () => {
                                                                    setEditing(course);
                                                                    setFormOpen(true);
                                                                },
                                                            },
                                                            {
                                                                label: (course.status ?? "draft") === "published" ? "Unpublish" : "Publish",
                                                                icon: Task01Icon,
                                                                onSelect: () => {
                                                                    const next = (course.status ?? "draft") === "published" ? "draft" : "published";
                                                                    updateCourse(course.id, { status: next });
                                                                    toast.success(next === "published" ? "Course published" : "Moved to draft");
                                                                },
                                                            },
                                                            {
                                                                label: "Delete course",
                                                                icon: Delete02Icon,
                                                                destructive: true,
                                                                separatorBefore: true,
                                                                onSelect: () => {
                                                                    deleteCourse(course.id);
                                                                    toast.success("Course deleted");
                                                                },
                                                                confirm: {
                                                                    title: "Delete this course?",
                                                                    description: `"${course.title}" and its ${assessments.length} assessments will be removed.`,
                                                                    actionLabel: "Delete",
                                                                },
                                                            },
                                                        ]}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <TablePagination
                            page={page}
                            pageCount={pageCount}
                            from={from}
                            to={to}
                            total={total}
                            onPageChange={setPage}
                            label="courses"
                        />
                    </div>
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
