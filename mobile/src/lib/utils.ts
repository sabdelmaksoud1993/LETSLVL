/**
 * Format price with AED currency (default for MENA region).
 * Falls back to the provided currency if available.
 */
export function formatPrice(amount: number, currency: string = 'AED'): string {
  return `${currency} ${amount.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
