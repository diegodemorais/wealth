# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: data-fetch.spec.ts >> Monitor data.json fetch
- Location: e2e/data-fetch.spec.ts:3:5

# Error details

```
Error: Channel closed
```

```
Error: page.goto: Test ended.
Call log:
  - navigating to "https://diegodemorais.github.io/wealth/dash/", waiting until "networkidle"

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
    - generic [ref=e21]:
      - heading "📡 Dashboard" [level=1] [ref=e22]
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]: 💰
          - generic [ref=e26]: Net Worth
          - generic [ref=e27]: R$ 3.570.497,31
        - generic [ref=e28]:
          - generic [ref=e29]: 🔥
          - generic [ref=e30]: FIRE Progress
          - generic [ref=e31]: 42,85%
        - generic [ref=e32]:
          - generic [ref=e33]: ⏱️
          - generic [ref=e34]: Years to FIRE
          - generic [ref=e35]: 14y
      - generic [ref=e36]:
        - heading "Wellness Status" [level=2] [ref=e37]
        - generic [ref=e41]:
          - generic [ref=e42]: "Portfolio Health: WARNING"
          - generic [ref=e43]: "Wellness score: 51%"
      - generic [ref=e44]:
        - button "▼ 📋 Key Metrics" [expanded] [ref=e45] [cursor=pointer]:
          - generic [ref=e46]:
            - generic [ref=e47]: ▼ 📋
            - generic [ref=e48]: Key Metrics
        - generic [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]: 📊
            - generic [ref=e53]:
              - generic [ref=e54]: Equity Allocation
              - generic [ref=e56]: 87.9%
          - generic [ref=e57]:
            - generic [ref=e58]: 🏦
            - generic [ref=e59]:
              - generic [ref=e60]: RF Allocation
              - generic [ref=e62]: 9.2%
          - generic [ref=e63]:
            - generic [ref=e64]: 🌍
            - generic [ref=e65]:
              - generic [ref=e66]: International Exposure
              - generic [ref=e68]: 100.0%
          - generic [ref=e69]:
            - generic [ref=e70]: 🇧🇷
            - generic [ref=e71]:
              - generic [ref=e72]: Brazil Concentration
              - generic [ref=e74]: 5.9%
          - generic [ref=e75]:
            - generic [ref=e76]: 💵
            - generic [ref=e77]:
              - generic [ref=e78]: Monthly Income
              - generic [ref=e80]: 0R$
          - generic [ref=e81]:
            - generic [ref=e82]: 💸
            - generic [ref=e83]:
              - generic [ref=e84]: Yearly Expense
              - generic [ref=e86]: 250.000R$
      - generic [ref=e87]:
        - button "▼ 📋 FIRE Countdown" [expanded] [ref=e88] [cursor=pointer]:
          - generic [ref=e89]:
            - generic [ref=e90]: ▼ 📋
            - generic [ref=e91]: FIRE Countdown
        - generic [ref=e93]:
          - heading "Target FIRE Date" [level=3] [ref=e94]
          - paragraph [ref=e95]: sábado, 31 de dezembro de 2039
          - paragraph [ref=e96]: 13 years, 9 months away
      - generic [ref=e97]:
        - button "▼ 📈 Analysis & Projections" [expanded] [ref=e98] [cursor=pointer]:
          - generic [ref=e99]:
            - generic [ref=e100]: ▼ 📈
            - generic [ref=e101]: Analysis & Projections
        - generic [ref=e102]:
          - generic [ref=e103]:
            - heading "Sensitivity Analysis (Tornado)" [level=3] [ref=e104]
            - img [ref=e105]
          - generic [ref=e106]:
            - heading "Uncertainty Cone (Fan Chart)" [level=3] [ref=e107]
            - img [ref=e108]
          - generic [ref=e109]:
            - heading "Asset Allocation Flow" [level=3] [ref=e110]
            - generic [ref=e111]:
              - img [ref=e112]:
                - generic [ref=e114]: Total
                - generic [ref=e116]: Equity
                - generic [ref=e118]: RF
                - generic [ref=e120]: Crypto
                - generic [ref=e122]: SWRD
                - generic [ref=e124]: AVGS
                - generic [ref=e126]: AVEM
                - generic [ref=e128]: IPCA+
                - generic [ref=e130]: HODL11
              - paragraph [ref=e137]: Sankey diagram showing allocation flows from Total → Asset Classes → Holdings
  - contentinfo [ref=e138]:
    - generic [ref=e139]:
      - generic [ref=e140]:
        - generic [ref=e141]: Generated
        - generic [ref=e142]: 13/04/2026
      - generic [ref=e143]:
        - generic [ref=e144]: Next Check
        - generic [ref=e145]: 13/05/2026
      - generic [ref=e146]:
        - generic [ref=e147]: Version
        - generic [ref=e148]: v1.0.0-F2
  - contentinfo [ref=e149]:
    - generic [ref=e150]:
      - paragraph [ref=e151]:
        - text: "Dashboard:"
        - strong [ref=e152]: v0.1.2
      - paragraph [ref=e153]:
        - text: "Built:"
        - time [ref=e154]: 14/04/2026, 20:32
  - alert [ref=e155]
```

# Test source

```ts
  1  | import { test } from '@playwright/test';
  2  | 
  3  | test('Monitor data.json fetch', async ({ page }) => {
  4  |   const networkEvents: string[] = [];
  5  | 
  6  |   page.on('response', response => {
  7  |     if (response.url().includes('data.json') || response.request().resourceType() === 'fetch') {
  8  |       networkEvents.push(`${response.status()} ${response.url()}`);
  9  |       console.log(`[${response.status()}] ${response.url()}`);
  10 |     }
  11 |   });
  12 | 
  13 |   page.on('console', msg => {
  14 |     if (msg.text().includes('data') || msg.text().includes('Failed') || msg.type() === 'error') {
  15 |       console.log(`[${msg.type()}] ${msg.text()}`);
  16 |     }
  17 |   });
  18 | 
  19 |   console.log('Navigating...');
> 20 |   await page.goto('https://diegodemorais.github.io/wealth/dash/', {
     |              ^ Error: page.goto: Test ended.
  21 |     waitUntil: 'networkidle',
  22 |   });
  23 | 
  24 |   await page.waitForTimeout(3000);
  25 | 
  26 |   console.log('\n=== Network events ===');
  27 |   networkEvents.forEach(e => console.log(e));
  28 | 
  29 |   console.log('\n=== Checking page state ===');
  30 |   const bodyText = await page.innerText('body');
  31 |   console.log('Has "Loading": ', bodyText.includes('Loading'));
  32 |   console.log('Has "Generated": ', bodyText.includes('Generated'));
  33 |   console.log('Has "Portfolio": ', bodyText.includes('Portfolio'));
  34 |   console.log('Has R$: ', bodyText.includes('R$'));
  35 | 
  36 |   // Check if store has data
  37 |   const storeData = await page.evaluate(() => {
  38 |     try {
  39 |       // @ts-ignore
  40 |       return window.__DASHBOARD_DATA || 'not found';
  41 |     } catch {
  42 |       return 'error accessing window';
  43 |     }
  44 |   });
  45 |   console.log('Store data:', typeof storeData === 'string' ? storeData : 'has data object');
  46 | });
  47 | 
```