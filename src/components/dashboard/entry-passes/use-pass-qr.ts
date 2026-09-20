import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";
import { fetchPassQr, type PassQr } from "@/lib/api/classes";

/**
 * The signed entry-pass payload, rendered to a QR image in the browser.
 *
 * `entry_pass_qr()` returns `TRD1.<pass id>.<hmac>` — and only to the pass
 * holder, and only once the pass is released. Drawing it here rather than
 * fetching an image from api.qrserver.com keeps the learner's code off a third
 * party, and means the door's HMAC check is the thing that actually gates
 * entry: a QR minted from a guessed pass code will not verify.
 */

interface UsePassQr {
    /** A `data:` URL for the QR image, once the pass has been released. */
    dataUrl: string | null;
    released: boolean;
    isLoading: boolean;
    /** Why the code is withheld, phrased for the learner. */
    withheldBecause: string | null;
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

    return {
        dataUrl,
        released: Boolean(data?.released),
        isLoading,
        withheldBecause: data ? explain(data) : null,
    };
}

function explain(data: PassQr): string | null {
    if (!("reason" in data)) return null;
    switch (data.reason) {
        case "not_yet": {
            const day = new Date(data.availableOn).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
            });
            return `This code opens on ${day}, the day of the class.`;
        }
        case "expired":
            return "This class has already taken place.";
        default:
            return "Pass the required test for this course and the code will open on the day of the class.";
    }
}
