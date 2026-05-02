/**
 * privacy-magnitude.test.ts — Validates privacy mask behavior across edge cases
 *
 * DEV-privacy-deep-fix (2026-05-01): FACTOR transformation abandoned. Privacy
 * mode now returns `R$ ••••` (mask), preserving zero digits. These tests verify:
 * - Privacy ON → no digits leak (mask is constant)
 * - Privacy OFF → real value formatted, sign preserved, no scientific notation
 */

import { describe, it, expect } from 'vitest';
import { fmtPrivacy } from '@/utils/privacyTransform';

describe('Privacy Transform — Edge Cases', () => {

  // ─────────────────────────────────────────────────────────────
  // 1. PRIVACY ON: mask is irreversible, no digits leak
  // ─────────────────────────────────────────────────────────────

  describe('Privacy ON returns a mask', () => {
    const sampleValues = [
      0, 1, 100, 50_000, 1_000_000, 14_400_000, 1_000_000_000,
      -1, -50_000, -1_000_000, 0.005, 0.0001, 0.000001,
    ];

    for (const val of sampleValues) {
      it(`fmtPrivacy(${val}, true) returns a digit-free mask`, () => {
        const result = fmtPrivacy(val, true);
        expect(result).toBeTruthy();
        expect(result).toMatch(/R\$/);
        // Critical: no digits — values cannot be reverse-engineered
        expect(result).not.toMatch(/\d/);
        expect(result).not.toMatch(/e[-+]\d/i);
      });
    }

    it('mask is identical regardless of magnitude', () => {
      const small = fmtPrivacy(1, true);
      const huge  = fmtPrivacy(1_000_000_000, true);
      expect(small).toBe(huge);
    });

    it('mask is identical regardless of sign', () => {
      const positive = fmtPrivacy(1_000_000, true);
      const negative = fmtPrivacy(-1_000_000, true);
      // No sign leak in privacy mode
      expect(positive).toBe(negative);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. PRIVACY OFF: real value, sign preserved, no scientific notation
  // ─────────────────────────────────────────────────────────────

  describe('Privacy OFF preserves sign and avoids scientific notation', () => {
    it('negative value shows minus sign', () => {
      const result = fmtPrivacy(-50_000, false);
      expect(result).toMatch(/^[−-]/);
    });

    it('large negative value shows minus sign', () => {
      const result = fmtPrivacy(-1_000_000, false);
      expect(result).toMatch(/^[−-]/);
    });

    it('small value avoids scientific notation', () => {
      const result = fmtPrivacy(0.005, false);
      expect(result).not.toMatch(/e[-+]\d/i);
    });

    it('large value renders in compact M notation', () => {
      const result = fmtPrivacy(14_400_000, false);
      expect(result).toContain('M');
      expect(result).not.toMatch(/e[-+]\d/i);
    });

    it('zero renders without errors', () => {
      const result = fmtPrivacy(0, false);
      expect(result).toContain('R$');
      expect(result).not.toMatch(/e[-+]\d/i);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. FORMAT VALIDATION
  // ─────────────────────────────────────────────────────────────

  describe('Output format validation', () => {
    const testValues = [50_000, 1_000_000, 14_400_000, 0.005, 100, -50_000, -1_000_000, 0];

    for (const val of testValues) {
      it(`fmtPrivacy(${val}, true) produces a valid mask`, () => {
        const result = fmtPrivacy(val, true);
        expect(result).toMatch(/^R\$/);
        expect(result).not.toMatch(/e[-+]\d/i);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it(`fmtPrivacy(${val}, false) produces a valid formatted string`, () => {
        const result = fmtPrivacy(val, false);
        expect(result).toMatch(/^R\$|^[−-]/);
        expect(result).not.toMatch(/e[-+]\d/i);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    }
  });
});
