import { useQuery } from "@tanstack/react-query";
import { UserMultiple02Icon } from "hugeicons-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/shared/StatusBadge";
import { MiniDonut } from "@/components/shared/MiniDonut";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import { fetchCourseRoster } from "@/lib/api/people";

/**
 * Everyone registered on a course.
 *
 * Scoped by RLS rather than by anything here: an instructor sees their own
 * course's roster, an admin sees any.
 */

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const initials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("");

export function CourseRoster({ courseId }: { courseId: string }) {
    const { data: roster = [], isLoading } = useQuery({
        queryKey: ["course-roster", courseId],
        queryFn: () => fetchCourseRoster(courseId),
        staleTime: 30_000,
    });

    const paged = usePagination(roster, 10);

    if (isLoading) {
        return <div className="h-40 rounded-2xl bg-slate-50 animate-pulse mx-1 sm:mx-2" />;
    }

    if (roster.length === 0) {
        return (
            <EmptyState
                icon={UserMultiple02Icon}
                title="Nobody registered yet"
                description="Approved applicants appear here once they are enrolled."
            />
        );
    }

    return (
        <Card className="border-slate-100 rounded-2xl shadow-none mx-1 sm:mx-2">
            <CardContent className="p-0">
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 hover:bg-transparent">
                                <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Student</TableHead>
                                <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest w-40">Progress</TableHead>
                                <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Registered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paged.pageRows.map((entry) => (
                                <TableRow key={entry.id} className="border-slate-50">
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-slate-100 rounded-full">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name.split(" ")[0].toLowerCase()}`} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-medium">
                                                    {initials(entry.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <span className="block text-sm font-medium text-slate-800 truncate">{entry.name}</span>
                                                <span className="block text-[11px] text-slate-400 truncate">{entry.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge tone={toneForStatus(entry.status)}>{entry.status}</StatusBadge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <MiniDonut value={entry.progress} size={36} label="complete" />
                                            <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                                                {entry.progress}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500 tabular-nums">
                                        {formatDate(entry.enrolledAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="md:hidden divide-y divide-slate-100">
                    {paged.pageRows.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3 p-4">
                            <MiniDonut value={entry.progress} size={38} label="complete" />
                            <div className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-slate-800 truncate">{entry.name}</span>
                                <span className="block text-[11px] text-slate-400 truncate">{entry.email}</span>
                                <span className="block text-[11px] text-slate-400 tabular-nums mt-0.5">
                                    Registered {formatDate(entry.enrolledAt)}
                                </span>
                            </div>
                            <StatusBadge tone={toneForStatus(entry.status)} className="shrink-0">
                                {entry.status}
                            </StatusBadge>
                        </div>
                    ))}
                </div>

                <TablePagination
                    page={paged.page}
                    pageCount={paged.pageCount}
                    onPageChange={paged.setPage}
                    from={paged.from}
                    to={paged.to}
                    total={paged.total}
                    label="students"
                />
            </CardContent>
        </Card>
    );
}
