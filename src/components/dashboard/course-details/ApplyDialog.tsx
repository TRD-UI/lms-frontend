import { useRef, useState } from "react";
import { Attachment01Icon, Cancel01Icon, File01Icon } from "hugeicons-react";
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
import { applyForCourse, uploadPaymentEvidence } from "@/lib/api/applications";
import { useFileDrop } from "@/hooks/use-file-drop";
import { cn } from "@/lib/utils";
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
    initial?: {
        phone: string;
        employer: string;
        experience: string;
        motivation: string;
        paymentEvidencePath: string;
    };
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

    // Proof of payment. The file goes to private storage first; only its path
    // is submitted with the application.
    const [evidencePath, setEvidencePath] = useState(initial?.paymentEvidencePath ?? "");
    const [evidenceName, setEvidenceName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    const attach = async (file: File) => {
        const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
        if (!allowed.includes(file.type)) {
            setUploadError("Attach a PNG, JPG, WebP or PDF.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("Receipts are limited to 5 MB.");
            return;
        }
        setUploading(true);
        setUploadError(null);
        try {
            setEvidencePath(await uploadPaymentEvidence(file));
            setEvidenceName(file.name);
        } catch (e) {
            setUploadError(describeError(e as { message?: string }));
        } finally {
            setUploading(false);
        }
    };

    const { dragging, dropProps } = useFileDrop((file) => void attach(file));

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
                paymentEvidencePath: evidencePath,
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
        if (!phone.trim() || motivation.trim().length < 20 || !evidencePath) return;
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
                    <div className="space-y-1.5">
                        <span className="text-xs font-medium text-slate-600">
                            Proof of payment <span className="text-destructive">*</span>
                        </span>
                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void attach(file);
                                e.target.value = "";
                            }}
                        />
                        {evidencePath ? (
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <File01Icon size={16} className="text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-700 truncate flex-1 min-w-0">
                                    {evidenceName || "Receipt attached"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEvidencePath("");
                                        setEvidenceName("");
                                    }}
                                    aria-label="Remove receipt"
                                    className="h-7 w-7 rounded-full text-slate-400 hover:text-destructive flex items-center justify-center shrink-0"
                                >
                                    <Cancel01Icon size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                {...dropProps}
                                onClick={() => fileInput.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") fileInput.current?.click();
                                }}
                                className={cn(
                                    "rounded-xl border-2 border-dashed py-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all",
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
                                        <Attachment01Icon size={18} className={cn(dragging ? "text-primary" : "text-slate-300")} />
                                        <p className="text-xs font-medium text-slate-600">
                                            Drop your receipt, or <span className="text-primary">browse</span>
                                        </p>
                                        <p className="text-[11px] text-slate-400">PNG, JPG, WebP or PDF · up to 5 MB</p>
                                    </>
                                )}
                            </div>
                        )}
                        {uploadError && <p className="text-[10px] text-destructive font-medium">{uploadError}</p>}
                        {touched && !evidencePath && !uploadError && (
                            <p className="text-[10px] text-destructive font-medium">
                                Attach proof that the application fee has been paid.
                            </p>
                        )}
                    </div>

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
