import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });

const funcs = await page.evaluate(() => ({
  toggleEruda: typeof window.toggleEruda,
  togglePrivacy: typeof window.togglePrivacy,
}));

console.log(`✅ toggleEruda: ${funcs.toggleEruda}`);
console.log(`✅ togglePrivacy: ${funcs.togglePrivacy}`);

await browser.close();
