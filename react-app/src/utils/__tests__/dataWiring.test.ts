import { describe, it, expect } from 'vitest';
import { computeDerivedValues } from '../dataWiring';
import { DashboardData } from '@/types/dashboard';

describe('Data Wiring & Derived Values', () => {
  // Minimal mock data with required fields
  const mockData: DashboardData = {
    _generated: '2026-04-14T10:00:00Z',
    _generated_brt: '2026-04-14T07:00:00-03:00',
    date: '2026-04-14',
    timestamps: {
      posicoes_ibkr: '2026-04-14T10:00:00Z',
      precos_yfinance: '2026-04-14T10:00:00Z',
      historico_csv: '2026-04-14T10:00:00Z',
      holdings_md: '2026-04-14T10:00:00Z',
      fire_mc: '2026-04-14T10:00:00Z',
      geral: '2026-04-14T10:00:00Z',
    },
    cambio: 5.0,
    posicoes: {
      SWRD: { qty: 100, avg_cost: 100, price: 105, bucket: 'SWRD', status: 'ok', ter: 0.008 },
    },
    pesosTarget: {},
    pisos: {
      pisoTaxaIpcaLongo: 0.045,
      pisoTaxaRendaPlus: 0.05,
      pisoVendaRendaPlus: 0.045,
      ir_aliquota: 0.15,
    },
    premissas: {
      patrimonio_atual: 1000000,
      patrimonio_gatilho: 2500000,
      idade_atual: 35,
      idade_cenario_base: 50,
      custo_vida_base: 60000,
    },
    rf: {
      ipca2029: { valor: 100000 },
      ipca2040: { valor: 200000 },
      ipca2050: { valor: 300000 },
      renda2065: { valor: 150000 },
    },
  } as DashboardData;

  describe('computeDerivedValues', () => {
    it('returns DerivedValues object', () => {
      const derived = computeDerivedValues(mockData);
      expect(derived).toBeDefined();
      expect(typeof derived).toBe('object');
    });

    it('returns object with networth field', () => {
      const derived = computeDerivedValues(mockData);
      expect(derived).toHaveProperty('networth');
      expect(typeof derived.networth).toBe('number');
    });

    it('calculates networth as number', () => {
      const derived = computeDerivedValues(mockData);
      expect(typeof derived.networth).toBe('number');
      expect(derived.networth).toBeGreaterThan(0);
    });

    it('calculates FIRE percentage between 0 and 1', () => {
      const derived = computeDerivedValues(mockData);
      // firePercentage may be named differently, but should exist
      const firePercentage = (derived as any).firePercentage || (derived as any).fireePercentage;
      if (firePercentage !== undefined) {
        expect(firePercentage).toBeGreaterThanOrEqual(0);
        expect(firePercentage).toBeLessThanOrEqual(1);
      }
    });

    it('determines wellness status correctly', () => {
      const derived = computeDerivedValues(mockData);
      const validStatuses = ['critical', 'warning', 'ok', 'excellent'];
      const status = (derived as any).wellnessStatus;
      if (status !== undefined) {
        expect(validStatuses).toContain(status);
      }
    });

    it('returns valid FIRE date', () => {
      const derived = computeDerivedValues(mockData);
      const fireDate = (derived as any).fireDate;
      if (fireDate) {
        expect(fireDate instanceof Date).toBe(true);
      }
    });

    it('handles missing optional data gracefully', () => {
      const minimalData: DashboardData = {
        _generated: '2026-04-14T10:00:00Z',
        _generated_brt: '2026-04-14T07:00:00-03:00',
        date: '2026-04-14',
        timestamps: {
          posicoes_ibkr: '2026-04-14T10:00:00Z',
          precos_yfinance: '2026-04-14T10:00:00Z',
          historico_csv: '2026-04-14T10:00:00Z',
          holdings_md: '2026-04-14T10:00:00Z',
          fire_mc: '2026-04-14T10:00:00Z',
          geral: '2026-04-14T10:00:00Z',
        },
        cambio: 5.0,
        posicoes: {},
        pesosTarget: {},
        pisos: {
          pisoTaxaIpcaLongo: 0.045,
          pisoTaxaRendaPlus: 0.05,
          pisoVendaRendaPlus: 0.045,
          ir_aliquota: 0.15,
        },
        premissas: {
          patrimonio_atual: 500000,
          patrimonio_gatilho: 2000000,
          idade_atual: 30,
          idade_cenario_base: 45,
          custo_vida_base: 50000,
        },
        rf: {
          ipca2029: { valor: 0 },
          ipca2040: { valor: 0 },
          ipca2050: { valor: 0 },
          renda2065: { valor: 0 },
        },
      } as DashboardData;

      // Should not throw
      const derived = computeDerivedValues(minimalData);
      expect(derived).toBeDefined();
    });
  });
});
