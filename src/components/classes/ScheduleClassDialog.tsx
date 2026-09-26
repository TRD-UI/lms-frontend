import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar03Icon } from "hugeicons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { fetchMeetingLink } from "@/lib/api/classes";
import {
    MIN_SCHEDULE_NOTICE_DAYS,
    VIRTUAL_VENUE,
    earliestSchedulableDate,
    formatSessionDate,
    latestSchedulableDate,
    toDateKey,
    type ClassSession,
} from "@/data/classes";
import type { Course } from "@/data/types";
import { cn } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
    const minutes = 8 * 60 + i * 30; // 08:00 → 21:00, half-hourly
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

type Mode = "onsite" | "virtual";

interface ScheduleClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Courses the instructor may schedule onto. */
    courses: Course[];
    instructorId: string;
    session?: ClassSession | null;
    /** Pre-selects a day when opened from a specific column. */
    defaultDate?: string;
}

/**
 * Schedules one class, on site or online.
 *
 * The date is a field with a picker behind it rather than a calendar sitting
 * open in the dialog: the month grid dominated a form whose other six inputs
 * matter just as much. Out-of-range days are disabled in the picker rather
 * than rejected on submit, so the constraint is visible rather than a surprise.
 */
export function ScheduleClassDialog({
    open,
    onOpenChange,
    courses,
    instructorId,
    session,
    defaultDate,
}: ScheduleClassDialogProps) {
    const isEdit = Boolean(session);
    const { venues, scheduleClass, updateClassSession } = useLms();

    const earliest = earliestSchedulableDate();
    const [date, setDate] = useState<Date | undefined>(earliest);
    const [dateOpen, setDateOpen] = useState(false);
    const [courseId, setCourseId] = useState("");
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("14:00");
    const [mode, setMode] = useState<Mode>("onsite");
    const [venue, setVenue] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [meetingUrl, setMeetingUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    /*
     * Classes run for as long as the course does. There is no start date on a
     * course, so the horizon is measured from today — enough to lay out a whole
     * term in one sitting, without offering dates past the course's own life.
     */
    const course = courses.find((c) => c.id === courseId);
    const latest = course ? latestSchedulableDate(course.duration) : undefined;

    // The link is not readable from a list, so an edit fetches it back.
    const { data: link } = useQuery({
        queryKey: ["meeting-link", session?.id],
        queryFn: () => fetchMeetingLink(session!.id),
        enabled: open && Boolean(session?.id),
        staleTime: 30_000,
    });

    useEffect(() => {
        if (link?.virtual && link.released) setMeetingUrl(link.url);
    }, [link]);

    useEffect(() => {
        if (!open) return;
        setError(null);
        setDateOpen(false);
        if (session) {
            setDate(new Date(session.date));
            setCourseId(session.courseId);
            setTitle(session.title);
            setStartTime(session.startTime);
            setEndTime(session.endTime);
            setMode(session.venue === VIRTUAL_VENUE ? "virtual" : "onsite");
            setVenue(session.venue);
            setRoomNumber(session.roomNumber);
            setMeetingUrl("");
        } else {
            // A day picked off the grid wins, unless it falls inside the notice
            // window — in which case the earliest legal date does.
            const fromGrid = defaultDate ? new Date(defaultDate) : null;
            const floor = earliestSchedulableDate();
            setDate(fromGrid && fromGrid >= floor ? fromGrid : floor);
            setCourseId(courses[0]?.id ?? "");
            setTitle("");
            setStartTime("10:00");
            setEndTime("14:00");
            setMode("onsite");
            setVenue(venues[0]?.name ?? "");
            setRoomNumber("");
            setMeetingUrl("");
        }
        // `courses`/`venues` are stable enough here; re-running on open is the point.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, session, defaultDate]);

    const handleSubmit = async () => {
        if (!courseId) return setError("Pick the course this class belongs to.");
        if (!title.trim()) return setError("Give the class a title.");
        if (!date) return setError("Pick a date.");
        if (endTime <= startTime) return setError("The end time must be after the start time.");

        const isVirtual = mode === "virtual";
        if (!isVirtual && !venue) return setError("Pick a venue.");
        if (isVirtual && !meetingUrl.trim()) return setError("Add the link learners will join on.");
        if (isVirtual && !/^https?:\/\/\S+$/i.test(meetingUrl.trim())) {
            return setError("The join link needs to be a full URL, starting with https://");
        }

        const payload = {
            courseId,
            title: title.trim(),
            date: toDateKey(date),
            startTime,
            endTime,
            venue: isVirtual ? VIRTUAL_VENUE : venue,
            roomNumber: isVirtual ? "" : roomNumber.trim(),
            meetingUrl: isVirtual ? meetingUrl.trim() : "",
            instructorId,
        };

        try {
            if (session) {
                await updateClassSession(session.id, payload);
            } else {
                await scheduleClass(payload);
            }
            onOpenChange(false);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-lg max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-slate-900">
                        {isEdit ? "Edit class" : "Schedule a class"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                        At least {MIN_SCHEDULE_NOTICE_DAYS} days ahead, so learners are notified and any
                        entry passes are issued in time.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
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

                    <Field
                        label="Date"
                        htmlFor="class-date"
                        required
                        hint={
                            course
                                ? latest
                                    ? `Anywhere up to ${formatSessionDate(toDateKey(latest))} — the length of this course.`
                                    : undefined
                                : undefined
                        }
                    >
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    id="class-date"
                                    type="button"
                                    className="h-11 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-left flex items-center justify-between gap-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                                >
                                    <span className={cn(date ? "text-slate-900" : "text-slate-400")}>
                                        {date ? formatSessionDate(toDateKey(date)) : "Pick a date"}
                                    </span>
                                    <Calendar03Icon size={16} className="text-slate-400 shrink-0" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-auto p-2 rounded-2xl border-slate-100">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(next) => {
                                        setDate(next);
                                        if (next) setDateOpen(false);
                                    }}
                                    disabled={latest ? { before: earliest, after: latest } : { before: earliest }}
                                    defaultMonth={date}
                                    className="p-0"
                                />
                            </PopoverContent>
                        </Popover>
                    </Field>

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

                    <Field label="Delivery" htmlFor="class-mode">
                        <div id="class-mode" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200">
                            {([["onsite", "On site"], ["virtual", "Virtual"]] as const).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setMode(key)}
                                    aria-pressed={mode === key}
                                    className={cn(
                                        "h-9 rounded-lg text-sm font-medium transition-colors",
                                        mode === key
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Field>

                    {mode === "virtual" ? (
                        <TextField
                            id="class-link"
                            label="Join link"
                            required
                            value={meetingUrl}
                            onChange={setMeetingUrl}
                            placeholder="https://meet.google.com/…"
                            hint="Shared with learners on the day of the class, not before."
                        />
                    ) : (
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
                    )}

                    {error && <p className="text-xs text-destructive font-medium">{error}</p>}
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
                        onClick={() => void handleSubmit()}
                        className="rounded-full h-10 bg-primary hover:bg-primary/90 text-white font-normal shadow-lg shadow-primary/10"
                    >
                        {isEdit ? "Save class" : "Schedule class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
