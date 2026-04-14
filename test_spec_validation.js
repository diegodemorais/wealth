#!/usr/bin/env node
/**
 * TEST_SPEC_VALIDATION
 *
 * Validates all 66 components from spec.json against actual dashboard HTML
 * Reports: component presence, render status, visibility, and structure type
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load spec.json
const specPath = path.join(__dirname, 'dashboard', 'spec.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
const allComponents = spec.blocks;

const PORT = 9877;
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
  console.log(`\n📋 SPEC VALIDATION — Testing all 66 components\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const results = [];
  const tabMap = {};

  // Group components by tab
  for (const component of allComponents) {
    const tab = component.tab;
    if (!tabMap[tab]) tabMap[tab] = [];
    tabMap[tab].push(component);
  }

  // Test each tab's components
  const uniqueTabs = Object.keys(tabMap);

  for (const tab of uniqueTabs) {
    console.log(`\n📑 TAB: ${tab.toUpperCase()}`);
    console.log('─'.repeat(80));

    // Switch to tab (map spec tab names to HTML tab names)
    const tabName = tab === 'now' ? 'hoje' : tab === 'portfolio' ? 'carteira' : tab === 'performance' ? 'perf' : tab;

    try {
      await page.evaluate(t => {
        if (window.switchTab) window.switchTab(t);
      }, tabName);
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log(`  ⚠️  Tab switch failed: ${tabName}`);
    }

    // Test each component in this tab
    for (const component of tabMap[tab]) {
      const status = await page.evaluate((componentId) => {
        const el = document.getElementById(componentId);

        if (!el) {
          return {
            found: false,
            id: componentId,
            visible: false,
            rendered: false,
            type: null,
            structure: null
          };
        }

        // Detect structure type
        const isCanvas = el.tagName === 'CANVAS';
        const hasCanvas = !!el.querySelector('canvas');
        const hasTable = !!el.querySelector('table');
        const hasSvg = !!el.querySelector('svg');
        const hasInput = !!el.querySelector('input');
        const hasSelect = !!el.querySelector('select');
        const hasContent = el.textContent.trim().length > 20;
        const hasChildren = el.children.length > 0;

        const isVisible = window.getComputedStyle(el).display !== 'none' &&
                         window.getComputedStyle(el).visibility !== 'hidden';

        let structureType = 'unknown';
        if (isCanvas) structureType = 'canvas-element';
        else if (hasCanvas) structureType = 'canvas-child';
        else if (hasTable) structureType = 'table';
        else if (hasSvg) structureType = 'svg';
        else if (hasInput || hasSelect) structureType = 'interactive';
        else if (hasContent || hasChildren) structureType = 'html-content';
        else structureType = 'empty';

        const isRendered = !!hasCanvas || !!hasTable || !!hasSvg || !!hasInput || hasContent || (hasChildren && structureType !== 'empty');

        return {
          found: true,
          id: componentId,
          visible: isVisible,
          rendered: isRendered,
          structure: structureType,
          hasContent,
          hasChildren: el.children.length
        };
      }, component.id);

      // Format result
      let statusIcon = '❌';
      let statusText = 'MISSING';

      if (!status.found) {
        statusIcon = '❌';
        statusText = 'NOT FOUND';
      } else if (!status.visible) {
        statusIcon = '🙈';
        statusText = 'HIDDEN';
      } else if (status.rendered) {
        statusIcon = '✅';
        statusText = `OK (${status.structure})`;
      } else {
        statusIcon = '⚠️';
        statusText = 'EMPTY';
      }

      console.log(`  ${statusIcon} ${component.id.padEnd(30)} [${component.type.padEnd(15)}] ${statusText}`);

      results.push({
        tab: component.tab,
        htmlTab: tabName,
        id: component.id,
        label: component.label,
        type: component.type,
        found: status.found,
        visible: status.found ? status.visible : false,
        rendered: status.found ? status.rendered : false,
        structure: status.found ? status.structure : 'N/A',
        status: statusIcon === '✅' ? 'PASS' : statusIcon === '🙈' ? 'HIDDEN' : statusIcon === '⚠️' ? 'EMPTY' : 'FAIL'
      });
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const hidden = results.filter(r => r.status === 'HIDDEN').length;
  const empty = results.filter(r => r.status === 'EMPTY').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`\n📊 SUMMARY`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`  ✅ PASS:   ${passed}/${allComponents.length}`);
  console.log(`  🙈 HIDDEN: ${hidden}/${allComponents.length}`);
  console.log(`  ⚠️  EMPTY:  ${empty}/${allComponents.length}`);
  console.log(`  ❌ FAIL:   ${failed}/${allComponents.length}\n`);

  // Detailed breakdown by tab
  console.log(`📑 BREAKDOWN BY TAB`);
  console.log(`${'─'.repeat(80)}`);

  const resultsByTab = {};
  results.forEach(r => {
    if (!resultsByTab[r.tab]) {
      resultsByTab[r.tab] = { total: 0, pass: 0, hidden: 0, empty: 0, fail: 0 };
    }
    resultsByTab[r.tab].total++;
    if (r.status === 'PASS') resultsByTab[r.tab].pass++;
    else if (r.status === 'HIDDEN') resultsByTab[r.tab].hidden++;
    else if (r.status === 'EMPTY') resultsByTab[r.tab].empty++;
    else if (r.status === 'FAIL') resultsByTab[r.tab].fail++;
  });

  for (const [tab, counts] of Object.entries(resultsByTab)) {
    const pct = Math.round((counts.pass / counts.total) * 100);
    console.log(`  ${tab.padEnd(15)} ${counts.pass}/${counts.total} (${pct}%) — ${counts.hidden} hidden, ${counts.empty} empty, ${counts.fail} missing`);
  }

  // Write JSON results
  const outputPath = path.join(__dirname, 'dashboard', 'tests', 'spec_validation_results.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total: allComponents.length, passed, hidden, empty, failed },
    resultsByTab,
    components: results
  }, null, 2));

  console.log(`\n✅ Results written to dashboard/tests/spec_validation_results.json\n`);

  await browser.close();
  server.close();
  process.exit(passed === allComponents.length ? 0 : 1);
});
