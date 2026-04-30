import { test } from '@playwright/test';
import path from 'path';
import { expandAll } from './helpers';

const OUT_DIR = '/tmp/audit-screenshots';

const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:3002';

const TABS = [
  { name: 'now',         url: `${BASE}/wealth` },
  { name: 'portfolio',   url: `${BASE}/wealth/portfolio` },
  { name: 'performance', url: `${BASE}/wealth/performance` },
  { name: 'fire',        url: `${BASE}/wealth/fire` },
  { name: 'withdraw',    url: `${BASE}/wealth/withdraw` },
  { name: 'simulators',  url: `${BASE}/wealth/simulators` },
  { name: 'backtest',    url: `${BASE}/wealth/backtest` },
];

test.describe('Visual Audit — Full Dashboard', () => {
  test.setTimeout(120_000);

  for (const tab of TABS) {
    test(`screenshot: ${tab.name}`, async ({ page }) => {
      await page.goto(tab.url, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // charts render

      await expandAll(page);

      // Wait for charts (canvas) to paint
      await page.waitForTimeout(1000);

      const outPath = path.join(OUT_DIR, `${tab.name}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`✓ ${tab.name} → ${outPath}`);
    });
  }
});
