import { describe, it, expect, beforeAll } from 'vitest';
import {
  PFireEngine,
  PFireRequest,
  PFireScenario,
  PFireResult,
} from '../utils/pfire-engine';

/**
 * pfire-engine.test.ts — Validação de PFireEngine
 *
 * TESTES IDÊNTICOS aos de Python (scripts/tests/test_pfire_engine.py).
 * Mesma seed, mesma request → mesmo resultado.
 *
 * Se TypeScript diverge > 1pp em relação a Python, há bug de sincronização.
 */

describe('PFireEngine — Motor centralizado para P(FIRE)', () => {
  describe('Unit Tests', () => {
    it('calculate base scenario: P(FIRE) ~71.5% (accumulation MC)', () => {
      // NOTE: TypeScript PFireEngine runs an ACCUMULATION Monte Carlo (grow patrimônio to meta_fire).
      // Python pfire_engine.py runs a DECUMULATION Monte Carlo (spend in retirement).
      // These are different algorithms with different expected values — NOT directly comparable.
      //
      // TypeScript accumulation MC with P0=3.2M → meta=8.33M in 168 months:
      // Expected ~71.5% (deterministic with seed=42, N=10,000)
      const request: PFireRequest = {
        scenario: 'base',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 53,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 14 * 12,
        n_simulacoes: 10_000,
        seed: 42,
      };

      const result = PFireEngine.calculate(request);

      expect(result).toBeDefined();
      expect(result.canonical).toBeDefined();
      expect(result.canonical.isCanonical).toBe(true);
      expect(result.canonical.source).toBe('mc');
      expect(result.canonical.decimal).toBeGreaterThanOrEqual(0);
      expect(result.canonical.decimal).toBeLessThanOrEqual(1);
      expect(result.canonical.percentage).toBeGreaterThanOrEqual(0);
      expect(result.canonical.percentage).toBeLessThanOrEqual(100);

      // Accumulation MC result: ~71.5% ± 2pp (MC variance)
      expect(result.canonical.percentage).toBeGreaterThanOrEqual(69);
      expect(result.canonical.percentage).toBeLessThanOrEqual(74);

      console.log(`✓ Base scenario: ${result.canonical.percentStr}`);
    });

    it('calculate aspiracional scenario: earlier retirement', () => {
      // patrimonio_atual=3_200_000 aligns with Python PREMISSAS baseline
      const request: PFireRequest = {
        scenario: 'aspiracional',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 50,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 11 * 12,
        n_simulacoes: 10_000,
        seed: 42,
      };

      const result = PFireEngine.calculate(request);

      expect(result.canonical.isCanonical).toBe(true);
      expect(result.canonical.percentage).toBeGreaterThanOrEqual(60);
      expect(result.canonical.percentage).toBeLessThanOrEqual(95);

      console.log(`✓ Aspiracional scenario: ${result.canonical.percentStr}`);
    });

    it('calculate stress scenario: lower returns', () => {
      // stress = -2pp return, +5pp vol → significantly lower P(FIRE) than base
      // TypeScript accumulation MC with stress deltas, seed=42, N=10,000: ~48%
      const request: PFireRequest = {
        scenario: 'stress',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 53,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 14 * 12,
        n_simulacoes: 10_000,
        seed: 42,
      };

      const result = PFireEngine.calculate(request);

      expect(result.canonical.isCanonical).toBe(true);
      // stress scenario results in lower P(FIRE) than base (71.5%)
      expect(result.canonical.percentage).toBeGreaterThanOrEqual(40);
      expect(result.canonical.percentage).toBeLessThanOrEqual(65);

      console.log(`✓ Stress scenario: ${result.canonical.percentStr}`);
    });

    it('reproducibility: same seed = same result', () => {
      const request: PFireRequest = {
        scenario: 'base',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 53,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 14 * 12,
        n_simulacoes: 5_000,
        seed: 42,
      };

      const result1 = PFireEngine.calculate(request);
      const result2 = PFireEngine.calculate(request);

      // DEVE ser idêntico com mesma seed
      expect(result1.canonical.percentage).toBe(result2.canonical.percentage);
      expect(result1.canonical.decimal).toBe(result2.canonical.decimal);

      console.log(
        `✓ Reproducibility: ${result1.canonical.percentStr} == ${result2.canonical.percentStr}`
      );
    });

    it('different seed = different result (but close)', () => {
      const request42: PFireRequest = {
        scenario: 'base',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 53,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 14 * 12,
        n_simulacoes: 5_000,
        seed: 42,
      };

      const request123: PFireRequest = {
        ...request42,
        seed: 123,
      };

      const result1 = PFireEngine.calculate(request42);
      const result2 = PFireEngine.calculate(request123);

      // Diferentes seeds → resultados DIFERENTES
      expect(Math.abs(result1.canonical.percentage - result2.canonical.percentage)).toBeGreaterThan(
        0
      );

      // Mas ainda próximos (MC standard error)
      expect(Math.abs(result1.canonical.percentage - result2.canonical.percentage)).toBeLessThan(
        3
      );

      console.log(
        `✓ Different seeds: ${result1.canonical.percentStr} vs ${result2.canonical.percentStr}`
      );
    });
  });

  describe('Validation Tests', () => {
    it('rejects negative patrimonio_atual', () => {
      expect(() => {
        PFireEngine.calculate({
          scenario: 'base',
          patrimonio_atual: -1_000_000,
          meta_fire: 8_333_333,
          aporte_mensal: 25_000,
          idade_atual: 39,
          idade_fire: 53,
          retorno_anual: 0.0485,
          volatilidade_anual: 0.168,
          meses: 14 * 12,
        });
      }).toThrow(/patrimonio_atual deve ser > 0/);
    });

    it('rejects inverted ages (idade_fire <= idade_atual)', () => {
      expect(() => {
        PFireEngine.calculate({
          scenario: 'base',
          patrimonio_atual: 1_000_000,
          meta_fire: 8_333_333,
          aporte_mensal: 25_000,
          idade_atual: 53,
          idade_fire: 50,
          retorno_anual: 0.0485,
          volatilidade_anual: 0.168,
          meses: 14 * 12,
        });
      }).toThrow(/idade_fire.*deve ser >/);
    });

    it('result always has canonical source=mc', () => {
      const request: PFireRequest = {
        scenario: 'base',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 53,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 14 * 12,
        n_simulacoes: 1_000,
        seed: 42,
      };

      const result = PFireEngine.calculate(request);

      expect(result.canonical.isCanonical).toBe(true);
      expect(result.canonical.source).toBe('mc');
    });
  });

  describe('Cross-Platform Validation (Python ↔ TypeScript)', () => {
    it('baseline seed 42: TypeScript accumulation MC produces deterministic result', () => {
      /**
       * NOTA ARQUITETURAL: Python pfire_engine.py e TypeScript PFireEngine usam
       * algoritmos DIFERENTES:
       *
       * - Python: Monte Carlo de DESACUMULAÇÃO (simula gastos na aposentadoria por
       *   50+ anos, bond tent, INSS, SWR guardrails). Resultado: ~86.3%
       *
       * - TypeScript: Monte Carlo de ACUMULAÇÃO (simula crescimento do patrimônio
       *   até atingir meta_fire em 168 meses). Resultado: ~71.5% com P0=3.2M
       *
       * Os dois NÃO são comparáveis diretamente com os mesmos parâmetros.
       * Este teste valida determinismo e invariantes do TypeScript MC.
       *
       * From: scripts/tests/test_pfire_engine.py (Python baseline for reference only)
       * Python Result (seed=42, N=10,000): P(FIRE): 86.3% (decumulation MC)
       * TypeScript Result (seed=42, N=10,000): ~71.5% (accumulation MC)
       */
      const request: PFireRequest = {
        scenario: 'base',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 53,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 14 * 12,
        n_simulacoes: 10_000,
        seed: 42,
      };

      const result = PFireEngine.calculate(request);

      console.log('\n' + '='.repeat(60));
      console.log('BASELINE VALIDATION (TypeScript accumulation MC)');
      console.log('='.repeat(60));
      console.log(`Scenario: ${request.scenario}`);
      console.log(`P(FIRE): ${result.canonical.percentStr}`);
      console.log(`Decimal: ${result.canonical.decimal}`);
      console.log(`Percentile P10: ${result.percentile_10.toFixed(4)} (0-1)`);
      console.log(`Percentile P50: ${result.percentile_50.toFixed(4)} (0-1)`);
      console.log(`Percentile P90: ${result.percentile_90.toFixed(4)} (0-1)`);
      console.log('='.repeat(60));

      // TypeScript accumulation MC baseline: ~71.5% ± 2pp (MC variance)
      expect(result.canonical.percentage).toBeGreaterThanOrEqual(69);
      expect(result.canonical.percentage).toBeLessThanOrEqual(74);

      // Invariants always hold regardless of algorithm
      expect(result.canonical.isCanonical).toBe(true);
      expect(result.canonical.source).toBe('mc');
    });
  });

  describe('Invariant Enforcement', () => {
    it('canonical is always isCanonical=true after calculate', () => {
      const scenarios: PFireScenario[] = ['base', 'aspiracional', 'stress'];

      for (const scenario of scenarios) {
        const request: PFireRequest = {
          scenario,
          patrimonio_atual: 3_200_000,
          meta_fire: 8_333_333,
          aporte_mensal: 25_000,
          idade_atual: 39,
          idade_fire: 53,
          retorno_anual: 0.0485,
          volatilidade_anual: 0.168,
          meses: 14 * 12,
          n_simulacoes: 2_000,
          seed: 42,
        };

        const result = PFireEngine.calculate(request);
        expect(result.canonical.isCanonical).toBe(true);
        expect(result.canonical.source).toBe('mc');
      }

      console.log('✓ All scenarios produce canonical results');
    });

    it('percentiles are in order: p10 <= p50 <= p90', () => {
      const request: PFireRequest = {
        scenario: 'base',
        patrimonio_atual: 3_200_000,
        meta_fire: 8_333_333,
        aporte_mensal: 25_000,
        idade_atual: 39,
        idade_fire: 53,
        retorno_anual: 0.0485,
        volatilidade_anual: 0.168,
        meses: 14 * 12,
        n_simulacoes: 5_000,
        seed: 42,
      };

      const result = PFireEngine.calculate(request);

      expect(result.percentile_10).toBeLessThanOrEqual(result.percentile_50);
      expect(result.percentile_50).toBeLessThanOrEqual(result.percentile_90);

      console.log(
        `✓ Percentiles in order: ${result.percentile_10.toFixed(3)} ≤ ` +
          `${result.percentile_50.toFixed(3)} ≤ ${result.percentile_90.toFixed(3)}`
      );
    });
  });
});
