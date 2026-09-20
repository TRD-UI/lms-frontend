import { useEffect, useState } from "react";

/**
 * Whether the browser currently has a network connection.
 *
 * `navigator.onLine` is the browser's own answer and it is conservative: false
 * means definitely offline, true means a network interface exists — not that
 * the server is reachable. That is the right signal for the header badge,
 * which is telling an instructor "your check-ins are reaching us", and it is
 * why the offline state is the one worth shouting about.
 */
export function useOnlineStatus(): boolean {
    const [online, setOnline] = useState(() =>
        typeof navigator === "undefined" ? true : navigator.onLine
    );

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        // The events can fire between first render and this effect running.
        setOnline(navigator.onLine);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    return online;
}
