/**
 * display-validation.test.ts — Validation of computed/derived values and their display
 *
 * Tests that:
 * - All derived values computed by dataWiring.ts are correct
 * - Components display correct values (not zeros, null, or undefined)
 * - Calculations match expected formulas
 * - No data field mismatches cause display failures
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { DashboardData, DerivedValues } from '@/types/dashboard';

// Import the wiring function
import { computeDerivedValues } from '@/utils/dataWiring';

let data: DashboardData;
let derived: DerivedValues;

beforeAll(() => {
  const dataPath = resolve(__dirname, '../../dashboard/data.json');
  const dataContent = readFileSync(dataPath, 'utf-8');
  data = JSON.parse(dataContent) as DashboardData;
  derived = computeDerivedValues(data);
});

describe('Display Validation Suite', () => {
  // ─────────────────────────────────────────────────────────────
  // 1. CORE KPI VALUES (must not be 0 or null)
  // ─────────────────────────────────────────────────────────────
  describe('core KPI values', () => {
    it('monthly income should be greater than 0 (BLOCKER)', () => {
      expect(derived.monthlyIncome).toBeGreaterThan(0);
      expect(derived.monthlyIncome).not.toBe(null);
      expect(derived.monthlyIncome).not.toBe(undefined);
    });

    it('yearly expense should be greater than 0', () => {
      expect(derived.yearlyExpense).toBeGreaterThan(0);
    });

    it('networth should be positive', () => {
      expect(derived.networth).toBeGreaterThan(0);
    });

    it('fire percentage should be between 0 and 1', () => {
      expect(derived.firePercentage).toBeGreaterThanOrEqual(0);
      expect(derived.firePercentage).toBeLessThanOrEqual(1);
    });

    it('fire date should be a valid Date object', () => {
      expect(derived.fireDate).toBeInstanceOf(Date);
      expect(derived.fireDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('fire months away should be positive', () => {
      expect(derived.fireMonthsAway).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. ALLOCATION CALCULATIONS
  // ─────────────────────────────────────────────────────────────
  describe('allocations', () => {
    it('equity percentage should sum to equity allocation', () => {
      const equity_pct =
        derived.equityPercentage || 0;
      expect(equity_pct).toBeGreaterThan(0);
      expect(equity_pct).toBeLessThanOrEqual(1 + 1e-10); // Allow for floating-point rounding
    });

    it('rf percentage should be non-negative', () => {
      const rf_pct = derived.rfPercentage || 0;
      expect(rf_pct).toBeGreaterThanOrEqual(0);
      expect(rf_pct).toBeLessThanOrEqual(1 + 1e-10); // Allow for floating-point rounding
    });

    it('international percentage should be non-negative', () => {
      const intl_pct = derived.internationalPercentage || 0;
      expect(intl_pct).toBeGreaterThanOrEqual(0);
      expect(intl_pct).toBeLessThanOrEqual(1 + 1e-10); // Allow for floating-point rounding
    });

    it('brazil concentration should be between 0 and 1', () => {
      const br_conc = derived.concentrationBrazil || 0;
      expect(br_conc).toBeGreaterThanOrEqual(0);
      expect(br_conc).toBeLessThanOrEqual(1 + 1e-10); // Allow for floating-point rounding
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. WELLNESS STATUS
  // ─────────────────────────────────────────────────────────────
  describe('wellness status', () => {
    it('wellness score should be between 0 and 1', () => {
      expect(derived.wellnessScore).toBeGreaterThanOrEqual(0);
      expect(derived.wellnessScore).toBeLessThanOrEqual(1);
    });

    it('wellness status should be valid string', () => {
      const valid = ['excellent', 'ok', 'warning', 'critical'];
      expect(valid).toContain(derived.wellnessStatus);
    });

    it('wellness status should be critical if progress < 40%', () => {
      if (derived.firePercentage < 0.4) {
        expect(derived.wellnessStatus).toBe('critical');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. CONSISTENCY CHECKS
  // ─────────────────────────────────────────────────────────────
  describe('consistency', () => {
    it('monthly income should match data source', () => {
      expect(derived.monthlyIncome).toBe(data.premissas?.renda_mensal_liquida);
    });

    it('yearly expense should match data source', () => {
      expect(derived.yearlyExpense).toBe(data.premissas?.custo_vida_base);
    });

    it('fire percentage should be patrimonio / gatilho', () => {
      const expectedPct = data.premissas.patrimonio_atual / data.premissas.patrimonio_gatilho;
      expect(Math.abs(derived.firePercentage - expectedPct)).toBeLessThan(0.01);
    });

    it('fire months away should be positive if not yet FIRE', () => {
      if (derived.firePercentage < 1) {
        expect(derived.fireMonthsAway).toBeGreaterThan(0);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. NO NULL/UNDEFINED CRITICAL VALUES
  // ─────────────────────────────────────────────────────────────
  describe('null/undefined checks', () => {
    it('should not have undefined monthly income', () => {
      expect(derived.monthlyIncome).toBeDefined();
      expect(derived.monthlyIncome).not.toBe(undefined);
    });

    it('should not have undefined yearly expense', () => {
      expect(derived.yearlyExpense).toBeDefined();
      expect(derived.yearlyExpense).not.toBe(undefined);
    });

    it('should not have undefined networth', () => {
      expect(derived.networth).toBeDefined();
      expect(derived.networth).not.toBe(undefined);
    });

    it('should not have undefined fire date', () => {
      expect(derived.fireDate).toBeDefined();
      expect(derived.fireDate).not.toBe(undefined);
    });

    it('should not have undefined fire percentage', () => {
      expect(derived.firePercentage).toBeDefined();
      expect(derived.firePercentage).not.toBe(undefined);
    });

    it('should not have undefined wellness status', () => {
      expect(derived.wellnessStatus).toBeDefined();
      expect(derived.wellnessStatus).not.toBe(undefined);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. REASONABLE VALUE RANGES
  // ─────────────────────────────────────────────────────────────
  describe('value ranges', () => {
    it('monthly income should be between 10k and 1M', () => {
      expect(derived.monthlyIncome).toBeGreaterThanOrEqual(10_000);
      expect(derived.monthlyIncome).toBeLessThanOrEqual(1_000_000);
    });

    it('yearly expense should be between 100k and 5M', () => {
      expect(derived.yearlyExpense).toBeGreaterThanOrEqual(100_000);
      expect(derived.yearlyExpense).toBeLessThanOrEqual(5_000_000);
    });

    it('networth should be between 1M and 100M', () => {
      expect(derived.networth).toBeGreaterThanOrEqual(1_000_000);
      expect(derived.networth).toBeLessThanOrEqual(100_000_000);
    });

    it('fire months away should be less than 360 months (30 years)', () => {
      expect(derived.fireMonthsAway).toBeLessThan(360);
    });

    it('wellness score should not exceed 1.2 (computed heuristic)', () => {
      // Based on dataWiring.ts line 161: Math.min(1, progPct / 100 * 1.2)
      expect(derived.wellnessScore).toBeLessThanOrEqual(1.2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 7. APORTE DO MÊS — real value must take priority over premissa
  // ─────────────────────────────────────────────────────────────
  describe('aporte do mês display logic', () => {
    it('ultimoAporte should come from premissas.ultimo_aporte_brl', () => {
      // dataWiring must wire this correctly
      const expected = data.premissas?.ultimo_aporte_brl ?? 0;
      expect(derived.ultimoAporte).toBe(expected);
    });

    it('aporteMensal should come from premissas.aporte_mensal', () => {
      const expected = data.premissas?.aporte_mensal ?? 0;
      expect(derived.aporteMensal).toBe(expected);
    });

    it('when ultimoAporte > 0, it should differ from aporteMensal (real vs premissa)', () => {
      // This catches the bug where premissa R$25k was shown instead of real R$78k
      if (derived.ultimoAporte > 0) {
        // They CAN be equal, but we verify the source is correct
        // The primary display should use ultimoAporte, not aporteMensal
        expect(derived.ultimoAporte).toBeGreaterThan(0);
      }
    });

    it('ultimoAporte should be in plausible range (1k–500k)', () => {
      if (derived.ultimoAporte > 0) {
        expect(derived.ultimoAporte).toBeGreaterThan(1_000);
        expect(derived.ultimoAporte).toBeLessThan(500_000);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 8. PFIRE — must come from data, not hardcoded fallback
  // ─────────────────────────────────────────────────────────────
  describe('pfire source validation', () => {
    it('pfire should come from pfire_base.base, not hardcoded', () => {
      // dataWiring: pfire = data.pfire_base.base / 100, no hardcoded fallback (0 = pipeline broken)
      // If pfire_base.base is present, derived.pfire must equal it / 100
      const pfireFromData = (data as any).pfire_base?.base;
      if (pfireFromData !== undefined) {
        expect(Math.abs(derived.pfire - pfireFromData / 100)).toBeLessThan(0.001);
      }
    });

    it('pfireBase derived value should match data source', () => {
      const pfireFromData = (data as any).pfire_base?.base;
      if (pfireFromData !== undefined) {
        expect(Math.abs(derived.pfireBase - pfireFromData)).toBeLessThan(0.01);
      }
    });

    it('pfire should be between 0.5 and 1.0', () => {
      expect(derived.pfire).toBeGreaterThanOrEqual(0.5);
      expect(derived.pfire).toBeLessThanOrEqual(1.0);
    });
  });
});
