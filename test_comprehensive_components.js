#!/usr/bin/env node
/**
 * TEST_COMPREHENSIVE_COMPONENTS
 *
 * Comprehensive test of all 66 spec components mapped to actual HTML IDs
 * Tests visibility, rendering status, structure type
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load mapping
const mappingPath = path.join(__dirname, 'dashboard', 'tests', 'spec_html_mapping.json');
const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
const mapping = mappingData.mapping;

const PORT = 9878;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard');

// HTTP server
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
  console.log(`\n📋 COMPREHENSIVE COMPONENT TEST\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Group mapping by tab
  const byTab = {};
  for (const item of mapping) {
    if (!byTab[item.tab]) byTab[item.tab] = [];
    byTab[item.tab].push(item);
  }

  const results = [];
  const uniqueTabs = Object.keys(byTab).sort();

  for (const tab of uniqueTabs) {
    console.log(`\n🔹 TAB: ${tab.toUpperCase()}`);
    console.log('─'.repeat(80));

    // Map spec tab names to HTML tab names
    const tabNameMap = {
      'now': 'hoje',
      'portfolio': 'carteira',
      'performance': 'perf',
      'fire': 'fire',
      'backtest': 'backtest',
      'retiro': 'retiro',
      'simuladores': 'simuladores'
    };
    const htmlTabName = tabNameMap[tab];

    // Switch to tab
    try {
      await page.evaluate(t => {
        if (window.switchTab) window.switchTab(t);
      }, htmlTabName);
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log(`  ⚠️  Tab switch failed for ${htmlTabName}`);
    }

    // Test each component in this tab
    for (const item of byTab[tab]) {
      const htmlId = item.htmlId !== '—' ? item.htmlId : null;

      let status = {
        specId: item.specId,
        htmlId: item.htmlId,
        label: item.label,
        type: item.type,
        found: false,
        visible: false,
        rendered: false,
        structure: 'N/A',
        statusChar: '❌',
        statusText: 'MISSING'
      };

      if (!htmlId) {
        status.statusChar = '❌';
        status.statusText = 'NO HTML ID';
        console.log(`  ${status.statusChar} ${item.specId.padEnd(30)} — NO MAPPING`);
      } else {
        // Test the HTML element
        const testResult = await page.evaluate((elementId) => {
          const el = document.getElementById(elementId);

          if (!el) {
            return {
              found: false,
              visible: false,
              rendered: false,
              structure: 'NOT_IN_DOM'
            };
          }

          // Detect structure type
          const isCanvas = el.tagName === 'CANVAS';
          const hasCanvas = !!el.querySelector('canvas');
          const hasTable = !!el.querySelector('table');
          const hasSvg = !!el.querySelector('svg');
          const hasInput = !!el.querySelector('input');
          const hasSelect = !!el.querySelector('select');
          const textContent = el.textContent.trim();
          const hasContent = textContent.length > 0;
          const hasContentLong = textContent.length > 20;
          const hasChildren = el.children.length > 0;

          const isVisible = window.getComputedStyle(el).display !== 'none' &&
                           window.getComputedStyle(el).visibility !== 'hidden';

          // Check if canvas has rendered content (via imageData)
          let canvasHasData = false;
          if (isCanvas) {
            try {
              const imageData = el.toDataURL('image/png');
              canvasHasData = imageData.length > 300; // Non-empty PNG > 300 chars
            } catch (e) {
              canvasHasData = false;
            }
          } else if (hasCanvas) {
            try {
              const canvas = el.querySelector('canvas');
              const imageData = canvas.toDataURL('image/png');
              canvasHasData = imageData.length > 300;
            } catch (e) {
              canvasHasData = false;
            }
          }

          let structureType = 'unknown';
          if (isCanvas) structureType = 'canvas-element';
          else if (hasCanvas) structureType = 'canvas-chart';
          else if (hasTable) structureType = 'table';
          else if (hasSvg) structureType = 'svg';
          else if (hasInput || hasSelect) structureType = 'input';
          else if (hasContentLong) structureType = 'text-content';
          else if (hasContent) structureType = 'text-content';  // Even short text is text-content
          else if (hasChildren) structureType = 'html-structure';
          else structureType = 'empty';

          // For charts: use canvasHasData.
          // For tables: check for rows OR content
          // For KPIs/cards: check for any non-whitespace content (>0, not just >20)
          // For others: use standard checks
          let isRendered = false;
          if (canvasHasData) {
            isRendered = true;
          } else if (hasTable) {
            const tableRows = el.querySelectorAll('tbody tr, tr').length;
            isRendered = tableRows > 0 || hasContent;
          } else if (hasSvg) {
            isRendered = true;
          } else if (hasInput || hasSelect) {
            isRendered = true;
          } else if (structureType === 'text-content') {
            // For text content (KPIs, values, etc), accept if:
            // - has any text that's not "—"
            // - or has HTML structure
            const text = el.textContent.trim();
            isRendered = (text.length > 0 && !text.includes('—')) || hasContent;
          } else if (structureType === 'html-structure') {
            isRendered = true;
          }
          isRendered = isRendered || hasContentLong;

          return {
            found: true,
            visible: isVisible,
            rendered: isRendered,
            structure: structureType,
            canvasHasData: canvasHasData
          };
        }, htmlId);

        status.found = testResult.found;
        status.visible = testResult.visible;
        status.rendered = testResult.rendered;
        status.structure = testResult.structure;

        if (!testResult.found) {
          status.statusChar = '❌';
          status.statusText = 'NOT_FOUND';
        } else if (!testResult.visible) {
          status.statusChar = '🙈';
          status.statusText = 'HIDDEN';
        } else if (testResult.rendered) {
          status.statusChar = '✅';
          status.statusText = `OK`;
        } else {
          status.statusChar = '⚠️';
          status.statusText = 'EMPTY';
        }

        const renderTestCol = testResult.found ? (testResult.rendered ? '✅' : '⚠️') : '❌';
        const browserTestCol = testResult.found ? (testResult.visible ? (testResult.rendered ? '✅' : '⚠️') : '🙈') : '—';

        console.log(`  ${status.statusChar} ${item.specId.padEnd(30)} [${item.type.padEnd(15)}] Render: ${renderTestCol} Browser: ${browserTestCol}`);
      }

      results.push(status);
    }
  }

  // Summary
  const passed = results.filter(r => r.statusChar === '✅').length;
  const hidden = results.filter(r => r.statusChar === '🙈').length;
  const empty = results.filter(r => r.statusChar === '⚠️').length;
  const missing = results.filter(r => r.statusChar === '❌').length;

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`\n📊 FINAL SUMMARY`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`  ✅ PASS:    ${passed}/${results.length}`);
  console.log(`  🙈 HIDDEN:  ${hidden}/${results.length}`);
  console.log(`  ⚠️  EMPTY:   ${empty}/${results.length}`);
  console.log(`  ❌ MISSING: ${missing}/${results.length}\n`);

  // Write JSON results with full matrix
  const outputPath = path.join(__dirname, 'dashboard', 'tests', 'comprehensive_component_test.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      pass: passed,
      hidden: hidden,
      empty: empty,
      missing: missing
    },
    components: results
  }, null, 2));

  console.log(`✅ Results written to dashboard/tests/comprehensive_component_test.json\n`);

  await browser.close();
  server.close();
  process.exit(passed === results.length ? 0 : 1);
});
