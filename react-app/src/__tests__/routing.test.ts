import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Routing & Data Loading Test
 * Validates that pages can load data.json from the correct path
 * Catches basePath misconfigurations that only show up in HTTP serving
 */
describe('Routing & Data Loading', () => {
  let nextConfig: any;

  beforeAll(() => {
    // Load next.config.ts to verify basePath
    const configPath = path.join(__dirname, '../../next.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Extract basePath from config (two patterns: inline or const variable)
    let basePathMatch = configContent.match(/basePath:\s*['"]([^'"]+)['"]/);
    if (!basePathMatch) {
      // Try to find const basePath = '...'
      basePathMatch = configContent.match(/const\s+basePath\s*=\s*['"]([^'"]+)['"]/);
    }

    if (basePathMatch) {
      nextConfig = { basePath: basePathMatch[1] };
    } else {
      throw new Error('basePath not found in next.config.ts');
    }
  });

  it('should have basePath configured', () => {
    expect(nextConfig).toBeDefined();
    expect(nextConfig.basePath).toBeDefined();
  });

  it('basePath should not end with /dash', () => {
    // Common mistake: basePath: '/wealth/dash'
    // Correct: basePath: '/wealth'
    expect(nextConfig.basePath).not.toMatch(/\/dash$/);
  });

  it('data.json fetch URL should be constructed correctly', () => {
    // When a page constructs `${basePath}/data.json`, it should result in:
    // - /wealth/data.json (correct)
    // - NOT /wealth/dash/data.json (incorrect)
    const dataUrl = `${nextConfig.basePath}/data.json`;

    expect(dataUrl).not.toContain('/dash/');
    expect(dataUrl).toMatch(/^\/\w+\/data\.json$/);
  });

  it('should have data.json file in public directory', () => {
    const publicDataPath = path.join(__dirname, '../../public/data.json');
    expect(fs.existsSync(publicDataPath)).toBe(true);
  });

  it('should have data.json file in dash output directory', () => {
    const dashDataPath = path.join(__dirname, '../../../dash/data.json');
    expect(fs.existsSync(dashDataPath)).toBe(true);
  });

  it('public and dash data.json should be identical', () => {
    const publicDataPath = path.join(__dirname, '../../public/data.json');
    const dashDataPath = path.join(__dirname, '../../../dash/data.json');

    const publicContent = fs.readFileSync(publicDataPath, 'utf-8');
    const dashContent = fs.readFileSync(dashDataPath, 'utf-8');

    expect(publicContent).toEqual(dashContent);
  });

  it('data.json should be valid JSON', () => {
    const dashDataPath = path.join(__dirname, '../../../dash/data.json');
    const content = fs.readFileSync(dashDataPath, 'utf-8');

    expect(() => JSON.parse(content)).not.toThrow();
    const data = JSON.parse(content);
    expect(data).toBeDefined();
  });

  it('all pages should use basePath for data.json fetch', () => {
    const pagesDir = path.join(__dirname, '../../app');
    const pageFiles = [
      'page.tsx',      // NOW
      'portfolio/page.tsx',
      'performance/page.tsx',
      'fire/page.tsx',
      'withdraw/page.tsx',
      'simulators/page.tsx',
      'backtest/page.tsx',
    ];

    pageFiles.forEach(pageFile => {
      const filePath = path.join(pagesDir, pageFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Should use withBasePath utility when constructing data URL
        expect(content).toMatch(/withBasePath.*data\.json|import.*withBasePath/i);

        // Should NOT have hardcoded /dash/ path
        expect(content).not.toMatch(/['"`]\/dash\/data\.json['"`]/);
      }
    });
  });
});
