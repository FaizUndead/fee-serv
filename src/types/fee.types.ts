export interface FeeRule {
  feeType: string;
  from: number;
  to: number;
  percentage: number;
}

export type FeeConfig = FeeRule[];

export type FeeIndex = Map<string, FeeRule[]>;

export interface FeeCalculationRequest {
  total: number;
  type: string;
}

export interface FeeCalculationResponse {
  total: number;
  type: string;
  percentage: number;
  feeAmount: number;
}
