#!/usr/bin/env node
/**
 * debug_earliest_fire.js — Inspeciona card FIRE ASPIRACIONAL em tablet
 */

const { chromium } = require('@playwright/test');
const path = require('path');

async function debugEarliestFire() {
  const browser = await chromium.launch();
  const dashboardPath = `file://${path.resolve(__dirname, '../dashboard/index.html')}`;

  console.log('\n🔬 DEBUG: FIRE ASPIRACIONAL Card (Tablet 768px)\n');

  const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await context.newPage();

  try {
    await page.goto(dashboardPath, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Clica em FIRE tab
    console.log('🖱️  Clicking FIRE tab...\n');
    await page.$('button[data-tab="fire"]').then(btn => btn.click());
    await page.waitForTimeout(500);

    // Verificar se JavaScript foi executado
    const jsTest = await page.evaluate(() => {
      const el = document.querySelector('.dynamic-2col');
      return {
        found: !!el,
        inlineStyle: el ? el.getAttribute('style').substring(0, 150) : null
      };
    });
    console.log('JS Test:', jsTest);

    // Inspeciona estrutura
    const earlyFireDebug = await page.evaluate(() => {
      const container = document.getElementById('earliestFireCard');
      if (!container) return { error: 'Container not found' };

      const parentSection = container.parentElement;
      const card = container.querySelector('.earliest-fire-card');

      const inspect = {
        container: {
          tag: container.tagName,
          id: container.id,
          classes: container.className,
          display: window.getComputedStyle(container).display,
          width: window.getComputedStyle(container).width,
          clientWidth: container.clientWidth,
          scrollWidth: container.scrollWidth,
          overflows: container.scrollWidth > container.clientWidth + 2,
          inlineStyle: container.getAttribute('style')
        },
        parentSection: {
          tag: parentSection.tagName,
          classes: parentSection.className,
          width: window.getComputedStyle(parentSection).width,
          clientWidth: parentSection.clientWidth,
          scrollWidth: parentSection.scrollWidth,
          overflows: parentSection.scrollWidth > parentSection.clientWidth + 2,
          inlineStyle: parentSection.getAttribute('style')
        },
        card: card ? {
          display: window.getComputedStyle(card).display,
          width: window.getComputedStyle(card).width,
          minWidth: window.getComputedStyle(card).minWidth,
          maxWidth: window.getComputedStyle(card).maxWidth,
          clientWidth: card.clientWidth,
          scrollWidth: card.scrollWidth,
          inlineStyle: card.getAttribute('style')
        } : null,
        children: []
      };

      // Inspeciona todos os filhos diretos
      Array.from(container.children).forEach((child, i) => {
        const computed = window.getComputedStyle(child);
        inspect.children.push({
          index: i,
          tag: child.tagName,
          classes: child.className.substring(0, 60),
          display: computed.display,
          width: computed.width,
          clientWidth: child.clientWidth,
          scrollWidth: child.scrollWidth,
          overflows: child.scrollWidth > child.clientWidth + 2,
          inlineStyle: (child.getAttribute('style') || '').substring(0, 80)
        });
      });

      return inspect;
    });

    console.log('📋 CONTAINER HIERARCHY:\n');
    console.log(`Container (#earliestFireCard):`);
    console.log(`  display: ${earlyFireDebug.container.display}`);
    console.log(`  width: ${earlyFireDebug.container.width}`);
    console.log(`  client: ${earlyFireDebug.container.clientWidth}px | scroll: ${earlyFireDebug.container.scrollWidth}px`);
    if (earlyFireDebug.container.overflows) {
      console.log(`  ⚠️  OVERFLOWS by ${earlyFireDebug.container.scrollWidth - earlyFireDebug.container.clientWidth}px`);
    }

    console.log(`\nParent Section:`);
    console.log(`  width: ${earlyFireDebug.parentSection.width}`);
    console.log(`  client: ${earlyFireDebug.parentSection.clientWidth}px | scroll: ${earlyFireDebug.parentSection.scrollWidth}px`);
    if (earlyFireDebug.parentSection.overflows) {
      console.log(`  ⚠️  OVERFLOWS by ${earlyFireDebug.parentSection.scrollWidth - earlyFireDebug.parentSection.clientWidth}px`);
    }

    if (earlyFireDebug.card) {
      console.log(`\nCard (.earliest-fire-card):`);
      console.log(`  display: ${earlyFireDebug.card.display}`);
      console.log(`  width: ${earlyFireDebug.card.width}`);
      console.log(`  min-width: ${earlyFireDebug.card.minWidth}`);
      console.log(`  max-width: ${earlyFireDebug.card.maxWidth}`);
      console.log(`  client: ${earlyFireDebug.card.clientWidth}px | scroll: ${earlyFireDebug.card.scrollWidth}px`);
    }

    console.log(`\nDirect Children of Container:`);
    earlyFireDebug.children.forEach(c => {
      console.log(`\n  [${c.index}] <${c.tag}> ${c.classes}`);
      console.log(`     display: ${c.display}`);
      console.log(`     width: ${c.width}`);
      console.log(`     client: ${c.clientWidth}px | scroll: ${c.scrollWidth}px`);
      if (c.overflows) {
        console.log(`     ⚠️  OVERFLOWS by ${c.scrollWidth - c.clientWidth}px`);
      }
      if (c.inlineStyle && c.inlineStyle !== 'none') {
        console.log(`     inline: ${c.inlineStyle}...`);
      }
    });

    // Screenshot
    const screenshotPath = path.resolve(__dirname, '../dashboard/tests/debug_earliest_fire.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n✓ Screenshot saved: debug_earliest_fire.png`);

  } catch (err) {
    console.error(`Error:`, err.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

debugEarliestFire();
