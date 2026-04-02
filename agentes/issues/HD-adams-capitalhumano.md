# HD-adams-capitalhumano: Capital Humano Correlacionado — 100% Equity Está Calibrado?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-adams-capitalhumano |
| **Dono** | 00 Head |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Factor, FIRE, Advocate, Quant |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-02 |
| **Origem** | RR Scan 2026-04-02 — Ep. 403: Patrick Adams (MIT), "When Stock Crashes Matter" |
| **Concluido em** | — |

---

## Motivo / Gatilho

O paper de Patrick Adams (MIT, apresentado no RR Ep. 403 em 2026-04-02) desafia a tese de "100% equity durante acumulação" para trabalhadores de alta renda cujo capital humano é correlacionado com o mercado.

**Argumento central do paper:**
1. Dados fiscais administrativos mostram que income risk de altos rendimentos é correlacionado com retornos de ações
2. Comprometimentos de consumo fixos (hipoteca, alimentação) criam alavancagem oculta — forçam vendas em crashes
3. A alocação ótima em ações é **surpreendentemente conservadora** para esse perfil, mesmo com horizonte longo

**Contexto de Diego:**
- Capital humano: ~R$3.65M (gestão de empresas — pró-cíclico, correlacionado com mercado BR)
- Portfólio financeiro: 79% equity internacional
- Hipoteca SAC: R$452k (compromisso fixo até 2051)
- Total patrimonial: R$7.86M — capital humano = 46% do total

A pergunta que nunca foi feita formalmente: **o 79% equity do portfólio financeiro está calibrado levando em conta que o capital humano de R$3.65M é essencialmente "long equities Brasil"?**

---

## Descrição

HD-equity-weight (2026-03-25) confirmou 79% equity como correto no portfólio financeiro isolado. Mas a issue não considerou o balanço patrimonial total (capital humano + financeiro):

- Se capital humano = ~R$3.65M em renda pró-cíclica (correlação ~0.5-0.7 com IBOV)
- E portfólio financeiro = R$3.5M com 79% equity (= ~R$2.77M em equity)
- Total exposição efetiva a equity = R$2.77M + (0.6 × R$3.65M) = ~R$4.96M de R$7.86M = **63%** do patrimônio total

Mas com hipoteca de R$452k como compromisso fixo, o denominador efetivo de risco é menor — a alavancagem oculta que Adams descreve.

A tese atual (79% equity financeiro) pode estar certa **mesmo assim** se o retorno de capital humano é alto o suficiente e a correlação é baixa o suficiente. Mas isso precisa ser verificado, não assumido.

---

## Escopo

- [ ] Ler paper Adams: "When Stock Crashes Matter" (MIT, 2026) — extrair metodologia e dados
- [ ] Estimar correlação capital humano de Diego com mercado (renda de gestão vs IBOV/MSCI)
- [ ] Calcular exposição efetiva total a equity (portfólio + capital humano ajustado por correlação)
- [ ] Verificar se hipoteca + gastos fixos criam alavancagem oculta relevante
- [ ] Monte Carlo: P(FIRE) com cenário de renda -50% coincidindo com equity -40%
- [ ] Conclusão: 79% equity ainda é ótimo dado o balanço total? Ou deve ser ajustado?

---

## Raciocínio

**Argumento central:** HD-equity-weight foi feito no portfólio financeiro isolado. O paper Adams adiciona uma dimensão que nunca foi testada: o portfólio financeiro não existe em isolamento — Diego tem R$3.65M em capital humano que age como "long equity Brasil" implícito. O risco total pode ser maior do que 79% parece.

**Incerteza reconhecida:** A correlação do capital humano de Diego com equity pode ser baixa (renda de gestão pode ter componentes fixos/contratuais que a isolam do ciclo). Se correlação < 0.3, o argumento Adams tem pouco impacto prático.

**Falsificação:** Se o Monte Carlo mostrar que cenário adverso (renda -50% + equity -40%) ainda resulta em P(FIRE) > 75% com gastos reduzidos para R$180k (piso guardrail), a tese de 79% equity está validada mesmo com capital humano correlacionado.

---

## Análise

> A ser preenchido durante execução.

---

## Conclusão

> A ser preenchido ao finalizar.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Estratégia** | Validação ou ajuste de 79% equity dado balanço patrimonial total |
| **Conhecimento** | Correlação capital humano de Diego com mercado |
| **Memória** | Head (00), Factor (02), FIRE (04) |

---

## Próximos Passos

- [ ] Head: leitura do paper Adams (Ep. 403 RR)
- [ ] Factor: estimar correlação capital humano vs equity
- [ ] Quant: Monte Carlo com cenário renda -50% + equity -40%
- [ ] Advocate: stress-test da tese 79% equity no balanço total
