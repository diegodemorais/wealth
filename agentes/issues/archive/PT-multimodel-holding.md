# PT-multimodel-holding: Validação multi-modelo — holding familiar, regime de bens e proteção patrimonial

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | PT-multimodel-holding |
| **Dono** | Patrimonial |
| **Status** | Done |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Head (lead), Patrimonial, Tax, Advocate |
| **Co-sponsor** | Tax |
| **Dependencias** | — |
| **Criado em** | 2026-04-06 |
| **Origem** | HD-multimodel-premissas — protocolo Round 2 estendido a planejamento patrimonial |
| **Concluido em** | 2026-04-06 |

---

## Motivo / Gatilho

Casamento iminente (~2026-2027) com patrimônio total ~R$7.86M. Três perguntas sem resposta formal do time:

1. **Holding familiar**: o patrimônio justifica holding agora? Qual estrutura (LTDA, SA)?
2. **Regime de bens**: comunhão parcial vs separação total — implicações reais para FIRE e sucessão
3. **Proteção patrimonial**: testamento, doação com reserva de usufruto, seguro de vida

O time interno (Patrimonial, Tax) tem visão sobre esses temas, mas sem validação externa independente. Modelos externos com acesso a jurisprudência brasileira recente e casos de alta renda podem revelar gaps ou confirmar a estratégia.

---

## Temas a Validar

| Bloco | Tema | Premissa atual | Risco |
|-------|------|---------------|-------|
| **A** | Holding familiar | Não tem — timing indefinido | Perder janela pré-casamento? |
| **A** | Regime de bens | Não definido | Exposição patrimonial pós-casamento |
| **B** | Proteção patrimonial | Testamento urgente (XX-casamento) — não feito | Risco real sem testamento |
| **B** | Doação com usufruto | Não modelada | Sucessão eficiente vs custo de estrutura |
| **C** | Seguro de vida | Gap identificado (TX-estate-tax, XX-casamento) — não contratado | Estate tax US-listed ~US$60k |

---

## Protocolo (Round 2 — sem números próprios)

Prompts com **categorias puras**. Sem mencionar patrimônio, ETFs ou valores específicos. Objetivo: obter perspectiva independente, não confirmação.

Modelos: GPT-4o, Gemini (Deep Research), Perplexity.

---

## Bloco A — Holding e Regime de Bens

### Prompt A (rodar nos 3 modelos)

> You are a Brazilian wealth planning expert specializing in high-net-worth families (patrimônio acima de R$5M). Answer based on Brazilian law, current jurisprudence, and practical experience — challenge assumptions where appropriate.
>
> **Context:** Brazilian entrepreneur, age 39, owner of 2 companies in Simples Nacional, about to get married. Total wealth ~R$7-10M split between: (a) financial investments (Brazilian and international), (b) residential real estate in São Paulo, (c) rural land in interior São Paulo, (d) equity in two operating companies, (e) INSS pension rights. No children yet. First marriage.
>
> **Please evaluate these planning decisions:**
>
> 1. **Marital regime:** What is the optimal marital regime (comunhão parcial, separação total de bens, participação final nos aquestos) for this profile? What are the key risks of each, considering the entrepreneur's existing pre-marital wealth?
>
> 2. **Holding company timing:** At what wealth level and life stage does a holding company (LTDA or SA) become worth the complexity cost in Brazil? What are the 3 main benefits a holding provides for this profile — and what are the 2 main risks/costs that are commonly underestimated?
>
> 3. **Estate planning urgency:** In Brazil, what is the minimum estate planning structure that should be in place BEFORE marriage for someone of this wealth level? (testamento, doação com usufruto, previdência privada as succession tool, etc.)
>
> 4. **Biggest gap:** What is the #1 estate planning mistake made by Brazilian entrepreneurs at this wealth level when getting married for the first time?
>
> For each point: your recommendation, key risk if ignored, and urgency level (urgent/important/can wait).

---

## Bloco B — Proteção e Seguro

*(rodar após consolidar Bloco A)*

### Prompt B

> You are a Brazilian wealth planning expert. Answer based on Brazilian law and current best practices.
>
> **Context:** Same profile as above. Additionally: significant exposure to US-listed assets (ETFs on London Stock Exchange, held via Interactive Brokers). The individual is the primary income earner. Spouse has separate income but minimal savings.
>
> **Please evaluate:**
>
> 1. **Life insurance:** What type and amount of life insurance is appropriate for the breadwinner in this household, with a spouse who depends partially on the combined income? What is the main gap most people miss?
>
> 2. **US estate tax exposure:** For a Brazilian resident holding US-listed assets (ETFs domiciled in Ireland but traded on LSE via a US broker), what is the actual US estate tax exposure? Is Interactive Brokers considered a "US nexus" for estate tax purposes on non-US domiciled ETFs?
>
> 3. **Business continuity:** With 2 operating companies, what happens to the business if the owner dies without a succession plan? What is the minimum viable succession structure for small Brazilian companies (Simples Nacional)?
>
> For each point: reasonable / fragile / urgent — with brief justification.

---

## Escopo

- [ ] Formular prompts (concluído acima)
- [ ] Diego roda Bloco A nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco A — findings e gaps vs premissas atuais
- [ ] Diego roda Bloco B nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco B
- [ ] Patrimonial + Tax: avaliam ajustes propostos
- [ ] Head: lista de ações com prioridade e urgência

---

## Raciocínio

**Argumento central:** O planejamento patrimonial de Diego tem dois gatilhos simultâneos (casamento + patrimônio crescente) que criam urgência real. O time interno já identificou gaps (testamento, seguro de vida, regime de bens) mas sem profundidade de análise. Modelos externos com acesso a casos de alta renda brasileira e jurisprudência recente podem revelar o que está sendo negligenciado.

**Critério de ação:** Qualquer ponto onde 2+ modelos apontam gap com justificativa concreta vai para issue separada de execução.

**Urgência:** Pre-casamento — janela limitada para definir regime de bens e testamento.
