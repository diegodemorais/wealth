/**
 * Local Render Validation — Playwright spec for the `local` project.
 *
 * Purpose: Catch errors that only manifest in the compiled/static build
 * BEFORE they reach production (github.io). Specifically:
 *   - React hydration mismatch (#418) — SSR vs client localStorage divergence
 *   - Blank pages from component crashes
 *   - JS runtime errors thrown during render
 *
 * Requires: `npx serve ../dash -p 3001` running (handled by playwright.config.ts
 *           webServer entry when LOCAL_RENDER_ONLY=1).
 *
 * Run in isolation:
 *   cd react-app && LOCAL_RENDER_ONLY=1 npx playwright test --project=local
 */

import { test, expect, Page, ConsoleMessage } from '@playwright/test';

// All routes exported by the Next.js static build (dash/).
// Next.js static export generates flat .html files, so we navigate to those directly
// rather than relying on SPA routing. This ensures we're testing the actual compiled
// output for each page — not a fallback index.html.
const ROUTES = [
  { path: '/index.html', label: 'Dashboard (root)' },
  { path: '/portfolio.html', label: 'Portfolio' },
  { path: '/performance.html', label: 'Performance' },
  { path: '/fire.html', label: 'FIRE' },
  { path: '/withdraw.html', label: 'Withdraw' },
  { path: '/simulators.html', label: 'Simulators' },
  { path: '/backtest.html', label: 'Backtest' },
];

// React error message patterns that indicate critical failures
const CRITICAL_ERROR_PATTERNS = [
  // React hydration mismatch — Bug #2 that escaped to production
  /hydrat/i,
  /Minified React error #418/,
  /Error #418/,
  /There was an error while hydrating/i,
  // General React crash patterns
  /Minified React error/,
  /React error #\d+/,
  // Unhandled rejections from component data loading
  /Unhandled (Promise )?rejection/i,
  // TypeError from wrong props (e.g. undefined.map — Bug #1)
  /TypeError:/,
  /is not a function/,
  /Cannot read propert/i,
  /Cannot set propert/i,
];

/**
 * Collect console errors and page errors for a navigation.
 * Returns arrays so callers can assert with context.
 */
async function collectErrors(page: Page, path: string): Promise<{
  consoleErrors: string[];
  pageErrors: string[];
  criticalErrors: string[];
}> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err: Error) => {
    pageErrors.push(err.message);
  });

  await page.goto(path, { waitUntil: 'networkidle', timeout: 30_000 });

  // Gather all critical errors from both sources
  const allErrors = [...consoleErrors, ...pageErrors];
  const criticalErrors = allErrors.filter(msg =>
    CRITICAL_ERROR_PATTERNS.some(pattern => pattern.test(msg))
  );

  return { consoleErrors, pageErrors, criticalErrors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: Each route must not be blank
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Local render — pages not blank', () => {
  for (const route of ROUTES) {
    test(`${route.label} (${route.path}) — body has content`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'networkidle', timeout: 30_000 });

      const bodyText = await page.evaluate(() => document.body?.innerText ?? '');
      const bodyHtml = await page.evaluate(() => document.body?.innerHTML ?? '');

      // Minimum content threshold: 500 chars of rendered HTML
      // A blank/errored Next.js page typically outputs <50 chars
      expect(
        bodyHtml.length,
        `${route.label}: page appears blank (${bodyHtml.length} chars of body HTML). ` +
        `Possible crash or failed hydration.`
      ).toBeGreaterThan(500);

      // Should not render a Next.js error boundary message
      expect(
        bodyText,
        `${route.label}: found "Application error" in page — component crashed`
      ).not.toMatch(/Application error/i);

      expect(
        bodyText,
        `${route.label}: found "Something went wrong" — component crashed`
      ).not.toMatch(/Something went wrong/i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test: React hydration mismatch detection (#418)
// This is Bug #2: SSR renders one value, client hydrates with localStorage value
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Local render — no React hydration errors', () => {
  for (const route of ROUTES) {
    test(`${route.label} (${route.path}) — no hydration mismatch`, async ({ page }) => {
      const { criticalErrors, consoleErrors, pageErrors } = await collectErrors(page, route.path);

      // Specific check for React #418 (hydration mismatch)
      const hydrationErrors = [...consoleErrors, ...pageErrors].filter(msg =>
        /hydrat|#418/i.test(msg)
      );

      expect(
        hydrationErrors,
        `${route.label}: React hydration mismatch detected.\n` +
        `This usually means SSR renders different content than client (e.g. localStorage, Date.now(), Math.random()).\n` +
        `Errors:\n${hydrationErrors.join('\n')}`
      ).toHaveLength(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test: No critical JS errors (catches wrong props, TypeError from bad prop names)
// This is Bug #1: gatilhos= passed instead of items= → TypeError in component
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Local render — no critical JS errors', () => {
  for (const route of ROUTES) {
    test(`${route.label} (${route.path}) — no critical console/page errors`, async ({ page }) => {
      const { criticalErrors } = await collectErrors(page, route.path);

      expect(
        criticalErrors,
        `${route.label}: critical JS error(s) detected in rendered page.\n` +
        `Errors:\n${criticalErrors.join('\n')}\n\n` +
        `Common causes:\n` +
        `  - Wrong prop name passed to component (e.g. gatilhos= vs items=)\n` +
        `  - Component received undefined where array expected\n` +
        `  - Hydration mismatch from SSR/localStorage divergence`
      ).toHaveLength(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test: Dashboard root page has key structural elements
// Sanity check that the app actually rendered meaningful content
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Local render — structural sanity', () => {
  // NOTE: removido teste 'Dashboard root has navigation tabs' — o projeto `local`
  // serve dash/ em http://localhost:3001 sem basePath, mas o build Next.js usa
  // basePath /wealth (assets em /wealth/_next/...). Como playwright.config.ts
  // documenta: "JavaScript does NOT fully hydrate here". Sem hydration, AuthGuard
  // mantém output null (return null pré-mount) e <nav> nunca aparece. Cobertura
  // de nav está em e2e/semantic-smoke.spec.ts (que usa Next dev server com
  // basePath correto e auth bypass implícito).

  test('Dashboard root loads data (not stuck on loading state)', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle', timeout: 30_000 });

    // Loading spinner should be gone after networkidle
    const loadingEl = page.locator('text=Carregando dados');
    await expect(loadingEl).not.toBeVisible({ timeout: 5_000 }).catch(() => {
      // If it's still visible, that's a failure — but we want the assertion
      // message to be clear
    });

    const isLoading = await page.locator('text=Carregando dados').isVisible();
    expect(
      isLoading,
      'Dashboard is still showing loading state after networkidle — data fetch may have failed'
    ).toBe(false);
  });
});
