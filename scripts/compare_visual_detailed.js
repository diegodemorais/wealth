const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Open reference HTML file
    const refPath = path.join(__dirname, '../site-referencia/DashHTML-estavel.html');
    const refUrl = `file://${refPath}`;

    console.log('📸 Capturando screenshots para comparação visual...\n');

    // React live version
    const reacPage = await browser.newPage();
    reacPage.setViewport({ width: 1280, height: 1000 });

    let attempts = 0;
    while (attempts < 10) {
      try {
        await reacPage.goto('http://localhost:3000/wealth', {
          waitUntil: 'networkidle0',
          timeout: 5000
        });
        break;
      } catch (e) {
        attempts++;
        if (attempts >= 10) throw e;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const reactHeight = await reacPage.evaluate(() => {
      // Count rendered sections
      const sections = document.querySelectorAll('.section, [class*="card"], [class*="box"]');
      return {
        docHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body.scrollHeight,
        sectionCount: sections.length,
        isEmpty: document.body.innerText.includes('não computado')
      };
    });

    console.log('React Dashboard Info:');
    console.log(`  Document height: ${reactHeight.docHeight}px`);
    console.log(`  Body height: ${reactHeight.bodyHeight}px`);
    console.log(`  Sections/Cards found: ${reactHeight.sectionCount}`);
    console.log(`  Data loaded: ${!reactHeight.isEmpty}`);

    await reacPage.setViewport({ width: 1280, height: reactHeight.bodyHeight + 100 });
    await reacPage.screenshot({ path: '/tmp/react-comparison.png', fullPage: false });
    console.log('  ✅ Screenshot: /tmp/react-comparison.png\n');

    // Reference version
    const refPage = await browser.newPage();
    refPage.setViewport({ width: 1280, height: 1000 });

    await refPage.goto(refUrl, { waitUntil: 'networkidle0' });

    const refInfo = await refPage.evaluate(() => {
      const style = document.querySelector('style');
      const css = style ? style.textContent : '';
      return {
        docHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body.scrollHeight,
        cssVars: css.includes('--') ? 'yes' : 'no',
        mainContent: document.querySelector('main') ? document.querySelector('main').innerText.length : 0
      };
    });

    console.log('Reference Dashboard Info:');
    console.log(`  Document height: ${refInfo.docHeight}px`);
    console.log(`  Body height: ${refInfo.bodyHeight}px`);
    console.log(`  Uses CSS vars: ${refInfo.cssVars}`);
    console.log(`  Main content length: ${refInfo.mainContent} chars`);

    await refPage.setViewport({ width: 1280, height: refInfo.bodyHeight + 100 });
    await refPage.screenshot({ path: '/tmp/reference-comparison.png', fullPage: false });
    console.log('  ✅ Screenshot: /tmp/reference-comparison.png\n');

    // Extract CSS variables from both
    console.log('🔍 Extracting CSS variable definitions...\n');

    const reactCss = await reacPage.evaluate(() => {
      const styles = document.querySelectorAll('style');
      let allCss = '';
      styles.forEach(s => {
        allCss += s.textContent + '\n';
      });
      // Look for CSS variables
      const varMatches = allCss.match(/--[\w-]+:\s*[^;]+/g) || [];
      return {
        totalVars: varMatches.length,
        samples: varMatches.slice(0, 10)
      };
    });

    console.log('React CSS Variables:');
    console.log(`  Total found: ${reactCss.totalVars}`);
    if (reactCss.samples.length > 0) {
      console.log('  Samples:');
      reactCss.samples.forEach(v => console.log(`    ${v}`));
    }

    console.log('\n💾 Analysis complete. Compare images:');
    console.log('  React:     /tmp/react-comparison.png');
    console.log('  Reference: /tmp/reference-comparison.png');

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await browser.close();
  }
})();
