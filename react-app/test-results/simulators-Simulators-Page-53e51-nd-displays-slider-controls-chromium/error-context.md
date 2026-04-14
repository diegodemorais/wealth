# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: simulators.spec.ts >> Simulators Page >> simulators page loads and displays slider controls
- Location: e2e/simulators.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1:has-text("🧪")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1:has-text("🧪")')

```

# Page snapshot

```yaml
- generic [ref=e2]: Cannot GET /simulators
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Simulators Page', () => {
  4   |   test('simulators page loads and displays slider controls', async ({ page }) => {
  5   |     await page.goto('/simulators');
  6   |     await page.waitForLoadState('networkidle');
  7   | 
  8   |     // Check for heading
  9   |     const heading = page.locator('h1:has-text("🧪")');
> 10  |     await expect(heading).toBeVisible();
      |                           ^ Error: expect(locator).toBeVisible() failed
  11  | 
  12  |     // Look for simulator parameter section
  13  |     const paramsSection = page.locator('text=Scenario Parameters');
  14  |     await expect(paramsSection).toBeVisible();
  15  |   });
  16  | 
  17  |   test('all 4 slider controls are present', async ({ page }) => {
  18  |     await page.goto('/simulators');
  19  |     await page.waitForLoadState('networkidle');
  20  | 
  21  |     // Look for slider labels
  22  |     const stressLabel = page.locator('text=Market Stress Level');
  23  |     const contributionLabel = page.locator('text=Monthly Contribution');
  24  |     const returnLabel = page.locator('text=Expected Annual Return');
  25  |     const volatilityLabel = page.locator('text=Return Volatility');
  26  | 
  27  |     await expect(stressLabel).toBeVisible();
  28  |     await expect(contributionLabel).toBeVisible();
  29  |     await expect(returnLabel).toBeVisible();
  30  |     await expect(volatilityLabel).toBeVisible();
  31  |   });
  32  | 
  33  |   test('sliders can be adjusted', async ({ page }) => {
  34  |     await page.goto('/simulators');
  35  |     await page.waitForLoadState('networkidle');
  36  | 
  37  |     // Find stress level slider
  38  |     const stressSlider = page.locator('input[type="range"]').first();
  39  | 
  40  |     if (await stressSlider.isVisible()) {
  41  |       const initialValue = await stressSlider.inputValue();
  42  | 
  43  |       // Adjust slider
  44  |       await stressSlider.fill('50');
  45  | 
  46  |       const newValue = await stressSlider.inputValue();
  47  |       expect(newValue).toBe('50');
  48  |       expect(newValue).not.toBe(initialValue);
  49  |     }
  50  |   });
  51  | 
  52  |   test('slider changes trigger simulations', async ({ page }) => {
  53  |     await page.goto('/simulators');
  54  |     await page.waitForLoadState('networkidle');
  55  | 
  56  |     // Find all sliders
  57  |     const sliders = page.locator('input[type="range"]');
  58  |     const sliderCount = await sliders.count();
  59  | 
  60  |     expect(sliderCount).toBe(4); // Should have 4 sliders
  61  | 
  62  |     // Adjust first slider
  63  |     const firstSlider = sliders.first();
  64  |     await firstSlider.fill('30');
  65  | 
  66  |     // Wait for simulation to run
  67  |     await page.waitForTimeout(500);
  68  | 
  69  |     // Check if success rate card is displayed
  70  |     const successCard = page.locator('text=FIRE Success Probability');
  71  |     await expect(successCard).toBeVisible();
  72  |   });
  73  | 
  74  |   test('success rate display shows percentage', async ({ page }) => {
  75  |     await page.goto('/simulators');
  76  |     await page.waitForLoadState('networkidle');
  77  | 
  78  |     // Look for success rate percentage
  79  |     const percentage = page.locator('text=/\\d+\\.\\d+%/'); // Matches patterns like "85.5%"
  80  |     const count = await percentage.count();
  81  | 
  82  |     expect(count).toBeGreaterThan(0);
  83  |   });
  84  | 
  85  |   test('drawdown distribution histogram is visible', async ({ page }) => {
  86  |     await page.goto('/simulators');
  87  |     await page.waitForLoadState('networkidle');
  88  | 
  89  |     // Look for drawdown heading
  90  |     const drawdownHeading = page.locator('text=Drawdown Distribution');
  91  |     await expect(drawdownHeading).toBeVisible();
  92  | 
  93  |     // Look for canvas (chart)
  94  |     const canvas = page.locator('canvas');
  95  |     const count = await canvas.count();
  96  | 
  97  |     expect(count).toBeGreaterThan(0);
  98  |   });
  99  | 
  100 |   test('Monte Carlo trajectories update after slider change', async ({ page }) => {
  101 |     await page.goto('/simulators');
  102 |     await page.waitForLoadState('networkidle');
  103 | 
  104 |     // Wait for initial chart to load
  105 |     await page.waitForTimeout(1000);
  106 | 
  107 |     // Find trajectory heading
  108 |     const trajHeading = page.locator('text=Monte Carlo Trajectories');
  109 |     await expect(trajHeading).toBeVisible();
  110 | 
```