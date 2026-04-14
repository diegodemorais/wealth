import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const filePath = 'file:///Users/diegodemorais/claude/code/wealth/dashboard/index.html';
  
  console.log('🎯 Loading dashboard from:', filePath);
  
  try {
    await page.goto(filePath, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Get page title
    const title = await page.title();
    console.log('Title:', title);
    
    // Check critical KPI elements
    const kpiElements = await page.locator('[id*="kpi"]').count();
    console.log('KPI elements found:', kpiElements);
    
    // Check if tabs exist
    const tabs = await page.locator('button[data-tab]').count();
    console.log('Tabs found:', tabs);
    
    // Check for rendered content
    const sections = await page.locator('.section').count();
    console.log('Sections found:', sections);
    
    // Check for any critical render
    const patrimonio = await page.locator('text=/Patrimônio|patrimonio/i').isVisible().catch(() => false);
    console.log('Patrimônio text visible:', patrimonio);
    
    // Check canvas/charts
    const charts = await page.locator('canvas').count();
    console.log('Charts (canvas) found:', charts);
    
    // Get console messages
    const messages = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        messages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    
    // Try clicking "Retira" tab to test interactivity
    const retiroTab = await page.locator('button:has-text("Retira")').first();
    if (await retiroTab.isVisible()) {
      console.log('\n✓ Clicking Retira tab...');
      await retiroTab.click();
      await page.waitForTimeout(1000);
      console.log('✓ Tab switched');
    }
    
    await page.screenshot({ path: '/tmp/dashboard_screenshot.png', fullPage: false });
    console.log('✓ Screenshot saved');
    
    if (messages.length > 0) {
      console.log('\n⚠️  Console messages:');
      messages.forEach(m => console.log('  ', m));
    }
    
    // Final check
    if (sections > 10) {
      console.log('\n✅ DASHBOARD IS RENDERING (found', sections, 'sections)');
    } else {
      console.log('\n⚠️  Dashboard might have rendering issues (only', sections, 'sections found)');
    }
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await browser.close();
  }
}

test();
