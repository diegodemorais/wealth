#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const COMPONENTS = [
  // now tab
  { id: 'semaforoBody', tab: 'hoje', label: 'Semáforo de Gatilhos' },
  { id: 'macroSection', tab: 'hoje', label: 'Macro Status' },
  
  // portfolio tab
  { id: 'geoDonut', tab: 'carteira', label: 'Geo Donut' },
  { id: 'stackedAllocSection', tab: 'carteira', label: 'Stacked Alloc' },
  { id: 'posBody', tab: 'carteira', label: 'Posições' },
  { id: 'custoBaseTable', tab: 'carteira', label: 'Custo Base' },
  { id: 'taxIrBody', tab: 'carteira', label: 'IR Diferido' },
  { id: 'bondPoolBody', tab: 'carteira', label: 'RF Cards' },
  { id: 'minilogBody', tab: 'carteira', label: 'Últimas Operações' },
  { id: 'etfCompSection', tab: 'carteira', label: 'ETF Composição' },
  { id: 'factorLoadingsChart', tab: 'carteira', label: 'Factor Loadings' },
  
  // performance tab
  { id: 'timelineChart', tab: 'perf', label: 'Timeline (Evolução)' },
  { id: 'attrChart', tab: 'perf', label: 'Attribution' },
  { id: 'deltaChart', tab: 'perf', label: 'Delta Bar' },
  { id: 'heatmapContainer', tab: 'perf', label: 'Retorno Heatmap' },
  { id: 'rollingSharpChart', tab: 'perf', label: 'Rolling Sharpe' },
  { id: 'rollingIRChart', tab: 'perf', label: 'Information Ratio' },
  { id: 'backtestChart', tab: 'perf', label: 'Backtest' },
  { id: 'drawdownHistChart', tab: 'perf', label: 'Drawdown Histórico' },
  { id: 'backtestR7Chart', tab: 'perf', label: 'Backtest R7' },
  { id: 'shadowChart', tab: 'perf', label: 'Shadow Chart' },
  { id: 'feeTable', tab: 'perf', label: 'Fee Analysis' },
  { id: 'premissasVsRealizadoBody', tab: 'perf', label: 'Premissas vs Realizado' },
  { id: 'factorRollingBody', tab: 'perf', label: 'Factor Rolling' },
  
  // fire tab
  { id: 'trackingFireChart', tab: 'fire', label: 'Tracking FIRE' },
  { id: 'scenarioChart', tab: 'fire', label: 'Scenario Comparison' },
  { id: 'fireMatrixTable', tab: 'fire', label: 'FIRE Matrix' },
  { id: 'glideChart', tab: 'fire', label: 'Glide Path' },
  { id: 'netWorthProjectionChart', tab: 'fire', label: 'Net Worth Projection' },
  { id: 'lumpyEventsBody', tab: 'fire', label: 'Lumpy Events' },
  { id: 'eventosVidaBody', tab: 'fire', label: 'Eventos Vida' },
  { id: 'pfireFamiliaBody', tab: 'fire', label: 'P(FIRE) Família' },
  
  // retiro tab
  { id: 'guardrailsBody', tab: 'retiro', label: 'Guardrails' },
  { id: 'incomeChart', tab: 'retiro', label: 'Income Chart' },
  { id: 'incomeTableBody', tab: 'retiro', label: 'Income Table' },
  { id: 'spendingChart', tab: 'retiro', label: 'Spending Guardrails' },
  { id: 'swrPercentilesSection', tab: 'retiro', label: 'SWR Percentiles' },
  { id: 'spendingBreakdownBody', tab: 'retiro', label: 'Spending Breakdown' },
  { id: 'incomeProjectionChart', tab: 'retiro', label: 'Income Projection' },
  { id: 'bondPoolRunwayChart', tab: 'retiro', label: 'Bond Pool Runway' },
  { id: 'sankeyChart', tab: 'retiro', label: 'Sankey Cashflow' },
  
  // simuladores tab
  { id: 'stressProjectionChart', tab: 'simuladores', label: 'Stress Test' },
  { id: 'calcAporte', tab: 'simuladores', label: 'Calculadora Aporte' },
  { id: 'aporteSensChart', tab: 'simuladores', label: 'Aporte Sens' },
  
  // backtest tab
  { id: 'backtestMetricsTable', tab: 'backtest', label: 'Backtest Métricas' },
  { id: 'shadowTableBody', tab: 'backtest', label: 'Shadow Portfolios' },
  { id: 'backtestR7Chart', tab: 'backtest', label: 'Backtest R7' },
  { id: 'drawdownHistChart', tab: 'backtest', label: 'Drawdown Histórico' },
];

const PORT = 9876;
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
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.css': 'text/css' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, async () => {
  console.log(`\n🧪 Testando ${COMPONENTS.length} componentes via browser...\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const results = {};
  const tabOrder = ['hoje', 'carteira', 'perf', 'fire', 'retiro', 'simuladores', 'backtest'];
  let currentTab = 'hoje';

  for (const comp of COMPONENTS) {
    // Switch tab if needed
    if (currentTab !== comp.tab) {
      currentTab = comp.tab;
      await page.evaluate(t => window.switchTab?.(t), comp.tab);
      await page.waitForTimeout(1500);
    }

    // Test component
    const status = await page.evaluate(id => {
      const el = document.getElementById(id);
      if (!el) return { found: false };
      
      const isCanvas = el.tagName === 'CANVAS';
      const canvas = isCanvas ? el : el.querySelector('canvas');
      const table = isCanvas ? null : el.querySelector('table');
      const svg = isCanvas ? null : el.querySelector('svg');
      const hasContent = el.textContent?.trim?.().length > 20 || el.children?.length > 0;
      const isVisible = window.getComputedStyle(el).display !== 'none' && 
                        window.getComputedStyle(el).visibility !== 'hidden';
      const isRendered = !!canvas || !!table || !!svg || hasContent;
      
      return {
        found: true,
        visible: isVisible,
        rendered: isRendered,
        hasCanvas: !!canvas,
        hasTable: !!table,
        hasSvg: !!svg,
        hasContent: hasContent,
      };
    }, comp.id);

    results[comp.id] = {
      tab: comp.tab,
      label: comp.label,
      status,
    };
  }

  await browser.close();
  server.close();

  // Print summary
  const rendered = Object.values(results).filter(r => r.status.found && r.status.visible && r.status.rendered).length;
  const notFound = Object.values(results).filter(r => !r.status.found).length;
  const empty = Object.values(results).filter(r => r.status.found && r.status.visible && !r.status.rendered).length;

  console.log(`📊 SUMÁRIO:`);
  console.log(`  ✅ Renderizados: ${rendered}/${COMPONENTS.length}`);
  console.log(`  ❌ Não encontrados: ${notFound}`);
  console.log(`  ⚠️  Vazios: ${empty}\n`);

  // By tab
  const byTab = {};
  for (const [id, data] of Object.entries(results)) {
    if (!byTab[data.tab]) byTab[data.tab] = [];
    byTab[data.tab].push({ id, ...data });
  }

  console.log('📋 DETALHES:\n');
  for (const tab of tabOrder) {
    if (!byTab[tab]) continue;
    const items = byTab[tab];
    const passing = items.filter(i => i.status.found && i.status.visible && i.status.rendered).length;
    console.log(`▌ ${tab.toUpperCase()} (${passing}/${items.length})`);
    
    for (const item of items) {
      if (!item.status.found) {
        console.log(`  ❌ ${item.label}`);
      } else if (!item.status.visible) {
        console.log(`  ⚠️  ${item.label} (hidden)`);
      } else if (!item.status.rendered) {
        console.log(`  ⚠️  ${item.label} (empty)`);
      } else {
        const types = [];
        if (item.status.hasCanvas) types.push('🎨canvas');
        if (item.status.hasTable) types.push('📊table');
        if (item.status.hasSvg) types.push('📐svg');
        if (item.status.hasContent) types.push('📄content');
        console.log(`  ✅ ${item.label} [${types.join(' ')}]`);
      }
    }
    console.log('');
  }

  // Save results
  fs.writeFileSync('test_results_components.json', JSON.stringify(results, null, 2));
  console.log('📁 Resultados salvos em test_results_components.json\n');
  
  process.exit(rendered === COMPONENTS.length ? 0 : 1);
});
