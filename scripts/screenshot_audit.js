#!/usr/bin/env node

/**
 * screenshot_audit.js — Captura screenshots de cada aba do dashboard e compara
 *
 * Uso:
 *   node scripts/screenshot_audit.js
 *
 * Saída: screenshots em dashboard/audit-screenshots/{timestamp}/
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const TABS = ['now', 'portfolio', 'performance', 'fire', 'withdraw', 'backtest', 'macro'];
const SCREENSHOT_DIR = path.join(__dirname, '..', 'dashboard', 'audit-screenshots');
const ARCHIVE_DIR = path.join(SCREENSHOT_DIR, new Date().toISOString().split('T')[0]);

// Criar diretório se não existir
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1
    });

    const page = await context.newPage();

    // Navegue para o dashboard
    const dashboardUrl = 'file://' + path.join(__dirname, '..', 'index.html');
    console.log(`📸 Carregando dashboard: ${dashboardUrl}`);
    await page.goto(dashboardUrl, { waitUntil: 'networkidle' });

    // Espere o dashboard carregar completamente
    await page.waitForSelector('[data-tab]', { timeout: 10000 }).catch(() => {
      console.warn('⚠️  Tabs não encontrados com data-tab, tentando por ID');
    });

    // Tire screenshots de cada aba
    for (const tab of TABS) {
      try {
        console.log(`📸 Capturando ${tab}...`);

        // Clique na aba (tente múltiplos seletores)
        const selectors = [
          `[data-tab="${tab}"]`,
          `button[id*="${tab}"]`,
          `a[href*="${tab}"]`,
          `.tab-${tab}`,
          `[role="tab"][aria-label*="${tab}"]`
        ];

        let clicked = false;
        for (const selector of selectors) {
          if (await page.locator(selector).first().isVisible().catch(() => false)) {
            await page.click(selector);
            clicked = true;
            break;
          }
        }

        if (!clicked && tab !== 'now') {
          console.warn(`  ⚠️  Aba ${tab} não encontrada, pulando...`);
          continue;
        }

        // Aguarde renderização
        await page.waitForTimeout(1000);

        // Tire screenshot
        const filename = `${tab.padStart(2, '0')}-${tab}-tab.png`;
        const filepath = path.join(ARCHIVE_DIR, filename);
        await page.screenshot({ path: filepath, fullPage: false });

        console.log(`  ✅ ${filename} salvo`);
      } catch (err) {
        console.error(`  ❌ Erro ao capturar ${tab}: ${err.message}`);
      }
    }

    console.log(`\n✅ Screenshots salvos em: ${ARCHIVE_DIR}`);
    console.log(`\n📊 Próximas etapas:`);
    console.log(`  1. Revisar screenshots em ${ARCHIVE_DIR}`);
    console.log(`  2. Comparar com versão anterior (se existir)`);
    console.log(`  3. Validar regressions visuais`);

    await context.close();
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
