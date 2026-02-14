export interface FeeRule {
  feeType: string;
  from: number;
  to: number;
  percentage: number;
}

export type FeeConfig = FeeRule[];
