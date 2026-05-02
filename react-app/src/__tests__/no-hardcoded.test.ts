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

describe('No Local fmtBrl Declarations', () => {
  // DEV-privacy-deep-fix: enforce single source of truth for BRL formatting.
  // Local fmtBrl/fmtBRL declarations must use fmtBrlPrivate from formatters.ts
  // to ensure privacy mode is honored. Allowed only in formatters.ts itself.
  it('should not declare local fmtBrl/fmtBRL functions outside formatters.ts', () => {
    // Patterns that indicate a local declaration (heuristic):
    //   function fmtBrl(...   |   function fmtBRL(...
    //   const fmtBrl = (...    |   const fmtBRL = (...
    // Allow when the body delegates to fmtPrivacy or fmtBrlPrivate (privacy-aware wrapper)
    const NAMED_PATTERN = /(?:function\s+(?:fmtBrl|fmtBRL)\s*\(|(?:const|let)\s+(?:fmtBrl|fmtBRL|fmtBrlK|fmtBRLfire)\s*=\s*(?:\(|function))/;
    const violators: string[] = [];

    for (const filePath of allSourceFiles) {
      const rel = filePath.replace(SRC_DIR + '/', '');
      if (rel.includes('utils/formatters.ts')) continue; // canonical source
      if (rel.includes('.test.') || rel.includes('.spec.')) continue;

      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (!NAMED_PATTERN.test(line)) return;

        // Look ahead a few lines to see if the body is privacy-aware.
        // Allowed forms:
        //   - delegates to fmtPrivacy / fmtBrlPrivate
        //   - takes a `priv` / `privacyMode` / `pm` boolean and branches on it
        //   - returns 'R$ ••••' (the canonical privacy mask)
        const lookahead = lines.slice(idx, idx + 12).join('\n');
        if (
          /fmtPrivacy\s*\(|fmtBrlPrivate\s*\(|fmtBrlM\s*\(/.test(lookahead) ||
          /R\$\s*•••/.test(lookahead) ||
          /\b(priv|pm|privacyMode)\s*[:?)]/.test(lookahead)
        ) return;

        violators.push(`${rel}:${idx + 1}`);
      });
    }

    if (violators.length > 0) {
      throw new Error(
        `Local fmtBrl/fmtBRL declarations without privacy wrapping:\n${violators.map(f => '  ' + f).join('\n')}\n\nUse fmtBrlPrivate from @/utils/formatters instead.`
      );
    }
  });
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

      // Skip files with explicit privacy-ok exception comment
      if (content.includes('// privacy-ok')) continue;

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

    expect(violators).toHaveLength(0);
    if (violators.length > 0) {
      throw new Error(
        `Components with money formatting but no privacy handling:\n${violators.map(f => '  ' + f).join('\n')}`
      );
    }
  });
});
