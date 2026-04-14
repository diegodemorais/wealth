import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

console.log('Testing buttons...\n');

// Test 1: Privacy button
console.log('1️⃣ Privacy button:');
try {
  await page.locator('#privacyBtn').click();
  const privateModeOn = await page.evaluate(() => document.body.classList.contains('private-mode'));
  console.log(`   ✓ Toggled, private-mode: ${privateModeOn}`);
} catch(e) {
  console.log(`   ✗ ${e.message}`);
}

// Test 2: Console button  
console.log('\n2️⃣ Console (Eruda) button:');
try {
  await page.locator('#erudaBtn').click();
  await page.waitForTimeout(2000);
  const hasEruda = await page.evaluate(() => typeof window.eruda === 'object');
  console.log(`   ✓ Clicked, Eruda loaded: ${hasEruda}`);
} catch(e) {
  console.log(`   ✗ ${e.message}`);
}

await browser.close();
