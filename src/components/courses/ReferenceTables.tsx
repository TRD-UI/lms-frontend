import { useState } from "react";
import { Add01Icon, Delete02Icon, Location01Icon, BookOpen01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { RowActions } from "@/components/shared/RowActions";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FIELD =
    "h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 " +
    "focus:border-primary/30 transition-all";

/**
 * The category and venue lists that the course form and the class scheduler
 * read from. Admin-owned: an instructor picks from these, an admin decides
 * what is on them.
 */
export function ReferenceTables({ kind }: { kind: "categories" | "venues" }) {
    const {
        categories, addCategory, deleteCategory,
        venues, addVenue, deleteVenue,
        courses, classSessions,
    } = useLms();

    const [newCategory, setNewCategory] = useState("");
    const [newVenue, setNewVenue] = useState("");
    const [newCapacity, setNewCapacity] = useState(20);
    const [busy, setBusy] = useState(false);

    const guard = async (action: () => Promise<void>, success: string) => {
        setBusy(true);
        try {
            await action();
            toast.success(success);
        } catch (e) {
            toast.error("Could not save", { description: describeError(e as { message?: string }) });
        } finally {
            setBusy(false);
        }
    };

    if (kind === "categories") {
        return (
            <div className="space-y-4 max-w-3xl">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const name = newCategory.trim();
                        if (!name) return;
                        if (categories.includes(name)) return toast.error("That category already exists.");
                        void guard(async () => {
                            await addCategory(name);
                            setNewCategory("");
                        }, "Category added");
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Cloud Engineering"
                        aria-label="New category"
                        className={cn(FIELD, "flex-1")}
                    />
                    <Button
                        type="submit"
                        disabled={busy || !newCategory.trim()}
                        className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shrink-0"
                    >
                        <Add01Icon size={16} className="mr-1.5" />
                        Add
                    </Button>
                </form>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 hover:bg-transparent">
                                <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Category</TableHead>
                                <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Courses</TableHead>
                                <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((c) => {
                                const inUse = courses.filter((x) => x.category === c).length;
                                return (
                                    <TableRow key={c} className="border-slate-50 hover:bg-slate-50/50">
                                        <TableCell className="text-sm font-medium text-slate-800">
                                            <span className="flex items-center gap-2.5">
                                                <BookOpen01Icon size={15} className="text-slate-300" />
                                                {c}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500 tabular-nums">{inUse}</TableCell>
                                        <TableCell className="text-right">
                                            <RowActions
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
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-3xl">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const name = newVenue.trim();
                    if (!name) return;
                    if (venues.some((v) => v.name === name)) return toast.error("That venue already exists.");
                    void guard(async () => {
                        await addVenue(name, Math.max(1, Math.trunc(newCapacity)));
                        setNewVenue("");
                        setNewCapacity(20);
                    }, "Venue added");
                }}
                className="flex items-center gap-2"
            >
                <input
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="e.g. Training Lab 4"
                    aria-label="New venue"
                    className={cn(FIELD, "flex-1")}
                />
                <input
                    type="number"
                    min={1}
                    step={1}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    aria-label="Capacity"
                    className={cn(FIELD, "w-28 tabular-nums")}
                />
                <Button
                    type="submit"
                    disabled={busy || !newVenue.trim()}
                    className="h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shrink-0"
                >
                    <Add01Icon size={16} className="mr-1.5" />
                    Add
                </Button>
            </form>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Venue</TableHead>
                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Capacity</TableHead>
                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Classes</TableHead>
                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {venues.map((v) => {
                            const booked = classSessions.filter((s) => s.venue === v.name).length;
                            return (
                                <TableRow key={v.id} className="border-slate-50 hover:bg-slate-50/50">
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
        </div>
    );
}
