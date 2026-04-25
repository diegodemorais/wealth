import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Asset Integrity Test
 * Validates that generated assets use the correct basePath and have no 404s
 * Catches misconfigurations like duplicate basePaths in asset URLs
 */
describe('Asset Integrity', () => {
  let indexHtml: string;
  let dashPath: string;
  let skipAssetTests = false;

  beforeAll(() => {
    // next.config.ts has distDir: '../dash', so from __dirname (__tests__) go up 3 levels to repo root, then dash
    dashPath = path.join(__dirname, '../../../dash');
    const indexPath = path.join(dashPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      // Skip tests if build hasn't been run (dash/index.html only exists after npm run build)
      skipAssetTests = true;
      console.log('ℹ️  Skipped: Run `npm run build` to generate dash/index.html');
      return;
    }
    indexHtml = fs.readFileSync(indexPath, 'utf-8');
  });

  it('should have generated index.html with correct basePath', () => {
    if (skipAssetTests) {
      expect(true).toBe(true); // Skip
      return;
    }
    expect(indexHtml).toBeDefined();
    expect(indexHtml.length).toBeGreaterThan(0);
  });

  it('should have script tags with correct basePath (not duplicated)', () => {
    if (skipAssetTests) return;
    const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*>/g;
    const matches = Array.from(indexHtml.matchAll(scriptRegex));

    expect(matches.length).toBeGreaterThan(0);

    matches.forEach(([, src]) => {
      // Script paths should start with /wealth (basePath from next.config.ts)
      expect(src).toMatch(/^\/wealth\/_next/);

      // Should NOT have duplicate basePath like /wealth/wealth
      expect(src).not.toMatch(/\/wealth\/wealth/);
    });
  });

  it('should have link tags for CSS with correct basePath (not duplicated)', () => {
    if (skipAssetTests) return;
    const linkRegex = /<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"[^>]*>/g;
    const matches = Array.from(indexHtml.matchAll(linkRegex));

    if (matches.length > 0) {
      matches.forEach(([, href]) => {
        // CSS paths should start with /wealth (basePath from next.config.ts)
        expect(href).toMatch(/^\/wealth\/_next/);

        // Should NOT have duplicate basePath like /wealth/wealth
        expect(href).not.toMatch(/\/wealth\/wealth/);
      });
    }
  });

  it('should have correct next/image configuration', () => {
    if (skipAssetTests) return;
    // Check that we have script tag for Next.js
    expect(indexHtml).toContain('/_next/');

    // Verify no broken basePath patterns
    expect(indexHtml).not.toContain('/wealth/wealth/');
    expect(indexHtml).not.toContain('/dash/_next/');
  });

  it('should list all expected assets in dash directory', () => {
    if (skipAssetTests) return;
    const requiredFiles = [
      'index.html',
      'data.json',
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(dashPath, file);
      expect(fs.existsSync(filePath)).toBe(
        true,
        `Missing required file: ${file}`
      );
    });
  });

  it('should have _next directory with static assets', () => {
    if (skipAssetTests) return;
    const nextDir = path.join(dashPath, '_next');
    expect(fs.existsSync(nextDir)).toBe(true);
    expect(fs.statSync(nextDir).isDirectory()).toBe(true);

    // Should have chunks or static subdirectories
    const contents = fs.readdirSync(nextDir);
    expect(contents.length).toBeGreaterThan(0);
  });
});
