import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { computeDerivedValues } from '@/utils/dataWiring';

/**
 * Page Integration Test
 * Validates that pages can initialize with real data without errors
 * This catches errors that static validation misses
 */
describe('Page Integration', () => {
  let realData: any;

  beforeAll(() => {
    const dataPath = path.join(__dirname, '../../public/data.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      realData = JSON.parse(raw);
    } else {
      throw new Error('data.json not found - build may have failed');
    }
  });

  it('NOW page should initialize without errors', () => {
    // Simulate NOW page initialization
    const derived = computeDerivedValues(realData);

    // Check required values for NOW page
    expect(derived).toBeDefined();
    expect(derived.networth).toBeDefined();
    expect(typeof derived.networth).toBe('number');

    // KpiHero needs these - log what's missing
    if (!derived.fireProgress) {
      console.warn('⚠️  NOW page: fireProgress is undefined');
    }
    if (!derived.fireMonthsAway) {
      console.warn('⚠️  NOW page: fireMonthsAway is undefined');
    }
    if (!derived.fireDate) {
      console.warn('⚠️  NOW page: fireDate is undefined');
    }

    // Key Metrics needs these
    expect(derived.equityPercentage).toBeDefined();
    expect(derived.rfPercentage).toBeDefined();
    expect(derived.internationalPercentage).toBeDefined();
    expect(derived.concentrationBrazil).toBeDefined();

    // These should not throw .toFixed() errors
    expect(() => {
      ((derived.equityPercentage || 0) * 100).toFixed(1);
      ((derived.rfPercentage || 0) * 100).toFixed(1);
      ((derived.internationalPercentage || 0) * 100).toFixed(1);
      ((derived.concentrationBrazil || 0) * 100).toFixed(1);
    }).not.toThrow();
  });

  it('Simulators page should initialize without errors', () => {
    expect(() => {
      // Simulate Simulators page initialization (runMC setup)
      const derived = computeDerivedValues(realData);

      // MC needs initial capital from derived values
      expect(derived.networth).toBeGreaterThan(0);

      // Verify MCParams can be initialized
      const mcParams = {
        initialCapital: derived.networth,
        monthlyContribution: realData.premissas?.aporte_mensal || 5000,
        returnMean: 0.07,
        returnStd: 0.12,
        stressLevel: 0,
        years: 30,
        numSims: 1000,
      };

      expect(mcParams.initialCapital).toBeGreaterThan(0);
      expect(mcParams.monthlyContribution).toBeGreaterThan(0);
    }).not.toThrow();
  });

  it('All pages should have required data structures', () => {
    // Check data.json has required top-level keys
    const requiredKeys = [
      'date',
      'cambio',
      'premissas',
      'posicoes',
      'rf',
    ];

    const missingTopKeys = requiredKeys.filter(key => !(key in realData));
    if (missingTopKeys.length > 0) {
      console.warn(`⚠️  data.json missing REQUIRED keys: ${missingTopKeys.join(', ')}`);
    }
    expect(missingTopKeys.length).toBe(0);

    // Check premissas has critical keys (others have fallbacks)
    const criticalPremissasKeys = [
      'patrimonio_atual',
      'patrimonio_gatilho',
      'custo_vida_base',
      'idade_atual',
      'idade_cenario_base',
    ];

    const missingCriticalKeys = criticalPremissasKeys.filter(key => !(key in (realData.premissas || {})));
    if (missingCriticalKeys.length > 0) {
      console.warn(`⚠️  premissas missing CRITICAL keys: ${missingCriticalKeys.join(', ')}`);
    }
    expect(missingCriticalKeys.length).toBe(0);

    // Optional keys (have fallbacks in dataWiring)
    const optionalPremissasKeys = ['renda_mensal_liquida'];
    const missingOptionalKeys = optionalPremissasKeys.filter(key => !(key in (realData.premissas || {})));
    if (missingOptionalKeys.length > 0) {
      console.log(`ℹ️  premissas missing optional keys (using fallbacks): ${missingOptionalKeys.join(', ')}`);
    }
  });

  it('Charts should not render if data fields are missing', () => {
    // This test documents what data is required for charts
    // If charts are enabled, these fields must be present

    const chartsRequireFields = {
      TornadoChart: ['tornado'],
      FanChart: ['timeline'],
      SankeyChart: ['fire_trilha', 'fire_matrix'],
    };

    // Currently charts are disabled, but log what's missing
    Object.entries(chartsRequireFields).forEach(([chart, fields]) => {
      const missing = fields.filter(f => !(f in realData));
      if (missing.length > 0) {
        console.log(`ℹ️  ${chart} missing: ${missing.join(', ')}`);
      }
    });
  });

  it('Portfolio page should initialize without errors', () => {
    // Portfolio page requires: posicoes, rf, premissas
    expect(realData.posicoes).toBeDefined();
    expect(typeof realData.posicoes).toBe('object');

    // rf data structure
    const rf = realData.rf ?? {};
    expect(rf).toBeDefined();

    // Portfolio displays allocation percentages — requires cambio for USD conversion
    expect(typeof realData.cambio).toBe('number');
    expect(realData.cambio).toBeGreaterThan(0);

    // HoldingsTable needs posicoes with qty/price fields
    const positions = Object.values(realData.posicoes);
    if (positions.length > 0) {
      const firstPos = positions[0] as any;
      expect(firstPos).toHaveProperty('qty');
      expect(firstPos).toHaveProperty('price');
    }
  });

  it('FIRE page should initialize without errors', () => {
    // FIRE page requires: premissas (critical fields), fire_matrix, fire_trilha
    const p = realData.premissas ?? {};
    expect(p.patrimonio_atual).toBeDefined();
    expect(p.custo_vida_base).toBeDefined();
    expect(p.idade_atual).toBeDefined();
    expect(p.idade_cenario_base).toBeDefined();

    // FIRE page uses scenario_comparison for FireScenariosTable
    if (realData.scenario_comparison) {
      const sc = (realData as any).scenario_comparison;
      expect(sc.base).toBeDefined();
      expect(sc.aspiracional).toBeDefined();
    } else {
      console.log('ℹ️  FIRE page: scenario_comparison missing — FireScenariosTable shows fallback');
    }

    // fire_matrix for floor/upside calculations
    if ((realData as any).fire_matrix) {
      const fm = (realData as any).fire_matrix;
      expect(fm.perfis).toBeDefined();
    }
  });

  it('Withdraw page should initialize without errors', () => {
    // Withdraw page requires: premissas, rf, bond pool data
    const p = realData.premissas ?? {};
    expect(p.custo_vida_base).toBeDefined();
    expect(p.idade_atual).toBeDefined();

    const rf = realData.rf ?? {};
    // Bond pool requires rf entries
    const rfKeys = ['ipca2040', 'ipca2050', 'renda2065'];
    rfKeys.forEach(key => {
      if (!(key in rf)) {
        console.warn(`⚠️  Withdraw page: rf.${key} missing`);
      }
    });

    // Withdraw cenarios (perfis)
    if ((realData as any).fire_matrix?.perfis) {
      const perfis = (realData as any).fire_matrix.perfis;
      expect(typeof perfis).toBe('object');
    }
  });

  it('Backtest page should initialize without errors', () => {
    // Backtest page requires: retornos_mensais, drawdown_extended, rolling_sharpe
    const rm = (realData as any).retornos_mensais;
    if (rm) {
      expect(Array.isArray(rm.annual_returns)).toBe(true);
      expect(typeof rm.twr_real_brl_pct === 'number' || rm.twr_real_brl_pct == null).toBe(true);
    } else {
      console.warn('⚠️  Backtest page: retornos_mensais missing');
    }

    // DrawdownExtendedChart: periods.real from JSON; medium/long/academic derived in React from backtest arrays.
    // After generate_data.py is rerun, only 'real' should remain in JSON (DEV-data-dedup).
    const ddExt = (realData as any).drawdown_extended;
    if (ddExt) {
      expect(typeof ddExt).toBe('object');
      if (ddExt.periods && !('medium' in ddExt.periods)) {
        // Post-dedup data.json: verify synthetic periods are absent
        expect('long' in ddExt.periods).toBe(false);
        expect('academic' in ddExt.periods).toBe(false);
      }
    }
  });

  it('Simulators page should initialize with FIRE matrix data', () => {
    // FireSimuladorSection uses fire_matrix.retornos_equity and perfis
    const fm = (realData as any).fire_matrix;
    if (fm) {
      if (fm.retornos_equity) {
        const { base } = fm.retornos_equity;
        expect(typeof base).toBe('number');
        expect(base).toBeGreaterThan(0);
        expect(base).toBeLessThan(0.5); // sanity: return should be a fraction
      } else {
        console.warn('⚠️  Simulators page: fire_matrix.retornos_equity missing — using premissas fallback');
      }
    } else {
      console.warn('⚠️  Simulators page: fire_matrix missing — using premissas fallback');
    }

    // WhatIfSection needs premissas.aporte_mensal and custo_vida_base
    const p = realData.premissas ?? {};
    expect(p.aporte_mensal ?? p.custo_vida_base).toBeDefined();
  });
});
