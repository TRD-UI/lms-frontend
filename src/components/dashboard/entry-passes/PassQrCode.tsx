import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";
import { SquareLock02Icon } from "hugeicons-react";
import { fetchPassQr } from "@/lib/api/classes";
import { cn } from "@/lib/utils";

/**
 * The scannable entry pass.
 *
 * The code is drawn here, in the browser, from the signed payload
 * `entry_pass_qr()` returns — `TRD1.<pass id>.<hmac>`. Previously this was an
 * <img> pointing at api.qrserver.com encoding the bare pass code, which sent
 * every learner's code to a third party on each render and, worse, meant a
 * working QR could be minted by anyone who guessed the code format. The door
 * verifies the HMAC, so only a code drawn from this payload survives a scan.
 */

interface UsePassQr {
    /** A `data:` URL for the QR image, once the pass has been released. */
    dataUrl: string | null;
    released: boolean;
    isLoading: boolean;
}

export function usePassQr(passId: string, enabled = true): UsePassQr {
    const { data, isLoading } = useQuery({
        queryKey: ["pass-qr", passId],
        queryFn: () => fetchPassQr(passId),
        enabled,
        // The payload is a stable HMAC, but a pass can be released mid-session
        // (the learner passes the gating test in the corridor), so don't cache
        // a withheld answer for long.
        staleTime: 30_000,
    });

    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const payload = data?.released ? data.payload : null;

    useEffect(() => {
        if (!payload) {
            setDataUrl(null);
            return;
        }
        let live = true;
        void QRCode.toDataURL(payload, {
            width: 512,
            margin: 0,
            errorCorrectionLevel: "M",
            color: { dark: "#0f172a", light: "#ffffff" },
        })
            .then((url) => {
                if (live) setDataUrl(url);
            })
            .catch(() => {
                if (live) setDataUrl(null);
            });
        return () => {
            live = false;
        };
    }, [payload]);

    return { dataUrl, released: Boolean(data?.released), isLoading };
}

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
