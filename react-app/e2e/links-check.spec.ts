import { test } from '@playwright/test';

test('Check link structure', async ({ page }) => {
  await page.goto('https://diegodemorais.github.io/wealth/dash/');
  await page.waitForTimeout(2000);

  console.log('\n=== Looking for <a> tags ===');
  const links = await page.locator('a').all();
  console.log(`Found ${links.length} <a> tags`);

  for (let i = 0; i < Math.min(5, links.length); i++) {
    const href = await links[i].getAttribute('href');
    const text = await links[i].innerText();
    console.log(`Link ${i}: href="${href}", text="${text}"`);
  }

  console.log('\n=== Looking for buttons ===');
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);

  for (let i = 0; i < Math.min(5, buttons.length); i++) {
    const text = await buttons[i].innerText();
    console.log(`Button ${i}: "${text}"`);
  }

  console.log('\n=== Looking for nav container ===');
  const nav = await page.locator('nav').count();
  console.log(`Found ${nav} nav elements`);

  console.log('\n=== Looking for dashboard tabs ===');
  const tabs = await page.locator('[class*="tab"]').count();
  console.log(`Found ${tabs} tab-related elements`);

  console.log('\n=== Full HTML of main nav (first 500 chars) ===');
  const navHTML = await page.locator('nav').first().innerHTML().catch(() => 'nav not found');
  console.log(typeof navHTML === 'string' ? navHTML.substring(0, 500) : navHTML);
});
