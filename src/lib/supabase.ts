import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Set when the bundle was built without Supabase credentials.
 *
 * This used to `throw` here. A throw at module scope aborts the import graph
 * before React ever mounts, so the page renders blank and the only clue is a
 * console line — the least diagnosable failure a deploy can have. main.tsx
 * reads this and renders a screen that says what is wrong instead.
 *
 * Vite inlines `VITE_*` at build time, so an empty value means the machine
 * that ran the build did not have them. Setting them on the host afterwards
 * changes nothing until it rebuilds.
 */
export const supabaseConfigError =
    !url || !anonKey
        ? "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY were not present when this build ran."
        : null;

// Placeholders keep createClient from throwing on its own URL validation. The
// app is never rendered in this state, so no request is ever made with them.
export const supabase = createClient<Database>(
    url || "https://placeholder.supabase.co",
    anonKey || "placeholder-anon-key",
    {
        auth: {
            // The reset-password link lands on /reset-password with the recovery
            // token in the URL hash; detectSessionInUrl is what exchanges it.
            detectSessionInUrl: true,
            persistSession: true,
            autoRefreshToken: true,
            flowType: "pkce",
        },
    }
);

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
