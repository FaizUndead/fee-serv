import { parseFeeCSV } from './csv-parser';
import { FeeConfig } from '../types/fee.types';

describe('CSV Parser', () => {
  const validCSV = `Fee Type,From,To,Percentage
clearing,0,5002,0.0379
clearing,5003,10001,0.0248
clearing,10002,50000,0.033
clearing,50001,100000,0.0165
transfer,0,5002,0.013
transfer,5003,10001,0.0222
transfer,10002,50000,0.0328
transfer,50001,100000,0.0484`;

  describe('parseFeeCSV', () => {
    it('should parse valid CSV into FeeConfig array', () => {
      const result: FeeConfig = parseFeeCSV(validCSV);

      expect(result).toHaveLength(8);
      expect(result[0]).toEqual({
        feeType: 'clearing',
        from: 0,
        to: 5002,
        percentage: 0.0379
      });
      expect(result[4]).toEqual({
        feeType: 'transfer',
        from: 0,
        to: 5002,
        percentage: 0.013
      });
    });

    it('should validate CSV has correct headers', () => {
      expect(() => parseFeeCSV(validCSV)).not.toThrow();
    });

    it('should reject CSV with wrong headers', () => {
      const invalidHeaderCSV = `Type,Start,End,Rate
clearing,0,5002,0.0379`;

      expect(() => parseFeeCSV(invalidHeaderCSV)).toThrow('Invalid CSV headers');
    });

    it('should reject CSV with missing columns', () => {
      const missingColumnCSV = `Fee Type,From,To,Percentage
clearing,0,5002`;

      expect(() => parseFeeCSV(missingColumnCSV)).toThrow();
    });

    it('should reject CSV with invalid number in From column', () => {
      const invalidFromCSV = `Fee Type,From,To,Percentage
clearing,abc,5002,0.0379`;

      expect(() => parseFeeCSV(invalidFromCSV)).toThrow('Invalid number');
    });

    it('should reject CSV with invalid number in To column', () => {
      const invalidToCSV = `Fee Type,From,To,Percentage
clearing,0,xyz,0.0379`;

      expect(() => parseFeeCSV(invalidToCSV)).toThrow('Invalid number');
    });

    it('should reject CSV with invalid number in Percentage column', () => {
      const invalidPercentageCSV = `Fee Type,From,To,Percentage
clearing,0,5002,invalid`;

      expect(() => parseFeeCSV(invalidPercentageCSV)).toThrow('Invalid number');
    });

    it('should reject CSV with negative percentage', () => {
      const negativePercentageCSV = `Fee Type,From,To,Percentage
clearing,0,5002,-0.05`;

      expect(() => parseFeeCSV(negativePercentageCSV)).toThrow('Percentage must be between 0 and 1');
    });

    it('should reject CSV with percentage greater than 1', () => {
      const highPercentageCSV = `Fee Type,From,To,Percentage
clearing,0,5002,1.5`;

      expect(() => parseFeeCSV(highPercentageCSV)).toThrow('Percentage must be between 0 and 1');
    });

    it('should handle empty CSV body (only headers)', () => {
      const emptyCSV = `Fee Type,From,To,Percentage`;

      const result = parseFeeCSV(emptyCSV);
      expect(result).toEqual([]);
    });

    it('should reject completely empty CSV', () => {
      const emptyCSV = '';

      expect(() => parseFeeCSV(emptyCSV)).toThrow();
    });
  });
});
