# ABA-5-RETIRO Implementation Checklist

**Phase 0-3 Status:** Dashboard v0.1.43 — Production Ready  
**Target Version:** v0.1.44+ Components (Code-first from DashHTML.html)  
**QA Protocol:** Mandatory Playwright validation via `./scripts/quick_dashboard_test.sh`

---

## Component Inventory

### Core Components (7 Total)

| # | Component | Type | Priority | Status | Notes |
|---|-----------|------|----------|--------|-------|
| 1 | **Spending Guardrails Bar** | Visualization | HIGH | ✓ Captured | 5 zones, 4 markers, green circle current marker |
| 2 | **SWR Percentils Cards** | Cards Grid | HIGH | ✓ Captured | P10/P50/P90, auto-fit responsive, colored borders |
| 3 | **Spending Breakdown Cards** | Cards Grid | HIGH | ✓ Captured | Essential/Discretionary/Unplanned, mini bars, summary row |
| 4 | **Guardrails Table** | Data Table | MEDIUM | ✓ Captured | 4 drawdown tiers, row-colored, green outline on current |
| 5 | **Bond Pool Progress** | Progress Bar | MEDIUM | ✓ Captured | Gradient fill green→cyan, composition table, runway chart |
| 6 | **Income Projection Chart** | Chart.js | MEDIUM | ✓ Captured | 3 spending phases (Go-Go/Slow-Go/No-Go), INSS addition, 380px |
| 7 | **Bond Runway Chart** | Chart.js | LOW | ✓ Captured | Compact 180px, projection post-FIRE |

---

## DOM Structure Template

### Retiro Tab Main Container
```html
<!-- TAB: Retirada (RETIRO) -->
<div class="section tab-hidden" data-in-tab="retiro" id="bondPoolSection">
  <!-- 1. Bond Pool — Proteção SoRR -->
</div>

<div class="section tab-hidden" data-in-tab="retiro" id="swrPercentilesSection">
  <!-- 2. SWR Percentils -->
</div>

<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <!-- 3. Guardrails Table (Drawdown Cortes) -->
</div>

<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <!-- 4. Spending Guardrails Bar (P(FIRE) × Custo) -->
</div>

<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <!-- 5. Spending Breakdown (Essential/Discretionary) -->
</div>

<div class="section tab-hidden" data-in-tab="retiro">
  <!-- 6. Income Projection Chart (Ciclo de Vida) -->
</div>

<div class="section tab-hidden" data-in-tab="retiro">
  <!-- Bond Runway Chart (dentro ou após Income Projection) -->
</div>
```

---

## CSS Rules Required

### 1. Color Palette (Verify in :root or existing)
```css
:root {
  --green: #22c55e;      /* rgb(34, 197, 94) */
  --yellow: #eab308;     /* rgb(234, 179, 8) */
  --orange: #f97316;     /* rgb(249, 115, 22) */
  --red: #ef4444;        /* rgb(239, 68, 68) */
  --cyan: #06b6d4;       /* rgb(6, 182, 212) */
  --accent: #3b82f6;     /* rgb(59, 130, 246) — blue */
  --card2: /* light gray background */
  --muted: /* secondary text */
  --text: /* primary text */
  --border: /* subtle divider */
  --bg: /* page background */
}
```

### 2. Component-Specific Classes
```css
/* ── Bond Pool ── */
.bond-pool-card {
  background: var(--card2);
  border-radius: 8px;
  padding: 14px;
}

.bond-pool-bar {
  position: relative;
  height: 20px;
  background: var(--card2);
  border-radius: 6px;
  overflow: hidden;
  margin: 10px 0;
}

.bond-pool-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--green), var(--cyan));
  transition: width 0.3s;
}

.bond-pool-card .bp-title {
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.bond-pool-card .bp-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  padding: 2px 0;
}

/* ── SWR Percentils ── */
.swr-pct-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.swr-pct-card {
  background: var(--card2);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border-left: 3px solid var(--muted);
}

.swr-pct-card.p10 { border-left-color: var(--red); }
.swr-pct-card.p50 { border-left-color: var(--yellow); }
.swr-pct-card.p90 { border-left-color: var(--green); }

/* ── Spending Breakdown ── */
.spend-cat-bar {
  height: 10px;
  border-radius: 5px;
  margin: 4px 0;
}

/* ── Guardrails Table ── */
.guardrail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}

.guardrail-table tr:nth-child(2) { background: rgba(34, 197, 94, 0.1); }
.guardrail-table tr:nth-child(3) { background: rgba(234, 179, 8, 0.08); }
.guardrail-table tr:nth-child(4) { background: rgba(249, 115, 22, 0.08); }
.guardrail-table tr:nth-child(5) { background: rgba(239, 68, 68, 0.1); }

/* ── Chart Containers ── */
.chart-box-xl {
  position: relative;
  height: 380px;
  min-width: 0;
  overflow: hidden;
}

.chart-box-sm {
  position: relative;
  height: 180px;
  min-width: 0;
  overflow: hidden;
}

/* ── Collapsible ── */
.collapsible .collapse-body { display: none; }
.collapsible.open .collapse-body { display: block; }
.collapsible h2::after { content: ' ▸'; }
.collapsible.open h2::after { content: ' ▾'; }

/* ── Responsive Media Queries ── */
@media (max-width: 768px) {
  [style*="grid-template-columns:1fr 1fr"] {
    grid-template-columns: 1fr !important;
  }
  [style*="grid-template-columns:repeat("] {
    grid-template-columns: 1fr !important;
  }
}
```

---

## Data Binding Requirements

### Data Source: data.json

Each component needs structured data from `agentes/contexto/data.json`:

#### 1. Bond Pool
```json
{
  "retiro": {
    "bondPool": {
      "valor_atual_r": 211000,
      "meta_7anos_r": 1750000,
      "cobertura_anos": 0.8,
      "status": "Em construção",
      "composicao": [
        {"titulo": "IPCA+ 2040", "valor_r": 113000, "pct_meta": 6},
        {"titulo": "IPCA+ 2050", "valor_r": 12000, "pct_meta": 1},
        {"titulo": "IPCA+ 2029", "valor_r": 87000, "pct_meta": 5}
      ]
    }
  }
}
```

#### 2. SWR Percentils
```json
{
  "retiro": {
    "swrPercentils": {
      "p10": {
        "pct": 3.66,
        "patrimonio_2040_r": 6830000
      },
      "p50": {
        "pct": 2.17,
        "patrimonio_2040_r": 11530000
      },
      "p90": {
        "pct": 1.32,
        "patrimonio_2040_r": 18920000
      }
    }
  }
}
```

#### 3. Spending Breakdown
```json
{
  "retiro": {
    "spendingBreakdown": {
      "essenciais_mes_r": 15074,
      "essenciais_pct": 76,
      "discricionarios_mes_r": 4284,
      "discricionarios_pct": 22,
      "imprevistos_mes_r": 363,
      "imprevistos_pct": 2,
      "total_mes_r": 19721,
      "total_ano_r": 237000,
      "modelo_fire_r": 250000,
      "buffer_r": 13000
    }
  }
}
```

#### 4. Guardrails
```json
{
  "retiro": {
    "guardrails": [
      {
        "drawdown_range": "0–15%",
        "corte_pct": 0,
        "retirada_r": 250000,
        "patrimonioGatilho_r": null,
        "status": "ATUAL ✓"
      },
      {
        "drawdown_range": "15–25%",
        "corte_pct": 10,
        "retirada_r": 225000,
        "patrimonioGatilho_r": 3053000,
        "status": "Corte 10%"
      },
      /* ... */
    ]
  }
}
```

#### 5. Spending Guardrails Bar
```json
{
  "retiro": {
    "spendingGuardrails": {
      "pfire_atual_pct": 90.4,
      "status": "🟢 No caminho certo",
      "spending_r": 250000,
      "zones": [
        {"name": "Blue (low)", "start_pct": 0, "end_pct": 17.2, "color": "rgba(59,130,246,.15)"},
        {"name": "Green (safe)", "start_pct": 17.2, "end_pct": 40, "color": "rgba(34,197,94,.2)"},
        {"name": "Yellow (caution)", "start_pct": 40, "end_pct": 83.2, "color": "rgba(234,179,8,.15)"},
        {"name": "Orange (warn)", "start_pct": 83.2, "end_pct": 100, "color": "rgba(249,115,22,.15)"}
      ],
      "markers": [
        {"position_pct": 17.2, "label": "~R$193k (~95%)", "color": "#3b82f6"},
        {"position_pct": 40, "label": "R$250k (90.4%)", "color": "var(--green)", "type": "circle"},
        {"position_pct": 83.2, "label": "~R$358k (~80%)", "color": "var(--yellow)"},
        {"position_pct": 100, "label": "~R$458k (~70%)", "color": "var(--red)"}
      ]
    }
  }
}
```

#### 6. Income Projection (Chart Data)
```json
{
  "retiro": {
    "incomeProjection": {
      "years": [2026, 2027, ..., 2077],
      "series": [
        {
          "name": "Go-Go Spending",
          "data": [250000, 245000, ...],
          "color": "green"
        },
        {
          "name": "Slow-Go Spending",
          "data": [250000, 240000, ...],
          "color": "yellow"
        },
        {
          "name": "No-Go Spending",
          "data": [250000, 220000, ...],
          "color": "red"
        },
        {
          "name": "INSS",
          "data": [0, 0, ..., 18000, 18000, ...],  /* starts at age 65 (year 2052) */
          "color": "gray"
        }
      ]
    }
  }
}
```

---

## JavaScript Hooks

### 1. Collapsible Toggle Handler
```javascript
function _toggleBlock(element) {
  element.classList.toggle('open');
}
```

Usage:
```html
<h2 onclick="_toggleBlock(this.parentElement)">Title</h2>
```

### 2. Privacy Mode Masking
Already implemented globally — all `.pv` elements masked via CSS or JS.

### 3. Data Population Pattern
For each component:
```javascript
// 1. Select container
const container = document.getElementById('swrPercentilesCards');

// 2. Get data from window.dashboardData or imported module
const swrData = window.dashboardData?.retiro?.swrPercentils;

// 3. Populate via innerHTML or createElement
container.innerHTML = `
  <div class="swr-pct-card p10">
    <div class="spl">P10 — Pessimista</div>
    <div class="spv pv">${swrData.p10.pct}%</div>
    <div class="spsub pv">R$${swrData.p10.patrimonio_2040_r.toLocaleString('pt-BR')} em 2040</div>
    ...
  </div>
`;
```

### 4. Chart.js Initialization (for Income & Runway)
```javascript
const incomeCtx = document.getElementById('incomeProjectionChart').getContext('2d');
const incomeChart = new Chart(incomeCtx, {
  type: 'line',
  data: {
    labels: window.dashboardData?.retiro?.incomeProjection?.years,
    datasets: window.dashboardData?.retiro?.incomeProjection?.series
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // ... standard Chart.js config
  }
});
```

---

## Testing Checklist

### Unit Tests (by Component)

#### 1. Spending Guardrails Bar
- [ ] Zone widths sum to 100%
- [ ] Marker positions match data (17.2%, 40%, 83.2%, 100%)
- [ ] Current marker (green circle) renders at correct position
- [ ] Labels positioned correctly (bottom offset)
- [ ] Z-index layering correct (zones < markers < current)
- [ ] Responsive: bar remains full-width at all breakpoints

#### 2. SWR Percentils
- [ ] Grid responsive: 3-col (1200px), 2-col (768px), 1-col (<768px)
- [ ] Cards have colored left borders (red, yellow, green)
- [ ] Text content matches data
- [ ] Privacy mode masks numeric values
- [ ] Gap: 10px consistent

#### 3. Spending Breakdown
- [ ] 3 cards render with correct colors
- [ ] Mini bars width matches data percentage
- [ ] Summary row below cards shows totals
- [ ] Responsive: 3-col → 2-col → 1-col
- [ ] Background colors correct (.08 opacity)

#### 4. Guardrails Table
- [ ] 4 rows render with correct background colors
- [ ] First row (green) has outline
- [ ] Numeric columns right-aligned, tabular-nums applied
- [ ] Privacy mode masks values
- [ ] Collapsible state toggles correctly

#### 5. Bond Pool
- [ ] Bar gradient smooth (green→cyan)
- [ ] Fill width matches percentage (11%)
- [ ] 2-col grid tight (gap: 4px)
- [ ] Table rows align correctly
- [ ] Composition percentages sum to total

#### 6. Income Projection Chart
- [ ] Canvas renders at 380px height
- [ ] 3 spending phase lines visible
- [ ] INSS line starts at age 65 (2052)
- [ ] Axes labeled correctly
- [ ] Responsive: maintains aspect on resize

#### 7. Bond Runway Chart
- [ ] Canvas renders at 180px height
- [ ] Data points show runway decline
- [ ] Legend visible (if applicable)

### Integration Tests

- [ ] All sections render under `data-in-tab="retiro"`
- [ ] Tab switching shows/hides RETIRO correctly
- [ ] Collapsible sections toggle independently
- [ ] Privacy mode applied uniformly across all numeric values
- [ ] No console errors on tab load

### Visual Regression Tests (Playwright)

```bash
./scripts/quick_dashboard_test.sh
```

Expected:
- Schema validation: ✓ PASS
- HTML render check: ✓ PASS
- Component render status: 62/66 (or higher after RETIRO)
- Dashboard test suite: 557+/559+ tests
- Playwright validation: No visual regressions

---

## Build & Deploy

### 1. Code Integration
```bash
# Ensure all RETIRO components integrated in dashboard/build_dashboard.py
# or dashboard/index.html (if static)

# Validate schema compliance
python scripts/validate_schema.py

# Build dashboard with new components
python dashboard/build_dashboard.py

# Or if static: ensure index.html includes all RETIRO sections
```

### 2. QA Protocol (MANDATORY)
```bash
# Full test suite before push
./scripts/quick_dashboard_test.sh

# Expected output:
# ✓ Schema Validation PASS
# ✓ HTML Render Check PASS
# ✓ Component Render Status: 62+/66 ✓
# ✓ Dashboard Test Suite: 557+/559 ✓
# ✓ Playwright Validation PASS
# 
# RESULT: DEPLOY APPROVED
```

### 3. Git Commit & Push
```bash
# Stage all changes
git add dashboard/index.html agentes/contexto/data.json scripts/ ...

# Commit with standard message
git commit -m "feat: ABA-5-RETIRO components — Phase 0-4 (v0.1.44)

- Bond Pool: progress bar + composition table
- SWR Percentils: P10/P50/P90 cards
- Spending Breakdown: Essential/Discretionary/Unplanned
- Guardrails: Drawdown table + spending bar
- Income Projection: Spending smile lifecycle chart
- Bond Runway: Post-FIRE drawdown visualization

All components tested via Playwright suite (PASS)."

# Push to trigger CI/deploy
git push origin main
```

### 4. Post-Deploy Verification
- [ ] Dashboard loads without errors (inspect DevTools console)
- [ ] All RETIRO sections visible under "Retirada" tab
- [ ] Charts render (check Network tab for no 404s)
- [ ] Privacy mode works (numeric values obfuscated)
- [ ] Mobile responsive: test on <768px breakpoint
- [ ] No visual regressions vs v0.1.43

---

## Acceptance Criteria

### Functional
- [x] All 7 components from DashHTML.html captured
- [ ] Components integrated into main dashboard build
- [ ] Data binding implemented (data.json → render)
- [ ] Privacy mode applied to all numeric values
- [ ] Collapsible sections functional
- [ ] Charts render via Chart.js (responsive)

### Visual
- [ ] Colors match design (RGBA zones, gradients)
- [ ] Spacing consistent (gap: 10px, padding: 12–14px)
- [ ] Responsive breakpoints tested (<768px, 768–1200px, 1200px+)
- [ ] No visual regressions vs Phase 0-3
- [ ] Font sizes readable (.55rem to 2rem scale)

### Technical
- [ ] Schema validation: PASS
- [ ] HTML render check: PASS
- [ ] Component render status: 62+/66
- [ ] Dashboard test suite: 557+/559
- [ ] Playwright validation: PASS
- [ ] No console errors

### Documentation
- [ ] Design audit captured (ABA-5-RETIRO-DESIGN-AUDIT.md)
- [ ] Visual patterns documented (ABA-5-RETIRO-VISUAL-PATTERNS.md)
- [ ] Implementation checklist complete (this file)

---

## Known Limitations & Gaps

1. **Income Projection Chart Data Structure:** Confirm spending smile algorithm (Go-Go/Slow-Go/No-Go decline rates)
2. **Bond Runway Algorithm:** Verify drawdown calculation post-FIRE
3. **Guardrails Thresholds:** Confirm patrimônio-gatilho calculations match Monte Carlo
4. **Privacy Mode Timing:** Ensure `.pv` CSS rule loaded before DOM render (no flashing)
5. **Chart.js Library:** Confirm Chart.js 4 included in `dashboard/index.html` or build process

---

## Version Control

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1.43 | 2026-04-15 | ✓ Stable | Phase 0-3 final, DashHTML.html extracted |
| 0.1.44 | TBD | ⏳ In Progress | ABA-5-RETIRO components, QA pending |

---

## Contact & Escalation

If build/deploy issues arise:
1. Check schema validation output: `python scripts/validate_schema.py`
2. Run full test suite: `./scripts/quick_dashboard_test.sh`
3. Review Playwright failures in `dashboard/tests/last_run.json`
4. Escalate to **Dev** team for Chart.js or responsive issues

