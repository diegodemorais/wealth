import { describe, it, expect } from 'vitest';
import { runMC, runMCTrajectories } from '../montecarlo';
import { MCParams } from '@/types/dashboard';

describe('Monte Carlo Simulation', () => {
  const defaultParams: MCParams = {
    initialCapital: 1000000,
    monthlyContribution: 5000,
    returnMean: 0.07,
    returnStd: 0.12,
    stressLevel: 0,
    years: 5,
    numSims: 100,
  };

  describe('runMCTrajectories', () => {
    it('generates correct number of trajectories', () => {
      const trajectories = runMCTrajectories(defaultParams);
      expect(trajectories).toHaveLength(100);
    });

    it('generates trajectories with correct length', () => {
      const trajectories = runMCTrajectories(defaultParams);
      const expectedMonths = 5 * 12;
      trajectories.forEach(traj => {
        expect(traj).toHaveLength(expectedMonths);
      });
    });

    it('starts with initial capital', () => {
      const trajectories = runMCTrajectories(defaultParams);
      trajectories.forEach(traj => {
        expect(traj[0]).toBe(defaultParams.initialCapal);
      });
    });

    it('values generally increase with positive returns', () => {
      const trajectories = runMCTrajectories(defaultParams);
      trajectories.forEach(traj => {
        const endValue = traj[traj.length - 1];
        expect(endValue).toBeGreaterThan(0);
      });
    });

    it('respects contributions over time', () => {
      const params: MCParams = {
        ...defaultParams,
        returnMean: 0, // No returns, just contributions
        returnStd: 0,
        numSims: 10,
      };
      const trajectories = runMCTrajectories(params);
      const expectedEndValue = defaultParams.initialCapital + defaultParams.monthlyContribution * 60;

      trajectories.forEach(traj => {
        expect(Math.abs(traj[traj.length - 1] - expectedEndValue)).toBeLessThan(1); // Allow tiny floating point error
      });
    });
  });

  describe('runMC', () => {
    it('returns complete MC result object', () => {
      const result = runMC(defaultParams);
      expect(result).toHaveProperty('trajectories');
      expect(result).toHaveProperty('endWealthDist');
      expect(result).toHaveProperty('percentiles');
      expect(result).toHaveProperty('successRate');
      expect(result).toHaveProperty('medianEndWealth');
    });

    it('calculates percentiles correctly', () => {
      const result = runMC(defaultParams);
      expect(result.percentiles.p10).toBeDefined();
      expect(result.percentiles.p50).toBeDefined();
      expect(result.percentiles.p90).toBeDefined();

      result.percentiles.p10.forEach((v, i) => {
        expect(v).toBeLessThanOrEqual(result.percentiles.p50[i]);
      });

      result.percentiles.p50.forEach((v, i) => {
        expect(v).toBeLessThanOrEqual(result.percentiles.p90[i]);
      });
    });

    it('calculates success rate between 0 and 1', () => {
      const result = runMC(defaultParams);
      expect(result.successRate).toBeGreaterThanOrEqual(0);
      expect(result.successRate).toBeLessThanOrEqual(1);
    });

    it('has higher success rate with positive returns', () => {
      const pessimistic: MCParams = { ...defaultParams, returnMean: 0.02 };
      const optimistic: MCParams = { ...defaultParams, returnMean: 0.10 };

      const pessResult = runMC(pessimistic);
      const optResult = runMC(optimistic);

      expect(optResult.successRate).toBeGreaterThan(pessResult.successRate);
    });

    it('has lower success rate with higher stress', () => {
      const noStress: MCParams = { ...defaultParams, stressLevel: 0 };
      const withStress: MCParams = { ...defaultParams, stressLevel: 50 };

      const noStressResult = runMC(noStress);
      const stressResult = runMC(withStress);

      expect(noStressResult.successRate).toBeGreaterThan(stressResult.successRate);
    });
  });
});
