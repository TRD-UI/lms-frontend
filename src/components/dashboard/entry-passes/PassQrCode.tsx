import { SquareLock02Icon } from "hugeicons-react";
import { usePassQr } from "./use-pass-qr";
import { cn } from "@/lib/utils";

interface PassQrCodeProps {
    passId: string;
    /**
     * The caller already knows the pass is withheld — it has the prerequisite
     * and session date to hand. Saves a round trip that would only be refused.
     */
    locked?: boolean;
    className?: string;
}

export function PassQrCode({ passId, locked = false, className }: PassQrCodeProps) {
    const { dataUrl, isLoading } = usePassQr(passId, !locked);
    const showLock = locked || (!isLoading && !dataUrl);

    return (
        <div className="relative">
            {dataUrl ? (
                <img
                    src={dataUrl}
                    alt={showLock ? "" : "Entry pass QR code"}
                    aria-hidden={showLock}
                    className={cn(className, showLock && "blur-[6px] opacity-40")}
                />
            ) : (
                <div
                    className={cn(
                        className,
                        "rounded bg-slate-100",
                        isLoading && !locked && "animate-pulse"
                    )}
                />
            )}
            {showLock && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-400">
                        <SquareLock02Icon size={18} />
                    </div>
                </div>
            )}
        </div>
    );
}
