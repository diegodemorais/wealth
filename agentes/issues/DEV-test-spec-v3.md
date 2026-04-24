# DEV-test-spec-v3.md — Especificação Consolidada de Testes por Domínio

**Status**: Consolidação de 6 especialistas (Fire, Quant, Factor, RF, FX, Macro)
**Data**: 2026-04-24
**Alvo**: QA implementa todas as fases até conclusão; Quant valida ao final

---

## Execução por Fase

### **Phase 1: Fundação Numérica (Quant)**

Validar que todos os cálculos matemáticos fundamentais estão corretos. Sem Phase 1 passing, as demais fases falharão.

**Componentes validados**:
- `fire.ts`: `calcFireYear`, `calcReverseFireAporte`, `pfireColor`
- `montecarlo.ts`: `runMCTrajectories`, `runMC`, `runMCYearly`, `getPercentileAtMonth`, `computePercentiles`
- `formatters.ts`: `fmtBrl`, `fmtPct`, `fmtBrlM`, `fmtDelta`
- Scripts: `parse_carteira.py`, `config.py`, `test_reconstruct_history_twr.py`

**Testes críticos** (16 prioritários):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| P1-T01 | calcFireYear base Diego | pat=3.47M, aporte=25k, r=4.85%, idade=39→53 | ano=2040, idade=53 | ±1 ano |
| P1-T02 | calcFireYear meta atingida | pat=8.33M (>alvo) | aporte<0, metaAtingida=true | booleano |
| P1-T03 | calcReverseFireAporte Diego | pat=3.47M, age 39→53, gasto=250k, SWR=3% | aporte≈6.8k/mês | ±R$200 |
| P1-T04 | buildWealthGrowthData terminação | chartData.length=168 | chartData[167].pat ≈ 8.33M ± 0.5% | ±0.5% |
| P1-T05 | fmtBrl formatting | val=3472335, null, 0, -500 | "R$ 3.472.335,00", "—", "R$ 0,00", "R$ -500,00" | exato |
| P1-T06 | fmtPct fracao → percentual | 0.0485, 1.0, 0 | "4,85%", "100,00%", "0,00%" | exato |
| P1-T07 | runMCTrajectories reproducível | seed=42, numSims=10, years=14 | rodar 2x → identicas | byte-exact |
| P1-T08 | MC percentis ordenação | qualquer mes | P10[t] ≤ P50[t] ≤ P90[t] | sempre true |
| P1-T09 | Modified Dietz pesos | dia 1 em 31 dias | w=30/31=0.9677 | ±0.00001 |
| P1-T10 | CAGR anualizado | pat: 1M→1.4846M em 5 anos | CAGR=8.23% | ±1bp |
| P1-T11 | TWR_BRL composicao | TWR_USD=12.88%, FX=+3.1% | TWR_BRL=16.39% | ±0.05% |
| P1-T12 | pfireColor thresholds | 92%, 87%, 80% | verde, amarelo, vermelho | exato |
| P1-T13 | calcFireYear retorno=0 | r=0, aporte=25k | converge se aportes suficientes | lógico |
| P1-T14 | runMCTrajectories desvio | returnStd=16.8% | monthlyStd≈4.85% | ±0.5pp |
| P1-T15 | successRate intervalo | qualquer params | 0 ≤ successRate ≤ 1 | sempre true |
| P1-T16 | progPct escala | pat=3.47M, alvo=8.33M | progPct=41.67% | ±0.01% |

**Status**: ✅ Testes começam imediatamente após consolidação

---

### **Phase 2: Guardrails FIRE (Fire)**

Validar que os guardrails de retirada pós-FIRE implementam exatamente o schema aprovado.

**Componentes validados**:
- `ReverseFire.tsx`: `calcReverseFireAporte`, milestone FIRE Day
- `FirePage.tsx`: P(FIRE) hero, heroes, cenários
- `KpiCard.tsx`: progress bar, accent color
- `GuardrailsRetirada.tsx`: bandas de drawdown e retirada
- `FloorUpsideFire.tsx`: cobertura fase 1, Bond Pool Readiness

**Regra central**: 4 bandas de guardrail conforme carteira.md §Guardrails

| Drawdown | Retirada | Prioridade |
|---|---|---|
| 0-15% | R$250k | MANTÉM |
| 15-25% | R$225k | DEFESA |
| 25-35% | R$200k | DEFESA |
| >35% | R$180k (piso) | DEFESA |

**Testes críticos** (13):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| P2-T01 | Guardrail banda 0 | drawdown=0.10 | retirada=R$250k | exato |
| P2-T02 | Guardrail banda 1 | drawdown=0.20 | retirada=250k×0.90=R$225k | exato |
| P2-T03 | Guardrail banda 2 | drawdown=0.30 | retirada=250k×0.80=R$200k | exato |
| P2-T04 | Guardrail piso | drawdown=0.40 | retirada=R$180k | exato |
| P2-T05 | Guardrail upside | drawdown=-0.25 | retirada=250k×1.10=R$275k | exato |
| P2-T06 | FloorUpsideFire fase 1 | pat=3.47M, gasto=250k | cobertura≈100% (ja cobre) | ±2pp |
| P2-T07 | Bond Pool Readiness | rfTotal=329k | anos≈1.32, readiness≈18.8% | ±3% |
| P2-T08 | P(FIRE) base ≥85% | threshold PLANO_PERMANECE | 86.4% ≥ 85% | ✓ |
| P2-T09 | P(FIRE) stress ≥75% | criterion falsificacao | 82.5% ≥ 75% | ✓ |
| P2-T10 | FIRE Day marker | chartData | ultimo ponto exibe "FIRE aos 53" | exato |
| P2-T11 | KpiCard accent color | pfire=90.4% | accent=var(--green) | exato |
| P2-T12 | KpiCard progress clamped | progress=-0.1, 1.5 | width: 0%, 100% | exato |
| P2-T13 | FirePage P(FIRE) hero | pfireBase=90.4 | exibe "90,4%" (sem ÷100) | exato |

**Status**: ⏳ Aguarda Phase 1 passing

---

### **Phase 3: Monte Carlo & Percentis (Fire + Quant)**

Validar integridade do Monte Carlo que alimenta P(FIRE) e projeções de percentis.

**Componentes validados**:
- `montecarlo.ts`: `runMC`, percentil outputs
- `TrackingFireChart.tsx`: P10/P50/P90 ao longo do tempo
- `data.json`: campos fire_swr_percentis, fire_trilha

**Regras críticas**:
- P10 ≤ P50 ≤ P90 em todo ponto futuro
- P10 no FIRE Day > 0 (não falência)
- crossoverYear ≤ 2040
- SWR range [1%, 5%] com P10 ≥ P50 ≥ P90 (inverso: patrimônio baixo = SWR alto)

**Testes críticos** (10):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| P3-T01 | SWR range | swr_p10, p50, p90 | 0.01 ≤ valor ≤ 0.05 | sempre true |
| P3-T02 | SWR ordenação | p10, p50, p90 | p10 ≥ p50 ≥ p90 | sempre true |
| P3-T03 | Percentis ordenados | todo mes | P10[t] ≤ P50[t] ≤ P90[t] | sempre true |
| P3-T04 | Spread percentis cresce | inicio vs fim | spread[fim] > spread[inicio]×1.5 | lógico |
| P3-T05 | P50 FIRE Day realista | 2040 | R$12.5M ± 10% | ±10% |
| P3-T06 | P10 FIRE Day não colapsa | 2040 | ≥ R$5M (não falência) | sempre ✓ |
| P3-T07 | Cenários consistentes | base/fav/stress | p_fav ≥ p_base ≥ p_stress | sempre true |
| P3-T08 | crossoverYear ≤ 2040 | P50 cruza meta | ≤ 2040 | sempre true |
| P3-T09 | Meta FIRE consistente | patrimonio_alvo | = custo/swr = 8.333.333±1 | ±1 |
| P3-T10 | Série realizado nula | datas futuras | realizadoBrl[t] = null | sempre true |

**Status**: ⏳ Aguarda Phase 2 passing

---

### **Phase 4: Alocação e Drift (Factor)**

Validar que pesos de ETF, composição fatorial e regras de drift estão corretos.

**Componentes validados**:
- `ETFFactorComposition.tsx`: market, value, size, quality loadings
- `ETFRegionComposition.tsx`: regiões por ETF (SWRD, AVGS, AVEM)
- `StackedAllocationBar.tsx`: blocos equity/RF/cripto somam 100%
- `RebalancingStatus.tsx`: drift vs targets

**Regras críticas**:
- SWRD 50%, AVGS 30%, AVEM 20% (intra-equity)
- Ponderado carteira: value_p = 0×0.5 + value_AVGS×0.3 + value_AVEM×0.2 ∈ [0.20, 0.36]
- Drift: <3pp=verde, 3-5pp=amarelo, >5pp=vermelho
- TER ponderado ≈ 0.247%

**Testes críticos** (15):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| P4-T01 | ETFs presentes | etf_composition.json | SWRD, AVGS, AVEM (sem JPGL) | exato |
| P4-T02 | Fatores por ETF | 4 fatores | market, value, size, quality | exato |
| P4-T03 | Market = 1.0 | todos 3 ETFs | market==1.0 | exato |
| P4-T04 | Value ordenado | AVGS > AVEM > SWRD | verdadeiro | lógico |
| P4-T05 | Regiões somam 1.0 | cada ETF | sum ≈ 1.0 | ±0.01 |
| P4-T06 | SWRD US ≥55% | composição real | ≥ 0.55 | lógico |
| P4-T07 | AVEM EM | sem DM | China, India, Taiwan | exato |
| P4-T08 | Bloco equity soma | equityUsd×cambio=bloco | diferença <2% | <2% |
| P4-T09 | Crypto em banda | HODL11 | 1.5%-5.0% do portfolio | sempre ✓ |
| P4-T10 | Drift SWRD | target=39.5%, atual=41.2% | drift=-1.7pp | ±0.5pp |
| P4-T11 | Drift status | 4.2pp gap | amarelo (3-5pp) | exato |
| P4-T12 | TER ponderado | 0.5×0.12 + 0.3×0.39 + 0.2×0.35 | 0.247% | ±0.01% |
| P4-T13 | Correlacao SWRD-AVGS | historico | ≤ 0.95 (não redundância) | lógico |
| P4-T14 | Alpha vs VWRA | longo prazo >10a | +0.16%/ano liquido | ±0.10pp |
| P4-T15 | JPGL target | alocação | = 0% (eliminado) | exato |

**Status**: ⏳ Aguarda Phase 3 passing

---

### **Phase 5: Renda Fixa (RF)**

Validar que a bond pool e ladder de IPCA+ respeitam as regras de adequacy, duration e DCA.

**Componentes validados**:
- `BondPoolReadiness.tsx`: anos de cobertura pós-FIRE
- `BondPoolRunwayChart.tsx`: trail de anos_cobertura_pos_fire
- `test_bond_runway_validation.py`: validação estrutural

**Regras críticas**:
- Bond pool ≥ 50% do alvo 2040 (R$1.73M-2.3M)
- Spending piso = R$180k (gap fase 1 ÷ 3%)
- DCA IPCA+ ativo quando taxa ≥ 6.0%
- IPCA+ 2040 ≥ 80% do bloco longo
- Duration constraints: 5-40 anos

**Testes críticos** (10):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| P5-T01 | Bond pool existe | data.bond_pool_runway | estrutura válida | exato |
| P5-T02 | Pool total vs alvo | pool_total_brl | ≥ 50% alvo | sempre ✓ |
| P5-T03 | Anos cobertura lista | anos_cobertura_pos_fire | lista de ints ≥ 0 | exato |
| P5-T04 | Pool disponível estrutura | pool_disponivel_pos_fire | list ou dict, não NaN | sempre true |
| P5-T05 | Spending piso defined | guardrails.piso | = R$180k ± 20% | ±20% |
| P5-T06 | Target pool range | alvo_pool_brl_2040 | 0.5M-10M | sempre ✓ |
| P5-T07 | Gap análise presente | gap_anos | lista com ano_pos_fire, gap_brl | exato |
| P5-T08 | IPCA+ 2040 taxa | ipcaTaxa | 5%-10%, piso op 6% | lógico |
| P5-T09 | Renda+ 2065 taxa | rendaTaxa | 5%-10%, piso compra 6.5% | lógico |
| P5-T10 | DCA ativo vs taxa | taxa_ipca | taxa ≥ 6.0% → dcaAtivo=true | lógico |

**Status**: ⏳ Aguarda Phase 4 passing

---

### **Phase 6: Câmbio & FX (FX)**

Validar que exposição cambial, PTAX e TWR_BRL são calculados corretamente.

**Componentes validados**:
- `dataWiring.ts`: exposicaoCambialPct, fx_contrib, geoUS/geoDM/geoEM
- `MacroUnificado.tsx`: display de PTAX, MtD
- `test_cambio_validation.py`: PTAX range, contrib anual

**Regras críticas**:
- exposicaoCambial = equity_USD / total_BRL ≈ 84%
- PTAX canônica [3.50, 6.00] com fallback 5.156
- FX contribution geométrica -5% a +15% anual
- TWR_BRL = (1 + TWR_USD) × (1 + fx_contrib) - 1 (multiplicativo, não aditivo)
- Spread Selic-FF: ≥10pp=verde, 6-10=amarelo, <6=vermelho

**Testes críticos** (12):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| P6-T01 | Exposição cambial calc | equity_USD, total | ≈ 84% | ±5% |
| P6-T02 | PTAX fallback | null cambio | = 5.156 | exato |
| P6-T03 | PTAX range | qualquer | [3.50, 6.00] | sempre ✓ |
| P6-T04 | FX contrib anual | cambio_inicio/fim | [-5%, +15%] | sempre ✓ |
| P6-T05 | TWR_BRL multiplicativo | TWR_USD=12.88%, FX=3.1% | (1.1288×1.031-1)×100=16.39% | ±0.05% |
| P6-T06 | Spread Selic-FF calc | 14.75% - 3.64% | = 11.11pp | ±0.01pp |
| P6-T07 | Spread semaforo verde | spread ≥ 10pp | verde (hedge proibitivo) | exato |
| P6-T08 | Spread semaforo amarelo | spread 6-10pp | amarelo | exato |
| P6-T09 | Spread semaforo vermelho | spread < 6pp | vermelho (carry reduzido) | exato |
| P6-T10 | geoUS hardcoded | SWRD 67%, AVGS 58% | verificar contra dato real | ±3pp |
| P6-T11 | geoEM exclusivo | EIMI, AVES, DGS | 100% EM | exato |
| P6-T12 | geoUS+geoDM+geoEM=total | soma | = totalEquityUsd | ±0.1% |

**Status**: ⏳ Aguarda Phase 5 passing

---

### **Phase 7: Macro & Cenários (Macro)**

Validar que as taxas Selic/IPCA/CDS são exibidas corretamente e cenários base/bull/stress refletem impactos em P(FIRE).

**Componentes validados**:
- `MacroUnificado.tsx`: Selic, IPCA, Fed Funds, CDS, spread semáforos
- `TimelineChart.tsx`: projeção patrimonial com cenários
- `computeDerivedValues`: cenários base/bull/stress → pfire_base/fav/stress

**Regras críticas**:
- Selic: [10%, 16%], IPCA: [2%, 6%], Fed: [2%, 6%]
- CDS Brasil: <250=verde, 250-400=amarelo, ≥400=vermelho
- IPCA+ 2040 piso op: 6.0% (DCA ativo), monitorar: 5.5%
- Renda+ 2065 piso compra: 6.5%, piso venda: 6.0%
- Correlação Selic-IPCA+ positiva (+0.55 a +0.75)

**Testes críticos** (14):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| M1-T01 | Selic range | valor | [10%, 16%] válido | sempre ✓ |
| M1-T02 | Selic display | 14.75% | "14,75%" com 2 casas | exato |
| M1-T03 | Selic null-guard | null selic | exibe "—" | exato |
| M1-T04 | IPCA range | valor | [2%, 6%] | sempre ✓ |
| M1-T05 | Fed range | valor | [2%, 6%] | sempre ✓ |
| M1-T06 | Spread Selic-FF | qualquer | null se um for null | lógico |
| M1-T07 | CDS semaforo verde | <250 | verde | exato |
| M1-T08 | CDS semaforo amarelo | 250-400 | amarelo | exato |
| M1-T09 | CDS semaforo vermelho | ≥400 | vermelho | exato |
| M1-T10 | IPCA+ 2040 piso | taxa<6.0% | status=vermelho, dcaAtivo=false | exato |
| M1-T11 | Renda+ 2065 piso compra | taxa<6.5% | status=amarelo, dcaAtivo=false | exato |
| M1-T12 | Renda+ 2065 piso venda | taxa<6.0% | proxAcao='vender' | exato |
| M1-T13 | Cenário bull vs base | taxa comprimida | P(FIRE)_bull > P(FIRE)_base | lógico |
| M1-T14 | Cenário stress vs base | taxa subida | P(FIRE)_stress < P(FIRE)_base | lógico |

**Status**: ⏳ Aguarda Phase 6 passing

---

### **Phase 8: Sistemas Internos (Head)**

Validar pipes, pre-commit, GitHub Actions, scripts de manutenção, `CLAUDE.md`, fontes de verdade.

**Componentes validados**:
- Git hooks: pre-commit automatiza npm run lint, test:ci
- GitHub Actions: build valida TypeScript, testes, deploy minor
- Python scripts: `parse_carteira.py`, `market_data.py`, `ibkr_lotes.py`
- Dados: `carteira_params.json`, `portfolio_summary.json`, `data.json`
- `CLAUDE.md`: regras de desenvolvimento, padrões

**Testes críticos** (8):

| ID | Teste | Entrada | Saída Esperada | Tolerância |
|---|---|---|---|---|
| I1-T01 | Pre-commit hook | git commit msg | npm run lint passa | sempre ✓ |
| I1-T02 | Pre-commit testes | git commit | npm run test:ci passa ou timeout fallback | lógico |
| I1-T03 | Build local | npm run build | sem erros TypeScript | exato |
| I1-T04 | GitHub Actions | push main | testes rodam, build valido | lógico |
| I1-T05 | parse_carteira | carteira.md → json | carteira_params.json valid JSON | exato |
| I1-T06 | market_data pipeline | --macro-br | PTAX, Selic, IPCA em range | lógico |
| I1-T07 | Fontes de verdade | carteira.md | nenhum hardcoding em código | lógico |
| I1-T08 | Deploy minor/major | pre-commit hook | minor auto-deploy, major requer tag | lógico |

**Status**: ⏳ Aguarda Phase 7 passing

---

## Execução — Ordem e Dependências

```
Phase 1 (Quant)
    ↓ (16 testes, ~2h)
Phase 2 (Fire)
    ↓ (13 testes)
Phase 3 (Fire + Quant)
    ↓ (10 testes)
Phase 4 (Factor)
    ↓ (15 testes)
Phase 5 (RF)
    ↓ (10 testes)
Phase 6 (FX)
    ↓ (12 testes)
Phase 7 (Macro)
    ↓ (14 testes)
Phase 8 (Head/Internals)
    ↓ (8 testes)
QUANT VALIDATION
```

---

## Começar Imediatamente

**Próxima ação**: QA executa Phase 1 (Quant). Todos os 16 testes devem passar. Se algum falhar, parar, reportar ao Head, corrigir, re-rodar Phase 1.

**Comando de início**:
```bash
cd /home/user/wealth
npm run test -- react-app/src/utils/__tests__/fire.test.ts
npm run test -- react-app/src/utils/__tests__/montecarlo.test.ts
npm run test -- react-app/src/utils/__tests__/formatters.test.ts
python3 -m pytest scripts/tests/test_data_pipeline.py -v
python3 -m pytest scripts/tests/test_reconstruct_history_twr.py -v
```

**Critério de aprovação Phase 1**: 100% testes passing + 0 warnings + coverage ≥ 85%

---

## Referências

- `agentes/contexto/carteira.md` (fonte de verdade)
- `agentes/memoria/00-head.md` (decisões)
- Especialistas: Fire, Quant, Factor, RF, FX, Macro (análises completas acima)
- `carteira_params.json` (parametrização executável)
