#!/usr/bin/env node
/**
 * Post-build script for GitHub Pages deployment
 *
 * 1. Moves build output from .dash (Turbopack-compatible) to ../dash
 * 2. Copies public assets (data.json, etc.) to final output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const tempDash = path.join(projectRoot, '.dash');
const finalDash = path.join(projectRoot, '..', 'dash');
const publicDir = path.join(projectRoot, 'public');

// 1. Move .dash to ../dash
if (fs.existsSync(tempDash)) {
  try {
    // Remove old dash if exists
    if (fs.existsSync(finalDash)) {
      execSync(`rm -rf ${finalDash}`);
    }
    // Move temp to final
    execSync(`mv ${tempDash} ${finalDash}`);
    console.log('✅ Moved .dash → ../dash/');
  } catch (err) {
    console.error('❌ Failed to move .dash:', err.message);
    process.exit(1);
  }
}

// 2. Copy public assets to final output
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    if (file.endsWith('.json') || file.endsWith('.svg') || file.endsWith('.txt')) {
      const src = path.join(publicDir, file);
      const dest = path.join(finalDash, file);
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${file}`);
    }
  });
}

console.log('✅ Post-build: Dashboard ready in /dash/');
