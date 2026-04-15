# ABA-1-HOJE Design Audit — Complete Reference

**Date**: 2026-04-15  
**Dashboard Version**: v0.1.43  
**Task**: Capture visual structure, design system, and CSS patterns of the "HOJE" tab (NOW)

---

## Overview

The HOJE tab is the flagship view of the wealth dashboard, displaying:
- Portfolio health snapshot (Hero strip)
- FIRE progress tracking (countdown + progress bar)
- DCA/bond strategy status
- Financial wellness score
- Scenario planning (single/married/family)
- Guardrails/drawdown management

This audit captures **10 core components**, **color scheme**, **responsive breakpoints**, and **reusable CSS patterns** for future extensions.

---

## Files Generated

### 1. **ABA-1-HOJE-design-audit.md** (673 lines)
Comprehensive design specification covering:
- **I. Layout Structure** — Grid systems, spacing, responsive paradigm
- **II. Components Table** — All 10 components with visual properties
- **III. Component Details** — In-depth specs for each (Hero, KPI, Progress, DCA, Wellness, etc.)
- **IV. Responsiveness** — Breakpoints 1024px → 900px → 768px → 480px
- **V. Privacy Mode** — CSS-only value masking mechanism
- **VI. Color Palette** — All CSS variables with RGB/Hex values
- **VII. Critical Observations** — Design principles, reutilizable patterns
- **VIII. File Structure** — Where CSS is located in DashHTML.html
- **IX. Quick Copy-Paste Patterns** — HTML templates ready to use

**Use when**: Need detailed specifications for styling, typography, or spacing.

---

### 2. **HOJE-component-hierarchy.txt** (284 lines)
Visual ASCII diagrams showing:
- Component stacking order (vertical flow)
- Grid layout at each breakpoint
- Color zones (blue, green, yellow, muted)
- Inside-view of each component
- Responsive collapse sequence

**Use when**: Designing new components, visualizing layout changes, or planning mobile reflow.

---

### 3. **HOJE-css-patterns.md** (739 lines)
Production-ready CSS patterns with full code examples:

1. **Hero KPI Pattern** — 4-col hero strip with primary/secondary variants
2. **KPI Grid Pattern** — auto-fit metric cards (170px minmax)
3. **Progress Bar Pattern** — Animated gradient bars (12-20px)
4. **DCA Card Pattern** — Status cards with left-border accent
5. **Scenario Card Pattern** — Multi-option display (persona-coded)
6. **Wellness Row Pattern** — 5-col checklist with progress bars
7. **Collapsible Section Pattern** — Guardrails & toggle behavior
8. **Responsive Grid Mixin** — Standard breakpoints (1024→900→768→480)
9. **Privacy Mode** — CSS ::after masking mechanism
10. **Color Override Utilities** — Safe inline color patterns

Each pattern includes:
- Base CSS (copy-paste ready)
- Media queries
- HTML usage example
- Customization notes

**Use when**: Cloning components to other tabs, extending the design system, or implementing new features.

---

### 4. **HOJE-SUMMARY.txt** (264 lines)
Executive summary with:
- **Key Findings** — Layout paradigm, 10 components overview
- **Color Scheme** — All 10 CSS variables with use cases
- **Typography Scale** — Headlines, values, labels, subtitles
- **Responsive Breakpoints** — Collapse behavior at each size
- **Privacy Mode** — Mechanism & usage
- **Spacing Rules** — Micro-design constants
- **Interactive States** — Hover, active, disabled states
- **Reusable Patterns** — 5 core patterns for extension
- **Testing Checklist** — QA validation points
- **Dev Notes** — Implementation guidelines

**Use when**: Quick reference during development, design reviews, or QA testing.

---

## Quick Start

### For Visual Reference
1. Open **HOJE-component-hierarchy.txt** → ASCII diagrams
2. Reference **HOJE-SUMMARY.txt** → Component overview

### For Implementation
1. Pick pattern from **HOJE-css-patterns.md** → Copy CSS + HTML
2. Reference **ABA-1-HOJE-design-audit.md** → Detailed specs (colors, spacing, typography)
3. Check **HOJE-SUMMARY.txt** → Testing checklist before git push

### For Design System Extension
1. Study **5 Design Patterns** in HOJE-SUMMARY.txt
2. Apply patterns from **HOJE-css-patterns.md** to new components
3. Validate responsive behavior @ 480px, 900px, 1024px

---

## Key Design Principles

### 1. Grid-First Responsive
- All multi-item sections use CSS Grid with `auto-fit` + `minmax()`
- No hardcoded breakpoints; responsive scaling is automatic
- Example: `grid-template-columns: repeat(auto-fit, minmax(170px, 1fr))`

### 2. Consistent Spacing
- **Section gaps**: 14px
- **Card padding**: 14-16px
- **Grid gaps**: 10px (cards), 8px (rows)
- Micro-spacing creates visual hierarchy without clutter

### 3. Color-Coded Status
- **Blue** (--accent): Primary action, hero metric
- **Green**: Success, positive state
- **Yellow**: Warning, caution state
- **Red**: Critical (drawdown >35%)
- **Muted**: Labels, secondary info

### 4. Typography Hierarchy
- **Headlines**: 3rem bold (2.5rem @ mobile)
- **Values**: 1.5-2rem bold
- **Labels**: 0.6-0.8rem UPPERCASE
- **Subtitles**: 0.65-0.75rem muted
- Contrast ratio always ≥4.5:1 (WCAG AA)

### 5. Privacy Mode (CSS-Only)
- No JavaScript manipulation; pure `::after` pseudo-element masking
- Custom masks via `data-pv-mask` attribute
- Can be toggled via `.private-mode` class on `<body>`

---

## Color Reference

| CSS Var | RGB | Hex | Usage |
|---------|-----|-----|-------|
| `--accent` | 59,130,246 | #3B82F6 | Primary blue, hero, focus |
| `--green` | 34,197,94 | #22C55E | Success, positive, wellness ✓ |
| `--yellow` | 234,179,8 | #EAB308 | Warning, caution, neutral |
| `--red` | 239,68,68 | #EF4444 | Critical, drawdown >35% |
| `--purple` | 168,85,247 | #A855F7 | Gradients, secondary |
| `--cyan` | 6,182,212 | #06B6D4 | Bond pool, persona |
| `--card` | 29,33,42 | #1D212A | Default card bg |
| `--card2` | 41,50,65 | #293241 | Darker card variant |
| `--text` | 255,255,255 | #FFFFFF | Primary text |
| `--muted` | var(--gray-400) | — | Labels, secondary |
| `--border` | 71,85,105,0.3 | rgba | Card outlines |

---

## Components at a Glance

| # | Component | Grid Type | Responsive | Colors |
|---|-----------|-----------|-----------|--------|
| 1 | Hero Strip | 4 col → 2 col | 1024→900→480 | --accent primary |
| 2 | KPI Metrics | auto-fit(170px) | 1024→480 | --accent + inline |
| 3 | FIRE Progress | 1D bar | full-width | gradient (accent→purple) |
| 4 | FIRE Countdown | text | centered | --text white |
| 5 | Scenarios | auto-fit(150px) | 1024→900 | persona-coded (blue/purple/cyan) |
| 6 | Semáforo | collapsible | full-width | --yellow critical |
| 7 | DCA Cards | auto-fit(260px) | 1024→480 | --accent left border |
| 8 | Bond Pool | 1D bar | full-width | gradient (green→cyan) |
| 9 | Wellness | grid 5col | compact mobile | --green filled |
| 10 | Aporte Form | block | full-width | --accent (slider thumb) |

---

## Responsive Behavior

### 1024px+ (Desktop)
- Hero: 4 cols | KPI: auto-fit(170px) | Scenario: 4 cols
- All fonts at 100%
- Full spacing (14px gaps, 16px padding)

### 900px (Tablet)
- Hero: 3 cols | KPI: 2 cols | Scenario: 1 col
- DCA: 2 cols
- Aggressive grid reflow

### 768px (Phablet)
- Grids: 2 cols max
- Fonts: 90% of desktop size

### 480px (Mobile)
- All grids: 1 col
- Hero: 2 cols (2 KPIs per row)
- Fire big: 2.5rem (from 3rem)
- KPI value: 1.2rem (from 1.5rem)
- `.hide-mobile` → `display: none`

---

## Testing Checklist

Before modifying HOJE tab:
- [ ] Mobile @ 480px: all grids 1-col collapse
- [ ] Hero strip responsive: 4 → 3 → 2 cols
- [ ] KPI grid 2 cols @ 480px
- [ ] Privacy mode: toggle `.private-mode` on body
- [ ] Scenarios reflow to 1 col @ 900px
- [ ] DCA cards: minmax(260px, 1fr) responsive
- [ ] Progress bars animate smooth (0.5s ease)
- [ ] Color contrast: #FFF on #1D212A (≥4.5:1)
- [ ] Collapsible sections toggle on/off
- [ ] Wellness rows align @ all breakpoints

---

## Implementation Notes

### For Dev Agent
- No hardcoded widths; use `auto-fit` + `minmax()`
- Font-size reduction @ mobile via `@media`, not JS
- Privacy masking is CSS-only; no DOM changes
- Colors: inline `style="color: rgb(34,197,94)"` for overrides
- Animations: CSS `transition` (GPU-accelerated)
- Section collapse: `_toggleBlock()` JS function (onclick)
- Responsive: automatic via `@media grid-template-columns`
- Spacing: consistent 14-16px padding, 10px gaps

### For QA
- Validate at 3 breakpoints: 480px, 900px, 1024px
- Check hover states on interactive elements
- Verify color contrast ratios (WCAG AA minimum)
- Test privacy mode toggle (all `.pv` elements masked)
- Confirm animations play smoothly (no jank)
- Check mobile: `hide-mobile` elements hidden

---

## File Locations

**Source HTML**:
```
/Users/diegodemorais/claude/code/wealth/analysis/raw/DashHTML.html
  Lines 327-850: ABA-1-HOJE content
  Lines 1-300: CSS styles (inline <style>)
```

**This Audit**:
```
/Users/diegodemorais/claude/code/wealth/analysis/
  ├── ABA-1-HOJE-design-audit.md        (Detailed specs)
  ├── HOJE-component-hierarchy.txt      (Visual diagrams)
  ├── HOJE-css-patterns.md              (Copy-paste patterns)
  ├── HOJE-SUMMARY.txt                  (Executive summary)
  └── README-DESIGN-AUDIT.md            (This file)
```

---

## Next Steps

1. **For Cloning to Other Tabs**: Use patterns from `HOJE-css-patterns.md`
2. **For Visual Planning**: Reference `HOJE-component-hierarchy.txt`
3. **For Implementation**: Follow `ABA-1-HOJE-design-audit.md` specs
4. **For QA**: Use checklist in `HOJE-SUMMARY.txt`
5. **Before Git Push**: Validate responsive behavior @ 480px, 900px, 1024px

---

## Questions & Customization

### How to add a new KPI card?
→ Use **KPI Grid Pattern** from `HOJE-css-patterns.md` (Section 2)

### How to create a collapsible section?
→ Use **Collapsible Section Pattern** from `HOJE-css-patterns.md` (Section 7)

### How to make progress bar?
→ Use **Progress Bar Pattern** from `HOJE-css-patterns.md` (Section 3)

### What colors should new components use?
→ Reference **Color Scheme** in `HOJE-SUMMARY.txt` or this README

### How to test mobile responsiveness?
→ Use **Testing Checklist** in `HOJE-SUMMARY.txt`

---

**Audit Complete** — Ready for implementation, extension, or design review.

Generated by Dev agent (Haiku) on 2026-04-15.
