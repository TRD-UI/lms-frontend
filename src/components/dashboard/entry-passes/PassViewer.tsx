import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Calendar03Icon,
    Location01Icon,
    Ticket01Icon,
    Cancel01Icon,
    Download01Icon,
    Share01Icon,
    SquareLock02Icon
} from "hugeicons-react";
import { EntryPass } from "@/data/entry-passes";
import { usePassQr } from "./PassQrCode";

interface PassViewerProps {
    pass: EntryPass | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PassViewer({ pass, open, onOpenChange }: PassViewerProps) {
    // The hook below needs a pass, and hooks cannot be called conditionally —
    // so the body lives in its own component.
    if (!pass) return null;
    return <PassTicket pass={pass} open={open} onOpenChange={onOpenChange} />;
}

function PassTicket({ pass, open, onOpenChange }: PassViewerProps & { pass: EntryPass }) {
    const { dataUrl, isLoading } = usePassQr(pass.id, open);

    /* The QR is drawn locally, so "save" is just the data URL — no fetch. */
    const handleDownload = () => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${pass.eventTitle}_Pass.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-transparent border-none shadow-none p-0 gap-0 overflow-visible [&>button]:hidden">
                <DialogHeader className="hidden">
                    <DialogTitle>{pass.eventTitle}</DialogTitle>
                    <DialogDescription>Digital Entry Pass</DialogDescription>
                </DialogHeader>

                <div className="relative animate-in zoom-in-95 duration-300 mx-2 sm:mx-0">
                    {/* Ticket Design */}
                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-200">
                        {/* Top Section - Event Info */}
                        <div className="p-5 sm:p-8 bg-primary/5 border-b-2 border-dashed border-slate-200 relative">
                            {/* Decorative "Notches" for ticket look */}
                            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-slate-900/5 rounded-full" />
                            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-slate-900/5 rounded-full" />

                            <div className="flex items-center gap-2 text-primary mb-2 sm:mb-3">
                                <Ticket01Icon size={18} />
                                <span className="text-[11px] sm:text-[12px] font-medium uppercase tracking-widest">Official Entry Pass</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-medium text-slate-900 leading-tight mb-4 sm:mb-6">
                                {pass.eventTitle}
                            </h2>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2.5 sm:gap-3 text-slate-600">
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                        <Calendar03Icon size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider leading-none mb-0.5 sm:mb-1">Date & Time</span>
                                        <span className="text-xs sm:text-sm font-medium text-slate-700">{pass.date} • {pass.time}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 sm:gap-3 text-slate-600">
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 mt-0.5">
                                        <Location01Icon size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider leading-none mb-0.5 sm:mb-1">Venue</span>
                                        <span className="text-xs sm:text-sm font-medium text-slate-700">{pass.venue}</span>
                                        <span className="text-[10px] sm:text-[11px] font-medium text-primary mt-0.5">{pass.roomNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - QR & Code */}
                        <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 mb-4 sm:mb-6 group transition-all hover:bg-white hover:shadow-lg">
                                {dataUrl ? (
                                    <img
                                        src={dataUrl}
                                        alt="Entry Pass QR"
                                        className="w-36 h-36 sm:w-48 sm:h-48"
                                    />
                                ) : (
                                    <div className="w-36 h-36 sm:w-48 sm:h-48 flex flex-col items-center justify-center gap-2 text-center">
                                        {isLoading ? (
                                            <div className="h-full w-full rounded-xl bg-slate-100 animate-pulse" />
                                        ) : (
                                            <>
                                                <SquareLock02Icon size={28} className="text-slate-300" />
                                                <p className="text-[11px] text-slate-400 font-medium px-4 leading-relaxed">
                                                    This code opens on the day of the class, once any required test is passed.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 mb-6 sm:mb-8">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Pass ID</p>
                                <p className="text-lg sm:text-xl font-medium text-slate-900 tracking-wider">
                                    {pass.passCode}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4 w-full">
                                <Button
                                    onClick={handleDownload}
                                    disabled={!dataUrl}
                                    className="flex-1 h-10 sm:h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10"
                                >
                                    <Download01Icon size={18} className="mr-2" />
                                    Save Pass
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-slate-200 text-slate-400 hover:text-primary transition-all"
                                >
                                    <Share01Icon size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Close Action */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="absolute -top-12 right-0 text-white hover:bg-white/10 rounded-full h-10 w-10"
                    >
                        <Cancel01Icon size={24} />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
