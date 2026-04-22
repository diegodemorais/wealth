import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
page.setViewport({ width: 1440, height: 900 });

try {
  console.log('Fetching FIRE page from GitHub Pages...');
  await page.goto('https://diegodemorais.github.io/wealth/fire', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Scroll to first chart
  const charts = await page.$$('.echarts-container');
  if (charts.length > 0) {
    console.log(`Found ${charts.length} charts`);
    
    // Take screenshot of first chart (Net Worth Projection)
    const bbox = await charts[0].boundingBox();
    if (bbox) {
      await page.screenshot({
        path: '/tmp/net_worth_projection_detail.png',
        clip: { x: Math.max(0, bbox.x - 20), y: Math.max(0, bbox.y - 40), 
                width: bbox.width + 40, height: bbox.height + 60 }
      });
      console.log('✅ Net Worth Projection chart screenshot saved');
    }
  }
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
