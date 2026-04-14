import { test, expect } from '@playwright/test';

test.describe('Diagnostic Tests', () => {
  test('Check for console errors and network failures', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', response => {
      if (!response.ok() && response.status() !== 304) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('https://diegodemorais.github.io/wealth/dash/');
    await page.waitForTimeout(3000);

    console.log('\n=== CONSOLE ERRORS ===');
    consoleErrors.forEach(err => console.log(err));

    console.log('\n=== NETWORK ERRORS ===');
    networkErrors.forEach(err => console.log(err));

    console.log('\n=== PAGE TITLE ===');
    console.log(await page.title());

    console.log('\n=== DATA.JSON CONTENT ===');
    try {
      const dataResponse = await page.evaluate(() => fetch('/wealth/dash/data.json').then(r => r.json()));
      console.log(JSON.stringify(dataResponse, null, 2).substring(0, 500));
    } catch (e) {
      console.log('ERROR loading data.json:', e);
    }

    console.log('\n=== CHECKING FOR DATA IN DOM ===');
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(bodyText);

    console.log('\n=== CHECKING NAVIGATION BUTTONS ===');
    const buttons = await page.locator('button').count();
    console.log(`Found ${buttons} buttons`);
    const links = await page.locator('a').count();
    console.log(`Found ${links} links`);
  });

  test('Check data loading mechanism', async ({ page }) => {
    page.on('response', response => {
      if (response.url().includes('data.json') || response.url().includes('api')) {
        console.log(`[${response.status()}] ${response.url()}`);
      }
    });

    await page.goto('https://diegodemorais.github.io/wealth/dash/');
    await page.waitForTimeout(5000);

    const hasLoadingMessage = await page.locator('text=/loading/i').count();
    console.log(`Elements with "loading": ${hasLoadingMessage}`);

    const dataDiv = await page.locator('[id*="data"], [class*="data"]').count();
    console.log(`Data containers found: ${dataDiv}`);
  });
});
