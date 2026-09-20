import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight01Icon,
    PlayIcon,
    ChartLineData01Icon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    Search01Icon,
    SquareLock02Icon,
    Task01Icon,
    Timer01Icon,
    QrCode01Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { RowActions } from "@/components/shared/RowActions";
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
import { useActingUser } from "@/store/session";
import type { Assessment } from "@/data/assessment-types";
import { cn } from "@/lib/utils";

type Filter = "all" | "todo" | "passed";

const KIND_LABEL: Record<Assessment["kind"], string> = {
    prerequisite: "Prerequisite",
    checkpoint: "Checkpoint",
    final: "Final exam",
};

/** The learner's assessment hub across every enrolled course. */
export default function Assessments() {
    const navigate = useNavigate();
    const student = useActingUser("student");
    const { courses, assessments, attemptsFor, bestAttempt, enrolledCourseIds } = useLms();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");

    const enrolled = useMemo(
        () => courses.filter((c) => enrolledCourseIds.includes(c.id)),
        [courses]
    );

    const rows = useMemo(() => {
        const enrolledIds = new Set(enrolled.map((c) => c.id));
        return assessments
            .filter((a) => a.status === "published" && enrolledIds.has(a.courseId))
            .map((a) => {
                const best = bestAttempt(a.id, student.id);
                const used = attemptsFor(a.id, student.id).length;
                const left = a.maxAttempts === 0 ? Infinity : Math.max(0, a.maxAttempts - used);
                return {
                    assessment: a,
                    course: enrolled.find((c) => c.id === a.courseId)!,
                    best,
                    used,
                    left,
                };
            });
    }, [assessments, enrolled, student.id, attemptsFor, bestAttempt]);

    const visible = rows.filter((r) => {
        const matchesQuery =
            r.assessment.title.toLowerCase().includes(query.toLowerCase()) ||
            r.course.title.toLowerCase().includes(query.toLowerCase());
        const matchesFilter =
            filter === "all" ||
            (filter === "passed" && r.best?.passed === true) ||
            (filter === "todo" && r.best?.passed !== true);
        return matchesQuery && matchesFilter;
    });

    const { page, pageCount, pageRows, setPage, total, from, to } = usePagination(visible, 8);

    const passedCount = rows.filter((r) => r.best?.passed).length;
    const pendingCount = rows.length - passedCount;
    const avgScore =
        rows.filter((r) => r.best).length > 0
            ? Math.round(
                rows.filter((r) => r.best).reduce((s, r) => s + (r.best?.score ?? 0), 0) /
                rows.filter((r) => r.best).length
            )
            : 0;

    return (
        <div className="flex flex-col gap-4 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            <PageHeader
                title="Assessments"
                description="Prerequisite tests, module checkpoints and final exams for your courses."
                actions={
                    <div className="relative group w-full lg:w-72">
                        <Search01Icon
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Search assessments..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search assessments"
                            className="h-11 w-full pl-11 pr-4 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                        />
                    </div>
                }
            />

            <div className="px-1 sm:px-2">
                <StatGrid>
                <StatTile label="Assessments" value={String(rows.length)} icon={Task01Icon} />
                <StatTile label="Passed" value={String(passedCount)} icon={CheckmarkCircle01Icon} />
                <StatTile label="Outstanding" value={String(pendingCount)} icon={Timer01Icon} />
                <StatTile label="Average score" value={rows.some((r) => r.best) ? `${avgScore}%` : "—"} icon={ChartLineData01Icon} />
                </StatGrid>
            </div>

            {/* Filters */}
            <div className="px-1 sm:px-2">
                <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-100">
                    {(
                        [
                            ["all", "All", rows.length],
                            ["todo", "To do", pendingCount],
                            ["passed", "Passed", passedCount],
                        ] as const
                    ).map(([key, label, count]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={cn(
                                "pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-all relative",
                                filter === key ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {label}
                            <span
                                className={cn(
                                    "ml-2 rounded-full text-[10px] px-1.5 py-0.5",
                                    filter === key ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400"
                                )}
                            >
                                {count}
                            </span>
                            {filter === key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {rows.length === 0 ? (
                <EmptyState
                    icon={Task01Icon}
                    title="No assessments yet"
                    description="Once you enrol in a course, its prerequisite tests and exams will appear here."
                    action={
                        <Link to="/dashboard/learning">
                            <Button className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10">
                                Browse courses
                            </Button>
                        </Link>
                    }
                />
            ) : visible.length === 0 ? (
                <EmptyState
                    variant="inset"
                    icon={Search01Icon}
                    title="Nothing matches"
                    description="Try a different search term or filter."
                    className="mx-1 sm:mx-2"
                />
            ) : (
                <div className="px-1 sm:px-2">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Assessment</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Type</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Questions</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Time</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Attempts</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Best score</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pageRows.map(({ assessment, course, best, left }) => {
                                        const exhausted = left === 0 && best?.passed !== true;
                                        return (
                                            <TableRow
                                                key={assessment.id}
                                                className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                                            >
                                                <TableCell>
                                                    <div className="min-w-0 space-y-0.5">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-medium text-slate-800">
                                                                {assessment.title}
                                                            </span>
                                                            {assessment.gatesEntryPass && (
                                                                <StatusBadge tone="info" icon={QrCode01Icon}>
                                                                    Gates pass
                                                                </StatusBadge>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 font-medium truncate">
                                                            {course.title}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {KIND_LABEL[assessment.kind]}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 tabular-nums">
                                                    {assessment.questions.length}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 tabular-nums">
                                                    {assessment.timeLimitMinutes} min
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 tabular-nums">
                                                    {assessment.maxAttempts === 0
                                                        ? "Unlimited"
                                                        : `${left} of ${assessment.maxAttempts}`}
                                                </TableCell>
                                                <TableCell>
                                                    {best ? (
                                                        <StatusBadge tone={best.passed ? "good" : "critical"}>
                                                            {best.score}%
                                                        </StatusBadge>
                                                    ) : (
                                                        <StatusBadge tone="neutral">Not started</StatusBadge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <RowActions
                                                        label={`Actions for ${assessment.title}`}
                                                        actions={[
                                                            {
                                                                label: exhausted
                                                                    ? "No attempts left"
                                                                    : best
                                                                        ? "Retake assessment"
                                                                        : "Start assessment",
                                                                icon: exhausted ? SquareLock02Icon : PlayIcon,
                                                                disabled: exhausted,
                                                                onSelect: () =>
                                                                    navigate(`/dashboard/assessments/${assessment.id}/take`),
                                                            },
                                                            {
                                                                label: "View last result",
                                                                icon: ChartLineData01Icon,
                                                                disabled: !best,
                                                                onSelect: () =>
                                                                    navigate(
                                                                        `/dashboard/assessments/${assessment.id}/result/${best!.id}`
                                                                    ),
                                                            },
                                                            {
                                                                label: "Go to course",
                                                                icon: ArrowRight01Icon,
                                                                separatorBefore: true,
                                                                onSelect: () =>
                                                                    navigate(`/dashboard/learning/${course.id}`),
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
                            label="assessments"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
