#!/usr/bin/env node
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9884;
const DASHBOARD_DIR = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(DASHBOARD_DIR, url);
  if (!filePath.startsWith(DASHBOARD_DIR)) {
    res.writeHead(400);
    res.end();
    return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end();
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
  page.on('console', msg => {});

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const tabState = await page.evaluate(() => {
    // Check which tabs are visible
    const tabs = {};
    document.querySelectorAll('[data-in-tab]').forEach(el => {
      const tabName = el.dataset.inTab;
      if (!tabs[tabName]) {
        tabs[tabName] = { visible: 0, hidden: 0, elements: 0 };
      }
      tabs[tabName].elements++;
      if (el.classList.contains('tab-hidden')) {
        tabs[tabName].hidden++;
      } else {
        tabs[tabName].visible++;
      }
    });

    // Check active button
    const activeBtn = document.querySelector('.tab-btn.active');

    return {
      activeTab: activeBtn?.dataset.tab || 'none',
      activeLabel: activeBtn?.textContent || 'none',
      tabVisibility: tabs,
      totalElements: Object.values(tabs).reduce((a, t) => a + t.elements, 0)
    };
  });

  console.log(`\n📋 TAB STATE\n${'═'.repeat(60)}\n`);
  console.log(`Active Tab: ${tabState.activeTab} (${tabState.activeLabel})`);
  console.log(`Total elements with data-in-tab: ${tabState.totalElements}`);
  console.log(`\nTab visibility:`);
  for (const [tab, state] of Object.entries(tabState.tabVisibility)) {
    console.log(`  ${tab.padEnd(15)} ${state.visible} visible / ${state.hidden} hidden`);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
