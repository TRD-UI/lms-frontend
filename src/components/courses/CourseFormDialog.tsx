import { useCallback, useEffect, useRef, useState } from "react";
import { useFileDrop } from "@/hooks/use-file-drop";
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
import { Field, MoneyField, NumberField, TextArea, TextField } from "@/components/assessments/form-fields";
import { useLms } from "@/store/lms-store";
import { describeError } from "@/lib/supabase";
import { Add01Icon, Upload01Icon, Cancel01Icon } from "hugeicons-react";
import { uploadCourseImage } from "@/lib/api/courses";
import { toast } from "sonner";
import type { Course, FeeStructure } from "@/data/types";
import { cn } from "@/lib/utils";

export interface CourseDraft {
    /**
     * The id the course will be created with. Fixed before the form is filled
     * in so the cover image can be uploaded under the course's own folder.
     * Ignored when editing — the existing course keeps its id.
     */
    id: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    location: string;
    seatsTotal: number;
    imageUrl: string;
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
    // Replaced with the form's own draft id on submit.
    id: "",
    title: "",
    description: "",
    category: "",
    duration: "1 month",
    location: "",
    seatsTotal: 20,
    imageUrl: "",
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
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        location: course.location,
        seatsTotal: course.seats.total,
        imageUrl: course.imageUrl ?? "",
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
    const { categories, venues, instructors, addCategory, addVenue } = useLms();
    const [draft, setDraft] = useState<CourseDraft>(EMPTY);
    const [error, setError] = useState<string | null>(null);
    // An admin hitting a missing option should not have to leave the form.
    const [adding, setAdding] = useState<null | "category" | "venue">(null);

    /**
     * The image is chosen before the course exists, so the form settles on an
     * id up front, uploads under it, and hands it back on submit to be used as
     * the new course's primary key. Storage path and row therefore agree —
     * which is what makes the bucket's ownership-based replace and delete
     * policies work, and what lets a deleted course take its covers with it.
     */
    const [draftId] = useState(() => crypto.randomUUID());
    const [uploading, setUploading] = useState(false);
    const imageInput = useRef<HTMLInputElement>(null);

    const uploadImage = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Choose an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Cover images are limited to 5 MB.");
            return;
        }
        setUploading(true);
        setError(null);
        try {
            const url = await uploadCourseImage(course?.id ?? draftId, file);
            set("imageUrl", url);
        } catch (e) {
            setError(describeError(e as { message?: string }));
        } finally {
            setUploading(false);
        }
    }, [course?.id, draftId]);

    const { dragging, dropProps } = useFileDrop((file) => void uploadImage(file));
    const [newName, setNewName] = useState("");
    const [newCapacity, setNewCapacity] = useState(20);

    const commitNew = async () => {
        const name = newName.trim();
        if (!name) return;
        try {
            if (adding === "category") {
                await addCategory(name);
                set("category", name);
            } else {
                await addVenue(name, Math.max(1, Math.trunc(newCapacity)));
                set("location", name);
            }
            toast.success(adding === "category" ? "Category added" : "Venue added");
            setAdding(null);
            setNewName("");
            setNewCapacity(20);
        } catch (e) {
            toast.error("Could not add", { description: describeError(e as { message?: string }) });
        }
    };

    /*
     * Seed the form when it opens, or when it is pointed at a different course.
     *
     * Deliberately NOT keyed on `categories`/`venues`: those are query results
     * that get a new array identity on every background refetch, and this
     * effect resets the whole draft — so a refetch landing mid-edit (including
     * one triggered by adding a category from inside this very form) wiped
     * whatever had been typed, and any cover image just uploaded with it.
     */
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, course?.id]);

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
            setError("Pick a venue. Add one from the dropdown if the list is empty.");
            return;
        }
        // Course cards are image-led, so a cover is not optional.
        if (!draft.imageUrl) {
            setError("Upload a cover image — it is what learners see on the course card.");
            return;
        }
        onSubmit({
            ...draft,
            id: course?.id ?? draftId,
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
                    {/* Cover image */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-medium text-slate-600">
                            Cover image <span className="text-destructive">*</span>
                        </span>

                        <input
                            ref={imageInput}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void uploadImage(file);
                                e.target.value = "";
                            }}
                        />

                        {draft.imageUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[16/7] bg-slate-50">
                                <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => set("imageUrl", "")}
                                    aria-label="Remove cover image"
                                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 backdrop-blur border border-slate-200 text-slate-500 hover:text-destructive flex items-center justify-center shadow-sm"
                                >
                                    <Cancel01Icon size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                {...dropProps}
                                onClick={() => imageInput.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") imageInput.current?.click();
                                }}
                                className={cn(
                                    "rounded-xl border-2 border-dashed aspect-[16/7] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all",
                                    dragging ? "border-primary bg-accent/20" : "border-slate-200 bg-slate-50 hover:border-slate-300",
                                    uploading && "opacity-60 pointer-events-none"
                                )}
                            >
                                {uploading ? (
                                    <>
                                        <span className="h-5 w-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                                        <p className="text-xs font-medium text-slate-500">Uploading…</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload01Icon size={20} className={cn(dragging ? "text-primary" : "text-slate-300")} />
                                        <p className="text-xs font-medium text-slate-600">
                                            Drop an image, or <span className="text-primary">browse</span>
                                        </p>
                                        <p className="text-[11px] text-slate-400">PNG, JPG or WebP · up to 5 MB</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

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
                                    {canAssignInstructor && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => { setAdding("category"); setNewName(""); }}
                                            className="w-full flex items-center gap-2 px-2 py-2 mt-1 border-t border-slate-100 text-xs font-medium text-primary hover:bg-slate-50 rounded-lg"
                                        >
                                            <Add01Icon size={14} />
                                            Add category
                                        </button>
                                    )}
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
                                    {canAssignInstructor && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => { setAdding("venue"); setNewName(""); }}
                                            className="w-full flex items-center gap-2 px-2 py-2 mt-1 border-t border-slate-100 text-xs font-medium text-primary hover:bg-slate-50 rounded-lg"
                                        >
                                            <Add01Icon size={14} />
                                            Add venue
                                        </button>
                                    )}
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
                            <MoneyField
                                id="course-flat"
                                label="Amount"
                                value={draft.flatAmount}
                                onChange={(v) => set("flatAmount", v)}
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <MoneyField
                                    id="course-cohort"
                                    label="Cohort"
                                    value={draft.cohortAmount}
                                    onChange={(v) => set("cohortAmount", v)}
                                />
                                <MoneyField
                                    id="course-special"
                                    label="Special"
                                    value={draft.specialAmount}
                                    onChange={(v) => set("specialAmount", v)}
                                />
                            </div>
                        )}
                    </div>

                    {adding && (
                        <div className="rounded-xl border border-primary/20 bg-accent/10 p-3 space-y-2.5">
                            <p className="text-xs font-medium text-slate-700">
                                New {adding === "category" ? "category" : "venue"}
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") { e.preventDefault(); void commitNew(); }
                                        if (e.key === "Escape") setAdding(null);
                                    }}
                                    placeholder={adding === "category" ? "e.g. Cloud Engineering" : "e.g. Training Lab 4"}
                                    className="flex-1 h-10 px-3 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                {adding === "venue" && (
                                    <input
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={newCapacity}
                                        onChange={(e) => setNewCapacity(Number(e.target.value))}
                                        aria-label="Capacity"
                                        className="w-24 h-10 px-3 rounded-lg bg-white border border-slate-200 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                )}
                                <Button
                                    type="button"
                                    onClick={() => void commitNew()}
                                    disabled={!newName.trim()}
                                    className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium"
                                >
                                    Add
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setAdding(null)}
                                    className="h-10 px-3 rounded-lg text-slate-500 text-xs"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

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
