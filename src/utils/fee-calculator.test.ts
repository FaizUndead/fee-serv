import { calculateFee } from './fee-calculator';

describe('Fee Calculator', () => {
  describe('calculateFee', () => {
    it('should calculate fee correctly for positive total and percentage', () => {
      const fee = calculateFee(1000, 0.0379);

      expect(fee).toBeCloseTo(37.9, 2);
    });

    it('should return 0 for 0 total', () => {
      const fee = calculateFee(0, 0.0379);

      expect(fee).toBe(0);
    });

    it('should return 0 for 0 percentage', () => {
      const fee = calculateFee(1000, 0);

      expect(fee).toBe(0);
    });

    it('should handle decimal totals', () => {
      const fee = calculateFee(1234.56, 0.05);

      expect(fee).toBeCloseTo(61.728, 2);
    });

    it('should handle small percentages', () => {
      const fee = calculateFee(5000, 0.001);

      expect(fee).toBe(5);
    });

    it('should handle large totals', () => {
      const fee = calculateFee(1000000, 0.0248);

      expect(fee).toBe(24800);
    });
  });
});
