import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    QrCode01Icon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    ArrowReloadHorizontalIcon,
} from "hugeicons-react";
import { CameraScanner } from "@/components/instructor/CameraScanner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ScanResult } from "@/data/admin-types";
import { redeemPass } from "@/lib/api/classes";
import { describeError } from "@/lib/supabase";

export default function QRScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [lastResult, setLastResult] = useState<ScanResult | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
    const [clearHistoryOpen, setClearHistoryOpen] = useState(false);

    /**
     * Verifies against the database. The same call handles a scanned QR and a
     * code typed by hand, and checking in also records attendance — server-side,
     * so the door and the register cannot disagree.
     */
    const processCode = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return;

        setIsScanning(true);
        try {
            const outcome = await redeemPass(trimmed);
            const result: ScanResult = {
                valid: outcome.valid,
                studentName: outcome.studentName ?? "Unknown",
                passCode: outcome.passCode ?? trimmed.toUpperCase(),
                courseName: outcome.courseName ?? "—",
                message: outcome.message,
            };

            setLastResult(result);
            setScanHistory((prev) => [result, ...prev.slice(0, 9)]);

            if (result.valid) {
                toast.success(`${result.studentName} verified`, { description: result.message });
            } else {
                toast.error("Verification failed", { description: result.message });
            }
        } catch (e) {
            toast.error("Could not check that pass", {
                description: describeError(e as { message?: string }),
            });
        } finally {
            setIsScanning(false);
        }
    }, []);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            void processCode(manualCode);
            setManualCode("");
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-slate-800">
                    QR Scanner
                </h1>
            </div>

            <div className="grid gap-6 lg:gap-8 lg:grid-cols-5 px-2">
                {/* Scanner Area */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                    {/* Camera Viewport */}
                    <Card className="border-slate-100 rounded-2xl shadow-none overflow-hidden">
                        <CardContent className="p-0">
                            <CameraScanner onScan={(code) => void processCode(code)} busy={isScanning} />
                        </CardContent>
                    </Card>

                    {/* Pass code entry — the working check-in path. */}
                    <form onSubmit={handleManualSubmit} className="flex items-center gap-2 sm:gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Or enter pass code..."
                                aria-label="Manual pass code entry"
                                className="h-11 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!manualCode.trim()}
                            className="h-11 px-5 sm:px-6 rounded-full bg-accent/70 hover:bg-accent/40 text-primary font-medium shadow-none shrink-0"
                        >
                            Verify
                        </Button>
                    </form>
                </div>

                {/* Results Side Panel */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Last Result */}
                    {lastResult && (
                        <Card className={cn(
                            "rounded-2xl shadow-none border-0 sm:border transition-all animate-in fade-in zoom-in-95 duration-500",
                            lastResult.valid
                                ? "sm:border-emerald-200 bg-emerald-50/40 sm:bg-emerald-50/30"
                                : "sm:border-red-200 bg-red-50/40 sm:bg-red-50/30"
                        )}>
                            <CardContent className="p-3.5 sm:p-6 space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    <div className={cn(
                                        "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0",
                                        lastResult.valid ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                                    )}>
                                        {lastResult.valid ? <CheckmarkCircle01Icon size={22} /> : <Cancel01Icon size={22} />}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className={cn("text-base sm:text-lg font-medium", lastResult.valid ? "text-emerald-800" : "text-red-800")}>
                                            {lastResult.valid ? "Verified" : "Denied"}
                                        </h3>
                                        <p className="text-xs text-slate-400 truncate">{lastResult.passCode}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <div className="flex items-center justify-between gap-3 text-[13px] sm:text-sm">
                                        <span className="text-slate-500 shrink-0">Student</span>
                                        <span className="font-medium text-slate-800 truncate" title={lastResult.studentName}>
                                            {lastResult.studentName}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 text-[13px] sm:text-sm">
                                        <span className="text-slate-500 shrink-0">Course</span>
                                        <span className="font-medium text-slate-800 truncate" title={lastResult.courseName}>
                                            {lastResult.courseName}
                                        </span>
                                    </div>
                                </div>
                                {!lastResult.valid && (
                                    <p className="text-xs text-slate-500 leading-relaxed bg-white/50 rounded-xl p-3">
                                        {lastResult.message}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Scan History */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-800">Recent Scans</h3>
                            {scanHistory.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setClearHistoryOpen(true)}
                                    className="h-8 text-xs text-slate-400 hover:text-slate-600 gap-1 rounded-full"
                                >
                                    <ArrowReloadHorizontalIcon size={12} />
                                    Clear
                                </Button>
                            )}
                        </div>
                        {scanHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                                    <QrCode01Icon size={24} />
                                </div>
                                <p className="text-sm text-slate-400 font-medium">No scans yet</p>
                                <p className="text-xs text-slate-300 mt-1">Scan results will appear here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {scanHistory.map((result, idx) => (
                                    <div
                                        key={`${result.passCode}-${idx}`}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-slate-800 truncate block">
                                                {result.studentName}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{result.passCode}</span>
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[11px] font-medium shrink-0",
                                                result.valid ? "text-emerald-600" : "text-red-500"
                                            )}
                                        >
                                            {result.valid ? "Valid" : "Invalid"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Clear History Confirmation */}
            <AlertDialog open={clearHistoryOpen} onOpenChange={setClearHistoryOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-medium text-slate-900">Clear Scan History?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-sm">
                            This will remove all {scanHistory.length} scan results from the current session. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">
                            Keep History
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => { setScanHistory([]); setClearHistoryOpen(false); toast.success("Scan history cleared"); }}
                            className="rounded-full h-10 bg-destructive hover:bg-destructive/90 text-white font-normal"
                        >
                            Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}