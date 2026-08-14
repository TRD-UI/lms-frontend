/**
 * Chart colour roles.
 *
 * These mirror the tokens defined in `src/index.css`. Import from here rather
 * than hardcoding `var(--chart-n)` at call sites so the categorical order stays
 * fixed — slots are assigned in sequence and never cycled.
 */

/** Categorical identity — assign in order, slot 1 first. Validated light-mode. */
export const SERIES = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
] as const;

/** Ordered stages (funnel, tiers) — one hue, light→dark. */
export const ORDINAL = [
    "var(--chart-ordinal-1)",
    "var(--chart-ordinal-2)",
    "var(--chart-ordinal-3)",
    "var(--chart-ordinal-4)",
    "var(--chart-ordinal-5)",
] as const;

/**
 * Sequential magnitude ramp (heatmap cells), light→dark. The lightest step means
 * "near zero" and is allowed to recede toward the surface.
 */
export const SEQUENTIAL = [
    "#e8f1fd",
    "#cde2fb",
    "#9ec5f4",
    "#6da7ec",
    "#3987e5",
    "#2a78d6",
    "#1c5cab",
] as const;

/** Pick a sequential step for a 0–1 magnitude. */
export function sequentialStep(t: number): string {
    const clamped = Math.max(0, Math.min(1, t));
    const i = Math.round(clamped * (SEQUENTIAL.length - 1));
    return SEQUENTIAL[i];
}

/** Reserved status colours — never reused as a categorical series. */
export const STATUS = {
    good: "#1baf7a",
    warning: "#eda100",
    critical: "#e34948",
    neutral: "#94a3b8",
} as const;

export const CHART_GRID = "var(--chart-grid)";
export const CHART_LABEL = "var(--chart-label)";

/**
 * Shared Recharts tooltip chrome — a light card matching the app surface,
 * so tooltips read as part of the page rather than a dark overlay.
 */
export const TOOLTIP_STYLE: React.CSSProperties = {
    borderRadius: 12,
    border: "1px solid var(--chart-tooltip-border)",
    background: "var(--chart-tooltip-background)",
    color: "var(--chart-tooltip-foreground)",
    fontSize: 12,
    padding: "10px 12px",
    boxShadow: "0 8px 24px -8px rgb(15 23 42 / 0.15)",
};

export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
    color: "var(--chart-tooltip-muted)",
    marginBottom: 4,
    fontWeight: 500,
};

export const TOOLTIP_ITEM_STYLE: React.CSSProperties = {
    color: "var(--chart-tooltip-foreground)",
};
