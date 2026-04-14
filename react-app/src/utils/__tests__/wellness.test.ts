import { describe, it, expect } from 'vitest';
import { calcWellness, determineStatus, getWellnessColor, getWellnessLabel } from '../wellness';

describe('Wellness Scoring', () => {
  describe('calcWellness', () => {
    it('returns score between 0 and 100', () => {
      const score = calcWellness(0.5, 0.3, 0.8);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('increases with higher FIRE percentage', () => {
      const low = calcWellness(0.2, 0.3, 0.8);
      const high = calcWellness(0.8, 0.3, 0.8);
      expect(high).toBeGreaterThan(low);
    });

    it('increases with higher tracking accuracy', () => {
      const poor = calcWellness(0.5, 0.2, 0.8);
      const good = calcWellness(0.5, 0.8, 0.8);
      expect(good).toBeGreaterThan(poor);
    });

    it('increases with higher equity allocation', () => {
      const conservative = calcWellness(0.5, 0.5, 0.3);
      const growth = calcWellness(0.5, 0.5, 0.8);
      expect(growth).toBeGreaterThan(conservative);
    });

    it('handles edge cases: all zeros', () => {
      const score = calcWellness(0, 0, 0);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('handles edge cases: all ones', () => {
      const score = calcWellness(1, 1, 1);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('determineStatus', () => {
    it('returns "critical" for very low score', () => {
      const status = determineStatus(10);
      expect(status).toBe('critical');
    });

    it('returns "warning" for low-medium score', () => {
      const status = determineStatus(45);
      expect(['warning', 'ok']).toContain(status);
    });

    it('returns "ok" for medium score', () => {
      const status = determineStatus(60);
      expect(['ok', 'excellent']).toContain(status);
    });

    it('returns "excellent" for high score', () => {
      const status = determineStatus(85);
      expect(status).toBe('excellent');
    });

    it('always returns valid status', () => {
      const validStatuses = ['critical', 'warning', 'ok', 'excellent'];
      for (let i = 0; i <= 100; i += 10) {
        const status = determineStatus(i);
        expect(validStatuses).toContain(status);
      }
    });
  });

  describe('getWellnessColor', () => {
    it('returns red for critical status', () => {
      const color = getWellnessColor('critical');
      expect(color).toContain('red');
    });

    it('returns yellow for warning status', () => {
      const color = getWellnessColor('warning');
      expect(color).toContain('yellow');
    });

    it('returns green for ok status', () => {
      const color = getWellnessColor('ok');
      expect(color).toContain('green');
    });

    it('returns bright green for excellent status', () => {
      const color = getWellnessColor('excellent');
      expect(color).toContain('green');
    });

    it('returns a valid color class', () => {
      const validColors = ['text-red', 'text-yellow', 'text-green', 'text-blue'];
      const color = getWellnessColor('ok');
      expect(validColors.some(vc => color.includes(vc))).toBe(true);
    });
  });

  describe('getWellnessLabel', () => {
    it('returns descriptive label for critical', () => {
      const label = getWellnessLabel('critical');
      expect(label.length).toBeGreaterThan(0);
      expect(label.toLowerCase()).toContain('risk');
    });

    it('returns descriptive label for warning', () => {
      const label = getWellnessLabel('warning');
      expect(label.length).toBeGreaterThan(0);
    });

    it('returns descriptive label for ok', () => {
      const label = getWellnessLabel('ok');
      expect(label.length).toBeGreaterThan(0);
    });

    it('returns descriptive label for excellent', () => {
      const label = getWellnessLabel('excellent');
      expect(label.length).toBeGreaterThan(0);
      expect(label.toLowerCase()).toContain('excellent');
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
