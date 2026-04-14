import { test } from '@playwright/test';

test('Deep diagnostic - console logs and errors', async ({ page }) => {
  const consoleLogs: Array<{ type: string; message: string }> = [];

  page.on('console', async msg => {
    consoleLogs.push({
      type: msg.type(),
      message: msg.text(),
    });
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    console.log(error.stack);
  });

  console.log('Navigating to: https://diegodemorais.github.io/wealth/dash/');
  await page.goto('https://diegodemorais.github.io/wealth/dash/', {
    waitUntil: 'networkidle',
    timeout: 10000
  }).catch(e => console.log(`[NAVIGATION ERROR] ${e.message}`));

  await page.waitForTimeout(2000);

  console.log('\n=== PAGE CONTENT ===');
  const htmlContent = await page.content();
  console.log(htmlContent.substring(0, 1000));

  console.log('\n=== ALL CONSOLE LOGS ===');
  consoleLogs.slice(0, 20).forEach(log => {
    console.log(`${log.type}: ${log.message}`);
  });
});
