import { useState } from "react";
import {
    Add01Icon,
    ArrowDown01Icon,
    ArrowUp01Icon,
    Delete02Icon,
    Edit01Icon,
    File01Icon,
    Pdf02Icon,
    PlayIcon,
    Task01Icon,
    Alert02Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ModuleItemFormDialog, type ModuleItemDraft } from "./ModuleItemFormDialog";
import { useLms } from "@/store/lms-store";
import type { Course, CourseModule, ModuleItem } from "@/data/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ITEM_ICON: Record<ModuleItem["type"], React.ComponentType<{ size?: number; className?: string }>> = {
    video: PlayIcon,
    pdf: Pdf02Icon,
    document: File01Icon,
    quiz: Task01Icon,
};

interface CourseContentEditorProps {
    course: Course;
    /** Admin oversight renders the same tree without the editing controls. */
    readOnly?: boolean;
}

/**
 * The course's curriculum: modules, and the lessons inside them.
 *
 * This is what the learner's player renders, so everything addable here —
 * video, PDF, document, quiz — maps to a `ModuleItem` type the player already
 * knows how to display.
 */
export function CourseContentEditor({ course, readOnly = false }: CourseContentEditorProps) {
    const {
        addModule,
        updateModule,
        deleteModule,
        moveModule,
        addModuleItem,
        updateModuleItem,
        deleteModuleItem,
        moveModuleItem,
        getAssessment,
    } = useLms();

    const [itemDialog, setItemDialog] = useState<{ moduleId: string; item: ModuleItem | null } | null>(null);

    const totalItems = course.modules.reduce((s, m) => s + m.items.length, 0);

    const handleAddModule = () => {
        const module = addModule(course.id, `Module ${course.modules.length + 1}`);
        toast.success("Module added", { description: "Rename it, then add lessons." });
        return module;
    };

    const renameModule = (module: CourseModule) => {
        const next = window.prompt("Module title", module.title);
        if (next && next.trim()) updateModule(course.id, module.id, { title: next.trim() });
    };

    const submitItem = (draft: ModuleItemDraft) => {
        if (!itemDialog) return;
        if (itemDialog.item) {
            updateModuleItem(course.id, itemDialog.moduleId, itemDialog.item.id, draft);
            toast.success("Lesson updated");
        } else {
            addModuleItem(course.id, itemDialog.moduleId, draft);
            toast.success("Lesson added");
        }
    };

    return (
        <div className="space-y-3">
            {!readOnly && (
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-slate-400">
                        {course.modules.length} {course.modules.length === 1 ? "module" : "modules"} ·{" "}
                        {totalItems} {totalItems === 1 ? "lesson" : "lessons"}
                    </p>
                    <Button
                        onClick={handleAddModule}
                        className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                    >
                        <Add01Icon size={16} className="mr-1.5" />
                        Add module
                    </Button>
                </div>
            )}

            {course.modules.length === 0 ? (
                <EmptyState
                    variant="inset"
                    icon={File01Icon}
                    title="No modules yet"
                    description={
                        readOnly
                            ? "The assigned instructor has not built this curriculum yet."
                            : "A course is delivered as modules, each holding videos, PDFs, documents and quizzes."
                    }
                    action={
                        readOnly ? undefined : (
                            <Button
                                onClick={handleAddModule}
                                className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium"
                            >
                                Add the first module
                            </Button>
                        )
                    }
                />
            ) : (
                course.modules.map((module, moduleIndex) => (
                    <div
                        key={module.id}
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-slate-50">
                            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-medium text-slate-500 shrink-0">
                                {moduleIndex + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-medium text-slate-800 truncate">{module.title}</h3>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    {module.items.length} {module.items.length === 1 ? "lesson" : "lessons"}
                                </p>
                            </div>

                            {!readOnly && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setItemDialog({ moduleId: module.id, item: null })}
                                        className="h-9 rounded-full text-primary hover:bg-primary/5 font-medium text-xs gap-1.5"
                                    >
                                        <Add01Icon size={14} />
                                        Lesson
                                    </Button>
                                    <RowActions
                                        label={`Actions for ${module.title}`}
                                        actions={[
                                            { label: "Rename module", icon: Edit01Icon, onSelect: () => renameModule(module) },
                                            {
                                                label: "Move up",
                                                icon: ArrowUp01Icon,
                                                disabled: moduleIndex === 0,
                                                onSelect: () => moveModule(course.id, module.id, -1),
                                            },
                                            {
                                                label: "Move down",
                                                icon: ArrowDown01Icon,
                                                disabled: moduleIndex === course.modules.length - 1,
                                                onSelect: () => moveModule(course.id, module.id, 1),
                                            },
                                            {
                                                label: "Delete module",
                                                icon: Delete02Icon,
                                                destructive: true,
                                                separatorBefore: true,
                                                onSelect: () => {
                                                    deleteModule(course.id, module.id);
                                                    toast.success("Module deleted");
                                                },
                                                confirm: {
                                                    title: "Delete this module?",
                                                    description: `"${module.title}" and its ${module.items.length} lessons will be removed.`,
                                                    actionLabel: "Delete",
                                                },
                                            },
                                        ]}
                                    />
                                </>
                            )}
                        </div>

                        {module.items.length === 0 ? (
                            <p className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                                No lessons in this module yet.
                            </p>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {module.items.map((item, itemIndex) => {
                                    const Icon = ITEM_ICON[item.type] ?? File01Icon;
                                    const linked = item.assessmentId ? getAssessment(item.assessmentId) : undefined;
                                    const pending = item.type !== "quiz" && !item.url;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <Icon size={16} className="text-slate-300 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-slate-700 font-medium truncate">
                                                    {item.title}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">
                                                    {item.type === "quiz"
                                                        ? linked?.title ?? "Assessment missing"
                                                        : item.url ?? "No file attached"}
                                                </p>
                                            </div>

                                            {pending && (
                                                <StatusBadge tone="warning" icon={Alert02Icon}>
                                                    Pending
                                                </StatusBadge>
                                            )}
                                            {item.type === "quiz" && !linked && (
                                                <StatusBadge tone="critical">Broken link</StatusBadge>
                                            )}

                                            {!readOnly && (
                                                <RowActions
                                                    label={`Actions for ${item.title}`}
                                                    actions={[
                                                        {
                                                            label: "Edit lesson",
                                                            icon: Edit01Icon,
                                                            onSelect: () => setItemDialog({ moduleId: module.id, item }),
                                                        },
                                                        {
                                                            label: "Move up",
                                                            icon: ArrowUp01Icon,
                                                            disabled: itemIndex === 0,
                                                            onSelect: () => moveModuleItem(course.id, module.id, item.id, -1),
                                                        },
                                                        {
                                                            label: "Move down",
                                                            icon: ArrowDown01Icon,
                                                            disabled: itemIndex === module.items.length - 1,
                                                            onSelect: () => moveModuleItem(course.id, module.id, item.id, 1),
                                                        },
                                                        {
                                                            label: "Delete lesson",
                                                            icon: Delete02Icon,
                                                            destructive: true,
                                                            separatorBefore: true,
                                                            onSelect: () => {
                                                                deleteModuleItem(course.id, module.id, item.id);
                                                                toast.success("Lesson deleted");
                                                            },
                                                            confirm: {
                                                                title: "Delete this lesson?",
                                                                description: `"${item.title}" will be removed from ${module.title}.`,
                                                                actionLabel: "Delete",
                                                            },
                                                        },
                                                    ]}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))
            )}

            {!readOnly && itemDialog && (
                <ModuleItemFormDialog
                    open
                    onOpenChange={(o) => !o && setItemDialog(null)}
                    courseId={course.id}
                    item={itemDialog.item}
                    onSubmit={submitItem}
                />
            )}
        </div>
    );
}
