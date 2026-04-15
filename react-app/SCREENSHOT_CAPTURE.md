# Screenshot Capture Workflow

**Updated:** 2026-04-15  
**Status:** Tested and working

## Quick Start

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, capture screenshots
SKIP_WEB_SERVER=1 npx playwright test e2e/ux-audit.spec.ts --project=chromium

# 3. Find screenshots in:
./audit-screenshots/01-now-tab.png through 07-backtest-tab.png
```

---

## Full Procedure

### Step 1: Start Dev Server

```bash
cd /Users/diegodemorais/claude/code/wealth/react-app
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.2.3 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 240ms
```

**Important Notes:**
- Server runs on **localhost:3000** (NOT with /wealth prefix yet)
- All routes will have `/wealth` basePath applied automatically by Next.js
- dev mode uses standard Next.js (NOT static export)

### Step 2: Verify Server is Responding

In another terminal:
```bash
curl -I http://localhost:3000/wealth
```

Expected: **HTTP/1.1 200 OK** (may redirect 308 from /wealth/ → /wealth first)

### Step 3: Capture Screenshots via Playwright

```bash
cd /Users/diegodemorais/claude/code/wealth/react-app
SKIP_WEB_SERVER=1 npx playwright test e2e/ux-audit.spec.ts --project=chromium
```

**Why SKIP_WEB_SERVER=1?**
- We're already running dev server manually
- Flag prevents Playwright from trying to build/start its own server
- Allows reusing the live server without rebuilding

**Expected Output:**
```
Running 7 tests using 7 workers

[chromium] › e2e/ux-audit.spec.ts ... NOW tab
✓ NOW tab screenshotted

[chromium] › e2e/ux-audit.spec.ts ... PORTFOLIO tab
✓ PORTFOLIO tab screenshotted

... (5 more tabs)

7 passed (2.9s)
```

### Step 4: Access Screenshots

```bash
ls -lh audit-screenshots/
```

Output:
```
01-now-tab.png           (130 KB)
02-portfolio-tab.png     (7 KB)
03-performance-tab.png   (7 KB)
04-fire-tab.png          (6 KB)
05-withdraw-tab.png      (6 KB)
06-simuladores-tab.png   (7 KB)
07-backtest-tab.png      (7 KB)
```

---

## Critical Configuration Details

### `playwright.config.ts`

```typescript
use: {
  baseURL: 'http://localhost:3000',  // WITHOUT /wealth
  trace: 'on-first-retry',
},
```

**Why:** baseURL is the root. Test URLs will add `/wealth/` prefix.

### `e2e/ux-audit.spec.ts`

Each test uses explicit `/wealth/` path:
```typescript
test('NOW tab', async ({ page }) => {
  await page.goto('/wealth');  // ← includes /wealth prefix
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'audit-screenshots/01-now-tab.png', fullPage: true });
});
```

### `next.config.ts`

Uses conditional mode to avoid Turbopack conflict:
```typescript
output: process.env.NODE_ENV === 'development' ? undefined : 'export',
distDir: process.env.NODE_ENV === 'development' ? undefined : '../dash',
```

**Why:** 
- Dev mode: standard Next.js server (routes work)
- Build mode: static export to `../dash` (for production)

---

## Troubleshooting

### Issue: Screenshots show 404 errors

**Cause:** Test URLs don't include `/wealth` prefix or baseURL config is wrong

**Fix:** 
1. Verify `playwright.config.ts` has `baseURL: 'http://localhost:3000'`
2. Verify all URLs in `e2e/ux-audit.spec.ts` start with `/wealth/`
3. Restart Playwright: `pkill playwright && SKIP_WEB_SERVER=1 npx playwright test ...`

### Issue: Routes return 404 in dev server

**Cause:** Next.js server not running or crashed

**Fix:**
```bash
pkill -f "next dev"
rm -rf .next
npm run dev
```

### Issue: Port 3000 already in use

**Cause:** Another process (browser, server, etc.) occupies port 3000

**Fix:**
```bash
lsof -i :3000 -t | xargs kill -9
npm run dev
```

---

## Files Involved

| File | Role | Notes |
|------|------|-------|
| `playwright.config.ts` | Playwright config | baseURL must be localhost:3000 (no /wealth) |
| `e2e/ux-audit.spec.ts` | Test suite | URLs must include /wealth prefix |
| `next.config.ts` | Next.js config | Conditional export to allow dev routing |
| `audit-screenshots/` | Output directory | Fresh captures, not persisted in git |

---

## Repeat This Process

Each audit cycle:
1. Ensure dev server is running (`npm run dev`)
2. Run: `SKIP_WEB_SERVER=1 npx playwright test e2e/ux-audit.spec.ts --project=chromium`
3. Compare new screenshots against reference: `/analysis/screenshots/stable-v2.77/`
4. Document gaps in issue or memory

**Time:** ~3-4 seconds for full capture
