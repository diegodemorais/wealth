#!/usr/bin/env node
/**
 * Increment version.json (external, for runtime)
 * Runs AFTER deploy — doesn't require rebuild
 */

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '../react-app/public/version.json');

if (!fs.existsSync(versionFile)) {
  console.log('❌ version.json not found');
  process.exit(1);
}

const version = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
const [major, minor, patch] = version.version.split('.').map(Number);

// Increment patch
const newVersion = `${major}.${minor}.${patch + 1}`;
version.version = newVersion;
version.lastUpdate = new Date().toISOString();

fs.writeFileSync(versionFile, JSON.stringify(version, null, 2) + '\n');

console.log(`✓ Version incremented to ${newVersion}`);
console.log(`✓ File: ${versionFile}`);
