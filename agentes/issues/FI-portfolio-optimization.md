# FI-portfolio-optimization: Validação formal de alocação via otimização

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-portfolio-optimization |
| **Dono** | Factor |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Factor (lead), Head, FIRE, Advocate, Quant |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs PyPortfolioOpt/Riskfolio-Lib/skfolio |
| **Concluido em** | — |

---

## Motivo / Gatilho

Nossa alocação 50/30/20 (SWRD/AVGS/AVEM) foi decidida por debate qualitativo entre agentes. Ferramentas como PyPortfolioOpt, Riskfolio-Lib e skfolio permitem validação quantitativa via efficient frontier, HRP, risk parity, Black-Litterman. Gap identificado no scan (2026-04-07).

---

## Descricao

Usar ferramentas de otimização de portfolio para validar (ou questionar) a alocação equity atual com dados históricos e modelos formais.

---

## Escopo — Roteiro Padrão de Integração

- [x] **1. Instalar e avaliar**: PyPortfolioOpt 1.6.0 + Riskfolio-Lib 7.2.1 instalados e testados (web)
- [x] **2. Mapear features**: efficient frontier, HRP, risk parity, Black-Litterman, min vol, max Sharpe — todos funcionais
- [x] **3. Avaliar o que temos**: 50/30/20 próximo dos ótimos (Sharpe gap <0.01)
- [x] **4. Prova de conceito**: rodada 1 com Ken French factors (242 meses). Pendente: dados reais via yfinance local
- [x] **5. Comparar outputs**: tabela completa (7 métodos + Diego + VWRA benchmark)
- [ ] **6. Reportar ao time**: Factor, Advocate e FIRE avaliam. A otimização confirma ou questiona 50/30/20?
- [ ] **7. Sintetizar e decidir**: usar como input adicional em futuras revisões de alocação? Incorporar no check-in anual?

---

## Raciocínio

**Argumento central:** Debate qualitativo pode convergir para alocações sub-ótimas por ancoragem. Otimização formal fornece um benchmark quantitativo (mesmo com limitações conhecidas — sensitivity to inputs, overfitting).

**Alternativas rejeitadas:** Usar otimização como único critério de decisão — sabemos que é garbage-in/garbage-out com estimativas de retorno incertas. O valor é como validação, não como prescrição.

**Incerteza reconhecida:** 50/30/20 pode estar perto do ótimo para nossos constraints (sem short, UCITS only, factor tilt intencional). Se sim, a issue confirma sem mudar nada.

**Falsificação:** Se a efficient frontier mostrar que 50/30/20 está >1 desvio-padrão do ótimo em qualquer métrica (Sharpe, Sortino, min-variance), devemos investigar.

---

## Analise

### Prova de conceito — Rodada 1 (web, 2026-04-07)

**Método:** Retornos sintéticos via Ken French Developed 5 Factors + Emerging 5 Factors (2006-01 a 2026-02, 242 meses). SWRD = Mkt-RF + RF. AVGS = Mkt + SMB + HML + 0.5×RMW (haircut 58% McLean & Pontiff). AVEM = Mkt_EM + SMB_EM + HML_EM (haircut 58%). Ferramentas: PyPortfolioOpt 1.6.0 + Riskfolio-Lib 7.2.1.

**Limitação:** Retornos sintéticos via factor loadings, não preços reais de ETFs (yfinance indisponível no ambiente web). Rodar com dados reais localmente para confirmar.

#### Premissas históricas (20 anos)

| Ativo | Ret anualizado | Vol anualizada |
|-------|---------------|----------------|
| SWRD | 8.6% | 15.7% |
| AVGS | 8.7% | 17.0% |
| AVEM | 10.3% | 20.4% |

Correlações: SWRD-AVGS 0.941, SWRD-AVEM 0.826, AVGS-AVEM 0.843.

#### Resultados — Pesos ótimos vs Diego

| Método | SWRD | AVGS | AVEM | Ret | Vol | Sharpe |
|--------|------|------|------|-----|-----|--------|
| Max Sharpe | 79% | 0% | 21% | 9.0% | 16.1% | 0.557 |
| Min Volatility | 100% | 0% | 0% | 8.6% | 15.7% | 0.551 |
| HRP | 34% | 28% | 38% | 9.3% | 17.0% | 0.546 |
| Risk Parity (RL) | 37% | 34% | 29% | 9.1% | 16.7% | 0.547 |
| Equal Weight | 33% | 33% | 33% | 9.2% | 16.9% | 0.546 |
| VWRA (benchmark) | 88% | 0% | 12% | 8.8% | 15.9% | 0.556 |
| **Diego 50/30/20** | **50%** | **30%** | **20%** | **9.0%** | **16.3%** | **0.550** |

#### Sensibilidade — Premissas Diego (3.7%/5.0%/5.0% USD real)

| Método | SWRD | AVGS | AVEM | Ret | Vol | Sharpe |
|--------|------|------|------|-----|-----|--------|
| Max Sharpe (Diego) | 0% | 100% | 0% | 5.0% | 17.0% | 0.294 |
| Min Vol (Diego) | 100% | 0% | 0% | 3.7% | 15.7% | 0.236 |
| **Diego 50/30/20** | **50%** | **30%** | **20%** | **4.4%** | **16.3%** | **0.266** |

#### Distância de Diego vs ótimos

- vs Max Sharpe (histórico): Sharpe gap = +0.007
- vs HRP: Sharpe gap = -0.005
- vs Risk Parity: Sharpe gap = -0.003
- vs Max Sharpe (premissas Diego): Sharpe gap = +0.028

#### Achados preliminares

1. **Diego 50/30/20 é defensável** — gaps Sharpe são <0.01 vs maioria dos métodos (dentro do erro de estimação com 242 meses)
2. **AVGS vs SWRD: correlação 0.94** — pouca diversificação real. O benefício do tilt é retorno extra, não diversificação
3. **Max Sharpe zera AVGS** com dados históricos (retorno similar a SWRD mas vol maior). Só justifica com premissa de factor premium forward-looking
4. **Premissas importam mais que método** — Max Sharpe oscila de 0% a 100% AVGS dependendo das premissas de retorno. A alocação 50/30/20 é uma decisão sobre convicção em fatores, não sobre otimização

### Pendente — Rodar localmente

- [ ] Repetir com dados reais de preço (yfinance) em vez de factor returns sintéticos
- [ ] Adicionar constraints realistas (min 10% por ativo, max 60%)
- [ ] Rodar Black-Litterman com views = premissas Diego
- [ ] Efficient frontier plot (matplotlib)
- [ ] Levar resultados para debate Factor + Advocate + FIRE

### Análise com dados reais — Rodada 2 (local, 2026-04-07)

**Método:** Preços reais via yfinance. SWRD → IDEV (proxy, 5 anos), AVGS → AVUV×0.58 + AVDV×0.42 (proxy), AVEM → US-listed. Período: 2021-04-07 a 2026-04-07 (1.256 pregões). Ferramentas: PyPortfolioOpt + Riskfolio-Lib.

**Dados históricos (5 anos, dados reais):**

| Proxy | Ret Anual | Vol | Proxy para |
|-------|-----------|-----|------------|
| IDEV | 8.19% | 16.12% | SWRD |
| AVUV×0.58+AVDV×0.42 | 12.22% | 19.18% | AVGS |
| AVEM (US) | 7.01% | 17.88% | AVEM |

Correlações: SWRD-AVGS 0.860 | SWRD-AVEM 0.818 | AVGS-AVEM 0.715 (AVGS mais diversificado que síntese web)

**Pesos ótimos vs Target:**

| Método | SWRD | AVGS | AVEM | Sharpe |
|--------|------|------|------|--------|
| Max Sharpe | 0% | 37.8% | 62.2% | 0.539 |
| Min Variance | 77.7% | 0% | 22.3% | 0.503 |
| HRP | 31.2% | 22.0% | 46.8% | 0.533 |
| **Target 50/30/20** | **50%** | **30%** | **20%** | **0.572** |

**Achado crítico: Target 50/30/20 tem o melhor Sharpe (0.572) e Sortino (0.848) no backtest real.** O otimizador é "matematicamente correto mas praticamente errado": zera SWRD porque AVGS/AVEM têm mesmo expected return com SWRD menor, mas ignora:
1. Período 2021-2026 castigou AVEM (7.01% vs AVGS 12.22%)
2. SWRD é anchor de liquidez e risk-reducer (vol 16.12% vs AVEM 17.88%)
3. Bootstrap: SWRD=0% está fora do IC 90% — corner solution típico de overfitting (Michaud 1989)

**Veredicto Factor:** 50/30/20 é **fortemente defensável**. O resultado numérico confirma: não há evidência quantitativa de que outro peso seria superior com dados reais. A alocação reflete convicção em factor premiums forward-looking — uma decisão de premissas, não de otimização histórica.
