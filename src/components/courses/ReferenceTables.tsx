import { Delete02Icon, Location01Icon, BookOpen01Icon } from "hugeicons-react";
import { Card, CardContent } from "@/components/ui/card";
import { RowActions } from "@/components/shared/RowActions";
import { useRowMenu } from "@/components/shared/use-row-menu";
import { EmptyState } from "@/components/shared/EmptyState";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useLms } from "@/store/lms-store";
import { describeError } from "@/lib/supabase";
import { toast } from "sonner";

const HEAD = "text-[10px] font-medium text-slate-400 uppercase tracking-widest";

/**
 * The category and venue lists the course form and class scheduler read from.
 *
 * Adding is the page's primary action, not a form stacked above the table, so
 * these are read-and-delete only.
 */
export function ReferenceTables({ kind }: { kind: "categories" | "venues" }) {
    const { categories, deleteCategory, venues, deleteVenue, courses, classSessions } = useLms();
    const rowMenu = useRowMenu();

    const guard = async (action: () => Promise<void>, success: string) => {
        try {
            await action();
            toast.success(success);
        } catch (e) {
            toast.error("Could not delete", { description: describeError(e as { message?: string }) });
        }
    };

    if (kind === "categories") {
        if (categories.length === 0) {
            return (
                <EmptyState
                    icon={BookOpen01Icon}
                    title="No categories yet"
                    description="Add one so courses have something to be filed under."
                />
            );
        }

        return (
            <Card className="border-slate-100 rounded-2xl shadow-none mx-1 sm:mx-2">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className={HEAD}>Category</TableHead>
                                    <TableHead className={HEAD}>Courses</TableHead>
                                    <TableHead className={`${HEAD} text-right`}>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((c) => {
                                    const inUse = courses.filter((x) => x.category === c).length;
                                    return (
                                        <TableRow
                                            key={c}
                                            onClick={rowMenu.rowClick(`category:${c}`)}
                                            className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        >
                                            <TableCell className="text-sm font-medium text-slate-800">
                                                <span className="flex items-center gap-2.5">
                                                    <BookOpen01Icon size={15} className="text-slate-300" />
                                                    {c}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 tabular-nums">{inUse}</TableCell>
                                            <TableCell className="text-right">
                                                <RowActions
                                                    {...rowMenu.menu(`category:${c}`)}
                                                    label={`Actions for ${c}`}
                                                    actions={[
                                                        {
                                                            label: inUse > 0 ? `In use by ${inUse}` : "Delete category",
                                                            icon: Delete02Icon,
                                                            destructive: true,
                                                            // Deleting one in use would orphan those courses.
                                                            disabled: inUse > 0,
                                                            onSelect: () => void guard(() => deleteCategory(c), "Category deleted"),
                                                            confirm: {
                                                                title: "Delete this category?",
                                                                description: `"${c}" will no longer be selectable on the course form.`,
                                                                actionLabel: "Delete",
                                                            },
                                                        },
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (venues.length === 0) {
        return (
            <EmptyState
                icon={Location01Icon}
                title="No venues yet"
                description="Add one so instructors have somewhere to schedule a class."
            />
        );
    }

    return (
        <Card className="border-slate-100 rounded-2xl shadow-none mx-1 sm:mx-2">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 hover:bg-transparent">
                                <TableHead className={HEAD}>Venue</TableHead>
                                <TableHead className={HEAD}>Capacity</TableHead>
                                <TableHead className={HEAD}>Classes</TableHead>
                                <TableHead className={`${HEAD} text-right`}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {venues.map((v) => {
                                const booked = classSessions.filter((s) => s.venue === v.name).length;
                                return (
                                    <TableRow
                                        key={v.id}
                                        onClick={rowMenu.rowClick(`venue:${v.id}`)}
                                        className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="text-sm font-medium text-slate-800">
                                            <span className="flex items-center gap-2.5">
                                                <Location01Icon size={15} className="text-slate-300" />
                                                {v.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500 tabular-nums">{v.capacity}</TableCell>
                                        <TableCell className="text-sm text-slate-500 tabular-nums">{booked}</TableCell>
                                        <TableCell className="text-right">
                                            <RowActions
                                                {...rowMenu.menu(`venue:${v.id}`)}
                                                label={`Actions for ${v.name}`}
                                                actions={[
                                                    {
                                                        label: booked > 0 ? `${booked} class(es) booked` : "Delete venue",
                                                        icon: Delete02Icon,
                                                        destructive: true,
                                                        disabled: booked > 0,
                                                        onSelect: () => void guard(() => deleteVenue(v.id), "Venue deleted"),
                                                        confirm: {
                                                            title: "Delete this venue?",
                                                            description: `"${v.name}" will no longer be selectable.`,
                                                            actionLabel: "Delete",
                                                        },
                                                    },
                                                ]}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
