import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Cancel01Icon,
    CheckmarkCircle01Icon,
    Flag02Icon,
    Task01Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuestionCard } from "@/components/dashboard/assessments/QuestionCard";
import { QuizTimer } from "@/components/dashboard/assessments/QuizTimer";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import type { AttemptAnswer, AssessmentQuestion } from "@/data/assessment-types";
import { describeError } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * The quiz-taking experience.
 *
 * One question at a time with a jump-to navigator, flagging, a countdown that
 * auto-submits, and a confirmation step that surfaces anything left unanswered.
 */
export default function QuizRunner() {
    const { assessmentId } = useParams<{ assessmentId: string }>();
    const navigate = useNavigate();
    const student = useActingUser("student");
    const { getAssessment, getCourse, startAttempt, submitAttempt } = useLms();

    const assessment = assessmentId ? getAssessment(assessmentId) : undefined;
    const course = assessment ? getCourse(assessment.courseId) : undefined;

    /**
     * The attempt is opened server-side: it returns the questions without the
     * answer key, enforces the attempt cap, and anchors the time limit. Nothing
     * about grading happens in the browser.
     */
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [timeLimit, setTimeLimit] = useState(0);
    const [startError, setStartError] = useState<string | null>(null);
    const [starting, setStarting] = useState(true);

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [exitOpen, setExitOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const elapsedRef = useRef(0);

    useEffect(() => {
        if (!assessmentId) return;
        let active = true;
        setStarting(true);
        startAttempt(assessmentId)
            .then((opened) => {
                if (!active) return;
                setAttemptId(opened.attemptId);
                setQuestions(opened.questions);
                setTimeLimit(opened.timeLimitMinutes);
                setStartError(null);
            })
            .catch((e) => {
                if (active) setStartError(describeError(e as { message?: string }));
            })
            .finally(() => {
                if (active) setStarting(false);
            });
        return () => {
            active = false;
        };
    }, [assessmentId, startAttempt]);

    const handleSubmit = useCallback(
        async (auto = false) => {
            if (!assessment || !attemptId || submitted) return;
            setSubmitted(true);

            const payload: AttemptAnswer[] = questions.map((q) => ({
                questionId: q.id,
                selectedOptionIds: answers[q.id] ?? [],
            }));

            try {
                await submitAttempt({ attemptId, answers: payload });
                if (auto) {
                    toast.warning("Time is up", {
                        description: "Your answers were submitted automatically.",
                    });
                }
                navigate(`/dashboard/assessments/${assessment.id}/result/${attemptId}`, {
                    replace: true,
                });
            } catch (e) {
                setSubmitted(false);
                toast.error("Could not submit", {
                    description: describeError(e as { message?: string }),
                });
            }
        },
        [assessment, attemptId, questions, answers, navigate, submitAttempt, submitted]
    );

    const answeredCount = useMemo(
        () => questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length,
        [questions, answers]
    );

    if (!assessment || !course) {
        return (
            <EmptyState
                icon={Task01Icon}
                title="Assessment not found"
                description="This assessment may have been unpublished or removed by your instructor."
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

    if (starting) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-7 w-7 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (startError) {
        return (
            <EmptyState
                icon={Cancel01Icon}
                title="Cannot start this assessment"
                description={startError}
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

    if (questions.length === 0) {
        return (
            <EmptyState
                icon={Task01Icon}
                title="No questions yet"
                description={`"${assessment.title}" has not had any questions added to it.`}
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

    const question = questions[current];
    const total = questions.length;
    const unanswered = total - answeredCount;
    const isLast = current === total - 1;

    const toggleFlag = () => {
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(question.id)) next.delete(question.id);
            else next.add(question.id);
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            {/* Masthead */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 sm:px-2">
                <div className="min-w-0 space-y-1">
                    <button
                        onClick={() => setExitOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft01Icon size={14} />
                        Exit assessment
                    </button>
                    <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-slate-900 truncate">
                        {assessment.title}
                    </h1>
                    <p className="text-xs text-slate-400 font-medium truncate">
                        {course.title} · Pass mark {assessment.passingScore}%
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <QuizTimer
                        totalSeconds={timeLimit * 60}
                        onExpire={() => void handleSubmit(true)}
                        onTick={(elapsed) => {
                            elapsedRef.current = elapsed;
                        }}
                        paused={submitted}
                    />
                </div>
            </div>

            {/* Progress */}
            <div className="px-1 sm:px-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-400">
                        {answeredCount} of {total} answered
                    </span>
                    <span className="text-primary tabular-nums">
                        {Math.round((answeredCount / total) * 100)}%
                    </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out"
                        style={{ width: `${(answeredCount / total) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 px-1 sm:px-2">
                {/* Question */}
                <div className="flex-1 min-w-0 order-2 lg:order-1">
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-8">
                        <QuestionCard
                            question={question}
                            index={current}
                            total={total}
                            selectedOptionIds={answers[question.id] ?? []}
                            onChange={(ids) => setAnswers((prev) => ({ ...prev, [question.id]: ids }))}
                        />

                        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                                disabled={current === 0}
                                className="h-11 rounded-full border-slate-200 text-slate-600 font-medium px-5 disabled:opacity-30"
                            >
                                <ArrowLeft01Icon size={16} className="mr-1.5" />
                                Previous
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={toggleFlag}
                                className={cn(
                                    "h-11 rounded-full font-medium px-4 gap-1.5 transition-colors",
                                    flagged.has(question.id)
                                        ? "text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700"
                                        : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                )}
                            >
                                <Flag02Icon size={16} />
                                <span className="hidden sm:inline">
                                    {flagged.has(question.id) ? "Flagged" : "Flag"}
                                </span>
                            </Button>

                            {isLast ? (
                                <Button
                                    onClick={() => setConfirmOpen(true)}
                                    className="h-11 rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-6 shadow-lg shadow-primary/10"
                                >
                                    Submit
                                    <CheckmarkCircle01Icon size={16} className="ml-1.5" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                                    className="h-11 rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-6"
                                >
                                    Next
                                    <ArrowRight01Icon size={16} className="ml-1.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigator */}
                <aside className="lg:w-[404px] shrink-0 order-1 lg:order-2">
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 lg:sticky lg:top-3">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4">
                            Questions
                        </p>
                        <div className="grid grid-cols-10 gap-2 max-h-[212px] overflow-y-auto scrollbar-thin -mr-1 pr-1">
                            {questions.map((q, i) => {
                                const isAnswered = (answers[q.id]?.length ?? 0) > 0;
                                const isFlagged = flagged.has(q.id);
                                const isCurrent = i === current;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrent(i)}
                                        aria-label={`Go to question ${i + 1}${isAnswered ? ", answered" : ", unanswered"}${isFlagged ? ", flagged" : ""}`}
                                        aria-current={isCurrent ? "step" : undefined}
                                        className={cn(
                                            // No ring offset and no overflowing badge: the grid
                                            // scrolls, so anything outside the box gets clipped.
                                            "aspect-square rounded-xl text-xs font-medium transition-all flex items-center justify-center",
                                            isCurrent
                                                ? "bg-primary text-white"
                                                : isFlagged
                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                    : isAnswered
                                                        ? "bg-accent/40 text-primary hover:bg-accent/60"
                                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-[11px] font-medium">
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="h-3 w-3 rounded bg-accent/40 border border-primary/20" />
                                Answered
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="h-3 w-3 rounded bg-slate-50 border border-slate-200" />
                                Not answered
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="h-3 w-3 rounded bg-amber-100 border border-amber-300" />
                                Flagged for review
                            </div>
                        </div>

                        <Button
                            onClick={() => setConfirmOpen(true)}
                            variant="outline"
                            className="w-full mt-5 h-11 rounded-full border-slate-200 text-slate-600 font-medium hover:border-primary/30 hover:text-primary"
                        >
                            Submit assessment
                        </Button>
                    </div>
                </aside>
            </div>

            {/* Submit confirmation */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-medium text-slate-900">
                            Submit your answers?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-normal text-sm">
                            {unanswered > 0 ? (
                                <>
                                    You have{" "}
                                    <span className="font-medium text-amber-600">
                                        {unanswered} unanswered {unanswered === 1 ? "question" : "questions"}
                                    </span>
                                    . Unanswered questions score zero.
                                </>
                            ) : (
                                "All questions are answered. You will see your result immediately."
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">
                            Keep working
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => void handleSubmit(false)}
                            className="rounded-full h-10 bg-primary hover:bg-primary/90 text-white font-normal"
                        >
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Exit confirmation */}
            <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-medium text-slate-900">
                            Leave without submitting?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-normal text-sm">
                            Your answers will be discarded and this will not count as an attempt.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">
                            Stay
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => navigate("/dashboard/assessments")}
                            className="rounded-full h-10 bg-destructive hover:bg-destructive/90 text-white font-normal"
                        >
                            Leave
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
