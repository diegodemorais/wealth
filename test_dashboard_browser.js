#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHARTS = [
  { id: 'semaforoBody', tab: 'hoje', name: 'Semáforo de gatilhos' },
  { id: 'geoDonut', tab: 'carteira', name: 'Composição por região' },
  { id: 'factorLoadingsChart', tab: 'carteira', name: 'Exposição fatorial' },
  { id: 'minilogBody', tab: 'carteira', name: 'Últimas operações' },
  { id: 'fireMatrixTable', tab: 'fire', name: 'Simulador FIRE' },
  { id: 'stressProjectionChart', tab: 'simuladores', name: 'Stress test' },
  { id: 'calcAporte', tab: 'simuladores', name: 'Calculadora de aporte' },
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
  console.log(`\n✨ Testando renderização dos 7 charts\n${'═'.repeat(60)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const uniqueTabs = [...new Set(CHARTS.map(c => c.tab))];
  const results = [];

  for (const tab of uniqueTabs) {
    console.log(`\n📋 Aba: ${tab}`);
    console.log('─'.repeat(60));

    await page.evaluate(t => window.switchTab(t), tab);
    await page.waitForTimeout(2500);

    for (const chart of CHARTS.filter(c => c.tab === tab)) {
      const status = await page.evaluate(id => {
        const el = document.getElementById(id);
        if (!el) return { found: false };

        const isCanvasElement = el.tagName === 'CANVAS';
        const canvas = isCanvasElement ? el : el.querySelector('canvas');
        const table = isCanvasElement ? null : el.querySelector('table');
        const svg = isCanvasElement ? null : el.querySelector('svg');

        const hasContent = el.textContent.trim().length > 20 || el.children.length > 0;
        const isVisible = window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden';

        const isRendered = !!canvas || !!table || !!svg || hasContent;

        const canvasInfo = canvas ? {
          width: canvas.width,
          height: canvas.height,
          hasImageData: canvas.toDataURL('image/png').length > 100,
        } : null;

        return {
          found: true,
          visible: isVisible,
          rendered: isRendered,
          hasCanvas: !!canvas,
          hasTable: !!table,
          hasSvg: !!svg,
          hasContent,
          isCanvasElement,
          canvasInfo,
        };
      }, chart.id);

      if (!status.found) {
        console.log(`  ❌ ${chart.name} — DOM não encontrado`);
        results.push({ chart: chart.name, status: '❌' });
      } else if (!status.visible) {
        console.log(`  ⚠️  ${chart.name} — Oculto`);
        results.push({ chart: chart.name, status: '⚠️ oculto' });
      } else if (status.rendered) {
        console.log(`  ✅ ${chart.name}`);
        if (status.canvasInfo) {
          console.log(`      └─ Canvas: ${status.canvasInfo.width}x${status.canvasInfo.height} ${status.canvasInfo.hasImageData ? '(✓ pixels)' : ''}`);
        }
        results.push({ chart: chart.name, status: '✅' });
      } else {
        console.log(`  ⚠️  ${chart.name} — Vazio`);
        results.push({ chart: chart.name, status: '⚠️ vazio' });
      }
    }
  }

  const passed = results.filter(r => r.status === '✅').length;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`\n📈 RESULTADO FINAL: ${passed}/${CHARTS.length} charts renderizados\n`);

  results.forEach(r => {
    const icon = r.status === '✅' ? '✅' : r.status === '❌' ? '❌' : '⚠️ ';
    console.log(`  ${icon} ${r.chart}`);
  });

  console.log(`\n${'═'.repeat(60)}\n`);

  await browser.close();
  server.close();
  process.exit(passed === CHARTS.length ? 0 : 1);
});
