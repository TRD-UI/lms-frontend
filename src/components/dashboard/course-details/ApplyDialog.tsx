import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field, TextField, TextArea } from "@/components/assessments/form-fields";
import { applyForCourse } from "@/lib/api/applications";
import { describeError } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Admission form.
 *
 * Short on purpose: the four things a reviewer actually weighs. Anything
 * longer is a form people abandon halfway, and the reviewer still has the
 * learner's profile to hand.
 */

const EXPERIENCE_LEVELS = [
    "No prior experience",
    "Some self-study",
    "Working in the field",
    "Several years in the field",
];

interface ApplyDialogProps {
    courseId: string;
    courseTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Pre-fills the form when re-applying after a rejection. */
    initial?: { phone: string; employer: string; experience: string; motivation: string };
}

export function ApplyDialog({
    courseId,
    courseTitle,
    open,
    onOpenChange,
    initial,
}: ApplyDialogProps) {
    const queryClient = useQueryClient();
    const [phone, setPhone] = useState(initial?.phone ?? "");
    const [employer, setEmployer] = useState(initial?.employer ?? "");
    const [experience, setExperience] = useState(initial?.experience || EXPERIENCE_LEVELS[0]);
    const [motivation, setMotivation] = useState(initial?.motivation ?? "");
    const [touched, setTouched] = useState(false);

    const phoneError = touched && !phone.trim() ? "A phone number is required." : undefined;
    const motivationError =
        touched && motivation.trim().length < 20
            ? "Tell us a little more — at least a sentence or two."
            : undefined;

    const submit = useMutation({
        mutationFn: () =>
            applyForCourse(courseId, {
                phone: phone.trim(),
                employer: employer.trim(),
                experience,
                motivation: motivation.trim(),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["my-applications"] });
            void queryClient.invalidateQueries({ queryKey: ["course-applications"] });
            toast.success("Application submitted", {
                description: `We'll let you know once ${courseTitle} has been reviewed.`,
            });
            setTouched(false);
            onOpenChange(false);
        },
        onError: (e) =>
            toast.error("Could not submit your application", {
                description: describeError(e as { message?: string }),
            }),
    });

    const handleSubmit = () => {
        setTouched(true);
        if (!phone.trim() || motivation.trim().length < 20) return;
        submit.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl border-slate-100 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        Apply for admission
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        {courseTitle}. Your application goes to the course team for review.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <TextField
                        id="apply-phone"
                        label="Phone number"
                        required
                        value={phone}
                        onChange={setPhone}
                        placeholder="080X XXX XXXX"
                        error={phoneError}
                    />
                    <TextField
                        id="apply-employer"
                        label="Employer or institution"
                        value={employer}
                        onChange={setEmployer}
                        placeholder="Optional"
                    />
                    <Field label="Experience level" htmlFor="apply-experience">
                        <Select value={experience} onValueChange={setExperience}>
                            <SelectTrigger
                                id="apply-experience"
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <TextArea
                        id="apply-motivation"
                        label="Why do you want this place?"
                        required
                        rows={4}
                        value={motivation}
                        onChange={setMotivation}
                        placeholder="What you hope to get out of the course, and what you'd bring to it."
                        error={motivationError}
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 rounded-full border-slate-200 text-slate-600 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submit.isPending}
                        className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                    >
                        {submit.isPending ? "Submitting…" : "Submit application"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
