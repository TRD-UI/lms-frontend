import { supabase } from "@/lib/supabase";
import type { Notification } from "@/data/notifications";

/**
 * Notifications.
 *
 * Rows are written server-side by triggers — a class being scheduled, an
 * assessment being published, a pass being issued, a payment settling — so the
 * client only reads and marks them.
 */

/** "3 hours ago", "Just now". Absolute dates read poorly in a feed. */
function relativeTime(iso: string): string {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export async function fetchNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, message, link, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
    if (error) throw error;

    return (data ?? []).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: relativeTime(n.created_at),
        isRead: n.is_read,
        link: n.link ?? undefined,
    }));
}

export async function markRead(id: string): Promise<void> {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) throw error;
}

export async function markAllRead(): Promise<void> {
    const { error } = await supabase.rpc("mark_all_notifications_read");
    if (error) throw error;
}
