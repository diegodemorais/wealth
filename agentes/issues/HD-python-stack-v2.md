# HD-python-stack-v2: Capacidades Analíticas Avançadas com Python Stack

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-python-stack-v2 |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 02 Factor, 04 FIRE, 05 Wealth, 10 Advocate, 14 Quant |
| **Dependencias** | HD-python-stack (venv e stack instalados) |
| **Criado em** | 2026-03-30 |
| **Origem** | Proativo — capacidades adicionais identificadas após instalação da stack Python |
| **Concluido em** | 2026-03-31 |

---

## Motivo / Gatilho

Após mapear as 3 rotinas principais (HD-python-stack), identificadas 4 capacidades novas que a stack possibilita e que não existiam antes — não são automações de rotinas existentes, mas análises genuinamente novas.

---

## Descrição

Quatro capacidades analíticas que se tornam possíveis com a stack instalada, a implementar após HD-python-stack estar concluído.

---

## Escopo

### Capacidade 1: Otimizador de Aporte Mensal
**Problema atual**: split do aporte de R$25k entre ETFs é decidido no feeling, sem cálculo formal do drift.

- [ ] Dado patrimônio atual por ETF (input do Bookkeeper) + pesos-alvo (35/25/20/20) + preço atual em GBp + câmbio do dia → calcular quantas unidades de cada ETF comprar
- [ ] Usar `PyPortfolioOpt DiscreteAllocation` com constraint de budget R$25k
- [ ] Output: "Comprar X unidades JPGL + Y unidades SWRD = R$24.8k, drift residual 0.3pp"
- [ ] Integrar como módulo do `checkin_mensal.py` (não script separado)

### Capacidade 2: Backtesting Histórico do Tilt Fatorial (bt + yfinance)
**Problema atual**: shadow portfolio é forward-looking desde mar/2026. O Advocate usa só papers para questionar o fatorial — sem dados reais dos ETFs UCITS específicos.

- [ ] Puxar histórico desde 2015 (ou início de cada ETF): SWRD.L, AVGS.L, AVEM.L, JPGL.L, VWRA.L
- [ ] Simular carteira target (35/25/20/20) vs Shadow A (100% VWRA) com bt — mesmos aportes mensais
- [ ] Output: CAGR, Sharpe, Max DD, Delta acumulado por ano
- [ ] Entregar como evidência empírica na próxima revisão trimestral Factor (FI)
- [ ] Pergunta central: "O factor tilt dos ETFs UCITS *reais* teria gerado alpha histórico, ou é só paper?"

### Capacidade 3: TLH Monitor Automático
**Problema atual**: os 7 transitórios (EIMI, AVES, AVUV, AVDV, DGS, USSC, IWVL) estão com lucro hoje, mas isso muda. O gatilho de TLH + migração UCITS só é ativado se alguém lembrar de verificar.

- [ ] Script mensal que compara preço atual vs preço médio de compra (input manual ou planilha) para cada transitório
- [ ] Se perda >= 5%: alertar com "TLH opportunity — AVUV em -8.3%, considerar venda + compra AVGS"
- [ ] Calcular IR economizado (15% sobre a perda realizada) vs custo de execução
- [ ] Integrar como bloco do `checkin_mensal.py`
- [ ] Nota: preço médio de compra requer input do Bookkeeper (não disponível via yfinance)

### Capacidade 4: Tornado Chart — Sensibilidade do P(FIRE)
**Problema atual**: P(FIRE) é um número único. Não sabemos quais variáveis mais impactam — onde vale a pena focar energia analítica.

- [ ] Rodar Monte Carlo base (premissas nominais) → P(FIRE) base
- [ ] Para cada variável, variar ±10% e recalcular P(FIRE): retorno equity, IPCA, depreciação BRL, aporte mensal, custo de vida, data FIRE
- [ ] Gerar tornado chart ordenado por impacto
- [ ] Hipótese a testar: aporte mensal e retorno equity dominam; depreciação BRL é ruído em 11 anos
- [ ] Output: "Aumentar aporte em 10% (+R$2.5k/mês) move P(FIRE) em Xpp — maior alavanca disponível"
- [ ] Depende de `fire_montecarlo.py` estar pronto (HD-python-stack)

---

## Raciocínio

**Argumento central:** as 4 capacidades são analiticamente novas — não automatizam o que já existe, mas respondem perguntas que hoje não têm resposta quantitativa. O backtesting histórico e o tornado chart têm maior valor estratégico; o otimizador de aporte e o TLH monitor têm maior valor operacional.

**Incerteza reconhecida:** backtesting histórico sofre de look-ahead bias se os ETFs UCITS forem mais recentes que os papers. AVGS.L lançado jun/2024 — histórico curto. Usar proxies (AVUV para small value US, AVDV para int) para períodos anteriores, com flag explícito.

**Falsificação:** se backtesting mostrar Delta fatorial negativo em rolling 5 anos, Advocate deve escalar para issue formal questionando o tilt.

---

## Análise

| Cap | Descrição | Resultado |
|-----|-----------|-----------|
| 1 — Otimizador de aporte | `portfolio_analytics.py --aporte` | Implementado: cascade IPCA+/Renda+/JPGL por gatilho de taxa |
| 2 — Backtest histórico | `scripts/backtest_fatorial.py` | Criado: 4 regimes, proxies AVUV/EIMI.L, CAGR/Sharpe/MaxDD/delta anual |
| 3 — TLH Monitor | bloco em `checkin_mensal.py --tlh` | Criado: 7 transitórios, gatilho 5%, cálculo IR, alerta duplo benefício US-listed |
| 4 — Tornado chart | `fire_montecarlo.py --tornado` | Implementado (FR-scripts-premissas) |

### Resultado backtest (Regime 3, Nov/2019–Mar/2026, 76 meses)

| Métrica | Target (fatorial) | Shadow A (VWRA) | Delta |
|---------|------------------|-----------------|-------|
| CAGR | +11.60% | +11.12% | +0.48pp |
| Sharpe | 0.45 | 0.45 | 0.00 |
| Max DD | -27.0% | -24.3% | -2.70pp |
| Crescimento acum. | 200.4 | 195.0 | +5.4pts |

**Padrão identificado:** Tilt ganhou em 4/8 anos. Underperformance consecutiva em 2023-2025 (Advocate alert). CAGR positivo +0.48pp apesar da sequência recente adversa — consistente com value/small premium ciclico. Dados com 2 proxies; conclusão definitiva requer Regime 1 (UCITS puros, disponível Jun/2025+).

---

## Conclusão

Quatro capacidades implementadas. Backtest confirma +0.48pp CAGR do tilt mas com Sharpe igual e MaxDD pior — prêmio fatorial existe mas tem custo de volatilidade. Underperformance 2023-2025 ciclica, não estrutural (conforme literatura: value underperforms em bull markets de growth).

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Scripts** | `backtest_fatorial.py` (novo) + TLH block em `checkin_mensal.py` |
| **Capacidades** | 1✅ 2✅ 3✅ 4✅ — todas implementadas |
| **Uso TLH** | `python3 checkin_mensal.py --tlh --tlh-config '{"AVUV": 85.50, ...}'` |
| **Uso backtest** | `python3 backtest_fatorial.py --regime 3` (ou 1/2/4) |

---

## Próximos Passos

- [x] Aguardar HD-python-stack concluído
- [x] Cap 1: otimizador de aporte (`portfolio_analytics.py --aporte`)
- [x] Cap 2: `scripts/backtest_fatorial.py`
- [x] Cap 3: TLH block em `checkin_mensal.py --tlh`
- [x] Cap 4: tornado chart em `fire_montecarlo.py --tornado`
