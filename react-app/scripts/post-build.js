#!/usr/bin/env node
/**
 * Post-build script for GitHub Pages deployment
 * Copies dashboard.html to index.html so root path serves dashboard content
 *
 * Problem: With static export, Next.js redirects don't work in GitHub Pages
 * Solution: Copy dashboard.html to index.html at build output root
 */

const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, '..', '..', 'dashboard');
const dashboardFile = path.join(dashboardDir, 'dashboard.html');
const indexFile = path.join(dashboardDir, 'index.html');

try {
  // Read dashboard.html
  const dashboardContent = fs.readFileSync(dashboardFile, 'utf-8');

  // Write to index.html (overwrite the redirect version)
  fs.writeFileSync(indexFile, dashboardContent);

  console.log('✅ Post-build: Copied dashboard.html to index.html');
} catch (error) {
  console.error('❌ Post-build failed:', error.message);
  process.exit(1);
}
