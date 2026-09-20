import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Add01Icon,
    ArrowUp01Icon,
    BookOpen01Icon,
    Copy01Icon,
    Delete02Icon,
    Edit01Icon,
    Search01Icon,
    Task01Icon,
    UserAdd01Icon,
    ViewIcon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { RowActions } from "@/components/shared/RowActions";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/shared/StatusBadge";
import {
    CourseFormDialog,
    draftToFees,
    type CourseDraft,
} from "@/components/courses/CourseFormDialog";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { waitlistEntries as seedWaitlist } from "@/data/admin";
import type { Course } from "@/data/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Admin: course CRUD and waitlist control, backed by the shared LMS store. */
export default function CourseManager() {
    const navigate = useNavigate();
    const admin = useActingUser("admin");
    const { courses, createCourse, updateCourse, deleteCourse, assessmentsForCourse, instructors } = useLms();

    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<"courses" | "waitlist">("courses");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);
    const [waitlist, setWaitlist] = useState(seedWaitlist);

    const filtered = courses.filter(
        (c) =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.category.toLowerCase().includes(query.toLowerCase())
    );

    const coursePage = usePagination(filtered, 8);
    const waitlistPage = usePagination(waitlist, 8);

    const handleSubmit = (draft: CourseDraft) => {
        // The assigned instructor is what puts the course on their dashboard and
        // grants them authoring rights over its modules and assessments.
        const assigned = instructors.find((i) => i.id === draft.instructorId);

        const shared = {
            title: draft.title,
            description: draft.description,
            category: draft.category,
            duration: draft.duration,
            location: draft.location,
            fees: draftToFees(draft),
            status: draft.status,
            instructorId: assigned?.id,
            instructorName: assigned?.name,
        };

        if (editing) {
            updateCourse(editing.id, {
                ...shared,
                seats: { enrolled: editing.seats.enrolled, total: draft.seatsTotal },
            });
            toast.success("Course updated", { description: `"${draft.title}" saved.` });
        } else {
            createCourse({
                ...shared,
                seats: { enrolled: 0, total: draft.seatsTotal },
                progress: 0,
                modules: [],
            });
            toast.success("Course created", { description: `"${draft.title}" added to the catalog.` });
        }
        setEditing(null);
    };

    /** Promoting takes the learner off the waitlist and consumes a seat. */
    const promote = (entry: (typeof seedWaitlist)[number]) => {
        const course = courses.find((c) => c.title === entry.courseTitle);
        if (course && course.seats.enrolled < course.seats.total) {
            updateCourse(course.id, {
                seats: { ...course.seats, enrolled: course.seats.enrolled + 1 },
            });
        }
        setWaitlist((prev) =>
            prev
                .filter((e) => e.id !== entry.id)
                .map((e, i) => ({ ...e, position: i + 1 }))
        );
        toast.success(`${entry.studentName} promoted`, {
            description: course
                ? `Enrolled onto ${entry.courseTitle}.`
                : `${entry.courseTitle} is no longer in the catalog — removed from the waitlist.`,
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Course Manager"
                description="Define courses, capacity and fees, and control the waitlist."
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
                                aria-label="Search courses"
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

            {/* Tabs */}
            <div className="px-1 sm:px-2">
                <div className="flex items-center gap-8 border-b border-slate-100">
                    {(
                        [
                            ["courses", "Courses", courses.length],
                            ["waitlist", "Waitlist", waitlist.length],
                        ] as const
                    ).map(([key, label, count]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={cn(
                                "pb-4 text-sm font-medium transition-all relative",
                                tab === key ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {label}
                            <span
                                className={cn(
                                    "ml-2 rounded-full text-[10px] px-1.5 py-0.5",
                                    tab === key ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400"
                                )}
                            >
                                {count}
                            </span>
                            {tab === key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "courses" ? (
                filtered.length === 0 ? (
                    <EmptyState
                        icon={BookOpen01Icon}
                        title="No courses found"
                        description="Try adjusting your search, or create a new course."
                        action={
                            <Button
                                onClick={() => {
                                    setEditing(null);
                                    setFormOpen(true);
                                }}
                                className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                            >
                                <Add01Icon size={16} className="mr-2" />
                                Create course
                            </Button>
                        }
                    />
                ) : (
                    <Card className="border-slate-100 rounded-2xl shadow-none mx-1 sm:mx-2">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-100 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Course</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Instructor</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Capacity</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Assessments</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Fees</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coursePage.pageRows.map((course) => {
                                            const list = assessmentsForCourse(course.id);
                                            const full = course.seats.enrolled >= course.seats.total;
                                            return (
                                                <TableRow
                                                    key={course.id}
                                                    className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800 text-sm">
                                                                {course.title}
                                                            </span>
                                                            <StatusBadge
                                                                tone={toneForStatus(course.status ?? "published")}
                                                            >
                                                                {course.status ?? "published"}
                                                            </StatusBadge>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                                                            {course.category} · {course.duration}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-600">
                                                        {course.instructorName ?? "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-slate-600 tabular-nums">
                                                            {course.seats.enrolled}/{course.seats.total}
                                                        </span>
                                                        {full && (
                                                            <StatusBadge tone="critical" className="ml-2">
                                                                Full
                                                            </StatusBadge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-600 tabular-nums">
                                                        {list.length}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                                                        {course.fees.type === "flat"
                                                            ? `₦${course.fees.amount?.toLocaleString()}`
                                                            : "Tiered"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <RowActions
                                                            label={`Actions for ${course.title}`}
                                                            actions={[
                                                                {
                                                                    label: "View assessments",
                                                                    icon: Task01Icon,
                                                                    onSelect: () =>
                                                                        navigate(`/admin/assessments/${course.id}`),
                                                                },
                                                                {
                                                                    label: "Edit course",
                                                                    icon: Edit01Icon,
                                                                    onSelect: () => {
                                                                        setEditing(course);
                                                                        setFormOpen(true);
                                                                    },
                                                                },
                                                                {
                                                                    label:
                                                                        (course.status ?? "published") === "published"
                                                                            ? "Move to draft"
                                                                            : "Publish course",
                                                                    icon: ViewIcon,
                                                                    onSelect: () => {
                                                                        const next =
                                                                            (course.status ?? "published") ===
                                                                                "published"
                                                                                ? "draft"
                                                                                : "published";
                                                                        updateCourse(course.id, { status: next });
                                                                        toast.success(
                                                                            next === "published"
                                                                                ? "Course published"
                                                                                : "Moved to draft"
                                                                        );
                                                                    },
                                                                },
                                                                {
                                                                    label: "Duplicate",
                                                                    icon: Copy01Icon,
                                                                    onSelect: () => {
                                                                        createCourse({
                                                                            ...course,
                                                                            title: `${course.title} (copy)`,
                                                                            status: "draft",
                                                                            seats: { enrolled: 0, total: course.seats.total },
                                                                            modules: course.modules,
                                                                        });
                                                                        toast.success("Course duplicated", {
                                                                            description: "The copy was created as a draft.",
                                                                        });
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
                                                                        description: `"${course.title}", its ${course.modules.length} modules and ${list.length} assessments will be removed. ${course.seats.enrolled} enrolled learners will lose access.`,
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
                                page={coursePage.page}
                                pageCount={coursePage.pageCount}
                                onPageChange={coursePage.setPage}
                                from={coursePage.from}
                                to={coursePage.to}
                                total={coursePage.total}
                                label="courses"
                            />
                        </CardContent>
                    </Card>
                )
            ) : waitlist.length === 0 ? (
                <EmptyState
                    icon={UserAdd01Icon}
                    title="Waitlist empty"
                    description="No students are currently waiting for enrollment."
                />
            ) : (
                <Card className="border-slate-100 rounded-2xl shadow-none mx-1 sm:mx-2">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">#</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Student</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Course</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Requested</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {waitlistPage.pageRows.map((entry) => (
                                        <TableRow
                                            key={entry.id}
                                            className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell className="text-sm font-medium text-slate-400 tabular-nums">
                                                #{entry.position}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-slate-800">
                                                {entry.studentName}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {entry.courseTitle}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-400">
                                                {entry.requestDate}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <RowActions
                                                    label={`Actions for ${entry.studentName}`}
                                                    actions={[
                                                        {
                                                            label: "Promote to enrolled",
                                                            icon: ArrowUp01Icon,
                                                            onSelect: () => promote(entry),
                                                            confirm: {
                                                                title: "Promote this student?",
                                                                description: `${entry.studentName} will be enrolled onto ${entry.courseTitle} and take a seat.`,
                                                                actionLabel: "Promote",
                                                            },
                                                        },
                                                        {
                                                            label: "Remove from waitlist",
                                                            icon: Delete02Icon,
                                                            destructive: true,
                                                            separatorBefore: true,
                                                            onSelect: () => {
                                                                setWaitlist((prev) =>
                                                                    prev
                                                                        .filter((e) => e.id !== entry.id)
                                                                        .map((e, i) => ({ ...e, position: i + 1 }))
                                                                );
                                                                toast.success(`${entry.studentName} removed`);
                                                            },
                                                            confirm: {
                                                                title: "Remove from waitlist?",
                                                                description: `${entry.studentName} will lose their place in the queue for ${entry.courseTitle}.`,
                                                                actionLabel: "Remove",
                                                            },
                                                        },
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <TablePagination
                            page={waitlistPage.page}
                            pageCount={waitlistPage.pageCount}
                            onPageChange={waitlistPage.setPage}
                            from={waitlistPage.from}
                            to={waitlistPage.to}
                            total={waitlistPage.total}
                            label="students"
                        />
                    </CardContent>
                </Card>
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
