import { useQuery } from "@tanstack/react-query";
import { ComputerVideoIcon, SquareLock02Icon } from "hugeicons-react";
import { fetchMeetingLink } from "@/lib/api/classes";
import { formatSessionDate } from "@/data/classes";

/**
 * The join control for an online class.
 *
 * The URL is not readable from the sessions list — the column is not granted
 * to the client — so this asks for it, and the server only answers on the day.
 * Before then all that comes back is the date it opens.
 */
export function JoinClassLink({ sessionId }: { sessionId: string }) {
    const { data } = useQuery({
        queryKey: ["meeting-link", sessionId],
        queryFn: () => fetchMeetingLink(sessionId),
        // Short, because a class becomes joinable partway through a session
        // someone left open overnight.
        staleTime: 60_000,
    });

    if (!data?.virtual) return null;

    // `strict` is off in this project, so a boolean discriminant does not
    // narrow a union — checking for the field itself does.
    if (!("url" in data)) {
        return (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <SquareLock02Icon size={11} />
                {data.reason === "not_yet"
                    ? `Opens ${formatSessionDate(data.availableOn)}`
                    : "Ended"}
            </span>
        );
    }

    return (
        <a
            href={data.url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary text-white text-[11px] font-medium hover:bg-primary/90 transition-colors"
        >
            <ComputerVideoIcon size={12} />
            Join
        </a>
    );
}
