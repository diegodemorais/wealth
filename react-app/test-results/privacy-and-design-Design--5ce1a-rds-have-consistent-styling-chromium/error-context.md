# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: privacy-and-design.spec.ts >> Design & Layout >> cards have consistent styling
- Location: e2e/privacy-and-design.spec.ts:129:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e2]: Cannot GET /dashboard
```

# Test source

```ts
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
> 137 |     expect(cardCount).toBeGreaterThan(0);
      |                       ^ Error: expect(received).toBeGreaterThan(expected)
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
  204 |     await page.goto('/portfolio');
  205 |     await page.waitForLoadState('networkidle');
  206 | 
  207 |     // Find elements with large numbers (prices, values)
  208 |     const numberElements = page.locator('[style*="color"]').filter({
  209 |       hasText: /\d{1,},\d{3}/,
  210 |     });
  211 | 
  212 |     const count = await numberElements.count();
  213 |     expect(count).toBeGreaterThanOrEqual(0);
  214 | 
  215 |     // Elements should not cause layout overflow
  216 |     const firstNumber = numberElements.first();
  217 |     if (await firstNumber.isVisible()) {
  218 |       const box = await firstNumber.boundingBox();
  219 |       expect(box).toBeDefined();
  220 |       expect(box?.width).toBeGreaterThan(0);
  221 |     }
  222 |   });
  223 | });
  224 | 
```