#!/usr/bin/env node
/**
 * debug_http_requests.js — Log all HTTP requests during page load
 * to identify which resources are failing with 500 errors
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9881;
const DASHBOARD_DIR = path.join(__dirname, '..');

const requests = [];

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  const url = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(DASHBOARD_DIR, url);

  // Log request
  requests.push({
    timestamp,
    method: req.method,
    url: req.url,
    path: filePath.replace(DASHBOARD_DIR, ''),
    fileExists: fs.existsSync(filePath),
    status: null,
    error: null
  });

  if (!filePath.startsWith(DASHBOARD_DIR)) {
    res.writeHead(400);
    res.end('Bad request');
    requests[requests.length - 1].status = 400;
    return;
  }

  fs.readFile(filePath, (err, content) => {
    let status = 200;
    let body = content;

    if (err) {
      status = 404;
      body = '404';
      requests[requests.length - 1].error = err.message;
    } else {
      const ext = path.extname(filePath);
      const types = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.css': 'text/css'
      };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    }

    requests[requests.length - 1].status = status;
    res.writeHead(status);
    res.end(body);
  });
});

server.listen(PORT, async () => {
  console.log(`\n🔍 HTTP REQUEST LOGGING\n${'═'.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture response failures
  page.on('response', response => {
    if (!response.ok()) {
      const req = requests.find(r => r.url === response.request().url().replace(`http://localhost:${PORT}`, ''));
      if (req) {
        req.responseStatus = response.status();
        req.responseStatusText = response.statusText();
      }
    }
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Print summary
  const by500 = requests.filter(r => r.status === 500 || r.responseStatus === 500);
  const by404 = requests.filter(r => r.status === 404 || r.responseStatus === 404);
  const bySuccess = requests.filter(r => (r.status === 200 || r.responseStatus === 200) && !r.error);

  console.log(`✅ Success: ${bySuccess.length}`);
  bySuccess.slice(0, 5).forEach(r => console.log(`   ${r.url}`));
  if (bySuccess.length > 5) console.log(`   ... and ${bySuccess.length - 5} more`);

  if (by500.length > 0) {
    console.log(`\n❌ 500 Errors: ${by500.length}`);
    by500.forEach(r => console.log(`   ${r.url} (exists: ${r.fileExists})`));
  }

  if (by404.length > 0) {
    console.log(`\n❌ 404 Errors: ${by404.length}`);
    by404.forEach(r => console.log(`   ${r.url}`));
  }

  // Write detailed log
  const outputPath = path.join(__dirname, 'debug_http_requests.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: requests.length,
      success: bySuccess.length,
      errors500: by500.length,
      errors404: by404.length
    },
    requests
  }, null, 2));

  console.log(`\n📋 Detailed log: ${outputPath}\n`);

  await browser.close();
  server.close();
  process.exit(0);
});
