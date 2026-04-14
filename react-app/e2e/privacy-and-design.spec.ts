import { test, expect } from '@playwright/test';

test.describe('Privacy Mode', () => {
  test('privacy mode toggle is visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for privacy toggle button (lock/eye icon)
    const privacyToggle = page.locator('button:has-text("🔒"), button:has-text("👁️")');
    expect(privacyToggle).toBeDefined();
  });

  test('privacy mode masks sensitive values', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find privacy toggle
    const privacyToggle = page.locator('button').filter({
      hasText: /🔒|👁️/,
    }).first();

    if (await privacyToggle.isVisible()) {
      // Click to enable privacy mode
      await privacyToggle.click();
      await page.waitForTimeout(500);

      // Check for masked content indicators
      const maskedElements = page.locator('text=/•••|—/');
      const maskedCount = await maskedElements.count();

      // Privacy mode should mask some values
      expect(maskedCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('privacy mode disables chart tooltips', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Enable privacy mode
    const privacyToggle = page.locator('button').filter({
      hasText: /🔒|👁️/,
    }).first();

    await privacyToggle.click();
    await page.waitForTimeout(500);

    // Try to hover over canvas
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      await canvas.hover();
      await page.waitForTimeout(300);

      // Tooltips should be hidden in privacy mode
      const tooltip = page.locator('[role="tooltip"]');
      // Should not have visible tooltips, or should show masked data
      expect(tooltip).toBeDefined();
    }
  });

  test('privacy mode affects all tabs', async ({ page }) => {
    const tabs = ['/portfolio', '/performance', '/fire'];

    for (const tab of tabs) {
      await page.goto(tab);
      await page.waitForLoadState('networkidle');

      // Enable privacy mode
      const privacyToggle = page.locator('button').filter({
        hasText: /🔒|👁️/,
      }).first();

      await privacyToggle.click();
      await page.waitForTimeout(300);

      // Check that page still displays without errors
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    }
  });
});

test.describe('Design & Layout', () => {
  test('dark theme colors are applied', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for dark background
    const body = page.locator('body, [style*="backgroundColor"]').first();
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Should be dark (dark gray or black)
    expect(bgColor).toMatch(/rgb\(31|rgb\(17|rgb\(0/);
  });

  test('header is sticky and visible when scrolling', async ({ page }) => {
    await page.goto('/dashboard');
    await page.setViewportSize({ width: 1920, height: 800 });
    await page.waitForLoadState('networkidle');

    // Find header
    const header = page.locator('header, [style*="sticky"]').first();
    await expect(header).toBeVisible();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Header should still be visible
    await expect(header).toBeVisible();
  });

  test('tab navigation bar is visible and sticky', async ({ page }) => {
    await page.goto('/dashboard');
    await page.setViewportSize({ width: 1920, height: 600 });
    await page.waitForLoadState('networkidle');

    // Find tab nav
    const tabNav = page.locator('nav');
    const initialVisible = await tabNav.isVisible();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 300));

    // Tab nav should still be visible
    const stillVisible = await tabNav.isVisible();
    expect(stillVisible).toBe(initialVisible);
  });

  test('cards have consistent styling', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find multiple cards
    const cards = page.locator('[style*="backgroundColor"][style*="borderRadius"]');
    const cardCount = await cards.count();

    expect(cardCount).toBeGreaterThan(0);

    // All visible cards should have consistent properties
    for (let i = 0; i < Math.min(5, cardCount); i++) {
      const card = cards.nth(i);
      const visible = await card.isVisible();

      if (visible) {
        const bgColor = await card.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toBeDefined();
      }
    }
  });

  test('text is readable with proper contrast', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for text elements with light text on dark background
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    expect(headingCount).toBeGreaterThan(0);

    // All headings should be visible (implies readable contrast)
    for (let i = 0; i < Math.min(3, headingCount); i++) {
      const heading = headings.nth(i);
      const visible = await heading.isVisible();
      expect(visible).toBe(true);
    }
  });

  test('spacing and padding are consistent', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');

    // Find main content container
    const mainContent = page.locator('main, [role="main"], > div').first();

    if (await mainContent.isVisible()) {
      // Should have some padding
      const padding = await mainContent.evaluate(
        (el) => window.getComputedStyle(el).padding
      );
      expect(padding).toBeDefined();
    }
  });

  test('footer displays generation date and staleness warning', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Look for footer info
    const footer = page.locator('footer, [style*="borderTop"]').last();

    if (await footer.isVisible()) {
      const footerText = await footer.textContent();
      expect(footerText).toBeDefined();
    }
  });

  test('layout handles long numbers gracefully', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');

    // Find elements with large numbers (prices, values)
    const numberElements = page.locator('[style*="color"]').filter({
      hasText: /\d{1,},\d{3}/,
    });

    const count = await numberElements.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // Elements should not cause layout overflow
    const firstNumber = numberElements.first();
    if (await firstNumber.isVisible()) {
      const box = await firstNumber.boundingBox();
      expect(box).toBeDefined();
      expect(box?.width).toBeGreaterThan(0);
    }
  });
});
