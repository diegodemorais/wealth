# DEV-shadow-allocation-series — Shadow Portfolios em Alocação Total (série histórica)

**Status:** Doing
**Dono:** Dev (com Head + CIO)
**Aberta:** 2026-05-03
**Componente afetado:** `BacktestChart` (aba ANALYSIS) — `react-app/src/components/charts/BacktestChart.tsx` + pipeline

---

## Contexto

Componente "Shadow Portfolios — Target vs VWRA" hoje mostra apenas 2 linhas (Target equity 50/30/20 vs VWRA), ambas em escopo **equity-only**. Diego pediu expansão para **alocação total** com **série histórica real**, incluindo "Atual com Legados" (carteira real ao longo do tempo, com transitórios EIMI/AVES/AVUV/AVDV/DGS/USSC/IWVL/JPGL).

CIO definiu framing semântico (4 portfolios em alocação total). Architect mapeou pipeline existente e desenhou plano sem duplicação.

---

## Decisões aprovadas (Head + CIO + Diego, 2026-05-03)

| # | Decisão | Valor |
|---|---------|-------|
| 1 | Escopo | **Alocação total** (não intra-equity) |
| 2 | "Atual com Legados" — fonte | Série histórica mensal real desde 2021-04 (`dados/retornos_mensais.json:acumulado_pct`, TWR Modified Dietz já calculado). **Inclui COE+empréstimo XP net e IPCA+ 2029 reserva** (são patrimônio real). |
| 3 | Target alocação-total — pesos | 79% equity (SWRD 50 / AVGS 30 / AVEM 20) + 15% IPCA+ + **3% HODL11** + **3% Renda+ 2065 (fixo)** = 100% |
| 4 | Renda+ 2065 pré-2023 (não existia) | **Proxy IPCA+ 2040** com nota metodológica em `_provenance` |
| 5 | Target pré-2024-12 (1ª compra UCITS) | Curva desde **2021-04** usando proxies acadêmicos do Regime 5/6 (DFSVX/DISVX/DFEMX) — label "Target (proxy)" tracejado fino no início, sólido a partir de 2024-12 |
| 6 | Local dos dados | Novo script `scripts/reconstruct_allocation_series.py` → `dados/allocation_series.json` → mesclado em `data.backtest.allocation` |
| 7 | Componente | **Estender** `BacktestChart.tsx` in-place com prop opcional `series` (retro-compat) |
| 8 | Footer obrigatório anti-regret | "Realizar gap Atual→Target = IR 15% sobre ganho que destrói premium fatorial líquido (alpha 0.16%/ano)" |

---

## Linhas finais a exibir (5)

| Linha | Definição | Cor / estilo |
|-------|-----------|--------------|
| **Atual com Legados** ⭐ | TWR mensal real desde 2021-04 (rebase 100) | `EC.accent`, area, protagonista |
| **Target (alocação total)** | 79% equity blend + 15% IPCA+ + 3% HODL11 + 3% Renda+ | `EC.muted`, sólida (tracejada pré-2024-12) |
| **Shadow A** (VWRA) | 100% MSCI ACWI | tracejada |
| **Shadow B** (100% IPCA+ 2040) | (1+IPCA_mensal)*(1+7.16%/12)−1 | tracejada |
| **Shadow C** (benchmark justo) | 79% VWRA + 15% IPCA+ + 3% HODL11 + 3% Renda+ | tracejada |

(Sem-Legados omitido — opcional. Se trivial, adicionar; se exigir reconstrução do book, deferir para v2.)

---

## Métricas a comparar (ordem de prioridade)

1. **Drift por sleeve SWRD/AVGS/AVEM em pp** — informa próximo aporte
2. TWR cumulativo desde 2024-01-01 (1ª compra UCITS)
3. CAGR e Max DD no mesmo período
4. Composição factor (size/value/profitability) e regional (DM/EM/US) — *por que* Atual deriva do Target
5. Sharpe (opcional)

---

## Fases (push em cada uma)

### Fase 1 — Pipeline (dados + integração JSON)

- [x] **P1** [Médio] Criar `scripts/reconstruct_allocation_series.py` com funções:
  - `load_atual_series()` — de `retornos_mensais.json:acumulado_pct`
  - `fetch_ipca_mensal_history(start)` — BCB SGS série 433 com `fetch_with_retry` + cache
  - `fetch_vwra_brl_history(start)` — pattern de `_download_monthly_returns` + câmbio
  - `fetch_btc_brl_history(start)` — yfinance BTC-USD × USD/BRL
  - `fetch_renda_plus_mtm_history(start)` — fallback IPCA+ 2040 pré-2023
  - `build_target_alocacao_total()` — blend 79/15/3/3 com pesos canônicos
  - `build_shadow_b()`, `build_shadow_c()`, `build_sem_legados()` (opcional)
  - Persistência via `append_only.write_with_meta()` versão `alloc-v1`
- [x] **P2** [Trivial] Adicionar `target_alocacao_total = {equity: 0.79, ipca_plus_2040: 0.15, hodl11: 0.03, renda_plus_2065: 0.03}` em `scripts/parse_carteira.py` + `dados/carteira_params.json`
- [x] **P3** [Trivial] Integrar em `scripts/generate_data.py:get_backtest()`: carregar `allocation_series.json` e mesclar como `backtest["allocation"]`
- [x] **P4** [Trivial] Schema assertion em `generate_data.py` final: `assert "allocation" in data["backtest"]` + chaves esperadas
- [x] **P9** [Trivial] Novo `scripts/tests/test_allocation_series.py`: invariantes (todas começam em 100, Atual ≡ acumulado_pct rebase, Shadow C ≈ blend de A+B+HODL+Renda)
- [x] **P10** [Trivial] Atualizar `scripts/release_gate_sanity.py` ANTI_CLIFF_SERIES: 5 entradas para `backtest.allocation.{atual_com_legados,target_alocacao_total,shadow_a,shadow_b,shadow_c}` com `max_abs_change=30.0`
- [x] **Gate** `bash scripts/release_gate.sh` verde
- [x] **Push** `git push -u origin main`

Fase 1 push: 11025fe 2026-05-03

### Fase 2 — Frontend (componente + página + spec)

- [x] **P5** [Médio] Estender `react-app/src/components/charts/BacktestChart.tsx` com prop `series?: Array<{name, key, color, style?}>`. Retro-compat: sem prop → comportamento atual. Generalizar `filterByPeriod` para N séries.
- [x] **P6** [Trivial] `react-app/src/app/backtest/page.tsx` (`AllocationHistoricoSection`): se `data.backtest.allocation` presente, mostra 5 séries. Período "since2021" adicionado. **Footer anti-regret presente.**
- [x] **P7** [Trivial] `dashboard/spec.json`: bloco novo `id: "backtest-allocation-total"` com `data_fields` listando todos `backtest.allocation.*`.
- [x] **P8** [Trivial] `react-app/src/components/charts/__tests__/BacktestChart.test.tsx`: 9 testes — 5 séries, nomes canônicos, área protagonista, dashed shadows, retro-compat, render guard.
- [x] **P11** [Trivial] Changelog entry em `react-app/src/config/changelog.ts` (datetime `2026-05-05T11:18:40-03:00`), tab=`backtest`, anchor=`backtest-allocation-total`.
- [x] **Gate** `bash scripts/release_gate.sh` verde — TS ✓ Build ✓ Playwright 131/131 ✓ Vitest 830/830 ✓ Sanity 30/30 ✓
- [x] **Push** commit `88366c83` → `git push origin main` (deploy automático)

Fase 2 push: 88366c83 2026-05-05

---

## Critério de Done

- [x] BacktestChart em ANALYSIS mostra 5 séries em alocação total com período padrão "since2021" e seletor "3 anos / Tudo"
- [x] Atual com Legados é a série protagonista (cor accent, area)
- [x] Footer anti-regret visível
- [x] Pipeline E2E + Playwright + vitest verdes nas 2 fases
- [x] 2 pushes em main com release gate verde
- [ ] Issue movida para Done no board, arquivo movido para `archive/`
