# ABA-5-RETIRO Design Audit — Complete Documentation

**Status:** ✓ COMPLETE CAPTURE  
**Source:** `/analysis/raw/DashHTML.html` (v0.1.43)  
**Target Build:** v0.1.44+ (DashHTML → Component Code-First)  
**QA Protocol:** Playwright mandatory before push

---

## 📋 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| **ABA-5-RETIRO-DESIGN-AUDIT.md** | Complete component inventory, CSS patterns, typography, colors, spacing | Dev, Designer |
| **ABA-5-RETIRO-VISUAL-PATTERNS.md** | ASCII diagrams, DOM nesting, layout breakpoints, responsive grid specs | Dev, Frontend |
| **ABA-5-RETIRO-IMPLEMENTATION-CHECKLIST.md** | Data binding schema, JS hooks, testing checklist, build/deploy steps | Dev, QA |
| **README-ABA5-RETIRO.md** | This file — quick navigation and summary | Everyone |

---

## 🎯 Components at a Glance

### 1. Spending Guardrails Bar (F2)
**Type:** Horizontal visualization  
**Key Feature:** 5 color zones + current marker (green circle)  
**Dimensions:** 36px height, full width  
**Responsive:** Yes, maintains zones at all widths  
**Priority:** HIGH

### 2. SWR Percentils Cards (R2)
**Type:** 3-card grid  
**Key Feature:** P10/P50/P90, auto-fit responsive, colored left borders  
**Dimensions:** `repeat(auto-fit, minmax(130px, 1fr))` gap: 10px  
**Responsive:** 3-col (1200px+) → 2-col → 1-col (<768px)  
**Priority:** HIGH

### 3. Spending Breakdown Cards (F5)
**Type:** 3-category grid + summary row  
**Key Feature:** Essential/Discretionary/Unplanned, mini progress bars  
**Dimensions:** Same grid as SWR  
**Responsive:** Same breakpoints  
**Priority:** HIGH

### 4. Guardrails Table (R1)
**Type:** Data table, 4 drawdown tiers  
**Key Feature:** Row background colors, green outline on current row  
**Dimensions:** Full width, .78rem font  
**Responsive:** Scrolls horizontally on narrow screens  
**Priority:** MEDIUM

### 5. Bond Pool Progress (F6)
**Type:** Progress bar + composition table  
**Key Feature:** Gradient fill (green→cyan), 2-col tight grid  
**Dimensions:** Bar 20px height, table .75rem font  
**Responsive:** 2-col tightens but doesn't collapse  
**Priority:** MEDIUM

### 6. Income Projection Chart (F1)
**Type:** Chart.js canvas  
**Key Feature:** 3 spending phases (Go-Go/Slow-Go/No-Go), INSS addition at age 65  
**Dimensions:** 380px height, 2428×760 render  
**Responsive:** Maintains aspect, responsive canvas  
**Priority:** MEDIUM

### 7. Bond Runway Chart (F8)
**Type:** Chart.js canvas  
**Key Feature:** Post-FIRE drawdown, 7-year runway  
**Dimensions:** 180px height, 2428×360 render  
**Responsive:** Responsive canvas  
**Priority:** LOW

---

## 🎨 Design System

### Color Palette
```
--green:    #22c55e (rgb(34, 197, 94))      Safe, positive, P90
--yellow:   #eab308 (rgb(234, 179, 8))      Caution, P50
--orange:   #f97316 (rgb(249, 115, 22))     Warning
--red:      #ef4444 (rgb(239, 68, 68))      Critical, P10
--cyan:     #06b6d4 (rgb(6, 182, 212))      Bond pool accent
--accent:   #3b82f6 (rgb(59, 130, 246))     Blue, discretionary, markers
--muted:    (secondary text, borders)
--card2:    (light gray card background)
```

### Typography Scale
```
2.2rem / 2rem  - Hero KPI values (green 90.4%)
1.4rem         - Card values (SWR %, spending amounts)
1.2rem         - Section headers (h2)
0.8rem         - Card titles, code
0.75rem        - Table body, labels
0.72rem        - Footnotes
0.68rem        - Small labels
0.65rem        - Subtitles, descriptions
0.6rem         - Marker labels, meta
0.55rem        - Fine print
```

### Spacing Standard
```
14px  - Section vertical gap (margin-bottom)
12px  - Card padding
10px  - Grid gap (horizontal)
8px   - Component internal spacing
6px   - Border-radius (cards, bars)
4px   - Tight grid gap (inside 2-col)
3px   - Left border width (semantic accent)
2px   - Marker line width
```

---

## 🔧 Technical Stack

- **HTML5:** Semantic, no Shadow DOM, tab structure via `data-in-tab`
- **CSS3:** Custom properties, Grid `repeat(auto-fit)`, RGBA overlays
- **JavaScript:** Vanilla (onclick handlers, classList.toggle)
- **Charts:** Chart.js 4 (canvas-based, responsive)
- **Responsive:** CSS Grid + media queries (768px, 900px, 1200px)
- **Privacy:** `.pv` class-based masking

---

## 📱 Responsive Breakpoints

| Width | Layout | Notes |
|-------|--------|-------|
| 1200px+ | 3-column grids | Full desktop, all cards side-by-side |
| 768–1200px | 2-column grids | Tablet, some cards wrap |
| <768px | 1-column | Mobile, full-width cards, single-col tables |

---

## ✅ QA Checklist (Pre-Push)

### 1. Schema Validation
```bash
python scripts/validate_schema.py
# Expected: ✓ PASS
```

### 2. HTML Render
```bash
# Manual: Load dashboard, switch to Retirada tab
# Expected: All 7 components visible, no 404s, no console errors
```

### 3. Playwright Suite
```bash
./scripts/quick_dashboard_test.sh
# Expected: 
#   ✓ Schema Validation PASS
#   ✓ HTML Render Check PASS
#   ✓ Component Render Status: 62+/66
#   ✓ Dashboard Test Suite: 557+/559
#   ✓ Playwright Validation PASS
#   
#   RESULT: DEPLOY APPROVED
```

### 4. Manual Testing
- [ ] Desktop (1200px): 3-col grids visible
- [ ] Tablet (768px): 2-col grids
- [ ] Mobile (<768px): 1-col cards, readable
- [ ] Privacy mode: Numeric values masked (••••)
- [ ] Collapsible: Headers toggle correctly
- [ ] Charts: Responsive, no white space
- [ ] No visual regressions vs v0.1.43

---

## 📊 Data Schema

### Minimal data.json Structure
```json
{
  "retiro": {
    "bondPool": {
      "valor_atual_r": 211000,
      "meta_7anos_r": 1750000,
      "cobertura_anos": 0.8,
      "composicao": [...]
    },
    "swrPercentils": {
      "p10": { "pct": 3.66, "patrimonio_2040_r": 6830000 },
      "p50": { "pct": 2.17, "patrimonio_2040_r": 11530000 },
      "p90": { "pct": 1.32, "patrimonio_2040_r": 18920000 }
    },
    "spendingBreakdown": {
      "essenciais_mes_r": 15074,
      "discricionarios_mes_r": 4284,
      "imprevistos_mes_r": 363,
      "total_mes_r": 19721,
      "total_ano_r": 237000,
      "modelo_fire_r": 250000,
      "buffer_r": 13000
    },
    "guardrails": [
      { "drawdown_range": "0–15%", "retirada_r": 250000, "status": "ATUAL ✓" },
      ...
    ],
    "spendingGuardrails": {
      "pfire_atual_pct": 90.4,
      "spending_r": 250000,
      "zones": [...],
      "markers": [...]
    },
    "incomeProjection": {
      "years": [2026, 2027, ..., 2077],
      "series": [
        { "name": "Go-Go Spending", "data": [...], "color": "green" },
        ...
      ]
    }
  }
}
```

---

## 🚀 Build & Deploy Flow

```
1. Read documentation (this repo)
   ↓
2. Integrate components into dashboard build
   - Update dashboard/build_dashboard.py or index.html
   - Add data binding from data.json
   ↓
3. Test locally
   - python scripts/validate_schema.py
   - ./scripts/quick_dashboard_test.sh
   ↓
4. Git commit & push
   - git add [files]
   - git commit -m "feat: ABA-5-RETIRO components..."
   - git push origin main
   ↓
5. CI/Deploy
   - GitHub Actions runs full test suite
   - Deploys to production if PASS
   ↓
6. Post-deploy verification
   - Load dashboard in browser
   - Verify Retirada tab renders
   - Check Privacy mode
```

---

## 📝 File Index

```
/analysis/
├── raw/
│   └── DashHTML.html                    [Source: v0.1.43 rendered HTML]
├── ABA-5-RETIRO-DESIGN-AUDIT.md         [Main reference doc]
├── ABA-5-RETIRO-VISUAL-PATTERNS.md      [ASCII diagrams & layouts]
├── ABA-5-RETIRO-IMPLEMENTATION-CHECKLIST.md  [Build tasks]
└── README-ABA5-RETIRO.md                [This file]
```

---

## 🎓 Key Takeaways

1. **DashHTML.html is the source of truth** — All 7 components captured with exact CSS
2. **Auto-fit responsive grids** — No fixed 2/3-col; uses `repeat(auto-fit, minmax(...))`
3. **RGBA zone overlays** — 5 transparent color bands for guardrails, zones sum to 100%
4. **Gradient fills** — Bond pool uses `linear-gradient(90deg, green, cyan)`
5. **Absolute positioning for markers** — Lines + labels outside `overflow:hidden` container
6. **Collapsible pattern** — `.collapsible` class + `.collapse-body` toggle via JS
7. **Privacy mode ready** — All numeric values use `.pv` class for masking
8. **Chart.js responsive** — Canvas upscaled 2× for crisp rendering
9. **Semantic left borders** — 3px colored left border groups related items
10. **Consistent spacing** — 10px grid gap, 12–14px card padding, 14px section gap

---

## ⚠️ Common Pitfalls

- ❌ Hard-coding zone widths → Use percentages from spec
- ❌ Forgetting `z-index` layering → Markers must be above zones but below current marker
- ❌ Missing `overflow: hidden` on bar → Zones won't round corners properly
- ❌ Not applying `min-width: 0` to grid children → May prevent responsive collapse
- ❌ Forgetting `.pv` class on numeric values → Privacy mode breaks
- ❌ Not testing <768px breakpoint → Mobile layout may fail
- ❌ Hardcoding chart dimensions → Use responsive canvas scaling

---

## 📞 Support

For build issues:
1. Check schema: `python scripts/validate_schema.py`
2. Run tests: `./scripts/quick_dashboard_test.sh`
3. Review Playwright output: `dashboard/tests/last_run.json`
4. Escalate to **Dev** team

---

**Last Updated:** 2026-04-15  
**Format:** Markdown (GitHub-compatible)  
**Version:** v0.1.44-prep
