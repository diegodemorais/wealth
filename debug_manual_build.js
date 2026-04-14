#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9893;
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

  // Test manual build call
  const result = await page.evaluate(() => {
    // Check if data exists
    const hasData = 'tlh' in (window.DATA || {});
    const hasBuildFunc = typeof window.buildIrDiferido === 'function';
    
    // Call the function
    if (hasBuildFunc) {
      try {
        window.buildIrDiferido();
      } catch (e) {
        console.error('[buildIrDiferido ERROR]', e.message);
      }
    }
    
    return {
      hasData,
      hasBuildFunc,
      irDiferidoRows: document.querySelectorAll('#irDiferido tr').length,
      irDiferidoTbody: !!document.getElementById('irDiferido'),
      tlhData: window.DATA?.tlh ? Object.keys(window.DATA.tlh).slice(0, 5) : null
    };
  });

  console.log('\n📊 MANUAL BUILD TEST\n');
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
