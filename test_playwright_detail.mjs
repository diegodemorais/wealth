import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const filePath = 'file:///Users/diegodemorais/claude/code/wealth/dashboard/index.html';
  
  try {
    await page.goto(filePath, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Get inner content snippet
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });
    console.log('📄 Page content preview:');
    console.log(bodyText);
    console.log('...\n');
    
    // Check specific KPI values
    const heroKpis = await page.evaluate(() => {
      const kpis = {};
      document.querySelectorAll('[id*="kpi"]').forEach(el => {
        if (el.textContent.trim()) {
          kpis[el.id] = el.textContent.trim().substring(0, 50);
        }
      });
      return kpis;
    });
    
    console.log('🎯 KPI Values found:');
    Object.entries(heroKpis).slice(0, 10).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    console.log(`  ... and ${Object.keys(heroKpis).length - 10} more\n`);
    
    // Check for render errors
    const hasErrors = await page.evaluate(() => {
      const allText = document.body.innerText.toLowerCase();
      return {
        'ERROR': allText.includes('error'),
        'undefined': allText.includes('undefined'),
        'null': allText.includes('null object'),
        'Em desenvolvimento': allText.includes('em desenvolvimento'),
      };
    });
    
    console.log('⚠️  Error checks:');
    Object.entries(hasErrors).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    
    // List all tabs and their visibility
    const tabStatus = await page.evaluate(() => {
      const tabs = {};
      document.querySelectorAll('button[data-tab]').forEach(btn => {
        tabs[btn.textContent.trim()] = {
          hidden: btn.classList.contains('hidden'),
          visible: btn.offsetParent !== null
        };
      });
      return tabs;
    });
    
    console.log('\n📑 Tab Status:');
    Object.entries(tabStatus).forEach(([name, status]) => {
      console.log(`  ${name}: visible=${status.visible}, hidden=${status.hidden}`);
    });
    
    // Check if init() was called
    const initStatus = await page.evaluate(() => {
      return {
        windowInit: typeof window.init,
        windowData: typeof window.DATA,
        renderKpis: typeof window.renderKPIs,
      };
    });
    
    console.log('\n🔧 Window object status:');
    Object.entries(initStatus).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await browser.close();
  }
}

test();
