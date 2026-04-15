# Old Dashboard Component Analysis
## High-Value Patterns for React/ECharts Migration

**Analysis Date:** 2026-04-14  
**Source:** DashHTML.html (v2.76) + DashHTML_files/  
**Target:** React 19.2.4 + Next.js 16.2.3 + ECharts dashboard

---

## Executive Summary

The old monolithic HTML dashboard contains **5 high-value components** that significantly enhance information clarity over the current React dashboard. These components excel at:
1. **Hierarchical status communication** (Semáforo table)
2. **Visual progress tracking with rich context** (DCA cards, Bond Pool bar)
3. **Tactical intelligence** (Action boxes with prioritization)
4. **Financial indicator bands** (HODL11 crypto band visualization)
5. **Factor exposure transparency** (Factor loadings table with R² quality badges)

Below is a detailed assessment of each component with implementation guidance.

---

## 1. SEMÁFORO DE GATILHOS (Status Trigger Table)
**Priority:** HIGH | **Effort:** MEDIUM | **Value:** 9/10

### What It Displays
A compact, color-coded table tracking portfolio rebalancing triggers with 4 columns:
- **Gatilho (Trigger)** — Asset/metric being monitored with category badge (taxa, posição, crypto, etc.)
- **Status** — Color-coded dot (verde/amarelo/vermelho) + text label
- **Valor** — Current value vs trigger threshold (e.g., "6.80% (≤6.0%)")
- **Ação** — Recommended action in plain language

**Current Instance:**
```
| Gatilho | Status | Valor | Ação |
|---------|--------|-------|------|
| Renda+ 2065 — Taxa | 🟢 verde | 6.80% (≤6.0%) | Monitorar |
| Equity SWRD — Drift | 🟡 amarelo | 35.6% (alvo 39.5%) | Priorizar aporte SWRD |
| Crypto HODL11 — Banda | 🟢 verde | 2.9% (banda 1.5–5.0%) | Dentro da banda |
| Drift máximo (IPCA) | 🔴 vermelho | 9.1pp | Rebalancear via aporte |
```

### Why It's Valuable
- **Operator dashboard**: Every metric has a single source of truth for action
- **Visual hierarchy**: Color gradients communicate urgency immediately (verde→amarelo→vermelho)
- **Context density**: Nested rows show detailed info (taxa, piso, gap, posição) without horizontal scroll
- **Category badges**: Thin colored pill tags (Taxa, Posição, Crypto) organize rationale
- **Collapsible section**: Expands only when relevant; compact summary line visible always

### Current React Dashboard Gap
- No unified trigger table; gatilhos scattered across tabs
- No visual "what to do" guidance; KPIs show state but not action
- Hard to see all 4 triggers at once in current layout

### How to Implement in React
**Component:** `TriggerSemaforoTable.tsx`

**Data Structure (from data.json):**
```json
{
  "semaforo_triggers": [
    {
      "id": "renda_taxa",
      "label": "Renda+ 2065 — Taxa",
      "category": "taxa",
      "status": "verde",
      "valor": 6.80,
      "threshold": "≤6.0%",
      "acao": "Monitorar",
      "detalhe": "taxa: 6.80% · piso venda 6.0% · gap 0.80pp · posição R$118k"
    },
    {
      "id": "swrd_drift",
      "label": "Equity SWRD — Drift",
      "category": "posição",
      "status": "amarelo",
      "valor": 35.6,
      "target": 39.5,
      "gap_pp": -3.9,
      "gap_brl": 140000,
      "acao": "Priorizar aporte SWRD"
    }
  ]
}
```

**CSS Classes from Old Dashboard:**
- `.semaforo-table` — outer wrapper
- `.semaforo-dot` — colored circle (width: 10px, height: 10px)
- `.semaforo-verde`, `.semaforo-amarelo`, `.semaforo-vermelho` — color variants
- Background color scheme: `rgba(X, Y, Z, 0.15)` with left border 3px

**Estimated Effort:** 2-3 hours
- Parse semaforo data from data.json
- Build table component with collapsible header
- Style color badges and dots
- Add hover tooltips for "Detalhe" row

**New Data Fields Needed:**
- `semaforo_triggers[]` — array of trigger objects
- Each trigger: `{id, label, category, status, valor, threshold, acao, detalhe}`

---

## 2. DCA STATUS CARDS (Dollar-Cost Averaging Monitoring)
**Priority:** HIGH | **Effort:** MEDIUM | **Value:** 8/10

### What It Displays
3-4 collapsible cards showing the status of each DCA regime:
- **TD IPCA+ 2040** (ATIVO badge in green)
- **TD IPCA+ 2050** (ATIVO badge in green)  
- **Renda+ 2065** (PAUSADO badge in gray)

Each card shows:
- Current rate (taxa atual)
- Floor threshold (piso compra)
- Gap vs floor (spread color-coded)
- Portfolio weight current / target
- Inline explanation text (72px height)

**Example Structure:**
```
┌─ DCA Status ─────────────┐
├─ TD IPCA+ 2040 [ATIVO]   │
│  Taxa atual:  7.07%      │
│  Piso compra: 6.0%       │
│  Gap vs piso: 1.07pp ✓   │
│  % carteira:  3.1% / 12% │
│  DCA ativo: aportar...   │
└──────────────────────────┘
```

### Why It's Valuable
- **Clarifies DCA state**: Easy to see which instruments are "on" vs "off" at a glance
- **Removes ambiguity**: Compared to "rate X.XX%" in abstract, this shows intent (Ativo/Pausado) + threshold logic
- **Tactical playbook**: Each card explains the decision rule (e.g., "aportar até 12% da carteira")
- **Gap visualization**: Simple % comparison prevents misunderstanding of threshold distance
- **Aggregated summary**: Macro section shows overall "Próximo aporte → IPCA" in one pill badge

### Current React Dashboard Gap
- RF instruments shown in separate sections, not grouped as "DCA strategy"
- No unified view of which DCA regimes are active today
- No threshold/floor logic visible to operator

### How to Implement in React
**Component:** `DcaStatusCards.tsx`

**Data Structure:**
```json
{
  "dca_status": [
    {
      "id": "ipca2040",
      "name": "TD IPCA+ 2040",
      "regime": "ATIVO",
      "taxa_atual": 7.07,
      "piso_compra": 6.0,
      "alvo_pct": 12.0,
      "atual_pct": 3.1,
      "detalhe": "DCA ativo: aportar em TD 2040 (80% do bloco IPCA+) até 12.0% da carteira"
    }
  ],
  "dca_aporte_priority": {
    "proximo": "IPCA",
    "gap_pp": 9.1,
    "label": "Próximo aporte → IPCA (9.1pp gap)"
  }
}
```

**CSS Pattern:**
- `.dca-grid` — CSS Grid: `repeat(auto-fit, minmax(260px, 1fr))`
- `.dca-card` — background: var(--card2), border-left: 3px solid, padding: 14px
- `.dca-card.paused` — opacity: 0.8, border-left-color: muted
- `.dca-title` — font-size: 0.8rem, font-weight: 700
- `.dca-row` — display: flex, justify-content: space-between

**Estimated Effort:** 2-3 hours
- Extract DCA logic from RF instrument state
- Build card grid component
- Add Ativo/Pausado badge logic
- Style responsive grid for tablet/mobile

**New Data Fields Needed:**
- `dca_status[]` — array of {id, name, regime, taxa_atual, piso_compra, alto_pct, atual_pct, detalhe}
- `dca_aporte_priority` — {proximo, gap_pp}

---

## 3. BOND POOL READINESS (Sequence-of-Returns Risk Protection)
**Priority:** HIGH | **Effort:** MEDIUM-LARGE | **Value:** 9/10

### What It Displays
A comprehensive view of the "bond pool" — RF assets reserved for FIRE's first years:

**Visual Components:**
1. **Bond Pool Bar** — Green/cyan gradient progress bar (0.8 / 7 years)
   - Current: 11% fill, 0.8 years of expenses
   - Goal: 7 years of expenses (100% = R$1.75M)

2. **Summary Stats Grid** (2x2):
   - Valor atual: R$211k
   - Meta (7 anos): R$1.75M
   - Cobertura atual: 0.8 anos
   - Status: Em construção (colored yellow)

3. **Composição Atual Table**:
   ```
   | Ativo | Valor | % da Meta |
   |-------|-------|-----------|
   | IPCA+ 2040 | R$113k | 6% |
   | IPCA+ 2050 | R$12k  | 1% |
   | IPCA+ 2029 | R$87k  | 5% |
   | TOTAL | R$211k | 12% |
   ```

4. **Strategy Cards** (A & B):
   - A (green): "Janela ATIVA — Aportes em IPCA+ longo enquanto taxa ≥ 6.0%"
   - B (muted): "Estratégia B — Nos 3 anos pré-FIRE: aportar em IPCA+ curto"

5. **Bond Pool Runway Chart** (ECharts line):
   - Shows how many years pool sustains zero equity withdrawals post-FIRE
   - P10/P50/P90 scenario lines

### Why It's Valuable
- **De-risks FIRE day**: Directly addresses sequence-of-returns risk (SoRR) — portfolio's #1 vulnerability
- **Clarifies strategy divergence**: Shows how bond pool + 3-year pré-FIRE strategy protect against market timing
- **Motivates disciplined DCA**: Every aporte de RF counts toward visible goal (7 years)
- **Single metric for SoRR**: Instead of "trust the MC," shows concrete years of coverage
- **Dual-strategy transparency**: Explains why both "Janela ATIVA" (today) and "3 anos pré-FIRE" (tactical) matter

### Current React Dashboard Gap
- RF instruments exist but not aggregated as "SoRR defense"
- No bond pool concept visible
- No runway chart
- Motivation for RF accumulation not clear to operator

### How to Implement in React
**Component:** `BondPoolReadiness.tsx` + child `BondPoolRunwayChart.tsx`

**Data Structure:**
```json
{
  "fire": {
    "bond_pool_readiness": {
      "anos_gastos": 0.8,
      "meta_anos": 7.0,
      "valor_atual_brl": 211000,
      "meta_brl": 1750000,
      "status": "Em construção",
      "composicao": [
        {
          "ativo": "IPCA+ 2040",
          "valor": 113015,
          "pct_meta": 6.46
        }
      ],
      "estrategia_a": {
        "label": "🟢 Estratégia A — Janela ATIVA",
        "descricao": "Aportes em IPCA+ longo enquanto taxa ≥ 6.0%",
        "taxa_atual": 7.07
      },
      "estrategia_b": {
        "label": "⏳ Estratégia B — 14 anos para FIRE",
        "descricao": "Nos 3 anos pré-FIRE: aportar em IPCA+ curto (~2 anos) independente da taxa"
      }
    }
  }
}
```

**Chart Integration (ECharts):**
- X-axis: Years from FIRE (0 to 30+)
- Y-axis: Years of bond pool remaining
- Lines: P10, P50, P90 scenarios
- Shaded zones: Green (>2yr), Yellow (1-2yr), Red (<1yr)

**CSS Pattern:**
- `.bond-pool-bar` — height: 20px, rounded gradient fill
- `.bond-pool-fill` — linear-gradient(90deg, var(--green), var(--cyan))
- `.bp-row` — display: flex, justify-content: space-between
- `.duration-block` — background: rgba(249,115,22,.06), border-left: 2px orange

**Estimated Effort:** 4-6 hours
- Extract bond pool aggregation from RF holdings
- Build progress bar component
- Create runway chart (ECharts time-series)
- Add strategy card component
- Style responsive layout

**New Data Fields Needed:**
- `bond_pool_readiness` — {anos_gastos, meta_anos, valor_atual_brl, meta_brl, status, composicao[]}
- `bond_pool_runway` — {dates[], p10[], p50[], p90[]} for chart
- For each strategy: {label, descricao, taxa_atual/piso}

---

## 4. HODL11 BAND VISUALIZATION (Crypto Tactical Bands)
**Priority:** MEDIUM | **Effort:** SMALL | **Value:** 7/10

### What It Displays
A horizontal "band" chart showing valid crypto allocation ranges:

**Visual Structure:**
```
┌─ HODL11 — BTC wrapper — B3 ──────────┐
│                                       │
│  Atual: 2.9% · Alvo 3% · Banda 1.5–5│
│                                       │
│  ┌──────────────────────────────┐   │
│  │ 🔴─────🟢───🟡──┐ ║ ║ 🔴───│  Underweight │ Safe zone │ Overweight │
│  └──────────────────────────────┘   │
│   1.5%   2.0%   3.0%   4.0%   5.0%   │
│          ▲ marker                     │
│       atual: 2.9%                     │
└─────────────────────────────────────┘
```

**Components:**
- Gradient bar (red → green → yellow → red for bounds)
- Current position marker (vertical line)
- Labels for boundaries (1.5%, 5.0%)
- Value tooltip showing actual %

### Why It's Valuable
- **Instantaneous band clarity**: See at a glance if allocation is under/in/over band
- **Rebalancing decision**: No ambiguity about "is 2.9% ok?" — marker clearly inside green zone
- **Future-proof**: If band changes (1.5–6.0%), only need data update
- **Compact**: Takes ~40px height vs table row

### Current React Dashboard Gap
- Crypto position exists but not shown relative to valid band
- No visual "is this in range?" indicator
- Requires manual math: "2.9% vs 1.5–5.0% band"

### How to Implement in React
**Component:** `CryptoBandChart.tsx` (reusable pattern for any metric with bands)

**Data Structure:**
```json
{
  "hodl11": {
    "qty": null,
    "preco": null,
    "valor": 103000,
    "pct_carteira": 2.9,
    "alvo": 3.0,
    "banda_min": 1.5,
    "banda_max": 5.0,
    "detalhe": "wrapper B3 de BTC (risco operacional BR, não fiscal)"
  }
}
```

**Chart Implementation (SVG or Canvas):**
- Background gradient: 0–30% red, 30–50% green, 50–80% yellow, 80–100% red
- Marker pin at current position
- Label overlays for thresholds
- Responsive width to container

**Estimated Effort:** 1-2 hours
- Build band chart component
- Style gradient zones
- Add marker positioning logic
- Test responsive scaling

**New Data Fields Needed:**
- Add to `hodl11` object: {alvo, banda_min, banda_max}

---

## 5. FACTOR LOADINGS TABLE (Regression Quality & Exposure)
**Priority:** MEDIUM | **Effort:** MEDIUM | **Value:** 8/10

### What It Displays
Two complementary views of Fama-French 5F + Momentum loadings:

**1. Quality Badges (top):**
```
┌──────────────────────────────────────────────┐
│ AVDV           │ AVUV          │ DGS ⚠️       │
│ R² 94.5% · 77m │ R² 88.5% 77m  │ R² 77.8% ⚠  │
│     [Good]     │  [Good]       │   [Weak]    │
└──────────────────────────────────────────────┘
```

**2. Factor Bar Chart:**
- X-axis: 7 factors (Mkt-RF, SMB, HML, RMW, CMA, Mom)
- Rows: One per ETF (SWRD, AVGS, AVEM, EIMI, etc.)
- Bars: Solid if |t-stat| > 2, opaque if not significant
- Colors: One per ETF

**Key Visual Cues:**
- R² color coding: Green (>0.95), Yellow (0.80–0.95), Red (<0.80)
- Opacity on bars: Significant vs not
- Tooltip on hover: R², t-stat, coefficient value

### Why It's Valuable
- **Factor exposure transparency**: Answers "does my SWRD really have SMB exposure?" with data
- **Quality flag (R²)**: Highlights when FF5 DM model fails (e.g., EIMI 66.1% — emerging markets not well-explained by DM factors)
- **Behavioral insight**: Shows actual factor tilts vs declared ETF category
- **Drawdown context**: During market stress, knowing your SMB/HML/RMW exposure helps anticipate behavior
- **Rebalancing discipline**: If tilt signals change, this table shows what flipped

### Current React Dashboard Gap
- Factor loadings exist as chart but not as quality table
- No R² badge system to flag weak explanatory power
- No significance indicators (t-stat visualization)
- Doesn't explain why some ETFs are hard to classify

### How to Implement in React
**Component:** `FactorLoadingsTable.tsx` + existing `FactorLoadingsChart.tsx`

**Data Structure:**
```json
{
  "factor_loadings": {
    "SWRD": {
      "alpha": 0.0089,
      "mkt_rf": 0.9288,
      "smb": -0.1118,
      "hml": -0.0924,
      "rmw": -0.1055,
      "cma": 0.066,
      "mom": 0.0077,
      "r2": 0.9678,
      "n_months": 79,
      "t_stats": {
        "alpha": 0.764,
        "mkt_rf": 34.753,
        "smb": -2.126,
        "hml": -1.864,
        "rmw": -1.821,
        "cma": 0.835,
        "mom": 0.258
      }
    }
  }
}
```

**Quality Badge Logic:**
```typescript
const getR2Color = (r2: number) => {
  if (r2 >= 0.95) return 'green';
  if (r2 >= 0.80) return 'yellow';
  return 'red';
};

const isTStatSignificant = (tStat: number) => Math.abs(tStat) > 2;
```

**CSS Pattern:**
- `.factor-table` — font-size: 0.78rem, border-collapse
- `.factor-table th` — text-align: right, uppercase, small cap
- Bar opacity: 1.0 if significant, 0.5 if not
- Tooltip on R² < 0.80: "Modelo FF5 DM explica mal este ETF"

**Estimated Effort:** 2-3 hours
- Extract R² badge display from chart
- Build quality card row
- Add significance indicators to chart bars
- Style tooltip warnings

**New Data Fields Needed:**
- Add to each factor loading: {r2, n_months, quality_status}
- No new fields strictly required; enhance existing `factor_loadings` JSON

---

## 6. WELLNESS ACTIONS BOX (Prioritized Improvement Checklist)
**Priority:** LOW-MEDIUM | **Effort:** SMALL | **Value:** 6/10

### What It Displays
A ranked list (1–3) of quick wins to improve wellness score:

```
┌─ Top ações para subir o score ───────────────┐
│                                              │
│ 1. P(FIRE) base (+11pts potencial)          │
│    Aumentar aporte mensal ou aguardar        │
│    crescimento patrimonial                   │
│                                              │
│ 2. Drift máximo (+5pts potencial)            │
│    Rebalancear bucket mais distante do       │
│    alvo no próximo aporte                    │
│                                              │
│ 3. IPCA+ gap vs alvo (+5pts potencial)       │
│    Continuar DCA em IPCA+ até atingir alvo   │
│                                              │
└──────────────────────────────────────────────┘
```

### Why It's Valuable
- **Operator motivation**: Shows what levers are available (vs "score is X, what now?")
- **Prioritized roadmap**: Ranked by impact potential (+11pts > +5pts)
- **Actionable**: Each action is concrete and achievable
- **Behavioral nudge**: Seeing "+11pts potencial" motivates aporte discipline

### Current React Dashboard Gap
- Wellness score exists but without actionable next steps
- No prioritization of improvements
- No "potential gain" quantification

### How to Implement in React
**Component:** `WellnessActionsBox.tsx`

**Data Structure:**
```json
{
  "wellness": {
    "score": 72,
    "actions": [
      {
        "rank": 1,
        "metric": "P(FIRE) base",
        "potential_pts": 11,
        "action": "Aumentar aporte mensal ou aguardar crescimento patrimonial"
      },
      {
        "rank": 2,
        "metric": "Drift máximo",
        "potential_pts": 5,
        "action": "Rebalancear bucket mais distante do alvo no próximo aporte"
      }
    ]
  }
}
```

**CSS Pattern:**
- `.actions-box` — background: rgba(234,179,8,.08), border: 1px rgba(234,179,8,.3)
- Numbered list with `.yellow` color for rank numbers
- Action text in smaller, muted color

**Estimated Effort:** 1.5 hours
- Extract wellness actions from config
- Build ranked list component
- Style with amber color scheme

**New Data Fields Needed:**
- `wellness.actions[]` — array of {rank, metric, potential_pts, action}

---

## COMPONENT MATRIX & PRIORITY ORDER

| Component | Priority | Effort | Value | Dependencies | Timeline |
|-----------|----------|--------|-------|--------------|----------|
| Semáforo Table | HIGH | 2–3h | 9/10 | data.json only | Sprint 1 |
| DCA Cards | HIGH | 2–3h | 8/10 | data.json, styling | Sprint 1 |
| Bond Pool | HIGH | 4–6h | 9/10 | ECharts, new data fields | Sprint 2 |
| HODL11 Band | MEDIUM | 1–2h | 7/10 | data.json only | Sprint 1 |
| Factor Table | MEDIUM | 2–3h | 8/10 | data.json, chart update | Sprint 2 |
| Wellness Actions | LOW-MEDIUM | 1–2h | 6/10 | data.json only | Sprint 3 |

---

## DATA WIRING CHANGES NEEDED

All new components require updates to `generate_data.py` (Python) and `dataWiring.ts` (TypeScript):

### Python Side (generate_data.py)
Add/enhance these sections:
1. **Semáforo triggers aggregation** — collect trigger status from portfolio state
2. **DCA status derivation** — determine Ativo/Pausado from rates vs pisos
3. **Bond pool calculation** — sum RF holdings, compute years of expenses
4. **Bond pool runway chart** — P10/P50/P90 projection (likely exists as MC output)
5. **Factor loadings R² + t-stats** — ensure these fields export cleanly
6. **Wellness actions ranking** — compute potential point gains per metric

### TypeScript Side (dataWiring.ts)
1. Add derived fields to `useDashboardData()` hook:
   ```typescript
   const semaforoTriggers = useMemo(() => deriveSemaforoTriggers(data), [data]);
   const dcaStatus = useMemo(() => deriveDcaStatus(data), [data]);
   const bondPoolReadiness = useMemo(() => deriveBondPoolReadiness(data), [data]);
   ```
2. Update Zustand store (`dashboardStore`, `uiStore`) to cache computed values
3. Add utility functions for color coding (verde/amarelo/vermelho logic)

### spec.json (Dashboard Schema)
Ensure new fields have proper schema validation:
```json
{
  "semaforo_triggers": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "id": {"type": "string"},
        "status": {"enum": ["verde", "amarelo", "vermelho"]}
      }
    }
  }
}
```

---

## PRIVACY & DARK MODE CONSIDERATIONS

### Privacy (`.pv` class)
Old dashboard uses `.pv` class to mask sensitive values:
```html
<span class="pv" data-pv-mask="••">R$3.59M</span>
```

**Recommendation:** Extend React privacy mode to new components:
```tsx
<PrivacyValue value={bondPool.valor_atual_brl} label="Valor atual" />
```

### Dark Mode
Old dashboard uses CSS variables (e.g., `var(--card2)`, `var(--accent)`).  
Current React dashboard likely has equivalent theme. Ensure new components:
1. Use existing Tailwind dark: classes
2. Avoid hardcoded colors
3. Test both light and dark modes

---

## CSS PATTERNS TO PRESERVE

Key design patterns from old dashboard worth porting:

1. **Border-left accent bars** (4–6px) for critical sections
2. **Grid auto-fit responsive**: `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`
3. **Collapsed/expanded chevron**: `::after { content: ' ▸' }` → `' ▾'` on open
4. **Category badges** (small pills): `font-size: 0.55rem, padding: 1px 5px, border-radius: 4px`
5. **Tabular-nums** font style for all numeric data
6. **Muted row styling**: Nested/secondary rows at 70–80% opacity
7. **Progress bars**: `transition: width 0.3s` for smooth updates

---

## IMPLEMENTATION ROADMAP (ESTIMATED TIMELINE)

### Sprint 1 (Week 1–2): Foundation + Quick Wins
- [ ] Semáforo Table component + data wiring
- [ ] DCA Status Cards component + styling
- [ ] HODL11 Band chart component
- **Output:** 3 high-value components, zero chart library changes

### Sprint 2 (Week 3–4): Chart Integration
- [ ] Bond Pool Readiness container + runway chart (ECharts)
- [ ] Factor Loadings quality badges + chart enhancement
- [ ] Update spec.json with new data schema
- **Output:** 2 major components requiring MC/chart integration

### Sprint 3 (Week 5–6): Polish + Deployment
- [ ] Wellness Actions Box component
- [ ] Full QA testing (privacy mode, dark mode, responsive)
- [ ] Update CLAUDE.md component registry
- [ ] Dashboard build + git push
- **Output:** Production-ready component library, all 6 components live

---

## RISK & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Data schema breaking changes | Medium | High | Validate spec.json before build; add schema tests |
| Responsive layout issues | Medium | Medium | Test on 320px, 768px, 1024px breakpoints early |
| Privacy mode coverage | Low | High | Code review all `.pv` masking; add unit tests |
| Chart library bloat | Low | Medium | Reuse existing ECharts patterns; avoid Chart.js dependency |
| Over-feature creep | Medium | Medium | Strict scope: only these 6 components; defer nice-to-haves |

---

## NEXT STEPS

1. **Review with Diego** — present this analysis; confirm priority + sprint timeline
2. **Spike: Data Wiring** — verify `generate_data.py` can produce all required fields; if gaps exist, update Python scripts first
3. **Spike: Component Library** — create reusable subcomponents (colored dots, progress bars, badge pills) in shared util
4. **Build Sprint 1** — Semáforo + DCA + HODL11 in parallel; integrate into "Now" tab
5. **Validate** — run dashboard test suite; compare visual output to old dashboard reference

---

## REFERENCES

**Old Dashboard:**
- Main file: `/Users/diegodemorais/claude/code/wealth/analysis/raw/DashHTML.html` (15.7k lines)
- Assets: `/Users/diegodemorais/claude/code/wealth/analysis/raw/DashHTML_files/` (Chart.js 4 + Sankey plugin)

**Current React Dashboard:**
- Type definitions: `/Users/diegodemorais/claude/code/wealth/react-app/src/types/dashboard.ts`
- Data schema: `/Users/diegodemorais/claude/code/wealth/dashboard/spec.json`
- Generation script: (referenced but not analyzed; likely in `/scripts/`)

**CSS Classes Reference:**
- `.semaforo-table`, `.semaforo-dot`, `.dca-card`, `.bond-pool-bar`, `.factor-table` (all from old HTML styles section)

---

**Analysis prepared by:** Dev Agent | **Status:** Ready for Team Review
