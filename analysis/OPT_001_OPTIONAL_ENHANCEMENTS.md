# OPT-001: Optional Enhancements (Post-MVP)

**Status**: Backlog  
**Priority**: 🟢 Low  
**Created**: 2026-04-15  
**Target**: v0.1.140+

---

## Overview

Collection of optional enhancements and refinements to dashboard. These do not block MVP release or parity with DashHTML v2.77. Prioritized for future sprints.

---

## Enhancements

### 1. Performance Optimization

**Objective**: Lighthouse score >90 on all metrics

**Tasks**:
- [ ] Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
- [ ] Code splitting for ECharts (lazy load chart JS)
- [ ] Image optimization (SVG icons, data URIs)
- [ ] CSS minification + tree-shaking
- [ ] JavaScript bundle analysis
- [ ] Network waterfall optimization
- [ ] Caching strategy for `/data.json`

**Estimated Effort**: 2-3 days  
**Dependencies**: None

---

### 2. Privacy Mode Refinement

**Current State**: Basic toggle, ••• masking in CSS/React  
**Enhancement**: Advanced privacy features

**Tasks**:
- [ ] Blur entire dashboard on toggle (fade-in animation)
- [ ] Keyboard shortcut for privacy mode (e.g., Cmd+P)
- [ ] Auto-lock after 5 min inactivity
- [ ] Watermark "DEMO" when privacy mode enabled
- [ ] Exclude sensitive fields from print (print CSS)
- [ ] Screenshot warning when sharing

**Estimated Effort**: 1-2 days  
**Dependencies**: Tarefa 2 (Privacy Mode Unificada) from Plan

---

### 3. Chart Interactivity

**Current State**: Static ECharts visualization  
**Enhancement**: Advanced user interactions

**Tasks**:
- [ ] Tooltip formatting customization
- [ ] Click-to-drill-down on chart segments (Sankey → detailed cash flow)
- [ ] Crosshair tooltips (synchronized across linked charts)
- [ ] Chart legend toggle (show/hide series)
- [ ] Date range picker for time-series charts
- [ ] Export chart as PNG/SVG
- [ ] Data export as CSV

**Estimated Effort**: 3-4 days  
**Dependencies**: None (can be done independently)

---

### 4. Responsive Landscape Orientation

**Current State**: Portrait-optimized  
**Enhancement**: Landscape mode for phones

**Tasks**:
- [ ] Add explicit `@media (orientation: landscape)` rules
- [ ] Optimize layout for 480px × 854px (common landscape)
- [ ] Test on iPhone SE, Samsung Galaxy A12 in landscape
- [ ] Horizontal scrolling prevention for landscape
- [ ] Chart height adjustments for landscape

**Estimated Effort**: 1 day  
**Dependencies**: T3-03 (Responsive Refinement) — COMPLETE

---

### 5. Fluid Typography

**Current State**: Fixed rem-based sizes  
**Enhancement**: Responsive font scaling

**Tasks**:
- [ ] Implement `clamp()` for fluid typography
- [ ] Scale body font-size between 12px (480px) and 16px (1920px)
- [ ] Scale heading font-sizes proportionally
- [ ] Test readability at all sizes
- [ ] Remove hardcoded breakpoint font size changes

**Pattern**:
```css
font-size: clamp(0.875rem, 0.8rem + 1.5vw, 1.2rem);
```

**Estimated Effort**: 0.5 days  
**Dependencies**: None

---

### 6. Dark/Light Theme Toggle

**Current State**: Dark-only theme (CSS vars set to dark colors)  
**Enhancement**: Light theme support

**Tasks**:
- [ ] Create light theme CSS vars (--bg-light, --text-light, etc.)
- [ ] Add theme toggle button to header
- [ ] Persist theme selection to localStorage
- [ ] System preference detection (`prefers-color-scheme`)
- [ ] Test contrast ratios (WCAG AA/AAA)
- [ ] Smooth transition animation between themes

**Estimated Effort**: 1-2 days  
**Dependencies**: None

---

### 7. Accessibility (A11y) Improvements

**Current State**: Semantic HTML, aria-labels in primitives  
**Enhancement**: Full WCAG 2.1 AA compliance

**Tasks**:
- [ ] Run axe DevTools audit
- [ ] Add aria-live regions for real-time updates
- [ ] Tab order verification
- [ ] Color contrast audit (1.4.3, 1.4.11)
- [ ] Focus indicators on all interactive elements
- [ ] Keyboard navigation for charts (tabbing through data points)
- [ ] Heading hierarchy audit

**Estimated Effort**: 1-2 days  
**Dependencies**: None

---

### 8. Data Export & Reporting

**Current State**: View-only dashboard  
**Enhancement**: Export capabilities

**Tasks**:
- [ ] Export full dashboard as PDF (with privacy option)
- [ ] Export data tables as CSV/XLSX
- [ ] Scheduled email reports (weekly/monthly)
- [ ] Custom report builder (select sections)
- [ ] Print-friendly stylesheet

**Estimated Effort**: 2-3 days  
**Dependencies**: None (can add print CSS quickly)

---

### 9. Real-Time Data Streaming

**Current State**: Static `/data.json` fetch on page load  
**Enhancement**: Live updates

**Tasks**:
- [ ] WebSocket connection to data server
- [ ] Real-time price updates (HODL11, FX rates)
- [ ] Live portfolio valuation refreshes
- [ ] Update notifications ("Portfolio +0.5% today")
- [ ] Offline fallback to cached data

**Estimated Effort**: 2-3 days  
**Dependencies**: Backend support for WebSockets

---

### 10. Mobile App (Progressive Web App)

**Current State**: Web-only  
**Enhancement**: Installable PWA

**Tasks**:
- [ ] Create `manifest.json`
- [ ] Add service worker for offline support
- [ ] Installable to home screen
- [ ] Push notifications for portfolio alerts
- [ ] App shell caching strategy
- [ ] Update notifications when dashboard changes

**Estimated Effort**: 2 days  
**Dependencies**: None

---

### 11. Sankey Chart Customization

**Current State**: Fixed flows (aporte → IPCA/Equity/Renda+/Crypto)  
**Enhancement**: Interactive Sankey

**Tasks**:
- [ ] Hover to highlight flow path
- [ ] Click node to drill-down to sub-flows
- [ ] Show percentage labels on flows
- [ ] Animate flows on load
- [ ] Configurable flow sources (IPCA vs DCA vs organic growth)

**Estimated Effort**: 1-2 days  
**Dependencies**: None

---

### 12. Multi-User Support (Admin Panel)

**Current State**: Single-user dashboard  
**Enhancement**: Multi-user with role-based access

**Tasks**:
- [ ] User authentication (SSO / Oauth)
- [ ] Role-based access control (View Only / Editor / Admin)
- [ ] Audit log (who changed what, when)
- [ ] Multiple portfolio views (personal + family scenarios)
- [ ] Admin dashboard for data management

**Estimated Effort**: 3-4 days  
**Dependencies**: Backend authentication system

---

---

## Priority Matrix

| # | Feature | Effort | Impact | Priority |
|---|---------|--------|--------|----------|
| 1 | Performance | 2-3d | High | 🟡 Medium |
| 2 | Privacy Mode Refinement | 1-2d | Medium | 🟢 Low |
| 3 | Chart Interactivity | 3-4d | High | 🟡 Medium |
| 4 | Landscape Orientation | 1d | Low | 🟢 Low |
| 5 | Fluid Typography | 0.5d | Low | 🟢 Low |
| 6 | Light Theme | 1-2d | Medium | 🟡 Medium |
| 7 | Accessibility | 1-2d | High | 🟡 Medium |
| 8 | Data Export | 2-3d | Medium | 🟡 Medium |
| 9 | Real-Time Streaming | 2-3d | High | 🟡 Medium |
| 10 | PWA | 2d | Low | 🟢 Low |
| 11 | Sankey Customization | 1-2d | Low | 🟢 Low |
| 12 | Multi-User | 3-4d | High | 🔴 High |

---

## Recommended Order

**Phase 1 (Quick Wins - 2-3 days)**:
1. Landscape Orientation (1d)
2. Fluid Typography (0.5d)
3. Privacy Mode Refinement (1-2d)

**Phase 2 (High-Impact - 4-5 days)**:
4. Accessibility Audit (1-2d)
5. Chart Interactivity (3-4d)

**Phase 3 (Advanced - 3-4 days)**:
6. Performance Optimization (2-3d)
7. Data Export (2-3d, parallel)

**Phase 4 (Post-Release)**:
8. Light Theme (1-2d)
9. Real-Time Streaming (2-3d)
10. PWA (2d)
11. Multi-User (3-4d)

---

## Notes

- **No blocking**: These tasks do not block MVP release
- **Backlog**: Can be added to roadmap for post-release sprints
- **Community**: Some items (dark theme, accessibility) are high-value low-effort
- **Effort estimates**: Based on Next.js + React + ECharts experience
- **Dependencies**: Most are independent; a few require backend support

---

**Prepared**: 2026-04-15  
**For Review**: Diego de Morais  
**Status**: Ready for future sprint planning
