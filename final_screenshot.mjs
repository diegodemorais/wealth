import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
page.setViewport({ width: 1440, height: 900 });

try {
  console.log('🔄 Fetching FIRE page from GitHub Pages (v1.0.96+)...');
  await page.goto('https://diegodemorais.github.io/wealth/fire', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  const versionText = await page.$eval('span', el => el.textContent);
  console.log('✅ Dashboard version:', versionText);
  
  await page.screenshot({ path: '/tmp/fire_all_charts_final.png', fullPage: true });
  console.log('✅ Full page screenshot with all projection charts');
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
