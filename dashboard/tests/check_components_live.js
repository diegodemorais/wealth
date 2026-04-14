#!/usr/bin/env node
/**
 * Quick Playwright test to check which components are rendering content
 * Usage: npx playwright test check_components_live.js
 */

const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'spec_html_mapping.json'), 'utf-8'));

test.describe('Dashboard Component Rendering', () => {
  let browser, page;

  test.beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto('file:///Users/diegodemorais/claude/code/wealth/dashboard/index.html');
    // Wait for dashboard to initialize
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => {
    await browser.close();
  });

  const results = [];

  for (const item of SPEC.mapping) {
    const { specId, htmlId, tab } = item;

    test(`${specId} (tab: ${tab})`, async () => {
      if (!htmlId || htmlId === '—') {
        console.log(`⚠ ${specId}: NO HTML ID`);
        results.push({ specId, status: 'SKIP', reason: 'no htmlId' });
        return;
      }

      // Switch to correct tab if needed
      if (tab !== 'now') {
        const tabBtn = await page.$(`button[onclick*="switchTab('${tab}')"]`);
        if (tabBtn) await tabBtn.click();
        await page.waitForTimeout(500);
      }

      // Check if element exists and is visible
      const el = await page.$(`#${htmlId}`);
      if (!el) {
        console.log(`✗ ${specId}: ELEMENT NOT FOUND (#${htmlId})`);
        results.push({ specId, status: 'MISSING', htmlId });
        return;
      }

      // Check if visible
      const visible = await el.isVisible();
      if (!visible) {
        console.log(`⊘ ${specId}: HIDDEN (#${htmlId})`);
        results.push({ specId, status: 'HIDDEN', htmlId });
        return;
      }

      // Check if has content (canvas, text, children)
      const tagName = await el.evaluate(e => e.tagName);
      let hasContent = false;

      if (tagName === 'CANVAS') {
        // Canvas: check if it has drawn content
        const width = await el.evaluate(e => e.width);
        const height = await el.evaluate(e => e.height);
        hasContent = width > 0 && height > 0;
      } else if (tagName === 'TABLE' || tagName === 'TBODY') {
        // Table: check if has rows
        const rows = await el.evaluate(e => e.querySelectorAll('tr').length);
        hasContent = rows > 0;
      } else {
        // Other: check innerHTML length and children
        const html = await el.evaluate(e => e.innerHTML);
        const childCount = await el.evaluate(e => e.children.length);
        hasContent = html.trim().length > 50 || childCount > 0;
      }

      if (hasContent) {
        console.log(`✓ ${specId}: RENDERED (#${htmlId})`);
        results.push({ specId, status: 'RENDERED', htmlId });
      } else {
        console.log(`◯ ${specId}: EMPTY (#${htmlId})`);
        results.push({ specId, status: 'EMPTY', htmlId });
      }
    });
  }

  test('Summary', async () => {
    const summary = {
      total: results.length,
      rendered: results.filter(r => r.status === 'RENDERED').length,
      empty: results.filter(r => r.status === 'EMPTY').length,
      hidden: results.filter(r => r.status === 'HIDDEN').length,
      missing: results.filter(r => r.status === 'MISSING').length,
      skipped: results.filter(r => r.status === 'SKIP').length,
    };

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Rendered: ${summary.rendered}/${summary.total}`);
    console.log(`Empty:    ${summary.empty}/${summary.total}`);
    console.log(`Hidden:   ${summary.hidden}/${summary.total}`);
    console.log(`Missing:  ${summary.missing}/${summary.total}`);
    console.log(`Skipped:  ${summary.skipped}/${summary.total}`);

    // Write results
    fs.writeFileSync(
      path.join(__dirname, 'component_check_live.json'),
      JSON.stringify({ timestamp: new Date().toISOString(), summary, results }, null, 2)
    );
  });
});
