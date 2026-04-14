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
            - generic [ref=e28]:
              - generic:
                - generic: To move canvas, hold mouse wheel or spacebar while dragging, or use the hand tool
              - heading "Shapes" [level=2] [ref=e29]
              - generic [ref=e30]:
                - generic "Keep selected tool active after drawing — Q" [ref=e31] [cursor=pointer]:
                  - checkbox "Keep selected tool active after drawing"
                  - img [ref=e33]
                - generic "Hand (panning tool) — H" [ref=e40] [cursor=pointer]:
                  - radio "Hand (panning tool) — H"
                  - img [ref=e42]
                - generic "Selection — V or 1" [ref=e49] [cursor=pointer]:
                  - radio "Selection" [checked]
                  - generic [ref=e50]:
                    - img [ref=e51]
                    - generic [ref=e56]: "1"
                - generic "Rectangle — R or 2" [ref=e57] [cursor=pointer]:
                  - radio "Rectangle"
                  - generic [ref=e58]:
                    - img [ref=e59]
                    - generic [ref=e63]: "2"
                - generic "Diamond — D or 3" [ref=e64] [cursor=pointer]:
                  - radio "Diamond"
                  - generic [ref=e65]:
                    - img [ref=e66]
                    - generic [ref=e70]: "3"
                - generic "Ellipse — O or 4" [ref=e71] [cursor=pointer]:
                  - radio "Ellipse"
                  - generic [ref=e72]:
                    - img [ref=e73]
                    - generic [ref=e77]: "4"
                - generic "Arrow — A or 5" [ref=e78] [cursor=pointer]:
                  - radio "Arrow"
                  - generic [ref=e79]:
                    - img [ref=e80]
                    - generic [ref=e86]: "5"
                - generic "Line — L or 6" [ref=e87] [cursor=pointer]:
                  - radio "Line"
                  - generic [ref=e88]:
                    - img [ref=e89]
                    - generic [ref=e91]: "6"
                - generic "Draw — P or 7" [ref=e92] [cursor=pointer]:
                  - radio "Draw"
                  - generic [ref=e93]:
                    - img [ref=e94]
                    - generic [ref=e98]: "7"
                - generic "Text — T or 8" [ref=e99] [cursor=pointer]:
                  - radio "Text"
                  - generic [ref=e100]:
                    - img [ref=e101]
                    - generic [ref=e109]: "8"
                - generic "Insert image — 9" [ref=e110] [cursor=pointer]:
                  - radio "Insert image"
                  - generic [ref=e111]:
                    - img [ref=e112]
                    - generic [ref=e118]: "9"
                - generic "Eraser — E or 0" [ref=e119] [cursor=pointer]:
                  - radio "Eraser"
                  - generic [ref=e120]:
                    - img [ref=e121]
                    - generic [ref=e126]: "0"
                - button "More tools" [ref=e128] [cursor=pointer]:
                  - img [ref=e129]
          - generic "Library" [ref=e135]:
            - checkbox "Library"
            - generic [ref=e136] [cursor=pointer]:
              - img [ref=e138]
              - generic: Library
      - contentinfo:
        - region "Canvas actions" [ref=e147]:
          - heading "Canvas actions" [level=2] [ref=e148]
          - generic [ref=e150]:
            - button "Zoom out" [ref=e151] [cursor=pointer]:
              - img [ref=e153]
            - button "Reset zoom" [ref=e156] [cursor=pointer]: 100%
            - button "Zoom in" [ref=e157] [cursor=pointer]:
              - img [ref=e159]
          - generic [ref=e161]:
            - button "Undo" [disabled] [ref=e164]:
              - img [ref=e166]
            - button "Redo" [disabled] [ref=e170]:
              - img [ref=e172]
        - button "Help" [ref=e175] [cursor=pointer]:
          - img [ref=e176]
    - generic:
      - img
    - generic [ref=e182]: Drawing canvas
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