import { useMemo } from "react";
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
import { gradeAssessment, remedialModuleIds, formatDuration } from "@/lib/grading";
import { cn } from "@/lib/utils";

/**
 * Post-submission results.
 *
 * Shows the score against the pass mark, then per-question review, then — when
 * the learner missed questions that map to a module — direct remediation links
 * back into exactly those modules.
 */
export default function QuizResults() {
    const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
    const navigate = useNavigate();
    const student = useActingUser("student");
    const { getAssessment, getCourse, getAttempt, attemptsFor, entryPassUnlocked } = useLms();

    const assessment = assessmentId ? getAssessment(assessmentId) : undefined;
    const attempt = attemptId ? getAttempt(attemptId) : undefined;
    const course = assessment ? getCourse(assessment.courseId) : undefined;

    const result = useMemo(
        () => (assessment && attempt ? gradeAssessment(assessment, attempt.answers) : null),
        [assessment, attempt]
    );

    if (!assessment || !attempt || !course || !result) {
        return (
            <EmptyState
                icon={Task01Icon}
                title="Result not found"
                description="This attempt is no longer available."
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

    const attemptsUsed = attemptsFor(assessment.id, student.id).length;
    const attemptsLeft =
        assessment.maxAttempts === 0 ? Infinity : Math.max(0, assessment.maxAttempts - attemptsUsed);

    const passUnlocked = entryPassUnlocked(course.id, student.id);

    return (
        <div className="flex flex-col gap-5 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Score summary */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 mx-1 sm:mx-2">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    <ScoreRing
                        score={attempt.score}
                        passingScore={assessment.passingScore}
                        passed={attempt.passed}
                    />

                    <div className="flex-1 min-w-0 space-y-5 text-center lg:text-left">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                {course.title}
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
                                {assessment.title}
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                {attempt.passed
                                    ? `You cleared the ${assessment.passingScore}% pass mark.`
                                    : `You needed ${assessment.passingScore}% to pass. Review the modules below and try again.`}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3">
                            <Metric label="Correct" value={`${correctCount} / ${result.graded.length}`} />
                            <Metric label="Points" value={`${result.pointsEarned} / ${result.pointsPossible}`} />
                            <Metric label="Time taken" value={formatDuration(attempt.durationSeconds)} icon={Timer01Icon} />
                            <Metric label="Attempt" value={`#${attempt.attemptNumber}`} />
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                            {!attempt.passed && attemptsLeft > 0 && (
                                <Button
                                    onClick={() => navigate(`/dashboard/assessments/${assessment.id}/take`)}
                                    className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                                >
                                    Retake assessment
                                    {attemptsLeft !== Infinity && (
                                        <span className="ml-2 text-[11px] opacity-80">
                                            {attemptsLeft} left
                                        </span>
                                    )}
                                </Button>
                            )}
                            <Link to="/dashboard/assessments">
                                <Button
                                    variant="outline"
                                    className="h-11 px-6 rounded-full border-slate-200 text-slate-600 font-medium"
                                >
                                    All assessments
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entry pass unlocked */}
            {assessment.gatesEntryPass && attempt.passed && passUnlocked && (
                <div className="mx-1 sm:mx-2 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <QrCode01Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-medium text-slate-900">Entry pass released</h2>
                        <p className="text-sm text-slate-500 font-normal">
                            You have cleared the prerequisite for {course.title}. Your QR pass for the physical
                            session is now available.
                        </p>
                    </div>
                    <Link to="/dashboard/passes" className="shrink-0">
                        <Button className="h-11 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                            View pass
                            <ArrowRight01Icon size={16} className="ml-1.5" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* Smart remediation */}
            {remedialModules.length > 0 && (
                <div className="mx-1 sm:mx-2 rounded-3xl border border-slate-100 bg-white p-5 sm:p-8">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                            <Idea01Icon size={20} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-medium text-slate-900">Recommended revision</h2>
                            <p className="text-sm text-slate-500 font-normal">
                                Based on the questions you missed, these modules will close the gap fastest.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
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
                                        className="group flex items-center justify-between gap-4 py-4 px-3 -mx-3 rounded-2xl hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-accent/40 group-hover:text-primary transition-colors">
                                                <Book02Icon size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                    {module.title}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-medium">
                                                    {missed} missed {missed === 1 ? "question" : "questions"} map here
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight01Icon
                                            size={18}
                                            className="text-slate-300 group-hover:text-primary transition-colors shrink-0"
                                        />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Per-question review */}
            <div className="mx-1 sm:mx-2 space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-medium text-slate-900">Answer review</h2>
                    <div className="flex items-center gap-2">
                        <StatusBadge tone="good" icon={CheckmarkCircle01Icon}>
                            {correctCount} correct
                        </StatusBadge>
                        {result.graded.length - correctCount > 0 && (
                            <StatusBadge tone="critical" icon={Cancel01Icon}>
                                {result.graded.length - correctCount} wrong
                            </StatusBadge>
                        )}
                    </div>
                </div>

                {result.graded.map((g, i) => (
                    <div
                        key={g.question.id}
                        className={cn(
                            "bg-white rounded-3xl border p-5 sm:p-8",
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
}: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
    return (
        <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-center lg:justify-start">
                {Icon && <Icon size={11} />}
                {label}
            </p>
            <p className="text-lg font-medium text-slate-900 tabular-nums">{value}</p>
        </div>
    );
}
