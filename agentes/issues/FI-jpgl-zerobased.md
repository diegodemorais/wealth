# FI-jpgl-zerobased: JPGL 20% — análise zero-based (adicionaríamos hoje?)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-jpgl-zerobased |
| **Dono** | 02 Factor |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 02 Factor, 10 Advocate, 16 Zero-Based, 14 Quant, 04 FIRE, 06 Risco, 12 Behavioral, 03 RF, 08 Macro, 15 Fact-Checker |
| **Co-sponsor** | 10 Advocate |
| **Dependencias** | HD-unanimidade (concluída) |
| **Criado em** | 2026-04-01 |
| **Origem** | HD-unanimidade — identificou que JPGL foi debatido 5x e nunca recebeu a pergunta "adicionaríamos do zero?" |
| **Concluido em** | 2026-04-01 |

---

## Motivo / Gatilho

HD-unanimidade (2026-04-01) identificou que JPGL foi analisado em pelo menos 5 issues distintas (FI-003, FI-004, FI-jpgl-redundancia, HD-equity-weight, HD-simplicity) e **sempre a pergunta foi "devemos remover/reduzir?" — nunca "adicionaríamos hoje?"**.

O burden of proof estava sistematicamente no lado da mudança, favorecendo o status quo. A posição real de JPGL é ~R$12k (0.4% do portfolio), mas o target é 20% do equity (~R$554k). O time esteve defendendo um target teórico com framing inadequado.

Esta issue existe para responder a pergunta correta com o framing correto.

---

## Descrição

**Pergunta central:** "Se Diego estivesse construindo sua carteira do zero hoje, sem nenhuma posição existente em JPGL, adicionaria JPGL a 20% do equity (~R$554k)? Por quê?"

Esta pergunta é diferente de todas as anteriores. Não parte do status quo. Não considera custo de saída. Não assume que a posição existe. Avalia apenas: dado o perfil de Diego, o universo UCITS disponível, e a evidência empírica ao vivo, JPGL justifica 20% do equity?

---

## Escopo

- [x] Analisar dados ao vivo de JPGL com framing zero-based (Factor)
- [x] Stress-test adversarial: o caso contra 20% (Advocate)
- [x] Validar cálculos de alpha esperado e EV de delisting (Quant)
- [x] Veredicto ponderado com peso 4x Zero-Based (debate completo 10 agentes, 4 fases)
- [x] Decisão: reduzir target JPGL de 20% para 10%
- [x] Atualizar carteira.md (JPGL 20% → 10%) e gatilhos.md (catch-up rule < 10%)

---

## Raciocínio

**Pergunta falsificável:** "O que faria Diego NÃO adicionar JPGL do zero?"
→ Se alpha ao vivo atingir t < -2.0 com 5+ anos de dados, indicando alpha estruturalmente negativo
→ Se AUM cair abaixo de €150M
→ Se surgir alternativa UCITS com AUM >€1B e TER similar
→ Se IPCA+ permanecer acima de 7% (custo de oportunidade alto para capital marginal)
→ Se o único argumento positivo restante for "momentum + low-vol únicos" mas diversificação for demonstravelmente redundante com AVGS

**Incerteza reconhecida:**
- 79 meses de dados ao vivo têm baixo poder estatístico (não conseguem distinguir alpha = 0 de alpha = ±1%)
- O período 2019-2026 foi genuinamente adverso para value/size (concentração mega-cap growth) — mas "adverso" não é falsificável
- AVGS e JPGL não são substitutos perfeitos: JPGL traz momentum + low-vol que AVGS não tem

---

## Análise

### Dados Objetivos

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Alpha ao vivo 2019-2026 | -2.33%/ano (t=-1.49, n.s.) | Regressão FF5+MOM, 79 meses |
| Sharpe JPGL vs SWRD | 0.45 vs 0.53 | Mesmo período |
| Correlação JPGL-SWRD | 0.95 | Dados IB |
| Alpha esperado bruto | ~0.56%/ano | AQR, literatura fatorial |
| Haircut McLean & Pontiff | 58% → ~0.235% pós-haircut | McLean & Pontiff 2016 |
| Alpha líquido esperado | ~0.163%/ano | 0.235% - 0.073% custo adicional |
| Contribuição ao portfolio total | ~2.6 bps/ano | 0.163% × 20% × 79% |
| AUM | ~€213M | Atual |
| TER | 0.19% vs SWRD 0.12% | Factsheet |
| Factor loadings significativos | 4/5 (value, size, quality, momentum) | Regressão |
| Indice subjacente (22 anos) | +3pp/ano vs MSCI World | JP Morgan backtest |

### Análise Zero-Based — Factor (4/10 convicção a 20%, 6/10 a 15%)

**Adicionaria, mas a 15%, não 20%.**

Caso para: 4/5 loadings significativos ao vivo, indice 22 anos +3pp/ano, único UCITS com momentum + low-vol, protegeu em 2022 (+7.9pp) e março 2026 (+1.8pp).

Caso contra: correlação 0.95 com SWRD, alpha líquido 2.6 bps no portfolio, AVGS já tem value/size/profitability com loadings mais fortes, dados ao vivo ambíguos.

**Alpha 0.16%/ano sobre 15% do equity = diferença de ~R$7.5k em 11 anos vs SWRD.** Delta mínimo que não justifica 20%.

### Análise Zero-Based — Advocate (não adicionaria a 20%, 10% defensável)

**Zero-based, mão na consciência: JPGL a 20% não passa no stress-test adversarial.**

Quatro problemas que o framing anterior ignorou:
1. **Correlação 0.95**: pagando complexidade por ~10% de variância própria. AVGS tem 26% de variância própria (correlação 0.86) — genuinamente diferente
2. **2.6 bps no portfolio**: menor que o ruído de bid-ask em dia de baixa liquidez
3. **Delisting assimétrico**: EV do delisting (~7.5% × R$554k × 5% custo) supera EV do alpha esperado
4. **Irreversibilidade**: 5-7 anos para diluir JPGL de 20% para 10% via aportes — quase metade do horizonte pré-FIRE

**Único argumento que sobrevive**: JPGL traz momentum + low-vol que AVGS e AVEM não têm. Isso justifica inclusão, mas talvez 10%, não 20%.

**Onde o caso contra é mais fraco**: (1) correlação em drawdown é 0.856, não 0.95 — proteção é real; (2) 22 anos de índice é amostra razoável; (3) value spreads no 90th+ percentile é o momento mais favorável em 15 anos.

### Pergunta que nunca foi feita antes

> "Se JPGL não existisse na carteira e estivéssemos desenhando de zero, adicionaríamos?"

Resposta de dois agentes independentes, framing idêntico, sem ancoragem:
- Factor: **Sim, a 15%** (4/10 a 20%, 6/10 a 15%)
- Advocate: **Não a 20%, talvez a 10%**

**Convergência: ambos chegaram a 10-15%, não 20%**. Esta é a primeira vez em 5 análises que o resultado divergiu do status quo de 20%.

### O Padrão Sistemático Confirmado

| Issue | Pergunta | Resultado |
|-------|----------|-----------|
| FI-003 | JPGL > AVGC? | MANTER JPGL |
| FI-004 | Fatores validados? | MANTER JPGL |
| FI-jpgl-redundancia | Remover/reduzir? | MANTER 20% (7-0) |
| HD-equity-weight | 79% equity ok? | JPGL não questionado |
| HD-simplicity | VWRA suficiente? | JPGL não questionado |
| **FI-jpgl-zerobased** | **Adicionaríamos do zero?** | **10-15%, não 20%** |

A pergunta zero-based produziu resultado diferente pela primeira vez.

---

## Conclusão

Debate completo em 4 fases (10 agentes, 2 rodadas de debate + votação ponderada + rodada de consenso). Primeira vez em 6 análises que o framing zero-based foi aplicado rigorosamente.

**Decisão: JPGL target = 10% do equity** (redução de 20% → 10%)

### Veredicto Ponderado Final

| Agente | Peso | R1 | R2 | Fase 4 |
|--------|------|----|----|--------|
| Zero-Based | 4x | 0% | 5-8% | **10%** (convergiu) |
| Factor | 3x | 15% | 15% | **12%** (aceita 10%) |
| FIRE | 2x | 15% | 10% | **10%** |
| Risco | 1x | 20% | 10% | **10%** |
| Advocate | 1x | ≤10% | 10% | **10%** |
| Behavioral | 1x | sinal | 12% | **10%** (convergiu) |
| RF* | 1x | sinal | 10% | 10% (*argumento IPCA+ fora de escopo — confirmado FC) |
| Macro | 0.5x | neutro+ | 10% | **10%** |
| **Score ponderado** | **13.5x** | | | **9.7% ≈ 10%** |

*RF usou custo de oportunidade IPCA+ como argumento para equity mix — conflação de escopo (Fact-Checker confirmou). Conclusão (10%) mantida por outros motivos.

### Argumentos decisivos

1. **Framing zero-based:** "Adicionaríamos do zero?" respondeu 10-15%, não 20%, pela primeira vez em 6 análises (HD-unanimidade: bug de burden of proof confirmado)
2. **Alpha esperado:** 0.162–0.35%/ano (base empírica vs AQR); contribuição ao portfolio = 1.3–2.6 bps/ano — positivo mas marginal
3. **JPUS precedente:** produto irmão UCITS (mesma ICAV, mesmo lançamento) fechou com $13.6M. Risco estrutural de fechamento existe, mas JPGL está em trajetória diferente (€213M crescendo, nicho sem alternativa barata)
4. **Gap fatorial real:** nenhum UCITS replica inverse-vol + negative momentum screen do JPGL — tese de inclusão validada, mas a 10% não 20%
5. **P(FIRE) delta:** 0.1–0.2pp entre 10% e 20% — negligível para a meta de aposentadoria

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | JPGL target: **20% → 10%** do equity. carteira.md e gatilhos.md atualizados. |
| **Estratégia** | 10% liberados do JPGL redistribuídos via FI-equity-redistribuicao (aberta) |
| **Conhecimento** | Zero-based framing produz resultado diferente. Framing zero-based = ferramenta obrigatória em revisões de alocação. Alpha esperado: 0.162–0.35%/ano. JPUS = precedente de fechamento válido (UCITS gêmeo). |
| **Memória** | Factor (02), Advocate (10), Behavioral (12) |

---

## Próximos Passos

- [x] carteira.md atualizado (JPGL 10%)
- [x] gatilhos.md atualizado (catch-up rule < 10%)
- [x] Issue FI-equity-redistribuicao aberta
- [ ] Registrar na memória do Factor o novo target e a metodologia zero-based
