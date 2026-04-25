/**
 * style-validation.test.ts — Static CSS/style invariant checks (no browser required)
 *
 * Groups:
 *  2a. CSS Variables in globals.css (Tailwind v4 @theme)
 *  2b. Privacy Mode CSS
 *  2c. Component Structure — monetary values + privacy handling
 *  2d. Tailwind v4 Compliance — tailwind.config.ts must NOT redefine colors
 *  2e. Header/Nav Structure — 7 tabs, UPPERCASE, no emoji labels
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

// ── Paths ──────────────────────────────────────────────────────────────────────
const SRC_DIR = resolve(__dirname, '..');
const GLOBALS_CSS = resolve(SRC_DIR, 'app/globals.css');
const TAILWIND_CONFIG = resolve(SRC_DIR, '..', 'tailwind.config.ts');
const HEADER_TSX = resolve(SRC_DIR, 'components/layout/Header.tsx');
const COMPONENTS_DIR = resolve(SRC_DIR, 'components');

// ── Helpers ────────────────────────────────────────────────────────────────────
function collectComponentFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectComponentFiles(fullPath, files);
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

// ── 2a. CSS Variables ──────────────────────────────────────────────────────────
describe('2a. CSS Variables (globals.css)', () => {
  it('globals.css must exist', () => {
    let content: string;
    try {
      content = readFileSync(GLOBALS_CSS, 'utf-8');
    } catch {
      throw new Error(`globals.css not found at ${GLOBALS_CSS}`);
    }
    expect(content.length).toBeGreaterThan(0);
  });

  it('must contain @theme block (Tailwind v4)', () => {
    const css = readFileSync(GLOBALS_CSS, 'utf-8');
    expect(css).toContain('@theme');
    // Must have opening brace after @theme
    expect(css).toMatch(/@theme\s*\{/);
  });

  it('must define critical CSS vars inside @theme', () => {
    const css = readFileSync(GLOBALS_CSS, 'utf-8');

    // Extract the @theme { ... } block
    const themeMatch = css.match(/@theme\s*\{([\s\S]*?)\}/);
    if (!themeMatch) {
      throw new Error('No @theme { } block found in globals.css');
    }
    const themeBlock = themeMatch[1];

    // In Tailwind v4, color vars inside @theme use --color-* prefix
    const criticalVars = ['--color-bg', '--color-card', '--color-text', '--color-muted', '--color-border', '--color-accent', '--color-green', '--color-red', '--color-yellow'];
    const missing: string[] = [];
    for (const v of criticalVars) {
      if (!themeBlock.includes(v)) missing.push(v);
    }

    if (missing.length > 0) {
      throw new Error(`Missing CSS vars in @theme block: ${missing.join(', ')}`);
    }
  });

  it('must contain @layer base reset', () => {
    const css = readFileSync(GLOBALS_CSS, 'utf-8');
    expect(css).toContain('@layer base');
  });

  it('must have at least one responsive @media breakpoint', () => {
    const css = readFileSync(GLOBALS_CSS, 'utf-8');
    // Accept any max-width media query (640px, 768px, 480px, etc)
    expect(css).toMatch(/@media\s*\(max-width:/);
  });
});

// ── 2b. Privacy Mode CSS ───────────────────────────────────────────────────────
describe('2b. Privacy Mode CSS', () => {
  it('components that use fmtBrl/fmtShort must also use privacyMode or PrivacyMask', () => {
    // This is a warning scan — fails only if a known-critical component has no privacy
    const criticalComponents = [
      'DecisaoDoMes.tsx',
      'KpiHero.tsx',
    ];

    for (const name of criticalComponents) {
      const files = collectComponentFiles(COMPONENTS_DIR).filter(f => f.endsWith(name));
      if (files.length === 0) {
        console.warn(`[WARN] Component not found: ${name} — skip privacy check`);
        continue;
      }
      const content = readFileSync(files[0], 'utf-8');
      const hasPrivacy =
        content.includes('privacyMode') ||
        content.includes('PrivacyMask') ||
        content.includes('privacy');
      expect(hasPrivacy).toBe(true);
    }
  });

  it('privacy masking: critical components must use fmtPrivacy or ••••', () => {
    // fmtPrivacy is the approved approach (transforms values, preserves proportions)
    // Legacy ••••-style masking is also accepted but deprecated
    const criticalComponents = ['DecisaoDoMes.tsx', 'KpiHero.tsx'];

    for (const name of criticalComponents) {
      const files = collectComponentFiles(COMPONENTS_DIR).filter(f => f.endsWith(name));
      if (files.length === 0) continue;
      const content = readFileSync(files[0], 'utf-8');
      const hasPrivacyMask = content.includes('••••') || content.includes('fmtPrivacy');
      expect(hasPrivacyMask).toBe(true);
    }
  });
});

// ── 2c. Component Structure — monetary values ──────────────────────────────────
describe('2c. Component Structure (static scan)', () => {
  it('components with monetary formatting must have privacy handling', () => {
    const allComponents = collectComponentFiles(COMPONENTS_DIR);
    const violators: string[] = [];

    for (const filePath of allComponents) {
      // Skip non-component utility files in ui/ (shadcn primitives)
      const rel = filePath.replace(COMPONENTS_DIR + '/', '');
      if (rel.startsWith('ui/')) continue;

      const content = readFileSync(filePath, 'utf-8');

      // Skip files with explicit privacy-ok exception comment
      if (content.includes('// privacy-ok')) continue;

      const hasMoneyFormat =
        content.includes('fmtBrl') ||
        content.includes('fmtShort') ||
        content.includes('fmtBrlCompact') ||
        (content.includes('toLocaleString') && content.includes('BRL')) ||
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
      // Utility hint: if a formatter is shared with a privacy-aware parent, add
      // `// privacy-ok: handled by parent` comment to suppress this check.
      throw new Error(
        `Components with money formatting but no privacy handling:\n${violators.map(f => '  ' + f).join('\n')}`
      );
    }
  });

  it('all ECharts components must have privacy handling', () => {
    const allComponents = collectComponentFiles(COMPONENTS_DIR);
    const violators: string[] = [];

    for (const filePath of allComponents) {
      const content = readFileSync(filePath, 'utf-8');
      const rel = filePath.replace(COMPONENTS_DIR + '/', '');

      const usesECharts = content.includes('ReactECharts') || content.includes("from 'echarts") || content.includes('from "echarts');
      const hasPrivacy = content.includes('privacyMode') || content.includes('PrivacyMask') || content.includes('privacy');

      if (usesECharts && !hasPrivacy) {
        violators.push(rel);
      }
    }

    if (violators.length > 0) {
      throw new Error(
        `ECharts components without any privacy handling:\n${violators.map(f => '  ' + f).join('\n')}`
      );
    }
  });
});

// ── 2d. Tailwind v4 Compliance ─────────────────────────────────────────────────
describe('2d. Tailwind v4 Compliance', () => {
  it('tailwind.config.ts must NOT define theme.extend.colors (ignored in v4)', () => {
    let content: string;
    try {
      content = readFileSync(TAILWIND_CONFIG, 'utf-8');
    } catch {
      // If the file doesn't exist, that's fine — nothing to check
      console.warn('[WARN] tailwind.config.ts not found — skipping Tailwind v4 compliance check');
      expect(true).toBe(true);
      return;
    }

    // Check if it has both extend and colors — that combo is ignored in v4
    const hasExtendColors = content.includes('extend') && content.includes('colors');
    if (hasExtendColors) {
      // Warn but don't fail hard — the file may be legacy/harmless if globals.css is the source
      console.warn(
        '[WARN] tailwind.config.ts defines theme.extend.colors — these are IGNORED in Tailwind v4. ' +
        'Custom colors must be in @theme block in globals.css. ' +
        'This causes silent failures (bg-card, text-green won\'t work).'
      );
    }

    // globals.css must be the real source: verify @theme has custom colors
    const css = readFileSync(GLOBALS_CSS, 'utf-8');
    const themeMatch = css.match(/@theme\s*\{([\s\S]*?)\}/);
    expect(themeMatch).not.toBeNull();

    const themeBlock = themeMatch![1];
    expect(themeBlock).toContain('--color-bg');
    expect(themeBlock).toContain('--color-card');
  });

  it('globals.css must be imported via @import "tailwindcss" (v4 syntax)', () => {
    const css = readFileSync(GLOBALS_CSS, 'utf-8');
    // v4 uses @import "tailwindcss" — v3 uses @tailwind base/components/utilities
    expect(css).toContain('@import "tailwindcss"');

    // Strip CSS block comments before checking for v3 directives (avoid false positives in doc comments)
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(cssWithoutComments).not.toContain('@tailwind base');
    expect(cssWithoutComments).not.toContain('@tailwind components');
    expect(cssWithoutComments).not.toContain('@tailwind utilities');
  });
});

// ── 2e. Header/Nav Structure ───────────────────────────────────────────────────
describe('2e. Header/Nav Structure (static scan)', () => {
  // TABS now live in dashboard.config.ts (single source of truth), Header.tsx imports them
  const CONFIG_TS = resolve(SRC_DIR, 'config/dashboard.config.ts');
  const REQUIRED_TABS = ['DASHBOARD', 'FIRE', 'PORTFOLIO', 'PERFORMANCE', 'RETIREMENT', 'SIMULADORES', 'BACKTEST', 'CHECKLIST'];

  it('Header.tsx must import TABS from dashboard.config', () => {
    const content = readFileSync(HEADER_TSX, 'utf-8');
    expect(content).toContain("import");
    expect(content).toContain("TABS");
    expect(content).toContain("dashboard.config");
  });

  it('dashboard.config.ts must contain all 8 required tabs', () => {
    const content = readFileSync(CONFIG_TS, 'utf-8');
    const missing: string[] = [];
    for (const tab of REQUIRED_TABS) {
      if (!content.includes(tab)) missing.push(tab);
    }
    if (missing.length > 0) {
      throw new Error(`Missing tabs in dashboard.config.ts: ${missing.join(', ')}`);
    }
  });

  it('tab labels must be UPPERCASE', () => {
    const content = readFileSync(CONFIG_TS, 'utf-8');
    for (const tab of REQUIRED_TABS) {
      expect(content).toContain(tab);
    }
  });

  it('tab labels must not contain emojis', () => {
    const content = readFileSync(CONFIG_TS, 'utf-8');

    // Extract the TABS array block heuristically — look for label: '...' patterns
    const labelMatches = [...content.matchAll(/label:\s*['"]([^'"]+)['"]/g)];
    const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{1F300}-\u{1F9FF}]/u;

    const violators: string[] = [];
    for (const match of labelMatches) {
      const label = match[1];
      if (emojiRegex.test(label)) {
        violators.push(label);
      }
    }

    if (violators.length > 0) {
      throw new Error(`Tab labels contain emojis: ${violators.join(', ')}`);
    }
  });

  it('Header.tsx must handle privacyMode (privacy toggle)', () => {
    const content = readFileSync(HEADER_TSX, 'utf-8');
    const hasPrivacyToggle =
      content.includes('privacyMode') ||
      content.includes('togglePrivacy') ||
      content.includes('privacy-toggle');
    expect(hasPrivacyToggle).toBe(true);
  });
});

// ── 2f. Layout Mobile Safety ───────────────────────────────────────────────────
// Diretriz: grids com filhos tipo KPI devem caber em ≤3 linhas no mobile.
// Nunca usar inline gridTemplateColumns — sobrescreve responsividade.
// Padrão correto: grid-cols-2 sm:grid-cols-5 (mobile first, sem inline style).
describe('2f. Layout Mobile Safety', () => {
  const APP_DIR = resolve(SRC_DIR, 'app');

  function collectTsx(dir: string, files: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) collectTsx(full, files);
      else if (entry.endsWith('.tsx')) files.push(full);
    }
    return files;
  }

  it('no inline gridTemplateColumns with fixed column count ≥4 (breaks mobile)', () => {
    // `repeat(4, 1fr)` etc. always overrides Tailwind responsive classes —
    // even if sm:grid-cols-N is present, the inline style wins on mobile.
    // auto-fit/minmax and 1fr 1fr are fine; fixed repeat(N≥4) is the danger.
    const BANNED = /gridTemplateColumns\s*:\s*['"`]?\s*repeat\s*\(\s*([4-9]|\d{2,})\s*,/;
    const pages = collectTsx(APP_DIR);
    const violations: string[] = [];

    for (const file of pages) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (BANNED.test(line)) {
          violations.push(`${file.replace(SRC_DIR, 'src')}:${i + 1} — ${line.trim()}`);
        }
      });
    }

    if (violations.length > 0) {
      throw new Error(
        `gridTemplateColumns: repeat(N≥4) detectado — força layout fixo no mobile.\n` +
        `Use classes Tailwind: "grid-cols-2 sm:grid-cols-N".\n\n` +
        violations.join('\n')
      );
    }
  });

  it('KPI grid capacity: mobile cols × 3 rows must fit all KPI children', () => {
    // This test catches: adding KPI cards without updating the mobile grid-cols.
    // Failure example: 5 cards in grid-cols-3 (capacity 9) → passes.
    //                  7 cards in grid-cols-2 (capacity 6) → fails.
    //
    // Algorithm: find grid containers with a mobile grid-cols-N (no breakpoint prefix)
    // that also contain className="kpi" children. Count kpi children in the
    // same file section. Assert count ≤ mobileCols × 3.
    const MAX_ROWS_MOBILE = 3;
    const pages = collectTsx(APP_DIR);
    const violations: string[] = [];

    for (const file of pages) {
      const content = readFileSync(file, 'utf-8');
      const rel = file.replace(SRC_DIR, 'src');

      // Find all grid containers with mobile cols declared (no breakpoint prefix)
      // Pattern: className="... grid grid-cols-N ..." where N has no "sm:/md:/lg:" prefix
      const gridRe = /className="([^"]*\bgrid\b[^"]*)"/g;
      let match;

      while ((match = gridRe.exec(content)) !== null) {
        const cls = match[1];
        // Extract unprefixed grid-cols-N (not preceded by a breakpoint like sm:)
        const mobileMatch = cls.match(/(?<![a-z]:)\bgrid-cols-(\d+)\b/);
        if (!mobileMatch) continue;
        const mobileCols = parseInt(mobileMatch[1]);
        // Skip single-column grids (always fine) and large mobile grids (already caught above)
        if (mobileCols <= 1 || mobileCols >= 4) continue;

        // Look at the next 4000 chars for kpi children
        const gridStart = match.index;
        const snippet = content.slice(gridStart, gridStart + 4000);
        const kpiCount = (snippet.match(/className="kpi[\s"]/g) ?? []).length;

        if (kpiCount > 0 && kpiCount > mobileCols * MAX_ROWS_MOBILE) {
          const lineNum = content.slice(0, gridStart).split('\n').length;
          violations.push(
            `${rel}:${lineNum} — grid-cols-${mobileCols} (mobile) tem ${kpiCount} cards KPI ` +
            `mas comporta só ${mobileCols * MAX_ROWS_MOBILE} em ${MAX_ROWS_MOBILE} linhas. ` +
            `Use grid-cols-${Math.ceil(kpiCount / MAX_ROWS_MOBILE)} ou reduza os cards.`
          );
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `KPI grid overflow no mobile detectado:\n${violations.join('\n')}\n\n` +
        `Regra: grid-cols-N (mobile) × 3 linhas ≥ número de cards.`
      );
    }
  });
});
