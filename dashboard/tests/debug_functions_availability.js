#!/usr/bin/env node
/**
 * debug_functions_availability.js — Check if builder functions are available
 */

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
  console.log(`\n🔍 CHECKING FUNCTION AVAILABILITY\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', err => {
    errors.push({ message: err.message, stack: err.stack });
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check if window.buildBacktest and other functions are available
  const available = await page.evaluate(() => {
    const funcs = [
      'buildBacktest',
      'buildEarliestFire',
      'buildNetWorthProjection',
      'buildStressTest',
      'buildSemaforoPanel',
      'buildDcaStatus',
      'buildFireMatrix',
      'buildBondPool',
      'buildEtfComposition',
      'buildMinilog',
      'switchTab',
      'init'
    ];

    return funcs.map(name => ({
      name,
      type: typeof window[name],
      available: typeof window[name] === 'function'
    }));
  });

  console.log('Function Availability:');
  console.log('─'.repeat(80));

  let available_count = 0;
  let missing_count = 0;

  for (const fn of available) {
    const status = fn.available ? '✅' : '❌';
    console.log(`  ${status} ${fn.name.padEnd(30)} (${fn.type})`);
    if (fn.available) available_count++;
    else missing_count++;
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`Summary: ${available_count} available, ${missing_count} missing`);

  if (errors.length > 0) {
    console.log('\n❌ JavaScript Errors:');
    errors.forEach(err => console.log(`   ${err.message}`));
  }

  // Print relevant console logs
  const bootstrapLogs = consoleLogs.filter(log => log.text.includes('[BOOTSTRAP]') || log.text.includes('Phase'));
  if (bootstrapLogs.length > 0) {
    console.log('\nBootstrap Logs:');
    bootstrapLogs.forEach(log => {
      const icon = log.type === 'error' ? '❌' : '✓';
      console.log(`  ${icon} ${log.text}`);
    });
  }

  // Write JSON output
  const outputPath = path.join(__dirname, 'debug_functions_availability.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      available: available_count,
      missing: missing_count,
      total: available.length
    },
    functions: available,
    errors: errors.slice(0, 5),
    bootstrapLogs: bootstrapLogs.slice(0, 10)
  }, null, 2));

  console.log(`\n📋 Detailed output: ${outputPath}\n`);

  await browser.close();
  server.close();
  process.exit(0);
});
