import { describe, it, expect } from 'vitest';
import { computeDerivedValues } from '../dataWiring';
import { DashboardData } from '@/types/dashboard';

describe('Wellness Score (from dataWiring)', () => {
  const mockData: Partial<DashboardData> = {
    premissas: {
      patrimonio_atual: 3_472_335,
      patrimonio_gatilho: 8_333_000,
      swr_gatilho: 0.03,
    },
    cambio: 5.22,
    posicoes: {},
    rf: {},
    pfire_base: 86.4,
    pfire_aspiracional: 92.0,
  } as any;

  describe('wellnessScore calculation', () => {
    it('calculates wellness score as min(1, progPct/100 * 1.2)', () => {
      // progPct = (3.472M / 8.333M) * 100 = 41.67%
      // wellness = min(1, 41.67 / 100 * 1.2) = min(1, 0.5) = 0.5
      const derived = computeDerivedValues(mockData as DashboardData);
      expect(derived.wellnessScore).toBeCloseTo(0.5, 1);
    });

    it('returns max 1.0 when patrimonio exceeds gatilho by 20%', () => {
      const data = {
        ...mockData,
        premissas: {
          ...mockData.premissas,
          patrimonio_atual: 10_000_000,
        },
      };
      const derived = computeDerivedValues(data as DashboardData);
      expect(derived.wellnessScore).toBeLessThanOrEqual(1.0);
    });

    it('returns 0 when patrimonio is 0', () => {
      const data = {
        ...mockData,
        premissas: {
          ...mockData.premissas,
          patrimonio_atual: 0,
        },
      };
      const derived = computeDerivedValues(data as DashboardData);
      expect(derived.wellnessScore).toBe(0);
    });
  });

  describe('wellnessStatus labels', () => {
    it('returns "critical" when progPct < 40', () => {
      // With current data: progPct = 41.67%, borderline
      // Test with lower patrimonio for clear critical
      const data = {
        ...mockData,
        premissas: {
          ...mockData.premissas,
          patrimonio_atual: 3_000_000,  // 36% of gatilho
        },
      };
      const derived = computeDerivedValues(data as DashboardData);
      expect(derived.wellnessStatus).toBe('critical');
    });

    it('returns "warning" when 40 <= progPct < 60', () => {
      // Current data is ~42%, should be warning
      const derived = computeDerivedValues(mockData as DashboardData);
      expect(derived.wellnessStatus).toBe('warning');
    });

    it('returns "ok" when 60 <= progPct < 80', () => {
      const data = {
        ...mockData,
        premissas: {
          ...mockData.premissas,
          patrimonio_atual: 5_500_000,  // 66% of gatilho
        },
      };
      const derived = computeDerivedValues(data as DashboardData);
      expect(derived.wellnessStatus).toBe('ok');
    });

    it('returns "excellent" when progPct >= 80', () => {
      const data = {
        ...mockData,
        premissas: {
          ...mockData.premissas,
          patrimonio_atual: 7_000_000,  // 84% of gatilho
        },
      };
      const derived = computeDerivedValues(data as DashboardData);
      expect(derived.wellnessStatus).toBe('excellent');
    });
  });

  describe('wellnessLabel matches status', () => {
    it('has Portuguese labels for all statuses', () => {
      const derived = computeDerivedValues(mockData as DashboardData);
      expect(['Crítico', 'Atenção', 'Progredindo', 'Excelente']).toContain(derived.wellnessLabel);
    });
  });
});
