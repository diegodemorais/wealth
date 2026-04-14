import { chromium } from 'playwright';

async function testLive() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const liveUrl = 'https://diegodemorais.github.io/wealth-dash/';
  
  console.log('🌐 Testing LIVE URL:', liveUrl);
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const level = msg.type();
    if (level === 'error' || level === 'warning') {
      consoleMessages.push(`[${level.toUpperCase()}] ${msg.text()}`);
    }
  });
  
  try {
    console.log('\n📍 Navigating to live URL...');
    await page.goto(liveUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    console.log('✓ Page loaded');
    
    // Check basic structure
    const tabs = await page.locator('button[data-tab]').count();
    const sections = await page.locator('[class*="section"]').count();
    const divNested = await page.locator('div > div > div > div').count();
    
    console.log(`\n📊 Structure check:`);
    console.log(`  - Tab buttons: ${tabs}`);
    console.log(`  - Sections/divs: ${sections}`);
    console.log(`  - 4-level nested divs: ${divNested}`);
    
    // Test each tab
    const tabList = ['hoje', 'carteira', 'perf', 'fire', 'retiro', 'simuladores', 'backtest'];
    
    for (const tabName of tabList) {
      try {
        // Try multiple selectors
        const btnSelectors = [
          `button[data-tab="${tabName}"]`,
          `button:has-text("${tabName}")`,
          `button[data-aba="${tabName}"]`,
          `[onclick*="${tabName}"]`
        ];
        
        let clicked = false;
        for (const selector of btnSelectors) {
          const btn = page.locator(selector).first();
          const exists = await btn.isVisible({ timeout: 1000 }).catch(() => false);
          if (exists) {
            await btn.click({ timeout: 5000 });
            clicked = true;
            break;
          }
        }
        
        if (clicked) {
          await page.waitForTimeout(800);
          
          // Check content visibility
          const visibleText = await page.locator('body').textContent();
          const hasContent = visibleText && visibleText.trim().length > 100;
          
          console.log(`\n✓ Tab "${tabName}": clicked successfully`);
          console.log(`  - Content visible: ${hasContent ? 'YES' : 'NO'}`);
          
          // Take tab screenshot
          await page.screenshot({ path: `/tmp/dashboard_${tabName}.png` });
          console.log(`  - Screenshot: /tmp/dashboard_${tabName}.png`);
        } else {
          console.log(`\n⚠ Tab "${tabName}": button not clickable`);
        }
      } catch (e) {
        console.log(`\n✗ Tab "${tabName}": ${e.message}`);
      }
    }
    
    // Check for rendering issues
    console.log(`\n🔍 Rendering diagnostics:`);
    
    const displayNone = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      let count = 0;
      els.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          count++;
        }
      });
      return count;
    });
    console.log(`  - Hidden elements (display:none or visibility:hidden): ${displayNone}`);
    
    const emptyDivs = await page.evaluate(() => {
      const divs = document.querySelectorAll('div');
      let emptyNested = 0;
      divs.forEach(div => {
        if (div.children.length > 0 && !div.textContent.trim()) {
          emptyNested++;
        }
      });
      return emptyNested;
    });
    console.log(`  - Empty containers with children: ${emptyDivs}`);
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
  }
  
  if (consoleMessages.length > 0) {
    console.log('\n⚠️  Console errors/warnings:');
    consoleMessages.forEach(m => console.log('  ', m));
  }
  
  await browser.close();
}

testLive();
