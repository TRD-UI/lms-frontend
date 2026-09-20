import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Ticket01Icon,
    Search01Icon,
    Calendar03Icon
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EntryPass } from "@/data/entry-passes";
import { EntryPassCard } from "@/components/dashboard/entry-passes/EntryPassCard";
import { PassViewer } from "@/components/dashboard/entry-passes/PassViewer";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";

export default function EntryPasses() {
    const [selectedPass, setSelectedPass] = useState<EntryPass | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    const student = useActingUser("student");
    const { entryPassUnlocked, assessmentsForCourse, bestAttempt, entryPasses } = useLms();

    const activePasses = entryPasses.filter(p => p.status === 'active');
    const pastPasses = entryPasses.filter(p => p.status === 'past');

    /**
     * A pass is released only once every gating assessment on its course is
     * passed. When one is outstanding we surface it as the call to action.
     */
    const gateFor = (pass: EntryPass) => {
        const unlocked = entryPassUnlocked(pass.courseId, student.id);
        const blockingAssessment = unlocked
            ? undefined
            : assessmentsForCourse(pass.courseId).find(
                (a) =>
                    a.gatesEntryPass &&
                    a.status === "published" &&
                    bestAttempt(a.id, student.id)?.passed !== true
            );
        return { unlocked, blockingAssessment };
    };

    const lockedCount = activePasses.filter((p) => !gateFor(p).unlocked).length;

    const handleView = (pass: EntryPass) => {
        setSelectedPass(pass);
        setViewerOpen(true);
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 px-1 sm:px-2">
                <div className="flex items-center gap-5">
                    <div className="space-y-0.5 sm:space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">Entry Passes</h1>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm">
                            {lockedCount > 0
                                ? `${lockedCount} ${lockedCount === 1 ? "pass is" : "passes are"} held until you clear the prerequisite test.`
                                : "Access your physical workshop and event entry tickets."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-1 sm:px-2">
                <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={cn(
                            "pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-all relative",
                            activeTab === 'active' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Active Passes
                        <Badge variant="secondary" className={cn(
                            "ml-2 border-none text-[10px] px-1.5 h-4",
                            activeTab === 'active' ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400"
                        )}>
                            {activePasses.length}
                        </Badge>
                        {activeTab === 'active' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={cn(
                            "pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-all relative",
                            activeTab === 'past' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Past Events
                        <Badge variant="secondary" className={cn(
                            "ml-2 border-none text-[10px] px-1.5 h-4",
                            activeTab === 'past' ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400"
                        )}>
                            {pastPasses.length}
                        </Badge>
                        {activeTab === 'past' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            <div className="min-h-[300px] sm:min-h-[400px]">
                {activeTab === 'active' ? (
                    activePasses.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-1 sm:px-2">
                            {activePasses.map((pass) => {
                                const { unlocked, blockingAssessment } = gateFor(pass);
                                return (
                                    <EntryPassCard
                                        key={pass.id}
                                        pass={pass}
                                        onView={handleView}
                                        unlocked={unlocked}
                                        blockingAssessment={blockingAssessment}
                                        sessionDate={pass.sessionDate}
                                    />
                                );
                            })}
                        </div>
                    )
                ) : (
                    pastPasses.length === 0 ? (
                        <EmptyState title="No past events" description="Your history of attended events and occupied workshops will appear here." />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-1 sm:px-2">
                            {pastPasses.map((pass) => (
                                <EntryPassCard
                                    key={pass.id}
                                    pass={pass}
                                    onView={handleView}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            <PassViewer
                pass={selectedPass}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />
        </div>
    );
}

function EmptyState({ title = "No Active Passes", description = "Your physical workshop and event entry passes will appear here once you register for our upcoming on-site training sessions." }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4 sm:mb-6">
                <Ticket01Icon size={32} className="sm:hidden" />
                <Ticket01Icon size={40} className="hidden sm:block" />
            </div>
            <h2 className="text-xl sm:text-2xl font-medium text-slate-900 mb-1.5 sm:mb-2">{title}</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-6 sm:mb-8 font-medium text-xs sm:text-sm leading-relaxed px-4">
                {description}
            </p>
            <Link to="/dashboard/learning">
                <Button className="h-10 sm:h-12 px-6 sm:px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-lg shadow-primary/10">
                    <Search01Icon size={18} className="mr-2" />
                    Browse Courses
                </Button>
            </Link>
        </div>
    );
}
