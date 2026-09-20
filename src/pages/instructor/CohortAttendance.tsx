import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCohorts } from "@/lib/api/attendance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
    UserGroupIcon,
    Calendar03Icon,
    Location01Icon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    Clock01Icon,
    ArrowRight01Icon,
    UserAdd01Icon,
    Edit01Icon,
    StarIcon,
} from "hugeicons-react";
import { cn } from "@/lib/utils";
import { RowActions } from "@/components/shared/RowActions";
import { useRowMenu } from "@/components/shared/use-row-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { useActingUser } from "@/store/session";
import { markAttendance, recordSubjectiveGrade } from "@/lib/api/attendance";
import { useQueryClient } from "@tanstack/react-query";
import { describeError } from "@/lib/supabase";
import type { InstructorCohort, AttendanceRecord } from "@/data/admin-types";

export default function CohortAttendance() {
    const instructor = useActingUser("instructor");
    const queryClient = useQueryClient();

    const { data: instructorCohorts = [] } = useQuery({
        queryKey: ["cohorts", instructor.id],
        queryFn: () => fetchCohorts(instructor.id),
        staleTime: 30_000,
    });

    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
    const selectedCohort = instructorCohorts.find((c) => c.id === selectedCohortId) ?? null;
    const setSelectedCohort = (c: InstructorCohort | null) => setSelectedCohortId(c?.id ?? null);
    const [gradeDialogStudent, setGradeDialogStudent] = useState<AttendanceRecord | null>(null);
    const [gradeScore, setGradeScore] = useState("");
    const [gradeNotes, setGradeNotes] = useState("");

    const statusConfig = {
        present: { color: "bg-emerald-50 text-emerald-600", icon: CheckmarkCircle01Icon },
        absent: { color: "bg-red-50 text-red-500", icon: Cancel01Icon },
        excused: { color: "bg-amber-50 text-amber-600", icon: Clock01Icon },
    };

    const refreshCohorts = () => {
        void queryClient.invalidateQueries({ queryKey: ["cohorts", instructor.id] });
    };

    // Both of these previously fired a toast and wrote nothing.
    const handleMarkAttendance = async (
        student: AttendanceRecord,
        newStatus: "present" | "absent" | "excused"
    ) => {
        if (!selectedCohort) return;
        try {
            await markAttendance(selectedCohort.id, student.studentId, newStatus);
            refreshCohorts();
            toast.success(`${student.studentName} marked as ${newStatus}`, {
                description: `Attendance updated for ${student.courseTitle} session.`,
            });
        } catch (e) {
            toast.error("Could not update attendance", {
                description: describeError(e as { message?: string }),
            });
        }
    };

    const handleGradeSubmit = async () => {
        if (!gradeDialogStudent || !selectedCohort) return;
        const score = Number(gradeScore);
        if (!Number.isFinite(score) || score < 0 || score > 100) {
            toast.error("Enter a score between 0 and 100.");
            return;
        }
        try {
            await recordSubjectiveGrade(
                selectedCohort.id,
                gradeDialogStudent.studentId,
                Math.round(score),
                gradeNotes.trim() || undefined
            );
            toast.success(`Grade submitted for ${gradeDialogStudent.studentName}`, {
                description: "Subjective assessment recorded.",
            });
            setGradeDialogStudent(null);
            setGradeScore("");
            setGradeNotes("");
        } catch (e) {
            toast.error("Could not save the grade", {
                description: describeError(e as { message?: string }),
            });
        }
    };

    const rowMenu = useRowMenu();

    const studentActions = (student: AttendanceRecord) => [
        {
            label: "Mark present",
            icon: CheckmarkCircle01Icon,
            disabled: student.status === "present",
            onSelect: () => handleMarkAttendance(student, "present"),
        },
        {
            label: "Mark absent",
            icon: Cancel01Icon,
            disabled: student.status === "absent",
            onSelect: () => handleMarkAttendance(student, "absent"),
        },
        {
            label: "Mark excused",
            icon: Clock01Icon,
            disabled: student.status === "excused",
            onSelect: () => handleMarkAttendance(student, "excused"),
        },
        {
            label: "Subjective grade",
            icon: StarIcon,
            separatorBefore: true,
            onSelect: () => setGradeDialogStudent(student),
        },
    ];

    return (
        <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title={selectedCohort ? selectedCohort.courseTitle : "Cohort Attendance"}
                onBack={selectedCohort ? () => setSelectedCohort(null) : undefined}
                backLabel="Back to cohorts"
            />

            {selectedCohort ? (
                /* Detailed Cohort View */
                <div className="space-y-4 sm:space-y-6 px-1 sm:px-2">
                    {/* Session Info */}
                    <Card className="border-slate-100 rounded-2xl shadow-none">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-medium text-slate-800">{selectedCohort.courseTitle}</h2>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar03Icon size={14} className="text-slate-400" />
                                            {selectedCohort.sessionDate} · {selectedCohort.sessionTime}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Location01Icon size={14} className="text-slate-400" />
                                            {selectedCohort.venue}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full gap-1">
                                        <CheckmarkCircle01Icon size={12} />
                                        {selectedCohort.presentCount} Present
                                    </Badge>
                                    <Badge variant="secondary" className="bg-red-50 text-red-500 border-none text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full gap-1">
                                        <Cancel01Icon size={12} />
                                        {selectedCohort.absentCount} Absent
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Student Attendance Table */}
                    <Card className="border-slate-100 rounded-2xl shadow-none">
                        <CardContent className="p-0">
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-100 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Student</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Method</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Check-in</TableHead>
                                            <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCohort.students.map((student) => {
                                            const StatusIcon = statusConfig[student.status].icon;
                                            return (
                                                <TableRow
                                                    key={student.id}
                                                    onClick={rowMenu.rowClick(`row:${student.id}`)}
                                                    className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 border border-slate-100 rounded-full">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentName.split(" ")[0].toLowerCase()}`} />
                                                                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-medium">
                                                                    {student.studentName.split(" ").map((n) => n[0]).join("")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <span className="text-sm font-medium text-slate-800">{student.studentName}</span>
                                                                <p className="text-[11px] text-slate-400">{student.studentEmail}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={cn("text-[10px] font-medium border-none rounded-full capitalize px-2.5 gap-1", statusConfig[student.status].color)}>
                                                            <StatusIcon size={10} />
                                                            {student.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none text-[10px] font-medium rounded-full uppercase">
                                                            {student.method}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-400">
                                                        {student.checkInTime || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <RowActions
                                                            label={`Actions for ${student.studentName}`}
                                                            actions={studentActions(student)}
                                                            {...rowMenu.menu(`row:${student.id}`)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="md:hidden divide-y divide-slate-100">
                                {selectedCohort.students.map((student) => {
                                    const StatusIcon = statusConfig[student.status].icon;
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={rowMenu.rowClick(`card:${student.id}`)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 active:bg-slate-50 transition-colors"
                                        >
                                            <Avatar className="h-8 w-8 border border-slate-100 rounded-full shrink-0">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentName.split(" ")[0].toLowerCase()}`} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-medium">
                                                    {student.studentName.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <span className="block text-sm font-medium text-slate-800 truncate">
                                                    {student.studentName}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            "text-[10px] font-medium border-none rounded-full capitalize px-2 gap-1",
                                                            statusConfig[student.status].color
                                                        )}
                                                    >
                                                        <StatusIcon size={10} />
                                                        {student.status}
                                                    </Badge>
                                                    {student.checkInTime && (
                                                        <span className="text-[11px] text-slate-400 tabular-nums">
                                                            {student.checkInTime}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <RowActions
                                                label={`Actions for ${student.studentName}`}
                                                actions={studentActions(student)}
                                                {...rowMenu.menu(`card:${student.id}`)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Cohort List */
                instructorCohorts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4 sm:mb-6">
                            <UserGroupIcon size={36} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-medium text-slate-900 mb-2">No Sessions</h2>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium text-xs sm:text-sm leading-relaxed">
                            Your upcoming and past training sessions will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1 px-1 sm:px-2">
                        {instructorCohorts.map((cohort, index) => (
                            <div key={cohort.id}>
                                <div
                                    onClick={() => setSelectedCohort(cohort)}
                                    className="group flex items-center justify-between gap-3 py-4 sm:py-5 hover:bg-slate-50/50 px-2 sm:px-4 rounded-xl transition-colors cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View ${cohort.courseTitle} session`}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedCohort(cohort); } }}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                            <UserGroupIcon size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-slate-800 text-sm sm:text-base truncate">{cohort.courseTitle}</h4>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mt-0.5">
                                                <span className="text-[11px] sm:text-xs text-slate-400">{cohort.sessionDate} · {cohort.sessionTime}</span>
                                                <span className="hidden sm:inline text-slate-200">•</span>
                                                <span className="text-[11px] sm:text-xs text-slate-400 truncate">{cohort.venue}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-medium rounded-full px-2 h-5 gap-1">
                                                <CheckmarkCircle01Icon size={10} />
                                                {cohort.presentCount}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-red-50 text-red-500 border-none text-[10px] font-medium rounded-full px-2 h-5 gap-1">
                                                <Cancel01Icon size={10} />
                                                {cohort.absentCount}
                                            </Badge>
                                            <span className="hidden sm:inline text-xs text-slate-300 ml-1">{cohort.totalStudents} total</span>
                                        </div>
                                        <ArrowRight01Icon size={18} className="hidden sm:block text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                                {index < instructorCohorts.length - 1 && <Separator className="bg-slate-100" />}
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Subjective Grade Dialog */}
            <Dialog open={!!gradeDialogStudent} onOpenChange={(open) => { if (!open) setGradeDialogStudent(null); }}>
                <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-medium text-slate-900">Subjective Grade</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">
                            Award a practical assessment grade for <span className="font-medium text-slate-700">{gradeDialogStudent?.studentName}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="grade-score" className="text-sm font-medium text-slate-700">Score (0–100)</label>
                            <input
                                id="grade-score"
                                type="number"
                                min={0}
                                max={100}
                                value={gradeScore}
                                onChange={(e) => setGradeScore(e.target.value)}
                                placeholder="e.g. 85"
                                className="h-11 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="grade-notes" className="text-sm font-medium text-slate-700">Notes (optional)</label>
                            <textarea
                                id="grade-notes"
                                rows={3}
                                value={gradeNotes}
                                onChange={(e) => setGradeNotes(e.target.value)}
                                placeholder="Assessment remarks..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleGradeSubmit}
                            className="rounded-full h-10 bg-primary hover:bg-primary/90 text-white font-normal shadow-lg shadow-primary/10"
                        >
                            Submit Grade
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
