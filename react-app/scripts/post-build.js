#!/usr/bin/env node
/**
 * Post-build script for GitHub Pages deployment
 *
 * With page.tsx now rendering the dashboard at the root (/),
 * Next.js automatically generates index.html as the landing page.
 * No redirect needed - clean structure!
 *
 * This script ensures public assets (like data.json) are copied to the build output.
 */

const fs = require('fs');
const path = require('path');

// Copy public data files to dash output
const publicDir = path.join(__dirname, '../public');
const dashDir = path.join(__dirname, '../../dash');

if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    if (file.endsWith('.json') || file.endsWith('.svg') || file.endsWith('.txt')) {
      const src = path.join(publicDir, file);
      const dest = path.join(dashDir, file);
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${file}`);
    }
  });
}

console.log('✅ Post-build: Dashboard files ready in /dash/');
