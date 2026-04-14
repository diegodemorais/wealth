#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const results = JSON.parse(fs.readFileSync('dashboard/tests/comprehensive_component_test.json', 'utf-8'));
const empties = results.components.filter(c => c.statusChar === '⚠️').slice(0, 5);

const PORT = 9876;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard');

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
    const types = {'.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.css': 'text/css'};
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, async () => {
  console.log(`\n🔍 INVESTIGATING 5 EMPTY COMPONENTS\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  for (const comp of empties) {
    console.log(`\n📌 ${comp.specId} (${comp.htmlId})`);
    console.log('─'.repeat(80));

    const analysis = await page.evaluate(({elId}) => {
      const el = document.getElementById(elId);
      if (!el) return { error: 'NOT_FOUND' };

      const innerHTML = el.innerHTML;
      const textContent = el.textContent.trim();
      const rows = el.querySelectorAll('tbody tr, tr').length;
      const hasCanvas = !!el.querySelector('canvas');
      const canvasData = hasCanvas ? el.querySelector('canvas').toDataURL('image/png').length : 0;

      return {
        tagName: el.tagName,
        innerHTML_length: innerHTML.length,
        innerHTML_preview: innerHTML.slice(0, 100),
        textContent_length: textContent.length,
        rows: rows,
        hasCanvas: hasCanvas,
        canvasData_length: canvasData,
        children: el.children.length,
        class: el.className
      };
    }, {elId: comp.htmlId});

    console.log(JSON.stringify(analysis, null, 2));
  }

  if (errors.length > 0) {
    console.log(`\n\n⚠️  CONSOLE ERRORS:`);
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
  }

  await browser.close();
  server.close();
  process.exit(0);
});
