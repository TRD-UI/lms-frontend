import { useNavigate } from "react-router-dom";
import { BookOpen01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { fetchMyProgress } from "@/lib/api/learner";
import { useLms } from "@/store/lms-store";

export function ContinueLearning() {
    const navigate = useNavigate();
    const { getCourse } = useLms();

    const { data: progress = [] } = useQuery({
        queryKey: ["my-progress"],
        queryFn: fetchMyProgress,
        staleTime: 30_000,
    });

    /**
     * Resume where the learner left off. With no recorded position — a course
     * they have not opened — fall back to its first lesson.
     */
    const continuousLearning = progress.slice(0, 3).map((p) => {
        const course = getCourse(p.courseId);
        const firstModule = course?.modules[0];
        return {
            id: p.courseId,
            title: p.courseTitle,
            module: p.lastItemTitle ?? firstModule?.title ?? "Not started",
            progress: `${p.progress}%`,
            courseId: p.courseId,
            moduleId: p.lastModuleId ?? firstModule?.id ?? "",
            itemId: p.lastItemId ?? firstModule?.items[0]?.id ?? "",
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-slate-800">Continue Learning</h2>
                <Button variant="link" onClick={() => navigate("/dashboard/learning")} className="text-primary font-medium text-xs p-0">View All</Button>
            </div>

            {continuousLearning.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                    <BookOpen01Icon size={28} className="mx-auto text-slate-200" />
                    <p className="text-xs text-slate-400 font-medium">
                        You are not enrolled on any courses yet.
                    </p>
                </div>
            ) : (
            <div className="space-y-1">
                {continuousLearning.map((item, index) => (
                    <div key={item.id}>
                        <div
                            onClick={() =>
                                item.itemId
                                    ? navigate(`/dashboard/player/${item.courseId}/${item.moduleId}/${item.itemId}`)
                                    : navigate(`/dashboard/learning/${item.courseId}`)
                            }
                            className="group flex items-center justify-between py-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <BookOpen01Icon size={24} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800">{item.title}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {item.module} • <span className="text-primary font-medium">{item.progress}</span>
                                    </p>
                                </div>
                            </div>
                            <ArrowRight01Icon size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        {index < continuousLearning.length - 1 && <Separator className="bg-slate-100" />}
                    </div>
                ))}
            </div>
            )}
        </div>
    );
}
