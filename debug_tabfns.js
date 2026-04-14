#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9892;
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
    const types = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.json': 'application/json',
      '.css': 'text/css'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const dataCheck = await page.evaluate(() => {
    return {
      tabFnsKeys: Object.keys(window.tabFns || {}),
      buildIrDifferidoExists: typeof window.buildIrDiferido,
      irDiferidoDataKey: 'irDiferido' in (window.DATA || {}),
      allDataKeys: Object.keys(window.DATA || {})
    };
  });

  console.log('\n📊 TABFNS AND DATA CHECK\n');
  console.log(JSON.stringify(dataCheck, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
