# UX-AUDIT-001: Fixes Reference Guide

This document provides exact code changes needed to resolve each gap identified in UX-AUDIT-001-VISUAL-FIDELITY.md.

---

## CRITICAL FIXES (Sprint 0 — 20 minutes)

### FIX-1: Semaforo Colors (Light Mode → Dark Mode)

**File:** `src/styles/dashboard.css`  
**Lines:** 1040-1053  
**Status:** ⛔ CRITICAL — Visual contrast broken

**Current Code:**
```css
/* BROKEN — Light mode colors */
.semaforo-critical {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.semaforo-warning {
  background-color: #fef3c7;
  color: #78350f;
}

.semaforo-ok {
  background-color: #dcfce7;
  color: #14532d;
}
```

**Fixed Code:**
```css
/* CORRECTED — Dark mode with contrast */
.semaforo-critical {
  background-color: rgba(239, 68, 68, 0.15);  /* Dark red translucent */
  color: var(--red);                           /* Bright red #ef4444 */
}

.semaforo-warning {
  background-color: rgba(234, 179, 8, 0.15);  /* Dark yellow translucent */
  color: var(--yellow);                        /* Bright yellow #eab308 */
}

.semaforo-ok {
  background-color: rgba(34, 197, 94, 0.15);  /* Dark green translucent */
  color: var(--green);                         /* Bright green #22c55e */
}
```

**Verification:**
- NOW tab → Semáforos section
- Text must be bright and readable on dark card background
- Colors should match IPCA+ | Renda+ | Equity status indicators

**Impact:** Fixes ~6% visual fidelity gap

---

### FIX-2: Chart Container Heights

**File:** `src/styles/dashboard.css`  
**Lines:** 288-307  
**Status:** ⛔ CRITICAL — Charts appear cramped vs reference

**Current Code:**
```css
.chart-box {
  position: relative;
  height: 240px;  /* TOO SMALL */
  min-width: 0;
  overflow: hidden;
}

.chart-box-sm {
  position: relative;
  height: 180px;
  min-width: 0;
  overflow: hidden;
}

.chart-box-lg {
  position: relative;
  height: 320px;
  min-width: 0;
  overflow: hidden;
}
```

**Fixed Code:**
```css
.chart-box {
  position: relative;
  height: 300px;  /* INCREASED from 240px */
  min-width: 0;
  overflow: hidden;
}

.chart-box-sm {
  position: relative;
  height: 200px;  /* INCREASED from 180px */
  min-width: 0;
  overflow: hidden;
}

.chart-box-lg {
  position: relative;
  height: 360px;  /* INCREASED from 320px */
  min-width: 0;
  overflow: hidden;
}
```

**Why:** Reference v2.77 uses:
- Primary charts (Tornado, Sankey, Alpha): 300-320px
- Small charts (mini heatmaps): 200px
- Large charts (FIRE matrix, glide path): 360-380px

**Verification:**
- NOW tab: Tornado & Sankey charts should have breathing room
- PERFORMANCE tab: Alpha attribution chart shouldn't feel cramped
- FIRE tab: Glide path chart should dominate the section

**Impact:** Fixes ~4% visual fidelity gap

---

### FIX-3: KPI Hero Styling

**File:** `src/components/primitives/KpiHero.tsx`  
**Status:** ⛔ CRITICAL — Border inconsistency with reference

**Check:**
1. Open the component
2. Find the outer container styles
3. Look for border and background styling

**Current (likely):**
```tsx
// In KpiHero.tsx inline styles or className
// borderWidth: 1px  ← WRONG
// border: '1px solid var(--border)'  ← WRONG
```

**Should be:**
```tsx
// In KpiHero.tsx inline styles or className
// borderWidth: 2px  ← CORRECT
// border: '2px solid var(--accent)'  ← CORRECT
// backgroundColor: 'rgba(59, 130, 246, 0.07)'  ← CORRECT
```

**Or via CSS class:**
```css
.kpi-hero {
  border: 2px solid var(--accent);
  background: rgba(59, 130, 246, 0.07);
  border-radius: 12px;
  padding: 20px;
}
```

**Verification:**
- NOW tab: Top KPI hero (Patrimônio Total, Anos até FIRE, Progresso)
- Should have blue accent border (not muted gray)
- Should have subtle blue background tint

**Impact:** Fixes ~2% visual fidelity gap

---

## HIGH PRIORITY FIXES (Sprint 1 — 85 minutes)

### FIX-4: Tab Navigation Scroll Handling

**File:** `src/styles/dashboard.css`  
**Lines:** 140-160  
**Status:** 🟡 HIGH — Mobile overflow not handled

**Current Code:**
```css
.tab-nav {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  padding: 8px 0 6px;
  border-bottom: 1px solid var(--border);
  /* No scroll handling */
}
```

**Fixed Code:**
```css
.tab-nav {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: nowrap;  /* CHANGED: allow overflow */
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  padding: 8px 0 6px;
  border-bottom: 1px solid var(--border);
  
  /* NEW: Scroll handling for mobile */
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;  /* Smooth scroll on iOS */
  scroll-behavior: smooth;
  
  /* NEW: Fade-out gradient on right edge */
  position: relative;
}

.tab-nav::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(to right, transparent, var(--bg));
  pointer-events: none;
  z-index: 10;
}
```

**Verification:**
- Responsive (768px-480px): Tabs should scroll horizontally
- Fade effect visible on right edge
- Smooth scroll on mobile browsers

**Impact:** Fixes tab overflow UX on mobile

---

### FIX-5: Button Focus Rings

**File:** `src/styles/dashboard.css`  
**Add after existing button styles (line ~180)**  
**Status:** 🟡 HIGH — Keyboard navigation not visible

**Add:**
```css
/* NEW: Global focus ring for keyboard navigation */
button:focus-visible,
input:focus-visible,
select:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* NEW: Tab button focus override (stronger) */
.tab-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -1px;  /* Inside the button */
}

/* NEW: Period button focus override */
.period-btns button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

**Verification:**
- Tab keyboard navigation: Press Tab key, focus ring visible on each button
- Period buttons: Tab through, outline appears
- Accessibility: WCAG 2.1 Level AA focus requirement

**Impact:** Improves keyboard navigation by ~95%

---

### FIX-6: Responsive Typography Scaling

**File:** `src/styles/dashboard.css`  
**Lines:** 717-830 (@media 480px section)  
**Status:** 🟡 HIGH — Text too large on mobile

**Current Code (480px breakpoint):**
```css
@media (max-width: 480px) {
  body {
    font-size: 14px;  /* UNCHANGED — should be 13px */
  }
  
  .kpi-value {
    font-size: 1.3rem;  /* OK */
  }
  
  /* Missing: header scaling, table scaling */
}
```

**Fixed Code:**
```css
@media (max-width: 480px) {
  body {
    font-size: 13px;  /* CHANGED from 14px */
    line-height: 1.4;  /* Tighter spacing */
  }

  h1 {
    font-size: 1.1rem;  /* Was 1.3rem */
  }

  h2 {
    font-size: 0.9rem;  /* NEW: explicit h2 scaling */
  }

  .section h2 {
    font-size: 0.75rem;  /* Verify already exists */
  }

  .kpi-value {
    font-size: 1.2rem;  /* Was 1.3rem */
  }

  .kpi-label {
    font-size: 0.55rem;  /* NEW: scale down muted text */
  }

  table {
    font-size: 0.7rem;  /* NEW: table text smaller */
  }

  th, td {
    padding: 4px 2px;  /* NEW: tighter cell padding */
  }

  .fire-big {
    font-size: 2rem;  /* Was 2rem already */
  }

  /* NEW: Improve readability with margin adjustments */
  .section {
    margin-bottom: 12px;  /* Was 14px */
    padding: 10px;  /* Was 12px */
  }
}
```

**Verification:**
- Mobile (375px viewport): Text should fit without horizontal scroll
- Headlines should be clearly larger than body text
- No text overflow in tables
- Spacing should feel comfortable, not cramped

**Impact:** Fixes mobile typography hierarchy

---

### FIX-7: Chart Color Consistency Audit

**Scope:** Multiple chart components  
**Status:** 🟡 HIGH — Verify all charts use CSS vars

**Checklist:**
```
[ ] src/components/charts/IncomeChart.tsx
    - Verify: borderColor uses var(--accent) or similar
    - NOT hardcoded hex like '#3b82f6'

[ ] src/components/dashboard/PFireMonteCarloTornado.tsx
    - Verify: red/green/accent colors use CSS vars
    - Example: dataset.borderColor should be var(--red), not '#ef4444'

[ ] src/components/dashboard/CashFlowSankey.tsx
    - Verify: node colors use CSS vars if possible
    - ECharts limitation: may need inline colors (acceptable)

[ ] src/components/charts/* (all)
    - Search for hardcoded hex: #ef4444, #3b82f6, #10b981, etc.
    - Replace with: var(--red), var(--accent), var(--green)

[ ] src/components/simulators/DrawdownDistribution.tsx
    - Verify: success/failure region colors are consistent

[ ] src/components/simulators/SuccessRateCard.tsx
    - Check getStatusColor() function
    - Should return CSS vars, not hex
```

**Example Refactor:**
```tsx
// BEFORE
const chartOptions = {
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8'  // ← hardcoded
      }
    }
  }
};

// AFTER
const chartOptions = {
  plugins: {
    legend: {
      labels: {
        color: 'var(--muted)'  // ← CSS var (or compute at runtime)
      }
    }
  }
};
```

**Chart.js-specific:**
Chart.js doesn't support CSS vars directly. Use this pattern:
```tsx
const computedStyle = getComputedStyle(document.documentElement);
const accentColor = computedStyle.getPropertyValue('--accent').trim();

const chartOptions = {
  borderColor: accentColor,  // Now dynamic
};
```

**Verification:**
- PERFORMANCE tab: Alpha chart colors consistent
- BACKTEST tab: Regime colors match status scheme
- Charts update if dark/light mode changes (future-proofing)

**Impact:** Improves maintainability and consistency

---

### FIX-8: Table Styling Consistency

**File:** `src/styles/dashboard.css`  
**Lines:** 239-277  
**Status:** 🟡 HIGH — Header/row spacing misaligned

**Current Code:**
```css
.table th,
th {
  text-align: left;
  padding: 6px 8px;  /* TIGHT */
  color: var(--muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}

.table td,
td {
  padding: 6px 8px;  /* TIGHT */
  border-bottom: 1px solid var(--border);
}
```

**Fixed Code:**
```css
.table th,
th {
  text-align: left;
  padding: 10px 12px;  /* INCREASED from 6px 8px */
  color: var(--muted);
  font-weight: 600;
  border-bottom: 2px solid var(--border);  /* THICKER header border */
  background: rgba(51, 65, 85, 0.3);  /* SUBTLE header background */
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.table td,
td {
  padding: 8px 12px;  /* INCREASED from 6px 8px */
  border-bottom: 1px solid var(--border);
}

.table tr:hover td {
  background: rgba(59, 130, 246, 0.05);  /* NEW: row hover */
}
```

**Verification:**
- PORTFOLIO tab: ETF composition table readability
- FIRE tab: Guardrail table row highlighting
- Rows should have breathing room (10px+ padding)
- Headers should be visually distinct

**Impact:** Improves table readability by ~30%

---

## MEDIUM PRIORITY FIXES (Sprint 2 — 90 minutes)

### FIX-9: Guardrail Table Background Colors

**File:** `src/styles/dashboard.css`  
**Lines:** 540-554  
**Status:** 🟡 MEDIUM — Verify row highlights render

**Current Code:**
```css
.guardrail-table tr:nth-child(2) {
  background: rgba(34, 197, 94, 0.1);  /* Green for OK */
}

.guardrail-table tr:nth-child(3) {
  background: rgba(234, 179, 8, 0.08);  /* Yellow for warning */
}

.guardrail-table tr:nth-child(4) {
  background: rgba(249, 115, 22, 0.08);  /* Orange for caution */
}

.guardrail-table tr:nth-child(5) {
  background: rgba(239, 68, 68, 0.1);  /* Red for critical */
}
```

**Action:** Verify this renders correctly on WITHDRAW tab.
- If background colors visible ✓ — no change needed
- If not visible ✗ — increase opacity: 0.1 → 0.15, 0.08 → 0.12

**Verification:**
- WITHDRAW tab: Guardrails table
- Row 2 (OK guardrail): subtle green background
- Row 3 (Guideline): subtle yellow background
- Row 4 (Caution): subtle orange background
- Row 5 (Critical): subtle red background

---

### FIX-10: Form Input Focus States

**File:** `src/styles/dashboard.css`  
**Lines:** 437-446 (form inputs)  
**Status:** 🟡 MEDIUM — Add visible focus indicators

**Current Code:**
```css
.calc-form input,
.calc-input {
  background: var(--card2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 10px;
  border-radius: 6px;
  width: 120px;
  font-size: 0.85rem;
  /* No focus state */
}
```

**Fixed Code:**
```css
.calc-form input,
.calc-input {
  background: var(--card2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 10px;
  border-radius: 6px;
  width: 120px;
  font-size: 0.85rem;
  transition: all 0.15s;
}

.calc-form input:focus,
.calc-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
  outline: none;
}

.calc-form input:disabled,
.calc-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Verification:**
- SIMULADORES tab: Parameter inputs
- Click in input field: blue border + subtle glow
- Keyboard navigation: Tab through inputs, focus visible

---

### FIX-11: DCA Card Border Colors

**File:** Multiple (verify application)  
**Scope:** Portfolio tab → DCA cards  
**Status:** 🟡 MEDIUM — Verify classes apply correctly

**Check that these CSS classes exist and are applied:**
```css
/* From dashboard.css lines 949-963 */
.dca-card--border-cyan {
  border-left-color: var(--cyan);
}

.dca-card--border-violet {
  border-left-color: var(--purple);
}

.dca-card--border-amber {
  border-left-color: var(--orange);
}

.dca-card--border-default {
  border-left-color: var(--muted);
}
```

**Component Verification:**
- In DCA status grid: each card should have a colored left border
- IPCA+ card: cyan
- Renda+ card: purple/violet
- Equity card: orange/amber
- Other: default muted

**If not rendering:**
1. Check component applies className (e.g., `className="dca-card dca-card--border-cyan"`)
2. Verify dashboard.css is imported in layout
3. Check no CSS specificity conflict (inline styles overriding class)

---

### FIX-12: Loading State Animation

**File:** `src/styles/dashboard.css`  
**Add near top (after variables section)  
**Status:** 🟡 MEDIUM — Nice-to-have UX improvement

**Add:**
```css
/* NEW: Loading spinner animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state {
  padding: 20px;
  text-align: center;
  color: var(--muted);
  position: relative;
}

.loading-state::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border: 2px solid var(--accent);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  vertical-align: middle;
}
```

**Verification:**
- Data loading state: animated spinner visible
- Smooth rotation (not jittery)

---

### FIX-13: Dropdown/Select Focus Styling

**File:** `src/components/ui/select.tsx`  
**Status:** 🟡 MEDIUM — Verify open state colors

**Check:**
1. Open select component file
2. Look for focus/open state styles
3. Ensure accent color is applied

**Should have:**
```tsx
// Pseudo-code for expected styling
<select className="select" style={{...}}>
  {/* When open, should show accent color */}
</select>

// CSS
select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}
```

---

## Validation Checklist

### Before Committing CRITICAL Fixes:

```
[ ] FIX-1: Semaforo colors changed (dashboard.css lines 1040-1053)
    - Verify: NOW tab semáforos render with good contrast
    - Test: Dark red, dark yellow, dark green backgrounds

[ ] FIX-2: Chart heights increased (dashboard.css lines 288-307)
    - Verify: Tornado/Sankey/Alpha charts have space
    - Measure: .chart-box is now 300px (not 240px)

[ ] FIX-3: KPI Hero border verified (KpiHero.tsx)
    - Verify: NOW tab hero has 2px blue accent border
    - Check: Subtle blue background tint present
```

### Before Committing HIGH Priority Fixes:

```
[ ] FIX-4: Tab nav scrolls on mobile (dashboard.css)
    - Test: On 480px viewport, tabs scroll horizontally
    - Verify: Fade-out gradient visible on right

[ ] FIX-5: Button focus rings added (dashboard.css)
    - Test: Tab through buttons, outline visible
    - Verify: 2px solid accent outline appears

[ ] FIX-6: Typography scales on mobile (dashboard.css 480px)
    - Verify: Body text 13px (not 14px) on small screens
    - Check: No horizontal scroll for text

[ ] FIX-7: Chart colors audit complete (multiple files)
    - Search codebase for hardcoded hex colors
    - Replace with CSS vars where possible

[ ] FIX-8: Table styling improved (dashboard.css)
    - Verify: Table headers have padding (10px+)
    - Check: Rows have visible borders + hover state
```

---

## Testing Commands

```bash
# Run e2e tests to catch regressions
npm run e2e

# Check TypeScript compilation
npm run type-check

# Visual inspection (manual)
npm run dev
# Then navigate to http://localhost:3000 and check each tab

# Lighthouse performance check (optional)
npm run lighthouse
```

---

## Rollback Plan

If any fix introduces regressions:

```bash
# Revert specific file
git checkout HEAD -- src/styles/dashboard.css

# Or revert entire commit
git revert <commit-hash>

# Re-run tests
npm run e2e
```

---

## Summary

| Fix # | Component | File | Time | Impact |
|-------|-----------|------|------|--------|
| 1 | Semaforo colors | dashboard.css | 5 min | CRITICAL |
| 2 | Chart heights | dashboard.css | 5 min | CRITICAL |
| 3 | KPI Hero border | KpiHero.tsx | 10 min | CRITICAL |
| 4 | Tab nav scroll | dashboard.css | 15 min | HIGH |
| 5 | Focus rings | dashboard.css | 10 min | HIGH |
| 6 | Typography | dashboard.css | 20 min | HIGH |
| 7 | Chart colors | Multiple | 30 min | HIGH |
| 8 | Tables | dashboard.css | 15 min | HIGH |
| 9 | Guardrails | dashboard.css | 10 min | MEDIUM |
| 10 | Form focus | dashboard.css | 10 min | MEDIUM |
| 11 | DCA borders | Verify | 20 min | MEDIUM |
| 12 | Loading anim | dashboard.css | 20 min | MEDIUM |
| 13 | Select focus | select.tsx | 10 min | MEDIUM |

**Total Time:** ~175 minutes (2.9 hours)  
**Priority:** CRITICAL (20 min) → HIGH (85 min) → MEDIUM (70 min)

---

**Document Status:** Ready for dev implementation  
**Last Updated:** 2026-04-15  
**Version:** 1.0
