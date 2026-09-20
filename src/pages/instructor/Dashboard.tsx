import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight01Icon,
    BookOpen01Icon,
    Calendar03Icon,
    CheckmarkCircle01Icon,
    Location01Icon,
    QrCode01Icon,
    Task01Icon,
    UserMultiple02Icon,
} from "hugeicons-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageActions } from "@/components/shared/PageActions";
import { ScheduleDialog } from "@/components/classes/ScheduleDialog";
import { MiniDonut } from "@/components/shared/MiniDonut";
import { PieChart, PieSlice, PieCenter } from "@/components/charts/pie";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChartLegend } from "@/components/shared/ChartLegend";
import { RadarChart } from "@/components/charts/radar-chart";
import { RadarArea } from "@/components/charts/radar-area";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarLabels } from "@/components/charts/radar-labels";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { useQuery } from "@tanstack/react-query";
import { fetchCohorts } from "@/lib/api/attendance";
import { SERIES, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_STYLE } from "@/lib/chart-palette";

/**
 * Instructor home.
 *
 * Everything here is scoped to the signed-in instructor: their courses, the
 * learners enrolled on them, their assessments and their session attendance.
 */
export default function InstructorDashboard() {
    const navigate = useNavigate();
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
    const instructor = useActingUser("instructor");

    const { data: instructorCohorts = [] } = useQuery({
        queryKey: ["cohorts", instructor.id],
        queryFn: () => fetchCohorts(instructor.id),
        staleTime: 30_000,
    });
    const { coursesByInstructor, assessmentsForCourse, attemptsForAssessment } = useLms();

    const myCourses = coursesByInstructor(instructor.id);

    const stats = useMemo(() => {
        const courseIds = new Set(myCourses.map((c) => c.id));
        const myAssessments = myCourses.flatMap((c) => assessmentsForCourse(c.id));
        const myAttempts = myAssessments.flatMap((a) => attemptsForAssessment(a.id));
        const myCohorts = instructorCohorts;

        const totalStudents = myCourses.reduce((s, c) => s + c.seats.enrolled, 0);
        const totalSeats = myCourses.reduce((s, c) => s + c.seats.total, 0);
        const present = myCohorts.reduce((s, c) => s + c.presentCount, 0);
        const cohortTotal = myCohorts.reduce((s, c) => s + c.totalStudents, 0);

        return {
            courseIds,
            courses: myCourses.length,
            published: myCourses.filter((c) => (c.status ?? "published") === "published").length,
            totalStudents,
            fillRate: totalSeats === 0 ? 0 : Math.round((totalStudents / totalSeats) * 100),
            assessments: myAssessments.length,
            drafts: myAssessments.filter((a) => a.status === "draft").length,
            attendanceRate: cohortTotal === 0 ? 0 : Math.round((present / cohortTotal) * 100),
            passRate:
                myAttempts.length > 0
                    ? Math.round((myAttempts.filter((a) => a.passed).length / myAttempts.length) * 100)
                    : null,
            sessions: myCohorts.length,
        };
        // instructorCohorts feeds the attendance rate and session count — it was
        // missing here, so both went stale until an unrelated dependency changed.
    }, [myCourses, assessmentsForCourse, attemptsForAssessment, instructorCohorts]);

    /** Enrollment per course — nominal categories, so a single hue. */
    const enrollmentData = myCourses.map((c) => ({
        course: c.title.length > 18 ? `${c.title.slice(0, 17)}…` : c.title,
        fullTitle: c.title,
        enrolled: c.seats.enrolled,
        capacity: c.seats.total,
    }));

    /** Enrollment share per course — categorical, so slots are assigned in order. */
    const pieData = useMemo(
        () =>
            myCourses
                .filter((c) => c.seats.enrolled > 0)
                .map((c) => ({ label: c.title, value: c.seats.enrolled })),
        [myCourses]
    );

    const attendanceData = instructorCohorts.map((c) => ({
        session: c.courseTitle.length > 16 ? `${c.courseTitle.slice(0, 15)}…` : c.courseTitle,
        fullTitle: c.courseTitle,
        present: c.presentCount,
        absent: c.absentCount,
    }));

    /** Per-course teaching health, normalised 0–100 for the radar. */
    const radarData = useMemo(
        () =>
            myCourses.slice(0, 3).map((c, i) => {
                const list = assessmentsForCourse(c.id);
                const attempts = list.flatMap((a) => attemptsForAssessment(a.id));
                const fill = c.seats.total === 0 ? 0 : (c.seats.enrolled / c.seats.total) * 100;
                const passRate =
                    attempts.length > 0
                        ? (attempts.filter((a) => a.passed).length / attempts.length) * 100
                        : 60;
                return {
                    label: c.title,
                    color: SERIES[i],
                    values: {
                        fill: Math.round(fill),
                        content: Math.min(100, c.modules.length * 33),
                        assessments: Math.min(100, list.length * 33),
                        published: list.length === 0 ? 0 : Math.round((list.filter((a) => a.status === "published").length / list.length) * 100),
                        engagement: Math.round(c.progress ?? 45),
                        passRate: Math.round(passRate),
                    },
                };
            }),
        [myCourses, assessmentsForCourse, attemptsForAssessment]
    );

    const radarMetrics = [
        { key: "fill", label: "Seats filled" },
        { key: "content", label: "Content depth" },
        { key: "assessments", label: "Assessments" },
        { key: "published", label: "Published" },
        { key: "engagement", label: "Engagement" },
        { key: "passRate", label: "Pass rate" },
    ];

    const nextSession = instructorCohorts[0];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title={`Welcome back, ${instructor.name.split(" ").slice(-1)[0]}`}
                description="Your courses, learners and upcoming sessions at a glance."
                actions={
                    <PageActions
                        mergedLabel="Actions"
                        actions={[
                            { label: "Schedule a class", icon: Calendar03Icon, onSelect: () => setScheduleOpen(true) },
                            { label: "Scan passes", icon: QrCode01Icon, onSelect: () => navigate("/instructor/scanner") },
                            { label: "My courses", icon: BookOpen01Icon, onSelect: () => navigate("/instructor/courses") },
                        ]}
                    />
                }
            />

            {/* Tiles */}
            <div className="px-1 sm:px-2">
                <StatGrid>
                <StatTile
                    label="Courses teaching"
                    value={String(stats.courses)}
                    hint={`${stats.published} published`}
                    icon={BookOpen01Icon}
                />
                <StatTile
                    label="Learners"
                    value={stats.totalStudents.toLocaleString()}
                    hint={`${stats.fillRate}% of capacity filled`}
                    icon={UserMultiple02Icon}
                />
                <StatTile
                    label="Assessments"
                    value={String(stats.assessments)}
                    hint={stats.drafts > 0 ? `${stats.drafts} still in draft` : "All published"}
                    icon={Task01Icon}
                />
                <StatTile
                    label="Attendance rate"
                    value={`${stats.attendanceRate}%`}
                    hint={`Across ${stats.sessions} recorded sessions`}
                    icon={CheckmarkCircle01Icon}
                />
                </StatGrid>
            </div>

            {myCourses.length === 0 ? (
                <EmptyState
                    icon={BookOpen01Icon}
                    title="No courses assigned yet"
                    description="Create your first course to start building modules and assessments."
                    action={
                        <Link to="/instructor/courses">
                            <Button className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/10">
                                Create a course
                            </Button>
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 px-1 sm:px-2">
                    {/* Enrollment per course */}
                    <ChartCard
                        title="Enrollment by course"
                        description="Share of your learners, by course"
                        className="lg:col-span-4"
                    >
                        <div className="flex items-center justify-center py-4">
                            <PieChart
                                data={pieData}
                                hoveredIndex={hoveredSlice}
                                // increased the size and reduced the thickness
                                innerRadius={95}
                                onHoverChange={setHoveredSlice}
                                size={240}
                            >
                                {pieData.map((_, i) => (
                                    <PieSlice index={i} key={i} />
                                ))}
                                <PieCenter defaultLabel="Learners enrolled" />
                            </PieChart>
                        </div>
                    </ChartCard>

                    {/* Next session */}
                    <ChartCard
                        title="Next session"
                        description="Your most recent cohort"
                        className="lg:col-span-2"
                    >
                        {nextSession ? (
                            <div className="py-2 space-y-5">
                                {/* The attendance ring carries the headline number,
                                    so the badges below it can go. */}
                                <div className="flex items-center gap-4">
                                    <MiniDonut
                                        value={
                                            nextSession.totalStudents === 0
                                                ? 0
                                                : (nextSession.presentCount / nextSession.totalStudents) * 100
                                        }
                                        // Increase donut size and decrease stroke for thinner ring
                                        size={88}
                                        stroke={5}
                                        label="attendance"
                                    />
                                    <div className="min-w-0 space-y-0.5">
                                        <h4 className="text-sm font-medium text-slate-900 leading-snug truncate">
                                            {nextSession.courseTitle}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            {nextSession.presentCount} of {nextSession.totalStudents} present
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-[11px] text-slate-400 font-medium">
                                    <p className="flex items-center gap-1.5">
                                        <Calendar03Icon size={12} className="shrink-0" />
                                        {nextSession.sessionDate} · {nextSession.sessionTime}
                                    </p>
                                    <p className="flex items-center gap-1.5 truncate">
                                        <Location01Icon size={12} className="shrink-0" />
                                        {nextSession.venue}
                                    </p>
                                </div>

                                <Link to="/instructor/attendance">
                                    <Button
                                        variant="ghost"
                                        className="w-full h-10 rounded-xl text-primary hover:bg-primary/5 font-medium text-sm justify-between px-3"
                                    >
                                        Manage attendance
                                        <ArrowRight01Icon size={16} />
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 py-8 text-center">No sessions recorded.</p>
                        )}
                    </ChartCard>

                    {/* Attendance by session */}
                    <ChartCard
                        title="Attendance by session"
                        description="Present and absent per cohort"
                        className="lg:col-span-3"
                        footer={
                            <ChartLegend
                            items={[
                                    { label: "Present", color: SERIES[0] },
                                    { label: "Absent", color: SERIES[1] },
                                ]}
                        />
                        }
                    >
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                    <XAxis
                                        dataKey="session"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "var(--chart-label)", fontSize: 10 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "var(--chart-label)", fontSize: 11 }}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: "var(--chart-grid)" }}
                                        contentStyle={TOOLTIP_STYLE}
                                        labelStyle={TOOLTIP_LABEL_STYLE}
                                        itemStyle={TOOLTIP_ITEM_STYLE}
                                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle ?? ""}
                                    />
                                    {/* 2px surface gap between stacked segments */}
                                    <Bar dataKey="present" name="Present" stackId="a" fill={SERIES[0]} barSize={28} />
                                    <Bar
                                        dataKey="absent"
                                        name="Absent"
                                        stackId="a"
                                        fill={SERIES[1]}
                                        barSize={28}
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    {/* Course readiness radar */}
                    <ChartCard
                        title="Course readiness"
                        description="How complete each course is, 0–100"
                        className="lg:col-span-3"
                        footer={
                            <ChartLegend
                            items={radarData.map((d) => ({
                                    label: d.label,
                                    value: Math.round(
                                        Object.values(d.values).reduce((s, v) => s + v, 0) /
                                        Object.values(d.values).length
                                    ),
                                    color: d.color,
                                }))}
                        />
                        }
                    >
                        <div className="h-[280px] w-full flex items-center justify-center">
                            <RadarChart data={radarData} metrics={radarMetrics} size={260}>
                                <RadarGrid />
                                <RadarAxis />
                                <RadarLabels />
                                {radarData.map((item, index) => (
                                    <RadarArea index={index} key={item.label} />
                                ))}
                            </RadarChart>
                        </div>
                    </ChartCard>
                </div>
            )}

            <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
        </div>
    );
}
