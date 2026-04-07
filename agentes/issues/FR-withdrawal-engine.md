# FR-withdrawal-engine: Motor parametrizável de withdrawal strategies

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-withdrawal-engine |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | FIRE (lead), Head, Quant, RF |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs cFIREsim/FI Calc |
| **Concluido em** | — |

---

## Motivo / Gatilho

Nosso `fire_montecarlo.py` usa guardrails fixos. cFIREsim e FI Calc testam múltiplas withdrawal strategies como opções configuráveis (VPW, Guyton-Klinger, percent-of-portfolio, constant-dollar). Gap identificado no scan de repos open-source (2026-04-07).

---

## Descricao

Parametrizar o motor de withdrawal do Monte Carlo para testar diferentes estratégias de desacumulação e comparar P(sucesso) entre elas.

---

## Escopo — Roteiro Padrão de Integração

- [x] **1. Instalar e analisar**: cFIREsim-open e FI Calc analisados (scan 2026-04-07)
- [x] **2. Mapear features**: 5 strategies mapeadas — guardrails, constant, pct_portfolio, VPW, Guyton-Klinger
- [x] **3. Avaliar o que temos**: nossos guardrails = drawdown-based, mais conservador que GK
- [x] **4. Prova de conceito**: 4 strategies alternativas implementadas em `fire_montecarlo.py` como `--strategy` + `--compare-strategies`
- [x] **5. Executar comparativo**: rodada 1 (5k sims, cenário base) completa — ver Análise abaixo
- [ ] **6. Reportar ao time**: FIRE, Advocate e Quant avaliam resultados e trade-offs
- [ ] **7. Sintetizar e decidir**: adotar estratégia superior? Manter guardrails? Documentar

---

## Raciocínio

**Argumento central:** A escolha de withdrawal strategy tem impacto de 5-15pp no P(sucesso) segundo a literatura. Testar apenas 1 estratégia é equivalente a testar apenas 1 alocação — perde o espaço de otimização.

**Incerteza reconhecida:** Complexidade adicional pode não mudar a decisão se guardrails atuais já são robustos. O valor está em confirmar ou melhorar.

**Falsificação:** Se P(sucesso) variar <2pp entre estratégias com nossas premissas, a complexidade não se justifica.

---

## Analise

### Rodada 1 — Comparativo 5 strategies (web, 2026-04-07)

**Premissas:** Padrão carteira.md (patrimônio R$3.37M, aporte R$25k/mês, FIRE 53, 37 anos desacumulação, spending smile + saúde VCMH, IR 15% ativo, INSS R$18k/ano aos 65).

**Seed:** 42 | **Sims:** 5.000 | **Cenário:** base

| Strategy | P(FIRE) | Pat.Med.Final | Pat.P10.Final | Observação |
|----------|---------|---------------|---------------|------------|
| **guardrails** | 89.9% | R$70.3M | R$2.7M | Nossa estratégia atual |
| constant | 82.2% | R$74.3M | R$2.5M | Baseline — sem ajuste por mercado |
| pct_portfolio | 91.0% | R$62.7M | R$2.4M | Renda variável, nunca quebra se floor |
| vpw | 80.1% | R$48.8M | ~R$0 | Agressivo demais nos anos iniciais |
| **guyton_klinger** | 91.0% | R$58.5M | R$2.3M | Regras GK (2006) |

### Achados preliminares

1. **Guardrails atuais (89.9%) estão entre os melhores** — apenas pct_portfolio e Guyton-Klinger empatam/superam marginalmente (+1.1pp)
2. **Constant-dollar (82.2%) é o pior** — confirma que algum mecanismo de ajuste é essencial
3. **VPW (80.1%) surpreendentemente ruim** — taxa de saque sobe rápido com menos anos restantes, gerando saques altos nos anos finais
4. **Guyton-Klinger (91.0%) = melhor** — ligeiramente superior aos nossos guardrails por ser mais agressivo em cortar e mais disciplinado na regra de não-inflação
5. **Delta máximo = 10.9pp** (constant vs GK/pct) — estratégia importa significativamente
6. **Nossos guardrails vs GK: delta = 1.1pp** — marginal, mas consistente

### Trade-offs qualitativos

| Strategy | Pro | Contra |
|----------|-----|--------|
| guardrails | Simples, intuitivo, já aprovado | Ligeiramente inferior a GK |
| pct_portfolio | Nunca quebra por definição (% do que tem) | Renda muito volátil — pode cair a R$180k em crash |
| guyton_klinger | Melhor P(FIRE), baseado em paper peer-reviewed | Mais complexo, requer tracking de withdrawal rate |

### Rodada 2 — Gastos médios por faixa etária (web, 2026-04-07)

3.000 sims, seed 42, cenário base. Métricas de gasto por faixa:

#### Guardrails (P(FIRE) 90.4%)

| Idade | Fase | Gasto médio | P10–P90 | Vol |
|-------|------|-------------|---------|-----|
| 53-64 | Go-Go | R$257k | R$209k–R$280k | R$26k |
| 65-74 | Slow-Go | R$214k | R$167k–R$274k | R$37k |
| 75-84 | No-Go | R$205k | R$164k–R$254k | R$34k |
| 85-90 | Final | R$182k | R$162k–R$215k | R$23k |

#### Guyton-Klinger (P(FIRE) 91.5%)

| Idade | Gasto médio | P10–P90 | Vol |
|-------|-------------|---------|-----|
| 53-64 | R$268k | R$198k–R$347k | R$63k |
| 65-74 | R$294k | R$162k–R$493k | R$149k |
| 75-84 | R$341k | R$162k–R$641k | R$248k |
| 85-90 | R$357k | R$162k–R$667k | R$289k |

#### Resumo comparativo

| Strategy | P(FIRE) | Gasto Médio | Vol Gasto | Renda Estável? |
|----------|---------|-------------|-----------|----------------|
| guardrails | 90.4% | R$222k | R$41k | Parcial |
| constant | 81.9% | R$253k | R$23k | Sim |
| pct_portfolio | 91.6% | R$276k | R$87k | Não |
| vpw | 79.8% | R$414k | R$113k | Não |
| guyton_klinger | 91.5% | R$306k | R$189k | Não |

**Trade-off central:** mais P(FIRE) = mais volatilidade de renda. Guardrails = melhor equilíbrio estabilidade × sobrevivência. GK = +1.1pp P(FIRE) mas 4.6× mais vol de renda.

### Pendente — Debate com time

- [ ] FIRE avalia: GK +1.1pp justifica complexidade adicional?
- [ ] Advocate: guardrails são simplificação válida de GK ou inferior?
- [ ] Quant: validar VPW (resultado ruim — bug ou feature da fórmula PMT?)
- [ ] Behavioral: qual strategy Diego toleraria psicologicamente em drawdown?
- [ ] Rodar 10k sims + cenários stress/favorável localmente

### Rodada 3 — 10k sims (local, 2026-04-07)

| Strategy | P(FIRE) | Pat.Med.Final | Pat.P10.Final |
|----------|---------|---------------|---------------|
| guardrails | 90.4% | R$71.8M | R$2.6M |
| constant | 82.7% | R$74.6M | R$2.5M |
| pct_portfolio | 91.3% | R$60.9M | R$2.5M |
| vpw | 80.5% | R$49.3M | R$0.0M |
| guyton_klinger | 91.0% | R$58.2M | R$2.6M |

Confirmação das rodadas anteriores. Delta máximo: 10.8pp (constant vs pct_portfolio). Guardrails: 90.4%. GK: 91.0%. VPW: P10 = R$0 (esgotamento).

### Debate FIRE (2026-04-07)

**Veredicto FIRE: Manter guardrails.**

1. **Delta 1.1pp (guardrails 90.4% vs GK 91.0%) não é estatisticamente significativo** em 10k sims (IC ~±1pp). Pode inverter com seed diferente.

2. **Vol de gasto é o fator decisivo para família:**
   - Guardrails: vol R$41k, range P10–P90 R$162k–R$280k
   - GK: vol R$189k, range P10–P90 R$162k–R$667k
   - +4.6× de volatilidade de renda = inaceitável para planejamento familiar

3. **GK mal interpretado:** spending médio GK sobe com a idade (R$268k → R$357k) pela regra de prosperidade — artefato que parece bom mas expõe ao risco de gastos insustentáveis nos anos finais.

4. **VPW ruim é feature, não bug:** PMT aumenta à medida que anos restantes diminuem — saques crescem no final da desacumulação quando o portfolio está menor. P10 = R$0 confirma.

**Decisão pendente para Diego:**
- [ ] Confirmar: manter guardrails como estratégia principal?
- [ ] GK como referência de monitoramento (alertar quando GK sugere corte mas guardrails não)?
- [ ] Documentar em carteira.md
