import { test, expect } from '@playwright/test';

test('Capture React errors', async ({ page }) => {
  let pageError = '';
  let consoleErrors: string[] = [];

  page.on('pageerror', error => {
    pageError = error.message + '\n' + error.stack;
    console.log('PAGE ERROR:', error.message);
    console.log('STACK:', error.stack);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('[ERROR]', msg.text());
    }
  });

  console.log('Loading page...');
  await page.goto('https://diegodemorais.github.io/wealth/dash/', {
    waitUntil: 'load',
  }).catch(e => console.log('Navigation error:', e.message));

  await page.waitForTimeout(3000);

  // Try to get error details from __next_error__ div
  const errorDiv = await page.$('#__next_error__');
  if (errorDiv) {
    console.log('\n__next_error__ DIV FOUND - Extracting error info...');
    const errorText = await errorDiv.innerText().catch(() => 'Could not extract');
    console.log('Error text:', errorText);

    // Check for error boundary details
    const allText = await page.innerText('body');
    console.log('\n\nFull page content:');
    console.log(allText);
  } else {
    console.log('No __next_error__ div found');
  }

  console.log('\n\nPage error:', pageError);
  console.log('Console errors:', consoleErrors);
});
