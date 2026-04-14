import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
const networkErrors = [];

page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

page.on('response', response => {
  if (!response.ok() && response.status() >= 400) {
    networkErrors.push({
      url: response.url(),
      status: response.status(),
    });
  }
});

console.log('📱 TESTING LIVE SITE\n');

await page.goto('https://diegodemorais.github.io/wealth-dash/', { 
  waitUntil: 'networkidle',
  timeout: 30000 
});

await page.waitForTimeout(2000);

// Check what exists
const structure = await page.evaluate(() => {
  const allTabs = document.querySelectorAll('[id^="aba-"]');
  const tabIds = Array.from(allTabs).map(t => t.id);
  const hojeAbaAny = document.querySelector('[id*="hoje"]') || document.querySelector('[class*="hoje"]');
  
  return {
    allTabIds: tabIds,
    hojeTabExists: !!hojeAbaAny,
    tabButtons: document.querySelectorAll('[data-tab]').length,
    dataInTab: document.querySelectorAll('[data-in-tab]').length,
  };
});

console.log('1️⃣  STRUCTURE:');
console.log('   Tab IDs found:', structure.allTabIds);
console.log('   Hoje tab exists:', structure.hojeTabExists);
console.log('   Tab buttons:', structure.tabButtons);
console.log('   Elements with data-in-tab:', structure.dataInTab);

// Check visibility of main content
const visibility = await page.evaluate(() => {
  // Try to find content by common patterns
  const semaforoTable = document.getElementById('semaforoBody');
  const mainContent = document.querySelector('[data-in-tab]');
  const charts = document.querySelectorAll('canvas');
  const tables = document.querySelectorAll('table');
  
  return {
    semaforoRows: semaforoTable ? semaforoTable.querySelectorAll('tr').length : 0,
    canvases: charts.length,
    tables: tables.length,
    firstDataInTabDisplay: mainContent ? window.getComputedStyle(mainContent).display : 'N/A',
    mainBodyBackground: window.getComputedStyle(document.body).backgroundColor,
  };
});

console.log('\n2️⃣  CONTENT:');
console.log('   Semaforo rows:', visibility.semaforoRows);
console.log('   Canvas elements:', visibility.canvases);
console.log('   Tables:', visibility.tables);
console.log('   Body background:', visibility.mainBodyBackground);

// Check for hidden elements
const hiddenCheck = await page.evaluate(() => {
  const allDivs = document.querySelectorAll('div');
  const hidden = Array.from(allDivs).filter(d => {
    const style = window.getComputedStyle(d);
    return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
  });
  
  return {
    totalDivs: allDivs.length,
    hiddenDivs: hidden.length,
    hiddenClasses: Array.from(hidden.slice(0, 5)).map(d => d.className),
  };
});

console.log('\n3️⃣  HIDDEN ELEMENTS:');
console.log('   Total divs:', hiddenCheck.totalDivs);
console.log('   Hidden:', hiddenCheck.hiddenDivs);

// Try clicking first tab button
console.log('\n4️⃣  TAB SWITCHING:');
const buttons = await page.$$('[data-tab]');
console.log('   Found', buttons.length, 'tab buttons');

if (buttons.length > 0) {
  const firstButton = buttons[0];
  const buttonText = await firstButton.textContent();
  console.log('   First button:', buttonText);
  
  await firstButton.click();
  await page.waitForTimeout(500);
  
  const afterClick = await page.evaluate(() => {
    const visibleElements = document.querySelectorAll('[data-in-tab]:not(.tab-hidden)');
    return {
      visibleElements: visibleElements.length,
    };
  });
  
  console.log('   After click - visible elements:', afterClick.visibleElements);
}

// Screenshot
console.log('\n5️⃣  SCREENSHOT');
await page.screenshot({ path: '/tmp/live_site_full.png' });
console.log('   Saved: /tmp/live_site_full.png');

// Network errors
console.log('\n' + '='.repeat(60));
console.log('NETWORK ERRORS:');
if (networkErrors.length === 0) {
  console.log('  None');
} else {
  networkErrors.slice(0, 5).forEach(e => {
    const urlPart = e.url.split('/').pop() || e.url;
    console.log(`  ${e.status} ${urlPart}`);
  });
}

console.log('\nJS ERRORS:');
if (errors.length === 0) {
  console.log('  None');
} else {
  errors.slice(0, 5).forEach(e => {
    console.log(`  ${e.substring(0, 100)}`);
  });
}

await browser.close();
