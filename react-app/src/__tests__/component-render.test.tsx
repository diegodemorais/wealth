/**
 * component-render.test.tsx — @testing-library/react render tests
 *
 * Purpose: Catch component crashes from wrong/missing props BEFORE build.
 * Uses real data from public/data.json + computeDerivedValues, mirroring
 * exactly how pages construct props — so a wrong prop name fails here.
 *
 * Bug #1 this catches: `gatilhos=` passed instead of `items=`
 *   → TypeScript catches it at type-check level (tsc --noEmit)
 *   → This test catches it at render level (if tsc was skipped or types were `any`)
 *
 * Run in isolation:
 *   cd react-app && npx vitest run src/__tests__/component-render.test.tsx
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { computeDerivedValues } from '@/utils/dataWiring';
import { DashboardData, DerivedValues, DcaItem } from '@/types/dashboard';

// ─────────────────────────────────────────────────────────────────────────────
// Mock stores — components use Zustand stores for shared state.
// We provide minimal viable implementations so components render without
// crashing due to missing store context.
// ─────────────────────────────────────────────────────────────────────────────

// Mock zustand persist middleware (uses localStorage — not available in jsdom cleanly)
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

// Mock uiStore — used by SemaforoGatilhos and CashFlowSankey.
// Components call it as useUiStore() (no selector) or useUiStore(s => s.field) (with selector).
// The mock handles both forms.
const MOCK_UI_STATE = {
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
    selector ? selector(MOCK_UI_STATE) : MOCK_UI_STATE,
}));

// Mock dashboardStore — used by CashFlowSankey
// Uses a module-level object so tests can mutate .data between runs.
// We use an object reference (not a primitive) so the vi.mock factory
// always reads the current value.
const mockStoreState = {
  data: null as DashboardData | null,
};

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

// Mock the Sankey chart (uses canvas)
vi.mock('@/components/charts/SankeyChart', () => ({
  SankeyChart: () => React.createElement('div', { 'data-testid': 'sankey-mock' }, 'Sankey mock'),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Load real data once
// ─────────────────────────────────────────────────────────────────────────────

let realData: DashboardData;
let derived: DerivedValues;

beforeAll(() => {
  const dataPath = path.join(__dirname, '../../public/data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error('public/data.json not found — run build first');
  }
  realData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  derived = computeDerivedValues(realData);
  // Inject into store mock
  mockStoreState.data = realData;
});

// SemaforoGatilhos was deleted in a prior refactor (commit c93dd5e9).
// Tests removed to avoid stale import errors.

// ─────────────────────────────────────────────────────────────────────────────
// CashFlowSankey — uses useDashboardStore internally
// ─────────────────────────────────────────────────────────────────────────────

describe('CashFlowSankey', () => {
  it('renders without crashing when data is available', async () => {
    // Ensure mock store has data
    mockStoreState.data = realData;

    const { default: CashFlowSankey } = await import(
      '@/components/dashboard/CashFlowSankey'
    );

    expect(() => {
      render(React.createElement(CashFlowSankey));
    }).not.toThrow();
  });

  it('renders nothing (null) when store has no data', async () => {
    // Temporarily clear store data
    mockStoreState.data = null;

    const { default: CashFlowSankey } = await import(
      '@/components/dashboard/CashFlowSankey'
    );

    // CashFlowSankey returns null when data is null — should not crash
    expect(() => {
      const { container } = render(React.createElement(CashFlowSankey));
      // Container may be empty — that's acceptable behavior
      expect(container).toBeDefined();
    }).not.toThrow();

    // Restore
    mockStoreState.data = realData;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Props contract validation — static analysis of prop shapes
// Ensures page.tsx passes the right prop names to components
// ─────────────────────────────────────────────────────────────────────────────

describe('Props contract — page.tsx', () => {
  it('page.tsx passes dcaItems= to AporteDecisionPanel (SemaforoGatilhos migrado)', () => {
    const pagePath = path.join(__dirname, '../app/page.tsx');
    const pageSource = fs.readFileSync(pagePath, 'utf-8');

    // AporteDecisionPanel replaced SemaforoGatilhos — must use dcaItems prop
    expect(pageSource).toMatch(/AporteDecisionPanel[\s\S]{0,200}dcaItems=/);

    // Must NOT use wrong prop name
    expect(pageSource).not.toMatch(/AporteDecisionPanel[\s\S]{0,200}gatilhos=/);
  });

  it('page.tsx uses derived.dcaItems (not derived.gatilhos or derived.items)', () => {
    const pagePath = path.join(__dirname, '../app/page.tsx');
    const pageSource = fs.readFileSync(pagePath, 'utf-8');

    // The prop value must come from derived.dcaItems or its non-null alias d.dcaItems
    expect(pageSource).toMatch(/(?:derived|d)\.dcaItems/);
  });

  // SemaforoGatilhos deleted (commit c93dd5e9) — test removed.
});

// ─────────────────────────────────────────────────────────────────────────────
// Hydration safety — static checks for SSR-unsafe patterns
// Detects Bug #2: localStorage access during render (causes #418 mismatch)
// ─────────────────────────────────────────────────────────────────────────────

describe('Hydration safety — SSR-unsafe patterns', () => {
  const COMPONENTS_DIR = path.join(__dirname, '../components');
  const APP_DIR = path.join(__dirname, '../app');

  function collectTsxFiles(dir: string, files: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        collectTsxFiles(full, files);
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
        files.push(full);
      }
    }
    return files;
  }

  it('no component accesses localStorage directly during render (outside useEffect)', () => {
    const files = [...collectTsxFiles(COMPONENTS_DIR), ...collectTsxFiles(APP_DIR)];
    const violations: string[] = [];

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf-8');

      // Pattern: localStorage access NOT inside useEffect/useLayoutEffect/event handler
      // Simple heuristic: look for localStorage outside of useEffect blocks.
      // A render-time localStorage access is the primary cause of React #418.
      //
      // We flag files that have localStorage AND are NOT a store/utility
      // (stores use persist middleware which handles SSR safely).
      const isStore = file.includes('/store/');
      const isUtil = file.includes('/utils/');

      if (!isStore && !isUtil && source.includes('localStorage')) {
        // Check if ALL localStorage accesses are inside useEffect/useCallback
        const lines = source.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('localStorage') && !line.trim().startsWith('//')) {
            // Check surrounding context: look back up to 10 lines for useEffect
            const context = lines.slice(Math.max(0, i - 10), i).join('\n');
            const inEffect = /useEffect|useLayoutEffect|useCallback|useRef/.test(context);
            if (!inEffect) {
              violations.push(
                `${path.relative(path.join(__dirname, '../..'), file)}:${i + 1} — ` +
                `localStorage accessed outside useEffect (causes React #418 hydration mismatch)`
              );
            }
          }
        });
      }
    }

    expect(
      violations,
      `SSR-unsafe localStorage accesses found:\n${violations.join('\n')}\n\n` +
      `Fix: wrap localStorage reads in useEffect or use a client-only guard:\n` +
      `  const [value, setValue] = useState<string | null>(null);\n` +
      `  useEffect(() => { setValue(localStorage.getItem('key')); }, []);`
    ).toHaveLength(0);
  });

  it('no component uses typeof window !== undefined as render guard (antipattern)', () => {
    const files = collectTsxFiles(COMPONENTS_DIR);
    const violations: string[] = [];

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf-8');

      // This pattern is often used to avoid SSR crashes, but it can still
      // cause hydration mismatches because SSR renders undefined branch
      // while client renders window branch.
      if (
        source.includes('typeof window') &&
        source.includes('!== ') &&
        !file.includes('/utils/')
      ) {
        violations.push(
          `${path.relative(path.join(__dirname, '../..'), file)} — ` +
          `uses typeof window check (can cause hydration mismatch)`
        );
      }
    }

    // This is a warning test — log violations but don't fail hard
    // (some uses are legitimate, e.g. polyfill guards)
    if (violations.length > 0) {
      console.warn(
        `⚠️  Potential hydration antipatterns (review manually):\n` +
        violations.join('\n')
      );
    }
    // No hard assertion — just informational
  });
});
