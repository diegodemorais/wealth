import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
page.setViewport({ width: 1440, height: 900 });

try {
  await page.goto('http://localhost:3000/wealth/fire', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  await page.screenshot({ path: '/tmp/fire_v1.0.94_full.png', fullPage: true });
  console.log('✅ Screenshot saved: /tmp/fire_v1.0.94_full.png');
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
