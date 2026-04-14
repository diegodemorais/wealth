import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

console.log('Testing LOCAL server...\n');
await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });

const funcs = await page.evaluate(() => ({
  toggleEruda: typeof window.toggleEruda === 'function',
  togglePrivacy: typeof window.togglePrivacy === 'function',
}));

console.log(`toggleEruda: ${funcs.toggleEruda ? '✅ YES' : '❌ NO'}`);
console.log(`togglePrivacy: ${funcs.togglePrivacy ? '✅ YES' : '❌ NO'}`);

if (funcs.toggleEruda && funcs.togglePrivacy) {
  console.log('\n✅ Console button is working locally!');
}

await browser.close();
