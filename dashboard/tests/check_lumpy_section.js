const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9888;
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
  
  let errors = [];
  page.on('console', msg => {});
  page.on('pageerror', err => { errors.push(err.message); });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  await page.evaluate(() => {
    const btn = document.querySelector('[data-tab="fire"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const section = document.getElementById('lumpyEventsSection');
    const body = document.getElementById('lumpyEventsBody');
    
    if (!section || !body) return { found: false };
    
    return {
      found: true,
      sectionDisplay: window.getComputedStyle(section).display,
      bodyDisplay: window.getComputedStyle(body).display,
      bodyHTML: body.innerHTML.substring(0, 300),
      bodyHidden: section.style.display === 'none'
    };
  });

  console.log(JSON.stringify(info, null, 2));
  if (errors.length) console.log('Errors:', errors);

  await browser.close();
  server.close();
  process.exit(0);
});
