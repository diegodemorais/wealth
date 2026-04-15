/**
 * Responsive Layout Validation Tests
 * Tests CSS media query behavior for 480px, 640px, 768px, 900px, 1024px breakpoints
 */

import fs from 'fs';
import path from 'path';

describe('Responsive Design — CSS Media Queries', () => {
  let cssContent: string;

  beforeAll(() => {
    const cssPath = path.join(__dirname, '../src/styles/dashboard.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  // Test 1: Verify all critical breakpoints exist
  it('should define media queries for all critical breakpoints', () => {
    const breakpoints = ['480px', '640px', '768px', '900px', '1024px'];
    breakpoints.forEach(bp => {
      expect(cssContent).toContain(`@media (max-width: ${bp})`);
    });
  });

  // Test 2: Verify no old/redundant breakpoints
  it('should not have conflicting 800px media query', () => {
    // Check that old 800px rule was removed
    expect(cssContent).not.toContain('@media (max-width: 800px)');
  });

  // Test 3: Verify 480px breakpoint exists and has mobile styles
  it('should have 480px mobile breakpoint with single-column layouts', () => {
    const mobile480 = cssContent.match(/@media \(max-width: 480px\)/);
    expect(mobile480).toBeTruthy();

    // Verify the 480px section contains mobile-specific rules
    // Look for 480px followed by specific properties
    const mobile480Section = cssContent.substring(
      cssContent.indexOf('@media (max-width: 480px)'),
      cssContent.indexOf('@media (max-width: 480px)') + 2000 // Get enough context
    );

    // Mobile should have reduced padding, single-column grids, and smaller chart heights
    expect(mobile480Section.match(/padding:\s*8px/)).toBeTruthy();
    expect(mobile480Section.match(/grid-template-columns:\s*1fr/)).toBeTruthy();
    expect(mobile480Section.match(/height:\s*200px/)).toBeTruthy();
  });

  // Test 4: Verify 768px breakpoint has tablet rules
  it('should have 768px tablet breakpoint with 2-column grids', () => {
    const tablet768 = cssContent.match(/@media \(max-width: 768px\)/);
    expect(tablet768).toBeTruthy();

    const startIdx = cssContent.indexOf('@media (max-width: 768px)');
    const endIdx = cssContent.indexOf('}', startIdx) + 1;
    const tabletSection = cssContent.substring(startIdx, endIdx);

    // Tablet should have 2-column KPI grids
    expect(tabletSection).toContain('repeat(2, 1fr)');
  });

  // Test 5: Verify base CSS has auto-fit minmax patterns for responsiveness
  it('should use auto-fit minmax patterns for flexible grid layouts', () => {
    // Base CSS should have auto-fit grids that work at all sizes
    expect(cssContent).toContain('repeat(auto-fit, minmax(170px, 1fr))');
    expect(cssContent).toContain('repeat(auto-fit, minmax(150px, 1fr))');
    expect(cssContent).toContain('repeat(auto-fit, minmax(260px, 1fr))');
  });

  // Test 6: Verify form responsiveness
  it('should make forms stack vertically on mobile', () => {
    const mobile480 = cssContent.match(/@media \(max-width: 480px\)/);
    expect(mobile480).toBeTruthy();

    // Look for 480px section and verify form stacking
    const mobile480Section = cssContent.substring(
      cssContent.indexOf('@media (max-width: 480px)'),
      cssContent.indexOf('@media (max-width: 480px)') + 2000 // Get enough context
    );

    // Forms should be flex column with full width inputs/buttons
    expect(mobile480Section.match(/flex-direction:\s*column/)).toBeTruthy();
  });

  // Test 7: Verify table scrolling on all sizes
  it('should have horizontal scroll for tables on all sizes', () => {
    // Tables should be scrollable by default
    expect(cssContent).toContain('.section table');
    expect(cssContent).toContain('overflow-x: auto');
  });

  // Test 8: Verify no duplicate media query declarations
  it('should not have duplicate media query declarations for same breakpoint', () => {
    const count640 = (cssContent.match(/@media \(max-width: 640px\)/g) || []).length;
    const count768 = (cssContent.match(/@media \(max-width: 768px\)/g) || []).length;
    const count480 = (cssContent.match(/@media \(max-width: 480px\)/g) || []).length;

    expect(count640).toBe(1);
    expect(count768).toBe(1);
    expect(count480).toBe(1);
  });

  // Test 9: Verify media query ordering (largest to smallest)
  it('should define media queries in descending order for clarity', () => {
    const idx1024 = cssContent.indexOf('@media (max-width: 1024px)');
    const idx900 = cssContent.indexOf('@media (max-width: 900px)');
    const idx768 = cssContent.indexOf('@media (max-width: 768px)');
    const idx640 = cssContent.indexOf('@media (max-width: 640px)');
    const idx480 = cssContent.indexOf('@media (max-width: 480px)');

    // Check ordering (1024 should come before 900, etc.)
    expect(idx1024).toBeLessThan(idx900);
    expect(idx900).toBeLessThan(idx768);
    expect(idx768).toBeLessThan(idx640);
    expect(idx640).toBeLessThan(idx480);
  });
});
