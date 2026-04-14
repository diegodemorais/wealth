import { chromium } from 'playwright';

/**
 * Test tab switching and content presence
 * Each tab should have specific canvas elements or content that indicates it was rendered
 */

const TAB_EXPECTATIONS = {
  hoje: { canvases: ['tornadoChart', 'sankeyChart', 'geoDonut', 'bondPoolRunwayChart', 'netWorthProjectionChart'], minElements: 10 },
  carteira: { canvases: ['intraEquityPesos', 'aporteSensChart'], minElements: 5 },
  perf: { canvases: ['attrChart', 'timelineChart', 'deltaChart', 'rollingSharpChart', 'rollingIRChart', 'factorLoadingsChart'], minElements: 5 },
  fire: { canvases: ['trackingFireChart', 'spendingChart', 'glideChart', 'fireTrilha', 'stressProjectionChart', 'incomeProjectionChart'], minElements: 5 },
  retiro: { canvases: ['incomeChart'], minElements: 3 },
  simuladores: { canvases: ['scenarioChart'], minElements: 2 },
  backtest: { canvases: ['backtestChart', 'backtestRegimeLongo', 'shadowChart', 'backtestR7Chart', 'drawdownHistChart'], minElements: 3 },
};

async function testTabContent() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🎯 Testing tab switching and content rendering...\n');

  try {
    await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const results = { passed: 0, failed: 0, tabs: {} };

    for (const [tabName, expectations] of Object.entries(TAB_EXPECTATIONS)) {
      console.log(`📌 Testing tab: ${tabName}`);

      // Click tab button
      const btn = await page.$(`[data-tab="${tabName}"]`);
      if (!btn) {
        console.log(`  ❌ FAIL: No button found for tab "${tabName}"`);
        results.failed++;
        results.tabs[tabName] = { status: 'MISSING_BUTTON', errors: ['Button not found'] };
        continue;
      }

      await btn.click();
      await page.waitForTimeout(1500);

      // Check if tab became active
      const isActive = await page.evaluate((name) => {
        const btn = document.querySelector(`[data-tab="${name}"]`);
        return btn?.classList.contains('active') || false;
      }, tabName);

      if (!isActive) {
        console.log(`  ⚠️  Tab "${tabName}" button is not marked as active`);
      }

      // Check for canvas elements
      let canvasesFound = 0;
      const missingCanvases = [];
      for (const canvasId of expectations.canvases) {
        const exists = await page.$(`#${canvasId}`);
        if (exists) {
          canvasesFound++;
        } else {
          missingCanvases.push(canvasId);
        }
      }

      // Count visible content in tab
      const contentCount = await page.evaluate((name) => {
        const tabDiv = document.querySelector(`[data-in-tab="${name}"]`);
        if (!tabDiv) return 0;
        const isHidden = tabDiv.classList.contains('tab-hidden');
        if (isHidden) return -1; // Tab is hidden

        // Count section elements
        const sections = tabDiv.querySelectorAll('.section');
        // Count non-empty sections
        const nonEmpty = Array.from(sections).filter(s => s.innerHTML.trim().length > 10);
        return nonEmpty.length;
      }, tabName);

      const tabHidden = contentCount === -1;
      const actualContentCount = tabHidden ? 0 : contentCount;

      // Evaluate results
      const errors = [];
      if (tabHidden) errors.push('Tab container is hidden (tab-hidden class)');
      if (canvasesFound === 0 && actualContentCount < 2) errors.push(`No canvas elements found (expected: ${expectations.canvases.join(', ')})`);
      // Only report "no visible content" if no canvas elements and no sections
      if (actualContentCount === 0 && canvasesFound === 0) errors.push('No visible content in tab');
      if (missingCanvases.length > 0) errors.push(`Missing canvas: ${missingCanvases.join(', ')}`);

      // Pass if tab is visible AND (has canvas elements OR has min sections)
      if (!tabHidden && (canvasesFound > 0 || actualContentCount >= expectations.minElements) && missingCanvases.length === 0) {
        console.log(`  ✅ PASS: ${canvasesFound} canvas, ${actualContentCount} sections`);
        results.passed++;
        results.tabs[tabName] = { status: 'PASS', canvases: canvasesFound, sections: actualContentCount };
      } else {
        console.log(`  ❌ FAIL: ${errors.join(' | ')}`);
        results.failed++;
        results.tabs[tabName] = { status: 'FAIL', errors, canvases: canvasesFound, sections: actualContentCount };
      }
    }

    // Summary
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📊 SUMMARY: ${results.passed} passed, ${results.failed} failed`);
    console.log(`${'═'.repeat(60)}`);

    if (results.failed === 0) {
      console.log('✅ All tabs have content!');
    } else {
      console.log('❌ Some tabs are missing content:\n');
      Object.entries(results.tabs).forEach(([tab, data]) => {
        if (data.status === 'FAIL') {
          console.log(`  ${tab}: ${data.errors.join(' | ')}`);
        }
      });
    }

    return results;
  } catch (e) {
    console.error('❌ Error:', e.message);
    return { error: e.message };
  } finally {
    await browser.close();
  }
}

testTabContent().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
});
