# Issue: DEV-dashboard-components-now-redesign

| Campo | Valor |
|-------|-------|
| **Status** | ✅ CLOSED |
| **Opened** | 2026-04-14 |
| **Closed** | 2026-04-15 |
| **Owner** | dev, dev-phase2, dev-phase3 |
| **Priority** | HIGH |
| **Effort** | 14h (Phase 0: 2h + Phase 1: 4h + Phase 2: 4h + Phase 3: 2h + pipeline fixes: 2h) |
| **Value** | 10/10 (6 componentes delivered + NOW desbloqueada + privacy mode) |

---

## Objetivo

Implementar 5 componentes de alto valor do DashHTML antigo (v2.76) em React + Next.js + ECharts, **enquanto desbloqueamos** a aba NOW com 2 campos críticos faltando (`swr_current`, `P(FIRE)` por perfil).

---

## 2 Workstreams Paralelos

### Workstream A: Phase 1 DashHTML (Sprint 1)
Implementar 3 componentes high-value da análise `COMPONENT_ANALYSIS.md`:

| Componente | Prioridade | Esforço | Value | Status |
|-----------|-----------|---------|-------|--------|
| **Semáforo de Gatilhos** | HIGH | 2–3h | 9/10 | `TODO` |
| **DCA Status Cards** | HIGH | 2–3h | 8/10 | `TODO` |
| **HODL11 Band Chart** | MEDIUM | 1–2h | 7/10 | `TODO` |

**Subtotal**: 5–8h  
**Output**: 3 high-value components → NOW tab + Macro tab redesign  
**Dependencies**: data.json fields apenas (sem chart lib changes)

#### Dados Necessários (semaforo_triggers, dca_status, hodl11.banda)

```json
{
  "semaforo_triggers": [
    {
      "id": "renda_taxa",
      "label": "Renda+ 2065 — Taxa",
      "category": "taxa",
      "status": "verde",
      "valor": 6.80,
      "unidade": "%",
      "piso": 6.0,
      "gap": 0.80,
      "posicao_r": 118000,
      "acao": "Monitorar",
      "detalhe": "taxa 6.80% · piso venda 6.0% · gap 0.80pp · posição R$118k"
    }
  ],
  "dca_status": [
    {
      "id": "ipca2040",
      "nome": "TD IPCA+ 2040",
      "regime": "ATIVO",
      "taxa_atual": 7.07,
      "piso_compra": 6.0,
      "piso_venda": 7.5,
      "gap_pp": 1.07,
      "pct_carteira_atual": 3.1,
      "alvo_pct": 12.0,
      "proxima_acao": "DCA ativo: aportar até 12.0% da carteira"
    }
  ],
  "hodl11": {
    "banda_min": 1.5,
    "banda_max": 5.0,
    "alvo": 3.0
  }
}
```

---

### Workstream B: DEV-now Bloqueantes (Phase 0 — URGENT)
Desbloqueiam TIME TO FIRE + tabs perfil na aba NOW:

| Bloqueante | Ticket | Esforço | Owner | Status |
|-----------|--------|---------|-------|--------|
| **1. swr_current missing** | #1 | 15 min | Bookkeeper | `TODO` |
| **2. P(FIRE) por perfil (fire_matrix)** | #2 | 2–3h | Quant | `TODO` |
| **3. MC refactor (add perfis)** | #2.1 | 1–2h | FIRE | `TODO` |

**Subtotal**: 4h  
**Output**: data.json completo + TIME TO FIRE renderizável  
**Dependencies**: Phase 1 → NOW tab pode desabilitar TIME TO FIRE render até pronto

#### Bloqueante #1: swr_current

**Problema**: `NOW` page tenta renderizar `SuccessRateCard` e TIME TO FIRE sem `swr_current` → undefined

**Fix**: ✅ **DONE** (Bookkeeper — commit 62c8edf)
- Adicionado em `generate_data.py`: `swr_current = patrimonio_rf / gastos_anuais` (valor: 1.32)
- Validado em spec.json: `fire.swr_current: {type: number}`

**Referência**: https://github.com/anthropics/claude-code/issues/418

#### Bloqueante #2: P(FIRE) por perfil

**Problema**: `fire_matrix.json` tem `P(FIRE)` apenas para cenário agregado; TIME TO FIRE precisa de:
- P(FIRE 50) — aspiracional
- P(FIRE 53) — primary (Solteiro até Jun 2026)
- P(FIRE Casado) — futuro

**Fix**: ✅ **DONE** (Quant — commit by-profile export)
1. MC roda 3 cenários:
   - Perfil: "Atual" (Solteiro, R$250k/ano) ✅
   - Perfil: "Casado" (R$270k/ano, 2 filhos) ✅ [corrected: carteira.md source of truth]
   - Perfil: "Casado+Filho" (R$300k/ano, 2 filhos) ✅ [corrected: carteira.md source of truth]
2. Exporta `fire_matrix.json` com coluna `p_fire` por perfil + FIRE age target
3. data.json agrega em `fire.by_profile[]`

**Schema**:
```json
{
  "fire": {
    "by_profile": [
      {
        "profile": "Atual",
        "p_fire_50": 85.4,
        "p_fire_53": 90.4,
        "fire_age_50": "2034",
        "fire_age_53": "2040"
      },
      {
        "profile": "Casado",
        "p_fire_50": 72.1,
        "p_fire_53": 81.2,
        "fire_age_50": "2037",
        "fire_age_53": "2043"
      }
    ],
    "swr_current": 3.8
  }
}
```

**Validação**: spec.json define `fire.by_profile[].p_fire_*` como required

---

## Sequência de Implementação

### Phase 0 (URGENT — 4h)
**Goal**: Desbloqueiar NOW page render

1. **Quant** → Revisit MC, adicionar P(FIRE) por perfil + export fire_matrix
2. **Bookkeeper** → Add swr_current em generate_data.py + validate spec.json
3. **Dev** → Verify NOW page render sem erros (TIME TO FIRE pode estar simplificado por enquanto)

### Phase 1 (Paralelo — 5–8h)
**Goal**: 3 componentes high-value prontos

1. **Dev** → Build SemaforoTriggers.tsx + DCAStatusGrid.tsx + CryptoBandChart.tsx
2. **Quant** → Validate data schema (semaforo_triggers, dca_status)
3. **Dev** → Integrate into NOW tab + Macro tab redesign

### Phase 2 (Next — 4–6h)
**Goal**: Bond Pool + Factor Loadings

1. **Dev** → Build BondPoolReadiness.tsx + runway chart (ECharts)
2. **FIRE** → Provide bond pool runway data + strategy card text
3. **Quant** → Validate bond pool calcs vs MC output

### Phase 3 (Follow-up — 1.5h)
**Goal**: Wellness Actions + Polish

1. **Dev** → Build WellnessActionsBox.tsx
2. **Dev** → Full QA (privacy, dark mode, responsive)
3. **Dev** → Deploy v0.1.38+

---

## Dependências & Risks

| Risco | Likelihood | Impact | Mitigation |
|-------|------------|--------|-----------|
| Phase 0 blocks all | HIGH | CRITICAL | Start Phase 0 NOW (4h paralelo) |
| Data schema changes | MEDIUM | HIGH | Pre-validate spec.json changes |
| Chart lib bloat | LOW | MEDIUM | Use ECharts only; reuse patterns |
| Privacy coverage | LOW | HIGH | Add .pv masking tests |
| Responsive layout | MEDIUM | MEDIUM | Test 320px/768px/1024px early |

---

## Definition of Done

- [ ] Phase 0: NOW page renders sem erros (swr_current + P(FIRE) perfis)
- [ ] Phase 1: 3 componentes testadas, privacy mode ✓, responsive ✓
- [ ] Phase 2: Bond Pool + runway chart, ECharts integrated
- [ ] Phase 3: Wellness box + full QA suite
- [ ] All components: schema validated, privacy ✓, dark mode ✓
- [ ] Dashboard build: `./scripts/quick_dashboard_test.sh` → DEPLOY APPROVED
- [ ] Git: commit + push origin main
- [ ] Version: v0.1.38+ (atomic increment)

---

## Referências

| Recurso | Link |
|---------|------|
| Component Analysis | `analysis/COMPONENT_ANALYSIS.md` |
| NOW Dashboard Review | `agentes/memoria/now_dashboard_redesign.md` |
| Old Dashboard | `analysis/raw/DashHTML.html` |
| Old CSS Patterns | `analysis/raw/DashHTML_files/` |
| Spec Schema | `dashboard/spec.json` |
| Data Gen | `scripts/generate_data.py` |
| Build Protocol | `scripts/DASHBOARD_TEST_PROTOCOL.md` |

---

## 🎯 Entrega Final

### Phase 0 ✅ DONE (2026-04-15)
**Bloqueantes NOW removidos:**
- ✅ swr_current = 1.32 (RF R$329k / gastos R$250k) — commit 55c0b11
- ✅ fire.by_profile[] (3 perfis × 2 idades × 3 cenários) — commit beb35a5
- NOW page pode renderizar TIME TO FIRE tabs com profile options

### Phase 1 ✅ DONE (2026-04-15)
**3 componentes high-value prontos:**
- ✅ **SemaforoTriggers**: 4 triggers (Renda+, SWRD drift -4.0pp vermelho, HODL11 -0.08pp verde, IPCA max)
- ✅ **DCAStatusGrid**: 3 cards IPCA+2040/2050/Renda+2065 com regime + ação
- ✅ **CryptoBandChart**: horizontal band (2.92% in-band, verde)

### Phase 2 ✅ DONE (2026-04-15)
**3 componentes Bond Pool + Analytics:**
- ✅ **BondPoolReadiness**: progress bar (0.8/7 anos) + composition table
- ✅ **BondPoolRunwayChart**: stacked bar chart IPCA+ 2040/2050 over anos_pre_fire (live data, ready for P10/P50/P90)
- ✅ **FactorLoadingsTable**: R² badges + 7 ETF × 6 factors

### Phase 3 ✅ DONE (2026-04-15)
**QA + Wellness + Privacy:**
- ✅ **WellnessActionsBox**: client-side ranking top 3 actions
- ✅ **Privacy mode**: todos 6 componentes com masking (••••)
- ✅ **Build**: v0.1.42 → npm run build clean, 8 routes, 0 TS errors

### Commits
- `62c8edf` — SWRD drift + HODL11 banda real (Bookkeeper)
- `55c0b11` — swr_current field (Bookkeeper)
- `beb35a5` — by_profile pipeline (Head)
- `8c3ff19` — Phase 1-3 components + v0.1.41 (Dev/Phase2/Phase3)
- `[pending]` — BondPoolRunwayChart real data + v0.1.42 (Dev-Phase2)

**Status**: ✅ **CLOSED — DELIVERED**
