#!/usr/bin/env node
/**
 * DEBUG_TAB_INITIALIZATION
 *
 * Deep dive into tab switching and component rendering flow
 * Checks if build functions are being called and what errors occur
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9879;
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
  console.log(`\n🔍 DEBUG: TAB INITIALIZATION & RENDERING\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => {
    logs.push({ level: msg.type(), text: msg.text() });
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log(`\n📊 TEST 1: Check window object on page load\n`);
  const windowState = await page.evaluate(() => {
    return {
      dataLoaded: !!window.DATA,
      initFunctionExists: typeof window.init === 'function',
      switchTabExists: typeof window.switchTab === 'function',
      buildFunctionsCount: Object.keys(window).filter(k => k.startsWith('build')).length,
      buildFunctions: Object.keys(window).filter(k => k.startsWith('build')).slice(0, 10)
    };
  });
  console.log(JSON.stringify(windowState, null, 2));

  // Test tab switching
  console.log(`\n📊 TEST 2: Switch to "carteira" tab and check state\n`);

  const carteiraBefore = await page.evaluate(() => {
    return {
      geoDonut: {
        exists: !!document.getElementById('geoDonut'),
        canvas: !!document.getElementById('geoDonut')?.querySelector('canvas'),
        textContent: document.getElementById('geoDonut')?.textContent?.slice(0, 100) || ''
      },
      minilogBody: {
        exists: !!document.getElementById('minilogBody'),
        rows: document.querySelectorAll('#minilogBody table tbody tr').length,
        textContent: document.getElementById('minilogBody')?.textContent?.slice(0, 100) || ''
      }
    };
  });

  console.log('BEFORE tab switch:');
  console.log(JSON.stringify(carteiraBefore, null, 2));

  // Clear logs before tab switch
  logs.length = 0;

  // Switch tab
  await page.evaluate(() => {
    window.switchTab('carteira');
  });
  await page.waitForTimeout(3000);

  const carteiraAfter = await page.evaluate(() => {
    return {
      geoDonut: {
        exists: !!document.getElementById('geoDonut'),
        canvas: !!document.getElementById('geoDonut')?.querySelector('canvas'),
        hasContent: (document.getElementById('geoDonut')?.textContent?.length || 0) > 20,
        children: document.getElementById('geoDonut')?.children.length || 0,
        display: window.getComputedStyle(document.getElementById('geoDonut')).display,
        visibility: window.getComputedStyle(document.getElementById('geoDonut')).visibility
      },
      minilogBody: {
        exists: !!document.getElementById('minilogBody'),
        rows: document.querySelectorAll('#minilogBody table tbody tr').length,
        hasContent: (document.getElementById('minilogBody')?.textContent?.length || 0) > 20,
        children: document.getElementById('minilogBody')?.children.length || 0,
        display: window.getComputedStyle(document.getElementById('minilogBody')).display,
        visibility: window.getComputedStyle(document.getElementById('minilogBody')).visibility
      }
    };
  });

  console.log('\nAFTER tab switch to carteira:');
  console.log(JSON.stringify(carteiraAfter, null, 2));

  // Check if build functions were called
  console.log(`\n📊 TEST 3: Manually call buildGeoDonut and buildMinilog\n`);

  const manualCall = await page.evaluate(async () => {
    const results = [];

    // Try buildGeoDonut
    try {
      if (window.buildGeoDonut) {
        window.buildGeoDonut();
        await new Promise(r => setTimeout(r, 500));
        results.push({
          function: 'buildGeoDonut',
          called: true,
          result: 'OK',
          geoDonutCanvas: !!document.getElementById('geoDonut')?.querySelector('canvas'),
          geoDonutContent: (document.getElementById('geoDonut')?.textContent?.length || 0) > 20
        });
      } else {
        results.push({ function: 'buildGeoDonut', called: false, result: 'FUNCTION NOT FOUND' });
      }
    } catch (e) {
      results.push({ function: 'buildGeoDonut', called: true, result: 'ERROR', error: e.message });
    }

    // Try buildMinilog
    try {
      if (window.buildMinilog) {
        window.buildMinilog();
        await new Promise(r => setTimeout(r, 500));
        results.push({
          function: 'buildMinilog',
          called: true,
          result: 'OK',
          minilogRows: document.querySelectorAll('#minilogBody table tbody tr').length,
          minilogContent: (document.getElementById('minilogBody')?.textContent?.length || 0) > 20
        });
      } else {
        results.push({ function: 'buildMinilog', called: false, result: 'FUNCTION NOT FOUND' });
      }
    } catch (e) {
      results.push({ function: 'buildMinilog', called: true, result: 'ERROR', error: e.message });
    }

    return results;
  });

  console.log(JSON.stringify(manualCall, null, 2));

  // Check tab initialization state
  console.log(`\n📊 TEST 4: Check _tabInitialized state\n`);

  const tabState = await page.evaluate(() => {
    return {
      _tabInitializedExists: typeof window._tabInitialized !== 'undefined',
      _tabInitialized: window._tabInitialized || {},
      _getTabInitStatus: {
        hoje: window._tabInitialized?.hoje || false,
        carteira: window._tabInitialized?.carteira || false,
        perf: window._tabInitialized?.perf || false,
        fire: window._tabInitialized?.fire || false
      }
    };
  });

  console.log(JSON.stringify(tabState, null, 2));

  // Check if charts exist in window
  console.log(`\n📊 TEST 5: Check chart instances in window\n`);

  const chartInstances = await page.evaluate(() => {
    const charts = {};
    for (const [key, value] of Object.entries(window)) {
      if (value && value.canvas && value.canvas instanceof HTMLCanvasElement) {
        charts[key] = {
          type: value.constructor?.name || 'unknown',
          hasData: !!value.data,
          plugins: value.config?.plugins ? Object.keys(value.config.plugins).length : 0
        };
      }
    }
    return charts;
  });

  console.log(JSON.stringify(chartInstances, null, 2));

  // Log summary
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`\n📋 CONSOLE LOGS (last 20):\n`);
  logs.slice(-20).forEach(log => {
    console.log(`  [${log.level}] ${log.text}`);
  });

  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):\n`);
    errors.forEach(err => {
      console.log(`  ${err.slice(0, 150)}`);
    });
  }

  await browser.close();
  server.close();
  process.exit(0);
});
