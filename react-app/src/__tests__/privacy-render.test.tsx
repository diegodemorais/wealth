/**
 * Component Render Tests — Privacy Mode
 *
 * Verifies that PerformanceSummary and FireScenariosTable mask values
 * when privacyMode=true. Uses the same mock pattern as component-render.test.tsx.
 *
 * Issue: QA-test-plan-audit (QA-Médio)
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { DashboardData } from '@/types/dashboard';

// ─────────────────────────────────────────────────────────────────────────────
// Mock zustand persist middleware
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

// ─────────────────────────────────────────────────────────────────────────────
// uiStore mock — configurable privacyMode per test
// ─────────────────────────────────────────────────────────────────────────────

const mockUiState = {
  privacyMode: false,
  togglePrivacy: vi.fn(),
  setPrivacy: vi.fn(),
  collapseState: {},
  toggleCollapse: vi.fn(),
  setCollapse: vi.fn(),
  activeSimulator: 'mc',
  setActiveSimulator: vi.fn(),
  activePeriod: 'all',
  setActivePeriod: vi.fn(),
  withdrawScenario: 'atual',
  setWithdrawScenario: vi.fn(),
};

vi.mock('@/store/uiStore', () => ({
  useUiStore: (selector?: (s: any) => any) =>
    selector ? selector(mockUiState) : mockUiState,
}));

// ─────────────────────────────────────────────────────────────────────────────
// dashboardStore mock
// ─────────────────────────────────────────────────────────────────────────────

const mockStoreState = { data: null as DashboardData | null };

vi.mock('@/store/dashboardStore', () => ({
  useDashboardStore: (selector?: (s: any) => any) => {
    const state = {
      data: mockStoreState.data,
      derived: null,
      isLoadingData: false,
      dataLoadError: null,
      loadDataOnce: vi.fn().mockResolvedValue({}),
      setData: vi.fn(),
      updateField: vi.fn(),
      stress: { returnShock: 0, volatilityShock: 0, contributionShock: 0 },
      mcParams: {
        initialCapital: 1000000,
        monthlyContribution: 5000,
        returnMean: 0.07,
        returnStd: 0.12,
        stressLevel: 0,
        years: 30,
        numSims: 1000,
      },
      mcResults: null,
      setStressShock: vi.fn(),
      setMcParams: vi.fn(),
      setMcResults: vi.fn(),
      runMC: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

// Mock ECharts (canvas not available in jsdom)
vi.mock('echarts-for-react', () => ({
  default: () => React.createElement('div', { 'data-testid': 'echarts-mock' }, 'ECharts mock'),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Load real data once
// ─────────────────────────────────────────────────────────────────────────────

let realData: DashboardData;

beforeAll(() => {
  const dataPath = path.join(__dirname, '../../public/data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error('public/data.json not found — run build first');
  }
  realData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  mockStoreState.data = realData;
});

// ─────────────────────────────────────────────────────────────────────────────
// PerformanceSummary — privacy masking
// ─────────────────────────────────────────────────────────────────────────────

describe('PerformanceSummary — privacyMode=true', () => {
  it('renders ••% for CAGR values when privacyMode=true', async () => {
    // Set privacy mode to true
    mockUiState.privacyMode = true;

    const { default: PerformanceSummary } = await import(
      '@/components/dashboard/PerformanceSummary'
    );

    const { container } = render(
      React.createElement(PerformanceSummary, { data: realData })
    );

    // PerformanceSummary renders '••%' for all percentage KPIs in privacy mode
    const allText = container.textContent ?? '';
    expect(
      allText,
      'PerformanceSummary must contain •• markers when privacyMode=true'
    ).toContain('••%');
  });

  it('renders actual numeric values when privacyMode=false', async () => {
    mockUiState.privacyMode = false;

    const { default: PerformanceSummary } = await import(
      '@/components/dashboard/PerformanceSummary'
    );

    const { container } = render(
      React.createElement(PerformanceSummary, { data: realData })
    );

    const allText = container.textContent ?? '';
    // Without privacy mode, should show actual percentage values (digits + %)
    expect(allText).toMatch(/\d+[.,]\d+%/);
    // Must NOT show •• markers
    expect(allText).not.toContain('••%');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FireScenariosTable — privacy masking
// ─────────────────────────────────────────────────────────────────────────────

describe('FireScenariosTable — privacyMode=true', () => {
  it('masks P(Quality) with •• when privacyMode=true', async () => {
    mockUiState.privacyMode = true;
    mockStoreState.data = realData;

    const { FireScenariosTable } = await import(
      '@/components/fire/FireScenariosTable'
    );

    const { container } = render(React.createElement(FireScenariosTable));

    const allText = container.textContent ?? '';

    // If scenario_comparison data exists, the table renders
    if (realData?.scenario_comparison) {
      // P(Quality) row uses privacyMode ? '••%' : fmtPct(pQualityBase)
      // So with privacyMode=true and real data, •• should appear
      // (if p_quality is present in fire data)
      if ((realData as any)?.fire?.p_quality != null) {
        expect(allText).toContain('••%');
      }
    } else {
      // No scenario data — table shows fallback message
      expect(allText).toContain('Dados de cenário indisponíveis');
    }
  });

  it('shows numeric percentage values when privacyMode=false', async () => {
    mockUiState.privacyMode = false;
    mockStoreState.data = realData;

    const { FireScenariosTable } = await import(
      '@/components/fire/FireScenariosTable'
    );

    const { container } = render(React.createElement(FireScenariosTable));
    const allText = container.textContent ?? '';

    if (realData?.scenario_comparison) {
      // Should not contain masked values
      expect(allText).not.toContain('••%');
    }
  });
});
