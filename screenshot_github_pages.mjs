import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
page.setViewport({ width: 1440, height: 900 });

try {
  console.log('📍 Checking GitHub Pages deployment...');
  await page.goto('https://diegodemorais.github.io/wealth/fire', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  const versionText = await page.$eval('span', el => el.textContent);
  console.log('✅ Dashboard version:', versionText);
  
  await page.screenshot({ path: '/tmp/github_pages_fire_v1.0.94.png', fullPage: true });
  console.log('✅ GitHub Pages screenshot saved');
  
} catch (e) {
  console.error('Still deploying or error:', e.message);
} finally {
  await browser.close();
}
