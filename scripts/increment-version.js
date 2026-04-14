#!/usr/bin/env node
/**
 * Increment package.json version and inject into HTML/React
 */

const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '../react-app/package.json');
const versionFile = path.join(__dirname, '../react-app/src/config/version.ts');

// Read current version
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

// Increment patch
const newVersion = `${major}.${minor}.${patch + 1}`;
pkg.version = newVersion;

// Write back to package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// Create version.ts for React
const versionTS = `// Auto-generated on build
export const DASHBOARD_VERSION = '${newVersion}';
export const BUILD_DATE = '${new Date().toISOString()}';
`;

fs.mkdirSync(path.dirname(versionFile), { recursive: true });
fs.writeFileSync(versionFile, versionTS);

console.log(`✓ Version incremented to ${newVersion}`);
console.log(`✓ Generated src/config/version.ts`);
