# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deep-diagnostic.spec.ts >> Deep diagnostic - console logs and errors
- Location: e2e/deep-diagnostic.spec.ts:3:5

# Error details

```
Error: Channel closed
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "💰 Wealth" [level=1] [ref=e5]
        - 'generic "Build: 0.1.2" [ref=e6]': 0.1.2
      - generic [ref=e7]:
        - button "Reload" [ref=e8] [cursor=pointer]: 🔄 Reload
        - button "Console" [ref=e9] [cursor=pointer]: 🛠️
        - button "Privacy mode" [ref=e10] [cursor=pointer]: 👁️
  - navigation [ref=e11]:
    - generic [ref=e12]:
      - link "📡 Dashboard" [ref=e13] [cursor=pointer]:
        - /url: /wealth/dash
      - link "🎯 Portfolio" [ref=e14] [cursor=pointer]:
        - /url: /wealth/dash/portfolio
      - link "📈 Performance" [ref=e15] [cursor=pointer]:
        - /url: /wealth/dash/performance
      - link "🔥 FIRE" [ref=e16] [cursor=pointer]:
        - /url: /wealth/dash/fire
      - link "💸 Withdraw" [ref=e17] [cursor=pointer]:
        - /url: /wealth/dash/withdraw
      - link "🧪 Simulators" [ref=e18] [cursor=pointer]:
        - /url: /wealth/dash/simulators
      - link "📊 Backtest" [ref=e19] [cursor=pointer]:
        - /url: /wealth/dash/backtest
  - main [ref=e20]:
    - generic [ref=e21]: Loading dashboard data...
  - contentinfo [ref=e22]:
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: Generated
        - generic [ref=e26]: —
      - generic [ref=e27]:
        - generic [ref=e28]: Next Check
        - generic [ref=e29]: —
      - generic [ref=e30]:
        - generic [ref=e31]: Version
        - generic [ref=e32]: v1.0.0-F2
  - contentinfo [ref=e33]:
    - generic [ref=e34]:
      - paragraph [ref=e35]:
        - text: "Dashboard:"
        - strong [ref=e36]: v0.1.2
      - paragraph [ref=e37]:
        - text: "Built:"
        - time [ref=e38]: 14/04/2026, 20:32
  - alert [ref=e39]
```

# Test source

```ts
  1  | import { test } from '@playwright/test';
  2  | 
  3  | test('Deep diagnostic - console logs and errors', async ({ page }) => {
  4  |   const consoleLogs: Array<{ type: string; message: string }> = [];
  5  | 
  6  |   page.on('console', async msg => {
  7  |     consoleLogs.push({
  8  |       type: msg.type(),
  9  |       message: msg.text(),
  10 |     });
  11 |     if (msg.type() === 'error' || msg.type() === 'warning') {
  12 |       console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  13 |     }
  14 |   });
  15 | 
  16 |   page.on('pageerror', error => {
  17 |     console.log(`[PAGE ERROR] ${error.message}`);
  18 |     console.log(error.stack);
  19 |   });
  20 | 
  21 |   console.log('Navigating to: https://diegodemorais.github.io/wealth/dash/');
  22 |   await page.goto('https://diegodemorais.github.io/wealth/dash/', {
  23 |     waitUntil: 'networkidle',
  24 |     timeout: 10000
  25 |   }).catch(e => console.log(`[NAVIGATION ERROR] ${e.message}`));
  26 | 
> 27 |   await page.waitForTimeout(2000);
     |              ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  28 | 
  29 |   console.log('\n=== PAGE CONTENT ===');
  30 |   const htmlContent = await page.content();
  31 |   console.log(htmlContent.substring(0, 1000));
  32 | 
  33 |   console.log('\n=== ALL CONSOLE LOGS ===');
  34 |   consoleLogs.slice(0, 20).forEach(log => {
  35 |     console.log(`${log.type}: ${log.message}`);
  36 |   });
  37 | });
  38 | 
```