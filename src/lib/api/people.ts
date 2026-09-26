import { supabase } from "@/lib/supabase";
import type { Enums } from "@/types/database";

export interface Person {
    id: string;
    name: string;
    email: string;
    role: Enums<"user_role">;
    status: Enums<"user_status">;
    avatarUrl: string | null;
}

/**
 * Directory reads.
 *
 * These return real `profiles.id` values, which is what every foreign key in
 * the schema expects — `courses.instructor_id`, `attempts.student_id` and so on.
 */

export async function fetchInstructors(): Promise<Person[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, status, avatar_url")
        .eq("role", "instructor")
        .eq("status", "active")
        .order("name");
    if (error) throw error;
    return (data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        status: p.status,
        avatarUrl: p.avatar_url,
    }));
}

export interface RosterEntry {
    id: string;
    studentId: string;
    name: string;
    email: string;
    status: Enums<"enrollment_status">;
    /** Percent 0–100, maintained server-side. */
    progress: number;
    enrolledAt: string;
    completedAt: string | null;
}

/**
 * Everyone registered on a course.
 *
 * RLS decides who may ask: `enrollments_read` allows the row's own student,
 * the course's instructor, or an admin — so this needs no role check of its
 * own, and an instructor cannot read another course's roster by changing the id.
 */
export async function fetchCourseRoster(courseId: string): Promise<RosterEntry[]> {
    const { data, error } = await supabase
        .from("enrollments")
        .select(
            "id, student_id, status, progress, enrolled_at, completed_at, " +
            "student:profiles!enrollments_student_id_fkey ( name, email )"
        )
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false });
    if (error) throw error;

    type Row = {
        id: string;
        student_id: string;
        status: Enums<"enrollment_status">;
        progress: number;
        enrolled_at: string;
        completed_at: string | null;
        student: { name: string; email: string } | null;
    };

    return ((data ?? []) as unknown as Row[]).map((r) => ({
        id: r.id,
        studentId: r.student_id,
        name: r.student?.name ?? "—",
        email: r.student?.email ?? "",
        status: r.status,
        progress: r.progress,
        enrolledAt: r.enrolled_at,
        completedAt: r.completed_at,
    }));
}
