import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCheck01Icon, Mail01Icon, CallIcon, Building01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TextArea } from "@/components/assessments/form-fields";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/shared/StatusBadge";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import {
    fetchApplications,
    reviewApplication,
    type CourseApplication,
} from "@/lib/api/applications";
import { useSession } from "@/store/session";
import { describeError } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * The admissions queue.
 *
 * Shared by the admin and instructor portals — RLS decides the scope, so an
 * instructor sees only their own courses' applicants without this component
 * knowing anything about roles.
 */

const FILTERS = [
    ["pending", "Pending"],
    ["all", "All"],
] as const;

type Filter = (typeof FILTERS)[number][0];

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function ApplicationsTable({ className }: { className?: string }) {
    const { status } = useSession();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<Filter>("pending");
    const [reviewing, setReviewing] = useState<CourseApplication | null>(null);

    const { data: applications = [], isLoading } = useQuery({
        queryKey: ["course-applications"],
        queryFn: fetchApplications,
        enabled: status === "authenticated",
        staleTime: 30_000,
    });

    const rows = applications.filter((a) => filter === "all" || a.status === "pending");
    const paged = usePagination(rows, 8);
    const pendingCount = applications.filter((a) => a.status === "pending").length;

    if (isLoading) {
        return <div className="h-40 rounded-2xl bg-slate-50 animate-pulse mx-1 sm:mx-2" />;
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-2 px-1 sm:px-2">
                {FILTERS.map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-medium transition-all border",
                            filter === key
                                ? "bg-accent/70 text-primary border-accent"
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100"
                        )}
                    >
                        {label}
                        {key === "pending" && pendingCount > 0 && (
                            <span className="ml-1.5 tabular-nums">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {rows.length === 0 ? (
                <EmptyState
                    icon={UserCheck01Icon}
                    title={filter === "pending" ? "No applications waiting" : "No applications yet"}
                    description={
                        filter === "pending"
                            ? "Every application has been decided. New ones land here."
                            : "When learners apply for a course, their applications appear here for review."
                    }
                />
            ) : (
                <Card className="border-slate-100 rounded-2xl shadow-none mx-1 sm:mx-2">
                    <CardContent className="p-0">
                        {/* Table on a desktop, stacked rows on a phone — an
                            instructor reviewing on the way to class. */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Applicant</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Course</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Submitted</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paged.pageRows.map((a) => (
                                        <TableRow
                                            key={a.id}
                                            onClick={() => setReviewing(a)}
                                            className="border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        >
                                            <TableCell className="py-4">
                                                <span className="block text-sm font-medium text-slate-800">{a.studentName}</span>
                                                <span className="block text-xs text-slate-400">{a.studentEmail}</span>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">{a.courseTitle}</TableCell>
                                            <TableCell className="text-sm text-slate-500 tabular-nums">{formatDate(a.submittedAt)}</TableCell>
                                            <TableCell>
                                                <StatusBadge tone={toneForApplication(a.status)}>{a.status}</StatusBadge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReviewing(a)}
                                                    className="h-8 rounded-full text-xs font-medium text-primary hover:bg-accent/40"
                                                >
                                                    {a.status === "pending" ? "Review" : "View"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {paged.pageRows.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setReviewing(a)}
                                    className="w-full text-left p-4 flex items-start justify-between gap-3 active:bg-slate-50 transition-colors"
                                >
                                    <div className="min-w-0 space-y-1">
                                        <span className="block text-sm font-medium text-slate-800 truncate">{a.studentName}</span>
                                        <span className="block text-xs text-slate-500 truncate">{a.courseTitle}</span>
                                        <span className="block text-[11px] text-slate-400 tabular-nums">{formatDate(a.submittedAt)}</span>
                                    </div>
                                    <StatusBadge tone={toneForApplication(a.status)} className="shrink-0 mt-0.5">
                                        {a.status}
                                    </StatusBadge>
                                </button>
                            ))}
                        </div>

                        <TablePagination
                            page={paged.page}
                            pageCount={paged.pageCount}
                            onPageChange={paged.setPage}
                            from={paged.from}
                            to={paged.to}
                            total={paged.total}
                            label="applications"
                        />
                    </CardContent>
                </Card>
            )}

            <ReviewDialog
                application={reviewing}
                onClose={() => setReviewing(null)}
                onDecided={() => {
                    void queryClient.invalidateQueries({ queryKey: ["course-applications"] });
                    void queryClient.invalidateQueries({ queryKey: ["courses"] });
                }}
            />
        </div>
    );
}

function toneForApplication(status: CourseApplication["status"]) {
    if (status === "approved") return "good" as const;
    if (status === "rejected") return "critical" as const;
    if (status === "withdrawn") return "neutral" as const;
    return toneForStatus(status);
}

interface ReviewDialogProps {
    application: CourseApplication | null;
    onClose: () => void;
    onDecided: () => void;
}

function ReviewDialog({ application, onClose, onDecided }: ReviewDialogProps) {
    const [note, setNote] = useState("");

    const decide = useMutation({
        mutationFn: ({ approve }: { approve: boolean }) =>
            reviewApplication(application!.id, approve, note.trim()),
        onSuccess: (_data, { approve }) => {
            toast.success(approve ? "Application approved" : "Application rejected", {
                description: approve
                    ? `${application?.studentName} is now enrolled on ${application?.courseTitle}.`
                    : `${application?.studentName} has been told.`,
            });
            setNote("");
            onDecided();
            onClose();
        },
        onError: (e) =>
            toast.error("Could not record that decision", {
                description: describeError(e as { message?: string }),
            }),
    });

    const open = Boolean(application);
    const pending = application?.status === "pending";

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    setNote("");
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-lg rounded-2xl border-slate-100">
                {application && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-medium text-slate-900">
                                {application.studentName}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                Applied for {application.courseTitle} on {formatDate(application.submittedAt)}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-1">
                            <div className="grid gap-2 sm:grid-cols-2">
                                <Detail icon={Mail01Icon} label="Email" value={application.studentEmail} />
                                <Detail icon={CallIcon} label="Phone" value={application.phone} />
                                <Detail icon={Building01Icon} label="Employer" value={application.employer} />
                                <Detail icon={UserCheck01Icon} label="Experience" value={application.experience} />
                            </div>

                            {application.motivation && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                        Why they want the place
                                    </span>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 whitespace-pre-wrap">
                                        {application.motivation}
                                    </p>
                                </div>
                            )}

                            {pending ? (
                                <TextArea
                                    id="review-note"
                                    label="Note to the applicant"
                                    value={note}
                                    onChange={setNote}
                                    rows={3}
                                    hint="Included in the message they receive — most useful when turning someone down."
                                    placeholder="Optional"
                                />
                            ) : (
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                                    <span className="text-xs text-slate-500">
                                        {application.reviewedAt
                                            ? `Decided ${formatDate(application.reviewedAt)}`
                                            : "Decided"}
                                    </span>
                                    <StatusBadge tone={toneForApplication(application.status)}>
                                        {application.status}
                                    </StatusBadge>
                                </div>
                            )}

                            {!pending && application.reviewNote && (
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">
                                    {application.reviewNote}
                                </p>
                            )}
                        </div>

                        {pending && (
                            <DialogFooter className="gap-2 sm:gap-2">
                                <Button
                                    variant="outline"
                                    disabled={decide.isPending}
                                    onClick={() => decide.mutate({ approve: false })}
                                    className="h-11 rounded-full border-slate-200 text-slate-600 font-medium"
                                >
                                    Reject
                                </Button>
                                <Button
                                    disabled={decide.isPending}
                                    onClick={() => decide.mutate({ approve: true })}
                                    className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10"
                                >
                                    {decide.isPending ? "Saving…" : "Approve & Enrol"}
                                </Button>
                            </DialogFooter>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
            <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="block text-sm text-slate-700 truncate">{value || "—"}</span>
            </div>
        </div>
    );
}
