const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9890;
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
  
  const logs = [];
  page.on('console', msg => { logs.push(msg.text()); });
  page.on('pageerror', err => {});

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Switch to carteira tab
  await page.evaluate(() => {
    const btn = document.querySelector('[data-tab="carteira"]');
    if (btn) {
      console.log('Clicking carteira tab');
      btn.click();
    }
  });
  await page.waitForTimeout(2000);

  console.log('Logs:', logs.filter(l => l.includes('etf') || l.includes('chart') || l.includes('Composição')));

  const builderExists = await page.evaluate(() => {
    return typeof window.buildEtfComposicaoRegiao === 'function';
  });

  console.log('buildEtfComposicaoRegiao exists:', builderExists);

  await browser.close();
  server.close();
  process.exit(0);
});
