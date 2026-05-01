import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3002';
const OUT  = '/tmp/ux-audit';
const AUTH_TOKEN = 'fbc47825b8529a37fc5e7d792e19f77f107441dd0bdb2352e98e41da228bddf0';
const EXPIRY = Date.now() + 7 * 24 * 60 * 60 * 1000;

async function expandAll(page) {
  let expanded = 0;
  const toggles = await page.locator('[data-state="closed"] button, button[aria-expanded="false"]').all();
  for (const toggle of toggles) {
    try { await toggle.click({ timeout: 500 }); expanded++; } catch {}
  }
  if (expanded > 0) await page.waitForTimeout(800);
  const toggles2 = await page.locator('[data-state="closed"] button, button[aria-expanded="false"]').all();
  for (const toggle of toggles2) {
    try { await toggle.click({ timeout: 500 }); } catch {}
  }
  await page.waitForTimeout(1000);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([{
    name: 'dashboard_auth',
    value: encodeURIComponent(`${AUTH_TOKEN}|${EXPIRY}`),
    domain: 'localhost', path: '/', expires: EXPIRY / 1000,
    httpOnly: false, secure: false, sameSite: 'Lax',
  }]);
  const page = await context.newPage();

  // Navigate to FIRE with fresh context (no prior pages)
  console.log('→ fire');
  await page.goto(`${BASE}/wealth/fire`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  // Check for error, try reload
  const errorText = await page.locator('text=Rendered more hooks').count();
  if (errorText > 0) {
    console.log('  ! hook error detected, retrying...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }
  await expandAll(page);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, 'fire.png'), fullPage: true });
  console.log('  ✓ fire saved');

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
