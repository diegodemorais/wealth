#!/usr/bin/env node
/**
 * Generate version.ts from version.json
 *
 * This ensures the React app always shows the current version
 * Works with the external version.json pipeline
 */

const fs = require('fs');
const path = require('path');

const versionJsonPath = path.join(__dirname, '../public/version.json');
const versionTsPath = path.join(__dirname, '../src/config/version.ts');

try {
  // Read version.json
  const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));

  // Generate version.ts
  const versionTs = `// Auto-generated from version.json by scripts/generate-version.js
export const DASHBOARD_VERSION = '${versionData.version}';
export const BUILD_DATE = '${versionData.buildDate}';
`;

  // Write version.ts
  fs.writeFileSync(versionTsPath, versionTs);
  console.log(`✅ Generated version.ts from version.json (v${versionData.version})`);

} catch (error) {
  console.error('❌ Error generating version.ts:', error.message);
  process.exit(1);
}
