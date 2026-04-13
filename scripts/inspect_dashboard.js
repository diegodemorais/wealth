#!/usr/bin/env node
/**
 * inspect_dashboard.js — Inspeciona estrutura real do dashboard em viewport responsivo
 *
 * Mostra:
 * - Estrutura dos tabs
 * - Elementos dentro de cada tab
 * - Computed styles
 * - Inline styles conflitantes
 */

const { chromium } = require('@playwright/test');
const path = require('path');

async function inspectDashboard() {
  const browser = await chromium.launch();
  const dashboardPath = `file://${path.resolve(__dirname, '../dashboard/index.html')}`;

  console.log('\n🔬 Dashboard Structure Inspector — Tablet 768px\n');

  const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await context.newPage();

  try {
    await page.goto(dashboardPath, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // ANTES: clica em Simuladores
    console.log('\n🖱️  Clicking on SIMULADORES tab...\n');

    // Verifica se os botões de tab existem
    const allTabBtns = await page.$$('button[data-tab]');
    console.log(`Found ${allTabBtns.length} tab buttons`);

    const fireBtn = await page.$('button[data-tab="fire"]');
    if (fireBtn) {
      // Clica no botão
      await fireBtn.click();
      await page.waitForTimeout(1500); // Aguarda transição + rAF + forceResponsiveGrids

      // Verifica se tab-hidden foi removido
      const tabStatus = await page.evaluate(() => {
        const tab = document.querySelector('[data-in-tab="fire"]');
        const dynamicDiv = document.querySelector('.dynamic-2col');
        return {
          found: !!tab,
          isHidden: tab ? tab.classList.contains('tab-hidden') : null,
          display: tab ? window.getComputedStyle(tab).display : null,
          sectionCount: document.querySelectorAll('[data-in-tab="fire"].section').length,
          dynamicDivFound: !!dynamicDiv,
          dynamicDivStyle: dynamicDiv ? dynamicDiv.getAttribute('style') : null
        };
      });

      if (!tabStatus.found) {
        console.log('❌ Tab container not found');
      } else if (tabStatus.isHidden) {
        console.log(`⚠️  Tab STILL has tab-hidden (display: ${tabStatus.display})`);
      } else {
        console.log(`✓ FIRE tab is now VISIBLE (display: ${tabStatus.display}, ${tabStatus.sectionCount} sections)`);
        console.log(`   .dynamic-2col found: ${tabStatus.dynamicDivFound}`);
        if (tabStatus.dynamicDivStyle) {
          console.log(`   .dynamic-2col style: ${tabStatus.dynamicDivStyle.substring(0, 150)}...`);
        }
      }
    } else {
      console.log('❌ Could not find Simuladores button');
    }

    // Inspeciona tabs
    const tabStructure = await page.evaluate(() => {
      const tabs = {};

      // Encontra todos os data-in-tab
      const tabContainers = document.querySelectorAll('[data-in-tab]');
      console.log(`Found ${tabContainers.length} tab containers`);

      // Agrupa por tab
      tabContainers.forEach((el, idx) => {
        const tabId = el.getAttribute('data-in-tab');
        if (!tabs[tabId]) {
          tabs[tabId] = { sections: [], totalElements: 0, totalWidth: 0, totalScroll: 0 };
        }

        // Se é uma seção
        if (el.classList.contains('section')) {
          const computed = window.getComputedStyle(el);
          const info = {
            class: el.className.substring(0, 60),
            display: computed.display,
            overflow: computed.overflow + ' ' + computed.overflowX,
            width: computed.width,
            clientWidth: el.clientWidth,
            scrollWidth: el.scrollWidth,
            minWidth: computed.minWidth,
            padding: `${computed.paddingLeft} ${computed.paddingRight}`,
            margin: `${computed.marginLeft} ${computed.marginRight}`,
            overflows: el.scrollWidth > el.clientWidth + 2,
            hasInlineStyle: !!el.getAttribute('style'),
            inlineStyle: (el.getAttribute('style') || '').substring(0, 80)
          };

          tabs[tabId].sections.push(info);
          tabs[tabId].totalElements++;
          if (el.scrollWidth > el.clientWidth) {
            tabs[tabId].totalScroll++;
          }
        }
      });

      return tabs;
    });

    console.log('\n📋 TAB STRUCTURE:');
    Object.entries(tabStructure).forEach(([tabId, tabData]) => {
      console.log(`\n  📌 Tab: ${tabId}`);
      console.log(`     Sections: ${tabData.sections.length}`);
      console.log(`     With scroll issues: ${tabData.totalScroll}`);

      if (tabData.sections.length > 0) {
        tabData.sections.forEach((s, i) => {
          console.log(`\n     Section ${i}: ${s.class}`);
          console.log(`       display: ${s.display}`);
          console.log(`       width: ${s.width} (computed)`);
          console.log(`       client: ${s.clientWidth}px | scroll: ${s.scrollWidth}px`);
          if (s.overflows) {
            console.log(`       ⚠️  OVERFLOWS by ${s.scrollWidth - s.clientWidth}px`);
          }
          console.log(`       min-width: ${s.minWidth}`);
          if (s.hasInlineStyle) {
            console.log(`       inline: ${s.inlineStyle}...`);
          }
        });
      }
    });

    // Inspeciona grids específicos dentro de Simuladores
    const simuladoresDetails = await page.evaluate(() => {
      const sim = document.querySelector('[data-in-tab="simuladores"]');
      if (!sim) return { found: false };

      const details = {
        found: true,
        innerHtml: sim.innerHTML.substring(0, 200),
        children: sim.children.length,
        childDetails: []
      };

      Array.from(sim.children).forEach((child, i) => {
        const computed = window.getComputedStyle(child);
        details.childDetails.push({
          index: i,
          tagName: child.tagName,
          className: child.className.substring(0, 60),
          display: computed.display,
          width: computed.width,
          gridTemplateColumns: computed.gridTemplateColumns,
          clientWidth: child.clientWidth,
          scrollWidth: child.scrollWidth,
          overflow: child.scrollWidth > child.clientWidth + 2
        });
      });

      return details;
    });

    console.log('\n\n🎯 SIMULADORES TAB DEEP DIVE:');
    if (simuladoresDetails.found) {
      console.log(`   ✓ Tab found`);
      console.log(`   Direct children: ${simuladoresDetails.children}`);
      simuladoresDetails.childDetails.forEach(c => {
        console.log(`\n   Child ${c.index}: <${c.tagName}> ${c.className}`);
        console.log(`     display: ${c.display}`);
        console.log(`     width: ${c.width} | clientWidth: ${c.clientWidth}px`);
        if (c.gridTemplateColumns) {
          console.log(`     grid: ${c.gridTemplateColumns.substring(0, 60)}`);
        }
        if (c.overflow) {
          console.log(`     ⚠️  SCROLL: ${c.scrollWidth}px > ${c.clientWidth}px`);
        }
      });
    } else {
      console.log(`   ❌ Tab NOT FOUND`);
    }

    // Screenshot
    const screenshotPath = path.resolve(__dirname, '../dashboard/tests/inspector_output.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n✓ Full screenshot saved: inspector_output.png`);

  } catch (err) {
    console.error(`Error:`, err.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

inspectDashboard();
