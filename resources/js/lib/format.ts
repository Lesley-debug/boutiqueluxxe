/**
 * Formats a numeric price value as a USD dollar string.
 * e.g. 1234.5 → "$1,234.50"
 */
export function formatPrice(amount: number | string): string {
    const n = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
