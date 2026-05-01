# HD-adams-capitalhumano: Capital Humano Correlacionado — 100% Equity Está Calibrado?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-adams-capitalhumano |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Factor, FIRE, Advocate, Quant |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-02 |
| **Origem** | RR Scan 2026-04-02 — Ep. 403: Patrick Adams (MIT), "When Stock Crashes Matter" |
| **Concluido em** | 2026-04-02 |

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

- [x] Ler paper Adams: "When Stock Crashes Matter" (MIT, 2026)
- [x] Estimar correlação capital humano de Diego com mercado: 0.50 central (0.35-0.65)
- [x] Calcular exposição efetiva total a equity: 58-64% do patrimônio de R$7.86M
- [x] Alavancagem oculta: hipoteca R$452k + gastos R$215k/ano — real mas mitigada pela decorrelação BRL/USD
- [x] Monte Carlo: Cenário B (-50% renda / 3a + equity -40%): P(FIRE) 78.3% (-8.9pp), 40.6% abaixo do gate R$8M
- [x] Conclusão: 79% equity mantido. Target IPCA+ permanece em 15%.

---

## Raciocínio

**Argumento central:** HD-equity-weight foi feito no portfólio financeiro isolado. O paper Adams adiciona uma dimensão que nunca foi testada: o portfólio financeiro não existe em isolamento — Diego tem R$3.65M em capital humano que age como "long equity Brasil" implícito. O risco total pode ser maior do que 79% parece.

**Incerteza reconhecida:** A correlação do capital humano de Diego com equity pode ser baixa (renda de gestão pode ter componentes fixos/contratuais que a isolam do ciclo). Se correlação < 0.3, o argumento Adams tem pouco impacto prático.

**Falsificação:** Se o Monte Carlo mostrar que cenário adverso (renda -50% + equity -40%) ainda resulta em P(FIRE) > 75% com gastos reduzidos para R$180k (piso guardrail), a tese de 79% equity está validada mesmo com capital humano correlacionado.

---

## Análise

Executada em 2026-04-02. 3 agentes em paralelo (Factor, Quant, Advocate — posições independentes).

**Factor — correlação e exposição efetiva:**
- Correlação estimada capital humano de Diego com equity: **0.50** (range 0.35-0.65)
- Base: Cocco, Gomes & Maenhout (2005), Davis & Willen (2000), Heaton & Lucas (2000) — empreendedores têm beta 0.50-1.00 vs empregados CLT ~0.15
- Exposição efetiva total a equity: **58-64% do patrimônio de R$7.86M** (portfólio + capital humano ajustado)
- Atenuante crítico: renda é BRL/Brasil, equity é USD/global — decorrelação cambial parcial reduz impacto real vs estimativa teórica

**Quant — Monte Carlo (10k sims, seed=42):**

| Cenário | P(FIRE) | Pat. Mediana | % abaixo gate R$8M |
|---------|---------|--------------|---------------------|
| Base | 87.2% | R$11.53M | 18.2% |
| Renda -50% / 3a + equity -40% | **78.3%** | R$8.72M | **40.6%** |
| Renda zero / 5a + equity -40% | **68.9%** | R$7.10M | **63.8%** |

**Advocate:**
- Argumento mais fraco do time: "diversificação geográfica protege". Em crises severas, tail correlation converge para 1 (Longin & Solnik 2001).
- 79% equity financeiro implicitamente assume capital humano com correlação zero — premissa não testada.
- Recomendou elevar IPCA+ target de 15% → 20-25%.

---

## Conclusão

**79% equity mantido. Target IPCA+ permanece em 15%.**

Racional (Diego, 2026-04-02): o DCA ativo em IPCA+ a 7.21% já está capturando o que der desta janela de juros. Forçar target mais alto (20%) seria planejar para uma janela que provavelmente fechará antes de atingir a meta. O IPCA+ acumulado até o fechamento da janela já resolve parcialmente a correlação do capital humano identificada pelo paper Adams.

**Key insight registrado:** O DCA em IPCA+ (decisão HD-006) não é só proteção SoRR — é também a resposta ao risco Adams de capital humano correlacionado. Dupla função, mesmo instrumento.

**Incerteza residual:** Correlação real do capital humano de Diego com MSCI World (não IBOV) — provavelmente < 0.50 pela decorrelação BRL/USD. Se medida empiricamente como < 0.20, o 79% se sustenta sem ressalvas.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Decisão** | 79% equity mantido. Target IPCA+ permanece em 15%. |
| **MC Finding** | Cenário duplo (renda -50% + equity -40%): P(FIRE) 78.3% (-8.9pp), 40.6% abaixo do gate |
| **Insight novo** | DCA IPCA+ (HD-006) = dupla função: SoRR + hedge capital humano correlacionado |
| **Correlação** | Capital humano: 0.50 central. Atenuante: BRL vs USD/global reduz correlação efetiva |

---

## Próximos Passos

- [x] Paper Adams analisado
- [x] Correlação capital humano estimada: 0.50 central
- [x] Monte Carlo: cenário duplo quantificado
- [x] Advocate: stress-test concluído
- [x] Decisão: manter 79% + target IPCA+ 15%
