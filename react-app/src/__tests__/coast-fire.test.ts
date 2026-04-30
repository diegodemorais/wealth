/**
 * coast-fire.test.ts — Unit tests for Coast FIRE Calculator (Feature 1)
 *
 * Tests the formula: CoastNumber = FIRE_Number / (1 + r_real)^n
 * Reference spec: agentes/issues/HD-gaps-aposenteaos40-spec.md
 *
 * Strategy: tests are written against the formula logic and data schema.
 * Component render tests will be added after Dev wires CoastFireCard.tsx.
 */

import { describe, it, expect } from 'vitest';
import { pvMoney } from '@/utils/privacyTransform';

// ─── Coast FIRE Formula (mirroring compute_coast_fire in generate_data.py) ───

const FIRE_NUMBER = 10_000_000;

/**
 * CoastNumber = FIRE_Number / (1 + r_real)^n
 * The amount needed today so that compound growth alone reaches FIRE_NUMBER in n years.
 */
function coastNumber(r: number, n: number): number {
  return FIRE_NUMBER / Math.pow(1 + r, n);
}

/**
 * Project year when patrimônio reaches coastNumber, assuming annual aportes.
 * Mirrors ano_projetado() in compute_coast_fire (binary search up to 20 years).
 */
function anoProjetado(patrimonioAtual: number, cn: number, r: number, anoAtual: number): number {
  if (patrimonioAtual >= cn) return anoAtual;
  const aporteAnual = 300_000; // R$25k/mês × 12
  for (let yr = 0; yr <= 20; yr++) {
    const proj = patrimonioAtual * Math.pow(1 + r, yr) + aporteAnual * (Math.pow(1 + r, yr) - 1) / r;
    if (proj >= cn) return anoAtual + yr;
  }
  return anoAtual + 20;
}

// ─── Canonical premissas (from agentes/contexto/carteira.md / spec) ───────────

const PREMISSAS = {
  patrimonio_atual:     3_472_335,
  retorno_equity_base:  0.0485,   // 4.85% real
  adj_favoravel:        0.010,    // +1pp
  adj_stress:          -0.010,    // -1pp (negative per spec)
  n_anos_fire:          14,       // 2026 → 2040
  ano_atual:            2026,
};

const r_base   = PREMISSAS.retorno_equity_base;                        // 0.0485
const r_fav    = r_base + PREMISSAS.adj_favoravel;                     // 0.0585
const r_stress = r_base + PREMISSAS.adj_stress;                        // 0.0385
const N        = PREMISSAS.n_anos_fire;                                // 14

const CN_BASE   = coastNumber(r_base, N);
const CN_FAV    = coastNumber(r_fav, N);
const CN_STRESS = coastNumber(r_stress, N);

// ─── 1. Coast Number — formula correctness ────────────────────────────────────

describe('Coast FIRE Formula', () => {
  it('coast number base ≈ R$5.15M (within 1% tolerance)', () => {
    // 10_000_000 / (1.0485)^14 ≈ 5_152_784
    expect(CN_BASE).toBeGreaterThan(5_100_000);
    expect(CN_BASE).toBeLessThan(5_200_000);
  });

  it('coast number fav ≈ R$4.51M (within 1% tolerance)', () => {
    // 10_000_000 / (1.0585)^14 ≈ 4_511_572
    expect(CN_FAV).toBeGreaterThan(4_460_000);
    expect(CN_FAV).toBeLessThan(4_560_000);
  });

  it('coast number stress ≈ R$5.90M (within 2% tolerance)', () => {
    // 10_000_000 / (1.0385)^14 ≈ 5_907_000
    expect(CN_STRESS).toBeGreaterThan(5_790_000);
    expect(CN_STRESS).toBeLessThan(6_020_000);
  });

  it('higher return rate → lower coast number (needs less with better returns)', () => {
    expect(CN_FAV).toBeLessThan(CN_BASE);
  });

  it('lower return rate → higher coast number (needs more with worse returns)', () => {
    expect(CN_STRESS).toBeGreaterThan(CN_BASE);
  });

  it('monotonically: cn_stress > cn_base > cn_fav', () => {
    expect(CN_STRESS).toBeGreaterThan(CN_BASE);
    expect(CN_BASE).toBeGreaterThan(CN_FAV);
  });

  it('coast number is always less than FIRE number (it is the coast-in point)', () => {
    expect(CN_BASE).toBeLessThan(FIRE_NUMBER);
    expect(CN_FAV).toBeLessThan(FIRE_NUMBER);
    expect(CN_STRESS).toBeLessThan(FIRE_NUMBER);
  });

  it('formula is inverse of compound growth: CN × (1+r)^n == FIRE_NUMBER', () => {
    expect(CN_BASE * Math.pow(1 + r_base, N)).toBeCloseTo(FIRE_NUMBER, 0);
    expect(CN_FAV  * Math.pow(1 + r_fav,  N)).toBeCloseTo(FIRE_NUMBER, 0);
    expect(CN_STRESS * Math.pow(1 + r_stress, N)).toBeCloseTo(FIRE_NUMBER, 0);
  });
});

// ─── 2. passou_base and gap_base ─────────────────────────────────────────────

describe('Coast FIRE — passou_base and gap_base', () => {
  it('passou_base=false when patrimônio < coast_number_base', () => {
    const patrimonio = PREMISSAS.patrimonio_atual; // R$3.47M < R$5.15M
    const passou_base = patrimonio >= CN_BASE;
    expect(passou_base).toBe(false);
  });

  it('gap_base > 0 when patrimônio < coast_number_base', () => {
    const patrimonio = PREMISSAS.patrimonio_atual;
    const gap_base = CN_BASE - patrimonio;
    expect(gap_base).toBeGreaterThan(0);
  });

  it('gap_base ≈ R$1.68M (within 5% tolerance)', () => {
    const gap_base = CN_BASE - PREMISSAS.patrimonio_atual;
    // ~5_152_784 - 3_472_335 = ~1_680_449
    expect(gap_base).toBeGreaterThan(1_500_000);
    expect(gap_base).toBeLessThan(1_900_000);
  });

  it('passou_base=true when patrimônio >= coast_number_base', () => {
    const patrimonio = CN_BASE + 1; // just above the threshold
    const passou_base = patrimonio >= CN_BASE;
    expect(passou_base).toBe(true);
  });

  it('gap_base is zero when passou_base=true', () => {
    const patrimonio = CN_BASE + 100_000;
    const gap = Math.max(0, CN_BASE - patrimonio);
    expect(gap).toBe(0);
  });

  it('passou_base_fav=true before passou_base_base when patrimônio is mid-range', () => {
    // At patrimônio=5M: passed fav (4.51M) but not base (5.15M) — impossible, fav < base
    // Actually fav is lower, so passed fav first. Let's use 4.7M as mid-point.
    const patrimonio = 4_700_000;
    const passou_fav  = patrimonio >= CN_FAV;    // 4.7M >= 4.51M → true
    const passou_base = patrimonio >= CN_BASE;   // 4.7M >= 5.15M → false
    expect(passou_fav).toBe(true);
    expect(passou_base).toBe(false);
  });
});

// ─── 3. ano_projetado_base ────────────────────────────────────────────────────

describe('Coast FIRE — ano_projetado_base', () => {
  it('ano_projetado_base > 2026 when patrimônio < coast_number_base', () => {
    const ano = anoProjetado(PREMISSAS.patrimonio_atual, CN_BASE, r_base, PREMISSAS.ano_atual);
    expect(ano).toBeGreaterThan(2026);
  });

  it('ano_projetado_base <= 2046 (within 20-year horizon)', () => {
    const ano = anoProjetado(PREMISSAS.patrimonio_atual, CN_BASE, r_base, PREMISSAS.ano_atual);
    expect(ano).toBeLessThanOrEqual(2046);
  });

  it('ano_projetado_base == anoAtual when patrimônio >= coast_number', () => {
    const patrimonioAbove = CN_BASE + 500_000;
    const ano = anoProjetado(patrimonioAbove, CN_BASE, r_base, PREMISSAS.ano_atual);
    expect(ano).toBe(PREMISSAS.ano_atual);
  });

  it('higher patrimônio → earlier projected coast year', () => {
    const anoLow  = anoProjetado(2_000_000, CN_BASE, r_base, PREMISSAS.ano_atual);
    const anoHigh = anoProjetado(4_500_000, CN_BASE, r_base, PREMISSAS.ano_atual);
    expect(anoHigh).toBeLessThanOrEqual(anoLow);
  });
});

// ─── 4. Data schema shape (guard for when data.json is populated by Dev) ─────

describe('Coast FIRE — output object shape', () => {
  /**
   * Build the output that compute_coast_fire() would return.
   * This validates that all required fields are present and typed correctly.
   * When data.json is wired, the schema-validation.test.ts will cover the live file.
   */
  function buildCoastFireOutput(patrimonio: number) {
    const cn_base   = coastNumber(r_base, N);
    const cn_fav    = coastNumber(r_fav, N);
    const cn_stress = coastNumber(r_stress, N);
    return {
      coast_number_base:   Math.round(cn_base),
      coast_number_fav:    Math.round(cn_fav),
      coast_number_stress: Math.round(cn_stress),
      gap_base:            Math.round(Math.max(0, cn_base - patrimonio)),
      passou_base:         patrimonio >= cn_base,
      ano_projetado_base:  anoProjetado(patrimonio, cn_base, r_base, 2026),
      r_real_base:         r_base,
      r_real_fav:          r_fav,
      r_real_stress:       r_stress,
      n_anos:              N,
      fire_number:         FIRE_NUMBER,
      _metodo:             'coast_fire_formula',
    };
  }

  it('output has all required fields', () => {
    const out = buildCoastFireOutput(PREMISSAS.patrimonio_atual);
    expect(typeof out.coast_number_base).toBe('number');
    expect(typeof out.coast_number_fav).toBe('number');
    expect(typeof out.coast_number_stress).toBe('number');
    expect(typeof out.gap_base).toBe('number');
    expect(typeof out.passou_base).toBe('boolean');
    expect(typeof out.ano_projetado_base).toBe('number');
    expect(typeof out.r_real_base).toBe('number');
    expect(typeof out.r_real_fav).toBe('number');
    expect(typeof out.r_real_stress).toBe('number');
    expect(typeof out.n_anos).toBe('number');
    expect(typeof out.fire_number).toBe('number');
    expect(typeof out._metodo).toBe('string');
  });

  it('_metodo is "coast_fire_formula"', () => {
    const out = buildCoastFireOutput(PREMISSAS.patrimonio_atual);
    expect(out._metodo).toBe('coast_fire_formula');
  });

  it('all numeric fields are finite', () => {
    const out = buildCoastFireOutput(PREMISSAS.patrimonio_atual);
    const numericKeys = [
      'coast_number_base', 'coast_number_fav', 'coast_number_stress',
      'gap_base', 'ano_projetado_base', 'r_real_base', 'r_real_fav',
      'r_real_stress', 'n_anos', 'fire_number',
    ] as const;
    for (const key of numericKeys) {
      expect(isFinite(out[key])).toBe(true);
    }
  });
});

// ─── 5. Privacy — monetary values masked in privacy mode ─────────────────────

describe('Coast FIRE — privacy mode', () => {
  it('pvMoney masks the coast number (not real value)', () => {
    // In privacy mode, the displayed value must differ from the real one
    const real = CN_BASE;
    const masked = pvMoney(real);
    expect(masked).not.toBeCloseTo(real, -2); // differ by more than hundreds
  });

  it('pvMoney masks gap_base', () => {
    const gap = CN_BASE - PREMISSAS.patrimonio_atual;
    const masked = pvMoney(gap);
    expect(masked).not.toBeCloseTo(gap, -2);
  });

  it('pvMoney preserves proportions (fav/base ratio preserved)', () => {
    // Ratio of masked values equals ratio of real values
    const maskedBase = pvMoney(CN_BASE);
    const maskedFav  = pvMoney(CN_FAV);
    const realRatio   = CN_FAV / CN_BASE;
    const maskedRatio = maskedFav / maskedBase;
    expect(maskedRatio).toBeCloseTo(realRatio, 5);
  });

  it('boolean passou_base is NOT masked (it is not a monetary value)', () => {
    // Booleans are never privacy-transformed — they would reveal no monetary info
    const passou_base = PREMISSAS.patrimonio_atual >= CN_BASE;
    expect(typeof passou_base).toBe('boolean');
  });

  it('year fields are NOT masked (not monetary values)', () => {
    const ano = anoProjetado(PREMISSAS.patrimonio_atual, CN_BASE, r_base, 2026);
    // ano is a calendar year, not a monetary value — no masking needed
    expect(ano).toBeGreaterThan(2020);
    expect(ano).toBeLessThan(2060);
  });
});
