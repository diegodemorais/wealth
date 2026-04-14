import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

// Check what's in window
const windowState = await page.evaluate(() => {
  return {
    toggleEruda: typeof window.toggleEruda,
    togglePrivacy: typeof window.togglePrivacy,
    switchTab: typeof window.switchTab,
    init: typeof window.init,
  };
});

console.log('Window state:', windowState);

// Try clicking the button directly
const btn = page.locator('#erudaBtn');
console.log('\nTesting #erudaBtn click...');
try {
  await btn.click();
  console.log('✓ Click executed');
  
  // Check console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(1000);
  
  if (errors.length > 0) {
    console.log('Console errors:');
    errors.forEach(e => console.log('  -', e.substring(0, 100)));
  } else {
    console.log('No console errors');
  }
} catch (e) {
  console.log('✗ Click failed:', e.message);
}

await browser.close();
