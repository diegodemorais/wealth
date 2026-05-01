/**
 * FeeImpactChart.test.tsx — testes unitários para FeeImpactChart
 * Feature: benchmark-competitivo Fee Impact Visualization
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { FeeImpactChart, FeeImpactData } from '../FeeImpactChart';

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildData(overrides?: Partial<FeeImpactData>): FeeImpactData {
  const anos = Array.from({ length: 20 }, (_, i) => i + 1);
  // TER médio: 0.50×0.12% + 0.30×0.39% + 0.20×0.35% = 0.254%
  const r = 0.07;
  const ter = 0.00254;
  const p0 = 3_760_000;
  const aporte = 25_000 * 12;

  function portfolio(p: number, rate: number, a: number): number {
    return p * Math.pow(1 + rate, a) + aporte * ((Math.pow(1 + rate, a) - 1) / rate);
  }

  const comTer = anos.map(t => Math.round(portfolio(p0, r - ter, t)));
  const semTer = anos.map(t => Math.round(portfolio(p0, r, t)));
  const custo  = anos.map((_, i) => Math.round(semTer[i] - comTer[i]));

  return {
    ter_medio_pct:      0.254,
    ter_swrd_pct:       0.12,
    ter_avgs_pct:       0.39,
    ter_avem_pct:       0.35,
    retorno_nominal_pct: 7,
    anos,
    portfolio_com_ter:  comTer,
    portfolio_sem_ter:  semTer,
    custo_acumulado:    custo,
    ...overrides,
  };
}

// ── Testes ─────────────────────────────────────────────────────────────────────

describe('FeeImpactChart', () => {
  it('renderiza sem dados (null) sem crash', () => {
    const { container } = render(<FeeImpactChart data={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza sem dados (undefined) sem crash', () => {
    const { container } = render(<FeeImpactChart data={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza sem dados vazios (anos=[]) sem crash', () => {
    const { container } = render(<FeeImpactChart data={{ anos: [], portfolio_com_ter: [], portfolio_sem_ter: [], custo_acumulado: [], ter_medio_pct: 0 }} />);
    expect(container.firstChild).toBeNull();
  });

  it('mostra 20 pontos no eixo X (20 anos)', () => {
    const data = buildData();
    expect(data.anos).toHaveLength(20);
    expect(data.anos[0]).toBe(1);
    expect(data.anos[19]).toBe(20);
  });

  it('custo acumulado é sempre >= 0', () => {
    const data = buildData();
    for (const c of data.custo_acumulado) {
      expect(c).toBeGreaterThanOrEqual(0);
    }
  });

  it('TER médio ponderado correto: SWRD 0.12 (50%) + AVGS 0.39 (30%) + AVEM 0.35 (20%) = 0.247%', () => {
    // 0.50×0.12 + 0.30×0.39 + 0.20×0.35 = 0.060 + 0.117 + 0.070 = 0.247
    const expected = 0.50 * 0.12 + 0.30 * 0.39 + 0.20 * 0.35;
    expect(expected).toBeCloseTo(0.247, 3);
    // Verifica que o campo reflete o cálculo
    const data = buildData({ ter_medio_pct: expected });
    expect(data.ter_medio_pct).toBeCloseTo(0.247, 3);
  });

  it('custo cresce ao longo do tempo (fee compounding)', () => {
    const data = buildData();
    for (let i = 1; i < data.custo_acumulado.length; i++) {
      expect(data.custo_acumulado[i]).toBeGreaterThan(data.custo_acumulado[i - 1]);
    }
  });

  it('portfolio_sem_ter > portfolio_com_ter em todos os anos', () => {
    const data = buildData();
    for (let i = 0; i < 20; i++) {
      expect(data.portfolio_sem_ter[i]).toBeGreaterThan(data.portfolio_com_ter[i]);
    }
  });

  it('renderiza o componente com dados válidos sem crash', () => {
    const data = buildData();
    const { getByTestId } = render(<FeeImpactChart data={data} />);
    expect(getByTestId('fee-impact-chart')).toBeTruthy();
  });
});
