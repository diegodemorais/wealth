/**
 * annual-returns-schema.test.ts — Validates that all annual_returns have complete schema
 *
 * Ensures that:
 * - Every year in annual_returns has: year, months, twr_nominal_brl, twr_real_brl
 * - NEW FIELD (2026-04-23): alpha_vs_vwra exists for all years
 * - Standard fields exist: ipca, cdi
 * - No critical fields are null (except allowed edge cases)
 *
 * This test prevents data pipeline bugs where new fields aren't enrich for all years.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface AnnualReturn {
  year: number;
  months: number;
  ytd?: boolean;
  twr_nominal_brl: number;
  twr_real_brl: number;
  twr_usd?: number;
  ipca: number;
  cdi: number;
  alpha_vs_vwra: number;
}

interface RetornosMensais {
  annual_returns: AnnualReturn[];
}

interface DashboardData {
  retornos_mensais: RetornosMensais;
}

let data: DashboardData;

beforeAll(() => {
  // Load data.json from dashboard/public directory
  const dataPath = resolve(__dirname, '../../react-app/public/data.json');
  const dataContent = readFileSync(dataPath, 'utf-8');
  data = JSON.parse(dataContent) as DashboardData;
});

describe('Annual Returns Schema Validation', () => {

  // ─────────────────────────────────────────────────────────────
  // 1. COMPLETENESS: All fields present
  // ─────────────────────────────────────────────────────────────

  describe('All years have required fields', () => {
    it('annual_returns should exist and be an array', () => {
      expect(data.retornos_mensais).toBeDefined();
      expect(data.retornos_mensais.annual_returns).toBeDefined();
      expect(Array.isArray(data.retornos_mensais.annual_returns)).toBe(true);
      expect(data.retornos_mensais.annual_returns.length).toBeGreaterThan(0);
    });

    it('every year should have: year, months, twr_nominal_brl, twr_real_brl', () => {
      const requiredFields = ['year', 'months', 'twr_nominal_brl', 'twr_real_brl'];

      for (const yr of data.retornos_mensais.annual_returns) {
        for (const field of requiredFields) {
          expect(yr).toHaveProperty(field);
        }
      }
    });

    it('every year should have ipca and cdi', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr).toHaveProperty('ipca');
        expect(yr).toHaveProperty('cdi');
        expect(typeof yr.ipca).toBe('number');
        expect(typeof yr.cdi).toBe('number');
      }
    });

    it('NEW FIELD (2026-04-23): every year should have alpha_vs_vwra', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr).toHaveProperty('alpha_vs_vwra');
        expect(typeof yr.alpha_vs_vwra).toBe('number');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. DATA TYPES: All fields are correct type
  // ─────────────────────────────────────────────────────────────

  describe('Field types are correct', () => {
    it('year should be a positive integer', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(typeof yr.year).toBe('number');
        expect(Number.isInteger(yr.year)).toBe(true);
        expect(yr.year).toBeGreaterThan(2000);
      }
    });

    it('months should be an integer between 1 and 12', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(typeof yr.months).toBe('number');
        expect(Number.isInteger(yr.months)).toBe(true);
        expect(yr.months).toBeGreaterThanOrEqual(1);
        expect(yr.months).toBeLessThanOrEqual(12);
      }
    });

    it('twr values should be numbers', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(typeof yr.twr_nominal_brl).toBe('number');
        expect(typeof yr.twr_real_brl).toBe('number');
      }
    });

    it('ipca and cdi should be numbers', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(typeof yr.ipca).toBe('number');
        expect(typeof yr.cdi).toBe('number');
      }
    });

    it('alpha_vs_vwra should be a number', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(typeof yr.alpha_vs_vwra).toBe('number');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. SANITY CHECKS: Values are in reasonable ranges
  // ─────────────────────────────────────────────────────────────

  describe('Values are in reasonable ranges', () => {
    it('twr_nominal_brl and twr_real_brl should be between -100% and +500%', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.twr_nominal_brl).toBeGreaterThan(-100);
        expect(yr.twr_nominal_brl).toBeLessThan(500);
        expect(yr.twr_real_brl).toBeGreaterThan(-100);
        expect(yr.twr_real_brl).toBeLessThan(500);
      }
    });

    it('ipca and cdi should be between 0% and 30%', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.ipca).toBeGreaterThan(0);
        expect(yr.ipca).toBeLessThan(30);
        expect(yr.cdi).toBeGreaterThan(0);
        expect(yr.cdi).toBeLessThan(30);
      }
    });

    it('alpha_vs_vwra should be between -50% and +50%', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.alpha_vs_vwra).toBeGreaterThan(-50);
        expect(yr.alpha_vs_vwra).toBeLessThan(50);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. INTEGRITY: No critical null values
  // ─────────────────────────────────────────────────────────────

  describe('No critical null values', () => {
    it('no year should be null', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.year).not.toBeNull();
      }
    });

    it('no twr_nominal_brl should be null', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.twr_nominal_brl).not.toBeNull();
      }
    });

    it('no twr_real_brl should be null', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.twr_real_brl).not.toBeNull();
      }
    });

    it('no alpha_vs_vwra should be null', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.alpha_vs_vwra).not.toBeNull();
      }
    });

    it('no ipca should be null', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.ipca).not.toBeNull();
      }
    });

    it('no cdi should be null', () => {
      for (const yr of data.retornos_mensais.annual_returns) {
        expect(yr.cdi).not.toBeNull();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. CONSISTENCY: Years are in order, no duplicates
  // ─────────────────────────────────────────────────────────────

  describe('Year ordering and uniqueness', () => {
    it('years should be unique', () => {
      const years = data.retornos_mensais.annual_returns.map(yr => yr.year);
      const uniqueYears = new Set(years);

      expect(uniqueYears.size).toBe(years.length);
    });

    it('years should be in ascending order', () => {
      const years = data.retornos_mensais.annual_returns.map(yr => yr.year);

      for (let i = 1; i < years.length; i++) {
        expect(years[i]).toBeGreaterThan(years[i - 1]);
      }
    });

    it('should span at least 5 years', () => {
      const years = data.retornos_mensais.annual_returns.map(yr => yr.year);
      const span = years[years.length - 1] - years[0] + 1;

      expect(span).toBeGreaterThanOrEqual(5);
    });
  });
});
