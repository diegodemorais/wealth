import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

console.log('Testing console button on live site (mobile viewport: 390x844)...');
await page.goto('https://diegodemorais.github.io/wealth-dash/', { waitUntil: 'networkidle' });

// Find console button
const consoleBtn = page.locator('#erudaBtn');
const isVisible = await consoleBtn.isVisible().catch(() => false);

console.log(`✓ Console button:`);
console.log(`  - Found and visible: ${isVisible}`);

if (isVisible) {
  // Check if eruda is loaded
  const erudaLoaded = await page.evaluate(() => {
    return typeof window.eruda !== 'undefined';
  });
  
  console.log(`  - Eruda library loaded: ${erudaLoaded}`);
  
  // Try clicking
  try {
    await consoleBtn.click();
    await page.waitForTimeout(500);
    console.log(`  ✓ Click executed successfully`);
  } catch (e) {
    console.log(`  ✗ Click failed: ${e.message}`);
  }
} else {
  console.log(`✗ Button NOT visible on mobile viewport`);
}

await browser.close();
