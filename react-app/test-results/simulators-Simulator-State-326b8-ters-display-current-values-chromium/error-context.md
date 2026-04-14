# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: simulators.spec.ts >> Simulator State Persistence >> scenario parameters display current values
- Location: e2e/simulators.spec.ts:169:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/Scenario:/')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/Scenario:/')

```

# Page snapshot

```yaml
- generic [ref=e2]: Cannot GET /simulators
```

# Test source

```ts
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
  111 |     // Adjust slider to trigger new simulation
  112 |     const sliders = page.locator('input[type="range"]');
  113 |     const monthlyContributionSlider = sliders.nth(1);
  114 |     await monthlyContributionSlider.fill('15000');
  115 | 
  116 |     // Wait for chart update
  117 |     await page.waitForTimeout(1000);
  118 | 
  119 |     // Chart should still be visible
  120 |     await expect(trajHeading).toBeVisible();
  121 |   });
  122 | 
  123 |   test('stress level parameter affects success rate', async ({ page }) => {
  124 |     await page.goto('/simulators');
  125 |     await page.waitForLoadState('networkidle');
  126 | 
  127 |     // Get initial success rate
  128 |     const percentages = page.locator('text=/\\d+\\.\\d+%/');
  129 |     const initialCount = await percentages.count();
  130 |     const initialText = await percentages.first().textContent();
  131 | 
  132 |     // Set stress to maximum (100)
  133 |     const stressSlider = page.locator('input[type="range"]').first();
  134 |     await stressSlider.fill('100');
  135 | 
  136 |     // Wait for simulation
  137 |     await page.waitForTimeout(1000);
  138 | 
  139 |     // Get new success rate
  140 |     const newText = await percentages.first().textContent();
  141 | 
  142 |     // Success rate should change with stress level
  143 |     expect(newText).not.toBe(initialText);
  144 |   });
  145 | 
  146 |   test('monthly contribution affects trajectories', async ({ page }) => {
  147 |     await page.goto('/simulators');
  148 |     await page.waitForLoadState('networkidle');
  149 | 
  150 |     // Find contribution slider (2nd slider)
  151 |     const sliders = page.locator('input[type="range"]');
  152 |     const contributionSlider = sliders.nth(1);
  153 | 
  154 |     // Lower contribution
  155 |     await contributionSlider.fill('5000');
  156 |     await page.waitForTimeout(500);
  157 | 
  158 |     // Increase contribution
  159 |     await contributionSlider.fill('20000');
  160 |     await page.waitForTimeout(500);
  161 | 
  162 |     // Check that trajectory section is still visible
  163 |     const trajHeading = page.locator('text=Monte Carlo Trajectories');
  164 |     await expect(trajHeading).toBeVisible();
  165 |   });
  166 | });
  167 | 
  168 | test.describe('Simulator State Persistence', () => {
  169 |   test('scenario parameters display current values', async ({ page }) => {
  170 |     await page.goto('/simulators');
  171 |     await page.waitForLoadState('networkidle');
  172 | 
  173 |     // Look for scenario summary
  174 |     const scenarioSummary = page.locator('text=/Scenario:/');
> 175 |     await expect(scenarioSummary).toBeVisible();
      |                                   ^ Error: expect(locator).toBeVisible() failed
  176 | 
  177 |     // Should display values like "R$5,000/mo | 7.0% ± 12%"
  178 |     const summaryText = await page.locator('[style*="color"]').filter({
  179 |       hasText: /R\$/,
  180 |     }).first().textContent();
  181 | 
  182 |     expect(summaryText).toContain('R$');
  183 |   });
  184 | });
  185 | 
```