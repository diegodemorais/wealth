#!/usr/bin/env node
/**
 * Post-build script for GitHub Pages deployment
 *
 * With page.tsx now rendering the dashboard at the root (/),
 * Next.js automatically generates index.html as the landing page.
 * No redirect needed - clean structure!
 */

console.log('✅ Post-build: Root page renders dashboard directly (no redirect needed)');
