import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('https://diegodemorais.github.io/wealth-dash/?r=' + Date.now(), { waitUntil: 'networkidle' });

const result = await page.evaluate(() => ({
  toggleEruda: typeof window.toggleEruda === 'function',
  togglePrivacy: typeof window.togglePrivacy === 'function',
}));

console.log(`\n✅ GitHub Pages - Funções disponíveis:`);
console.log(`   toggleEruda: ${result.toggleEruda ? '✓ SIM' : '✗ NÃO'}`);
console.log(`   togglePrivacy: ${result.togglePrivacy ? '✓ SIM' : '✗ NÃO'}`);

if (result.toggleEruda) {
  console.log(`\n🎉 Console button está funcionando! Click para abrir Eruda.`);
}

await browser.close();
