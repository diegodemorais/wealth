#!/usr/bin/env node
/**
 * Test if stub builders are actually being called
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9881;
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

  // Collect logs
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    logs.push(`[error] ${err.message}`);
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log('\n📋 Testing Stub Calls\n' + '═'.repeat(60) + '\n');

  // Test 1: Click hoje tab and check if stubs are called
  console.log('1️⃣  Clicking "hoje" tab...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-tab="hoje"]');
    if (btn) {
      console.log('[TEST] Clicking hoje tab');
      btn.click();
    }
  });
  await page.waitForTimeout(1500);

  // Check if buildWellnessScore was called by checking the element
  const wellnessContent = await page.evaluate(() => {
    const el = document.getElementById('wellnessScore');
    if (!el) return 'ELEMENT NOT FOUND';
    return {
      html: el.innerHTML,
      text: el.textContent,
      children: el.children.length,
      hasDev: el.innerHTML.includes('desenvolvimento')
    };
  });

  console.log('\n2️⃣  Wellness Score Element Content:');
  if (wellnessContent === 'ELEMENT NOT FOUND') {
    console.log(`  ERROR: Element not found in DOM!`);
  } else {
    console.log(`  HTML: ${wellnessContent.html.substring(0, 100)}...`);
    console.log(`  Text: ${wellnessContent.text}`);
    console.log(`  Children: ${wellnessContent.children}`);
    console.log(`  Has "desenvolvimento": ${wellnessContent.hasDev}`);
  }

  // Test 2: Manually call buildWellnessScore
  console.log('\n3️⃣  Manually calling window.buildWellnessScore()...');
  const manualResult = await page.evaluate(() => {
    if (typeof window.buildWellnessScore !== 'function') {
      return 'Function NOT FOUND';
    }
    try {
      window.buildWellnessScore();
      const el = document.getElementById('wellnessScore');
      return {
        success: true,
        html: el.innerHTML,
        hasDev: el.innerHTML.includes('desenvolvimento')
      };
    } catch (e) {
      return {
        error: e.message
      };
    }
  });

  console.log(`  Result: `, JSON.stringify(manualResult, null, 2));

  // Test 3: Check if function exists
  const funcStatus = await page.evaluate(() => {
    return {
      buildWellnessScore: typeof window.buildWellnessScore,
      buildTornadoSensitivity: typeof window.buildTornadoSensitivity,
      buildIpcaDcaSemaforo: typeof window.buildIpcaDcaSemaforo,
      _buildPlaceholder: typeof window._buildPlaceholder
    };
  });

  console.log('\n4️⃣  Function Availability:');
  for (const [name, type] of Object.entries(funcStatus)) {
    console.log(`  ${name}: ${type}`);
  }

  console.log('\n5️⃣  Console/Error Logs:');
  logs.slice(-20).forEach(log => console.log(`  ${log}`));

  console.log('\n');
  await browser.close();
  server.close();
  process.exit(0);
});
