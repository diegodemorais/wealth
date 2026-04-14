#!/usr/bin/env node
/**
 * DEBUG_CHARTS_POPULATION
 *
 * Check if charts object is being populated when functions are called
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9880;
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
  console.log(`\n🔍 DEBUG: CHARTS POPULATION\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check initial state
  console.log(`\n📊 INITIAL STATE (page load)\n`);
  let state = await page.evaluate(() => {
    return {
      chartsExists: !!window.charts,
      chartsIsObject: typeof window.charts === 'object',
      chartsKeys: Object.keys(window.charts || {}),
      chartsCount: Object.keys(window.charts || {}).length,
      buildDonuts: typeof window.buildDonuts,
      buildMinilog: typeof window.buildMinilog,
      buildStackedAlloc: typeof window.buildStackedAlloc
    };
  });
  console.log(JSON.stringify(state, null, 2));

  // Inject logging
  await page.evaluate(() => {
    const originalChartClass = window.Chart;
    window.Chart = function(...args) {
      const instance = new originalChartClass(...args);
      console.log(`[CHART] Created chart with canvas id: ${args[0]?.id || 'unknown'}`);
      return instance;
    };
    Object.setPrototypeOf(window.Chart, originalChartClass);
    Object.assign(window.Chart, originalChartClass);

    window._logCharts = () => {
      const keys = Object.keys(window.charts);
      console.log(`[CHARTS] ${keys.length} charts in window.charts: ${keys.join(', ')}`);
    };
  });

  console.log(`\n📊 BEFORE switchTab('carteira')\n`);
  state = await page.evaluate(() => {
    window._logCharts();
    return Object.keys(window.charts || {});
  });
  console.log(`  Charts count: ${state.length}`);
  console.log(`  Charts: ${state.join(', ')}`);

  // Switch tab
  console.log(`\n📊 Calling switchTab('carteira')...\n`);
  const switchResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      window.switchTab('carteira');
      // Wait a bit for RAF callbacks to execute
      setTimeout(() => {
        window._logCharts();
        resolve({
          chartsBefore: Object.keys(window.charts).length,
          geoDonutElement: !!document.getElementById('geoDonut'),
          minilogElement: !!document.getElementById('minilogBody'),
          geoDonutHasCanvas: !!document.getElementById('geoDonut')?.querySelector('canvas'),
          minilogHasContent: (document.getElementById('minilogBody')?.textContent || '').length > 20,
          geoDonutCanvasId: document.getElementById('geoDonut')?.querySelector('canvas')?.id || null,
          chartsNow: Object.keys(window.charts)
        });
      }, 2000);
    });
  });

  console.log(JSON.stringify(switchResult, null, 2));

  // Try to manually call buildDonuts
  console.log(`\n📊 Manually calling buildDonuts()...\n`);

  const buildResult = await page.evaluate(async () => {
    try {
      // Log before
      console.log(`[MANUAL] Before buildDonuts: ${Object.keys(window.charts).join(', ')}`);

      // Call it
      window.buildDonuts();

      // Wait a bit
      await new Promise(r => setTimeout(r, 500));

      // Log after
      const keysAfter = Object.keys(window.charts);
      console.log(`[MANUAL] After buildDonuts: ${keysAfter.join(', ')}`);

      return {
        chartsCount: keysAfter.length,
        chartsKeys: keysAfter,
        geoFound: 'geo' in window.charts,
        geoHasCanvas: window.charts.geo?.canvas instanceof HTMLCanvasElement,
        geoCanvasId: window.charts.geo?.canvas?.id || null,
        geoDonutElement: {
          exists: !!document.getElementById('geoDonut'),
          hasCanvas: !!document.getElementById('geoDonut')?.querySelector('canvas'),
          htmlContent: (document.getElementById('geoDonut')?.innerHTML || '').slice(0, 100)
        }
      };
    } catch (e) {
      return { error: e.toString(), stack: e.stack };
    }
  });

  console.log(JSON.stringify(buildResult, null, 2));

  // Check all buildXXX functions exist
  console.log(`\n📊 Verify all carteira build functions exist\n`);

  const carteiraBuildFunctions = [
    'buildDonuts',
    'buildStackedAlloc',
    'buildPosicoes',
    'buildCustoBase',
    'buildIrDiferido',
    'buildRfCards',
    'renderHodl11',
    'calcAporte',
    'buildEtfComposition',
    'buildMinilog'
  ];

  const funcStatus = await page.evaluate((fns) => {
    return fns.map(fn => ({
      name: fn,
      exists: typeof window[fn] === 'function',
      type: typeof window[fn]
    }));
  }, carteiraBuildFunctions);

  funcStatus.forEach(f => {
    const icon = f.exists ? '✅' : '❌';
    console.log(`  ${icon} ${f.name.padEnd(25)} ${f.type}`);
  });

  await browser.close();
  server.close();
  process.exit(0);
});
