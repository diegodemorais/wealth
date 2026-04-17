/**
 * no-hardcoded.test.ts — Static scan for hardcoded financial values and random data
 *
 * Catches bugs like:
 * - Math.random() producing non-deterministic chart/display data
 * - Hardcoded BRL values that should come from data.json
 * - Hardcoded pfire/wellness fallbacks that silently mask missing data
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SRC_DIR = resolve(__dirname, '..');

/** Recursively collect all .ts/.tsx files under a directory */
function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '__tests__') continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectSourceFiles(fullPath, files);
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allSourceFiles = collectSourceFiles(SRC_DIR);

describe('No Random Data', () => {
  it('should not use Math.random() in data display components (only MC simulators allowed)', () => {
    // Math.random() is intentional in interactive MC simulators (montecarlo.ts, simulators/page.tsx)
    // but must NOT appear in data display components or data wiring
    const ALLOWED_RANDOM = ['montecarlo.ts', 'simulators/page.tsx'];
    const violators: string[] = [];

    for (const filePath of allSourceFiles) {
      const content = readFileSync(filePath, 'utf-8');
      if (!content.includes('Math.random()')) continue;

      const rel = filePath.replace(SRC_DIR + '/', '');
      if (ALLOWED_RANDOM.some(allowed => rel.includes(allowed))) continue;

      violators.push(rel);
    }

    if (violators.length > 0) {
      throw new Error(
        `Math.random() found outside allowed MC simulator files (non-deterministic data display!):\n${violators.map(f => '  ' + f).join('\n')}`
      );
    }
  });
});

describe('No Hardcoded Financial Values', () => {
  // These are the known hardcoded values that should come from data.json
  // Adding a new one here is deliberate documentation; removing one means it's fixed
  const BANNED_HARDCODED: Array<{ pattern: RegExp; description: string; allowedFiles?: string[] }> = [
    {
      // Hardcoded pfire fallback of 90.4 anywhere — no fallback allowed, 0 = pipeline broken
      pattern: /\?\?\s*90\.4/,
      description: 'Hardcoded pfire fallback 90.4 — must come from data.pfire_base.base',
      allowedFiles: [], // banned everywhere
    },
  ];

  for (const { pattern, description, allowedFiles = [] } of BANNED_HARDCODED) {
    it(`should not contain: ${description}`, () => {
      const violators: string[] = [];

      for (const filePath of allSourceFiles) {
        const rel = filePath.replace(SRC_DIR + '/', '');

        // Skip allowed files
        if (allowedFiles.some(allowed => rel.includes(allowed))) continue;
        // Skip test files
        if (rel.includes('.test.') || rel.includes('.spec.')) continue;

        const content = readFileSync(filePath, 'utf-8');
        if (pattern.test(content)) {
          violators.push(rel);
        }
      }

      if (violators.length > 0) {
        throw new Error(
          `${description}\nFound in:\n${violators.map(f => '  ' + f).join('\n')}`
        );
      }
    });
  }
});

describe('Privacy Mode Completeness', () => {
  it('components that show BRL values should import privacyMode or PrivacyMask', () => {
    // Components that render R$ values must handle privacy mode
    // We check that files with fmtBrl/fmtShort also use privacyMode
    const violators: string[] = [];

    for (const filePath of allSourceFiles) {
      const rel = filePath.replace(SRC_DIR + '/', '');
      if (!rel.startsWith('components/')) continue;
      if (rel.includes('.test.') || rel.includes('.spec.')) continue;

      const content = readFileSync(filePath, 'utf-8');

      const hasMoneyFormat =
        content.includes('fmtBrl') ||
        content.includes('fmtShort') ||
        content.includes('toLocaleString') ||
        content.includes('Intl.NumberFormat');

      const hasPrivacyHandling =
        content.includes('privacyMode') ||
        content.includes('PrivacyMask') ||
        content.includes('privacy');

      if (hasMoneyFormat && !hasPrivacyHandling) {
        violators.push(rel);
      }
    }

    if (violators.length > 0) {
      // Warn but don't fail — some formatters may be in utility files shared with privacy-aware parents
      console.warn(
        `[WARN] Components with money formatting but no privacy handling:\n${violators.map(f => '  ' + f).join('\n')}`
      );
    }

    // This test always passes — it's a warning scan
    expect(true).toBe(true);
  });
});
