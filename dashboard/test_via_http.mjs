import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = 'http://localhost:8765/';
  
  console.log('🎯 Loading dashboard from:', url);
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    
    // Check bootstrap and rendering
    const status = await page.evaluate(() => {
      return {
        init: typeof window.init,
        renderKPIs: typeof window.renderKPIs,
        DATA: typeof window.DATA,
        sections: document.querySelectorAll('.section').length,
        charts: document.querySelectorAll('canvas').length,
        kpiCount: document.querySelectorAll('[id*="kpi"]').length,
      };
    });
    
    console.log('\n✅ Dashboard Status:');
    Object.entries(status).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    
    // Get some KPI values
    const kpiValues = await page.evaluate(() => {
      const vals = {};
      ['kpiPfire50', 'kpiCambio', 'kpiBtcUsd'].forEach(id => {
        const el = document.getElementById(id);
        vals[id] = el ? el.innerText : 'NOT FOUND';
      });
      return vals;
    });
    
    console.log('\n📊 KPI Sample Values:');
    Object.entries(kpiValues).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/dashboard_http.png' });
    console.log('\n✓ Screenshot saved: /tmp/dashboard_http.png');
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await browser.close();
  }
}

test();
