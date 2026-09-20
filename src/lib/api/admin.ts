import { supabase } from "@/lib/supabase";
import type { Enums } from "@/types/database";

/**
 * Admin reads.
 *
 * Every one of these is gated by an `is_admin()` policy, so a non-admin gets an
 * empty result rather than an error — the pages render their empty state.
 */

export interface AdminUserRow {
    id: string;
    name: string;
    email: string;
    role: Enums<"user_role">;
    status: Enums<"user_status">;
    enrolledCourses: number;
    joinDate: string;
    avatarUrl?: string;
}

export async function fetchUsers(): Promise<AdminUserRow[]> {
    const [{ data: profiles, error }, { data: enrollments }] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, name, email, role, status, avatar_url, created_at")
            .order("created_at", { ascending: false }),
        supabase.from("enrollments").select("student_id").in("status", ["active", "completed"]),
    ]);
    if (error) throw error;

    const counts = new Map<string, number>();
    for (const e of enrollments ?? []) {
        counts.set(e.student_id, (counts.get(e.student_id) ?? 0) + 1);
    }

    return (profiles ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        status: p.status,
        enrolledCourses: counts.get(p.id) ?? 0,
        joinDate: new Date(p.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
        avatarUrl: p.avatar_url ?? undefined,
    }));
}

export async function setUserRole(id: string, role: Enums<"user_role">) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) throw error;
}

export async function setUserStatus(id: string, status: Enums<"user_status">) {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) throw error;
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

export interface WaitlistRow {
    id: string;
    studentName: string;
    courseTitle: string;
    requestDate: string;
    position: number;
}

export async function fetchWaitlist(): Promise<WaitlistRow[]> {
    const { data, error } = await supabase
        .from("waitlist_entries")
        .select(
            "id, position, requested_at, student:profiles!waitlist_entries_student_id_fkey ( name ), course:courses ( title )"
        )
        .eq("status", "waiting")
        .order("position");
    if (error) throw error;

    return ((data ?? []) as unknown as {
        id: string;
        position: number;
        requested_at: string;
        student: { name: string } | null;
        course: { title: string } | null;
    }[]).map((w) => ({
        id: w.id,
        studentName: w.student?.name ?? "Unknown",
        courseTitle: w.course?.title ?? "Unknown course",
        requestDate: new Date(w.requested_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
        position: w.position,
    }));
}

/** Consumes a seat, resequences the queue and issues a pass — all server-side. */
export async function promoteFromWaitlist(entryId: string) {
    const { error } = await supabase.rpc("promote_from_waitlist", { p_entry_id: entryId });
    if (error) throw error;
}

export async function removeFromWaitlist(entryId: string) {
    const { error } = await supabase.from("waitlist_entries").delete().eq("id", entryId);
    if (error) throw error;
}

// ─── System ──────────────────────────────────────────────────────────────────

export interface AuditRow {
    id: string;
    action: string;
    performedBy: string;
    role: Enums<"user_role"> | null;
    target: string;
    details: string;
    timestamp: string;
}

export async function fetchAuditLog(): Promise<AuditRow[]> {
    const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, actor_name, actor_role, target, details, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
    if (error) throw error;
    return (data ?? []).map((a) => ({
        id: a.id,
        action: a.action,
        performedBy: a.actor_name,
        role: a.actor_role,
        target: a.target,
        details: a.details,
        timestamp: new Date(a.created_at).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
    }));
}

export interface SyncLogRow {
    id: string;
    instructorName: string;
    deviceId: string;
    recordCount: number;
    status: Enums<"sync_status">;
    timestamp: string;
}

export async function fetchSyncLogs(): Promise<SyncLogRow[]> {
    const { data, error } = await supabase
        .from("device_sync_logs")
        .select(
            "id, device_id, record_count, status, synced_at, instructor:profiles!device_sync_logs_instructor_id_fkey ( name )"
        )
        .order("synced_at", { ascending: false })
        .limit(50);
    if (error) throw error;

    return ((data ?? []) as unknown as {
        id: string;
        device_id: string;
        record_count: number;
        status: Enums<"sync_status">;
        synced_at: string;
        instructor: { name: string } | null;
    }[]).map((l) => ({
        id: l.id,
        instructorName: l.instructor?.name ?? "Unknown",
        deviceId: l.device_id,
        recordCount: l.record_count,
        status: l.status,
        timestamp: new Date(l.synced_at).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }),
    }));
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface TransactionRow {
    id: string;
    reference: string;
    studentName: string;
    courseTitle: string;
    /** Minor units (kobo). */
    amount: number;
    method: Enums<"payment_method">;
    status: Enums<"payment_status">;
    date: string;
}

export async function fetchTransactions(): Promise<TransactionRow[]> {
    const { data, error } = await supabase
        .from("payments")
        .select(
            "id, reference, amount, method, status, created_at, student:profiles!payments_student_id_fkey ( name ), course:courses ( title )"
        )
        .order("created_at", { ascending: false })
        .limit(100);
    if (error) throw error;

    return ((data ?? []) as unknown as {
        id: string;
        reference: string;
        amount: number;
        method: Enums<"payment_method">;
        status: Enums<"payment_status">;
        created_at: string;
        student: { name: string } | null;
        course: { title: string } | null;
    }[]).map((t) => ({
        id: t.id,
        reference: t.reference,
        studentName: t.student?.name ?? "Unknown",
        courseTitle: t.course?.title ?? "—",
        amount: t.amount,
        method: t.method,
        status: t.status,
        date: new Date(t.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
    }));
}
