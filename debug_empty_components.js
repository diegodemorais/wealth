#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9890;
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
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  await page.evaluate(() => window.switchTab('carteira'));
  await page.waitForTimeout(2000);

  const dataCheck = await page.evaluate(() => {
    return {
      dataExists: !!window.DATA,
      buildIrDiferidoType: typeof window.buildIrDiferido,
      irDiferidoRows: document.querySelectorAll('#irDiferido tr').length,
      minilogRows: document.querySelectorAll('#minilogBody tr').length,
      tlhMonitorRows: document.querySelectorAll('#tlhMonitor tr').length,
      driftSemaforoContent: document.getElementById('driftSemaforoEtf')?.textContent?.trim()?.substring(0, 20),
      irDiferidoContent: document.getElementById('irDiferido')?.textContent?.trim()?.substring(0, 20),
      data_sample: Object.keys(window.DATA || {}).slice(0, 10)
    };
  });

  console.log('\n📊 DATA CHECK\n');
  console.log(JSON.stringify(dataCheck, null, 2));
  console.log('\n📋 Console logs (last 20):');
  logs.slice(-20).forEach(log => console.log('  ' + log));

  await browser.close();
  server.close();
  process.exit(0);
});
