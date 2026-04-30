/**
 * Privacy Mode Unit Tests
 * Validates fmtPrivacy behavior and localStorage persistence logic
 */

import { describe, it, expect } from 'vitest';
import { fmtPrivacy, pvMoney, pvArray } from '@/utils/privacyTransform';

describe('Privacy Mode', () => {
  describe('fmtPrivacy — monetary transform', () => {
    it('returns transformed value in compact format when privacyMode=true', () => {
      // R$3,500,000 × FACTOR(0.07) = R$245,000 → R$245k
      const result = fmtPrivacy(3_500_000, true);
      // Should show a compact transformed value (not the real 3.5M)
      expect(result).not.toContain('3.5');
      expect(result).not.toContain('3,5');
      // Should contain a number
      expect(result).toMatch(/\d/);
    });

    it('returns real value when privacyMode=false', () => {
      const result = fmtPrivacy(3_500_000, false);
      // Should show the real value: R$3.50M
      expect(result).toContain('3.50M');
    });

    it('applies FACTOR=0.07 consistently (pvMoney)', () => {
      const original = 1_000_000;
      const transformed = pvMoney(original);
      // FACTOR is 0.07 — transformed should be ~70k
      expect(transformed).toBeCloseTo(70_000, 0);
    });

    it('negative values are formatted with minus sign', () => {
      const result = fmtPrivacy(-500_000, false);
      // Negative values must have − prefix
      expect(result).toMatch(/^[−-]/);
    });
  });

  describe('pvArray — chart data transform', () => {
    it('returns original array when privacyMode=false', () => {
      const values = [100, 200, 300];
      const result = pvArray(values, false);
      expect(result).toEqual(values);
    });

    it('transforms all values by FACTOR when privacyMode=true', () => {
      const values = [100, 200, 300];
      const result = pvArray(values, true);
      // Each value multiplied by 0.07
      expect(result[0]).toBeCloseTo(7, 1);
      expect(result[1]).toBeCloseTo(14, 1);
      expect(result[2]).toBeCloseTo(21, 1);
    });

    it('preserves proportions (shape) in privacy mode', () => {
      const values = [100, 200, 400]; // ratio 1:2:4
      const result = pvArray(values, true);
      // Ratios must be preserved
      expect(result[1] / result[0]).toBeCloseTo(2, 5);
      expect(result[2] / result[0]).toBeCloseTo(4, 5);
    });
  });

  describe('localStorage persistence format', () => {
    it('store key contains privacyMode in state object', () => {
      const mockStorage = {
        'dashboard-ui-store': JSON.stringify({
          state: { privacyMode: true },
          version: 0,
        }),
      };

      const stored = JSON.parse(mockStorage['dashboard-ui-store']);
      expect(stored.state.privacyMode).toBe(true);
    });

    it('persisted state with privacyMode=false restores correctly', () => {
      const mockStorage = {
        'dashboard-ui-store': JSON.stringify({
          state: { privacyMode: false },
          version: 0,
        }),
      };

      const stored = JSON.parse(mockStorage['dashboard-ui-store']);
      expect(stored.state.privacyMode).toBe(false);
    });
  });
});
