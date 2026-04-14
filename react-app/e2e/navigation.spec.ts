import { test, expect } from '@playwright/test';

test.describe('Tab Navigation', () => {
  test('all tabs are visible and accessible', async ({ page }) => {
    await page.goto('/');

    const tabs = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/portfolio', label: 'Portfolio' },
      { href: '/performance', label: 'Performance' },
      { href: '/fire', label: 'FIRE' },
      { href: '/withdraw', label: 'Withdraw' },
      { href: '/simulators', label: 'Simulators' },
      { href: '/backtest', label: 'Backtest' },
    ];

    for (const tab of tabs) {
      const link = page.locator(`a[href="${tab.href}"]`);
      await expect(link).toBeVisible();
      await expect(link).toContainText(tab.label);
    }
  });

  test('navigating between tabs works', async ({ page }) => {
    await page.goto('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // Click portfolio tab
    await page.click('a[href="/portfolio"]');
    await page.waitForURL('/portfolio');
    expect(page.url()).toContain('/portfolio');

    // Click FIRE tab
    await page.click('a[href="/fire"]');
    await page.waitForURL('/fire');
    expect(page.url()).toContain('/fire');
  });

  test('tab navigation highlights active tab', async ({ page }) => {
    await page.goto('/dashboard');

    const dashboardTab = page.locator('a[href="/dashboard"]');
    await expect(dashboardTab).toHaveClass(/active/);

    // Navigate to portfolio
    await page.click('a[href="/portfolio"]');
    await page.waitForURL('/portfolio');

    const portfolioTab = page.locator('a[href="/portfolio"]');
    await expect(portfolioTab).toHaveClass(/active/);
  });
});

test.describe('Page Loading', () => {
  test('dashboard loads and displays data', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for main heading
    await expect(page.locator('h1')).toContainText('📈 Performance');

    // Check for data loaded state (not loading...)
    const loadingText = page.locator('text=Loading');
    await expect(loadingText).not.toBeVisible();
  });

  test('all tabs load without errors', async ({ page }) => {
    const tabs = ['/dashboard', '/portfolio', '/performance', '/fire', '/withdraw', '/simulators', '/backtest'];

    for (const tab of tabs) {
      await page.goto(tab);
      await page.waitForLoadState('networkidle');

      // Check for any error messages
      const errorElements = page.locator('[data-error], .error, [role="alert"]');
      const errorCount = await errorElements.count();
      expect(errorCount).toBe(0);
    }
  });
});

test.describe('Responsive Design', () => {
  test('layout works on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');

    // Check header is visible
    const header = page.locator('header, .header');
    await expect(header).toBeVisible();

    // Check tabNav is visible
    const tabNav = page.locator('nav, .tab-nav');
    await expect(tabNav).toBeVisible();
  });

  test('layout works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Layout should still be accessible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('layout works on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');

    // Tabs should be accessible
    const portfolioTab = page.locator('a[href="/portfolio"]');
    await expect(portfolioTab).toBeVisible();
  });
});
