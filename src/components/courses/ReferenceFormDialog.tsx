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
import { NumberField, TextField } from "@/components/assessments/form-fields";
import { useLms } from "@/store/lms-store";
import { describeError } from "@/lib/supabase";
import { toast } from "sonner";

interface ReferenceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kind: "categories" | "venues";
}

/** Adds a course category or a venue. Admin-only, enforced by RLS. */
export function ReferenceFormDialog({ open, onOpenChange, kind }: ReferenceFormDialogProps) {
    const { categories, venues, addCategory, addVenue } = useLms();
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState(20);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const isVenue = kind === "venues";

    useEffect(() => {
        if (!open) return;
        setName("");
        setCapacity(20);
        setError(null);
    }, [open, kind]);

    const submit = async () => {
        const clean = name.trim();
        if (!clean) {
            setError(`Give the ${isVenue ? "venue" : "category"} a name.`);
            return;
        }
        const taken = isVenue ? venues.some((v) => v.name === clean) : categories.includes(clean);
        if (taken) {
            setError("That name is already on the list.");
            return;
        }

        setBusy(true);
        try {
            if (isVenue) await addVenue(clean, Math.max(1, Math.trunc(capacity)));
            else await addCategory(clean);
            toast.success(isVenue ? "Venue added" : "Category added");
            onOpenChange(false);
        } catch (e) {
            setError(describeError(e as { message?: string }));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        {isVenue ? "New venue" : "New category"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        {isVenue
                            ? "Venues are what instructors pick from when scheduling a class."
                            : "Categories are what courses are filed under in the catalog."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    <TextField
                        id="reference-name"
                        label="Name"
                        required
                        value={name}
                        onChange={(v) => {
                            setName(v);
                            setError(null);
                        }}
                        placeholder={isVenue ? "e.g. Training Lab 4" : "e.g. Cloud Engineering"}
                        error={error ?? undefined}
                    />

                    {isVenue && (
                        <NumberField
                            id="reference-capacity"
                            label="Capacity"
                            value={capacity}
                            onChange={setCapacity}
                            min={1}
                            step={1}
                            integer
                        />
                    )}
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
                        onClick={submit}
                        disabled={busy || !name.trim()}
                        className="rounded-full h-10 bg-primary hover:bg-primary/90 text-white font-normal shadow-lg shadow-primary/10"
                    >
                        {busy ? "Adding…" : isVenue ? "Add venue" : "Add category"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
