#!/usr/bin/env node
/**
 * Page Validation Script
 * Runs after build to validate that all pages can render without errors
 * This MUST pass before build completes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashDir = path.join(__dirname, '../../dash');

console.log('\n📋 Validating page builds...\n');

const pages = [
  { path: 'index.html', name: 'NOW (/)' },
  { path: 'portfolio.html', name: 'Portfolio' },
  { path: 'performance.html', name: 'Performance' },
  { path: 'fire.html', name: 'FIRE' },
  { path: 'withdraw.html', name: 'Withdraw' },
  { path: 'simulators.html', name: 'Simulators' },
  { path: 'backtest.html', name: 'Backtest' },
];

let allValid = true;

pages.forEach(({ path: pagePath, name }) => {
  const fullPath = path.join(dashDir, pagePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${name}: ${pagePath} NOT FOUND`);
    allValid = false;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Check 1: Page has content
  if (content.length < 5000) {
    console.error(`❌ ${name}: File too small (${content.length} bytes)`);
    allValid = false;
    return;
  }

  // Check 2: No obvious error markers
  const errorMarkers = [
    'Uncaught',
    'toFixed is not a function',
    'PTAX fetch failed',
    'This page couldn\'t load',
  ];

  const hasErrors = errorMarkers.some(marker => content.includes(marker));
  if (hasErrors) {
    console.error(`❌ ${name}: Contains error markers`);
    allValid = false;
    return;
  }

  // Check 3: Has main content
  if (!content.includes('<main') && !content.includes('main') && pagePath === 'index.html') {
    console.error(`❌ ${name}: No <main> element`);
    allValid = false;
    return;
  }

  console.log(`✅ ${name}: Valid`);
});

if (!allValid) {
  console.error('\n❌ Page validation FAILED');
  process.exit(1);
}

console.log('\n✅ All pages validated successfully\n');
