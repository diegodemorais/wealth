# HD-metodologia-analitica: Padrões metodológicos para análises históricas

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-metodologia-analitica |
| **Dono** | 00 Head |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | 02 Factor, 14 Quant, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-31 |
| **Origem** | Revisão proativa — análises históricas (backtest, factor regression, correlações, scorecard, shadows) sem padrão unificado de período mínimo, câmbio, rebalancing e benchmark. |
| **Concluido em** | — |

---

## Problema

Toda análise que olha para trás usa parâmetros definidos ad-hoc:

| Análise | Período usado | Câmbio | Rebalancing | Benchmark |
|---------|--------------|--------|-------------|-----------|
| Backtest fatorial | Regime 3 = Nov/2019 | USD puro | Mensal | VWRA.L |
| Factor regression | 60 meses (5y) | USD puro | N/A | FF5+MOM factors |
| Correlações regime | 6 anos | USD puro | N/A | VIX como classificador |
| Shadow portfolio | Desde mar/2026 | BRL (Dietz) | Mensal | VWRA, IPCA+, mix |
| Scorecard | Mensal | BRL | N/A | Shadow A/B/C |

Sem padrão: resultados de análises diferentes não são comparáveis. Um backtest de 3 anos pode mostrar resultado oposto a um de 10 anos para o mesmo ativo — sem saber qual usar.

---

## Escopo

### Padrão 1: Períodos mínimos por tipo de análise

Definir e justificar o período mínimo para cada tipo. O período deve ser longo o suficiente para incluir pelo menos um ciclo completo (alta + correção + recuperação):

| Tipo de análise | Período mínimo proposto | Ideal | Razão | Decisão |
|----------------|------------------------|-------|-------|---------|
| CAGR / Sharpe / MaxDD | 5 anos | 10 anos | Endpoint sensitivity — 5y pode pegar só bull ou só bear | ? |
| Backtest de factor tilt | 10 anos | 20 anos | Factor premiums são cíclicos — 5y pode pegar um ciclo favorável por acidente | ? |
| Correlações por regime | 5 anos (≥1 crise) | 15 anos (GFC + COVID + 2022) | Precisa de múltiplos episódios de crise para estabilidade estatística | ? |
| Factor loadings (rolling) | 24m por janela | 36m | Estabilidade dos coeficientes; 24m é mínimo para FF5 | ? |
| Factor loadings (full period) | 36 meses | 60 meses | Significância estatística dos betas | ? |
| Shadow portfolio tracking | Desde inception | Ongoing | Tracking operacional — não tem mínimo estatístico | Desde mar/2026 ✅ |
| Scorecard mensal | Mensal | Acumular histórico | Operacional | Mensal ✅ |

**Questão central para debate:** com ETFs UCITS lançados em 2019-2024, nunca teremos 20 anos de dados reais. Como tratar esse limite estrutural? Opções:
- a) Usar proxy para estender o período (requer HD-proxies-canonicos)
- b) Aceitar períodos curtos com flag explícito de limitação
- c) Usar índices (MSCI, FF data library) como ground truth de longo prazo

### Padrão 2: Câmbio

Hoje: backtests e correlações usam USD puro. Shadow portfolio usa BRL. Fator regression usa USD.

Proposta para debate:
- **Análises de retorno absoluto (CAGR, Sharpe):** BRL — porque o investidor é brasileiro e o IR incide em BRL
- **Análises de correlação e fator:** USD — correlações em USD são mais limpas (removem ruído cambial comum a todos os ativos)
- **Shadow portfolio e scorecard:** BRL — comparação operacional para o investidor
- **Factor regression:** USD — fatores Fama-French são publicados em USD

Regra de câmbio quando BRL:
- PTAX venda BCB da data da observação (padrão já definido para TLH)
- Não usar taxa Okegen ou estimativa

### Padrão 3: Rebalancing assumption

Hoje: backtest usa rebalancing mensal implícito (compra proporcional aos pesos). Portfolio analytics não rebalanceia — usa apenas retornos ponderados.

Impacto: rebalancing mensal vs anual pode gerar até 0.3-0.5pp CAGR de diferença ("rebalancing bonus").

Proposta para debate:
- **Backtest de longo prazo:** anual (mais realista — custos de transação e IR)
- **Correlações e factor regression:** sem rebalancing (retornos diários/mensais brutos)
- **Shadow portfolio:** mensal via aportes (não venda — sem rebalancing forçado)

### Padrão 4: Benchmark canônico

Hoje: VWRA.L para shadow (mas VWRA existe só desde jul/2019). Factor regression usa fatores FF (sem benchmark de retorno). Backtest usa VWRA.L.

Proposta:
- **Benchmark de retorno (shadows, scorecard, backtest):** VWRA.L — ou SWRD.L como proxy quando VWRA não disponível
- **Benchmark de fator (factor regression):** MSCI World (retorno de mercado, não um ETF)
- **Benchmark de longo prazo (proxy para 10-20 anos):** definir após HD-proxies-canonicos

### Padrão 5: Critério de suficiência estatística

Quando um resultado é "confiável"? Hoje não há critério formal.

Proposta:
- **Factor loading:** reportar t-stat e p-value. Considerar significativo se p < 0.10 (dado períodos curtos)
- **Backtest CAGR:** reportar intervalo de confiança bootstrap (95%) se período < 10 anos
- **Correlação:** reportar N (número de observações) e flag se N < 60 (menos de 5 anos mensais)
- **Resultado com proxy:** sempre flag explícito "⚠️ proxy" + validação de sobreposição (o proxy replicou o ETF real no período em que ambos existiram?)

### Padrão 6: Data source hierarchy

Quando há discrepância, qual fonte prevalece?

Proposta:
1. **yfinance** — preços de ETFs (primário, auto_adjust=True)
2. **BCB SGS** — IPCA, SELIC, PTAX (primário para dados BR)
3. **Kenneth French Data Library** — fatores FF5+MOM (primário para fator regression)
4. **Tesouro Direto** — preços IPCA+ e Renda+ (manual — sem API)
5. **IBKR statement** — posições e custos de compra (manual)

Se yfinance retornar dado inconsistente: flag, não silenciar.

---

## Raciocínio

**Por que isso importa agora:** com `backtest_fatorial.py`, `portfolio_analytics.py`, `factor_regression.py` e `checkin_mensal.py` todos funcionando, começaremos a acumular resultados. Sem metodologia padronizada, os resultados de sessões diferentes não serão comparáveis — e em 6 meses não saberemos se o backtest "melhorou" porque a tese funcionou ou porque mudamos o período.

**Falsificação desta issue:** se após definição dos padrões dois scripts rodando o mesmo período com os mesmos proxies divergirem em > 0.3pp CAGR, há bug metodológico — não diferença legítima.

---

## Análise

> A preencher após debate com Quant, Factor e Advocate.

---

## Conclusão

> A preencher.

---

## Resultado

> A preencher.

---

## Próximos Passos

- [ ] Quant: validar proposta de períodos mínimos com literatura (há consenso acadêmico?)
- [ ] Advocate: stress-testar a proposta de câmbio — BRL para retornos absolutos é sempre melhor?
- [ ] Factor: validar benchmark canônico para factor regression (MSCI World via yfinance vs French library)
- [ ] Definir os 6 padrões (debate e aprovação de Diego)
- [ ] Criar `agentes/referencia/metodologia-analitica.md` (fonte única de verdade)
- [ ] Atualizar scripts para referenciar os padrões
- [ ] Saída principal: período máximo histórico da carteira — input obrigatório para HD-proxies-canonicos
