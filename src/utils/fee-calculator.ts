/**
 * Calculates the fee amount based on total and percentage
 * @param total - Transaction total amount
 * @param percentage - Fee percentage (0-1 range, e.g., 0.0379 for 3.79%)
 * @returns Fee amount
 */
export function calculateFee(total: number, percentage: number): number {
  return total * percentage;
}
