import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft01Icon, ArrowRight01Icon, Menu01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { PlayerSidebar } from "@/components/dashboard/course/PlayerSidebar";
import { MediaViewer } from "@/components/dashboard/course/MediaViewer";
import { useLms } from "@/store/lms-store";

export default function CoursePlayer() {
    const { courseId, moduleId, itemId } = useParams<{ courseId: string; moduleId: string; itemId: string }>();
    const navigate = useNavigate();
    const { courses } = useLms();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const course = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);

    // Every hook runs before the early return below, so hook order stays stable
    // across renders regardless of whether the course resolves.
    const allItems = useMemo(() => {
        if (!course) return [];
        return course.modules.flatMap((m) => m.items.map((i) => ({ moduleId: m.id, itemId: i.id })));
    }, [course]);

    if (!course) return <div className="p-8">Course not found</div>;

    const currentModule = course.modules.find((m) => m.id === moduleId);
    const currentItem = currentModule?.items.find((i) => i.id === itemId) || currentModule?.items[0];

    const currentIndex = allItems.findIndex(
        (path) => path.moduleId === moduleId && path.itemId === itemId
    );

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allItems.length - 1;

    const go = (delta: number) => {
        const next = allItems[currentIndex + delta];
        if (next) navigate(`/dashboard/player/${courseId}/${next.moduleId}/${next.itemId}`);
    };

    const handleItemClick = (mId: string, iId: string) => {
        navigate(`/dashboard/player/${courseId}/${mId}/${iId}`);
        setIsMobileSidebarOpen(false);
    };

    const sidebar = (onBack: () => void) => (
        <PlayerSidebar
            course={course}
            currentModuleId={moduleId || ""}
            currentItemId={itemId || ""}
            onItemClick={handleItemClick}
            onBack={onBack}
        />
    );

    return (
        <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)] -m-4 md:-m-10 bg-white overflow-hidden relative">
            <div className="hidden md:block">{sidebar(() => navigate(-1))}</div>

            {/* Mobile sidebar overlay */}
            {isMobileSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    <div className="relative w-[85vw] max-w-xs bg-white">
                        {sidebar(() => {
                            setIsMobileSidebarOpen(false);
                            navigate(-1);
                        })}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile-only affordance for the drawer, since there is no header. */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSidebarOpen(true)}
                    aria-label="Open lesson list"
                    className="md:hidden absolute left-3 top-3 z-20 h-9 w-9 rounded-full bg-white/90 backdrop-blur border border-slate-100 text-slate-500 shadow-sm"
                >
                    <Menu01Icon size={18} />
                </Button>

                <MediaViewer currentItem={currentItem} course={course} />

                {/* Floating pager, over the content rather than in a header. */}
                <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 w-max max-w-[calc(100vw-1.5rem)]">
                    <div className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-white/95 backdrop-blur border border-slate-200 shadow-lg shadow-slate-900/5 p-1.5">
                        <Button
                            variant="ghost"
                            onClick={() => go(-1)}
                            disabled={!hasPrevious}
                            aria-label="Previous lesson"
                            className="h-9 shrink-0 rounded-full px-3 sm:px-4 text-slate-600 font-medium text-sm hover:text-primary hover:bg-primary/5 disabled:opacity-30"
                        >
                            <ArrowLeft01Icon size={16} className="sm:mr-1.5" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>

                        <span className="text-[11px] font-medium text-slate-400 tabular-nums px-1.5 shrink-0">
                            {currentIndex + 1} / {allItems.length}
                        </span>

                        <Button
                            onClick={() => go(1)}
                            disabled={!hasNext}
                            aria-label="Next lesson"
                            className="h-9 shrink-0 rounded-full px-3 sm:px-5 bg-primary hover:bg-primary/90 text-white font-medium text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ArrowRight01Icon size={16} className="sm:ml-1.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
