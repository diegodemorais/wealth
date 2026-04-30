import { Page } from '@playwright/test';

/**
 * expandAll — click all collapsed toggles so full page content is visible.
 *
 * Two-pass strategy: first pass expands top-level sections; second pass catches
 * any newly revealed nested collapsibles. Used by screenshot/audit specs that
 * need to capture the complete rendered state of a page.
 *
 * NOT intended as a global beforeEach — use only in specs where hidden content
 * would cause missed assertions or incomplete screenshots.
 */
export async function expandAll(page: Page): Promise<void> {
  // First pass — expand all currently collapsed sections
  let expanded = 0;
  const toggles = await page
    .locator('[data-state="closed"] button, details:not([open]) summary, button[aria-expanded="false"]')
    .all();
  for (const toggle of toggles) {
    try { await toggle.click({ timeout: 500 }); expanded++; } catch {}
  }
  if (expanded > 0) await page.waitForTimeout(600);

  // Second pass — catch any newly visible collapsed sections
  const toggles2 = await page
    .locator('[data-state="closed"] button, details:not([open]) summary, button[aria-expanded="false"]')
    .all();
  for (const toggle of toggles2) {
    try { await toggle.click({ timeout: 500 }); } catch {}
  }
  await page.waitForTimeout(800);
}
