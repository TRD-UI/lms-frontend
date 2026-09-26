/**
 * Physical class sessions.
 *
 * A course is delivered partly on site; each on-site meeting is a ClassSession.
 * This is what an entry pass admits a learner to, and what fills the upcoming
 * classes card on the student dashboard.
 *
 * Mirrors `public.course_sessions` in the database.
 */

export interface ClassSession {
    id: string;
    courseId: string;
    title: string;
    /** ISO date, YYYY-MM-DD. */
    date: string;
    /** 24-hour HH:mm. */
    startTime: string;
    endTime: string;
    venue: string;
    roomNumber: string;
    /**
     * Join link for an online class. Non-empty means virtual.
     *
     * Never present on a list read — the column is not selectable from the
     * client. It arrives only from session_meeting_link(), and only when due.
     */
    meetingUrl?: string;
    instructorId: string;
    capacity?: number;
    notes?: string;
}

/**
 * A class cannot be scheduled fewer than this many days out, so learners have
 * warning and their entry pass can be issued in time.
 */
export const MIN_SCHEDULE_NOTICE_DAYS = 3;

/** Local YYYY-MM-DD. `toISOString()` would shift the date across timezones. */
export function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
}

export function fromDateKey(key: string): Date {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** The earliest date an instructor may schedule onto. */
export function earliestSchedulableDate(from = new Date()): Date {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    d.setDate(d.getDate() + MIN_SCHEDULE_NOTICE_DAYS);
    return d;
}

/** The venue recorded for an online class. */
export const VIRTUAL_VENUE = "Virtual";

export const isVirtualSession = (session: Pick<ClassSession, "venue">) =>
    session.venue === VIRTUAL_VENUE;

const DAYS_PER: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };

/** `"3 months"` → 90. Null when the course's duration cannot be read. */
export function durationInDays(duration: string): number | null {
    const match = /(\d+(?:\.\d+)?)\s*(day|week|month|year)s?/i.exec(duration);
    if (!match) return null;
    return Math.round(Number(match[1]) * DAYS_PER[match[2].toLowerCase()]);
}

/**
 * The last date a class may be scheduled onto.
 *
 * There is no upper bound in principle — a term's worth of classes can be laid
 * out in one sitting. The only limit is the course's own length, measured from
 * today, since a course has a duration but no start date to measure from.
 * Undefined when the duration is free text we cannot read, in which case no
 * ceiling is imposed.
 */
export function latestSchedulableDate(duration: string, from = new Date()): Date | undefined {
    const days = durationInDays(duration);
    if (days == null) return undefined;
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    d.setDate(d.getDate() + days);
    return d;
}

export function formatSessionTime(session: Pick<ClassSession, "startTime" | "endTime">): string {
    const to12h = (hhmm: string) => {
        const [h, m] = hhmm.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const hour = h % 12 === 0 ? 12 : h % 12;
        return `${hour}:${String(m).padStart(2, "0")} ${period}`;
    };
    return `${to12h(session.startTime)} – ${to12h(session.endTime)}`;
}

export function formatSessionDate(key: string): string {
    return fromDateKey(key).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/** Seeded a little ahead of today so the calendars are not empty on first run. */
const soon = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return toDateKey(d);
};

export const classSessions: ClassSession[] = [
    {
        id: "cls-1",
        courseId: "1",
        title: "Web Foundation — Lab Session",
        date: soon(4),
        startTime: "10:00",
        endTime: "14:00",
        venue: "Training Lab 1",
        roomNumber: "Lab 01 (Ground Floor)",
        instructorId: "u-2",
        capacity: 25,
    },
    {
        id: "cls-2",
        courseId: "3",
        title: "Python Practical",
        date: soon(6),
        startTime: "14:00",
        endTime: "17:00",
        venue: "Tech Lab 3",
        roomNumber: "Level 2, Room 204",
        instructorId: "u-6",
        capacity: 20,
    },
    {
        id: "cls-3",
        courseId: "14",
        title: "Cybersecurity Hands-on Lab",
        date: soon(9),
        startTime: "13:00",
        endTime: "18:00",
        venue: "Tech Lab 3",
        roomNumber: "Level 2, Room 204",
        instructorId: "u-2",
        capacity: 20,
    },
    {
        id: "cls-4",
        courseId: "1",
        title: "Styling Systems Workshop",
        date: soon(12),
        startTime: "09:00",
        endTime: "12:00",
        venue: "Training Lab 1",
        roomNumber: "Lab 01 (Ground Floor)",
        instructorId: "u-2",
        capacity: 25,
    },
];
