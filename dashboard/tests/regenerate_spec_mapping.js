#!/usr/bin/env node
/**
 * Correctly map each spec block to its HTML element and tab
 */

const fs = require('fs');
const spec = require('./spec.json');
const html = fs.readFileSync('../index.html', 'utf-8');

// Manual mapping of spec blocks to HTML elements and correct tabs
// Based on actual HTML structure and data-in-tab attributes
const blockMapping = {
  // Global elements (no data-in-tab)
  'patrimonio-total-hero': { htmlId: 'heroPatrimonioBrl', tab: 'global', type: 'kpi-hero' },
  'pfire-hero': { htmlId: 'heroAnos', tab: 'global', type: 'kpi-hero' },
  'fire-countdown': { htmlId: 'fireCountdown', tab: 'global', type: 'kpi' },
  'macro-strip': { htmlId: 'macroStrip', tab: 'global', type: 'semaforo' },
  'wellness-score': { htmlId: 'wellnessScore', tab: 'global', type: 'card' },

  // Sankey is in hoje tab
  'cash-flow-sankey': { htmlId: 'sankeyChart', tab: 'hoje', type: 'chart-sankey' },

  // Semaforo panel is in hoje tab but rendered globally
  'ipca-dca-semaforo': { htmlId: 'kpiIpcaSemaforo', tab: 'global', type: 'semaforo' },
  'renda-plus-semaforo': { htmlId: 'kpiRendaSemaforo', tab: 'global', type: 'semaforo' },

  // Build correct mapping from actual spec + HTML inspection
};

const mapping = [];

// Read each spec block and find its HTML ID
spec.blocks.forEach(block => {
  let htmlId = blockMapping[block.id]?.htmlId;
  let tabName = blockMapping[block.id]?.tab;

  // If not in manual mapping, try to find in HTML
  if (!htmlId) {
    // Try common naming conventions: block-id → blockId (camelCase)
    const camelCased = block.id.split('-').reduce((acc, part, i) =>
      i === 0 ? part : acc + part[0].toUpperCase() + part.slice(1), '');

    if (html.includes(`id="${camelCased}"`)) {
      htmlId = camelCased;
    }
  }

  // Determine tab from data-in-tab attribute in HTML
  if (htmlId && !tabName) {
    const tabMatch = html.match(new RegExp(`id="${htmlId}"[^>]*data-in-tab="([^"]*)"`)
      || new RegExp(`data-in-tab="([^"]*)"[^>]*id="${htmlId}"`));
    tabName = tabMatch ? tabMatch[1] : null;
  }

  // Fix tab naming: "now" → "hoje", "performance" → "perf"
  if (tabName === 'now') tabName = 'hoje';
  if (tabName === 'performance') tabName = 'perf';

  if (htmlId) {
    mapping.push({
      specId: block.id,
      htmlId: htmlId,
      label: block.label || block.id,
      tab: tabName || 'unknown',
      type: block.type || 'unknown',
      found: true
    });
  } else {
    mapping.push({
      specId: block.id,
      htmlId: '(not found)',
      label: block.label || block.id,
      tab: 'unknown',
      type: block.type || 'unknown',
      found: false
    });
  }
});

// Write updated mapping
const output = {
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents: mapping.length,
    found: mapping.filter(m => m.found).length,
    missing: mapping.filter(m => !m.found).length
  },
  mapping: mapping.sort((a, b) => (a.tab || '').localeCompare(b.tab))
};

fs.writeFileSync('./spec_html_mapping.json', JSON.stringify(output, null, 2));
console.log('✅ Updated spec_html_mapping.json');
console.log(`  Total: ${output.summary.totalComponents}`);
console.log(`  Found: ${output.summary.found}`);
console.log(`  Missing: ${output.summary.missing}`);

// Print by tab
const byTab = {};
mapping.forEach(m => {
  if (!byTab[m.tab]) byTab[m.tab] = 0;
  byTab[m.tab]++;
});
console.log('\nComponents by tab:');
for (const [tab, count] of Object.entries(byTab).sort()) {
  console.log(`  ${tab}: ${count}`);
}
