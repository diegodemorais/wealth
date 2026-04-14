const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9899;
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

  // Click through tabs
  for (const tab of ['hoje', 'perf', 'backtest', 'carteira', 'fire', 'retiro']) {
    await page.evaluate((t) => {
      const btn = document.querySelector(`[data-tab="${t}"]`);
      if (btn) btn.click();
    }, tab);
    await page.waitForTimeout(1000);
  }

  const info = await page.evaluate(() => {
    const el = document.getElementById('spendingBreakdownBody');
    if (!el) return { found: false };
    
    return {
      found: true,
      visible: el.offsetParent !== null,
      innerHTML: el.innerHTML.substring(0, 100),
      textContent: el.textContent.substring(0, 100)
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
