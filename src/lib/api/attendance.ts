import { supabase } from "@/lib/supabase";
import type { AttendanceRecord, InstructorCohort } from "@/data/admin-types";
import { formatSessionDate } from "@/data/classes";

/**
 * Cohorts: a scheduled session plus its roster.
 *
 * A "cohort" here is one `course_sessions` row. The roster is everyone enrolled
 * on the course, joined to whatever attendance has been recorded — so a learner
 * who has not been marked yet still appears, as absent.
 */

const hhmm = (t: string) => t.slice(0, 5);

export async function fetchCohorts(instructorId?: string): Promise<InstructorCohort[]> {
    let sessionQuery = supabase
        .from("course_sessions")
        .select("id, course_id, title, session_date, starts_at, ends_at, venue_name, course:courses ( title )")
        .order("session_date", { ascending: false });
    if (instructorId) sessionQuery = sessionQuery.eq("instructor_id", instructorId);

    const { data: sessions, error } = await sessionQuery;
    if (error) throw error;
    if (!sessions?.length) return [];

    const courseIds = [...new Set(sessions.map((s) => s.course_id))];
    const sessionIds = sessions.map((s) => s.id);

    const [{ data: enrollments }, { data: records }] = await Promise.all([
        supabase
            .from("enrollments")
            .select("course_id, student:profiles!enrollments_student_id_fkey ( id, name, email )")
            .in("course_id", courseIds)
            .in("status", ["active", "completed"]),
        supabase
            .from("attendance_records")
            .select("session_id, student_id, status, method, check_in_time")
            .in("session_id", sessionIds),
    ]);

    type Enrolled = { course_id: string; student: { id: string; name: string; email: string } | null };
    const byCourse = new Map<string, Enrolled[]>();
    for (const e of (enrollments ?? []) as unknown as Enrolled[]) {
        byCourse.set(e.course_id, [...(byCourse.get(e.course_id) ?? []), e]);
    }

    const recordFor = new Map<string, (typeof records)[number]>();
    for (const r of records ?? []) recordFor.set(`${r.session_id}:${r.student_id}`, r);

    return sessions.map((s) => {
        const roster = byCourse.get(s.course_id) ?? [];

        const students: AttendanceRecord[] = roster
            .filter((e) => e.student)
            .map((e) => {
                const rec = recordFor.get(`${s.id}:${e.student!.id}`);
                return {
                    id: `${s.id}:${e.student!.id}`,
                    studentId: e.student!.id,
                    studentName: e.student!.name,
                    studentEmail: e.student!.email,
                    courseTitle: (s as { course?: { title: string } }).course?.title ?? s.title,
                    sessionDate: formatSessionDate(s.session_date),
                    status: rec?.status ?? "absent",
                    checkInTime: rec?.check_in_time
                        ? new Date(rec.check_in_time).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : undefined,
                    method: rec?.method ?? "manual",
                };
            })
            .sort((a, b) => a.studentName.localeCompare(b.studentName));

        const present = students.filter((x) => x.status === "present").length;

        return {
            id: s.id,
            courseTitle: s.title,
            sessionDate: formatSessionDate(s.session_date),
            sessionTime: `${hhmm(s.starts_at)} - ${hhmm(s.ends_at)}`,
            venue: s.venue_name,
            totalStudents: students.length,
            presentCount: present,
            absentCount: students.length - present,
            students,
        };
    });
}

/** Upsert, because a learner may have no record yet when first marked. */
export async function markAttendance(
    sessionId: string,
    studentId: string,
    status: AttendanceRecord["status"]
) {
    const { data: me } = await supabase.auth.getUser();
    const { error } = await supabase.from("attendance_records").upsert(
        {
            session_id: sessionId,
            student_id: studentId,
            status,
            method: "manual",
            check_in_time: status === "present" ? new Date().toISOString() : null,
            marked_by: me.user?.id ?? null,
        },
        { onConflict: "session_id,student_id" }
    );
    if (error) throw error;
}

export async function recordSubjectiveGrade(
    sessionId: string,
    studentId: string,
    score: number,
    notes?: string
) {
    const { data: me } = await supabase.auth.getUser();
    const { error } = await supabase.from("subjective_grades").upsert(
        {
            session_id: sessionId,
            student_id: studentId,
            score,
            notes: notes ?? null,
            graded_by: me.user?.id ?? null,
        },
        { onConflict: "session_id,student_id" }
    );
    if (error) throw error;
}
