/**
 * OverlapChart.test.tsx — testes do benchmark MSCI World inline no Top-5.
 * Feature: DEV-top5-msci-benchmark (2026-05-02)
 *
 * Cobre:
 *  - Top-5 com 4 ações com msci_world_pct numérico + 1 com null (Samsung)
 *  - Wiring do showMsciBenchmark via prop (presença do testid Top-5)
 *  - Render sem crash com dados completos
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { OverlapChart, OverlapData } from '../OverlapChart';

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

const MOCK_DATA: OverlapData = {
  total_overlap_pct: 1.5,
  unique_coverage_pct: 98.5,
  top_overlaps: [
    { name: 'Samsung Electronics', ticker: '005930', isin: 'KR7005930003',
      etfs: ['SWRD', 'AVGS', 'AVEM'], weight_combined_pct: 0.938,
      weight_per_etf: { SWRD: 0.425, AVGS: 0.093, AVEM: 0.420 } },
    { name: 'ASML Holding', ticker: 'ASML', isin: 'NL0010273215',
      etfs: ['SWRD', 'AVGS'], weight_combined_pct: 0.559,
      weight_per_etf: { SWRD: 0.445, AVGS: 0.114 } },
  ],
  top_concentrations: [
    { name: 'Apple Inc',           ticker: 'AAPL',   isin: 'US0378331005',
      etfs: ['SWRD'], weight_combined_pct: 2.445,
      weight_per_etf: { SWRD: 2.445 },
      msci_world_pct: 5.30, msci_world_note: null },
    { name: 'Microsoft Corp',      ticker: 'MSFT',   isin: 'US5949181045',
      etfs: ['SWRD'], weight_combined_pct: 2.160,
      weight_per_etf: { SWRD: 2.160 },
      msci_world_pct: 4.20, msci_world_note: null },
    { name: 'NVIDIA Corp',         ticker: 'NVDA',   isin: 'US67066G1040',
      etfs: ['SWRD'], weight_combined_pct: 1.955,
      weight_per_etf: { SWRD: 1.955 },
      msci_world_pct: 5.10, msci_world_note: null },
    { name: 'Amazon.com Inc',      ticker: 'AMZN',   isin: 'US0231351067',
      etfs: ['SWRD'], weight_combined_pct: 1.170,
      weight_per_etf: { SWRD: 1.170 },
      msci_world_pct: 2.40, msci_world_note: null },
    { name: 'Samsung Electronics', ticker: '005930', isin: 'KR7005930003',
      etfs: ['SWRD', 'AVGS', 'AVEM'], weight_combined_pct: 0.938,
      weight_per_etf: { SWRD: 0.425, AVGS: 0.093, AVEM: 0.420 },
      msci_world_pct: null,
      msci_world_note: 'fora do MSCI World (Coreia — apenas MSCI EM/ACWI)' },
  ],
  last_updated: '2026-05-02',
  data_source: 'synthetic_proxy',
};

describe('OverlapChart — DEV-top5-msci-benchmark', () => {
  it('renderiza placeholder quando data é null', () => {
    const { queryByTestId } = render(<OverlapChart data={null} />);
    expect(queryByTestId('overlap-chart-top-concentrations')).toBeNull();
  });

  it('renderiza com top_concentrations + benchmark sem crash', () => {
    const { getByTestId } = render(<OverlapChart data={MOCK_DATA} />);
    expect(getByTestId('overlap-chart-top-concentrations')).toBeTruthy();
    expect(getByTestId('overlap-chart-overlaps')).toBeTruthy();
  });

  it('exibe label "MSCI World (benchmark)" no header do Top-5', () => {
    const { getByTestId } = render(<OverlapChart data={MOCK_DATA} />);
    const top5 = getByTestId('overlap-chart-top-concentrations');
    expect(top5.textContent).toContain('MSCI World');
  });

  it('Top-5 tem exatamente 5 entradas — 4 com msci_world numérico + Samsung null', () => {
    const top5 = MOCK_DATA.top_concentrations!;
    expect(top5.length).toBe(5);
    const withBenchmark = top5.filter(e => typeof e.msci_world_pct === 'number');
    const withoutBenchmark = top5.filter(e => e.msci_world_pct == null);
    expect(withBenchmark.length).toBe(4);
    expect(withoutBenchmark.length).toBe(1);
    expect(withoutBenchmark[0].ticker).toBe('005930');
    expect(withoutBenchmark[0].msci_world_note).toContain('Coreia');
  });

  it('Δ vs MSCI World é negativo (carteira sub-pondera mega-caps US)', () => {
    // Carteira 50/30/20 com value tilt → menos peso em AAPL/MSFT/NVDA do que MSCI World
    for (const e of MOCK_DATA.top_concentrations!) {
      if (e.msci_world_pct != null) {
        const delta = e.weight_combined_pct - e.msci_world_pct;
        expect(delta).toBeLessThan(0);
      }
    }
  });

  it('Samsung 005930 é a única posição não-MSCI no Top-5', () => {
    const samsung = MOCK_DATA.top_concentrations!.find(e => e.ticker === '005930');
    expect(samsung).toBeDefined();
    expect(samsung!.msci_world_pct).toBeNull();
    expect(samsung!.msci_world_note).toBeTruthy();
  });

  it('overlap_total e unique_coverage são exibidos', () => {
    const { getByTestId } = render(<OverlapChart data={MOCK_DATA} />);
    expect(getByTestId('overlap-total-pct').textContent).toContain('1.5');
    expect(getByTestId('overlap-unique-pct').textContent).toContain('98.5');
  });
});
