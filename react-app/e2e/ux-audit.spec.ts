import { test, expect } from '@playwright/test';
import { expandAll } from './helpers';

test.describe('UX/UI Visual Audit — Dashboard Fidelity', () => {
  
  test('NOW tab — Full page visual inspection', async ({ page }) => {
    await page.goto('/wealth');
    await page.waitForLoadState('networkidle');
    await expandAll(page);

    // Take full screenshot
    await page.screenshot({ path: 'audit-screenshots/01-now-tab.png', fullPage: true });
    
    // Inspect critical elements
    const kpiHero = page.locator('h1, [class*="kpi"], [class*="hero"]').first();
    const semaforo = page.locator('table, [class*="semaforo"]').first();
    const charts = page.locator('canvas, svg, [role="img"]');
    
    console.log('✓ NOW tab screenshotted');
    console.log('  - KPI Hero visible:', await kpiHero.isVisible());
    console.log('  - Semáforos visible:', await semaforo.isVisible());
    console.log('  - Charts found:', await charts.count());
  });

  test('PORTFOLIO tab — Grid, ETF, tables', async ({ page }) => {
    await page.goto('/wealth/portfolio');
    await page.waitForLoadState('networkidle');
    await expandAll(page);
    await page.screenshot({ path: 'audit-screenshots/02-portfolio-tab.png', fullPage: true });
    console.log('✓ PORTFOLIO tab screenshotted');
  });

  test('PERFORMANCE tab — Tables, charts', async ({ page }) => {
    await page.goto('/wealth/performance');
    await page.waitForLoadState('networkidle');
    await expandAll(page);
    await page.screenshot({ path: 'audit-screenshots/03-performance-tab.png', fullPage: true });
    console.log('✓ PERFORMANCE tab screenshotted');
  });

  test('FIRE tab — FIRE matrix, tracking', async ({ page }) => {
    await page.goto('/wealth/fire');
    await page.waitForLoadState('networkidle');
    await expandAll(page);
    await page.screenshot({ path: 'audit-screenshots/04-fire-tab.png', fullPage: true });
    console.log('✓ FIRE tab screenshotted');
  });

  test('WITHDRAW tab — Bond pool, guardrails', async ({ page }) => {
    await page.goto('/wealth/withdraw');
    await page.waitForLoadState('networkidle');
    await expandAll(page);
    await page.screenshot({ path: 'audit-screenshots/05-withdraw-tab.png', fullPage: true });
    console.log('✓ WITHDRAW tab screenshotted');
  });

  test('TOOLS tab — Simulators, Assumptions', async ({ page }) => {
    await page.goto('/wealth/assumptions');
    await page.waitForLoadState('networkidle');
    await expandAll(page);
    await page.screenshot({ path: 'audit-screenshots/06-tools-tab.png', fullPage: true });
    console.log('✓ TOOLS tab screenshotted');
  });

  test('BACKTEST tab — Period selection, results', async ({ page }) => {
    await page.goto('/wealth/backtest');
    await page.waitForLoadState('networkidle');
    await expandAll(page);
    await page.screenshot({ path: 'audit-screenshots/07-backtest-tab.png', fullPage: true });
    console.log('✓ BACKTEST tab screenshotted');
  });

});
