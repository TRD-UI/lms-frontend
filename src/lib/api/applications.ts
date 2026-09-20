import { supabase } from "@/lib/supabase";
import type { Enums } from "@/types/database";

/**
 * Course applications.
 *
 * Everything that decides something — submitting, withdrawing, approving —
 * goes through an RPC. `course_applications` has no write policy, so there is
 * no client-side path to an enrolment that skipped review.
 */

export type ApplicationStatus = Enums<"application_status">;

export interface CourseApplication {
    id: string;
    courseId: string;
    courseTitle: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    status: ApplicationStatus;
    phone: string;
    employer: string;
    experience: string;
    motivation: string;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNote: string;
}

export interface ApplicationInput {
    phone: string;
    employer: string;
    experience: string;
    motivation: string;
}

const SELECT =
    "id, course_id, student_id, status, phone, employer, experience, motivation, submitted_at, reviewed_at, review_note, " +
    "course:courses ( title ), student:profiles!course_applications_student_id_fkey ( name, email )";

type Row = {
    id: string;
    course_id: string;
    student_id: string;
    status: ApplicationStatus;
    phone: string;
    employer: string;
    experience: string;
    motivation: string;
    submitted_at: string;
    reviewed_at: string | null;
    review_note: string;
    course: { title: string } | null;
    student: { name: string; email: string } | null;
};

const toApplication = (r: Row): CourseApplication => ({
    id: r.id,
    courseId: r.course_id,
    courseTitle: r.course?.title ?? "—",
    studentId: r.student_id,
    studentName: r.student?.name ?? "—",
    studentEmail: r.student?.email ?? "",
    status: r.status,
    phone: r.phone,
    employer: r.employer,
    experience: r.experience,
    motivation: r.motivation,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
    reviewNote: r.review_note,
});

/**
 * Every application the caller may see. RLS decides the scope: a learner gets
 * their own, an instructor gets their courses', an admin gets all of them.
 */
export async function fetchApplications(): Promise<CourseApplication[]> {
    const { data, error } = await supabase
        .from("course_applications")
        .select(SELECT)
        .order("submitted_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as Row[]).map(toApplication);
}

/** The signed-in learner's own applications, keyed by course for quick lookup. */
export async function fetchMyApplications(): Promise<Record<string, CourseApplication>> {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return {};

    const { data, error } = await supabase
        .from("course_applications")
        .select(SELECT)
        .eq("student_id", me.user.id);
    if (error) throw error;

    return Object.fromEntries(
        ((data ?? []) as unknown as Row[]).map((r) => [r.course_id, toApplication(r)])
    );
}

export async function applyForCourse(courseId: string, input: ApplicationInput) {
    const { error } = await supabase.rpc("apply_for_course", {
        p_course_id: courseId,
        p_phone: input.phone,
        p_employer: input.employer,
        p_experience: input.experience,
        p_motivation: input.motivation,
    });
    if (error) throw error;
}

export async function withdrawApplication(courseId: string) {
    const { error } = await supabase.rpc("withdraw_application", { p_course_id: courseId });
    if (error) throw error;
}

export async function reviewApplication(applicationId: string, approve: boolean, note = "") {
    const { error } = await supabase.rpc("review_application", {
        p_application_id: applicationId,
        p_approve: approve,
        p_note: note,
    });
    if (error) throw error;
}
