/**
 * scheduled-status.test.tsx — Tests for useScheduledStatus hook + ScheduledStatus component
 *
 * Issue: DEV-scheduled-status
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import type { ScheduledStatusData } from '@/hooks/useScheduledStatus';
import { useScheduledStatus } from '@/hooks/useScheduledStatus';
import { ScheduledStatus } from '@/components/dashboard/ScheduledStatus';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock zustand persist middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

const MOCK_UI_STATE = {
  privacyMode: false,
  togglePrivacy: vi.fn(),
  setPrivacy: vi.fn(),
  // Force the 'scheduled-status' section open so tests can query inner elements
  collapseState: { 'scheduled-status': false },
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
    selector ? selector(MOCK_UI_STATE) : MOCK_UI_STATE,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ALL_OK_DATA: ScheduledStatusData = {
  _meta: { generated: '2026-05-06T07:25:00', reporter_version: '1' },
  jobs: [
    {
      key: 'pipeline-daily',
      label: 'Pipeline diário',
      schedule: 'seg–sex 7h00',
      status: 'ok',
      last_run_iso: '2026-05-06T07:00:42',
      last_line: 'data.json gerado com sucesso',
      alert_count: 0,
    },
    {
      key: 'validate-data',
      label: 'Validação de dados',
      schedule: 'seg–sex 7h05',
      status: 'ok',
      last_run_iso: '2026-05-06T07:05:11',
      last_line: 'Validação OK',
      alert_count: 0,
    },
  ],
  summary: { total: 2, ok: 2, error: 0, stale: 0, no_log: 0 },
};

const WITH_ERROR_DATA: ScheduledStatusData = {
  _meta: { generated: '2026-05-06T07:25:00', reporter_version: '1' },
  jobs: [
    {
      key: 'pipeline-daily',
      label: 'Pipeline diário',
      schedule: 'seg–sex 7h00',
      status: 'error',
      last_run_iso: '2026-05-06T07:00:42',
      last_line: 'ERROR: connection refused',
      alert_count: 0,
    },
    {
      key: 'validate-data',
      label: 'Validação de dados',
      schedule: 'seg–sex 7h05',
      status: 'ok',
      last_run_iso: '2026-05-06T07:05:11',
      last_line: 'OK',
      alert_count: 2,
    },
  ],
  summary: { total: 2, ok: 1, error: 1, stale: 0, no_log: 0 },
};

const NO_LOG_DATA: ScheduledStatusData = {
  _meta: { generated: '2026-05-06T07:25:00', reporter_version: '1' },
  jobs: [
    {
      key: 'pipeline-daily',
      label: 'Pipeline diário',
      schedule: 'seg–sex 7h00',
      status: 'no_log',
      last_run_iso: null,
      last_line: '',
      alert_count: 0,
    },
  ],
  summary: { total: 1, ok: 0, error: 0, stale: 0, no_log: 1 },
};

// ─── Hook tests ───────────────────────────────────────────────────────────────

describe('useScheduledStatus', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns loading=true initially', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // never resolves

    let result: ReturnType<typeof useScheduledStatus> | null = null;
    function TestHook() {
      result = useScheduledStatus();
      return null;
    }
    render(<TestHook />);
    expect(result!.isLoading).toBe(true);
    expect(result!.data).toBeNull();
    expect(result!.fetchError).toBeNull();
  });

  it('returns data on successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ALL_OK_DATA,
    } as any);

    let result: ReturnType<typeof useScheduledStatus> | null = null;
    function TestHook() {
      result = useScheduledStatus();
      return null;
    }
    render(<TestHook />);

    await waitFor(() => expect(result!.isLoading).toBe(false));
    expect(result!.data).not.toBeNull();
    expect(result!.data!.summary.total).toBe(2);
    expect(result!.data!.summary.ok).toBe(2);
    expect(result!.fetchError).toBeNull();
  });

  it('returns fetchError on HTTP failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as any);

    let result: ReturnType<typeof useScheduledStatus> | null = null;
    function TestHook() {
      result = useScheduledStatus();
      return null;
    }
    render(<TestHook />);

    await waitFor(() => expect(result!.isLoading).toBe(false));
    expect(result!.fetchError).toMatch(/HTTP 404/);
    expect(result!.data).toBeNull();
  });
});

// ─── Component tests ──────────────────────────────────────────────────────────

describe('ScheduledStatus component', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders panel with all-ok jobs', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ALL_OK_DATA,
    } as any);

    render(<ScheduledStatus />);

    await waitFor(() => {
      expect(screen.getByTestId('scheduled-status-panel')).toBeTruthy();
    });

    // Jobs should be rendered
    expect(screen.getByTestId('scheduled-job-pipeline-daily')).toBeTruthy();
    expect(screen.getByTestId('scheduled-job-validate-data')).toBeTruthy();

    // Status badges
    expect(screen.getByTestId('scheduled-job-pipeline-daily-status').textContent).toBe('✅');
    expect(screen.getByTestId('scheduled-job-validate-data-status').textContent).toBe('✅');
  });

  it('renders error badge for error status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => WITH_ERROR_DATA,
    } as any);

    render(<ScheduledStatus />);

    await waitFor(() => {
      expect(screen.getByTestId('scheduled-status-panel')).toBeTruthy();
    });

    expect(screen.getByTestId('scheduled-job-pipeline-daily-status').textContent).toBe('🔴');
    expect(screen.getByTestId('scheduled-job-validate-data-status').textContent).toBe('✅');
  });

  it('renders — badge for no_log status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => NO_LOG_DATA,
    } as any);

    render(<ScheduledStatus />);

    await waitFor(() => {
      expect(screen.getByTestId('scheduled-status-panel')).toBeTruthy();
    });

    expect(screen.getByTestId('scheduled-job-pipeline-daily-status').textContent).toBe('—');
  });

  it('shows alert badge when alert_count > 0', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => WITH_ERROR_DATA,
    } as any);

    render(<ScheduledStatus />);

    await waitFor(() => {
      expect(screen.getByTestId('scheduled-status-panel')).toBeTruthy();
    });

    // validate-data has 2 alerts
    expect(screen.getByText(/2 alertas/)).toBeTruthy();
  });

  it('shows loading state', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(<ScheduledStatus />);

    // Should show loading text immediately
    expect(screen.getByText(/Carregando status/)).toBeTruthy();
  });

  it('shows error state when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<ScheduledStatus />);

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/)).toBeNull();
    });

    expect(screen.getByText(/Não foi possível carregar/)).toBeTruthy();
  });
});
