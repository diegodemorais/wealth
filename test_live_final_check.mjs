import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const url = `https://diegodemorais.github.io/wealth-dash/?t=${Date.now()}`;
console.log('Checking:', url);
await page.goto(url, { waitUntil: 'networkidle' });

const result = await page.evaluate(() => ({
  toggleEruda: typeof window.toggleEruda === 'function',
  switchTab: typeof window.switchTab === 'function',
}));

console.log(`\n📊 Estado do site:`);
console.log(`   toggleEruda: ${result.toggleEruda ? '✅' : '⏳'}`);
console.log(`   switchTab (sempre deve estar): ${result.switchTab ? '✅' : '❌'}`);

if (!result.toggleEruda) {
  console.log(`\n⏳ Esperando propagação do GitHub Pages (pode levar até 1 min)...`);
} else {
  console.log(`\n🎉 Console button está PRONTO!`);
}

await browser.close();
