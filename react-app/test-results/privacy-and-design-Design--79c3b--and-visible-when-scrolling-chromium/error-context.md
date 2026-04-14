# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: privacy-and-design.spec.ts >> Design & Layout >> header is sticky and visible when scrolling
- Location: e2e/privacy-and-design.spec.ts:96:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('header, [style*="sticky"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('header, [style*="sticky"]').first()

```

# Page snapshot

```yaml
- generic [ref=e2]: Cannot GET /dashboard
```

# Test source

```ts
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
  45  |     await privacyToggle.click();
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
> 103 |     await expect(header).toBeVisible();
      |                          ^ Error: expect(locator).toBeVisible() failed
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
  146 |           (el) => window.getComputedStyle(el).backgroundColor
  147 |         );
  148 |         expect(bgColor).toBeDefined();
  149 |       }
  150 |     }
  151 |   });
  152 | 
  153 |   test('text is readable with proper contrast', async ({ page }) => {
  154 |     await page.goto('/dashboard');
  155 |     await page.waitForLoadState('networkidle');
  156 | 
  157 |     // Check for text elements with light text on dark background
  158 |     const headings = page.locator('h1, h2, h3, h4, h5, h6');
  159 |     const headingCount = await headings.count();
  160 | 
  161 |     expect(headingCount).toBeGreaterThan(0);
  162 | 
  163 |     // All headings should be visible (implies readable contrast)
  164 |     for (let i = 0; i < Math.min(3, headingCount); i++) {
  165 |       const heading = headings.nth(i);
  166 |       const visible = await heading.isVisible();
  167 |       expect(visible).toBe(true);
  168 |     }
  169 |   });
  170 | 
  171 |   test('spacing and padding are consistent', async ({ page }) => {
  172 |     await page.goto('/portfolio');
  173 |     await page.waitForLoadState('networkidle');
  174 | 
  175 |     // Find main content container
  176 |     const mainContent = page.locator('main, [role="main"], > div').first();
  177 | 
  178 |     if (await mainContent.isVisible()) {
  179 |       // Should have some padding
  180 |       const padding = await mainContent.evaluate(
  181 |         (el) => window.getComputedStyle(el).padding
  182 |       );
  183 |       expect(padding).toBeDefined();
  184 |     }
  185 |   });
  186 | 
  187 |   test('footer displays generation date and staleness warning', async ({ page }) => {
  188 |     await page.goto('/dashboard');
  189 |     await page.waitForLoadState('networkidle');
  190 | 
  191 |     // Scroll to bottom
  192 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  193 | 
  194 |     // Look for footer info
  195 |     const footer = page.locator('footer, [style*="borderTop"]').last();
  196 | 
  197 |     if (await footer.isVisible()) {
  198 |       const footerText = await footer.textContent();
  199 |       expect(footerText).toBeDefined();
  200 |     }
  201 |   });
  202 | 
  203 |   test('layout handles long numbers gracefully', async ({ page }) => {
```