#!/usr/bin/env node

/**
 * Capturar screenshots de cada aba do dashboard via Puppeteer
 * Usa as rotas diretas do Next.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TABS = [
  { name: '01-now-tab.png', route: '/', label: 'NOW' },
  { name: '02-portfolio-tab.png', route: '/portfolio', label: 'PORTFOLIO' },
  { name: '03-performance-tab.png', route: '/performance', label: 'PERFORMANCE' },
  { name: '04-fire-tab.png', route: '/fire', label: 'FIRE' },
  { name: '05-withdraw-tab.png', route: '/withdraw', label: 'WITHDRAW' },
  { name: '06-simuladores-tab.png', route: '/simulators', label: 'SIMULADORES' },
  { name: '07-backtest-tab.png', route: '/backtest', label: 'BACKTEST' },
];

const BASE_URL = 'https://diegodemorais.github.io/wealth';
const OUTPUT_DIR = path.join(__dirname, '..', 'react-app', 'audit-screenshots');

(async () => {
  console.log('📸 Capturando screenshots via Puppeteer...\n');

  // Criar diretório se não existir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let browser;
  try {
    // Iniciar browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors'
      ]
    });

    let count = 0;
    for (const tab of TABS) {
      count++;
      const url = `${BASE_URL}${tab.route}`;
      const outputFile = path.join(OUTPUT_DIR, tab.name);

      process.stdout.write(`  [${count}/7] Capturando ${tab.label} (${tab.route})... `);

      try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        // Capture console messages for debugging
        page.on('console', msg => {
          if (msg.type() === 'error') {
            console.error(`[${tab.label} console error] ${msg.text()}`);
          }
        });

        // Navegar para a URL e aguardar JavaScript carregar
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Aguarde extra para animações e renderização de charts (5 segundos para /simulators)
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Tire screenshot (fullPage: true para capturar página inteira, especialmente /simulators)
        await page.screenshot({ path: outputFile, fullPage: true });

        const stats = fs.statSync(outputFile);
        const sizeKb = (stats.size / 1024).toFixed(0);

        console.log(`✅ (${sizeKb}KB)`);

        await page.close();
      } catch (err) {
        console.log(`❌ (${err.message.substring(0, 40)})`);
      }
    }

    await browser.close();

    console.log('\n✅ Captura concluída!');
    console.log('\n📊 Screenshots gerados:');

    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.png'))
      .sort();

    files.forEach(f => {
      const fullPath = path.join(OUTPUT_DIR, f);
      const stats = fs.statSync(fullPath);
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`   ${f} (${sizeKb}KB)`);
    });

    console.log(`\n   Total: ${files.length} arquivos`);

  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
