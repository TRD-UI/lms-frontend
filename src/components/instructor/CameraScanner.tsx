import { useCallback, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import {
    Camera01Icon,
    CameraOff01Icon,
    FlashIcon,
    RefreshIcon,
    Alert01Icon,
} from "hugeicons-react";
import { cn } from "@/lib/utils";

/**
 * Live QR capture for the door.
 *
 * Decoding happens in a worker (qr-scanner), so a slow frame never blocks the
 * UI. The camera is opt-in: browsers only grant it on a user gesture, and an
 * instructor checking codes by hand should not have a permission prompt thrown
 * at them on page load.
 */

interface CameraScannerProps {
    onScan: (payload: string) => void;
    /**
     * The caller is verifying a code. Decoding pauses, so the queue behind the
     * learner at the door does not scan three people into one result card.
     */
    busy?: boolean;
    className?: string;
}

type Phase = "off" | "starting" | "live" | "error";

/** How long the same code is ignored after a read — the learner is still holding up their phone. */
const REPEAT_COOLDOWN_MS = 3500;

export function CameraScanner({ onScan, busy = false, className }: CameraScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    const lastScanRef = useRef<{ code: string; at: number } | null>(null);
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;

    const [phase, setPhase] = useState<Phase>("off");
    const [error, setError] = useState<string | null>(null);
    const [hasFlash, setHasFlash] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);
    const [cameraIndex, setCameraIndex] = useState(0);

    const handleDecode = useCallback((code: string) => {
        const now = Date.now();
        const last = lastScanRef.current;
        if (last && last.code === code && now - last.at < REPEAT_COOLDOWN_MS) return;
        lastScanRef.current = { code, at: now };
        onScanRef.current(code);
    }, []);

    const stop = useCallback(() => {
        scannerRef.current?.destroy();
        scannerRef.current = null;
        setPhase("off");
        setFlashOn(false);
        setHasFlash(false);
    }, []);

    const start = useCallback(async () => {
        const video = videoRef.current;
        if (!video || scannerRef.current) return;

        setError(null);
        setPhase("starting");

        // getUserMedia is only exposed on https (or localhost). Worth saying
        // plainly — otherwise the failure reads as a broken camera.
        if (!window.isSecureContext) {
            setError("Camera access needs a secure (https) connection. Use the manual code entry below.");
            setPhase("error");
            return;
        }

        try {
            const scanner = new QrScanner(video, (result) => handleDecode(result.data), {
                returnDetailedScanResult: true,
                preferredCamera: "environment",
                highlightScanRegion: true,
                highlightCodeOutline: true,
                maxScansPerSecond: 5,
            });
            scannerRef.current = scanner;
            await scanner.start();
            setPhase("live");

            const [flash, list] = await Promise.all([
                scanner.hasFlash().catch(() => false),
                QrScanner.listCameras(true).catch(() => [] as QrScanner.Camera[]),
            ]);
            setHasFlash(flash);
            setCameras(list);
        } catch (e) {
            scannerRef.current?.destroy();
            scannerRef.current = null;
            setError(describeCameraError(e));
            setPhase("error");
        }
    }, [handleDecode]);

    // Tear the camera down when the instructor navigates away — a live stream
    // left running keeps the device's camera light on.
    useEffect(() => () => {
        scannerRef.current?.destroy();
        scannerRef.current = null;
    }, []);

    useEffect(() => {
        const scanner = scannerRef.current;
        if (!scanner || phase !== "live") return;
        if (busy) void scanner.pause();
        else void scanner.start();
    }, [busy, phase]);

    const flipCamera = async () => {
        const scanner = scannerRef.current;
        if (!scanner || cameras.length < 2) return;
        const next = (cameraIndex + 1) % cameras.length;
        setCameraIndex(next);
        try {
            await scanner.setCamera(cameras[next].id);
            setHasFlash(await scanner.hasFlash().catch(() => false));
            setFlashOn(false);
        } catch {
            /* Staying on the current camera is a fine outcome. */
        }
    };

    const toggleFlash = async () => {
        const scanner = scannerRef.current;
        if (!scanner) return;
        try {
            await scanner.toggleFlash();
            setFlashOn(scanner.isFlashOn());
        } catch {
            setHasFlash(false);
        }
    };

    return (
        <div className={cn("relative aspect-[4/3] bg-slate-900 overflow-hidden", className)}>
            <video
                ref={videoRef}
                muted
                playsInline
                className={cn(
                    "h-full w-full object-cover",
                    phase === "live" || phase === "starting" ? "opacity-100" : "opacity-0"
                )}
            />

            {phase === "off" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                        <Camera01Icon size={32} />
                    </div>
                    <p className="text-sm font-medium text-white/60">Point the camera at a learner's pass</p>
                    <Button
                        onClick={() => void start()}
                        className="h-11 px-6 rounded-full bg-white text-slate-900 hover:bg-white/90 font-medium shadow-none"
                    >
                        <Camera01Icon size={18} className="mr-2" />
                        Start camera
                    </Button>
                </div>
            )}

            {phase === "starting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
                    <p className="text-sm font-medium text-white/60 animate-pulse">Opening camera…</p>
                </div>
            )}

            {phase === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center text-amber-300">
                        <Alert01Icon size={26} />
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed max-w-xs">{error}</p>
                    <Button
                        onClick={() => void start()}
                        variant="ghost"
                        className="h-9 px-4 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium"
                    >
                        Try again
                    </Button>
                </div>
            )}

            {busy && phase === "live" && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px]">
                    <p className="text-sm font-medium text-white/80 animate-pulse">Checking pass…</p>
                </div>
            )}

            {phase === "live" && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <Button
                        onClick={stop}
                        size="sm"
                        className="h-9 px-4 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white text-xs font-medium backdrop-blur shadow-none"
                    >
                        <CameraOff01Icon size={14} className="mr-1.5" />
                        Stop
                    </Button>
                    <div className="flex items-center gap-2">
                        {hasFlash && (
                            <Button
                                onClick={() => void toggleFlash()}
                                size="icon"
                                aria-label={flashOn ? "Turn off torch" : "Turn on torch"}
                                className={cn(
                                    "h-9 w-9 rounded-full backdrop-blur shadow-none",
                                    flashOn
                                        ? "bg-white text-slate-900 hover:bg-white/90"
                                        : "bg-slate-900/70 text-white hover:bg-slate-900/90"
                                )}
                            >
                                <FlashIcon size={15} />
                            </Button>
                        )}
                        {cameras.length > 1 && (
                            <Button
                                onClick={() => void flipCamera()}
                                size="icon"
                                aria-label="Switch camera"
                                className="h-9 w-9 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur shadow-none"
                            >
                                <RefreshIcon size={15} />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function describeCameraError(e: unknown): string {
    const name = (e as { name?: string })?.name;
    const message = typeof e === "string" ? e : (e as { message?: string })?.message ?? "";

    if (name === "NotAllowedError" || /permission|denied/i.test(message)) {
        return "Camera permission was declined. Allow camera access for this site in your browser settings, then try again.";
    }
    if (name === "NotFoundError" || /no camera|not found/i.test(message)) {
        return "No camera found on this device. Use the manual code entry below.";
    }
    if (name === "NotReadableError" || /in use|could not start/i.test(message)) {
        return "The camera is being used by another app. Close it and try again.";
    }
    return message || "The camera could not be started. Use the manual code entry below.";
}
