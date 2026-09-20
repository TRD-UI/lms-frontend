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
    ArrowRight01Icon,
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
import { describeError } from "@/lib/supabase";

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
    // Collapsed by exception: a long curriculum is unreadable fully expanded,
    // but a course with one module should not need a click to see anything.
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggleModule = (moduleId: string) =>
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(moduleId)) next.delete(moduleId);
            else next.add(moduleId);
            return next;
        });

    const totalItems = course.modules.reduce((s, m) => s + m.items.length, 0);

    /** Wraps a write so an RLS rejection surfaces instead of vanishing. */
    const run = async (action: () => Promise<unknown>, success: string, description?: string) => {
        try {
            await action();
            toast.success(success, description ? { description } : undefined);
        } catch (e) {
            toast.error("Could not save", { description: describeError(e as { message?: string }) });
        }
    };

    const handleAddModule = () =>
        run(
            () => addModule(course.id, `Module ${course.modules.length + 1}`),
            "Module added",
            "Rename it, then add lessons."
        );

    const renameModule = (module: CourseModule) => {
        const next = window.prompt("Module title", module.title);
        if (next && next.trim()) void run(() => updateModule(course.id, module.id, { title: next.trim() }), "Module renamed");
    };

    const submitItem = (draft: ModuleItemDraft) => {
        if (!itemDialog) return;
        const { moduleId, item } = itemDialog;
        void run(
            () =>
                item
                    ? updateModuleItem(course.id, moduleId, item.id, draft)
                    : addModuleItem(course.id, moduleId, draft),
            item ? "Lesson updated" : "Lesson added"
        );
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
                course.modules.map((module, moduleIndex) => {
                    const isCollapsed = collapsed.has(module.id);
                    return (
                    <div
                        key={module.id}
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-slate-50">
                            <button
                                onClick={() => toggleModule(module.id)}
                                aria-expanded={!isCollapsed}
                                aria-label={isCollapsed ? `Expand ${module.title}` : `Collapse ${module.title}`}
                                className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-medium text-slate-500 shrink-0 hover:bg-slate-200 transition-colors"
                            >
                                {moduleIndex + 1}
                            </button>
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="min-w-0 flex-1 text-left group/head"
                            >
                                <h3 className="text-sm font-medium text-slate-800 truncate group-hover/head:text-primary transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    {module.items.length} {module.items.length === 1 ? "lesson" : "lessons"}
                                </p>
                            </button>
                            <button
                                onClick={() => toggleModule(module.id)}
                                aria-hidden
                                tabIndex={-1}
                                className="h-7 w-7 rounded-full flex items-center justify-center text-slate-300 hover:text-primary hover:bg-slate-50 transition-colors shrink-0"
                            >
                                <ArrowRight01Icon
                                    size={16}
                                    className={cn("transition-transform", !isCollapsed && "rotate-90")}
                                />
                            </button>

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
                                                onSelect: () => void moveModule(course.id, module.id, -1),
                                            },
                                            {
                                                label: "Move down",
                                                icon: ArrowDown01Icon,
                                                disabled: moduleIndex === course.modules.length - 1,
                                                onSelect: () => void moveModule(course.id, module.id, 1),
                                            },
                                            {
                                                label: "Delete module",
                                                icon: Delete02Icon,
                                                destructive: true,
                                                separatorBefore: true,
                                                onSelect: () => void run(() => deleteModule(course.id, module.id), "Module deleted"),
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

                        {isCollapsed ? null : module.items.length === 0 ? (
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
                                                            onSelect: () => void moveModuleItem(course.id, module.id, item.id, -1),
                                                        },
                                                        {
                                                            label: "Move down",
                                                            icon: ArrowDown01Icon,
                                                            disabled: itemIndex === module.items.length - 1,
                                                            onSelect: () => void moveModuleItem(course.id, module.id, item.id, 1),
                                                        },
                                                        {
                                                            label: "Delete lesson",
                                                            icon: Delete02Icon,
                                                            destructive: true,
                                                            separatorBefore: true,
                                                            onSelect: () =>
                                                                void run(
                                                                    () => deleteModuleItem(course.id, module.id, item.id),
                                                                    "Lesson deleted"
                                                                ),
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
                    );
                })
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
