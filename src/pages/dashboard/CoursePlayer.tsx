import { useParams, useNavigate } from "react-router-dom";
import { useLms } from "@/store/lms-store";
import { PlayerSidebar } from "@/components/dashboard/course/PlayerSidebar";
import { PlayerHeader } from "@/components/dashboard/course/PlayerHeader";
import { MediaViewer } from "@/components/dashboard/course/MediaViewer";
import { useMemo, useState } from "react";

export default function CoursePlayer() {
    const { courseId, moduleId, itemId } = useParams<{ courseId: string; moduleId: string; itemId: string }>();
    const navigate = useNavigate();
    const { courses } = useLms();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const course = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId]);

    // Every hook runs before the early return below, so hook order stays stable
    // across renders regardless of whether the course resolves.
    const allItems = useMemo(() => {
        if (!course) return [];
        return course.modules.flatMap(m =>
            m.items.map(i => ({ moduleId: m.id, itemId: i.id }))
        );
    }, [course]);

    if (!course) return <div className="p-8">Course not found</div>;

    const currentModule = course.modules.find(m => m.id === moduleId);
    const currentItem = currentModule?.items.find(i => i.id === itemId) || currentModule?.items[0];

    const currentIndex = allItems.findIndex(path =>
        path.moduleId === moduleId && path.itemId === itemId
    );

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allItems.length - 1;

    const handlePrevious = () => {
        if (hasPrevious) {
            const prev = allItems[currentIndex - 1];
            navigate(`/dashboard/player/${courseId}/${prev.moduleId}/${prev.itemId}`);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            const next = allItems[currentIndex + 1];
            navigate(`/dashboard/player/${courseId}/${next.moduleId}/${next.itemId}`);
        }
    };

    const handleItemClick = (mId: string, iId: string) => {
        navigate(`/dashboard/player/${courseId}/${mId}/${iId}`);
        setIsMobileSidebarOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-5rem)] md:h-[calc(95vh-100px)] -m-4 md:-m-10 bg-white overflow-hidden md:rounded-3xl md:border md:border-slate-100 md:shadow-sm">
            {/* Desktop sidebar */}
            <div className="hidden md:block">
                <PlayerSidebar
                    course={course}
                    currentModuleId={moduleId || ""}
                    currentItemId={itemId || ""}
                    onItemClick={handleItemClick}
                    onBack={() => navigate(-1)}
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Mobile sidebar overlay */}
            {isMobileSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    <div className="relative w-[85vw] max-w-xs">
                        <PlayerSidebar
                            course={course}
                            currentModuleId={moduleId || ""}
                            currentItemId={itemId || ""}
                            onItemClick={handleItemClick}
                            onBack={() => { setIsMobileSidebarOpen(false); navigate(-1); }}
                            isCollapsed={false}
                            onToggle={() => setIsMobileSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col bg-white min-w-0">
                <PlayerHeader
                    currentItem={currentItem}
                    currentModule={currentModule}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                    onMenuToggle={() => setIsMobileSidebarOpen(true)}
                />

                <MediaViewer
                    currentItem={currentItem}
                    course={course}
                />
            </div>
        </div>
    );
}
