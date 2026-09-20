import { supabase } from "@/lib/supabase";
import type { ClassSession } from "@/data/classes";
import type { EntryPass } from "@/data/entry-passes";
import { formatSessionDate } from "@/data/classes";

/** Physical sessions and the entry passes that admit learners to them. */

type SessionRow = {
    id: string;
    course_id: string;
    title: string;
    session_date: string;
    starts_at: string;
    ends_at: string;
    venue_name: string;
    room_number: string;
    capacity: number | null;
    instructor_id: string | null;
};

/** Postgres `time` comes back as HH:MM:SS; the UI works in HH:MM. */
const hhmm = (time: string) => time.slice(0, 5);

function toSession(row: SessionRow): ClassSession {
    return {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        date: row.session_date,
        startTime: hhmm(row.starts_at),
        endTime: hhmm(row.ends_at),
        venue: row.venue_name,
        roomNumber: row.room_number,
        instructorId: row.instructor_id ?? "",
        capacity: row.capacity ?? undefined,
    };
}

export async function fetchClassSessions(): Promise<ClassSession[]> {
    const { data, error } = await supabase
        .from("course_sessions")
        .select("id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, capacity, instructor_id")
        .order("session_date", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as SessionRow[]).map(toSession);
}

export async function createClassSession(input: Omit<ClassSession, "id">): Promise<string> {
    const { data, error } = await supabase
        .from("course_sessions")
        .insert({
            course_id: input.courseId,
            title: input.title,
            session_date: input.date,
            starts_at: input.startTime,
            ends_at: input.endTime,
            venue_name: input.venue,
            room_number: input.roomNumber,
            instructor_id: input.instructorId || null,
        })
        .select("id")
        .single();
    if (error) throw error;
    return data.id;
}

export async function updateClassSession(id: string, patch: Partial<ClassSession>) {
    const { error } = await supabase
        .from("course_sessions")
        .update({
            ...(patch.courseId !== undefined ? { course_id: patch.courseId } : {}),
            ...(patch.title !== undefined ? { title: patch.title } : {}),
            ...(patch.date !== undefined ? { session_date: patch.date } : {}),
            ...(patch.startTime !== undefined ? { starts_at: patch.startTime } : {}),
            ...(patch.endTime !== undefined ? { ends_at: patch.endTime } : {}),
            ...(patch.venue !== undefined ? { venue_name: patch.venue } : {}),
            ...(patch.roomNumber !== undefined ? { room_number: patch.roomNumber } : {}),
        })
        .eq("id", id);
    if (error) throw error;
}

export async function deleteClassSession(id: string) {
    const { error } = await supabase.from("course_sessions").delete().eq("id", id);
    if (error) throw error;
}

// ─── Entry passes ────────────────────────────────────────────────────────────

type PassRow = {
    id: string;
    session_id: string;
    student_id: string;
    pass_code: string;
    status: "active" | "used" | "past" | "revoked";
    session: {
        course_id: string;
        title: string;
        session_date: string;
        starts_at: string;
        ends_at: string;
        venue_name: string;
        room_number: string;
    } | null;
};

export async function fetchEntryPasses(): Promise<EntryPass[]> {
    const { data, error } = await supabase
        .from("entry_passes")
        .select(
            "id, session_id, student_id, pass_code, status, session:course_sessions ( course_id, title, session_date, starts_at, ends_at, venue_name, room_number )"
        );
    if (error) throw error;

    const today = new Date().toISOString().slice(0, 10);

    return ((data ?? []) as unknown as PassRow[])
        .filter((p) => p.session)
        .map((p) => ({
            id: p.id,
            eventTitle: p.session!.title,
            date: formatSessionDate(p.session!.session_date),
            time: `${hhmm(p.session!.starts_at)} - ${hhmm(p.session!.ends_at)}`,
            venue: p.session!.venue_name,
            roomNumber: p.session!.room_number || "TBC",
            passCode: p.pass_code,
            status: p.session!.session_date < today ? "past" : "active",
            courseId: p.session!.course_id,
            sessionId: p.session_id,
            sessionDate: p.session!.session_date,
        }));
}

/**
 * The signed payload for the door scanner, or why it is still withheld.
 *
 * `gated` means a required assessment is outstanding, `not_yet` that the class
 * has not come round yet, `expired` that it has been and gone.
 */
export type PassQr =
    | { released: true; payload: string; passCode: string }
    | { released: false; reason: "gated"; blockingAssessmentId: string | null }
    | { released: false; reason: "not_yet"; availableOn: string }
    | { released: false; reason: "expired" };


export async function fetchPassQr(passId: string) {
    const { data, error } = await supabase.rpc("entry_pass_qr", { p_pass_id: passId });
    if (error) throw error;
    return data as unknown as PassQr;
}

/**
 * Redeems a pass at the door.
 *
 * `payload` is either the signed QR value or a pass code typed by hand — the
 * function tells them apart. Never throws for a bad code: an invalid pass is a
 * result to show the instructor, not an exception.
 */
export interface ScanOutcome {
    valid: boolean;
    reason?: string;
    studentName?: string;
    passCode?: string;
    courseName?: string;
    message: string;
}

export async function redeemPass(payload: string, sessionId?: string): Promise<ScanOutcome> {
    const { data, error } = await supabase.rpc("redeem_entry_pass", {
        p_payload: payload,
        ...(sessionId ? { p_session_id: sessionId } : {}),
    });
    if (error) throw error;
    return data as unknown as ScanOutcome;
}
