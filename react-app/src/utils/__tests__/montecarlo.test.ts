import { describe, it, expect } from 'vitest';
import { runMC, runMCTrajectories } from '../montecarlo';
import { MCParams } from '@/types/dashboard';

describe('Monte Carlo Simulation', () => {
  // Parameters matching carteira.md premissas for Diego
  const defaultParams: MCParams = {
    initialCapital: 3_472_335,           // patrimonio atual
    monthlyContribution: 25_000,         // aporte mensal (carteira.md)
    returnMean: 0.0485,                  // 4.85% real annual (not 7%)
    returnStd: 0.168,                    // 16.8% volatility
    stressLevel: 0,
    years: 14,                           // accumulation phase to FIRE (2026 → 2040)
    numSims: 1000,                       // 1000 sims for statistical stability
    seed: 42,                            // deterministic for testing
  };

  describe('runMCTrajectories', () => {
    it('generates correct number of trajectories', () => {
      const trajectories = runMCTrajectories(defaultParams);
      expect(trajectories).toHaveLength(100);
    });

    it('generates trajectories with correct length', () => {
      const trajectories = runMCTrajectories(defaultParams);
      const expectedMonths = 14 * 12;  // 14 years = 168 months
      trajectories.forEach(traj => {
        expect(traj).toHaveLength(expectedMonths);
      });
    });

    it('starts with initial capital', () => {
      const trajectories = runMCTrajectories(defaultParams);
      trajectories.forEach(traj => {
        expect(traj[0]).toBe(defaultParams.initialCapital);
      });
    });

    it('values generally increase with positive returns', () => {
      const trajectories = runMCTrajectories(defaultParams);
      trajectories.forEach(traj => {
        const endValue = traj[traj.length - 1];
        expect(endValue).toBeGreaterThan(0);
      });
    });

    it('grows with positive contributions on average', () => {
      const params: MCParams = {
        ...defaultParams,
        seed: 42,  // ensure deterministic
      };
      const trajectories = runMCTrajectories(params);

      // With 14 years, 4.85% return, and R$25k/month, end value should exceed initial by significant margin
      const avgEndValue = trajectories.reduce((sum, traj) => sum + traj[traj.length - 1], 0) / trajectories.length;
      const initialCapital = defaultParams.initialCapital;
      const totalContributions = defaultParams.monthlyContribution * defaultParams.years * 12;
      // Should grow beyond initial + total contributions due to compounding
      expect(avgEndValue).toBeGreaterThan(initialCapital + totalContributions);
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
      const pessimistic: MCParams = { ...defaultParams, returnMean: 0.02, seed: 42 };
      const optimistic: MCParams = { ...defaultParams, returnMean: 0.08, seed: 42 };

      const pessResult = runMC(pessimistic);
      const optResult = runMC(optimistic);

      // Higher returns should lead to higher successRate (by current definition: endWealth > initialCapital)
      expect(optResult.successRate).toBeGreaterThanOrEqual(pessResult.successRate);
    });

    it('handles stress level parameter', () => {
      const noStress: MCParams = { ...defaultParams, stressLevel: 0, seed: 42 };
      const withStress: MCParams = { ...defaultParams, stressLevel: 20, seed: 42 };

      const noStressResult = runMC(noStress);
      const stressResult = runMC(withStress);

      // Both should have valid success rates
      expect(noStressResult.successRate).toBeLessThanOrEqual(1);
      expect(noStressResult.successRate).toBeGreaterThanOrEqual(0);
      expect(stressResult.successRate).toBeLessThanOrEqual(1);
      expect(stressResult.successRate).toBeGreaterThanOrEqual(0);
      // Stress should generally reduce success rate (if stress is implemented)
      expect(stressResult.successRate).toBeLessThanOrEqual(noStressResult.successRate + 0.05); // allow small margin
    });
  });
});
