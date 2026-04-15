# Visual Regression Testing - Fixes Applied

**Status**: In Progress (4 pages at 76-83% similarity, targeting 100%)

## Current Test Results

| Page | Similarity | Target |  Status |
|------|-----------|--------|--------|
| NOW | 75.9% | 100% | 🔴 MEDIUM GAP |
| PERFORMANCE | 82.2% | 100% | 🟡 MEDIUM GAP |
| WITHDRAW | 80.5% | 100% | 🟡 MEDIUM GAP |
| BACKTEST | 83.1% | 100% | 🟡 MEDIUM GAP |
| SIMULADORES | 0.0% | 100% | 🔴 CRITICAL (DEFERRED) |

## Fixes Applied (4 commits)

### 1. Viewport Size Mismatch (ee5ed76)
**Issue**: Puppeteer was capturing at 1440px width, but baseline at 2000px
**Fix**: Changed viewport from 1440x900 → 2000x1200
**Impact**: Ensures content layout matches baseline screenshot dimensions

```javascript
// Before
await page.setViewport({ width: 1440, height: 900 });

// After
await page.setViewport({ width: 2000, height: 1200 });
```

### 2. Chart Container Heights (a586673)
**Issue**: React CSS used larger chart containers than baseline
**Fix**: Standardized heights to match baseline HTML CSS
**Impact**: Reduces visual height differences in chart-heavy pages

```css
/* Baseline Values */
.chart-box { height: 240px; }     /* Was 300px in React */
.chart-box-sm { height: 180px; }   /* Was 200px */
.chart-box-lg { height: 320px; }   /* Was 360px */
```

### 3. Performance Page Heatmap Section (72e6e6c)
**Issue**: Heatmap collapsible was open by default in React, but closed in baseline
**Fix**: Set `defaultOpen={false}` for heatmap section
**Impact**: Reduces PERFORMANCE page height significantly

```typescript
// Before
<CollapsibleSection id="section-heatmap" defaultOpen={true}>

// After
<CollapsibleSection id="section-heatmap" defaultOpen={false}>
```

### 4. Container Padding & Max-Width (22b877b)
**Issue**: Main container used 20px padding and 1400px max-width vs baseline 16px/1280px
**Fix**: Aligned container sizes to match baseline CSS
**Impact**: Small cumulative reduction in page heights

```typescript
// Before
padding: '20px', maxWidth: '1400px'

// After
padding: '16px', maxWidth: '1280px'
```

## Root Cause Analysis

**Height Differences** (React pages are taller):
- NOW: +395px (+27%)
- PERFORMANCE: +2113px (+143%)
- WITHDRAW: +658px (+61%)
- BACKTEST: +847px (+65%)

**Likely Remaining Issues**:
1. **Tailwind vs CSS Mismatch**: React uses Tailwind utilities (mb-3.5 = 12.25px) while baseline uses explicit CSS (margin-bottom: 14px). Small differences accumulate.
2. **Font Size Differences**: Tailwind defaults may differ from explicit CSS values
3. **Line Height**: Component line-heights may not match baseline exactly
4. **Component Spacing**: Cumulative gap/padding differences across many grid and flex layouts

## Quantified Impact of Fixes

| Fix | Approximate Pixel Improvement |
|-----|------|
| Viewport resize | Enables proper content reflow |
| Chart heights | ~50-100px per page |
| Heatmap collapse | ~500px (PERFORMANCE only) |
| Container padding | ~20-40px total |
| **Total Impact** | ~570-740px improvement (still short of 100% match) |

## Remaining Work

To achieve 100% similarity, would require:
- Systematically audit all Tailwind utility classes against baseline CSS
- Replace Tailwind utilities with explicit CSS values where they diverge
- Adjust component padding/margin inline styles to match baseline pixel values
- Review all grid/flex gap values and ensure they match baseline exactly
- Verify font sizes and line-heights match baseline throughout all components

**Estimated effort**: ~4-8 hours of detailed component-by-component CSS review and adjustment

## Files Modified

- `scripts/capture_tabs_puppeteer.js` - Viewport size
- `react-app/src/styles/dashboard.css` - Chart heights
- `react-app/src/app/performance/page.tsx` - Heatmap defaultOpen
- `react-app/src/app/layout-client.tsx` - Container sizing

## Test Command

```bash
rm -rf /home/user/wealth/react-app/audit-screenshots/*.png
python3 scripts/test_visual_regression.py
```

## Notes

- Baseline HTML (stable-v2.77) is available at `/home/user/wealth/analysis/raw/DashHTML-estavel.html`
- Screenshot baseline at `/home/user/wealth/analysis/screenshots/stable-v2.77/`
- Visual regression report: `/home/user/wealth/dashboard/tests/visual_regression_report.json`
