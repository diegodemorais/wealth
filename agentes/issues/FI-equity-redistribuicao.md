# FI-equity-redistribuicao: 10% liberados do JPGL — para onde redistribuir?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-equity-redistribuicao |
| **Dono** | 02 Factor |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | 02 Factor, 16 Zero-Based, 04 FIRE, 10 Advocate, 14 Quant, 15 Fact-Checker, 06 Risco, 12 Behavioral |
| **Co-sponsor** | 04 FIRE |
| **Dependencias** | FI-jpgl-zerobased (concluída 2026-04-01) |
| **Criado em** | 2026-04-01 |
| **Origem** | FI-jpgl-zerobased — target JPGL reduzido de 20% para 10%, liberando 10% do equity block para redistribuição |
| **Concluido em** | — |

---

## Motivo / Gatilho

FI-jpgl-zerobased (2026-04-01) concluiu que o target do JPGL deve ser reduzido de 20% para 10% do equity. Com isso, **10% do bloco equity ficaram sem alocação definida**.

A decisão de redistribuição é separada da decisão sobre JPGL — esta issue existe para responder especificamente: dado o perfil de Diego e o universo UCITS disponível, como alocar esses 10% dentro do equity block?

---

## Descrição

**Pergunta central:** "Dos 10% do equity liberados do JPGL, qual é a melhor redistribuição dentro do bloco equity?"

Equity block atual (pós-FI-jpgl-zerobased):
- SWRD: 35%
- AVGS: 25%
- AVEM: 20%
- JPGL: 10%
- **Pendente redistribuição: 10%**

Alternativas a analisar (sem pré-julgamento):
1. **SWRD +10%** (35% → 45%): simplificação, mais market-cap weight, menor risco de produto
2. **AVGS +10%** (25% → 35%): mais factor tilt small-value, mas já é a maior posição ativa
3. **AVEM +10%** (20% → 30%): mais EM exposure, valor spreads atrativos
4. **Split SWRD+AVGS ou SWRD+AVEM** (ex: 5%+5%): diversificação da decisão
5. **Zero-Based choice**: sem contexto da carteira atual, o que um analista independente adicionaria?

---

## Escopo

- [ ] Zero-Based: análise sem contexto da carteira atual — dado 10% para alocar em equity UCITS, onde colocaria?
- [ ] Factor: comparação de factor loadings e expected returns entre as opções
- [ ] FIRE: impacto de cada opção em P(FIRE) e SWR — qual maximiza P(meta)?
- [ ] Advocate: stress-test adversarial — qual opção falha mais feio?
- [ ] Risco: perfil de drawdown e correlação de cada opção com o portfolio atual
- [ ] Behavioral: qual opção tem menor risco comportamental de abandonar em drawdown?
- [ ] Quant: validar cálculos de retorno esperado ponderado para cada cenário
- [ ] Fact-Checker: verificar claims acadêmicos sobre EM premium e small-value vs market-cap
- [ ] Veredicto ponderado (Zero-Based peso 4x)
- [ ] Atualizar carteira.md com nova alocação

---

## Raciocínio

**Argumento central:** a decisão de redistribuição não é óbvia. SWRD é a resposta "safe default" (market-cap weight, maior AUM, menor TER). AVGS é a resposta de maior conviction fatorial. AVEM é a resposta de diversificação geográfica. A pergunta correta não é "qual é mais seguro" — é "qual maximiza P(FIRE 50) dado o perfil de Diego."

**Incerteza reconhecida:**
- Factor premiums têm variância alta em janelas curtas — a decisão deve otimizar para P(meta), não para retorno esperado máximo
- AVGS já tem tail risk aceito explicitamente (XX-lacunas-estrategicas, 2026-04-01): +10pp de AVGS implica aceitar mais tail risk que já é o limite
- AVEM: revertendo em 2026 (+14.83% YTD), mas concentração EM já em 20% — mais seria sobreaposta?

**Falsificação:**
- Se Zero-Based independente recomendar a mesma opção que o time prefere → confirma
- Se Zero-Based recomendar opção diferente → debate real

**Restrição operacional:** todos os ativos estão no lucro — não se vende para rebalancear. A redistribuição acontece via direcionamento de aportes futuros para os ETFs sub-alocados. A decisão de hoje define o destino dos próximos aportes de equity.

---

## Análise

> A preencher durante o debate.

---

## Conclusão

> A preencher ao finalizar.

### Veredicto Ponderado

| Agente | Peso | Posição | Justificativa |
|--------|------|---------|---------------|
| Zero-Based | 4x | — | — |
| Factor | 3x | — | — |
| FIRE | 2x | — | — |
| Risco | 1x | — | — |
| Advocate | 1x | — | — |
| Behavioral | 1x | — | — |
| **Score ponderado** | **12x** | **—** | **—** |

---

## Resultado

> A preencher ao finalizar.

| Tipo | Detalhe |
|------|---------|
| **Alocação** | — |
| **Estratégia** | — |
| **Conhecimento** | — |
| **Memória** | — |

---

## Próximos Passos

- [ ] Lançar todos os agentes em paralelo (Zero-Based obrigatório)
- [ ] Debate estruturado multi-fase (mínimo 2 rodadas + votação)
- [ ] Atualizar carteira.md com novo target
- [ ] Recalcular retorno ponderado do equity block
