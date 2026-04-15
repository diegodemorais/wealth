# ABA-5-RETIRO Visual Patterns & Layout Reference

---

## 1. SPENDING GUARDRAILS BAR — Zone Layout

### Current DOM Structure
```
<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <h2>Spending Guardrails — P(FIRE) × Custo de Vida</h2>
  
  <!-- KPI row: P(FIRE) + status -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <div style="font-size:2rem;font-weight:800;color:var(--green)">90.4%</div>
    <div>
      <div style="font-size:.85rem;font-weight:600;color:var(--green)">🟢 No caminho certo</div>
      <div style="font-size:.7rem;color:var(--muted)">P(FIRE) atual · spending R$250k/ano</div>
    </div>
  </div>
  
  <!-- Bar container (position:relative for absolute children) -->
  <div style="position:relative;margin-bottom:36px">
    
    <!-- Zones inside overflow:hidden container -->
    <div style="position:relative;height:36px;border-radius:8px;overflow:hidden">
      <div style="position:absolute;left:0;width:17.2%;background:rgba(59,130,246,.15)"></div>     <!-- Blue zone -->
      <div style="position:absolute;left:17.2%;width:22.8%;background:rgba(34,197,94,.2)"></div>   <!-- Green zone -->
      <div style="position:absolute;left:40%;width:43.2%;background:rgba(234,179,8,.15)"></div>    <!-- Yellow zone -->
      <div style="position:absolute;left:83.2%;width:16.8%;background:rgba(249,115,22,.15)"></div> <!-- Orange zone -->
    </div>
    
    <!-- Markers OUTSIDE overflow:hidden (positioned absolute on outer container) -->
    <!-- Marker 1: Blue threshold (~R$193k = 95%) -->
    <div style="position:absolute;left:17.2%;top:0;width:2px;height:36px;background:#3b82f6;z-index:2">
      <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);font-size:.55rem;...">
        ~R$193k (~95%)
      </div>
    </div>
    
    <!-- Marker 2: Current spending (R$250k = 90.4%) — GREEN CIRCLE -->
    <div style="position:absolute;left:40%;top:0;z-index:4;transform:translateX(-50%)">
      <div style="width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid #0f172a;margin-top:13px;"></div>
      <div style="position:absolute;top:6px;left:calc(100% + 6px);white-space:nowrap;font-size:.6rem;font-weight:700;color:var(--green);">
        R$250k<br>90.4%
      </div>
    </div>
    
    <!-- Marker 3: Yellow threshold (~R$358k = 80%) -->
    <div style="position:absolute;left:83.2%;top:0;width:2px;height:36px;background:var(--yellow);z-index:2">
      <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);font-size:.55rem;...">
        ~R$358k (~80%)
      </div>
    </div>
    
    <!-- Marker 4: Red threshold (~R$458k = 70%) -->
    <div style="position:absolute;left:100%;top:0;width:2px;height:36px;background:var(--red);z-index:2">
      <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);font-size:.55rem;...">
        ~R$458k (~70%)
      </div>
    </div>
  </div>
</div>
```

### Visual Layout (Actual Render)
```
90.4%                          [emoji] 🟢 No caminho certo
                               P(FIRE) atual · spending R$250k/ano

┌─────────────────────────────────────────────────────────────────────────────┐
│ Blue zone │ Green zone │ Yellow zone (main) │ Orange zone │ Red zone (none) │
│ (17.2%)   │  (22.8%)   │ (43.2%)            │  (16.8%)    │   (0%)          │
│━━━━━━━━━━━│━━━━━━━━━━━━│━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━━━━━│                 │
└─────────────────────────────────────────────────────────────────────────────┘
  ↓ marker     ↓ current (green circle)     ↓ threshold     ↓ threshold
~R$193k                    ◉ R$250k         ~R$358k        ~R$458k
(95%)                      (90.4%)           (80%)          (70%)
```

### Zone Mapping
| Position | Zone | Width | Color | Meaning |
|----------|------|-------|-------|---------|
| 0%–17.2% | Blue | 17.2% | `rgba(59,130,246,.15)` | Below lower threshold |
| 17.2%–40% | Green | 22.8% | `rgba(34,197,94,.2)` | Safe zone (current) |
| 40%–83.2% | Yellow | 43.2% | `rgba(234,179,8,.15)` | Caution zone |
| 83.2%–100% | Orange | 16.8% | `rgba(249,115,22,.15)` | Warning zone |
| (>100% would be Red, not shown) | Red | 0% | `rgba(239,68,68,.2)` | Critical |

### Current Marker (Green Circle)
- **Position:** 40% left
- **Size:** 10px diameter
- **Border:** 2px solid #0f172a (dark)
- **Background:** var(--green) = #22c55e
- **Label:** R$250k / 90.4% (positioned right of circle, .6rem font)
- **Z-index:** 4 (highest, above markers)

### Threshold Markers
- **Type:** Vertical 2px line
- **Height:** 36px (bar height)
- **Z-index:** 2 (above zones, below current marker)
- **Labels:** Positioned below bar (top: 40px), centered via translateX(-50%)
- **Font:** .55rem muted gray

---

## 2. SWR PERCENTILS — 3-Card Grid

### HTML Structure
```html
<div class="section tab-hidden" data-in-tab="retiro" id="swrPercentilesSection">
  <h2>SWR no FIRE Day — Percentis P10 / P50 / P90</h2>
  <div class="swr-pct-grid" id="swrPercentilesCards">
    
    <!-- Card 1: P10 (Pessimista) — RED border -->
    <div class="swr-pct-card p10">
      <div class="spl">P10 — Pessimista</div>
      <div class="spv pv">3.66%</div>
      <div class="spsub pv">R$6.83M em 2040</div>
      <div style="font-size:.6rem;color:var(--muted);margin-top:4px;">
        Poucos recursos → SWR alta (mais exigência do portfólio)
      </div>
    </div>
    
    <!-- Card 2: P50 (Mediana) — YELLOW border -->
    <div class="swr-pct-card p50">
      <div class="spl">P50 — Mediana</div>
      <div class="spv pv">2.17%</div>
      <div class="spsub pv">R$11.53M em 2040</div>
      <div style="font-size:.6rem;color:var(--muted);margin-top:4px;">
        Cenário base (trajetória mediana do MC)
      </div>
    </div>
    
    <!-- Card 3: P90 (Otimista) — GREEN border -->
    <div class="swr-pct-card p90">
      <div class="spl">P90 — Otimista</div>
      <div class="spv pv">1.32%</div>
      <div class="spsub pv">R$18.92M em 2040</div>
      <div style="font-size:.6rem;color:var(--muted);margin-top:4px;">
        Maior patrimônio → SWR baixa (carteira confortável)
      </div>
    </div>
  </div>
</div>
```

### Visual Layout (Desktop 1200px+)
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ P10 — Pessimista    │ P50 — Mediana       │ P90 — Otimista      │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ 3.66%               │ 2.17%               │ 1.32%               │
│ R$6.83M em 2040     │ R$11.53M em 2040    │ R$18.92M em 2040    │
│ Poucos recursos...  │ Cenário base...     │ Maior patrimônio... │
│ [3px RED left]      │ [3px YELLOW left]   │ [3px GREEN left]    │
└─────────────────────┴─────────────────────┴─────────────────────┘

Gap: 10px
Grid: repeat(auto-fit, minmax(130px, 1fr))
```

### Responsive Behavior
```
1200px+:  [Card1] [Card2] [Card3]              (3-column)
900–1200: [Card1] [Card2]                      (2-column, 3rd wraps)
          [Card3]
768–900:  [Card1] [Card2]                      (2-column via media query)
          [Card3]
<768:     [Card1]                              (1-column)
          [Card2]
          [Card3]
```

### CSS
```css
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
  border-left: 3px solid var(--muted);  /* default gray */
}

.swr-pct-card.p10 { border-left-color: var(--red); }      /* #ef4444 */
.swr-pct-card.p50 { border-left-color: var(--yellow); }   /* #eab308 */
.swr-pct-card.p90 { border-left-color: var(--green); }    /* #22c55e */
```

---

## 3. SPENDING BREAKDOWN — 3-Category Cards

### Visual Layout
```
┌────────────────────────────┐  ┌────────────────────────────┐  ┌────────────────────────────┐
│ 🔴 Essenciais              │  │ 🔵 Discricionários         │  │ 🟡 Imprevistos            │
├────────────────────────────┤  ├────────────────────────────┤  ├────────────────────────────┤
│ R$15.074 /mês              │  │ R$4.284 /mês               │  │ R$363 /mês                 │
│ 76% do total               │  │ 22% do total               │  │ 2% do total                │
│ ████████████████████│      │  │ ██████│                    │  │ ██│                        │
│ Inclui principal hipoteca..│  │ Discricionários cortáveis..│  │ Gifts e pontuais..         │
│ [BG: rgba(239,68,68,.08)]  │  │ [BG: rgba(59,130,246,.08)] │  │ [BG: rgba(234,179,8,.08)] │
└────────────────────────────┘  └────────────────────────────┘  └────────────────────────────┘

Gap: 10px
Grid: repeat(auto-fit, minmax(130px, 1fr))

┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ R$19.721/mês                   R$250k/ano                    ✅ R$13k/ano buffer         │
│ Total real · R$237k/ano        Modelo FIRE                   vs. modelo                    │
│ [BG: var(--card2)]             [BG: var(--card2)]            [BG: var(--card2)]           │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mini Bar Pattern
```html
<div class="spend-cat-bar" style="background:rgba(239,68,68,.5);width:76%"></div>
```

### Card Structure
```html
<div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:12px;text-align:center">
  <!-- 1. Title -->
  <div style="font-size:.6rem;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">
    Essenciais
  </div>
  <!-- 2. Value (privacy mask capable) -->
  <div class="pv" style="font-size:1.4rem;font-weight:700;color:var(--red)">R$15.074</div>
  <!-- 3. Subtitle -->
  <div style="font-size:.65rem;color:var(--muted)">/mês · 76% do total</div>
  <!-- 4. Mini progress bar -->
  <div class="spend-cat-bar" style="background:rgba(239,68,68,.5);width:76%"></div>
  <!-- 5. Description -->
  <div style="font-size:.6rem;color:var(--muted);margin-top:4px">
    Inclui principal hipoteca (R$1.517/mês = equity)
  </div>
</div>
```

### Colors by Category
| Category | BG Color | Border Color | Text Color | Bar Fill |
|----------|----------|--------------|-----------|----------|
| Essenciais | `rgba(239,68,68,.08)` | `rgba(239,68,68,.25)` | `var(--red)` | `rgba(239,68,68,.5)` |
| Discricionários | `rgba(59,130,246,.08)` | `rgba(59,130,246,.25)` | `var(--accent)` | `rgba(59,130,246,.5)` |
| Imprevistos | `rgba(234,179,8,.08)` | `rgba(234,179,8,.25)` | `var(--yellow)` | `rgba(234,179,8,.5)` |

---

## 4. BOND POOL — Progress Bar + Composition Table

### Visual Layout
```
Bond Pool — 0.8 / 7 anos de gastos
┌──────────────────────────────────────────────────────────┐
│ ██████│                                                  │  11%
│ gradient green→cyan                                      │
│                                                          │
│ Valor atual         │ Meta (7 anos)                      │
│ R$ 211k             │ R$ 1.750k                          │
│                                                          │
│ Cobertura atual     │ Status                             │
│ 0.8 anos            │ Em construção                      │
└──────────────────────────────────────────────────────────┘

Composição atual
┌─────────────────────────────────────┐
│ IPCA+ 2040    │ R$ 113k  │ 6% meta │
│ IPCA+ 2050    │ R$ 12k   │ 1% meta │
│ IPCA+ 2029    │ R$ 87k   │ 5% meta │
├─────────────────────────────────────┤
│ Total         │ R$ 211k  │12% meta │  (bold/accent color)
└─────────────────────────────────────┘
```

### CSS
```css
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

.bond-pool-card {
  background: var(--card2);
  border-radius: 8px;
  padding: 14px;
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

.bond-pool-card .bp-val {
  font-weight: 600;
}
```

### 2-Col Layout
```html
<div class="dynamic-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;font-size:.75rem">
  <div class="bp-row"><span>Valor atual</span><span class="bp-val pv">R$ 211k</span></div>
  <div class="bp-row"><span>Meta (7 anos)</span><span class="bp-val pv">R$ 1750k</span></div>
  <div class="bp-row"><span>Cobertura atual</span><span class="bp-val">0.8 anos</span></div>
  <div class="bp-row"><span>Status</span><span class="bp-val" style="color:var(--yellow)">Em construção</span></div>
</div>
```

---

## 5. GUARDRAILS TABLE — Row-by-Row Coloring

### Visual Layout
```
Guardrails de Retirada — FIRE Day

┌────────────────┬───────────┬─────────────────────┬───────────────────────┬────────────────────────┐
│ Drawdown       │ Corte     │ Retirada Anual      │ Patrimônio Gatilho    │ Status                 │
├────────────────┼───────────┼─────────────────────┼───────────────────────┼────────────────────────┤
│ 🟢 0–15%       │ —         │ R$ 250.000          │ ATUAL ✓               │ Normal — sem corte     │
│ [BG green]     │           │ [pv]                │ [pv, bold green]      │                        │
├────────────────┼───────────┼─────────────────────┼───────────────────────┼────────────────────────┤
│ 🟡 15–25%      │ 10%       │ R$ 225.000          │ R$ 3053k (−15%)       │ Corte 10% → R$225k   │
│ [BG yellow]    │           │ [pv]                │ [pv]                  │                        │
├────────────────┼───────────┼─────────────────────┼───────────────────────┼────────────────────────┤
│ 🟠 25–35%      │ 20%       │ R$ 200.000          │ R$ 2694k (−25%)       │ Corte 20% → R$200k   │
│ [BG orange]    │           │ [pv]                │ [pv]                  │                        │
├────────────────┼───────────┼─────────────────────┼───────────────────────┼────────────────────────┤
│ 🔴 >35%        │ 28%       │ R$ 180.000          │ R$ 2335k (−35%)       │ Piso — R$180k         │
│ [BG red]       │           │ [pv]                │ [pv]                  │                        │
└────────────────┴───────────┴─────────────────────┴───────────────────────┴────────────────────────┘

Special: Row 1 also has outline: rgba(34, 197, 94, 0.5) solid 2px
```

### Row Background Colors
```css
/* Default row: transparent */
tr { background: transparent; }

/* Row 1: Green current status (outline emphasis) */
tr:nth-child(2) { 
  background: rgba(34, 197, 94, 0.1); 
  outline: rgba(34, 197, 94, 0.5) solid 2px;
}

/* Row 2: Yellow caution */
tr:nth-child(3) { background: rgba(234, 179, 8, 0.08); }

/* Row 3: Orange warning */
tr:nth-child(4) { background: rgba(249, 115, 22, 0.08); }

/* Row 4: Red critical */
tr:nth-child(5) { background: rgba(239, 68, 68, 0.1); }
```

---

## 6. INCOME PROJECTION CHART — Spending Smile Phases

### Timeline
```
2026──────2040─────────────2065────────────2077
│         │                 │              │
Age 39   Age 53 (FIRE)    Age 65         Age 87
                         (INSS start)

Go-Go Phase     Slow-Go Phase    No-Go Phase
(high spending) (moderate spend) (low spend)
```

### Canvas Configuration
```html
<div class="chart-box-xl">
  <canvas id="incomeProjectionChart" 
    style="display: block; height: 380px; width: 1214px;" 
    width="2428" height="760"></canvas>
</div>
```

### Dimensions
- **Display:** 1214px × 380px
- **Render:** 2428px × 760px (2× for crisp text)
- **Container:** `position: relative; height: 380px; min-width: 0; overflow: hidden`

### Chart Lines
| Line | Color | Meaning | Behavior |
|------|-------|---------|----------|
| Renda Ativa | Blue? | Pre-FIRE income R$45k/mês | Horizontal 2026–2040 |
| Go-Go | Green? | High spending phase | Declining from R$250k baseline |
| Slow-Go | Yellow? | Moderate spending | Further decline |
| No-Go | Red? | Low/zero spending | Floor near INSS only |
| INSS | Gray? | Retirement income | Horizontal from 2065 onward |

---

## 7. INCOME PHASES — DCA Cascade Visual

### Cascade Display Pattern
```
Cascade — aporte R$25.0k (≈ $4998)

1. IPCA+ longo — 7.07% ≥ piso 6% · janela ativa
   → R$25.0k (TD 2040 80% + TD 2050 20%) · gap restante: −8.4pp

   ▸ Renda+ e Equity aguardam IPCA+ atingir alvo de 15%
   
(If any overflow above the gap, would flow to next level in cascade)
```

### Income Phase Card Pattern (Implicit)
```html
<!-- Pattern from CSS: .income-phase -->
<div class="income-phase" style="border-left:3px solid var(--accent);...">
  [phase info]
</div>
```

```css
.income-phase {
  border-left: 3px solid var(--accent);
  padding: 8px 12px;
  margin: 6px 0;
  background: rgba(59,130,246,.05);
  border-radius: 0 6px 6px 0;
  font-size: 0.8rem;
}
```

---

## 8. COLLAPSIBLE SECTIONS — Interaction Pattern

### HTML Pattern
```html
<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <h2 onclick="_toggleBlock(this.parentElement)">
    Title ▸
  </h2>
  <div class="collapse-body" style="display:none">
    <!-- Hidden by default -->
  </div>
</div>
```

### CSS State
```css
.collapsible .collapse-body { display: none; }
.collapsible.open .collapse-body { display: block; }

.collapsible h2::after { content: ' ▸'; }
.collapsible.open h2::after { content: ' ▾'; }

.collapsible h2 { cursor: pointer; user-select: none; }
```

### JS Handler
```javascript
function _toggleBlock(element) {
  element.classList.toggle('open');
}
```

---

## Key Spacing & Sizing

| Element | Value | Notes |
|---------|-------|-------|
| Section gap (vertical) | 14px | margin-bottom: 14px |
| Card gap (horizontal) | 10px | grid gap: 10px |
| Tight gap (inside card) | 4px | bp-row gap for 2-col |
| Padding (inside card) | 12px–14px | Standard card padding |
| Bar height (Guardrails) | 36px | Comfortable touch target |
| Bar height (Bond Pool) | 20px | Subtle, secondary metric |
| Marker line width | 2px | Thin, readable |
| Border-left | 3px | Semantic color accent |
| Chart height (XL) | 380px | Income projection |
| Chart height (SM) | 180px | Bond runway |

---

## Privacy Mode (.pv)

All numeric values are masked in privacy mode:
```html
<div class="pv" id="heroPatrimonioBrl">R$3.59M</div>
<!-- Renders as: ••••• in privacy mode -->
```

Classes applied to:
- KPI values (patrimônio, anos, aporte)
- Card values (SWR, spending, bond amount)
- Table numeric columns
- Chart labels (if applicable)

---

## Summary: DOM Nesting Pattern

```
<div class="section tab-hidden" data-in-tab="retiro">
  <h2>Section Title [+ onclick if collapsible]</h2>
  
  [Optional: collapsible marker ▸/▾]
  [Optional: KPI row above main content]
  
  <div class="collapse-body"> [if collapsible, display:none by default]
    <!-- Grid / Table / Chart / Cards -->
  </div>
</div>
```

All RETIRO sections follow this pattern for consistency.

---

## Confirmed Tech Stack

- **Framework:** Vanilla HTML5 + CSS3 (no Shadow DOM)
- **Charts:** Chart.js 4 (canvas-based)
- **Responsive:** CSS Grid `repeat(auto-fit, minmax(..., 1fr))` + media queries
- **Colors:** CSS custom properties (`--red`, `--green`, `--yellow`, etc.)
- **Privacy:** Class-based masking (`.pv` → CSS hides, JS transforms)
- **Interactivity:** Vanilla JS (onclick handlers, classList.toggle)
- **Accessibility:** Semantic HTML, tab structure via `data-in-tab` + JS

---

## Build Checklist for ABA-5-RETIRO Components

- [ ] **Spending Guardrails Bar:** 5 zones + 4 markers + current circle marker
- [ ] **SWR Percentils:** 3 cards, `auto-fit` grid, colored left borders
- [ ] **Spending Breakdown:** 3 cards, mini progress bars, summary row
- [ ] **Bond Pool:** 2-col tight grid + gradient bar + composition table
- [ ] **Guardrails Table:** 4 rows, row background colors, green outline on row 1
- [ ] **Income Projection Chart:** Canvas 2428×760, 3 phase lines, INSS addition at 65
- [ ] **Bond Runway Chart:** Canvas 1214×360 (180px display)
- [ ] **Collapsible sections:** All guardrails/spending details toggle-able
- [ ] **Privacy mode:** All numeric values ready for `.pv` masking
- [ ] **Responsive:** Test <768px single-column, 768–1200px 2-col, 1200px+ 3-col

