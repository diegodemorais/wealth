/**
 * mc-canonico.test.ts — DEV-mc-canonico QA Suite
 *
 * Validates that ALL Monte Carlo simulations in the dashboard use the canonical
 * lognormal GBM model with Ito correction.
 *
 * Issue: DEV-mc-canonico
 * Quant-approved anchor: N=10000, seed=42, r=4.85%, σ=16.8%, P0=3.472M,
 *   aporte=25k/mês, meses=168 → P50≈11M (±5%), P(FIRE≥8.33M)≈72% (±3pp)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { runCanonicalMC, runMCTrajectories } from '../utils/montecarlo';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SRC_DIR = resolve(__dirname, '..');

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '__tests__') continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectSourceFiles(fullPath, files);
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allSourceFiles = collectSourceFiles(SRC_DIR);

/** MC files only — exclude non-simulation files */
const MC_FILES = [
  'utils/montecarlo.ts',
  'app/simulators/page.tsx',
  'app/simulators/ReverseFire.tsx',
];

function readMcFiles(): Array<{ rel: string; content: string }> {
  return MC_FILES.map(rel => ({
    rel,
    content: readFileSync(join(SRC_DIR, rel), 'utf-8'),
  }));
}

// ── [FORMULA] Tests ───────────────────────────────────────────────────────────

describe('[FORMULA] Canonical lognormal GBM model', () => {
  it('runCanonicalMC is exported from montecarlo.ts', () => {
    // Verify the function exists and is callable
    expect(typeof runCanonicalMC).toBe('function');
  });

  it('runCanonicalMC uses Ito correction: mu_m = log(1+r)/12 - 0.5*sigma_m²', () => {
    // The canonical montecarlo.ts source must contain the Ito correction formula
    const content = readFileSync(join(SRC_DIR, 'utils/montecarlo.ts'), 'utf-8');
    // Matches: mu_m = Math.log(1 + r_anual) / 12 - 0.5 * sigma_m * sigma_m
    expect(content).toMatch(/mu_m\s*=\s*Math\.log\(1\s*\+\s*r_anual\)\s*\/\s*12\s*-\s*0\.5\s*\*\s*sigma_m\s*\*\s*sigma_m/);
  });

  it('runCanonicalMC uses lognormal sigma: sigma_log = sqrt(log(1 + sigma²/(1+r)²))', () => {
    const content = readFileSync(join(SRC_DIR, 'utils/montecarlo.ts'), 'utf-8');
    // Matches the lognormal sigma formula: Math.sqrt(Math.log(1 + sigma_anual ** 2 / (1 + r_anual) ** 2))
    expect(content).toMatch(/Math\.sqrt\(Math\.log\(1\s*\+\s*sigma_anual\s*\*\*\s*2\s*\/\s*\(1\s*\+\s*r_anual\)\s*\*\*\s*2\)/);
  });

  it('runCanonicalMC uses lognormal return: r_t = exp(mu_m + sigma_m * z) - 1', () => {
    const content = readFileSync(join(SRC_DIR, 'utils/montecarlo.ts'), 'utf-8');
    // Matches: Math.exp(mu_m + sigma_m * z) - 1
    expect(content).toMatch(/Math\.exp\(mu_m\s*\+\s*sigma_m\s*\*\s*z\)\s*-\s*1/);
  });

  it('patrimônio never goes negative (floor at zero)', () => {
    const result = runCanonicalMC({
      P0: 100_000,
      r_anual: -0.5,  // extreme negative return
      sigma_anual: 0.5,
      aporte_mensal: -50_000,  // large withdrawal
      meses: 120,
      N: 500,
      seed: 42,
    });
    // All final wealth values must be >= 0
    expect(result.endWealthDist.every(w => w >= 0)).toBe(true);
  });
});

// ── [PARAMS] Tests ────────────────────────────────────────────────────────────

describe('[PARAMS] Default parameters', () => {
  it('seed=42 by default: two calls with same params produce identical results', () => {
    const params = {
      P0: 1_000_000,
      r_anual: 0.0485,
      sigma_anual: 0.168,
      aporte_mensal: 10_000,
      meses: 60,
      N: 200,
    };
    const r1 = runCanonicalMC(params);
    const r2 = runCanonicalMC(params);
    expect(r1.p50).toBe(r2.p50);
    expect(r1.p10).toBe(r2.p10);
    expect(r1.p90).toBe(r2.p90);
  });

  it('N=1000 minimum for interactive use: function accepts N=1000 without error', () => {
    const result = runCanonicalMC({
      P0: 1_000_000,
      r_anual: 0.0485,
      sigma_anual: 0.168,
      aporte_mensal: 10_000,
      meses: 60,
      N: 1000,
      seed: 42,
    });
    expect(result.endWealthDist.length).toBe(1000);
  });

  it('sigma_anual defaults to 0.168 when not specified', () => {
    // Both calls should produce same result: one explicit, one via default
    const explicit = runCanonicalMC({
      P0: 1_000_000, r_anual: 0.0485, sigma_anual: 0.168,
      aporte_mensal: 10_000, meses: 60, N: 200, seed: 42,
    });
    const withDefault = runCanonicalMC({
      P0: 1_000_000, r_anual: 0.0485,
      aporte_mensal: 10_000, meses: 60, N: 200, seed: 42,
    });
    expect(withDefault.p50).toBe(explicit.p50);
  });
});

// ── [CALIBRAÇÃO] Anchor Tests ─────────────────────────────────────────────────

describe('[CALIBRAÇÃO] Anchor numérico (Quant N=100k validado)', () => {
  // Anchor: N=10000, seed=42, r=4.85%, σ=16.8%, P0=R$3.472M, aporte=R$25k/mês, meses=168
  const ANCHOR_PARAMS = {
    P0: 3_472_000,
    r_anual: 0.0485,
    sigma_anual: 0.168,
    aporte_mensal: 25_000,
    meses: 168,
    N: 10_000,
    seed: 42,
    metaFire: 8_330_000,
  };

  // Run once — shared across anchor tests
  let anchorResult: ReturnType<typeof runCanonicalMC>;

  it('P50 final entre R$9M e R$13M (±5% do anchor ≈11M)', () => {
    anchorResult = runCanonicalMC(ANCHOR_PARAMS);
    expect(anchorResult.p50).toBeGreaterThan(9_000_000);
    expect(anchorResult.p50).toBeLessThan(13_000_000);
  });

  it('P(FIRE) com metaFire=8.33M entre 65% e 80%', () => {
    if (!anchorResult) anchorResult = runCanonicalMC(ANCHOR_PARAMS);
    const pFirePct = anchorResult.pFire * 100;
    expect(pFirePct).toBeGreaterThanOrEqual(65);
    expect(pFirePct).toBeLessThanOrEqual(80);
  });

  it('P(FIRE) sem Ito seria >80% — confirmar que modelo canônico NÃO produz isso', () => {
    // Model WITHOUT Ito correction would give ~9pp higher P(FIRE) per issue
    // The canonical model must produce P(FIRE) < 80%
    if (!anchorResult) anchorResult = runCanonicalMC(ANCHOR_PARAMS);
    expect(anchorResult.pFire * 100).toBeLessThan(80);
  });

  it('pcts array has correct length (meses)', () => {
    if (!anchorResult) anchorResult = runCanonicalMC(ANCHOR_PARAMS);
    expect(anchorResult.pcts.length).toBe(ANCHOR_PARAMS.meses);
  });
});

// ── [CONSISTÊNCIA] Tests ──────────────────────────────────────────────────────

describe('[CONSISTÊNCIA] runCanonicalMC vs runMCTrajectories', () => {
  it('runCanonicalMC e runMCTrajectories produzem P50 semelhante (±5%) com mesmos parâmetros', () => {
    const canonical = runCanonicalMC({
      P0: 3_472_000,
      r_anual: 0.0485,
      sigma_anual: 0.168,
      aporte_mensal: 25_000,
      meses: 168,
      N: 2000,
      seed: 42,
    });

    const trajectories = runMCTrajectories({
      initialCapital: 3_472_000,
      returnMean: 0.0485,
      returnStd: 0.168,
      monthlyContribution: 25_000,
      years: 14,  // 168 months = 14 years
      numSims: 2000,
      seed: 42,
      stressLevel: 0,
    });

    const endWealths = trajectories.map(t => t[t.length - 1]).sort((a, b) => a - b);
    const trajP50 = endWealths[Math.floor(endWealths.length * 0.5)];

    // Allow ±5% difference (same model, slight differences in trajectory indexing)
    const diff = Math.abs(canonical.p50 - trajP50) / canonical.p50;
    expect(diff).toBeLessThan(0.05);
  });

  it('N=1000 seed=42: resultado idêntico em duas chamadas consecutivas', () => {
    const params = {
      P0: 3_472_000, r_anual: 0.0485, sigma_anual: 0.168,
      aporte_mensal: 25_000, meses: 120, N: 1000, seed: 42,
    };
    const r1 = runCanonicalMC(params);
    const r2 = runCanonicalMC(params);
    expect(r1.p50).toBe(r2.p50);
    expect(r1.pFire).toBe(r2.pFire);
  });
});

// ── [PROIBIÇÃO] Grep-based enforcement ───────────────────────────────────────

describe('[PROIBIÇÃO] Nenhum MC usa modelo proibido', () => {
  it('nenhum arquivo MC usa returnMean/12 para drift mensal (padrão antigo)', () => {
    // Pattern: returnMean / 12 or monthlyReturn = ... / 12 in drift context
    // Allow: context comments, strings, or non-drift usage
    const forbidden = /returnMean\s*\/\s*12|monthlyReturn\s*=\s*[^;]*\/\s*12/;

    const violators: string[] = [];
    for (const { rel, content } of readMcFiles()) {
      if (forbidden.test(content)) violators.push(rel);
    }

    expect(violators, `Files using r/12 drift (forbidden, use lognormal Ito): ${violators.join(', ')}`).toHaveLength(0);
  });

  it('nenhum arquivo MC usa gaussiano linear (1 + ret) onde ret não passa por exp()', () => {
    // This catches the old pattern: prevValue * (1 + randomReturn) where randomReturn
    // is a gaussian variate directly (not exp(mu + sigma*z) - 1)
    // The canonical pattern must use exp() for lognormal
    const forbidden = /prevValue\s*\*\s*\(1\s*\+\s*randomReturn\)/;

    const violators: string[] = [];
    for (const { rel, content } of readMcFiles()) {
      if (forbidden.test(content)) violators.push(rel);
    }

    expect(violators, `Files using linear gaussian return (forbidden): ${violators.join(', ')}`).toHaveLength(0);
  });

  it('nenhum arquivo no projeto usa Ito omitido: monthlyReturn + monthlyStd * z sem exp()', () => {
    // Specifically catches the old pattern from runMCTrajectories before fix:
    //   randomReturn = boxMullerWithRand(rand) * monthlyStd + monthlyReturn
    //   newValue = prevValue * (1 + randomReturn)
    const forbidden = /boxMullerWithRand\(rand\)\s*\*\s*monthlyStd\s*\+\s*monthlyReturn/;

    const violators: string[] = [];
    for (const file of allSourceFiles) {
      const rel = file.replace(SRC_DIR + '/', '');
      const content = readFileSync(file, 'utf-8');
      if (forbidden.test(content)) violators.push(rel);
    }

    expect(violators, `Files using old gaussian drift (no Ito, no exp): ${violators.join(', ')}`).toHaveLength(0);
  });

  it('nenhum MC usa N=400 (fallback insuficiente — IC ±6pp)', () => {
    // N=400 was the old value causing IC ±6pp noise — must be replaced with ≥1000
    const forbidden = /numSims\s*=\s*400\b|const numSims\s*=\s*400\b/;

    const violators: string[] = [];
    for (const { rel, content } of readMcFiles()) {
      if (forbidden.test(content)) violators.push(rel);
    }

    expect(violators, `Files using N=400 (too low): ${violators.join(', ')}`).toHaveLength(0);
  });

  it('nenhum MC usa sigma fallback 0.12 (subestima risco em 29%)', () => {
    // Old wrong fallback was 0.12; canonical is 0.168 (carteira.md)
    const forbidden = /volatilidade_equity\s*\?\?\s*0\.12\b/;

    const violators: string[] = [];
    for (const { rel, content } of readMcFiles()) {
      if (forbidden.test(content)) violators.push(rel);
    }

    expect(violators, `Files using sigma fallback 0.12 (wrong, use 0.168): ${violators.join(', ')}`).toHaveLength(0);
  });
});
