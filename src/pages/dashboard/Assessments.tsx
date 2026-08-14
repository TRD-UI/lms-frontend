import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight01Icon,
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
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { purchasedCourseIds } from "@/data/courses";
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
    const student = useActingUser("student");
    const { courses, assessments, attemptsFor, bestAttempt } = useLms();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");

    const enrolled = useMemo(
        () => courses.filter((c) => purchasedCourseIds.includes(c.id)),
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
                <StatTile label="Average score" value={rows.some((r) => r.best) ? `${avgScore}%` : "—"} />
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
                <div className="grid gap-3 lg:grid-cols-2 px-1 sm:px-2">
                    {visible.map(({ assessment, course, best, left }) => {
                        const exhausted = left === 0 && best?.passed !== true;
                        return (
                            <div
                                key={assessment.id}
                                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 flex flex-col gap-4 transition-shadow hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                                {KIND_LABEL[assessment.kind]}
                                            </span>
                                            {assessment.gatesEntryPass && (
                                                <StatusBadge tone="info" icon={QrCode01Icon}>
                                                    Gates entry pass
                                                </StatusBadge>
                                            )}
                                        </div>
                                        <h3 className="text-base font-medium text-slate-900 leading-snug">
                                            {assessment.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium truncate">
                                            {course.title}
                                        </p>
                                    </div>

                                    {best ? (
                                        <StatusBadge
                                            tone={best.passed ? "good" : "critical"}
                                            icon={best.passed ? CheckmarkCircle01Icon : Cancel01Icon}
                                        >
                                            {best.score}%
                                        </StatusBadge>
                                    ) : (
                                        <StatusBadge tone="neutral">Not started</StatusBadge>
                                    )}
                                </div>

                                <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                                    {assessment.description}
                                </p>

                                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Task01Icon size={13} />
                                        {assessment.questions.length} questions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Timer01Icon size={13} />
                                        {assessment.timeLimitMinutes} min
                                    </span>
                                    <span>Pass mark {assessment.passingScore}%</span>
                                    {assessment.maxAttempts > 0 && (
                                        <span>
                                            {left === Infinity ? "Unlimited" : `${left} of ${assessment.maxAttempts}`}{" "}
                                            attempts left
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-auto pt-1">
                                    {exhausted ? (
                                        <Button
                                            disabled
                                            className="h-11 px-5 rounded-full bg-slate-100 text-slate-400 font-medium cursor-not-allowed"
                                        >
                                            <SquareLock02Icon size={16} className="mr-1.5" />
                                            No attempts left
                                        </Button>
                                    ) : (
                                        <Link to={`/dashboard/assessments/${assessment.id}/take`}>
                                            <Button className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10">
                                                {best ? "Retake" : "Start"}
                                                <ArrowRight01Icon size={16} className="ml-1.5" />
                                            </Button>
                                        </Link>
                                    )}
                                    {best && (
                                        <Link to={`/dashboard/assessments/${assessment.id}/result/${best.id}`}>
                                            <Button
                                                variant="ghost"
                                                className="h-11 px-4 rounded-full text-slate-500 font-medium hover:text-primary hover:bg-primary/5"
                                            >
                                                View result
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
