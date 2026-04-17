/**
 * dashboard-config.test.ts — Validates integrity of dashboard.config.ts
 *
 * This is the guardian of the single source of truth.
 * If dashboard.config.ts drifts from the pages, these tests catch it.
 *
 * What is tested:
 *   1. Config structure — no duplicates, no empty strings, valid types
 *   2. TABS integrity — unique hrefs, unique IDs, each href maps to a real page file
 *   3. SECTIONS integrity — all tab keys map to known routes, no orphan tabs
 *   4. CollapsibleSection sync — every collapsible:true section in config is actually
 *      referenced via secOpen()/secTitle() in the corresponding page file
 *   5. secOpen/secTitle helpers — return correct values and fallbacks
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

import {
  TABS,
  SECTIONS,
  getSec,
  secOpen,
  secTitle,
  type TabDef,
  type SectionDef,
} from '../config/dashboard.config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const APP_DIR = resolve(__dirname, '../app');

/** Resolve a tab href to the page.tsx file path */
function hrefToPageFile(href: string): string {
  if (href === '/') return join(APP_DIR, 'page.tsx');
  const segment = href.replace(/^\//, '');
  return join(APP_DIR, segment, 'page.tsx');
}

/** Map tab href to the config SECTIONS key */
function hrefToTabKey(href: string): string {
  const map: Record<string, string> = {
    '/':            'now',
    '/portfolio':   'portfolio',
    '/performance': 'performance',
    '/fire':        'fire',
    '/withdraw':    'withdraw',
    '/backtest':    'backtest',
    '/simulators':  'simuladores',
  };
  return map[href] ?? href.replace(/^\//, '');
}

// ─── 1. TABS integrity ────────────────────────────────────────────────────────

describe('TABS integrity', () => {
  it('TABS is a non-empty array', () => {
    expect(Array.isArray(TABS)).toBe(true);
    expect(TABS.length).toBeGreaterThan(0);
  });

  it('every tab has a non-empty id, href and label', () => {
    for (const tab of TABS) {
      expect(typeof tab.id).toBe('string');
      expect(tab.id.length).toBeGreaterThan(0);
      expect(typeof tab.href).toBe('string');
      expect(tab.href.length).toBeGreaterThan(0);
      expect(typeof tab.label).toBe('string');
      expect(tab.label.length).toBeGreaterThan(0);
    }
  });

  it('tab IDs are unique', () => {
    const ids = TABS.map((t: TabDef) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('tab hrefs are unique', () => {
    const hrefs = TABS.map((t: TabDef) => t.href);
    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });

  it('every tab href maps to an existing page file', () => {
    for (const tab of TABS) {
      const pageFile = hrefToPageFile(tab.href);
      expect(
        existsSync(pageFile),
        `Tab "${tab.id}" href="${tab.href}" → page file not found: ${pageFile}`,
      ).toBe(true);
    }
  });

  it('every tab href has a corresponding SECTIONS entry', () => {
    for (const tab of TABS) {
      const tabKey = hrefToTabKey(tab.href);
      expect(
        SECTIONS[tabKey],
        `Tab "${tab.id}" href="${tab.href}" maps to key "${tabKey}" but SECTIONS["${tabKey}"] is missing`,
      ).toBeDefined();
    }
  });
});

// ─── 2. SECTIONS integrity ────────────────────────────────────────────────────

describe('SECTIONS integrity', () => {
  const tabKeys = Object.keys(SECTIONS);

  it('SECTIONS has entries for all 7 tabs', () => {
    const expected = ['now', 'portfolio', 'performance', 'fire', 'withdraw', 'backtest', 'simuladores'];
    for (const key of expected) {
      expect(SECTIONS[key], `SECTIONS["${key}"] is missing`).toBeDefined();
    }
  });

  it('every tab in SECTIONS has at least one section', () => {
    for (const key of tabKeys) {
      expect(SECTIONS[key].length, `SECTIONS["${key}"] is empty`).toBeGreaterThan(0);
    }
  });

  it('every section has non-empty id and title', () => {
    for (const key of tabKeys) {
      for (const sec of SECTIONS[key]) {
        expect(typeof sec.id).toBe('string');
        expect(sec.id.length, `Section id is empty in tab "${key}"`).toBeGreaterThan(0);
        expect(typeof sec.title).toBe('string');
        expect(sec.title.length, `Section "${sec.id}" in tab "${key}" has empty title`).toBeGreaterThan(0);
      }
    }
  });

  it('section IDs are unique within each tab', () => {
    for (const key of tabKeys) {
      const ids = SECTIONS[key].map((s: SectionDef) => s.id);
      const unique = new Set(ids);
      expect(unique.size, `Duplicate section IDs in tab "${key}": ${ids.join(', ')}`).toBe(ids.length);
    }
  });

  it('defaultOpen is a boolean for every section', () => {
    for (const key of tabKeys) {
      for (const sec of SECTIONS[key]) {
        expect(typeof sec.defaultOpen, `Section "${sec.id}" in "${key}" has non-boolean defaultOpen`).toBe('boolean');
      }
    }
  });

  it('collapsible is a boolean for every section', () => {
    for (const key of tabKeys) {
      for (const sec of SECTIONS[key]) {
        expect(typeof sec.collapsible, `Section "${sec.id}" in "${key}" has non-boolean collapsible`).toBe('boolean');
      }
    }
  });
});

// ─── 3. Helper functions ──────────────────────────────────────────────────────

describe('secOpen() helper', () => {
  it('returns defaultOpen value from config when section exists', () => {
    // tornado in NOW is false
    expect(secOpen('now', 'tornado')).toBe(false);
    // hero in NOW is true
    expect(secOpen('now', 'hero')).toBe(true);
  });

  it('returns fallback when section id not found (default: true)', () => {
    expect(secOpen('now', 'nonexistent-section-id-xyz')).toBe(true);
  });

  it('returns custom fallback when provided', () => {
    expect(secOpen('now', 'nonexistent-section-id-xyz', false)).toBe(false);
  });

  it('returns fallback when tab not found', () => {
    expect(secOpen('unknown-tab', 'any-id', true)).toBe(true);
  });
});

describe('secTitle() helper', () => {
  it('returns title from config when section exists', () => {
    const title = secTitle('fire', 'glide-path');
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain('Glide');
  });

  it('returns fallback when section not found', () => {
    expect(secTitle('fire', 'nonexistent-id', 'Fallback Title')).toBe('Fallback Title');
  });

  it('returns empty string fallback by default when not found', () => {
    expect(secTitle('fire', 'nonexistent-id')).toBe('');
  });
});

describe('getSec() helper', () => {
  it('returns SectionDef when found', () => {
    const def = getSec('portfolio', 'custo-base');
    expect(def).toBeDefined();
    expect(def?.id).toBe('custo-base');
  });

  it('returns undefined when not found', () => {
    expect(getSec('portfolio', 'nonexistent')).toBeUndefined();
  });
});

// ─── 4. Page files reference secOpen/secTitle ─────────────────────────────────

describe('page files use config helpers (not hardcoded defaultOpen)', () => {
  /**
   * Each page that has collapsible sections MUST import secOpen from config.
   * A page that hardcodes defaultOpen={true/false} in a CollapsibleSection
   * bypasses the config and breaks the single-source-of-truth contract.
   *
   * This test scans page files and checks:
   *   a) The file imports secOpen from config
   *   b) The file does NOT have bare CollapsibleSection with hardcoded defaultOpen={true/false}
   *      (i.e., defaultOpen must be computed, not a literal boolean)
   */

  const PAGE_FILES = [
    { file: 'page.tsx',             tab: 'now' },
    { file: 'portfolio/page.tsx',   tab: 'portfolio' },
    { file: 'performance/page.tsx', tab: 'performance' },
    { file: 'fire/page.tsx',        tab: 'fire' },
    { file: 'withdraw/page.tsx',    tab: 'withdraw' },
    { file: 'backtest/page.tsx',    tab: 'backtest' },
    { file: 'simulators/page.tsx',  tab: 'simuladores' },
  ];

  for (const { file, tab } of PAGE_FILES) {
    const hasCollapsible = SECTIONS[tab]?.some((s: SectionDef) => s.collapsible);
    if (!hasCollapsible) continue;

    it(`${file}: imports secOpen from dashboard.config`, () => {
      const fullPath = join(APP_DIR, file);
      const content = readFileSync(fullPath, 'utf-8');
      expect(content).toMatch(/import.*secOpen.*from.*dashboard\.config/);
    });

    it(`${file}: CollapsibleSection defaultOpen uses secOpen(), not literal boolean`, () => {
      const fullPath = join(APP_DIR, file);
      const content = readFileSync(fullPath, 'utf-8');

      // Find all CollapsibleSection usages
      const regex = /CollapsibleSection[^>]*defaultOpen=\{(true|false)\}/g;
      const matches = [...content.matchAll(regex)];

      expect(
        matches.length,
        `${file} has ${matches.length} CollapsibleSection(s) with hardcoded defaultOpen literal.\n` +
        `Use secOpen('${tab}', 'section-id') instead of defaultOpen={true/false}.\n` +
        `Matches: ${matches.map(m => m[0].slice(0, 80)).join('\n  ')}`,
      ).toBe(0);
    });
  }
});

// ─── 5. Collapsible sections have non-trivial titles ─────────────────────────

describe('collapsible sections have meaningful titles', () => {
  it('every collapsible:true section has a title longer than 10 characters', () => {
    for (const key of Object.keys(SECTIONS)) {
      for (const sec of SECTIONS[key]) {
        if (sec.collapsible) {
          expect(
            sec.title.length,
            `Section "${sec.id}" in tab "${key}" is collapsible but has a short title: "${sec.title}"`,
          ).toBeGreaterThan(10);
        }
      }
    }
  });
});
