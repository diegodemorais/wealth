/**
 * Monte Carlo Simulation
 * Port from dashboard/js/05-fire-projections.mjs
 * Pure function: stateless, deterministic with seed
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
 * Returns a standard normal variate.
 */
function boxMullerWithRand(rand: () => number): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = rand();
  while (u2 === 0) u2 = rand();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
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

  const successRate = endWealthDist.filter(w => w > params.initialCapital).length / endWealthDist.length;

  return {
    trajectories,
    endWealthDist,
    percentiles: {
      p10: trajectories.map((_, i) => getPercentileAtMonth(trajectories, 0.1, i)),
      p50: trajectories.map((_, i) => getPercentileAtMonth(trajectories, 0.5, i)),
      p90: trajectories.map((_, i) => getPercentileAtMonth(trajectories, 0.9, i)),
    },
    successRate,
    medianEndWealth: p50,
  };
}

/**
 * Generate MC trajectories (month-based)
 * @param params - Simulation parameters
 * @returns 2D array: numSims × (years * 12)
 */
export function runMCTrajectories(params: MCParams): number[][] {
  const months = params.years * 12;
  const monthlyReturn = params.returnMean / 12;
  const monthlyStd = params.returnStd / Math.sqrt(12);

  const rand = params.seed != null ? mulberry32(params.seed) : Math.random;

  const trajectories: number[][] = [];

  for (let sim = 0; sim < params.numSims; sim++) {
    const traj: number[] = [params.initialCapital];

    for (let month = 1; month < months; month++) {
      const prevValue = traj[month - 1];
      const randomReturn = boxMullerWithRand(rand) * monthlyStd + monthlyReturn;
      const newValue = prevValue * (1 + randomReturn) + params.monthlyContribution;
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

  for (let s = 0; s < numSims; s++) {
    const traj: number[] = [initialCapital];
    for (let yr = 1; yr <= years; yr++) {
      const prev = traj[yr - 1];
      // Box-Muller normal variate
      const z = boxMullerWithRand(rand);
      const ret = annualReturn + annualVol * z;
      let next = prev * (1 + ret);
      // Add annual contribution during accumulation phase (pre-FIRE)
      if (yr <= yearsToFire) next += annualContribution;
      // Apply one-time shock at shockYear
      if (yr === shockYear) next = next * (1 + shockFrac);
      // No floor — negative values show real ruin risk
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
  const values = trajectories.map(t => t[month] || t[t.length - 1]).sort((a, b) => a - b);
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
