const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9883;
const DASHBOARD_DIR = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(DASHBOARD_DIR, url);
  if (!filePath.startsWith(DASHBOARD_DIR)) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('404');
      return;
    }
    const ext = path.extname(filePath);
    const types = {
      '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
      '.json': 'application/json', '.css': 'text/css'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => {});
  page.on('pageerror', err => {});

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Switch to backtest tab
  await page.evaluate(() => {
    const btn = document.querySelector('[data-tab="backtest"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => {
    const el = document.getElementById('backtestRegimeLongo');
    if (!el) return { found: false };
    
    const ctx = el.getContext('2d');
    if (!ctx) return { found: true, noContext: true };
    
    try {
      const imageData = ctx.getImageData(0, 0, el.width, el.height);
      let pixelCount = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) pixelCount++;
      }
      return {
        found: true,
        width: el.width,
        height: el.height,
        dataLength: imageData.data.length,
        pixelCount,
        threshold: Math.floor(el.width * el.height * 0.01),
        hasFill: pixelCount > el.width * el.height * 0.01
      };
    } catch(e) {
      return { found: true, error: e.message };
    }
  });

  console.log('backtestRegimeLongo:', JSON.stringify(result, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
