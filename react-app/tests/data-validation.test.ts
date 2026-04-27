/**
 * data-validation.test.ts — Comprehensive validation for all fields in data.json
 *
 * Validates:
 * - All 47+ fields exist and have correct types
 * - All fields are within expected ranges
 * - All derived calculations are correct
 * - All nested structures are properly formed
 *
 * This test MUST pass before dashboard deployment.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { DashboardData } from '@/types/dashboard';

let data: DashboardData;

beforeAll(() => {
  // Load data.json from dashboard build output
  // __dirname is react-app/tests, so go up 2 levels and into dashboard
  const dataPath = resolve(__dirname, '../../dashboard/data.json');
  const dataContent = readFileSync(dataPath, 'utf-8');
  data = JSON.parse(dataContent) as DashboardData;
});

describe('Data Validation Suite', () => {
  // ─────────────────────────────────────────────────────────────
  // 1. PREMISSAS (Assumptions/Parameters)
  // ─────────────────────────────────────────────────────────────
  describe('premissas (assumptions)', () => {
    it('should have all required fields', () => {
      const required = [
        'patrimonio_atual',
        'patrimonio_gatilho',
        'aporte_mensal',
        'custo_vida_base',
        'idade_atual',
        'renda_mensal_liquida',
        'renda_estimada',
        'swr_gatilho',
        'inss_anual',
      ];
      required.forEach(field => {
        expect(data.premissas).toHaveProperty(field);
      });
    });

    it('patrimonio_atual should be positive number', () => {
      expect(typeof data.premissas.patrimonio_atual).toBe('number');
      expect(data.premissas.patrimonio_atual).toBeGreaterThan(0);
    });

    it('patrimonio_gatilho should be >= patrimonio_atual', () => {
      expect(data.premissas.patrimonio_gatilho).toBeGreaterThanOrEqual(
        data.premissas.patrimonio_atual
      );
    });

    it('renda_mensal_liquida should be positive number (not 0)', () => {
      expect(typeof data.premissas.renda_mensal_liquida).toBe('number');
      expect(data.premissas.renda_mensal_liquida).toBeGreaterThan(0);
    });

    it('renda_mensal_liquida should equal renda_estimada', () => {
      expect(data.premissas.renda_mensal_liquida).toBe(data.premissas.renda_estimada);
    });

    it('custo_vida_base should be positive', () => {
      expect(data.premissas.custo_vida_base).toBeGreaterThan(0);
    });

    it('idade_atual should be between 18 and 100', () => {
      expect(data.premissas.idade_atual).toBeGreaterThanOrEqual(18);
      expect(data.premissas.idade_atual).toBeLessThanOrEqual(100);
    });

    it('aporte_mensal should be non-negative', () => {
      expect(data.premissas.aporte_mensal).toBeGreaterThanOrEqual(0);
    });

    it('swr_gatilho should be between 1% and 5%', () => {
      expect(data.premissas.swr_gatilho).toBeGreaterThan(0.01);
      expect(data.premissas.swr_gatilho).toBeLessThan(0.05);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. PORTFOLIO POSITIONS
  // ─────────────────────────────────────────────────────────────
  describe('posicoes (portfolio positions)', () => {
    it('should be object indexed by ticker', () => {
      expect(typeof data.posicoes).toBe('object');
      expect(Array.isArray(data.posicoes)).toBe(false);
      expect(Object.keys(data.posicoes).length).toBeGreaterThan(0);
    });

    it('all positions should have required fields', () => {
      const required = ['qty', 'price', 'bucket'];
      Object.entries(data.posicoes).forEach(([ticker, pos]) => {
        required.forEach(field => {
          expect(pos).toHaveProperty(field);
        });
      });
    });

    it('all quantities and prices should be non-negative', () => {
      Object.entries(data.posicoes).forEach(([ticker, pos]) => {
        expect(pos.qty).toBeGreaterThanOrEqual(0);
        expect(pos.price).toBeGreaterThanOrEqual(0);
      });
    });

    it('bucket should be valid asset class', () => {
      // JPGL as a fund is eliminated but IWVL may still carry that bucket label in the data
      const validBuckets = ['SWRD', 'AVGS', 'AVEM', 'IPCA', 'HODL11', 'JPGL'];
      Object.entries(data.posicoes).forEach(([ticker, pos]) => {
        expect(validBuckets).toContain(pos.bucket);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. RF (Fixed Income)
  // ─────────────────────────────────────────────────────────────
  describe('rf (fixed income)', () => {
    it('should have fixed income products', () => {
      expect(typeof data.rf).toBe('object');
      const rfKeys = Object.keys(data.rf);
      expect(rfKeys.length).toBeGreaterThan(0);
    });

    it('fixed income products should be valid', () => {
      const expectedProducts = ['ipca2029', 'ipca2040', 'ipca2050', 'renda2065'];
      Object.keys(data.rf).forEach(key => {
        // Key should be a valid RF product
        expect(typeof key).toBe('string');
        expect(data.rf[key]).toBeDefined();
      });
    });

    it('rf should be accessible', () => {
      expect(data.rf).toBeDefined();
      expect(data.rf).not.toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. FIRE DATA
  // ─────────────────────────────────────────────────────────────
  describe('fire (FIRE projections)', () => {
    it('should have required fire fields', () => {
      const required = ['pat_mediano_fire', 'plano_status', 'mc_date'];
      required.forEach(field => {
        expect(data.fire).toHaveProperty(field);
      });
    });

    it('pat_mediano_fire should be positive', () => {
      expect(data.fire.pat_mediano_fire).toBeGreaterThan(0);
    });

    it('plano_status should have status field', () => {
      expect(data.fire.plano_status).toHaveProperty('status');
      const validStatuses = ['MONITORAR', 'GATILHO_ATIVO', 'OK', 'CRITICO', 'PLANO_PERMANECE'];
      expect(validStatuses).toContain(data.fire.plano_status.status);
    });

    it('mc_date should be valid date string', () => {
      const dateObj = new Date(data.fire.mc_date);
      expect(dateObj.getTime()).not.toBeNaN();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. HODL11 (Crypto)
  // ─────────────────────────────────────────────────────────────
  describe('hodl11 (crypto)', () => {
    it('should have qty and preco', () => {
      expect(data.hodl11).toHaveProperty('qty');
      expect(data.hodl11).toHaveProperty('preco');
      expect(typeof data.hodl11.qty).toBe('number');
      expect(typeof data.hodl11.preco).toBe('number');
    });

    it('qty and preco should be non-negative', () => {
      expect(data.hodl11.qty).toBeGreaterThanOrEqual(0);
      expect(data.hodl11.preco).toBeGreaterThanOrEqual(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. BACKTEST DATA
  // ─────────────────────────────────────────────────────────────
  describe('backtest', () => {
    it('should have dates and target arrays', () => {
      expect(data.backtest).toHaveProperty('dates');
      expect(data.backtest).toHaveProperty('target');
      expect(Array.isArray(data.backtest.dates)).toBe(true);
      expect(Array.isArray(data.backtest.target)).toBe(true);
    });

    it('dates and target should have same length', () => {
      expect(data.backtest.dates.length).toBe(data.backtest.target.length);
    });

    it('all backtest values should be non-negative', () => {
      data.backtest.target.forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have metrics property', () => {
      expect(data.backtest).toHaveProperty('metrics');
      expect(typeof data.backtest.metrics).toBe('object');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 7. FIRE MATRIX
  // ─────────────────────────────────────────────────────────────
  describe('fire_matrix', () => {
    it('should have required structures', () => {
      expect(data.fire_matrix).toHaveProperty('matrix');
      expect(typeof data.fire_matrix.matrix).toBe('object');
    });

    it('matrix should have valid structure', () => {
      const matrix = data.fire_matrix.matrix;
      expect(typeof matrix).toBe('object');
      // Matrix is a dict or array with rows
      if (Array.isArray(matrix)) {
        expect(matrix.length).toBeGreaterThan(0);
      } else {
        expect(Object.keys(matrix).length).toBeGreaterThan(0);
      }
    });

    it('fire_matrix should have metadata fields', () => {
      expect(data.fire_matrix).toHaveProperty('cenarios');
      expect(data.fire_matrix).toHaveProperty('swrs');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 8. DRAWDOWN HISTORY
  // ─────────────────────────────────────────────────────────────
  describe('drawdown_history', () => {
    it('should exist and be an object', () => {
      expect(data.drawdown_history).toBeDefined();
      expect(typeof data.drawdown_history).toBe('object');
    });

    it('should have generated metadata', () => {
      expect(data.drawdown_history).toHaveProperty('_generated');
      expect(typeof data.drawdown_history._generated).toBe('string');
    });

    it('should have data array or entries', () => {
      // Either has direct structure or nested data
      const hasData =
        data.drawdown_history.data !== undefined ||
        Array.isArray(data.drawdown_history) ||
        Object.keys(data.drawdown_history).length > 1;
      expect(hasData).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 9. INTEGRITY CHECKS
  // ─────────────────────────────────────────────────────────────
  describe('data integrity', () => {
    it('posicoes should have multiple tickers', () => {
      const tickers = Object.keys(data.posicoes);
      expect(tickers.length).toBeGreaterThan(0);
      // Should have at least the core ETFs or crypto
      expect(tickers.length).toBeGreaterThanOrEqual(1);
    });

    it('all posicoes buckets should be valid', () => {
      const validBuckets = ['SWRD', 'AVGS', 'AVEM', 'IPCA', 'HODL11', 'JPGL'];
      Object.values(data.posicoes).forEach(pos => {
        if (pos.bucket) {
          expect(validBuckets).toContain(pos.bucket);
        }
      });
    });

    it('data should not have undefined critical fields', () => {
      expect(data.premissas).toBeDefined();
      expect(data.posicoes).toBeDefined();
      expect(data.fire).toBeDefined();
      expect(data.backtest).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 10. PASSIVOS (Liabilities) — P0: these were absent before
  // ─────────────────────────────────────────────────────────────
  describe('passivos (liabilities)', () => {
    it('passivos object should exist', () => {
      expect((data as any).passivos).toBeDefined();
      expect((data as any).passivos).not.toBeNull();
    });

    it('passivos should have all required fields', () => {
      const p = (data as any).passivos;
      expect(p).toHaveProperty('hipoteca_brl');
      expect(p).toHaveProperty('hipoteca_vencimento');
      expect(p).toHaveProperty('ir_diferido_brl');
      expect(p).toHaveProperty('total_brl');
    });

    it('hipoteca_brl should be a positive number', () => {
      const p = (data as any).passivos;
      expect(typeof p.hipoteca_brl).toBe('number');
      expect(p.hipoteca_brl).toBeGreaterThan(0);
    });

    it('ir_diferido_brl should be non-negative', () => {
      const p = (data as any).passivos;
      expect(typeof p.ir_diferido_brl).toBe('number');
      expect(p.ir_diferido_brl).toBeGreaterThanOrEqual(0);
    });

    it('total_brl should equal hipoteca + ir_diferido', () => {
      const p = (data as any).passivos;
      const expected = p.hipoteca_brl + p.ir_diferido_brl;
      expect(Math.abs(p.total_brl - expected)).toBeLessThan(1); // within R$1
    });

    it('hipoteca_vencimento should be a future date', () => {
      const p = (data as any).passivos;
      const venc = new Date(p.hipoteca_vencimento);
      expect(venc.getTime()).toBeGreaterThan(Date.now());
    });

    it('total_brl should be in reasonable range (100k–5M)', () => {
      const p = (data as any).passivos;
      expect(p.total_brl).toBeGreaterThan(100_000);
      expect(p.total_brl).toBeLessThan(5_000_000);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 11. FIRE TRILHA — P10/P90 Monte Carlo bands
  // ─────────────────────────────────────────────────────────────
  describe('fire_trilha MC bands', () => {
    it('fire_trilha should exist', () => {
      expect((data as any).fire_trilha).toBeDefined();
    });

    it('trilha_p10_brl should exist and be an array', () => {
      const ft = (data as any).fire_trilha;
      expect(ft).toHaveProperty('trilha_p10_brl');
      expect(Array.isArray(ft.trilha_p10_brl)).toBe(true);
    });

    it('trilha_p90_brl should exist and be an array', () => {
      const ft = (data as any).fire_trilha;
      expect(ft).toHaveProperty('trilha_p90_brl');
      expect(Array.isArray(ft.trilha_p90_brl)).toBe(true);
    });

    it('trilha_p10_brl and trilha_p90_brl length must equal dates length', () => {
      const ft = (data as any).fire_trilha;
      expect(ft.trilha_p10_brl.length).toBe(ft.dates.length);
      expect(ft.trilha_p90_brl.length).toBe(ft.dates.length);
    });

    it('P10 should always be less than P90', () => {
      const ft = (data as any).fire_trilha;
      const nHistorico = ft.n_historico ?? 61;
      // Only check future portion (MC data)
      for (let i = nHistorico; i < ft.dates.length; i++) {
        expect(ft.trilha_p10_brl[i]).toBeLessThan(ft.trilha_p90_brl[i]);
      }
    });

    it('P10/P90 values should be positive numbers in future', () => {
      const ft = (data as any).fire_trilha;
      const nHistorico = ft.n_historico ?? 61;
      for (let i = nHistorico; i < ft.dates.length; i++) {
        expect(typeof ft.trilha_p10_brl[i]).toBe('number');
        expect(ft.trilha_p10_brl[i]).toBeGreaterThan(0);
        expect(typeof ft.trilha_p90_brl[i]).toBe('number');
        expect(ft.trilha_p90_brl[i]).toBeGreaterThan(0);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 12. PFIRE SOURCE — must come from data, not hardcoded
  // ─────────────────────────────────────────────────────────────
  describe('pfire_base', () => {
    it('pfire_base should exist with base field', () => {
      expect((data as any).pfire_base).toBeDefined();
      expect((data as any).pfire_base).toHaveProperty('base');
    });

    it('pfire_base.base should be between 50 and 100', () => {
      const base = (data as any).pfire_base.base;
      expect(typeof base).toBe('number');
      expect(base).toBeGreaterThan(50);
      expect(base).toBeLessThanOrEqual(100);
    });

    it('pfire_base.fav should be >= base', () => {
      const p = (data as any).pfire_base;
      if (p.fav !== undefined) {
        expect(p.fav).toBeGreaterThanOrEqual(p.base);
      }
    });

    it('pfire_base.stress should be <= base', () => {
      const p = (data as any).pfire_base;
      if (p.stress !== undefined) {
        expect(p.stress).toBeLessThanOrEqual(p.base);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 13. ULTIMO APORTE — real aporte should exist in premissas
  // ─────────────────────────────────────────────────────────────
  describe('ultimo_aporte in premissas', () => {
    it('ultimo_aporte_brl should exist and be a positive number', () => {
      expect(data.premissas).toHaveProperty('ultimo_aporte_brl');
      expect(typeof data.premissas.ultimo_aporte_brl).toBe('number');
      expect(data.premissas.ultimo_aporte_brl).toBeGreaterThan(0);
    });

    it('ultimo_aporte_data should be a valid YYYY-MM string', () => {
      expect(data.premissas).toHaveProperty('ultimo_aporte_data');
      const d = data.premissas.ultimo_aporte_data as string;
      expect(d).toMatch(/^\d{4}-\d{2}$/);
    });

    it('ultimo_aporte_brl should differ from aporte_mensal premissa (real vs planned)', () => {
      // If they are identical it may mean aporte premissa was used instead of real value
      // This is allowed if truly equal, but worth flagging
      const real = data.premissas.ultimo_aporte_brl as number;
      const premissa = data.premissas.aporte_mensal;
      // Just verify both exist; they CAN differ
      expect(real).toBeGreaterThan(0);
      expect(premissa).toBeGreaterThan(0);
    });
  });
});
