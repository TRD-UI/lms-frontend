import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, TextField } from "@/components/assessments/form-fields";
import { useLms } from "@/store/lms-store";
import {
    MIN_SCHEDULE_NOTICE_DAYS,
    earliestSchedulableDate,
    formatSessionDate,
    toDateKey,
    type ClassSession,
} from "@/data/classes";
import type { Course } from "@/data/types";

const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
    const minutes = 8 * 60 + i * 30; // 08:00 → 21:00, half-hourly
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

interface ScheduleClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Courses the instructor may schedule onto. */
    courses: Course[];
    instructorId: string;
    session?: ClassSession | null;
}

/**
 * Schedules one on-site meeting.
 *
 * Dates inside the notice window are disabled in the picker rather than
 * rejected on submit, so the constraint is visible rather than a surprise.
 */
export function ScheduleClassDialog({
    open,
    onOpenChange,
    courses,
    instructorId,
    session,
}: ScheduleClassDialogProps) {
    const isEdit = Boolean(session);
    const { venues, scheduleClass, updateClassSession } = useLms();

    const earliest = earliestSchedulableDate();
    const [date, setDate] = useState<Date | undefined>(earliest);
    const [courseId, setCourseId] = useState("");
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("14:00");
    const [venue, setVenue] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setError(null);
        if (session) {
            setDate(new Date(session.date));
            setCourseId(session.courseId);
            setTitle(session.title);
            setStartTime(session.startTime);
            setEndTime(session.endTime);
            setVenue(session.venue);
            setRoomNumber(session.roomNumber);
        } else {
            setDate(earliestSchedulableDate());
            setCourseId(courses[0]?.id ?? "");
            setTitle("");
            setStartTime("10:00");
            setEndTime("14:00");
            setVenue(venues[0]?.name ?? "");
            setRoomNumber("");
        }
        // `courses`/`venues` are stable enough here; re-running on open is the point.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, session]);

    const handleSubmit = () => {
        if (!courseId) return setError("Pick the course this class belongs to.");
        if (!title.trim()) return setError("Give the class a title.");
        if (!date) return setError("Pick a date.");
        if (endTime <= startTime) return setError("The end time must be after the start time.");
        if (!venue) return setError("Pick a venue.");

        const payload = {
            courseId,
            title: title.trim(),
            date: toDateKey(date),
            startTime,
            endTime,
            venue,
            roomNumber: roomNumber.trim(),
            instructorId,
        };

        try {
            if (session) {
                updateClassSession(session.id, payload);
            } else {
                scheduleClass(payload);
            }
            onOpenChange(false);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-2xl max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        {isEdit ? "Edit class" : "Schedule a class"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        On-site sessions must be set at least {MIN_SCHEDULE_NOTICE_DAYS} days ahead, so
                        learners are notified and their entry passes are issued in time. The earliest
                        you can pick is {formatSessionDate(toDateKey(earliest))}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 sm:grid-cols-[auto,1fr] py-2">
                    <div className="rounded-2xl border border-slate-100 p-2 w-fit">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={{ before: earliest }}
                            defaultMonth={date}
                            className="p-0"
                        />
                    </div>

                    <div className="space-y-4 min-w-0">
                        <Field label="Course" htmlFor="class-course" required>
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger id="class-course" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <TextField
                            id="class-title"
                            label="Class title"
                            required
                            value={title}
                            onChange={setTitle}
                            placeholder="e.g. Web Foundation — Lab Session"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Starts" htmlFor="class-start">
                                <Select value={startTime} onValueChange={setStartTime}>
                                    <SelectTrigger id="class-start" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl max-h-60">
                                        {TIME_SLOTS.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Ends" htmlFor="class-end">
                                <Select value={endTime} onValueChange={setEndTime}>
                                    <SelectTrigger id="class-end" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl max-h-60">
                                        {TIME_SLOTS.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Venue" htmlFor="class-venue" required>
                                <Select value={venue} onValueChange={setVenue}>
                                    <SelectTrigger id="class-venue" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                                        <SelectValue placeholder="Select a venue" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {venues.map((v) => (
                                            <SelectItem key={v.id} value={v.name}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <TextField
                                id="class-room"
                                label="Room"
                                value={roomNumber}
                                onChange={setRoomNumber}
                                placeholder="Lab 01"
                            />
                        </div>

                        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full h-10 border-slate-200 text-slate-500 font-normal"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="rounded-full h-10 bg-primary hover:bg-primary/90 text-white font-normal shadow-lg shadow-primary/10"
                    >
                        {isEdit ? "Save class" : "Schedule class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
