import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ArrowRight01Icon,
    ChartLineData01Icon,
    Coins01Icon,
    Invoice01Icon,
    UserMultiple02Icon,
} from "hugeicons-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatGrid, StatTile } from "@/components/shared/StatTile";
import { ChartCard } from "@/components/shared/ChartCard";
import { StatusBadge, toneForStatus } from "@/components/shared/StatusBadge";
import { RowActions } from "@/components/shared/RowActions";
import { useRowMenu } from "@/components/shared/use-row-menu";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import { RetentionHeatGrid } from "@/components/admin/RetentionHeatGrid";
import { DonutChart } from "@/components/admin/DonutChart";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { ChartLegend } from "@/components/shared/ChartLegend";
import {
    SankeyChart,
    SankeyLink,
    SankeyNode,
    SankeyTooltip,
} from "@/components/charts/sankey";
import { RadarChart } from "@/components/charts/radar-chart";
import { RadarArea } from "@/components/charts/radar-area";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarLabels } from "@/components/charts/radar-labels";

import { useQuery } from "@tanstack/react-query";
import * as analyticsApi from "@/lib/api/analytics";
import * as adminApi from "@/lib/api/admin";
import { formatCompactNaira, formatNairaAmount as formatNaira, toNaira } from "@/lib/money";
import { COURSE_HEALTH_METRICS as courseHealthMetrics } from "@/lib/api/analytics";
import { ORDINAL, SERIES, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_STYLE } from "@/lib/chart-palette";
import { toast } from "sonner";

/**
 * Global analytics — a bento of the whole system: money in, learner flow,
 * course health, retention and assessment throughput.
 *
 * Colour follows the shared roles: categorical slots for series identity, the
 * ordinal ramp for funnel stages, the sequential ramp for retention magnitude.
 */
export default function AdminAnalytics() {
    const [funnelHover, setFunnelHover] = useState<number | null>(null);
    const rowMenu = useRowMenu();

    // Each panel is aggregated in Postgres; the client only renders the summary.
    const STALE = 60_000;
    const { data: overview = { revenue: 0, activeLearners: 0, passRate: 0, retention: 0 } } = useQuery({
        queryKey: ["an-overview"], queryFn: analyticsApi.fetchOverview, staleTime: STALE,
    });
    const { data: revenueRows = [] } = useQuery({
        queryKey: ["an-revenue"], queryFn: () => analyticsApi.fetchRevenue(6), staleTime: STALE,
    });
    const { data: funnel = [] } = useQuery({
        queryKey: ["an-funnel"], queryFn: analyticsApi.fetchFunnel, staleTime: STALE,
    });
    const { data: paymentMethods = [] } = useQuery({
        queryKey: ["an-mix"], queryFn: analyticsApi.fetchPaymentMix, staleTime: STALE,
    });
    const { data: topCourses = [] } = useQuery({
        queryKey: ["an-top"], queryFn: () => analyticsApi.fetchTopCourses(5), staleTime: STALE,
    });
    const { data: health = [] } = useQuery({
        queryKey: ["an-health"], queryFn: analyticsApi.fetchCourseHealth, staleTime: STALE,
    });
    const { data: retention = [] } = useQuery({
        queryKey: ["an-retention"], queryFn: analyticsApi.fetchRetention, staleTime: STALE,
    });
    const { data: learnerJourney = { nodes: [], links: [] } } = useQuery({
        queryKey: ["an-journey"], queryFn: analyticsApi.fetchJourney, staleTime: STALE,
    });
    const { data: assessmentThroughput = [] } = useQuery({
        queryKey: ["an-throughput"], queryFn: () => analyticsApi.fetchThroughput(8), staleTime: STALE,
    });
    const { data: txRows = [] } = useQuery({
        queryKey: ["an-transactions"], queryFn: adminApi.fetchTransactions, staleTime: STALE,
    });

    const revenueByMonth = revenueRows.map((r) => ({
        month: r.month,
        tuition: r.tuition,
        applications: r.applicationFees,
    }));
    const transactions = txRows.map((t) => ({ ...t, amount: toNaira(t.amount) }));

    const txPage = usePagination(transactions, 5);

    const funnelData = funnel.map((stage, i) => ({
        label: stage.stage,
        value: stage.value,
        color: ORDINAL[i % ORDINAL.length],
    }));

    const funnelLegend = funnel.map((stage, i) => ({
        label: stage.stage,
        color: ORDINAL[i % ORDINAL.length],
    }));

    /** The radar expects normalised 0–100 values keyed by metric. */
    const courseHealth = health.slice(0, 5).map((h, i) => ({
        label: h.category,
        color: SERIES[i % SERIES.length],
        values: {
            completion: h.completion,
            attendance: h.attendance,
            passRate: h.passRate,
            retention: h.retention,
            satisfaction: h.seatsFilled,
            punctuality: h.attendance,
        },
    }));

    const cohortRetention = retention.map((r) => ({
        cohort: r.cohort,
        size: r.size,
        weeks: r.weeks.map((w) => w ?? 0),
    }));


    const totalRevenue = overview.revenue;
    const paymentTotal = paymentMethods.reduce((s, p) => s + p.amount, 0);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Global Analytics"
                actions={
                    <Link to="/admin/assessments">
                        <Button
                            variant="outline"
                            className="h-11 px-5 rounded-full border-slate-200 text-slate-600 font-medium"
                        >
                            Manage assessments
                            <ArrowRight01Icon size={16} className="ml-1.5" />
                        </Button>
                    </Link>
                }
            />

            {/* ─── Headline tiles ─── */}
            <div className="px-1 sm:px-2">
                <StatGrid>
                <StatTile
                    label="Total Revenue"
                    value="₦11.4M"
                    delta={24}
                    hint="February, all courses"
                    icon={Coins01Icon}
                />
                <StatTile
                    label="Active Learners"
                    value="1,247"
                    delta={12}
                    hint="Enrolled and not withdrawn"
                    icon={UserMultiple02Icon}
                />
                <StatTile
                    label="Avg. Pass Rate"
                    value="78%"
                    delta={3}
                    hint="Across published assessments"
                    icon={ChartLineData01Icon}
                />
                <StatTile
                    label="Course Retention"
                    value="72%"
                    delta={-4}
                    hint="Week 5, rolling cohorts"
                    icon={Invoice01Icon}
                />
                </StatGrid>
            </div>

            {/* ─── Bento ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 px-1 sm:px-2">
                {/* Revenue — two measures, same unit, stacked */}
                <ChartCard
                    title="Revenue collected"
                    description="Tuition and application fees, last six months"
                    className="lg:col-span-4"
                    action={
                        <span className="text-sm font-medium text-slate-900 tabular-nums">
                            {formatCompactNaira(totalRevenue)}
                        </span>
                    }
                    footer={
                        <ChartLegend
                            items={[
                                { label: "Tuition", color: SERIES[0] },
                                { label: "Application fees", color: SERIES[1] },
                            ]}
                        />
                    }
                >
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueByMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revTuition" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.28} />
                                        <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="revApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={SERIES[1]} stopOpacity={0.28} />
                                        <stop offset="100%" stopColor={SERIES[1]} stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--chart-label)", fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--chart-label)", fontSize: 11 }}
                                    tickFormatter={(v) => `${v / 1_000_000}M`}
                                />
                                <RechartsTooltip
                                    cursor={{ stroke: "var(--chart-crosshair)", strokeWidth: 1 }}
                                    contentStyle={TOOLTIP_STYLE}
                                    labelStyle={TOOLTIP_LABEL_STYLE}
                                    itemStyle={TOOLTIP_ITEM_STYLE}
                                    formatter={(value: number, name: string) => [formatNaira(value), name]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tuition"
                                    name="Tuition"
                                    stackId="1"
                                    stroke={SERIES[0]}
                                    strokeWidth={2}
                                    fill="url(#revTuition)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    name="Application fees"
                                    stackId="1"
                                    stroke={SERIES[1]}
                                    strokeWidth={2}
                                    fill="url(#revApps)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Enrollment funnel — ordinal stages */}
                <ChartCard
                    title="Enrollment funnel"
                    description="Prospectus view through to certification"
                    className="lg:col-span-2"
                    footer={
                        <ChartLegend
                            items={funnelLegend}
                            hoveredIndex={funnelHover}
                            onHoverChange={setFunnelHover}
                        />
                    }
                >
                    <div className="h-[260px] w-full flex items-center justify-center">
                        <FunnelChart
                            data={funnelData}
                            color={ORDINAL[2]}
                            layers={3}
                            hoveredIndex={funnelHover}
                            onHoverChange={setFunnelHover}
                            showLabels={false}
                            className="w-full h-full"
                        />
                    </div>
                </ChartCard>

                {/* Learner journey — full width flow */}
                <ChartCard
                    title="Learner journey"
                    description="How applicants move from first contact to outcome"
                    className="lg:col-span-6"
                    flush
                >
                    {/* The flow needs real vertical room: with 10 nodes a short
                      * container collapses every band into one solid block. The
                      * left/right gutters hold the end labels clear of the edge. */}
                    <div className="h-[660px] w-full px-5 pb-4">
                        <SankeyChart
                            data={learnerJourney}
                            margin={{ top: 24, right: 136, bottom: 24, left: 124 }}
                            nodeWidth={12}
                            nodePadding={20}
                        >
                            <SankeyLink />
                            <SankeyNode lineCap={4} />
                            <SankeyTooltip />
                        </SankeyChart>
                    </div>
                </ChartCard>

                {/* Course health radar */}
                <ChartCard
                    title="Course health"
                    description="Normalised 0–100 across six measures"
                    className="lg:col-span-2"
                    footer={
                        <ChartLegend
                            items={courseHealth.map((c, i) => ({
                                label: c.label,
                                value: Math.round(
                                    Object.values(c.values).reduce((s, v) => s + v, 0) /
                                    Object.values(c.values).length
                                ),
                                color: c.color ?? SERIES[i],
                            }))}
                        />
                    }
                >
                    <div className="h-[280px] w-full flex items-center justify-center">
                        <RadarChart data={courseHealth} metrics={courseHealthMetrics} size={250}>
                            <RadarGrid />
                            <RadarAxis />
                            <RadarLabels />
                            {courseHealth.map((item, index) => (
                                <RadarArea index={index} key={item.label} />
                            ))}
                        </RadarChart>
                    </div>
                </ChartCard>

                {/* Cohort retention */}
                <ChartCard
                    title="Cohort retention"
                    description="Share of each intake still active, by week"
                    className="lg:col-span-4"
                >
                    <div className="py-2">
                        <RetentionHeatGrid cohorts={cohortRetention} />
                    </div>
                </ChartCard>

                {/* Assessment throughput */}
                <ChartCard
                    title="Assessment throughput"
                    description="Attempts and passes per week"
                    className="lg:col-span-4"
                    footer={
                        <ChartLegend
                            items={[
                                { label: "Attempts", color: SERIES[0] },
                                { label: "Passes", color: SERIES[2] },
                            ]}
                        />
                    }
                >
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={assessmentThroughput} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="thAttempts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.22} />
                                        <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="thPasses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={SERIES[2]} stopOpacity={0.22} />
                                        <stop offset="100%" stopColor={SERIES[2]} stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                <XAxis
                                    dataKey="week"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--chart-label)", fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--chart-label)", fontSize: 11 }}
                                />
                                <RechartsTooltip
                                    cursor={{ stroke: "var(--chart-crosshair)", strokeWidth: 1 }}
                                    contentStyle={TOOLTIP_STYLE}
                                    labelStyle={TOOLTIP_LABEL_STYLE}
                                    itemStyle={TOOLTIP_ITEM_STYLE}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attempts"
                                    name="Attempts"
                                    stroke={SERIES[0]}
                                    strokeWidth={2}
                                    fill="url(#thAttempts)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="passes"
                                    name="Passes"
                                    stroke={SERIES[2]}
                                    strokeWidth={2}
                                    fill="url(#thPasses)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Payment mix — share of total, as a donut */}
                <ChartCard
                    title="Payment mix"
                    description="How learners paid this month"
                    className="lg:col-span-2"
                >
                    <div className="pb-4">
                        <DonutChart
                            data={paymentMethods.map((m) => ({ label: m.method, value: m.amount }))}
                            centerValue={formatCompactNaira(paymentTotal)}
                            centerLabel="Collected"
                            formatValue={formatCompactNaira}
                        />
                    </div>
                </ChartCard>

                {/* Top courses */}
                <ChartCard
                    title="Top courses by revenue"
                    description="This term"
                    className="lg:col-span-2"
                >
                    <div className="py-2 space-y-1">
                        {[...topCourses]
                            .sort((a, b) => b.revenue - a.revenue)
                            .map((c, i) => (
                                <div
                                    key={c.course}
                                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0"
                                >
                                    <span className="h-6 w-6 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-medium flex items-center justify-center shrink-0">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-slate-800 truncate">{c.course}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {c.enrolled} enrolled · {c.passRate}% pass
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium text-slate-900 tabular-nums shrink-0">
                                        {formatCompactNaira(c.revenue)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </ChartCard>

                {/* Transactions */}
                <ChartCard
                    title="Recent transactions"
                    description="Latest payments across all courses"
                    className="lg:col-span-4"
                    flush
                >
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest pl-5">Reference</TableHead>
                                    <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Learner</TableHead>
                                    <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Amount</TableHead>
                                    <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right pr-5">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {txPage.pageRows.map((tx) => (
                                    <TableRow
                                        key={tx.id}
                                        onClick={rowMenu.rowClick(tx.id)}
                                        className="border-slate-50 hover:bg-slate-50/50 cursor-pointer"
                                    >
                                        <TableCell className="pl-5">
                                            <span className="text-xs font-medium text-slate-800 tabular-nums">
                                                {tx.reference}
                                            </span>
                                            <p className="text-[10px] text-slate-400">{tx.date}</p>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-medium text-slate-700">{tx.studentName}</span>
                                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                                {tx.courseTitle}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-900 tabular-nums whitespace-nowrap">
                                            {formatNaira(tx.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge tone={toneForStatus(tx.status)}>{tx.status}</StatusBadge>
                                        </TableCell>
                                        <TableCell className="text-right pr-5">
                                            <RowActions
                                                {...rowMenu.menu(tx.id)}
                                                label={`Actions for ${tx.reference}`}
                                                actions={[
                                                    {
                                                        label: "View receipt",
                                                        icon: Invoice01Icon,
                                                        onSelect: () =>
                                                            toast.success(`Receipt ${tx.reference}`, {
                                                                description: `${tx.studentName} · ${formatNaira(tx.amount)} · ${tx.method}`,
                                                            }),
                                                    },
                                                    {
                                                        label: "Retry settlement",
                                                        icon: ArrowRight01Icon,
                                                        disabled: tx.status !== "failed",
                                                        onSelect: () =>
                                                            toast.success("Settlement retried", {
                                                                description: `${tx.reference} re-queued with the payment provider.`,
                                                            }),
                                                    },
                                                    {
                                                        label: "Refund payment",
                                                        icon: Coins01Icon,
                                                        destructive: true,
                                                        separatorBefore: true,
                                                        disabled: tx.status !== "settled",
                                                        onSelect: () =>
                                                            toast.success("Refund initiated", {
                                                                description: `${formatNaira(tx.amount)} will return to ${tx.studentName}.`,
                                                            }),
                                                        confirm: {
                                                            title: "Refund this payment?",
                                                            description: `${formatNaira(tx.amount)} will be returned to ${tx.studentName} for ${tx.courseTitle}.`,
                                                            actionLabel: "Refund",
                                                        },
                                                    },
                                                ]}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <TablePagination
                        page={txPage.page}
                        pageCount={txPage.pageCount}
                        onPageChange={txPage.setPage}
                        from={txPage.from}
                        to={txPage.to}
                        total={txPage.total}
                        label="transactions"
                    />
                </ChartCard>
            </div>
        </div>
    );
}
