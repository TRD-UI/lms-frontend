import { useState } from "react";
import { Add01Icon, Delete02Icon, Location01Icon, BookOpen01Icon } from "hugeicons-react";
import { PageHeader } from "@/components/shared/PageHeader";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "categories" | "venues";

const FIELD =
    "h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 " +
    "focus:border-primary/30 transition-all";

/**
 * Reference data the course form reads from: the category list and the venue
 * list. Both are admin-owned, so an instructor scheduling a class picks from a
 * controlled set rather than free-typing a location.
 */
export default function AdminSettings() {
    const {
        categories, addCategory, deleteCategory,
        venues, addVenue, deleteVenue,
        courses, classSessions,
    } = useLms();

    const [tab, setTab] = useState<Tab>("categories");
    const [newCategory, setNewCategory] = useState("");
    const [newVenue, setNewVenue] = useState("");
    const [newCapacity, setNewCapacity] = useState(20);

    const submitCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newCategory.trim();
        if (!name) return;
        if (categories.includes(name)) return toast.error("That category already exists.");
        addCategory(name);
        setNewCategory("");
        toast.success("Category added");
    };

    const submitVenue = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newVenue.trim();
        if (!name) return;
        if (venues.some((v) => v.name === name)) return toast.error("That venue already exists.");
        addVenue(name, Math.max(1, Math.trunc(newCapacity)));
        setNewVenue("");
        setNewCapacity(20);
        toast.success("Venue added");
    };

    const TABS: { key: Tab; label: string; count: number }[] = [
        { key: "categories", label: "Categories", count: categories.length },
        { key: "venues", label: "Venues", count: venues.length },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <PageHeader
                title="Settings"
                description="Course categories and venues. Both feed the course form and the class scheduler."
            />

            <div className="px-1 sm:px-2">
                <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-100">
                    {TABS.map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={cn(
                                "pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-all relative",
                                tab === key ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {label}
                            <span
                                className={cn(
                                    "ml-2 rounded-full text-[10px] px-1.5 py-0.5",
                                    tab === key ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400"
                                )}
                            >
                                {count}
                            </span>
                            {tab === key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-1 sm:px-2 max-w-3xl space-y-4">
                {tab === "categories" ? (
                    <>
                        <form onSubmit={submitCategory} className="flex items-center gap-2">
                            <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="e.g. Cloud Engineering"
                                aria-label="New category"
                                className={cn(FIELD, "flex-1")}
                            />
                            <Button
                                type="submit"
                                disabled={!newCategory.trim()}
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
                                                <TableCell className="text-sm font-medium text-slate-800 flex items-center gap-2.5">
                                                    <BookOpen01Icon size={15} className="text-slate-300" />
                                                    {c}
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
                                                                onSelect: () => {
                                                                    deleteCategory(c);
                                                                    toast.success("Category deleted");
                                                                },
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
                    </>
                ) : (
                    <>
                        <form onSubmit={submitVenue} className="flex items-center gap-2">
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
                                disabled={!newVenue.trim()}
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
                                                <TableCell className="text-sm font-medium text-slate-800 flex items-center gap-2.5">
                                                    <Location01Icon size={15} className="text-slate-300" />
                                                    {v.name}
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
                                                                onSelect: () => {
                                                                    deleteVenue(v.id);
                                                                    toast.success("Venue deleted");
                                                                },
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
                    </>
                )}
            </div>
        </div>
    );
}
