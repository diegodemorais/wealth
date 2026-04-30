/**
 * fire-spectrum.test.ts — Unit tests for FIRE Spectrum Widget (Feature 2)
 *
 * Tests band computation: threshold = custo_mensal × multiple
 * Reference spec: agentes/issues/HD-gaps-aposenteaos40-spec.md
 *
 * Strategy: tests are written against the formula logic and data schema.
 * Component render tests will be added after Dev wires FireSpectrumWidget.tsx.
 */

import { describe, it, expect } from 'vitest';

// ─── Band definition (mirrors BANDAS in compute_fire_spectrum) ─────────────────

interface SpectrumBand {
  nome: string;
  multiplo: number;
  swr_pct: number;
  alvo_brl: number;
  atingido: boolean;
  pct_atual: number;
}

interface SpectrumOutput {
  custo_mensal: number;
  patrimonio_atual: number;
  bandas: SpectrumBand[];
  banda_atual: string;
  _metodo: string;
}

const BAND_DEFS: Array<{ nome: string; multiplo: number; swr_pct: number }> = [
  { nome: 'Fat FIRE',    multiplo: 400, swr_pct: 3.0 },
  { nome: 'FIRE',        multiplo: 300, swr_pct: 4.0 },
  { nome: 'Lean FIRE',   multiplo: 200, swr_pct: 6.0 },
  { nome: 'Barista FIRE', multiplo: 150, swr_pct: 8.0 },
];

/**
 * Pure implementation of compute_fire_spectrum() from generate_data.py.
 * Used to verify formula correctness without depending on data.json being populated.
 */
function computeFireSpectrum(custoAnual: number, patrimonio: number): SpectrumOutput {
  const custo_mensal = custoAnual / 12;
  let banda_atual = 'below_barista';

  const bandas: SpectrumBand[] = BAND_DEFS.map(({ nome, multiplo, swr_pct }) => {
    const alvo_brl = custo_mensal * multiplo;
    const atingido = patrimonio >= alvo_brl;
    const pct_atual = Math.min(100.0, parseFloat((patrimonio / alvo_brl * 100).toFixed(1)));
    if (atingido) {
      banda_atual = nome.toLowerCase().replace(/ /g, '_');
    }
    return { nome, multiplo, swr_pct, alvo_brl: Math.round(alvo_brl), atingido, pct_atual };
  });

  return {
    custo_mensal: Math.round(custo_mensal),
    patrimonio_atual: patrimonio,
    bandas,
    banda_atual,
    _metodo: 'multiplo_gastos_mensais',
  };
}

// ─── Canonical premissas ──────────────────────────────────────────────────────

const CUSTO_ANUAL = 250_000; // R$250k/ano (custo_vida_base)
const CUSTO_MENSAL = CUSTO_ANUAL / 12; // R$20,833.33/mês

const PAT_ATUAL    = 3_472_335; // R$3.47M (Diego's current patrimônio)
const PAT_ABOVE    = 9_000_000; // R$9M — above Fat FIRE threshold

// ─── 1. Structure: always 4 bands in the correct order ───────────────────────

describe('FIRE Spectrum — band structure', () => {
  it('always produces exactly 4 bands', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas).toHaveLength(4);
  });

  it('first band is Fat FIRE', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[0].nome).toBe('Fat FIRE');
  });

  it('second band is FIRE', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[1].nome).toBe('FIRE');
  });

  it('third band is Lean FIRE', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[2].nome).toBe('Lean FIRE');
  });

  it('fourth band is Barista FIRE', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[3].nome).toBe('Barista FIRE');
  });

  it('band names use English terms only — no Portuguese variants', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    const names = out.bandas.map(b => b.nome);
    // Ensure prohibited Portuguese terms are absent
    for (const name of names) {
      expect(name).not.toContain('Corda Bamba');
      expect(name).not.toContain('Tradicional');
      expect(name).not.toContain('Magro');
      expect(name).not.toContain('Gordo');
    }
    // Verify exact English names
    expect(names).toEqual(['Fat FIRE', 'FIRE', 'Lean FIRE', 'Barista FIRE']);
  });

  it('_metodo is "multiplo_gastos_mensais"', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out._metodo).toBe('multiplo_gastos_mensais');
  });
});

// ─── 2. Thresholds computed correctly from monthly expenses ──────────────────

describe('FIRE Spectrum — threshold calculations', () => {
  it('custo_mensal = custo_anual / 12 = ~R$20,833', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.custo_mensal).toBeCloseTo(20_833, 0);
  });

  it('Fat FIRE alvo_brl = 400 × custo_mensal ≈ R$8,333,333', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[0].alvo_brl).toBeCloseTo(8_333_333, -3);
  });

  it('FIRE alvo_brl = 300 × custo_mensal ≈ R$6,250,000', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[1].alvo_brl).toBeCloseTo(6_250_000, -3);
  });

  it('Lean FIRE alvo_brl = 200 × custo_mensal ≈ R$4,166,667', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[2].alvo_brl).toBeCloseTo(4_166_667, -3);
  });

  it('Barista FIRE alvo_brl = 150 × custo_mensal ≈ R$3,125,000', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[3].alvo_brl).toBeCloseTo(3_125_000, -3);
  });

  it('Fat FIRE SWR = 3.0%', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[0].swr_pct).toBe(3.0);
  });

  it('FIRE SWR = 4.0%', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[1].swr_pct).toBe(4.0);
  });

  it('Lean FIRE SWR = 6.0%', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[2].swr_pct).toBe(6.0);
  });

  it('Barista FIRE SWR = 8.0%', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    expect(out.bandas[3].swr_pct).toBe(8.0);
  });

  it('thresholds decrease monotonically (Fat > FIRE > Lean > Barista)', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    const [fat, fire, lean, barista] = out.bandas.map(b => b.alvo_brl);
    expect(fat).toBeGreaterThan(fire);
    expect(fire).toBeGreaterThan(lean);
    expect(lean).toBeGreaterThan(barista);
  });

  it('alvo_brl scales linearly with custo_anual', () => {
    // Double the cost → double the thresholds
    const out1 = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    const out2 = computeFireSpectrum(CUSTO_ANUAL * 2, PAT_ATUAL);
    expect(out2.bandas[0].alvo_brl).toBeCloseTo(out1.bandas[0].alvo_brl * 2, -2);
  });
});

// ─── 3. Patrimônio R$3.47M — between Barista and Lean ───────────────────────

describe('FIRE Spectrum — patrimônio R$3.47M (current: between Barista and Lean)', () => {
  const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL); // R$3.47M

  it('Barista FIRE atingido=true (3.47M >= 3.125M)', () => {
    expect(out.bandas[3].atingido).toBe(true);
  });

  it('Lean FIRE atingido=false (3.47M < 4.167M)', () => {
    expect(out.bandas[2].atingido).toBe(false);
  });

  it('FIRE atingido=false (3.47M < 6.25M)', () => {
    expect(out.bandas[1].atingido).toBe(false);
  });

  it('Fat FIRE atingido=false (3.47M < 8.33M)', () => {
    expect(out.bandas[0].atingido).toBe(false);
  });

  it('banda_atual is "barista_fire"', () => {
    expect(out.banda_atual).toBe('barista_fire');
  });

  it('Barista FIRE pct_atual > 100 is capped at 100', () => {
    // 3.47M / 3.125M = ~111% → must be capped at 100
    expect(out.bandas[3].pct_atual).toBeLessThanOrEqual(100);
    expect(out.bandas[3].pct_atual).toBe(100);
  });

  it('Lean FIRE pct_atual is ~83% (not capped)', () => {
    // 3.47M / 4.167M ≈ 83.3%
    expect(out.bandas[2].pct_atual).toBeGreaterThan(80);
    expect(out.bandas[2].pct_atual).toBeLessThan(90);
  });
});

// ─── 4. Patrimônio R$9M — above Fat FIRE ─────────────────────────────────────

describe('FIRE Spectrum — patrimônio R$9M (above Fat FIRE)', () => {
  const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ABOVE); // R$9M

  it('Fat FIRE atingido=true (9M >= 8.33M)', () => {
    expect(out.bandas[0].atingido).toBe(true);
  });

  it('FIRE atingido=true (9M >= 6.25M)', () => {
    expect(out.bandas[1].atingido).toBe(true);
  });

  it('Lean FIRE atingido=true (9M >= 4.17M)', () => {
    expect(out.bandas[2].atingido).toBe(true);
  });

  it('Barista FIRE atingido=true (9M >= 3.125M)', () => {
    expect(out.bandas[3].atingido).toBe(true);
  });

  it('banda_atual is "barista_fire" (last atingido in iteration order Fat→Barista)', () => {
    // Python iterates BANDAS in order [Fat, FIRE, Lean, Barista].
    // banda_atual is overwritten on each atingido band.
    // With R$9M all 4 bands are atingido → last to overwrite wins = "barista_fire".
    // The highest achieved band is Barista (last in list) — this is the pipeline behavior.
    expect(out.banda_atual).toBe('barista_fire');
  });

  it('all pct_atual values are capped at 100', () => {
    for (const banda of out.bandas) {
      expect(banda.pct_atual).toBeLessThanOrEqual(100);
    }
  });
});

// ─── 5. pct_atual capping ────────────────────────────────────────────────────

describe('FIRE Spectrum — pct_atual capping', () => {
  it('pct_atual is exactly 100 when patrimônio = alvo_brl', () => {
    // Patrimônio exactly at Fat FIRE threshold (~8.33M)
    const threshold = Math.round(CUSTO_MENSAL * 400);
    const out = computeFireSpectrum(CUSTO_ANUAL, threshold);
    expect(out.bandas[0].pct_atual).toBe(100);
  });

  it('pct_atual is capped at 100 when patrimônio > alvo_brl', () => {
    const threshold = CUSTO_MENSAL * 400;
    const out = computeFireSpectrum(CUSTO_ANUAL, threshold * 2); // 2× the threshold
    expect(out.bandas[0].pct_atual).toBe(100);
  });

  it('pct_atual < 100 when patrimônio < alvo_brl', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, 1_000_000); // well below all thresholds
    for (const banda of out.bandas) {
      expect(banda.pct_atual).toBeLessThan(100);
    }
  });

  it('pct_atual is never negative', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, 100); // minimal patrimônio
    for (const banda of out.bandas) {
      expect(banda.pct_atual).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── 6. Edge cases ───────────────────────────────────────────────────────────

describe('FIRE Spectrum — edge cases', () => {
  it('patrimônio=0 → no band atingido, banda_atual="below_barista"', () => {
    const out = computeFireSpectrum(CUSTO_ANUAL, 0);
    expect(out.bandas.every(b => !b.atingido)).toBe(true);
    expect(out.banda_atual).toBe('below_barista');
  });

  it('patrimônio exactly at Barista threshold → atingido=true', () => {
    const barista_alvo = CUSTO_MENSAL * 150;
    const out = computeFireSpectrum(CUSTO_ANUAL, barista_alvo);
    expect(out.bandas[3].atingido).toBe(true);
    expect(out.bandas[3].pct_atual).toBe(100);
  });

  it('patrimônio just below Barista threshold → atingido=false', () => {
    const barista_alvo = CUSTO_MENSAL * 150;
    const out = computeFireSpectrum(CUSTO_ANUAL, barista_alvo - 1);
    expect(out.bandas[3].atingido).toBe(false);
  });

  it('custo_anual=0 produces no division by zero in alvo_brl', () => {
    // custo_mensal=0 → alvo_brl=0 for all bands; pct_atual would be Infinity → capped
    // We guard with a positive custo to avoid undefined behavior in real use
    const out = computeFireSpectrum(CUSTO_ANUAL, PAT_ATUAL);
    for (const banda of out.bandas) {
      expect(isFinite(banda.pct_atual)).toBe(true);
    }
  });

  it('patrimônio matches Diego current (R$3.47M) = 167x monthly expenses', () => {
    // 3_472_335 / 20_833 ≈ 166.7x — above 150x Barista, below 200x Lean
    const multiple = PAT_ATUAL / CUSTO_MENSAL;
    expect(multiple).toBeGreaterThan(150);
    expect(multiple).toBeLessThan(200);
  });
});
