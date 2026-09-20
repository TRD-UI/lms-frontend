import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowRight01Icon,
    Book02Icon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    Idea01Icon,
    QrCode01Icon,
    Task01Icon,
    Timer01Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/dashboard/assessments/ScoreRing";
import { QuestionCard } from "@/components/dashboard/assessments/QuestionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { remedialModuleIds, formatDuration } from "@/lib/grading";
import { describeError } from "@/lib/supabase";
import type { AttemptResult } from "@/lib/api/assessments";
import { cn } from "@/lib/utils";

/**
 * Post-submission results.
 *
 * Two columns: the score on the left, and on the right whatever the outcome
 * earned — a released entry pass, the modules worth revising, or both. Below a
 * rule, the per-question review.
 */
export default function QuizResults() {
    const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
    const navigate = useNavigate();
    const student = useActingUser("student");
    const { getAssessment, getCourse, attemptsFor, entryPassUnlocked, fetchAttemptResult } = useLms();

    const assessment = assessmentId ? getAssessment(assessmentId) : undefined;
    const course = assessment ? getCourse(assessment.courseId) : undefined;

    /**
     * Grading is server-side, so the per-question breakdown — including the
     * answer key, which the learner cannot read off the tables — comes from
     * attempt_result(). It is only readable once the attempt is submitted.
     */
    const [data, setData] = useState<AttemptResult | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!attemptId) return;
        let active = true;
        setLoading(true);
        fetchAttemptResult(attemptId)
            .then((r) => active && setData(r))
            .catch((e) => active && setLoadError(describeError(e as { message?: string })))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [attemptId, fetchAttemptResult]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-7 w-7 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const attempt = data?.attempt;
    const result = data ? { graded: data.graded, pointsEarned: data.attempt.pointsEarned, pointsPossible: data.attempt.pointsPossible } : null;

    if (!assessment || !attempt || !course || !result) {
        return (
            <EmptyState
                icon={Task01Icon}
                title="Result not found"
                description={loadError ?? "This attempt is no longer available."}
                action={
                    <Link to="/dashboard/assessments">
                        <Button className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium">
                            Back to assessments
                        </Button>
                    </Link>
                }
            />
        );
    }

    const remedialIds = remedialModuleIds(result.graded);
    const remedialModules = course.modules.filter((m) => remedialIds.includes(m.id));
    const correctCount = result.graded.filter((g) => g.correct).length;
    const wrongCount = result.graded.length - correctCount;

    const attemptsUsed = attemptsFor(assessment.id, student.id).length;
    const attemptsLeft =
        assessment.maxAttempts === 0 ? Infinity : Math.max(0, assessment.maxAttempts - attemptsUsed);

    const passReleased =
        assessment.gatesEntryPass && attempt.passed && entryPassUnlocked(course.id, student.id);
    const hasAside = passReleased || remedialModules.length > 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-1 sm:px-2">
            {/* ── Summary ───────────────────────────────────────────────── */}
            <div className={cn(
                "grid gap-6",
                hasAside && "lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-slate-100"
            )}>
                <div className={cn(
                    "flex flex-col sm:flex-row items-center gap-5 sm:gap-7 min-w-0",
                    hasAside && "lg:pr-8"
                )}>
                    <ScoreRing
                        score={attempt.score}
                        passingScore={assessment.passingScore}
                        passed={attempt.passed}
                        size={132}
                    />

                    <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                {course.title}
                            </p>
                            <h1 className="text-lg font-medium tracking-tight text-slate-900 truncate">
                                {assessment.title}
                            </h1>
                        </div>

                        {/* Metrics, divided rather than spaced. */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start divide-x divide-slate-200">
                            <Metric label="Correct" value={`${correctCount} / ${result.graded.length}`} first />
                            <Metric label="Points" value={`${result.pointsEarned} / ${result.pointsPossible}`} />
                            <Metric label="Time" value={formatDuration(attempt.durationSeconds)} icon={Timer01Icon} />
                            <Metric label="Attempt" value={`#${attempt.attemptNumber}`} />
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                            {!attempt.passed && attemptsLeft > 0 && (
                                <Button
                                    onClick={() => navigate(`/dashboard/assessments/${assessment.id}/take`)}
                                    className="h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10"
                                >
                                    Retake
                                    {attemptsLeft !== Infinity && (
                                        <span className="ml-1.5 text-[11px] opacity-80">{attemptsLeft} left</span>
                                    )}
                                </Button>
                            )}
                            <Link to="/dashboard/assessments">
                                <Button
                                    variant="outline"
                                    className="h-10 px-5 rounded-full border-slate-200 text-slate-600 font-medium text-sm"
                                >
                                    All assessments
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {hasAside && (
                    <>
                        <div className="lg:hidden h-px bg-slate-100" />

                        <aside className="flex flex-col min-h-0 lg:pl-8">
                            <div className="flex flex-col gap-4 lg:max-h-[248px] overflow-y-auto scrollbar-thin -mr-2 pr-2">
                            {passReleased && (
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                        <QrCode01Icon size={18} />
                                    </div>
                                    <div className="min-w-0 space-y-1.5">
                                        <div>
                                            <h2 className="text-lg font-medium text-slate-900">Entry pass released</h2>
                                            <p className="text-xs text-slate-500 font-normal leading-relaxed">
                                                Your QR pass for the {course.title} session is now available.
                                            </p>
                                        </div>
                                        <Link to="/dashboard/passes">
                                            <Button
                                                size="sm"
                                                className="h-8 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                                            >
                                                View pass
                                                <ArrowRight01Icon size={14} className="ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {passReleased && remedialModules.length > 0 && (
                                <div className="h-px bg-slate-100" />
                            )}

                            {remedialModules.length > 0 && (
                                <div className="flex flex-col min-h-0">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                            <Idea01Icon size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-lg font-medium text-slate-900">Recommended revision</h2>
                                            <p className="text-xs text-slate-500 font-normal leading-relaxed">
                                                The modules behind the questions you missed.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        {remedialModules.map((module, i) => {
                                            const missed = result.graded.filter(
                                                (g) => !g.correct && g.question.remedialModuleId === module.id
                                            ).length;
                                            const firstItem = module.items[0];
                                            return (
                                                <div key={module.id}>
                                                    {i > 0 && <div className="h-px bg-slate-100" />}
                                                    <Link
                                                        to={
                                                            firstItem
                                                                ? `/dashboard/player/${course.id}/${module.id}/${firstItem.id}`
                                                                : `/dashboard/learning/${course.id}`
                                                        }
                                                        className="group flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-accent/40 group-hover:text-primary transition-colors">
                                                                <Book02Icon size={16} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-medium text-slate-800 truncate">
                                                                    {module.title}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 font-medium">
                                                                    {missed} missed
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight01Icon
                                                            size={16}
                                                            className="text-slate-300 group-hover:text-primary transition-colors shrink-0"
                                                        />
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            </div>
                        </aside>
                    </>
                )}
            </div>

            {/* ── Rule between the summary and the review ───────────────── */}
            <div className="h-px bg-slate-100 my-7 sm:my-9" />

            {/* ── Per-question review ───────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-medium text-slate-900">Answer review</h2>
                    <div className="flex items-center gap-2">
                        <StatusBadge tone="good" icon={CheckmarkCircle01Icon}>
                            {correctCount} correct
                        </StatusBadge>
                        {wrongCount > 0 && (
                            <StatusBadge tone="critical" icon={Cancel01Icon}>
                                {wrongCount} wrong
                            </StatusBadge>
                        )}
                    </div>
                </div>

                {result.graded.map((g, i) => (
                    <div
                        key={g.question.id}
                        className={cn(
                            "bg-white rounded-3xl border p-5 sm:p-7",
                            g.correct ? "border-slate-100" : "border-red-100"
                        )}
                    >
                        <QuestionCard
                            question={g.question}
                            index={i}
                            total={result.graded.length}
                            selectedOptionIds={g.selectedOptionIds}
                            onChange={() => undefined}
                            review
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
    icon: Icon,
    first,
}: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    first?: boolean;
}) {
    return (
        <div className={cn("py-0.5", first ? "pr-4" : "px-4")}>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1">
                {Icon && <Icon size={11} />}
                {label}
            </p>
            <p className="text-base font-medium text-slate-900 tabular-nums">{value}</p>
        </div>
    );
}
