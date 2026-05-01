/**
 * screenshot-tabs.mjs
 * Tira prints de todas as abas do dashboard com todos os collapseds abertos.
 * Autentica via cookie (SHA-256 hash da senha).
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3002';
const OUT  = '/tmp/ux-audit';
// Token = sha256("senha" + sal) = hash armazenado em .env.local
const AUTH_TOKEN = 'fbc47825b8529a37fc5e7d792e19f77f107441dd0bdb2352e98e41da228bddf0';
const EXPIRY = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias

const TABS = [
  { name: 'dashboard',    url: `${BASE}/wealth/` },
  { name: 'portfolio',    url: `${BASE}/wealth/portfolio` },
  { name: 'performance',  url: `${BASE}/wealth/performance` },
  { name: 'fire',         url: `${BASE}/wealth/fire` },
  { name: 'retirement',   url: `${BASE}/wealth/withdraw` },
  { name: 'backtest',     url: `${BASE}/wealth/backtest` },
  { name: 'simulators',   url: `${BASE}/wealth/simulators` },
  { name: 'checklist',    url: `${BASE}/wealth/assumptions` },
];

async function expandAll(page) {
  // First pass
  let expanded = 0;
  const toggles = await page.locator('[data-state="closed"] button, button[aria-expanded="false"]').all();
  for (const toggle of toggles) {
    try { await toggle.click({ timeout: 500 }); expanded++; } catch {}
  }
  if (expanded > 0) await page.waitForTimeout(800);

  // Second pass (nested)
  const toggles2 = await page.locator('[data-state="closed"] button, button[aria-expanded="false"]').all();
  for (const toggle of toggles2) {
    try { await toggle.click({ timeout: 500 }); } catch {}
  }
  await page.waitForTimeout(1000);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Inject auth cookie
  await context.addCookies([{
    name: 'dashboard_auth',
    value: encodeURIComponent(`${AUTH_TOKEN}|${EXPIRY}`),
    domain: 'localhost',
    path: '/',
    expires: EXPIRY / 1000,
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  }]);

  const page = await context.newPage();

  for (const tab of TABS) {
    console.log(`→ ${tab.name}`);

    await page.goto(tab.url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000); // charts render

    await expandAll(page);
    await page.waitForTimeout(1500); // after expand

    const outPath = path.join(OUT, `${tab.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`  ✓ saved → ${outPath}`);
  }

  await browser.close();
  console.log('\nDone! Screenshots em:', OUT);
}

main().catch(err => { console.error(err); process.exit(1); });
