// ============================================================
// NestFinder — Payment / money utilities
//
// Money is stored in paise (Int). 1 INR = 100 paise.
// SALE prices = total; RENT prices = monthly amount.
// ============================================================

/**
 * Formats paise as a human-readable rupee string.
 * Uses en-IN locale so the Indian number system (lakhs, crores) renders correctly.
 *
 * Examples:
 *   150000      → "₹1,500"
 *   5000000     → "₹50,000"
 *   100000000   → "₹10,00,000"  (10 lakh)
 *   1000000000  → "₹1,00,00,000" (1 crore)
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}

/**
 * Formats paise with a compact suffix for display in cards.
 * Thresholds:
 *   < 1 lakh     → formatPaise (e.g. ₹50,000)
 *   ≥ 1 lakh     → "₹X.X L"
 *   ≥ 1 crore    → "₹X.X Cr"
 */
export function formatPaiseCompact(paise: number): string {
  const rupees = paise / 100
  const lakh = 100_000
  const crore = 10_000_000

  if (rupees >= crore) {
    return `₹${(rupees / crore).toFixed(2).replace(/\.?0+$/, '')} Cr`
  }
  if (rupees >= lakh) {
    return `₹${(rupees / lakh).toFixed(2).replace(/\.?0+$/, '')} L`
  }
  return formatPaise(paise)
}
