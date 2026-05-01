# DEV-dashboard-coherence — Auditoria de Coerência do Dashboard (Cálculos, Premissas, Dados)

**Dono:** Head (coordena RF + Quant)
**Prioridade:** 🔴 Alta
**Criado em:** 2026-04-09
**Status:** Concluída — 2026-04-09

## Objetivo

Auditoria completa do dashboard comparando o que é exibido com o que está no codebase. Foco em:
1. Cálculos — fórmulas no template.html vs scripts Python (fire_montecarlo, backtest, etc.)
2. Premissas — DATA.premissas vs PREMISSAS dict em fire_montecarlo.py, carteira.md, config.py
3. Dados de RF — taxas, valores, datas vs holdings.md e dashboard_state.json
4. Coerência entre seções — mesma variável exibida em locais distintos com valores diferentes?
5. Hardcoded remanescentes — valores que deveriam vir de DATA.* mas estão literais no JS

## Escopo

- `dashboard/template.html` — toda lógica JS de cálculo e exibição
- `dashboard/data.json` — snapshot de dados atual
- `scripts/generate_data.py` — pipeline de geração
- `scripts/fire_montecarlo.py` — premissas e lógica MC
- `scripts/config.py` — constantes e targets
- `agentes/contexto/carteira.md` — fonte de verdade estratégica
- `dados/holdings.md` — RF, taxas, posições

## Time

- **RF**: taxas IPCA+, Renda+, bond pool, guardrails, SWR
- **Quant**: fórmulas (Bollinger, CAGR, Sharpe, MC simplificado, fan chart, spending smile)
- **Head**: síntese, priorização de correções

## Output esperado

Lista de inconsistências encontradas com:
- Seção do dashboard afetada
- O que está sendo exibido vs o que deveria estar
- Fonte correta (arquivo + linha)
- Severidade: 🔴 Erro crítico / 🟡 Inconsistência / 🟢 Melhoria

## Resultado

**Auditoria realizada em 2026-04-09 — RF + Quant + DEV**

### Bugs Críticos Corrigidos (🔴)

| Bug | Seção | Antes | Depois | Fonte |
|-----|-------|-------|--------|-------|
| Fan chart ignora aportes | `buildFanChart()` | `med = pat0 * (1+r)^t` | `med = pat0*(1+r)^t + aporte_anual*((1+r)^t-1)/r` | fire_montecarlo.py — P50 subestimado ~40% sem aportes |
| Fan chart P10/P90 heurística | `buildFanChart()` | spread fixo 0.15/0.20 | Calibrado com MC endpoints do `data.json` (pat_p10/p90 do fire53) | scenario_comparison.fire53 |
| Labels income chart hardcoded | `buildIncomeChart()` | `'Go-Go (53–68)'` literal | `'Go-Go (${ageAlvo}–${ageAlvo+15})'` dinâmico | DATA.premissas.idade_fire_alvo |
| inssInicio fallback errado | `buildIncomeTable()` | `?? 65` (idade absoluta errada) | `?? 12` (anos pós-FIRE correto) | fire_montecarlo.py: inss_inicio_ano = 12 |

### Inconsistências Corrigidas (🟡)

| Item | Antes | Depois |
|------|-------|--------|
| Savings Rate fórmula | `aporte / (aporte + custo)` = 54.6% | `aporte / renda_estimada` = 55.6% — usa `DATA.premissas.renda_estimada` |
| `rendaAtiva` hardcoded | `45000 * 12` literal | `(DATA.premissas.renda_estimada ?? 45000) * 12` |
| Hero savings rate | mesma fórmula errada | corrigida para `aporte / renda_estimada` |

### Itens OK (🟢) — não requerem ação

- Pisos de cascade: pisoIpca=6.0%, pisoRenda=6.5%, pisoVenda=6.0% — corretos
- Guardrails tiers: 4 níveis + GASTO_PISO=R$180k — corretos
- Spending Smile valores: R$242k/200k/187k — corretos (antigos R$280k/225k já corrigidos)
- Bond pool meta: 7 anos — correto
- INSS anual: R$18k — correto
- SWR FIRE Day: custo_vida_base / patrimonio_gatilho = 1.87% — correto
- Bollinger sigma: populacional (N) — correto
- Contribution slider formula: iterativa com aporte mensal — correto
- Guardrails patrimônio gatilho: `pat_atual * (1 - drawdown_min)` — correto

### Itens Monitorar (não corrigidos nesta sessão)

| Item | Nota |
|------|------|
| `patrimonio_atual` diverge entre fontes | data.json=R$3.47M (posições ao vivo, mais correto) vs fire_montecarlo.py=R$3.37M (hardcoded). Aceitar divergência — data.json é mais atual. Atualizar fire_montecarlo.py na próxima sessão |
| `cambioInicio` fallback 3.79 | Câmbio ago/2019 era ~R$4.0, não R$3.79. Impacto <0.4pp no CAGR BRL. Adicionar `cambioInicio` ao generate_data.py na próxima revisão |
| taxa IPCA+ 2040: 7.20 vs 7.21% | 1bp de truncamento. Sem impacto operacional (>= piso 6.0%) |
| spendingSensibilidade 3-4pp baixa | data.json usa pat R$3.47M enquanto carteira.md foi calculada com R$3.37M. Recalcular com fire_montecarlo.py |

**Dashboard rebuilado: v1.103 (2026-04-09)**
