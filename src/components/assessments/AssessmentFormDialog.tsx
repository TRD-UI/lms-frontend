import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Assessment, AssessmentKind } from "@/data/assessment-types";
import type { Course } from "@/data/types";
import { Field, NumberField, TextArea, TextField } from "./form-fields";

export interface AssessmentDraft {
    title: string;
    description: string;
    kind: AssessmentKind;
    moduleId?: string;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts: number;
    gatesEntryPass: boolean;
    status: Assessment["status"];
}

const EMPTY: AssessmentDraft = {
    title: "",
    description: "",
    kind: "checkpoint",
    moduleId: undefined,
    passingScore: 70,
    timeLimitMinutes: 20,
    maxAttempts: 3,
    gatesEntryPass: false,
    status: "draft",
};

const NO_MODULE = "__none__";

interface AssessmentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Omit to create. */
    assessment?: Assessment | null;
    course: Course;
    onSubmit: (draft: AssessmentDraft) => void;
}

/** Create / edit an assessment. Shared by the admin and instructor portals. */
export function AssessmentFormDialog({
    open,
    onOpenChange,
    assessment,
    course,
    onSubmit,
}: AssessmentFormDialogProps) {
    const isEdit = Boolean(assessment);
    const [draft, setDraft] = useState<AssessmentDraft>(EMPTY);
    const [error, setError] = useState<string | null>(null);

    // Reload the draft whenever the dialog opens onto a different subject.
    useEffect(() => {
        if (!open) return;
        setError(null);
        setDraft(
            assessment
                ? {
                    title: assessment.title,
                    description: assessment.description,
                    kind: assessment.kind,
                    moduleId: assessment.moduleId,
                    passingScore: assessment.passingScore,
                    timeLimitMinutes: assessment.timeLimitMinutes,
                    maxAttempts: assessment.maxAttempts,
                    gatesEntryPass: assessment.gatesEntryPass,
                    status: assessment.status,
                }
                : EMPTY
        );
    }, [open, assessment]);

    const set = <K extends keyof AssessmentDraft>(key: K, value: AssessmentDraft[K]) =>
        setDraft((d) => ({ ...d, [key]: value }));

    const handleSubmit = () => {
        if (!draft.title.trim()) {
            setError("Give the assessment a title.");
            return;
        }
        if (draft.passingScore < 0 || draft.passingScore > 100) {
            setError("Pass mark must be between 0 and 100.");
            return;
        }
        onSubmit({ ...draft, title: draft.title.trim(), description: draft.description.trim() });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-lg max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        {isEdit ? "Edit assessment" : "New assessment"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        {isEdit
                            ? `Update the settings for "${assessment?.title}".`
                            : `Add an assessment to ${course.title}.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    <TextField
                        id="assessment-title"
                        label="Title"
                        required
                        value={draft.title}
                        onChange={(v) => set("title", v)}
                        placeholder="e.g. Digital Readiness Check"
                    />

                    <TextArea
                        id="assessment-description"
                        label="Description"
                        value={draft.description}
                        onChange={(v) => set("description", v)}
                        placeholder="What this assessment covers and why it matters."
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type" htmlFor="assessment-kind">
                            <Select
                                value={draft.kind}
                                onValueChange={(v) => {
                                    const kind = v as AssessmentKind;
                                    set("kind", kind);
                                    // Only a prerequisite can gate the entry pass.
                                    if (kind !== "prerequisite") set("gatesEntryPass", false);
                                }}
                            >
                                <SelectTrigger id="assessment-kind" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="prerequisite">Prerequisite</SelectItem>
                                    <SelectItem value="checkpoint">Module checkpoint</SelectItem>
                                    <SelectItem value="final">Final exam</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Status" htmlFor="assessment-status">
                            <Select
                                value={draft.status}
                                onValueChange={(v) => set("status", v as Assessment["status"])}
                            >
                                <SelectTrigger id="assessment-status" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    {draft.kind === "checkpoint" && course.modules.length > 0 && (
                        <Field label="Module" htmlFor="assessment-module">
                            <Select
                                value={draft.moduleId ?? NO_MODULE}
                                onValueChange={(v) => set("moduleId", v === NO_MODULE ? undefined : v)}
                            >
                                <SelectTrigger id="assessment-module" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue placeholder="Not module-specific" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value={NO_MODULE}>Not module-specific</SelectItem>
                                    {course.modules.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <NumberField
                            id="assessment-pass"
                            label="Pass mark %"
                            value={draft.passingScore}
                            onChange={(v) => set("passingScore", v)}
                            min={0}
                            max={100}
                        />
                        <NumberField
                            id="assessment-time"
                            label="Time (min)"
                            value={draft.timeLimitMinutes}
                            onChange={(v) => set("timeLimitMinutes", v)}
                            min={1}
                        />
                        <NumberField
                            id="assessment-attempts"
                            label="Max attempts"
                            value={draft.maxAttempts}
                            onChange={(v) => set("maxAttempts", v)}
                            min={0}
                            hint="0 = unlimited"
                        />
                    </div>

                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <div className="min-w-0">
                            <label
                                htmlFor="assessment-gates"
                                className="text-sm font-medium text-slate-700 block"
                            >
                                Gates the entry pass
                            </label>
                            <p className="text-[11px] text-slate-500 font-normal leading-snug mt-0.5">
                                {draft.kind === "prerequisite"
                                    ? "Learners cannot collect their QR pass for the physical session until they pass this."
                                    : "Only a prerequisite assessment can gate the entry pass."}
                            </p>
                        </div>
                        <Switch
                            id="assessment-gates"
                            checked={draft.gatesEntryPass}
                            disabled={draft.kind !== "prerequisite"}
                            onCheckedChange={(v) => set("gatesEntryPass", v)}
                        />
                    </div>

                    {error && <p className="text-xs text-destructive font-medium">{error}</p>}
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full h-10 border-slate-200 text-slate-500 font-normal"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="rounded-full h-10 bg-primary hover:bg-primary/90 text-white font-normal shadow-lg shadow-primary/10"
                    >
                        {isEdit ? "Save changes" : "Create assessment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
