#!/usr/bin/env node
/**
 * Page Validation with Playwright
 * Tests actual rendering and detects JavaScript errors
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashDir = path.join(__dirname, '../../dash');

const pages = [
  { path: 'index.html', name: 'NOW (/)' },
  { path: 'portfolio.html', name: 'Portfolio' },
  { path: 'performance.html', name: 'Performance' },
  { path: 'fire.html', name: 'FIRE' },
  { path: 'withdraw.html', name: 'Withdraw' },
  { path: 'simulators.html', name: 'Simulators' },
  { path: 'backtest.html', name: 'Backtest' },
];

console.log('\n🎭 Testing page rendering with Playwright...\n');

let browser;
let hasErrors = false;

try {
  browser = await chromium.launch();
  const context = await browser.newContext();

  for (const { path: pagePath, name } of pages) {
    const fullPath = path.join(dashDir, pagePath);
    const fileUrl = `file://${fullPath}`;

    console.log(`Testing ${name}...`);

    const page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Collect page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    try {
      // Navigate with timeout
      const response = await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 10000 });

      if (!response.ok) {
        console.error(`  ❌ Failed to load: ${response.status()}`);
        hasErrors = true;
      }

      // Wait for page to stabilize
      await page.waitForTimeout(1000);

      // Check for error indicators
      const errorText = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? main.innerText : '';
      });

      if (errorText.includes('This page couldn\'t load') || errorText.includes('could not load')) {
        console.error(`  ❌ Page shows error: ${errorText.substring(0, 100)}`);
        hasErrors = true;
      }

      // Check console errors
      if (consoleErrors.length > 0) {
        const relevantErrors = consoleErrors.filter(e =>
          !e.includes('Failed to load resource') &&
          !e.includes('DevTools') &&
          e.includes('Error')
        );
        if (relevantErrors.length > 0) {
          console.error(`  ❌ Console errors detected:`);
          relevantErrors.forEach(e => console.error(`     ${e.substring(0, 100)}`));
          hasErrors = true;
        }
      }

      // Check page errors
      if (pageErrors.length > 0) {
        console.error(`  ❌ Page errors:`);
        pageErrors.forEach(e => console.error(`     ${e.substring(0, 100)}`));
        hasErrors = true;
      }

      if (consoleErrors.length === 0 && pageErrors.length === 0 && response.ok) {
        console.log(`  ✅ ${name} renders successfully`);
      }

    } catch (error) {
      console.error(`  ❌ Test failed: ${error.message}`);
      hasErrors = true;
    }

    await page.close();
  }

  await context.close();
  await browser.close();

} catch (error) {
  console.error(`\n❌ Browser error: ${error.message}`);
  hasErrors = true;
  if (browser) {
    await browser.close();
  }
}

if (hasErrors) {
  console.log('\n❌ Page validation FAILED\n');
  process.exit(1);
}

console.log('\n✅ All pages render successfully\n');
process.exit(0);
