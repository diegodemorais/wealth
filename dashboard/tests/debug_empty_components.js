#!/usr/bin/env node
/**
 * Debug EMPTY components by capturing console errors and checking DATA availability
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'spec_html_mapping.json'), 'utf-8'));
const PORT = 9880;
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
  const errors = [];
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'log' && msg.text().includes('ERROR')) logs.push(msg.text());
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Check specific EMPTY components
  const emptySpecs = [
    'patrimonio-total-hero',
    'pfire-hero',
    'ipca-dca-semaforo',
    'savings-rate',
    'backtest-metricas'
  ];

  const results = [];
  for (const specId of emptySpecs) {
    const item = SPEC.mapping.find(m => m.specId === specId);
    if (!item) continue;

    const status = await page.evaluate(({ htmlId, specId }) => {
      const el = document.getElementById(htmlId);
      return {
        specId,
        exists: !!el,
        visible: el && !!el.offsetParent,
        html: el ? el.innerHTML.trim().substring(0, 100) : 'N/A',
        children: el ? el.children.length : 0,
        textContent: el ? el.textContent.trim().substring(0, 100) : 'N/A'
      };
    }, { htmlId: item.htmlId, specId });

    results.push(status);
  }

  const output = {
    timestamp: new Date().toISOString(),
    consoleLogs: logs.slice(0, 20),
    consoleErrors: errors.slice(0, 20),
    components: results,
    dataKeys: await page.evaluate(() => Object.keys(window.DATA || {}).length)
  };

  fs.writeFileSync(path.join(__dirname, 'debug_empty_results.json'), JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
