# FR-multimodel-desacumulacao: Validação multi-modelo — sequência ótima de saques na desacumulação

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-multimodel-desacumulacao |
| **Dono** | FIRE |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), FIRE, Tax, Advocate, Fact-Checker |
| **Co-sponsor** | Tax |
| **Dependencias** | HD-multimodel-premissas (Done) |
| **Criado em** | 2026-04-06 |
| **Origem** | HD-multimodel-premissas — protocolo Round 2 estendido a estratégia de desacumulação |
| **Concluido em** | 2026-04-06 |

---

## Motivo / Gatilho

O `fire_montecarlo.py` modela P(FIRE) com bond pool + equity como fontes de saque. Mas a estratégia real de desacumulação — qual conta sacar primeiro, em qual ordem, com qual otimização fiscal — nunca foi validada externamente.

Premissas implícitas no modelo atual que merecem validação:
1. Bond pool (IPCA+ Brasil) → equity (UCITS offshore) em sequência simples
2. IR 15% sobre ganho nominal aplicado uniformemente ao equity
3. INSS como "renda garantida" simples sem otimização
4. Nenhuma estratégia de Roth-equivalent, tax bracket management ou sequenciamento entre contas

---

## Premissas a Validar

| Bloco | Premissa | Valor atual | Risco |
|-------|----------|-------------|-------|
| **A** | Sequência bond → equity | IPCA+ primeiro, equity depois | Subótimo fiscalmente? |
| **A** | IR 15% sobre ganho nominal BRL | Aplicado uniformemente | Ignora oportunidades de bracket management? |
| **A** | Divisão Brasil vs offshore na desacumulação | Não modelada | Qual sacar primeiro dado risco cambial + fiscal? |
| **B** | INSS como floor simples | R$18k/ano sem otimização | Estratégia de diferimento ou antecipação faz sentido? |
| **B** | Sem bucket de caixa pré-FIRE | IPCA+ + equity | Risco de liquidez no FIRE Day? |
| **B** | Renda+ 2065 como trade tático | Não entra na desacumulação | Quando vender? Antes ou durante desacumulação? |

---

## Protocolo (Round 2 — sem números próprios)

Prompts com **categorias puras**. Sem mencionar nossa carteira, valores específicos ou ETFs. Objetivo: falsificação, não confirmação.

Modelos: GPT-4o, Gemini (Deep Research), Perplexity.

---

## Bloco A — Sequência de Saques e Otimização Fiscal

### Prompt A (rodar nos 3 modelos)

> You are a retirement planning expert specializing in tax-efficient decumulation for high-net-worth Brazilians with international investments. Answer based on evidence — challenge assumptions where appropriate.
>
> **Context:** Brazilian individual, retiring at age 53 in São Paulo. Portfolio at retirement (~R$13M): approximately 70% international equity ETFs (UCITS, held via Interactive Brokers in USD), 20% Brazilian inflation-linked bonds (IPCA+, Tesouro Direto), 5% Brazilian crypto ETF (B3), 5% tactical fixed income. Annual spending: ~R$300-350k/year. No mortgage. Married couple.
>
> **Please evaluate these decumulation assumptions:**
>
> 1. **Withdrawal sequence:** The model draws from Brazilian inflation-linked bonds first (years 1-7), then switches to international equity (years 8+). Is this the optimal sequence for a Brazilian retiree with this split? What are the tax and FX implications of this sequencing vs. alternatives?
>
> 2. **Tax on equity withdrawals:** Brazilian residents pay 15% capital gains tax on realized gains from foreign equity. The model applies this uniformly to all equity withdrawals. Are there legal strategies to optimize this — tax-loss harvesting, bracket management, asset location — that are commonly missed?
>
> 3. **Brazil vs. offshore sequencing:** Given that the individual has significant Brazilian sovereign risk already (real estate, human capital, local bonds), is there a case for drawing down the Brazilian assets first and letting the international equity compound longer? Or the reverse?
>
> 4. **Biggest tax mistake:** What is the #1 tax optimization error Brazilian HNW retirees make in their decumulation sequence?
>
> For each point: optimal approach / common mistake / estimated impact (if quantifiable).

---

## Bloco B — INSS, Liquidez e Ativos Táticos

*(rodar após consolidar Bloco A)*

### Prompt B

> Same context as above. Additional details: The individual expects a modest Brazilian Social Security benefit (INSS) starting at age 65 (~R$18-20k/year real, equivalent to ~R$1,500/month). Also holds a long-duration inflation-linked bond position (30-40 year maturity) currently held as a tactical trade.
>
> **Please evaluate:**
>
> 1. **INSS optimization:** Is there any strategy to optimize the timing or amount of Brazilian INSS benefits for someone who stopped contributing at age 53? (e.g., voluntary contributions to bridge gaps, delaying claims past 65 for higher benefit, etc.)
>
> 2. **Liquidity on FIRE Day:** What is the minimum liquid buffer (in months of expenses) a retiree should have in cash or near-cash on Day 1 of retirement, before long-term investments are structured for decumulation? What commonly goes wrong in the transition?
>
> 3. **Long-duration bond exit:** For a long-duration inflation-linked bond held as a tactical trade (not HTM), what is the optimal exit strategy — gradual selling, waiting for rate normalization, or converting to shorter duration? What tax considerations apply?
>
> For each point: reasonable / fragile / what to watch.

---

## Escopo

- [ ] Formular prompts (concluído acima)
- [ ] Diego roda Bloco A nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco A
- [ ] Diego roda Bloco B nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco B
- [ ] FIRE + Tax: avaliam impacto quantitativo dos ajustes propostos
- [ ] Head: lista de premissas a atualizar no script (se houver)

---

## Raciocínio

**Argumento central:** O modelo FIRE trata a desacumulação de forma simplificada (bond pool → equity, IR 15% uniforme). A sequência ótima de saques para um perfil dual (Brasil + offshore) com exposições assimétricas de risco e tributação diferente nunca foi sistematicamente validada.

**Critério de ação:** Só ajustar premissa se 2+ modelos apontarem gap com justificativa coerente. Se nenhum gap material for encontrado, encerrar como "estratégia de desacumulação suficientemente robusta".

**SLA sugerido:** Q3/2026 — antes de a desacumulação se tornar relevante (14 anos até FIRE).
