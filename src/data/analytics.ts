import type { RadarData, RadarMetric } from "@/components/charts/radar-context";
import type { SankeyData } from "@/components/charts/sankey";
import { SERIES } from "@/lib/chart-palette";

// ─── Payments ────────────────────────────────────────────────────────

export interface RevenuePoint {
    month: string;
    /** Course fees collected, in naira. */
    tuition: number;
    /** Application-form fees, in naira. */
    applications: number;
}

export const revenueByMonth: RevenuePoint[] = [
    { month: "Sep", tuition: 4_250_000, applications: 340_000 },
    { month: "Oct", tuition: 6_100_000, applications: 480_000 },
    { month: "Nov", tuition: 5_400_000, applications: 380_000 },
    { month: "Dec", tuition: 7_850_000, applications: 560_000 },
    { month: "Jan", tuition: 9_200_000, applications: 720_000 },
    { month: "Feb", tuition: 11_400_000, applications: 840_000 },
];

export interface PaymentMethodSlice {
    method: string;
    amount: number;
    share: number;
}

export const paymentMethods: PaymentMethodSlice[] = [
    { method: "Bank Transfer", amount: 6_840_000, share: 60 },
    { method: "Card", amount: 3_192_000, share: 28 },
    { method: "USSD", amount: 912_000, share: 8 },
    { method: "Cash (Bursary)", amount: 456_000, share: 4 },
];

export type TransactionStatus = "settled" | "pending" | "failed" | "refunded";

export interface Transaction {
    id: string;
    reference: string;
    studentName: string;
    courseTitle: string;
    amount: number;
    method: string;
    status: TransactionStatus;
    date: string;
}

export const transactions: Transaction[] = [
    { id: "tx-1", reference: "TRD-8F21A", studentName: "Adewale Johnson", courseTitle: "Tech Odyssey", amount: 150_000, method: "Bank Transfer", status: "settled", date: "Feb 28, 2026" },
    { id: "tx-2", reference: "TRD-4C90B", studentName: "Chinedu Okafor", courseTitle: "Python Programming", amount: 150_000, method: "Card", status: "settled", date: "Feb 28, 2026" },
    { id: "tx-3", reference: "TRD-2E17C", studentName: "Amaka Eze", courseTitle: "Web Development", amount: 200_000, method: "Bank Transfer", status: "pending", date: "Feb 27, 2026" },
    { id: "tx-4", reference: "TRD-9B44D", studentName: "Ibrahim Musa", courseTitle: "Cybersecurity", amount: 300_000, method: "Card", status: "settled", date: "Feb 27, 2026" },
    { id: "tx-5", reference: "TRD-7A03E", studentName: "Halima Bello", courseTitle: "Digital Literacy", amount: 50_000, method: "USSD", status: "failed", date: "Feb 26, 2026" },
    { id: "tx-6", reference: "TRD-1D65F", studentName: "Ngozi Obi", courseTitle: "Data Science", amount: 300_000, method: "Bank Transfer", status: "settled", date: "Feb 26, 2026" },
    { id: "tx-7", reference: "TRD-5G88H", studentName: "Yusuf Abdullahi", courseTitle: "Generative AI", amount: 100_000, method: "Card", status: "refunded", date: "Feb 25, 2026" },
    { id: "tx-8", reference: "TRD-3J12K", studentName: "Oluwaseun Adebayo", courseTitle: "Digital Marketing", amount: 300_000, method: "Bank Transfer", status: "settled", date: "Feb 25, 2026" },
];

// ─── Enrollment funnel (ordinal stages) ──────────────────────────────

export interface FunnelStageDatum {
    label: string;
    value: number;
    displayValue?: string;
}

export const enrollmentFunnel: FunnelStageDatum[] = [
    { label: "Prospectus Views", value: 12_400, displayValue: "12.4k" },
    { label: "Applications", value: 3_180, displayValue: "3,180" },
    { label: "Paid Enrollment", value: 1_320, displayValue: "1,320" },
    { label: "Prerequisite Passed", value: 968, displayValue: "968" },
    { label: "Certified", value: 620, displayValue: "620" },
];

// ─── Learner journey (Sankey) ────────────────────────────────────────

export const learnerJourney: SankeyData = {
    nodes: [
        { name: "Web Applications", category: "source" },
        { name: "Referral", category: "source" },
        { name: "Walk-in", category: "source" },
        { name: "Paid Enrollment", category: "landing" },
        { name: "Payment Lapsed", category: "landing" },
        { name: "Prerequisite Passed", category: "landing" },
        { name: "Prerequisite Failed", category: "landing" },
        { name: "Certified", category: "outcome" },
        { name: "Attended Only", category: "outcome" },
        { name: "Withdrew", category: "outcome" },
    ],
    links: [
        { source: 0, target: 3, value: 640 },
        { source: 0, target: 4, value: 180 },
        { source: 1, target: 3, value: 250 },
        { source: 1, target: 4, value: 60 },
        { source: 2, target: 3, value: 150 },
        { source: 2, target: 4, value: 40 },
        { source: 3, target: 5, value: 780 },
        { source: 3, target: 6, value: 260 },
        { source: 4, target: 9, value: 280 },
        { source: 5, target: 7, value: 620 },
        { source: 5, target: 8, value: 160 },
        { source: 6, target: 9, value: 260 },
    ],
};

// ─── Course health (Radar) ───────────────────────────────────────────

export const courseHealthMetrics: RadarMetric[] = [
    { key: "completion", label: "Completion" },
    { key: "attendance", label: "Attendance" },
    { key: "passRate", label: "Pass Rate" },
    { key: "satisfaction", label: "Satisfaction" },
    { key: "retention", label: "Retention" },
    { key: "punctuality", label: "Punctuality" },
];

export const courseHealth: RadarData[] = [
    {
        label: "Software Development",
        color: SERIES[0],
        values: { completion: 82, attendance: 91, passRate: 78, satisfaction: 88, retention: 74, punctuality: 86 },
    },
    {
        label: "Cybersecurity",
        color: SERIES[1],
        values: { completion: 68, attendance: 84, passRate: 62, satisfaction: 79, retention: 66, punctuality: 72 },
    },
    {
        label: "Digital Literacy",
        color: SERIES[2],
        values: { completion: 94, attendance: 96, passRate: 91, satisfaction: 93, retention: 88, punctuality: 94 },
    },
];

// ─── Cohort retention (sequential heat grid) ─────────────────────────

export interface RetentionCohort {
    cohort: string;
    size: number;
    /** Percentage still active at week 0..5. */
    weeks: number[];
}

export const cohortRetention: RetentionCohort[] = [
    { cohort: "Sep 2025", size: 85, weeks: [100, 94, 88, 81, 76, 72] },
    { cohort: "Oct 2025", size: 120, weeks: [100, 92, 85, 79, 74, 68] },
    { cohort: "Nov 2025", size: 95, weeks: [100, 96, 91, 87, 84, 80] },
    { cohort: "Dec 2025", size: 140, weeks: [100, 89, 80, 72, 65, 58] },
    { cohort: "Jan 2026", size: 180, weeks: [100, 95, 90, 86, 82, 79] },
    { cohort: "Feb 2026", size: 210, weeks: [100, 97, 93, 89, 85, 0] },
];

// ─── Assessment throughput ───────────────────────────────────────────

export interface AssessmentThroughputPoint {
    week: string;
    attempts: number;
    passes: number;
}

export const assessmentThroughput: AssessmentThroughputPoint[] = [
    { week: "W1", attempts: 142, passes: 98 },
    { week: "W2", attempts: 186, passes: 131 },
    { week: "W3", attempts: 164, passes: 121 },
    { week: "W4", attempts: 221, passes: 172 },
    { week: "W5", attempts: 198, passes: 149 },
    { week: "W6", attempts: 254, passes: 203 },
];

// ─── Top courses by revenue ──────────────────────────────────────────

export interface TopCourse {
    title: string;
    enrolled: number;
    revenue: number;
    passRate: number;
}

export const topCourses: TopCourse[] = [
    { title: "Cybersecurity", enrolled: 8, revenue: 2_400_000, passRate: 62 },
    { title: "Data Science", enrolled: 12, revenue: 3_600_000, passRate: 71 },
    { title: "Digital Marketing", enrolled: 20, revenue: 6_000_000, passRate: 84 },
    { title: "Tech Odyssey", enrolled: 18, revenue: 2_700_000, passRate: 78 },
    { title: "Web Development", enrolled: 12, revenue: 2_400_000, passRate: 74 },
];

// ─── System overview tiles ───────────────────────────────────────────

export interface SystemTile {
    label: string;
    value: string;
    /** Signed percentage change vs previous period. */
    delta?: number;
    hint?: string;
}

export const systemTiles: SystemTile[] = [
    { label: "Total Revenue", value: "₦11.4M", delta: 24, hint: "February, all courses" },
    { label: "Active Learners", value: "1,247", delta: 12, hint: "Enrolled and not withdrawn" },
    { label: "Avg. Pass Rate", value: "78%", delta: 3, hint: "Across published assessments" },
    { label: "Course Retention", value: "72%", delta: -4, hint: "Week 5, rolling cohorts" },
];

export function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatCompactNaira(amount: number): string {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
    return `₦${amount}`;
}
