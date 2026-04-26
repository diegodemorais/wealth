import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import {
  canonicalizePFire,
  fromAPIPercentage,
  applyPFireDelta,
  validatePFireConsistency,
} from '../utils/pfire-canonical';

describe('P(FIRE) Canonicalization — QA Enforcement', () => {
  let sourceFiles: string[] = [];

  beforeAll(() => {
    // Collect all .ts/.tsx files in src/ (excluding tests)
    const srcDir = resolve(__dirname, '..');
    const walkDir = (dir: string): string[] => {
      const files: string[] = [];
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          if (entry.isDirectory()) {
            if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
            files.push(...walkDir(join(dir, entry.name)));
          } else if (entry.name.match(/\.(ts|tsx)$/)) {
            files.push(join(dir, entry.name));
          }
        }
      } catch {}
      return files;
    };
    sourceFiles = walkDir(srcDir);
  });

  describe('Unit Tests — CanonicalPFire transformation', () => {
    it('canonicalizePFire: converts 0-1 decimal to canonical form', () => {
      const result = canonicalizePFire(0.864, 'mc');
      expect(result.decimal).toBe(0.864);
      expect(result.percentage).toBe(86.4);
      expect(result.percentStr).toBe('86.4%');
      expect(result.isCanonical).toBe(true);
    });

    it('canonicalizePFire: rejects values outside [0, 1]', () => {
      expect(() => canonicalizePFire(1.5, 'mc')).toThrow(/must be in \[0, 1\]/);
      expect(() => canonicalizePFire(-0.1, 'mc')).toThrow(/must be in \[0, 1\]/);
      expect(() => canonicalizePFire(NaN, 'mc')).toThrow(/cannot be NaN/);
    });

    it('canonicalizePFire: respects source parameter', () => {
      const mc = canonicalizePFire(0.864, 'mc');
      const heur = canonicalizePFire(0.864, 'heuristic');
      const fallback = canonicalizePFire(0.864, 'fallback');

      expect(mc.isCanonical).toBe(true);
      expect(heur.isCanonical).toBe(false);
      expect(fallback.isCanonical).toBe(false);
    });

    it('fromAPIPercentage: converts 0-100 percentage to canonical form', () => {
      const result = fromAPIPercentage(86.4, 'mc');
      expect(result.decimal).toBeCloseTo(0.864, 3);
      expect(result.percentage).toBe(86.4);
    });

    it('fromAPIPercentage: rejects values outside [0, 100]', () => {
      expect(() => fromAPIPercentage(150, 'mc')).toThrow(/must be in \[0, 100\]/);
      expect(() => fromAPIPercentage(-10, 'mc')).toThrow(/must be in \[0, 100\]/);
    });

    it('applyPFireDelta: applies delta to canonical base', () => {
      const base = canonicalizePFire(0.864, 'mc');
      const result = applyPFireDelta(base, 2.05, 'fav delta');

      expect(result.percentage).toBeCloseTo(88.45, 1);
      expect(result.source).toBe('heuristic');
      expect(result.isCanonical).toBe(false);
    });

    it('applyPFireDelta: rejects delta on non-canonical source', () => {
      const heuristic = canonicalizePFire(0.864, 'heuristic');
      expect(() => applyPFireDelta(heuristic, 2.0)).toThrow(
        /Cannot apply delta to non-canonical source/
      );
    });

    it('applyPFireDelta: clamps result to [0, 100]', () => {
      const base = canonicalizePFire(0.99, 'mc');
      const result = applyPFireDelta(base, 5, 'overshoot test');

      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('validatePFireConsistency: detects consistent values', () => {
      const p1 = canonicalizePFire(0.864, 'mc');
      const p2 = canonicalizePFire(0.863, 'mc');

      const { isConsistent, diff } = validatePFireConsistency(p1, p2, 1.0);
      expect(isConsistent).toBe(true);
      expect(diff).toBeLessThan(1.0);
    });

    it('validatePFireConsistency: detects inconsistent values', () => {
      const p1 = canonicalizePFire(0.864, 'mc');
      const p2 = canonicalizePFire(0.800, 'mc');

      const { isConsistent, diff } = validatePFireConsistency(p1, p2, 1.0);
      expect(isConsistent).toBe(false);
      expect(diff).toBeGreaterThan(6.0);
    });
  });

  describe('QA Prohibition Tests — Detecting non-canonical code patterns', () => {
    it('PROHIBITION: no inline pFire * 100 conversions detected', () => {
      const prohibited = sourceFiles.filter(file => {
        // Exclude pfire-canonical.ts — it's the ONLY place × 100 is authorized
        if (file.includes('pfire-canonical')) return false;

        const content = readFileSync(file, 'utf-8');
        // Patterns to detect inline conversion (not calling pfire-canonical)
        // Match: pFire * 100, pfire * 100, successRate * 100, etc.
        const patterns = [
          /pFire\s*\*\s*100/,
          /pfire\s*\*\s*100/,
          /successRate\s*\*\s*100/,
          /p_sucesso\s*\*\s*100/,
          /successRate\s*\*\s*100/i,
          // Also match: Math.round(pFire * 100)
          /Math\.round\s*\(\s*pFire\s*\*\s*100\s*\)/,
        ];

        return patterns.some(pattern => pattern.test(content));
      });

      if (prohibited.length > 0) {
        const list = prohibited.map(f => `  - ${f}`).join('\n');
        throw new Error(
          `CANONICALIZATION VIOLATION: Found inline × 100 conversions:\n${list}\n` +
          `Use canonicalizePFire() or fromAPIPercentage() instead.`
        );
      }
    });

    it('PROHIBITION: no direct percentage assignment from decimal without canonicalize', () => {
      const prohibited = sourceFiles.filter(file => {
        const content = readFileSync(file, 'utf-8');
        // Detect pattern: const pct = pFire (without calling canonicalize)
        // This is heuristic — may have false positives
        const pattern = /const\s+\w*[Pp]erce?nt\w*\s*=\s*\w*[Pp][Ff]ire\w*\s*[+\-*/]?/;
        return pattern.test(content);
      });

      // This is a weak test (high false positive rate), so we only warn
      if (prohibited.length > 0) {
        console.warn(
          `⚠️  Potential non-canonical assignments detected (may be false positives):\n` +
          `${prohibited.map(f => `  - ${f}`).join('\n')}`
        );
      }
    });

    it('PROHIBITION: no fraction 0-1 used directly for display without canonicalization', () => {
      const prohibited = sourceFiles.filter(file => {
        const content = readFileSync(file, 'utf-8');
        // Pattern: toFixed(1)}% where variable is suspiciously named pFire, decimal, etc.
        const pattern = /pFire[\w]*\.toFixed\(.*?\).*?%|decimal[\w]*\.toFixed\(.*?\).*?%/;
        return pattern.test(content);
      });

      // Weak test — may have false positives
      if (prohibited.length > 0) {
        console.warn(
          `⚠️  Potential 0-1 decimal display without canonicalization:\n` +
          `${prohibited.map(f => `  - ${f}`).join('\n')}`
        );
      }
    });
  });

  describe('Integration — pfire-canonical module is canonical source', () => {
    it('pfire-canonical is imported, not re-implemented', () => {
      // Verify that canonical functions are actually exported and importable
      expect(typeof canonicalizePFire).toBe('function');
      expect(typeof fromAPIPercentage).toBe('function');
      expect(typeof applyPFireDelta).toBe('function');
    });

    it('no competing pFire transformation functions exist in codebase', () => {
      const prohibited = sourceFiles.filter(file => {
        // Exclude pfire-canonical.ts itself
        if (file.includes('pfire-canonical')) return false;

        const content = readFileSync(file, 'utf-8');
        // Pattern: export function canonicalizePFire, export const transformPFire, etc.
        const pattern = /export\s+(function|const)\s+\w*[Cc]anonical[Pp]fire\w*|export\s+(function|const)\s+\w*[Tt]ransform[Pp]fire\w*/;
        return pattern.test(content);
      });

      if (prohibited.length > 0) {
        throw new Error(
          `CANONICALIZATION VIOLATION: Multiple pFire transformation functions found:\n` +
          `${prohibited.map(f => `  - ${f}`).join('\n')}\n` +
          `Use pfire-canonical.ts exclusively.`
        );
      }
    });
  });

  describe('Anchor Tests — Calibration against known values', () => {
    it('anchor: MC P(FIRE) 86.4% from fire_montecarlo.py matches canonical form', () => {
      // This is the current base P(FIRE) value from the dashboard
      const decimal_from_mc = 0.864; // p_sucesso from fire_montecarlo.py
      const canonical = canonicalizePFire(decimal_from_mc, 'mc');

      expect(canonical.percentage).toBeCloseTo(86.4, 1);
      expect(canonical.isCanonical).toBe(true);
    });

    it('anchor: spending scenarios use canonical deltas', () => {
      const base = canonicalizePFire(0.864, 'mc'); // 86.4%
      const fav = applyPFireDelta(base, 2.05, 'fav = base + delta');
      const stress = applyPFireDelta(base, -3.9, 'stress = base - delta');

      expect(fav.percentage).toBeCloseTo(88.45, 1);
      expect(stress.percentage).toBeCloseTo(82.5, 1);
      expect(fav.isCanonical).toBe(false);
      expect(stress.isCanonical).toBe(false);
    });
  });
});
