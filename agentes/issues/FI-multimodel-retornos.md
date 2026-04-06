# FI-multimodel-retornos: Validação multi-modelo — premissas de retorno esperado de equity internacional

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-multimodel-retornos |
| **Dono** | Factor |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), Factor, Quant, Fact-Checker, Advocate |
| **Co-sponsor** | Fact-Checker |
| **Dependencias** | HD-multimodel-premissas (Done) |
| **Criado em** | 2026-04-06 |
| **Origem** | HD-multimodel-premissas — protocolo Round 2 estendido a retornos esperados de equity |
| **Concluido em** | — |

---

## Motivo / Gatilho

O `fire_montecarlo.py` usa retornos esperados de equity baseados em fontes específicas (DMS 2025, Research Affiliates, AQR). Mas as premissas de retorno são o input mais sensível do modelo — cada 0.5pp de diferença em retorno real move P(FIRE) em ~2-3pp.

Algumas dessas premissas têm baixa cobertura para perspectivas de não-americanos investindo em equity global via UCITS:
- O factor premium pós-haircut de 0.16%/ano foi validado internamente
- Os retornos base de DM/EM nunca foram confrontados com perspectivas externas independentes
- A separação DM ex-US vs EM no portfolio (50% SWRD / 30% AVGS / 20% AVEM) foi decidida sem validação de retornos esperados por bloco

---

## Premissas a Validar

| Bloco | Premissa | Valor atual | Fonte atual | Risco |
|-------|----------|-------------|-------------|-------|
| **A** | Retorno equity base (SWRD/MSCI World) | 3.7% USD real | DMS 2025 + Research Affiliates | Otimista para non-US? |
| **A** | Premium DM ex-US vs US | Embutido em SWRD 50% | DMS 2025 | Adequado post-dollar-peak? |
| **A** | Retorno EM (AVEM) | 5.0% USD real | Research Affiliates CAPE | Volatilidade EM subestimada? |
| **B** | Factor premium (value + small) líquido | +0.16%/ano | McLean & Pontiff (58% haircut) | Haircut suficiente pós-2020? |
| **B** | Volatilidade equity | 16.8% | Histórico DMS + calibração | Subestima regime atual? |
| **B** | Correlação BRL/USD na desacumulação | Modelado separadamente | FR-currency-mismatch-fire | Impacto real no P(FIRE) para brasileiro? |

---

## Protocolo (Round 2 — sem números próprios)

Prompts com **categorias puras**. Sem mencionar nossa carteira, valores específicos ou ETFs. Objetivo: falsificação, não confirmação.

Modelos: GPT-4o, Gemini (Deep Research), Perplexity.

---

## Bloco A — Retornos Esperados por Região

### Prompt A (rodar nos 3 modelos)

> You are an evidence-based investment expert specializing in long-term equity returns for international investors. Answer based on academic research and data — challenge optimistic assumptions where appropriate.
>
> **Context:** Brazilian investor with a 14-year accumulation horizon and 37-year retirement horizon (total 51 years). Portfolio is 100% international equity (no domestic Brazilian equity). Split approximately: 50% global developed market (market-cap weighted, includes US), 30% developed + emerging market factor tilt (value + small-cap), 20% emerging market (broad).
>
> **Please evaluate these return assumptions:**
>
> 1. **Global developed market equity (market-cap weighted, 50-60% US):** What is a reasonable real USD return expectation for the next 10-15 years, given current valuations? Academic consensus range (DMS, Dimson-Marsh-Staunton, Research Affiliates)? Key upside and downside scenarios?
>
> 2. **Developed market ex-US premium:** Is there a historically documented return premium for developed market ex-US equity vs US equity? Has this persisted post-2010? What are the arguments for and against expecting DM ex-US to outperform US over the next decade?
>
> 3. **Emerging market equity return premium:** What real USD return premium should an investor expect from EM equity over DM equity over 20+ year horizons? Has the EM premium been realized post-2010? Current CAPE-based expectations vs. historical realized?
>
> 4. **For a Brazilian investor** holding international equity in USD/GBP, what is the most commonly underestimated risk in long-term return projections?
>
> For each point: consensus range / optimistic case / pessimistic case — with sources where possible.

---

## Bloco B — Factor Premiums e Volatilidade

*(rodar após consolidar Bloco A)*

### Prompt B

> Same context as above. The factor-tilted portion of the portfolio (30%) targets value + small-cap + profitability factors, implemented via UCITS ETFs.
>
> **Please evaluate:**
>
> 1. **Factor premium durability post-publication:** Academic literature suggests factor premiums decay after publication (McLean & Pontiff, 2016). For value + small-cap specifically: what is the current academic consensus on expected post-publication premium? Has the post-2020 value recovery changed this assessment?
>
> 2. **Factor premium in UCITS vs US ETFs:** Does implementing factor strategies via UCITS ETFs (UK-domiciled, European universe for DM, and emerging market) introduce meaningful tracking error or performance drag vs. the theoretical factor premium? Any evidence on this?
>
> 3. **Long-term equity volatility:** For a portfolio 100% in international equity (diversified across geographies), is 16-18% annual volatility a reasonable long-term assumption? How does this change in tail scenarios (global recession, dollar shock)?
>
> For each point: reasonable / optimistic / pessimistic — with brief justification.

---

## Escopo

- [ ] Formular prompts (concluído acima)
- [ ] Diego roda Bloco A nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco A
- [ ] Diego roda Bloco B nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco B
- [ ] Factor + Fact-Checker: verificam claims e papers citados
- [ ] Quant: valida qualquer ajuste de premissa proposto
- [ ] Head: lista de premissas a atualizar no script (se houver)

---

## Raciocínio

**Argumento central:** Retornos de equity são o input de maior impacto no P(FIRE) (~2-3pp por 0.5pp de diferença). Foram calibrados com fontes específicas mas nunca confrontados com perspectivas externas independentes num prompt de categorias puras.

**Critério de ação:** Só ajustar se 2+ modelos apontarem gap de > 0.5pp em retorno esperado com justificativa de fonte peer-reviewed. Confirmação de 1 modelo = nota, não ação.

**Falsificação:** Se modelos confirmarem premissas atuais (3.7-5.0% USD real), encerrar como "premissas de retorno robustas — revisão anual via Research Affiliates suficiente".

**SLA sugerido:** Q3/2026 — sem urgência imediata. Pode ser rodado em paralelo com FR-multimodel-desacumulacao.
