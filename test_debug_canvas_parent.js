#!/usr/bin/env node
/**
 * DEBUG_CANVAS_PARENT
 *
 * Check if Chart.js canvas is being inserted into the correct parent
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9881;
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
  console.log(`\n🔍 DEBUG: CANVAS PARENT AND DOM INSERTION\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check structure before tab switch
  console.log(`\n📊 BEFORE switchTab\n`);
  let beforeState = await page.evaluate(() => {
    const el = document.getElementById('geoDonut');
    return {
      exists: !!el,
      tagName: el?.tagName,
      parentTag: el?.parentElement?.tagName,
      parentId: el?.parentElement?.id,
      hasCanvas: !!el?.querySelector('canvas'),
      innerHTML: el?.innerHTML || '',
      childCount: el?.children.length || 0,
      innerHTML_length: (el?.innerHTML || '').length
    };
  });
  console.log(JSON.stringify(beforeState, null, 2));

  // Switch and check
  console.log(`\n📊 Calling switchTab('carteira')...\n`);
  await page.evaluate(() => window.switchTab('carteira'));
  await page.waitForTimeout(2500);

  let afterSwitchState = await page.evaluate(() => {
    const el = document.getElementById('geoDonut');
    return {
      exists: !!el,
      tagName: el?.tagName,
      parentTag: el?.parentElement?.tagName,
      parentId: el?.parentElement?.id,
      hasCanvas: !!el?.querySelector('canvas'),
      hasChild_canvas: Array.from(el?.children || []).some(c => c.tagName === 'CANVAS'),
      childCount: el?.children.length || 0,
      childTagNames: Array.from(el?.children || []).map(c => c.tagName),
      innerHTML_length: (el?.innerHTML || '').length,
      innerHTML_firstChars: (el?.innerHTML || '').slice(0, 200),
      // Check if canvas exists somewhere in DOM
      canvasInPage: !!document.querySelector('canvas#geoDonut'),
      chartClassCheck: el?.className || ''
    };
  });
  console.log(JSON.stringify(afterSwitchState, null, 2));

  // Now manually call buildDonuts
  console.log(`\n📊 Manually calling buildDonuts()...\n`);
  await page.evaluate(() => window.buildDonuts());
  await page.waitForTimeout(500);

  let afterBuildState = await page.evaluate(() => {
    const el = document.getElementById('geoDonut');
    const canvasInDom = document.querySelector('canvas#geoDonut');
    const allCanvases = document.querySelectorAll('canvas');

    return {
      geoDonutElement: {
        exists: !!el,
        tagName: el?.tagName,
        hasCanvas: !!el?.querySelector('canvas'),
        hasChild_canvas: Array.from(el?.children || []).some(c => c.tagName === 'CANVAS'),
        childCount: el?.children.length || 0,
        childTagNames: Array.from(el?.children || []).map(c => c.tagName)
      },
      canvasByQuery: {
        exists: !!canvasInDom,
        id: canvasInDom?.id || null,
        width: canvasInDom?.width,
        height: canvasInDom?.height,
        parentId: canvasInDom?.parentElement?.id
      },
      chartsGeo: {
        exists: !!window.charts.geo,
        hasCanvas: !!window.charts.geo?.canvas,
        canvasId: window.charts.geo?.canvas?.id,
        canvasInDOM: !!window.charts.geo?.canvas?.parentElement,
        canvasParentId: window.charts.geo?.canvas?.parentElement?.id,
        canvasParentClass: window.charts.geo?.canvas?.parentElement?.className
      },
      allCanvasCount: allCanvases.length,
      allCanvasIds: Array.from(allCanvases).map(c => c.id)
    };
  });

  console.log(JSON.stringify(afterBuildState, null, 2));

  // Try to render it
  console.log(`\n📊 Force render canvas...\n`);
  const renderResult = await page.evaluate(() => {
    const canvas = window.charts.geo?.canvas;
    if (!canvas) return { error: 'No canvas' };

    const ctx = canvas.getContext('2d');
    return {
      canvasContext: ctx ? 'exists' : 'null',
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      canvasComputedWidth: window.getComputedStyle(canvas).width,
      canvasComputedHeight: window.getComputedStyle(canvas).height,
      chartDataLength: window.charts.geo.data.datasets[0]?.data?.length || 0,
      // Try to get visual representation
      canvasImageData: canvas.toDataURL('image/png').slice(0, 100) + '...'
    };
  });

  console.log(JSON.stringify(renderResult, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
