/**
 * Semantic Smoke — validates that critical fields render real values, not "—" or null.
 *
 * Complementa o local-render.spec.ts: aquele testa estrutura (não trava, não branco),
 * este testa semântica (o valor correto está sendo exibido?).
 *
 * Motivation: DEV-semantic-test-coverage — bugs visuais que passavam invisíveis:
 *   - FIRE: "Data FIRE: —" (by_profile null)
 *   - Performance: R$0 (retornoUsd null)
 *   - Footer: timestamp ausente (store nunca hidratada)
 *
 * Requires: Next.js dev server at localhost:3002 (basePath /wealth resolves correctly)
 * Run: SEMANTIC_ONLY=1 npx playwright test --project=semantic
 * Or via: ./scripts/quick_dashboard_test.sh --semantic
 *
 * NOTE: Range assertions (e.g. P(FIRE) > 50%) may need recalibration if portfolio
 * changes significantly. Review when patrimônio crosses major thresholds.
 *
 * Coverage: 67 blocks across 7 tabs (NOW, FIRE, Performance, Portfolio, Backtest, Withdraw, Simulators)
 * Priority: P1 = value not "—" and contains digits, P2 = visible and not empty, P3 = visible only
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Auth bypass: read hash from .env.local and set dashboard_auth cookie
// Without this, the app shows a login gate and the dashboard never renders.
// ─────────────────────────────────────────────────────────────────────────────

function readAuthHash(): string {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/NEXT_PUBLIC_AUTH_HASH=(.+)/);
    return match ? match[1].trim() : '';
  } catch { return ''; }
}

const AUTH_HASH = readAuthHash();

async function setAuthCookie(page: Page) {
  if (!AUTH_HASH) return;
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  await page.context().addCookies([{
    name: 'dashboard_auth',
    value: encodeURIComponent(`${AUTH_HASH}|${expiry}`),
    domain: 'localhost',
    path: '/',
    sameSite: 'Lax',
  }]);
}

// basePath /wealth → all routes are under /wealth/
const ROUTES = {
  now:         '/wealth',
  fire:        '/wealth/fire',
  performance: '/wealth/performance',
  portfolio:   '/wealth/portfolio',
  backtest:    '/wealth/backtest',
  withdraw:    '/wealth/withdraw',
  simulators:  '/wealth/simulators',
};

async function gotoAndWait(page: Page, route: string) {
  await setAuthCookie(page);
  await page.goto(route, { waitUntil: 'networkidle', timeout: 30_000 });
  // Wait for loading state to disappear (store loads data.json asynchronously)
  await page.waitForFunction(
    () => !document.body.innerText.includes('Carregando dados'),
    { timeout: 15_000 }
  );
}

async function waitAndGetText(page: Page, selector: string): Promise<string> {
  const el = page.locator(selector);
  await expect(el).toBeVisible({ timeout: 15_000 });
  return (await el.textContent()) ?? '';
}

// ─────────────────────────────────────────────────────────────────────────────
// NOW tab
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NOW — semantic values', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.now);
  });

  test('patrimônio-total is not "—" and contains digits', async ({ page }) => {
    const text = await waitAndGetText(page, '[data-testid="patrimonio-total"]');
    expect(text.trim(), 'patrimônio-total is blank').not.toBe('');
    expect(text.trim(), 'patrimônio-total shows placeholder "—"').not.toBe('—');
    expect(text, 'patrimônio-total must contain a number').toMatch(/[\d.,]/);
  });

  test('pfire-aspiracional is a valid percentage (50–100%)', async ({ page }) => {
    // MetricCard wraps label+value+sub — target the value via .font-black
    const text = await waitAndGetText(page, '[data-testid="pfire-aspiracional"] .font-black');
    const match = text.match(/([\d.]+)%/);
    expect(match, `pfire-aspiracional must show a percentage, got: "${text}"`).not.toBeNull();
    const val = parseFloat(match![1]);
    expect(val, 'P(FIRE) aspiracional too low').toBeGreaterThan(50);
    expect(val, 'P(FIRE) aspiracional > 100%').toBeLessThanOrEqual(100);
  });

  test('drift-maximo-kpi shows a pp value (not "—")', async ({ page }) => {
    const text = await waitAndGetText(page, '[data-testid="drift-maximo-kpi"]');
    expect(text.trim()).not.toBe('—');
    expect(text, 'drift-maximo-kpi must contain "pp"').toContain('pp');
  });

  // P2: visible and not empty
  test('kpi-grid-primario is visible and not empty', async ({ page }) => {
    const el = page.locator('[data-testid="kpi-grid-primario"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'kpi-grid-primario is empty').not.toBe('');
  });

  test('wellness-score block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="wellness-score"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('fire-countdown block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="fire-countdown"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('savings-rate is visible and not empty', async ({ page }) => {
    const el = page.locator('[data-testid="savings-rate"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'savings-rate is empty').not.toBe('');
  });

  test('semaforo-triggers is visible', async ({ page }) => {
    const el = page.locator('[data-testid="semaforo-triggers"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('macro-strip is visible', async ({ page }) => {
    const el = page.locator('[data-testid="macro-strip"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('kpi-grid-mercado is visible', async ({ page }) => {
    const el = page.locator('[data-testid="kpi-grid-mercado"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('stress-cenarios is visible', async ({ page }) => {
    const el = page.locator('[data-testid="stress-cenarios"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FIRE tab
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FIRE — semantic values', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
  });

  test('pfire-hero is a valid percentage (≥50%)', async ({ page }) => {
    const text = await waitAndGetText(page, '[data-testid="pfire-hero"]');
    expect(text.trim(), 'pfire-hero shows placeholder "—"').not.toBe('—');
    const match = text.match(/([\d.]+)%/);
    expect(match, `pfire-hero must show a percentage, got: "${text}"`).not.toBeNull();
    const val = parseFloat(match![1]);
    expect(val, 'P(FIRE) base < 50% — unexpected').toBeGreaterThanOrEqual(50);
    expect(val, 'P(FIRE) base > 100%').toBeLessThanOrEqual(100);
  });

  test('fire-year is a plausible retirement year (2028–2060)', async ({ page }) => {
    const text = await waitAndGetText(page, '[data-testid="fire-year"]');
    expect(text.trim(), 'fire-year shows placeholder "—" — by_profile may be null').not.toBe('—');
    const year = parseInt(text.trim());
    expect(year, `fire-year "${text}" is not a valid year`).not.toBeNaN();
    expect(year, 'fire-year too early — possibly wrong data').toBeGreaterThan(2025);
    expect(year, 'fire-year too far out — possibly wrong data').toBeLessThan(2065);
  });

  test('earliest-fire card shows a year (2026–2060)', async ({ page }) => {
    const el = page.locator('[data-testid="earliest-fire"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text, 'earliest-fire card must show a 4-digit year').toMatch(/20\d{2}/);
  });

  test('fire-matrix renders table content', async ({ page }) => {
    const el = page.locator('[data-testid="fire-matrix"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'fire-matrix is empty').not.toBe('');
    expect(text, 'fire-matrix must contain percentage values').toMatch(/\d+%/);
  });

  // P2: visible and not empty
  test('fire-trilha block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="fire-trilha"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('net-worth-projection block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="net-worth-projection"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('pfire-familia is visible and has grid content', async ({ page }) => {
    const el = page.locator('[data-testid="pfire-familia"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text, 'pfire-familia must contain percentage values').toMatch(/\d+/);
  });

  test('eventos-vida block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="eventos-vida"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('glide-path block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="glide-path"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // FR-pquality-recalibration 2026-04-29
  test('pquality-hero is a valid percentage (≥20%)', async ({ page }) => {
    const el = page.locator('[data-testid="pquality-hero"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'pquality-hero shows placeholder "—"').not.toBe('—');
    const match = text.match(/([\d.]+)%/);
    expect(match, `pquality-hero must show a percentage, got: "${text}"`).not.toBeNull();
    const val = parseFloat(match![1]);
    expect(val, 'P(quality) hero < 20% — unexpected').toBeGreaterThanOrEqual(20);
    expect(val, 'P(quality) hero > 100%').toBeLessThanOrEqual(100);
  });

  test('pquality-profile-atual shows a valid percentage', async ({ page }) => {
    const el = page.locator('[data-testid="pquality-profile-atual"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    const match = text.match(/([\d.]+)%/);
    expect(match, `pquality-profile-atual must show %, got: "${text}"`).not.toBeNull();
    const val = parseFloat(match![1]);
    expect(val).toBeGreaterThanOrEqual(20);
    expect(val).toBeLessThanOrEqual(100);
  });

  test('pquality-profile-casado shows a valid percentage', async ({ page }) => {
    const el = page.locator('[data-testid="pquality-profile-casado"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    const match = text.match(/([\d.]+)%/);
    expect(match, `pquality-profile-casado must show %, got: "${text}"`).not.toBeNull();
  });

  test('pquality-profile-filho shows a valid percentage', async ({ page }) => {
    const el = page.locator('[data-testid="pquality-profile-filho"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    const match = text.match(/([\d.]+)%/);
    expect(match, `pquality-profile-filho must show %, got: "${text}"`).not.toBeNull();
  });

  // FR-pquality-matrix 2026-04-29 — section defaultOpen=true, visible on load
  // NOTE: beforeEach already navigates to /wealth/fire — no extra page.goto needed
  test('pquality-matrix-table is visible', async ({ page }) => {
    const el = page.locator('[data-testid="pquality-matrix-table"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('pquality-matrix-B-atual-base is a valid percentage', async ({ page }) => {
    const el = page.locator('[data-testid="pquality-matrix-B-atual-base"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    const match = text.match(/([\d.]+)%/);
    expect(match, `Expected percentage, got: "${text}"`).not.toBeNull();
    const val = parseFloat(match![1]);
    expect(val).toBeGreaterThanOrEqual(20);
    expect(val).toBeLessThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Performance tab
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Performance — semantic values', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.performance);
  });

  test('retorno-usd is not "—" and not zero', async ({ page }) => {
    const el = page.locator('[data-testid="retorno-usd"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'retorno-usd shows placeholder "—"').not.toBe('—');
    expect(text, 'retorno-usd must contain a number').toMatch(/\d/);
    await expect(el, 'retorno-usd shows R$ 0 — retornoUsd may be null').not.toHaveText('R$ 0');
  });

  // P2: visible and not empty
  test('heatmap-retornos block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="heatmap-retornos"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('evolucao-carteira block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="evolucao-carteira"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('retorno-decomposicao block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="retorno-decomposicao"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('factor-rolling-avgs block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="factor-rolling-avgs"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('information-ratio block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="information-ratio"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('factor-loadings-quality block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="factor-loadings-quality"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('factor-loadings-chart block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="factor-loadings-chart"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('rolling-sharpe block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="rolling-sharpe"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('fee-custo-complexidade block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="fee-custo-complexidade"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio tab
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Portfolio — DARF panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.portfolio);
  });

  test('darf-total-realizado shows a dollar value with digits', async ({ page }) => {
    const el = page.locator('[data-testid="darf-total-realizado"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim()).not.toBe('—');
    expect(text, 'darf-total-realizado must contain digits').toMatch(/\d/);
  });

  test('darf-total-brl shows a non-zero BRL tax value', async ({ page }) => {
    const el = page.locator('[data-testid="darf-total-brl"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim()).not.toBe('—');
    expect(text.trim()).not.toBe('R$ 0');
    expect(text, 'darf-total-brl must contain digits').toMatch(/\d/);
  });

  // P2: visible and not empty
  test('stacked-alloc is visible and not empty', async ({ page }) => {
    const el = page.locator('[data-testid="stacked-alloc"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'stacked-alloc is empty').not.toBe('');
  });

  test('drift-semaforo-etf block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="drift-semaforo-etf"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('exposicao-geografica block is visible', async ({ page }) => {
    // HD-dashboard-gaps-tier1 Gap E: testid renamed from geo-donut to exposicao-geografica
    const el = page.locator('[data-testid="exposicao-geografica"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('custo-base-bucket block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="custo-base-bucket"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('ir-diferido block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="ir-diferido"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('rf-posicoes block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="rf-posicoes"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Backtest tab
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Backtest — semantic values', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.backtest);
  });

  // P1: value must contain digits and not be "—"
  test('cagr-patrimonial-twr shows values with digits', async ({ page }) => {
    const el = page.locator('[data-testid="cagr-patrimonial-twr"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text, 'cagr-patrimonial-twr must contain digits').toMatch(/\d/);
  });

  // P2: visible and not empty
  test('backtest-metricas block is visible and not empty', async ({ page }) => {
    const el = page.locator('[data-testid="backtest-metricas"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'backtest-metricas is empty').not.toBe('');
  });

  test('drawdown-historico block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="drawdown-historico"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('shadow-portfolios block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="shadow-portfolios"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('backtest-regime-longo block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="backtest-regime-longo"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Withdraw tab
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Withdraw — semantic values', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.withdraw);
  });

  // P2: visible and not empty
  test('swr-percentis block is visible and not empty', async ({ page }) => {
    const el = page.locator('[data-testid="swr-percentis"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'swr-percentis is empty').not.toBe('');
  });

  test('spending-breakdown block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="spending-breakdown"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('income-fases block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="income-fases"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('sankey-cashflow block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="sankey-cashflow"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // P3: conditional — only present if data has guardrails_retirada
  test('guardrails-retirada renders if data has guardrails', async ({ page }) => {
    const el = page.locator('[data-testid="guardrails-retirada"]');
    const count = await el.count();
    if (count > 0) {
      await expect(el).toBeVisible({ timeout: 15_000 });
    }
  });

  // P3: conditional — only present if data has bond_pool_readiness
  test('bond-pool-readiness renders if data has bond pool', async ({ page }) => {
    const el = page.locator('[data-testid="bond-pool-readiness"]');
    const count = await el.count();
    if (count > 0) {
      await expect(el).toBeVisible({ timeout: 15_000 });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Simulators tab
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Simulators — semantic values', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.simulators);
  });

  // P1: value not "—" and contains digits
  test('sim-fire-year shows a plausible year (2025–2065)', async ({ page }) => {
    const el = page.locator('[data-testid="sim-fire-year"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'sim-fire-year shows "—"').not.toBe('—');
    const year = parseInt(text.trim());
    expect(year, `sim-fire-year "${text}" is not a valid year`).not.toBeNaN();
    expect(year, 'sim-fire-year too early').toBeGreaterThan(2024);
    expect(year, 'sim-fire-year too far').toBeLessThan(2066);
  });

  test('sim-pfire shows a valid percentage', async ({ page }) => {
    const el = page.locator('[data-testid="sim-pfire"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text, 'sim-pfire must contain a percentage').toMatch(/\d+/);
  });

  test('sim-patrimonio shows a value (not "—")', async ({ page }) => {
    const el = page.locator('[data-testid="sim-patrimonio"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'sim-patrimonio shows placeholder "—"').not.toBe('—');
    expect(text, 'sim-patrimonio must contain digits').toMatch(/\d/);
  });

  // P2: visible and not empty
  test('calc-aporte block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="calc-aporte"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  test('stress-test-mc block is visible', async ({ page }) => {
    const el = page.locator('[data-testid="stress-test-mc"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // FR-pquality-recalibration 2026-04-29
  test('sim-pquality shows a valid percentage (≥20%)', async ({ page }) => {
    const el = page.locator('[data-testid="sim-pquality"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    const match = text.match(/([\d.]+)%/);
    expect(match, `sim-pquality must show %, got: "${text}"`).not.toBeNull();
    const val = parseFloat(match![1]);
    expect(val, 'sim-pquality < 20%').toBeGreaterThanOrEqual(20);
    expect(val, 'sim-pquality > 100%').toBeLessThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Risk Dashboard — R1-R6 (HD-risco-portfolio)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Risk Dashboard — R1+R2 (NOW tab)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.now);
  });

  // R1: Risk Score Gauge — P3 visible only (gauge = canvas, no assertable text)
  test('risk-score-gauge is visible', async ({ page }) => {
    const el = page.locator('[data-testid="risk-score-gauge"]');
    await expect(el, 'risk-score-gauge not visible').toBeVisible({ timeout: 15_000 });
  });

  // R2: Risk Semáforos — P2 visible and not empty
  test('risk-semaforos is visible and not empty', async ({ page }) => {
    const el = page.locator('[data-testid="risk-semaforos"]');
    await expect(el, 'risk-semaforos not visible').toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim(), 'risk-semaforos is empty').not.toBe('');
  });
});

test.describe('Risk Dashboard — R3+R4 (Portfolio tab)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.portfolio);
  });

  // R3: Risk Contribution Chart — inside collapsed section, open first
  test('risk-contribution-chart element exists in DOM', async ({ page }) => {
    await page.click('[data-test="section-header-section-risk-contribution"]');
    const el = page.locator('[data-testid="risk-contribution-chart"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // R4: Duration Scenarios Table — inside collapsed section, open first
  test('duration-scenarios-table element exists in DOM', async ({ page }) => {
    await page.click('[data-test="section-header-section-duration-scenarios"]');
    const el = page.locator('[data-testid="duration-scenarios-table"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });
});

test.describe('Risk Dashboard — R5 (Performance tab)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.performance);
  });

  // R5: Drawdown Monitor — P2 visible
  test('drawdown-monitor is visible', async ({ page }) => {
    const el = page.locator('[data-testid="drawdown-monitor"]');
    await expect(el, 'drawdown-monitor not visible').toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Risk Dashboard — R6 (FIRE tab)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
  });

  // R6: SoRR Indicator — inside collapsed section, open first
  test('sorr-indicator element exists in DOM', async ({ page }) => {
    await page.click('[data-test="section-header-section-sorr-indicator"]');
    const el = page.locator('[data-testid="sorr-indicator"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HD-dashboard-gaps-tier1 — novos componentes A–K
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tier1 gaps — NOW tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.now);
  });

  // Gap C: pfire-liquido in PatrimonioLiquidoIR (inside collapsed section, open first)
  test('pfire-liquido exists in DOM', async ({ page }) => {
    await page.click('[data-test="section-header-section-patrimonio-liquido-ir"]');
    const el = page.locator('[data-testid="pfire-liquido"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // Gap B: CDS semáforo in R2
  test('cds-brasil-semaforo exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="cds-brasil-semaforo"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // Gap A: Balanço Holístico section
  test('balanco-holistico exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="balanco-holistico"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // Gap K: IPS Summary
  test('ips-summary exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="ips-summary"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });
});

test.describe('Tier1 gaps — FIRE tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
  });

  // Gap G: FIRE Number Meta
  test('fire-number-meta is visible', async ({ page }) => {
    const el = page.locator('[data-testid="fire-number-meta"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // Gap F: Renda Floor Katia
  test('renda-floor-katia exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="renda-floor-katia"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });
});

test.describe('Tier1 gaps — Portfolio tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.portfolio);
  });

  // Gap D: Renda+ Gatilho widget
  test('renda-plus-gatilho is visible', async ({ page }) => {
    const el = page.locator('[data-testid="renda-plus-gatilho"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // Gap H: Factor Drought Counter
  test('factor-drought-counter is visible', async ({ page }) => {
    const el = page.locator('[data-testid="factor-drought-counter"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // Gap U: Factor Value Spread widget
  test('factor-value-spread widget is visible', async ({ page }) => {
    const el = page.locator('[data-testid="factor-value-spread"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // Gap E: Exposição Geográfica (renamed from geo-donut)
  test('exposicao-geografica is visible', async ({ page }) => {
    const el = page.locator('[data-testid="exposicao-geografica"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Tier1 gaps — Performance tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.performance);
  });

  // Gap J: Drawdown Context Banner — só pós-FIRE; em acumulação não aparece (correto)
  test('drawdown-context-banner not shown during accumulation phase', async ({ page }) => {
    // Diego age 39 < FIRE target 53 → accumulation phase → banner correctly absent
    const el = page.locator('[data-testid="drawdown-context-banner"]');
    await expect(el).not.toBeAttached({ timeout: 5_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tier2 gaps — Pipeline + React components
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tier2 gaps — Portfolio tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.portfolio);
  });

  // Gap S: Renda+ MtM P&L
  test('renda-plus-mtm-pnl exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="renda-plus-mtm-pnl"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // Gap Q: Break-Even IPCA+ vs Selic
  test('breakeven-year-ipca-selic exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="breakeven-year-ipca-selic"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // Gap P: Correlação em Stress
  test('correlation-matrix-stress exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="correlation-matrix-stress"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });
});

test.describe('Tier2 gaps — Performance tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.performance);
  });

  // Gap O: Vol Realizada vs MC
  test('vol-realizada-vs-mc is visible with a percentage', async ({ page }) => {
    const el = page.locator('[data-testid="vol-realizada-vs-mc"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    // Should contain a % value (not just "—")
    await expect(el).not.toContainText('—');
  });

  // Gap R: Decomposição Retorno Cambial
  test('retorno-cambial-decomposicao exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="retorno-cambial-decomposicao"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });
});

test.describe('Tier2 gaps — FIRE tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
  });

  // Gap M: Bond Pool Status
  test('bond-pool-status is visible', async ({ page }) => {
    const el = page.locator('[data-testid="bond-pool-status"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
  });

  // Gap L: Spending Ceiling
  test('spending-ceiling exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="spending-ceiling"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // Gap N: Sensibilidade P(FIRE)
  test('pfire-sensitivity-table exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="pfire-sensitivity-table"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  // ContributionReturnsCrossover: Crossover Point component
  test('contribuicao-retorno-crossover exists in DOM', async ({ page }) => {
    const el = page.locator('[data-testid="contribuicao-retorno-crossover"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
  });

  test('crossover-historico-ano shows a year value', async ({ page }) => {
    const el = page.locator('[data-testid="crossover-historico-ano"]');
    await expect(el).toBeAttached({ timeout: 15_000 });
    const text = await el.textContent();
    // should be a 4-digit year or '—'
    expect(text?.trim()).toMatch(/^\d{4}$|^—$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Footer — version and data timestamp (all critical tabs)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Footer — version and data timestamp visible', () => {
  const routes = [
    { path: ROUTES.now,         label: 'NOW' },
    { path: ROUTES.fire,        label: 'FIRE' },
    { path: ROUTES.performance, label: 'Performance' },
    { path: ROUTES.portfolio,   label: 'Portfolio' },
    { path: ROUTES.backtest,    label: 'Backtest' },
    { path: ROUTES.withdraw,    label: 'Withdraw' },
    { path: ROUTES.simulators,  label: 'Simulators' },
  ];

  for (const route of routes) {
    test(`${route.label} — footer version visible and not "—"`, async ({ page }) => {
      await gotoAndWait(page, route.path);

      const footer = page.locator('[data-testid="version-footer"]');
      await expect(footer, `${route.label}: version-footer not visible`).toBeVisible({ timeout: 15_000 });

      await expect(footer, `${route.label}: footer missing version number`).toContainText('v');
      await expect(footer, `${route.label}: footer shows "Dados —" — store not hydrated`).not.toContainText('Dados —');
    });
  }
});
