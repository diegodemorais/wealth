#!/usr/bin/env node
/**
 * Quick test to identify which 17 components are EMPTY (rendered but no data)
 */

import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC = JSON.parse(readFileSync(`${__dirname}/spec_html_mapping.json`, 'utf-8'));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const indexPath = `file://${__dirname}/../index.html`;
  console.log(`Loading: ${indexPath}\n`);

  await page.goto(indexPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const empty = [];
  const rendered = [];

  for (const item of SPEC.mapping) {
    const { specId, htmlId, tab, type } = item;

    if (!htmlId || htmlId === '—') {
      continue;
    }

    // Switch tab if needed
    if (tab !== 'now' && tab !== 'hoje') {
      const btn = await page.$(`button[onclick*="switchTab('${tab}')"]`) ||
                  await page.$(`button[data-tab="${tab}"]`);
      if (btn) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    // Check if element exists and has content
    const hasContent = await page.evaluate(({ htmlId, type }) => {
      const el = document.getElementById(htmlId);
      if (!el) return null;
      if (!el.offsetParent) return 'hidden'; // Display: none

      // Check content based on type
      if (type === 'chart-line' || type === 'chart-bar' || type === 'chart-area' ||
          type === 'chart-donut' || type === 'chart-bar-horizontal' || type === 'fan-chart') {
        // Canvas or chart element
        if (el.tagName === 'CANVAS') {
          return el.width > 0 && el.height > 0 ? 'rendered' : 'empty';
        }
        // Check if container has a canvas inside
        const canvas = el.querySelector('canvas');
        return canvas ? 'rendered' : 'empty';
      } else if (type === 'table' || type === 'gauge' || type === 'semaforo') {
        const html = el.innerHTML.trim();
        return html.length > 50 || el.children.length > 0 ? 'rendered' : 'empty';
      } else if (type === 'card' || type === 'kpi' || type === 'kpi-hero' || type === 'slider') {
        const html = el.innerHTML.trim();
        const hasText = html.length > 10 && !html.includes('—');
        return hasText ? 'rendered' : 'empty';
      }

      const html = el.innerHTML.trim();
      return html.length > 20 ? 'rendered' : 'empty';
    }, { htmlId, type });

    if (hasContent === 'empty') {
      empty.push(specId);
      console.log(`◯ ${specId.padEnd(30)} (${type.padEnd(20)}) tab=${tab}`);
    } else if (hasContent === 'rendered') {
      rendered.push(specId);
    }
  }

  console.log(`\n${empty.length} EMPTY components:`);
  empty.forEach(id => console.log(`  - ${id}`));

  console.log(`\n${rendered.length} RENDERED components`);

  await browser.close();
})();
