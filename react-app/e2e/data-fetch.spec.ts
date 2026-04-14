import { test } from '@playwright/test';

test('Monitor data.json fetch', async ({ page }) => {
  const networkEvents: string[] = [];

  page.on('response', response => {
    if (response.url().includes('data.json') || response.request().resourceType() === 'fetch') {
      networkEvents.push(`${response.status()} ${response.url()}`);
      console.log(`[${response.status()}] ${response.url()}`);
    }
  });

  page.on('console', msg => {
    if (msg.text().includes('data') || msg.text().includes('Failed') || msg.type() === 'error') {
      console.log(`[${msg.type()}] ${msg.text()}`);
    }
  });

  console.log('Navigating...');
  await page.goto('https://diegodemorais.github.io/wealth/dash/', {
    waitUntil: 'networkidle',
  });

  await page.waitForTimeout(3000);

  console.log('\n=== Network events ===');
  networkEvents.forEach(e => console.log(e));

  console.log('\n=== Checking page state ===');
  const bodyText = await page.innerText('body');
  console.log('Has "Loading": ', bodyText.includes('Loading'));
  console.log('Has "Generated": ', bodyText.includes('Generated'));
  console.log('Has "Portfolio": ', bodyText.includes('Portfolio'));
  console.log('Has R$: ', bodyText.includes('R$'));

  // Check if store has data
  const storeData = await page.evaluate(() => {
    try {
      // @ts-ignore
      return window.__DASHBOARD_DATA || 'not found';
    } catch {
      return 'error accessing window';
    }
  });
  console.log('Store data:', typeof storeData === 'string' ? storeData : 'has data object');
});
