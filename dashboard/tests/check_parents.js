const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9885;
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

  const info = await page.evaluate(() => {
    const el = document.getElementById('wellnessScore');
    if (!el) return { found: false };
    
    let current = el;
    const chain = [];
    while (current && chain.length < 15) {
      const display = window.getComputedStyle(current).display;
      chain.push({
        tag: current.tagName,
        classes: current.className.substring(0, 30),
        display,
        offsetParent: current.offsetParent ? current.offsetParent.tagName : null
      });
      if (current.offsetParent === null && current !== document.body) {
        current = current.parentElement;
      } else {
        break;
      }
    }
    
    return { chain };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
