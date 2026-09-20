import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    throw new Error(
        "Missing Supabase configuration. Copy .env.example to .env.local and fill in " +
        "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your project's API settings."
    );
}

export const supabase = createClient<Database>(url, anonKey, {
    auth: {
        // The reset-password link lands on /reset-password with the recovery
        // token in the URL hash; detectSessionInUrl is what exchanges it.
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
    },
});

/**
 * Narrows a PostgREST error into something worth showing a user.
 *
 * The RPCs raise with SQLSTATE codes rather than prose the UI can trust, so the
 * few we surface deliberately get their own copy.
 */
export function describeError(error: { message?: string; code?: string } | null): string {
    if (!error) return "Something went wrong.";
    const message = error.message ?? "";
    if (message.includes("No attempts remaining")) return "You have used all your attempts on this assessment.";
    if (message.includes("Course is full")) return "This course is full. Join the waitlist to be notified of a seat.";
    if (message.includes("not enrolled")) return "You are not enrolled on this course.";
    if (message.includes("already submitted")) return "This attempt has already been submitted.";
    if (message.includes("Invalid login credentials")) return "That email and password do not match an account.";
    if (message.includes("Email not confirmed")) return "Confirm your email address before signing in.";
    return message || "Something went wrong.";
}
