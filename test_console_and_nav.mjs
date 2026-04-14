import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

console.log('Testing GitHub Pages deployment...\n');
await page.goto('https://diegodemorais.github.io/wealth-dash/', { waitUntil: 'networkidle' });

// 1. Test console button
console.log('1️⃣ Testing console button...');
const erudaLoaded = await page.evaluate(() => typeof window.toggleEruda === 'function');
console.log(`   - toggleEruda function: ${erudaLoaded ? '✓ AVAILABLE' : '✗ NOT FOUND'}`);

// 2. Test tab navigation
console.log('\n2️⃣ Testing tab navigation...');
const tabs = ['hoje', 'carteira', 'perf', 'fire', 'retiro', 'simuladores', 'backtest'];
let successCount = 0;

for (const tabName of tabs) {
  try {
    const btn = page.locator(`button[data-tab="${tabName}"]`);
    const exists = await btn.count() > 0;
    
    if (exists) {
      await btn.click();
      await page.waitForTimeout(300);
      
      // Check if content appeared
      const elements = await page.locator(`[data-in-tab="${tabName}"]`).count();
      if (elements > 0) {
        console.log(`   ✓ ${tabName}: ${elements} elements`);
        successCount++;
      } else {
        console.log(`   ✗ ${tabName}: no content elements`);
      }
    }
  } catch (e) {
    console.log(`   ✗ ${tabName}: error`);
  }
}

console.log(`\n   Total: ${successCount}/${tabs.length} tabs working`);

// 3. Check for errors
console.log('\n3️⃣ Checking for JavaScript errors...');
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.waitForTimeout(500);
if (errors.length === 0) {
  console.log('   ✓ No console errors');
} else {
  console.log(`   ✗ Found ${errors.length} errors:`);
  errors.slice(0, 3).forEach(e => console.log(`      - ${e.substring(0, 60)}`));
}

await browser.close();
