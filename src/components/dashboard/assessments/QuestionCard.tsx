import { CheckmarkCircle01Icon, Cancel01Icon } from "hugeicons-react";
import type { AssessmentQuestion } from "@/data/assessment-types";
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
 * `single`/`boolean` behave as radios, `multiple` as checkboxes. In review mode
 * the correct option is marked with a ✓ and an incorrect selection with a ✗, so
 * correctness never rests on colour alone.
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
        if (isMultiple) {
            onChange(
                selectedOptionIds.includes(optionId)
                    ? selectedOptionIds.filter((id) => id !== optionId)
                    : [...selectedOptionIds, optionId]
            );
        } else {
            onChange([optionId]);
        }
    };

    return (
        <fieldset className="space-y-5 min-w-0">
            <legend className="sr-only">{`Question ${index + 1} of ${total}`}</legend>

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
                <h2 className="text-lg sm:text-xl font-medium text-slate-900 leading-snug">
                    {question.prompt}
                </h2>
            </div>

            <div className="space-y-2.5">
                {question.options.map((option) => {
                    const selected = selectedOptionIds.includes(option.id);
                    const isCorrectOption = question.correctOptionIds.includes(option.id);

                    // Review styling: the key is always marked; a wrong pick is flagged.
                    const reviewTone = review
                        ? isCorrectOption
                            ? "border-emerald-300 bg-emerald-50/60"
                            : selected
                                ? "border-red-300 bg-red-50/60"
                                : "border-slate-100 bg-white"
                        : selected
                            ? "border-primary/40 bg-accent/20 ring-2 ring-primary/10"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60";

                    return (
                        <label
                            key={option.id}
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-2xl border transition-all",
                                reviewTone,
                                review ? "cursor-default" : "cursor-pointer"
                            )}
                        >
                            <input
                                type={isMultiple ? "checkbox" : "radio"}
                                name={question.id}
                                checked={selected}
                                onChange={() => toggle(option.id)}
                                disabled={review}
                                className="sr-only"
                            />

                            <span
                                className={cn(
                                    "h-5 w-5 shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all",
                                    isMultiple ? "rounded-md" : "rounded-full",
                                    selected
                                        ? review
                                            ? isCorrectOption
                                                ? "border-emerald-500 bg-emerald-500"
                                                : "border-red-500 bg-red-500"
                                            : "border-primary bg-primary"
                                        : review && isCorrectOption
                                            ? "border-emerald-500"
                                            : "border-slate-300"
                                )}
                            >
                                {selected && (
                                    <span
                                        className={cn(
                                            "bg-white",
                                            isMultiple ? "h-2 w-2 rounded-[2px]" : "h-1.5 w-1.5 rounded-full"
                                        )}
                                    />
                                )}
                            </span>

                            <span className="text-sm text-slate-700 font-medium leading-relaxed flex-1 min-w-0">
                                {option.label}
                            </span>

                            {review && isCorrectOption && (
                                <CheckmarkCircle01Icon size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {review && selected && !isCorrectOption && (
                                <Cancel01Icon size={18} className="text-red-500 shrink-0 mt-0.5" />
                            )}
                        </label>
                    );
                })}
            </div>

            {review && question.explanation && (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5">
                        Explanation
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {question.explanation}
                    </p>
                </div>
            )}
        </fieldset>
    );
}
