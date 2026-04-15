# HD-ALIGNMENT: Design & Data Fidelity — React vs DashHTML

**Status**: 🔴 BLOQUEADO — Requires investigation  
**Priority**: 🔴 ALTA  
**Created**: 2026-04-15  
**Scope**: Audit + align visual design and data between React v0.1.135 and DashHTML v2.77

---

## Objective

Ensure **complete fidelity** between React and HTML dashboards:
- **Design**: Colors, typography, spacing, layout identical
- **Data**: Same fields displayed, same calculations, same formats
- **Behavior**: Interactive elements work identically
- **Responsiveness**: Viewport behavior matches exactly

**Current State**: Dashboards look and behave differently in several areas. Need comprehensive audit to identify all divergences.

---

## Investigation Required

### Design Divergences (Suspected)
- [ ] Color palette differences (CSS var values?)
- [ ] Typography (font sizes, weights, line-height)
- [ ] Spacing/padding (grid gaps, margins)
- [ ] Border radius, shadows, hover states
- [ ] Component sizing (KPI cards, chart containers)
- [ ] Responsive breakpoint behavior
- [ ] Tab navigation styling
- [ ] Collapsible section animations
- [ ] Table styling and spacing

### Data Divergences (Suspected)
- [ ] Field extraction from data.json (which fields used?)
- [ ] Calculation differences (derived values)
- [ ] Formatting (currency, percentages, dates)
- [ ] Missing fields in React that exist in HTML
- [ ] Extra fields in React that don't exist in HTML
- [ ] Chart data sources (which arrays/objects?)
- [ ] Privacy mode masking inconsistencies

### Component Divergences (Suspected)
- [ ] Missing components in React
- [ ] Extra components in React
- [ ] Component placement (section order)
- [ ] Component size/prominence differences
- [ ] Tooltip/hover behavior
- [ ] Error state handling
- [ ] Loading state styling

### Behavioral Divergences (Suspected)
- [ ] Tab navigation behavior
- [ ] Collapsible expand/collapse animation speed
- [ ] Chart rendering timing
- [ ] Form input validation
- [ ] Simulator parameter constraints
- [ ] Sort/filter functionality

---

## Audit Approach

### Phase 1: Visual Comparison (1-2 days)
1. **Side-by-side screenshots** at each breakpoint:
   - 480px (mobile)
   - 768px (tablet)
   - 1024px (laptop)
   - 1920px (desktop)

2. **Color audit**:
   - Extract all colors from HTML CSS
   - Compare with React CSS vars
   - Verify HEX/HSL conversion accuracy

3. **Typography audit**:
   - Measure font sizes at each breakpoint
   - Compare line-height, font-weight
   - Check heading hierarchy

4. **Spacing audit**:
   - Grid gaps (current: 10px, 14px, 16px, 20px)
   - Padding/margin consistency
   - Component sizing consistency

### Phase 2: Data Audit (1-2 days)
1. **Field mapping**:
   - List all data.json fields used in HTML
   - List all data.json fields used in React
   - Identify missing/extra fields

2. **Calculation audit**:
   - Verify all derived values match
   - Check financial calculations (returns, volatility, Sharpe, etc.)
   - Compare formatting (currency, percentages)

3. **Table/Chart data verification**:
   - Sample data from each component
   - Compare HTML output vs React output
   - Flag discrepancies

### Phase 3: Behavioral Audit (1 day)
1. **Interactive elements**:
   - Test tab navigation (speed, responsiveness)
   - Test collapsible sections (animation, timing)
   - Test form inputs (validation, constraints)

2. **Responsive behavior**:
   - Window resize at each breakpoint
   - Check layout reflow speed
   - Verify grid/flex behavior

3. **Privacy mode**:
   - Toggle on/off, compare masking
   - Check all masked fields in both versions

---

## Known Issues to Address

### Design Issues (Suspected)
- [ ] KPI card styling may differ (borders, padding)
- [ ] Chart containers sizing inconsistent
- [ ] Table row heights different
- [ ] Badge styling differs
- [ ] Collapsible header styling
- [ ] Tab underline styling
- [ ] Hero strip layout
- [ ] Section title styling

### Data Issues (Suspected)
- [ ] Renda+ 2065 display format
- [ ] HODL11 display (value vs PnL)
- [ ] Currency formatting (R$ placement)
- [ ] Percentage formatting (+/- prefixes)
- [ ] Date formatting
- [ ] Table column order
- [ ] Decimal precision

### Component Issues (Suspected)
- [ ] Missing legend labels on charts
- [ ] Tooltip format differences
- [ ] Axis labels on charts
- [ ] Grid lines on charts
- [ ] Color schemes on charts
- [ ] Section headers/titles

---

## Success Criteria

### Design Fidelity
- ✅ All colors match (HEX/HSL values identical)
- ✅ Typography identical (font size, weight, spacing)
- ✅ Component sizing matches exactly
- ✅ Responsive behavior identical at all breakpoints
- ✅ No visual discrepancies on side-by-side comparison

### Data Fidelity
- ✅ All fields displayed in same format
- ✅ Calculations produce same results
- ✅ Numbers formatted identically (currency, %age, decimals)
- ✅ Tables show same columns in same order
- ✅ Charts render with same data source

### Behavioral Fidelity
- ✅ Tab navigation responsive (same speed)
- ✅ Collapsible animations match (timing, easing)
- ✅ Form validation identical
- ✅ Privacy mode masking consistent
- ✅ Simulator parameter constraints match

---

## Deliverables

### Audit Report
- Visual differences documented (screenshots + annotations)
- Data differences documented (field mapping + calculations)
- Behavioral differences documented (interaction specs)
- Priority matrix (critical fixes vs nice-to-haves)

### Alignment Plan
- Step-by-step instructions for each fix
- Code locations to modify
- Testing strategy for each fix
- Estimated effort per fix

### Implementation (TBD)
- Execute fixes in order of priority
- Validate each fix against HTML baseline
- Final side-by-side comparison to confirm fidelity

---

## Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|------------|
| Phase 1: Visual Audit | 1-2 days | Design divergence report |
| Phase 2: Data Audit | 1-2 days | Data divergence report + field mapping |
| Phase 3: Behavioral Audit | 1 day | Interaction spec comparison |
| **Audit Total** | **3-5 days** | **Complete audit report** |
| Implementation | TBD | Fixes applied in priority order |

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Major design refactor needed | High | Medium | Audit may reveal significant work |
| Data recalculation required | High | Low | Most calculations working correctly |
| Responsive breakpoint overhaul | Medium | Medium | Breakpoints already validated (T3-03) |
| Chart data source mismatch | Medium | Low | Charts rendering correctly in validation |

---

## Next Steps

1. **Audit Phase 1**: Visual comparison (screenshots, colors, typography)
2. **Audit Phase 2**: Data verification (field mapping, calculations)
3. **Audit Phase 3**: Behavioral testing (interactions, responsiveness)
4. **Report**: Document all findings
5. **Plan**: Prioritize fixes
6. **Implement**: Execute fixes (separate issue/sprint)

---

**Created**: 2026-04-15  
**Status**: Awaiting approval to begin audit  
**Owner**: TBD (Dev team)
