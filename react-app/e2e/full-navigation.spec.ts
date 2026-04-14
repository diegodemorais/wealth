import { test } from '@playwright/test';

test('Navigate all tabs and capture component structure', async ({ page }) => {
  const baseUrl = 'https://diegodemorais.github.io/wealth/dash';

  const tabs = [
    { name: 'Dashboard', url: '/' },
    { name: 'Portfolio', url: '/portfolio' },
    { name: 'Performance', url: '/performance' },
    { name: 'FIRE', url: '/fire' },
    { name: 'Withdraw', url: '/withdraw' },
    { name: 'Simulators', url: '/simulators' },
    { name: 'Backtest', url: '/backtest' },
  ];

  for (const tab of tabs) {
    console.log(`\n========== TAB: ${tab.name} ==========`);
    await page.goto(baseUrl + tab.url);
    await page.waitForTimeout(2000);

    // Get main heading
    const heading = await page.locator('h1, h2').first().innerText().catch(() => 'No heading');
    console.log(`Heading: ${heading}`);

    // Count major component types
    const sections = await page.locator('section').count();
    const divWithClass = await page.locator('[class*="section"], [class*="container"], [class*="card"]').count();
    const headings = await page.locator('h2, h3').count();

    console.log(`Sections: ${sections}, Divs with class: ${divWithClass}, Headings: ${headings}`);

    // Get visible text preview (first 300 chars)
    const bodyText = await page.innerText('main').catch(() => '');
    console.log(`Content preview: ${bodyText.substring(0, 300)}`);

    // Look for specific component types
    const hasCollapsible = await page.locator('button').count();
    const hasCharts = await page.locator('canvas').count();
    const hasKPIs = await page.locator('[class*="kpi"], [class*="metric"]').count();

    console.log(`Buttons: ${hasCollapsible}, Canvas/Charts: ${hasCharts}, KPI/Metrics: ${hasKPIs}`);

    // Get all visible h2 section titles
    const sectionTitles = await page.locator('h2').allTextContents();
    if (sectionTitles.length > 0) {
      console.log(`Sections found: ${sectionTitles.slice(0, 5).join(' | ')}`);
    }
  }
});
