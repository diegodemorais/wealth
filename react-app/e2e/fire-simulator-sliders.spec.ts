/**
 * fire-simulator-sliders.spec.ts
 *
 * Regression test for bug reported by Diego 2026-05-01:
 *   "Ao clicar nos botões (principalmente Aspiracional), os sliders deixam de funcionar."
 *
 * Root cause: `isPresetMode = !custom || retornoMatchesPreset`. When user clicked
 * a preset whose retorno coincidentally matched another preset's retorno (e.g.
 * Aspiracional uses favRetorno = 5.85% = MKT_PRESETS.fav.retorno), dragging
 * aporte/custo sliders set custom=true but retornoMatchesPreset stayed true →
 * isPresetMode stayed true → result branched into precomputed by_profile MC
 * threshold, ignoring aporte/custo deltas. Sliders moved visually but FIRE year
 * never recalculated.
 *
 * Fix: isPresetMode = !custom (any slider movement exits preset mode).
 *
 * This test exercises the full flow against the running dev server.
 * Requires SEMANTIC_ONLY=1 (or default mode) — runs via :3002 (Next.js dev).
 */

import { test, expect } from '@playwright/test';

// Auth bypass: set SHA-256 cookie before navigating.
// Hash from .env.local NEXT_PUBLIC_AUTH_HASH.
const AUTH_HASH = 'fbc47825b8529a37fc5e7d792e19f77f107441dd0bdb2352e98e41da228bddf0';

test.describe('FIRE Simulator — slider responsiveness after preset clicks', () => {
  test.beforeEach(async ({ context }) => {
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    await context.addCookies([{
      name: 'dashboard_auth',
      value: encodeURIComponent(`${AUTH_HASH}|${expiry}`),
      domain: 'localhost',
      path: '/',
    }]);
  });

  test('aporte slider recalculates FIRE year after Aspiracional click', async ({ page }) => {
    await page.goto('/wealth/assumptions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const calc = page.getByTestId('calc-aporte');
    await expect(calc).toBeVisible();

    const fireYear = page.getByTestId('sim-fire-year');
    const aporteSlider = calc.locator('input[type="range"]').nth(0);

    // Click Aspiracional preset
    await calc.getByRole('button', { name: /Aspiracional/ }).click();
    await page.waitForTimeout(300);
    const yearAfterAspir = await fireYear.textContent();

    // Drag aporte slider to a high value — FIRE year should change
    await aporteSlider.fill('80000');
    await page.waitForTimeout(300);
    const yearAfterHighAporte = await fireYear.textContent();
    expect(yearAfterHighAporte).not.toBe(yearAfterAspir);

    // Drag to a low value — should change again
    await aporteSlider.fill('10000');
    await page.waitForTimeout(300);
    const yearAfterLowAporte = await fireYear.textContent();
    expect(yearAfterLowAporte).not.toBe(yearAfterHighAporte);

    // High aporte → earlier FIRE year than low aporte (assert direction)
    expect(parseInt(yearAfterHighAporte!, 10)).toBeLessThan(parseInt(yearAfterLowAporte!, 10));
  });

  test('custo slider recalculates FIRE year after Aspiracional click', async ({ page }) => {
    await page.goto('/wealth/assumptions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const calc = page.getByTestId('calc-aporte');
    const fireYear = page.getByTestId('sim-fire-year');
    const custoSlider = calc.locator('input[type="range"]').nth(2);

    await calc.getByRole('button', { name: /Aspiracional/ }).click();
    await page.waitForTimeout(300);

    // Pivot: drag custo to LOW first (180k) then HIGH (500k) — must produce
    // different years (slider must recalculate). Use extreme values to force
    // distinct FIRE years independent of preset baseline coincidences.
    await custoSlider.fill('180000');
    await page.waitForTimeout(300);
    const lowCostYear = await fireYear.textContent();

    await custoSlider.fill('500000');
    await page.waitForTimeout(300);
    const highCostYear = await fireYear.textContent();
    expect(highCostYear, 'custo slider should recalculate after Aspiracional').not.toBe(lowCostYear);
    expect(parseInt(highCostYear!, 10)).toBeGreaterThan(parseInt(lowCostYear!, 10));
  });

  test('retorno slider recalculates FIRE year after Aspiracional click', async ({ page }) => {
    await page.goto('/wealth/assumptions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const calc = page.getByTestId('calc-aporte');
    const fireYear = page.getByTestId('sim-fire-year');
    const retornoSlider = calc.locator('input[type="range"]').nth(1);

    await calc.getByRole('button', { name: /Aspiracional/ }).click();
    await page.waitForTimeout(300);
    const baseline = await fireYear.textContent();

    await retornoSlider.fill('2');
    await page.waitForTimeout(300);
    const lowReturnYear = await fireYear.textContent();
    expect(lowReturnYear).not.toBe(baseline);

    await retornoSlider.fill('8');
    await page.waitForTimeout(300);
    const highReturnYear = await fireYear.textContent();
    expect(highReturnYear).not.toBe(lowReturnYear);
    expect(parseInt(highReturnYear!, 10)).toBeLessThan(parseInt(lowReturnYear!, 10));
  });

  test('all 4 family-profile presets keep sliders responsive', async ({ page }) => {
    await page.goto('/wealth/assumptions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const calc = page.getByTestId('calc-aporte');
    const fireYear = page.getByTestId('sim-fire-year');
    const aporteSlider = calc.locator('input[type="range"]').nth(0);

    const presets = [
      /^Solteiro$/,
      /^Casamento$/,
      /^Filho$/,
      /Aspiracional/,
    ];

    for (const preset of presets) {
      await calc.getByRole('button', { name: preset }).click();
      await page.waitForTimeout(300);
      const before = await fireYear.textContent();

      await aporteSlider.fill('70000');
      await page.waitForTimeout(300);
      const afterHigh = await fireYear.textContent();
      expect(afterHigh, `aporte slider dead after clicking ${preset}`).not.toBe(before);

      await aporteSlider.fill('15000');
      await page.waitForTimeout(300);
      const afterLow = await fireYear.textContent();
      expect(afterLow, `aporte slider dead at low value after clicking ${preset}`).not.toBe(afterHigh);
    }
  });

  test('toggling Stress / Base / Fav / Aspiracional keeps sliders alive', async ({ page }) => {
    await page.goto('/wealth/assumptions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const calc = page.getByTestId('calc-aporte');
    const fireYear = page.getByTestId('sim-fire-year');
    const aporteSlider = calc.locator('input[type="range"]').nth(0);

    const markets = [/^Stress$/, /^Base$/, /^Favorável$/, /Aspiracional/];

    for (const m of markets) {
      await calc.getByRole('button', { name: m }).click();
      await page.waitForTimeout(300);
      const before = await fireYear.textContent();

      await aporteSlider.fill('60000');
      await page.waitForTimeout(300);
      const after = await fireYear.textContent();
      expect(after, `aporte slider dead after clicking market preset ${m}`).not.toBe(before);
    }
  });
});
