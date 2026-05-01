/**
 * SectorExposureChart.test.tsx — testes unitários.
 * Feature: DEV-sector-exposure (2026-05-01)
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SectorExposureChart, SectorExposureData } from '../SectorExposureChart';

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

const FULL_DATA: SectorExposureData = {
  by_sector: {
    'Information Technology':   { total_pct: 18.65, swrd_pct: 12.7,  avgs_pct: 3.15, avem_pct: 2.8,  msci_world_pct: 24.5 },
    'Financials':               { total_pct: 20.90, swrd_pct: 8.0,   avgs_pct: 7.2,  avem_pct: 5.7,  msci_world_pct: 16.2 },
    'Health Care':              { total_pct:  8.35, swrd_pct: 5.6,   avgs_pct: 1.95, avem_pct: 0.8,  msci_world_pct: 11.5 },
    'Consumer Discretionary':   { total_pct: 11.00, swrd_pct: 5.25,  avgs_pct: 3.75, avem_pct: 2.0,  msci_world_pct: 10.7 },
    'Industrials':              { total_pct: 12.60, swrd_pct: 5.4,   avgs_pct: 5.7,  avem_pct: 1.5,  msci_world_pct: 11.0 },
    'Communication Services':   { total_pct:  6.55, swrd_pct: 3.8,   avgs_pct: 1.05, avem_pct: 1.7,  msci_world_pct:  7.8 },
    'Consumer Staples':         { total_pct:  5.40, swrd_pct: 2.95,  avgs_pct: 1.35, avem_pct: 1.1,  msci_world_pct:  6.0 },
    'Energy':                   { total_pct:  5.75, swrd_pct: 1.9,   avgs_pct: 2.25, avem_pct: 1.6,  msci_world_pct:  3.9 },
    'Materials':                { total_pct:  5.95, swrd_pct: 1.75,  avgs_pct: 2.1,  avem_pct: 2.1,  msci_world_pct:  3.6 },
    'Real Estate':              { total_pct:  2.50, swrd_pct: 1.2,   avgs_pct: 0.9,  avem_pct: 0.4,  msci_world_pct:  2.5 },
    'Utilities':                { total_pct:  2.35, swrd_pct: 1.45,  avgs_pct: 0.6,  avem_pct: 0.3,  msci_world_pct:  2.3 },
  },
  dominant: 'Financials',
  as_of: '2026-05-01',
  data_source: 'synthetic_proxy',
  benchmark: 'MSCI World (factsheet abr/2026)',
};

describe('SectorExposureChart', () => {
  it('renderiza placeholder quando data é null', () => {
    const { queryByTestId } = render(<SectorExposureChart data={null} />);
    expect(queryByTestId('sector-exposure-chart')).toBeNull();
  });

  it('renderiza placeholder quando data é undefined', () => {
    const { queryByTestId } = render(<SectorExposureChart data={undefined} />);
    expect(queryByTestId('sector-exposure-chart')).toBeNull();
  });

  it('renderiza placeholder quando by_sector está vazio', () => {
    const { queryByTestId } = render(<SectorExposureChart data={{ by_sector: {} }} />);
    expect(queryByTestId('sector-exposure-chart')).toBeNull();
  });

  it('renderiza com dados completos sem crash', () => {
    const { getByTestId } = render(<SectorExposureChart data={FULL_DATA} />);
    expect(getByTestId('sector-exposure-chart')).toBeTruthy();
  });

  it('exibe setor dominante via badge', () => {
    const { getByTestId } = render(<SectorExposureChart data={FULL_DATA} />);
    const badge = getByTestId('sector-exposure-dominant');
    expect(badge.textContent).toContain('Financials');
    expect(badge.textContent).toContain('20.9');
  });

  it('soma dos 11 setores = 100% (±0.5pp)', () => {
    const total = Object.values(FULL_DATA.by_sector)
      .reduce((sum, row) => sum + row.total_pct, 0);
    expect(total).toBeGreaterThan(99.5);
    expect(total).toBeLessThan(100.5);
  });

  it('contribuição por ETF: total = swrd + avgs + avem (±0.05)', () => {
    for (const [sector, row] of Object.entries(FULL_DATA.by_sector)) {
      const sum = row.swrd_pct + row.avgs_pct + row.avem_pct;
      expect(Math.abs(sum - row.total_pct)).toBeLessThan(0.05);
    }
  });

  it('possui exatamente 11 setores GICS', () => {
    const sectors = Object.keys(FULL_DATA.by_sector);
    expect(sectors.length).toBe(11);
    const expected = [
      'Information Technology', 'Financials', 'Health Care', 'Consumer Discretionary',
      'Industrials', 'Communication Services', 'Consumer Staples', 'Energy',
      'Materials', 'Real Estate', 'Utilities',
    ];
    for (const sec of expected) {
      expect(sectors).toContain(sec);
    }
  });

  it('Financials > Information Technology no portfolio (50/30/20 value tilt)', () => {
    // Validação da insight chave: portfolio 50% market-cap + 50% value tilt
    // resulta em Financials acima de Tech (não como MSCI World que tem Tech 24.5%).
    const fin = FULL_DATA.by_sector['Financials'].total_pct;
    const tech = FULL_DATA.by_sector['Information Technology'].total_pct;
    expect(fin).toBeGreaterThan(tech);
  });

  it('benchmark MSCI World presente em todos os setores', () => {
    for (const row of Object.values(FULL_DATA.by_sector)) {
      expect(row.msci_world_pct).toBeDefined();
      expect(typeof row.msci_world_pct).toBe('number');
    }
  });
});
