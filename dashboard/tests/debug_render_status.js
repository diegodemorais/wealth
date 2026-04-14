#!/usr/bin/env node
/**
 * debug_render_status.js — Clean render status (ignores network errors)
 *
 * Checks actual component rendering without network noise.
 * A component is "rendered" if it has content OR has canvas/table structure.
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9881;
const DASHBOARD_DIR = path.join(__dirname, '..');  // Go to dashboard directory
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'spec_html_mapping.json'), 'utf-8'));

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

  // Suppress network errors from console
  page.on('console', msg => {});
  page.on('pageerror', err => {});

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);  // Wait for tab initialization + RAF callbacks

  // Initialize ALL tabs before checking render status (lazy loading)
  const tabs = ['hoje', 'perf', 'backtest', 'carteira', 'fire', 'retiro', 'simuladores'];
  for (const tab of tabs) {
    await page.evaluate((tabName) => {
      const btn = document.querySelector(`[data-tab="${tabName}"]`);
      if (btn) btn.click();
    }, tab);
    await page.waitForTimeout(1000);  // Wait for tab to initialize
  }

  // Return to hoje tab for consistency
  await page.evaluate(() => {
    const btn = document.querySelector('[data-tab="hoje"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1000);

  const results = [];
  let rendered = 0, empty = 0;

  for (const item of SPEC.mapping) {
    const specId = item.specId;
    const htmlId = item.htmlId;

    const analysis = await page.evaluate(({ htmlId, specId }) => {
      const el = document.getElementById(htmlId);
      if (!el) return { found: false };

      const textLen = el.textContent?.trim()?.length || 0;
      const children = el.children?.length || 0;
      const canvasLen = el.querySelectorAll('canvas').length;
      const tableLen = el.querySelectorAll('tr').length;
      const svgLen = el.querySelectorAll('svg').length;

      const hasContent = textLen > 0 || children > 0 || canvasLen > 0 || tableLen > 0 || svgLen > 0;

      return {
        found: true,
        visible: el.offsetParent !== null,
        textLen,
        children,
        hasContent,
        canvasLen,
        tableLen,
        svgLen,
      };
    }, { htmlId, specId });

    if (analysis.found && analysis.visible && analysis.hasContent) {
      results.push({ specId, status: 'RENDERED', ...analysis });
      rendered++;
    } else {
      results.push({ specId, status: 'EMPTY', ...analysis });
      empty++;
    }
  }

  console.log(`\n📊 COMPONENT RENDER STATUS\n${'═'.repeat(60)}\n`);
  console.log(`✅ RENDERED: ${rendered}/${SPEC.mapping.length}`);
  console.log(`❌ EMPTY: ${empty}/${SPEC.mapping.length}\n`);

  const emptyComps = results.filter(r => r.status === 'EMPTY');
  console.log(`EMPTY COMPONENTS:\n`);
  for (const comp of emptyComps) {
    const details = comp.found
      ? `text=${comp.textLen} children=${comp.children} canvas=${comp.canvasLen} table=${comp.tableLen}`
      : 'not found';
    console.log(`  • ${comp.specId.padEnd(30)} ${details}`);
  }

  const outputPath = path.join(__dirname, 'render_status.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { rendered, empty, total: SPEC.mapping.length },
    results
  }, null, 2));

  console.log(`\n✅ Results: ${outputPath}\n`);
  await browser.close();
  server.close();
  process.exit(0);
});
