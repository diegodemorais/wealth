/**
 * css-var-alpha.test.ts — Detect invalid CSS var() + alpha hex/decimal antipattern
 *
 * Bug origin (2026-05-02, commit 9e748774): FactorLoadings.tsx used a template
 * literal concatenating var(--accent) with hex alpha "cc"/"66". The resulting
 * "var(--accent)cc" is INVALID CSS — browser silently drops the rule, leaving
 * the element transparent.
 *
 * Why this is invisible in unit tests:
 *   - jsdom does NOT validate CSS (no rendering engine).
 *   - The malformed string is accepted by style.background assignment.
 *   - Regression only visible to a human eyeballing the rendered chart.
 *
 * Valid alternatives:
 *   - color-mix(in srgb, var(--accent) 80%, transparent)   <- modern, preferred
 *   - rgba(var(--accent-rgb), 0.8)                          <- if var defined as RGB triplet
 *   - #58a6ffcc                                              <- hex literal with alpha (8-digit)
 *
 * This test scans .ts/.tsx in src/components and src/app, stripping comments
 * (line + block) so documentation strings about the bug don't trigger.
 */

import { describe, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SRC_DIR = resolve(__dirname, '..');
const SCAN_ROOTS = ['components', 'app'];

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

/**
 * Strip JS line and block comments from source, preserving line breaks
 * so error messages report the correct line number.
 *
 * Approach: regex-based, naive but sufficient — we only need to neutralize
 * comments so that doc-strings discussing the antipattern don't trigger.
 * False positive risk: a string literal containing the literal "//" inside
 * code (e.g. URLs in strings) won't be stripped, which is fine — we only
 * care about NOT scanning comment text.
 */
function stripComments(src: string): string {
  // Block comments: replace with same-length whitespace (preserve newlines).
  let out = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  // Line comments: replace from `//` to end of line with spaces.
  out = out.replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));
  return out;
}

describe('CSS var() + alpha antipattern detection', () => {
  // Pattern 1: var(--xxx) followed by exactly 2 hex chars (alpha).
  //   (?![0-9a-fA-F%]) excludes a 3rd hex digit (would not be alpha) and `%`
  //   (which means a color-mix percent argument, valid).
  // Catches: var(--accent)cc, var(--accent)CC, var(--accent) cc
  const ALPHA_HEX = new RegExp('var\\(--[\\w-]+\\)\\s*[0-9a-fA-F]{2}(?![0-9a-fA-F%])\\b');

  // Pattern 2: var(--xxx) followed by a decimal alpha (0.5, .5, 0.85).
  //   (?!\s*%) excludes the (very unusual) `var(--x) 0.5%` form.
  const ALPHA_DECIMAL = new RegExp('var\\(--[\\w-]+\\)\\s*(?:0?\\.\\d|0\\.\\d)(?!\\s*%)');

  /**
   * Allowlist — paths exempt from scan. Empty for now: post-fix codebase is clean.
   * Document precedent here if a real false positive ever appears.
   */
  const ALLOWLIST: string[] = [];

  it('should not concatenate alpha hex/decimal directly to var(--*) in CSS strings', () => {
    const allFiles: string[] = [];
    for (const root of SCAN_ROOTS) {
      const rootDir = join(SRC_DIR, root);
      try { collectSourceFiles(rootDir, allFiles); } catch { /* root may not exist */ }
    }

    type Hit = { file: string; line: number; text: string; kind: 'hex' | 'decimal' };
    const hits: Hit[] = [];

    for (const filePath of allFiles) {
      const rel = filePath.replace(SRC_DIR + '/', '');
      if (ALLOWLIST.some(allowed => rel.includes(allowed))) continue;
      if (rel.includes('.test.') || rel.includes('.spec.')) continue;

      const raw = readFileSync(filePath, 'utf-8');
      const stripped = stripComments(raw);
      const lines = stripped.split('\n');
      const rawLines = raw.split('\n');

      lines.forEach((line, idx) => {
        if (ALPHA_HEX.test(line)) hits.push({ file: rel, line: idx + 1, text: rawLines[idx].trim(), kind: 'hex' });
        else if (ALPHA_DECIMAL.test(line)) hits.push({ file: rel, line: idx + 1, text: rawLines[idx].trim(), kind: 'decimal' });
      });
    }

    if (hits.length > 0) {
      const detail = hits.map(h => '  ' + h.file + ':' + h.line + ' [' + h.kind + '] ' + h.text.slice(0, 160)).join('\n');
      const msg = [
        'Invalid CSS var() + alpha concatenation detected (browser silently drops the rule,',
        'leaving the element transparent). Precedent: FactorLoadings.tsx pre-fix 9e748774',
        'used template literal concatenating var(--accent) with hex alpha "cc"/"66" — the',
        'resulting "var(--accent)cc" is invalid CSS and rendered chart bars invisible.',
        '',
        'Hits:',
        detail,
        '',
        'Fix options:',
        '  1. color-mix(in srgb, var(--accent) 80%, transparent)   <- modern, preferred',
        '  2. Hex literal with alpha: "#58a6ffcc" (8-digit hex)',
        '  3. rgba(var(--accent-rgb), 0.8)  -- only if --accent-rgb is defined as "R, G, B" triplet',
      ].join('\n');
      throw new Error(msg);
    }
  });
});
