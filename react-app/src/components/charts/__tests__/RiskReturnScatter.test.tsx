/**
 * RiskReturnScatter.test.tsx — testes dos botões de período canônicos.
 * Fonte de verdade: @/lib/periods (LONG_PERIODS).
 * Feature: DEV-period-buttons-anos (2026-05-01)
 * Atualizado: DEV-canonical-periods (2026-05-05)
 *
 * Cobre:
 *  - Botões históricos longos mostram "Pós-COVID (6a)" formato canônico
 *  - Botões "5a" / "3a" sem sufixo adicional
 *  - Anos calculados via yearsFrom em @/lib/periods — mockando Date para determinismo
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RiskReturnScatter } from '../RiskReturnScatter';

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

// Mock ResizeObserver (jsdom doesn't provide it)
class _RO {
  observe() {}
  disconnect() {}
  unobserve() {}
}
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver ?? _RO;

const MOCK_BUCKET = {
  twr: 10, vol: 15, sharpe: 0.5,
  label: 'Equity Global', weight: 50, color_key: 'blue',
};

const MOCK_DATA = {
  since2020: { EQ: MOCK_BUCKET },
  since2013: { EQ: MOCK_BUCKET },
  since2009: { EQ: MOCK_BUCKET },
  since2003: { EQ: MOCK_BUCKET },
  all:       { EQ: MOCK_BUCKET },
  '5y':      { EQ: MOCK_BUCKET },
  '3y':      { EQ: MOCK_BUCKET },
};

describe('RiskReturnScatter — period button labels with anos', () => {
  // Pin "today" to 2026-05-01 so the tests are deterministic regardless of runner clock.
  const FIXED_NOW = new Date('2026-05-01T12:00:00Z');

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('Pós-COVID button shows "(6a)" canonical format', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /Pós-COVID/i });
    expect(btn.textContent).toContain('Pós-COVID');
    expect(btn.textContent).toContain('(6a)');
  });

  it('Pós-Euro button shows "(13a)" canonical format', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /Pós-Euro/i });
    expect(btn.textContent).toContain('(13a)');
  });

  it('Pós-GFC button shows "(17a)" canonical format', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /Pós-GFC/i });
    expect(btn.textContent).toContain('(17a)');
  });

  it('All (R7) button replaces old "Máximo" button', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    // "all" key → "All (R7)" label from LONG_PERIODS
    const btn = screen.getByRole('button', { name: /All \(R7\)/i });
    expect(btn.textContent?.trim()).toBe('All (R7)');
  });

  it('5a button uses canonical short label', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /^5a$/i });
    expect(btn.textContent?.trim()).toBe('5a');
  });

  it('3a button uses canonical short label', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /^3a$/i });
    expect(btn.textContent?.trim()).toBe('3a');
  });
});
