import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
page.setViewport({ width: 1600, height: 1200 });

try {
  await page.goto('https://diegodemorais.github.io/wealth/fire', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  
  // Get chart info via JavaScript
  const chartInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const xAxisLabels = Array.from(document.querySelectorAll('.echarts-container text')).filter(el => 
      el.textContent.match(/20\d{2}/)
    ).map(el => el.textContent);
    
    return {
      canvasExists: !!canvas,
      xAxisLabels: xAxisLabels.slice(0, 20),
      chartsFound: document.querySelectorAll('.echarts-container').length
    };
  });
  
  console.log('Chart Info:', JSON.stringify(chartInfo, null, 2));
  
  // Take full page screenshot
  await page.screenshot({ path: '/tmp/fire_github_pages_check.png', fullPage: true });
  console.log('✅ Full screenshot saved');
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
