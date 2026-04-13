#!/usr/bin/env node
/**
 * test_responsive.js — Playwright-based dashboard responsive testing
 *
 * Testa layout em múltiplas resoluções:
 * - 768px (tablet)
 * - 480px (mobile)
 *
 * Detecta:
 * - Grids sem min-width:0
 * - Overflow em containers
 * - Grid-template-columns não responsivas
 * - Elementos fora de viewport
 * - Computed styles vs inline conflicts
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const VIEWPORT_TESTS = [
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 480, height: 800 },
];

const GRID_SELECTORS = [
  '.grid-2', '.grid-3', '.hero-strip', '.cagr-twr-row', '.what-if-output',
  '.fire-row', '#r7RiskGrid', '.scenario-card', '.fire-sim-result',
  '.fire-sim-sliders', '.dynamic-2col', '.kpi-grid', '.macro-strip',
  '.dca-grid', '.rf-grid', '.swr-pct-grid', '.etf-comp-grid',
  '.tax-ir-etf-grid', '#macroStrip', '#monthlyRetStats', '#attrFxRfRow',
  '#shadowMetrics', '#r7MetricsGrid', '#irITDCards', '.wellness-extra-row'
];

async function testResponsive() {
  const browser = await chromium.launch();
  const dashboardPath = `file://${path.resolve(__dirname, '../dashboard/index.html')}`;

  console.log('\n📱 Dashboard Responsive Test — Playwright\n');
  console.log(`Opening: ${dashboardPath}\n`);

  const results = [];
  const detailedFindings = [];

  for (const vp of VIEWPORT_TESTS) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 Testing viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`${'='.repeat(70)}`);

    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage();

    try {
      await page.goto(dashboardPath, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000); // Wait for JS to settle

      // Screenshot
      const screenshotPath = path.resolve(
        __dirname,
        `../dashboard/tests/responsive_${vp.name}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`✓ Screenshot saved: responsive_${vp.name}.png`);

      // Detailed grid analysis with inline styles
      const gridAnalysis = await page.evaluate((selectors) => {
        const analysis = {
          problematicGrids: [],
          inlineStyleConflicts: [],
          missingMinWidth: [],
          allGridElements: []
        };

        selectors.forEach(sel => {
          const els = document.querySelectorAll(sel);
          els.forEach((el, idx) => {
            if (idx > 0) return;

            const computed = window.getComputedStyle(el);
            const inlineStyle = el.getAttribute('style');
            const gridCols = computed.gridTemplateColumns;
            const gridRows = computed.gridTemplateRows;
            const minWidth = computed.minWidth;
            const display = computed.display;
            const width = computed.width;
            const scrollWidth = el.scrollWidth;
            const clientWidth = el.clientWidth;

            const gridInfo = {
              selector: sel,
              display,
              gridTemplateColumns: gridCols,
              gridTemplateRows: gridRows,
              minWidth,
              width,
              clientWidth,
              scrollWidth,
              overflows: scrollWidth > clientWidth + 2,
              inlineStyle: inlineStyle ? inlineStyle.substring(0, 100) : 'none',
              hasMinWidth0InInline: inlineStyle && inlineStyle.includes('min-width:0')
            };

            analysis.allGridElements.push(gridInfo);

            // Detecta problemas
            if (gridCols && gridCols !== 'none') {
              if (minWidth !== '0px' && display === 'grid') {
                analysis.missingMinWidth.push(gridInfo);
              }
              if (inlineStyle && inlineStyle.includes('grid-template') && minWidth !== '0px') {
                analysis.inlineStyleConflicts.push(gridInfo);
              }
              if (scrollWidth > clientWidth + 2) {
                analysis.problematicGrids.push(gridInfo);
              }
            }
          });
        });

        return analysis;
      }, GRID_SELECTORS);

      if (gridAnalysis.problematicGrids.length > 0) {
        console.log(`\n❌ PROBLEMATIC GRIDS (overflow detected): ${gridAnalysis.problematicGrids.length}`);
        gridAnalysis.problematicGrids.slice(0, 8).forEach(g => {
          console.log(`   • ${g.selector}`);
          console.log(`     scrollWidth=${g.scrollWidth} > clientWidth=${g.clientWidth}`);
          console.log(`     grid-template: ${g.gridTemplateColumns.substring(0, 40)}`);
          console.log(`     min-width: ${g.minWidth} (computed)`);
        });
      } else {
        console.log(`✓ No problematic grids detected`);
      }

      if (gridAnalysis.missingMinWidth.length > 0) {
        console.log(`\n⚠️  MISSING MIN-WIDTH:0: ${gridAnalysis.missingMinWidth.length}`);
        gridAnalysis.missingMinWidth.slice(0, 5).forEach(g => {
          console.log(`   • ${g.selector}`);
          console.log(`     Current min-width: ${g.minWidth} (should be 0px)`);
        });
      }

      // Check for specific problematic tabs
      const tabIssues = await page.evaluate(() => {
        const issues = {
          simuladores: { blocks: 0, overflow: 0, details: [] },
          retiro: { blocks: 0, overflow: 0, details: [] }
        };

        // Simuladores
        const simTab = document.querySelector('[data-in-tab="simuladores"]');
        if (simTab) {
          const blocks = Array.from(simTab.querySelectorAll('.section'));
          issues.simuladores.blocks = blocks.length;
          blocks.forEach((b, i) => {
            if (b.scrollWidth > b.clientWidth + 2) {
              issues.simuladores.overflow++;
              issues.simuladores.details.push({
                index: i,
                scrollWidth: b.scrollWidth,
                clientWidth: b.clientWidth,
                delta: b.scrollWidth - b.clientWidth
              });
            }
          });
        }

        // Retiro
        const retiroTab = document.querySelector('[data-in-tab="retiro"]');
        if (retiroTab) {
          const blocks = Array.from(retiroTab.querySelectorAll('.section'));
          issues.retiro.blocks = blocks.length;
          const lastTwo = blocks.slice(-2);
          lastTwo.forEach((b, i) => {
            if (b.scrollWidth > b.clientWidth + 2) {
              issues.retiro.overflow++;
              issues.retiro.details.push({
                index: blocks.length - 2 + i,
                scrollWidth: b.scrollWidth,
                clientWidth: b.clientWidth,
                delta: b.scrollWidth - b.clientWidth
              });
            }
          });
        }

        return issues;
      });

      console.log(`\n📊 Tab Layout Status:`);
      console.log(`   Simuladores: ${tabIssues.simuladores.blocks} blocks, ${tabIssues.simuladores.overflow} with overflow`);
      if (tabIssues.simuladores.overflow > 0) {
        tabIssues.simuladores.details.forEach(d => {
          console.log(`     Block ${d.index}: +${d.delta}px overflow`);
        });
      }
      console.log(`   Retiro: ${tabIssues.retiro.blocks} blocks, ${tabIssues.retiro.overflow} with overflow`);
      if (tabIssues.retiro.overflow > 0) {
        tabIssues.retiro.details.forEach(d => {
          console.log(`     Block ${d.index}: +${d.delta}px overflow`);
        });
      }

      detailedFindings.push({
        viewport: vp.name,
        gridAnalysis,
        tabIssues,
        timestamp: new Date().toISOString()
      });

      results.push({
        viewport: vp.name,
        problematicGrids: gridAnalysis.problematicGrids.length,
        missingMinWidth: gridAnalysis.missingMinWidth.length,
        tabOverflow: tabIssues.simuladores.overflow + tabIssues.retiro.overflow,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error(`Error testing ${vp.name}:`, err.message);
      results.push({
        viewport: vp.name,
        error: err.message
      });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 Summary');
  console.log(`${'='.repeat(70)}`);
  results.forEach(r => {
    if (r.error) {
      console.log(`❌ ${r.viewport}: ERROR — ${r.error}`);
    } else {
      const status = r.problematicGrids === 0 && r.missingMinWidth === 0 && r.tabOverflow === 0 ? '✅' : '⚠️';
      console.log(`${status} ${r.viewport}: grids=${r.problematicGrids} minwidth=${r.missingMinWidth} overflow=${r.tabOverflow}`);
    }
  });

  // Save reports
  const reportPath = path.resolve(__dirname, '../dashboard/tests/responsive_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  const detailedPath = path.resolve(__dirname, '../dashboard/tests/responsive_detailed.json');
  fs.writeFileSync(detailedPath, JSON.stringify(detailedFindings, null, 2));

  console.log(`\n✅ Reports saved:`);
  console.log(`   responsive_report.json (summary)`);
  console.log(`   responsive_detailed.json (full analysis)`);

  process.exit(results.some(r => (r.problematicGrids || 0) > 0 || (r.tabOverflow || 0) > 0) ? 1 : 0);
}

testResponsive().catch(console.error);
