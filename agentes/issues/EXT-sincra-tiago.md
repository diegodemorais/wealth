# EXT-sincra-tiago: Diagnóstico da Carteira — Tiago Modesto (Sincra / BTG)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | EXT-sincra-tiago |
| **Dono** | Head |
| **Status** | ✅ Done |
| **Concluído em** | 2026-04-12 |
| **Prioridade** | 🟡 Média |
| **Participantes** | Todos os agentes |
| **Criado em** | 2026-04-11 |
| **Origem** | Diego — carteira do amigo Tiago Modesto, sócio da Sincra (escritório BTG) |

---

## Contexto

Tiago Modesto é sócio da Sincra, escritório de investimentos BTG. Ele apresentou o documento de alocação estratégica da sua carteira pessoal. Diego quer uma análise segundo o framework evidence-based do time.

**Fluxo em duas fases:**
1. **Fase 1 (aqui):** debate interno com todos os agentes → Diego valida
2. **Fase 2:** produção de relatório PDF para entregar ao Tiago

---

## Dados da Carteira (extraídos do documento)

### Perfil

| Campo | Valor |
|-------|-------|
| Perfil | Investidor profissional, sofisticado |
| Idade | 40 anos |
| Horizonte | 20–30 anos |
| Patrimônio | R$1.300.000 |
| Tolerância a risco | Moderada-agressiva |
| Objetivo | Acumulação patrimonial e aposentadoria |
| Custódia | BTG Pactual (B3 + Mynt integrados) |
| Rebalanceamento | Híbrido: threshold + momentum + cash flow + taxa dinâmica |

### Alocação

| Ativo | Classe | Peso | Valor (R$) | Moeda |
|-------|--------|------|-----------|-------|
| VWRA11 | Ações Globais (49 países) | 33% | R$429.000 | USD/Global |
| BOVA11 | Ações Brasil (Ibovespa) | 12% | R$156.000 | BRL |
| HERT11 | Imobiliário Brasil (FIIs Tijolo) | 8% | R$104.000 | BRL |
| LFTB11 | RF Pós (Selic + IPCA) | 10% | R$130.000 | BRL |
| Renda+ 2065 | RF Inflação (Tesouro IPCA+) | 15% | R$195.000 | BRL |
| BNDX11 | RF Global ex-EUA | 5% | R$65.000 | USD/Global |
| BTC | Criptoativo | 5% | R$65.000 | Cripto/USD |
| PAXG | Ouro Físico Tokenizado | 12% | R$156.000 | Cripto/USD |
| **TOTAL** | **BRL 45% / USD+Global 55%** | **100%** | **R$1.300.000** | — |

### Protocolo de rebalanceamento

1. **Cash flow primeiro** — aportes antes de vender
2. **Respeite o momentum** — vencedor em alta (12M): rebalanceia só 50% do excesso
3. **Não pegue a faca** — perdedor em queda: compre gradualmente
4. **Emergência inegociável** — banda extrema = rebalancear imediatamente
5. **LFTB11 é munição** — fonte de recursos para oportunidades
6. **Renda+ é tática** — peso muda conforme taxa real (alta = comprar, baixa = realizar)
7. **Revisão semestral** — jan e jul, só opera se desvio > threshold

### Bandas de tolerância

| Ativo | Peso | Banda | Faixa OK | Emergência | Tipo |
|-------|------|-------|----------|------------|------|
| VWRA11 | 33% | ±5pp | 28–38% | ±10pp | Fixo |
| BOVA11 | 12% | ±4pp | 8–16% | ±8pp | Fixo |
| HERT11 | 8% | ±3pp | 5–11% | ±6pp | Fixo |
| LFTB11 | 10% | ±3pp | 7–13% | ±6pp | Flexível |
| Renda+ 2065 | 15% | ±4pp | 11–19% | ±8pp | Dinâmico |
| BNDX11 | 5% | ±2pp | 3–7% | ±5pp | Fixo |
| BTC | 5% | ±2.5pp | 2.5–7.5% | ±5pp | Fixo |
| PAXG | 12% | ±3pp | 9–15% | ±6pp | Fixo |

### Backtest simulado — 36 meses (abr/2023–mar/2026)

| Métrica | Carteira | CDI | Dólar | IMA-B | Ibovespa | S&P 500 |
|---------|----------|-----|-------|-------|----------|---------|
| Retorno total | 47.6% | 47.1% | 4.9% | 48.0% | 52.7% | 27.1% |
| Retorno anualizado | 13.9% | 13.7% | 1.6% | 13.9% | 15.1% | 8.3% |
| Volatilidade anual | 6.8% | 0.3% | 8.7% | 12.0% | 24.1% | 12.7% |
| Max drawdown | -5.3% | 0.0% | -11.6% | -16.0% | -26.1% | -15.8% |
| Sharpe (vs CDI) | 0.02 | 0.00 | -1.39 | 0.02 | 0.06 | -0.42 |

### Correlação estimada (2020–2025)

| | BOVA11 | HERT11 | LFTB11 | Renda+ | BNDX11 | BTC | PAXG |
|---|---|---|---|---|---|---|---|
| VWRA11 | +0.55 | +0.25 | -0.10 | -0.15 | +0.30 | +0.35 | +0.05 |
| BOVA11 | — | +0.50 | +0.10 | -0.25 | +0.15 | +0.30 | +0.05 |
| HERT11 | | — | +0.20 | -0.30 | +0.10 | +0.15 | -0.05 |
| LFTB11 | | | — | +0.40 | +0.15 | -0.05 | +0.15 |
| Renda+ | | | | — | +0.20 | -0.20 | +0.20 |
| BNDX11 | | | | | — | +0.20 | +0.10 |
| BTC | | | | | | — | +0.05 |

---

## Escopo — Fase 1

Cada agente analisa segundo o framework evidence-based do time. Foco: **o que está bem, o que está errado, o que mudaria e por quê.**

| Agente | Foco |
|--------|------|
| **Factor** | Equity (VWRA11 sem tilt fatorial, BOVA11, HERT11) — o que falta, o que sobra |
| **RF** | Fixed income (Renda+ 2065, LFTB11, BNDX11) — adequação, carry, duration, sequência |
| **Risco** | Alternativas (BTC 5% + PAXG 12% = 17%) — sizing, tese, concentração |
| **FIRE** | Perfil de acumulação: R$1.3M aos 40 anos, horizonte 20–30 anos — P(aposentadoria), gaps |
| **Tax** | BTG/Mynt custody, PAXG isenção até R$35k, tributação ETFs B3, Renda+ IR |
| **FX** | Exposição cambial (55% USD/Global) — adequação, ausência de hedge |
| **Macro** | Renda+ dinâmico vs ciclo atual, LFTB11 vs Selic, BNDX11 vs IPCA+ |
| **Advocate** | Stress-test geral: quais premissas se fossem erradas quebrariam a carteira? |
| **Quant** | Backtest: os números são críveis? (volatilidade 6.8% + drawdown -5.3% + Sharpe 0.02 com 33% equity) |
| **Fact-Checker** | Verificar claims: correlações citadas, isenção PAXG, composição HERT11, BNDX11 hedgeado? |

---

## Questões-guia para o debate

1. O PAXG em 12% tem suporte acadêmico como diversificador? Ou é viés de narrativa (inflação, geopolítica)?
2. VWRA11 sem tilt fatorial é a única opção disponível no BTG B3? Há alternativas com factor premium?
3. BNDX11 faz sentido com IPCA+ a 6%+? Qual o carry relativo?
4. O backtest de 6.8% vol com 33% equity (VWRA11+BOVA11+HERT11) é plausível? Ou suavizado?
5. HERT11 (FIIs tijolo) como classe separada — adiciona diversificação real ou é apenas Brasil equity com outro wrapper?
6. R$1.3M aos 40, horizonte 20–30 anos: o equity total (~53%) é suficiente para acumulação? Ou deveria ser mais agressivo?
7. O protocolo de rebalanceamento com 7 regras — é robusto ou complexo demais para execução consistente?

---

## Resultado esperado — Fase 1

- Diagnóstico consolidado: pontos fortes, pontos fracos, gaps críticos
- Opinião do time sobre o que mudaria (e o que não mudaria) segundo nossas crenças
- Diego valida → abre Fase 2 (relatório PDF para o Tiago)
