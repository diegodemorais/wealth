# ABA-1-HOJE (Design Audit)

**Dashboard version**: v0.1.43  
**Tab identifier**: `data-tab="hoje"`  
**First functional tab** — flagship view of portfolio health, FIRE progress, and daily action items.

---

## I. Estrutura Layout

### Grid System
- **Primary container**: `data-in-tab="hoje"` wraps all components
- **Layout paradigm**: Flex/grid responsive stack (vertical on mobile → horizontal on desktop)
- **Breakpoints**:
  - 1024px: 3-4 col grid → 2 col
  - 900px: 3 col → 1 col (aggressive reflow)
  - 768px: 2 col → 1 col
  - 480px: 1 col, font-size reduced 15-20%

### Spacing Defaults
- **Gap between sections**: 14px (--gap standard)
- **Card padding**: 14-16px
- **Margin bottom**: 16px (sections), 8px (sub-sections), 4px (micro)

---

## II. Componentes Visuais (Tabela)

| # | Nome | Tipo | Cores | Font | Padding | Interativo? | CSS Class |
|---|------|------|-------|------|---------|------------|-----------|
| 1 | **Hero KPI Strip** | grid 4col | --accent (primary), --card bg | 2rem bold / 0.6rem caps | 16px | hover semi-transparent | `.hero-strip` `.hero-kpi` |
| 2 | **KPI Cards — Primários** | grid auto-fit | --accent border (2px), var(--card) | 1.5rem bold / 0.65rem caps | 14-16px | border-hover glow | `.kpi-grid` `.kpi-fire` |
| 3 | **FIRE Progress Bar** | 1D linear scale | gradient (--accent → --purple) | — | H=12px | animated width 0.5s | `#fireProgressBar` |
| 4 | **FIRE Countdown** | display text | --text (white) | 3rem bold (2.5rem mobile) | 12px v-margin | — | `.fire-big` |
| 5 | **Scenario Grid** | grid 4 persona cols | --accent (chosen), --card | 1.3rem bold / 0.9rem sub | 10-12px | `.chosen` border highlight | `.scenario-card` |
| 6 | **Semáforo Panel** | collapse section | gradient bg (yellow/green/red) | 0.75rem / 0.6rem | 16px | toggle expand/collapse | `.section.collapsible` |
| 7 | **DCA Status Cards** | grid auto-fit | --accent border-left 3px, --card | 0.8rem bold / 0.75rem | 14px | `.paused` opacity 0.8 | `.dca-grid` `.dca-card` |
| 8 | **Bond Pool Bar** | 1D progress | gradient (--green → --cyan) | — | H=20px | animated fill 0.3s | `.bond-pool-bar` |
| 9 | **Wellness Score** | grid row checklist | --green (✓), --yellow (warn) | 0.75rem / 0.68rem caps | 6px h-padding | progress bars animated | `.wellness-extra-row` |
| 10 | **Aporte Form** | input + range | --accent accent, --card bg | 0.8rem label / 1rem value | 16px | slider drag interactive | `#simAporte` `.calc-form` |

---

## III. Detalhes Visuais por Componente

### 1. HERO KPI STRIP (`.hero-strip`)

**Layout**:
- 4 columns @ 1024px+
- 3 columns @ 900px
- 2 columns @ 480px

**Card anatomy** (`.hero-kpi`):
```css
background: var(--card)               /* rgba(29,33,42,1) dark card */
border: 1px solid var(--border)       /* rgba(71,85,105,0.3) */
border-radius: 12px
padding: 16px
text-align: center
```

**Primary variant** (`.hero-kpi.primary`):
```css
border: 2px solid var(--accent)       /* rgb(59,130,246) blue */
background: rgba(59,130,246,0.07)     /* ultra-light blue tint */
```

**Typography**:
- Label (`.hlbl`): **0.6rem CAPS**, color: var(--muted), letter-spacing: 0.5px
- Value (`.hval`): **2rem bold**, color: var(--text) [white] or inline `style="color: rgb(234,179,8)"` [yellow]
- Sub (`.hsub`): **0.65rem**, color: var(--muted)

**Examples in DOM**:
```
Patrimônio Total        [HERO-PRIMARY]
R$3.59M                 [2rem, bold, white]
$631k em USD            [0.65rem, muted]

---

Anos até FIRE           [HERO-SECONDARY]
13a 9m                  [2rem, bold, white]
Base: 2040 (53a)...     [0.65rem, muted]

---

Progresso FIRE          [HERO-SECONDARY]
43.1%                   [2rem, bold, #eab308 YELLOW]
vs gatilho R$8.3M       [0.65rem, muted]
```

**Interactivity**: hover tooltip on values (opacity: 0.85 on hover)

---

### 2. KPI CARDS — PRIMARY METRICS (`.kpi-grid` + `.kpi-fire`)

**Grid Layout**:
```css
display: grid
grid-template-columns: repeat(auto-fit, minmax(170px, 1fr))
gap: 10px
margin-bottom: 16px
```

**Card styling** (`.kpi`):
```css
background: var(--card)
border-radius: 10px
padding: 14px 16px
border: 1px solid var(--border)
```

**Fire variant** (`.kpi-fire`):
```css
border: 2px solid var(--accent)       /* rgb(59,130,246) */
background: rgba(59,130,246,0.07)
```

**Typography**:
- Label (`.kpi-label`): **0.65rem CAPS**, color: var(--muted), letter-spacing: 0.5px
- Value (`.kpi-value`): **1.5rem bold**, color: var(--text) or inline color (green, yellow, red)
- Sub (`.kpi-sub`): **0.7rem**, color: var(--muted)

**Example KPIs**:
1. P(Cenário Aspiracional): 86.5% [green]
2. Drift Máximo: 9.1pp [yellow]
3. Aporte do Mês: R$78k + R$53k [green delta]

---

### 3. FIRE PROGRESS BAR (Linear Scale — Logarithmic)

**Container**:
```css
margin: 10px 0
background: var(--card2)              /* rgb(41,50,65) darker card */
border-radius: 6px
height: 12px
```

**Fill** (`#fireProgressBar`):
```css
background: linear-gradient(90deg, var(--accent), var(--purple))
            /* rgb(59,130,246) → rgb(168,85,247) */
transition: width 0.5s ease
border-radius: 6px
height: 100%
```

**Scale**: **Logarithmic** — each visual increment = same **multiplicative** gain (R$1M→R$2M = R$6M→R$13M).

**Labels below bar**:
```
Start (abr/21)       Atual (R$3.59M)       Meta 2040 (R$8.3M)
[small muted text]   [0.65rem, primary]    [small muted text]
```

---

### 4. FIRE COUNTDOWN (`.fire-big`)

**Typography**:
```css
font-size: 3rem @ 1024px+
font-size: 2.5rem @ 480px
font-weight: 800
text-align: center
margin: 12px 0 6px
color: var(--text)  /* white */
```

**Example**: "13 anos 9 meses · 2040 (53 anos)"

**Note**: This is the **aspirational baseline**, not the current year countdown. Each scenario grid cell shows +/- alternatives.

---

### 5. SCENARIO GRID (`.scenario-card` + family profiles)

**Container layout**:
```css
display: grid
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))
gap: 10px
```

**4 persona columns**:
1. 🧑 **Solteiro** (blue: rgb(59,130,246))
2. 💍 **Casado** (purple: rgb(139,92,246))
3. 👨‍👩‍👧 **c/ Filho** (cyan: rgb(6,182,212))

**Each persona** = 2 scenario cards (Aspiracional + Escolhida)

**Card anatomy** (`.scenario-card`):
```css
background: var(--card2)              /* darker card */
border-radius: 8px
padding: 10px 8px
border: 1px solid var(--border)
text-align: center
```

**Chosen variant** (`.scenario-card.chosen`):
```css
border-color: var(--accent)           /* rgb(59,130,246) blue */
background: rgba(59,130,246,0.07)
```

**Cell content**:
```
[0.6rem muted] "🚀 Aspiracional"
[1.3rem bold]  "FIRE 49"
[0.9rem bold, #eab308 yellow] "P = 86.5%"
[0.6rem muted] "2036"
```

---

### 6. SEMÁFORO PANEL (`.section.collapsible`)

**Container**:
```css
background: var(--card)
border-radius: 10px
padding: 16px
border: 1px solid var(--border)
margin-bottom: 14px
```

**Summary line** (`.section-critical`):
```css
font-size: 0.75rem
color: var(--muted)
margin: 4px 0 2px
```

**Indicator badge**:
```css
display: inline-block
width: 8px
height: 8px
border-radius: 50%
background: #eab308  /* yellow = CAUTION */
margin-right: 5px
vertical-align: middle
```

**Text**: "IPCA+ 2040: DCA pausado · 4 gatilhos monitorados"

**Interactive**: Toggle expand/collapse via `onclick` on parent section.

**Inside collapse** (`.collapse-body` if expanded):
- Table of 4 guardrails (🟢 🟡 🟠 🔴)
- Each row: % drawdown, action, cutback amount, current status
- Color-coded rows: green (0-15%), yellow (15-25%), orange (25-35%), red (>35%)

---

### 7. DCA STATUS CARDS (`.dca-grid` + `.dca-card`)

**Grid layout**:
```css
display: grid
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))
gap: 10px
```

**Card** (`.dca-card`):
```css
background: var(--card2)
border-radius: 8px
padding: 14px
border-left: 3px solid var(--accent)  /* blue left accent */
```

**Paused state** (`.dca-card.paused`):
```css
border-left-color: var(--muted)
opacity: 0.8
```

**Typography**:
- Title (`.dca-title`): **0.8rem bold**, margin-bottom: 6px
- Row (`.dca-row`): **0.75rem**, flex space-between
- Value (`.dca-val`): font-weight: 600

**Example content**:
```
IPCA+ 2040
Taxa: 7.07% | Piso: 6.0% ✓
Status: ativo | Aporte próximo: →
```

---

### 8. BOND POOL BAR

**Progress bar** (`.bond-pool-bar`):
```css
position: relative
height: 20px
background: var(--card2)
border-radius: 6px
overflow: hidden
margin: 10px 0
```

**Fill** (`.bond-pool-fill`):
```css
height: 100%
border-radius: 6px
background: linear-gradient(90deg, var(--green), var(--cyan))
            /* rgb(34,197,94) → rgb(6,182,212) */
transition: width 0.3s ease
```

**Metadata below**:
```css
display: grid
grid-template-columns: 1fr 1fr
gap: 4px
margin-top: 8px
font-size: 0.75rem
```

**Content**:
- Valor atual: R$ 211k [green]
- Meta (7 anos): R$ 1750k
- Cobertura: 0.8 anos
- Status: Em construção [yellow]

---

### 9. WELLNESS SCORE (`.wellness-extra-row`)

**Row layout**:
```css
display: grid
grid-template-columns: 1.4rem 11rem 1fr 4.5rem 3rem
align-items: center
gap: 8px
padding: 6px 2px
border-bottom: 1px solid rgba(71,85,105,0.12)
```

**5 columns**:
1. **Icon** (1.4rem): ✅ or ⚠️ (0.82rem, line-height: 1)
2. **Label** (11rem): metric name (0.75rem, bold)
3. **Progress bar** (1fr): mini bar (H=6px, border-radius: 3px)
4. **Value** (4.5rem): status (0.68rem, muted, text-align right)
5. **Score** (3rem): ratio (0.72rem, bold, green if pass)

**Progress bar anatomy**:
```css
height: 6px
background: rgba(71,85,105,0.25)
border-radius: 3px
overflow: hidden

  /* fill inside */
  height: 100%
  width: 100%  /* dynamic */
  background: #22c55e  /* green */
  border-radius: 3px
  transition: width 0.4s ease
```

**Examples**:
```
✅ Savings rate         [████████]  ~55.6%      15/15
✅ Capital humano       [████████]  solteiro    5/5
✅ Cash Flow 12m        [████████]  R$ 1.42M   12/15
```

---

### 10. APORTE FORM (Input + Range Slider)

**Form structure**:
```css
class: "calc-form"
padding: 16px
background: var(--card)
border-radius: 10px
border: 1px solid var(--border)
```

**Label + value**:
```css
display: flex
justify-content: space-between
font-size: 0.8rem
margin-bottom: 12px

  label: font-weight: 600
  value: font-weight: 700, color: var(--accent)
```

**Range slider**:
```css
type: "range"
min: 5000
max: 100000
step: 1000
default: 25000

  appearance: none
  width: 100%
  height: 6px
  border-radius: 3px
  background: rgba(71,85,105,0.25)
  outline: none

  ::-webkit-slider-thumb {
    appearance: none
    width: 16px
    height: 16px
    border-radius: 50%
    background: var(--accent)
    cursor: pointer
    box-shadow: 0 0 8px rgba(59,130,246,0.4)
  }
```

**Interactivity**:
- `oninput="_firePresetCustom();updateFireSim()"`
- Real-time update of simulation results

---

## IV. Responsividade (Breakpoints)

### 1024px (Desktop — Standard View)
- Hero strip: 4 columns
- KPI grid: auto-fit, 170px min-width
- Scenario grid: 4 columns (1 per persona)
- DCA cards: auto-fit, 260px min-width
- All fonts at 100%

### 900px (Tablet — Aggressive Reflow)
- Hero strip: 3 columns → **1 column** (if media rule applies `grid-template-columns:1fr!important`)
- KPI grid: 2 columns
- Scenario grid: **1 column**
- DCA cards: 2 columns
- Fire countdown: 3rem → still readable

```css
@media(max-width:900px){
  .grid-2, .grid-3, .hero-strip, .fire-row, .scenario-card, .fire-sim-result {
    grid-template-columns: 1fr !important
  }
  .kpi-grid {
    grid-template-columns: repeat(2,1fr) !important
  }
}
```

### 768px (Phablet)
- All grids: 2 columns max
- Fonts: 90% of desktop
- Padding: reduced 20%

### 480px (Mobile — Aggressive Reduction)
- All grids: **1 column**
- Fire big: 3rem → 2.5rem
- Hero strip: 2 columns (2 KPIs per row)
- KPI values: 1.2rem (down from 1.5rem)
- Table: `font-size: 0.7rem`
- Wellness rows: stacked vertically or compacted
- `.hide-mobile`: `display: none`

```css
@media(max-width:480px){
  .kpi-grid { grid-template-columns: repeat(2,1fr) }
  .kpi-value { font-size: 1.2rem }
  .fire-big { font-size: 2.5rem }
  .hero-strip { grid-template-columns: repeat(2,1fr) }
  .grid-2, .grid-3 { grid-template-columns: 1fr }
}
```

---

## V. Privacy Mode (`.private-mode`)

**Activation**: Toggles class `private-mode` on `<body>`

**Mechanism**:
```css
.private-mode .pv {
  color: transparent !important
  position: relative
  white-space: nowrap
}

.private-mode .pv::after {
  content: "••••"
  color: var(--muted)
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: flex-start
  pointer-events: none
}

/* Custom mask via data-pv-mask attribute */
.private-mode .pv[data-pv-mask]::after {
  content: attr(data-pv-mask)
}
```

**Elements masked** (`.pv` class):
- Patrimônio total
- Dólar/cambio
- Valores em R$ e USD
- Aporte amounts
- Gastos e retiradas

**Custom masks** (e.g. heroPatrimonioUsd):
```html
<div class="pv" id="heroPatrimonioUsd" data-pv-mask="$XXXk em USD">$631k em USD</div>
<!-- Renders as: "$XXXk em USD" when private-mode enabled -->
```

---

## VI. Color Palette Reference

| CSS Var | RGB/Hex | Use Case |
|---------|---------|----------|
| `--accent` | rgb(59,130,246) #3B82F6 | Primary blue, hero borders, active states |
| `--green` | rgb(34,197,94) #22C55E | Success, ✓, positive delta |
| `--yellow` | rgb(234,179,8) #EAB308 | Warning, caution, neutral state |
| `--red` | rgb(239,68,68) #EF4444 | Critical, drawdown >25% |
| `--purple` | rgb(168,85,247) #A855F7 | Secondary accent, gradients |
| `--cyan` | rgb(6,182,212) #06B6D4 | Tertiary, gradients |
| `--card` | rgb(29,33,42) #1D212A | Default card bg |
| `--card2` | rgb(41,50,65) #293241 | Darker card variant |
| `--text` | white #FFFFFF | Primary text |
| `--muted` | var(--gray-400) | Secondary text, labels |
| `--border` | rgba(71,85,105,0.3) | Card borders |

---

## VII. Observações Críticas

### Design Principles
1. **Hierarchy by color**: --accent (primary action) → --green (success) → --yellow (caution) → --red (critical)
2. **Grid-first layout**: All multi-item sections use CSS Grid with auto-fit + minmax() for responsive scaling
3. **Micro-spacing**: Consistent 6-12px gaps between related elements; 14-16px between sections
4. **Typography contrast**: 3rem (headline) → 0.6rem (label); bold for data, regular for context
5. **Interactive states**: Hover = opacity 0.85, active = border highlight (e.g., `.chosen`), disabled = opacity 0.5

### CSS Reutilizáveis (ABA-1-HOJE exclusive patterns)

```css
/* Hero KPI pattern — can repeat for other dashboards */
.hero-strip {
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))
  gap: 10px
}

/* DCA card pattern — reusable for status/indicator cards */
.dca-card {
  background: var(--card2)
  border-left: 3px solid var(--accent)  /* Left accent bar */
  padding: 14px
  border-radius: 8px
}

/* Progress bar pattern — logarithmic scale applicable to other metrics */
.progress-bar {
  height: 12-20px
  background: linear-gradient(90deg, var(--accent), var(--purple))
  transition: width 0.3-0.5s ease
  border-radius: 6px
}

/* Scenario card pattern — reusable for multi-option displays */
.scenario-card {
  background: var(--card2)
  border: 1px solid var(--border)
  &.chosen { border-color: var(--accent); background: rgba(59,130,246,0.07) }
}
```

### Performance Notes
- **Animations**: `transition: width 0.5s` on progress bars (GPU-accelerated)
- **Grid efficiency**: `auto-fit` + `minmax()` prevents hardcoded breakpoints
- **Privacy mode**: CSS-only masking (no JS re-render needed)

### Accessibility Considerations
- Color contrast ratio: 4.5:1 minimum (WCAG AA)
- Labels paired with values (all KPIs have `.kpi-label` + `.kpi-value`)
- Interactive elements: hover states clear (opacity, border)
- Mobile: font-size never drops below 0.65rem (sub-text)

---

## VIII. Estrutura de Ficheiros

**Primary CSS**:
- Inline `<style>` in `<head>` of DashHTML.html (lines 1-300+)

**Key selectors** defined in order:
1. Root variables (--accent, --card, etc.)
2. Base elements (body, table, input)
3. Component classes (.hero-strip, .kpi-grid, .dca-grid, etc.)
4. Media queries (900px, 768px, 480px)
5. Privacy mode (.private-mode .pv::after)

**DOM insertion** (`data-in-tab="hoje"`):
- Lines 327-850: All HOJE tab content
- Hero strip: 327-355
- KPI cards: 356-415
- FIRE progress + countdown: 416-475
- Scenario grid: 476-540
- Semáforo panel: 541-580
- DCA status: 581-650
- Wellness score: 651-710
- Aporte form: 711-750

---

## IX. Summary — Quick Copy-Paste Patterns

### New section in HOJE tab
```html
<div class="section" data-in-tab="hoje">
  <h2>Section Title</h2>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Label</div>
      <div class="kpi-value">Value</div>
      <div class="kpi-sub">Subtitle</div>
    </div>
  </div>
</div>
```

### New KPI card (primary)
```html
<div class="kpi kpi-fire" style="border-width:2px">
  <div class="kpi-label">Metric Name</div>
  <div class="kpi-value" style="color: rgb(34,197,94);">VALUE</div>
  <div class="kpi-sub">Context</div>
</div>
```

### New DCA-style card
```html
<div class="dca-card">
  <div class="dca-title">Card Title</div>
  <div class="dca-row">
    <span>Label</span>
    <span class="dca-val">Value</span>
  </div>
</div>
```

### Progress bar (animated)
```html
<div style="background:var(--card2);border-radius:6px;height:12px">
  <div id="myProgressId" style="height:100%;border-radius:6px;background:linear-gradient(90deg,var(--accent),var(--purple));transition:width 0.5s;width:75%"></div>
</div>
```

---

**End of Design Audit**
