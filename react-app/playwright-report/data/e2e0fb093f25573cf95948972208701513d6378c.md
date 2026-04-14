# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Tab Navigation >> all tabs are visible and accessible
- Location: e2e/navigation.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="/dashboard"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href="/dashboard"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - heading "Excalidraw Canvas" [level=1] [ref=e5]
    - generic [ref=e6]:
      - generic [ref=e9]: Connected
      - button "Sync to Backend" [ref=e11] [cursor=pointer]
      - button "Clear Canvas" [ref=e12] [cursor=pointer]
  - generic [ref=e15]:
    - generic:
      - generic:
        - generic:
          - button [ref=e18] [cursor=pointer]:
            - img [ref=e19]
          - region "Shapes":
            - generic [ref=e25]:
              - generic:
                - generic: To move canvas, hold mouse wheel or spacebar while dragging, or use the hand tool
              - heading "Shapes" [level=2] [ref=e26]
              - generic [ref=e27]:
                - generic "Keep selected tool active after drawing — Q" [ref=e28] [cursor=pointer]:
                  - checkbox "Keep selected tool active after drawing"
                  - img [ref=e30]
                - generic "Hand (panning tool) — H" [ref=e37] [cursor=pointer]:
                  - radio "Hand (panning tool) — H"
                  - img [ref=e39]
                - generic "Selection — V or 1" [ref=e46] [cursor=pointer]:
                  - radio "Selection" [checked]
                  - generic [ref=e47]:
                    - img [ref=e48]
                    - generic [ref=e53]: "1"
                - generic "Rectangle — R or 2" [ref=e54] [cursor=pointer]:
                  - radio "Rectangle"
                  - generic [ref=e55]:
                    - img [ref=e56]
                    - generic [ref=e60]: "2"
                - generic "Diamond — D or 3" [ref=e61] [cursor=pointer]:
                  - radio "Diamond"
                  - generic [ref=e62]:
                    - img [ref=e63]
                    - generic [ref=e67]: "3"
                - generic "Ellipse — O or 4" [ref=e68] [cursor=pointer]:
                  - radio "Ellipse"
                  - generic [ref=e69]:
                    - img [ref=e70]
                    - generic [ref=e74]: "4"
                - generic "Arrow — A or 5" [ref=e75] [cursor=pointer]:
                  - radio "Arrow"
                  - generic [ref=e76]:
                    - img [ref=e77]
                    - generic [ref=e82]: "5"
                - generic "Line — L or 6" [ref=e83] [cursor=pointer]:
                  - radio "Line"
                  - generic [ref=e84]:
                    - img [ref=e85]
                    - generic [ref=e86]: "6"
                - generic "Draw — P or 7" [ref=e87] [cursor=pointer]:
                  - radio "Draw"
                  - generic [ref=e88]:
                    - img [ref=e89]
                    - generic [ref=e93]: "7"
                - generic "Text — T or 8" [ref=e94] [cursor=pointer]:
                  - radio "Text"
                  - generic [ref=e95]:
                    - img [ref=e96]
                    - generic [ref=e101]: "8"
                - generic "Insert image — 9" [ref=e102] [cursor=pointer]:
                  - radio "Insert image"
                  - generic [ref=e103]:
                    - img [ref=e104]
                    - generic [ref=e109]: "9"
                - generic "Eraser — E or 0" [ref=e110] [cursor=pointer]:
                  - radio "Eraser"
                  - generic [ref=e111]:
                    - img [ref=e112]
                    - generic [ref=e117]: "0"
                - button "More tools" [ref=e119] [cursor=pointer]:
                  - img [ref=e120]
          - generic "Library" [ref=e126]:
            - checkbox "Library"
            - generic [ref=e127] [cursor=pointer]:
              - img [ref=e129]
              - generic: Library
      - contentinfo:
        - region "Canvas actions" [ref=e135]:
          - heading "Canvas actions" [level=2] [ref=e136]
          - generic [ref=e138]:
            - button "Zoom out" [ref=e139] [cursor=pointer]:
              - img [ref=e141]
            - button "Reset zoom" [ref=e143] [cursor=pointer]: 100%
            - button "Zoom in" [ref=e144] [cursor=pointer]:
              - img [ref=e146]
          - generic [ref=e148]:
            - button "Undo" [disabled] [ref=e151]:
              - img [ref=e153]
            - button "Redo" [disabled] [ref=e157]:
              - img [ref=e159]
        - button "Help" [ref=e162] [cursor=pointer]:
          - img [ref=e163]
    - generic:
      - img
    - generic [ref=e168]: Drawing canvas
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tab Navigation', () => {
  4   |   test('all tabs are visible and accessible', async ({ page }) => {
  5   |     await page.goto('/');
  6   | 
  7   |     const tabs = [
  8   |       { href: '/dashboard', label: 'Dashboard' },
  9   |       { href: '/portfolio', label: 'Portfolio' },
  10  |       { href: '/performance', label: 'Performance' },
  11  |       { href: '/fire', label: 'FIRE' },
  12  |       { href: '/withdraw', label: 'Withdraw' },
  13  |       { href: '/simulators', label: 'Simulators' },
  14  |       { href: '/backtest', label: 'Backtest' },
  15  |     ];
  16  | 
  17  |     for (const tab of tabs) {
  18  |       const link = page.locator(`a[href="${tab.href}"]`);
> 19  |       await expect(link).toBeVisible();
      |                          ^ Error: expect(locator).toBeVisible() failed
  20  |       await expect(link).toContainText(tab.label);
  21  |     }
  22  |   });
  23  | 
  24  |   test('navigating between tabs works', async ({ page }) => {
  25  |     await page.goto('/dashboard');
  26  |     expect(page.url()).toContain('/dashboard');
  27  | 
  28  |     // Click portfolio tab
  29  |     await page.click('a[href="/portfolio"]');
  30  |     await page.waitForURL('/portfolio');
  31  |     expect(page.url()).toContain('/portfolio');
  32  | 
  33  |     // Click FIRE tab
  34  |     await page.click('a[href="/fire"]');
  35  |     await page.waitForURL('/fire');
  36  |     expect(page.url()).toContain('/fire');
  37  |   });
  38  | 
  39  |   test('tab navigation highlights active tab', async ({ page }) => {
  40  |     await page.goto('/dashboard');
  41  | 
  42  |     const dashboardTab = page.locator('a[href="/dashboard"]');
  43  |     await expect(dashboardTab).toHaveClass(/active/);
  44  | 
  45  |     // Navigate to portfolio
  46  |     await page.click('a[href="/portfolio"]');
  47  |     await page.waitForURL('/portfolio');
  48  | 
  49  |     const portfolioTab = page.locator('a[href="/portfolio"]');
  50  |     await expect(portfolioTab).toHaveClass(/active/);
  51  |   });
  52  | });
  53  | 
  54  | test.describe('Page Loading', () => {
  55  |   test('dashboard loads and displays data', async ({ page }) => {
  56  |     await page.goto('/dashboard');
  57  | 
  58  |     // Wait for page to load
  59  |     await page.waitForLoadState('networkidle');
  60  | 
  61  |     // Check for main heading
  62  |     await expect(page.locator('h1')).toContainText('📈 Performance');
  63  | 
  64  |     // Check for data loaded state (not loading...)
  65  |     const loadingText = page.locator('text=Loading');
  66  |     await expect(loadingText).not.toBeVisible();
  67  |   });
  68  | 
  69  |   test('all tabs load without errors', async ({ page }) => {
  70  |     const tabs = ['/dashboard', '/portfolio', '/performance', '/fire', '/withdraw', '/simulators', '/backtest'];
  71  | 
  72  |     for (const tab of tabs) {
  73  |       await page.goto(tab);
  74  |       await page.waitForLoadState('networkidle');
  75  | 
  76  |       // Check for any error messages
  77  |       const errorElements = page.locator('[data-error], .error, [role="alert"]');
  78  |       const errorCount = await errorElements.count();
  79  |       expect(errorCount).toBe(0);
  80  |     }
  81  |   });
  82  | });
  83  | 
  84  | test.describe('Responsive Design', () => {
  85  |   test('layout works on desktop', async ({ page }) => {
  86  |     await page.setViewportSize({ width: 1920, height: 1080 });
  87  |     await page.goto('/dashboard');
  88  | 
  89  |     // Check header is visible
  90  |     const header = page.locator('header, .header');
  91  |     await expect(header).toBeVisible();
  92  | 
  93  |     // Check tabNav is visible
  94  |     const tabNav = page.locator('nav, .tab-nav');
  95  |     await expect(tabNav).toBeVisible();
  96  |   });
  97  | 
  98  |   test('layout works on mobile', async ({ page }) => {
  99  |     await page.setViewportSize({ width: 375, height: 667 });
  100 |     await page.goto('/dashboard');
  101 | 
  102 |     // Layout should still be accessible
  103 |     const heading = page.locator('h1');
  104 |     await expect(heading).toBeVisible();
  105 |   });
  106 | 
  107 |   test('layout works on tablet', async ({ page }) => {
  108 |     await page.setViewportSize({ width: 768, height: 1024 });
  109 |     await page.goto('/dashboard');
  110 | 
  111 |     // Tabs should be accessible
  112 |     const portfolioTab = page.locator('a[href="/portfolio"]');
  113 |     await expect(portfolioTab).toBeVisible();
  114 |   });
  115 | });
  116 | 
```