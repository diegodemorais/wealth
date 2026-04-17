/**
 * calc-centralization.test.ts — Static enforcement of DEV-calc-centralization
 *
 * These tests scan source files to catch any re-implementation of
 * calculations that must come from a single canonical source.
 *
 * Adding a new inline version of these calculations will break the build.
 * To add a legitimate exception, add the file path to the allowedFiles list
 * and document why.
 *
 * Issue: DEV-calc-centralization
 */

import { describe, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SRC_DIR = resolve(__dirname, '..');

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

/**
 * Assert no source file (outside allowedFiles) matches a pattern.
 * Throws with violating file paths so the fix location is obvious.
 */
function assertNoMatch(
  pattern: RegExp,
  description: string,
  allowedFiles: string[] = [],
): void {
  const violators: string[] = [];

  for (const filePath of allSourceFiles) {
    const rel = filePath.replace(SRC_DIR + '/', '');
    if (allowedFiles.some(allowed => rel.includes(allowed))) continue;
    const content = readFileSync(filePath, 'utf-8');
    if (pattern.test(content)) violators.push(rel);
  }

  if (violators.length > 0) {
    throw new Error(
      `${description}\nImport from @/utils/fire instead. Found in:\n` +
      violators.map(f => `  ${f}`).join('\n'),
    );
  }
}

// ── C1: calcFireYear must not be re-defined inline ────────────────────────────

describe('C1 — calcFireYear must only be defined in utils/fire.ts', () => {
  it('no other file defines function calcFireYear(', () => {
    assertNoMatch(
      /function calcFireYear\s*\(/,
      'calcFireYear() is re-defined inline. Use the canonical import: import { calcFireYear } from "@/utils/fire"',
      ['utils/fire.ts'],
    );
  });

  it('no other file defines an arrow calcFireYear =', () => {
    assertNoMatch(
      /const calcFireYear\s*=\s*\(/,
      'calcFireYear() is re-defined as an arrow function. Use the canonical import from @/utils/fire',
      ['utils/fire.ts'],
    );
  });
});

// ── A1: pfireColor must not be re-implemented inline ─────────────────────────

describe('A1 — pfireColor thresholds must come from utils/fire.ts', () => {
  it('no file defines a local pfireColor function (arrow or declaration)', () => {
    // Catches: "function pfireColor(" or "const pfireColor = (v:" — but NOT "const pfireColor = pfireColorFn(...)"
    // The latter is a value assignment (result of calling the fn), not a re-definition.
    assertNoMatch(
      /(?:function pfireColor\s*\(|const pfireColor\s*=\s*\()/,
      'pfireColor() is re-defined as a function. Use: import { pfireColor } from "@/utils/fire"',
      ['utils/fire.ts'],
    );
  });

  it('no file uses the old wrong green threshold (>= 88)', () => {
    // The canonical threshold is >= 90 for green. >= 88 was the wrong NOW tab value.
    assertNoMatch(
      />= 88\s*\?\s*['"]var\(--green\)['"]/,
      'Inline pfireColor threshold >= 88 detected (wrong). Canonical is >= 90. Use pfireColor() from @/utils/fire',
      [],
    );
  });

  it('no file uses inline pfireColor pattern: >= 90 ? var(--green)', () => {
    // This is the canonical implementation — it should only live in utils/fire.ts
    assertNoMatch(
      />= 90\s*\?\s*['"]var\(--green\)['"]\s*:\s*.*>= 85\s*\?\s*['"]var\(--yellow\)['"]/,
      'Inline pfireColor ternary re-implemented. Use: import { pfireColor } from "@/utils/fire"',
      ['utils/fire.ts'],
    );
  });
});

// ── A2: hardcoded fire year base must not appear in calc context ──────────────

describe('A2 — hardcoded year/age constants banned in FIRE calculations', () => {
  it('no calc code uses "2026 + yr" pattern (hardcoded base year)', () => {
    assertNoMatch(
      /\b2026\s*\+\s*yr\b/,
      'Hardcoded year 2026 in fire calc. Use getAnoAtual(premissas) from @/utils/fire',
      [],
    );
  });

  it('no calc code uses "ano: 2026 +" (hardcoded year in return)', () => {
    assertNoMatch(
      /ano:\s*2026\s*\+/,
      'Hardcoded year 2026 in fire calc return. Use getAnoAtual(premissas) from @/utils/fire',
      [],
    );
  });

  it('no calc code hardcodes age base as literal 39 in fire projection', () => {
    // Pattern: "39 + yr" or "39 + Math" — the classic hardcoded age
    assertNoMatch(
      /\b39\s*\+\s*(?:yr|Math\.ceil|currentAge)/,
      'Hardcoded age 39 in fire projection. Use getIdadeAtual(premissas) from @/utils/fire',
      ['TimeToFireProgressBar.tsx'], // fallback default in prop, acceptable
    );
  });
});

// ── B3: new Date().getFullYear() without fallback in financial calc files ─────

describe('B3 — new Date().getFullYear() must use premissas.ano_atual when available', () => {
  it('app/ pages must not use raw new Date().getFullYear() in fire/year calculations', () => {
    const appFiles = allSourceFiles.filter(f =>
      f.includes('/app/') &&
      !f.includes('__tests__') &&
      (f.endsWith('.tsx') || f.endsWith('.ts')),
    );

    const violators: string[] = [];
    for (const filePath of appFiles) {
      const content = readFileSync(filePath, 'utf-8');
      const rel = filePath.replace(SRC_DIR + '/', '');

      // Only flag if the file also has financial calc context (fire, ano, patrimonio)
      const hasFireContext = /(?:fireYear|anoAtual|calcFireYear|patrimonio|swrTarget)/.test(content);
      if (!hasFireContext) continue;

      // Detect raw getFullYear() usage — not preceded by ?? (fallback is ok)
      // Pattern: getFullYear() as a standalone assignment (not as fallback)
      const rawUsage = /=\s*new Date\(\)\.getFullYear\(\)/.test(content);
      const asOnlySource = rawUsage && !content.includes('?? new Date().getFullYear()') &&
        !content.includes('ano_atual');

      if (asOnlySource) violators.push(rel);
    }

    if (violators.length > 0) {
      throw new Error(
        `Raw new Date().getFullYear() in fire calculation page (no premissas.ano_atual fallback):\n` +
        violators.map(f => `  ${f}`).join('\n') +
        '\nUse: premissas.ano_atual ?? new Date().getFullYear()',
      );
    }
  });
});
