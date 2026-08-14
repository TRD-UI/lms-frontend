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
import { Field, NumberField, TextArea, TextField } from "@/components/assessments/form-fields";
import { courseCategories } from "@/data/courses";
import type { Course, FeeStructure } from "@/data/types";
import { cn } from "@/lib/utils";

export interface CourseDraft {
    title: string;
    description: string;
    category: string;
    duration: string;
    location: string;
    seatsTotal: number;
    feeType: FeeStructure["type"];
    flatAmount: number;
    cohortAmount: number;
    specialAmount: number;
    status: "published" | "draft";
}

const EMPTY: CourseDraft = {
    title: "",
    description: "",
    category: courseCategories[0],
    duration: "1 month",
    location: "ITeMS Building, UI",
    seatsTotal: 20,
    feeType: "flat",
    flatAmount: 100_000,
    cohortAmount: 80_000,
    specialAmount: 150_000,
    status: "draft",
};

export function courseToDraft(course: Course): CourseDraft {
    const cohort = course.fees.tiers?.find((t) => t.name === "Cohort");
    const special = course.fees.tiers?.find((t) => t.name === "Special");
    return {
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        location: course.location,
        seatsTotal: course.seats.total,
        feeType: course.fees.type,
        flatAmount: course.fees.amount ?? 100_000,
        cohortAmount: cohort?.amount ?? 80_000,
        specialAmount: special?.amount ?? 150_000,
        status: course.status ?? "published",
    };
}

/** Builds the `fees` shape the Course model expects from the flat draft. */
export function draftToFees(draft: CourseDraft): FeeStructure {
    return draft.feeType === "flat"
        ? { type: "flat", amount: draft.flatAmount }
        : {
            type: "tiered",
            tiers: [
                { name: "Cohort", amount: draft.cohortAmount },
                { name: "Special", amount: draft.specialAmount },
            ],
        };
}

interface CourseFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Omit to create. */
    course?: Course | null;
    onSubmit: (draft: CourseDraft) => void;
}

/** Create / edit a course. */
export function CourseFormDialog({ open, onOpenChange, course, onSubmit }: CourseFormDialogProps) {
    const isEdit = Boolean(course);
    const [draft, setDraft] = useState<CourseDraft>(EMPTY);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setError(null);
        setDraft(course ? courseToDraft(course) : EMPTY);
    }, [open, course]);

    const set = <K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) =>
        setDraft((d) => ({ ...d, [key]: value }));

    const handleSubmit = () => {
        if (!draft.title.trim()) {
            setError("Give the course a title.");
            return;
        }
        if (draft.seatsTotal < 1) {
            setError("A course needs at least one seat.");
            return;
        }
        onSubmit({
            ...draft,
            title: draft.title.trim(),
            description: draft.description.trim(),
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-lg max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        {isEdit ? "Edit course" : "New course"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        {isEdit
                            ? `Update the details for "${course?.title}".`
                            : "Set up the course shell, then add modules and assessments."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    <TextField
                        id="course-title"
                        label="Title"
                        required
                        value={draft.title}
                        onChange={(v) => set("title", v)}
                        placeholder="e.g. Applied Machine Learning"
                    />

                    <TextArea
                        id="course-description"
                        label="Description"
                        value={draft.description}
                        onChange={(v) => set("description", v)}
                        placeholder="What learners will be able to do by the end."
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Category" htmlFor="course-category">
                            <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                                <SelectTrigger id="course-category" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {courseCategories.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Status" htmlFor="course-status">
                            <Select
                                value={draft.status}
                                onValueChange={(v) => set("status", v as CourseDraft["status"])}
                            >
                                <SelectTrigger id="course-status" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <TextField
                            id="course-duration"
                            label="Duration"
                            value={draft.duration}
                            onChange={(v) => set("duration", v)}
                            placeholder="3 months"
                        />
                        <NumberField
                            id="course-seats"
                            label="Total seats"
                            value={draft.seatsTotal}
                            onChange={(v) => set("seatsTotal", v)}
                            min={1}
                        />
                    </div>

                    <TextField
                        id="course-location"
                        label="Venue"
                        value={draft.location}
                        onChange={(v) => set("location", v)}
                        placeholder="Training Lab 1, ITeMS Building, UI"
                    />

                    {/* Fees */}
                    <div className="space-y-2.5">
                        <span className="text-xs font-medium text-slate-600">Fee structure</span>
                        <div className="grid grid-cols-2 gap-2">
                            {(["flat", "tiered"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => set("feeType", t)}
                                    className={cn(
                                        "h-11 rounded-xl border text-sm font-medium capitalize transition-all",
                                        draft.feeType === t
                                            ? "border-primary/40 bg-accent/20 text-primary ring-2 ring-primary/10"
                                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    {t === "flat" ? "Flat fee" : "Cohort / Special"}
                                </button>
                            ))}
                        </div>

                        {draft.feeType === "flat" ? (
                            <NumberField
                                id="course-flat"
                                label="Amount (₦)"
                                value={draft.flatAmount}
                                onChange={(v) => set("flatAmount", v)}
                                min={0}
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <NumberField
                                    id="course-cohort"
                                    label="Cohort (₦)"
                                    value={draft.cohortAmount}
                                    onChange={(v) => set("cohortAmount", v)}
                                    min={0}
                                />
                                <NumberField
                                    id="course-special"
                                    label="Special (₦)"
                                    value={draft.specialAmount}
                                    onChange={(v) => set("specialAmount", v)}
                                    min={0}
                                />
                            </div>
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
                        {isEdit ? "Save changes" : "Create course"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
