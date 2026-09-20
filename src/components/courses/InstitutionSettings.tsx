import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Add01Icon, Delete02Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/assessments/form-fields";
import { fetchInstitution, updateInstitution } from "@/lib/api/reference";
import { describeError } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FIELD =
    "h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 " +
    "focus:border-primary/30 transition-all";

/** A list of short strings — facilities, phone numbers — edited in place. */
function StringList({
    label,
    values,
    onChange,
    placeholder,
}: {
    label: string;
    values: string[];
    onChange: (next: string[]) => void;
    placeholder: string;
}) {
    return (
        <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-600">{label}</span>
            <div className="space-y-2">
                {values.map((value, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            value={value}
                            onChange={(e) => {
                                const next = [...values];
                                next[i] = e.target.value;
                                onChange(next);
                            }}
                            placeholder={placeholder}
                            className={cn(FIELD, "flex-1")}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${label} entry ${i + 1}`}
                            onClick={() => onChange(values.filter((_, j) => j !== i))}
                            className="h-10 w-10 rounded-full text-slate-400 hover:text-destructive shrink-0"
                        >
                            <Delete02Icon size={15} />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onChange([...values, ""])}
                    className="h-9 rounded-full text-primary hover:bg-primary/5 font-medium text-xs gap-1.5 px-3"
                >
                    <Add01Icon size={14} />
                    Add
                </Button>
            </div>
        </div>
    );
}

/**
 * The copy shown on every course page: enrolment rules, facilities and enquiry
 * numbers. Previously hardcoded, so a changed phone number needed a deploy.
 */
export function InstitutionSettings() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["institution"],
        queryFn: fetchInstitution,
        staleTime: 10 * 60_000,
    });

    const [form, setForm] = useState({
        enrollmentRule: "",
        specialPackageRule: "",
        facilities: [] as string[],
        contacts: [] as string[],
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data) setForm(data);
    }, [data]);

    const save = async () => {
        setSaving(true);
        try {
            await updateInstitution({
                ...form,
                // A blank row is an accident, not an entry.
                facilities: form.facilities.map((f) => f.trim()).filter(Boolean),
                contacts: form.contacts.map((c) => c.trim()).filter(Boolean),
            });
            void queryClient.invalidateQueries({ queryKey: ["institution"] });
            toast.success("Institution details saved");
        } catch (e) {
            toast.error("Could not save", { description: describeError(e as { message?: string }) });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12 mx-1 sm:mx-2">
                <div className="h-6 w-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-2xl mx-1 sm:mx-2">
            <TextArea
                id="enrollment-rule"
                label="Enrollment rule"
                value={form.enrollmentRule}
                onChange={(v) => setForm((f) => ({ ...f, enrollmentRule: v }))}
                placeholder="How and when learners may enrol."
            />

            <TextArea
                id="special-package-rule"
                label="Special package rule"
                value={form.specialPackageRule}
                onChange={(v) => setForm((f) => ({ ...f, specialPackageRule: v }))}
                placeholder="Terms for the special class package."
            />

            <StringList
                label="Facilities"
                values={form.facilities}
                onChange={(v) => setForm((f) => ({ ...f, facilities: v }))}
                placeholder="e.g. State-of-the-art computers"
            />

            <StringList
                label="Enquiry numbers"
                values={form.contacts}
                onChange={(v) => setForm((f) => ({ ...f, contacts: v }))}
                placeholder="e.g. 0803-302-7479"
            />

            <Button
                onClick={save}
                disabled={saving}
                className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium"
            >
                {saving ? "Saving…" : "Save changes"}
            </Button>
        </div>
    );
}
