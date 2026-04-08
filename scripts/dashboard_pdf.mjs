#!/usr/bin/env node
/**
 * dashboard_pdf.mjs — Gera 2 PDFs do dashboard (aberto + fechado)
 * 
 * Uso:
 *   node scripts/dashboard_pdf.mjs
 * 
 * Requer: npm install puppeteer (na pasta scripts/)
 * Output: analysis/dashboard_aberto.pdf + analysis/dashboard_fechado.pdf
 */

import puppeteer from 'puppeteer';
import http from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, '..', 'analysis', 'dashboard.html');

console.log('Lendo', htmlPath);
const htmlContent = readFileSync(htmlPath, 'utf-8');
const htmlPrivate = htmlContent.replace('<body>', '<body class="private-mode">');

// Serve HTML via HTTP (evita CORS/file:// issues)
let currentHtml = htmlContent;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(currentHtml);
});
server.listen(0);
const port = server.address().port;
console.log(`Server em http://127.0.0.1:${port}`);

const browser = await puppeteer.launch({ headless: true });

async function makePdf(html, filename, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  currentHtml = html;
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle0', timeout: 30000 });
  // Esperar Chart.js renderizar
  await new Promise(r => setTimeout(r, 3000));
  const outPath = resolve(__dirname, '..', 'analysis', filename);
  await page.pdf({
    path: outPath,
    format: 'A3',
    landscape: true,
    printBackground: true,
    margin: { top: '6mm', bottom: '6mm', left: '6mm', right: '6mm' }
  });
  const size = readFileSync(outPath).length;
  console.log(`✅ ${label}: ${outPath} (${(size / 1024).toFixed(0)}KB)`);
  await page.close();
}

await makePdf(htmlContent, 'dashboard_aberto.pdf', 'Olho aberto');
await makePdf(htmlPrivate, 'dashboard_fechado.pdf', 'Olho fechado');

await browser.close();
server.close();
console.log('\nDone! 2 PDFs em analysis/');
