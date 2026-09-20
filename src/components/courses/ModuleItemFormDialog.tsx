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
import { Field, TextField } from "@/components/assessments/form-fields";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { useLms } from "@/store/lms-store";
import type { ModuleItem } from "@/data/types";

export type ModuleItemDraft = Omit<ModuleItem, "id">;

const TYPE_LABEL: Record<ModuleItem["type"], string> = {
    video: "Video",
    pdf: "PDF",
    document: "Document",
    quiz: "Quiz",
};

const EMPTY: ModuleItemDraft = { title: "", type: "video", url: "", notes: "" };

interface ModuleItemFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    /** Omit to create. */
    item?: ModuleItem | null;
    onSubmit: (draft: ModuleItemDraft) => void;
}

/**
 * Create / edit one lesson inside a module.
 *
 * A `quiz` item points at an assessment on the same course; every other type
 * carries a media URL. The two are mutually exclusive, which is the same rule
 * the `module_items_payload` constraint enforces in the database.
 */
export function ModuleItemFormDialog({
    open,
    onOpenChange,
    courseId,
    item,
    onSubmit,
}: ModuleItemFormDialogProps) {
    const isEdit = Boolean(item);
    const { assessmentsForCourse } = useLms();
    const [draft, setDraft] = useState<ModuleItemDraft>(EMPTY);
    const [error, setError] = useState<string | null>(null);

    const assessments = assessmentsForCourse(courseId);

    useEffect(() => {
        if (!open) return;
        setError(null);
        setDraft(
            item
                ? { title: item.title, type: item.type, url: item.url, assessmentId: item.assessmentId, notes: item.notes ?? "" }
                : EMPTY
        );
    }, [open, item]);

    const set = <K extends keyof ModuleItemDraft>(key: K, value: ModuleItemDraft[K]) =>
        setDraft((d) => ({ ...d, [key]: value }));

    const isQuiz = draft.type === "quiz";

    const handleSubmit = () => {
        if (!draft.title.trim()) {
            setError("Give the lesson a title.");
            return;
        }
        if (isQuiz && !draft.assessmentId) {
            setError("Pick the assessment this quiz opens. Create one on the Assessments tab first.");
            return;
        }
        onSubmit(
            isQuiz
                ? { title: draft.title.trim(), type: "quiz", assessmentId: draft.assessmentId, notes: draft.notes }
                : {
                    title: draft.title.trim(),
                    type: draft.type,
                    url: draft.url?.trim() || undefined,
                    notes: draft.notes,
                }
        );
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-lg max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        {isEdit ? "Edit lesson" : "Add lesson"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        Video, PDF, document or a quiz that opens one of this course's assessments.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    <TextField
                        id="item-title"
                        label="Title"
                        required
                        value={draft.title}
                        onChange={(v) => set("title", v)}
                        placeholder="e.g. Introduction to the DOM"
                    />

                    <Field label="Type" htmlFor="item-type">
                        <Select
                            value={draft.type}
                            onValueChange={(v) => set("type", v as ModuleItem["type"])}
                        >
                            <SelectTrigger id="item-type" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {(Object.keys(TYPE_LABEL) as ModuleItem["type"][]).map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {TYPE_LABEL[t]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    {isQuiz ? (
                        <Field
                            label="Assessment"
                            htmlFor="item-assessment"
                            hint={
                                assessments.length === 0
                                    ? "This course has no assessments yet — create one on the Assessments tab."
                                    : undefined
                            }
                        >
                            <Select
                                value={draft.assessmentId ?? ""}
                                onValueChange={(v) => set("assessmentId", v)}
                                disabled={assessments.length === 0}
                            >
                                <SelectTrigger id="item-assessment" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue placeholder="Select an assessment" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {assessments.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    ) : (
                        <TextField
                            id="item-url"
                            label="Content URL"
                            value={draft.url ?? ""}
                            onChange={(v) => set("url", v)}
                            placeholder="https://…"
                            hint="Leave blank to add the file later — the lesson will show as pending."
                        />
                    )}

                    <Field
                        label="Lesson notes"
                        htmlFor="item-notes"
                        hint="Shown under the media. Supports headings, lists and links."
                    >
                        <RichTextEditor
                            value={draft.notes ?? ""}
                            onChange={(html) => set("notes", html)}
                            placeholder="What this lesson covers, key points, further reading…"
                        />
                    </Field>

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
                        {isEdit ? "Save lesson" : "Add lesson"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
