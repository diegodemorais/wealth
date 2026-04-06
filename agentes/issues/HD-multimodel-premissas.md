# HD-multimodel-premissas: Validação multi-modelo das premissas do fire_montecarlo.py

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-multimodel-premissas |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), FIRE, Quant, Advocate, Fact-Checker |
| **Co-sponsor** | Advocate |
| **Dependencias** | HD-mc-audit (Done) |
| **Criado em** | 2026-04-06 |
| **Origem** | Sucesso de HD-multimodel-validation (AVGS) — aplicar protocolo às premissas do MC |
| **Concluido em** | 2026-04-06 |

---

## Motivo / Gatilho

HD-multimodel-validation (2026-04-06) demonstrou que modelos externos (GPT/Gemini/Perplexity) oferecem perspectivas independentes valiosas quando o prompt usa categorias puras (Round 2), sem ancoragem por produto ou número específico.

Após HD-mc-audit, o `fire_montecarlo.py` tem premissas mais corretas — mas algumas são baseadas em fontes únicas ou dados com cobertura acadêmica limitada para o Brasil. Validar externamente antes de tratar como canônicas.

---

## Premissas a Validar

| Bloco | Premissa | Valor atual | Fonte atual | Risco |
|-------|----------|-------------|-------------|-------|
| **A** | VCMH saúde Brasil | 2.7%/ano real | IESS série 18 anos | Subestima? |
| **A** | Inflator saúde por faixa etária | ANS RN 63/2003 | Regulatório | Defasado? |
| **A** | Saúde base R$16k/pp (PJ, age 53) | Cotação Bradesco SP | Cotação pontual | Representa média? |
| **B** | Spending smile Go-Go R$242k | Blanchett (2014) EUA + HD-009 | Cross-cultural | Aplicável ao Brasil? |
| **B** | Custo de vida base R$250k/ano | HD-009 auditado | Bottom-up real | Realista pós-inflação? |
| **B** | SWR implícito (2.4% gatilho) | FR-fire2040 | Conservador | Muito conservador? |
| **B** | INSS R$18k/ano real | TX-inss-beneficio | Estimativa central | Haircut adequado? |
| **B** | Bond pool 7 anos | FR-ir-desacumulacao | Julgamento | Suficiente vs literatura? |

---

## Protocolo (Round 2 — sem números próprios)

Prompts formulados com **categorias puras** — sem mencionar nossa carteira, valores específicos ou ETFs. Objetivo: falsificação, não confirmação.

Modelos: GPT-4o, Gemini 1.5 Pro (ou Deep Research), Perplexity.

---

## Bloco A — Healthcare Brasil

### Prompt A (rodar nos 3 modelos)

> You are a financial planning expert specializing in Brazilian retirement planning for high-income individuals. Answer based on evidence and data — challenge assumptions where appropriate.
>
> **Context:** I'm modeling healthcare costs for a Brazilian individual retiring at age 53 in São Paulo, with a private employer-sponsored health plan (plano coletivo empresarial PJ). The model runs until age 90.
>
> **Please evaluate these assumptions and tell me where they might be wrong:**
>
> 1. **Base cost at retirement (age 53):** R$16,000/year per person for a high-quality collective PJ plan in São Paulo. Is this realistic for 2026?
>
> 2. **Real healthcare inflation (VCMH):** 2.7%/year above general inflation, based on IESS 18-year historical average. Is this a good long-term projection, or should it be higher/lower? Note: recent years (2022-2024) show VCMH well above this average.
>
> 3. **ANS age bands:** Cost multipliers from Brazilian ANS regulation (RN 63/2003): age 49-53 = 3×, age 54-58 = 4×, age 59-63 = 5×, age 64+ = 6× (all relative to base rate). Applied as discrete jumps at each threshold.
>
> 4. **No-Go phase (age 83+):** 50% cost reduction applied, assuming reduced mobility and services. Does this hold in Brazilian reality or do costs continue rising?
>
> 5. **Key risk not modeled:** What is the biggest healthcare cost risk for a Brazilian retiree age 53-90 that is commonly underestimated in financial models?
>
> For each point: state whether the assumption is reasonable, optimistic, or pessimistic — with brief justification.

---

## Bloco B — Retirement Spending Brasil

*(a rodar após consolidar Bloco A)*

### Prompt B

> You are a financial planning expert specializing in Brazilian retirement planning. Answer with evidence — challenge assumptions where appropriate.
>
> **Context:** Brazilian individual, retiring at age 53 in São Paulo area, class A income. Model runs to age 90. No mortgage. Married couple (both retiring together).
>
> **Please evaluate these spending assumptions:**
>
> 1. **Spending smile phases:**
>    - Go-Go (53-67): R$242,000/year lifestyle (ex-healthcare), plus separate healthcare
>    - Slow-Go (68-82): R$200,000/year lifestyle
>    - No-Go (83+): R$187,000/year lifestyle
>    Does this pattern make sense for Brazil? Is the decline realistic?
>
> 2. **Safe Withdrawal Rate:** The model uses a 2.4% SWR as the formal FIRE trigger, with a 4% working SWR in simulations. Academic literature (Pfau, ERN) suggests non-US retirees should use 3.0-3.5%. Is 2.4% as a trigger too conservative, or appropriate given Brazilian sovereign risk?
>
> 3. **INSS (Brazilian Social Security):** Assuming R$18,000/year real benefit starting at age 65, applied as a deduction from required portfolio withdrawals. Is this a reasonable central estimate for someone who contributed at the ceiling (teto) for 20+ years?
>
> 4. **Bond pool (7 years):** Holding 7 years of expenses in inflation-linked bonds (IPCA+) at retirement to cover sequence-of-returns risk before drawing from equity. Is 7 years adequate based on sequence-of-returns literature?
>
> 5. **Biggest gap:** What spending category do Brazilian retirees most commonly underestimate in long-term models?
>
> For each point: reasonable / optimistic / pessimistic — with brief justification.

---

## Escopo

- [x] Formular prompts Bloco A e B
- [x] Diego roda Bloco A nos 3 modelos e cola outputs
- [x] Head sintetiza Bloco A — findings e impacto nas premissas
- [x] Aprovação de Diego + implementação SAUDE_BASE R$16k→R$18k (−0.4pp, P(FIRE) 90.4%)
- [x] Diego roda Bloco B nos 3 modelos e cola outputs
- [x] Head sintetiza Bloco B (Fact-Checker + FIRE + Advocate)
- [x] Sensibilidade SAUDE_DECAY e bond pool rodadas no MC
- [x] Head: lista de premissas atualizada — 1 ajuste implementado, 7 mantidos

---

## Resultado Final (2026-04-06)

| Tipo | Detalhe |
|------|---------|
| **FIRE** | P(FIRE) final: 90,4% base / 94,1% favorável / 86,8% stress (−0.4pp vs HD-mc-audit por SAUDE_BASE R$18k) |
| **Premissas** | 1 ajuste implementado (SAUDE_BASE R$16k→R$18k). 7 premissas validadas e mantidas. |
| **Insights** | INSS R$18k correto para Diego (modelos externos errados por desconhecer perfil). Bond pool 7 anos mantido por risco soberano concentrado. SAUDE_DECAY cosmético. |
| **Novo finding** | "Belly of the snake" anos 7-11 pós-FIRE: bond pool esgotado + INSS não iniciado + saúde acelerada. Remédio: guardrails, não mais IPCA+. |

---

## Resultado Bloco A — Healthcare Brasil (2026-04-06)

Inputs: Perplexity, ChatGPT, Gemini + Fact-Checker, Pesquisa-PJ, FIRE, Advocate internos.

| Premissa | Veredicto | Ação |
|----------|-----------|------|
| SAUDE_BASE R$16k/pp | 3/3 modelos: subestimativa leve. Advocate calibrou para R$18k (não R$24-30k) | **AJUSTADO → R$18k. −0.4pp** |
| VCMH 2.7% real | Fact-Checker confundiu nominal/real. Série 18 anos IESS é a correta. Modelos externos citaram período atípico 2021-2024 | Manter |
| ANS faixas (RN 63/2003) | 3/3 modelos externos citaram faixas erradas (59-63 / 64+). Nossa premissa (59+ = faixa única) estava correta | Manter |
| SAUDE_DECAY 0.50 | Custos totais sobem no No-Go (evidência real). Mas Advocate tem ponto: confunde plano vs total; No-Go R$187k já embute cuidados. Impacto: −0.2pp | Manter — documentado como limitação |
| Risco PJ | STJ Tema 1.047 protege. CNPJ ativo afasta rescisão. ROI R$3-4k/ano → R$22k economia | Não modelar estochasticamente |

**P(FIRE) pós-Bloco A:** 90,4% base / 94,1% favorável / 86,8% stress (−0.4pp vs HD-mc-audit).

---

## Resultado Bloco B — Spending e Desacumulação (2026-04-06)

Inputs: Perplexity, ChatGPT, Gemini + Fact-Checker, FIRE, Advocate internos.

| Premissa | Veredicto | Ação |
|----------|-----------|------|
| INSS R$18k "pessimistic" (3/3 modelos) | REFUTADA — modelos assumiram 33 anos de teto integral; Diego tem 13 anos de SM que diluem SB via EC 103/2019. TX-inss-beneficio (2026-03-26) calculou corretamente. | Manter R$18k |
| No-Go lifestyle R$187k "otimista" (2/3 modelos) | PARCIAL — Blanchett 2014 (peer-reviewed): queda ~26% real esperada, mais pronunciada em alta renda. R$220-260k sem fonte. FIRE: impacto cosmético (< 0.5pp, 7 anos fortemente descontados). | Manter R$187k |
| SAUDE_DECAY 0.50 (risco cuidadores) | Cosmético — sensibilidade rodada: 0.50→1.00 custa apenas −0.5pp. Manter com nota de limitação. | Manter 0.50 |
| SWR 2.4% (3/3: "appropriate") | Robusto — e mais conservador do que modelos percebem (avaliaram com INSS 3-5x maior). | Manter |
| Bond pool 7 anos (+0.6pp para 9 anos) | MANTIDO — extensão ignora risco soberano concentrado. Capital humano + imóveis + empresa + INSS já são 100% Brasil. Equity UCITS é o único hedge. Mais IPCA+ = mais concentração no risco dominante. | Manter 7 anos |

**Novo finding: "Belly of the snake" (anos 7-11 pós-FIRE):**
Bond pool esgotado (ano 7) + INSS não iniciado (ano 12) + saúde acelerada (ANS 5×, 59+ anos) + 100% equity. Janela de máxima vulnerabilidade. Remédio: guardrails, não mais IPCA+. Documentado para stress-test futuro.

**Sensibilidades rodadas no MC:**

| Parâmetro | Valores | Resultado |
|-----------|---------|-----------|
| SAUDE_DECAY | 0.50 / 0.70 / 0.80 / 1.00 | 90.4% / 90.4% / 89.8% / 89.9% — cosmético |
| Bond pool | 7 / 8 / 9 / 10 anos | 90.4% / 90.7% / 91.0% / 91.0% — +0.6pp mas ignora soberano |

---

## Raciocínio

**Argumento central:** As premissas de saúde e spending têm mais incerteza do que os retornos de equity (que têm base acadêmica sólida). Uma segunda opinião de modelos externos pode revelar vieses que o time, por ter construído o modelo, não consegue ver.

**Critério de ação:** Só ajustar premissa se 2+ modelos externos apontarem o mesmo gap com justificativa coerente. Confirmação de 1 modelo = nota, não ação.

**Falsificação:** Se os 3 modelos externos validarem as premissas atuais sem gaps materiais, issue encerrada como "premissas robustas — revisão anual suficiente".
