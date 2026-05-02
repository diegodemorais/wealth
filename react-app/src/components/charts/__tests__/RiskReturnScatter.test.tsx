/**
 * RiskReturnScatter.test.tsx — testes dos botões de período com sufixo "(N anos)".
 * Feature: DEV-period-buttons-anos (2026-05-01)
 *
 * Cobre:
 *  - Botões "Pós-COVID/Pós-Euro/Pós-GFC/Máximo" mostram "(N anos)" calculado dinamicamente
 *  - Botões "5 anos" / "3 anos" sem redundância (sem sufixo "(N anos)")
 *  - Anos calculados via yearsFrom — mockando Date para determinismo
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

  it('Pós-COVID button shows "(6 anos)"', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /Pós-COVID/i });
    expect(btn.textContent).toContain('Pós-COVID');
    expect(btn.textContent).toContain('(6 anos)');
  });

  it('Pós-Euro button shows "(13 anos)"', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /Pós-Euro/i });
    expect(btn.textContent).toContain('(13 anos)');
  });

  it('Pós-GFC button shows "(17 anos)"', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /Pós-GFC/i });
    expect(btn.textContent).toContain('(17 anos)');
  });

  it('Máximo button shows "(N anos)" suffix (dinâmico, dependente do startISO)', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /Máximo/i });
    // 2019-07 → 2026-05 ≈ 6.84 → 7
    expect(btn.textContent).toMatch(/Máximo \(\d+ anos\)/);
  });

  it('5 anos button has no redundant suffix', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /^5 anos$/i });
    expect(btn.textContent?.trim()).toBe('5 anos');
  });

  it('3 anos button has no redundant suffix', () => {
    render(<RiskReturnScatter data={MOCK_DATA as any} />);
    const btn = screen.getByRole('button', { name: /^3 anos$/i });
    expect(btn.textContent?.trim()).toBe('3 anos');
  });
});
