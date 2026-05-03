import { describe, it, expect } from 'vitest';
import { interpolatePtsByMin, interpolatePtsByMax } from '../scoreInterpolation';

describe('interpolatePtsByMin (pfire-style: ≥X → mais pts)', () => {
  const pfireTiers = [
    { min: 95, pts: 35 },
    { min: 90, pts: 28 },
    { min: 85, pts: 22 },
    { min: 75, pts: 10 },
    { min: 0, pts: 0 },
  ];

  it('rounds before threshold compare — 84.8 → tratado como 85 (não 84) → tier ≥85', () => {
    // Bug original: 84.8 caía em min=75→10. Com decimals=0, arredonda pra 85 → 22.
    expect(interpolatePtsByMin(84.8, pfireTiers, 0)).toBe(22);
  });

  it('caso real Diego 2026-05-03: pfire 84.8 com 1 decimal interpola entre 75 e 85', () => {
    // Sem arredondamento: (84.8 - 75) / (85 - 75) = 0.98 → 10 + 0.98 × 12 = 21.76 → 22
    expect(interpolatePtsByMin(84.8, pfireTiers, 1)).toBe(22);
  });

  it('valores acima do top tier recebem max pts', () => {
    expect(interpolatePtsByMin(100, pfireTiers, 1)).toBe(35);
    expect(interpolatePtsByMin(95, pfireTiers, 1)).toBe(35);
  });

  it('valores nos pontos exatos dos tiers retornam pts do tier', () => {
    expect(interpolatePtsByMin(85, pfireTiers, 1)).toBe(22);
    expect(interpolatePtsByMin(90, pfireTiers, 1)).toBe(28);
  });

  it('interpola linear entre tiers — 80 entre 75 (10) e 85 (22)', () => {
    // (80-75)/(85-75) = 0.5 → 10 + 0.5*12 = 16
    expect(interpolatePtsByMin(80, pfireTiers, 1)).toBe(16);
  });

  it('valor abaixo de todos os tiers retorna 0', () => {
    expect(interpolatePtsByMin(-10, pfireTiers, 1)).toBe(0);
  });

  it('null/undefined/NaN retornam 0', () => {
    expect(interpolatePtsByMin(null, pfireTiers, 1)).toBe(0);
    expect(interpolatePtsByMin(undefined, pfireTiers, 1)).toBe(0);
    expect(interpolatePtsByMin(NaN, pfireTiers, 1)).toBe(0);
  });
});

describe('interpolatePtsByMax (drift-style: ≤X → mais pts)', () => {
  const driftTiers = [
    { max_pp: 5, pts: 15 },
    { max_pp: 10, pts: 8 },
    { max_pp: 100, pts: 0 },
  ];

  it('valor abaixo do tier mais apertado recebe max pts', () => {
    expect(interpolatePtsByMax(2, driftTiers, 'max_pp', 1)).toBe(15);
    expect(interpolatePtsByMax(5, driftTiers, 'max_pp', 1)).toBe(15);
  });

  it('interpola linear entre tiers — 7 entre 5 (15) e 10 (8)', () => {
    // (7-5)/(10-5) = 0.4 → 15 + 0.4*(8-15) = 15 - 2.8 = 12.2 → 12
    expect(interpolatePtsByMax(7, driftTiers, 'max_pp', 1)).toBe(12);
  });

  it('valor exato no tier retorna pts do tier (upper)', () => {
    expect(interpolatePtsByMax(10, driftTiers, 'max_pp', 1)).toBe(8);
  });

  it('valor acima do pior tier retorna 0', () => {
    expect(interpolatePtsByMax(150, driftTiers, 'max_pp', 1)).toBe(0);
  });

  it('arredonda valor antes de comparar — 5.4 com 0 decimals → 5 → max pts', () => {
    expect(interpolatePtsByMax(5.4, driftTiers, 'max_pp', 0)).toBe(15);
  });
});
