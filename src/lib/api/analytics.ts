import { supabase } from "@/lib/supabase";
import { toNaira } from "@/lib/money";

/**
 * Radar axes for course health.
 *
 * Deliberately code, not a table: each key must match a column returned by
 * `analytics_course_health()`. Making these editable would let someone rename
 * an axis to something the query does not measure.
 */
export const COURSE_HEALTH_METRICS: { key: string; label: string }[] = [
    { key: "completion", label: "Completion" },
    { key: "attendance", label: "Attendance" },
    { key: "passRate", label: "Pass Rate" },
    { key: "satisfaction", label: "Seats Filled" },
    { key: "retention", label: "Retention" },
    { key: "punctuality", label: "Punctuality" },
];

/**
 * Admin analytics.
 *
 * Every figure is aggregated in Postgres — see the analytics_* functions — so
 * the client fetches summaries rather than pulling the ledger down and adding
 * it up. Each is admin-gated and returns empty for anyone else.
 *
 * Money crosses into naira here, as everywhere else at the API boundary.
 */

const call = async <T>(fn: string, args: Record<string, unknown> = {}): Promise<T> => {
    const { data, error } = await supabase.rpc(fn as never, args as never);
    if (error) throw error;
    return data as T;
};

export interface Overview {
    revenue: number;
    activeLearners: number;
    passRate: number;
    retention: number;
}

export async function fetchOverview(): Promise<Overview> {
    const raw = await call<{
        revenueKobo?: number;
        activeLearners?: number;
        passRate?: number;
        retention?: number;
    }>("analytics_overview");
    return {
        revenue: toNaira(raw?.revenueKobo ?? 0),
        activeLearners: raw?.activeLearners ?? 0,
        passRate: raw?.passRate ?? 0,
        retention: raw?.retention ?? 0,
    };
}

export interface RevenuePoint {
    month: string;
    tuition: number;
    applicationFees: number;
}

export async function fetchRevenue(months = 6): Promise<RevenuePoint[]> {
    const rows = await call<{ month: string; tuition: number; application_fee: number }[]>(
        "analytics_revenue",
        { p_months: months }
    );
    return (rows ?? []).map((r) => ({
        month: r.month,
        tuition: toNaira(r.tuition),
        applicationFees: toNaira(r.application_fee),
    }));
}

export interface FunnelStage {
    stage: string;
    value: number;
}

export async function fetchFunnel(): Promise<FunnelStage[]> {
    const rows = await call<{ stage: string; value: number }[]>("analytics_funnel");
    return (rows ?? []).map((r) => ({ stage: r.stage, value: Number(r.value) }));
}

export interface PaymentSlice {
    method: string;
    amount: number;
    share: number;
}

export async function fetchPaymentMix(): Promise<PaymentSlice[]> {
    const rows = await call<{ method: string; amount: number }[]>("analytics_payment_mix");
    const total = (rows ?? []).reduce((s, r) => s + Number(r.amount), 0);
    return (rows ?? []).map((r) => ({
        method: r.method.charAt(0).toUpperCase() + r.method.slice(1),
        amount: toNaira(r.amount),
        share: total === 0 ? 0 : Math.round((Number(r.amount) / total) * 100),
    }));
}

export interface TopCourse {
    course: string;
    revenue: number;
    enrolled: number;
    passRate: number;
}

export async function fetchTopCourses(limit = 5): Promise<TopCourse[]> {
    const rows = await call<
        { course: string; revenue: number; enrolled: number; pass_rate: number }[]
    >("analytics_top_courses", { p_limit: limit });
    return (rows ?? []).map((r) => ({
        course: r.course,
        revenue: toNaira(r.revenue),
        enrolled: Number(r.enrolled),
        passRate: r.pass_rate,
    }));
}

export interface CourseHealth {
    category: string;
    completion: number;
    attendance: number;
    passRate: number;
    retention: number;
    seatsFilled: number;
}

export async function fetchCourseHealth(): Promise<CourseHealth[]> {
    const rows = await call<
        {
            category: string;
            completion: number;
            attendance: number;
            pass_rate: number;
            retention: number;
            seats_filled: number;
        }[]
    >("analytics_course_health");
    return (rows ?? []).map((r) => ({
        category: r.category,
        completion: r.completion,
        attendance: r.attendance,
        passRate: r.pass_rate,
        retention: r.retention,
        seatsFilled: r.seats_filled,
    }));
}

export interface RetentionCohortRow {
    cohort: string;
    size: number;
    /** Percent retained at week 0…4. */
    weeks: number[];
}

export async function fetchRetention(): Promise<RetentionCohortRow[]> {
    const rows = await call<{ cohort: string; size: number; week: number; retained: number }[]>(
        "analytics_retention"
    );
    const byCohort = new Map<string, RetentionCohortRow>();
    for (const r of rows ?? []) {
        const entry = byCohort.get(r.cohort) ?? { cohort: r.cohort, size: Number(r.size), weeks: [] };
        entry.weeks[r.week] = r.retained;
        byCohort.set(r.cohort, entry);
    }
    return [...byCohort.values()];
}

export interface Journey {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
}

export async function fetchJourney(): Promise<Journey> {
    const raw = await call<Journey>("analytics_journey");
    const nodes = raw?.nodes ?? [];
    const links = (raw?.links ?? []).filter((l) => l.value > 0);

    /*
     * Dropping zero-weight links can orphan a node — "In progress" when
     * everyone has finished, say. d3-sankey cannot place a node nothing flows
     * through and throws `Invalid array length`, taking the page with it.
     *
     * So the surviving nodes are collected and the links re-indexed against
     * the compacted list.
     */
    const keep = new Set<number>();
    for (const l of links) {
        keep.add(l.source);
        keep.add(l.target);
    }

    const remap = new Map<number, number>();
    const compacted = nodes.filter((_, i) => keep.has(i));
    let next = 0;
    nodes.forEach((_, i) => {
        if (keep.has(i)) remap.set(i, next++);
    });

    return {
        nodes: compacted,
        links: links.map((l) => ({
            source: remap.get(l.source)!,
            target: remap.get(l.target)!,
            value: l.value,
        })),
    };
}

export interface ThroughputPoint {
    week: string;
    attempts: number;
    passes: number;
}

export async function fetchThroughput(weeks = 8): Promise<ThroughputPoint[]> {
    const rows = await call<{ week: string; attempts: number; passes: number }[]>(
        "analytics_throughput",
        { p_weeks: weeks }
    );
    return (rows ?? []).map((r) => ({
        week: r.week,
        attempts: Number(r.attempts),
        passes: Number(r.passes),
    }));
}
