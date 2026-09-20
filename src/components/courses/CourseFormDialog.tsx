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
import { useLms } from "@/store/lms-store";
import type { Course, FeeStructure } from "@/data/types";
import { cn } from "@/lib/utils";

export interface CourseDraft {
    title: string;
    description: string;
    category: string;
    duration: string;
    location: string;
    seatsTotal: number;
    instructorId: string;
    feeType: FeeStructure["type"];
    flatAmount: number;
    cohortAmount: number;
    specialAmount: number;
    status: "published" | "draft";
}

/** Courses run in whole months, one to eight. */
export const DURATION_OPTIONS = Array.from({ length: 8 }, (_, i) =>
    i === 0 ? "1 month" : `${i + 1} months`
);

const EMPTY: CourseDraft = {
    title: "",
    description: "",
    category: "",
    duration: "1 month",
    location: "",
    seatsTotal: 20,
    instructorId: "",
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
        instructorId: course.instructorId ?? "",
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
    /**
     * Only an admin reassigns ownership. An instructor creating their own
     * course is implicitly its instructor, so the picker is hidden for them.
     */
    canAssignInstructor?: boolean;
}

/** Create / edit a course. */
export function CourseFormDialog({
    open,
    onOpenChange,
    course,
    onSubmit,
    canAssignInstructor = false,
}: CourseFormDialogProps) {
    const isEdit = Boolean(course);
    const { categories, venues, instructors } = useLms();
    const [draft, setDraft] = useState<CourseDraft>(EMPTY);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setError(null);
        setDraft(
            course
                ? courseToDraft(course)
                : {
                    ...EMPTY,
                    category: categories[0] ?? "",
                    location: venues[0]?.name ?? "",
                }
        );
    }, [open, course, categories, venues]);

    const set = <K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) =>
        setDraft((d) => ({ ...d, [key]: value }));

    const handleSubmit = () => {
        if (!draft.title.trim()) {
            setError("Give the course a title.");
            return;
        }
        if (!Number.isInteger(draft.seatsTotal) || draft.seatsTotal < 1) {
            setError("Total seats must be a whole number, one or more.");
            return;
        }
        if (!draft.category) {
            setError("Pick a category. Add one under Admin → Settings if the list is empty.");
            return;
        }
        if (!draft.location) {
            setError("Pick a venue. Add one under Admin → Settings if the list is empty.");
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
                                    {categories.map((c) => (
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
                        <Field label="Duration" htmlFor="course-duration">
                            <Select value={draft.duration} onValueChange={(v) => set("duration", v)}>
                                <SelectTrigger id="course-duration" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {DURATION_OPTIONS.map((d) => (
                                        <SelectItem key={d} value={d}>
                                            {d}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <NumberField
                            id="course-seats"
                            label="Total seats"
                            value={draft.seatsTotal}
                            onChange={(v) => set("seatsTotal", v)}
                            min={1}
                            step={1}
                            integer
                        />
                    </div>

                    <div className={cn("grid gap-3", canAssignInstructor ? "grid-cols-2" : "grid-cols-1")}>
                        <Field label="Venue" htmlFor="course-location">
                            <Select value={draft.location} onValueChange={(v) => set("location", v)}>
                                <SelectTrigger id="course-location" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue placeholder="Select a venue" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {venues.map((v) => (
                                        <SelectItem key={v.id} value={v.name}>
                                            {v.name}
                                            <span className="text-slate-400 ml-1.5 text-xs">
                                                · {v.capacity} seats
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        {/* Assigning here is what puts the course on that
                            instructor's dashboard and lets them author its
                            modules and assessments. */}
                        {canAssignInstructor && <Field label="Instructor" htmlFor="course-instructor">
                            <Select
                                value={draft.instructorId || "unassigned"}
                                onValueChange={(v) => set("instructorId", v === "unassigned" ? "" : v)}
                            >
                                <SelectTrigger id="course-instructor" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {instructors.map((i) => (
                                        <SelectItem key={i.id} value={i.id}>
                                            {i.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>}
                    </div>

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
