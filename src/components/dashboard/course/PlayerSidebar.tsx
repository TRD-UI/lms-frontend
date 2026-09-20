import { ArrowLeft01Icon, PlayIcon, Pdf02Icon, Task01Icon, File01Icon } from "hugeicons-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Course, ModuleItem } from "@/data/types";

interface PlayerSidebarProps {
    course: Course;
    currentModuleId: string;
    currentItemId: string;
    onItemClick: (moduleId: string, itemId: string) => void;
    onBack: () => void;
}

const ITEM_ICON: Record<ModuleItem["type"], React.ComponentType<{ size?: number; className?: string }>> = {
    video: PlayIcon,
    pdf: Pdf02Icon,
    document: File01Icon,
    quiz: Task01Icon,
};

export function PlayerSidebar({
    course,
    currentModuleId,
    currentItemId,
    onItemClick,
    onBack,
}: PlayerSidebarProps) {
    const progress = course.progress ?? 0;

    return (
        <div className="w-80 shrink-0 flex flex-col h-full bg-white relative">
            {/* Separator, inset so it stops short of the top and bottom edges. */}
            <div className="absolute right-0 top-6 bottom-6 w-px bg-slate-100" aria-hidden />

            <div className="p-6 pr-7">
                <div className="flex items-start gap-2.5">
                    <button
                        onClick={onBack}
                        aria-label="Back to course"
                        title="Back to course"
                        className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft01Icon size={17} />
                    </button>

                    <div className="min-w-0 flex-1 space-y-2">
                        <h2 className="font-medium text-slate-800 leading-tight text-sm">
                            {course.title}
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-[width] duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 tabular-nums shrink-0">
                                {progress}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 pr-5">
                    <Accordion type="multiple" defaultValue={[currentModuleId]} className="space-y-2">
                        {course.modules.map((module, moduleIndex) => (
                            <AccordionItem key={module.id} value={module.id} className="border-none">
                                <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-slate-50 rounded-xl transition-all data-[state=open]:bg-slate-50">
                                    <div className="flex items-center gap-3 text-left min-w-0">
                                        <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-400 shrink-0">
                                            {moduleIndex + 1}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 truncate">
                                            {module.title}
                                        </span>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pt-2 space-y-1 pl-5 px-1">
                                    {module.items.map((item) => {
                                        const Icon = ITEM_ICON[item.type] ?? File01Icon;
                                        const active = item.id === currentItemId;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => onItemClick(module.id, item.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-left",
                                                    active
                                                        ? "text-primary bg-primary/5"
                                                        : "hover:bg-slate-50 text-slate-500"
                                                )}
                                            >
                                                <Icon
                                                    size={16}
                                                    className={cn(
                                                        "shrink-0",
                                                        active
                                                            ? "text-primary"
                                                            : "text-slate-300 group-hover:text-primary/50"
                                                    )}
                                                />
                                                <span className="text-xs font-medium flex-1 truncate">
                                                    {item.title}
                                                </span>
                                                {active && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </ScrollArea>
        </div>
    );
}
