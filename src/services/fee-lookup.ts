import { FeeConfig, FeeIndex, FeeRule } from '../types/fee.types';

/**
 * Builds an indexed Map for efficient fee rule lookup
 * Groups rules by feeType and sorts each group by 'from' value
 * @param config - Array of fee rules
 * @returns Map where key is feeType and value is sorted array of rules
 */
export function buildFeeIndex(config: FeeConfig): FeeIndex {
  const index = new Map<string, FeeRule[]>();

  for (const rule of config) {
    const existing = index.get(rule.feeType);
    if (existing) {
      existing.push(rule);
    } else {
      index.set(rule.feeType, [rule]);
    }
  }

  // Sort each group by 'from' value for binary search
  for (const [, rules] of index) {
    rules.sort((a, b) => a.from - b.from);
  }

  return index;
}

/**
 * Finds the matching fee rule using binary search
 * @param type - Fee type to search for
 * @param total - Transaction total amount
 * @param index - Pre-built fee index
 * @returns Matching FeeRule or null if not found
 */
export function findFeeRule(
  type: string,
  total: number,
  index: FeeIndex
): FeeRule | null {
  const rules = index.get(type);

  if (!rules || rules.length === 0) {
    return null;
  }

  // Binary search for the matching range
  let left = 0;
  let right = rules.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const rule = rules[mid];

    if (total >= rule.from && total <= rule.to) {
      return rule;
    }

    if (total < rule.from) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return null;
}
