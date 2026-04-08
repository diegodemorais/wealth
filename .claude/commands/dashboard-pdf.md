# Dashboard PDF + Netlify — Gerar PDFs e Publicar Online

Gera 2 PDFs do dashboard (valores abertos e fechados) e publica o HTML no Netlify.

**Requer:** Puppeteer instalado em `scripts/node_modules/` + `.netlify_token` em `wealth/`.

## Como rodar

```bash
# Instalar Puppeteer (1x — já feito)
cd scripts && npm install puppeteer

# Gerar os 2 PDFs
node scripts/dashboard_pdf.mjs

# Publicar HTML no Netlify
bash scripts/deploy_netlify.sh

# Gerar PDFs E publicar em sequência (fluxo completo)
node scripts/dashboard_pdf.mjs && bash scripts/deploy_netlify.sh
```

Output:
- `analysis/dashboard_aberto.pdf` — todos os valores visíveis
- `analysis/dashboard_fechado.pdf` — valores absolutos ocultos (R$, USD, cotas)
- URL Netlify: https://stunning-crepe-8aa19f.netlify.app (senha: `diego2040`)

## Quando usar

Executar sempre que rodar `/dashboard` para ter uma snapshot permanente em PDF e o HTML publicado, especialmente no check-in mensal.

## Notas
- PDFs em formato A3 landscape (cabe o dashboard completo)
- `dashboard_fechado.pdf` útil para compartilhar sem expor patrimônio
- Netlify: site `stunning-crepe-8aa19f`, token em `.netlify_token` (gitignored)
- Dashboard online tem proteção por senha (sessionStorage — não é segurança forte, mas evita acesso casual)

## Script

Criar `scripts/dashboard_pdf.mjs` com:

```js
import puppeteer from 'puppeteer';
import http from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, '..', 'analysis', 'dashboard.html');
const htmlContent = readFileSync(htmlPath, 'utf-8');
const htmlPrivate = htmlContent.replace('<body>', '<body class="private-mode">');

let currentHtml = htmlContent;
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(currentHtml);
});
server.listen(0);
const port = server.address().port;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

// PDF 1: aberto
currentHtml = htmlContent;
await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));
const outOpen = resolve(__dirname, '..', 'analysis', 'dashboard_aberto.pdf');
await page.pdf({ path: outOpen, format: 'A3', landscape: true, printBackground: true,
  margin: { top: '6mm', bottom: '6mm', left: '6mm', right: '6mm' } });
console.log(`✅ ${outOpen}`);

// PDF 2: fechado
await page.close();
const page2 = await browser.newPage();
await page2.setViewport({ width: 1280, height: 900 });
currentHtml = htmlPrivate;
await page2.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));
const outClosed = resolve(__dirname, '..', 'analysis', 'dashboard_fechado.pdf');
await page2.pdf({ path: outClosed, format: 'A3', landscape: true, printBackground: true,
  margin: { top: '6mm', bottom: '6mm', left: '6mm', right: '6mm' } });
console.log(`✅ ${outClosed}`);

await browser.close();
server.close();
console.log('Done! 2 PDFs gerados em analysis/');
```

## Notas
- Usa CDN Chart.js (precisa de internet na primeira vez)
- A3 landscape para caber o dashboard completo
- printBackground: true para preservar dark theme
- O script serve o HTML via HTTP local para evitar problemas de CORS/file://
