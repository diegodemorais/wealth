---
id: IBKR-PHASE-3B
titulo: Phase 3b — IBKR Data Integration & Remaining Audit Items
tipo: feature
dono: Bookkeeper + Dev + Quant
prioridade: 🔴 Alta
status: 🔄 Em progresso
criado: 2026-04-26
atualizado: 2026-04-27
---

## Objetivo

Completar Phase 3a → Phase 3b: integração IBKR data + cenários stress estendidos para atingir 10.0/10 (vs 9.4/10 atual).

## Blockers (Críticos)

### 1. Realized PnL via IBKR — `ibkr_sync.py` + Flex Query

**O quê:** Gerar `realized_pnl.json` com ganhos/perdas consolidados por lote (FIFO) para dashboard DARF section.

**Status:** ibkr_sync.py existe, mas:
- Requer `flex_query.xml` parseado (213 lotes em 2026-04-22)
- Ou acesso direto ndcdyn endpoint (autenticação OAuth)
- CSV fallback: `dados/ibkr_positions.csv`

**Impacto:** 
- Ativa DARF panel no Portfolio page
- Calcula IR diferido para tax snapshot
- Enables reconciliar 3-layer (ibkr_sync vs CSV vs input)

**Deps:** IBKR credentials, flex query acesso

---

### 2. BTC/SWRD Correlation 90-day

**O quê:** Calcular correlação rolling 90d entre BTC (Binance) e SWRD (Irlanda UCITS).

**Status:** ✅ RESOLVIDO COMPLETO (2026-04-27)
- Yahoo Finance v8 API (`query1.finance.yahoo.com/v8/finance/chart/SWRD.L`) — sem pandas, só `requests` + `numpy`
- Correlação **live** 0.3297 (33%) — não mais estimativa de 72%
- Série temporal: 244 pontos (1 ano rolling)
- Chart ECharts implementado no HODL11PositionPanel com linhas de referência 40%/60%

**Implementado:**
- `btc_indicators.py`: `fetch_swrd_prices_historical()` via Yahoo Finance v8 + `compute_correlation_90d()` retorna série
- `btc_indicators.json`: `correlation_90d: 0.3297`, `correlation_series: [244 pontos]`
- `HODL11PositionPanel.tsx`: `CorrelationChart` sub-component com EChart 110px, `onChartReady` hidden container pattern

**Impacto:**
- ✅ `correlation_90d: 0.33` (vs 0.72 stale) = BTC está em zona Diversificador (<40%)
- ✅ Chart temporal 1 ano com interpretação ao vivo
- ✅ `DATE_FORMAT_YMD` NameError corrigido em `btc_indicators.py` e `ibkr_lotes.py`
- ✅ 563/563 testes passando (chart hidden-container pattern fixo)

**Deps:** Resolvido sem deps adicionais

---

### 3. MC Re-run com Cenários Estendidos (Stagflation + Hyperinflation)

**O quê:** Rodar `fire_montecarlo.py` com 2 cenários adicionais:
- **Stagflation:** IPCA +10%, Equity 0%, IPCA+ cai para 4.5%
- **Hyperinflation:** IPCA +15%, Equity -15%, IPCA+ 3%, BRL -8%/a

**Status:** Premissas em carteira.md (HD-006), mas MC limitado a 3 cenários (base/fav/stress).

**Impacto:**
- P(FIRE) em cada cenário
- Dashboard stress scenarios card: "Base 78.8% | Fav 85% | Stress 72% | Stagflation 68% | Hyper 55%"
- +0.3 audit score (OPO 1)

**Deps:** IBKR data (asset correlations em stress), MC recompile

---

## Resolvido Nesta Sessão (2026-04-27)

- ✅ **IR diferido:** `tax.ir_diferido_total_brl = R$169,155` sobre 9 ETFs (4 falhas schema-validation fixas)
  - Causa raiz: `dados/tax_snapshot.json` stale com IR R$0 (posicoes vazia em dashboard_state.json)
  - Fix: deletar snapshot → `generate_data.py` recalcula via TaxEngine com posicoes de ibkr/lotes.json
- ✅ **factor_signal:** `swrd_ytd_pct`, `avgs_ytd_pct`, `excess_ytd_pp`, `excess_since_launch_pp` em data.json
  - Causa raiz: `factor_cache.json` existia sem `factor_signal` key, impedindo o fallback de rodar
  - Fix: rodar `generate_data.py` sem `--skip-scripts` → yfinance computa AVGS vs SWRD YTD + since launch
- ✅ **Testes:** 563 passed | 32 skipped (0 falhas, vs 4 falhas anteriores)
- ✅ **ibkr_lotes.py:** `DATE_FORMAT_YMD` importado de config (fix NameError pré-existente)

## Oportunidades (Média Prioridade)

- **OPO 5: Timestamps** (+0.2): Adicionar `timestamp` fields a PTAX/RF/HODL11 em data.json
  - Simple: 2h wiring + dashboard inline displays
  - Status: Code-ready, aguarda data structure enhancement

---

## Impacto na Auditoria

| Item | Score Atual | Score Completo | Gap |
|------|------------|----------------|-----|
| Data Freshness | 8/10 | 9/10 | +1 (IBKR real-time sync) |
| Consistency | 9/10 | 9/10 | +0 (IBKR validates reconciliation) |
| Compliance Lei 14.754 | 8/10 | 9/10 | +1 (realized_pnl + DARF pipeline) |
| FIRE Communication | 8/10 | 10/10 | +2 (stress scenarios + risk language) |
| **OVERALL** | **9.4/10** | **10.0/10** | **+0.6** |

---

## Sequência Recomendada

1. **Semana 1:** IBKR flex_query.xml parseado → realized_pnl.json live
2. **Semana 2:** yfinance fix + BTC/SWRD correlation (OPO 5 wiring)
3. **Semana 3:** MC re-run cenários estendidos + stress quantificado
4. **Semana 4:** Dashboard updates + changelog Phase 3b

---

## Não Bloqueadores (Prosseguir em 3a)

- ✅ Capital Humano doc (B1): FEITO
- ✅ Guardrails viz (OPO 3): FEITO
- ✅ Aspiracional vs Base (OPO 4): FEITO
- ✅ HODL11 warning (OPO 6): FEITO
- ✅ Guardrails vs MC metodologia (B2): FEITO
- ✅ P(FIRE) percentiles (OPO 2): Já excelente

---

## Checklist

- [ ] Obter flex_query.xml de IBKR ou expandir sync
- [ ] Parsear 213 lotes → realized_pnl.json
- [ ] Testar DARF panel no Portfolio
- [x] ~~Resolver yfinance + numpy incompatibilidade~~ (Yahoo Finance v8 direto, sem pandas conflict)
- [x] ~~Calcular correlation_90d BTC/SWRD~~ (live 33%, série 244 pts, chart implementado)
- [x] ~~tax.ir_diferido_total_brl~~ (R$169,155 sobre 9 ETFs)
- [x] ~~factor_signal~~ (AVGS vs SWRD YTD + since launch)
- [x] ~~4 falhas schema-validation~~ (563/563 testes ✓)
- [ ] Adicionar 2 cenários ao MC (stagflation + hyperinflation)
- [ ] Re-rodar 10k simulações com cenários estendidos
- [ ] Atualizar dashboard stress scenarios card
- [ ] OPO 5: timestamps PTAX/RF/HODL11 em data.json
- [ ] Changelog Phase 3b completo
- [ ] Validar 10.0/10 final

---

**Criador:** Claude Head  
**Data:** 2026-04-26 16:57 BRT  
**Branch:** claude/pull-main-IW9VP (merge em main)
