import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Set mobile viewport (iPhone size)
await page.setViewportSize({ width: 390, height: 844 });

console.log('📱 TESTING MOBILE VIEWPORT (390x844)\n');

await page.goto('https://diegodemorais.github.io/wealth-dash/', { 
  waitUntil: 'networkidle',
  timeout: 30000 
});

await page.waitForTimeout(2000);

// Check visibility in mobile
const mobileCheck = await page.evaluate(() => {
  const semaforoTable = document.getElementById('semaforoBody');
  const kpis = document.querySelectorAll('[id*="kpi"]');
  
  return {
    semaforoRows: semaforoTable ? semaforoTable.querySelectorAll('tr').length : 0,
    kpisWithText: Array.from(kpis).filter(k => k.textContent.trim()).length,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    bodyOverflow: window.getComputedStyle(document.body).overflow,
  };
});

console.log('MOBILE CONTENT:');
console.log('  Semaforo rows:', mobileCheck.semaforoRows);
console.log('  KPIs with text:', mobileCheck.kpisWithText);
console.log('  Viewport:', mobileCheck.windowWidth, 'x', mobileCheck.windowHeight);

// Screenshot mobile
await page.screenshot({ path: '/tmp/live_site_mobile.png' });
console.log('\n📸 Mobile screenshot: /tmp/live_site_mobile.png');

await browser.close();
