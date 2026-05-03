/**
 * data-key-mapping.test.ts — Static enforcement of canonical data.json key access
 *
 * These tests prevent regressions where wrong key names (e.g. `ipca_medio` instead of
 * `ipca2050`, or `RF`/`Crypto` instead of `IPCA`/`HODL11`) silently break data wiring.
 *
 * Each test scans source files for known-wrong patterns. A match means a bug.
 *
 * Issue: DEV-calc-centralization — data audit findings
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SRC_DIR = resolve(__dirname, '..');
const DATA_WIRING = resolve(__dirname, '../../src/utils/dataWiring.ts');

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

function readFile(path: string): string {
  return readFileSync(path, 'utf-8');
}

function assertNoMatch(
  files: string[],
  pattern: RegExp,
  description: string,
  allowedFiles: string[] = [],
): void {
  const violators: string[] = [];
  for (const filePath of files) {
    const rel = filePath.replace(SRC_DIR + '/', '');
    if (allowedFiles.some(a => rel.includes(a))) continue;
    if (pattern.test(readFile(filePath))) violators.push(rel);
  }
  if (violators.length > 0) {
    throw new Error(
      `${description}\nFound in:\n` + violators.map(f => `  ${f}`).join('\n'),
    );
  }
}

function assertMatch(
  filePath: string,
  pattern: RegExp,
  description: string,
): void {
  const content = readFile(filePath);
  if (!pattern.test(content)) {
    throw new Error(`${description}\nFile: ${filePath.replace(SRC_DIR + '/', '')}`);
  }
}

// ── dca_status key names ──────────────────────────────────────────────────────

describe('dca_status — canonical key names from data.json', () => {
  it('dataWiring.ts must NOT access dca_status.ipca_medio (wrong key — use ipca2050)', () => {
    const content = readFile(DATA_WIRING);
    expect(content).not.toMatch(/dca_status\??\.ipca_medio/);
  });

  it('dataWiring.ts must access dca_status.ipca2050 for IPCA+2050', () => {
    const content = readFile(DATA_WIRING);
    expect(content).toMatch(/dca_status\??\.ipca2050/);
  });

  it('no source file uses dca_status.ipca_medio (banned wrong alias)', () => {
    assertNoMatch(allSourceFiles, /dca_status\??\.ipca_medio/, 'dca_status.ipca_medio does not exist in data.json — use dca_status.ipca2050');
  });
});

// ── drift bucket names ────────────────────────────────────────────────────────

describe('drift — canonical bucket names from data.json', () => {
  it("dataWiring.ts must NOT iterate over 'RF' or 'Crypto' drift buckets (they don't exist)", () => {
    const content = readFile(DATA_WIRING);
    // These patterns indicate the old wrong bucket names being iterated
    expect(content).not.toMatch(/['"]RF['"]\s*,\s*['"]Crypto['"]/);
    expect(content).not.toMatch(/['"]Crypto['"]\s*,\s*['"]RF['"]/);
  });

  it("dataWiring.ts must iterate over 'IPCA' and 'HODL11' drift buckets", () => {
    const content = readFile(DATA_WIRING);
    expect(content).toMatch(/'IPCA'/);
    expect(content).toMatch(/'HODL11'/);
  });

  it("no source file references data.drift.RF or data.drift.Crypto (don't exist in data.json)", () => {
    assertNoMatch(
      allSourceFiles,
      /data\.drift\??\.(?:RF|Crypto)\b/,
      "data.drift.RF and data.drift.Crypto don't exist — canonical buckets are SWRD, AVGS, AVEM, IPCA, HODL11",
    );
  });
});

// ── fire_swr_percentis key names ─────────────────────────────────────────────

describe('fire_swr_percentis — canonical field names', () => {
  it('withdraw/page.tsx must access fire_swr_percentis.swr_p10 (not raw .p10 alias)', () => {
    const withdrawPage = allSourceFiles.find(f => f.includes('withdraw') && f.endsWith('page.tsx'));
    if (!withdrawPage) throw new Error('withdraw/page.tsx not found');
    const content = readFile(withdrawPage);
    // The canonical path must be present — NOT the old aliases
    expect(content).toMatch(/fire_swr_percentis/);
    // Old wrong pattern: swr_percentis?.p10 (where .p10 was an alias that swapped with swr_p10)
    expect(content).not.toMatch(/\.swr_percentis\??\.p10\b/);
    expect(content).not.toMatch(/\.swr_percentis\??\.p50\b/);
  });

  it('dataWiring.ts or withdraw/page.tsx must not use ambiguous .p10 from swr_percentis (use swr_p10)', () => {
    const candidates = allSourceFiles.filter(f =>
      f.includes('withdraw') || f.includes('dataWiring'),
    );
    // The bug was: fallback `raw.p10 ?? raw.swr_p10` where p10 was a tax rate, not patrimônio
    assertNoMatch(
      candidates,
      /raw\.p10\s*\?\?/,
      'raw.p10 ?? ... in swr_percentis context is ambiguous: p10 is a rate, not patrimônio. Use swr_p10 directly.',
    );
  });
});

// ── swr_gatilho — no hardcoded 0.03 in fire calc context ─────────────────────

describe('swr_gatilho — must not hardcode 0.03 in SWR calculations', () => {
  it('fire/page.tsx must not use hardcoded / 0.03 without premissas fallback', () => {
    const firePage = allSourceFiles.find(f => f.includes('/fire/') && f.endsWith('page.tsx'));
    if (!firePage) throw new Error('fire/page.tsx not found');
    const content = readFile(firePage);
    // Hardcoded standalone division by 0.03 is banned — must use swr_gatilho
    // Allow: `?? 0.03` (as fallback value), but not `/ 0.03` alone
    const lines = content.split('\n');
    const violations = lines.filter(l => /\/\s*0\.03\b/.test(l) && !/swr_gatilho/.test(l) && !l.trimStart().startsWith('//'));
    expect(violations, `Hardcoded / 0.03 without swr_gatilho context:\n${violations.join('\n')}`).toHaveLength(0);
  });
});

// ── ano_atual — YTD year label must not be hardcoded ─────────────────────────

describe('ano_atual — year in YTD label must come from premissas', () => {
  it('NOW page TWR label must come from data (not raw new Date().getFullYear())', () => {
    // After DEV-now-refactor, KPI hero strip moved to NowKpiPrimario.
    // The TWR sub now uses `data?.retornos_mensais?.periodo_anos` (data-driven).
    // Guard: ensure no `new Date().getFullYear()` in TWR context.
    const candidates = allSourceFiles.filter(f =>
      f.endsWith('/app/page.tsx') || f.endsWith('/components/now/NowKpiPrimario.tsx')
    );
    if (candidates.length === 0) throw new Error('NOW page or NowKpiPrimario not found');
    const combined = candidates.map(readFile).join('\n');
    // TWR context must not hardcode current year via new Date()
    const twrLineMatch = combined.match(/BRL\s*·\s*TWR[^]*?periodo_anos|TWR\s*·\s*desde[^}]+/);
    expect(combined).toMatch(/periodo_anos|ano_atual/);
    if (twrLineMatch) {
      // Within the TWR block, ensure no raw getFullYear() call
      const block = twrLineMatch[0];
      expect(block).not.toMatch(/new\s+Date\(\)\.getFullYear\(\)/);
    }
  });
});
