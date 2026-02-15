import { setFeeIndex, getFeeIndex } from './config-store';
import { FeeIndex } from '../types/fee.types';

describe('Config Store', () => {
  describe('setFeeIndex and getFeeIndex', () => {
    it('should return undefined when index is not set', () => {
      const index = getFeeIndex();
      expect(index).toBeUndefined();
    });

    it('should store and retrieve fee index', () => {
      const index: FeeIndex = new Map([
        ['clearing', [{ feeType: 'clearing', from: 0, to: 5002, percentage: 0.0379 }]],
        ['transfer', [{ feeType: 'transfer', from: 0, to: 5002, percentage: 0.013 }]]
      ]);

      setFeeIndex(index);
      const retrieved = getFeeIndex();

      expect(retrieved).toEqual(index);
    });

    it('should overwrite existing index with new index', () => {
      const firstIndex: FeeIndex = new Map([
        ['clearing', [{ feeType: 'clearing', from: 0, to: 1000, percentage: 0.01 }]]
      ]);

      const secondIndex: FeeIndex = new Map([
        ['transfer', [{ feeType: 'transfer', from: 0, to: 2000, percentage: 0.02 }]]
      ]);

      setFeeIndex(firstIndex);
      setFeeIndex(secondIndex);

      const retrieved = getFeeIndex();
      expect(retrieved).toEqual(secondIndex);
      expect(retrieved).not.toEqual(firstIndex);
    });
  });
});
