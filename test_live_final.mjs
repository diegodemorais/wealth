import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

console.log('Testing GitHub Pages (final check)...\n');
await page.goto('https://diegodemorais.github.io/wealth-dash/?r=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Test functions
const funcs = await page.evaluate(() => ({
  toggleEruda: typeof window.toggleEruda === 'function',
  togglePrivacy: typeof window.togglePrivacy === 'function',
  switchTab: typeof window.switchTab === 'function'
}));

console.log('✅ Functions available:');
console.log(`   toggleEruda: ${funcs.toggleEruda ? '✓ YES' : '✗ NO'}`);
console.log(`   togglePrivacy: ${funcs.togglePrivacy ? '✓ YES' : '✗ NO'}`);
console.log(`   switchTab: ${funcs.switchTab ? '✓ YES' : '✗ NO'}`);

if (funcs.toggleEruda) {
  console.log('\n✅ Console button will now work when clicked!');
}

await browser.close();
