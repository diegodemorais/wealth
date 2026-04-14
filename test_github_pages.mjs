import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = 'https://diegodemorais.github.io/wealth/';
  
  console.log('🌐 Loading from GitHub Pages:', url);
  
  // Capture ALL console messages and errors
  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err.message);
  });
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(5000);
    
    // Check what's loaded
    const status = await page.evaluate(() => {
      return {
        init: typeof window.init,
        renderKPIs: typeof window.renderKPIs,
        DATA: typeof window.DATA,
        sections: document.querySelectorAll('.section').length,
        scripts: document.querySelectorAll('script').length,
        modules: document.querySelectorAll('script[type="module"]').length,
      };
    });
    
    console.log('\n📊 Page Status:');
    Object.entries(status).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    
    // Check for specific errors
    const pageHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
    if (pageHTML.includes('undefined') || pageHTML.includes('ERROR')) {
      console.log('\n⚠️  Page contains error indicators');
    }
    
    // Try to get KPI values
    const kpis = await page.evaluate(() => {
      const vals = {};
      ['kpiPfire50', 'kpiCambio', 'kpiBtcUsd'].forEach(id => {
        const el = document.getElementById(id);
        vals[id] = el ? el.innerText.trim() : 'NOT RENDERED';
      });
      return vals;
    });
    
    console.log('\n📈 KPI Rendering:');
    Object.entries(kpis).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    
    // Check bootstrap script
    const bootstrapScript = await page.evaluate(() => {
      const script = document.querySelector('script[src*="bootstrap"]');
      if (!script) return { found: false };
      return {
        found: true,
        src: script.src,
        type: script.type
      };
    });
    
    console.log('\n📦 Bootstrap Script:');
    console.log('  ', bootstrapScript);
    
    if (logs.filter(l => l.type === 'error').length > 0) {
      console.log('\n❌ ERRORS DETECTED:');
      logs.filter(l => l.type === 'error').forEach(l => {
        console.log('  ', l.text.substring(0, 150));
      });
    }
    
  } catch (e) {
    console.error('❌ Test error:', e.message);
  } finally {
    await browser.close();
  }
}

test();
