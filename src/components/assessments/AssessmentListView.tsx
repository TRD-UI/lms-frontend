import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Add01Icon,
    ArrowRight01Icon,
    Copy01Icon,
    Delete02Icon,
    Edit01Icon,
    QrCode01Icon,
    Task01Icon,
    Timer01Icon,
    ViewIcon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { PageHeader, type Crumb } from "@/components/shared/PageHeader";
import { RowActions } from "@/components/shared/RowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/shared/StatusBadge";
import { AssessmentFormDialog, type AssessmentDraft } from "./AssessmentFormDialog";
import { useLms } from "@/store/lms-store";
import type { Assessment } from "@/data/assessment-types";
import type { Course } from "@/data/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AssessmentListViewProps {
    course: Course;
    breadcrumbs: Crumb[];
    /** Route prefix for an assessment detail page, e.g. "/admin/assessments/1". */
    detailBase: string;
    backTo?: string;
    /** Name recorded as the author on newly created assessments. */
    authorName: string;
    /**
     * Oversight mode. Assessments belong to the course's instructor, so the
     * admin portal renders the same screens without the authoring controls.
     */
    readOnly?: boolean;
    /**
     * Rendered inside a page that already has a header and tabs, so this view
     * suppresses its own masthead and surfaces its action through `renderAction`.
     */
    embedded?: boolean;
    /** Receives the "New assessment" handler when embedded. */
    onRequestCreate?: (handler: () => void) => void;
}

/** Every assessment belonging to one course. Shared by admin and instructor. */
export function AssessmentListView({
    course,
    breadcrumbs,
    detailBase,
    backTo,
    authorName,
    readOnly = false,
    embedded = false,
}: AssessmentListViewProps) {
    const navigate = useNavigate();
    const {
        assessmentsForCourse,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        duplicateAssessment,
        attemptsForAssessment,
    } = useLms();

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Assessment | null>(null);

    const list = assessmentsForCourse(course.id);

    const handleSubmit = (draft: AssessmentDraft) => {
        if (editing) {
            updateAssessment(editing.id, { ...draft, updatedAt: "Just now" });
            toast.success("Assessment updated", { description: `"${draft.title}" saved.` });
        } else {
            const created = createAssessment({
                ...draft,
                courseId: course.id,
                createdBy: authorName,
                updatedAt: "Just now",
            });
            toast.success("Assessment created", {
                description: "Add questions to make it available to learners.",
            });
            navigate(`${detailBase}/${created.id}`);
        }
        setEditing(null);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {!embedded && <PageHeader
                title={course.title}
                description={`${list.length} ${list.length === 1 ? "assessment" : "assessments"} · ${course.modules.length} modules · ${course.seats.enrolled} enrolled`}
                breadcrumbs={breadcrumbs}
                backTo={backTo}
                backLabel="All courses"
                actions={
                    readOnly ? undefined : (
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                            className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                        >
                            <Add01Icon size={16} className="mr-1.5" />
                            New assessment
                        </Button>
                    )
                }
            />}

            {embedded && !readOnly && (
                <div className="flex justify-end px-1 sm:px-2">
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                        className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                    >
                        <Add01Icon size={16} className="mr-1.5" />
                        New assessment
                    </Button>
                </div>
            )}

            {list.length === 0 ? (
                <EmptyState
                    icon={Task01Icon}
                    title="No assessments on this course"
                    description={
                        readOnly
                            ? `${course.instructorName ?? "The assigned instructor"} has not added any assessments to this course yet.`
                            : "Create a prerequisite test, a module checkpoint, or a final exam."
                    }
                    action={
                        readOnly ? undefined : (
                            <Button
                                onClick={() => {
                                    setEditing(null);
                                    setFormOpen(true);
                                }}
                                className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                            >
                                Create the first assessment
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="px-1 sm:px-2 space-y-2">
                    {list.map((assessment) => {
                        const attempts = attemptsForAssessment(assessment.id);
                        const passRate =
                            attempts.length > 0
                                ? Math.round(
                                    (attempts.filter((a) => a.passed).length / attempts.length) * 100
                                )
                                : null;

                        return (
                            <div
                                key={assessment.id}
                                className="group bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-4 transition-shadow hover:shadow-sm"
                            >
                                <div
                                    className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                                        assessment.gatesEntryPass
                                            ? "bg-accent/40 text-primary"
                                            : "bg-slate-100 text-slate-500"
                                    )}
                                >
                                    {assessment.gatesEntryPass ? (
                                        <QrCode01Icon size={22} />
                                    ) : (
                                        <Task01Icon size={22} />
                                    )}
                                </div>

                                <Link
                                    to={`${detailBase}/${assessment.id}`}
                                    className="flex-1 min-w-0 space-y-1"
                                >
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors truncate">
                                            {assessment.title}
                                        </h3>
                                        <StatusBadge tone={toneForStatus(assessment.status)}>
                                            {assessment.status}
                                        </StatusBadge>
                                        <StatusBadge tone="neutral">{assessment.kind}</StatusBadge>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Task01Icon size={12} />
                                            {assessment.questions.length} questions
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Timer01Icon size={12} />
                                            {assessment.timeLimitMinutes} min
                                        </span>
                                        <span>Pass {assessment.passingScore}%</span>
                                        <span>
                                            {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
                                        </span>
                                        {passRate !== null && <span>{passRate}% pass rate</span>}
                                    </div>
                                </Link>

                                <div className="flex items-center gap-1 shrink-0">
                                    <Link to={`${detailBase}/${assessment.id}`}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Open ${assessment.title}`}
                                            className="h-9 w-9 rounded-full text-slate-300 group-hover:text-primary hover:bg-primary/5"
                                        >
                                            <ArrowRight01Icon size={18} />
                                        </Button>
                                    </Link>

                                    <RowActions
                                        label={`Actions for ${assessment.title}`}
                                        actions={[
                                            {
                                                label: "Open",
                                                icon: ViewIcon,
                                                onSelect: () => navigate(`${detailBase}/${assessment.id}`),
                                            },
                                            ...(readOnly ? [] : [{
                                                label: "Edit settings",
                                                icon: Edit01Icon,
                                                onSelect: () => {
                                                    setEditing(assessment);
                                                    setFormOpen(true);
                                                },
                                            },
                                            {
                                                label:
                                                    assessment.status === "published" ? "Unpublish" : "Publish",
                                                icon: QrCode01Icon,
                                                onSelect: () => {
                                                    const next =
                                                        assessment.status === "published" ? "draft" : "published";
                                                    updateAssessment(assessment.id, { status: next });
                                                    toast.success(
                                                        next === "published"
                                                            ? "Assessment published"
                                                            : "Moved to draft"
                                                    );
                                                },
                                            },
                                            {
                                                label: "Duplicate",
                                                icon: Copy01Icon,
                                                onSelect: () => {
                                                    duplicateAssessment(assessment.id);
                                                    toast.success("Assessment duplicated", {
                                                        description: "The copy was created as a draft.",
                                                    });
                                                },
                                            },
                                            {
                                                label: "Delete",
                                                icon: Delete02Icon,
                                                destructive: true,
                                                separatorBefore: true,
                                                onSelect: () => {
                                                    deleteAssessment(assessment.id);
                                                    toast.success("Assessment deleted", {
                                                        description: `"${assessment.title}" was removed.`,
                                                    });
                                                },
                                                confirm: {
                                                    title: "Delete this assessment?",
                                                    description: `"${assessment.title}" and its ${assessment.questions.length} questions will be removed.`,
                                                    actionLabel: "Delete",
                                                },
                                            }]),
                                        ]}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!readOnly && <AssessmentFormDialog
                open={formOpen}
                onOpenChange={(o) => {
                    setFormOpen(o);
                    if (!o) setEditing(null);
                }}
                assessment={editing}
                course={course}
                onSubmit={handleSubmit}
            />}
        </div>
    );
}
