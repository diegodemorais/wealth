---
title: ARCH-003 Partials Review — Content Loss Issue
created: 2026-04-14
status: blocked
owner: dev
---

# Critical Finding: Template Partials Are Broken

## Summary

The `dashboard/templates/*.html` partials created for ARCH-003 (Template Componentization) are **severely incomplete**:

- **11 of 12 partials** have little-to-no content
- **Content coverage by tab**: 0-50% of expected elements
- **Result**: Dashboard displays empty nested divs instead of charts/tables on all tabs except a few

## Issues Identified

### Validation Results

| Partial | Size | Headings | Canvases | Status | Content |
|---------|------|----------|----------|--------|---------|
| 00-head.html | 477B | 0 | 0 | ✗ | Empty |
| 01-nav.html | 2.5KB | 1 | 0 | ⚠️ | Navigation only |
| 02-tab-hoje.html | 65.8KB | 66 | 26 | ⚠️ | Mixed content |
| 03-tab-carteira.html | 1.1KB | 0 | 0 | ✗ | **Empty** |
| 04-tab-perf.html | 857B | 0 | 0 | ✗ | **Empty** |
| 05-tab-fire.html | 741B | 0 | 0 | ✗ | **Empty** |
| 06-tab-retiro.html | 446B | 0 | 0 | ✗ | **Empty** |
| 07-tab-simuladores.html | 10.8KB | 3 | 1 | ✓ | OK |
| 08-tab-backtest.html | 383B | 0 | 0 | ✗ | **Empty** |
| 09-footer.html | 308B | 0 | 0 | ✗ | **Empty** |
| 10-scripts.html | 1KB | 0 | 0 | ✗ | **Empty** |
| 11-closing.html | 16B | 0 | 0 | ✗ | **Empty** |

### Tab Content Coverage

Expected key elements per tab:

| Tab | Expected Elements | Found | Coverage | Status |
|-----|-------------------|-------|----------|--------|
| hoje | tornadoChart, sankey, bondPool, backtest | 2 | 50% | ⚠️ Partial |
| carteira | donuts, stackedAlloc, posicoes | 0 | 0% | ❌ Missing |
| perf | timeline, attrib, rolling, heatmap | 0 | 0% | ❌ Missing |
| fire | trackingFireChart, scenarioCompareBody, fireMatrix, netWorth | 2 | 50% | ⚠️ Partial |
| retiro | bondPool, guardrails, incomeChart, swr | 1 | 25% | ⚠️ Minimal |
| simuladores | scenarios, stressProjection, simuladorFire | 0 | 0% | ❌ Missing |
| backtest | backtest, shadowChart, backtestR7 | 1 | 33% | ⚠️ Minimal |

## Root Cause

The partials were created with **only structural div containers** but the actual **content was never distributed** to them:

### Template Structure Problem

1. **Original template.html**:
   - Lines 1-600: All actual content mixed together (headings, canvases, tables)
   - Lines 1100+: Empty nested `<div data-in-tab="...">` shells
   - Missing proper section boundaries

2. **What happened**:
   - Partials (03-08) contain only the empty div shells
   - Content stayed in template.html (fallback)
   - Build selects partials if they exist (even if incomplete)
   - Result: Dashboard renders with missing content

3. **Why now**:
   - Earlier sessions used template.html directly (correct content)
   - Recent rebuild attempted to use partials (no content in them)
   - Mobile tests showed empty nested divs

## Current Status

**WORKAROUND**: Disabled partials, reverted to template.html fallback
- Renamed: `dashboard/templates/` → `dashboard/templates.incomplete/`
- Build now uses `dashboard/template.html` (has content but malformed HTML)
- Dashboard v2.238 displays correctly (but with HTML structural issues)

## What Needs to Happen

### Short-term (Already Done)
- ✓ Revert to template.html fallback
- ✓ Dashboard displays content again

### Medium-term (ARCH-003 Continuation)
1. **Properly extract content** from template.html into partials
2. **Fix HTML structure** — resolve nested `data-in-tab` conflicts
3. **Create validation test** — ensure content completeness per partial
4. **Rebuild partials** with correct content distribution

### Long-term
5. Separate CSS, JS, and HTML properly
6. Implement real componentization (Web Components or similar)

## How to Verify

### Run validation test:
```bash
python3 scripts/validate_partials.py
```

### Expected output when partials are fixed:
```
📊 Partial Status:
   Total: 12
   ✓ OK: 12
   ⚠️  Warnings: 0
   ❌ Critical: 0

📝 Content Coverage by Tab:
   ✓ hoje        — 100.0% (4/4)
   ✓ carteira    — 100.0% (3/3)
   ✓ perf        — 100.0% (4/4)
   ✓ fire        — 100.0% (4/4)
   ✓ retiro      — 100.0% (4/4)
   ✓ simuladores — 100.0% (3/3)
   ✓ backtest    — 100.0% (3/3)
```

## Technical Notes

### Why Templates Are Complex

The template.html was not designed for partial extraction:
- Content is **interleaved** with multiple tab references
- No clear **section boundaries** between tabs
- Some content **lacks proper `data-in-tab` attributes**
- HTML has **unclosed divs** (auto-corrected by browser, but invalid)

### Architectural Debt

This is documented in memory as "tech debt" from v2.230:
- 32 missing closing `</div>` tags across partials
- Mixed `data-in-tab` attribute nesting
- Fallback HTML5 parser auto-correction masks the issues

## Decision

**ARCH-003 is BLOCKED** until partials are properly reconstructed with content. Current approach (splitting static HTML) is insufficient. Next phase should consider:

1. Template engine (Jinja2) for proper componentization
2. Or: Properly extract and tag content before splitting
3. Or: Implement Web Components for true modular structure

---

**Tested**: 2026-04-14  
**Test Result**: 11/12 partials incomplete — validation script at `scripts/validate_partials.py`
