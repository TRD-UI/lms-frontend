import type { AssessmentQuestion } from "@/data/assessment-types";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
    question: AssessmentQuestion;
    index: number;
    total: number;
    selectedOptionIds: string[];
    onChange: (optionIds: string[]) => void;
    /** Locks input and reveals the answer key — used on the review screen. */
    review?: boolean;
}

/**
 * One question with its options.
 *
 * `single`/`boolean` render a RadioGroup, `multiple` renders Checkboxes — the
 * real primitives, so keyboard behaviour (arrow keys within a radio group,
 * space to toggle a box) is whatever Radix says it is rather than something
 * approximated with hidden inputs.
 */
export function QuestionCard({
    question,
    index,
    total,
    selectedOptionIds,
    onChange,
    review,
}: QuestionCardProps) {
    const isMultiple = question.type === "multiple";

    const toggle = (optionId: string) => {
        if (review) return;
        onChange(
            selectedOptionIds.includes(optionId)
                ? selectedOptionIds.filter((id) => id !== optionId)
                : [...selectedOptionIds, optionId]
        );
    };

    /** Row tint. In review the key is always tinted; a wrong pick is tinted red. */
    const rowTone = (selected: boolean, isCorrectOption: boolean) => {
        if (review) {
            if (isCorrectOption) return "border-emerald-300 bg-emerald-50/60";
            if (selected) return "border-red-300 bg-red-50/60";
            return "border-slate-100 bg-white";
        }
        return selected
            ? "border-primary/40 bg-accent/20 ring-2 ring-primary/10"
            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60";
    };

    /**
     * Control tint in review. `disabled` would grey the control out, but this is
     * a results screen — the state has to stay legible, so opacity is restored
     * and the colour is carried through to the border and the dot.
     */
    const controlTone = (isCorrectOption: boolean, selected: boolean) =>
        review
            ? cn(
                "disabled:opacity-100",
                isCorrectOption
                    ? "border-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 [&_svg]:fill-emerald-600 [&_svg]:text-emerald-600"
                    : selected
                        ? "border-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500 [&_svg]:fill-red-600 [&_svg]:text-red-600"
                        : "border-slate-300"
            )
            : undefined;

    const header = (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    Question {index + 1} of {total}
                </span>
                {isMultiple && (
                    <span className="text-[10px] font-medium text-primary bg-accent/40 rounded-full px-2 py-0.5">
                        Select all that apply
                    </span>
                )}
                <span className="text-[10px] font-medium text-slate-400 ml-auto">
                    {question.points} {question.points === 1 ? "point" : "points"}
                </span>
            </div>
            <h2 className="text-base sm:text-xl font-medium text-slate-900 leading-snug">
                {question.prompt}
            </h2>
        </div>
    );

    const rowClass = (selected: boolean, isCorrectOption: boolean) =>
        cn(
            "flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all",
            rowTone(selected, isCorrectOption),
            review ? "cursor-default" : "cursor-pointer"
        );

    return (
        <fieldset className="space-y-4 sm:space-y-5 min-w-0">
            <legend className="sr-only">{`Question ${index + 1} of ${total}`}</legend>

            {header}

            {isMultiple ? (
                <div className="space-y-2 sm:space-y-2.5">
                    {question.options.map((option) => {
                        const selected = selectedOptionIds.includes(option.id);
                        const isCorrectOption = question.correctOptionIds.includes(option.id);
                        return (
                            <label key={option.id} className={rowClass(selected, isCorrectOption)}>
                                <Checkbox
                                    checked={selected}
                                    onCheckedChange={() => toggle(option.id)}
                                    disabled={review}
                                    className={cn("mt-0.5", controlTone(isCorrectOption, selected))}
                                />
                                <span className="text-sm text-slate-700 font-medium leading-relaxed flex-1 min-w-0">
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            ) : (
                <RadioGroup
                    value={selectedOptionIds[0] ?? ""}
                    onValueChange={(value) => !review && onChange([value])}
                    disabled={review}
                    className="space-y-2 sm:space-y-2.5 gap-0"
                >
                    {question.options.map((option) => {
                        const selected = selectedOptionIds.includes(option.id);
                        const isCorrectOption = question.correctOptionIds.includes(option.id);
                        return (
                            <label key={option.id} className={rowClass(selected, isCorrectOption)}>
                                <RadioGroupItem
                                    value={option.id}
                                    className={cn("mt-0.5", controlTone(isCorrectOption, selected))}
                                />
                                <span className="text-sm text-slate-700 font-medium leading-relaxed flex-1 min-w-0">
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </RadioGroup>
            )}
        </fieldset>
    );
}
