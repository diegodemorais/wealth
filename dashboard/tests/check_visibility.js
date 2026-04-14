const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9884;
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

  const elements = ['kpiGridMercado', 'wellnessScore', 'lumpyEventsBody'];
  for (const id of elements) {
    const info = await page.evaluate(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return { found: false };
      
      return {
        found: true,
        visible: el.offsetParent !== null,
        textLen: el.textContent?.trim()?.length || 0,
        children: el.children?.length || 0,
        display: window.getComputedStyle(el).display,
        parentDisplay: el.parentElement ? window.getComputedStyle(el.parentElement).display : 'N/A',
      };
    }, { id });
    
    console.log(`${id}:`, info);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
