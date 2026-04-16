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
      await page.screenshot({ path: '/tmp/dashboard-live.png', fullPage: true });
      console.log('✅ Screenshot do servidor LIVE salvo');
    }
  } catch (e) {
    console.log('Erro:', e.message);
  }
  
  await browser.close();
})();
