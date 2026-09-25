/**
 * Formats the store's authoritative USD price consistently.
 * e.g. 1234.5 → "$1,234.50"
 */
const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatPrice(amount: number | string): string {
    const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;

    return usdFormatter.format(Number.isFinite(value) ? value : 0);
}
