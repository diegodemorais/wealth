#!/usr/bin/env node
/**
 * Integrated EMPTY component detector for test suite
 * Run via: node dashboard/tests/identify_empty_integrated.js
 * Output: dashboard/tests/identify_empty_results.json
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'spec_html_mapping.json'), 'utf-8'));
const PORT = 9879;
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

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const results = { empty: [], rendered: [] };
  const tabNameMap = { 'now': 'hoje', 'portfolio': 'carteira', 'performance': 'perf' };
  const processedTabs = new Set();

  for (const item of SPEC.mapping) {
    const { specId, htmlId, tab, type } = item;
    if (!htmlId || htmlId === '—') continue;

    // Switch tab once per unique tab
    if (!processedTabs.has(tab)) {
      const htmlTabName = tabNameMap[tab] || tab;
      try {
        await page.evaluate(t => window.switchTab && window.switchTab(t), htmlTabName);
        await page.waitForTimeout(1500);
      } catch (e) {}
      processedTabs.add(tab);
    }

    // Check if has content
    const hasContent = await page.evaluate(({ htmlId, type }) => {
      const el = document.getElementById(htmlId);
      if (!el) return null;
      if (!el.offsetParent) return 'hidden';

      if (['chart-line', 'chart-bar', 'chart-area', 'chart-donut', 'chart-bar-horizontal', 'fan-chart'].includes(type)) {
        if (el.tagName === 'CANVAS') return el.width > 0 && el.height > 0 ? 'rendered' : 'empty';
        const canvas = el.querySelector('canvas');
        return canvas ? 'rendered' : 'empty';
      } else if (['table', 'gauge', 'semaforo'].includes(type)) {
        const html = el.innerHTML.trim();
        return html.length > 50 || el.children.length > 0 ? 'rendered' : 'empty';
      } else if (['card', 'kpi', 'kpi-hero', 'slider'].includes(type)) {
        const html = el.innerHTML.trim();
        const hasText = html.length > 10 && !html.includes('—');
        return hasText ? 'rendered' : 'empty';
      }

      const html = el.innerHTML.trim();
      return html.length > 20 ? 'rendered' : 'empty';
    }, { htmlId, type });

    if (hasContent === 'empty') results.empty.push(specId);
    else if (hasContent === 'rendered') results.rendered.push(specId);
  }

  const output = {
    timestamp: new Date().toISOString(),
    summary: { total: SPEC.mapping.filter(m => m.htmlId && m.htmlId !== '—').length, empty: results.empty.length, rendered: results.rendered.length },
    results
  };

  fs.writeFileSync(path.join(__dirname, 'identify_empty_results.json'), JSON.stringify(output, null, 2));
  console.log(`\n✓ EMPTY components: ${results.empty.length}`);
  console.log(`✓ RENDERED components: ${results.rendered.length}`);

  await browser.close();
  server.close();
  process.exit(results.empty.length === 0 ? 0 : 1);
});
