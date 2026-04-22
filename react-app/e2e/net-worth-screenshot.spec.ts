import { test, expect } from '@playwright/test';

test('Capture Net Worth Projection chart', async ({ page }) => {
  await page.goto('/fire');
  await page.waitForTimeout(2000);  // Wait for ECharts render
  
  // Find the Net Worth Projection section
  const section = page.locator('text=Net Worth Projection');
  expect(section).toBeVisible({ timeout: 5000 });
  
  // Take screenshot of full page
  await page.screenshot({ 
    path: '../analysis/screenshots/net-worth-fixed-2026-04-22.png',
    fullPage: true 
  });
  
  console.log('✅ Screenshot saved');
});
