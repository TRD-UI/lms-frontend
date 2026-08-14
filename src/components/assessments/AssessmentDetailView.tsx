import { useState } from "react";
import {
    Add01Icon,
    Cancel01Icon,
    CheckmarkCircle01Icon,
    Copy01Icon,
    Delete02Icon,
    Edit01Icon,
    QrCode01Icon,
    Task01Icon,
    Timer01Icon,
    UserMultiple02Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageHeader, type Crumb } from "@/components/shared/PageHeader";
import { RowActions } from "@/components/shared/RowActions";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/shared/StatusBadge";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { AssessmentFormDialog, type AssessmentDraft } from "./AssessmentFormDialog";
import { QuestionFormDialog, type QuestionDraft } from "./QuestionFormDialog";
import { useLms } from "@/store/lms-store";
import type { Assessment, AssessmentQuestion } from "@/data/assessment-types";
import type { Course } from "@/data/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DIFFICULTY_TONE = {
    easy: "bg-emerald-50 text-emerald-600",
    medium: "bg-amber-50 text-amber-600",
    hard: "bg-red-50 text-red-500",
} as const;

interface AssessmentDetailViewProps {
    assessment: Assessment;
    course: Course;
    breadcrumbs: Crumb[];
    /** Where to go after the assessment is deleted. */
    onDeleted: () => void;
    /** Hides destructive controls for read-only viewers. */
    canEdit?: boolean;
}

/**
 * Full editor for one assessment — settings, question bank and attempt history.
 * Rendered by both the admin and instructor portals.
 */
export function AssessmentDetailView({
    assessment,
    course,
    breadcrumbs,
    onDeleted,
    canEdit = true,
}: AssessmentDetailViewProps) {
    const {
        updateAssessment,
        deleteAssessment,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        attemptsForAssessment,
    } = useLms();

    const [tab, setTab] = useState<"questions" | "attempts">("questions");
    const [editOpen, setEditOpen] = useState(false);
    const [questionOpen, setQuestionOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);

    const attempts = attemptsForAssessment(assessment.id);
    const sortedAttempts = [...attempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    const attemptPage = usePagination(sortedAttempts, 8);
    const totalPoints = assessment.questions.reduce((s, q) => s + q.points, 0);
    const passRate =
        attempts.length > 0
            ? Math.round((attempts.filter((a) => a.passed).length / attempts.length) * 100)
            : null;

    const handleSaveSettings = (draft: AssessmentDraft) => {
        updateAssessment(assessment.id, { ...draft, updatedAt: "Just now" });
        toast.success("Assessment updated", { description: `"${draft.title}" saved.` });
    };

    const handleSaveQuestion = (draft: QuestionDraft) => {
        if (editingQuestion) {
            updateQuestion(assessment.id, editingQuestion.id, draft);
            toast.success("Question updated");
        } else {
            addQuestion(assessment.id, draft);
            toast.success("Question added", { description: `"${assessment.title}" now has ${assessment.questions.length + 1} questions.` });
        }
        setEditingQuestion(null);
    };

    const togglePublish = () => {
        const next = assessment.status === "published" ? "draft" : "published";
        updateAssessment(assessment.id, { status: next });
        toast.success(next === "published" ? "Assessment published" : "Moved to draft", {
            description:
                next === "published"
                    ? "Learners can now see and take this assessment."
                    : "Learners can no longer see this assessment.",
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title={assessment.title}
                description={assessment.description || course.title}
                breadcrumbs={breadcrumbs}
                actions={
                    canEdit ? (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={togglePublish}
                                className="h-11 px-5 rounded-full border-slate-200 text-slate-600 font-medium"
                            >
                                {assessment.status === "published" ? "Unpublish" : "Publish"}
                            </Button>
                            <Button
                                onClick={() => setEditOpen(true)}
                                className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                            >
                                <Edit01Icon size={16} className="mr-1.5" />
                                Settings
                            </Button>
                            <RowActions
                                label={`More actions for ${assessment.title}`}
                                actions={[
                                    {
                                        label: "Delete assessment",
                                        icon: Delete02Icon,
                                        destructive: true,
                                        onSelect: () => {
                                            deleteAssessment(assessment.id);
                                            toast.success("Assessment deleted", {
                                                description: `"${assessment.title}" was removed from ${course.title}.`,
                                            });
                                            onDeleted();
                                        },
                                        confirm: {
                                            title: "Delete this assessment?",
                                            description: `"${assessment.title}" and its ${assessment.questions.length} questions will be removed. Attempt history is kept for reporting.`,
                                            actionLabel: "Delete",
                                        },
                                    },
                                ]}
                            />
                        </div>
                    ) : undefined
                }
            />

            {/* Vitals */}
            <div className="px-1 sm:px-2">
                <StatGrid>
                <StatTile
                    label="Questions"
                    value={String(assessment.questions.length)}
                    hint={`${totalPoints} points total`}
                    icon={Task01Icon}
                />
                <StatTile
                    label="Pass mark"
                    value={`${assessment.passingScore}%`}
                    hint={`${assessment.timeLimitMinutes} minute limit`}
                    icon={Timer01Icon}
                />
                <StatTile
                    label="Attempts"
                    value={String(attempts.length)}
                    hint={
                        assessment.maxAttempts === 0
                            ? "Unlimited retries allowed"
                            : `Max ${assessment.maxAttempts} per learner`
                    }
                    icon={UserMultiple02Icon}
                />
                <StatTile
                    label="Pass rate"
                    value={passRate === null ? "—" : `${passRate}%`}
                    hint={passRate === null ? "No attempts yet" : `${attempts.filter((a) => a.passed).length} of ${attempts.length} passed`}
                />
                </StatGrid>
            </div>

            {/* Meta chips */}
            <div className="flex items-center gap-2 flex-wrap px-1 sm:px-2">
                <StatusBadge tone={toneForStatus(assessment.status)}>{assessment.status}</StatusBadge>
                <StatusBadge tone="neutral">{assessment.kind}</StatusBadge>
                {assessment.gatesEntryPass && (
                    <StatusBadge tone="info" icon={QrCode01Icon}>
                        Gates entry pass
                    </StatusBadge>
                )}
                {assessment.moduleId && (
                    <StatusBadge tone="neutral">
                        {course.modules.find((m) => m.id === assessment.moduleId)?.title ?? assessment.moduleId}
                    </StatusBadge>
                )}
                <span className="text-[11px] text-slate-400 font-medium ml-auto">
                    Updated {assessment.updatedAt} · by {assessment.createdBy}
                </span>
            </div>

            {/* Tabs */}
            <div className="px-1 sm:px-2">
                <div className="flex items-center gap-8 border-b border-slate-100">
                    {(
                        [
                            ["questions", "Questions", assessment.questions.length],
                            ["attempts", "Attempts", attempts.length],
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

            {tab === "questions" ? (
                <div className="px-1 sm:px-2 space-y-3">
                    {canEdit && (
                        <div className="flex justify-end">
                            <Button
                                onClick={() => {
                                    setEditingQuestion(null);
                                    setQuestionOpen(true);
                                }}
                                className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                            >
                                <Add01Icon size={16} className="mr-1.5" />
                                Add question
                            </Button>
                        </div>
                    )}

                    {assessment.questions.length === 0 ? (
                        <EmptyState
                            variant="inset"
                            icon={Task01Icon}
                            title="No questions yet"
                            description="Add the first question to make this assessment usable."
                            action={
                                canEdit ? (
                                    <Button
                                        onClick={() => {
                                            setEditingQuestion(null);
                                            setQuestionOpen(true);
                                        }}
                                        className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium"
                                    >
                                        Add question
                                    </Button>
                                ) : undefined
                            }
                        />
                    ) : (
                        <div className="space-y-2">
                            {assessment.questions.map((question, i) => (
                                <div
                                    key={question.id}
                                    className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-start gap-4"
                                >
                                    <span className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>

                                    <div className="flex-1 min-w-0 space-y-2.5">
                                        <p className="text-sm font-medium text-slate-800 leading-snug">
                                            {question.prompt}
                                        </p>

                                        <div className="flex flex-wrap gap-1.5">
                                            {question.options.map((o) => {
                                                const correct = question.correctOptionIds.includes(o.id);
                                                return (
                                                    <span
                                                        key={o.id}
                                                        className={cn(
                                                            "inline-flex items-center gap-1 text-[11px] font-normal rounded-lg px-2 py-1 border",
                                                            correct
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border-slate-100 bg-slate-50 text-slate-500"
                                                        )}
                                                    >
                                                        {correct ? (
                                                            <CheckmarkCircle01Icon size={11} />
                                                        ) : (
                                                            <span className="font-medium">{o.id.toUpperCase()}</span>
                                                        )}
                                                        {o.label}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-medium rounded-full px-2 py-0.5 capitalize",
                                                    DIFFICULTY_TONE[question.difficulty]
                                                )}
                                            >
                                                {question.difficulty}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {question.points} {question.points === 1 ? "point" : "points"}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400 capitalize">
                                                {question.type === "boolean" ? "true / false" : question.type} choice
                                            </span>
                                            {question.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                            {question.remedialModuleId && (
                                                <span className="text-[10px] font-medium text-primary bg-accent/30 rounded-full px-2 py-0.5">
                                                    ↻{" "}
                                                    {course.modules.find((m) => m.id === question.remedialModuleId)
                                                        ?.title ?? question.remedialModuleId}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {canEdit && (
                                        <RowActions
                                            label={`Actions for question ${i + 1}`}
                                            actions={[
                                                {
                                                    label: "Edit question",
                                                    icon: Edit01Icon,
                                                    onSelect: () => {
                                                        setEditingQuestion(question);
                                                        setQuestionOpen(true);
                                                    },
                                                },
                                                {
                                                    label: "Duplicate",
                                                    icon: Copy01Icon,
                                                    onSelect: () => {
                                                        const { id: _id, ...rest } = question;
                                                        addQuestion(assessment.id, rest);
                                                        toast.success("Question duplicated");
                                                    },
                                                },
                                                {
                                                    label: "Delete question",
                                                    icon: Delete02Icon,
                                                    destructive: true,
                                                    separatorBefore: true,
                                                    onSelect: () => {
                                                        deleteQuestion(assessment.id, question.id);
                                                        toast.success("Question removed");
                                                    },
                                                    confirm: {
                                                        title: "Delete this question?",
                                                        description: "It will be removed from the assessment immediately.",
                                                        actionLabel: "Delete",
                                                    },
                                                },
                                            ]}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-1 sm:px-2">
                    {attempts.length === 0 ? (
                        <EmptyState
                            variant="inset"
                            icon={UserMultiple02Icon}
                            title="No attempts yet"
                            description="Learner submissions will appear here once the assessment is published and taken."
                        />
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-100 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Learner</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Score</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Outcome</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Attempt</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Submitted</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attemptPage.pageRows.map((attempt) => (
                                                <TableRow key={attempt.id} className="border-slate-50 hover:bg-slate-50/50">
                                                    <TableCell className="text-sm font-medium text-slate-800">
                                                        {attempt.studentName}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-600 tabular-nums">
                                                        {attempt.score}%
                                                        <span className="text-slate-300 ml-1.5 text-xs">
                                                            {attempt.pointsEarned}/{attempt.pointsPossible}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            tone={attempt.passed ? "good" : "critical"}
                                                            icon={attempt.passed ? CheckmarkCircle01Icon : Cancel01Icon}
                                                        >
                                                            {attempt.passed ? "Passed" : "Failed"}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-400 tabular-nums">
                                                        #{attempt.attemptNumber}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-400">
                                                        {new Date(attempt.submittedAt).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <TablePagination
                                page={attemptPage.page}
                                pageCount={attemptPage.pageCount}
                                onPageChange={attemptPage.setPage}
                                from={attemptPage.from}
                                to={attemptPage.to}
                                total={attemptPage.total}
                                label="attempts"
                            />
                        </div>
                    )}
                </div>
            )}

            <AssessmentFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                assessment={assessment}
                course={course}
                onSubmit={handleSaveSettings}
            />

            <QuestionFormDialog
                open={questionOpen}
                onOpenChange={(o) => {
                    setQuestionOpen(o);
                    if (!o) setEditingQuestion(null);
                }}
                question={editingQuestion}
                course={course}
                onSubmit={handleSaveQuestion}
            />
        </div>
    );
}
