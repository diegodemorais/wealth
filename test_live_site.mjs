import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];

page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

console.log('Loading live site...');
await page.goto('https://diegodemorais.github.io/wealth-dash/', { 
  waitUntil: 'networkidle',
  timeout: 30000 
});

await page.waitForTimeout(3000);

// Check if bootstrap loaded
const bootstrap = await page.evaluate(() => ({
  init: typeof window.init === 'function',
  renderKPIs: typeof window.renderKPIs === 'function',
  switchTab: typeof window.switchTab === 'function',
  DATA: typeof window.DATA === 'object',
  VERSION: window.VERSION,
}));

console.log('\n🔍 BOOTSTRAP:');
Object.entries(bootstrap).forEach(([k, v]) => {
  console.log(`  ${v ? '✅' : '❌'} window.${k}: ${v}`);
});

// Check table content
const tableContent = await page.evaluate(() => {
  const table = document.getElementById('semaforoBody');
  return {
    exists: !!table,
    rows: table ? table.querySelectorAll('tr').length : 0,
  };
});

console.log('\n📊 TABLE:');
console.log(`  Rows in #semaforoBody: ${tableContent.rows}`);

// Check KPI elements
const kpis = await page.evaluate(() => {
  const els = document.querySelectorAll('[id*="kpi"]');
  const withText = Array.from(els).filter(e => e.textContent.trim());
  return { total: els.length, withText: withText.length };
});

console.log('\n🎯 KPIs:');
console.log(`  Total: ${kpis.total} | With text: ${kpis.withText}`);

// Check for JS errors
console.log('\n❌ ERRORS:');
if (errors.length === 0) {
  console.log('  None');
} else {
  errors.slice(0, 5).forEach(e => console.log(`  • ${e.substring(0, 80)}`));
}

await browser.close();
