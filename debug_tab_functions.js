#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9891;
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
  await page.waitForTimeout(1000);

  const dataCheck = await page.evaluate(() => {
    const tabFns = window.tabFns || {};
    return {
      tabFnsExist: !!tabFns,
      carteiraFns: tabFns.carteira ? tabFns.carteira.map(f => f.name).join(', ') : 'NOT FOUND',
      buildIrDiferidoInCarteira: tabFns.carteira ? tabFns.carteira.some(f => f.name === 'buildIrDiferido') : false
    };
  });

  console.log('\n📊 TAB FUNCTIONS CHECK\n');
  console.log(JSON.stringify(dataCheck, null, 2));

  // Now switch to carteira and manually call buildIrDiferido
  const afterManualCall = await page.evaluate(() => {
    window.buildIrDiferido();
    return {
      irDiferidoRows: document.querySelectorAll('#irDiferido tr').length,
      irDiferidoContent: document.getElementById('irDiferido')?.textContent?.trim()?.substring(0, 50)
    };
  });

  console.log('\n📊 AFTER MANUAL CALL TO buildIrDiferido()\n');
  console.log(JSON.stringify(afterManualCall, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
