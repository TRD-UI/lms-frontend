import { useQuery } from "@tanstack/react-query";
import {
    BookOpen01Icon,
    Mortarboard01Icon,
    Certificate01Icon,
    Calendar03Icon,
} from "hugeicons-react";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { fetchLearnerStats } from "@/lib/api/learner";

/**
 * The learner's four headline numbers.
 *
 * A 2×2 grid on a phone rather than a carousel: all four are visible at once,
 * nothing auto-advances out from under a reading finger, and it matches how the
 * instructor and admin portals present the same tiles.
 */
export function StatsGrid() {
    const { data } = useQuery({
        queryKey: ["learner-stats"],
        queryFn: fetchLearnerStats,
        staleTime: 60_000,
    });

    const stats = [
        { title: "Current Enrollments", value: String(data?.activeEnrollments ?? 0), icon: BookOpen01Icon },
        { title: "Completed Courses", value: String(data?.completedCourses ?? 0), icon: Mortarboard01Icon },
        { title: "Certificates Earned", value: String(data?.certificates ?? 0), icon: Certificate01Icon },
        { title: "Next Class", value: data?.nextClass ? data.nextClass.date : "—", icon: Calendar03Icon },
    ];

    return (
        <StatGrid>
            {stats.map((stat) => (
                <StatTile key={stat.title} label={stat.title} value={stat.value} icon={stat.icon} />
            ))}
        </StatGrid>
    );
}
