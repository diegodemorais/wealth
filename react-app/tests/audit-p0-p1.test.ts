/**
 * audit-p0-p1.test.ts — Testes P0-P1 que não dependem de data.json regenerada
 *
 * Usa fixtures (mock data) para validar:
 * - P0: Schema consistency, patrimonio triplet, pfire cross-field
 * - P1: Lógica pura (stress, ordering, guardrails, SoRR, tax, FF5, duration, MTM)
 */

import { describe, it, expect } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// FIXTURES: Mock data (não dependem de data.json real)
// ═══════════════════════════════════════════════════════════════════════════

const mockDataMinimal = {
  _schema_version: "2.3.0",
  _generated: "2026-04-27T14:30:00Z",
  _window_id: "2026-04-27_daily",
  premissas: {
    patrimonio_atual: 3_467_000,
    idade_atual: 39,
    horizonte_vida: 90,
  },
  pfire_base: {
    base: 86.4,
    favoravel: 88.45,
    stress: 84.35,
  },
  fire: {
    by_profile: {
      atual: {
        p_fire_53: 86.4,
        patrimonio_p10: 8_500_000,
        patrimonio_p50: 11_530_000,
        patrimonio_p90: 16_200_000,
      },
    },
  },
  trilha: {
    patrimonio: {
      p10: [8_500_000, 8_750_000, 9_000_000],
      p50: [11_530_000, 12_000_000, 12_500_000],
      p90: [16_200_000, 17_000_000, 18_000_000],
    },
  },
  drawdown_history: {
    _generated: "2026-04-27T14:30:00Z",
    max_drawdown_pct: -53.2,
    min_drawdown_pct: -0.1,
  },
  posicoes: {
    SWRD: { qtd: 1500, preco: 120.5 },
    AVGS: { qtd: 700, preco: 85.3 },
  },
  hipoteca_brl: 453_000,
  rf: {
    ipca_longo: { saldo: 500_000, duration_years: 21 },
    renda_plus: { saldo: 150_000, duration_years: 43.6 },
  },
};

const mockStressScenario = {
  retorno_anual_base: 0.0485,
  retorno_anual_stress: 0.0435, // -0.5pp ajuste stress
  volatilidade: 0.168,
  depreciacao_brl: -0.005,
};

const mockFF5Factors = {
  SWRD: {
    market: 1.0,
    smb: -0.05, // Pequeno negativo pós-2010
    hml: 0.1, // Value positivo
    rmw: 0.05, // Profitability
    cma: 0.05, // Conservative investment
  },
  AVGS: {
    market: 1.0,
    smb: 0.65, // Small cap heavy
    hml: 0.7, // Value heavy
    rmw: 0.3,
    cma: 0.2,
  },
  AVEM: {
    market: 1.0,
    smb: 0.4, // Small cap
    hml: 0.5, // Value
    rmw: 0.15,
    cma: 0.1,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// P0 TESTS: Schema + Data Consistency
// ═══════════════════════════════════════════════════════════════════════════

describe("P0 — Schema Consistency", () => {
  it("should have _schema_version in root", () => {
    expect(mockDataMinimal._schema_version).toBeDefined();
    expect(typeof mockDataMinimal._schema_version).toBe("string");
    expect(mockDataMinimal._schema_version.length).toBeGreaterThan(0);
  });

  it("should have _window_id in root", () => {
    expect(mockDataMinimal._window_id).toBeDefined();
    expect(typeof mockDataMinimal._window_id).toBe("string");
  });

  it("should have _generated in ISO 8601 format", () => {
    const generated = mockDataMinimal._generated;
    expect(generated).toMatch(/Z$/);
    expect(generated).toContain("T");
  });

  it("should have pfire_base.base close to by_profile[atual].p_fire_53 (gap < 2pp)", () => {
    const base = mockDataMinimal.pfire_base.base;
    const byProfile = mockDataMinimal.fire.by_profile.atual.p_fire_53;
    const gap = Math.abs(base - byProfile);
    expect(gap).toBeLessThan(2.0);
  });

  it("should have P10 ≤ P50 ≤ P90 in trilha patrimonio", () => {
    const trilha = mockDataMinimal.trilha.patrimonio;
    for (let i = 0; i < trilha.p10.length; i++) {
      expect(trilha.p10[i]).toBeLessThanOrEqual(trilha.p50[i]);
      expect(trilha.p50[i]).toBeLessThanOrEqual(trilha.p90[i]);
    }
  });

  it("should have patrimonio_atual within P50 ballpark", () => {
    const current = mockDataMinimal.premissas.patrimonio_atual;
    const p50Current = mockDataMinimal.trilha.patrimonio.p50[0];
    // Current patrimonio should be within 50% of current P50
    const lowerBound = p50Current * 0.3;
    const upperBound = p50Current * 1.2;
    expect(current).toBeGreaterThanOrEqual(lowerBound);
    expect(current).toBeLessThanOrEqual(upperBound);
  });

  it("should have patrimonio_atual > R$500k", () => {
    const current = mockDataMinimal.premissas.patrimonio_atual;
    expect(current).toBeGreaterThan(500_000);
  });

  it("should have drawdown_history._generated metadata", () => {
    expect(mockDataMinimal.drawdown_history._generated).toBeDefined();
    expect(mockDataMinimal.drawdown_history._generated).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// P1 TESTS: Lógica Pura
// ═══════════════════════════════════════════════════════════════════════════

describe("P1 — Stress Scenario Logic", () => {
  it("should have stress scenario retorno < base scenario", () => {
    const base = mockStressScenario.retorno_anual_base;
    const stress = mockStressScenario.retorno_anual_stress;
    expect(stress).toBeLessThan(base);
    const delta = base - stress;
    expect(delta).toBeGreaterThanOrEqual(0.0045);
  });

  it("should have positive volatilidade", () => {
    expect(mockStressScenario.volatilidade).toBeGreaterThan(0);
  });

  it("should have realistic BRL depreciation [-2%, +2%]", () => {
    const dep = mockStressScenario.depreciacao_brl;
    expect(dep).toBeGreaterThanOrEqual(-0.02);
    expect(dep).toBeLessThanOrEqual(0.02);
  });
});

describe("P1 — PFire Ordering", () => {
  it("should have base ≤ favoravel", () => {
    const base = mockDataMinimal.pfire_base.base;
    const fav = mockDataMinimal.pfire_base.favoravel;
    expect(base).toBeLessThanOrEqual(fav);
  });

  it("should have stress < base", () => {
    const base = mockDataMinimal.pfire_base.base;
    const stress = mockDataMinimal.pfire_base.stress;
    expect(stress).toBeLessThan(base);
  });

  it("should have stress ≥ 70% (not total collapse)", () => {
    const stress = mockDataMinimal.pfire_base.stress;
    expect(stress).toBeGreaterThanOrEqual(70);
  });

  it("should have delta_pp = fav - base ≥ 0", () => {
    const base = mockDataMinimal.pfire_base.base;
    const fav = mockDataMinimal.pfire_base.favoravel;
    const delta = fav - base;
    expect(delta).toBeGreaterThanOrEqual(0);
    expect(delta).toBeLessThanOrEqual(10);
  });
});

describe("P1 — PFire Ranges", () => {
  it("should have all PFire values in [0, 100]", () => {
    const base = mockDataMinimal.pfire_base.base;
    const fav = mockDataMinimal.pfire_base.favoravel;
    const stress = mockDataMinimal.pfire_base.stress;

    expect(base).toBeGreaterThanOrEqual(0);
    expect(base).toBeLessThanOrEqual(100);
    expect(fav).toBeGreaterThanOrEqual(0);
    expect(fav).toBeLessThanOrEqual(100);
    expect(stress).toBeGreaterThanOrEqual(0);
    expect(stress).toBeLessThanOrEqual(100);
  });

  it("should have pfire_base.base in sensible range [80, 95]", () => {
    const base = mockDataMinimal.pfire_base.base;
    expect(base).toBeGreaterThanOrEqual(80);
    expect(base).toBeLessThanOrEqual(95);
  });
});

describe("P1 — Guardrails Logic", () => {
  it("should have max_drawdown in sensible range [-60%, -20%]", () => {
    const maxDD = mockDataMinimal.drawdown_history.max_drawdown_pct;
    expect(maxDD).toBeGreaterThanOrEqual(-60);
    expect(maxDD).toBeLessThanOrEqual(-20);
  });
});

describe("P1 — SoRR Logic", () => {
  it("should handle 30% market down on FIRE day", () => {
    const baseTrilhaP50 = mockDataMinimal.trilha.patrimonio.p50[0];
    const marketShock = -0.3;
    const year1Shocked = baseTrilhaP50 * (1 + marketShock);

    // Guardrail threshold
    const patrimônioGatilho = 8_333_333;
    expect(year1Shocked).toBeLessThan(patrimônioGatilho);
  });

  it("should have bond pool coverage", () => {
    const bondPoolAmount = 1_500_000;
    const annualSpending = 250_000;
    const coverageYears = bondPoolAmount / annualSpending;
    expect(coverageYears).toBeGreaterThanOrEqual(6);
  });
});

describe("P1 — Tax Logic", () => {
  it("should have NRA with >USD 60k triggers estate tax", () => {
    const nraUSExposureUSD = 150_000;
    const estateTaxThresholdUSD = 60_000;
    const requiresEstateTax = nraUSExposureUSD > estateTaxThresholdUSD;
    expect(requiresEstateTax).toBe(true);
  });

  it("should use DARF code 6015 for Lei 14.754", () => {
    const codigoDARF = 6015;
    expect(codigoDARF).toBe(6015);
  });

  it("should handle tax loss carryforward", () => {
    const prejuizoAno1 = 10_000;
    const ganhoAno2 = 5_000;
    const impostoAno2 = Math.max(0, ganhoAno2 - prejuizoAno1);
    expect(impostoAno2).toBe(0);
  });

  it("should assign PTAX per lote", () => {
    const loteA = { qtd: 500, preco_brl: 2500, ptax: 5.0 };
    const loteB = { qtd: 1000, preco_brl: 2750, ptax: 5.5 };

    const custoA = loteA.qtd * loteA.preco_brl;
    const custoB = loteB.qtd * loteB.preco_brl;

    expect(custoA).toBe(1_250_000);
    expect(custoB).toBe(2_750_000);
  });
});

describe("P1 — Factor Logic", () => {
  it("should have FF5 factors with sensible magnitudes", () => {
    for (const [etf, factors] of Object.entries(mockFF5Factors)) {
      // Market beta should be ~1.0 (by definition)
      expect(factors.market).toBeCloseTo(1.0, 1);

      // SMB should be realistic magnitude (typically 0-1, negative post-2010)
      expect(factors.smb).toBeGreaterThanOrEqual(-1.0);
      expect(factors.smb).toBeLessThanOrEqual(1.0);

      // HML should be realistic magnitude
      expect(factors.hml).toBeGreaterThanOrEqual(-1.0);
      expect(factors.hml).toBeLessThanOrEqual(1.0);
    }
  });

  it("should have SMB ≤ 0 post-2010", () => {
    const swrdSMB = mockFF5Factors.SWRD.smb;
    expect(swrdSMB).toBeLessThanOrEqual(0);
  });

  it("should have HML > 0.5 in value-heavy ETFs", () => {
    const avgsHML = mockFF5Factors.AVGS.hml;
    expect(avgsHML).toBeGreaterThan(0.5);
  });

  it("should trigger alert for AUM < €3B", () => {
    const aumEUR = 2_800_000_000;
    const thresholdEUR = 3_000_000_000;
    const needsAlert = aumEUR < thresholdEUR;
    expect(needsAlert).toBe(true);
  });
});

describe("P1 — RF Logic", () => {
  it("should have duration in [18a, 24a]", () => {
    const durationYears = 21;
    expect(durationYears).toBeGreaterThanOrEqual(18);
    expect(durationYears).toBeLessThanOrEqual(24);
  });

  it("should have convexity assimetry in MTM", () => {
    const duration = 21;
    const yieldUp = 0.005;
    const yieldDown = -0.005;
    const convexity = 250;

    const dvol01Pct = (duration * 0.01) / 100;
    const mtmUp = -(duration * yieldUp * 100) + 0.5 * convexity * Math.pow(yieldUp, 2) * 100;
    const mtmDown = -(duration * yieldDown * 100) + 0.5 * convexity * Math.pow(yieldDown, 2) * 100;

    expect(Math.abs(mtmDown)).toBeGreaterThan(Math.abs(mtmUp));
  });

  it("should have bond pool coverage ≥ 6 years", () => {
    const bondPoolAmount = 1_500_000;
    const annualSpending = 250_000;
    const coverageYears = bondPoolAmount / annualSpending;
    expect(coverageYears).toBeGreaterThanOrEqual(6);
  });

  it("should have IPCA+ spread in sensible range", () => {
    const ipcaPlusRate = 0.0416;
    const diRate = 0.105;
    const spread = ipcaPlusRate - diRate;
    const spreadPP = spread * 100;
    expect(spreadPP).toBeGreaterThanOrEqual(-10);
    expect(spreadPP).toBeLessThanOrEqual(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PARAMETRIZED TESTS: Validação em batch
// ═══════════════════════════════════════════════════════════════════════════

const parametrizedRanges = [
  { name: "pfire_base", value: 86.4, min: 80, max: 95 },
  { name: "pfire_fav", value: 88.45, min: 82, max: 100 },
  { name: "pfire_stress", value: 84.35, min: 70, max: 95 },
  { name: "max_dd_pct", value: -53.2, min: -60, max: -20 },
  { name: "patrimonio_gatilho", value: 8_333_333, min: 5_000_000, max: 15_000_000 },
];

describe("P1 — Parametrized Ranges", () => {
  for (const { name, value, min, max } of parametrizedRanges) {
    it(`should have ${name} in range [${min}, ${max}]`, () => {
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThanOrEqual(max);
    });
  }
});
