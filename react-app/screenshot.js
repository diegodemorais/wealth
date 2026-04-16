const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 900 });
  
  try {
    // Aguarda servidor iniciando
    let ready = false;
    for (let i = 0; i < 15; i++) {
      try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 5000 });
        ready = true;
        break;
      } catch (e) {
        console.log(`Tentativa ${i+1}: esperando servidor...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    
    if (ready) {
      // Wait for page to fully render with data
      await page.waitForFunction(() => {
        const warning = document.querySelector('.warning-state');
        return !warning || warning.textContent.includes('não computado') === false;
      }, { timeout: 3000 }).catch(() => {});

      // Take full page screenshot
      const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewport({ width: 1280, height: fullHeight });
      await page.screenshot({ path: '/tmp/dashboard-live-full.png', fullPage: true });
      console.log('✅ Full page screenshot do servidor LIVE salvo');
    }
  } catch (e) {
    console.log('Erro:', e.message);
  }
  
  await browser.close();
})();
