import { describe, it, expect } from 'vitest';
import { tierByMin, tierByMax, promoteTier } from '../wellnessTier';

describe('tierByMin (Boldin-style 3-tier, ≥X → mais pts)', () => {
  const pfireTiers = [
    { status: 'green', min: 85, pts: 35 },
    { status: 'yellow', min: 70, pts: 21 },
    { status: 'red', min: 0, pts: 7 },
  ];

  it('arredonda valor com a precisão do display antes de comparar — 84.8 → 85 → green', () => {
    // Bug Diego 2026-05-03: 84.8 caía em red por 0.2pp. Com decimals=0 arredonda pra 85 → green.
    expect(tierByMin(84.8, pfireTiers, 'min', 0)).toEqual({ status: 'green', pts: 35 });
  });

  it('com decimals=1 (default) 84.8 fica abaixo do threshold green=85 → yellow', () => {
    // Decisão CIO: pra pfire decimals=1 mantém precisão (84.8 ≠ 85.0)
    expect(tierByMin(84.8, pfireTiers, 'min', 1)).toEqual({ status: 'yellow', pts: 21 });
  });

  it('valores exatos no threshold caem no tier', () => {
    expect(tierByMin(85, pfireTiers, 'min', 1)).toEqual({ status: 'green', pts: 35 });
    expect(tierByMin(70, pfireTiers, 'min', 1)).toEqual({ status: 'yellow', pts: 21 });
  });

  it('valores acima do top tier ficam green', () => {
    expect(tierByMin(99, pfireTiers, 'min', 1)).toEqual({ status: 'green', pts: 35 });
  });

  it('null/NaN → red com 0 pts', () => {
    expect(tierByMin(null, pfireTiers, 'min', 1)).toEqual({ status: 'red', pts: 0 });
    expect(tierByMin(NaN, pfireTiers, 'min', 1)).toEqual({ status: 'red', pts: 0 });
  });

  it('aceita key alias (min_pct, min_months)', () => {
    const srTiers = [
      { status: 'green', min_pct: 50, pts: 15 },
      { status: 'yellow', min_pct: 30, pts: 9 },
      { status: 'red', min_pct: 0, pts: 3 },
    ];
    expect(tierByMin(54.5, srTiers, 'min_pct', 1)).toEqual({ status: 'green', pts: 15 });
    expect(tierByMin(35, srTiers, 'min_pct', 1)).toEqual({ status: 'yellow', pts: 9 });
  });
});

describe('tierByMax (Boldin-style 3-tier, ≤X → mais pts)', () => {
  const driftTiers = [
    { status: 'green', max_pp: 5, pts: 15 },
    { status: 'yellow', max_pp: 10, pts: 9 },
    { status: 'red', max_pp: 999, pts: 3 },
  ];

  it('valor abaixo de green threshold → green', () => {
    expect(tierByMax(2, driftTiers, 'max_pp', 1)).toEqual({ status: 'green', pts: 15 });
    expect(tierByMax(5, driftTiers, 'max_pp', 1)).toEqual({ status: 'green', pts: 15 });
  });

  it('arredonda — 5.4 com decimals=0 → 5 → green', () => {
    expect(tierByMax(5.4, driftTiers, 'max_pp', 0)).toEqual({ status: 'green', pts: 15 });
  });

  it('valor acima do red threshold → último tier', () => {
    expect(tierByMax(1500, driftTiers, 'max_pp', 1)).toEqual({ status: 'red', pts: 3 });
  });

  it('decimals=2 pra ter delta', () => {
    const terTiers = [
      { status: 'green', max_delta_pp: 0, pts: 5 },
      { status: 'yellow', max_delta_pp: 0.10, pts: 3 },
      { status: 'red', max_delta_pp: 999, pts: 1 },
    ];
    // current_ter 0.211 - benchmark 0.220 = -0.009 → arredondado 2 decimais = -0.01 → green (≤0)
    expect(tierByMax(-0.009, terTiers, 'max_delta_pp', 2)).toEqual({ status: 'green', pts: 5 });
    // 0.05 → yellow
    expect(tierByMax(0.05, terTiers, 'max_delta_pp', 2)).toEqual({ status: 'yellow', pts: 3 });
  });
});

describe('promoteTier (DCA ativo promove R→Y, Y→G)', () => {
  const ipcaTiers = [
    { status: 'green', max_pp: 3, pts: 10 },
    { status: 'yellow', max_pp: 8, pts: 6 },
    { status: 'red', max_pp: 999, pts: 2 },
  ];

  it('promote=false não muda nada', () => {
    const result = { status: 'red' as const, pts: 2 };
    expect(promoteTier(result, ipcaTiers, false)).toEqual(result);
  });

  it('red → yellow quando DCA ativo', () => {
    const red = { status: 'red' as const, pts: 2 };
    expect(promoteTier(red, ipcaTiers, true)).toEqual({ status: 'yellow', pts: 6 });
  });

  it('yellow → green quando DCA ativo', () => {
    const yellow = { status: 'yellow' as const, pts: 6 };
    expect(promoteTier(yellow, ipcaTiers, true)).toEqual({ status: 'green', pts: 10 });
  });

  it('green permanece green', () => {
    const green = { status: 'green' as const, pts: 10 };
    expect(promoteTier(green, ipcaTiers, true)).toEqual(green);
  });

  it('caso real Diego 2026-05-03: ipca_gap=11.6 + DCA ativo → red→yellow → 6pts (era 3pts no método antigo)', () => {
    const raw = tierByMax(11.6, ipcaTiers, 'max_pp', 1); // red, 2pts
    expect(raw).toEqual({ status: 'red', pts: 2 });
    const promoted = promoteTier(raw, ipcaTiers, true);
    expect(promoted).toEqual({ status: 'yellow', pts: 6 });
  });
});
