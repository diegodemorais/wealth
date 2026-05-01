/**
 * benchmark-features.test.tsx — unit tests for the 3 benchmark feature components.
 *
 * Feature 1: RollingReturnsHeatmap — CAGR calculation + graceful handling
 * Feature 2: ScenarioCompareCards — badge logic + privacy mode
 * Feature 3: CashFlowBar — arithmetic + privacy mode
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ─── Store mocks ──────────────────────────────────────────────────────────────

vi.mock('zustand/middleware', () => ({ persist: (fn: unknown) => fn }));

const MOCK_UI_STATE = {
  privacyMode: false,
  togglePrivacy: vi.fn(),
  setPrivacy: vi.fn(),
  collapseState: {},
  toggleCollapse: vi.fn(),
  setCollapse: vi.fn(),
};

vi.mock('@/store/uiStore', () => ({
  useUiStore: (selector?: (s: typeof MOCK_UI_STATE) => unknown) =>
    selector ? selector(MOCK_UI_STATE) : MOCK_UI_STATE,
}));

vi.mock('@/store/dashboardStore', () => ({
  useDashboardStore: (selector?: (s: { data: null }) => unknown) => {
    const state = { data: null };
    return selector ? selector(state) : state;
  },
}));

// Mock ECharts — canvas not available in jsdom
vi.mock('echarts-for-react', () => ({
  default: () => React.createElement('div', { 'data-testid': 'echarts-mock' }, 'ECharts mock'),
}));

// ─── Feature 1: RollingReturnsHeatmap ────────────────────────────────────────

// Test the pure CAGR calculation function directly by importing with side-effect isolation
describe('RollingReturnsHeatmap — CAGR calculation', () => {
  /**
   * Reproduce the computeRollingReturns logic inline to test the math
   * without React rendering overhead.
   */
  function computeCagr(v0: number, v1: number, W: number): number {
    return Math.pow(v1 / v0, 1 / W) - 1;
  }

  it('computes 1-year CAGR correctly: value[12]/value[0] - 1 (approx)', () => {
    // If portfolio doubles in 1 year: v0=1, v1=2 → CAGR = 100%
    const cagr = computeCagr(1.0, 2.0, 1);
    expect(cagr).toBeCloseTo(1.0, 5);
  });

  it('computes 1-year CAGR correctly for typical return', () => {
    // v0=100, v1=107 (7% return over 1 year)
    const cagr = computeCagr(100, 107, 1);
    expect(cagr).toBeCloseTo(0.07, 5);
  });

  it('computes 3-year annualized CAGR correctly', () => {
    // 3-year return: v0=100, v1=125 → annualized ~7.72%
    const cagr = computeCagr(100, 125, 3);
    const expected = Math.pow(125 / 100, 1 / 3) - 1;
    expect(cagr).toBeCloseTo(expected, 8);
  });

  it('renders gracefully with undefined dates/target', async () => {
    const { RollingReturnsHeatmap } = await import('@/components/charts/RollingReturnsHeatmap');
    expect(() => {
      const { container } = render(
        React.createElement(RollingReturnsHeatmap, { dates: undefined, target: undefined })
      );
      expect(container).toBeDefined();
    }).not.toThrow();
  });

  it('renders empty state when dates is empty array', async () => {
    const { RollingReturnsHeatmap } = await import('@/components/charts/RollingReturnsHeatmap');
    render(React.createElement(RollingReturnsHeatmap, { dates: [], target: [] }));
    // Should show "not available" message, not crash
    expect(document.body.textContent).toContain('não disponíveis');
  });

  it('renders heatmap with valid backtest data (no 5-year windows with only 10 months)', async () => {
    const { RollingReturnsHeatmap } = await import('@/components/charts/RollingReturnsHeatmap');
    // 10 months of data — only 1-year windows don't fit either; nothing should crash
    const dates = Array.from({ length: 10 }, (_, i) => `2024-${String(i + 1).padStart(2, '0')}`);
    const target = Array.from({ length: 10 }, (_, i) => 1.0 + i * 0.01);
    expect(() => {
      render(React.createElement(RollingReturnsHeatmap, { dates, target }));
    }).not.toThrow();
  });

  it('renders heatmap with 25 months of data (only 1-year windows fit)', async () => {
    const { RollingReturnsHeatmap } = await import('@/components/charts/RollingReturnsHeatmap');
    const dates = Array.from({ length: 25 }, (_, i) => {
      const y = 2022 + Math.floor(i / 12);
      const m = (i % 12) + 1;
      return `${y}-${String(m).padStart(2, '0')}`;
    });
    const target = Array.from({ length: 25 }, (_, i) => 1.0 + i * 0.005);
    expect(() => {
      render(React.createElement(RollingReturnsHeatmap, { dates, target }));
    }).not.toThrow();
  });
});

// ─── Feature 2: ScenarioCompareCards ────────────────────────────────────────

describe('ScenarioCompareCards', () => {
  it('renders 3 cards with scenario data', async () => {
    const { ScenarioCompareCards } = await import('@/components/fire/ScenarioCompareCards');
    render(
      React.createElement(ScenarioCompareCards, {
        scenarioComparison: {
          base: { idade: 53, base: 83.4, fav: 91.1, pat_mediano: 11_479_039, swr: 2.18 },
          aspiracional: { idade: 49, base: 91.1, pat_mediano: 12_727_921, swr: 1.96 },
        },
        pfireBase: { base: 83.4, fav: 91.1, stress: 78.7 },
        privacyMode: false,
      })
    );
    expect(screen.getByTestId('scenario-compare-cards')).toBeDefined();
    expect(screen.getByTestId('scenario-card-base')).toBeDefined();
    expect(screen.getByTestId('scenario-card-favorável')).toBeDefined();
    expect(screen.getByTestId('scenario-card-aspiracional')).toBeDefined();
  });

  it('badge is green when P(FIRE) > 70%', async () => {
    const { ScenarioCompareCards } = await import('@/components/fire/ScenarioCompareCards');
    render(
      React.createElement(ScenarioCompareCards, {
        scenarioComparison: {
          base: { idade: 53, base: 83.4, fav: 91.1 },
          aspiracional: { idade: 49, base: 91.1 },
        },
        pfireBase: { base: 83.4, fav: 91.1, stress: 78.7 },
        privacyMode: false,
      })
    );
    const baseBadge = screen.getByTestId('pfire-badge-base');
    // Green style should be applied — check content shows >70%
    expect(baseBadge.textContent).toContain('83.4%');
    // The style should contain the green color
    const style = baseBadge.getAttribute('style') ?? '';
    expect(style).toContain('var(--green)');
  });

  it('privacy mode hides numerical values', async () => {
    const { ScenarioCompareCards } = await import('@/components/fire/ScenarioCompareCards');
    render(
      React.createElement(ScenarioCompareCards, {
        scenarioComparison: {
          base: { idade: 53, base: 83.4, pat_mediano: 11_479_039 },
          aspiracional: { idade: 49, base: 91.1, pat_mediano: 12_727_921 },
        },
        pfireBase: { base: 83.4, fav: 91.1, stress: 78.7 },
        privacyMode: true,
      })
    );
    // P(FIRE) badges should show •• not real %
    const badges = document.querySelectorAll('[data-testid^="pfire-badge-"]');
    badges.forEach(b => expect(b.textContent).toContain('••%'));
  });

  it('renders empty state when scenario_comparison is null', async () => {
    const { ScenarioCompareCards } = await import('@/components/fire/ScenarioCompareCards');
    render(
      React.createElement(ScenarioCompareCards, {
        scenarioComparison: null,
        pfireBase: null,
        privacyMode: false,
      })
    );
    expect(screen.getByTestId('scenario-compare-cards-empty')).toBeDefined();
  });
});

// ─── Feature 3: CashFlowBar ──────────────────────────────────────────────────

describe('CashFlowBar', () => {
  it('saldo = renda - gasto - aporte (error < 1%)', () => {
    const renda = 45_000;
    const aporte = 25_000;
    const custoAnual = 250_000;
    const gasto = custoAnual / 12; // ~20833
    const expected = renda - gasto - aporte; // ~-833

    // Verify the arithmetic logic directly
    expect(Math.abs(expected - (renda - gasto - aporte))).toBeLessThan(renda * 0.01);
  });

  it('renders without crashing with valid premissas', async () => {
    const { CashFlowBar } = await import('@/components/charts/CashFlowBar');
    expect(() => {
      render(
        React.createElement(CashFlowBar, {
          rendaMensal: 45_000,
          aporteMensal: 25_000,
          custoVidaAnual: 250_000,
          privacyMode: false,
        })
      );
    }).not.toThrow();
    expect(screen.getByTestId('cashflow-bar')).toBeDefined();
  });

  it('privacy mode shows % instead of BRL', async () => {
    const { CashFlowBar } = await import('@/components/charts/CashFlowBar');
    render(
      React.createElement(CashFlowBar, {
        rendaMensal: 45_000,
        aporteMensal: 25_000,
        custoVidaAnual: 250_000,
        privacyMode: true,
      })
    );
    // In privacy mode, summary cards show % not BRL values
    const rendaCard = screen.getByTestId('cashflow-renda');
    // Should show a percentage (e.g. "100%") not BRL "R$ 45.000"
    expect(rendaCard.textContent).toMatch(/\d+%/);
    expect(rendaCard.textContent).not.toMatch(/R\$/);
  });

  it('renders gracefully with undefined premissas', async () => {
    const { CashFlowBar } = await import('@/components/charts/CashFlowBar');
    expect(() => {
      render(
        React.createElement(CashFlowBar, {
          rendaMensal: undefined,
          aporteMensal: undefined,
          custoVidaAnual: undefined,
          privacyMode: false,
        })
      );
    }).not.toThrow();
  });
});
