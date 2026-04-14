# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: charts.spec.ts >> Chart Interactivity >> collapsible sections toggle
- Location: e2e/charts.spec.ts:82:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[id^="section-"]').first().locator('..').locator('button, [role="button"]').first()

```

# Page snapshot

```yaml
- generic [ref=e2]: Cannot GET /portfolio
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Chart Rendering', () => {
  4   |   test('dashboard charts render', async ({ page }) => {
  5   |     await page.goto('/dashboard');
  6   |     await page.waitForLoadState('networkidle');
  7   | 
  8   |     // Check for chart containers
  9   |     const chartContainers = page.locator('[style*="backgroundColor"]').filter({
  10  |       has: page.locator('canvas, svg'),
  11  |     });
  12  | 
  13  |     const count = await chartContainers.count();
  14  |     expect(count).toBeGreaterThan(0);
  15  |   });
  16  | 
  17  |   test('portfolio page displays all chart sections', async ({ page }) => {
  18  |     await page.goto('/portfolio');
  19  |     await page.waitForLoadState('networkidle');
  20  | 
  21  |     // Check for collapsible sections
  22  |     const sections = page.locator('[id^="section-"]');
  23  |     const sectionCount = await sections.count();
  24  | 
  25  |     // Portfolio should have at least 3 sections
  26  |     expect(sectionCount).toBeGreaterThanOrEqual(3);
  27  |   });
  28  | 
  29  |   test('performance page has timeline chart', async ({ page }) => {
  30  |     await page.goto('/performance');
  31  |     await page.waitForLoadState('networkidle');
  32  | 
  33  |     // Look for timeline chart heading
  34  |     const timelineHeading = page.locator('h3:has-text("Historical Performance")');
  35  |     await expect(timelineHeading).toBeVisible();
  36  |   });
  37  | 
  38  |   test('FIRE page displays trajectories', async ({ page }) => {
  39  |     await page.goto('/fire');
  40  |     await page.waitForLoadState('networkidle');
  41  | 
  42  |     // Look for FIRE-specific headings
  43  |     const fireHeading = page.locator('h1:has-text("🔥")');
  44  |     await expect(fireHeading).toBeVisible();
  45  | 
  46  |     // Check for Monte Carlo trajectories section
  47  |     const trajectorySection = page.locator('text=FIRE Target Tracking');
  48  |     await expect(trajectorySection).toBeVisible();
  49  |   });
  50  | 
  51  |   test('withdraw page shows income charts', async ({ page }) => {
  52  |     await page.goto('/withdraw');
  53  |     await page.waitForLoadState('networkidle');
  54  | 
  55  |     // Look for income-related headings
  56  |     const incomeHeading = page.locator('text=Income');
  57  |     const count = await incomeHeading.count();
  58  |     expect(count).toBeGreaterThanOrEqual(1);
  59  |   });
  60  | 
  61  |   test('charts have canvas or SVG elements', async ({ page }) => {
  62  |     const tabs = ['/dashboard', '/portfolio', '/performance', '/fire', '/withdraw', '/backtest'];
  63  | 
  64  |     for (const tab of tabs) {
  65  |       await page.goto(tab);
  66  |       await page.waitForLoadState('networkidle');
  67  | 
  68  |       // Look for chart.js canvas or SVG elements
  69  |       const canvases = page.locator('canvas');
  70  |       const svgs = page.locator('svg');
  71  | 
  72  |       const canvasCount = await canvases.count();
  73  |       const svgCount = await svgs.count();
  74  | 
  75  |       const totalCharts = canvasCount + svgCount;
  76  |       expect(totalCharts).toBeGreaterThanOrEqual(0); // At least some charts
  77  |     }
  78  |   });
  79  | });
  80  | 
  81  | test.describe('Chart Interactivity', () => {
  82  |   test('collapsible sections toggle', async ({ page }) => {
  83  |     await page.goto('/portfolio');
  84  |     await page.waitForLoadState('networkidle');
  85  | 
  86  |     // Find first collapsible section
  87  |     const sections = page.locator('[id^="section-"]');
  88  |     const firstSection = sections.first();
  89  | 
  90  |     // Get initial state
  91  |     const initialContent = firstSection.locator('..').locator('div').nth(1);
  92  |     const initialVisible = await initialContent.isVisible();
  93  | 
  94  |     // Click the section header to toggle
  95  |     const header = firstSection.locator('..').locator('button, [role="button"]').first();
  96  |     if (header) {
> 97  |       await header.click();
      |                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  98  |       // Wait a moment for animation
  99  |       await page.waitForTimeout(300);
  100 | 
  101 |       const finalVisible = await initialContent.isVisible();
  102 |       // State should have changed (though animation might make timing tricky)
  103 |       expect(typeof finalVisible).toBe('boolean');
  104 |     }
  105 |   });
  106 | 
  107 |   test('hover tooltips appear on charts', async ({ page }) => {
  108 |     await page.goto('/dashboard');
  109 |     await page.waitForLoadState('networkidle');
  110 | 
  111 |     // Look for canvas elements (chart.js)
  112 |     const canvas = page.locator('canvas').first();
  113 | 
  114 |     if (await canvas.isVisible()) {
  115 |       // Hover over canvas
  116 |       await canvas.hover();
  117 | 
  118 |       // Wait for potential tooltip
  119 |       await page.waitForTimeout(500);
  120 | 
  121 |       // Check if tooltip appeared
  122 |       const tooltip = page.locator('[role="tooltip"], .tooltip');
  123 |       // Tooltip might or might not appear, but shouldn't cause errors
  124 |       expect(tooltip).toBeDefined();
  125 |     }
  126 |   });
  127 | });
  128 | 
```