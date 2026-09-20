import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight01Icon,
    CheckmarkCircle01Icon,
    QrCode01Icon,
    Search01Icon,
    Task01Icon,
    UserMultiple02Icon,
    ViewIcon,
} from "hugeicons-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RowActions } from "@/components/shared/RowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useLms } from "@/store/lms-store";

/**
 * Assessment oversight: one row per course.
 *
 * Read-only by design. Assessments belong to the course's assigned instructor,
 * who authors them in the instructor portal; the admin sees coverage and
 * outcomes across every course but does not create or edit them.
 */
export default function AdminAssessments() {
    const navigate = useNavigate();
    const { courses, assessments, attempts } = useLms();
    const [query, setQuery] = useState("");

    const rows = useMemo(
        () =>
            courses.map((course) => {
                const list = assessments.filter((a) => a.courseId === course.id);
                const courseAttempts = attempts.filter((a) => a.courseId === course.id);
                return {
                    course,
                    total: list.length,
                    published: list.filter((a) => a.status === "published").length,
                    drafts: list.filter((a) => a.status === "draft").length,
                    questions: list.reduce((s, a) => s + a.questions.length, 0),
                    gating: list.filter((a) => a.gatesEntryPass).length,
                    attempts: courseAttempts.length,
                    passRate:
                        courseAttempts.length > 0
                            ? Math.round(
                                (courseAttempts.filter((a) => a.passed).length / courseAttempts.length) * 100
                            )
                            : null,
                };
            }),
        [courses, assessments, attempts]
    );

    const visible = rows.filter((r) =>
        r.course.title.toLowerCase().includes(query.toLowerCase())
    );

    const { page, pageCount, pageRows, setPage, total, from, to } = usePagination(visible, 8);

    const totals = {
        assessments: assessments.length,
        published: assessments.filter((a) => a.status === "published").length,
        questions: assessments.reduce((s, a) => s + a.questions.length, 0),
        coursesWithout: rows.filter((r) => r.total === 0).length,
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Assessments"
                description="Coverage and outcomes per course. Instructors author their own assessments."
                actions={
                    <div className="relative group w-full lg:w-72">
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
                }
            />

            <div className="px-1 sm:px-2">
                <StatGrid>
                <StatTile label="Assessments" value={String(totals.assessments)} icon={Task01Icon} />
                <StatTile
                    label="Published"
                    value={String(totals.published)}
                    hint={`${totals.assessments - totals.published} in draft`}
                    icon={CheckmarkCircle01Icon}
                />
                <StatTile label="Questions in bank" value={String(totals.questions)} icon={UserMultiple02Icon} />
                <StatTile
                    label="Courses without one"
                    value={String(totals.coursesWithout)}
                    hint="No assessment configured yet"
                />
                </StatGrid>
            </div>

            {visible.length === 0 ? (
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
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Instructor</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Assessments</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Questions</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Attempts</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Pass rate</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pageRows.map((row) => (
                                        <TableRow
                                            key={row.course.id}
                                            className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell>
                                                <Link to={`/admin/assessments/${row.course.id}`} className="min-w-0 block group">
                                                    <span className="text-sm font-medium text-slate-800 group-hover:text-primary transition-colors">
                                                        {row.course.title}
                                                    </span>
                                                    <p className="text-[11px] text-slate-400 font-medium">
                                                        {row.course.category}
                                                    </p>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {row.course.instructorName ?? (
                                                    <span className="text-slate-300">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-slate-800 tabular-nums">
                                                {row.total}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {row.published > 0 && (
                                                        <StatusBadge tone="good">{row.published} live</StatusBadge>
                                                    )}
                                                    {row.drafts > 0 && (
                                                        <StatusBadge tone="warning">{row.drafts} draft</StatusBadge>
                                                    )}
                                                    {row.gating > 0 && (
                                                        <StatusBadge tone="info" icon={QrCode01Icon}>
                                                            {row.gating}
                                                        </StatusBadge>
                                                    )}
                                                    {row.total === 0 && (
                                                        <StatusBadge tone="neutral">None yet</StatusBadge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 tabular-nums">
                                                {row.questions}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 tabular-nums">
                                                {row.attempts}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 tabular-nums">
                                                {row.passRate === null ? "—" : `${row.passRate}%`}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <RowActions
                                                    label={`Actions for ${row.course.title}`}
                                                    actions={[
                                                        {
                                                            label: "View assessments",
                                                            icon: ViewIcon,
                                                            onSelect: () =>
                                                                navigate(`/admin/assessments/${row.course.id}`),
                                                        },
                                                        {
                                                            label: "Open course",
                                                            icon: ArrowRight01Icon,
                                                            onSelect: () => navigate(`/admin/courses`),
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
        </div>
    );
}
