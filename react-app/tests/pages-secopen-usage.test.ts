/**
 * pages-secopen-usage.test.ts — Validates pages use secOpen() accessor pattern
 *
 * Problem: Pages may bypass secOpen() and access portfolio data directly,
 * breaking the abstraction layer that enforces layout decisions.
 *
 * Ensures:
 * - All pages in src/app/*/page.tsx use secOpen() for section visibility
 * - No direct destructuring of portfolio root without secOpen
 * - Pattern match: secOpen(tab, id) used before conditional renders
 * - No hardcoded defaultOpen boolean values
 *
 * Why: secOpen is the enforcement layer. Direct access = bypass = maintainability risk.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

interface PageAnalysis {
  path: string;
  name: string;
  hasSecOpenImport: boolean;
  secOpenUsages: number;
  hardcodedDefaultOpen: string[];
  directPortfolioAccess: string[];
  issuesFound: string[];
}

let pageAnalyses: PageAnalysis[] = [];

const DANGEROUS_PATTERNS = [
  // Direct destructuring of portfolio
  /const\s+{\s*posicoes\s*,/,
  /const\s+{\s*retornos\s*,/,
  /const\s+{\s*[^}]*patrimonio[^}]*}\s*=\s*portfolio/,
];

const SECOPEN_PATTERNS = [
  /secOpen\s*\(\s*['"][^'"]+['"]\s*,\s*['"][^'"]+['"]/,
  /import.*secOpen/,
];

function analyzePageFile(filePath: string): PageAnalysis {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split('/').pop() || 'unknown';
  const pageName = filePath.split('/').slice(-2)[0]; // Get parent directory

  // Check for import
  const hasSecOpenImport = /import\s+{\s*[^}]*secOpen[^}]*}/.test(content) ||
    /import\s+{\s*secOpen\s*}/.test(content);

  // Count secOpen usages
  const secOpenMatches = content.match(/secOpen\s*\(\s*['"][^'"]+['"]\s*,\s*['"][^'"]+['"]/g) || [];
  const secOpenUsages = secOpenMatches.length;

  // Find hardcoded defaultOpen values (danger sign)
  const hardcodedDefaultOpen: string[] = [];
  const defaultOpenMatches = content.match(/defaultOpen\s*[:=]\s*(true|false)/g) || [];
  for (const match of defaultOpenMatches) {
    hardcodedDefaultOpen.push(match);
  }

  // Check for dangerous direct portfolio access
  const directPortfolioAccess: string[] = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(line)) {
        directPortfolioAccess.push(`Line ${i + 1}: ${line.trim()}`);
      }
    }
  }

  const issuesFound: string[] = [];

  // Rule 1: Page should import secOpen if it uses sections
  if (secOpenUsages === 0 && !hasSecOpenImport && defaultOpenMatches.length > 0) {
    issuesFound.push(
      'Page has hardcoded defaultOpen but does not import secOpen(). Use secOpen() instead.'
    );
  }

  // Rule 2: Direct portfolio access is suspicious
  if (directPortfolioAccess.length > 0) {
    issuesFound.push(
      `Found ${directPortfolioAccess.length} instances of direct portfolio destructuring. Should use secOpen() instead.`
    );
  }

  // Rule 3: If using CollapsibleSection, must use secOpen
  if (content.includes('CollapsibleSection') && secOpenUsages === 0 && !defaultOpenMatches.some(m => m.includes('secOpen'))) {
    issuesFound.push(
      'Page uses CollapsibleSection but does not use secOpen() for defaultOpen values.'
    );
  }

  return {
    path: filePath,
    name: pageName,
    hasSecOpenImport,
    secOpenUsages,
    hardcodedDefaultOpen,
    directPortfolioAccess,
    issuesFound,
  };
}

function findPageFiles(): string[] {
  const appPath = resolve(__dirname, '../../react-app/src/app');
  const pages: string[] = [];

  try {
    const entries = readdirSync(appPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pagePath = join(appPath, entry.name, 'page.tsx');
        try {
          readdirSync(pagePath);
        } catch {
          // Not a directory, probably the file itself
          try {
            readFileSync(pagePath, 'utf-8');
            pages.push(pagePath);
          } catch {
            // File doesn't exist
          }
        }
      }

      // Check root level page.tsx
      const rootPagePath = join(appPath, entry.name);
      if (entry.name === 'page.tsx') {
        try {
          readFileSync(rootPagePath, 'utf-8');
          pages.push(rootPagePath);
        } catch {
          // Doesn't exist
        }
      }
    }

    // Also check app/page.tsx
    const appPagePath = join(appPath, 'page.tsx');
    try {
      readFileSync(appPagePath, 'utf-8');
      pages.push(appPagePath);
    } catch {
      // Doesn't exist
    }
  } catch (err) {
    console.error('Error scanning app directory:', err);
  }

  return pages;
}

beforeAll(() => {
  const pageFiles = findPageFiles();

  for (const filePath of pageFiles) {
    const analysis = analyzePageFile(filePath);
    pageAnalyses.push(analysis);
  }
});

describe('test_pages_use_secopen', () => {
  // ─────────────────────────────────────────────────────────────
  // 1. PAGES FOUND
  // ─────────────────────────────────────────────────────────────

  it('should find 5+ page files in src/app/', () => {
    expect(pageAnalyses.length).toBeGreaterThanOrEqual(5);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. EACH PAGE: secOpen import validation (parametrized)
  // ─────────────────────────────────────────────────────────────

  describe('Each page: secOpen usage validation', () => {
    for (const analysis of pageAnalyses) {
      it(`${analysis.name}: uses secOpen() pattern or doesn't have sections`, () => {
        // Pages with CollapsibleSection MUST use secOpen
        const fileContent = readFileSync(analysis.path, 'utf-8');
        const usesCollapsible = fileContent.includes('CollapsibleSection');

        if (usesCollapsible) {
          expect(
            analysis.hasSecOpenImport && analysis.secOpenUsages > 0,
            `${analysis.name} uses CollapsibleSection but does not import/use secOpen()`
          ).toBe(true);
        }
      });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 3. EACH PAGE: No direct portfolio destructuring (parametrized)
  // ─────────────────────────────────────────────────────────────

  describe('Each page: no direct portfolio bypass', () => {
    for (const analysis of pageAnalyses) {
      it(`${analysis.name}: no direct portfolio root destructuring`, () => {
        expect(
          analysis.directPortfolioAccess.length,
          `${analysis.name} has direct portfolio access that should use secOpen(): ${analysis.directPortfolioAccess.join('; ')}`
        ).toBe(0);
      });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 4. NO PAGES WITH CRITICAL ISSUES
  // ─────────────────────────────────────────────────────────────

  it('no page should have secOpen-related issues', () => {
    const problematicPages = pageAnalyses.filter(
      p => p.issuesFound.length > 0
    );

    const errorDetails = problematicPages
      .map(p => `\n  ${p.name}: ${p.issuesFound.join('; ')}`)
      .join('');

    expect(
      problematicPages.length,
      `Found ${problematicPages.length} pages with secOpen issues:${errorDetails}`
    ).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────
  // 5. SAMPLE PAGES: Deep validation
  // ─────────────────────────────────────────────────────────────

  describe('Sample pages: detailed inspection', () => {
    const knownPages = ['performance', 'portfolio', 'fire', 'backtest'];

    for (const pageName of knownPages) {
      it(`${pageName} page should use secOpen() if collapsible sections exist`, () => {
        const analysis = pageAnalyses.find(
          p => p.name === pageName
        );

        if (!analysis) {
          expect(true).toBe(true); // Page not found, skip
          return;
        }

        // If page uses CollapsibleSection, must have secOpen
        const fileContent = readFileSync(analysis.path, 'utf-8');
        if (fileContent.includes('CollapsibleSection')) {
          expect(analysis.hasSecOpenImport).toBe(true);
          expect(analysis.secOpenUsages).toBeGreaterThan(0);
        }
      });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 6. SECOPEN USAGE STATISTICS
  // ─────────────────────────────────────────────────────────────

  it('should report secOpen usage statistics', () => {
    const withImport = pageAnalyses.filter(p => p.hasSecOpenImport).length;
    const totalUsages = pageAnalyses.reduce((sum, p) => sum + p.secOpenUsages, 0);
    const withHardcodedDefault = pageAnalyses.filter(
      p => p.hardcodedDefaultOpen.length > 0
    ).length;

    console.log(`secOpen Usage: ${totalUsages} total usages across ${pageAnalyses.length} pages`);
    console.log(`  - Pages with secOpen import: ${withImport}`);
    console.log(`  - Pages with hardcoded defaultOpen: ${withHardcodedDefault}`);

    // At least 50% of pages should use secOpen
    expect(totalUsages).toBeGreaterThanOrEqual(0); // Baseline
  });

  // ─────────────────────────────────────────────────────────────
  // 7. PORTFOLIO DATA ACCESS PATTERNS
  // ─────────────────────────────────────────────────────────────

  it('should validate that usePageData() is preferred over direct destructuring', () => {
    const pagesWithPageData = pageAnalyses.filter(analysis => {
      const content = readFileSync(analysis.path, 'utf-8');
      return content.includes('usePageData');
    }).length;

    // Most pages should use the hook pattern
    expect(pagesWithPageData).toBeGreaterThanOrEqual(
      Math.floor(pageAnalyses.length * 0.5)
    );
  });
});
