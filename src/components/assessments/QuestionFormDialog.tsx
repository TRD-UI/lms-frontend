import { useEffect, useState } from "react";
import { Add01Icon, Delete02Icon } from "hugeicons-react";
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
import type {
    AssessmentQuestion,
    Difficulty,
    QuestionType,
} from "@/data/assessment-types";
import type { Course } from "@/data/types";
import { Field, NumberField, TextArea, TextField } from "./form-fields";
import { cn } from "@/lib/utils";

export type QuestionDraft = Omit<AssessmentQuestion, "id">;

const NO_MODULE = "__none__";

const blankDraft = (): QuestionDraft => ({
    prompt: "",
    type: "single",
    options: [
        { id: "a", label: "" },
        { id: "b", label: "" },
    ],
    correctOptionIds: [],
    explanation: "",
    difficulty: "medium",
    points: 1,
    tags: [],
    remedialModuleId: undefined,
});

const BOOLEAN_OPTIONS = [
    { id: "a", label: "True" },
    { id: "b", label: "False" },
];

interface QuestionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Omit to create. */
    question?: AssessmentQuestion | null;
    course?: Course;
    onSubmit: (draft: QuestionDraft) => void;
}

/** Create / edit a single question, including its answer key. */
export function QuestionFormDialog({
    open,
    onOpenChange,
    question,
    course,
    onSubmit,
}: QuestionFormDialogProps) {
    const isEdit = Boolean(question);
    const [draft, setDraft] = useState<QuestionDraft>(blankDraft);
    const [tagInput, setTagInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setError(null);
        if (question) {
            const { id: _id, ...rest } = question;
            setDraft({ ...rest, explanation: rest.explanation ?? "" });
            setTagInput(question.tags.join(", "));
        } else {
            setDraft(blankDraft());
            setTagInput("");
        }
    }, [open, question]);

    const set = <K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) =>
        setDraft((d) => ({ ...d, [key]: value }));

    const changeType = (type: QuestionType) => {
        setDraft((d) => {
            if (type === "boolean") {
                return { ...d, type, options: BOOLEAN_OPTIONS, correctOptionIds: [] };
            }
            // Leaving boolean: restore an editable option list.
            const options =
                d.type === "boolean" ? [{ id: "a", label: "" }, { id: "b", label: "" }] : d.options;
            // Single-answer cannot keep more than one key.
            const correctOptionIds =
                type === "single" ? d.correctOptionIds.slice(0, 1) : d.correctOptionIds;
            return { ...d, type, options, correctOptionIds };
        });
    };

    const addOption = () => {
        setDraft((d) => {
            if (d.options.length >= 6) return d;
            const nextId = String.fromCharCode(97 + d.options.length);
            return { ...d, options: [...d.options, { id: nextId, label: "" }] };
        });
    };

    const removeOption = (optionId: string) => {
        setDraft((d) => {
            if (d.options.length <= 2) return d;
            // Re-letter the remaining options so ids stay positional (a, b, c…).
            const kept = d.options.filter((o) => o.id !== optionId);
            const remap = new Map<string, string>();
            const relettered = kept.map((o, i) => {
                const newId = String.fromCharCode(97 + i);
                remap.set(o.id, newId);
                return { ...o, id: newId };
            });
            return {
                ...d,
                options: relettered,
                correctOptionIds: d.correctOptionIds
                    .filter((id) => id !== optionId)
                    .map((id) => remap.get(id) as string),
            };
        });
    };

    const toggleCorrect = (optionId: string) => {
        setDraft((d) => {
            if (d.type === "multiple") {
                return {
                    ...d,
                    correctOptionIds: d.correctOptionIds.includes(optionId)
                        ? d.correctOptionIds.filter((id) => id !== optionId)
                        : [...d.correctOptionIds, optionId],
                };
            }
            return { ...d, correctOptionIds: [optionId] };
        });
    };

    const handleSubmit = () => {
        if (!draft.prompt.trim()) {
            setError("Write the question prompt.");
            return;
        }
        if (draft.options.some((o) => !o.label.trim())) {
            setError("Every option needs a label.");
            return;
        }
        if (draft.correctOptionIds.length === 0) {
            setError("Mark at least one option as correct.");
            return;
        }
        onSubmit({
            ...draft,
            prompt: draft.prompt.trim(),
            options: draft.options.map((o) => ({ ...o, label: o.label.trim() })),
            explanation: draft.explanation?.trim() || undefined,
            tags: tagInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        });
        onOpenChange(false);
    };

    const isMultiple = draft.type === "multiple";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-2xl max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        {isEdit ? "Edit question" : "New question"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        Mark the correct {isMultiple ? "answers" : "answer"} using the selector beside each option.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    <TextArea
                        id="question-prompt"
                        label="Question"
                        required
                        rows={2}
                        value={draft.prompt}
                        onChange={(v) => set("prompt", v)}
                        placeholder="e.g. Which protocol operates at the transport layer?"
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Answer type" htmlFor="question-type">
                            <Select value={draft.type} onValueChange={(v) => changeType(v as QuestionType)}>
                                <SelectTrigger id="question-type" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="single">Single choice</SelectItem>
                                    <SelectItem value="multiple">Multiple answers</SelectItem>
                                    <SelectItem value="boolean">True / False</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Difficulty" htmlFor="question-difficulty">
                            <Select
                                value={draft.difficulty}
                                onValueChange={(v) => set("difficulty", v as Difficulty)}
                            >
                                <SelectTrigger id="question-difficulty" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <NumberField
                            id="question-points"
                            label="Points"
                            value={draft.points}
                            onChange={(v) => set("points", Math.max(1, v))}
                            min={1}
                        />
                    </div>

                    {/* Options + answer key */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-600">
                                Options<span className="text-destructive ml-1">*</span>
                            </span>
                            {draft.type !== "boolean" && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={addOption}
                                    disabled={draft.options.length >= 6}
                                    className="h-8 px-3 rounded-full text-xs font-medium text-primary hover:bg-primary/5 gap-1 disabled:opacity-40"
                                >
                                    <Add01Icon size={14} />
                                    Add option
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {draft.options.map((option, i) => {
                                const isCorrect = draft.correctOptionIds.includes(option.id);
                                return (
                                    <div
                                        key={option.id}
                                        className={cn(
                                            "flex items-center gap-2.5 p-2 rounded-2xl border transition-all",
                                            isCorrect
                                                ? "border-emerald-300 bg-emerald-50/50"
                                                : "border-slate-200 bg-white"
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleCorrect(option.id)}
                                            aria-label={`Mark option ${i + 1} correct`}
                                            aria-pressed={isCorrect}
                                            className={cn(
                                                "h-8 w-8 shrink-0 border-2 flex items-center justify-center transition-all text-[11px] font-medium",
                                                isMultiple ? "rounded-lg" : "rounded-full",
                                                isCorrect
                                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                                    : "border-slate-300 text-slate-400 hover:border-emerald-400"
                                            )}
                                        >
                                            {option.id.toUpperCase()}
                                        </button>

                                        <input
                                            type="text"
                                            value={option.label}
                                            readOnly={draft.type === "boolean"}
                                            placeholder={`Option ${option.id.toUpperCase()}`}
                                            onChange={(e) =>
                                                set(
                                                    "options",
                                                    draft.options.map((o) =>
                                                        o.id === option.id ? { ...o, label: e.target.value } : o
                                                    )
                                                )
                                            }
                                            className="flex-1 h-9 px-3 rounded-lg bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all read-only:text-slate-500"
                                        />

                                        {draft.type !== "boolean" && draft.options.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(option.id)}
                                                aria-label={`Remove option ${option.id.toUpperCase()}`}
                                                className="h-8 w-8 rounded-full text-slate-300 hover:text-destructive hover:bg-destructive/5 shrink-0"
                                            >
                                                <Delete02Icon size={14} />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">
                            {isMultiple
                                ? "Tap the letter on every correct option."
                                : "Tap the letter of the correct option."}
                        </p>
                    </div>

                    <TextArea
                        id="question-explanation"
                        label="Explanation"
                        rows={2}
                        value={draft.explanation ?? ""}
                        onChange={(v) => set("explanation", v)}
                        placeholder="Shown to the learner on the results screen."
                        hint="Optional, but it turns a wrong answer into a teaching moment."
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <TextField
                            id="question-tags"
                            label="Tags"
                            value={tagInput}
                            onChange={setTagInput}
                            placeholder="Networking, Security"
                            hint="Comma separated."
                        />

                        {course && course.modules.length > 0 && (
                            <Field
                                label="Revision module"
                                htmlFor="question-remedial"
                                hint="Where to send learners who get this wrong."
                            >
                                <Select
                                    value={draft.remedialModuleId ?? NO_MODULE}
                                    onValueChange={(v) =>
                                        set("remedialModuleId", v === NO_MODULE ? undefined : v)
                                    }
                                >
                                    <SelectTrigger id="question-remedial" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value={NO_MODULE}>None</SelectItem>
                                        {course.modules.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
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
                        {isEdit ? "Save question" : "Add question"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
