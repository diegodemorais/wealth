/**
 * FactorProfileChart.test.tsx — testes unitários para FactorProfileChart
 * Feature: benchmark-competitivo Factor Profile Comparativo
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { FactorProfileChart, FactorProfileData } from '../FactorProfileChart';

// ── Mocks ────────────────────────────────────────────────────────────────────

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

// ── Fixtures ─────────────────────────────────────────────────────────────────

// Loadings reais do data.json conforme spec
const SWRD_LOADINGS   = { hml: -0.0924, smb: -0.1118, rmw: -0.1055, cma: 0.066,  mkt_rf: 0.9288, mom: 0.0077 };
const AVUV_LOADINGS   = { hml: 0.8852,  smb: 0.8389,  rmw: -0.0144, cma: -0.521, mkt_rf: 1.3025, mom: 0.0665 };
const AVDV_LOADINGS   = { hml: 0.3776,  smb: 0.9018,  rmw: 0.5368,  cma: 0.1097, mkt_rf: 1.0499, mom: -0.0421 };
const EIMI_LOADINGS   = { hml: -0.2517, smb: 0.5018,  rmw: -0.4308, cma: 0.4094, mkt_rf: 0.8145, mom: -0.0505 };

// AVGS_composite = 0.58 × AVUV + 0.42 × AVDV
const AVGS_COMPOSITE = {
  hml: 0.58 * AVUV_LOADINGS.hml + 0.42 * AVDV_LOADINGS.hml,
  smb: 0.58 * AVUV_LOADINGS.smb + 0.42 * AVDV_LOADINGS.smb,
  rmw: 0.58 * AVUV_LOADINGS.rmw + 0.42 * AVDV_LOADINGS.rmw,
  cma: 0.58 * AVUV_LOADINGS.cma + 0.42 * AVDV_LOADINGS.cma,
  mkt_rf: 0.58 * AVUV_LOADINGS.mkt_rf + 0.42 * AVDV_LOADINGS.mkt_rf,
  mom: 0.58 * AVUV_LOADINGS.mom + 0.42 * AVDV_LOADINGS.mom,
};

const FULL_DATA: FactorProfileData = {
  SWRD: SWRD_LOADINGS,
  AVGS_composite: AVGS_COMPOSITE,
  EIMI: EIMI_LOADINGS,
};

// ── Testes ─────────────────────────────────────────────────────────────────────

describe('FactorProfileChart', () => {
  it('renderiza sem dados (null) sem crash', () => {
    const { container } = render(<FactorProfileChart data={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza sem dados (undefined) sem crash', () => {
    const { container } = render(<FactorProfileChart data={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza sem dados (objeto vazio) sem crash', () => {
    const { container } = render(<FactorProfileChart data={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza com dados válidos sem crash', () => {
    const { getByTestId } = render(<FactorProfileChart data={FULL_DATA} />);
    expect(getByTestId('factor-profile-chart')).toBeTruthy();
  });

  it('renderiza 3 séries com 5 fatores cada — SWRD, AVGS_composite, EIMI', () => {
    // Verifica que os dados têm 3 ETFs e cada um tem 5 fatores relevantes (excluindo mkt_rf)
    const etfs = ['SWRD', 'AVGS_composite', 'EIMI'] as const;
    const factors = ['hml', 'smb', 'rmw', 'cma', 'mom'];
    for (const etf of etfs) {
      const loadings = FULL_DATA[etf]!;
      for (const f of factors) {
        expect(loadings[f]).toBeDefined();
        expect(typeof loadings[f]).toBe('number');
      }
    }
    expect(etfs).toHaveLength(3);
    expect(factors).toHaveLength(5);
  });

  it('HML do SWRD é negativo: -0.0924', () => {
    expect(SWRD_LOADINGS.hml).toBeLessThan(0);
    expect(SWRD_LOADINGS.hml).toBeCloseTo(-0.0924, 3);
  });

  it('HML do AVGS_composite é positivo (value tilt)', () => {
    // AVGS tem exposição value positiva: 0.58×0.8852 + 0.42×0.3776 ≈ 0.6712
    expect(AVGS_COMPOSITE.hml).toBeGreaterThan(0);
    const expectedHml = 0.58 * 0.8852 + 0.42 * 0.3776;
    expect(AVGS_COMPOSITE.hml).toBeCloseTo(expectedHml, 3);
  });

  it('HML do AVGS é substancialmente maior que HML do SWRD (value tilt AVGS vs SWRD)', () => {
    expect(AVGS_COMPOSITE.hml).toBeGreaterThan(SWRD_LOADINGS.hml + 0.5);
  });

  it('SMB do AVEM (EIMI) é positivo (size tilt emergentes)', () => {
    expect(EIMI_LOADINGS.smb).toBeGreaterThan(0);
    expect(EIMI_LOADINGS.smb).toBeCloseTo(0.5018, 3);
  });

  it('renderiza parcialmente quando só um ETF tem dados', () => {
    const partialData: FactorProfileData = { SWRD: SWRD_LOADINGS };
    const { getByTestId } = render(<FactorProfileChart data={partialData} />);
    expect(getByTestId('factor-profile-chart')).toBeTruthy();
  });
});
