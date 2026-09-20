import { cn } from "@/lib/utils";

/**
 * Small labelled form primitives shared by the assessment/course editors.
 *
 * These match the rounded, slate-tinted input styling used across the app
 * without pulling in react-hook-form for what are simple controlled dialogs.
 */

export function Field({
    label,
    htmlFor,
    required,
    hint,
    error,
    children,
    className,
}: {
    label: string;
    htmlFor?: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-1.5 min-w-0", className)}>
            <label htmlFor={htmlFor} className="text-xs font-medium text-slate-600">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-[10px] text-slate-400 font-normal">{hint}</p>}
            {error && <p className="text-[10px] text-destructive font-medium">{error}</p>}
        </div>
    );
}

const INPUT_CLASS =
    "w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all";

export function TextField({
    id,
    label,
    value,
    onChange,
    placeholder,
    required,
    hint,
    error,
    className,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    hint?: string;
    error?: string;
    className?: string;
}) {
    return (
        <Field label={label} htmlFor={id} required={required} hint={hint} error={error} className={className}>
            <input
                id={id}
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={cn(INPUT_CLASS, error && "border-destructive/50")}
            />
        </Field>
    );
}

export function NumberField({
    id,
    label,
    value,
    onChange,
    min,
    max,
    step,
    /** Rejects decimals outright — seat counts and attempt caps are whole numbers. */
    integer,
    hint,
    error,
}: {
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    integer?: boolean;
    hint?: string;
    error?: string;
}) {
    return (
        <Field label={label} htmlFor={id} hint={hint} error={error}>
            <input
                id={id}
                type="number"
                inputMode={integer ? "numeric" : undefined}
                value={value}
                min={min}
                max={max}
                step={step}
                onKeyDown={(e) => {
                    // A number input still accepts "." and "e" from the keyboard.
                    if (integer && [".", ",", "e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                    }
                }}
                onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isNaN(n)) return onChange(0);
                    onChange(integer ? Math.trunc(n) : n);
                }}
                className={cn(INPUT_CLASS, "tabular-nums")}
            />
        </Field>
    );
}

export function TextArea({
    id,
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
    required,
    hint,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    hint?: string;
}) {
    return (
        <Field label={label} htmlFor={id} required={required} hint={hint}>
            <textarea
                id={id}
                rows={rows}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all resize-none"
            />
        </Field>
    );
}
