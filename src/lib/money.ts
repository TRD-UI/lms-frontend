/**
 * Money helpers.
 *
 * The database stores integer minor units (kobo) so no amount is ever a float.
 * Anything rendered to a user goes through here.
 */

export const KOBO_PER_NAIRA = 100;

/** 15000000 → "₦150,000" */
export function formatNaira(kobo: number | null | undefined, options?: { showKobo?: boolean }): string {
    const amount = (kobo ?? 0) / KOBO_PER_NAIRA;
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: options?.showKobo ? 2 : 0,
        maximumFractionDigits: options?.showKobo ? 2 : 0,
    }).format(amount);
}

/** 150000 → 15000000. For form input, which is captured in naira. */
export const toKobo = (naira: number) => Math.round(naira * KOBO_PER_NAIRA);

/** 15000000 → 150000. For populating a naira-denominated form field. */
export const toNaira = (kobo: number) => kobo / KOBO_PER_NAIRA;
