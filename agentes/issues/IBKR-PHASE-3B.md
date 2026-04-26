---
id: IBKR-PHASE-3B
titulo: Phase 3b — IBKR Data Integration & Remaining Audit Items
tipo: feature
dono: Bookkeeper + Dev + Quant
prioridade: 🔴 Alta
status: 📋 Backlog
criado: 2026-04-26
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

**O quê:** Calcular correlação rolling 90d entre BTC (Binance) e SWRD (Yahoo).

**Status:** btc_indicators.py preparado (30/04/26), mas:
- yfinance + numpy incompatibilidade (numpy.dtype size changed)
- Requer pip install --upgrade yfinance ou fix alternativo
- Fallback: correlação estimada histórica (0.70-0.75)

**Impacto:**
- Popula `correlation_90d` em btc_indicators.json
- Dashboard HODL11PositionPanel exibe "Diversificador quando <40%, Risco sistêmico quando >60%"
- +0.2 audit score (OPO 5 parcial)

**Deps:** yfinance setup, numpy fix

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
- [ ] Resolver yfinance + numpy incompatibilidade
- [ ] Calcular correlation_90d BTC/SWRD
- [ ] Adicionar 2 cenários ao MC
- [ ] Re-rodar 10k simulações
- [ ] Atualizar dashboard stress scenarios card
- [ ] Changelog Phase 3b completo
- [ ] Validar 10.0/10 final

---

**Criador:** Claude Head  
**Data:** 2026-04-26 16:57 BRT  
**Branch:** claude/pull-main-IW9VP (merge em main)
