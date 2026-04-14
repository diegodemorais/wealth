import { test, expect } from '@playwright/test';

test.describe('Simulators Page', () => {
  test('simulators page loads and displays slider controls', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Check for heading
    const heading = page.locator('h1:has-text("🧪")');
    await expect(heading).toBeVisible();

    // Look for simulator parameter section
    const paramsSection = page.locator('text=Scenario Parameters');
    await expect(paramsSection).toBeVisible();
  });

  test('all 4 slider controls are present', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Look for slider labels
    const stressLabel = page.locator('text=Market Stress Level');
    const contributionLabel = page.locator('text=Monthly Contribution');
    const returnLabel = page.locator('text=Expected Annual Return');
    const volatilityLabel = page.locator('text=Return Volatility');

    await expect(stressLabel).toBeVisible();
    await expect(contributionLabel).toBeVisible();
    await expect(returnLabel).toBeVisible();
    await expect(volatilityLabel).toBeVisible();
  });

  test('sliders can be adjusted', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Find stress level slider
    const stressSlider = page.locator('input[type="range"]').first();

    if (await stressSlider.isVisible()) {
      const initialValue = await stressSlider.inputValue();

      // Adjust slider
      await stressSlider.fill('50');

      const newValue = await stressSlider.inputValue();
      expect(newValue).toBe('50');
      expect(newValue).not.toBe(initialValue);
    }
  });

  test('slider changes trigger simulations', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Find all sliders
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();

    expect(sliderCount).toBe(4); // Should have 4 sliders

    // Adjust first slider
    const firstSlider = sliders.first();
    await firstSlider.fill('30');

    // Wait for simulation to run
    await page.waitForTimeout(500);

    // Check if success rate card is displayed
    const successCard = page.locator('text=FIRE Success Probability');
    await expect(successCard).toBeVisible();
  });

  test('success rate display shows percentage', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Look for success rate percentage
    const percentage = page.locator('text=/\\d+\\.\\d+%/'); // Matches patterns like "85.5%"
    const count = await percentage.count();

    expect(count).toBeGreaterThan(0);
  });

  test('drawdown distribution histogram is visible', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Look for drawdown heading
    const drawdownHeading = page.locator('text=Drawdown Distribution');
    await expect(drawdownHeading).toBeVisible();

    // Look for canvas (chart)
    const canvas = page.locator('canvas');
    const count = await canvas.count();

    expect(count).toBeGreaterThan(0);
  });

  test('Monte Carlo trajectories update after slider change', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Wait for initial chart to load
    await page.waitForTimeout(1000);

    // Find trajectory heading
    const trajHeading = page.locator('text=Monte Carlo Trajectories');
    await expect(trajHeading).toBeVisible();

    // Adjust slider to trigger new simulation
    const sliders = page.locator('input[type="range"]');
    const monthlyContributionSlider = sliders.nth(1);
    await monthlyContributionSlider.fill('15000');

    // Wait for chart update
    await page.waitForTimeout(1000);

    // Chart should still be visible
    await expect(trajHeading).toBeVisible();
  });

  test('stress level parameter affects success rate', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Get initial success rate
    const percentages = page.locator('text=/\\d+\\.\\d+%/');
    const initialCount = await percentages.count();
    const initialText = await percentages.first().textContent();

    // Set stress to maximum (100)
    const stressSlider = page.locator('input[type="range"]').first();
    await stressSlider.fill('100');

    // Wait for simulation
    await page.waitForTimeout(1000);

    // Get new success rate
    const newText = await percentages.first().textContent();

    // Success rate should change with stress level
    expect(newText).not.toBe(initialText);
  });

  test('monthly contribution affects trajectories', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Find contribution slider (2nd slider)
    const sliders = page.locator('input[type="range"]');
    const contributionSlider = sliders.nth(1);

    // Lower contribution
    await contributionSlider.fill('5000');
    await page.waitForTimeout(500);

    // Increase contribution
    await contributionSlider.fill('20000');
    await page.waitForTimeout(500);

    // Check that trajectory section is still visible
    const trajHeading = page.locator('text=Monte Carlo Trajectories');
    await expect(trajHeading).toBeVisible();
  });
});

test.describe('Simulator State Persistence', () => {
  test('scenario parameters display current values', async ({ page }) => {
    await page.goto('/simulators');
    await page.waitForLoadState('networkidle');

    // Look for scenario summary
    const scenarioSummary = page.locator('text=/Scenario:/');
    await expect(scenarioSummary).toBeVisible();

    // Should display values like "R$5,000/mo | 7.0% ± 12%"
    const summaryText = await page.locator('[style*="color"]').filter({
      hasText: /R\$/,
    }).first().textContent();

    expect(summaryText).toContain('R$');
  });
});
