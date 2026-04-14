import { describe, it, expect } from 'vitest';
import { calcWellness, determineStatus, getWellnessColor, getWellnessLabel, WellnessMetrics } from '../wellness';

describe('Wellness Scoring', () => {
  const baseMetrics: WellnessMetrics = {
    firePercentage: 0.5,
    equityAllocation: 0.6,
    diversification: 0.7,
    costEfficiency: 0.8,
    liquidityScore: 0.75,
  };

  describe('calcWellness', () => {
    it('returns object with score and status', () => {
      const result = calcWellness(baseMetrics);
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('status');
    });

    it('returns score between 0 and 1', () => {
      const result = calcWellness(baseMetrics);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('increases with higher FIRE percentage', () => {
      const low = calcWellness({ ...baseMetrics, firePercentage: 0.2 });
      const high = calcWellness({ ...baseMetrics, firePercentage: 0.9 });
      expect(high.score).toBeGreaterThan(low.score);
    });

    it('weights FIRE percentage highest (30%)', () => {
      const onlyFire: WellnessMetrics = {
        firePercentage: 1.0,
        equityAllocation: 0,
        diversification: 0,
        costEfficiency: 0,
        liquidityScore: 0,
      };
      const result = calcWellness(onlyFire);
      // 1.0 * 0.3 = 0.3 score with only FIRE at max
      expect(result.score).toBeCloseTo(0.3, 1);
    });

    it('handles zero values gracefully', () => {
      const zeros: WellnessMetrics = {
        firePercentage: 0,
        equityAllocation: 0,
        diversification: 0,
        costEfficiency: 0,
        liquidityScore: 0,
      };
      const result = calcWellness(zeros);
      expect(result.score).toBe(0);
      expect(result.status).toBe('critical');
    });

    it('handles max values gracefully', () => {
      const maxes: WellnessMetrics = {
        firePercentage: 1,
        equityAllocation: 1,
        diversification: 1,
        costEfficiency: 1,
        liquidityScore: 1,
      };
      const result = calcWellness(maxes);
      expect(result.score).toBe(1);
      expect(result.status).toBe('excellent');
    });
  });

  describe('determineStatus', () => {
    it('returns "critical" for score < 0.50', () => {
      expect(determineStatus(0.3)).toBe('critical');
      expect(determineStatus(0.49)).toBe('critical');
    });

    it('returns "warning" for score 0.50-0.69', () => {
      expect(determineStatus(0.5)).toBe('warning');
      expect(determineStatus(0.6)).toBe('warning');
      expect(determineStatus(0.69)).toBe('warning');
    });

    it('returns "ok" for score 0.70-0.84', () => {
      expect(determineStatus(0.7)).toBe('ok');
      expect(determineStatus(0.75)).toBe('ok');
      expect(determineStatus(0.84)).toBe('ok');
    });

    it('returns "excellent" for score >= 0.85', () => {
      expect(determineStatus(0.85)).toBe('excellent');
      expect(determineStatus(0.9)).toBe('excellent');
      expect(determineStatus(1.0)).toBe('excellent');
    });

    it('always returns valid status', () => {
      const validStatuses = ['critical', 'warning', 'ok', 'excellent'];
      for (let i = 0; i <= 1; i += 0.1) {
        const status = determineStatus(i);
        expect(validStatuses).toContain(status);
      }
    });
  });

  describe('getWellnessColor', () => {
    it('returns hex color for critical status', () => {
      const color = getWellnessColor('critical');
      expect(color).toBe('#ef4444'); // red
    });

    it('returns hex color for warning status', () => {
      const color = getWellnessColor('warning');
      expect(color).toBe('#f59e0b'); // amber
    });

    it('returns hex color for ok status', () => {
      const color = getWellnessColor('ok');
      expect(color).toBe('#3b82f6'); // blue
    });

    it('returns hex color for excellent status', () => {
      const color = getWellnessColor('excellent');
      expect(color).toBe('#10b981'); // emerald
    });

    it('returns valid hex color format', () => {
      const colors = ['critical', 'warning', 'ok', 'excellent'] as const;
      colors.forEach(status => {
        const color = getWellnessColor(status);
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('getWellnessLabel', () => {
    it('returns Portuguese label for critical', () => {
      const label = getWellnessLabel('critical');
      expect(label).toBe('Crítico');
    });

    it('returns Portuguese label for warning', () => {
      const label = getWellnessLabel('warning');
      expect(label).toBe('Aviso');
    });

    it('returns Portuguese label for ok', () => {
      const label = getWellnessLabel('ok');
      expect(label).toBe('Saudável');
    });

    it('returns Portuguese label for excellent', () => {
      const label = getWellnessLabel('excellent');
      expect(label).toBe('Excelente');
    });

    it('all labels are non-empty strings', () => {
      const statuses = ['critical', 'warning', 'ok', 'excellent'] as const;
      statuses.forEach(status => {
        const label = getWellnessLabel(status);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });
});
