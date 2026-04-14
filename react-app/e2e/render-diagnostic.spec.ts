import { test } from '@playwright/test';

test('Check data rendering and React state', async ({ page }) => {
  const consoleLogs: string[] = [];

  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto('https://diegodemorais.github.io/wealth/dash/', {
    waitUntil: 'networkidle',
  });

  // Wait for data to load
  await page.waitForTimeout(5000);

  console.log('\n=== Checking for "Loading" text ===');
  const loadingVisible = await page.locator('text=Loading').isVisible().catch(() => false);
  console.log(`Loading message visible: ${loadingVisible}`);

  console.log('\n=== Checking for actual data display ===');
  const kmounts = await page.locator('[class*="kpi"], [class*="metric"], [data-test*="kpi"]').count();
  console.log(`KPI/Metric elements found: ${kmounts}`);

  console.log('\n=== Checking for chart containers ===');
  const charts = await page.locator('canvas, [role="img"][aria-label*="chart"]').count();
  console.log(`Chart elements found: ${charts}`);

  console.log('\n=== Checking inner HTML for data ===');
  const bodyHTML = await page.evaluate(() => {
    const body = document.body.innerText;
    // Look for actual numbers that would be from data.json
    const hasNetworth = body.includes('R$') || body.includes('BRL') || body.match(/[\d,.]+\s*%/);
    const hasMetrics = body.match(/\d+\.\d{1,2}%/) || body.match(/R\$[\d,.]+/);
    return { hasNetworth, hasMetrics, length: body.length };
  });
  console.log(`Data indicators: ${JSON.stringify(bodyHTML)}`);

  console.log('\n=== Network activity ===');
  consoleLogs
    .filter(l => l.includes('data.json') || l.includes('fetch') || l.includes('error'))
    .forEach(l => console.log(l));

  console.log('\n=== Full body text (first 1500 chars) ===');
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log(bodyText.substring(0, 1500));
});
