/**
 * Monte Carlo Simulation
 * Port from dashboard/js/05-fire-projections.mjs
 * Pure function: stateless, deterministic with seed
 *
 * CANONICAL MODEL (DEV-mc-canonico):
 *   - Lognormal GBM with Ito correction
 *   - sigma_log_anual = sqrt(log(1 + sigma² / (1+r)²))
 *   - sigma_m = sigma_log_anual / sqrt(12)
 *   - mu_m = log(1+r)/12 - 0.5 * sigma_m²   ← Ito correction
 *   - r_t = exp(mu_m + sigma_m * z) - 1
 *   - floor: P = max(P, 0)
 */

import { MCParams, MCResult, MCYearlyParams } from '@/types/dashboard';

// ── Seeded PRNG (Mulberry32) ──────────────────────────────────────────────────

/**
 * Mulberry32 PRNG — fast, good quality, seedable.
 * Returns a function that produces uniform [0, 1) values.
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller transform using provided rand function.
 * Returns a standard normal variate. No clamp — for N≥1000.
 */
function boxMullerWithRand(rand: () => number): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = rand();
  while (u2 === 0) u2 = rand();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// ── Canonical MC Parameters and Result ───────────────────────────────────────

export interface CanonicalMCParams {
  P0: number;
  r_anual: number;
  sigma_anual: number;       // default: 0.168 (carteira.md → volatilidade_equity)
  aporte_mensal: number;
  meses: number;
  N: number;                 // min: 1000 interativo / 10000 canônico
  metaFire?: number;         // para calcular P(FIRE)
  seed?: number;             // default: 42
}

export interface CanonicalMCResult {
  /** Sorted final wealth distribution */
  endWealthDist: number[];
  p10: number;
  p50: number;
  p90: number;
  /** P(FIRE): fraction of sims where endWealth >= metaFire. 0 if metaFire not provided. */
  pFire: number;
  /** Percentile series over time: pcts[month].p10/.p50/.p90 */
  pcts: Array<{ p10: number; p50: number; p90: number }>;
}

// ── Canonical MC Implementation ───────────────────────────────────────────────

/**
 * Compute lognormal monthly parameters with Ito correction.
 * This is the canonical formula for ALL Monte Carlo simulations in the dashboard.
 *
 * DEV-mc-canonico: Ito correction is critical — omitting it biases P(FIRE) by ~9pp.
 */
function lognormalMonthlyParams(r_anual: number, sigma_anual: number): {
  mu_m: number;
  sigma_m: number;
} {
  // Lognormal exact: converts arithmetic sigma to log-space sigma
  const sigma_log_anual = Math.sqrt(Math.log(1 + sigma_anual ** 2 / (1 + r_anual) ** 2));
  const sigma_m = sigma_log_anual / Math.sqrt(12);
  // Ito correction: log(1+r)/12 - 0.5*sigma_m² (mandatory — see issue)
  const mu_m = Math.log(1 + r_anual) / 12 - 0.5 * sigma_m * sigma_m;
  return { mu_m, sigma_m };
}

/**
 * runCanonicalMC — the single authoritative Monte Carlo implementation.
 *
 * All simulators in the dashboard must call this function (or runMCTrajectories
 * which delegates to it) instead of implementing their own MC loop.
 *
 * Model: Lognormal GBM with Ito correction, floor at zero.
 * Params: see CanonicalMCParams interface.
 */
export function runCanonicalMC(params: CanonicalMCParams): CanonicalMCResult {
  const {
    P0, r_anual, aporte_mensal, meses, N,
    metaFire,
    seed = 42,
    sigma_anual = 0.168,
  } = params;

  const { mu_m, sigma_m } = lognormalMonthlyParams(r_anual, sigma_anual);
  const rand = mulberry32(seed);

  // Accumulate final wealth and track percentile series
  const finalWealth: number[] = new Array(N);
  // Track pcts over time by collecting each month's values
  const monthSamples: number[][] = Array.from({ length: meses }, () => new Array(N));

  for (let sim = 0; sim < N; sim++) {
    let P = P0;
    for (let t = 0; t < meses; t++) {
      const z = boxMullerWithRand(rand);
      const r_t = Math.exp(mu_m + sigma_m * z) - 1;
      P = P * (1 + r_t) + aporte_mensal;
      P = Math.max(P, 0);  // floor: ruin = ruin, absorb at zero
      monthSamples[t][sim] = P;
    }
    finalWealth[sim] = P;
  }

  const sorted = finalWealth.slice().sort((a, b) => a - b);
  const p10 = sorted[Math.floor(N * 0.1)];
  const p50 = sorted[Math.floor(N * 0.5)];
  const p90 = sorted[Math.floor(N * 0.9)];
  const pFire = metaFire != null
    ? finalWealth.filter(w => w >= metaFire).length / N
    : 0;

  // Percentile time series
  const pcts = monthSamples.map(vals => {
    const s = vals.slice().sort((a, b) => a - b);
    return {
      p10: s[Math.floor(N * 0.1)],
      p50: s[Math.floor(N * 0.5)],
      p90: s[Math.floor(N * 0.9)],
    };
  });

  return { endWealthDist: sorted, p10, p50, p90, pFire, pcts };
}

// ── Month-based MC (canonical — used by dashboardStore) ──────────────────────

/**
 * Run Monte Carlo simulation (month-based, single phase)
 * @param params - Simulation parameters
 * @returns MC results with trajectories and statistics
 */
export function runMC(params: MCParams): MCResult {
  const trajectories = runMCTrajectories(params);
  const endWealthDist = trajectories.map(t => t[t.length - 1]);

  const sorted = endWealthDist.slice().sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];

  // Corrected successRate: endWealth > 0 (ruin detection) or metaFire if available
  const successRate = endWealthDist.filter(w => w > 0).length / endWealthDist.length;

  // Compute percentiles correctly: iterate over months, not trajectories
  const months = params.years * 12;
  const p10Array: number[] = [];
  const p50Array: number[] = [];
  const p90Array: number[] = [];

  for (let month = 0; month < months; month++) {
    p10Array.push(getPercentileAtMonth(trajectories, 0.1, month));
    p50Array.push(getPercentileAtMonth(trajectories, 0.5, month));
    p90Array.push(getPercentileAtMonth(trajectories, 0.9, month));
  }

  return {
    trajectories,
    endWealthDist,
    percentiles: {
      p10: p10Array,
      p50: p50Array,
      p90: p90Array,
    },
    successRate,
    medianEndWealth: p50,
  };
}

/**
 * Generate MC trajectories (month-based).
 * Uses canonical lognormal GBM with Ito correction (DEV-mc-canonico).
 * @param params - Simulation parameters
 * @returns 2D array: numSims × (years * 12)
 */
export function runMCTrajectories(params: MCParams): number[][] {
  const months = params.years * 12;

  // Use canonical lognormal monthly params with Ito correction
  // returnStd is treated as annual sigma for the lognormal conversion
  const { mu_m, sigma_m } = lognormalMonthlyParams(params.returnMean, params.returnStd);

  const rand = params.seed != null ? mulberry32(params.seed) : Math.random;

  const trajectories: number[][] = [];

  for (let sim = 0; sim < params.numSims; sim++) {
    const traj: number[] = [params.initialCapital];

    for (let month = 1; month < months; month++) {
      const prevValue = traj[month - 1];
      const z = boxMullerWithRand(rand);
      // Lognormal return with Ito correction (canonical formula)
      const r_t = Math.exp(mu_m + sigma_m * z) - 1;
      const newValue = prevValue * (1 + r_t) + params.monthlyContribution;
      traj.push(Math.max(0, newValue));
    }

    trajectories.push(traj);
  }

  return trajectories;
}

// ── Year-based MC (StressChart — acumulação/desacumulação with shock) ─────────

/**
 * Year-based percentile result per year index
 */
export interface MCYearlyResult {
  /** trajectories[sim][year] */
  trajectories: number[][];
  /** pcts[year].p10 / p25 / p50 / p75 / p90 */
  pcts: Array<{ p10: number; p25: number; p50: number; p75: number; p90: number }>;
}

/**
 * Run year-based MC with accumulation phase, spending phase, and one-time shock.
 * Used by StressChart in simulators/page.tsx.
 */
export function runMCYearly(params: MCYearlyParams): MCYearlyResult {
  const {
    initialCapital, annualReturn, annualVol,
    numSims, years, annualContribution, yearsToFire,
    shockYear, shockFrac, seed,
  } = params;

  const rand = seed != null ? mulberry32(seed) : Math.random;
  const sims: number[][] = [];

  // Canonical lognormal annual params with Ito correction
  const sigma_log_anual = Math.sqrt(Math.log(1 + annualVol ** 2 / (1 + annualReturn) ** 2));
  const mu_anual = Math.log(1 + annualReturn) - 0.5 * sigma_log_anual * sigma_log_anual;  // Ito correction

  for (let s = 0; s < numSims; s++) {
    const traj: number[] = [initialCapital];
    for (let yr = 1; yr <= years; yr++) {
      const prev = traj[yr - 1];
      // Lognormal annual return with Ito correction (canonical formula)
      const z = boxMullerWithRand(rand);
      const ret = Math.exp(mu_anual + sigma_log_anual * z) - 1;
      let next = prev * (1 + ret);
      // Add annual contribution during accumulation phase (pre-FIRE)
      if (yr <= yearsToFire) next += annualContribution;
      // Apply one-time shock at shockYear
      if (yr === shockYear) next = next * (1 + shockFrac);
      // No floor — negative values show real ruin risk (stress chart intent)
      traj.push(next);
    }
    sims.push(traj);
  }

  const pcts = Array.from({ length: years + 1 }, (_, yr) => {
    const vals = sims.map(t => t[yr]).sort((a, b) => a - b);
    const at = (p: number) => vals[Math.floor(p * (vals.length - 1))];
    return { p10: at(0.1), p25: at(0.25), p50: at(0.5), p75: at(0.75), p90: at(0.9) };
  });

  return { trajectories: sims, pcts };
}

/**
 * Compute percentile at specific month across trajectories
 */
function getPercentileAtMonth(trajectories: number[][], percentile: number, month: number): number {
  const values = trajectories.map(t => t[month] !== undefined ? t[month] : 0).sort((a, b) => a - b);
  const idx = Math.floor(values.length * percentile);
  return values[idx];
}

/**
 * Compute percentiles for all months
 */
export function computePercentiles(
  trajectories: number[][],
  percentiles: number[] = [0.1, 0.5, 0.9]
): Record<number, number[]> {
  if (!trajectories || trajectories.length === 0) {
    return {};
  }

  const maxMonths = Math.max(...trajectories.map(t => t.length));
  const result: Record<number, number[]> = {};

  for (const p of percentiles) {
    const values: number[] = [];
    for (let month = 0; month < maxMonths; month++) {
      values.push(getPercentileAtMonth(trajectories, p, month));
    }
    result[Math.round(p * 100)] = values;
  }

  return result;
}
