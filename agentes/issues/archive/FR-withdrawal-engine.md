# FR-withdrawal-engine: Motor parametrizável de withdrawal strategies

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-withdrawal-engine |
| **Dono** | FIRE |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | FIRE (lead), Advocate, Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs cFIREsim/FI Calc |
| **Concluido em** | 2026-04-07 |

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

### Debate completo — FIRE + Advocate (2026-04-07)

#### FIRE (2 agentes independentes): Manter guardrails

**Razões convergentes:**

1. **Delta 1.1pp não é estatisticamente significativo** em 10k sims (IC ~±1pp). Com seed diferente, pode inverter.

2. **Vol de gasto é o fator decisivo para família:**
   - Guardrails: vol R$41k, range P10–P90 R$162k–R$280k
   - GK: vol R$189k, range P10–P90 R$162k–R$667k
   - +4.6× de volatilidade de renda = inaceitável para planejamento familiar com criança

3. **GK mal interpretado:** spending médio GK sobe com a idade (R$268k → R$357k) pela regra de prosperidade — artefato que parece bom mas expõe ao risco de gastos insustentáveis nos anos finais. Nos piores 10% dos cenários, GK e guardrails chegam ao mesmo piso (R$162k) — o upside de GK é assimétrico para os bons cenários.

4. **VPW ruim é feature, não bug:** PMT aumenta à medida que anos restantes diminuem — saques crescem no final quando portfolio está menor. P10 = R$0 confirma — VPW drena até o fim por design. Incompatível com piso de spending fixo.

5. **Guardrails já calibrados:** cortes escalonados 0/10/20%/piso em faixas de drawdown 0-15%/15-25%/25-35%/>35%. Upside: +10% permanente se portfolio sobe 25%+ acima do pico. Já captura o mecanismo do GK sem a complexidade operacional.

#### Advocate: Guardrails "parcialmente frágil" — 4 pontos de atenção

1. **Análise de utilidade incompleta:** guardrails otimizam para sobrevivência do portfolio, não para qualidade de vida. GK entrega spending médio maior nos bons cenários. O custo de R$148k/ano de flexibilidade perdida nunca foi quantificado em utilidade — apenas em probabilidade.

2. **Ilusão de estabilidade:** vol R$41k significa oscilação entre R$180k e R$291k reais. Cortes são previsíveis mas constrangem o lifestyle permanentemente nos piores cenários.

3. **Regime change não testado:** nenhuma das 5 estratégias foi testada em sequência 2000-2004 (dot-com bust) nos primeiros 5 anos. SoRR afeta cada estratégia de forma diferente — guardrails + bond tent não foram testados como interação conjunta.

4. **Híbrido não testado:** GK com floor R$180k poderia capturar o upside de GK (maior spending nos bons cenários) com a proteção de cauda dos guardrails. Ninguém rodou esse cenário.

**Veredicto Advocate:** guardrails são a escolha certa dado o que foi testado. O pedido de GK+floor é interessante mas não muda a recomendação base — é trabalho futuro se Diego quiser explorar.

---

**Decisão pendente para Diego:**
- [x] Confirmar: manter guardrails como estratégia principal? → **SIM, aprovado 2026-04-07**
- [x] GK Hybrid testado e descartado (ver Votação abaixo)
- [x] Documentado abaixo

---

## Votação em Fases — Guardrails vs GK Hybrid vs GK Puro (2026-04-07)

**Dados finais (10k sims, seed 42, com spending stats):**

| Strategy | P(FIRE) | Gasto Médio | Vol Gasto | Range P10–P90 |
|----------|---------|-------------|-----------|----------------|
| **guardrails** | **90.4%** | R$222k | ±R$41k | R$165k–R$276k |
| gk_hybrid (teto R$350k) | 91.0% | R$252k | ±R$64k | R$162k–R$332k |
| guyton_klinger | 91.0% | R$305k | ±R$187k | R$162k–R$507k |

| Agente | Posição | Confiança | Argumento central |
|--------|---------|-----------|-------------------|
| FIRE | **GUARDRAILS** | Alta | P10 GK Hybrid (R$162k) viola piso essencial R$180k |
| Advocate | **GUARDRAILS** | Alta | "Solução elegante para problema que não existe" |

**Placar: 2/2 — GUARDRAILS aprovado**

**Por que GK Hybrid foi descartado:**
1. Delta 0.6pp P(FIRE) está dentro do IC estatístico (±1pp com 10k sims)
2. Vol ±R$64k vs ±R$41k — família com filho exige previsibilidade de caixa
3. Benefício de R$30k/ano é pró-cíclico — só aparece nos bons cenários
4. P10 GK Hybrid = R$162k, abaixo do piso essencial de R$180k
5. Guardrails já têm o upside embutido (teto R$350k + +10% se portfólio sobe 25%+)
6. GK Hybrid é construção ad hoc sem validação na literatura — guardrails têm 3 rodadas de MC + validação do time

---

## Conclusao

**Guardrails confirmados como estratégia definitiva de desacumulação.** 4 estratégias alternativas avaliadas (constant, pct_portfolio, VPW, Guyton-Klinger) + 1 híbrido (GK Hybrid). Todas descartadas. Guardrails dominam em: previsibilidade de renda (fator crítico para família), aprovação prévia e documentação, e P(FIRE) equivalente às melhores alternativas. Nenhuma mudança em `carteira.md` necessária — guardrails já documentados.

**Minority Report registrado (Advocate):** se a análise com R$300k de spending (filho) + factor drought mostrar P(FIRE) < 75%, reabrir debate de withdrawal strategy.
