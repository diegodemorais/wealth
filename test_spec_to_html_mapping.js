#!/usr/bin/env node
/**
 * TEST_SPEC_TO_HTML_MAPPING
 *
 * Creates mapping between spec.json component IDs (kebab-case)
 * and actual dashboard HTML element IDs (camelCase)
 */

const fs = require('fs');
const path = require('path');

// Load spec.json
const specPath = path.join(__dirname, 'dashboard', 'spec.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

// Load dashboard HTML and extract all IDs using regex
const htmlPath = path.join(__dirname, 'dashboard', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Extract all element IDs from HTML using regex
const htmlIds = new Set();
const idRegex = /id="([^"]+)"/g;
let match;
while ((match = idRegex.exec(html)) !== null) {
  htmlIds.add(match[1]);
}

console.log(`\n📊 SPEC ↔ HTML MAPPING\n${'═'.repeat(80)}\n`);

// Function to convert kebab-case to camelCase
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Function to find best HTML ID match for a spec component
function findMatchingHtmlId(specId, specLabel) {
  const camelCase = kebabToCamel(specId);

  // Exact match (camelCase conversion)
  if (htmlIds.has(camelCase)) return camelCase;

  // Fuzzy match: look for IDs that contain main keywords
  const keywords = specId.split('-').filter(k => k.length > 2);
  const candidates = Array.from(htmlIds).filter(id => {
    // Check if ID contains most keywords
    const idLower = id.toLowerCase();
    const matches = keywords.filter(k => idLower.includes(k.toLowerCase())).length;
    return matches >= Math.max(1, keywords.length - 1);
  });

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    // Pick the shortest one (likely the main container)
    const sorted = candidates.sort((a, b) => a.length - b.length);
    return sorted[0];
  }

  // No match
  return null;
}

// Create mapping
const mapping = [];

for (const component of spec.blocks) {
  const htmlId = findMatchingHtmlId(component.id, component.label);
  const found = htmlId !== null;

  mapping.push({
    specId: component.id,
    htmlId: htmlId || '—',
    label: component.label,
    tab: component.tab,
    type: component.type,
    found
  });
}

// Group by tab and report
const byTab = {};
for (const item of mapping) {
  if (!byTab[item.tab]) byTab[item.tab] = [];
  byTab[item.tab].push(item);
}

const totalFound = mapping.filter(m => m.found).length;
const totalMissing = mapping.filter(m => !m.found).length;

console.log(`SUMMARY: ${totalFound} found, ${totalMissing} missing\n`);

for (const [tab, items] of Object.entries(byTab).sort()) {
  const found = items.filter(i => i.found).length;
  console.log(`${tab.toUpperCase().padEnd(15)} ${found}/${items.length}`);

  for (const item of items) {
    const icon = item.found ? '✅' : '❌';
    console.log(`  ${icon} ${item.specId.padEnd(30)} → ${item.htmlId.padEnd(30)} (${item.type})`);
  }
  console.log('');
}

// Write mapping to JSON
const outputPath = path.join(__dirname, 'dashboard', 'tests', 'spec_html_mapping.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: { totalComponents: mapping.length, found: totalFound, missing: totalMissing },
  mapping: mapping.sort((a, b) => a.tab.localeCompare(b.tab) || a.specId.localeCompare(b.specId))
}, null, 2));

console.log(`✅ Mapping written to dashboard/tests/spec_html_mapping.json\n`);
