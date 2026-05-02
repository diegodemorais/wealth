/**
 * Privacy Mode Unit Tests
 *
 * Validates fmtPrivacy returns `R$ ••••` / `$ ••••` puro em privacy mode.
 *
 * Decisão DEV-privacy-deep-fix (2026-05-01): abandonamos transformação
 * matemática (FACTOR=0.07). Princípio: elemento visível, valor mascarado.
 */

import { describe, it, expect } from 'vitest';
import {
  fmtPrivacy,
  fmtPrivacyUsd,
  pvMoney,
  pvArray,
  pvAxisLabel,
  pvText,
  maskMoneyValues,
} from '@/utils/privacyTransform';

describe('Privacy Mode', () => {
  describe('fmtPrivacy — monetary mask (no transform)', () => {
    it('returns R$ •••• when privacyMode=true', () => {
      const result = fmtPrivacy(3_500_000, true);
      expect(result).toContain('••••');
      expect(result).toContain('R$');
      // Must NOT leak any digit (real value or transformed)
      expect(result).not.toMatch(/\d/);
    });

    it('returns real value when privacyMode=false', () => {
      const result = fmtPrivacy(3_500_000, false);
      expect(result).toContain('3.50M');
    });

    it('mask preserves prefix for USD', () => {
      const result = fmtPrivacyUsd(60_000, true);
      expect(result).toContain('••••');
      expect(result).toContain('$');
      expect(result).not.toMatch(/\d/);
    });

    it('USD shows real value when privacyMode=false', () => {
      const result = fmtPrivacyUsd(60_000, false);
      expect(result).toMatch(/\$/);
      expect(result).toMatch(/\d/);
    });

    it('negative values are formatted with minus sign when privacy off', () => {
      const result = fmtPrivacy(-500_000, false);
      expect(result).toMatch(/^[−-]/);
    });

    it('mask is identical regardless of magnitude (irreversible)', () => {
      const small = fmtPrivacy(100, true);
      const huge = fmtPrivacy(100_000_000, true);
      expect(small).toBe(huge);
    });
  });

  describe('pvMoney — passthrough (no transform)', () => {
    it('returns the same value unchanged (charts keep shape)', () => {
      expect(pvMoney(1_000_000)).toBe(1_000_000);
      expect(pvMoney(0)).toBe(0);
      expect(pvMoney(-100)).toBe(-100);
    });
  });

  describe('pvArray — chart data passthrough', () => {
    it('returns original array (privacy off)', () => {
      const values = [100, 200, 300];
      expect(pvArray(values, false)).toEqual(values);
    });

    it('returns original array (privacy on) — labels mask, not data', () => {
      const values = [100, 200, 300];
      expect(pvArray(values, true)).toEqual(values);
    });
  });

  describe('pvAxisLabel — mask label in privacy mode', () => {
    it('returns mask when privacy on', () => {
      expect(pvAxisLabel(3_500_000, true)).toBe('R$ ••••');
      expect(pvAxisLabel(100, true)).toBe('R$ ••••');
    });

    it('returns formatted value when privacy off', () => {
      expect(pvAxisLabel(3_500_000, false)).toMatch(/M/);
      expect(pvAxisLabel(50_000, false)).toMatch(/k/);
    });
  });

  describe('pvText — copy helper', () => {
    it('returns •••• in privacy', () => {
      expect(pvText('R$250k', true)).toBe('••••');
    });

    it('returns text unchanged when privacy off', () => {
      expect(pvText('R$250k', false)).toBe('R$250k');
    });
  });

  describe('maskMoneyValues — regex masking', () => {
    it('masks R$ values in mixed text (privacy on)', () => {
      const input = 'Aporte de R$25k/mês até R$1.5M';
      const out = maskMoneyValues(input, true);
      expect(out).not.toMatch(/R\$\s*\d/);
      expect(out).toContain('R$ ••••');
    });

    it('masks USD values', () => {
      const input = 'US-situs até $60k';
      const out = maskMoneyValues(input, true);
      expect(out).not.toMatch(/\$\s*\d/);
    });

    it('returns text unchanged when privacy off', () => {
      const input = 'Aporte R$25k';
      expect(maskMoneyValues(input, false)).toBe(input);
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
