#!/usr/bin/env node
/**
 * ANALYZE EMPTY COMPONENTS
 * Check why components are marked as EMPTY
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const results = JSON.parse(fs.readFileSync('dashboard/tests/comprehensive_component_test.json', 'utf-8'));

// Get all EMPTY components
const emptyComponents = results.components.filter(c => c.statusChar === '⚠️');

const PORT = 9877;
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
  console.log(`\n🔍 ANALYZING ${emptyComponents.length} EMPTY COMPONENTS\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const tabNameMap = {
    'now': 'hoje',
    'portfolio': 'carteira',
    'performance': 'perf',
    'fire': 'fire',
    'backtest': 'backtest',
    'retiro': 'retiro',
    'simuladores': 'simuladores'
  };

  // Group by HTML ID to detect collisions
  const byHtmlId = {};
  for (const c of emptyComponents) {
    if (!byHtmlId[c.htmlId]) byHtmlId[c.htmlId] = [];
    byHtmlId[c.htmlId].push(c.specId);
  }

  console.log('📌 COLLISIONS (multiple spec IDs → same HTML ID):\n');
  for (const [htmlId, specIds] of Object.entries(byHtmlId)) {
    if (specIds.length > 1) {
      console.log(`  ${htmlId}:`);
      specIds.forEach(id => console.log(`    - ${id}`));
    }
  }

  console.log(`\n📊 SAMPLE ANALYSIS (first 5 EMPTY):\n`);

  for (let i = 0; i < Math.min(5, emptyComponents.length); i++) {
    const comp = emptyComponents[i];
    console.log(`\n  ${comp.specId} (${comp.htmlId}):`);

    const tabNameMap_inv = Object.fromEntries(Object.entries(tabNameMap).map(([k,v]) => [v,k]));
    const tabSpec = results.components.find(c => c.specId === comp.specId)?.type;

    // Switch to tab if needed
    if (comp.htmlId !== '—') {
      await page.evaluate(t => {
        if (window.switchTab) window.switchTab(t);
      }, tabNameMap[results.components.find(c => c.specId === comp.specId).statusText.toLowerCase()] || 'hoje');
      await page.waitForTimeout(1000);

      const analysis = await page.evaluate((elId) => {
        const el = document.getElementById(elId);
        if (!el) return { error: 'NOT_IN_DOM' };

        return {
          tagName: el.tagName,
          innerHTML_length: el.innerHTML.length,
          textContent_length: el.textContent.trim().length,
          children_count: el.children.length,
          dataAttr: Object.keys(el.dataset).slice(0, 5),
          class: el.className,
          style_display: window.getComputedStyle(el).display,
          innerHTML_preview: el.innerHTML.slice(0, 150)
        };
      }, comp.htmlId);

      if (analysis.error) {
        console.log(`    ❌ NOT FOUND`);
      } else {
        console.log(`    - tagName: ${analysis.tagName}`);
        console.log(`    - innerHTML: ${analysis.innerHTML_length} chars`);
        console.log(`    - textContent: ${analysis.textContent_length} chars`);
        console.log(`    - children: ${analysis.children_count}`);
        console.log(`    - class: ${analysis.class}`);
      }
    }
  }

  await browser.close();
  server.close();
  process.exit(0);
});
