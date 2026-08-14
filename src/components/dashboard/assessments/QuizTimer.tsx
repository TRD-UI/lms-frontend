import { useEffect, useRef, useState } from "react";
import { Timer01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
    /** Total allowance in seconds. */
    totalSeconds: number;
    /** Fired once when the clock reaches zero. */
    onExpire: () => void;
    /** Reports elapsed time on each tick so the parent can record duration. */
    onTick?: (elapsedSeconds: number) => void;
    paused?: boolean;
}

/** Counts down the assessment allowance and auto-submits at zero. */
export function QuizTimer({ totalSeconds, onExpire, onTick, paused }: QuizTimerProps) {
    const [remaining, setRemaining] = useState(totalSeconds);

    // Keep the latest callbacks without restarting the interval each render.
    const onExpireRef = useRef(onExpire);
    const onTickRef = useRef(onTick);
    onExpireRef.current = onExpire;
    onTickRef.current = onTick;

    const firedRef = useRef(false);

    useEffect(() => {
        if (paused) return;
        const id = window.setInterval(() => {
            setRemaining((prev) => {
                const next = Math.max(0, prev - 1);
                onTickRef.current?.(totalSeconds - next);
                if (next === 0 && !firedRef.current) {
                    firedRef.current = true;
                    onExpireRef.current();
                }
                return next;
            });
        }, 1000);
        return () => window.clearInterval(id);
    }, [paused, totalSeconds]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const ratio = totalSeconds === 0 ? 1 : remaining / totalSeconds;

    const tone =
        ratio <= 0.1
            ? "bg-red-50 text-red-600"
            : ratio <= 0.25
                ? "bg-amber-50 text-amber-600"
                : "bg-slate-100 text-slate-600";

    return (
        <div
            role="timer"
            aria-live={ratio <= 0.1 ? "assertive" : "off"}
            className={cn(
                "flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium tabular-nums transition-colors",
                tone
            )}
        >
            <Timer01Icon size={16} />
            {minutes}:{String(seconds).padStart(2, "0")}
            <span className="sr-only"> remaining</span>
        </div>
    );
}
