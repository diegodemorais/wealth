import { describe, it, expect } from 'vitest';
import { computeDerivedValues } from '../dataWiring';
import { DashboardData } from '@/types/dashboard';

describe('Data Wiring & Derived Values', () => {
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
      SWRD: { qty: 100, avg_cost: 100, price: 105, bucket: 'global-equity', status: 'ok', ter: 0.008 },
      AVGS: { qty: 50, avg_cost: 150, price: 160, bucket: 'global-equity', status: 'ok', ter: 0.0055 },
      'IPCA+2050': { qty: 100, avg_cost: 1000, price: 1050, bucket: 'fixed-income', status: 'ok', ter: 0.0005 },
    },
    pesosTarget: {
      SWRD: 0.4,
      AVGS: 0.3,
      'IPCA+2050': 0.3,
    },
    pisos: {
      pisoTaxaIpcaLongo: 0.045,
      pisoTaxaRendaPlus: 0.05,
      pisoVendaRendaPlus: 0.045,
      ir_aliquota: 0.15,
    },
    premissas: {
      _tempo_acumulo: 15,
      _taxa_retorno_equity: 0.07,
      _taxa_retorno_rf: 0.045,
      _inflacao: 0.03,
    },
  };

  describe('computeDerivedValues', () => {
    it('returns object with all required fields', () => {
      const derived = computeDerivedValues(mockData);

      expect(derived).toHaveProperty('networth');
      expect(derived).toHaveProperty('networthUsd');
      expect(derived).toHaveProperty('monthlyIncome');
      expect(derived).toHaveProperty('yearlyExpense');
      expect(derived).toHaveProperty('fireDate');
      expect(derived).toHaveProperty('firePercentage');
      expect(derived).toHaveProperty('wellnessScore');
      expect(derived).toHaveProperty('wellnessStatus');
    });

    it('calculates networth from positions', () => {
      const derived = computeDerivedValues(mockData);
      // SWRD: 100 * 105 = 10,500
      // AVGS: 50 * 160 = 8,000
      // IPCA+: 100 * 1050 = 105,000
      // Total = 123,500
      expect(derived.networth).toBeGreaterThan(0);
    });

    it('converts networth to USD using cambio', () => {
      const derived = computeDerivedValues(mockData);
      expect(derived.networthUsd).toBeLessThan(derived.networth);
      expect(derived.networthUsd).toBeCloseTo(derived.networth / 5.0, 0);
    });

    it('calculates FIRE percentage', () => {
      const derived = computeDerivedValues(mockData);
      expect(derived.firePercentage).toBeGreaterThanOrEqual(0);
      expect(derived.firePercentage).toBeLessThanOrEqual(1);
    });

    it('determines wellness status correctly', () => {
      const derived = computeDerivedValues(mockData);
      const validStatuses = ['critical', 'warning', 'ok', 'excellent'];
      expect(validStatuses).toContain(derived.wellnessStatus);
    });

    it('calculates wellness score between 0 and 100', () => {
      const derived = computeDerivedValues(mockData);
      expect(derived.wellnessScore).toBeGreaterThanOrEqual(0);
      expect(derived.wellnessScore).toBeLessThanOrEqual(100);
    });

    it('returns valid FIRE date in future or present', () => {
      const derived = computeDerivedValues(mockData);
      expect(derived.fireDate instanceof Date).toBe(true);
      expect(derived.fireDate.getFullYear()).toBeGreaterThanOrEqual(2026);
    });
  });
});
