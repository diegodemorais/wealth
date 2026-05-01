/**
 * EfficientFrontierChart.test.tsx — testes unitários (DEV-efficient-frontier-v2 2026-05-02)
 *
 * Cobre os 3 testids novos da v2:
 *  - ef-diagnostic-banner (sempre visível)
 *  - ef-regime-label (value spread percentile)
 *  - ef-rebalance-delta-table (Max Sharpe + Min Vol)
 * Mais o disclaimer BL.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EfficientFrontierChart } from '../EfficientFrontierChart';

// useChartResize — mock file; hidden-container handling is in the real component
vi.mock('echarts-for-react', () => ({
  default: () => React.createElement('div', { 'data-testid': 'echarts-mock' }, 'ECharts mock'),
}));

vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

const MOCK_UI_STATE = {
  privacyMode: false,
  togglePrivacy: vi.fn(),
  setPrivacy: vi.fn(),
  collapseState: {},
  toggleCollapse: vi.fn(),
  setCollapse: vi.fn(),
};

vi.mock('@/store/uiStore', () => ({
  useUiStore: (selector?: (s: any) => any) =>
    selector ? selector(MOCK_UI_STATE) : MOCK_UI_STATE,
}));

function makePoint(vol: number, ret: number, weights: Record<string, number>) {
  const sharpe = (ret - 0.0534) / vol;
  return {
    vol,
    ret,
    sharpe,
    sharpe_net: sharpe * 0.97,
    ret_net: ret - 0.001,
    haircut_anual: 0.001,
    weights,
  };
}

const REBALANCE_DELTA = {
  delta_brl: [-100000, 50000, 50000, 0, 0, 0],
  delta_pp: [-0.05, 0.025, 0.025, 0, 0, 0],
  spread_total_brl: 100,
  ir_total_brl: 15000,
  ir_per_asset_brl: [15000, 0, 0, 0, 0, 0],
  total_cost_brl: 15100,
};

const SCENARIO = {
  crypto_on: {
    points: [
      makePoint(0.10, 0.07, { SWRD: 0.40, AVGS: 0.20, AVEM: 0.10, RF_EST: 0.20, RF_TAT: 0.05, HODL11: 0.05 }),
      makePoint(0.15, 0.09, { SWRD: 0.45, AVGS: 0.25, AVEM: 0.15, RF_EST: 0.10, RF_TAT: 0.00, HODL11: 0.05 }),
    ],
    current: { ...makePoint(0.12, 0.08, { SWRD: 0.395, AVGS: 0.237, AVEM: 0.158, RF_EST: 0.15, RF_TAT: 0.03, HODL11: 0.03 }), feasible: true },
    max_sharpe: { ...makePoint(0.13, 0.085, { SWRD: 0.43, AVGS: 0.14, AVEM: 0.08, RF_EST: 0.20, RF_TAT: 0.10, HODL11: 0.05 }), rebalance_delta: REBALANCE_DELTA },
    min_vol: { ...makePoint(0.05, 0.06, { SWRD: 0.30, AVGS: 0.10, AVEM: 0.10, RF_EST: 0.30, RF_TAT: 0.10, HODL11: 0.10 }), rebalance_delta: REBALANCE_DELTA },
    n_portfolios: 2,
  },
  crypto_off: {
    points: [makePoint(0.10, 0.07, { SWRD: 0.40, AVGS: 0.20, AVEM: 0.10, RF_EST: 0.20, RF_TAT: 0.10, HODL11: 0.0 })],
    current: { ...makePoint(0.12, 0.08, { SWRD: 0.395, AVGS: 0.237, AVEM: 0.158, RF_EST: 0.15, RF_TAT: 0.03, HODL11: 0.03 }), feasible: false },
    max_sharpe: makePoint(0.11, 0.08, { SWRD: 0.40, AVGS: 0.20, AVEM: 0.10, RF_EST: 0.20, RF_TAT: 0.10, HODL11: 0.0 }),
    min_vol: makePoint(0.05, 0.06, { SWRD: 0.30, AVGS: 0.10, AVEM: 0.10, RF_EST: 0.30, RF_TAT: 0.10, HODL11: 0.10 }),
    n_portfolios: 1,
  },
  rf: 0.0534,
  cov_method: 'ledoit_wolf',
  mu: { SWRD: 0.07, AVGS: 0.09, AVEM: 0.08, RF_EST: 0.0534, RF_TAT: 0.07, HODL11: 0.04 },
  assets: ['SWRD', 'AVGS', 'AVEM', 'RF_EST', 'RF_TAT', 'HODL11'],
  caps: {
    SWRD:   [0, 0.50] as [number, number],
    AVGS:   [0, 0.35] as [number, number],
    AVEM:   [0, 0.25] as [number, number],
    RF_EST: [0, 0.30] as [number, number],
    RF_TAT: [0, 0.10] as [number, number],
    HODL11: [0, 0.05] as [number, number],
  },
  group_constraints: {
    equity_group: ['SWRD', 'AVGS', 'AVEM'],
    equity_bounds: [0.50, 0.90] as [number, number],
    rf_group: ['RF_EST', 'RF_TAT'],
    rf_bounds: [0.05, 0.30] as [number, number],
  },
  as_of: '2026-05-02',
  metodologia_version: 'ef-historica-v1',
  panel: { n_months: 120, start: '2016-05-31', end: '2026-04-30', rf_real_brl: 0.0534 },
  patrimonio_total_brl: 3_685_261,
  transaction_spread: 0.0005,
  tax_rates: { SWRD: 0.15, AVGS: 0.15, AVEM: 0.15, RF_EST: 0.0, RF_TAT: 0.15, HODL11: 0.15 },
};

const BL_SCENARIO = {
  ...SCENARIO,
  metodologia_version: 'ef-bl-v2',
  disclaimer: 'Black-Litterman incorpora views (AQR/RA) sobre equilibrium implícito (MSCI ACWI weights). Sensível a calibração de τ/Ω. Idzorek 2005.',
  bl_meta: {
    lambda: 2.5,
    tau: 0.05,
    omega_diag: [0.001, 0.002, 0.003, 0.004],
    view_assets: ['SWRD', 'AVGS', 'AVEM', 'HODL11'],
    Q_views_brl_real: [0.029, 0.060, 0.070, 0.015],
    prior_pi_brl_real: [0.05, 0.06, 0.07, 0.0534, 0.07, 0.0132],
    posterior_mu_brl_real: [0.045, 0.058, 0.069, 0.0534, 0.07, 0.012],
    w_mkt: { SWRD: 0.395, AVGS: 0.237, AVEM: 0.158, RF_EST: 0.15, RF_TAT: 0.03, HODL11: 0.03 },
    method: 'Idzorek 2005 — diagonal Ω = τ · diag(P·Σ·P\')',
    sanity_check: { passed: true, violations: [], rules: [] },
  },
};

const FULL_DATA = { historica: SCENARIO, bl: BL_SCENARIO };

describe('EfficientFrontierChart v2', () => {
  it('renders the diagnostic banner permanently', () => {
    render(<EfficientFrontierChart data={FULL_DATA} />);
    expect(screen.getByTestId('ef-diagnostic-banner')).toBeTruthy();
    expect(screen.getByTestId('ef-diagnostic-banner').textContent).toMatch(/diagnóstico/i);
  });

  it('renders the regime label with percentile (P42 → neutro)', () => {
    render(<EfficientFrontierChart data={FULL_DATA} valueSpread={{ percentile_hml: 42 }} />);
    const label = screen.getByTestId('ef-regime-label');
    expect(label).toBeTruthy();
    expect(label.textContent).toMatch(/P42/);
    expect(label.textContent).toMatch(/neutro/i);
  });

  it('regime label flags amplo when percentile >= 70', () => {
    render(<EfficientFrontierChart data={FULL_DATA} valueSpread={{ percentile_hml: 75 }} />);
    expect(screen.getByTestId('ef-regime-label').textContent).toMatch(/amplo/i);
  });

  it('regime label flags comprimido when percentile < 30', () => {
    render(<EfficientFrontierChart data={FULL_DATA} valueSpread={{ percentile_hml: 12 }} />);
    expect(screen.getByTestId('ef-regime-label').textContent).toMatch(/comprimido/i);
  });

  it('renders the rebalance delta table for Max Sharpe and Min Vol', () => {
    render(<EfficientFrontierChart data={FULL_DATA} />);
    const table = screen.getByTestId('ef-rebalance-delta-table');
    expect(table).toBeTruthy();
    // Should mention both special points
    expect(table.textContent).toMatch(/MAX SHARPE/);
    expect(table.textContent).toMatch(/MIN VOL/);
    // Total row appears twice (once per table)
    expect(table.textContent).toMatch(/Total/);
  });

  it('does NOT render BL disclaimer when scenario is histórica', () => {
    render(<EfficientFrontierChart data={FULL_DATA} />);
    expect(screen.queryByTestId('ef-bl-disclaimer')).toBeNull();
  });

  it('renders without crashing when data is null', () => {
    const { container } = render(<EfficientFrontierChart data={null} />);
    expect(container.textContent).toMatch(/não disponível/);
  });

  it('renders without value spread (regime label shows indisponível)', () => {
    render(<EfficientFrontierChart data={FULL_DATA} />);
    const label = screen.getByTestId('ef-regime-label');
    expect(label.textContent).toMatch(/indisponível/i);
  });
});
