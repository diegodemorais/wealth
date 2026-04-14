import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

console.log('Checking live site after deploy...\n');
await page.goto('https://diegodemorais.github.io/wealth-dash/?r=' + Date.now(), { waitUntil: 'networkidle' });

// Test 1: Check if toggleEruda is now available
const erudaAvailable = await page.evaluate(() => {
  return {
    toggleEruda: typeof window.toggleEruda === 'function',
    togglePrivacy: typeof window.togglePrivacy === 'function',
    switchTab: typeof window.switchTab === 'function'
  };
});

console.log('Functions available:');
console.log(`  ✓ toggleEruda: ${erudaAvailable.toggleEruda ? 'YES' : 'NO'}`);
console.log(`  ✓ togglePrivacy: ${erudaAvailable.togglePrivacy ? 'YES' : 'NO'}`);
console.log(`  ✓ switchTab: ${erudaAvailable.switchTab ? 'YES' : 'NO'}`);

// Test 2: Verify content is rendered
const contentCheck = await page.evaluate(() => {
  return {
    visibleElements: document.querySelectorAll('body *:not([style*="display:none"])').length,
    dataTabs: document.querySelectorAll('[data-in-tab]').length,
    tables: document.querySelectorAll('table').length,
    canvases: document.querySelectorAll('canvas').length
  };
});

console.log('\nContent rendered:');
console.log(`  ✓ Visible elements: ${contentCheck.visibleElements}`);
console.log(`  ✓ Tab content divs: ${contentCheck.dataTabs}`);
console.log(`  ✓ Tables: ${contentCheck.tables}`);
console.log(`  ✓ Charts (canvas): ${contentCheck.canvases}`);

// Test 3: Mobile viewport responsiveness
const mobileCheck = await page.evaluate(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const overflows = document.querySelectorAll('[style*="overflow:hidden"]').length;
  return { width, height, overflows };
});

console.log('\nMobile viewport (390x844):');
console.log(`  ✓ Viewport size: ${mobileCheck.width}x${mobileCheck.height}`);
console.log(`  ✓ Elements with overflow protection: ${mobileCheck.overflows}`);

await browser.close();
