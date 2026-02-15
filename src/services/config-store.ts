import { FeeIndex } from '../types/fee.types';

let feeIndex: FeeIndex | undefined;

export function setFeeIndex(index: FeeIndex): void {
  feeIndex = index;
}

export function getFeeIndex(): FeeIndex | undefined {
  return feeIndex;
}
