# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: privacy-and-design.spec.ts >> Privacy Mode >> privacy mode disables chart tooltips
- Location: e2e/privacy-and-design.spec.ts:36:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /🔒|👁️/ }).first()

```

# Page snapshot

```yaml
- generic [ref=e2]: Cannot GET /dashboard
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Privacy Mode', () => {
  4   |   test('privacy mode toggle is visible', async ({ page }) => {
  5   |     await page.goto('/dashboard');
  6   |     await page.waitForLoadState('networkidle');
  7   | 
  8   |     // Look for privacy toggle button (lock/eye icon)
  9   |     const privacyToggle = page.locator('button:has-text("🔒"), button:has-text("👁️")');
  10  |     expect(privacyToggle).toBeDefined();
  11  |   });
  12  | 
  13  |   test('privacy mode masks sensitive values', async ({ page }) => {
  14  |     await page.goto('/dashboard');
  15  |     await page.waitForLoadState('networkidle');
  16  | 
  17  |     // Find privacy toggle
  18  |     const privacyToggle = page.locator('button').filter({
  19  |       hasText: /🔒|👁️/,
  20  |     }).first();
  21  | 
  22  |     if (await privacyToggle.isVisible()) {
  23  |       // Click to enable privacy mode
  24  |       await privacyToggle.click();
  25  |       await page.waitForTimeout(500);
  26  | 
  27  |       // Check for masked content indicators
  28  |       const maskedElements = page.locator('text=/•••|—/');
  29  |       const maskedCount = await maskedElements.count();
  30  | 
  31  |       // Privacy mode should mask some values
  32  |       expect(maskedCount).toBeGreaterThanOrEqual(0);
  33  |     }
  34  |   });
  35  | 
  36  |   test('privacy mode disables chart tooltips', async ({ page }) => {
  37  |     await page.goto('/dashboard');
  38  |     await page.waitForLoadState('networkidle');
  39  | 
  40  |     // Enable privacy mode
  41  |     const privacyToggle = page.locator('button').filter({
  42  |       hasText: /🔒|👁️/,
  43  |     }).first();
  44  | 
> 45  |     await privacyToggle.click();
      |                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  46  |     await page.waitForTimeout(500);
  47  | 
  48  |     // Try to hover over canvas
  49  |     const canvas = page.locator('canvas').first();
  50  |     if (await canvas.isVisible()) {
  51  |       await canvas.hover();
  52  |       await page.waitForTimeout(300);
  53  | 
  54  |       // Tooltips should be hidden in privacy mode
  55  |       const tooltip = page.locator('[role="tooltip"]');
  56  |       // Should not have visible tooltips, or should show masked data
  57  |       expect(tooltip).toBeDefined();
  58  |     }
  59  |   });
  60  | 
  61  |   test('privacy mode affects all tabs', async ({ page }) => {
  62  |     const tabs = ['/portfolio', '/performance', '/fire'];
  63  | 
  64  |     for (const tab of tabs) {
  65  |       await page.goto(tab);
  66  |       await page.waitForLoadState('networkidle');
  67  | 
  68  |       // Enable privacy mode
  69  |       const privacyToggle = page.locator('button').filter({
  70  |         hasText: /🔒|👁️/,
  71  |       }).first();
  72  | 
  73  |       await privacyToggle.click();
  74  |       await page.waitForTimeout(300);
  75  | 
  76  |       // Check that page still displays without errors
  77  |       const heading = page.locator('h1');
  78  |       await expect(heading).toBeVisible();
  79  |     }
  80  |   });
  81  | });
  82  | 
  83  | test.describe('Design & Layout', () => {
  84  |   test('dark theme colors are applied', async ({ page }) => {
  85  |     await page.goto('/dashboard');
  86  |     await page.waitForLoadState('networkidle');
  87  | 
  88  |     // Check for dark background
  89  |     const body = page.locator('body, [style*="backgroundColor"]').first();
  90  |     const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  91  | 
  92  |     // Should be dark (dark gray or black)
  93  |     expect(bgColor).toMatch(/rgb\(31|rgb\(17|rgb\(0/);
  94  |   });
  95  | 
  96  |   test('header is sticky and visible when scrolling', async ({ page }) => {
  97  |     await page.goto('/dashboard');
  98  |     await page.setViewportSize({ width: 1920, height: 800 });
  99  |     await page.waitForLoadState('networkidle');
  100 | 
  101 |     // Find header
  102 |     const header = page.locator('header, [style*="sticky"]').first();
  103 |     await expect(header).toBeVisible();
  104 | 
  105 |     // Scroll down
  106 |     await page.evaluate(() => window.scrollBy(0, 500));
  107 | 
  108 |     // Header should still be visible
  109 |     await expect(header).toBeVisible();
  110 |   });
  111 | 
  112 |   test('tab navigation bar is visible and sticky', async ({ page }) => {
  113 |     await page.goto('/dashboard');
  114 |     await page.setViewportSize({ width: 1920, height: 600 });
  115 |     await page.waitForLoadState('networkidle');
  116 | 
  117 |     // Find tab nav
  118 |     const tabNav = page.locator('nav');
  119 |     const initialVisible = await tabNav.isVisible();
  120 | 
  121 |     // Scroll down
  122 |     await page.evaluate(() => window.scrollBy(0, 300));
  123 | 
  124 |     // Tab nav should still be visible
  125 |     const stillVisible = await tabNav.isVisible();
  126 |     expect(stillVisible).toBe(initialVisible);
  127 |   });
  128 | 
  129 |   test('cards have consistent styling', async ({ page }) => {
  130 |     await page.goto('/dashboard');
  131 |     await page.waitForLoadState('networkidle');
  132 | 
  133 |     // Find multiple cards
  134 |     const cards = page.locator('[style*="backgroundColor"][style*="borderRadius"]');
  135 |     const cardCount = await cards.count();
  136 | 
  137 |     expect(cardCount).toBeGreaterThan(0);
  138 | 
  139 |     // All visible cards should have consistent properties
  140 |     for (let i = 0; i < Math.min(5, cardCount); i++) {
  141 |       const card = cards.nth(i);
  142 |       const visible = await card.isVisible();
  143 | 
  144 |       if (visible) {
  145 |         const bgColor = await card.evaluate(
```