import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/data/certificates";

/** Learner-scoped reads: certificates, progress, dashboard headline numbers. */

export async function fetchMyCertificates(): Promise<Certificate[]> {
    const { data, error } = await supabase
        .from("certificates")
        .select("id, credential_id, issued_at, storage_path, course:courses ( title )")
        .is("revoked_at", null)
        .order("issued_at", { ascending: false });
    if (error) throw error;

    return ((data ?? []) as unknown as {
        id: string;
        credential_id: string;
        issued_at: string;
        storage_path: string | null;
        course: { title: string } | null;
    }[]).map((c) => ({
        id: c.id,
        courseTitle: c.course?.title ?? "Unknown course",
        issueDate: new Date(c.issued_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
        credentialId: c.credential_id,
        // No generated artwork yet, so the viewer falls back to its template.
        imageUrl: c.storage_path ?? "",
    }));
}

export interface EnrollmentProgress {
    courseId: string;
    courseTitle: string;
    status: string;
    progress: number;
    lastItemId: string | null;
    /** Module holding `lastItemId`, for a resume link. */
    lastModuleId: string | null;
    lastItemTitle: string | null;
}

/** Drives "continue learning" — progress and where the learner left off. */
export async function fetchMyProgress(): Promise<EnrollmentProgress[]> {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return [];

    const { data, error } = await supabase
        .from("enrollments")
        .select(
            "course_id, status, progress, last_item_id, course:courses ( title ), item:module_items ( id, title, module_id )"
        )
        .eq("student_id", me.user.id)
        .in("status", ["active", "completed"])
        .order("progress", { ascending: false });
    if (error) throw error;

    return ((data ?? []) as unknown as {
        course_id: string;
        status: string;
        progress: number;
        last_item_id: string | null;
        course: { title: string } | null;
        item: { id: string; title: string; module_id: string } | null;
    }[]).map((e) => ({
        courseId: e.course_id,
        courseTitle: e.course?.title ?? "Unknown course",
        status: e.status,
        progress: e.progress,
        lastItemId: e.last_item_id,
        lastModuleId: e.item?.module_id ?? null,
        lastItemTitle: e.item?.title ?? null,
    }));
}

export interface LearnerStats {
    activeEnrollments: number;
    completedCourses: number;
    certificates: number;
    /** Next on-site class, or null. */
    nextClass: { title: string; date: string } | null;
}

export async function fetchLearnerStats(): Promise<LearnerStats> {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) {
        return { activeEnrollments: 0, completedCourses: 0, certificates: 0, nextClass: null };
    }

    const today = new Date().toISOString().slice(0, 10);
    const [enrollments, certs, sessions] = await Promise.all([
        supabase.from("enrollments").select("status").eq("student_id", me.user.id),
        supabase.from("certificates").select("id", { count: "exact", head: true }).is("revoked_at", null),
        supabase
            .from("course_sessions")
            .select("title, session_date")
            .gte("session_date", today)
            .order("session_date")
            .limit(1),
    ]);

    const rows = enrollments.data ?? [];
    const next = sessions.data?.[0];

    return {
        activeEnrollments: rows.filter((e) => e.status === "active").length,
        completedCourses: rows.filter((e) => e.status === "completed").length,
        certificates: certs.count ?? 0,
        nextClass: next
            ? {
                title: next.title,
                date: new Date(next.session_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                }),
            }
            : null,
    };
}
