# Scorecard do Sistema de Agentes

> Atualizado em: 2026-03-26 (HD-scorecard)
> Frequencia: mensal (metricas operacionais), trimestral (performance), anual (FIRE)

---

## 1. Metricas de Valor

### 1.1 P(FIRE) — Probabilidade de aposentadoria aos 50

| Data | P(FIRE) | Metodo | Premissas | Status |
|------|---------|--------|-----------|--------|
| 2026-03-22 | **91%** (flat R$250k), **87%** (flat R$350k) | Monte Carlo 10k trajetorias (FR-003) | Patrimonio R$3.48M, aporte R$25k/mes, custo R$250k/ano flat, horizonte 11 anos, guardrails aprovados, premissas HD-006 | Superado por FR-spending-smile |
| 2026-03-27 | **80.8%** base / **89.9%** favoravel / **74.3%** stress — FIRE 50 | MC spending smile (FR-spending-smile) | Spending smile: Go-Go R$280k / Slow-Go R$225k / No-Go R$285k + saude R$37.9k × inflator 7% cap/decay. t-dist df=5 | Superado por HD-mc-audit |
| 2026-03-27 | **86.9%** base / **93.7%** favoravel / **81.0%** stress — FIRE 53 | MC two-pool bond tent (FR-fire2040) | Same spending smile + FIRE 53 (saude R$46.4k). Bond tent 12% (TD 2040). Patrimônio mediano R$13.4M | Superado por HD-mc-audit |
| 2026-04-06 | **90.8%** base / **94.6%** favoravel / **87.4%** stress — FIRE 53 | `fire_montecarlo.py` HD-mc-audit | Spending smile ex-saúde (R$242k/R$200k/R$187k) + IR 15% nominal + INSS R$18k@65 + vol bond pool 13.3%. Patrimônio mediano R$11.53M | Superado por HD-multimodel-premissas |
| 2026-04-06 | **90.4%** base / **94.1%** favoravel / **86.8%** stress — FIRE 53 | `fire_montecarlo.py` HD-multimodel-premissas Bloco A | SAUDE_BASE R$16k→R$18k/pp (ajuste conservador). Restante igual. | **Atual** |

- **Patrimonio mediano projetado**: R$10.56M aos 50 (FIRE 50) / R$13.4M aos 53 (safe harbor)
- **Gatilho de transicao FIRE**: patrimônio real >= R$13.4M (R$2026) **E** SWR <= 2.4%
- **Frequencia**: Anual (ou quando premissa de vida mudar)
- **Meta**: >= 90% (FIRE 50 abaixo; FIRE 53 favoravel acima)
- **Dono**: 04 FIRE
- **Alerta decada perdida**: P(FIRE) cai para 31-43% em cenario de decada perdida. Risco real = sequence of returns, nao perda de renda.
- **Bear -30% ano 1**: P cai 15.6pp (FIRE 50) → 65.2%. Risco dominante do modelo.

**Alpha esperado do tilt fatorial (atualizado HD-simplicity 2026-03-25):**

| Metrica | Valor | Fonte |
|---------|-------|-------|
| Retorno bruto equity fatorial (base) | 5.96%/ano BRL real | HD-006, carteira.md |
| Retorno VWRA equivalente (35% de mkt) | ~5.4%/ano BRL real | DMS 2025 + AQR 2026 |
| Alpha bruto do tilt | ~0.56%/ano | Delta fatorial vs mercado |
| Haircut post-publication (McLean & Pontiff 2016) | 58% | HD-simplicity |
| Alpha pos-haircut | ~0.235%/ano | 0.56% × (1−0.58) = 0.235% |
| Custos incrementais (TER delta + FX + operacional) | −0.073%/ano | HD-simplicity |
| **Alpha liquido esperado** | **~0.16%/ano** | 0.235% − 0.073% = 0.163% |

---

### 1.2 Delta vs Shadow Portfolios

Comparacao da carteira real contra contrafactuais. Ver detalhes em `shadow-portfolio.md`.

| Data | Patrimonio Real | Target | Shadow A (100% VWRA) | Shadow B (100% IPCA+) | Shadow C (79% VWRA+15% IPCA+) | Delta A | Delta B | Delta C |
|------|----------------|--------|----------------------|----------------------|-------------------------------|---------|---------|---------|
| 2026-03-20 (T0) | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | 0.00% | 0.00% | 0.00% |
| 2026-03-23 (Q1) | R$ 3.492.284 | R$ ~3.399k* | R$ 3.387.800 | R$ 3.512.116 | — | **+3.15pp** | **−0.57pp** | — |

- **Frequencia**: **Mensal** (atualizado via /checkin-automatico no primeiro check-in do mes)
- **Meta**: Delta A > 0 (bater VWRA passivo) em rolling 3 anos; Delta B > 0 (bater RF pura) em rolling 3 anos; Delta C > 0 (bater VWRA sem tilt) em rolling 3 anos
- **Dono**: 10 Advocate
- **Shadow C**: adicionado em HD-scorecard (2026-03-26). Tracking comeca Abr/2026.

---

### 1.3 Custo de Complexidade

TER incremental da carteira vs shadow portfolios.

| Metrica | Carteira Real | Shadow A | Shadow B | Shadow C | Delta vs A | Delta vs C |
|---------|--------------|----------|----------|----------|------------|------------|
| TER ponderado (equity) | 0.247% | 0.220% | 0.20% | 0.220% | +2.7 bps | +2.7 bps |
| # ETFs gerenciados | 11 (4 alvo + 7 transitorios) | 1 ETF + 1 titulo | 1 titulo | 1 ETF + 1 titulo | +10 instrumentos | +10 instrumentos |
| # regras/gatilhos ativos | 16 (consolidados HD-007) | 1 (rebalance anual) | 0 | 1 | +15 regras | +15 regras |
| Custo cambio (Okegen) | 0.25% ida+volta | 0.25% | 0% | 0.25% | 0 bps | 0 bps |
| Tempo de gestao estimado | ~4h/mes | ~30min/mes | ~0min/mes | ~30min/mes | +3.5h | +3.5h |

**Composicao do TER ponderado da carteira real (alvos — FI-equity-redistribuicao 2026-04-01):**

| ETF | Peso Alvo (equity) | Peso Portfolio Total | TER | Contribuicao (equity) |
|-----|-------------------|---------------------|-----|----------------------|
| SWRD | 50% | 39.5% | 0.12% | 0.060% |
| AVGS | 30% | 23.7% | 0.39% | 0.117% |
| AVEM | 20% | 15.8% | 0.35% | 0.070% |
| **Equity total** | **100%** | **79%** | — | **0.247%** |
| HODL11 | — | 3% | 0.20% | 0.006% |
| Tesouro Direto | — | ~18% (alvo) | 0.20% (custodia B3) | 0.036% |
| **Portfolio total** | — | **100%** | — | **~0.237%** |

**Shadow A TER**: 100% x 0.22% (VWRA) = **0.220%**
**Shadow B TER**: 100% x 0.20% (custodia B3) = **0.200%**
**Shadow C TER**: 79% x 0.22% (VWRA) + 15% x 0.20% (TD) + 3% x 0.20% (HODL11) = **0.207%**

**Veredicto**: Custo incremental em TER e minimo (+2.7 bps vs Shadow A, +4.0 bps vs Shadow C). O custo real de complexidade esta em tempo de gestao e risco operacional, nao em fees. Alpha esperado pos-haircut: ~0.16%/ano — marginalmente acima do custo de complexidade de TER.

---

### 1.4 Stress Test — Cenarios Extremos

| Cenario | Impacto Estimado | Bloco Mais Afetado | Status |
|---------|-----------------|-------------------|--------|
| Drawdown -40% (equity) | -R$1.1M no patrimonio (79% x R$3.5M x 40%) | Equity (79%) | Modelado FR-003 |
| Decada perdida (FIRE 50-60) | P(FIRE) cai de 91% para 31-43% | Sequence of returns | Modelado FR-003 |
| Risco soberano BR extremo (CDS 800bps+) | Bloco soberano ~21% em stress; equity 7x mais arriscado | IPCA+ / Renda+ | RK-001 v2 |
| **Quant Crisis 2.0** | AVGS -25% a -35% em semanas; bloco equity total -16% a -22.5% | AVGS (30% do equity, 23.7% do portfolio) | **A modelar** |
| Crise fiscal BR (IOF 10% remessas) | Equity internacional bloqueado; aportes parados | Equity UCITS | Parcialmente coberto |

**Nota Quant Crisis 2.0 (FI-crowdedness 2026-03-24):** AVGS max DD historico -39% e piso, nao teto. Em 2008-style, small value pode cair -60%+. Impacto no portfolio: 25% equity × 60% = -15% do bloco equity = -11.85% do portfolio total. Modelagem formal pendente.

---

## 2. Metricas Operacionais

### 2.1 Finding Rate — Taxa de Descoberta

Findings = insights acionaveis que o sistema gera antes de Diego precisar agir por conta propria.

| Periodo | Sessoes/Issues | Findings Total | Preventivos | Otimizadores | Falsos Positivos | Diego Achou Primeiro | Rate/Sessao |
|---------|---------------|---------------|-------------|--------------|------------------|---------------------|-------------|
| 2026-03-18 a 2026-03-20 | 3 | 7 | 3 | 3 | 1 | 2 | 2.33 |
| 2026-03-21 a 2026-03-26 | ~10 issues | 10 | 6 | 4 | 0 | 0 | ~1.0 |
| **Total acumulado** | **13** | **17** | **9 (53%)** | **7 (41%)** | **1 (6%)** | **2 (12%)** | **~1.3** |

- **Frequencia**: Mensal
- **Meta**: >= 1.5 findings/sessao, com < 20% falsos positivos
- **Dono**: 00 Head
- **Detalhes**: Ver `findings-log.md`
- **Tendencia**: Falsos positivos caindo (29% -> 0% no periodo recente). Diego achou primeiro caindo (43% -> 0%). Evolucao positiva — sistema madurando.

---

### 2.2 Taxa de Erro — Diego Corrigiu o Sistema

Erros = momentos em que Diego identificou problema antes do sistema, ou sistema deu recomendacao incorreta.

| Periodo | Interacoes | Erros Sistema | Diego Achou Primeiro | Taxa de Erro |
|---------|-----------|--------------|---------------------|-------------|
| 2026-03-18 a 2026-03-20 | 3 sessoes | 3 | 2 | ~43% das sessoes tiveram erro |
| 2026-03-22 (HD-006) | 1 sessao | 9+4 erros | Parcial (debate revelou) | Muito alta — sessao de auditoria |
| 2026-03-22 a 2026-03-25 | ~5 issues | 5 | 0 | Baixa — sistema pegou via Fact-Checker |

**Erros identificados:**

| # | Erro | Sessao | Gravidade | Diego Achou? |
|---|------|--------|-----------|-------------|
| 1 | HODL11 classificado como risco Brasil (2x antes de corrigir) | 2026-03-18 | Media | Sim |
| 2 | IPCA+ 2032 contradicao interna (nao existe sem cupom) | 2026-03-18 | Alta | Sim |
| 3 | 7 agentes criticaram "gap de execucao" sem consultar dados reais | 2026-03-19 | Media | Sim (na retro) |
| 4 | Breakeven IPCA+ calculado como 6.4% (depois 7.81%) — correto ~5.5%. IR sobre real em vez de nominal | 2026-03-22 | Alta | Parcial |
| 5 | 8 erros adicionais de calculo em premissas (HD-006): WHT, IOF, ganho fantasma, IR nominal | 2026-03-22 | Media | Parcial |
| 6 | Haircut SmB/HmL: 30% era muito otimista. Correto: 35-40% (FI-crowdedness) depois 58% (HD-simplicity) | 2026-03-24/25 | Media | Nao (Fact-Checker) |
| 7 | Retorno ponderado equity: 5.89% em carteira.md -> correto 5.96% (Quant em HD-equity-weight) | 2026-03-25 | Baixa | Nao (Quant) |
| 8 | Cederburg (2023): autores incorretos (sem Wang/Yaron, nao e NBER) | 2026-03-25 | Media | Nao (Fact-Checker) |
| 9 | Pfau-Kitces benefit: +6-8pp -> correto +2-4pp (nao replica em dados historicos) | 2026-03-25 | Media | Nao (Fact-Checker) |

- **Frequencia**: Mensal
- **Meta**: < 1 erro grave/mes, 0 erros que Diego pega antes do sistema
- **Dono**: 00 Head
- **Regra anti-recorrencia (HD-006)**: (A) fonte obrigatoria para cada numero, (B) formula explicita antes do resultado, (C) reconciliacao trimestral, (D) comparacao all-in obrigatoria, (E) reflexao registrada

---

### 2.3 Gap de Execucao — Decisao a Acao

| Decisao | Data Aprovacao | Status atual | Gap |
|---------|---------------|-------------|-----|
| IPCA+ 2040 DCA (alvo 15%) | 2026-03-18/22 | Em andamento (taxa 7.16% >> piso 6.0%) | Conforme — DCA ativo |
| Aportes equity SWRD/AVGS | 2026-04-01 | SWRD underweight -3.4%. Aportar aqui | Conforme — nova estrategia 50/30/20 |
| Renda+ 2065 DCA | Condicional (>= 6.5%) | Taxa ~7.1%. Monitorar | Conforme |
| Reserva -> Selic no vencimento | 2026-03-18 | Aguarda 2029 | Conforme |
| IPCA+ curto 3% | Condicional (perto dos 50) | Nao comprar agora | Conforme |

- **Frequencia**: Mensal
- **Meta**: Primeira tranche em T+5 dias uteis apos aprovacao
- **Dono**: 00 Head

---

## 3. Metricas de Previsao

Decisoes ativas que tem resultado esperado e prazo. Ver detalhes em `previsoes.md`.

| Previsao | Resultado Esperado | Prazo | Confianca | Status |
|----------|-------------------|-------|-----------|--------|
| IPCA+ 2040 DCA — taxa media >= 6.5% | Taxa media de compra >= 6.5% | Jun 2026 | Alta (~80%) | Aberta |
| Renda+ 2065 taxa cai | Taxa <= 6.0% em 12-18 meses | Mar-Set 2027 | Baixa-Media (40-55%) | Aberta |
| ~~JPGL gap fecha~~ | ~~Gap < 2% em 27-30 meses~~ | ~~Jun-Set 2028~~ | — | Cancelada (JPGL = 0%, FI-jpgl-zerobased 2026-04-01) |

- **Frequencia**: Trimestral
- **Dono**: Agente responsavel por cada previsao

---

## 4. Dashboard Resumo

> Atualizado: 2026-03-26

| Metrica | Valor atual | Meta | Status |
|---------|------------|------|--------|
| P(FIRE) base — FIRE 53 | **90.4%** (HD-multimodel-premissas, 2026-04-06) | >= 90% | **✅ OK** |
| P(FIRE) favoravel — FIRE 53 | **94.1%** (HD-multimodel-premissas, 2026-04-06) | >= 90% | **✅ OK** |
| P(FIRE) stress — FIRE 53 | **86.8%** (HD-multimodel-premissas, 2026-04-06) | >= 80% | **✅ OK** |
| Patrimonio mediano projetado (FIRE 50) | **R$10.56M** | R$7-8M | **Folga** |
| Patrimonio gatilho FIRE (real R$2026) | **R$13.4M** (SWR <= 2.4%) | — | Referencia |
| Alpha esperado pos-haircut | **~0.16%/ano** | > 0% | **Marginal/OK** |
| Delta vs Shadow A (Q1 2026) | +3.15pp | > 0% rolling 3 anos | **OK** |
| Delta vs Shadow B (Q1 2026) | -0.57pp | > 0% rolling 3 anos | **Normal** (regime inflacionario — esperado) |
| TER incremental vs VWRA | +2.7 bps | < 10 bps | **OK** |
| Finding rate (acumulado) | ~1.3/sessao | >= 1.5 | **Atencao** |
| Falsos positivos (periodo recente) | 0% | < 20% | **OK** |
| Diego achou primeiro (periodo recente) | 0% | 0% | **OK** |
| Gap de execucao | Todos conformes | T+5 dias uteis | **OK** |
| Previsoes abertas | 3 | — | Baseline |
| # instrumentos gerenciados | 11 | — | Custo de complexidade |
| Quant Crisis 2.0 modelado | Nao | Sim | **Pendente** |

---

## Regras do Scorecard

1. **Frequencia de atualizacao**: mensal para operacionais, trimestral para performance, anual para FIRE
2. **Quem atualiza**: Head coordena, cada agente alimenta sua metrica
3. **Gatilho de alerta**: se Delta vs Shadow A ou B ficar negativo por 3 trimestres consecutivos em rolling 3 anos, revisao obrigatoria de complexidade. **Excecao Shadow B**: em regime inflacionario (Selic alta, IPCA acima do centro da meta), Delta B negativo e esperado — IPCA+ performa bem e equity BRL sofre simultaneamente. Nao alarmar nesse cenario especifico.
4. **Gatilho de erro**: se Diego pegar erro antes do sistema 2x no mesmo mes, root cause analysis obrigatoria
5. **Finding quality**: falsos positivos > 30% por 2 meses consecutivos = revisao dos checklists dos agentes
6. **Haircut canonico**: 58% (McLean & Pontiff 2016, pos-publicacao). Qualquer calculo de alpha fatorial usa esse valor.
