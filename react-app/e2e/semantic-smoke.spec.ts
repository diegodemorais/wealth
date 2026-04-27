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
