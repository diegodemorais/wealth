# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Responsive Design >> layout works on tablet
- Location: e2e/navigation.spec.ts:107:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="/portfolio"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href="/portfolio"]')

```

# Page snapshot

```yaml
- generic [ref=e2]: Cannot GET /dashboard
```

# Test source

```ts
  13  |       { href: '/simulators', label: 'Simulators' },
  14  |       { href: '/backtest', label: 'Backtest' },
  15  |     ];
  16  | 
  17  |     for (const tab of tabs) {
  18  |       const link = page.locator(`a[href="${tab.href}"]`);
  19  |       await expect(link).toBeVisible();
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
> 113 |     await expect(portfolioTab).toBeVisible();
      |                                ^ Error: expect(locator).toBeVisible() failed
  114 |   });
  115 | });
  116 | 
```