#!/usr/bin/env node
/**
 * debug_empty_detailed.js — Detailed inspection of empty components
 *
 * Examines each empty component to determine root cause:
 * - Missing HTML element
 * - Missing data in window.DATA
 * - Builder function not called
 * - JavaScript errors
 * - Builder dependency issues
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9880;
const DASHBOARD_DIR = path.join(__dirname, '..');
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'spec_html_mapping.json'), 'utf-8'));

// Components to debug (from identify_empty_results.json)
const EMPTY_COMPONENTS = [
  "backtest-metricas",
  "earliest-fire",
  "lumpy-events",
  "net-worth-projection",
  "exposicao-cambial",
  "hodl11-status",
  "ipca-dca-semaforo",
  "renda-plus-semaforo",
  "stress-cenarios",
  "alpha-itd-swrd",
  "hodl11-pnl",
  "rolling-sharpe",
  "drift-semaforo-etf",
  "etf-composicao-regiao",
  "minilog",
  "posicoes-etfs-ibkr",
  "rf-posicoes",
  "stacked-alloc",
  "tlh-monitor",
  "spending-breakdown"
];

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
  console.log(`\n🔍 EMPTY COMPONENTS DETAILED DEBUG\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console messages and errors globally
  const allErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      allErrors.push(msg.text());
    }
  });

  // Also capture network/page errors
  page.on('pageerror', err => {
    allErrors.push(err.message);
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Map spec to spec data
  const specMap = {};
  for (const item of SPEC.mapping) {
    specMap[item.specId] = item;
  }

  const results = [];

  for (const specId of EMPTY_COMPONENTS) {
    const specItem = specMap[specId];
    if (!specItem) continue;

    const htmlId = specItem.htmlId !== '—' ? specItem.htmlId : null;
    if (!htmlId) continue;

    // Switch to tab
    const tabNameMap = {
      'now': 'hoje', 'portfolio': 'carteira', 'performance': 'perf',
      'fire': 'fire', 'backtest': 'backtest', 'retiro': 'retiro', 'simuladores': 'simuladores'
    };
    const htmlTabName = tabNameMap[specItem.tab];

    try {
      await page.evaluate(t => window.switchTab && window.switchTab(t), htmlTabName);
      await page.waitForTimeout(2000);
    } catch (e) {}

    // Deep inspection
    const analysis = await page.evaluate(({ htmlId, specId }) => {
      const el = document.getElementById(htmlId);

      return {
        specId,
        htmlId,
        elementFound: !!el,
        elementVisible: el ? window.getComputedStyle(el).display !== 'none' : false,
        offsetParent: el ? (el.offsetParent ? 'visible' : 'hidden (offsetParent is null)') : 'N/A',
        textContent: el ? el.textContent.trim() : 'N/A',
        textLength: el ? el.textContent.trim().length : 0,
        innerHTML: el ? el.innerHTML.trim().substring(0, 100) : 'N/A',
        childCount: el ? el.children.length : 0,
        tagName: el ? el.tagName : 'N/A',
        hasCanvas: el ? !!el.querySelector('canvas') : false,
        hasTable: el ? !!el.querySelector('table') : false,
        hasInput: el ? !!el.querySelector('input, select') : false,
        hasSvg: el ? !!el.querySelector('svg') : false,
        classNames: el ? el.className : 'N/A'
      };
    }, { htmlId, specId });

    // Check for required DATA fields
    const dataCheck = await page.evaluate(({ specId, type }) => {
      // Common data field patterns by component type
      const dataRequirements = {
        'backtest-metricas': ['backtestData', 'backtestMetrics'],
        'earliest-fire': ['montecarlo', 'fireMetrics'],
        'lumpy-events': ['lifeEvents'],
        'net-worth-projection': ['montecarlo', 'patrimonioProjecao'],
        'exposicao-cambial': ['cambio', 'exposicaoCambial'],
        'hodl11-status': ['hodl11', 'cryptoStatus'],
        'ipca-dca-semaforo': ['rendaFixa', 'dcaStatus'],
        'renda-plus-semaforo': ['rendaFixa', 'dcaStatus'],
        'stress-cenarios': ['stressTest', 'cenarioStress'],
        'alpha-itd-swrd': ['performanceAnalysis', 'alphaSwrd'],
        'hodl11-pnl': ['hodl11', 'cryptoPnl'],
        'rolling-sharpe': ['performanceAnalysis', 'rollingMetrics'],
        'drift-semaforo-etf': ['posicoes', 'driftStatus'],
        'etf-composicao-regiao': ['posicoes', 'etfComposicao'],
        'minilog': ['operacoes', 'transacoes'],
        'posicoes-etfs-ibkr': ['posicoes', 'etfsIbkr'],
        'rf-posicoes': ['rendaFixa', 'posicoes'],
        'stacked-alloc': ['carteira', 'alocacao'],
        'tlh-monitor': ['tlh', 'lotes'],
        'spending-breakdown': ['spending', 'gastos']
      };

      const required = dataRequirements[specId] || [];
      const dataKeys = window.DATA ? Object.keys(window.DATA) : [];
      const hasAny = required.length === 0 ? true : required.some(k => dataKeys.includes(k));
      const missing = required.filter(k => !dataKeys.includes(k));

      return {
        dataExists: !!window.DATA,
        dataKeyCount: dataKeys.length,
        requiredFields: required,
        missingFields: missing,
        hasRequiredData: hasAny
      };
    }, { specId, type: specItem.type });

    // Check for JavaScript errors (global, any errors during load)
    const relevantErrors = allErrors.length > 0 ? allErrors.slice(0, 3) : [];  // first 3 errors

    results.push({
      specId,
      tab: specItem.tab,
      type: specItem.type,
      ...analysis,
      dataCheck,
      errors: relevantErrors.length > 0 ? relevantErrors : []
    });
  }

  // Print summary by category
  console.log(`📊 ANALYSIS BY ROOT CAUSE\n`);

  const byRootCause = {};
  for (const result of results) {
    let cause = 'unknown';

    if (!result.elementFound) {
      cause = 'missing-element';
    } else if (!result.elementVisible) {
      cause = 'hidden-element';
    } else if (result.textLength === 0 && result.childCount === 0) {
      cause = 'completely-empty';
    } else if (!result.dataCheck.hasRequiredData) {
      cause = 'missing-data';
    } else if (result.errors.length > 0) {
      cause = 'javascript-error';
    } else if (result.hasCanvas && !result.innerHTML.includes('data:image')) {
      cause = 'canvas-not-rendered';
    } else if (result.hasTable && result.childCount === 0) {
      cause = 'table-not-built';
    } else {
      cause = 'render-logic-issue';
    }

    if (!byRootCause[cause]) byRootCause[cause] = [];
    byRootCause[cause].push(result.specId);
  }

  for (const [cause, components] of Object.entries(byRootCause).sort()) {
    console.log(`\n🔴 ${cause.toUpperCase()} (${components.length})`);
    components.forEach(c => console.log(`   • ${c}`));
  }

  // Detailed view for each
  console.log(`\n${'═'.repeat(80)}\n📋 DETAILED INSPECTION\n`);

  for (const result of results) {
    console.log(`\n${result.specId}`);
    console.log(`   Tab: ${result.tab} | Type: ${result.type}`);
    console.log(`   Element: ${result.elementFound ? '✅' : '❌'} | Visible: ${result.elementVisible ? '✅' : '❌'} (${result.offsetParent})`);
    console.log(`   Content: ${result.textLength} chars text, ${result.childCount} children`);

    if (!result.dataCheck.hasRequiredData) {
      console.log(`   Data: ❌ Missing fields: ${result.dataCheck.missingFields.join(', ')}`);
    } else {
      console.log(`   Data: ✅ Has required fields`);
    }

    if (Array.isArray(result.errors) && result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(' | ')}`);
    }

    if (result.hasCanvas) console.log(`   Has canvas: ${result.hasCanvas}`);
    if (result.hasTable) console.log(`   Has table rows: ${result.childCount}`);
    if (result.hasInput) console.log(`   Has form input`);
  }

  // Summary JSON
  const outputPath = path.join(__dirname, 'debug_empty_detailed.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      byRootCause: Object.fromEntries(
        Object.entries(byRootCause).map(([cause, comps]) => [cause, comps.length])
      )
    },
    results
  }, null, 2));

  console.log(`\n✅ Detailed results written to ${outputPath}\n`);

  await browser.close();
  server.close();
  process.exit(0);
});
