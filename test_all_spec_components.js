#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const spec = JSON.parse(fs.readFileSync('dashboard/spec.json', 'utf8'));

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
  console.log('\n🧪 Testando 66 componentes do schema...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const blocks = spec.blocks || [];
  const tabOrder = ['now', 'portfolio', 'performance', 'fire', 'retiro', 'simuladores', 'backtest'];
  const results = {};
  let currentTab = null;

  for (const block of blocks) {
    const tab = block.tab;
    
    // Switch to tab if needed
    if (currentTab !== tab) {
      currentTab = tab;
      await page.evaluate(t => window.switchTab?.(t), tab);
      await page.waitForTimeout(1500);
    }

    // Detect component
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
      
      return {
        found: true,
        visible: isVisible,
        hasCanvas: !!canvas,
        hasTable: !!table,
        hasSvg: !!svg,
        hasContent: hasContent,
      };
    }, block.id);

    results[block.id] = {
      tab: block.tab,
      label: block.label,
      type: block.type,
      status: status,
    };
  }

  await browser.close();
  server.close();

  // Print summary
  const rendered = Object.values(results).filter(r => r.status.found && r.status.visible && (r.status.hasCanvas || r.status.hasTable || r.status.hasSvg || r.status.hasContent)).length;
  const notFound = Object.values(results).filter(r => !r.status.found).length;
  const hidden = Object.values(results).filter(r => r.status.found && !r.status.visible).length;
  const empty = Object.values(results).filter(r => r.status.found && r.status.visible && !r.status.hasCanvas && !r.status.hasTable && !r.status.hasSvg && !r.status.hasContent).length;

  console.log(`\n📊 SUMÁRIO DE TESTES:`);
  console.log(`  ✅ Renderizados: ${rendered}/${blocks.length}`);
  console.log(`  ❌ Não encontrados: ${notFound}`);
  console.log(`  ⚠️  Ocultos: ${hidden}`);
  console.log(`  ⚠️  Vazios: ${empty}\n`);

  // Print by status
  console.log('📋 DETALHES:\n');
  const byTab = {};
  for (const [id, data] of Object.entries(results)) {
    if (!byTab[data.tab]) byTab[data.tab] = [];
    byTab[data.tab].push({ id, ...data });
  }

  for (const tab of tabOrder) {
    if (!byTab[tab]) continue;
    console.log(`\n▌ Tab: ${tab}`);
    for (const item of byTab[tab]) {
      if (!item.status.found) {
        console.log(`  ❌ ${item.id} (${item.type}) — não encontrado`);
      } else if (!item.status.visible) {
        console.log(`  ⚠️  ${item.id} (${item.type}) — oculto`);
      } else if (!item.status.hasCanvas && !item.status.hasTable && !item.status.hasSvg && !item.status.hasContent) {
        console.log(`  ⚠️  ${item.id} (${item.type}) — vazio`);
      } else {
        let renderType = [];
        if (item.status.hasCanvas) renderType.push('canvas');
        if (item.status.hasTable) renderType.push('table');
        if (item.status.hasSvg) renderType.push('svg');
        if (item.status.hasContent) renderType.push('content');
        console.log(`  ✅ ${item.id} (${item.type}) [${renderType.join(', ')}]`);
      }
    }
  }

  console.log('\n\n📁 Salvando resultados em test_results.json...');
  fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
  console.log('✅ Pronto!\n');
  
  process.exit(0);
});
