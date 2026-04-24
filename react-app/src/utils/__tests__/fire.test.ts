/**
 * fire.test.ts — Unit tests for centralized FIRE utility functions
 *
 * These functions are the SINGLE SOURCE OF TRUTH for all P(FIRE) colors,
 * labels and fire-year calculations. Every test here documents a contract
 * that callers must respect.
 */

import { describe, it, expect } from 'vitest';
import { pfireColor, pfireLabel, calcFireYear, getAnoAtual, getIdadeAtual } from '../fire';

// ── pfireColor ────────────────────────────────────────────────────────────────

describe('pfireColor', () => {
  it('returns green for p >= 90', () => {
    expect(pfireColor(90)).toBe('var(--green)');
    expect(pfireColor(95)).toBe('var(--green)');
    expect(pfireColor(100)).toBe('var(--green)');
    expect(pfireColor(90.1)).toBe('var(--green)');
  });

  it('returns yellow for 85 <= p < 90', () => {
    expect(pfireColor(85)).toBe('var(--yellow)');
    expect(pfireColor(87.5)).toBe('var(--yellow)');
    expect(pfireColor(89.9)).toBe('var(--yellow)');
  });

  it('returns red for p < 85', () => {
    expect(pfireColor(84.9)).toBe('var(--red)');
    expect(pfireColor(80)).toBe('var(--red)');
    expect(pfireColor(0)).toBe('var(--red)');
  });

  it('returns muted for null', () => {
    expect(pfireColor(null)).toBe('var(--muted)');
  });

  it('returns muted for undefined', () => {
    expect(pfireColor(undefined)).toBe('var(--muted)');
  });

  // Boundary guard: old thresholds that were wrong (88/80) must NOT produce green/yellow
  it('does NOT treat 88 as green (old NOW tab threshold)', () => {
    expect(pfireColor(88)).toBe('var(--yellow)');
  });

  it('does NOT treat 80 as yellow (old NOW tab threshold)', () => {
    expect(pfireColor(80)).toBe('var(--red)');
  });
});

// ── pfireLabel ────────────────────────────────────────────────────────────────

describe('pfireLabel', () => {
  it('returns ON TRACK for p >= 90', () => {
    expect(pfireLabel(90)).toBe('ON TRACK');
    expect(pfireLabel(100)).toBe('ON TRACK');
  });

  it('returns ADEQUADO for 85 <= p < 90', () => {
    expect(pfireLabel(85)).toBe('ADEQUADO');
    expect(pfireLabel(89)).toBe('ADEQUADO');
  });

  it('returns ATENÇÃO for p < 85', () => {
    expect(pfireLabel(84)).toBe('ATENÇÃO');
    expect(pfireLabel(0)).toBe('ATENÇÃO');
  });

  it('returns — for null/undefined', () => {
    expect(pfireLabel(null)).toBe('—');
    expect(pfireLabel(undefined)).toBe('—');
  });
});

// ── calcFireYear ──────────────────────────────────────────────────────────────

describe('calcFireYear', () => {
  // Reference scenario matching carteira.md premissas
  const APORTE    = 25_000;           // R$25k/mês (carteira.md aporte_mensal)
  const RETORNO   = 0.0485;           // 4.85% real — ALWAYS a fraction, never %
  const CUSTO     = 250_000;          // R$250k/ano (spending_atual)
  const AGE       = 39;
  const ANO_ATUAL = 2026;
  const PAT       = 3_472_335;        // R$3.472M (patrimonio atual)
  const SWR       = 0.03;             // 3% (swr_gatilho)

  it('returns a result when target is reachable within 30 years', () => {
    const result = calcFireYear(APORTE, RETORNO, CUSTO, AGE, ANO_ATUAL, PAT, SWR);
    expect(result).not.toBeNull();
  });

  it('result.idade is between 39 and 69 (30-year window)', () => {
    const result = calcFireYear(APORTE, RETORNO, CUSTO, AGE, ANO_ATUAL, PAT, SWR);
    expect(result!.idade).toBeGreaterThanOrEqual(AGE);
    expect(result!.idade).toBeLessThanOrEqual(AGE + 30);
  });

  it('result.ano == anoAtual + (result.idade - currentAge)', () => {
    const result = calcFireYear(APORTE, RETORNO, CUSTO, AGE, ANO_ATUAL, PAT, SWR);
    expect(result!.ano).toBe(ANO_ATUAL + (result!.idade - AGE));
  });

  it('swrAtFire = custo / pat at the FIRE year', () => {
    const result = calcFireYear(APORTE, RETORNO, CUSTO, AGE, ANO_ATUAL, PAT, SWR);
    expect(result!.swrAtFire).toBeCloseTo(CUSTO / result!.pat, 6);
  });

  it('swrAtFire <= swrTarget (at FIRE, pat >= custo/swr)', () => {
    const result = calcFireYear(APORTE, RETORNO, CUSTO, AGE, ANO_ATUAL, PAT, SWR);
    expect(result!.swrAtFire).toBeLessThanOrEqual(SWR + 1e-9);
  });

  it('returns null if FIRE not reachable in 30 years (very high cost)', () => {
    const impossibleCusto = 10_000_000; // R$10M/ano, target R$333M — unreachable
    const result = calcFireYear(APORTE, RETORNO, impossibleCusto, AGE, ANO_ATUAL, PAT, SWR);
    expect(result).toBeNull();
  });

  it('reaches FIRE immediately if patrimônio already >= target', () => {
    const alreadyFire = CUSTO / SWR; // exactly at target
    const result = calcFireYear(APORTE, RETORNO, CUSTO, AGE, ANO_ATUAL, alreadyFire, SWR);
    expect(result!.idade).toBe(AGE);
    expect(result!.ano).toBe(ANO_ATUAL);
  });

  // CRITICAL: retorno must be a fraction, not a percentage.
  // Passing 4.85 instead of 0.0485 would be 100x wrong.
  it('fraction retorno (0.0485) gives earlier fire year than percentage (4.85)', () => {
    const correctResult  = calcFireYear(APORTE, 0.0485, CUSTO, AGE, ANO_ATUAL, PAT, SWR);
    const wrongPctResult = calcFireYear(APORTE, 4.85,   CUSTO, AGE, ANO_ATUAL, PAT, SWR);
    // With 485% annual return the result would be immediate (year 0);
    // With 4.85% real it takes several years — correct must be later
    expect(correctResult!.idade).toBeGreaterThan(wrongPctResult!.idade);
  });

  it('anoAtual param controls returned ano (not hardcoded 2026)', () => {
    const r2026 = calcFireYear(APORTE, RETORNO, CUSTO, AGE, 2026, PAT, SWR);
    const r2030 = calcFireYear(APORTE, RETORNO, CUSTO, AGE, 2030, PAT, SWR);
    // Same patrimônio/aporte/retorno → same number of years to fire, just shifted
    const yearsToFire2026 = r2026!.ano - 2026;
    const yearsToFire2030 = r2030!.ano - 2030;
    expect(yearsToFire2030).toBe(yearsToFire2026); // relative distance unchanged
    expect(r2030!.ano).toBeGreaterThan(r2026!.ano); // absolute ano shifts with anoAtual
  });
});

// ── getAnoAtual / getIdadeAtual ───────────────────────────────────────────────

describe('getAnoAtual', () => {
  it('reads ano_atual from premissas', () => {
    expect(getAnoAtual({ ano_atual: 2030 })).toBe(2030);
  });

  it('falls back to current year when premissas is null', () => {
    const year = new Date().getFullYear();
    expect(getAnoAtual(null)).toBe(year);
  });

  it('falls back when ano_atual is missing', () => {
    const year = new Date().getFullYear();
    expect(getAnoAtual({})).toBe(year);
  });
});

describe('getIdadeAtual', () => {
  it('reads idade_atual from premissas', () => {
    expect(getIdadeAtual({ idade_atual: 42 })).toBe(42);
  });

  it('falls back to 39 when premissas is null', () => {
    expect(getIdadeAtual(null)).toBe(39);
  });

  it('falls back when idade_atual is missing', () => {
    expect(getIdadeAtual({})).toBe(39);
  });
});
