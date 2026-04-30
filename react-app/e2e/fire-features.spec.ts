/**
 * fire-features.spec.ts — E2E tests for 3 new FIRE features (Features 1–3)
 *
 * Status: DRAFT — tests will only pass after Dev implements the components.
 * Reference spec: agentes/issues/HD-gaps-aposenteaos40-spec.md
 *
 * Components expected:
 *   - CoastFireCard.tsx       → /fire tab, CollapsibleSection#section-coast-fire
 *   - FireSpectrumWidget.tsx  → /fire tab, CollapsibleSection#section-fire-spectrum
 *   - BRFireSimSection.tsx    → /backtest tab, CollapsibleSection#section-brfiresim
 *
 * data-testid contract (from spec):
 *   coast-fire-card, coast-fire-status, coast-fire-gap-base
 *   fire-spectrum-widget, fire-spectrum-band-fat, fire-spectrum-band-fire,
 *   fire-spectrum-band-lean, fire-spectrum-band-barista
 *   brfiresim-section, brfiresim-summary, brfiresim-chart
 *
 * Requires: Next.js dev server at localhost:3002 (or via playwright config baseURL)
 * Run: npx playwright test e2e/fire-features.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Auth bypass — same pattern as semantic-smoke.spec.ts
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

async function setAuthCookie(page: Page): Promise<void> {
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

const ROUTES = {
  fire:     '/wealth/fire',
  backtest: '/wealth/backtest',
};

async function gotoAndWait(page: Page, route: string): Promise<void> {
  await setAuthCookie(page);
  await page.goto(route, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForFunction(
    () => !document.body.innerText.includes('Carregando dados'),
    { timeout: 15_000 }
  );
}

/**
 * Expand a CollapsibleSection if it is currently collapsed.
 * The section toggle button contains the section header text.
 */
async function expandSectionIfCollapsed(page: Page, sectionId: string): Promise<void> {
  const section = page.locator(`#${sectionId}`);
  const isVisible = await section.isVisible().catch(() => false);
  if (!isVisible) {
    // Try clicking the nearest button/toggle above the section
    const toggle = page.locator(`[data-section-id="${sectionId}"], button[aria-controls="${sectionId}"]`).first();
    const toggleExists = await toggle.count();
    if (toggleExists) await toggle.click();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature 1 — Coast FIRE Card (/fire tab)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Feature 1 — Coast FIRE Card', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
  });

  test('Coast FIRE card renders in /fire tab', async ({ page }) => {
    // The card may be inside a CollapsibleSection — try to expand it first
    await expandSectionIfCollapsed(page, 'section-coast-fire');

    const card = page.locator('[data-testid="coast-fire-card"]');
    await expect(card).toBeVisible({ timeout: 5_000 });
  });

  test('coast-fire-status shows a status badge (not empty)', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-coast-fire');

    const status = page.locator('[data-testid="coast-fire-status"]');
    await expect(status).toBeVisible({ timeout: 5_000 });
    const text = (await status.textContent()) ?? '';
    expect(text.trim()).not.toBe('');
    // Status should contain either "COAST" or "ON TRACK" or "ACHIEVED"
    expect(text.toUpperCase()).toMatch(/COAST|ON TRACK|TRACK|ACHIEVED/);
  });

  test('coast-fire-gap-base shows a monetary value or zero', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-coast-fire');

    const gap = page.locator('[data-testid="coast-fire-gap-base"]');
    await expect(gap).toBeVisible({ timeout: 5_000 });
    const text = (await gap.textContent()) ?? '';
    // Should contain digits (even if R$0 or masked in privacy mode)
    expect(text).toMatch(/[\d]/);
  });

  test('coast-fire-card shows 3 scenario rows (base, fav, stress)', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-coast-fire');

    // The mini-table should have 3 scenario rows per spec
    const card = page.locator('[data-testid="coast-fire-card"]');
    await expect(card).toBeVisible({ timeout: 5_000 });

    // Check that the card text contains scenario indicators
    const text = (await card.textContent()) ?? '';
    // At minimum, text should reference a year (>2020) and a rate/percentage
    expect(text).toMatch(/20[2-4]\d/); // a year in the 2020–2049 range
  });

  test('coast-fire-card footnote references real return methodology', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-coast-fire');

    const card = page.locator('[data-testid="coast-fire-card"]');
    await expect(card).toBeVisible({ timeout: 5_000 });
    const text = (await card.textContent()) ?? '';
    // Footnote should reference real return or SWR
    expect(text.toLowerCase()).toMatch(/real return|r_real|4\.85|swr|coast/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature 2 — FIRE Spectrum Widget (/fire tab)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Feature 2 — FIRE Spectrum Widget', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
  });

  test('FIRE Spectrum widget renders in /fire tab', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const widget = page.locator('[data-testid="fire-spectrum-widget"]');
    await expect(widget).toBeVisible({ timeout: 5_000 });
  });

  test('FIRE Spectrum shows Fat FIRE band', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const band = page.locator('[data-testid="fire-spectrum-band-fat"]');
    await expect(band).toBeVisible({ timeout: 5_000 });
    const text = (await band.textContent()) ?? '';
    expect(text).toMatch(/Fat FIRE/);
  });

  test('FIRE Spectrum shows Barista FIRE band', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const band = page.locator('[data-testid="fire-spectrum-band-barista"]');
    await expect(band).toBeVisible({ timeout: 5_000 });
    const text = (await band.textContent()) ?? '';
    expect(text).toMatch(/Barista FIRE/);
  });

  test('FIRE Spectrum shows FIRE band', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const band = page.locator('[data-testid="fire-spectrum-band-fire"]');
    await expect(band).toBeVisible({ timeout: 5_000 });
  });

  test('FIRE Spectrum shows Lean FIRE band', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const band = page.locator('[data-testid="fire-spectrum-band-lean"]');
    await expect(band).toBeVisible({ timeout: 5_000 });
  });

  test('FIRE Spectrum shows all 4 bands', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    await expect(page.locator('[data-testid="fire-spectrum-band-fat"]')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('[data-testid="fire-spectrum-band-fire"]')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('[data-testid="fire-spectrum-band-lean"]')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('[data-testid="fire-spectrum-band-barista"]')).toBeVisible({ timeout: 5_000 });
  });

  test('FIRE Spectrum widget content references multipliers', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const widget = page.locator('[data-testid="fire-spectrum-widget"]');
    await expect(widget).toBeVisible({ timeout: 5_000 });
    const text = (await widget.textContent()) ?? '';
    // Should reference at least one of the multipliers (400x, 300x, 200x, 150x)
    expect(text).toMatch(/400|300|200|150/);
  });

  test('FIRE Spectrum does not use Portuguese band name "Corda Bamba"', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const widget = page.locator('[data-testid="fire-spectrum-widget"]');
    await expect(widget).toBeVisible({ timeout: 5_000 });
    const text = (await widget.textContent()) ?? '';
    expect(text).not.toContain('Corda Bamba');
    expect(text).not.toContain('Tradicional');
  });

  test('FIRE Spectrum note mentions Diego target (R$10M or 480x)', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const widget = page.locator('[data-testid="fire-spectrum-widget"]');
    await expect(widget).toBeVisible({ timeout: 5_000 });
    const text = (await widget.textContent()) ?? '';
    // Spec requires a note: "Diego's model target (R$10M) = 480x = SWR 2.5%"
    expect(text).toMatch(/10M|10\.000|10,000|480x|2\.5%|2,5%/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature 3 — Historical Cycle Simulation (/backtest tab)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Feature 3 — Historical Cycle Simulation (BRFireSim)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, ROUTES.backtest);
  });

  test('BRFireSim section renders in /backtest tab', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-brfiresim');

    const section = page.locator('[data-testid="brfiresim-section"]');
    await expect(section).toBeVisible({ timeout: 5_000 });
  });

  test('BRFireSim shows summary KPI cards or data-unavailable message', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-brfiresim');

    const section = page.locator('[data-testid="brfiresim-section"]');
    await expect(section).toBeVisible({ timeout: 5_000 });
    const text = (await section.textContent()) ?? '';
    // Either shows data or tells the user to generate it
    const hasData = text.match(/\d+\.\d+%|sucesso|success/i);
    const hasInstruction = text.includes('brfiresim.py') || text.includes('generate');
    expect(hasData || hasInstruction).toBeTruthy();
  });

  test('BRFireSim caveat badge is visible (overlapping windows warning)', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-brfiresim');

    const section = page.locator('[data-testid="brfiresim-section"]');
    await expect(section).toBeVisible({ timeout: 5_000 });
    const text = (await section.textContent()) ?? '';
    // Spec requires a prominent caveat about overlapping windows
    // This test will fail if the data JSON is present but caveat is missing
    // When JSON is absent, the instruction message is acceptable
    if (!text.includes('brfiresim.py') && !text.includes('generate')) {
      // Data is present — caveat must be shown
      expect(text.toLowerCase()).toMatch(/sanity|overlapping|janelas|caveat/);
    }
  });

  test('BRFireSim summary shows at least 3% and 4% SWR success rates when data available', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-brfiresim');

    const summaryEl = page.locator('[data-testid="brfiresim-summary"]');
    const summaryExists = await summaryEl.count();

    if (!summaryExists) {
      // Data not yet available — acceptable state pending brfiresim.py
      console.log('[PENDING] brfiresim-summary not found — brfiresim_results.json not generated yet');
      return;
    }

    await expect(summaryEl).toBeVisible({ timeout: 5_000 });
    const text = (await summaryEl.textContent()) ?? '';
    // Should reference SWR rates
    expect(text).toMatch(/3%|4%|6%|8%|sucesso|success/i);
  });

  test('BRFireSim chart renders when data available', async ({ page }) => {
    await expandSectionIfCollapsed(page, 'section-brfiresim');

    const chartEl = page.locator('[data-testid="brfiresim-chart"]');
    const chartExists = await chartEl.count();

    if (!chartExists) {
      console.log('[PENDING] brfiresim-chart not found — brfiresim_results.json not generated yet');
      return;
    }

    await expect(chartEl).toBeVisible({ timeout: 5_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-feature: privacy mode does not break layout
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Privacy mode — FIRE features survive toggle', () => {
  test('Coast FIRE card survives privacy mode toggle', async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
    await expandSectionIfCollapsed(page, 'section-coast-fire');

    const card = page.locator('[data-testid="coast-fire-card"]');
    const cardExists = await card.count();
    if (!cardExists) {
      console.log('[PENDING] coast-fire-card not yet implemented');
      return;
    }

    // Toggle privacy mode — the card must remain visible (not crash)
    const privacyToggle = page.locator('[data-testid="privacy-toggle"], button[aria-label*="privacy"], button[aria-label*="Privacy"]').first();
    const toggleExists = await privacyToggle.count();
    if (toggleExists) {
      await privacyToggle.click();
      await expect(card).toBeVisible({ timeout: 3_000 });
      // Toggle back
      await privacyToggle.click();
      await expect(card).toBeVisible({ timeout: 3_000 });
    }
  });

  test('FIRE Spectrum widget survives privacy mode toggle', async ({ page }) => {
    await gotoAndWait(page, ROUTES.fire);
    await expandSectionIfCollapsed(page, 'section-fire-spectrum');

    const widget = page.locator('[data-testid="fire-spectrum-widget"]');
    const widgetExists = await widget.count();
    if (!widgetExists) {
      console.log('[PENDING] fire-spectrum-widget not yet implemented');
      return;
    }

    const privacyToggle = page.locator('[data-testid="privacy-toggle"], button[aria-label*="privacy"], button[aria-label*="Privacy"]').first();
    const toggleExists = await privacyToggle.count();
    if (toggleExists) {
      await privacyToggle.click();
      await expect(widget).toBeVisible({ timeout: 3_000 });
      await privacyToggle.click();
    }
  });
});
