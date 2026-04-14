import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });

// Capture console messages
const consoleMsgs = [];
page.on('console', msg => {
  consoleMsgs.push({
    type: msg.type(),
    text: msg.text()
  });
});

// Click the console button
console.log('Clicking Eruda button...');
await page.locator('#erudaBtn').click();
await page.waitForTimeout(2000);

// Check for errors
const errors = consoleMsgs.filter(m => m.type === 'error');
console.log(`\nConsole messages: ${consoleMsgs.length}`);
if (errors.length > 0) {
  console.log('❌ Errors found:');
  errors.forEach(e => console.log('  -', e.text));
} else {
  console.log('✓ No errors');
}

// Check if eruda was loaded
const erudaState = await page.evaluate(() => ({
  erudaType: typeof window.eruda,
  erudaIsInit: window.eruda?._isInit || false,
}));

console.log(`\nEruda state:`, erudaState);

// Check if panel appeared
const hasPanelElements = await page.locator('[data-eruda-id], .eruda-panel, [class*="eruda"]').count();
console.log(`Panel elements found: ${hasPanelElements}`);

await browser.close();
