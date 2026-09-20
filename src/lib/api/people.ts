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
