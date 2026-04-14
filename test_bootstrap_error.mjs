import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const filePath = 'file:///Users/diegodemorais/claude/code/wealth/dashboard/index.html';
  
  // Capture all console messages
  const logs = [];
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      args: msg.args().length
    });
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });
  
  try {
    await page.goto(filePath, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    
    // Check if bootstrap loaded
    const bootstrapLoaded = await page.evaluate(() => {
      const script = document.querySelector('script[src*="bootstrap"]');
      return {
        scriptExists: !!script,
        src: script ? script.src : null,
        windowInit: typeof window.init,
        windowData: typeof window.DATA,
      };
    });
    
    console.log('\n📦 Bootstrap status:');
    console.log(bootstrapLoaded);
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await browser.close();
  }
}

test();
