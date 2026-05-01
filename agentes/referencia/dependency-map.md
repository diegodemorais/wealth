# Mapa de Dependências — Propagação de Mudanças

> **Maintainer**: Integrator  
> **Atualizar em**: todo bug de propagação descoberto, toda premissa nova, todo componente novo.

---

## Legenda

```
[fonte] → [intermediário] → [output] → [consumidor] → [testid]
⚠ = quebra silenciosa (sem erro visível)
🔴 = bloqueia pipeline (AssertionError)
📌 = ponto de cache (stale risk)
```

---

## 1. Premissas (carteira.md)

### `aporte_mensal` (ex: R$25.000)
```
carteira.md → parse_carteira.py → carteira_params.json → config.py
    → generate_data.py → premissas.aporte_mensal
        → fire_trilha (anos de acumulação)                    ⚠ 📌
        → P(FIRE) base via PFireEngine                         📌
        → coast_fire_number                                    
        → contribuicao_retorno_crossover
        → ReverseFire simulator (APORTE_PRESET.solteiro)      ⚠
        → TrackingFireChart (projeção)
```

### `aporte_cenario_aspiracional` (ex: R$30.000)
```
carteira.md → carteira_params.json → premissas.aporte_mensal_aspiracional
    → build_pfire_request("aspiracional") → PFireEngine
        → P(FIRE) aspiracional
        → pat_mediano_aspiracional → dashboard_state.json["fire"]
            → aspiracional_scenario.pat_mediano → FireScenariosTable
            → aspiracional_scenario.swr         → FireScenariosTable    ⚠
    → ReverseFire.setAspiracional() → aporte state                      ⚠
```

### `idade_cenario_aspiracional` (ex: 49)
```
carteira.md → carteira_params.json → premissas.idade_cenario_aspiracional
    → build_pfire_request("aspiracional") → idadeFire
    → aspiracional_scenario.idade → FireScenariosTable
    → StressTestSection STRESS_AGES label                                ⚠ hardcoded
    → ReverseFire.setAspiracional() → idadeFire state                   ⚠
    → earliest_fire.idade
```

### `custo_vida_base` (ex: R$250.000/ano)
```
carteira.md → premissas.custo_vida_base
    → meta_fire = custo / swr_gatilho
    → bond_pool.cobertura_anos = bond_pool_valor / custo
    → spending_smile (todas as fases: go_go, slow_go, no_go)
    → WithdrawalRateChart: spending (numerador do SWR)
    → SpendingTimelineChart: baseline de cada ano
    → BondPoolDepletionChart: saque anual base
    → ReverseFire: custoMensal = custo/12 (solteiro)
    → fire_montecarlo: escala_custo_vida
```

### `swr_gatilho` (ex: 0.03 = 3%)
```
carteira.md → premissas.swr_gatilho
    → meta_fire = custo / swr_gatilho
    → WithdrawalRateChart: markLine gatilho
    → spending_guardrails: zona de risco
    → ReverseFire: metaFire = custo / swr
    → FireScenariosTable: SWR exibido
```

### `patrimonio_atual`
```
IBKR → ibkr_lotes.py → posicoes
    → generate_data.py: soma de posicoes + RF
        → premissas.patrimonio_atual
            → PFireEngine (todas as simulações)
            → coast_fire_number.gap
            → fire_spectrum (qual banda)
            → ReverseFire: patrimonioAtual
            → StressTest: patrimônio base
```

---

## 2. Eventos de Vida

### INSS Katia (data e valor)
```
carteira.md → premissas.inss_katia_anual, premissas.inss_katia_ano_inicio
    → fire_montecarlo.py: inss_anual, inss_inicio_ano (pós-FIRE)
        → trilha_p10/p50/p90 (reduz saque líquido a partir de 2049)
        → P(quality): healthcare spending pós-INSS
    → WithdrawalRateChart: inssKatiaLine (null antes de 2049, %/pat depois)   ⚠
    → WithdrawalRateChart: swrLiquida (deduz inssKatia após 2049)
    → BondPoolDepletionChart: saqueAnual reduz após 2049                        ⚠
    → WithdrawalRateChart markPoints: INSS K pin em 2049
    → premissas.inss_katia_anual → NowPage card capital humano Katia
```

### INSS Diego (data e valor)
```
carteira.md → premissas.inss_anual, premissas.inss_inicio_ano (≈2052)
    → (mesma cadeia que INSS Katia, com ano 2052)
    → WithdrawalRateChart: inssDiegoLine
    → spending_guardrails: renda_inss total
```

### Mudança de FIRE age base (`idade_cenario_base`)
```
carteira.md → premissas.idade_cenario_base
    → fire_trilha: n_anos_acumulacao = idadeFire - idadeAtual
    → P(FIRE) base: meses de acumulação
    → fire_year_base = ano_atual + (idadeFire - idadeAtual)
    → scenario_comparison.base.idade
    → NetWorthProjectionChart: transição pré/pós-FIRE
    → StressTest "X anos (FIRE base)" label                                    ⚠ hardcoded
```

---

## 3. Novos Ativos / Classes

### Novo ETF adicionado
```
IBKR posições → ibkr_lotes.py → posicoes[ticker]
    → generate_data.py: patrimônio total recalculado
    → pct_equity += peso_novo_etf
    → retorno_equity_base: blended (se diferente dos existentes)
    → etf_composition: nova entrada
    → IR diferido: novo lote FIFO calculado
    → estate tax: se US-situs, adicionar ao us_situs_total_usd
    → PortfolioPage: nova linha na tabela
    → factor_loadings: precisa de série de preços (reconstruct_history.py)    ⚠ 📌
```

### Ativo removido / zerado
```
ibkr_lotes.py: lote zerado (todos os units = 0)
    → posicoes[ticker] presente mas vazio
    → IR: verificar lucro/prejuízo realizado
    → etf_composition: entry deve desaparecer OU mostrar 0%
    → PortfolioPage: não mostrar linha zerada                                   ⚠
```

---

## 4. Mudanças de Estratégia

### Mudança de withdrawal strategy (guardrails → outro)
```
fire_montecarlo.py: strategy="guardrails" (hardcoded em PFireEngine)
    → P(FIRE), P(quality), trilha_p10/p50/p90
    → spending_guardrails
    → BondPoolDepletionChart (lógica de saque)
    → Mudar strategy exige: re-run fire_montecarlo + generate_data completo
```

### Mudança de bond pool (anos ou composição)
```
carteira.md → premissas.anos_bond_pool, bond_pool_status
    → fire_montecarlo.py: bond_pool_isolation, bond_pool_completion_fraction
    → BondPoolDepletionChart: saldo e esgotamento
    → bond_pool.cobertura_anos
    → spending_guardrails: bond_pool_coverage_years
    → P(quality): muda com isolation ativo vs inativo
```

### Mudança de pct_equity
```
carteira.md → premissas.pct_equity
    → fire_montecarlo: vol_efetivo (mix equity + bond_pool)
    → projetar_acumulacao: retorno_carteira
    → todos os outputs MC (trilha, P(FIRE), P(quality))                        📌
```

---

## 5. Pipeline — Pontos de Cache e Risco de Stale

| Campo | Escrito por | Lido por | Stale quando |
|-------|-------------|----------|--------------|
| `pat_mediano_aspiracional` | PFireEngine via generate_data.py | aspiracional_scenario | generate_data não rodou desde mudança de idadeFire ou aporte aspiracional |
| `p_quality_aspiracional` | fire_montecarlo.py (--by_profile) | data["fire"] | fire_montecarlo não rodou para aspiracional |
| `trilha_p10/p50/p90` | rodar_monte_carlo_com_trajetorias | NetWorthProjectionChart | fire_montecarlo stale (cache de 9.6h) |
| `fire_matrix.by_profile` | fire_montecarlo.py --by_profile | ReverseFire, SimulatorPage | flag --by_profile não foi rodada |
| `factor_loadings` | reconstruct_history.py | PerformancePage R² badges | reconstruct_history não rodou (requer série histórica) |
| `timeline_attribution` | reconstruct_history.py | BacktestPage | idem |
| `retorno_decomposicao` | compute_retorno_decomposicao | GapR | retornos_mensais sem decomposicao (reconstruct_history stale) |
| `correlation_stress` | compute_correlation_stress | GapP | idem |
| `pfire_base` | fire_montecarlo.py | P(FIRE) base | fire_montecarlo stale |
| `tornado` | fire_montecarlo.py --tornado | TornadoChart | fire_montecarlo --tornado não rodou |

---

## 6. Contratos React → data.json

| Componente | Campo consumido | Testid | Quebra silenciosa se |
|------------|----------------|--------|---------------------|
| `FireScenariosTable` | `aspiracional_scenario.pat_mediano` | `fire-scenario-aspiracional-pat` | campo null → mostra R$0 |
| `FireScenariosTable` | `aspiracional_scenario.swr` | `fire-scenario-aspiracional-swr` | pat null → SWR = 0% |
| `WithdrawalRateChart` | `premissas.inss_katia_anual` | — | sem testid → falha silenciosa |
| `BondPoolDepletionChart` | `premissas.retorno_rf_real_bond_pool` | `bond-pool-esgotamento` | fallback 5.34% se null |
| `NetWorthProjectionChart` | `trilha_p10/p50/p90` | — | mostra gráfico vazio sem erro |
| `ReverseFire` | `premissas.aporte_mensal_aspiracional` | — | usa aporte base se null |
| `SpendingTimelineChart` | `spending_smile.go_go/slow_go/no_go` | `spending-gogo-total` | sem dados → gráfico vazio |

---

## 7. Bugs de Propagação Registrados (histórico)

| Data | Bug | Root cause | Fix | Teste adicionado? |
|------|-----|-----------|-----|-------------------|
| 2026-05-01 | `aspiracional_scenario.pat_mediano = R$0` | generate_data lia `pat_mediano_fire50` mas MC escrevia `pat_mediano_aspiracional` | Corrigido em generate_data.py; rodar_monte_carlo_com_trajetorias retorna pat_mediana_fire | ⚠ Não |
| 2026-05-01 | `retorno_decomposicao` bloqueia pipeline | Sem cache fallback; reconstruct_history não rodou | Cache fallback adicionado | ⚠ Não |
| 2026-05-01 | ReverseFire aspiracional usava aporte R$25k e idadeFire=53 | build_pfire_request não usava aporte_cenario_aspiracional; setAspiracional não setava idadeFire | Corrigido em generate_data.py e ReverseFire.tsx | ⚠ Não |
| 2026-05-01 | StressTest label "50 anos (FIRE aspiracional)" | Hardcoded; idade mudou de 50 para 49 | Hardcoded corrigido para 49 | ⚠ Não |
