#!/usr/bin/env node
/**
 * DEBUG_CHART_RENDER_ERROR
 *
 * Catch any errors in Chart.js initialization and data
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9882;
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
  console.log(`\n🔍 DEBUG: CHART RENDER ERRORS\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture all console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log(`\n📊 Switch to carteira and inspect errors\n`);

  const debugResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      // Monitor Chart constructor
      const originalChart = window.Chart;
      const chartInstances = [];

      window.Chart = function(canvas, config) {
        try {
          const instance = new originalChart(canvas, config);
          chartInstances.push({
            canvasId: canvas.id,
            configType: config.type,
            datasetCount: config.data?.datasets?.length || 0,
            dataPointsPerDataset: config.data?.datasets?.map(d => d.data?.length || 0) || [],
            optionsResponsive: config.options?.responsive,
            hasData: !!(config.data?.labels || config.data?.datasets?.[0]?.data)
          });
          return instance;
        } catch (e) {
          chartInstances.push({
            canvasId: canvas.id,
            error: e.toString(),
            stack: e.stack
          });
          throw e;
        }
      };
      Object.setPrototypeOf(window.Chart, originalChart);
      Object.assign(window.Chart, originalChart);

      // Switch tab
      window.switchTab('carteira');

      setTimeout(() => {
        // Manually call buildDonuts
        try {
          window.buildDonuts();
        } catch (e) {
          console.error('[buildDonuts ERROR]', e.toString());
        }

        setTimeout(() => {
          // Inspect chart state
          const geoChart = window.charts.geo;
          const result = {
            chartsCreated: chartInstances,
            geoChartExists: !!geoChart,
            geoChartStatus: geoChart ? {
              type: geoChart.type,
              canvasId: geoChart.canvas?.id,
              hasContext: !!geoChart.ctx,
              dataLength: geoChart.data?.datasets?.length || 0,
              firstDataset: {
                label: geoChart.data?.datasets?.[0]?.label,
                dataLength: geoChart.data?.datasets?.[0]?.data?.length,
                data: geoChart.data?.datasets?.[0]?.data
              },
              options: {
                responsive: geoChart.options?.responsive,
                maintainAspectRatio: geoChart.options?.maintainAspectRatio,
                plugins: Object.keys(geoChart.options?.plugins || {})
              },
              canvasState: {
                width: geoChart.canvas?.width,
                height: geoChart.canvas?.height,
                offsetWidth: geoChart.canvas?.offsetWidth,
                offsetHeight: geoChart.canvas?.offsetHeight,
                display: window.getComputedStyle(geoChart.canvas).display,
                visibility: window.getComputedStyle(geoChart.canvas).visibility
              },
              // Check if anything was drawn
              isBlank: (() => {
                const imageData = geoChart.canvas.toDataURL('image/png');
                // All white/transparent PNGs are much shorter than filled ones
                return imageData.length < 500;
              })()
            } : null
          };
          resolve(result);
        }, 1000);
      }, 2000);
    });
  });

  console.log(JSON.stringify(debugResult, null, 2));

  console.log(`\n📊 Recent console logs\n`);
  console.log(`Total logs: ${consoleLogs.length}\n`);

  // Show error and warning logs
  const problemLogs = consoleLogs.filter(log => ['error', 'warn'].includes(log.type));
  if (problemLogs.length > 0) {
    console.log(`⚠️  ERRORS/WARNINGS (${problemLogs.length}):\n`);
    problemLogs.forEach(log => {
      console.log(`  [${log.type}] ${log.text}`);
      if (log.location) console.log(`      at ${log.location.url}:${log.location.lineNumber}`);
    });
  } else {
    console.log(`✅ No errors or warnings\n`);
  }

  // Show last 10 logs
  console.log(`\n📋 Last 10 logs:\n`);
  consoleLogs.slice(-10).forEach(log => {
    console.log(`  [${log.type}] ${log.text}`);
  });

  await browser.close();
  server.close();
  process.exit(0);
});
