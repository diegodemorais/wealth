#!/usr/bin/env node
/**
 * Diagnose: which builder should render each empty component?
 */

const spec = require('./spec_html_mapping.json');
const fs = require('fs');
const path = require('path');

// Read bootstrap to see all exposed builders
const bootstrapCode = fs.readFileSync(path.join(__dirname, '../js/bootstrap.mjs'), 'utf-8');
const builders = new Set();
bootstrapCode.match(/build[A-Za-z]+/g)?.forEach(b => builders.add(b));

console.log(`\n📋 BUILDER MAPPING DIAGNOSIS\n${'═'.repeat(70)}\n`);
console.log(`Available builders: ${Array.from(builders).sort().length}\n`);

// Group empty components by type to infer which builder should render them
const empty40 = [
  "backtest-metricas", "backtest-regime-longo", "drawdown-historico", "shadow-portfolios",
  "eventos-vida", "fire-matrix", "fire-trilha", "glide-path", "lumpy-events", "simulador-fire",
  "what-if-cenarios", "ipca-dca-semaforo", "renda-plus-semaforo", "tornado-sensitivity",
  "evolucao-carteira", "factor-loadings-chart", "factor-rolling-avgs", "fee-custo-complexidade",
  "heatmap-retornos", "information-ratio", "retorno-decomposicao", "custo-base-bucket",
  "etf-composicao-regiao", "geo-donut", "intra-equity-pesos", "ir-diferido",
  "minilog", "posicoes-etfs-ibkr", "rf-posicoes", "stacked-alloc", "tlh-monitor",
  "bond-pool-readiness", "bond-pool-runway", "income-lifecycle", "spending-breakdown",
  "calc-aporte", "stress-test-mc", "kpi-grid-primario"
];

const emptyByType = {};
empty40.forEach(specId => {
  const item = spec.mapping.find(m => m.specId === specId);
  if (!item) return;
  const type = item.type;
  if (!emptyByType[type]) emptyByType[type] = [];
  emptyByType[type].push(specId);
});

console.log(`🔴 EMPTY COMPONENTS BY TYPE:\n`);
for (const [type, components] of Object.entries(emptyByType).sort()) {
  console.log(`  ${type} (${components.length})`);
  components.forEach(c => {
    const inferred = inferBuilderName(c);
    const exists = builders.has(inferred);
    console.log(`    ${c.padEnd(35)} → ${inferred} ${exists ? '✓' : '✗ MISSING'}`);
  });
  console.log();
}

function inferBuilderName(specId) {
  // Convert spec ID to builder name:
  // "backtest-metricas" → "buildBacktestMetricas"
  const camel = specId
    .split('-')
    .map((word, i) => i === 0 ? word : word[0].toUpperCase() + word.slice(1))
    .join('');
  return 'build' + camel[0].toUpperCase() + camel.slice(1);
}
