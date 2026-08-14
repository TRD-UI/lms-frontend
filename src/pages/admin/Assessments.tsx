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
    Add01Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { RowActions } from "@/components/shared/RowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useLms } from "@/store/lms-store";
import { cn } from "@/lib/utils";

/**
 * Assessment home: one card per course showing how many assessments sit under
 * it. Drilling in opens that course's assessment list, then a single assessment.
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
                description="Browse by course, then drill into an individual assessment."
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
                <StatTile label="Questions in bank" value={String(totals.questions)} />
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
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 px-1 sm:px-2">
                    {visible.map((row) => (
                        <div
                            key={row.course.id}
                            className={cn(
                                "group bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-all hover:shadow-sm",
                                row.total === 0 ? "border-dashed border-slate-200" : "border-slate-100"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <Link to={`/admin/assessments/${row.course.id}`} className="min-w-0 space-y-1">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                        {row.course.category}
                                    </p>
                                    <h3 className="text-base font-medium text-slate-900 leading-snug group-hover:text-primary transition-colors">
                                        {row.course.title}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-medium truncate">
                                        {row.course.instructorName ?? "Unassigned"}
                                    </p>
                                </Link>

                                <RowActions
                                    label={`Actions for ${row.course.title}`}
                                    actions={[
                                        {
                                            label: "View assessments",
                                            icon: ViewIcon,
                                            onSelect: () => navigate(`/admin/assessments/${row.course.id}`),
                                        },
                                        {
                                            label: "Add assessment",
                                            icon: Add01Icon,
                                            onSelect: () => navigate(`/admin/assessments/${row.course.id}?new=1`),
                                        },
                                    ]}
                                />
                            </div>

                            {/* The count, as the card's headline number */}
                            <Link
                                to={`/admin/assessments/${row.course.id}`}
                                className="flex items-end justify-between gap-3"
                            >
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-medium tracking-tight text-slate-900 tabular-nums">
                                        {row.total}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">
                                        {row.total === 1 ? "assessment" : "assessments"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    {row.published > 0 && (
                                        <StatusBadge tone="good">{row.published} live</StatusBadge>
                                    )}
                                    {row.drafts > 0 && (
                                        <StatusBadge tone="warning">{row.drafts} draft</StatusBadge>
                                    )}
                                    {row.gating > 0 && (
                                        <StatusBadge tone="info" icon={QrCode01Icon}>
                                            {row.gating} gating
                                        </StatusBadge>
                                    )}
                                </div>
                            </Link>

                            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-50 text-[11px] font-medium text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Task01Icon size={12} />
                                    {row.questions} questions
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserMultiple02Icon size={12} />
                                    {row.attempts} attempts
                                </span>
                                <span>{row.passRate === null ? "— pass rate" : `${row.passRate}% pass`}</span>
                            </div>

                            <Link to={`/admin/assessments/${row.course.id}`} className="mt-auto">
                                <Button
                                    variant="ghost"
                                    className="w-full h-10 rounded-xl text-primary hover:bg-primary/5 font-medium text-sm justify-between px-3"
                                >
                                    {row.total === 0 ? "Set up assessments" : "Manage assessments"}
                                    <ArrowRight01Icon size={16} />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
