#!/usr/bin/env python3
"""
test_live_github_pages.py — Testa o GitHub Pages em tempo real
com o navegador para verificar se os elementos estão sendo populados
"""

import subprocess
import time

print("\n" + "="*80)
print("🌐 TESTANDO GITHUB PAGES AO VIVO")
print("="*80 + "\n")

node_script = """
(async () => {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://diegodemorais.github.io/wealth-dash/', { waitUntil: 'networkidle2' });

  // Aguardar um pouco para scripts rodarem
  await page.waitForTimeout(2000);

  // Clicar na aba carteira
  await page.evaluate(() => {
    const btn = document.querySelector("button[data-tab='carteira']");
    if (btn) btn.click();
  });

  // Aguardar rendering
  await page.waitForTimeout(2000);

  // Checar elementos
  const results = await page.evaluate(() => {
    const els = {};
    ['stackedAllocBar', 'stackedAllocLegend', 'stackedEquityBar'].forEach(id => {
      const el = document.getElementById(id);
      els[id] = {
        exists: !!el,
        innerHTMLLength: el?.innerHTML?.length || 0,
        isEmpty: !el?.innerHTML?.trim()
      };
    });
    return els;
  });

  console.log('Resultados:');
  Object.entries(results).forEach(([id, info]) => {
    const status = info.isEmpty ? '❌' : '✅';
    console.log(`${status} ${id}: ${info.innerHTMLLength} chars`);
  });

  const allPopulated = Object.values(results).every(r => !r.isEmpty);
  console.log(allPopulated ? '\\n✅ TODOS OS ELEMENTOS POPULADOS!' : '\\n❌ Alguns elementos vazios');

  await browser.close();
  process.exit(allPopulated ? 0 : 1);
})();
"""

# Verificar se puppeteer está instalado
try:
    subprocess.run(['npm', 'list', 'puppeteer'], capture_output=True, check=True)
except:
    print("⚠️  Puppeteer não instalado — instalando...")
    subprocess.run(['npm', 'install', '-g', 'puppeteer'], capture_output=True)

# Executar teste
print("🌐 Abrindo GitHub Pages e testando aba carteira...\n")
result = subprocess.run(
    ['node', '-e', node_script],
    capture_output=True,
    text=True,
    timeout=30
)

print(result.stdout)
if result.stderr:
    print("⚠️  Stderr:", result.stderr)

exit(result.returncode)
