#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9882;
const DASHBOARD_DIR = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(DASHBOARD_DIR, url);
  if (!filePath.startsWith(DASHBOARD_DIR)) {
    res.writeHead(400);
    res.end();
    return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end();
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

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const { allFunctions, windowKeys, errors } = await page.evaluate(() => {
    const allFunctions = Object.entries(window)
      .filter(([k, v]) => typeof v === 'function')
      .map(([k]) => k)
      .sort();

    const buildFunctions = allFunctions.filter(k => k.includes('build'));
    const dataKeys = Object.keys(window.DATA || {});

    return {
      allFunctions: buildFunctions.slice(0, 20),
      windowKeys: dataKeys.length,
      errors: window.BOOTSTRAP_ERRORS || []
    };
  });

  console.log(`\n📋 BOOTSTRAP STATUS\n${'═'.repeat(60)}\n`);
  console.log(`Window.DATA keys: ${windowKeys}`);
  console.log(`Build functions found: ${allFunctions.join(', ')}`);

  if (consoleMessages.length > 0) {
    console.log(`\n⚠️  Console messages:\n`);
    consoleMessages.slice(0, 20).forEach(msg => {
      console.log(`  [${msg.type}] ${msg.text.substring(0, 100)}`);
    });
  }

  const hasErrors = consoleMessages.some(m => m.type === 'error');
  if (hasErrors) {
    console.log(`\n❌ JavaScript errors detected`);
  } else {
    console.log(`\n✅ No errors in console`);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
