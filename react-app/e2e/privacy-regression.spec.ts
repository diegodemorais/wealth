/**
 * Privacy Mode Regression Tests — E2E
 *
 * Context: DEV-privacy-deep-fix (2026-05-01) abolished FACTOR transformation
 * and replaced it with `R$ ••••` / `$ ••••` puro. These tests verify that
 * privacy mode masks every monetary literal across all 7 tabs.
 *
 * Strategy: Inject privacyMode into localStorage (Zustand persist store)
 * then load each tab and scan body innerText for R$/USD digit patterns.
 *
 * Requires: Next.js dev server at localhost:3002 (basePath /wealth)
 * Run: npx playwright test --project=semantic e2e/privacy-regression.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Auth bypass
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

// All 7 tabs — basePath /wealth
const ROUTES: Record<string, string> = {
  now:         '/wealth',
  performance: '/wealth/performance',
  fire:        '/wealth/fire',
  withdraw:    '/wealth/withdraw',
  portfolio:   '/wealth/portfolio',
  backtest:    '/wealth/backtest',  // ANALYSIS
  assumptions: '/wealth/assumptions', // TOOLS
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Inject privacyMode into the Zustand persist store via localStorage, then navigate. */
async function gotoWithPrivacy(page: Page, route: string, privacyMode: boolean) {
  await setAuthCookie(page);

  await page.addInitScript((enabled: boolean) => {
    const key = 'dashboard-ui-store';
    const existing = localStorage.getItem(key);
    let state: any = { state: {}, version: 0 };
    try { if (existing) state = JSON.parse(existing); } catch {}
    state.state = { ...(state.state || {}), privacyMode: enabled };
    localStorage.setItem(key, JSON.stringify(state));
  }, privacyMode);

  await page.goto(route, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForFunction(
    () => !document.body.innerText.includes('Carregando dados'),
    { timeout: 15_000 }
  );
}

/** Pattern that matches a leaked R$ value (digit follows R$). */
const BRL_LEAK = /R\$\s*\d+([.,]\d+)?\s*[kKMm]?(\/\w+)?/;
/** Pattern that matches a leaked USD value. */
const USD_LEAK = /\$\s*\d+([.,]\d+)?\s*[kKMm]?(\/\w+)?/;

// ─────────────────────────────────────────────────────────────────────────────
// Universal regression — all 7 tabs in privacy ON
// ─────────────────────────────────────────────────────────────────────────────

for (const [tab, route] of Object.entries(ROUTES)) {
  test.describe(`Privacy ON — ${tab.toUpperCase()} tab`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoWithPrivacy(page, route, true);
    });

    test(`${tab}: body must NOT leak R$<digits> when privacyMode=true`, async ({ page }) => {
      const content = await page.locator('body').innerText();
      const m = content.match(BRL_LEAK);
      if (m) {
        // Find a 200-char window around the match for diagnostic
        const idx = content.indexOf(m[0]);
        const window = content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + 120));
        throw new Error(`R$ leak in ${tab}: "${m[0]}"\nContext: ...${window}...`);
      }
      expect(m).toBeNull();
    });

    test(`${tab}: body must NOT leak $<digits> when privacyMode=true`, async ({ page }) => {
      const content = await page.locator('body').innerText();
      // Skip USD literals that are already masked (•••• after $)
      // The regex requires digits immediately after $.
      const m = content.match(USD_LEAK);
      if (m) {
        const idx = content.indexOf(m[0]);
        const window = content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + 120));
        throw new Error(`$ leak in ${tab}: "${m[0]}"\nContext: ...${window}...`);
      }
      expect(m).toBeNull();
    });

    test(`${tab}: page renders without JS crash in privacy mode`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.waitForTimeout(500);
      expect(
        errors.filter(e => /TypeError|Cannot read|is not a function/.test(e)),
        `JS errors on ${tab}:\n${errors.join('\n')}`
      ).toHaveLength(0);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Targeted assertions kept from previous suite (data-testid based)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Privacy ON — targeted testids', () => {
  test('NOW: patrimonio-total renders with mask, not real digits', async ({ page }) => {
    await gotoWithPrivacy(page, ROUTES.now, true);
    const el = page.locator('[data-testid="patrimonio-total"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text.trim()).not.toBe('');
    expect(text).toMatch(/••••|••/);
    expect(text).not.toMatch(BRL_LEAK);
  });

  test('FIRE: pfire-hero is masked', async ({ page }) => {
    await gotoWithPrivacy(page, ROUTES.fire, true);
    const el = page.locator('[data-testid="pfire-hero"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text).not.toBe('');
    if (text.match(/\d+\.\d+%/) && !text.includes('••')) {
      throw new Error(`pfire-hero leaks P(FIRE) value: "${text}"`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Privacy OFF — sanity (real values restored)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Privacy OFF — values visible normally', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWithPrivacy(page, ROUTES.now, false);
  });

  test('patrimonio-total shows R$ + digits when privacy is off', async ({ page }) => {
    const el = page.locator('[data-testid="patrimonio-total"]');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text).toMatch(BRL_LEAK);
    expect(text).not.toContain('••••');
  });

  test('pfire-aspiracional shows real percentage when privacy is off', async ({ page }) => {
    const el = page.locator('[data-testid="pfire-aspiracional"] .font-black');
    await expect(el).toBeVisible({ timeout: 15_000 });
    const text = (await el.textContent()) ?? '';
    expect(text).toMatch(/\d+%/);
    expect(text).not.toContain('••');
  });
});
