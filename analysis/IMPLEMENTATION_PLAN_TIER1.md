# Tier-1 Critical Implementation Plan

**Status:** In Progress  
**Start Date:** 2026-04-14  
**Target Completion:** 2026-04-18 (5 days)

---

## Overview

Three components are **critical blockers** before any dashboard deployment:

1. **Semáforos de Gatilhos** — Unified trigger status dashboard
2. **DCA Status Card Grid** — Active regime visibility  
3. **Guardrails de Retirada** — Decision rules engine

All three are **HIGH-FIDELITY ports** of old HTML dashboard with exact formatting, colors, and interactivity.

---

## Component 1: Semáforos de Gatilhos

### Data Schema Required

```python
# In generate_data.py → output to data.json
semaforo_triggers = [
  {
    "id": "renda_plus_taxa",
    "label": "Renda+ 2065 — Taxa",
    "category": "taxa",  # taxa|posicao|crypto
    "status": "verde",    # verde|amarelo|vermelho
    "valor": 6.80,
    "unidade": "%",
    "piso": 6.0,
    "gap": 0.80,
    "posicao_r": 118000,
    "acao": "Monitorar",
    "detalhe": "taxa: 6.80% · piso venda 6.0% · gap 0.80pp · posição R$118k"
  },
  # ... 3 more triggers
]
```

### Visual Specifications

**Table Structure:**
- 4 rows (triggers)
- 4 columns: Gatilho | Status | Valor | Ação
- Gatilho column: Name + category badge (cyan/purple/yellow) + sub-details muted

**Colors (CSS variables):**
- Verde: `#22c55e`
- Amarelo: `#eab308`
- Vermelho: `#ef4444`
- Category badges:
  - Taxa: `rgba(6, 182, 212, 0.15)` text `#06b6d4`
  - Posição: `rgba(168, 85, 247, 0.15)` text `#a855f7`
  - Crypto: `rgba(234, 179, 8, 0.15)` text `#eab308`

**Formatting:**
- Font: `font-variant-numeric: tabular-nums` for all numeric columns
- Font size: `.75rem` for row values, `.65rem` for sub-details
- Collapsible: default open, chevron toggle with animation

**Componentshadcn/ui:**
- `<Collapsible>` wrapper
- `<Table>` + `<TableRow>` + `<TableCell>`
- `<Badge variant="taxa" | "posicao" | "crypto">`
- Status dot: custom `<StatusDot status="verde|amarelo|vermelho" />`

---

## Component 2: DCA Status Card Grid

### Data Schema Required

```python
dca_status = [
  {
    "id": "ipca2040",
    "nome": "TD IPCA+ 2040",
    "regime": "ATIVO",  # ATIVO|PAUSADO
    "taxa_atual": 7.07,
    "piso_compra": 6.0,
    "piso_venda": null,  # only for Renda+
    "gap_pp": 1.07,
    "pct_carteira_atual": 3.1,
    "alvo_pct": 12.0,
    "proxima_acao": "DCA ativo: aportar em TD 2040 (80% do bloco IPCA+) ate 12.0% da carteira"
  },
  # ... 2-3 more
]
```

### Visual Specifications

**Grid Layout:**
- `grid-auto-fit: minmax(260px, 1fr)`
- Gap: 8px
- Responsive: collapses to 1 column at <768px

**Card Structure (per component):**
```
┌─────────────────────────────┐
│ TD IPCA+ 2040  [ATIVO]      │ (ATIVO=green, PAUSADO=muted)
├─────────────────────────────┤
│ Taxa atual      7.07%       │
│ Piso compra     6.0%        │
│ Gap vs piso     1.07pp ✓    │ (green if >0.5pp, yellow otherwise)
│ % carteira      3.1% / 12%  │
├─────────────────────────────┤
│ DCA ativo: aportar...       │ (muted, .68rem)
└─────────────────────────────┘
```

**CSS Details:**
- Border-left accent: 3px solid (green if ATIVO, gray if PAUSADO)
- Paused state: opacity 0.6, background dimmer
- Font: `font-variant-numeric: tabular-nums` for alignment
- Sub-text: `font-size: .68rem; color: var(--muted);`

**Componentshadcn/ui:**
- `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">` for cards
- Each card: `<Card className="border-l-4">`
- Status badge: custom `<DCARegimeBadge regime="ATIVO" />`

---

## Component 3: Guardrails de Retirada

### Data Schema Required

```python
guardrails_retirada = [
  {
    "id": "guardrail_high",
    "guardrail": "High Guardrail",
    "condicao": "P(FIRE) ≥ 95%",
    "acao": "Acelere retirada (2.5% real mínimo)",
    "prioridade": "EXPANSIVO"
  },
  {
    "id": "guardrail_normal",
    "guardrail": "Normal Guardrail",
    "condicao": "80% ≤ P(FIRE) < 95%",
    "acao": "Mantenha SWR base (3.0%)",
    "prioridade": "MANTÉM"
  },
  {
    "id": "guardrail_low",
    "guardrail": "Low Guardrail",
    "condicao": "P(FIRE) < 80%",
    "acao": "Reduza gastos 10% ou pausar retirada",
    "prioridade": "DEFESA"
  },
  # ... guardrails for spending
]
```

### Visual Specifications

**Table Structure:**
- 3 rows (3 guardrails)
- 4 columns: Guardrail | Condição | Ação | Prioridade Badge
- Color-coded rows: green (high) | blue (normal) | red (low)

**Row Styling:**
- High: `background: rgba(34, 197, 94, 0.1)` (green accent)
- Normal: `background: rgba(59, 130, 246, 0.1)` (blue accent)
- Low: `background: rgba(239, 68, 68, 0.1)` (red accent)

**Priority Badges:**
- EXPANSIVO: green
- MANTÉM: cyan
- DEFESA: red

**Componentshadcn/ui:**
- Collapsible wrapper
- `<Table>` structure
- Priority badge variant

---

## Implementation Steps

### Step 1: Setup (2 hours)
- [ ] Finalize shadcn/ui components (Button, Card, Badge, Table, Collapsible)
- [ ] Create shared `<StatusDot />` and `<DCARegimeBadge />` components
- [ ] Create `<TriggerTable />`, `<DCACardGrid />`, `<GuardrailsTable />` shells

### Step 2: Data Generation (3 hours)
- [ ] Implement `semaforo_triggers[]` in `generate_data.py`
- [ ] Implement `dca_status[]` in `generate_data.py`
- [ ] Implement `guardrails_retirada[]` in `generate_data.py`
- [ ] Validate output in `dashboard/data.json`

### Step 3: React Components (6 hours)
- [ ] Create `SemaforoTriggers.tsx` with exact formatting
- [ ] Create `DCAStatusGrid.tsx` with card layout
- [ ] Create `GuardrailsRetirada.tsx` with table + styling
- [ ] Integrate with `dataWiring.ts` (if derived values needed)

### Step 4: Add to Dashboard (2 hours)
- [ ] Add to `spec.json` (3 new block entries)
- [ ] Add to "now" tab layout
- [ ] Add to "retiro" tab layout

### Step 5: Testing & Validation (2 hours)
- [ ] Run `./scripts/quick_dashboard_test.sh`
- [ ] Visual inspection: colors, fonts, responsive
- [ ] Privacy mode testing (`.pv` class masking)
- [ ] Add to test suites if needed

---

## Key Formatting Rules (Copy-Paste Reference)

```css
/* Tabular Numbers (for alignment) */
font-variant-numeric: tabular-nums;

/* Color Palette */
--verde: #22c55e;
--amarelo: #eab308;
--vermelho: #ef4444;
--cyan: #06b6d4;
--purple: #a855f7;

/* Status Badge Background + Text */
.taxa { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
.posicao { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.crypto { background: rgba(234, 179, 8, 0.15); color: #eab308; }

/* Font Sizes */
.row-label: 0.75rem;
.row-value: 0.75rem (tabular-nums);
.sub-detail: 0.65rem–0.68rem (muted);
.badge: 0.55rem (font-weight: 700);

/* Collapsible Chevron Animation */
@keyframes chevron-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(90deg); }
}
.collapsed .chevron { animation: chevron-rotate 0.2s ease-out; }
```

---

## Quality Checklist (Pre-Deploy)

- [ ] **Formatting:** Font sizes, tabular-nums, color alignment
- [ ] **Responsive:** 320px, 768px, 1024px viewports  
- [ ] **Dark Mode:** All colors visible in dark theme
- [ ] **Privacy:** `.pv` masking works (values → ••••)
- [ ] **Collapsible:** Smooth chevron animation + state persistence
- [ ] **Numbers:** All values formatted correctly (%, pp, R$, etc.)
- [ ] **Badges:** Category badges show correct colors + text
- [ ] **Status Dots:** Verde/amarelo/vermelho dots align + render
- [ ] **Accessibility:** Tab order, ARIA labels for collapsible
- [ ] **Data Validation:** Run `python3 scripts/validate_data_comprehensive.py`

---

## Next Actions

1. **Now:** Create base React components + shadcn/ui setup ✓
2. **Today:** Implement `generate_data.py` updates
3. **Tomorrow:** Build 3 React components (TriggerTable, DCAGrid, GuardrailsTable)
4. **Day 3-4:** Integration + testing + responsive fixes
5. **Day 5:** QA + deploy to main

---

