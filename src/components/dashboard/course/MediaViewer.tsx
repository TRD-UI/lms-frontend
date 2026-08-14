import { Link } from "react-router-dom";
import {
    PlayIcon,
    Pdf02Icon,
    Task01Icon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    ArrowRight01Icon
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
// Google Drive Viewer is used instead of react-pdf-viewer for better accessibility
import { ModuleItem, Course } from "@/data/types";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { cn } from "@/lib/utils";

interface MediaViewerProps {
    currentItem: ModuleItem | undefined;
    course: Course;
}

export function MediaViewer({ currentItem, course }: MediaViewerProps) {
    if (!currentItem) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50/50">
                <div className="text-center space-y-2">
                    <PlayIcon size={48} className="mx-auto text-slate-200" />
                    <p className="text-slate-400 font-medium">Select a lesson to start learning</p>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className="flex-1 bg-slate-50/50">
            <div className="p-3 sm:p-8 max-w-5xl mx-auto w-full h-full min-h-[300px] sm:min-h-[500px]">
                {currentItem.type === 'video' ? (
                    <div className="aspect-video bg-black rounded-2xl sm:rounded-3xl overflow-hidden border-4 sm:border-8 border-white ring-1 ring-slate-100">
                        {currentItem.url ? (
                            <video
                                src={currentItem.url}
                                controls
                                className="w-full h-full"
                                poster="/api/placeholder/800/450"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 sm:gap-4">
                                <PlayIcon size={36} className="sm:hidden animate-pulse" />
                                <PlayIcon size={48} className="hidden sm:block animate-pulse" />
                                <p className="font-medium text-xs sm:text-base px-4 text-center">Video content not available for this demo</p>
                            </div>
                        )}
                    </div>
                ) : currentItem.type === 'pdf' ? (
                    <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 h-[70vh] sm:h-[800px] flex flex-col">
                        {currentItem.url ? (
                            <div className="flex-1 overflow-hidden relative group">
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentItem.url)}&embedded=true`}
                                    className="w-full h-full border-none"
                                    title={currentItem.title}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                                <Pdf02Icon size={48} />
                                <p className="font-medium">PDF content not available</p>
                            </div>
                        )}
                    </div>
                ) : currentItem.type === 'quiz' ? (
                    <QuizLauncher item={currentItem} />
                ) : (
                    <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-100 text-center space-y-4">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Pdf02Icon size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg sm:text-xl font-medium text-slate-800">Reading Material</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-xs sm:text-base">This document covers the theoretical foundations of the current module. Please read through before continuing.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl">Download Resource</Button>
                    </div>
                )}

                {currentItem.type !== 'quiz' && (
                <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-6">
                    <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100">
                        <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2 sm:mb-4">Lesson Notes</h3>
                        <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                            In this lesson, we cover the core principles of {currentItem?.title || 'this topic'}.
                            By the end of this section, you should have a solid understanding of how these concepts apply to {course.title}.
                            Be sure to check the resources section for additional reading materials and exercise files to practice what you've learned.
                        </p>
                    </div>
                </div>
                )}
            </div>
        </ScrollArea>
    );
}

/**
 * Renders a quiz module item as a launch panel: the learner's standing on this
 * assessment plus the entry point into the runner.
 */
function QuizLauncher({ item }: { item: ModuleItem }) {
    const student = useActingUser("student");
    const { getAssessment, bestAttempt, attemptsFor } = useLms();

    const assessment = item.assessmentId ? getAssessment(item.assessmentId) : undefined;

    if (!assessment) {
        return (
            <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-100 text-center space-y-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Task01Icon size={28} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-medium text-slate-800">Assessment unavailable</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-xs sm:text-base">
                        This assessment has not been published yet.
                    </p>
                </div>
            </div>
        );
    }

    const best = bestAttempt(assessment.id, student.id);
    const used = attemptsFor(assessment.id, student.id).length;
    const left = assessment.maxAttempts === 0 ? Infinity : Math.max(0, assessment.maxAttempts - used);
    const exhausted = left === 0 && !best?.passed;

    return (
        <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-100 text-center space-y-6">
            <div
                className={cn(
                    "h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center mx-auto",
                    best?.passed ? "bg-emerald-50 text-emerald-600" : "bg-accent/40 text-primary"
                )}
            >
                {best?.passed ? <CheckmarkCircle01Icon size={32} /> : <Task01Icon size={32} />}
            </div>

            <div className="space-y-1.5">
                <h3 className="text-lg sm:text-2xl font-medium text-slate-900">{assessment.title}</h3>
                <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm font-normal leading-relaxed">
                    {assessment.description}
                </p>
            </div>

            <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap text-[11px] font-medium text-slate-400">
                <span>{assessment.questions.length} questions</span>
                <span>{assessment.timeLimitMinutes} minutes</span>
                <span>Pass mark {assessment.passingScore}%</span>
                {assessment.maxAttempts > 0 && (
                    <span>{left === Infinity ? "Unlimited" : `${left} of ${assessment.maxAttempts}`} attempts left</span>
                )}
            </div>

            {best && (
                <div
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium",
                        best.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                    )}
                >
                    {best.passed ? <CheckmarkCircle01Icon size={14} /> : <Cancel01Icon size={14} />}
                    Best score {best.score}% · attempt #{best.attemptNumber}
                </div>
            )}

            <div className="flex items-center justify-center gap-3 flex-wrap">
                {exhausted ? (
                    <Button disabled className="h-12 px-8 rounded-full bg-slate-100 text-slate-400 font-medium">
                        No attempts left
                    </Button>
                ) : (
                    <Link to={`/dashboard/assessments/${assessment.id}/take`}>
                        <Button className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10">
                            {best ? "Retake assessment" : "Start assessment"}
                            <ArrowRight01Icon size={18} className="ml-2" />
                        </Button>
                    </Link>
                )}
                {best && (
                    <Link to={`/dashboard/assessments/${assessment.id}/result/${best.id}`}>
                        <Button variant="outline" className="h-12 px-6 rounded-full border-slate-200 text-slate-600 font-medium">
                            Review answers
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
