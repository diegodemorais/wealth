/**
 * Monte Carlo Simulation
 * Port from dashboard/js/05-fire-projections.mjs
 * Pure function: stateless, deterministic with seed
 */

import { MCParams, MCResult } from '@/types/dashboard';

/**
 * Run Monte Carlo simulation
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

  const probabilityOfSuccess = endWealthDist.filter(w => w > params.initialCapital).length / endWealthDist.length;

  return {
    trajectories,
    endWealthDist,
    percentiles: {
      p10: trajectories.map((_, i) => getPercentileAtMonth(trajectories, 0.1, i)),
      p50: trajectories.map((_, i) => getPercentileAtMonth(trajectories, 0.5, i)),
      p90: trajectories.map((_, i) => getPercentileAtMonth(trajectories, 0.9, i)),
    },
    probabilityOfSuccess,
    medianEndWealth: p50,
  };
}

/**
 * Generate MC trajectories
 * @param params - Simulation parameters
 * @returns 2D array: numSims × (years * 12)
 */
export function runMCTrajectories(params: MCParams): number[][] {
  const months = params.years * 12;
  const monthlyReturn = params.returnMean / 12;
  const monthlyStd = params.returnStd / Math.sqrt(12);

  const trajectories: number[][] = [];

  for (let sim = 0; sim < params.numSims; sim++) {
    const traj: number[] = [params.initialCapital];

    for (let month = 1; month < months; month++) {
      const prevValue = traj[month - 1];
      const randomReturn = boxMullerRandom() * monthlyStd + monthlyReturn;
      const newValue = prevValue * (1 + randomReturn) + params.monthlyContribution;
      traj.push(Math.max(0, newValue));
    }

    trajectories.push(traj);
  }

  return trajectories;
}

/**
 * Box-Muller transform for normal distribution
 */
let z0: number | null = null;
let z1: number | null = null;

function boxMullerRandom(): number {
  if (z1 !== null) {
    const result = z1;
    z1 = null;
    return result;
  }

  let u1 = 0;
  let u2 = 0;

  // Ensure u1 is not 0
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const mag = Math.sqrt(-2.0 * Math.log(u1));
  z0 = mag * Math.cos(2.0 * Math.PI * u2);
  z1 = mag * Math.sin(2.0 * Math.PI * u2);

  return z0;
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
