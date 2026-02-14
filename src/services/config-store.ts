import { FeeConfig } from '../types/fee.types';

let feeConfig: FeeConfig | undefined;

export function setFeeConfig(config: FeeConfig): void {
  feeConfig = config;
}

export function getFeeConfig(): FeeConfig | undefined {
  return feeConfig;
}
