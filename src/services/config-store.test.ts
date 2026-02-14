import { setFeeConfig, getFeeConfig } from './config-store';
import { FeeConfig } from '../types/fee.types';

describe('Config Store', () => {
  describe('setFeeConfig and getFeeConfig', () => {
    it('should return undefined when config is not set', () => {
      const config = getFeeConfig();
      expect(config).toBeUndefined();
    });

    it('should store and retrieve fee config', () => {
      const config: FeeConfig = [
        { feeType: 'clearing', from: 0, to: 5002, percentage: 0.0379 },
        { feeType: 'transfer', from: 0, to: 5002, percentage: 0.013 }
      ];

      setFeeConfig(config);
      const retrieved = getFeeConfig();

      expect(retrieved).toEqual(config);
    });

    it('should overwrite existing config with new config', () => {
      const firstConfig: FeeConfig = [
        { feeType: 'clearing', from: 0, to: 1000, percentage: 0.01 }
      ];

      const secondConfig: FeeConfig = [
        { feeType: 'transfer', from: 0, to: 2000, percentage: 0.02 },
        { feeType: 'clearing', from: 0, to: 3000, percentage: 0.03 }
      ];

      setFeeConfig(firstConfig);
      setFeeConfig(secondConfig);

      const retrieved = getFeeConfig();
      expect(retrieved).toEqual(secondConfig);
      expect(retrieved).not.toEqual(firstConfig);
    });
  });
});
