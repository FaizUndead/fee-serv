import { buildFeeIndex, findFeeRule } from './fee-lookup';
import { FeeConfig, FeeIndex } from '../types/fee.types';

describe('Fee Lookup Service', () => {
  describe('buildFeeIndex', () => {
    it('should create an empty index for empty config', () => {
      const config: FeeConfig = [];
      const index = buildFeeIndex(config);

      expect(index.size).toBe(0);
    });

    it('should group rules by feeType', () => {
      const config: FeeConfig = [
        { feeType: 'clearing', from: 0, to: 5002, percentage: 0.0379 },
        { feeType: 'transfer', from: 0, to: 5002, percentage: 0.013 },
        { feeType: 'clearing', from: 5003, to: 10001, percentage: 0.0248 },
      ];

      const index = buildFeeIndex(config);

      expect(index.size).toBe(2);
      expect(index.get('clearing')).toHaveLength(2);
      expect(index.get('transfer')).toHaveLength(1);
    });

    it('should sort rules by from value within each type', () => {
      const config: FeeConfig = [
        { feeType: 'clearing', from: 5003, to: 10001, percentage: 0.0248 },
        { feeType: 'clearing', from: 0, to: 5002, percentage: 0.0379 },
        { feeType: 'clearing', from: 10002, to: 20000, percentage: 0.01 },
      ];

      const index = buildFeeIndex(config);
      const clearingRules = index.get('clearing')!;

      expect(clearingRules[0].from).toBe(0);
      expect(clearingRules[1].from).toBe(5003);
      expect(clearingRules[2].from).toBe(10002);
    });
  });

  describe('findFeeRule', () => {
    let index: FeeIndex;

    beforeEach(() => {
      const config: FeeConfig = [
        { feeType: 'clearing', from: 0, to: 5002, percentage: 0.0379 },
        { feeType: 'clearing', from: 5003, to: 10001, percentage: 0.0248 },
        { feeType: 'transfer', from: 0, to: 5002, percentage: 0.013 },
        { feeType: 'transfer', from: 5003, to: 10001, percentage: 0.0222 },
      ];
      index = buildFeeIndex(config);
    });

    it('should return null for non-existent fee type', () => {
      const rule = findFeeRule('unknown', 1000, index);

      expect(rule).toBeNull();
    });

    it('should return null when total is below all ranges', () => {
      const config: FeeConfig = [
        { feeType: 'clearing', from: 100, to: 5002, percentage: 0.0379 },
      ];
      const testIndex = buildFeeIndex(config);

      const rule = findFeeRule('clearing', 50, testIndex);

      expect(rule).toBeNull();
    });

    it('should return null when total is above all ranges', () => {
      const rule = findFeeRule('clearing', 20000, index);

      expect(rule).toBeNull();
    });

    it('should find rule at the start of range', () => {
      const rule = findFeeRule('clearing', 0, index);

      expect(rule).not.toBeNull();
      expect(rule?.from).toBe(0);
      expect(rule?.to).toBe(5002);
      expect(rule?.percentage).toBe(0.0379);
    });

    it('should find rule at the end of range', () => {
      const rule = findFeeRule('clearing', 5002, index);

      expect(rule).not.toBeNull();
      expect(rule?.from).toBe(0);
      expect(rule?.to).toBe(5002);
    });

    it('should find rule in the middle of range', () => {
      const rule = findFeeRule('transfer', 7500, index);

      expect(rule).not.toBeNull();
      expect(rule?.from).toBe(5003);
      expect(rule?.to).toBe(10001);
      expect(rule?.percentage).toBe(0.0222);
    });

    it('should return null for gap between ranges', () => {
      const config: FeeConfig = [
        { feeType: 'clearing', from: 0, to: 1000, percentage: 0.0379 },
        { feeType: 'clearing', from: 2000, to: 5000, percentage: 0.0248 },
      ];
      const testIndex = buildFeeIndex(config);

      const rule = findFeeRule('clearing', 1500, testIndex);

      expect(rule).toBeNull();
    });
  });
});
