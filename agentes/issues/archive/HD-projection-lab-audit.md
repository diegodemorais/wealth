# HD-projection-lab-audit: Auditoria Profunda — Projection Lab vs Dashboard Diego

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-projection-lab-audit |
| **Dono** | Head + FIRE |
| **Status** | ✅ Concluído |
| **Prioridade** | 🟡 Média |
| **Participantes** | FIRE (análise), Head (síntese) |
| **Criado em** | 2026-05-01 |
| **Origem** | Solicitação Diego — auditar Projection Lab para identificar gaps a implementar |
| **Concluido em** | 2026-05-01 |

---

## Contexto

Projection Lab (PL) é a ferramenta FIRE/retirement mais sofisticada do mercado anglófono DIY. Versão auditada: 4.6.0 (abril 2026). Preço: $129/ano Premium ou $1.199 vitalício. Objetivo: mapear recursos, metodologias, gráficos e identificar o que vale implementar no dashboard de Diego.

---

## 1. Inputs Configuráveis

| Input | Projection Lab | Dashboard Diego |
|-------|---------------|----------------|
| Renda/despesas | Granularidade mensal, datas início/fim | Mensal (premissas_vs_realizado) |
| Tipos de conta | Taxable/tax-deferred/Roth (US) | ETFs UCITS + IPCA+ + Renda+ + cripto |
| Casal | Sim (renda/contas/SS separados) | Katia modelada (INSS, PGBL, custo solo) |
| Inflação | Configurável, curva ao longo do tempo | IPCA geral + VCMH 3.5% separado |
| Milestones | Conceito central — eventos condicionais | Marcos FIRE (Barista/Lean/FIRE/FatFIRE) |
| Imóvel | Equity, hipoteca, rent vs own, venda | Hipoteca R$452k modelada |
| Social Security / INSS | SS automático com fator de atraso (US) | INSS Diego + Katia no MC |
| Câmbio BRL/USD | **NÃO** — mono-moeda | ✅ PTAX integrado nos 3 cenários |
| IPCA+/Renda+ | **NÃO** — sem preset BR | ✅ HTM com IR regressivo |
| Regime fiscal BR | **NÃO** — IR 15% flat, IOF, câmbio | ✅ Modelados no MC e tax_engine.py |

---

## 2. Metodologia de Simulação

### Monte Carlo

| Aspecto | Projection Lab | Dashboard Diego |
|---------|---------------|----------------|
| Simulações | 2.000 max | **10.000** |
| Distribuição | Normal ou histórica | **t-distribution df=5 (fat tails)** |
| Block Bootstrap | ✅ v4.4.0 (preserva autocorrelação) | ❌ Não implementado |
| Premissas de retorno | Usuário define manualmente | ✅ 5 fontes acadêmicas por ETF + haircut |
| Câmbio modelado | ❌ | ✅ 3 cenários BRL/USD |

**Veredicto:** Diego tem metodologia MC superior em simulações, fat tails e premissas. PL tem block bootstrap como diferencial real (autocorrelação preservada).

### Backtesting Histórico

- **PL:** Dados desde 1871 (Shiller). Testa plano contra cada janela histórica.
- **Diego:** ❌ Não tem backtesting histórico. MC usa distribuição paramétrica.
- **Gap:** Relevante para visualizar sequence of returns risk com sequências reais.

---

## 3. Estratégias de Retirada (Withdrawal Strategies)

| Estratégia | PL | Diego |
|-----------|-----|-------|
| SWR fixo (regra 4%) | ✅ | ✅ |
| Ratcheting SWR | ✅ | ❌ |
| Variable Percentage Withdrawal (VPW) | ✅ | ❌ |
| Guyton-Klinger | ✅ | ❌ |
| Risk-based guardrails (Kitces & Fitzpatrick 2024) | ❌ Feature request #56 | **✅ Implementado** |
| Bond tent explícito + mecânica saque do pool | ❌ | **✅ Implementado** |
| Flex Spending (ATH-based) | ✅ v4.4.0 | ❌ |

**Nota crítica:** Risk-based guardrails (o modelo de Diego) NÃO estão no PL — apenas feature request com 56 votos. O PL usa Guyton-Klinger ou Flex Spending (baseado em queda do ATH, não em P(sucesso)). Diego tem a metodologia mais avançada nessa dimensão.

---

## 4. Tax Modeling

**PL (avançado para US):** Roth conversion automático, drawdown ordering por bracket, gain harvesting (faixa 0% LTCG), IRMAA avoidance, ACA subsidy cliff, OBBBA (v4.6.0). **The Optimizer:** busca automática para minimizar lifetime taxes.

**Aplicabilidade ao Brasil:** Nenhuma. Brasil tem IR 15% flat (ETFs), Renda+ IR regressivo, IOF, sem Roth/401k equivalente.

**Gap real:** PL tem sequenciamento de liquidação otimizado automaticamente. Diego tem a lógica documentada (Selic sem IR > ETFs prejuízo > menor lucro > IPCA+ > maior lucro) mas sem automação/visualização no dashboard.

---

## 5. Visualizações e Gráficos

| Visualização | PL | Diego | Prioridade impl. |
|-------------|-----|-------|-----------------|
| Fan chart P10/P50/P90 ao longo do tempo | ✅ | ❌ | **🔴 Alta** |
| Spending por componente (lifestyle/saúde/hipoteca) | ✅ Sankey | ❌ | **🟡 Média** |
| Withdrawal rate ao longo do tempo | ✅ | ❌ | **🟡 Média** |
| Guardrails activation por cenário | ✅ Flex Spending viz | ❌ | **🟡 Média** |
| Comparação visual de cenários (side-by-side) | ✅ | Parcial | **🟡 Média** |
| Net worth histórico vs projeção | ✅ | ❌ | **🟢 Baixa** |
| Sankey de fluxo de caixa | ✅ | ❌ | **🟢 Baixa** |
| Drawdown order por conta | ✅ | ❌ | **🟢 Baixa** |
| Breakdown patrimônio por tipo | ✅ | ✅ | — Já tem |
| Bond pool depletion tracker | ❌ | ❌ | **🔴 Alta (Diego-specific)** |
| INSS/floor income visual | ✅ SS | Parcial | **🟡 Média** |

---

## 6. Gaps do PL para o Contexto de Diego

| Gap | Severidade |
|-----|-----------|
| Sem preset fiscal BR (IR 15%, IOF, câmbio) | **Crítico** |
| Mono-moeda — sem BRL/USD | **Crítico** |
| Sem IPCA+/Renda+ como instrumento HTM | **Alto** |
| Risk-based guardrails ausentes | **Alto** |
| Limite de 2.000 simulações | **Médio** |
| Sem fat tails (t-distribution) | **Médio** |
| Spending smile manual (não automático) | **Médio** |
| VCMH separado do IPCA — não pré-configurável | **Médio** |
| Sem INSS BR | **Alto** |

---

## 7. Ranking Priorizado — Features para Implementar no Dashboard de Diego

### Prioridade 1 — Alto impacto, implementação média

**P1.1 — Fan Chart de Patrimônio por Percentil (P10/P50/P90)**
- O que é: área chart com bandas de percentis de 2026 a 2090
- Por que: visualiza onde e quando as trajetórias falham. Mais impactante que P(FIRE) numérico.
- Esforço: médio — MC já roda 10k trajetórias; falta serializar e plotar com ECharts
- Dados: nativos do `fire_montecarlo.py`

**P1.2 — Bond Pool Depletion Tracker** *(Diego-specific, sem equivalente no PL)*
- O que é: saldo projetado do bond pool (TD 2040 + IPCA+ curto 3%) de 2040 a 2047 vs consumo R$250k/ano
- Por que: guardrail de fonte é a decisão estrutural mais crítica dos primeiros 7 anos pós-FIRE
- Esforço: baixo — cálculo simples de saldo com saque anual
- Dados: já existem no pipeline

### Prioridade 2 — Impacto médio-alto, implementação baixa-média

**P2.1 — Spending ao Longo do Tempo por Componente**
- O que é: área empilhada: lifestyle / saúde / hipoteca / outros por ano
- Por que: confirma spending smile (R$242k go-go → R$200k slow-go → R$187k no-go + saúde escalando)
- Esforço: baixo-médio — dados do spending smile já existem no pipeline

**P2.2 — Withdrawal Rate ao Longo do Tempo**
- O que é: SWR efetiva (retirada/patrimônio) ano a ano com linha do INSS floor
- Por que: mostra quando INSS entra (2049, 2052) e reduz pressão de saque. Referência: ERN (Karsten)
- Esforço: baixo — divisão simples do MC output

**P2.3 — Guardrails Activation Visualization**
- O que é: em X% das trajetórias, guardrails são ativados por mais de N anos
- Por que: Diego tem lógica mais sofisticada que o PL, mas sem visualização
- Esforço: médio — requer tracking de ativação de guardrail no MC output

**P2.4 — Historical Net Worth Overlay**
- O que é: progresso real vs projeção P50 no mesmo gráfico
- Por que: tracker "você está acima/abaixo da trajetória?" — motivador e útil para calibrar re-runs
- Esforço: baixo — dados históricos existem em `reconstruct_history.py`

### Prioridade 3 — Impacto médio, implementação média-alta

**P3.1 — Block Bootstrap / Backtesting Histórico**
- O que é: resample de blocos consecutivos de retornos reais preservando autocorrelação
- Por que: metodologicamente superior ao bootstrap simples. Evidência: Cederburg et al. (2023)
- Esforço: alto — requer dados históricos por ETF em BRL via PTAX histórico
- Nota: Cederburg et al. (2023) usa exatamente essa abordagem

**P3.2 — Comparação Visual de Cenários (Base vs Aspiracional)**
- O que é: fan charts sobrepostos FIRE 2035 vs FIRE 2040
- Por que: visualiza trade-off de antecipação de forma imediata
- Esforço: médio — rodar dois MC em paralelo e sobrepor percentis

**P3.3 — INSS Floor Income Visual**
- O que é: linha de receita garantida (INSS Diego + Katia) sobreposta ao gráfico de retiradas
- Por que: "a partir de 2049, R$113.8k/ano cobre X% do custo de vida" comunica resiliência
- Esforço: baixo — dados já existem

### Prioridade 4 — Nice-to-have

- Drawdown order visualization (relevante ~2034)
- Sankey de fluxo de caixa completo (relevante pós-FIRE 2040)

---

## 8. O que o PL Tem que Diego Nunca Precisará

- Tax Strategy Engine (Roth conversions, IRMAA, ACA, gain harvesting): inaplicável ao BR
- Social Security optimizer (sem equivalente ao INSS com atraso estratégico)
- Inherited IRA modeling: produto inexistente no Brasil
- Suporte a CA/UK/AU/DE: irrelevante

---

## 9. Síntese Executiva

O Projection Lab é a melhor ferramenta FIRE do mundo anglófono. Para um americano, o Tax Strategy Engine + Optimizer é game-changing (decadas de IR otimizadas automaticamente). Para Diego, o PL é **amplamente inferior** ao dashboard customizado por razões estruturais:

| Dimensão | PL | Dashboard Diego |
|----------|-----|----------------|
| Contexto fiscal BR | ❌ Manual | ✅ Nativo |
| Câmbio BRL/USD | ❌ Mono-moeda | ✅ PTAX 3 cenários |
| Risk-based guardrails | ❌ Feature request | ✅ Implementado |
| Bond tent + mecânica pool | ❌ | ✅ |
| Premissas acadêmicas | ❌ Usuário define | ✅ 5 fontes + haircut |
| Simulações MC | 2.000 | **10.000** |
| Fat tails | ❌ Normal/histórica | ✅ t-distribution df=5 |
| IPCA+/Renda+ como instrumento | ❌ | ✅ HTM + IR regressivo |

**Analogia:** O PL é um simulador de voo para o piloto médio americano. O dashboard de Diego é um sistema de navegação construído especificamente para a rota São Paulo → FIRE 2040 — com GPS calibrado para câmbio PTAX, taxas de vento IPCA+, e turbulência de sequência de retornos. O PL não voa essa rota.

**Features prioritárias a implementar:**
1. Fan chart P10/P50/P90 (dados já existem, esforço médio, impacto alto)
2. Bond pool depletion tracker (Diego-specific, esforço baixo)
3. Spending por componente ao longo do tempo (spending smile visual)
4. Withdrawal rate ao longo do tempo + INSS floor
5. Historical net worth overlay

---

## Issues Derivadas

| ID | Título | Prioridade |
|----|--------|-----------|
| A definir | Fan Chart P10/P50/P90 — serializar MC trajetórias + ECharts | 🔴 Alta |
| A definir | Bond Pool Depletion Tracker (2040-2047) | 🔴 Alta |
| A definir | Spending por componente ao longo do tempo | 🟡 Média |
