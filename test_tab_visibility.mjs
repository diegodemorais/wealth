import { chromium } from 'playwright';

async function testTabVisibility() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Testing tab switching visibility...\n');

  try {
    await page.goto('http://localhost:8765/dashboard/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click on "perf" tab
    console.log('Clicking "perf" tab...');
    await page.click('[data-tab="perf"]');
    await page.waitForTimeout(1500);

    // Check if perf canvas are visible
    const perfCanvases = ['attrChart', 'timelineChart', 'deltaChart', 'rollingSharpChart', 'rollingIRChart', 'factorLoadingsChart'];

    for (const canvasId of perfCanvases) {
      const isVisible = await page.evaluate((id) => {
        const canvas = document.getElementById(id);
        if (!canvas) return 'NOT_FOUND';
        const computed = window.getComputedStyle(canvas);
        const parent = canvas.closest('[data-in-tab]');
        if (!parent) return 'NO_PARENT';
        const parentClass = parent.className;
        const parentHidden = parent.classList.contains('tab-hidden');
        return { display: computed.display, parentHidden, parentClass };
      }, canvasId);
      console.log(`  ${canvasId}: ${JSON.stringify(isVisible)}`);
    }

    // Check a "hoje" canvas to see if it's hidden
    console.log('\nNow checking "hoje" canvas (should be hidden):');
    const hojeCanvases = ['tornadoChart', 'sankeyChart'];
    for (const canvasId of hojeCanvases) {
      const isVisible = await page.evaluate((id) => {
        const canvas = document.getElementById(id);
        if (!canvas) return 'NOT_FOUND';
        const computed = window.getComputedStyle(canvas);
        const parent = canvas.closest('[data-in-tab]');
        if (!parent) return 'NO_PARENT';
        const parentClass = parent.className;
        const parentHidden = parent.classList.contains('tab-hidden');
        return { display: computed.display, parentHidden, parentClass };
      }, canvasId);
      console.log(`  ${canvasId}: ${JSON.stringify(isVisible)}`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

testTabVisibility();
