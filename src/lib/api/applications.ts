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
    /** Object path in the private evidence bucket; "" when none was attached. */
    paymentEvidencePath: string;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNote: string;
}

export interface ApplicationInput {
    phone: string;
    employer: string;
    experience: string;
    motivation: string;
    /** Path returned by uploadPaymentEvidence(), or "" if none. */
    paymentEvidencePath: string;
}

const EVIDENCE_BUCKET = "application-evidence";

/**
 * Uploads proof of payment and returns its object path.
 *
 * The bucket is private and the applicant's own id is the folder, which is
 * both what the storage policy checks and what apply_for_course() verifies
 * before it will record the path.
 */
export async function uploadPaymentEvidence(file: File): Promise<string> {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) throw new Error("You need to be signed in to attach a receipt.");

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${me.user.id}/receipt-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw error;
    return path;
}

/**
 * A short-lived URL for a reviewer to open the receipt.
 *
 * Signing runs under the caller's own permissions, so RLS decides: the
 * applicant, an admin, or the instructor of the course applied for.
 */
export async function signPaymentEvidence(path: string): Promise<string> {
    const { data, error } = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(path, 5 * 60);
    if (error) throw error;
    return data.signedUrl;
}

const SELECT =
    "id, course_id, student_id, status, phone, employer, experience, motivation, " +
    "payment_evidence_path, submitted_at, reviewed_at, review_note, " +
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
    payment_evidence_path: string;
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
    paymentEvidencePath: r.payment_evidence_path,
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
        p_evidence: input.paymentEvidencePath,
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
