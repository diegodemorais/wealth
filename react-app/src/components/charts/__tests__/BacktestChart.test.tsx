/**
 * BacktestChart.test.tsx — DEV-shadow-allocation-series Phase 2 (2026-05-05)
 *
 * Covers:
 *  - Render with 5-series allocation spec → option.series.length === 5 (or 6 with proxy split)
 *  - Correct series names rendered in the chart
 *  - Retro-compat: no `series` prop → legacy 2-series behavior preserved
 *  - Returns null when allocation data missing (N-series mode)
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BacktestChart, AllocationSeriesSpec } from '../BacktestChart';
import { EC } from '@/utils/echarts-theme';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Track the last option passed to EChart for inspection
let lastOption: Record<string, unknown> | null = null;

vi.mock('@/components/primitives/EChart', () => ({
  EChart: vi.fn(({ option }: { option: Record<string, unknown> }) => {
    lastOption = option;
    return React.createElement('div', { 'data-testid': 'echarts-mock' }, 'ECharts mock');
  }),
}));

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
  useUiStore: (selector?: (s: unknown) => unknown) =>
    selector ? selector(MOCK_UI_STATE) : MOCK_UI_STATE,
}));

// ResizeObserver not available in jsdom
class _RO {
  observe() {}
  disconnect() {}
  unobserve() {}
}
(globalThis as Record<string, unknown>).ResizeObserver =
  (globalThis as Record<string, unknown>).ResizeObserver ?? _RO;

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** 62-month date series matching allocation_series.json layout */
function makeDates(n = 62): string[] {
  const dates: string[] = [];
  let year = 2021; let month = 4;
  for (let i = 0; i < n; i++) {
    dates.push(`${year}-${String(month).padStart(2, '0')}`);
    month++;
    if (month > 12) { month = 1; year++; }
  }
  return dates;
}

function makeSeries(n = 62, base = 100): number[] {
  return Array.from({ length: n }, (_, i) => base + i * 0.5);
}

const DATES = makeDates();

const MOCK_ALLOCATION = {
  dates: DATES,
  atual_com_legados: makeSeries(62, 100),
  target_alocacao_total: makeSeries(62, 100),
  shadow_a: makeSeries(62, 100),
  shadow_b: makeSeries(62, 101),
  shadow_c: makeSeries(62, 99),
};

/** Minimal DashboardData shape that satisfies the component */
function makeData(withAllocation = true) {
  return {
    backtest: {
      dates: DATES,
      target: makeSeries(62, 100),
      shadowA: makeSeries(62, 98),
      ...(withAllocation ? { allocation: MOCK_ALLOCATION } : {}),
    },
  } as unknown as import('@/types/dashboard').DashboardData;
}

const FIVE_SERIES: AllocationSeriesSpec[] = [
  { name: 'Atual com Legados', key: 'atual_com_legados', color: EC.accent, area: true, style: 'solid' },
  { name: 'Target (alocação total)', key: 'target_alocacao_total', color: EC.muted, style: 'solid' },
  { name: 'Shadow A (VWRA)', key: 'shadow_a', color: EC.green, style: 'dashed' },
  { name: 'Shadow B (100% IPCA+)', key: 'shadow_b', color: EC.yellow, style: 'dashed' },
  { name: 'Shadow C (benchmark justo)', key: 'shadow_c', color: EC.purple, style: 'dashed' },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BacktestChart — N-series allocation mode', () => {
  it('renders with 5 series spec and chart is mounted', () => {
    lastOption = null;
    render(<BacktestChart data={makeData()} series={FIVE_SERIES} period="since2021" />);
    expect(screen.getByTestId('echarts-mock')).toBeTruthy();
  });

  it('option.series has correct count (5 specs → 6 ECharts series: target split into proxy+live)', () => {
    lastOption = null;
    render(<BacktestChart data={makeData()} series={FIVE_SERIES} period="since2021" />);
    // target_alocacao_total is split into 2 series (proxy + live) → 5 specs → 6 ECharts series
    const seriesArr = ((lastOption as unknown) as Record<string, unknown>)?.series as unknown[];
    expect(Array.isArray(seriesArr)).toBe(true);
    // 1 atual + 2 target (proxy+live) + 3 shadows = 6
    expect(seriesArr.length).toBe(6);
  });

  it('series names include all 5 canonical names', () => {
    lastOption = null;
    render(<BacktestChart data={makeData()} series={FIVE_SERIES} period="since2021" />);
    const seriesArr = ((lastOption as unknown) as Record<string, unknown>)?.series as Array<{ name: string }>;
    const names = seriesArr.map(s => s.name);
    expect(names).toContain('Atual com Legados');
    expect(names).toContain('Target (alocação total)');
    expect(names).toContain('Shadow A (VWRA)');
    expect(names).toContain('Shadow B (100% IPCA+)');
    expect(names).toContain('Shadow C (benchmark justo)');
  });

  it('protagonist (Atual com Legados) has areaStyle', () => {
    lastOption = null;
    render(<BacktestChart data={makeData()} series={FIVE_SERIES} period="since2021" />);
    const seriesArr = ((lastOption as unknown) as Record<string, unknown>)?.series as Array<{ name: string; areaStyle?: unknown }>;
    const atual = seriesArr.find(s => s.name === 'Atual com Legados');
    expect(atual).toBeDefined();
    expect(atual?.areaStyle).toBeDefined();
  });

  it('shadow series have dashed lineStyle', () => {
    lastOption = null;
    render(<BacktestChart data={makeData()} series={FIVE_SERIES} period="since2021" />);
    const seriesArr = ((lastOption as unknown) as Record<string, unknown>)?.series as Array<{ name: string; lineStyle: { type?: string } }>;
    const shadowA = seriesArr.find(s => s.name === 'Shadow A (VWRA)');
    expect(shadowA?.lineStyle.type).toBe('dashed');
    const shadowB = seriesArr.find(s => s.name === 'Shadow B (100% IPCA+)');
    expect(shadowB?.lineStyle.type).toBe('dashed');
    const shadowC = seriesArr.find(s => s.name === 'Shadow C (benchmark justo)');
    expect(shadowC?.lineStyle.type).toBe('dashed');
  });

  it('returns null (no chart) when allocation data is missing in N-series mode', () => {
    lastOption = null;
    const { container } = render(<BacktestChart data={makeData(false)} series={FIVE_SERIES} />);
    expect(screen.queryByTestId('echarts-mock')).toBeNull();
    expect(container.firstChild).toBeNull();
  });
});

describe('BacktestChart — retro-compat (no series prop)', () => {
  it('renders legacy 2-series chart when no series prop provided', () => {
    lastOption = null;
    render(<BacktestChart data={makeData()} />);
    expect(screen.getByTestId('echarts-mock')).toBeTruthy();
    const seriesArr = ((lastOption as unknown) as Record<string, unknown>)?.series as Array<{ name: string }>;
    expect(Array.isArray(seriesArr)).toBe(true);
    expect(seriesArr.length).toBe(2);
    expect(seriesArr[0].name).toBe('Target');
    expect(seriesArr[1].name).toBe('VWRA');
  });

  it('returns null when backtest.dates is empty and no series prop', () => {
    const emptyData = {
      backtest: { dates: [], target: [], shadowA: [] },
    } as unknown as import('@/types/dashboard').DashboardData;
    const { container } = render(<BacktestChart data={emptyData} />);
    expect(container.firstChild).toBeNull();
  });
});
