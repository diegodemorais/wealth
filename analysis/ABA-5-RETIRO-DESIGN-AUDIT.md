# ABA-5-RETIRO Design Audit

Status: **COMPLETE CAPTURE** — Income Phases, Guardrails, Spending Breakdown, Rebalancing, Bond Pool

---

## Components Overview

| Nome | Type | Layout | Grid Type | Colors | Font Size | Status |
|------|------|--------|-----------|--------|-----------|--------|
| **Bond Pool Card** | card | 2-col | `1fr 1fr` gap:4px | green/cyan gradient | .75rem | ✓ Full width bar + table |
| **SWR Percentis** | 3-card grid | flex/grid | `repeat(auto-fit, minmax(130px, 1fr))` | p10=red, p50=yellow, p90=green | 1rem title, .6rem sub | ✓ Border-left colored |
| **Guardrails Table** | table + bar | full-width | `<table>` styled rows | green/yellow/orange/red | .78rem body, headers | ✓ Row background colors |
| **Spending Guardrails Bar** | horizontal bar | `position:relative` | full-width | 3-zone gradient | .6rem markers | ✓ Absolute positioned zones |
| **Spending Breakdown** | 3-card grid | flex/grid | `repeat(auto-fit, minmax(130px, 1fr))` | red/blue/yellow | 1.4rem title, .65rem sub | ✓ Auto-fit responsive |
| **Income Projection Chart** | canvas chart | `chart-box-xl` | 100% width | multi-line (RGB based) | — | ✓ 380px height |
| **Lifetime Income Phases** | 3-card inline | flex | inline via DCA cascade | colored borders per phase | .8rem | ✓ Border-left 3px |

---

## 1. BOND POOL — Proteção SoRR

### Structure
```html
<div class="section tab-hidden" id="bondPoolSection" data-in-tab="retiro">
  <h2>Bond Pool Readiness — Proteção SoRR</h2>
  <div id="bondPoolBody">
    <div class="bond-pool-card">
      <div class="bp-title">Bond Pool — 0.8 / 7 anos de gastos</div>
      <div class="bond-pool-bar">
        <div class="bond-pool-fill" style="width:11%"></div>
      </div>
      <div class="dynamic-2col" style="grid-template-columns:1fr 1fr;gap:4px;font-size:.75rem">
        <!-- 4 rows: Valor atual, Meta, Cobertura, Status -->
      </div>
    </div>
    <table><!-- Composição: IPCA+ 2040, 2050, 2029, Total --></table>
  </div>
</div>
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
```

### Design Notes
- **Bar height:** 20px (subtly larger than Heatmap bars)
- **Fill gradient:** green→cyan (represents liquidity flow over time)
- **2-col grid:** `gap: 4px` (tight) — labels vs values
- **Table styling:** `.75rem`, `border-collapse: collapse`, alternating rows with `border-bottom: 1px solid rgba(71,85,105,.25)`
- **Status color:** yellow (`var(--yellow)`) for "Em construção"
- **No breakpoint collapse** — 2-col tight enough for mobile

---

## 2. SWR PERCENTILS — P10/P50/P90

### Structure
```html
<div class="section tab-hidden" data-in-tab="retiro" id="swrPercentilesSection">
  <h2>SWR no FIRE Day — Percentis P10 / P50 / P90</h2>
  <div class="swr-pct-grid" id="swrPercentilesCards">
    <div class="swr-pct-card p10">
      <div class="spl">P10 — Pessimista</div>
      <div class="spv pv">3.66%</div>
      <div class="spsub pv">R$6.83M em 2040</div>
      <div style="font-size:.6rem;...">Poucos recursos...</div>
    </div>
    <div class="swr-pct-card p50"> ... </div>
    <div class="swr-pct-card p90"> ... </div>
  </div>
</div>
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
  border-left: 3px solid var(--muted);  /* default */
}
.swr-pct-card.p10 { border-left-color: var(--red); }      /* #ef4444 */
.swr-pct-card.p50 { border-left-color: var(--yellow); }   /* #eab308 */
.swr-pct-card.p90 { border-left-color: var(--green); }    /* #22c55e */
```

### Design Notes
- **Grid:** `auto-fit` responsive — 3-col on 1200px+, 2-col ~768px, 1-col <500px
- **Minmax:** 130px (enough for "P90 — Otimista" + value)
- **Gap:** 10px
- **Card borders:** Left 3px colored — consistent with income phase pattern
- **Typography:**
  - Title (`.spl`): `.75rem`
  - Value (`.spv`): likely 1.2–1.4rem, weight 700
  - Subtitle (`.spsub`): `.65rem` below value
  - Description: `.6rem` muted, margin-top: 4px

---

## 3. GUARDRAILS TABLE — FIRE Day Spending Thresholds

### Structure
```html
<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <h2 onclick="_toggleBlock(this.parentElement)">Guardrails de Retirada — FIRE Day</h2>
  <div class="collapse-body">
    <table class="guardrail-table">
      <thead>
        <tr>
          <th>Drawdown</th><th>Corte</th><th>Retirada Anual</th><th>Patrimônio Gatilho</th><th>Status</th>
        </tr>
      </thead>
      <tbody id="guardrailsBody">
        <tr style="background: rgba(34, 197, 94, 0.1); outline: rgba(34, 197, 94, 0.5) solid 2px;">
          <td>🟢 0–15%</td><td>—</td><td class="num pv">R$ 250.000</td><td class="num pv"><strong>ATUAL ✓</strong></td><td>Normal — sem corte</td>
        </tr>
        <tr style="background: rgba(234, 179, 8, 0.1);">
          <td>🟡 15–25%</td><td>10%</td><td class="num pv">R$ 225.000</td><td class="num pv">R$ 3053k (−15%)</td><td>Corte 10%</td>
        </tr>
        <tr style="background: rgba(249, 115, 22, 0.1);">
          <td>🟠 25–35%</td><td>20%</td><td class="num pv">R$ 200.000</td><td class="num pv">R$ 2694k (−25%)</td><td>Corte 20%</td>
        </tr>
        <tr style="background: rgba(239, 68, 68, 0.15);">
          <td>🔴 >35%</td><td>28%</td><td class="num pv">R$ 180.000</td><td class="num pv">R$ 2335k (−35%)</td><td>Piso</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### CSS
```css
.guardrail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}
.guardrail-table tr:nth-child(2) { background: rgba(34, 197, 94, 0.1); }
.guardrail-table tr:nth-child(3) { background: rgba(234, 179, 8, 0.08); }
.guardrail-table tr:nth-child(4) { background: rgba(249, 115, 22, 0.08); }
.guardrail-table tr:nth-child(5) { background: rgba(239, 68, 68, 0.1); }
```

### Design Notes
- **Type:** Standard `<table>` — not a fancy bar visualization in this section
- **Row colors:** RGBA backgrounds matching emoji color scheme
- **Inline outline:** Green row has `outline: rgba(34, 197, 94, 0.5) solid 2px` (current status emphasis)
- **Classes:** `.num` for numeric columns (likely `text-align: right; font-variant-numeric: tabular-nums`)
- **Collapsible:** Section tagged `collapsible` — header onclick toggles collapse-body
- **Green row:** Explicit inline style `background: rgba(34, 197, 94, 0.1); outline: ...`

---

## 4. SPENDING GUARDRAILS BAR — 3-Zone Horizontal

### Structure
```html
<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <h2 onclick="_toggleBlock(this.parentElement)">Spending Guardrails — P(FIRE) × Custo de Vida</h2>
  <div class="collapse-body">
    <div id="spendingGuardrailsViz">
      <!-- KPI: P(FIRE) 90.4% with indicator -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="font-size:2rem;font-weight:800;color:var(--green)">90.4%</div>
        <div>
          <div style="font-size:.85rem;font-weight:600;color:var(--green)">🟢 No caminho certo</div>
          <div style="font-size:.7rem;color:var(--muted)">P(FIRE) atual · spending R$250k/ano</div>
        </div>
      </div>
      
      <!-- Main bar: 5 absolute-positioned zones -->
      <div style="position:relative;margin-bottom:36px">
        <div style="position:relative;height:36px;border-radius:8px;overflow:hidden">
          <!-- Zone 1: Blue low (~17.2%) -->
          <div style="position:absolute;left:0;width:17.2%;height:100%;background:rgba(59,130,246,.15)"></div>
          <!-- Zone 2: Green safe (~22.8%) -->
          <div style="position:absolute;left:17.2%;width:22.8%;height:100%;background:rgba(34,197,94,.2)"></div>
          <!-- Zone 3: Yellow caution (~43.2%) -->
          <div style="position:absolute;left:40%;width:43.2%;height:100%;background:rgba(234,179,8,.15)"></div>
          <!-- Zone 4: Orange warn (~16.8%) -->
          <div style="position:absolute;left:83.2%;width:16.799999999999997%;height:100%;background:rgba(249,115,22,.15)"></div>
          <!-- Zone 5: Red critical (0% — would need spending > range) -->
          <div style="position:absolute;left:100%;width:0%;height:100%;background:rgba(239,68,68,.2)"></div>
        </div>
        
        <!-- Markers: vertical lines + labels (OUTSIDE overflow:hidden) -->
        <div style="position:absolute;left:17.2%;top:0;width:2px;height:36px;background:#3b82f6;z-index:2">
          <div style="position:absolute;top:40px;...">~R$193k (~95%)</div>
        </div>
        <div style="position:absolute;left:40%;top:0;z-index:4;transform:translateX(-50%)">
          <div style="width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid #0f172a;margin-top:13px;"></div>
          <div style="position:absolute;top:6px;left:calc(100% + 6px);...">R$250k<br>90.4%</div>
        </div>
        <div style="position:absolute;left:83.2%;top:0;width:2px;height:36px;background:var(--yellow);z-index:2">
          <div style="position:absolute;top:40px;...">~R$358k (~80%)</div>
        </div>
        <div style="position:absolute;left:100%;top:0;width:2px;height:36px;background:var(--red);z-index:2">
          <div style="position:absolute;top:40px;...">~R$458k (~70%)</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### CSS Pattern
```css
/* Main bar container — allows absolute positioning outside overflow */
/* Bar itself has overflow:hidden to round zone edges */
/* Markers positioned absolutely outside, with z-index:2 for visibility */

/* Zones: RGBA semi-transparent colors */
rgba(59,130,246,.15)   /* Blue: low spend threshold */
rgba(34,197,94,.2)     /* Green: safe zone */
rgba(234,179,8,.15)    /* Yellow: caution zone */
rgba(249,115,22,.15)   /* Orange: warning zone */
rgba(239,68,68,.2)     /* Red: critical (empty) */

/* Current marker: green circle, diameter 10px, border 2px solid #0f172a */
/* Marker lines: width 2px, full height (36px) */
```

### Design Notes
- **Height:** 36px (comfortable tap/view target)
- **Border-radius:** 8px on container (NOT zones individually — they stack within)
- **Zone widths:** 17.2% + 22.8% + 43.2% + 16.8% = 100%
- **Current marker (R$250k):** Green circle + text label to right
- **Threshold markers:** Vertical 2px lines at 17.2%, 83.2%, 100% with top-40px labels
- **Text styling:** `.55rem` or `.6rem` for marker labels, positioned `absolute` relative to parent
- **P(FIRE) display:** Large 2rem bold green text + status line above bar

---

## 5. SPENDING BREAKDOWN — Essential vs Discretionary

### Structure
```html
<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <h2 onclick="_toggleBlock(this.parentElement)">Spending — Essenciais vs. Discricionários</h2>
  <div class="collapse-body">
    <div id="spendingBreakdownBody">
      <!-- 3-card grid: red/blue/yellow -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin-bottom:14px">
        
        <!-- Card 1: Essenciais (red) -->
        <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:.6rem;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Essenciais</div>
          <div class="pv" style="font-size:1.4rem;font-weight:700;color:var(--red)">R$15.074</div>
          <div style="font-size:.65rem;color:var(--muted)">/mês · 76% do total</div>
          <div class="spend-cat-bar" style="background:rgba(239,68,68,.5);width:76%"></div>
          <div style="font-size:.6rem;color:var(--muted);margin-top:4px">Inclui principal hipoteca...</div>
        </div>
        
        <!-- Card 2: Discricionários (blue) -->
        <div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:.6rem;color:var(--accent);text-transform:uppercase;...">Discricionários</div>
          <div class="pv" style="font-size:1.4rem;font-weight:700;color:var(--accent)">R$4.284</div>
          <div style="font-size:.65rem;color:var(--muted)">/mês · 22% do total</div>
          <div class="spend-cat-bar" style="background:rgba(59,130,246,.5);width:22%"></div>
          <div style="font-size:.6rem;color:var(--muted);margin-top:4px">Discricionários cortáveis</div>
        </div>
        
        <!-- Card 3: Imprevistos (yellow) -->
        <div style="background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.25);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:.6rem;color:var(--yellow);text-transform:uppercase;...">Imprevistos</div>
          <div class="pv" style="font-size:1.4rem;font-weight:700;color:var(--yellow)">R$363</div>
          <div style="font-size:.65rem;color:var(--muted)">/mês · 2% do total</div>
          <div class="spend-cat-bar" style="background:rgba(234,179,8,.5);width:3%"></div>
          <div style="font-size:.6rem;color:var(--muted);margin-top:4px">Gifts e pontuais</div>
        </div>
      </div>
      
      <!-- Summary row: totals -->
      <div style="background:var(--card2);border-radius:8px;padding:12px;display:grid;grid-template-columns:repeat(auto-fit, minmax(120px, 1fr));gap:12px;text-align:center">
        <div>
          <div class="pv" style="font-size:1.1rem;font-weight:700">R$19.721/mês</div>
          <div class="pv" style="font-size:.65rem;color:var(--muted)">Total real · R$237k/ano</div>
        </div>
        <div>
          <div class="pv" style="font-size:1.1rem;font-weight:700;color:var(--muted)">R$250k/ano</div>
          <div style="font-size:.65rem;color:var(--muted)">Modelo FIRE</div>
        </div>
        <div>
          <div class="pv" style="font-size:1.1rem;font-weight:700;color:var(--green)">✅ R$13k/ano</div>
          <div style="font-size:.65rem;color:var(--muted)">Buffer vs. modelo</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### CSS
```css
.spend-cat-bar {
  height: 10px;
  border-radius: 5px;
  margin: 4px 0;
}
```

### Design Notes
- **Grid:** `repeat(auto-fit, minmax(130px, 1fr))` — responsive 3-col / 2-col / 1-col
- **Card backgrounds:** `.08` opacity, borders `.25` opacity (subtle)
- **Colors:**
  - Red: `rgba(239,68,68,.08)` bg, `var(--red)` text
  - Blue: `rgba(59,130,246,.08)` bg, `var(--accent)` text
  - Yellow: `rgba(234,179,8,.08)` bg, `var(--yellow)` text
- **Title:** `.6rem` uppercase, letter-spacing: .5px
- **Value:** 1.4rem bold, colored
- **Subtitle:** `.65rem` muted
- **Mini bar:** 10px height, 5px border-radius, background .5 opacity version of color, variable width (76%, 22%, 3%)
- **Summary section:** Dark card background, 3-value grid below cards
- **Gap:** 10px between cards

---

## 6. INCOME PROJECTION CHART (F1)

### Structure
```html
<div class="section tab-hidden" data-in-tab="retiro">
  <h2>Projeção de Renda — Ciclo de Vida (2026–2077)</h2>
  <div class="chart-box-xl">
    <canvas id="incomeProjectionChart" style="box-sizing: border-box; display: block; height: 380px; width: 1214px;" width="2428" height="760"></canvas>
  </div>
  <div style="margin-top:8px;padding:6px 10px;background:rgba(59,130,246,.06);border-radius:6px;border-left:3px solid var(--accent);font-size:.72rem">
    Todos os valores em R$ reais (constante 2026). Pré-FIRE: renda ativa R$45k/mês · Pós-FIRE: spending smile...
  </div>
</div>
```

### CSS
```css
.chart-box-xl {
  position: relative;
  height: 380px;
  min-width: 0;
  overflow: hidden;
}
```

### Design Notes
- **Height:** 380px (larger chart for prominence)
- **Canvas aspect:** 2428×760 (2× render, downscaled to 1214×380)
- **Axes:** Time (x) = 2026–2077; Income (y) = R$ real
- **Lines:** 3 spending phases (Go-Go/Slow-Go/No-Go) + INSS addition at age 65
- **Footnote:** Blue border-left, light blue background, .72rem text

---

## 7. GUARDRAILS TABLE UPSIDE CALLOUT

```html
<div style="margin-top:10px;font-size:.75rem;background:rgba(34,197,94,.07);border-radius:6px;padding:8px;border-left:3px solid var(--green)">
  <strong>Upside:</strong> se portfolio sobe 25%+ acima do pico real → aumentar retirada 10% permanente (teto R$350k)
</div>
```

### Design Notes
- **Background:** `.07` opacity green tint
- **Border-left:** 3px solid green
- **Font:** `.75rem`, bold label
- **Rounded corners:** 6px

---

## 8. BOND POOL RUNWAY CHART (F8)

### Structure
```html
<div id="bondPoolRunwayChartWrap" style="margin-top: 14px; display: block;">
  <div style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">
    Runway do Bond Pool pós-FIRE (sem DCA futuro adicional)
  </div>
  <div class="chart-box-sm">
    <canvas id="bondPoolRunwayChart" style="box-sizing: border-box; display: block; height: 180px; width: 1214px;" width="2428" height="360"></canvas>
  </div>
  <p id="bondPoolRunwayNota" class="chart-footnote"></p>
</div>
```

### CSS
- **Height:** 180px (compact)
- **Title:** `.72rem` uppercase, muted gray
- **Footnote class:** `.chart-footnote` (likely similar to income chart)

---

## Responsive Breakpoints

### Media Queries (from CLAUDE.md dashboard test suite)

```css
@media (max-width: 768px) {
  /* Collapse 2+ col grids to 1 col */
  .grid-2, .swr-pct-grid, .dynamic-2col {
    grid-template-columns: 1fr !important;
  }
  
  /* Override inline styles */
  [style*="grid-template-columns:1fr 1fr"] {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 900px) {
  /* Reduce grid minmax values */
  #macroStrip, #monthlyRetStats, ... {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)) !important;
  }
}
```

### Breakpoint Behavior
- **1200px+:** 3 cards in SWR grid, spending breakdown side-by-side
- **768px–900px:** 2 cards per row, then 1 card
- **<768px:** Single column, full-width cards
- **<480px:** Hero strip switches to 2-col (from 4-col)

---

## Color Palette

| Name | Hex | RGBA | Usage |
|------|-----|------|-------|
| `--green` | #22c55e | `rgb(34,197,94)` | Safe zone, positive, P90 |
| `--yellow` | #eab308 | `rgb(234,179,8)` | Caution, P50, warning |
| `--orange` | #f97316 | `rgb(249,115,22)` | Orange warn zone |
| `--red` | #ef4444 | `rgb(239,68,68)` | Critical, P10, essentials |
| `--cyan` | #06b6d4 | `rgb(6,182,212)` | Accent, bond pool (w/ green) |
| `--accent` | #3b82f6 | `rgb(59,130,246)` | Blue, discretionary, safe upper bound |
| `--muted` | (CSS var) | likely `rgba(71,85,105,...)` | Text labels, secondary info |
| `--card2` | (CSS var) | light gray bg | Card backgrounds |

---

## Typography Reference

| Element | Font Size | Font Weight | Color | Notes |
|---------|-----------|-------------|-------|-------|
| Section h2 | 1.2rem–1.4rem | 700 | `--text` | Collapsible header |
| Card title | .8rem | 700 | `--text` | Bond Pool title |
| KPI value | 1.4rem–2.2rem | 700–800 | colored | P(FIRE), spending amounts |
| Table header | .65rem–.7rem | 700 | `--muted` | UPPERCASE, letter-spacing .5px |
| Table body | .78rem | 400–600 | `--text` | Numeric columns tabular-nums |
| Markers/labels | .55rem–.6rem | 400 | colored | Guardrails bar threshold text |
| Subtitle/meta | .65rem–.72rem | 400 | `--muted` | Descriptions, footnotes |

---

## Key CSS Patterns

### 1. **Gradient Fills**
```css
background: linear-gradient(90deg, var(--green), var(--cyan));  /* Bond pool */
```

### 2. **Absolute Positioning for Markers**
```css
position: absolute;
left: 40%;  /* or 17.2%, 83.2%, 100% */
top: 0;
width: 2px;  /* marker line */
height: 36px;
background: colored;
z-index: 2;
```

### 3. **RGBA Zone Backgrounds**
```css
background: rgba(34, 197, 94, 0.2);   /* 20% opacity green */
background: rgba(234, 179, 8, 0.15);  /* 15% opacity yellow */
```

### 4. **Border-Left Accent**
```css
border-left: 3px solid var(--green);  /* Income phases, callouts */
```

### 5. **Auto-fit Grid (Responsive)**
```css
grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
gap: 10px;
```

---

## Collapsible Pattern

```html
<div class="section collapsible tab-hidden" data-in-tab="retiro">
  <h2 onclick="_toggleBlock(this.parentElement)">Title ▸</h2>  <!-- ▸ added via CSS ::after -->
  <div class="collapse-body" style="display:none">
    <!-- content hidden by default -->
  </div>
</div>
```

```css
.collapsible .collapse-body { display: none; }
.collapsible.open .collapse-body { display: block; }
.collapsible h2::after { content: ' ▸'; }
.collapsible.open h2::after { content: ' ▾'; }
```

---

## Observations & Build Notes

### ✓ Confirmed Patterns
1. **All cards use `.card2` background** — consistent visual hierarchy
2. **Grid responsiveness via `repeat(auto-fit, minmax(...))`** — not fixed 2/3-col
3. **RGBA overlay colors for zone backgrounds** — allows transparency stacking
4. **2px marker lines with absolute positioning** — allows labels outside overflow:hidden container
5. **Collapsible sections on all major guardrails** — reduces clutter on tab load

### ⚠️ Technical Considerations
1. **Guardrails bar:** Uses 5 absolutely-positioned zones + 5 marker lines — order matters for z-index layering
2. **Spending breakdown:** 3-card grid MUST wrap to single column on <768px (no manual breakpoint needed — auto-fit handles)
3. **Chart heights:** `.chart-box-xl` (380px) vs `.chart-box-sm` (180px) — verify Chart.js responsive canvas settings
4. **Canvas upscaling:** 2× render size (width=2428, display=1214) — improves text legibility on high-DPI
5. **Privacy mode (`.pv`):** All numeric values obfuscated via CSS class — confirmed in salary/spending values

### 🎨 Visual Hierarchy
- **Hero KPIs** (top): P(FIRE) 90.4% large + status
- **Tables** (middle): Guardrails, bond composition — data-dense
- **Cards** (flexible): SWR percentils, spending breakdown — visual scanning
- **Charts** (large): Income projection, runway — trend analysis

### 📱 Mobile Considerations
- **Tight 2-col layout (bond pool):** May need 1-col below 500px (not styled currently)
- **36px bar height:** Sufficient for touch targets
- **Marker labels:** Overlap risk on small screens — consider label positioning algorithm for prod

---

## Summary

ABA-5-RETIRO is a **fully-featured retirement dashboard** with:
- **Structured spending tracking** (essentials/discretionary/imprevistos)
- **Dynamic guardrails visualization** (3-zone horizontal bar with current marker)
- **SWR percentile cards** (P10/P50/P90 with colored borders)
- **Bond pool progress** (gradient bar + composition table)
- **Income lifecycle projection** (canvas chart, 2026–2077)
- **Collapsible deeper dives** (upside rules, composition details)

All components follow **consistent design language**:
- RGBA zone colors (green/yellow/orange/red)
- Left 3px colored borders for semantic grouping
- Auto-fit responsive grids
- `.6rem` to `.8rem` typography for density
- Full Privacy Mode support

**Ready for v0.1.44+ implementation.**
