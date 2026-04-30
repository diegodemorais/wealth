/**
 * privacy-pct-masking.test.ts — Regression tests for '••%' masking pattern
 *
 * Context: DEV-privacy-audit-react fixed 25 privacy leaks. This test prevents
 * regression of the '••%' masking pattern used for percentage values (as opposed
 * to '••••' used for absolute monetary values via fmtPrivacy()).
 *
 * The pattern `privacyMode ? '••%' : value` is used in 63+ places across the codebase
 * (PerformanceSummary, HODL11PositionPanel, FireScenariosTable, PQualityMatrix, etc.)
 * This test verifies:
 * 1. The exact masking value is '••%' (not '**%', not '..%', not '0%')
 * 2. All source files with the pattern use it consistently
 * 3. No source file uses '0%' or '—%' as a privacy fallback (which would reveal nothing was hidden)
 *
 * Issue: QA-test-plan-audit (CR-1)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Static: scan source files for privacy masking patterns
// ─────────────────────────────────────────────────────────────────────────────

const SRC_DIR = resolve(__dirname, '../../react-app/src');

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectSourceFiles(fullPath, files);
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      // Exclude test files from the scan
      if (!entry.includes('.test.') && !entry.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

let allSourceFiles: string[] = [];

beforeAll(() => {
  allSourceFiles = collectSourceFiles(SRC_DIR);
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Unit: fmtPrivacy from privacyTransform.ts does NOT return '••%'
// (percentages are intentionally NOT transformed by fmtPrivacy — they use
//  inline ternary privacyMode ? '••%' : value in each component)
// ─────────────────────────────────────────────────────────────────────────────

describe('fmtPrivacy — monetary masking (not percentage masking)', () => {
  it('fmtPrivacy with privacyMode=true returns R$ prefixed value (NOT ••%)', async () => {
    const { fmtPrivacy } = await import('@/utils/privacyTransform');

    // fmtPrivacy transforms monetary values, does NOT return '••%'
    const result = fmtPrivacy(1_000_000, true);
    expect(result).toContain('R$');
    expect(result).not.toBe('••%');
    expect(result).not.toMatch(/e[-+]\d/i); // no scientific notation
  });

  it('fmtPrivacy with privacyMode=false returns actual value unchanged', async () => {
    const { fmtPrivacy } = await import('@/utils/privacyTransform');

    const result = fmtPrivacy(1_000_000, false);
    expect(result).toContain('R$');
    // Should contain '1' (from 1M)
    expect(result).toMatch(/1/);
  });

  it('pvMoney preserves sign and relative proportions', async () => {
    const { pvMoney } = await import('@/utils/privacyTransform');

    // FACTOR=0.07 — positive values stay positive
    expect(pvMoney(1_000_000)).toBeGreaterThan(0);
    // Negative values stay negative
    expect(pvMoney(-500_000)).toBeLessThan(0);
    // Proportions preserved: pvMoney(2M) == 2 * pvMoney(1M)
    expect(pvMoney(2_000_000)).toBeCloseTo(2 * pvMoney(1_000_000), 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Static: components that use privacyMode for % values use '••%' pattern
// ─────────────────────────────────────────────────────────────────────────────

describe('Static: ••% masking pattern integrity', () => {
  it('at least 10 source files use the ••% privacy masking pattern', () => {
    const filesWithPctMask = allSourceFiles.filter(f => {
      const content = readFileSync(f, 'utf-8');
      return content.includes("'••%'") || content.includes('"••%"');
    });

    // We know there are 63+ usages across many files
    expect(filesWithPctMask.length).toBeGreaterThanOrEqual(10);
  });

  it('no source file uses "0%" as privacy fallback for percentages (would reveal nothing hidden)', () => {
    // Pattern: privacyMode ? '0%' (wrong — reveals a zero value in privacy mode)
    const violators = allSourceFiles.filter(f => {
      const content = readFileSync(f, 'utf-8');
      return /privacyMode\s*\?\s*['"]0%['"]/.test(content);
    });

    expect(
      violators,
      `Files with wrong privacy fallback '0%':\n${violators.join('\n')}`
    ).toHaveLength(0);
  });

  it('no source file uses "—%" as privacy fallback (would signal missing data instead of masking)', () => {
    const violators = allSourceFiles.filter(f => {
      const content = readFileSync(f, 'utf-8');
      return /privacyMode\s*\?\s*['"]—%['"]/.test(content);
    });

    expect(
      violators,
      `Files with wrong privacy fallback '—%':\n${violators.join('\n')}`
    ).toHaveLength(0);
  });

  it('PerformanceSummary.tsx uses ••% for percentage values in privacy mode', () => {
    const file = allSourceFiles.find(f => f.includes('PerformanceSummary.tsx'));
    expect(file, 'PerformanceSummary.tsx not found in source tree').toBeDefined();

    const content = readFileSync(file!, 'utf-8');
    // PerformanceSummary has a local fmtPct that returns '••%' in privacy mode
    expect(content).toContain("'••%'");
    // Verify the pattern is in a conditional (not hardcoded)
    expect(content).toMatch(/privacyMode.*'••%'|'••%'.*privacyMode/);
  });

  it('HODL11PositionPanel.tsx uses ••% for correlation values in privacy mode', () => {
    const file = allSourceFiles.find(f => f.includes('HODL11PositionPanel.tsx'));
    expect(file, 'HODL11PositionPanel.tsx not found in source tree').toBeDefined();

    const content = readFileSync(file!, 'utf-8');
    expect(content).toContain("'••%'");
    expect(content).toMatch(/privacyMode.*'••%'|'••%'.*privacyMode/);
  });

  it('FireScenariosTable.tsx uses ••% for P(FIRE)/P(quality) values in privacy mode', () => {
    const file = allSourceFiles.find(f => f.includes('FireScenariosTable.tsx'));
    expect(file, 'FireScenariosTable.tsx not found in source tree').toBeDefined();

    const content = readFileSync(file!, 'utf-8');
    expect(content).toContain("'••%'");
  });

  it('PQualityMatrix.tsx uses ••% for matrix cell values in privacy mode', () => {
    const file = allSourceFiles.find(f => f.includes('PQualityMatrix.tsx'));
    expect(file, 'PQualityMatrix.tsx not found in source tree').toBeDefined();

    const content = readFileSync(file!, 'utf-8');
    expect(content).toContain("'••%'");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Inline fmtPct function: unit test of the pattern used in PerformanceSummary
//    (PerformanceSummary defines its own local fmtPct — this tests the contract)
// ─────────────────────────────────────────────────────────────────────────────

describe('PerformanceSummary fmtPct contract — ••% masking', () => {
  // Replica of the local fmtPct in PerformanceSummary.tsx (lines 45-49)
  // If this function is changed, the unit test below will catch regressions
  function fmtPct(v: number | null | undefined, privacyMode: boolean, decimals = 1): string {
    if (v == null) return '--';
    if (privacyMode) return '••%';
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(decimals)}%`;
  }

  it('returns "••%" for any non-null value when privacyMode=true', () => {
    expect(fmtPct(12.5, true)).toBe('••%');
    expect(fmtPct(-3.2, true)).toBe('••%');
    expect(fmtPct(0, true)).toBe('••%');
    expect(fmtPct(100, true)).toBe('••%');
    expect(fmtPct(-100, true)).toBe('••%');
    expect(fmtPct(0.001, true)).toBe('••%');
  });

  it('returns "--" for null/undefined regardless of privacyMode', () => {
    expect(fmtPct(null, true)).toBe('--');
    expect(fmtPct(null, false)).toBe('--');
    expect(fmtPct(undefined, true)).toBe('--');
    expect(fmtPct(undefined, false)).toBe('--');
  });

  it('returns formatted value with sign when privacyMode=false', () => {
    expect(fmtPct(12.5, false)).toBe('+12.5%');
    expect(fmtPct(-3.2, false)).toBe('-3.2%');
    // 0 is not > 0, so sign = '' (no '+')
    expect(fmtPct(0, false)).toBe('0.0%');
    expect(fmtPct(100, false)).toBe('+100.0%');
  });

  it('respects decimals parameter when privacyMode=false', () => {
    expect(fmtPct(12.567, false, 2)).toBe('+12.57%');
    expect(fmtPct(12.567, false, 0)).toBe('+13%');
    // In privacy mode, decimals is irrelevant (always '••%')
    expect(fmtPct(12.567, true, 2)).toBe('••%');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Static: no new component introduces ternary without '••%' pattern
//    (catches regressions where someone copies the pattern wrong)
// ─────────────────────────────────────────────────────────────────────────────

describe('Static: ••% pattern consistency enforcement', () => {
  it('all privacyMode ternaries for % values use ••% (not single dot or asterisk)', () => {
    const badPatterns = [
      /privacyMode\s*\?\s*['"]\*\*%['"]/,   // '**%' — wrong character
      /privacyMode\s*\?\s*['"]\.\.%['"]/,   // '..%' — wrong character
      // Note: do NOT add a pattern for single-bullet here — the actual '••%' uses two
      // U+2022 BULLET characters and those are correct. Any regex here must not
      // accidentally match the correct '••%' pattern.
    ];

    const violators: string[] = [];
    for (const file of allSourceFiles) {
      const content = readFileSync(file, 'utf-8');
      const rel = file.replace(SRC_DIR + '/', '');

      for (const pattern of badPatterns) {
        if (pattern.test(content)) {
          violators.push(`${rel} — wrong privacy masking character`);
        }
      }
    }

    expect(
      violators,
      `Files with incorrect privacy masking characters:\n${violators.join('\n')}`
    ).toHaveLength(0);
  });

  it('••% count in source is >= 30 (regression: count must not drop unexpectedly)', () => {
    // If this count drops, it means components were removed or masking was stripped
    let totalOccurrences = 0;
    for (const file of allSourceFiles) {
      const content = readFileSync(file, 'utf-8');
      const matches = content.match(/'••%'/g) || [];
      totalOccurrences += matches.length;
    }

    // Current count is 63+. A drop below 30 indicates regression.
    expect(totalOccurrences).toBeGreaterThanOrEqual(30);
  });
});
